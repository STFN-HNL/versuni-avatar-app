import { NextRequest, NextResponse } from "next/server";
import { openaiService, ConversationMessage } from "@/app/lib/openai-services";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { 
      messages, 
      maxLength = 'brief', 
      focus = 'general' 
    } = body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { error: "Messages array is required and cannot be empty" },
        { status: 400 }
      );
    }

    const response = await openaiService.summarizeConversation(
      messages as ConversationMessage[],
      { maxLength, focus }
    );

    return NextResponse.json({
      success: true,
      summary: response.content,
      usage: response.usage
    });

  } catch (error: any) {
    console.error("OpenAI Summarization API Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to summarize conversation" },
      { status: 500 }
    );
  }
}
