import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { BACKEND_URL } from '../config';
import {
  Box,
  Typography,
  Button,
  Modal,
  Paper,
  TextField,
  Tabs,
  Tab,
  Fade,
  IconButton,
  InputAdornment,
  Alert,
  Divider,
  Link
} from '@mui/material';
import {
  Close as CloseIcon,
  Visibility,
  VisibilityOff,
  Email,
  Lock,
  Person,
  PlayArrow
} from '@mui/icons-material';

function TabPanel({ children, value, index, ...other }) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`auth-tabpanel-${index}`}
      aria-labelledby={`auth-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

const LandingPage = ({ onAuthComplete }) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [authTab, setAuthTab] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const videoRefs = useRef([]);
  
  // Floating text animation state
  const [floatingTexts, setFloatingTexts] = useState([]);
  const [nextTextId, setNextTextId] = useState(0);
  
  // Sample reviews for different features
  const sampleReviews = {
    'AI-Powered Detection': [
      { text: "This product changed my life! Absolutely amazing quality and delivery was super fast!", result: "PASS", confidence: 94 },
      { text: "Best purchase ever!! Amazing amazing amazing!!! 5 stars!!!", result: "FAIL", confidence: 89 },
      { text: "Good quality product, delivered as expected. Would recommend to others.", result: "PASS", confidence: 91 }
    ],
    'Pattern Recognition': [
      { text: "Excellent service and product quality. Very satisfied with my purchase.", result: "PASS", confidence: 96 },
      { text: "OMG best thing ever!!! Love love love it so much!!!", result: "FAIL", confidence: 85 },
      { text: "Product works as described. Fair price for the quality received.", result: "PASS", confidence: 93 }
    ],
    'Real-Time Analysis': [
      { text: "Fast shipping, good packaging, product as described in listing.", result: "PASS", confidence: 92 },
      { text: "AMAZING INCREDIBLE FANTASTIC BEST PRODUCT EVER!!!", result: "FAIL", confidence: 87 },
      { text: "Decent product for the price. Some minor issues but overall satisfied.", result: "PASS", confidence: 88 }
    ],
    'Reward System': [
      { text: "Great customer service, quick response to queries. Recommended!", result: "PASS", confidence: 95 },
      { text: "Perfect perfect perfect!!! Everyone should buy this NOW!!!", result: "FAIL", confidence: 90 },
      { text: "Good value for money. Product arrived on time and in good condition.", result: "PASS", confidence: 89 }
    ]
  };
  
  // Your list of 7 videos from the videos folder
  const videoPlaylist = [
    '/videos/4912889-uhd_3840_2160_24fps.mp4',
    '/videos/4962723-uhd_2160_3840_25fps.mp4',
    '/videos/6943539-uhd_4096_2160_25fps.mp4',
    '/videos/7240612-uhd_2160_3840_24fps.mp4',
    '/videos/7277928-uhd_3840_2160_25fps.mp4',
    '/videos/7277930-uhd_2160_3840_25fps.mp4',
    '/videos/7306719-uhd_4096_2160_25fps.mp4'
  ];

  useEffect(() => {
    // Preload the next video for seamless transition
    const nextIndex = (currentVideoIndex + 1) % videoPlaylist.length;
    if (videoRefs.current[nextIndex]) {
      videoRefs.current[nextIndex].load();
    }
  }, [currentVideoIndex, videoPlaylist.length]);

  const handleVideoEnd = () => {
    // Move to next video, loop back to first when reaching the end
    const nextIndex = (currentVideoIndex + 1) % videoPlaylist.length;
    setCurrentVideoIndex(nextIndex);
    
    // Start next video immediately
    if (videoRefs.current[nextIndex]) {
      videoRefs.current[nextIndex].currentTime = 0;
      videoRefs.current[nextIndex].play();
    }
  };

  // Function to create floating text animation
  const createFloatingText = (featureName) => {
    const reviews = sampleReviews[featureName];
    const randomReview = reviews[Math.floor(Math.random() * reviews.length)];
    
    // Generate random position (corners and edges)
    const positions = [
      { top: '10%', left: '10%' },      // Top left
      { top: '10%', right: '10%' },     // Top right
      { bottom: '10%', left: '10%' },   // Bottom left
      { bottom: '10%', right: '10%' },  // Bottom right
      { top: '50%', left: '5%' },       // Middle left
      { top: '50%', right: '5%' },      // Middle right
    ];
    
    const randomPosition = positions[Math.floor(Math.random() * positions.length)];
    
    const newText = {
      id: nextTextId,
      review: randomReview.text,
      result: randomReview.result,
      confidence: randomReview.confidence,
      position: randomPosition,
      featureName: featureName
    };
    
    setFloatingTexts(prev => [...prev, newText]);
    setNextTextId(prev => prev + 1);
    
    // Remove text after animation completes
    setTimeout(() => {
      setFloatingTexts(prev => prev.filter(text => text.id !== newText.id));
    }, 4000);
  };

  const handleInputChange = (field) => (event) => {
    setFormData({ ...formData, [field]: event.target.value });
    if (error) setError('');
  };

  const handleTabChange = (event, newValue) => {
    setAuthTab(newValue);
    setError('');
    setFormData({ username: '', email: '', password: '', confirmPassword: '' });
  };

  const handleSubmit = async (event) => {
  event.preventDefault();
  setLoading(true);
  setError('');

  try {
    let response;

    if (authTab === 0) {
      // === SIGN UP ===
      if (!formData.username || !formData.email || !formData.password || !formData.confirmPassword) {
        throw new Error('Please fill in all fields');
      }
      // if (formData.password !== formData.confirmPassword) {
      //   throw new Error('Passwords do not match');
      // }
      response = await axios.post(`${BACKEND_URL}/api/signup`, {
         username: formData.username,
         email: formData.email,
         password: formData.password,
       });

    } else {
      // === LOG IN ===
      if (!formData.email || !formData.password) {
        throw new Error('Please enter email and password');
      }
      response = await axios.post(`${BACKEND_URL}/api/login`, {
        email: formData.email,
        password: formData.password,
      });
     }

    // // If backend sends a token or message, you can handle it here
    console.log('Server Response:', response.data);

    // Close modal and notify parent (optional)
    setModalOpen(false);
    const userPayload = authTab === 0
      ? response.data
      : (response.data?.user || response.data);
    const authData = {
      ...userPayload,
      username: userPayload?.full_name || formData.username || userPayload?.username,
      email: userPayload?.email || formData.email,
      isSignUp: authTab === 0,
    };
    onAuthComplete?.(authData);

  } catch (err) {
    // Handle backend or network error
    if (err.response && err.response.data && err.response.data.message) {
      setError(err.response.data.message);
    } else {
      setError(err.message || 'An error occurred');
    }
  } finally {
    setLoading(false);
  }
};

  return (
    <Box sx={{ position: 'relative', height: '100vh', overflow: 'hidden' }}>
      {/* Background Video Playlist - Seamless Single Video Experience */}
      {videoPlaylist.map((videoSrc, index) => (
        <video
          key={index}
          ref={(el) => (videoRefs.current[index] = el)}
          autoPlay={index === 0} // Only autoplay the first video initially
          muted
          onEnded={index === currentVideoIndex ? handleVideoEnd : undefined}
          onCanPlayThrough={() => {
            // Ensure smooth playback when video is ready
            if (index === currentVideoIndex && videoRefs.current[index]) {
              videoRefs.current[index].play();
            }
          }}
          preload={
            index === currentVideoIndex || 
            index === (currentVideoIndex + 1) % videoPlaylist.length 
              ? "auto" 
              : "metadata"
          }
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            zIndex: index === currentVideoIndex ? -2 : -3,
            opacity: index === currentVideoIndex ? 1 : 0,
            transition: 'opacity 0.1s ease', // Very fast transition for seamless feel
            display: index === currentVideoIndex ? 'block' : 'none'
          }}
        >
          <source src={videoSrc} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      ))}

      {/* Video Overlay */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundColor: 'rgba(0, 0, 0, 0.4)',
          zIndex: -1
        }}
      />

      {/* Content */}
      <Box
        sx={{
          position: 'relative',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          color: 'white',
          px: 2
        }}
      >
        {/* Logo */}
        <Fade in timeout={1000}>
          <Box sx={{ mb: 4 }}>
            <Typography
              variant="h1"
              sx={{
                fontSize: { xs: '3rem', md: '5rem' },
                fontWeight: 'bold',
                mb: 2,
                background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                textShadow: '0 0 30px rgba(33, 150, 243, 0.3)'
              }}
            >
              TrustLens
            </Typography>
            <Typography
              variant="h5"
              sx={{
                opacity: 0.9,
                fontWeight: 300,
                maxWidth: 600,
                mx: 'auto'
              }}
            >
              Revolutionizing Trust in Digital Reviews with AI & Blockchain
            </Typography>
          </Box>
        </Fade>

        {/* Call to Action Button */}
        <Fade in timeout={1500}>
          <Button
            variant="contained"
            size="large"
            onClick={() => setModalOpen(true)}
            startIcon={<PlayArrow />}
            sx={{
              py: 2,
              px: 4,
              fontSize: '1.2rem',
              fontWeight: 'bold',
              borderRadius: 3,
              background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
              boxShadow: '0 8px 32px rgba(33, 150, 243, 0.3)',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: '0 12px 40px rgba(33, 150, 243, 0.4)',
              },
              transition: 'all 0.3s ease'
            }}
          >
            Let's Get Started
          </Button>
        </Fade>

        {/* Features */}
        <Fade in timeout={2000}>
          <Box
            sx={{
              mt: 6,
              display: 'flex',
              gap: 4,
              flexWrap: 'wrap',
              justifyContent: 'center',
              maxWidth: 800
            }}
          >
            {[
              'AI-Powered Detection',
              'Pattern Recognition',
              'Real-Time Analysis',
              'Reward System'
            ].map((feature, index) => (
              <motion.div
                key={feature}
                whileHover={{ 
                  scale: 1.05,
                  boxShadow: '0 8px 32px rgba(33, 150, 243, 0.4)'
                }}
                whileTap={{ scale: 0.95 }}
                onHoverStart={() => createFloatingText(feature)}
                onClick={() => createFloatingText(feature)}
              >
                <Box
                  sx={{
                    px: 3,
                    py: 1,
                    borderRadius: 2,
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      backgroundColor: 'rgba(33, 150, 243, 0.2)',
                      borderColor: 'rgba(33, 150, 243, 0.5)',
                    }
                  }}
                >
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>{feature}</Typography>
                </Box>
              </motion.div>
            ))}
          </Box>
        </Fade>
      </Box>

      {/* Authentication Modal */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        closeAfterTransition
      >
        <Fade in={modalOpen}>
          <Box
            sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: { xs: '90%', sm: 400 },
              maxHeight: '90vh',
              overflow: 'auto'
            }}
          >
            <Paper
              elevation={24}
              sx={{
                p: 4,
                borderRadius: 3,
                background: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255, 255, 255, 0.3)'
              }}
            >
              {/* Close Button */}
              <IconButton
                onClick={() => setModalOpen(false)}
                sx={{
                  position: 'absolute',
                  right: 8,
                  top: 8
                }}
              >
                <CloseIcon />
              </IconButton>

              {/* Modal Header */}
              <Box sx={{ textAlign: 'center', mb: 3 }}>
                <Typography
                  variant="h4"
                  sx={{
                    fontWeight: 'bold',
                    background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent'
                  }}
                >
                  TrustLens
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  Join the future of trusted reviews
                </Typography>
              </Box>

              {/* Auth Tabs */}
              <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                <Tabs value={authTab} onChange={handleTabChange} centered>
                  <Tab label="Sign Up" />
                  <Tab label="Log In" />
                </Tabs>
              </Box>

              {/* Error Alert */}
              {error && (
                <Alert severity="error" sx={{ mt: 2 }}>
                  {error}
                </Alert>
              )}

              {/* Sign Up Form */}
              <TabPanel value={authTab} index={0}>
                <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
                  <TextField
                    fullWidth
                    label="Username"
                    value={formData.username}
                    onChange={handleInputChange('username')}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Person />
                        </InputAdornment>
                      )
                    }}
                    sx={{ mb: 2 }}
                    required
                  />
                  <TextField
                    fullWidth
                    label="Email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange('email')}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Email />
                        </InputAdornment>
                      )
                    }}
                    sx={{ mb: 2 }}
                    required
                  />
                  <TextField
                    fullWidth
                    label="Password"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={handleInputChange('password')}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Lock />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={() => setShowPassword(!showPassword)}
                            edge="end"
                          >
                            {showPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      )
                    }}
                    sx={{ mb: 2 }}
                    required
                  />
                  <TextField
                    fullWidth
                    label="Confirm Password"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={formData.confirmPassword}
                    onChange={handleInputChange('confirmPassword')}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Lock />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            edge="end"
                          >
                            {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      )
                    }}
                    sx={{ mb: 3 }}
                    required
                    error={formData.password && formData.confirmPassword && formData.password !== formData.confirmPassword}
                    helperText={
                      formData.password && formData.confirmPassword && formData.password !== formData.confirmPassword
                        ? 'Passwords do not match'
                        : ''
                    }
                  />
                  <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    size="large"
                    disabled={loading}
                    sx={{
                      py: 1.5,
                      background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
                      fontWeight: 'bold'
                    }}
                  >
                    {loading ? 'Creating Account...' : 'Sign Up'}
                  </Button>
                </Box>
              </TabPanel>

              {/* Log In Form */}
              <TabPanel value={authTab} index={1}>
                <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
                  <TextField
                    fullWidth
                    label="Email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange('email')}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Email />
                        </InputAdornment>
                      )
                    }}
                    sx={{ mb: 2 }}
                    required
                  />
                  <TextField
                    fullWidth
                    label="Password"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={handleInputChange('password')}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Lock />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={() => setShowPassword(!showPassword)}
                            edge="end"
                          >
                            {showPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      )
                    }}
                    sx={{ mb: 2 }}
                    required
                  />
                  <Box sx={{ textAlign: 'right', mb: 3 }}>
                    <Link href="#" variant="body2">
                      Forgot password?
                    </Link>
                  </Box>
                  <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    size="large"
                    disabled={loading}
                    sx={{
                      py: 1.5,
                      background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
                      fontWeight: 'bold'
                    }}
                  >
                    {loading ? 'Signing In...' : 'Log In'}
                  </Button>
                </Box>
                
                <Divider sx={{ my: 3 }}>
                  <Typography variant="body2" color="text.secondary">
                    OR
                  </Typography>
                </Divider>
                
                <Typography variant="body2" textAlign="center" color="text.secondary">
                  Don't have an account?{' '}
                  <Link
                    component="button"
                    type="button"
                    onClick={() => setAuthTab(0)}
                    sx={{ textDecoration: 'none' }}
                  >
                    Sign up here
                  </Link>
                </Typography>
              </TabPanel>
            </Paper>
          </Box>
        </Fade>
      </Modal>

      {/* Floating Text Animations */}
      <AnimatePresence>
        {floatingTexts.map((textData) => (
          <motion.div
            key={textData.id}
            initial={{ 
              opacity: 0, 
              scale: 0.5,
              y: 50
            }}
            animate={{ 
              opacity: 1, 
              scale: 1,
              y: 0,
              x: [0, 20, -20, 0], // Floating movement
            }}
            exit={{ 
              opacity: 0, 
              scale: 0.5,
              y: -50 
            }}
            transition={{ 
              duration: 0.8,
              x: { 
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut"
              }
            }}
            style={{
              position: 'fixed',
              zIndex: 1000,
              maxWidth: '300px',
              ...textData.position
            }}
          >
            <Box
              sx={{
                p: 2,
                borderRadius: 3,
                background: textData.result === 'PASS' 
                  ? 'linear-gradient(135deg, rgba(76, 175, 80, 0.9) 0%, rgba(139, 195, 74, 0.9) 100%)'
                  : 'linear-gradient(135deg, rgba(244, 67, 54, 0.9) 0%, rgba(233, 30, 99, 0.9) 100%)',
                backdropFilter: 'blur(20px)',
                border: `2px solid ${textData.result === 'PASS' ? 'rgba(76, 175, 80, 0.3)' : 'rgba(244, 67, 54, 0.3)'}`,
                boxShadow: textData.result === 'PASS' 
                  ? '0 8px 32px rgba(76, 175, 80, 0.3)'
                  : '0 8px 32px rgba(244, 67, 54, 0.3)',
                color: 'white',
                maxWidth: 300
              }}
            >
              <Typography 
                variant="caption" 
                sx={{ 
                  fontWeight: 'bold',
                  color: 'rgba(255, 255, 255, 0.8)',
                  textTransform: 'uppercase',
                  letterSpacing: 1
                }}
              >
                {textData.featureName}
              </Typography>
              
              <Typography 
                variant="body2" 
                sx={{ 
                  fontStyle: 'italic',
                  mb: 1,
                  fontSize: '0.9rem',
                  lineHeight: 1.4
                }}
              >
                "{textData.review}"
              </Typography>
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography 
                  variant="h6" 
                  sx={{ 
                    fontWeight: 'bold',
                    fontSize: '1.1rem'
                  }}
                >
                  {textData.result}
                </Typography>
                <Typography 
                  variant="caption" 
                  sx={{ 
                    opacity: 0.9,
                    fontSize: '0.8rem'
                  }}
                >
                  {textData.confidence}% confidence
                </Typography>
              </Box>
            </Box>
          </motion.div>
        ))}
      </AnimatePresence>
    </Box>
  );
};

export default LandingPage;