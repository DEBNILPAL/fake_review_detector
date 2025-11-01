// import React, { useState } from 'react';
// import { Box, Button, TextField, Typography, Alert, Paper, Fade, Zoom, Rating, CircularProgress } from '@mui/material';
// import axios from 'axios';
// import { BACKEND_URL } from '../config';

// export default function ReviewForm({ user, productId, onSubmitted }) {

// export default function ReviewForm({ account, productId, backendUrl, onSubmitted }) {
//   const [rating, setRating] = useState(0);
//   const [text, setText] = useState('');
//   const [loading, setLoading] = useState(false);
//   const [message, setMessage] = useState(null);

//   const submit = async (e) => {
//     e.preventDefault();
//     setMessage(null);
//     if (!user || (!user.id && !user.user_id && !user.email)) {
//       setMessage({ type: 'error', text: 'Please sign in before submitting a review.' });

//     if (!account) {
//       setMessage({ type: 'error', text: 'Please connect your wallet first.' });
//       return;
//     }
//     if (!rating || !text.trim()) {
//       setMessage({ type: 'error', text: 'Please provide a rating and review text.' });
//       return;
//     }
//     if (text.trim().length < 10) {
//       setMessage({ type: 'error', text: 'Review text must be at least 10 characters long.' });
//       return;
//     }

//     setLoading(true);
//     try {
//       const response = await axios.post(`${BACKEND_URL}/submit_review`, {
//         userId: user.id || user.user_id || 0,
//         client_name: user.username || user.full_name || 'User',
//       const response = await axios.post(`http://localhost:3000/submit_review`, {
//         reviewerAddress: account,
// >>>>>>> a9f3c52d62454249b6b13ca2d40a9b7478943282
//         productId,
//         rating,
//         reviewText: text.trim(),
//       }, {
//         timeout: 10000,
//         headers: {
//           'Content-Type': 'application/json',
//         },
//       });

//       setMessage({ type: 'success', text: '✅ Review submitted successfully!' });
// <<<<<<< HEAD
//       try {
//         await axios.post(`${BACKEND_URL}/api/analytics`, {
//           full_name: user.username || user.full_name || 'User',
//           email: user.email || `user${(user.id||'')}@example.com`,
//           review: text.trim(),
//           rating,
//           productId,
//           reviewerId: String(user.id || 'user-1'),
//         });
//       } catch (e) {
//         // non-blocking; keep quiet in UI
//       }
//       setText('');
//       setRating(0);
//       onSubmitted && onSubmitted();
//       try { window.dispatchEvent(new Event('reviews:updated')); } catch {}
// =======
//       setText('');
//       setRating(0);
//       onSubmitted && onSubmitted();
// >>>>>>> a9f3c52d62454249b6b13ca2d40a9b7478943282
//     } catch (err) {
//       console.error('Review submission error:', err);
//       let errorMessage = 'Failed to submit review. Please try again.';

//       if (err.code === 'NETWORK_ERROR' || err.code === 'ERR_NETWORK') {
// <<<<<<< HEAD
//         errorMessage = 'Cannot connect to backend server. Make sure it is running.';
// =======
//         errorMessage = 'Cannot connect to backend server. Make sure it is running on port 8000.';
// >>>>>>> a9f3c52d62454249b6b13ca2d40a9b7478943282
//       } else if (err.response) {
//         errorMessage = err.response.data?.detail || err.response.data?.message || `Server error: ${err.response.status}`;
//       } else if (err.request) {
//         errorMessage = 'No response from server. Please check if the backend is running.';
//       }

