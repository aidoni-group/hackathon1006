"use client";

import {
  useState,
  useEffect,
  useRef,
  forwardRef,
  useImperativeHandle,
} from "react";
import { Box, Button, Typography, Alert, CircularProgress } from "@mui/material";
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
  createSession: () => void;
}

const SpeechInterface = forwardRef<SpeechInterfaceRef, SpeechInterfaceProps>(
  ({ selectedCharacter, onListeningChange, onSpeakingChange }, ref) => {
      const [isListening, setIsListening] = useState(false);
  const [currentSession, setCurrentSession] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [sessionError, setSessionError] = useState<string | null>(null);
  const [isCreatingSession, setIsCreatingSession] = useState(false);

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
    console.log("Session creation useEffect triggered:", {
      selectedCharacter: selectedCharacter?.name,
      currentSession: currentSession,
      shouldCreate: selectedCharacter && !currentSession
    });
    
    if (selectedCharacter && !currentSession) {
      createTherapySession();
    }
  }, [selectedCharacter, currentSession]);

    // Expose methods to parent component
         useImperativeHandle(
       ref,
       () => ({
         toggleListening: () => {
           if (!recognitionRef.current) {
             console.log("Speech recognition not available");
             return;
           }

           if (!currentSession) {
             console.log("No session available, cannot start listening");
             return;
           }

           if (isListening) {
             console.log("Stopping speech recognition");
             recognitionRef.current.stop();
           } else {
             console.log("Starting speech recognition");
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
        createSession: () => {
          createTherapySession();
        },
             }),
       [isListening, currentSession]
     );

      // Create session function
  const createTherapySession = async (): Promise<string | null> => {
    if (!selectedCharacter) {
      setSessionError("No character selected");
      return null;
    }

    setIsCreatingSession(true);
    setSessionError(null);
    console.log("Creating therapy session for:", selectedCharacter.name);

        try {
      console.log("Making request to:", `${API_BASE_URL}/sessions/new`);
      
      const response = await fetch(`${API_BASE_URL}/sessions/new`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          personality: selectedCharacter.id,
        }),
      });

      console.log("Session creation response:", {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok
      });

      if (response.ok) {
        const data = await response.json();
        console.log("Session data received:", data);
        setCurrentSession(data.session_id);
        setSessionError(null);
        console.log("Session created successfully:", data.session_id);
        return data.session_id;
      } else {
        const errorText = await response.text();
        const errorMessage = `Failed to create session: ${response.status} ${response.statusText}`;
        console.error("Failed to create session:", {
          status: response.status,
          statusText: response.statusText,
          errorText: errorText
        });
        setSessionError(errorMessage);
        return null;
      }
    } catch (error) {
      console.error("Network error creating session:", error);
      const errorMessage = `Network error: Is your backend running on ${API_BASE_URL}?`;
      setSessionError(errorMessage);
      return null;
    } finally {
      setIsCreatingSession(false);
    }
    };

      // Send message to backend and play response
  const handleSendMessage = async (message: string) => {
    console.log("handleSendMessage called with:", {
      message: message,
      messageLength: message.trim().length,
      currentSession: currentSession,
      isLoading: isLoading,
      selectedCharacter: selectedCharacter?.name
    });

    if (!message.trim()) {
      console.log("handleSendMessage returning early: no message");
      return;
    }

    if (isLoading) {
      console.log("handleSendMessage returning early: already loading");
      return;
    }

    // If no session exists, try to create one first
    let sessionToUse = currentSession;
    if (!sessionToUse) {
      console.log("No session exists, creating one first...");
      if (!selectedCharacter) {
        console.error("Cannot create session: no character selected");
        setSessionError("Please select a character first");
        return;
      }
      
      // Create session and get the session ID directly
      sessionToUse = await createTherapySession();
      
      if (!sessionToUse) {
        console.error("Failed to create session, cannot send message");
        return;
      }
      
      console.log("Successfully created session:", sessionToUse);
    }

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
              session_id: sessionToUse,
              message: message,
            },
          }),
        });

        if (response.ok) {
          const data = await response.json();
          console.log("Got response:", data.output);
          console.log("About to call playWithFishTTS with:", {
            text: data.output,
            sessionToUse: sessionToUse,
            textLength: data.output?.length
          });

          // Play with Fish TTS
          await playWithFishTTS(data.output, sessionToUse);
          console.log("playWithFishTTS call completed");
        } else {
          console.error("Backend response not ok:", {
            status: response.status,
            statusText: response.statusText
          });
          const errorText = await response.text();
          console.error("Backend error text:", errorText);
        }
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setIsLoading(false);
      }
    };

    // Fish TTS function
    const playWithFishTTS = async (text: string, sessionId?: string): Promise<void> => {
      console.log("🎵 playWithFishTTS called with:", {
        text: text,
        sessionId: sessionId,
        currentSession: currentSession,
        textLength: text?.length
      });

      const sessionToUse = sessionId || currentSession;
      console.log("🎵 Session to use for TTS:", sessionToUse);
      
      if (!sessionToUse) {
        console.error("🎵 No session available for TTS");
        return;
      }

      if (!text || !text.trim()) {
        console.error("🎵 No text provided for TTS");
        return;
      }

      console.log("🎵 Starting Fish TTS for text:", text.substring(0, 100) + "...");
      onSpeakingChange(true);

      try {
        const ttsUrl = `${API_BASE_URL}/tts/${sessionToUse}/stream/text`;
        console.log("🎵 Making TTS request to:", ttsUrl);
        
        const response = await fetch(ttsUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ text }),
        });

        console.log("🎵 TTS response:", {
          status: response.status,
          statusText: response.statusText,
          ok: response.ok,
          contentType: response.headers.get('content-type')
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error("🎵 TTS failed:", {
            status: response.status,
            statusText: response.statusText,
            errorText: errorText
          });
          throw new Error(`TTS failed: ${response.status} - ${errorText}`);
        }

        // Get audio blob and play it
        console.log("🎵 Converting response to blob...");
        const audioBlob = await response.blob();
        console.log("🎵 Audio blob created:", {
          size: audioBlob.size,
          type: audioBlob.type
        });
        
        const audioUrl = URL.createObjectURL(audioBlob);
        console.log("🎵 Audio URL created:", audioUrl);

        // Stop any current audio
        if (audioRef.current) {
          console.log("🎵 Stopping current audio");
          audioRef.current.pause();
          audioRef.current = null;
        }

        // Create and play new audio
        console.log("🎵 Creating new audio element");
        audioRef.current = new Audio(audioUrl);

        audioRef.current.onended = () => {
          console.log("🎵 Audio playback ended");
          onSpeakingChange(false);
          URL.revokeObjectURL(audioUrl);
          audioRef.current = null;
        };

        audioRef.current.onerror = (error) => {
          console.error("🎵 Audio playback error:", error);
          onSpeakingChange(false);
          URL.revokeObjectURL(audioUrl);
          audioRef.current = null;
        };

        audioRef.current.onloadstart = () => {
          console.log("🎵 Audio started loading");
        };

        audioRef.current.oncanplay = () => {
          console.log("🎵 Audio can start playing");
        };

        console.log("🎵 Starting audio playback...");
        try {
          await audioRef.current.play();
          console.log("🎵 Audio playback started successfully");
        } catch (playError) {
          console.error("🎵 Audio play() failed:", playError);
          throw playError;
        }
      } catch (error) {
        console.error("Fish TTS error:", error);
        onSpeakingChange(false);
      }
    };

    // Session management UI
    return (
      <Box sx={{ p: 2, border: 1, borderColor: 'divider', borderRadius: 1, mb: 2 }}>
        <Typography variant="h6" gutterBottom>
          Session Management
        </Typography>
        
        {/* Session Status */}
        {currentSession ? (
          <Alert severity="success" sx={{ mb: 2 }}>
            Session Active: {currentSession}
          </Alert>
        ) : (
          <Alert severity="warning" sx={{ mb: 2 }}>
            No active session. Create a session to start therapy.
          </Alert>
        )}

        {/* Error Display */}
        {sessionError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {sessionError}
          </Alert>
        )}

        {/* Character Info */}
        {selectedCharacter ? (
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Character: {selectedCharacter.name}
          </Typography>
        ) : (
          <Alert severity="info" sx={{ mb: 2 }}>
            Please select a character first
          </Alert>
        )}

        {/* Session Controls */}
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
          <Button
            variant="contained"
            onClick={createTherapySession}
            disabled={!selectedCharacter || isCreatingSession}
            startIcon={isCreatingSession ? <CircularProgress size={16} /> : null}
          >
            {isCreatingSession ? 'Creating...' : 'Create New Session'}
          </Button>
          
          {currentSession && (
            <Button
              variant="outlined"
              onClick={() => {
                setCurrentSession(null);
                setSessionError(null);
              }}
            >
              End Session
            </Button>
          )}
        </Box>

        {/* Status Indicators */}
        <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
          {isListening && (
            <Typography variant="body2" color="primary">
              🎤 Listening...
            </Typography>
          )}
          {isLoading && (
            <Typography variant="body2" color="secondary">
              ⏳ Processing...
            </Typography>
          )}
        </Box>
      </Box>
    );
  }
);

SpeechInterface.displayName = "SpeechInterface";
export default SpeechInterface;
