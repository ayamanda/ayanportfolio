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

// Add better error handling in the API route
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    if (!process.env.GROQ_API_KEY) {
      throw new Error('GROQ_API_KEY is not configured');
    }

    if (!body.messages || !Array.isArray(body.messages)) {
      throw new Error('Invalid request format: messages array is required');
    }

    const completion = await groq.chat.completions.create({
      messages: body.messages,
      model: "llama-3.3-70b-versatile",
      temperature: 0.7,
      max_tokens: 1024,
      top_p: 1,
      stop: null,
      stream: false
    });

    if (!completion?.choices?.[0]?.message?.content) {
      throw new Error('Invalid response from Groq API');
    }

    return NextResponse.json({
      message: completion.choices[0].message.content
    });
  } catch (error) {
    console.error('Chat API Error:', error);
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }, { status: 500 });
  }
}