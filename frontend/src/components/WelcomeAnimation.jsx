import React, { useState, useEffect } from 'react';
import { Box, Typography } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import SearchIcon from '@mui/icons-material/Search';

const WelcomeAnimation = ({ username, onComplete, darkMode }) => {
  const [stage, setStage] = useState('searching'); // searching -> welcome -> zooming -> done

  useEffect(() => {
    // Stage 1: Searching animation (2 seconds)
    const timer1 = setTimeout(() => {
      setStage('welcome');
    }, 2000);

    // Stage 2: Show welcome message (2 seconds)
    const timer2 = setTimeout(() => {
      setStage('zooming');
    }, 4000);

    // Stage 3: Zoom out and fade (1 second)
    const timer3 = setTimeout(() => {
      setStage('done');
      onComplete();
    }, 5000);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, [onComplete]);

  return (
    <AnimatePresence>
      {stage !== 'done' && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: darkMode 
              ? 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)'
              : 'linear-gradient(135deg, #e0f2fe 0%, #bae6fd 100%)',
          }}
        >
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 3,
            }}
          >
            {/* Magnifying Glass Animation */}
            <motion.div
              animate={{
                scale: stage === 'zooming' ? 8 : stage === 'welcome' ? 1.2 : 1,
                rotate: stage === 'searching' ? [0, 10, -10, 10, -10, 0] : 0,
                x: stage === 'searching' ? [-20, 20, -20, 20, 0] : 0,
                y: stage === 'searching' ? [-10, 10, -10, 10, 0] : 0,
                opacity: stage === 'zooming' ? 0 : 1,
              }}
              transition={{
                scale: { duration: stage === 'zooming' ? 0.6 : 0.3, ease: 'easeInOut' },
                opacity: { duration: stage === 'zooming' ? 0.6 : 0.3 },
                rotate: { duration: 2, repeat: stage === 'searching' ? Infinity : 0 },
                x: { duration: 2, repeat: stage === 'searching' ? Infinity : 0 },
                y: { duration: 2, repeat: stage === 'searching' ? Infinity : 0 },
              }}
            >
              <SearchIcon
                sx={{
                  fontSize: 120,
                  color: darkMode ? '#06b6d4' : '#0891b2',
                  filter: 'drop-shadow(0 0 20px rgba(6, 182, 212, 0.5))',
                }}
              />
            </motion.div>

            {/* Searching Text */}
            {stage === 'searching' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: [0.3, 1, 0.3] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                <Typography
                  variant="h5"
                  sx={{
                    color: darkMode ? '#94a3b8' : '#475569',
                    fontWeight: 500,
                    letterSpacing: 1,
                  }}
                >
                  Searching...
                </Typography>
              </motion.div>
            )}

            {/* Welcome Message */}
            {stage === 'welcome' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
              >
                <Typography
                  variant="h3"
                  sx={{
                    color: darkMode ? '#06b6d4' : '#0891b2',
                    fontWeight: 700,
                    textAlign: 'center',
                    background: darkMode 
                      ? 'linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%)'
                      : 'linear-gradient(135deg, #0891b2 0%, #0369a1 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                    textShadow: darkMode 
                      ? '0 0 30px rgba(6, 182, 212, 0.3)'
                      : '0 0 30px rgba(8, 145, 178, 0.3)',
                  }}
                >
                  Welcome, {username}!
                </Typography>
              </motion.div>
            )}

            {/* Loading dots during zoom */}
            {stage === 'zooming' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                style={{
                  display: 'flex',
                  gap: '8px',
                  marginTop: '20px',
                }}
              >
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    animate={{
                      scale: [1, 1.5, 1],
                      opacity: [0.3, 1, 0.3],
                    }}
                    transition={{
                      duration: 0.6,
                      repeat: Infinity,
                      delay: i * 0.2,
                    }}
                    style={{
                      width: '12px',
                      height: '12px',
                      borderRadius: '50%',
                      backgroundColor: darkMode ? '#06b6d4' : '#0891b2',
                    }}
                  />
                ))}
              </motion.div>
            )}
          </Box>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default WelcomeAnimation;
