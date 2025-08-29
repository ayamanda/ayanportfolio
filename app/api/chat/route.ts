// app/api/chat/route.ts
export const runtime = 'edge';
import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

// Define response and error types for better type safety
type ChatResponse = {
  message: string;
  model?: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
};

// Environment validation
const validateEnv = () => {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY is not configured in environment variables');
  }
};

// Initialize Gemini client with validation
const getGeminiClient = () => {
  validateEnv();
  return new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY
  });
};

// Request validation function
const validateRequest = (body: any) => {
  if (!body) {
    throw new Error('Request body is missing');
  }
  
  if (!body.messages || !Array.isArray(body.messages)) {
    throw new Error('Invalid request format: messages array is required');
  }
  
  if (body.messages.length === 0) {
    throw new Error('Messages array cannot be empty');
  }
  
  // Validate each message has required fields
  body.messages.forEach((msg: any, index: number) => {
    if (!msg.role || !msg.content) {
      throw new Error(`Message at index ${index} is missing required fields (role, content)`);
    }
    
    if (!['system', 'user', 'assistant'].includes(msg.role)) {
      throw new Error(`Invalid role at message index ${index}: ${msg.role}`);
    }
  });
};

// Model selection with fallback
const getModelName = (requestedModel?: string) => {
  const availableModels = {
    default: "gemini-2.0-flash-exp",
    fast: "gemini-2.0-flash-exp", 
    premium: "gemini-1.5-pro"
  };
  
  if (requestedModel && Object.values(availableModels).includes(requestedModel)) {
    return requestedModel;
  }
  
  return availableModels.default;
};

export async function POST(req: NextRequest) {
  try {
    // Parse request with error handling
    let body;
    try {
      body = await req.json();
    } catch (parseError) {
      return NextResponse.json({ 
        error: 'Invalid JSON in request body',
        details: parseError instanceof Error ? parseError.message : 'Unknown parsing error'
      }, { status: 400 });
    }
    
    // Validate request
    try {
      validateRequest(body);
    } catch (validationError) {
      return NextResponse.json({ 
        error: validationError instanceof Error ? validationError.message : 'Request validation failed',
        code: 'VALIDATION_ERROR'
      }, { status: 400 });
    }
    
    // Initialize Gemini client
    const genai = getGeminiClient();
    
    // Get model name with fallback
    const modelName = getModelName(body.model);
    
    // Convert messages to Gemini format
    const contents = body.messages
      .filter((msg: any) => msg.role !== 'system')
      .map((msg: any) => ({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: msg.content }]
      }));

    // Extract system instruction
    const systemInstruction = body.messages.find((msg: any) => msg.role === 'system')?.content;
    
    // Default parameters with overrides from request
    const config = {
      temperature: body.temperature ?? 0.7,
      maxOutputTokens: body.max_tokens ?? 1024,
      topP: body.top_p ?? 1,
      systemInstruction: systemInstruction || undefined,
      // Disable thinking for faster responses
      thinkingConfig: {
        thinkingBudget: 0
      }
    };

    // Check if streaming is requested
    const isStreaming = body.stream === true;

    if (isStreaming) {
      // Handle streaming response
      const stream = await genai.models.generateContentStream({
        model: modelName,
        contents: contents,
        config: config
      });

      // Create a ReadableStream for Server-Sent Events
      const encoder = new TextEncoder();
      const readable = new ReadableStream({
        async start(controller) {
          try {
            for await (const chunk of stream) {
              if (chunk.text) {
                const data = JSON.stringify({
                  type: 'content',
                  content: chunk.text,
                  model: modelName
                });
                controller.enqueue(encoder.encode(`data: ${data}\n\n`));
              }
            }
            
            // Send completion signal
            const doneData = JSON.stringify({
              type: 'done',
              model: modelName
            });
            controller.enqueue(encoder.encode(`data: ${doneData}\n\n`));
            controller.close();
          } catch (error) {
            const errorData = JSON.stringify({
              type: 'error',
              error: error instanceof Error ? error.message : 'Stream error occurred'
            });
            controller.enqueue(encoder.encode(`data: ${errorData}\n\n`));
            controller.close();
          }
        }
      });

      return new Response(readable, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
        },
      });
    } else {
      // Handle non-streaming response (existing logic)
      const completionPromise = genai.models.generateContent({
        model: modelName,
        contents: contents,
        config: config
      });
      
      // Optional timeout handling
      const timeoutMs = body.timeout_ms ?? 30000; // 30 second default timeout
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Request timed out')), timeoutMs);
      });
      
      // Race the completion against the timeout
      const completion = await Promise.race([
        completionPromise,
        timeoutPromise
      ]) as Awaited<typeof completionPromise>;
      
      // Validate response
      if (!completion?.text) {
        throw new Error('Invalid or empty response from Gemini API');
      }
      
      // Construct the response
      const response: ChatResponse = {
        message: completion.text,
        model: modelName
      };
      
      return NextResponse.json(response);
    }
    
  } catch (error) {
    console.error('Chat API Error:', error);
    
    // Handle specific error types
    if (error instanceof Error) {
      if (error.message.includes('timed out')) {
        return NextResponse.json({
          error: 'Request timed out',
          code: 'TIMEOUT'
        }, { status: 504 });
      }
      
      if (error.message.includes('GEMINI_API_KEY')) {
        return NextResponse.json({
          error: 'API configuration error',
          code: 'CONFIG_ERROR'
        }, { status: 500 });
      }
      
      // Rate limit handling
      if (error.message.includes('rate') || error.message.includes('limit')) {
        return NextResponse.json({
          error: 'Rate limit exceeded',
          code: 'RATE_LIMIT'
        }, { status: 429 });
      }
    }
    
    // Generic error response
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Unknown error occurred',
      code: 'SERVER_ERROR'
    }, { status: 500 });
  }
}