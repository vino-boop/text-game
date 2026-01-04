
import React, { useState, useEffect } from 'react';
import { DISTORTION_CHARS } from '../constants';

interface GlitchTextProps {
  text: string;
  vocabulary: number;
  className?: string;
  speed?: number;
}

export const GlitchText: React.FC<GlitchTextProps> = ({ text, vocabulary, className, speed = 50 }) => {
  const [displayText, setDisplayText] = useState(text);

  useEffect(() => {
    const interval = setInterval(() => {
      // Logic for word distortion based on vocabulary
      const lossProbability = Math.max(0, (100 - vocabulary) / 200);
      const chars = text.split('');
      const distorted = chars.map(char => {
        if (char === ' ' || char === '\n') return char;
        if (Math.random() < lossProbability) {
          return DISTORTION_CHARS[Math.floor(Math.random() * DISTORTION_CHARS.length)];
        }
        return char;
      }).join('');
      setDisplayText(distorted);
    }, speed);

    return () => clearInterval(interval);
  }, [text, vocabulary, speed]);

  return <p className={`whitespace-pre-wrap leading-relaxed ${className}`}>{displayText}</p>;
};
