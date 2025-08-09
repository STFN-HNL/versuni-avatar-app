import { NextRequest, NextResponse } from "next/server";
import { openaiService } from "@/app/lib/openai-services";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { text, targetLanguage, sourceLanguage = 'auto' } = body;

    if (!text || !targetLanguage) {
      return NextResponse.json(
        { error: "Text and target language are required" },
        { status: 400 }
      );
    }

    const response = await openaiService.translateText(
      text,
      targetLanguage,
      sourceLanguage
    );

    return NextResponse.json({
      success: true,
      translatedText: response.content,
      usage: response.usage
    });

  } catch (error: any) {
    console.error("OpenAI Translation API Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to translate text" },
      { status: 500 }
    );
  }
}
