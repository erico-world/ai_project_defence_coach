"use client";

import Image from "next/image";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

import { cn } from "@/lib/utils";
import { getVapi } from "@/lib/vapi.sdk";
import { defenceInterviewer } from "@/constants";
import { createFeedback } from "@/lib/actions/general.action";
import { toast } from "sonner";
import Vapi from "@vapi-ai/web";

// Define the message type
interface VapiMessage {
  type: string;
  transcriptType?: string;
  role: string;
  transcript: string;
}

enum CallStatus {
  INACTIVE = "INACTIVE",
  CONNECTING = "CONNECTING",
  ACTIVE = "ACTIVE",
  FINISHED = "FINISHED",
}

interface SavedMessage {
  role: "user" | "system" | "assistant";
  content: string;
}

interface ProjectFile {
  name: string;
  type: string;
  url: string;
  path?: string;
}

interface AgentProps {
  userName: string;
  userId: string;
  interviewId: string;
  feedbackId?: string;
  questions: string[];
  projectDetails: {
    projectTitle: string;
    academicLevel: string;
    technologiesUsed: string;
    projectFile?: ProjectFile;
  };
}

const Agent = ({
  userName,
  userId,
  interviewId,
  feedbackId,
  questions,
  projectDetails,
}: AgentProps) => {
  const router = useRouter();
  const [callStatus, setCallStatus] = useState<CallStatus>(CallStatus.INACTIVE);
  const [messages, setMessages] = useState<SavedMessage[]>([]);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [lastMessage, setLastMessage] = useState<string>("");
  const [isClient, setIsClient] = useState(false);
  const vapiRef = useRef<typeof Vapi.prototype | null>(null);

  // Mark component as mounted on client-side to prevent hydration issues
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Initialize VAPI on component mount - only run on client
  useEffect(() => {
    if (!isClient) {
      console.log("Skipping VAPI initialization on server-side");
      return;
    }

    console.log("Initializing VAPI in Agent component...");
    const initializeVapi = async () => {
      try {
        console.log("Calling getVapi()...");
        const vapi = getVapi();
        console.log("getVapi() returned:", vapi ? "VAPI instance" : "null");

        if (!vapi) {
          throw new Error("Failed to initialize VAPI SDK");
        }

        vapiRef.current = vapi;
        console.log("VAPI SDK initialized successfully in Agent component");

        // Test the VAPI instance
        console.log("VAPI instance methods:", Object.getOwnPropertyNames(vapi));
      } catch (error) {
        console.error("Error initializing VAPI:", error);
        toast.error(
          "Failed to initialize voice services. Please refresh the page."
        );
      }
    };

    initializeVapi();
  }, [isClient]);

  useEffect(() => {
    if (!isClient) return;

    const vapi = vapiRef.current;
    if (!vapi) return;

    const onCallStart = () => {
      console.log("Call started successfully");
      setCallStatus(CallStatus.ACTIVE);
    };

    const onCallEnd = () => {
      console.log("Call ended");
      setCallStatus(CallStatus.FINISHED);
    };

    const onMessage = (message: VapiMessage) => {
      console.log("Message received:", message);
      if (message.type === "transcript" && message.transcriptType === "final") {
        const newMessage = {
          role: message.role as "user" | "system" | "assistant",
          content: message.transcript,
        };
        setMessages((prev) => [...prev, newMessage]);
      }
    };

    const onSpeechStart = () => {
      console.log("Speech started");
      setIsSpeaking(true);
    };

    const onSpeechEnd = () => {
      console.log("Speech ended");
      setIsSpeaking(false);
    };

    const onError = (error: Error) => {
      console.error("VAPI Error:", error);
      const errorMsg = error?.message || "Unknown error";
      toast.error(`Error: ${errorMsg}`);

      // Add error to console with stack trace
      console.error("Error details:", {
        message: error?.message,
        stack: error?.stack,
        name: error?.name,
      });

      // Reset call status if we get an error
      setCallStatus(CallStatus.INACTIVE);
    };

    // Type assertion to handle "possibly null" errors
    if (vapi) {
      vapi.on("call-start", onCallStart);
      vapi.on("call-end", onCallEnd);
      vapi.on("message", onMessage);
      vapi.on("speech-start", onSpeechStart);
      vapi.on("speech-end", onSpeechEnd);
      vapi.on("error", onError);
    }

    return () => {
      if (vapi) {
        vapi.off("call-start", onCallStart);
        vapi.off("call-end", onCallEnd);
        vapi.off("message", onMessage);
        vapi.off("speech-start", onSpeechStart);
        vapi.off("speech-end", onSpeechEnd);
        vapi.off("error", onError);
      }
    };
  }, [isClient, vapiRef.current]);

  useEffect(() => {
    if (!isClient) return;

    if (messages.length > 0) {
      setLastMessage(messages[messages.length - 1].content);
    }

    const handleGenerateFeedback = async (messages: SavedMessage[]) => {
      console.log("handleGenerateFeedback");

      const { success, feedbackId: id } = await createFeedback({
        interviewId: interviewId!,
        userId: userId!,
        transcript: messages,
        feedbackId,
        projectDetails,
      });

      if (success && id) {
        router.push(`/interview/${interviewId}/feedback`);
      } else {
        console.log("Error saving feedback");
        router.push("/");
      }
    };

    if (callStatus === CallStatus.FINISHED) {
      handleGenerateFeedback(messages);
    }
  }, [
    isClient,
    messages,
    callStatus,
    feedbackId,
    interviewId,
    router,
    userId,
    projectDetails,
  ]);

  const handleCall = async () => {
    if (!isClient) return;

    const vapi = vapiRef.current;
    if (!vapi) {
      toast.error(
        "Voice services are not available. Please refresh and try again."
      );
      return;
    }

    try {
      console.log("Starting call...");
      setCallStatus(CallStatus.CONNECTING);

      // Verify the token is valid
      const token = process.env.NEXT_PUBLIC_VAPI_WEB_TOKEN;
      if (!token) {
        throw new Error(
          "VAPI token is missing. Please check your environment variables."
        );
      }

      // Check for the interviewer workflow ID
      if (!defenceInterviewer) {
        throw new Error("Missing defense interviewer workflow configuration");
      }

      let formattedQuestions = "";
      if (questions && Array.isArray(questions)) {
        formattedQuestions = questions
          .map((question) => `- ${question}`)
          .join("\n");
      }

      console.log("Starting defence session with variables:", {
        questions: formattedQuestions
          ? "Formatted questions available"
          : "No questions available",
        projectTitle: projectDetails?.projectTitle,
        academicLevel: projectDetails?.academicLevel,
      });

      // Use the defenceInterviewer workflow
      await vapi.start(defenceInterviewer, {
        variableValues: {
          questions: formattedQuestions || "General defence questions",
          projectTitle: projectDetails?.projectTitle || "Your Project",
          academicLevel: projectDetails?.academicLevel || "undergraduate",
        },
      });
    } catch (error) {
      console.error("Error starting call:", error);
      let errorMsg = "Unknown error";

      if (error instanceof Error) {
        errorMsg = error.message;
        // Log detailed error information
        console.error("Detailed error info:", {
          message: error.message,
          name: error.name,
          stack: error.stack,
        });
      } else {
        // For non-Error objects, stringify for debugging
        console.error("Non-standard error:", JSON.stringify(error));
      }

      toast.error(`Failed to start the defence: ${errorMsg}`);
      setCallStatus(CallStatus.INACTIVE);
    }
  };

  const handleDisconnect = () => {
    if (!isClient) return;

    const vapi = vapiRef.current;
    if (!vapi) return;

    console.log("Disconnecting call");
    setCallStatus(CallStatus.FINISHED);
    vapi.stop();
  };

  // Return a placeholder during server rendering to avoid hydration mismatches
  if (!isClient) {
    return (
      <div className="call-view">
        <div className="card-interviewer">
          <div className="avatar">
            <Image
              src="/ai-avatar.png"
              alt="profile-image"
              width={65}
              height={54}
              className="object-cover"
            />
          </div>
          <h3>Academic Evaluator</h3>
        </div>
        <div className="card-border">
          <div className="card-content">
            <Image
              src="/user-avatar.png"
              alt="profile-image"
              width={539}
              height={539}
              className="rounded-full object-cover size-[120px]"
            />
            <h3>{userName}</h3>
          </div>
        </div>
        <div className="w-full flex justify-center">
          <button className="relative btn-call" disabled>
            <span className="relative">Start Defence</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="call-view">
        {/* AI Interviewer Card */}
        <div className="card-interviewer">
          <div className="avatar">
            <Image
              src="/ai-avatar.png"
              alt="profile-image"
              width={65}
              height={54}
              className="object-cover"
            />
            {isSpeaking && <span className="animate-speak" />}
          </div>
          <h3>Academic Evaluator</h3>
        </div>

        {/* User Profile Card */}
        <div className="card-border">
          <div className="card-content">
            <Image
              src="/user-avatar.png"
              alt="profile-image"
              width={539}
              height={539}
              className="rounded-full object-cover size-[120px]"
            />
            <h3>{userName}</h3>
          </div>
        </div>
      </div>

      {messages.length > 0 && (
        <div className="transcript-border">
          <div className="transcript">
            <p
              key={lastMessage}
              className={cn(
                "transition-opacity duration-500 opacity-0",
                "animate-fadeIn opacity-100"
              )}
            >
              {lastMessage}
            </p>
          </div>
        </div>
      )}

      <div className="w-full flex justify-center">
        {callStatus !== "ACTIVE" ? (
          <button className="relative btn-call" onClick={() => handleCall()}>
            <span
              className={cn(
                "absolute animate-ping rounded-full opacity-75",
                callStatus !== "CONNECTING" && "hidden"
              )}
            />

            <span className="relative">
              {callStatus === "INACTIVE" || callStatus === "FINISHED"
                ? "Start Defence"
                : ". . ."}
            </span>
          </button>
        ) : (
          <button className="btn-disconnect" onClick={() => handleDisconnect()}>
            End
          </button>
        )}
      </div>
    </>
  );
};

export default Agent;
