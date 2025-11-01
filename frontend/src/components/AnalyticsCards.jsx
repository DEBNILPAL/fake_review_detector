import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { BACKEND_URL } from '../config';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  LinearProgress,
  Chip,
  Avatar
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Security as SecurityIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

export default function AnalyticsCards({ darkMode, user }) {
  const [data, setData] = useState({
    total_rows: 0,
    avg_rating: 0,
    avg_review_length: 0,
  });
  const navigate = useNavigate();
  // Keep fixed order for metrics (removed automatic rotation)

  const cardVariants = {
    hidden: (i) => {
      const dir = i % 3;
      if (dir === 0) return { opacity: 0, x: -30 };
      if (dir === 1) return { opacity: 0, x: 30 };
      return { opacity: 0, y: 40 };
    },
    visible: (i) => ({
      opacity: 1,
      x: 0,
      y: 0,
      transition: {
        delay: i * 0.15,
        type: 'spring',
        stiffness: 80,
        damping: 14
      }
    })
  };

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const active = localStorage.getItem('analysisActive') === 'true';
        const email = localStorage.getItem('analysisEmail');
        if (active && email) {
          const res = await axios.get(`${BACKEND_URL}/api/review-analysis`, { params: { email } });
          const rows = res.data?.rows || [];
          if (rows.length > 0) {
            // Derive metrics from per-user analyses
            const total_rows = rows.length;
            const ratings = rows.map(r => Number(r.analysis?.features?.rating || 0));
            const lengths = rows.map(r => Number((r.review || '').length));
            const avg_rating = ratings.length ? (ratings.reduce((a,b)=>a+b,0) / ratings.length) : 0;
            const avg_review_length = lengths.length ? Math.round(lengths.reduce((a,b)=>a+b,0) / lengths.length) : 0;
            setData({ total_rows, avg_rating, avg_review_length });
          } else {
            const resGlobal = await axios.get(`${BACKEND_URL}/api/analytics`);
            if (resGlobal && resGlobal.data) setData(resGlobal.data);
          }
        } else {
          const res = await axios.get(`${BACKEND_URL}/api/analytics`);
          if (res && res.data) setData(res.data);
        }
      } catch (err) {
        console.error('Error fetching analytics data:', err);
      }
    };
    fetchAnalytics();
    const handler = () => fetchAnalytics();
    window.addEventListener('analysis:updated', handler);
    return () => window.removeEventListener('analysis:updated', handler);
  }, []);

  // NOTE: rotation removed to keep dashboard cards static.

  const metrics = [
    {
      title: 'Total Reviews',
      value: data.total_rows?.toLocaleString?.() || String(data.total_rows),
      change: 0,
      icon: <CheckCircleIcon />,
      color: '#10b981',
      bgGradient: 'linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)',
      progress: Math.min((Number(data.total_rows) / 10000) * 100, 100) || 0,
      description: 'Rows in model dataset'
    },
    {
      title: 'Average Rating',
      value: Number(data.avg_rating).toFixed(2),
      change: 0,
      icon: <TrendingUpIcon />,
      color: '#06b6d4',
      bgGradient: 'linear-gradient(135deg, #bfdbfe 0%, #93c5fd 100%)',
      progress: Math.min((Number(data.avg_rating) / 5) * 100, 100) || 0,
      description: 'Mean product rating'
    },
    {
      title: 'Avg Review Length',
      value: Number(data.avg_review_length).toFixed(0),
      change: 0,
      icon: <SecurityIcon />,
      color: '#f59e0b',
      bgGradient: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
      progress: Math.min((Number(data.avg_review_length) / 1000) * 100, 100) || 0,
      description: 'Characters per review'
    }
  ];

  return (
    <Box sx={{ position: 'relative', mb: 4 }}>
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        style={{
          position: 'absolute',
          inset: 0,
          borderRadius: 20,
          background: darkMode
            ? 'radial-gradient(1200px 400px at 20% -10%, rgba(0,191,255,0.12), transparent 60%), radial-gradient(900px 400px at 80% 110%, rgba(6,182,212,0.10), transparent 60%)'
            : 'radial-gradient(1200px 400px at 20% -10%, rgba(0,191,255,0.08), transparent 60%), radial-gradient(900px 400px at 80% 110%, rgba(6,182,212,0.08), transparent 60%)',
          filter: 'blur(0.5px)',
          zIndex: 0
        }}
      />
      <Grid container spacing={3} sx={{ position: 'relative', zIndex: 1 }}>
      {metrics.map((metric, index) => (
        <Grid item xs={12} sm={6} md={4} lg={4} key={metric.title}>
          <motion.div
            layout
            custom={index}
            initial="hidden"
            animate="visible"
            variants={cardVariants}
            whileHover={{
              scale: 1.05,
              boxShadow: '0 0 30px rgba(0,191,255,0.35)'
            }}
            transition={{ duration: 0.8, ease: 'easeInOut' }}
            onClick={() => {
              if (metric.title === 'Fake Review Detection') navigate('/app-demo');
              else if (metric.title === 'Verified Buyers') navigate('/reviews');
              else if (metric.title === 'Moderation Queue') navigate('/graph-explorer');
            }}
            style={{ borderRadius: 16, cursor: 'pointer' }}
          >
          <Card
            sx={{
              background: darkMode ? 'rgba(6, 182, 212, 0.05)' : metric.bgGradient,
              color: darkMode ? '#e5e7eb' : 'inherit',
              borderRadius: '16px',
              border: darkMode ? '1px solid rgba(6, 182, 212, 0.1)' : '1px solid rgba(6, 182, 212, 0.2)'
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Avatar
                  sx={{
                    backgroundColor: metric.color,
                    width: 48,
                    height: 48
                  }}
                >
                  {metric.icon}
                </Avatar>
                <Chip
                  label={`${metric.change > 0 ? '+' : ''}${metric.change}%`}
                  size="small"
                  sx={{
                    backgroundColor: metric.change > 0 ? '#dcfce7' : '#fee2e2',
                    color: metric.change > 0 ? '#166534' : '#991b1b',
                    fontWeight: 'bold'
                  }}
                  icon={metric.change > 0 ? <TrendingUpIcon /> : <TrendingDownIcon />}
                />
              </Box>

              <Typography variant="h4" sx={{ fontWeight: 800, letterSpacing: '0.3px', mb: 1 }}>
                {metric.value}
              </Typography>

              <Typography variant="subtitle1" sx={{ color: '#06b6d4', mb: 1, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.6px' }}>
                {metric.title}
              </Typography>

              <Typography
                variant="body2"
                sx={{ color: darkMode ? 'rgba(241,245,249,0.8)' : 'text.secondary', mb: 2, fontWeight: 500 }}
              >
                {metric.description}
              </Typography>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <LinearProgress
                  variant="determinate"
                  value={metric.progress}
                  sx={{
                    flexGrow: 1,
                    height: 6,
                    borderRadius: 3,
                    backgroundColor: darkMode ? 'rgba(6, 182, 212, 0.1)' : 'rgba(6, 182, 212, 0.2)',
                    '& .MuiLinearProgress-bar': {
                      borderRadius: 3,
                      backgroundColor: metric.color
                    }
                  }}
                />
                <Typography
                  variant="caption"
                  sx={{ minWidth: '35px', textAlign: 'right', color: darkMode ? 'rgba(241,245,249,0.8)' : 'inherit' }}
                >
                  {metric.progress}%
                </Typography>
              </Box>
            </CardContent>
          </Card>
          </motion.div>
        </Grid>
      ))}
      </Grid>
    </Box>
  );
}
