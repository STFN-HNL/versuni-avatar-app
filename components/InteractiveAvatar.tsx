import {
  AvatarQuality,
  StreamingEvents,
  VoiceChatTransport,
  VoiceEmotion,
  StartAvatarRequest,
  STTProvider,
  ElevenLabsModel,
  TaskType,
  TaskMode,
} from "@heygen/streaming-avatar";
import { useEffect, useRef, useState } from "react";
import { useMemoizedFn, useUnmount } from "ahooks";

import { Button } from "./Button";
import { AvatarConfig } from "./AvatarConfig";
import { AvatarVideo } from "./AvatarSession/AvatarVideo";
import { useStreamingAvatarSession } from "./logic/useStreamingAvatarSession";
import { AvatarControls } from "./AvatarSession/AvatarControls";
import { useVoiceChat } from "./logic/useVoiceChat";
import { StreamingAvatarProvider, StreamingAvatarSessionState } from "./logic";
import { LoadingIcon } from "./Icons";
import { MessageHistory } from "./AvatarSession/MessageHistory";
import { useStreamingAvatarContext } from "./logic/context";

import { AVATARS } from "@/app/lib/constants";

const DEFAULT_CONFIG: StartAvatarRequest = {
  quality: AvatarQuality.High,
  avatarName: "Graham_Chair_Sitting_public",
  knowledgeId: "c1307fbde75642b385e3f17f8d164ba2",
  voice: {
    rate: 1.5,
    emotion: VoiceEmotion.EXCITED,
    model: ElevenLabsModel.eleven_flash_v2_5,
  },
  language: "en",
  voiceChatTransport: VoiceChatTransport.WEBSOCKET,
  sttSettings: {
    provider: STTProvider.DEEPGRAM,
  },
};

const AVATAR_INTRO = "Welcome! I'm Alex de Jong, a mid-level professional at Versuni. Over the next 10 minutes, we'll simulate a real coaching session using the GROW model. Your goal? Coach me through my development challenges using effective coaching techniques. I'll respond like a real coachee - sometimes clear, sometimes uncertain, occasionally stuck. You'll guide me through Goal, Reality, Options, and Will phases. When you're done, say: 'END Coaching.' I'll then give you feedback on your coaching approach - what worked well and where you can improve. Let's see how well you can unlock my potential! Say 'START Coaching' when you're ready.";

