import { TaskType, TaskMode } from "@heygen/streaming-avatar";
import React, { useCallback, useEffect, useState } from "react";
import { usePrevious } from "ahooks";

import { Select } from "../Select";
import { Button } from "../Button";
import { SendIcon } from "../Icons";
import { useTextChat } from "../logic/useTextChat";
import { Input } from "../Input";
import { useConversationState } from "../logic/useConversationState";
import { useOpenAI } from "../logic/useOpenAI";
import { useMessageHistory } from "../logic/useMessageHistory";

export const TextInput: React.FC = () => {
  const { sendMessage, sendMessageSync, repeatMessage, repeatMessageSync } =
    useTextChat();
  const { startListening, stopListening } = useConversationState();
  const { messages } = useMessageHistory();
  const { generateResponse, isGenerating } = useOpenAI(messages);
  const [taskType, setTaskType] = useState<TaskType>(TaskType.TALK);
  const [taskMode, setTaskMode] = useState<TaskMode>(TaskMode.ASYNC);
  const [message, setMessage] = useState("");
  const [useAI, setUseAI] = useState(false);

  const handleSend = useCallback(async () => {
    if (message.trim() === "") {
      return;
    }

    try {
      let messageToSend = message;

      // If AI enhancement is enabled, generate an AI response first
      if (useAI && taskType === TaskType.TALK) {
        messageToSend = await generateResponse(message);
      }

      if (taskType === TaskType.TALK) {
        taskMode === TaskMode.SYNC
          ? sendMessageSync(messageToSend)
          : sendMessage(messageToSend);
      } else {
        taskMode === TaskMode.SYNC
          ? repeatMessageSync(messageToSend)
          : repeatMessage(messageToSend);
      }
      setMessage("");
    } catch (error) {
      console.error('Failed to process message:', error);
      // Fall back to original message if AI fails
      if (taskType === TaskType.TALK) {
        taskMode === TaskMode.SYNC
          ? sendMessageSync(message)
          : sendMessage(message);
      } else {
        taskMode === TaskMode.SYNC
          ? repeatMessageSync(message)
          : repeatMessage(message);
      }
      setMessage("");
    }
  }, [
    taskType,
    taskMode,
    message,
    useAI,
    sendMessage,
    sendMessageSync,
    repeatMessage,
    repeatMessageSync,
    generateResponse,
  ]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Enter") {
        handleSend();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleSend]);

  const previousText = usePrevious(message);

  useEffect(() => {
    if (!previousText && message) {
      startListening();
    } else if (previousText && !message) {
      stopListening();
    }
  }, [message, previousText, startListening, stopListening]);

  return (
    <div className="flex flex-col gap-2 w-full">
      <div className="flex flex-row gap-2 items-center">
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={useAI}
            onChange={(e) => setUseAI(e.target.checked)}
            className="rounded"
          />
          🤖 AI Enhanced
        </label>
      </div>
      <div className="flex flex-row gap-2 items-end w-full">
        <Select
          isSelected={(option) => option === taskType}
          options={Object.values(TaskType)}
          renderOption={(option) => option.toUpperCase()}
          value={taskType.toUpperCase()}
          onSelect={setTaskType}
        />
        <Select
          isSelected={(option) => option === taskMode}
          options={Object.values(TaskMode)}
          renderOption={(option) => option.toUpperCase()}
          value={taskMode.toUpperCase()}
          onSelect={setTaskMode}
        />
        <Input
          className="min-w-[500px]"
          placeholder={`Type something for the avatar to ${taskType === TaskType.REPEAT ? "repeat" : useAI ? "enhance and respond" : "respond"}...`}
          value={message}
          onChange={setMessage}
          disabled={isGenerating}
        />
        <Button 
          className="!p-2" 
          onClick={handleSend}
          disabled={isGenerating}
        >
          {isGenerating ? (
            <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" />
          ) : (
            <SendIcon size={20} />
          )}
        </Button>
      </div>
    </div>
  );
};
