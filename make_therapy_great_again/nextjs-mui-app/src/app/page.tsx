'use client';

import React, { useState, useRef } from 'react';
import SpeechInterface, { SpeechInterfaceRef } from '../components/SpeechInterface';
import { Character } from '../components/CharacterAvatar';

const TRUMP_CHARACTER: Character = {
  id: 'trump',
  name: 'Donald Trump',
  emoji: '🇺🇸',
  title: 'The 45th President',
  description: 'Making Mental Health Great Again',
  gradient: 'linear-gradient(145deg, #ff6b35, #f7931e)',
  borderColor: '#ff6b35'
};

export default function TherapyAIApp() {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const speechInterfaceRef = useRef<SpeechInterfaceRef>(null);

  const handleListeningClick = () => {
    if (speechInterfaceRef.current) {
      speechInterfaceRef.current.toggleListening();
    }
  };

  const handleDebugMessage = () => {
    if (speechInterfaceRef.current) {
      speechInterfaceRef.current.sendDebugMessage("Hello Trump, I'm feeling stressed about work today. What advice do you have for me?");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-600 via-blue-600 to-red-800 flex flex-col items-center justify-center p-8">
      
      {/* Simple Title */}
      <h1 className="text-6xl font-black text-white mb-8 text-center"
          style={{ 
            fontFamily: 'Impact, Arial Black, sans-serif',
            textShadow: '3px 3px 0px #000, -3px -3px 0px #000, 3px -3px 0px #000, -3px 3px 0px #000'
          }}>
        🇺🇸 TRUMP THERAPY 🇺🇸
      </h1>

      {/* Trump Head */}
      <div className="relative w-96 h-96 mb-8">
        <img 
          src="/images/head1-trump.png" 
          alt="Donald Trump" 
          className={`w-full h-full object-contain transition-opacity duration-200 ${
            isSpeaking ? 'opacity-0' : 'opacity-100'
          }`}
          style={{ filter: 'drop-shadow(0 0 20px rgba(0,0,0,0.5))' }}
        />
        <img 
          src="/images/head2-trump.png" 
          alt="Donald Trump Speaking" 
          className={`absolute inset-0 w-full h-full object-contain transition-opacity duration-200 ${
            isSpeaking ? 'opacity-100' : 'opacity-0'
          }`}
          style={{ filter: 'drop-shadow(0 0 20px rgba(0,0,0,0.5))' }}
        />
      </div>

      {/* Status */}
      {isListening && (
        <div className="bg-red-600 text-white px-8 py-4 rounded-full text-xl font-bold shadow-2xl animate-pulse mb-4"
             style={{ textShadow: '2px 2px 0px #000' }}>
          🎤 LISTENING...
        </div>
      )}
      
      {isSpeaking && (
        <div className="bg-green-600 text-white px-8 py-4 rounded-full text-xl font-bold shadow-2xl animate-pulse mb-4"
             style={{ textShadow: '2px 2px 0px #000' }}>
          🔊 TRUMP IS SPEAKING...
        </div>
      )}

      {/* Simple Buttons */}
      <div className="flex flex-col items-center gap-4">
        <button
          onClick={handleListeningClick}
          className={`
            px-12 py-6 rounded-full text-2xl font-bold transition-all duration-200 shadow-2xl
            ${isListening 
              ? 'bg-red-600 text-white animate-pulse' 
              : 'bg-blue-600 text-white hover:bg-blue-700'
            }
          `}
          style={{
            textShadow: '2px 2px 0px #000',
            border: '4px solid white'
          }}
        >
          {isListening ? '🎤 LISTENING...' : '🎤 TALK TO TRUMP'}
        </button>

        <button
          onClick={handleDebugMessage}
          className="px-6 py-3 rounded-full text-sm font-bold bg-yellow-600 text-white hover:bg-yellow-700 transition-all duration-200 shadow-xl"
          style={{
            textShadow: '1px 1px 0px #000',
            border: '2px solid white'
          }}
        >
          🔧 DEBUG TEST
        </button>
      </div>

      {/* Hidden Speech Interface */}
      <div className="hidden">
        <SpeechInterface
          ref={speechInterfaceRef}
          selectedCharacter={TRUMP_CHARACTER}
          onListeningChange={setIsListening}
          onSpeakingChange={setIsSpeaking}
        />
      </div>
    </div>
  );
}
