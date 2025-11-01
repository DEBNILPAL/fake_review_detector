import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  Grid,
  Paper,
  LinearProgress,
  Divider,
  Avatar,
  Badge,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Alert
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Link as LinkIcon,
  Timeline as TimelineIcon,
  Psychology as PsychologyIcon,
  Security as SecurityIcon
} from '@mui/icons-material';
import axios from 'axios';
import { BACKEND_URL } from '../config';

export default function ReviewDetailPanel({ darkMode }) {
  const [selectedReview, setSelectedReview] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [analysis, setAnalysis] = useState(null);
  const [loadingList, setLoadingList] = useState(true);
  const [loadingAnalysis, setLoadingAnalysis] = useState(false);
  const [error, setError] = useState('');

  const getPrediction = (a) => {
    if (!a) return '';
    return a.prediction || ((Number(a.prob_fake) || 0) > 0.5 ? 'fake' : 'genuine');
  };

  useEffect(() => {
    const fetchReviews = async () => {
      setLoadingList(true);
      try {
        const res = await axios.get(`${BACKEND_URL}/api/reviews`);
        const rows = res.data?.rows || [];
        setReviews(rows);
      } catch (e) {
        setError('Failed to load reviews from backend');
      } finally {
        setLoadingList(false);
      }
    };
    fetchReviews();
    const handler = () => fetchReviews();
    window.addEventListener('reviews:updated', handler);
    return () => window.removeEventListener('reviews:updated', handler);
  }, []);

  // Auto-select newest review and analyze when list loads
  useEffect(() => {
    if (!selectedReview && reviews && reviews.length > 0) {
      const newest = reviews[0];
      setSelectedReview(newest);
      analyzeReview(newest);
    }
  }, [reviews]);

  const analyzeReview = async (rev) => {
    setLoadingAnalysis(true);
    setAnalysis(null);
    try {
      const body = {
        text: rev.review_text,
        rating: rev.rating ?? 0,
        productId: rev.product_id || 'prod-1',
        reviewerId: String(rev.user_id || 'user-1'),
      };
      const res = await axios.post(`${BACKEND_URL}/api/predict`, body);
      setAnalysis(res.data);
    } catch (e) {
      setError('Failed to analyze review with model');
    } finally {
      setLoadingAnalysis(false);
    }
  };

  const getStatusColor = (status) => {
    return status === 'suspicious' ? '#ef4444' : '#10b981';
  };

  const getFraudScoreColor = (score) => {
    if (score >= 70) return '#ef4444';
    if (score >= 40) return '#f59e0b';
    return '#10b981';
  };

  return (
    <Box>
      <Typography
        variant="h4"
        sx={{
          fontWeight: 'bold',
          background: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 50%, #0e7490 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          mb: 3
        }}
      >
        🔍 Review Analysis Panel
      </Typography>

      <Grid container spacing={3}>
        {/* Review List */}
        <Grid item xs={12} md={4}>
          <Card sx={{
            background: darkMode ? 'rgba(6, 182, 212, 0.05)' : 'rgba(6, 182, 212, 0.02)',
            color: darkMode ? '#e5e7eb' : 'inherit',
            borderRadius: '16px',
            border: darkMode ? '1px solid rgba(6, 182, 212, 0.1)' : '1px solid rgba(6, 182, 212, 0.2)',
            height: '600px',
            overflow: 'auto'
          }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom color="#06b6d4">
                Recent Reviews
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {reviews.map((review) => (
                  <Paper
                    key={review.id}
                    sx={{
                      p: 2,
                      cursor: 'pointer',
                      border: selectedReview?.id === review.id ? '2px solid #06b6d4' : '1px solid rgba(6, 182, 212, 0.2)',
                      borderRadius: '12px',
                      backgroundColor: selectedReview?.id === review.id
                        ? (darkMode ? 'rgba(6, 182, 212, 0.1)' : 'rgba(6, 182, 212, 0.05)')
                        : 'transparent',
                      '&:hover': {
                        backgroundColor: darkMode ? 'rgba(6, 182, 212, 0.05)' : 'rgba(6, 182, 212, 0.02)'
                      }
                    }}
                    onClick={() => { setSelectedReview(review); analyzeReview(review); }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <Avatar sx={{ width: 32, height: 32 }}>
                        {review.client_name ? review.client_name[0]?.toUpperCase() : 'U'}
                      </Avatar>
                      <Typography variant="subtitle2" fontWeight="bold" sx={{ color: darkMode ? '#f1f5f9' : 'inherit' }}>
                        {review.client_name || `User #${review.user_id || ''}`}
                      </Typography>
                      {review.rating != null && (
                        <Chip
                          label={`${review.rating}⭐`}
                          size="small"
                          sx={{
                            backgroundColor: 'rgba(6, 182, 212, 0.1)',
                            color: '#06b6d4',
                            fontSize: '0.7rem'
                          }}
                        />
                      )}
                    </Box>
                    <Typography variant="body2" sx={{ mb: 1, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', color: darkMode ? 'rgba(241,245,249,0.9)' : 'inherit' }}>
                      {review.review_text}
                    </Typography>
                    <Typography variant="caption" sx={{ color: darkMode ? 'rgba(241,245,249,0.8)' : 'text.secondary' }}>
                      {review.created_at ? new Date(review.created_at).toLocaleString() : ''}
                    </Typography>
                  </Paper>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Review Detail */}
        <Grid item xs={12} md={8}>
          {selectedReview ? (
            <Card sx={{
              background: darkMode ? 'rgba(6, 182, 212, 0.05)' : 'rgba(6, 182, 212, 0.02)',
              color: darkMode ? '#e5e7eb' : 'inherit',
              borderRadius: '16px',
              border: darkMode ? '1px solid rgba(6, 182, 212, 0.1)' : '1px solid rgba(6, 182, 212, 0.2)'
            }}>
              <CardContent sx={{ p: 4 }}>
                {/* Header */}
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar sx={{ width: 56, height: 56 }}>
                      {selectedReview.client_name ? selectedReview.client_name[0]?.toUpperCase() : 'U'}
                    </Avatar>
                    <Box>
                      <Typography variant="h5" fontWeight="bold">
                        {selectedReview.client_name || `User #${selectedReview.user_id || ''}`}
                      </Typography>
                      <Typography variant="body2" sx={{ color: darkMode ? 'rgba(241,245,249,0.85)' : 'text.secondary' }}>
                        {selectedReview.created_at ? new Date(selectedReview.created_at).toLocaleString() : ''}
                      </Typography>
                    </Box>
                  </Box>
                  {analysis && (
                    <Chip
                      label={getPrediction(analysis).toUpperCase()}
                      sx={{
                        backgroundColor: getPrediction(analysis) === 'fake' ? '#ef4444' : '#10b981',
                        color: 'white',
                        fontWeight: 'bold',
                        fontSize: '0.9rem'
                      }}
                    />
                  )}
                </Box>

                {/* Review Text with Highlighting */}
                <Box sx={{ mb: 4 }}>
                  <Typography variant="h6" gutterBottom color="#06b6d4">
                    📝 Review Content
                  </Typography>
                  <Paper sx={{
                    p: 3,
                    background: darkMode ? 'rgba(15, 23, 42, 0.8)' : 'rgba(248, 250, 252, 0.8)',
                    borderRadius: '12px',
                    border: '1px solid rgba(6, 182, 212, 0.2)'
                  }}>
                    <Typography variant="body1" sx={{ lineHeight: 1.7 }}>
                      {selectedReview.review_text}
                    </Typography>
                  </Paper>
                </Box>

                {/* AI Analysis */}
                <Accordion sx={{
                  background: darkMode ? 'rgba(6, 182, 212, 0.05)' : 'rgba(6, 182, 212, 0.02)',
                  border: '1px solid rgba(6, 182, 212, 0.2)',
                  borderRadius: '12px !important',
                  mb: 3
                }}>
                  <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ color: '#06b6d4' }} />}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <PsychologyIcon sx={{ color: '#06b6d4' }} />
                      <Typography variant="h6" color="#06b6d4">
                        🤖 AI Analysis Report
                      </Typography>
                    </Box>
                  </AccordionSummary>
                  <AccordionDetails>
                    {analysis ? (
                      <Box sx={{ mb: 3 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                          <Typography variant="body1" fontWeight="bold">
                            Fraud Score:
                          </Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="h5" sx={{ color: getFraudScoreColor(Math.round((analysis.prob_fake || 0) * 100)) }}>
                              {Math.round((analysis.prob_fake || 0) * 100)}%
                            </Typography>
                            <LinearProgress
                              variant="determinate"
                              value={Math.round((analysis.prob_fake || 0) * 100)}
                              sx={{
                                width: 100,
                                height: 8,
                                borderRadius: 4,
                                backgroundColor: 'rgba(6, 182, 212, 0.1)',
                                '& .MuiLinearProgress-bar': {
                                  borderRadius: 4,
                                  backgroundColor: getFraudScoreColor(Math.round((analysis.prob_fake || 0) * 100))
                                }
                              }}
                            />
                          </Box>
                        </Box>

                        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 2 }}>
                          {analysis.components?.nn_prob != null && (
                            <Chip label={`NN: ${(analysis.components.nn_prob * 100).toFixed(1)}%`} sx={{ backgroundColor: 'rgba(6, 182, 212, 0.1)', color: '#06b6d4' }} />
                          )}
                          {analysis.components?.gbc_prob != null && (
                            <Chip label={`GBC: ${(analysis.components.gbc_prob * 100).toFixed(1)}%`} sx={{ backgroundColor: 'rgba(6, 182, 212, 0.1)', color: '#06b6d4' }} />
                          )}
                        </Box>

                        <Box>
                          <Typography variant="body2" fontWeight="bold" gutterBottom>
                            Engineered Features:
                          </Typography>
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                            {analysis.features && Object.entries(analysis.features).slice(0, 8).map(([k, v]) => (
                              <Chip key={k} label={`${k}: ${typeof v === 'number' ? Number(v).toFixed(2) : v}`} size="small" sx={{ backgroundColor: 'rgba(6, 182, 212, 0.1)', color: '#06b6d4' }} />
                            ))}
                          </Box>
                        </Box>
                      </Box>
                    ) : (
                      <Typography variant="body2" sx={{ color: darkMode ? 'rgba(241,245,249,0.85)' : 'text.secondary' }}>
                        {loadingAnalysis ? 'Analyzing review...' : 'Select a review to run AI analysis.'}
                      </Typography>
                    )}
                  </AccordionDetails>
                </Accordion>

              </CardContent>
            </Card>
          ) : (
            <Box sx={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              height: 400,
              background: darkMode ? 'rgba(6, 182, 212, 0.05)' : 'rgba(6, 182, 212, 0.02)',
              borderRadius: '16px',
              border: '2px dashed rgba(6, 182, 212, 0.3)'
            }}>
              <Box sx={{ textAlign: 'center' }}>
                <PsychologyIcon sx={{ fontSize: 64, color: '#06b6d4', mb: 2 }} />
                <Typography variant="h6" color="#06b6d4" gutterBottom>
                  Select a Review to Analyze
                </Typography>
                <Typography variant="body2" sx={{ color: darkMode ? 'rgba(241,245,249,0.85)' : 'text.secondary' }}>
                  Choose a review from the list to see detailed AI analysis
                </Typography>
              </Box>
            </Box>
          )}
        </Grid>
      </Grid>
    </Box>
  );
}
