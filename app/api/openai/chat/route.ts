import { NextRequest, NextResponse } from "next/server";
import { openaiService } from "@/app/lib/openai-services";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { 
      message, 
      conversationHistory = [], 
      customSystemPrompt,
      mode = 'chat' 
    } = body;

    if (!message) {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      );
    }

    let response;
    
    switch (mode) {
      case 'chat':
        response = await openaiService.generateResponse(
          message,
          conversationHistory,
          customSystemPrompt
        );
        break;
      case 'creative':
        response = await openaiService.generateText(message, { 
          type: 'creative',
          temperature: 0.9 
        });
        break;
      case 'professional':
        response = await openaiService.generateText(message, { 
          type: 'professional',
          temperature: 0.5 
        });
        break;
      default:
        response = await openaiService.generateResponse(message, conversationHistory);
    }

    return NextResponse.json({
      success: true,
      response: response.content,
      usage: response.usage
    });

  } catch (error: any) {
    console.error("OpenAI Chat API Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to process chat request" },
      { status: 500 }
    );
  }
}
