import { useState, useCallback } from 'react';
import { ConversationMessage } from '@/app/lib/openai-services';
import { Message, MessageSender } from './context';

export interface OpenAIHookResult {
  // Chat functionality
  generateResponse: (message: string, mode?: 'chat' | 'creative' | 'professional') => Promise<string>;
  isGenerating: boolean;
  
  // Translation functionality
  translateText: (text: string, targetLanguage: string, sourceLanguage?: string) => Promise<string>;
  isTranslating: boolean;
  
  // Summarization functionality
  summarizeConversation: (messages: Message[], options?: {
    maxLength?: 'brief' | 'detailed';
    focus?: 'key_points' | 'decisions' | 'questions' | 'general';
  }) => Promise<string>;
  isSummarizing: boolean;
  
  // Conversation starters
  getConversationStarters: (context?: string, count?: number) => Promise<string[]>;
  isLoadingStarters: boolean;
  
  // Error handling
  error: string | null;
  clearError: () => void;
}

// Helper function to convert Message[] to ConversationMessage[]
const convertMessages = (messages: Message[]): ConversationMessage[] => {
  return messages.map(msg => ({
    role: msg.sender === MessageSender.CLIENT ? 'user' as const : 'assistant' as const,
    content: msg.content,
    timestamp: parseInt(msg.id)
  }));
};

export const useOpenAI = (messages: Message[] = []): OpenAIHookResult => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [isLoadingStarters, setIsLoadingStarters] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const generateResponse = useCallback(async (
    message: string, 
    mode: 'chat' | 'creative' | 'professional' = 'chat'
  ): Promise<string> => {
    setIsGenerating(true);
    setError(null);
    
    try {
      const response = await fetch('/api/openai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message,
          conversationHistory: convertMessages(messages),
          mode
        }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate response');
      }

      return data.response;
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to generate AI response';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsGenerating(false);
    }
  }, [messages]);

  const translateText = useCallback(async (
    text: string, 
    targetLanguage: string, 
    sourceLanguage: string = 'auto'
  ): Promise<string> => {
    setIsTranslating(true);
    setError(null);
    
    try {
      const response = await fetch('/api/openai/translate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text,
          targetLanguage,
          sourceLanguage
        }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to translate text');
      }

      return data.translatedText;
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to translate text';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsTranslating(false);
    }
  }, []);

  const summarizeConversation = useCallback(async (
    messagesToSummarize: Message[],
    options: {
      maxLength?: 'brief' | 'detailed';
      focus?: 'key_points' | 'decisions' | 'questions' | 'general';
    } = {}
  ): Promise<string> => {
    setIsSummarizing(true);
    setError(null);
    
    try {
      const response = await fetch('/api/openai/summarize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: convertMessages(messagesToSummarize),
          ...options
        }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to summarize conversation');
      }

      return data.summary;
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to summarize conversation';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsSummarizing(false);
    }
  }, []);

  const getConversationStarters = useCallback(async (
    context?: string, 
    count: number = 3
  ): Promise<string[]> => {
    setIsLoadingStarters(true);
    setError(null);
    
    try {
      const response = await fetch('/api/openai/conversation-starters', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          context,
          count
        }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to get conversation starters');
      }

      return data.starters;
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to get conversation starters';
      setError(errorMessage);
      return [];
    } finally {
      setIsLoadingStarters(false);
    }
  }, []);

  return {
    generateResponse,
    isGenerating,
    translateText,
    isTranslating,
    summarizeConversation,
    isSummarizing,
    getConversationStarters,
    isLoadingStarters,
    error,
    clearError,
  };
};
