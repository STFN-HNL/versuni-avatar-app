import { openai } from './openai';

export interface ConversationMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
  timestamp?: number;
}

export interface OpenAIResponse {
  content: string;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export class OpenAIService {
  private systemPrompt = `You are an AI assistant integrated with an Interactive Avatar. 
Your responses should be:
- Natural and conversational
- Concise but informative (1-2 sentences unless more detail is requested)
- Engaging and friendly
- Appropriate for spoken delivery through an avatar
- Clear and easy to understand when spoken aloud`;

  /**
   * Generate enhanced conversation response using OpenAI
   */
  async generateResponse(
    userMessage: string,
    conversationHistory: ConversationMessage[] = [],
    customSystemPrompt?: string
  ): Promise<OpenAIResponse> {
    try {
      const messages = [
        {
          role: 'system' as const,
          content: customSystemPrompt || this.systemPrompt
        },
        ...conversationHistory.slice(-10), // Keep last 10 messages for context
        {
          role: 'user' as const,
          content: userMessage
        }
      ];

      const response = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages,
        max_tokens: 150,
        temperature: 0.7,
      });

      return {
        content: response.choices[0]?.message?.content || '',
        usage: response.usage ? {
          prompt_tokens: response.usage.prompt_tokens,
          completion_tokens: response.usage.completion_tokens,
          total_tokens: response.usage.total_tokens
        } : undefined
      };
    } catch (error) {
      console.error('Error generating OpenAI response:', error);
      throw new Error('Failed to generate AI response');
    }
  }

  /**
   * Generate creative text based on prompts
   */
  async generateText(
    prompt: string,
    options: {
      maxTokens?: number;
      temperature?: number;
      type?: 'creative' | 'informative' | 'casual' | 'professional';
    } = {}
  ): Promise<OpenAIResponse> {
    try {
      const { maxTokens = 200, temperature = 0.8, type = 'casual' } = options;
      
      const systemPrompts = {
        creative: 'You are a creative writer. Generate imaginative and engaging content.',
        informative: 'You are an expert educator. Provide clear, accurate, and informative content.',
        casual: 'You are a friendly conversationalist. Keep responses casual and approachable.',
        professional: 'You are a professional communicator. Maintain a formal, business-appropriate tone.'
      };

      const response = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: systemPrompts[type]
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: maxTokens,
        temperature,
      });

      return {
        content: response.choices[0]?.message?.content || '',
        usage: response.usage ? {
          prompt_tokens: response.usage.prompt_tokens,
          completion_tokens: response.usage.completion_tokens,
          total_tokens: response.usage.total_tokens
        } : undefined
      };
    } catch (error) {
      console.error('Error generating text:', error);
      throw new Error('Failed to generate text');
    }
  }

  /**
   * Summarize conversation history
   */
  async summarizeConversation(
    messages: ConversationMessage[],
    options: {
      maxLength?: 'brief' | 'detailed';
      focus?: 'key_points' | 'decisions' | 'questions' | 'general';
    } = {}
  ): Promise<OpenAIResponse> {
    try {
      const { maxLength = 'brief', focus = 'general' } = options;
      
      const conversationText = messages
        .filter(msg => msg.role !== 'system')
        .map(msg => `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`)
        .join('\n');

      const focusPrompts = {
        key_points: 'Focus on the main topics and important points discussed.',
        decisions: 'Focus on any decisions made or conclusions reached.',
        questions: 'Focus on questions asked and their answers.',
        general: 'Provide a general overview of the conversation.'
      };

      const lengthPrompts = {
        brief: 'Keep the summary to 2-3 sentences.',
        detailed: 'Provide a comprehensive summary in 1-2 paragraphs.'
      };

      const response = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: `Summarize the following conversation. ${focusPrompts[focus]} ${lengthPrompts[maxLength]}`
          },
          {
            role: 'user',
            content: conversationText
          }
        ],
        max_tokens: maxLength === 'brief' ? 100 : 300,
        temperature: 0.3,
      });

      return {
        content: response.choices[0]?.message?.content || '',
        usage: response.usage ? {
          prompt_tokens: response.usage.prompt_tokens,
          completion_tokens: response.usage.completion_tokens,
          total_tokens: response.usage.total_tokens
        } : undefined
      };
    } catch (error) {
      console.error('Error summarizing conversation:', error);
      throw new Error('Failed to summarize conversation');
    }
  }

  /**
   * Translate text to different languages
   */
  async translateText(
    text: string,
    targetLanguage: string,
    sourceLanguage: string = 'auto'
  ): Promise<OpenAIResponse> {
    try {
      const prompt = sourceLanguage === 'auto' 
        ? `Translate the following text to ${targetLanguage}:`
        : `Translate the following text from ${sourceLanguage} to ${targetLanguage}:`;

      const response = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are a professional translator. Provide accurate, natural translations that maintain the original meaning and tone.'
          },
          {
            role: 'user',
            content: `${prompt}\n\n"${text}"`
          }
        ],
        max_tokens: Math.max(100, text.length * 2),
        temperature: 0.3,
      });

      return {
        content: response.choices[0]?.message?.content || '',
        usage: response.usage ? {
          prompt_tokens: response.usage.prompt_tokens,
          completion_tokens: response.usage.completion_tokens,
          total_tokens: response.usage.total_tokens
        } : undefined
      };
    } catch (error) {
      console.error('Error translating text:', error);
      throw new Error('Failed to translate text');
    }
  }

  /**
   * Generate conversation starters or topic suggestions
   */
  async generateConversationStarters(
    context?: string,
    count: number = 3
  ): Promise<string[]> {
    try {
      const prompt = context 
        ? `Generate ${count} interesting conversation starters related to: ${context}`
        : `Generate ${count} general conversation starters that would be engaging for an interactive avatar chat`;

      const response = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'Generate engaging conversation starters. Each should be a question or statement that encourages discussion. Return them as a numbered list.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 200,
        temperature: 0.8,
      });

      const content = response.choices[0]?.message?.content || '';
      return content
        .split('\n')
        .filter(line => line.trim())
        .map(line => line.replace(/^\d+\.\s*/, '').trim())
        .filter(line => line.length > 0)
        .slice(0, count);
    } catch (error) {
      console.error('Error generating conversation starters:', error);
      return [];
    }
  }
}

export const openaiService = new OpenAIService();
