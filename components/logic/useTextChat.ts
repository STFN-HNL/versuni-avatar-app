import { TaskMode, TaskType } from "@heygen/streaming-avatar";
import { useCallback } from "react";

import { useStreamingAvatarContext } from "./context";

// Optimized timing for natural speech-to-text conversations
const RESPONSE_DELAY = 2000; // 2000ms delay for natural conversation rhythm
const BREATH_PAUSE = 500; // 500ms breathing pause for more natural feel

export const useTextChat = () => {
  const { avatarRef } = useStreamingAvatarContext();

  // Helper function to add natural breathing pause
  const addBreathingPause = useCallback(async (): Promise<void> => {
    await new Promise(resolve => setTimeout(resolve, BREATH_PAUSE));
  }, []);

  const sendMessage = useCallback(
    async (message: string) => {
      if (!avatarRef.current) return;
      
      // Add response delay for natural conversation rhythm
      await new Promise(resolve => setTimeout(resolve, RESPONSE_DELAY));
      
      // Add natural breathing pause
      await addBreathingPause();
      
      avatarRef.current.speak({
        text: message,
        taskType: TaskType.TALK,
        taskMode: TaskMode.ASYNC,
      });
    },
    [avatarRef, addBreathingPause],
  );

  const sendMessageSync = useCallback(
    async (message: string) => {
      if (!avatarRef.current) return;

      // Add response delay for natural conversation rhythm
      await new Promise(resolve => setTimeout(resolve, RESPONSE_DELAY));
      
      // Add natural breathing pause
      await addBreathingPause();

      return await avatarRef.current?.speak({
        text: message,
        taskType: TaskType.TALK,
        taskMode: TaskMode.SYNC,
      });
    },
    [avatarRef, addBreathingPause],
  );

  const repeatMessage = useCallback(
    async (message: string) => {
      if (!avatarRef.current) return;

      // Shorter delay for repeat messages (1 second)
      await new Promise(resolve => setTimeout(resolve, RESPONSE_DELAY / 2));
      
      // Add natural breathing pause
      await addBreathingPause();

      return avatarRef.current?.speak({
        text: message,
        taskType: TaskType.REPEAT,
        taskMode: TaskMode.ASYNC,
      });
    },
    [avatarRef, addBreathingPause],
  );

  const repeatMessageSync = useCallback(
    async (message: string) => {
      if (!avatarRef.current) return;

      // Shorter delay for repeat messages (1 second)
      await new Promise(resolve => setTimeout(resolve, RESPONSE_DELAY / 2));
      
      // Add natural breathing pause
      await addBreathingPause();

      return await avatarRef.current?.speak({
        text: message,
        taskType: TaskType.REPEAT,
        taskMode: TaskMode.SYNC,
      });
    },
    [avatarRef, addBreathingPause],
  );

  return {
    sendMessage,
    sendMessageSync,
    repeatMessage,
    repeatMessageSync,
  };
};
