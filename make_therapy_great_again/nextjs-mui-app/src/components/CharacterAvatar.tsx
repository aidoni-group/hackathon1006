'use client';

import { Box, Typography, Paper } from '@mui/material';
import { useState, useEffect, useCallback } from 'react';

export interface Character {
  id: string;
  name: string;
  emoji: string;
  title: string;
  description: string;
  gradient: string;
  borderColor: string;
  // Image URLs for two-part animation
  headImageUrl?: string;    // Upper part of head
  jawImageUrl?: string;     // Lower jaw/mouth part
}

interface CharacterAvatarProps {
  character: Character;
  isSelected: boolean;
  isListening: boolean;
  isSpeaking?: boolean;     // New prop for when AI is responding
  onClick: (character: Character) => void;
}

export default function CharacterAvatar({ 
  character, 
  isSelected, 
  isListening,
  isSpeaking = false,
  onClick 
}: CharacterAvatarProps) {
  const [jawOpen, setJawOpen] = useState(false);

  // Animate jaw movement while speaking
  const animateJaw = useCallback(() => {
    if (!isSpeaking) {
      setJawOpen(false);
      return;
    }

    const animate = () => {
      setJawOpen(prev => !prev);
      
      // Random timing to make it look more natural
      const nextDelay = 100 + Math.random() * 200;
      
      if (isSpeaking) {
        setTimeout(animate, nextDelay);
      }
    };
    
    animate();
  }, [isSpeaking]);

  useEffect(() => {
    animateJaw();
  }, [animateJaw]);

  // Clean up animation when speaking stops
  useEffect(() => {
    if (!isSpeaking) {
      setJawOpen(false);
    }
  }, [isSpeaking]);

  return (
    <Paper 
      className={`!p-6 !cursor-pointer !transition-all !duration-300 !transform hover:!scale-105 hover:!shadow-2xl ${
        isSelected 
          ? '!shadow-2xl !scale-105 !border-4' 
          : '!shadow-lg hover:!shadow-xl'
      }`}
      onClick={() => onClick(character)}
      style={{
        borderColor: isSelected ? character.borderColor : 'transparent',
        background: isSelected ? 'linear-gradient(145deg, #f3f4f6, #ffffff)' : '#ffffff'
      }}
    >
      <Box className="text-center">
        {/* Two-Part Floating Head Animation */}
        <div className="relative mb-4">
          <div className="relative w-32 h-32 mx-auto">
            
            {/* Static Background Circle - No Animation */}
            <div 
              className="absolute inset-0 rounded-full border-4"
              style={{
                background: character.gradient,
                borderColor: character.borderColor,
                boxShadow: '0 15px 30px rgba(0,0,0,0.2), inset 0 2px 4px rgba(255,255,255,0.3)',
              }}
            />

            {/* Character Images Container - This gets the animation */}
            <div 
              className={`absolute inset-0 rounded-full overflow-hidden transition-all duration-300 ${
                isListening && isSelected 
                  ? 'animate-bounce' 
                  : isSelected 
                  ? 'animate-pulse' 
                  : ''
              } ${isSpeaking ? 'animate-pulse' : ''}`}
            >
              
              {/* Upper Head Part - Stays in position */}
              <div className="absolute inset-0">
                {character.headImageUrl ? (
                  <img 
                    src={character.headImageUrl} 
                    alt={`${character.name} head`}
                    className="w-full h-full object-cover object-center"
                    style={{ 
                      clipPath: 'polygon(0% 0%, 100% 0%, 100% 70%, 0% 70%)'  // Show top 70% of image
                    }}
                  />
                ) : (
                  // Placeholder for upper head (emoji positioned in upper area)
                  <div className="absolute top-2 left-1/2 transform -translate-x-1/2 text-4xl">
                    {character.emoji}
                  </div>
                )}
              </div>

              {/* Lower Jaw Part - Moves down when speaking */}
              <div 
                className={`absolute w-full transition-all duration-150 ease-in-out ${
                  jawOpen ? 'transform translate-y-2' : 'transform translate-y-0'
                }`}
                style={{
                  top: '60%',  // Position jaw to connect with head
                  height: '50%'  // Jaw takes up bottom portion
                }}
              >
                {character.jawImageUrl ? (
                  <img 
                    src={character.jawImageUrl} 
                    alt={`${character.name} jaw`}
                    className="w-full h-full object-cover object-top"
                    style={{ 
                      clipPath: 'polygon(0% 20%, 100% 20%, 100% 100%, 0% 100%)'  // Show bottom part as jaw
                    }}
                  />
                ) : (
                  // Placeholder jaw (positioned in lower area)
                  <div 
                    className="absolute bottom-2 left-1/2 transform -translate-x-1/2 w-12 h-6 rounded-full"
                    style={{
                      background: 'linear-gradient(145deg, #dc2626, #991b1b)',
                      transform: `translateX(-50%) ${jawOpen ? 'translateY(4px) scaleY(1.3)' : 'translateY(0px) scaleY(1)'}`
                    }}
                  />
                )}
              </div>
            </div>
            
            {/* Selection Ring */}
            {isSelected && (
              <div 
                className="absolute inset-0 rounded-full border-4 animate-ping opacity-75"
                style={{ borderColor: character.borderColor }}
              />
            )}
            
            {/* Listening Indicator */}
            {isListening && isSelected && (
              <div className="absolute -inset-2 border-4 border-blue-400 rounded-full animate-ping opacity-50" />
            )}

            {/* Speaking Indicator */}
            {isSpeaking && isSelected && (
              <div className="absolute -inset-3 border-4 border-green-400 rounded-full animate-ping opacity-60" />
            )}
          </div>
        </div>

        {/* Character Info */}
        <Typography variant="h6" className="!font-bold !text-gray-800 !mb-1">
          {character.name}
        </Typography>
        <Typography variant="body2" className="!text-gray-600 !mb-2">
          {character.title}
        </Typography>
        <Typography variant="body2" className="!text-gray-500 !text-sm">
          {character.description}
        </Typography>

        {/* Status Badges */}
        <Box className="!mt-3 !flex !flex-col !gap-1">
          {isSelected && (
            <div 
              className="inline-block !px-3 !py-1 !rounded-full !text-white !text-sm !font-bold"
              style={{ backgroundColor: character.borderColor }}
            >
              Selected
            </div>
          )}
          
          {isSpeaking && isSelected && (
            <div className="inline-block !px-3 !py-1 !rounded-full !bg-green-600 !text-white !text-sm !font-bold animate-pulse">
              🗣️ Speaking
            </div>
          )}
          
          {isListening && isSelected && (
            <div className="inline-block !px-3 !py-1 !rounded-full !bg-blue-600 !text-white !text-sm !font-bold animate-pulse">
              🎤 Listening
            </div>
          )}
        </Box>
      </Box>
    </Paper>
  );
} 