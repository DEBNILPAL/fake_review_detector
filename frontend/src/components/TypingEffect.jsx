import React, { useState, useEffect } from 'react';
import { Typography } from '@mui/material';

export default function TypingEffect({ text, variant = "h3", speed = 100, ...props }) {
  const [displayText, setDisplayText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    if (currentIndex < text.length) {
      const timeout = setTimeout(() => {
        setDisplayText(prev => prev + text[currentIndex]);
        setCurrentIndex(prev => prev + 1);
      }, speed);

      return () => clearTimeout(timeout);
    } else {
      setIsComplete(true);
    }
  }, [currentIndex, text, speed]);

  return (
    <Typography
      variant={variant}
      sx={{
        fontWeight: 'bold',
        background: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 50%, #0e7490 100%)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        mb: 1,
        minHeight: variant === 'h3' ? '48px' : '32px', // Prevent layout shift
        ...props.sx
      }}
      {...props}
    >
      {displayText}
      {!isComplete && <span style={{ animation: 'blink 1s infinite' }}>|</span>}
    </Typography>
  );
}
