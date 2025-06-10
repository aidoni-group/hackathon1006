'use client';

import { useState } from 'react';
import { Box, Typography, Container } from '@mui/material';
import CharacterSelector from '../components/CharacterSelector';
import SpeechInterface from '../components/SpeechInterface';
import { Character } from '../components/CharacterAvatar';

export default function TherapyAIApp() {
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const handleCharacterSelect = (character: Character) => {
    setSelectedCharacter(character);
  };

  const handleListeningChange = (listening: boolean) => {
    setIsListening(listening);
  };

  const handleSpeakingChange = (speaking: boolean) => {
    setIsSpeaking(speaking);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100">
      <Container maxWidth="lg" className="py-8">
        {/* Header */}
        <Box className="text-center mb-12">
          <Typography variant="h1" className="!text-5xl !font-bold !text-gray-800 !mb-4">
            🧠 AI Therapy Sessions
          </Typography>
          <Typography variant="h5" className="!text-gray-600 !mb-2">
            Get personalized guidance from AI versions of iconic personalities
          </Typography>
          <Typography variant="body1" className="!text-gray-500">
            Choose your AI therapist, speak your mind, and receive tailored advice
          </Typography>
        </Box>

        {/* Character Selection */}
        <CharacterSelector
          selectedCharacter={selectedCharacter}
          isListening={isListening}
          isSpeaking={isSpeaking}
          onCharacterSelect={handleCharacterSelect}
        />

        {/* Speech Interface */}
        <SpeechInterface
          selectedCharacter={selectedCharacter}
          onListeningChange={handleListeningChange}
          onSpeakingChange={handleSpeakingChange}
        />

        {/* Footer Info */}
        <Box className="mt-16 text-center">
          <Typography variant="body2" className="!text-gray-500">
            💡 This app uses the Web Speech API and connects to the MCP therapy backend server
          </Typography>
          <Typography variant="body2" className="!text-gray-400 !mt-2">
            Works best in Chrome and Edge browsers • Make sure backend server is running on localhost:3000
          </Typography>
          {selectedCharacter && (
            <Typography variant="body2" className="!text-gray-400 !mt-2">
              🎭 Ready to use <strong>head1-{selectedCharacter.id}.jpg</strong> and <strong>head2-{selectedCharacter.id}.jpg</strong> for realistic jaw animation
            </Typography>
          )}
        </Box>
      </Container>
    </div>
  );
}
