'use client';

import { useState } from 'react';
import { Box, Typography, Container } from '@mui/material';
import SpeechInterface from '../components/SpeechInterface';
import { Character } from '../components/CharacterAvatar';

export default function TherapyAIApp() {
  // Default to Trump character
  const trumpCharacter: Character = {
    id: 'trump',
    name: 'Donald Trump',
    emoji: '🇺🇸',
    title: 'The 45th President',
    description: 'Making Mental Health Great Again',
    gradient: 'linear-gradient(145deg, #ff6b35, #f7931e)',
    borderColor: '#ff6b35'
  };

  const [selectedCharacter] = useState<Character>(trumpCharacter);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const handleListeningChange = (listening: boolean) => {
    setIsListening(listening);
  };

  const handleSpeakingChange = (speaking: boolean) => {
    setIsSpeaking(speaking);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-yellow-100">
      <Container maxWidth="lg" className="py-8">
        {/* Trump Header */}
        <Box className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="w-48 h-48 rounded-full bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center shadow-2xl border-4 border-yellow-400">
                <Typography variant="h1" className="!text-6xl">
                  🇺🇸
                </Typography>
              </div>
              <div className="absolute -bottom-2 -right-2 w-16 h-16 rounded-full bg-blue-600 flex items-center justify-center border-4 border-white shadow-lg">
                <Typography variant="h4" className="!text-white">
                  🧠
                </Typography>
              </div>
            </div>
          </div>
          
          <Typography variant="h1" className="!text-6xl !font-bold !text-orange-600 !mb-4">
            TRUMP THERAPY
          </Typography>
          <Typography variant="h4" className="!text-red-600 !mb-4 !font-bold">
            MAKE YOUR MENTAL HEALTH GREAT AGAIN
          </Typography>
          <Typography variant="h6" className="!text-gray-700 !mb-2">
            The most tremendous therapy you've ever seen, believe me
          </Typography>
          <Typography variant="body1" className="!text-gray-600 !max-w-2xl !mx-auto">
            Get the best advice from the most successful president in history. 
            Nobody knows problems like I know problems, and frankly, nobody solves them better.
          </Typography>
        </Box>

        {/* Speech Interface */}
        <SpeechInterface
          selectedCharacter={selectedCharacter}
          onListeningChange={handleListeningChange}
          onSpeakingChange={handleSpeakingChange}
        />

        {/* Status Indicators */}
        <Box className="fixed bottom-4 right-4 flex gap-2">
          {isListening && (
            <div className="bg-red-500 text-white px-4 py-2 rounded-full shadow-lg animate-pulse">
              🎤 LISTENING
            </div>
          )}
          {isSpeaking && (
            <div className="bg-blue-500 text-white px-4 py-2 rounded-full shadow-lg animate-pulse">
              🔊 SPEAKING
            </div>
          )}
        </Box>

        {/* Footer */}
        <Box className="mt-16 text-center">
          <Typography variant="body2" className="!text-gray-500">
            🇺🇸 Powered by the most beautiful AI technology
          </Typography>
          <Typography variant="body2" className="!text-gray-400 !mt-2">
            Works best in Chrome and Edge browsers • Fish TTS enabled for tremendous audio quality
          </Typography>
        </Box>
      </Container>
    </div>
  );
}
