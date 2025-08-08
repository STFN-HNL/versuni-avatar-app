import {
  AvatarQuality,
  StreamingEvents,
  VoiceChatTransport,
  StartAvatarRequest,
  STTProvider,
  TaskType,
  TaskMode,
} from "@heygen/streaming-avatar";
import { useEffect, useRef, useState } from "react";
import { useMemoizedFn, useUnmount } from "ahooks";

import { AvatarVideo } from "./AvatarSession/AvatarVideo";
import { useStreamingAvatarSession } from "./logic/useStreamingAvatarSession";
import { StreamingAvatarProvider, StreamingAvatarSessionState } from "./logic";
import { MessageHistory } from "./AvatarSession/MessageHistory";
import { useStreamingAvatarContext } from "./logic/context";
import { LanguageSwitcher } from "./LanguageSwitcher";

import { TRANSLATIONS } from "@/app/lib/constants";

const DEFAULT_CONFIG: StartAvatarRequest = {
  quality: AvatarQuality.High,
  avatarName:
    process.env.NEXT_PUBLIC_AVATAR_ID ?? "Graham_Chair_Sitting_public",
  knowledgeId:
    process.env.NEXT_PUBLIC_KNOWLEDGE_ID ?? "f4ddbe7a93194620a4bcfd7ab48a7ab9",
  language: "en",
  voiceChatTransport: VoiceChatTransport.WEBSOCKET,
  sttSettings: {
    provider: STTProvider.DEEPGRAM,
  },
};

// Avatar intro will be selected based on language

function InteractiveAvatar() {
  const { initAvatar, startAvatar, stopAvatar, sessionState, stream } =
    useStreamingAvatarSession();
  const { setIsMuted } = useStreamingAvatarContext();

  const [config] = useState<StartAvatarRequest>(DEFAULT_CONFIG);
  const [language, setLanguage] = useState("en");

  const mediaStream = useRef<HTMLVideoElement>(null);
  const hasAvatarSpokenRef = useRef(false);
  

  // Get current translations
  const t = TRANSLATIONS[language as keyof typeof TRANSLATIONS] || TRANSLATIONS.en;

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

  const startSessionV2 = useMemoizedFn(async () => {
    try {
      // Update config with current language
      const updatedConfig = {
        ...config,
        language: language,
      };
      
      const newToken = await fetchAccessToken();
      const avatar = initAvatar(newToken);

      avatar.on(StreamingEvents.AVATAR_START_TALKING, (e) => {
        console.log("Avatar started talking", e);
        hasAvatarSpokenRef.current = true;
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

      await startAvatar(updatedConfig);

      // Explicitly speak opening line as AVATAR, with mic muted to avoid echo
      await avatar.muteInputAudio();
      await avatar.speak({
        text: t.kbTrigger,
        taskType: TaskType.REPEAT,
        taskMode: TaskMode.SYNC,
      });

      // After the opening line, start and unmute voice chat for user interaction
      await avatar.startVoiceChat();
      await avatar.unmuteInputAudio();
      setIsMuted(false);

      // Do not trigger an app intro; rely on Knowledge Base intro only
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
      <div className="w-full max-w-5xl mx-auto flex flex-col gap-10 items-center px-1 sm:px-6">
        {/* Language Switcher */}
        <div className="absolute top-4 right-4 z-10">
          <LanguageSwitcher
            language={language}
            onLanguageChange={setLanguage}
          />
        </div>
        
        <img src="/versuni-logo.png" alt="Versuni Logo" className="mx-auto mb-2 max-h-24 sm:max-h-28 w-auto" />
        <div className="bg-white rounded-xl p-6 sm:p-10 w-full mb-2 mx-auto">
          <h1 className="text-2xl sm:text-3xl font-bold text-blue-800 mb-2">{t.title}</h1>
          <p className="text-lg sm:text-xl text-gray-700 mb-2 font-semibold">{t.subtitle}</p>
          <p className="text-base sm:text-lg text-gray-700 mb-4">{t.description}</p>
          <p className="text-base sm:text-lg text-blue-700 font-semibold mb-4">{t.growModel}</p>
          <p className="text-base sm:text-lg text-gray-700 mb-4">{t.coacheeDescription}</p>
          <div className="mb-4">
            <div className="font-semibold mb-1 text-lg sm:text-xl">✅ {t.beforeYouStart}</div>
            <ul className="list-disc list-inside text-base sm:text-lg text-gray-700 ml-2">
              {t.beforeYouStartItems.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </div>
          <div className="mb-4">
            <div className="font-semibold mb-1 text-lg sm:text-xl">🎯 {t.yourRole}</div>
            <ul className="list-disc list-inside text-base sm:text-lg text-gray-700 ml-2">
              {t.yourRoleItems.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </div>
          <div className="mb-4">
            <div className="font-semibold mb-1 text-lg sm:text-xl">🛠️ {t.howToUse}</div>
            <ol className="list-decimal list-inside text-base sm:text-lg text-gray-700 ml-2">
              {t.howToUseSteps.map((step, index) => (
                <li key={index}>{step}</li>
              ))}
            </ol>
          </div>
          <div className="mb-2">
            <div className="font-semibold mb-1 text-lg sm:text-xl">🔍 {t.wantToGetBetter}</div>
            <ul className="list-disc list-inside text-base sm:text-lg text-gray-700 ml-2">
              {t.getBetterQuestions.map((question, index) => (
                <li key={index}><span className="italic">"{question}"</span></li>
              ))}
            </ul>
          </div>
        </div>
        <div className="relative w-full max-w-5xl mx-auto flex flex-col items-center">
          <div className="w-full max-w-5xl aspect-video bg-white rounded-xl shadow-2xl overflow-hidden flex items-center justify-center mx-auto" style={{ minHeight: '460px' }}>
            {sessionState !== StreamingAvatarSessionState.INACTIVE ? (
              <AvatarVideo ref={mediaStream} />
            ) : (
              <img src="/preview.png" alt="Avatar preview" className="w-full h-full object-cover" />
            )}
            {sessionState === StreamingAvatarSessionState.INACTIVE && (
              <button
                className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-3 rounded-full shadow-lg text-lg transition z-10"
                                    onClick={() => startSessionV2()}
              >
                {t.chatNow}
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
