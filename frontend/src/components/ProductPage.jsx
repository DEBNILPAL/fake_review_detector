import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Card, CardContent, Typography, Grid, Box, Divider, Button, Paper, Chip, Zoom, Grow } from '@mui/material';
import axios from 'axios';
import ReviewForm from './ReviewForm';
import CONTRACT_ABI from '../api/ReviewContract.json';
import { BACKEND_URL } from '../config';

const PRODUCT_ID = 'product-101';

export default function ProductPage({ account, user }) {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [displayedReviews, setDisplayedReviews] = useState([]);

  // Load reviews from blockchain and localStorage
  const loadReviews = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${BACKEND_URL}/api/reviews`);
      const rows = res.data?.rows || [];
      const parsed = rows
        .filter(r => r.client_name && r.review_text)
        .map(r => ({
          id: r.id,
          client_name: r.client_name,
          rating: Number(r.rating) || 0,
          reviewText: r.review_text,
          created_at: r.created_at,
          source: 'backend'
        }));
      setReviews(parsed);
    } catch (e) {
      console.error('Failed to load reviews from backend', e);
    } finally {
      setLoading(false);
    }
  }, []);

  // Animate reviews on load
  useEffect(() => {
    if (reviews.length > 0) {
      reviews.forEach((review, index) => {
        setTimeout(() => {
          setDisplayedReviews(prev => [...prev, review]);
        }, index * 200);
      });
    }
  }, [reviews]);

  // Clear review history
  const clearReviews = useCallback(() => {
    setDisplayedReviews([]);
    setReviews([]);
  }, []);

  useEffect(() => {
    loadReviews();
    const id = setInterval(loadReviews, 10000); // Refresh every 10 seconds
    return () => clearInterval(id);
  }, [loadReviews]);

  const getRatingColor = (rating) => {
    if (rating >= 4) return '#4caf50';
    if (rating >= 3) return '#ff9800';
    return '#f44336';
  };

  return (
    <Box>
      <Grow in timeout={1000}>
        <Paper 
          elevation={0} 
          sx={{ 
            p: 4, 
            mb: 4, 
            background: 'transparent',
            backdropFilter: 'none',
            borderRadius: '20px',
            position: 'relative',
            overflow: 'hidden',
            border: '1px solid rgba(148, 163, 184, 0.2)',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '3px',
              background: 'linear-gradient(90deg, #06b6d4 0%, #0891b2 100%)'
            }
          }}
        >
          <Typography 
            variant="h3" 
            gutterBottom 
            sx={{ 
              fontWeight: 'bold', 
              background: 'linear-gradient(45deg, #1976d2 30%, #42a5f5 90%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              mb: 2
            }}
          >
            🛍️ Product 101
          </Typography>
          <Typography 
            variant="body1" 
            sx={{ 
              color: 'rgba(241,245,249,0.9)',
              fontSize: '1.1rem',
              lineHeight: 1.6
            }}
          >
            This is a mock product used to demonstrate our revolutionary fake review detection system powered by advanced AI technology.
          </Typography>
        </Paper>
      </Grow>

      <Divider sx={{ my: 4, borderColor: 'rgba(148, 163, 184, 0.2)' }} />

      <Zoom in timeout={1200}>
        <Box>
          <ReviewForm user={user} productId={PRODUCT_ID} onSubmitted={loadReviews} />
        </Box>
      </Zoom>

      <Box sx={{ mt: 6 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography 
            variant="h4" 
            sx={{ 
              fontWeight: 'bold',
              background: 'linear-gradient(45deg, #1976d2 30%, #42a5f5 90%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}
          >
            📝 Reviews {loading && '(Loading...)'}
          </Typography>
          {reviews.length > 0 && (
            <Button 
              variant="outlined" 
              color="error" 
              onClick={clearReviews}
              sx={{
                borderRadius: '20px',
                textTransform: 'none',
                '&:hover': {
                  transform: 'scale(1.05)',
                  boxShadow: '0 4px 15px rgba(244, 67, 54, 0.3)'
                },
                transition: 'all 0.3s ease'
              }}
            >
              🗑️ Clear History
            </Button>
          )}
        </Box>
        
        <Grid container spacing={3}>
          {reviews.length === 0 && !loading ? (
            <Grid item xs={12}>
              <Grow in timeout={800}>
                <Paper 
                  sx={{ 
                    p: 4, 
                    textAlign: 'center', 
                    background: 'transparent',
                    backdropFilter: 'none',
                    borderRadius: '15px',
                    border: '1px solid rgba(148, 163, 184, 0.2)'
                  }}
                >
                  <Typography variant="h6" sx={{ color: 'rgba(241,245,249,0.9)' }}>
                    📭 No reviews yet. Be the first to submit one!
                  </Typography>
                </Paper>
              </Grow>
            </Grid>
          ) : (
            displayedReviews.map((rev, idx) => (
              <Grid item xs={12} md={6} key={rev.id}>
                <Grow in timeout={800 + (idx * 100)}>
                  <Card 
                    variant="outlined" 
                    sx={{ 
                      height: '100%',
                      borderRadius: '15px',
                      background: 'transparent',
                      backdropFilter: 'none',
                      border: '1px solid rgba(148, 163, 184, 0.2)',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-5px)',
                        boxShadow: '0 15px 35px rgba(6, 182, 212, 0.18)',
                        border: '1px solid rgba(6, 182, 212, 0.35)'
                      }
                    }}
                  >
                    <CardContent sx={{ p: 3 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                        <Chip 
                          label={rev.client_name}
                          sx={{ 
                            backgroundColor: '#1976d2',
                            color: 'white',
                            fontWeight: 'bold'
                          }}
                        />
                        {rev.source === 'backend' && (
                          <Chip 
                            label="🧠 Model Backend" 
                            size="small" 
                            sx={{ 
                              backgroundColor: '#4caf50',
                              color: 'white'
                            }}
                          />
                        )}
                      </Box>
                      
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <Typography variant="body2" sx={{ mr: 1, fontWeight: 'bold' }}>
                          Rating:
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Typography 
                              key={star} 
                              component="span" 
                              sx={{ 
                                color: star <= rev.rating ? getRatingColor(rev.rating) : '#ddd',
                                fontSize: '1.5rem',
                                mr: 0.5
                              }}
                            >
                              ⭐
                            </Typography>
                          ))}
                          <Typography sx={{ ml: 1, fontWeight: 'bold', color: getRatingColor(rev.rating) }}>
                            {rev.rating}/5
                          </Typography>
                        </Box>
                      </Box>
                      
                      <Typography 
                        variant="body1" 
                        sx={{ 
                          mb: 2,
                          lineHeight: 1.6,
                          color: 'rgba(241,245,249,0.92)'
                        }}
                      >
                        {rev.reviewText}
                      </Typography>
                      
                      <Typography 
                        variant="caption" 
                        sx={{ 
                          color: 'rgba(226,232,240,0.8)',
                          fontStyle: 'italic'
                        }}
                      >
                        📅 {rev.created_at ? new Date(rev.created_at).toLocaleString() : ''}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grow>
              </Grid>
            ))
          )}
        </Grid>
      </Box>
    </Box>
  );
}
