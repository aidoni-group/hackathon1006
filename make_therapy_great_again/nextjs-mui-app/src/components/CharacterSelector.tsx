'use client';

import { Box, Typography, Grid } from '@mui/material';
import CharacterAvatar, { Character } from './CharacterAvatar';

// Character definitions for the therapy AI
export const CHARACTERS: Character[] = [
  {
    id: 'trump',
    name: 'Donald Trump',
    emoji: '🤴',
    title: 'Former President',
    description: 'Motivational business mindset therapy',
    gradient: 'linear-gradient(145deg, #fbbf24, #f59e0b)',
    borderColor: '#f59e0b',
    // TODO: Add actual image URLs when provided
    headImageUrl: 'images/head1-trump.png', // Will be 'head1-trump.jpg' or similar
    jawImageUrl: 'images/head2-trump.png'   // Will be 'head2-trump.jpg' or similar
  },
  {
    id: 'putin',
    name: 'Vladimir Putin',
    emoji: '🫅',
    title: 'World Leader',
    description: 'Strategic thinking and resilience',
    gradient: 'linear-gradient(145deg, #ef4444, #dc2626)',
    borderColor: '#dc2626',
    headImageUrl: undefined, // Future: head1-putin.jpg
    jawImageUrl: undefined   // Future: head2-putin.jpg
  },
  {
    id: 'tate',
    name: 'Andrew Tate',
    emoji: '💪',
    title: 'Life Coach',
    description: 'Alpha mindset and self-improvement',
    gradient: 'linear-gradient(145deg, #8b5cf6, #7c3aed)',
    borderColor: '#7c3aed',
    headImageUrl: undefined, // Future: head1-tate.jpg
    jawImageUrl: undefined   // Future: head2-tate.jpg
  },
  {
    id: 'greta',
    name: 'Greta Thunberg',
    emoji: '🌱',
    title: 'Climate Activist',
    description: 'Environmental mindfulness therapy',
    gradient: 'linear-gradient(145deg, #10b981, #059669)',
    borderColor: '#059669',
    headImageUrl: undefined, // Future: head1-greta.jpg
    jawImageUrl: undefined   // Future: head2-greta.jpg
  }
];

interface CharacterSelectorProps {
  selectedCharacter: Character | null;
  isListening: boolean;
  isSpeaking?: boolean;  // New prop for speaking state
  onCharacterSelect: (character: Character) => void;
}

export default function CharacterSelector({ 
  selectedCharacter, 
  isListening,
  isSpeaking = false,
  onCharacterSelect 
}: CharacterSelectorProps) {
  return (
    <Box className="mb-8">
      <Typography variant="h4" className="!text-center !font-bold !text-gray-800 !mb-2">
        Choose Your AI Therapist
      </Typography>
      <Typography variant="body1" className="!text-center !text-gray-600 !mb-8">
        Select a character to receive personalized therapy and guidance
      </Typography>

      <Grid container spacing={3} className="max-w-6xl mx-auto">
        {CHARACTERS.map((character) => (
          <Grid key={character.id} size={{ xs: 12, sm: 6, lg: 3 }}>
            <CharacterAvatar
              character={character}
              isSelected={selectedCharacter?.id === character.id}
              isListening={isListening}
              isSpeaking={isSpeaking && selectedCharacter?.id === character.id}
              onClick={onCharacterSelect}
            />
          </Grid>
        ))}
      </Grid>

      {selectedCharacter && (
        <Box className="!mt-6 !text-center">
          <Typography variant="h6" className="!text-gray-700">
            You selected <strong style={{ color: selectedCharacter.borderColor }}>
              {selectedCharacter.name}
            </strong>
          </Typography>
          <Typography variant="body2" className="!text-gray-500 !mt-1">
            {isSpeaking ? 'AI is responding...' : 'Ready to start your therapy session'}
          </Typography>
        </Box>
      )}
    </Box>
  );
} 