//       setMessage({ type: 'error', text: errorMessage });
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <Fade in timeout={1000}>
//       <Paper 
//         component="form" 
//         onSubmit={submit} 
//         elevation={0} 
//         sx={{ 
//           p: 4, 
//           background: 'transparent',
//           backdropFilter: 'none',
//           borderRadius: '20px',
//           border: '1px solid rgba(148, 163, 184, 0.2)',
//           position: 'relative',
//           overflow: 'hidden',
//           '&::before': {
//             content: '""',
//             position: 'absolute',
//             top: 0,
//             left: 0,
//             right: 0,
//             height: '4px',
//             background: 'linear-gradient(90deg, #06b6d4 0%, #0891b2 100%)'
//           },
//           '&::after': {
//             content: '""',
//             position: 'absolute',
//             bottom: 0,
//             left: 0,
//             right: 0,
//             height: '2px',
//             background: 'linear-gradient(90deg, rgba(6, 182, 212, 0.25) 0%, rgba(8, 145, 178, 0.25) 100%)'
//           }
//         }}
//       >
//         <Typography 
//           variant="h5" 
//           gutterBottom 
//           sx={{ 
//             fontWeight: 'bold', 
//             background: 'linear-gradient(45deg, #06b6d4 30%, #0891b2 90%)',
//             WebkitBackgroundClip: 'text',
//             WebkitTextFillColor: 'transparent',
//             mb: 3
//           }}
//         >
//           ✍️ Submit a Review
//         </Typography>

//         <Zoom in timeout={1200}>
//           <Box sx={{ mb: 3 }}>
//             <Typography variant="body2" sx={{ mb: 2, fontWeight: 'bold', color: 'rgba(226,232,240,0.8)' }}>
//               Rate this product:
//             </Typography>
//             <Rating
//               name="rating"
//               value={rating}
//               onChange={(_, v) => setRating(v || 0)}
//               disabled={loading}
//               size="large"
//               sx={{
//                 fontSize: '2.5rem',
//                 '& .MuiRating-iconFilled': {
//                   color: '#ffb400'
//                 },
//                 '& .MuiRating-iconHover': {
//                   color: '#ff9800'
//                 }
//               }}
//             />
//           </Box>
//         </Zoom>

//         <Fade in timeout={1400}>
//           <TextField
//             label="Your review"
//             multiline
//             minRows={4}
//             maxRows={6}
//             value={text}
//             onChange={(e) => setText(e.target.value)}
//             placeholder="Share your thoughts about this product..."
//             disabled={loading}
//             helperText={`${text.length} characters (minimum 10 required)`}
//             sx={{
//               mb: 3,
//               '& .MuiOutlinedInput-root': {
//                 borderRadius: '12px',
//                 backgroundColor: 'transparent',
//                 '&.Mui-focused': {
//                   backgroundColor: 'transparent',
//                   boxShadow: '0 0 0 2px rgba(6, 182, 212, 0.25)'
//                 }
//               },
//               '& .MuiInputBase-input': {
//                 color: 'rgba(241,245,249,0.92)'
//               },
//               '& .MuiFormHelperText-root': {
//                 color: 'rgba(226,232,240,0.8)'
//               }
//             }}
//             fullWidth
//           />
//         </Fade>

//         <Zoom in timeout={1600}>
//           <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, alignItems: 'flex-start' }}>
//             <Button
//               type="submit"
//               variant="contained"
// <<<<<<< HEAD
//               disabled={loading || !rating || !text.trim()}
// =======
//               disabled={!account || loading || !rating || !text.trim()}
// >>>>>>> a9f3c52d62454249b6b13ca2d40a9b7478943282
//               sx={{
//                 background: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)',
//                 color: '#0b1220',
//                 '&:hover': {
//                   background: 'linear-gradient(135deg, #0891b2 0%, #0e7490 100%)',
//                   transform: 'translateY(-1px)',
//                   boxShadow: '0 8px 20px rgba(6, 182, 212, 0.25)',
//                 },
//                 '&:active': {
//                   transform: 'translateY(0px)',
//                   boxShadow: '0 4px 10px rgba(6, 182, 212, 0.35)',
//                 },
//                 '&:disabled': {
//                   background: 'linear-gradient(135deg, rgba(148,163,184,0.25) 0%, rgba(100,116,139,0.25) 100%)',
//                   color: 'rgba(148,163,184,0.7)',
//                 },
//                 transition: 'all 0.25s ease',
//                 minWidth: '160px',
//                 height: '44px',
//                 borderRadius: '10px',
//                 fontWeight: 700,
//                 textTransform: 'none',
//                 fontSize: '16px',
//               }}
//               startIcon={loading ? <CircularProgress size={18} color="inherit" /> : undefined}
//             >
//               {loading ? 'Submitting…' : 'Submit Review'}
//             </Button>

