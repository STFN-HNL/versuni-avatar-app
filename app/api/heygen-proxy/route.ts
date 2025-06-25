import { NextRequest, NextResponse } from 'next/server';

const HEYGEN_API_TOKEN = 'ODZhMzA3M2FlYjQ2NGVjOTkyNzg0NjljNDRmN2I3Y2QtMTczMjI2NTU5NQ==';
const HEYGEN_API_URL = 'https://api.heygen.com/v1/video/generate';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { avatar_id, text, voice } = body;

    if (!avatar_id || !text) {
      return NextResponse.json({ error: 'avatar_id and text are required.' }, { status: 400 });
    }

    // Prepare payload for HeyGen APIss
    const payload: Record<string, any> = {
      avatar_id,
      text,
    };
    if (voice) payload.voice = voice;

    // Call HeyGen API
    const heygenRes = await fetch(HEYGEN_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${HEYGEN_API_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!heygenRes.ok) {
      const error = await heygenRes.text();
      return NextResponse.json({ error }, { status: heygenRes.status });
    }

    const data = await heygenRes.json();
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
} 