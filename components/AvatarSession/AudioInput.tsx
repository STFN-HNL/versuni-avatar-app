import React, { useCallback } from "react";

import { useVoiceChat } from "../logic/useVoiceChat";
import { Button } from "../Button";
import { LoadingIcon, MicIcon, MicOffIcon } from "../Icons";
import { useConversationState } from "../logic/useConversationState";
import { useStreamingAvatarContext } from "../logic/context";

export const AudioInput: React.FC = () => {
  const {
    // muteInputAudio, // unused
    // unmuteInputAudio, // unused
    isMuted,
    isVoiceChatLoading,
  } = useVoiceChat();
  const { setIsMuted, avatarRef } = useStreamingAvatarContext();
  const { isUserTalking } = useConversationState();

  const handleMuteClick = useCallback(async () => {
    if (!avatarRef.current) return;
    if (isMuted) {
      await avatarRef.current.unmuteInputAudio();
      setIsMuted(false);
    } else {
      await avatarRef.current.muteInputAudio();
      setIsMuted(true);
    }
  }, [avatarRef, isMuted, setIsMuted]);

  return (
    <div>
      <Button
        className={`!p-2 relative`}
        disabled={isVoiceChatLoading}
        onClick={handleMuteClick}
      >
        <div
          className={`absolute left-0 top-0 rounded-lg border-2 border-[#7559FF] w-full h-full ${isUserTalking ? "animate-ping" : ""}`}
        />
        {isVoiceChatLoading ? (
          <LoadingIcon className="animate-spin" size={20} />
        ) : isMuted ? (
          <MicOffIcon size={20} />
        ) : (
          <MicIcon size={20} />
        )}
      </Button>
    </div>
  );
};