//             {message && (
//               <Fade in>
//                 <Box aria-live="polite">
//                   {message.type === 'success' ? (
//                     <Typography variant="body2" sx={{ color: '#06b6d4', fontWeight: 600 }}>
//                       {message.text}
//                     </Typography>
//                   ) : (
//                     <Alert severity="error" variant="standard" sx={{ p: 1, borderRadius: '8px' }}>
//                       <Typography variant="body2">{message.text}</Typography>
//                     </Alert>
//                   )}
//                 </Box>
//               </Fade>
//             )}
//           </Box>
//         </Zoom>
//       </Paper>
//     </Fade>
//   );
// }


import React, { useState } from 'react';
import { Box, Button, TextField, Typography, Alert, Paper, Fade, Zoom, Rating, CircularProgress } from '@mui/material';
import axios from 'axios';
import { BACKEND_URL } from '../config';

export default function ReviewForm({ user, productId, onSubmitted }) {
  const [rating, setRating] = useState(0);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const submit = async (e) => {
    e.preventDefault();
    setMessage(null);

    if (!user || (!user.id && !user.user_id && !user.email)) {
      setMessage({ type: 'error', text: 'Please sign in before submitting a review.' });
      return;
    }
    if (!rating || !text.trim()) {
      setMessage({ type: 'error', text: 'Please provide a rating and review text.' });
      return;
    }
    if (text.trim().length < 10) {
      setMessage({ type: 'error', text: 'Review text must be at least 10 characters long.' });
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(`${BACKEND_URL}/submit_review`, {
        userId: user.id || user.user_id || 0,
        client_name: user.username || user.full_name || 'User',
        productId,
        rating,
        reviewText: text.trim(),
      }, {
        timeout: 10000,
        headers: { 'Content-Type': 'application/json' },
      });

      setMessage({ type: 'success', text: '✅ Review submitted successfully!' });

      try {
        await axios.post(`${BACKEND_URL}/api/analytics`, {
          full_name: user.username || user.full_name || 'User',
          email: user.email || `user${(user.id||'')}@example.com`,
          review: text.trim(),
          rating,
          productId,
          reviewerId: String(user.id || 'user-1'),
        });
      } catch (e) { /* optional analytics, ignore errors */ }

      setText('');
      setRating(0);
      onSubmitted && onSubmitted();
      try { window.dispatchEvent(new Event('reviews:updated')); } catch {}
    } catch (err) {
      console.error('Review submission error:', err);
      let errorMessage = 'Failed to submit review. Please try again.';

      if (err.code === 'NETWORK_ERROR' || err.code === 'ERR_NETWORK') {
        errorMessage = 'Cannot connect to backend server. Make sure it is running.';
      } else if (err.response) {
        errorMessage = err.response.data?.detail || err.response.data?.message || `Server error: ${err.response.status}`;
      } else if (err.request) {
        errorMessage = 'No response from server. Please check if the backend is running.';
      }

      setMessage({ type: 'error', text: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Fade in timeout={1000}>
      <Paper
        component="form"
        onSubmit={submit}
        elevation={0}
        sx={{
          p: 4,
          background: 'transparent',
          backdropFilter: 'none',
          borderRadius: '20px',
          border: '1px solid rgba(148, 163, 184, 0.2)',
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '4px',
            background: 'linear-gradient(90deg, #06b6d4 0%, #0891b2 100%)'
          },
          '&::after': {
            content: '""',
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: '2px',
            background: 'linear-gradient(90deg, rgba(6, 182, 212, 0.25) 0%, rgba(8, 145, 178, 0.25) 100%)'
          }
        }}
      >
        <Typography variant="h5" gutterBottom sx={{
          fontWeight: 'bold',
          background: 'linear-gradient(45deg, #06b6d4 30%, #0891b2 90%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          mb: 3
        }}>
          ✍️ Submit a Review
        </Typography>

        <Zoom in timeout={1200}>
          <Box sx={{ mb: 3 }}>
            <Typography variant="body2" sx={{ mb: 2, fontWeight: 'bold', color: 'rgba(226,232,240,0.8)' }}>
              Rate this product:
            </Typography>
            <Rating
              name="rating"
              value={rating}
              onChange={(_, v) => setRating(v || 0)}
              disabled={loading}
              size="large"
              sx={{
                fontSize: '2.5rem',
                '& .MuiRating-iconFilled': { color: '#ffb400' },
                '& .MuiRating-iconHover': { color: '#ff9800' }
              }}
            />
          </Box>
        </Zoom>

        <Fade in timeout={1400}>
          <TextField
            label="Your review"
            multiline
            minRows={4}
            maxRows={6}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Share your thoughts about this product..."
            disabled={loading}
            helperText={`${text.length} characters (minimum 10 required)`}
            sx={{
              mb: 3,
              '& .MuiOutlinedInput-root': {
                borderRadius: '12px',
                backgroundColor: 'transparent',
                '&.Mui-focused': {
                  backgroundColor: 'transparent',
                  boxShadow: '0 0 0 2px rgba(6, 182, 212, 0.25)'
                }
              },
              '& .MuiInputBase-input': { color: 'rgba(241,245,249,0.92)' },
              '& .MuiFormHelperText-root': { color: 'rgba(226,232,240,0.8)' }
            }}
            fullWidth
          />
        </Fade>

        <Zoom in timeout={1600}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, alignItems: 'flex-start' }}>
            <Button
              type="submit"
              variant="contained"
              disabled={loading || !rating || !text.trim()}
              sx={{
                background: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)',
                color: '#0b1220',
                '&:hover': {
                  background: 'linear-gradient(135deg, #0891b2 0%, #0e7490 100%)',
                  transform: 'translateY(-1px)',
                  boxShadow: '0 8px 20px rgba(6, 182, 212, 0.25)',
                },
                '&:active': {
                  transform: 'translateY(0px)',
                  boxShadow: '0 4px 10px rgba(6, 182, 212, 0.35)',
                },
                '&:disabled': {
                  background: 'linear-gradient(135deg, rgba(148,163,184,0.25) 0%, rgba(100,116,139,0.25) 100%)',
                  color: 'rgba(148,163,184,0.7)',
                },
                transition: 'all 0.25s ease',
                minWidth: '160px',
                height: '44px',
                borderRadius: '10px',
                fontWeight: 700,
                textTransform: 'none',
                fontSize: '16px',
              }}
              startIcon={loading ? <CircularProgress size={18} color="inherit" /> : undefined}
            >
              {loading ? 'Submitting…' : 'Submit Review'}
            </Button>

            {message && (
              <Fade in>
                <Box aria-live="polite">
                  {message.type === 'success' ? (
                    <Typography variant="body2" sx={{ color: '#06b6d4', fontWeight: 600 }}>
                      {message.text}
                    </Typography>
                  ) : (
                    <Alert severity="error" variant="standard" sx={{ p: 1, borderRadius: '8px' }}>
                      <Typography variant="body2">{message.text}</Typography>
                    </Alert>
                  )}
                </Box>
              </Fade>
            )}
          </Box>
        </Zoom>
      </Paper>
    </Fade>
  );
}
