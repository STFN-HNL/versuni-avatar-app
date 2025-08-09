import { NextRequest, NextResponse } from "next/server";
import { openaiService } from "@/app/lib/openai-services";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { context, count = 3 } = body;

    const starters = await openaiService.generateConversationStarters(
      context,
      count
    );

    return NextResponse.json({
      success: true,
      starters
    });

  } catch (error: any) {
    console.error("OpenAI Conversation Starters API Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to generate conversation starters" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const starters = await openaiService.generateConversationStarters();
    
    return NextResponse.json({
      success: true,
      starters
    });

  } catch (error: any) {
    console.error("OpenAI Conversation Starters API Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to generate conversation starters" },
      { status: 500 }
    );
  }
}
