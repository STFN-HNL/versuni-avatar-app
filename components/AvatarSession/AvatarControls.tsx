import { ToggleGroup, ToggleGroupItem } from "@radix-ui/react-toggle-group";
import React from "react";

import { useVoiceChat } from "../logic/useVoiceChat";
import { Button } from "../Button";
import { useInterrupt } from "../logic/useInterrupt";
import { useStreamingAvatarContext } from "../logic/context";

import { AudioInput } from "./AudioInput";
// import { TextInput } from "./TextInput";

export const AvatarControls: React.FC = () => {
  const {
    isVoiceChatLoading,
    isVoiceChatActive,
    startVoiceChat,
    interrupt,
    sessionState,
  } = {
    ...useVoiceChat(),
    ...useInterrupt(),
    ...useStreamingAvatarContext(),
  };

  return (
    <div className="flex flex-col gap-3 relative w-full items-center">
      {sessionState === "inactive" && (
        <div className="bg-zinc-700 rounded-lg p-1 flex justify-center w-full">
          <Button
            className="rounded-lg px-6 py-2 text-sm text-center"
            onClick={() => startVoiceChat()}
            disabled={isVoiceChatLoading}
          >
            Start Voice Chat
          </Button>
        </div>
      )}
      {sessionState !== "inactive" && <AudioInput />}
      <div className="absolute top-[-70px] right-3">
        <Button className="!bg-zinc-700 !text-white" onClick={interrupt}>
          Interrupt
        </Button>
      </div>
    </div>
  );
};
