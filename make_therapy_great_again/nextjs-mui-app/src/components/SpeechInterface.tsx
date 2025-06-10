"use client";

import {
  useState,
  useEffect,
  useRef,
  forwardRef,
  useImperativeHandle,
} from "react";
import { Character } from "./CharacterAvatar";

interface SpeechInterfaceProps {
  selectedCharacter: Character | null;
  onListeningChange: (listening: boolean) => void;
  onSpeakingChange: (speaking: boolean) => void;
}

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000";
export interface SpeechInterfaceRef {
  toggleListening: () => void;
  sendDebugMessage: (message: string) => void;
}

const SpeechInterface = forwardRef<SpeechInterfaceRef, SpeechInterfaceProps>(
  ({ selectedCharacter, onListeningChange, onSpeakingChange }, ref) => {
    const [isListening, setIsListening] = useState(false);
    const [currentSession, setCurrentSession] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const recognitionRef = useRef<any>(null);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    // Initialize speech recognition
    useEffect(() => {
      if (
        typeof window !== "undefined" &&
        "webkitSpeechRecognition" in window
      ) {
        recognitionRef.current = new (window as any).webkitSpeechRecognition();
        recognitionRef.current.continuous = false;
        recognitionRef.current.interimResults = false;

        recognitionRef.current.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          console.log("Speech recognized:", transcript);
          handleSendMessage(transcript);
        };

        recognitionRef.current.onerror = (event: any) => {
          console.error("Speech recognition error:", event.error);
          setIsListening(false);
          onListeningChange(false);
        };

        recognitionRef.current.onend = () => {
          setIsListening(false);
          onListeningChange(false);
        };

        recognitionRef.current.onstart = () => {
          setIsListening(true);
          onListeningChange(true);
        };
      }

      return () => {
        if (recognitionRef.current) {
          recognitionRef.current.stop();
        }
        if (audioRef.current) {
          audioRef.current.pause();
          audioRef.current = null;
        }
      };
    }, [onListeningChange]);

    // Create session when character is selected
    useEffect(() => {
      if (selectedCharacter && !currentSession) {
        createTherapySession();
      }
    }, [selectedCharacter]);

    // Expose methods to parent component
    useImperativeHandle(
      ref,
      () => ({
        toggleListening: () => {
          if (!recognitionRef.current) return;

          if (isListening) {
            recognitionRef.current.stop();
          } else {
            try {
              recognitionRef.current.start();
            } catch (error) {
              console.error("Error starting recognition:", error);
            }
          }
        },
        sendDebugMessage: (message: string) => {
          console.log("Debug message:", message);
          handleSendMessage(message);
        },
      }),
      [isListening]
    );

    // Create session function
    const createTherapySession = async () => {
      if (!selectedCharacter) return;

      try {
        const response = await fetch(`${API_BASE_URL}/sessions/new`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            personality: selectedCharacter.id,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          setCurrentSession(data.session_id);
          console.log("Session created:", data.session_id);
        }
      } catch (error) {
        console.error("Error creating session:", error);
      }
    };

    // Send message to backend and play response
    const handleSendMessage = async (message: string) => {
      if (!message.trim() || !currentSession || isLoading) return;

      setIsLoading(true);
      console.log("Sending message:", message);

      try {
        // Send message to backend
        const response = await fetch(`${API_BASE_URL}/call`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            inputs: {
              session_id: currentSession,
              message: message,
            },
          }),
        });

        if (response.ok) {
          const data = await response.json();
          console.log("Got response:", data.output);

          // Play with Fish TTS
          await playWithFishTTS(data.output);
        }
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setIsLoading(false);
      }
    };

    // Fish TTS function
    const playWithFishTTS = async (text: string): Promise<void> => {
      if (!currentSession) return;

      console.log("Playing with Fish TTS:", text);
      onSpeakingChange(true);

      try {
        const response = await fetch(
          `${API_BASE_URL}/tts/${currentSession}/stream/text`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ text }),
          }
        );

        if (!response.ok) {
          throw new Error(`TTS failed: ${response.status}`);
        }

        // Get audio blob and play it
        const audioBlob = await response.blob();
        const audioUrl = URL.createObjectURL(audioBlob);

        // Stop any current audio
        if (audioRef.current) {
          audioRef.current.pause();
          audioRef.current = null;
        }

        // Create and play new audio
        audioRef.current = new Audio(audioUrl);

        audioRef.current.onended = () => {
          onSpeakingChange(false);
          URL.revokeObjectURL(audioUrl);
          audioRef.current = null;
        };

        audioRef.current.onerror = () => {
          onSpeakingChange(false);
          URL.revokeObjectURL(audioUrl);
          audioRef.current = null;
        };

        await audioRef.current.play();
      } catch (error) {
        console.error("Fish TTS error:", error);
        onSpeakingChange(false);
      }
    };

    // No visible UI - just functionality
    return null;
  }
);

SpeechInterface.displayName = "SpeechInterface";
export default SpeechInterface;
