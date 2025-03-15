// app/api/chat/route.ts
export const runtime = 'edge';
import { NextRequest, NextResponse } from 'next/server';
import { Groq } from 'groq-sdk';

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

type ErrorResponse = {
  error: string;
  code?: string;
  details?: any;
};

// Environment validation
const validateEnv = () => {
  if (!process.env.GROQ_API_KEY) {
    throw new Error('GROQ_API_KEY is not configured in environment variables');
  }
};

// Initialize Groq client with validation
const getGroqClient = () => {
  validateEnv();
  return new Groq({
    apiKey: process.env.GROQ_API_KEY
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
    default: "llama-3.3-70b-versatile",
    fast: "llama-3.3-8b-instant",
    premium: "llama-3.3-70b-versatile"
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
    
    // Initialize Groq client
    const groq = getGroqClient();
    
    // Get model name with fallback
    const modelName = getModelName(body.model);
    
    // Default parameters with overrides from request
    const params = {
      messages: body.messages,
      model: modelName,
      temperature: body.temperature ?? 0.7,
      max_tokens: body.max_tokens ?? 1024,
      top_p: body.top_p ?? 1,
      stream: body.stream ?? false,
      stop: body.stop ?? null
    };
    
    // Execute completion with timeout
    const completionPromise = groq.chat.completions.create(params);
    
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
    if (!completion?.choices?.[0]?.message?.content) {
      throw new Error('Invalid or empty response from Groq API');
    }
    
    // Construct the response
    const response: ChatResponse = {
      message: completion.choices[0].message.content,
      model: completion.model,
      usage: completion.usage ? {
        promptTokens: completion.usage.prompt_tokens,
        completionTokens: completion.usage.completion_tokens,
        totalTokens: completion.usage.total_tokens
      } : undefined
    };
    
    return NextResponse.json(response);
    
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
      
      if (error.message.includes('GROQ_API_KEY')) {
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