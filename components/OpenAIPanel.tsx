"use client";

import React, { useState, useEffect } from 'react';
import { Button } from './Button';
import { Input } from './Input';
import { Select } from './Select';
import { useOpenAI } from './logic/useOpenAI';
import { useMessageHistory } from './logic/useMessageHistory';
import { useTextChat } from './logic/useTextChat';
import { OPENAI_LANGUAGES, OPENAI_CHAT_MODES, OPENAI_SUMMARY_OPTIONS } from '@/app/lib/constants';

interface OpenAIPanelProps {
  onClose: () => void;
}



export const OpenAIPanel: React.FC<OpenAIPanelProps> = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState<'chat' | 'translate' | 'summarize' | 'starters'>('chat');
  const [chatInput, setChatInput] = useState('');
  const [chatMode, setChatMode] = useState<'chat' | 'creative' | 'professional'>('chat');
  const [translateText, setTranslateText] = useState('');
  const [targetLanguage, setTargetLanguage] = useState('spanish');
  const [translatedResult, setTranslatedResult] = useState('');
  const [summaryResult, setSummaryResult] = useState('');
  const [summaryOption, setSummaryOption] = useState('brief-general');
  const [conversationStarters, setConversationStarters] = useState<string[]>([]);
  const [starterContext, setStarterContext] = useState('');

  const { messages } = useMessageHistory();
  const { sendMessage } = useTextChat();
  const {
    generateResponse,
    isGenerating,
    translateText: translate,
    isTranslating,
    summarizeConversation,
    isSummarizing,
    getConversationStarters,
    isLoadingStarters,
    error,
    clearError
  } = useOpenAI(messages);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(clearError, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, clearError]);

  const handleChatSubmit = async () => {
    if (!chatInput.trim()) return;
    
    try {
      const response = await generateResponse(chatInput, chatMode);
      sendMessage(response);
      setChatInput('');
    } catch (err) {
      console.error('Failed to generate chat response:', err);
    }
  };

  const handleTranslate = async () => {
    if (!translateText.trim()) return;
    
    try {
      const result = await translate(translateText, targetLanguage);
      setTranslatedResult(result);
    } catch (err) {
      console.error('Failed to translate text:', err);
    }
  };

  const handleSummarize = async () => {
    if (messages.length === 0) return;
    
    try {
      const [maxLength, focus] = summaryOption.split('-') as ['brief' | 'detailed', string];
      const result = await summarizeConversation(messages, { 
        maxLength, 
        focus: focus as any 
      });
      setSummaryResult(result);
    } catch (err) {
      console.error('Failed to summarize conversation:', err);
    }
  };

  const handleGenerateStarters = async () => {
    try {
      const starters = await getConversationStarters(starterContext || undefined, 5);
      setConversationStarters(starters);
    } catch (err) {
      console.error('Failed to generate conversation starters:', err);
    }
  };

  const handleUseStarter = (starter: string) => {
    sendMessage(starter);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[80vh] overflow-hidden">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-semibold">OpenAI Features</h2>
          <Button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            ✕
          </Button>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 mx-4 mt-4 rounded">
            {error}
          </div>
        )}

        <div className="flex border-b">
          {[
            { key: 'chat', label: 'AI Chat' },
            { key: 'translate', label: 'Translate' },
            { key: 'summarize', label: 'Summarize' },
            { key: 'starters', label: 'Conversation Starters' },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`px-4 py-2 font-medium ${
                activeTab === tab.key
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="p-4 max-h-96 overflow-y-auto">
          {activeTab === 'chat' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Chat Mode</label>
                <Select
                  value={chatMode}
                  options={OPENAI_CHAT_MODES}
                  renderOption={(option) => option.label}
                  onSelect={(option) => setChatMode(option.value as any)}
                  isSelected={(option) => option.value === chatMode}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Your Message</label>
                <Input
                  value={chatInput}
                  onChange={setChatInput}
                  placeholder="Type your message here..."
                />
              </div>
              <Button 
                onClick={handleChatSubmit} 
                disabled={isGenerating || !chatInput.trim()}
                className="w-full"
              >
                {isGenerating ? 'Generating...' : 'Send to Avatar'}
              </Button>
            </div>
          )}

          {activeTab === 'translate' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Text to Translate</label>
                <textarea
                  value={translateText}
                  onChange={(e) => setTranslateText(e.target.value)}
                  placeholder="Enter text to translate..."
                  className="w-full p-2 border rounded-md resize-none text-black"
                  rows={3}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Target Language</label>
                <Select
                  value={targetLanguage}
                  options={OPENAI_LANGUAGES}
                  renderOption={(option) => option.label}
                  onSelect={(option) => setTargetLanguage(option.value)}
                  isSelected={(option) => option.value === targetLanguage}
                />
              </div>
              <Button 
                onClick={handleTranslate} 
                disabled={isTranslating || !translateText.trim()}
                className="w-full"
              >
                {isTranslating ? 'Translating...' : 'Translate'}
              </Button>
              {translatedResult && (
                <div className="mt-4 p-3 bg-gray-100 rounded-md">
                  <label className="block text-sm font-medium mb-2">Translation</label>
                  <p className="text-sm">{translatedResult}</p>
                  <Button 
                    onClick={() => sendMessage(translatedResult)}
                    className="mt-2 text-xs"
                  >
                    Send Translation to Avatar
                  </Button>
                </div>
              )}
            </div>
          )}

          {activeTab === 'summarize' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Summary Type</label>
                <Select
                  value={summaryOption}
                  options={OPENAI_SUMMARY_OPTIONS}
                  renderOption={(option) => option.label}
                  onSelect={(option) => setSummaryOption(option.value)}
                  isSelected={(option) => option.value === summaryOption}
                />
              </div>
              <Button 
                onClick={handleSummarize} 
                disabled={isSummarizing || messages.length === 0}
                className="w-full"
              >
                {isSummarizing ? 'Summarizing...' : 'Summarize Conversation'}
              </Button>
              {summaryResult && (
                <div className="mt-4 p-3 bg-gray-100 rounded-md">
                  <label className="block text-sm font-medium mb-2">Summary</label>
                  <p className="text-sm">{summaryResult}</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'starters' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Context (Optional)</label>
                <Input
                  value={starterContext}
                  onChange={setStarterContext}
                  placeholder="e.g., technology, travel, hobbies..."
                />
              </div>
              <Button 
                onClick={handleGenerateStarters} 
                disabled={isLoadingStarters}
                className="w-full"
              >
                {isLoadingStarters ? 'Generating...' : 'Generate Conversation Starters'}
              </Button>
              {conversationStarters.length > 0 && (
                <div className="mt-4 space-y-2">
                  <label className="block text-sm font-medium">Conversation Starters</label>
                  {conversationStarters.map((starter, index) => (
                    <div key={index} className="p-3 bg-gray-100 rounded-md">
                      <p className="text-sm mb-2">{starter}</p>
                      <Button 
                        onClick={() => handleUseStarter(starter)}
                        className="text-xs"
                      >
                        Use This Starter
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
