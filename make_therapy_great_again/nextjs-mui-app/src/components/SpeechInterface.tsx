'use client';

import { useState, useEffect, useRef } from 'react';
import {
  Box,
  Button,
  Typography,
  Paper,
  IconButton,
  TextField,
  Alert,
  CircularProgress,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText
} from '@mui/material';
import {
  Mic,
  MicOff,
  VolumeUp,
  Send,
  History as HistoryIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
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

interface ConversationMessage {
  user: string;
  assistant: string;
  timestamp: string;
}

interface TherapySession {
  session_id: string;
  personality: string;
  personality_name: string;
  created_at: string;
  message_count: number;
}

interface SpeechInterfaceProps {
  selectedCharacter: Character | null;
  onListeningChange: (listening: boolean) => void;
  onSpeakingChange: (speaking: boolean) => void;
}

const API_BASE_URL = 'http://localhost:3000';

export default function SpeechInterface({ 
  selectedCharacter, 
  onListeningChange, 
  onSpeakingChange 
}: SpeechInterfaceProps) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [messages, setMessages] = useState<ConversationMessage[]>([]);
  const [currentSession, setCurrentSession] = useState<string | null>(null);
  const [sessions, setSessions] = useState<TherapySession[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [manualInput, setManualInput] = useState('');

  const recognitionRef = useRef<any>(null);
  const synthRef = useRef<any>(null);

  // Initialize speech recognition
  useEffect(() => {
    if (typeof window !== 'undefined' && 'webkitSpeechRecognition' in window) {
      recognitionRef.current = new (window as any).webkitSpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      
      recognitionRef.current.onresult = (event: any) => {
        let finalTranscript = '';
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          }
        }
        
        if (finalTranscript) {
          setTranscript(finalTranscript);
          handleSendMessage(finalTranscript);
        }
      };
      
      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setError(`Speech recognition error: ${event.error}`);
        setIsListening(false);
        onListeningChange(false);
      };
      
      recognitionRef.current.onend = () => {
        setIsListening(false);
        onListeningChange(false);
      };
    }

    // Initialize speech synthesis
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      synthRef.current = window.speechSynthesis;
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [onListeningChange]);

  // Create session when character is selected
  useEffect(() => {
    if (selectedCharacter && !currentSession) {
      createTherapySession();
    }
  }, [selectedCharacter]);

  // Load existing sessions
  useEffect(() => {
    loadSessions();
  }, []);

  const loadSessions = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/sessions`);
      if (response.ok) {
        const data = await response.json();
        setSessions(data.sessions);
      }
    } catch (error) {
      console.error('Error loading sessions:', error);
    }
  };

  const createTherapySession = async () => {
    if (!selectedCharacter) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/sessions/new`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          personality: selectedCharacter.id
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setCurrentSession(data.session_id);
        
        // Add greeting as first message
        setMessages([{
          user: '',
          assistant: data.greeting,
          timestamp: new Date().toISOString()
        }]);

        // Speak the greeting
        if (synthRef.current) {
          const utterance = new SpeechSynthesisUtterance(data.greeting);
          utterance.onstart = () => onSpeakingChange(true);
          utterance.onend = () => onSpeakingChange(false);
          synthRef.current.speak(utterance);
        }

        loadSessions(); // Refresh sessions list
      } else {
        setError('Failed to create therapy session');
      }
    } catch (error) {
      setError('Error connecting to therapy server');
      console.error('Error creating session:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async (message: string) => {
    if (!message.trim() || !currentSession || isLoading) return;

    setIsLoading(true);
    setError(null);
    setTranscript('');
    setManualInput('');

    try {
      const response = await fetch(`${API_BASE_URL}/call`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          inputs: {
            session_id: currentSession,
            message: message
          }
        }),
      });

      if (response.ok) {
        const data = await response.json();
        
        // Add user message and AI response
        const newMessage: ConversationMessage = {
          user: message,
          assistant: data.output,
          timestamp: data.metadata.timestamp
        };
        
        setMessages(prev => [...prev, newMessage]);

        // Speak the AI response
        if (synthRef.current) {
          const utterance = new SpeechSynthesisUtterance(data.output);
          utterance.onstart = () => onSpeakingChange(true);
          utterance.onend = () => onSpeakingChange(false);
          synthRef.current.speak(utterance);
        }

        loadSessions(); // Refresh sessions to update message count
      } else {
        setError('Failed to get therapy response');
      }
    } catch (error) {
      setError('Error communicating with therapist');
      console.error('Error sending message:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleListening = () => {
    if (!recognitionRef.current) {
      setError('Speech recognition not supported in this browser');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
      onListeningChange(false);
    } else {
      recognitionRef.current.start();
      setIsListening(true);
      onListeningChange(true);
      setError(null);
    }
  };

  const loadSessionHistory = async (sessionId: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/sessions/${sessionId}/history`);
      if (response.ok) {
        const data = await response.json();
        setMessages(data.conversation_history);
      }
    } catch (error) {
      console.error('Error loading session history:', error);
    }
  };

  const deleteSession = async (sessionId: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/sessions/${sessionId}`, {
        method: 'DELETE'
      });
      if (response.ok) {
        loadSessions();
        if (currentSession === sessionId) {
          setCurrentSession(null);
          setMessages([]);
        }
      }
    } catch (error) {
      console.error('Error deleting session:', error);
    }
  };

  if (!selectedCharacter) {
    return (
      <Paper className="p-8 mt-8 text-center">
        <Typography variant="h6" className="!text-gray-600">
          👆 Please select an AI therapist above to begin your session
        </Typography>
      </Paper>
    );
  }

  return (
    <Box className="mt-8">
      {/* Session Info */}
      <Paper className="p-4 mb-4">
        <Box className="flex items-center justify-between mb-2">
          <Typography variant="h6">
            🎭 Session with {selectedCharacter.name}
          </Typography>
          <Box className="flex gap-2">
            <IconButton onClick={() => setShowHistory(true)} title="View History">
              <HistoryIcon />
            </IconButton>
            {currentSession && (
              <Chip 
                label={`Session: ${currentSession.slice(0, 8)}...`}
                variant="outlined"
                size="small"
              />
            )}
          </Box>
        </Box>
        
        {error && (
          <Alert severity="error" className="mb-4">
            {error}
          </Alert>
        )}
      </Paper>

      {/* Conversation Display */}
      <Paper className="p-4 mb-4 max-h-96 overflow-y-auto">
        {messages.length === 0 && !isLoading ? (
          <Typography variant="body2" className="!text-gray-500 text-center">
            Start the conversation by speaking or typing below...
          </Typography>
        ) : (
          <Box className="space-y-4">
            {messages.map((message, index) => (
              <Box key={index} className="space-y-2">
                {message.user && (
                  <Box className="flex justify-end">
                    <Paper className="p-3 bg-blue-100 max-w-xs">
                      <Typography variant="body2">
                        <strong>You:</strong> {message.user}
                      </Typography>
                    </Paper>
                  </Box>
                )}
                <Box className="flex justify-start">
                  <Paper className="p-3 bg-gray-100 max-w-md">
                    <Typography variant="body2">
                      <strong>{selectedCharacter.name}:</strong> {message.assistant}
                    </Typography>
                  </Paper>
                </Box>
              </Box>
            ))}
            
            {isLoading && (
              <Box className="flex justify-center">
                <CircularProgress size={24} />
                <Typography variant="body2" className="!ml-2">
                  {selectedCharacter.name} is thinking...
                </Typography>
              </Box>
            )}
          </Box>
        )}
      </Paper>

      {/* Input Controls */}
      <Paper className="p-4">
        <Box className="flex gap-2 mb-4">
          <TextField
            fullWidth
            placeholder="Type your message here..."
            value={manualInput}
            onChange={(e) => setManualInput(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage(manualInput);
              }
            }}
            disabled={isLoading}
          />
          <Button
            variant="contained"
            onClick={() => handleSendMessage(manualInput)}
            disabled={!manualInput.trim() || isLoading}
            startIcon={<Send />}
          >
            Send
          </Button>
        </Box>

        <Box className="flex justify-center gap-4">
          <Button
            variant={isListening ? "contained" : "outlined"}
            color={isListening ? "secondary" : "primary"}
            onClick={toggleListening}
            disabled={isLoading}
            startIcon={isListening ? <MicOff /> : <Mic />}
            size="large"
          >
            {isListening ? 'Stop Listening' : 'Start Speaking'}
          </Button>
          
          {transcript && (
            <Typography variant="body2" className="!text-gray-600 !mt-2">
              Transcript: "{transcript}"
            </Typography>
          )}
        </Box>
      </Paper>

      {/* Session History Dialog */}
      <Dialog open={showHistory} onClose={() => setShowHistory(false)} maxWidth="md" fullWidth>
        <DialogTitle>Session History</DialogTitle>
        <DialogContent>
          <List>
            {sessions.map((session) => (
              <ListItem key={session.session_id}>
                <ListItemText
                  primary={`${session.personality_name} - ${session.message_count} messages`}
                  secondary={`Created: ${new Date(session.created_at).toLocaleString()}`}
                />
                <IconButton
                  onClick={() => loadSessionHistory(session.session_id)}
                  title="Load Session"
                >
                  <HistoryIcon />
                </IconButton>
                <IconButton
                  onClick={() => deleteSession(session.session_id)}
                  title="Delete Session"
                  color="error"
                >
                  <DeleteIcon />
                </IconButton>
              </ListItem>
            ))}
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowHistory(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}