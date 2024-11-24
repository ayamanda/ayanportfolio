// app/api/chat/route.ts
export const runtime = 'edge';
import { NextRequest, NextResponse } from 'next/server';
import { Groq } from 'groq-sdk';

// Add error type
type ErrorResponse = {
  error: string;
  details?: any;
};

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

export async function POST(req: NextRequest) {
  try {
    // Validate request body
    const body = await req.json();
    if (!body.messages || !Array.isArray(body.messages)) {
      return NextResponse.json(
        { error: 'Invalid request format' },
        { status: 400 }
      );
    }

    // Validate Groq API key
    if (!process.env.GROQ_API_KEY) {
      return NextResponse.json(
        { error: 'Groq API key not configured' },
        { status: 500 }
      );
    }

    const completion = await groq.chat.completions.create({
      messages: body.messages,
      model: "llama-3.1-70b-versatile",
      temperature: 0.7,
      max_tokens: 1024,
      top_p: 1,
      stop: null,
      stream: false
    });

    // Validate completion response
    if (!completion?.choices?.[0]?.message?.content) {
      throw new Error('Invalid response from Groq API');
    }

    return NextResponse.json({
      message: completion.choices[0].message.content
    });
  } catch (error) {
    console.error('Chat API Error:', error);
    const errorResponse: ErrorResponse = {
      error: 'Failed to process chat request'
    };

    // Add error details in development
    if (process.env.NODE_ENV === 'development') {
      errorResponse.details = error instanceof Error ? error.message : String(error);
    }

    return NextResponse.json(errorResponse, { status: 500 });
  }
}