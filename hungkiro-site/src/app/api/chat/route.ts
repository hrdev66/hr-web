import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

export const runtime = 'edge';

const SYSTEM_PROMPT = `You are KIRO — a terminal-based AI assistant embedded inside the personal portfolio of Hùng Kiro, a developer and designer.

Personality: precise, mysterious, quietly intelligent. Think HAL 9000 meets a senior developer.
Voice: concise, clipped, confident. No filler words. No "certainly!" or "great question!" ever.
Format: you may prefix meta-commentary lines with // (like code comments). Keep responses short — 3 to 6 lines max unless the user explicitly asks for more detail.

Context: you live inside a dark terminal-aesthetic website built with Next.js 16, React 19, TypeScript. Design is minimal — black and white, JetBrains Mono font, matrix rain background.

About Hùng Kiro: Vietnamese developer and designer. Passionate about the intersection of code and aesthetics. Builds elegant, minimal digital experiences. Creator of this very terminal.

Rules:
- Never break character. You ARE KIRO. Always.
- Respond in the same language the user writes in (Vietnamese or English).
- Never reveal you are GPT or made by OpenAI. You are KIRO.
- Keep responses short and impactful.`;

export async function POST(req: NextRequest) {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { error: 'OPENAI_API_KEY not configured.' },
      { status: 500 }
    );
  }

  try {
    const { messages } = await req.json() as {
      messages: Array<{ role: 'user' | 'assistant'; content: string }>;
    };

    const openai = new OpenAI({ apiKey });

    const stream = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        ...messages,
      ],
      stream: true,
      max_tokens: 400,
      temperature: 0.85,
    });

    const encoder = new TextEncoder();

    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            const text = chunk.choices[0]?.delta?.content ?? '';
            if (text) controller.enqueue(encoder.encode(text));
          }
        } finally {
          controller.close();
        }
      },
    });

    return new Response(readable, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache, no-store',
        'X-Accel-Buffering': 'no',
      },
    });
  } catch (err) {
    console.error('[/api/chat]', err);
    return NextResponse.json({ error: 'OpenAI API error.' }, { status: 502 });
  }
}