function InteractiveAvatar() {
  const { initAvatar, startAvatar, stopAvatar, sessionState, stream } =
    useStreamingAvatarSession();
  const { startVoiceChat } = useVoiceChat();
  const { setIsMuted } = useStreamingAvatarContext();

  const [config, setConfig] = useState<StartAvatarRequest>(DEFAULT_CONFIG);

  const mediaStream = useRef<HTMLVideoElement>(null);

  async function fetchAccessToken() {
    try {
      const response = await fetch("/api/get-access-token", {
        method: "POST",
      });
      const token = await response.text();

      console.log("Access Token:", token); // Log the token to verify

      return token;
    } catch (error) {
      console.error("Error fetching access token:", error);
      throw error;
    }
  }

  const startSessionV2 = useMemoizedFn(async (isVoiceChat: boolean) => {
    try {
      const newToken = await fetchAccessToken();
      const avatar = initAvatar(newToken);

      avatar.on(StreamingEvents.AVATAR_START_TALKING, (e) => {
        console.log("Avatar started talking", e);
      });
      avatar.on(StreamingEvents.AVATAR_STOP_TALKING, (e) => {
        console.log("Avatar stopped talking", e);
      });
      avatar.on(StreamingEvents.STREAM_DISCONNECTED, () => {
        console.log("Stream disconnected");
      });
      avatar.on(StreamingEvents.STREAM_READY, (event) => {
        console.log(">>>>> Stream ready:", event.detail);
      });
      avatar.on(StreamingEvents.USER_START, (event) => {
        console.log(">>>>> User started talking:", event);
      });
      avatar.on(StreamingEvents.USER_STOP, (event) => {
        console.log(">>>>> User stopped talking:", event);
      });
      avatar.on(StreamingEvents.USER_END_MESSAGE, (event) => {
        console.log(">>>>> User end message:", event);
      });
      avatar.on(StreamingEvents.USER_TALKING_MESSAGE, (event) => {
        console.log(">>>>> User talking message:", event);
      });
      avatar.on(StreamingEvents.AVATAR_TALKING_MESSAGE, (event) => {
        console.log(">>>>> Avatar talking message:", event);
      });
      avatar.on(StreamingEvents.AVATAR_END_MESSAGE, (event) => {
        console.log(">>>>> Avatar end message:", event);
      });

      await startAvatar(config);

      // Always start voice chat
      await avatar.startVoiceChat();

      // Force unmute after starting voice chat
      await avatar.unmuteInputAudio();
      setIsMuted(false);

      // Speak the intro message synchronously
      await avatar.speak({
        text: AVATAR_INTRO,
        taskType: TaskType.REPEAT,
        taskMode: TaskMode.SYNC,
      });
    } catch (error) {
      console.error("Error starting avatar session:", error);
    }
  });

  useUnmount(() => {
    stopAvatar();
  });

  useEffect(() => {
    if (stream && mediaStream.current) {
      mediaStream.current.srcObject = stream;
      mediaStream.current.onloadedmetadata = () => {
        mediaStream.current!.play();
      };
    }
  }, [mediaStream, stream]);

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center py-4 sm:py-8">
      <div className="w-full max-w-2xl mx-auto flex flex-col gap-6 sm:gap-8 items-center px-2 sm:px-4">
        <img src="/versuni-logo.png" alt="Versuni Logo" className="mx-auto mb-2 max-h-16 sm:max-h-20 w-auto" />
        <div className="bg-white rounded-xl shadow-2xl p-3 sm:p-6 w-full max-w-2xl mb-2 mx-auto">
          <h1 className="text-2xl sm:text-3xl font-bold text-blue-800 mb-2">Coaching for Growth at Versuni</h1>
          <p className="text-lg sm:text-xl text-gray-700 mb-2 font-semibold">Welcome to your AI-powered coaching session.</p>
          <p className="text-base sm:text-lg text-gray-700 mb-4">In this interactive simulation, you will act as a <b>coach</b> and guide a virtual coachee through realistic conversations using proven coaching frameworks:</p>
          <p className="text-base sm:text-lg text-blue-700 font-semibold mb-4">GROW – <span className="font-normal">Goal, Reality, Options, Will – for structured coaching conversations</span></p>
          <p className="text-base sm:text-lg text-gray-700 mb-4">The coachee will respond naturally—sometimes confident, sometimes uncertain, and occasionally challenged. Your task is to stay curious, ask open questions, and support reflection, clarity, and growth.</p>
          <div className="mb-4">
            <div className="font-semibold mb-1 text-lg sm:text-xl">✅ Before You Start</div>
            <ul className="list-disc list-inside text-base sm:text-lg text-gray-700 ml-2">
              <li>Use <b>headphones</b> for the best experience</li>
              <li>Ensure a <b>stable internet connection</b> – the avatar requires good connectivity</li>
              <li>Be <b>patient</b> – responses can take 10–15 seconds</li>
              <li>This is <b>AI, not a human</b> – it's not perfect, but it's a powerful way to learn</li>
            </ul>
          </div>
          <div className="mb-4">
            <div className="font-semibold mb-1 text-lg sm:text-xl">🎯 Your Role</div>
            <ul className="list-disc list-inside text-base sm:text-lg text-gray-700 ml-2">
              <li><b>You</b> are the <b>coach</b> – your job is to guide the coachee</li>
              <li>The avatar is the <b>coachee</b> – they rely on your coaching</li>
              <li>If the avatar accidentally starts coaching you back, say:<br /><span className="italic">"Stay in the role of your prompt."</span></li>
            </ul>
          </div>
          <div className="mb-4">
            <div className="font-semibold mb-1 text-lg sm:text-xl">🛠️ How to Use</div>
            <ol className="list-decimal list-inside text-base sm:text-lg text-gray-700 ml-2">
              <li>Click 'Chat now' to begin</li>
              <li>Select your preferred language when the session starts</li>
              <li>Type <b>"START Coaching"</b> to begin the session</li>
              <li>Guide the coachee through development challenges using open, thoughtful questions</li>
              <li><b>Say: End coaching and give feedback.</b></li>
              <li>Receive <b>personalized feedback</b> on your coaching or feedback style</li>
            </ol>
          </div>
          <div className="mb-2">
            <div className="font-semibold mb-1 text-lg sm:text-xl">🔍 Want to Get Better?</div>
            <ul className="list-disc list-inside text-base sm:text-lg text-gray-700 ml-2">
              <li><span className="italic">"Can you give me more detailed feedback on [specific area]?"</span></li>
              <li><span className="italic">"What tools or techniques can help me improve my listening?"</span></li>
              <li><span className="italic">"Give me 3 deeper questions I could have asked."</span></li>
              <li><span className="italic">"What should I practice next as a coach?"</span></li>
            </ul>
          </div>
        </div>
        <div className="relative w-full max-w-2xl mx-auto flex flex-col items-center">
          <div className="w-full aspect-video bg-white rounded-xl shadow-2xl overflow-hidden flex items-center justify-center max-w-2xl mx-auto">
            {sessionState !== StreamingAvatarSessionState.INACTIVE ? (
              <AvatarVideo ref={mediaStream} />
            ) : (
              <img src="/preview.png" alt="Avatar preview" className="w-full h-full object-cover" />
            )}
            {sessionState === StreamingAvatarSessionState.INACTIVE && (
              <button
                className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-3 rounded-full shadow-lg text-lg transition z-10"
                onClick={() => startSessionV2(true)}
              >
                Chat now
              </button>
            )}
          </div>
        </div>
        {sessionState === StreamingAvatarSessionState.CONNECTED && (
          <div className="w-full mt-4">
            <MessageHistory />
          </div>
        )}
      </div>
    </div>
  );
}

export default function InteractiveAvatarWrapper() {
  return (
    <StreamingAvatarProvider basePath={process.env.NEXT_PUBLIC_BASE_API_URL}>
      <InteractiveAvatar />
    </StreamingAvatarProvider>
  );
}
