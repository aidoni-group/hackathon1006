 'use client';

import { useState, useRef, useEffect } from 'react';
import {
  Box,
  Button,
  Typography,
  Paper,
  IconButton,
  Alert,
  CircularProgress,
} from '@mui/material';
import { Mic, MicOff, Clear, Send, Stop, VolumeUp } from '@mui/icons-material';
import { Character } from './CharacterAvatar';

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onstart: (() => void) | null;
  onend: (() => void) | null;
  onerror: ((event: any) => void) | null;
}

interface SpeechRecognitionEvent {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

interface SpeechRecognitionResultList {
  [index: number]: SpeechRecognitionResult;
  length: number;
}

interface SpeechRecognitionResult {
  [index: number]: SpeechRecognitionAlternative;
  isFinal: boolean;
  length: number;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognition;
    webkitSpeechRecognition: new () => SpeechRecognition;
  }
}

interface TherapySession {
  characterId: string;
  userMessage: string;
  timestamp: Date;
  sessionId: string;
}

interface SpeechInterfaceProps {
  selectedCharacter: Character | null;
  onListeningChange: (isListening: boolean) => void;
  onSpeakingChange?: (isSpeaking: boolean) => void;
}

export default function SpeechInterface({ 
  selectedCharacter, 
  onListeningChange,
  onSpeakingChange
}: SpeechInterfaceProps) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isSupported, setIsSupported] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [aiResponse, setAiResponse] = useState('');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [sessionId] = useState(() => `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);

  const recognitionRef = useRef<SpeechRecognition | null>(null);

  // Initialize speech recognition
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      
      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = true;
        recognitionRef.current.interimResults = true;
        recognitionRef.current.lang = 'en-US';

        recognitionRef.current.onresult = (event) => {
          let finalTranscript = '';
          let interimTranscript = '';

          for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript;
            
            if (event.results[i].isFinal) {
              finalTranscript += transcript + ' ';
            } else {
              interimTranscript += transcript;
            }
          }

          if (finalTranscript) {
            setTranscript(prev => prev + finalTranscript);
          }
          setInterimTranscript(interimTranscript);
        };

        recognitionRef.current.onstart = () => {
          setIsListening(true);
          onListeningChange(true);
          setErrorMessage('');
        };

        recognitionRef.current.onend = () => {
          setIsListening(false);
          onListeningChange(false);
          setInterimTranscript('');
        };

        recognitionRef.current.onerror = (event) => {
          setErrorMessage(`Speech recognition error: ${event.error}`);
          setIsListening(false);
          onListeningChange(false);
          setInterimTranscript('');
        };

      } else {
        setIsSupported(false);
        setErrorMessage('Speech Recognition not supported in this browser. Try Chrome or Edge.');
      }
    }
  }, [onListeningChange]);

  const startListening = () => {
    if (!selectedCharacter) {
      setErrorMessage('Please select a character first');
      return;
    }

    if (recognitionRef.current && !isListening) {
      setErrorMessage('');
      recognitionRef.current.start();
    }
  };

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
    }
  };

  const clearTranscript = () => {
    // Stop any ongoing speech first
    if (isSpeaking) {
      stopSpeaking();
    }
    setTranscript('');
    setInterimTranscript('');
    setAiResponse('');
    setErrorMessage('');
  };

  // Prepare therapy session data for backend
  const prepareTherapySession = (userMessage: string): TherapySession => {
    return {
      characterId: selectedCharacter?.id || '',
      userMessage: userMessage.trim(),
      timestamp: new Date(),
      sessionId
    };
  };

  // Send to therapy AI backend (placeholder for now)
  const sendToTherapyAI = async (sessionData: TherapySession) => {
    setIsProcessing(true);
    setAiResponse('');

    try {
      // TODO: Replace with actual backend API call
      console.log('Sending to therapy AI backend:', sessionData);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock response based on character
      const mockResponses = {
        trump: `Listen, ${sessionData.userMessage} - that's what I call tremendous input! You know what? You're going to be great, believe me. I've seen a lot of people, and you've got what it takes. We're going to make your problems disappear, and it's going to be beautiful!`,
        putin: `Regarding "${sessionData.userMessage}" - this requires strategic thinking. In my experience, challenges like this demand patience and calculated moves. You must approach this systematically, like chess. Focus on your strengths and never show weakness.`,
        tate: `Bro, about "${sessionData.userMessage}" - you need to understand something. Life is a test. Every challenge is an opportunity to level up. Stop making excuses and start taking action. You're either growing or you're dying. What are you going to choose?`,
        greta: `About "${sessionData.userMessage}" - we need to think about this holistically. Our mental wellbeing is connected to everything around us. Take time to breathe, connect with nature, and remember that small actions create big changes. How dare we ignore our inner voice?`
      };

      const response = mockResponses[sessionData.characterId as keyof typeof mockResponses] || 
                     "I understand your concern. Let's work through this together.";
      
      setAiResponse(response);

      // Start speaking animation and text-to-speech
      speakResponse(response);
      
    } catch (error) {
      setErrorMessage('Error communicating with therapy AI');
      console.error('Therapy AI error:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  // Text-to-speech with jaw animation
  const speakResponse = (text: string) => {
    if ('speechSynthesis' in window) {
      // Stop any current speech
      window.speechSynthesis.cancel();
      
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.pitch = 0.8;
      utterance.volume = 1;

      utterance.onstart = () => {
        setIsSpeaking(true);
        onSpeakingChange?.(true);  // Notify parent component
      };

      utterance.onend = () => {
        setIsSpeaking(false);
        onSpeakingChange?.(false);  // Notify parent component
      };

      utterance.onerror = () => {
        setIsSpeaking(false);
        onSpeakingChange?.(false);  // Notify parent component
      };

      window.speechSynthesis.speak(utterance);
    }
  };

  const stopSpeaking = () => {
    // Immediately update state first
    setIsSpeaking(false);
    onSpeakingChange?.(false);
    
    if ('speechSynthesis' in window) {
      // Multiple cancel calls to handle browser quirks
      window.speechSynthesis.cancel();
      
      // Additional cancels with delays
      setTimeout(() => {
        window.speechSynthesis.cancel();
      }, 10);
      
      setTimeout(() => {
        window.speechSynthesis.cancel();
      }, 50);
      
      // Final cleanup
      setTimeout(() => {
        if (window.speechSynthesis.speaking) {
          window.speechSynthesis.cancel();
        }
      }, 100);
    }
  };

  const handleSendMessage = () => {
    if (!transcript.trim()) return;
    
    const sessionData = prepareTherapySession(transcript);
    sendToTherapyAI(sessionData);
  };

  if (!selectedCharacter) {
    return (
      <Box className="text-center py-8">
        <Typography variant="h6" className="!text-gray-500">
          👆 Please select a character above to begin your therapy session
        </Typography>
      </Box>
    );
  }

  return (
    <Box className="max-w-4xl mx-auto">
      {/* Controls */}
      <Box className="flex justify-center gap-4 mb-8">
        <Button
          variant="contained"
          size="large"
          startIcon={isListening ? <MicOff /> : <Mic />}
          onClick={isListening ? stopListening : startListening}
          disabled={!isSupported || isSpeaking}
          style={{ 
            backgroundColor: isListening ? '#dc2626' : selectedCharacter.borderColor,
            color: 'white'
          }}
          className="!py-3 !px-6"
        >
          {isListening ? 'Stop Listening' : 'Start Talking'}
        </Button>

        <IconButton
          onClick={clearTranscript}
          className="!bg-gray-600 !text-white hover:!bg-gray-700"
          size="large"
          disabled={!transcript && !interimTranscript}
        >
          <Clear />
        </IconButton>

        <Button
          variant="outlined"
          size="large"
          startIcon={isProcessing ? <CircularProgress size={20} /> : <Send />}
          onClick={handleSendMessage}
          disabled={!transcript.trim() || isProcessing || isSpeaking}
          style={{ 
            borderColor: selectedCharacter.borderColor,
            color: selectedCharacter.borderColor
          }}
          className="!py-3 !px-6"
        >
          {isProcessing ? 'Processing...' : 'Send to AI'}
        </Button>

        {/* Stop Speaking Button */}
        {isSpeaking && (
          <Button
            variant="contained"
            size="large"
            startIcon={<Stop />}
            onClick={stopSpeaking}
            className="!bg-red-600 !text-white hover:!bg-red-700 !py-3 !px-6"
          >
            Stop Speaking
          </Button>
        )}
      </Box>

      {/* Browser Support Warning */}
      {!isSupported && (
        <Alert severity="warning" className="!mb-6">
          Speech Recognition not supported. Try Chrome or Edge.
        </Alert>
      )}

      {/* Status Display */}
      {isListening && (
        <Paper className="!p-4 !mb-4 !bg-blue-50 !border-l-4 !border-blue-500">
          <Typography className="!text-blue-800 !text-center !flex !items-center !justify-center !gap-2">
            <Mic className="animate-pulse" />
            Listening to your therapy session with {selectedCharacter.name}...
          </Typography>
        </Paper>
      )}

      {errorMessage && (
        <Alert severity="error" className="!mb-6">
          {errorMessage}
        </Alert>
      )}

      {/* Live Transcript Display */}
      <Paper className="!p-6 !mb-4 !min-h-48 !bg-white !shadow-lg">
        <Typography variant="h6" className="!font-bold !mb-4 !text-gray-800">
          Your Message to {selectedCharacter.name}:
        </Typography>
        
        <Box className="!bg-gray-50 !p-4 !rounded !min-h-32 !border-2 !border-dashed !border-gray-300">
          <Typography className="!text-gray-800 !text-lg !leading-relaxed">
            {transcript}
            <span className="!text-gray-500 !italic">
              {interimTranscript}
            </span>
            {isListening && (
              <span className="!text-blue-600 !animate-ping">|</span>
            )}
          </Typography>
          
          {!transcript && !interimTranscript && !isListening && (
            <Typography className="!text-gray-400 !text-center !mt-8">
              Click "Start Talking" to share your thoughts with {selectedCharacter.name}...
            </Typography>
          )}
        </Box>

        {transcript && (
          <Box className="!mt-4 !pt-4 !border-t">
            <Typography variant="body2" className="!text-gray-600">
              Words: {transcript.trim().split(' ').filter(word => word.length > 0).length}
              {interimTranscript && (
                <span className="!ml-4 !text-blue-600">
                  (+ {interimTranscript.trim().split(' ').length} interim)
                </span>
              )}
            </Typography>
          </Box>
        )}
      </Paper>

      {/* AI Response */}
      {aiResponse && (
        <Paper className="!p-6 !mb-4 !bg-gradient-to-r" style={{
          background: `linear-gradient(135deg, ${selectedCharacter.borderColor}10, ${selectedCharacter.borderColor}05)`
        }}>
          <Box className="flex items-center gap-2 mb-3">
            <div 
              className={`w-8 h-8 rounded-full flex items-center justify-center text-lg ${
                isSpeaking ? 'animate-pulse' : ''
              }`}
              style={{ background: selectedCharacter.gradient }}
            >
              {selectedCharacter.emoji}
            </div>
            <Typography variant="h6" className="!font-bold" style={{ color: selectedCharacter.borderColor }}>
              {selectedCharacter.name} responds:
            </Typography>
            {isSpeaking && (
              <Box className="flex items-center gap-1 ml-2">
                <VolumeUp className="!text-green-600 animate-pulse" />
                <Typography variant="body2" className="!text-green-600 !font-bold">
                  Speaking...
                </Typography>
              </Box>
            )}
          </Box>
          <Typography className="!text-gray-800 !text-lg !leading-relaxed">
            {aiResponse}
          </Typography>
        </Paper>
      )}
    </Box>
  );
}