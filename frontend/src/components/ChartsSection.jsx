import React, { useState, useEffect } from 'react';
// motion removed to keep all cards same design
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Tabs,
  Tab,
  Paper,
  Chip,
  LinearProgress
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  Timeline as TimelineIcon,
  BubbleChart as BubbleChartIcon,
  Assessment as AssessmentIcon
} from '@mui/icons-material';
import axios from 'axios';
import { BACKEND_URL } from '../config';

export default function ChartsSection({ darkMode, fullView = false }) {
  const [activeTab, setActiveTab] = useState(0);
  const [chartData, setChartData] = useState({
    reviewTrends: [],
    fraudTimeline: [],
    clusterMap: [],
    analytics: null,
  });

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const active = localStorage.getItem('analysisActive') === 'true';
        const email = localStorage.getItem('analysisEmail');
        let analytics = null;
        let reviews = [];
        let analyses = [];
        if (active && email) {
          const [analysisRes] = await Promise.all([
            axios.get(`${BACKEND_URL}/api/review-analysis`, { params: { email } }),
          ]);
          analyses = analysisRes.data?.rows || [];
          // Fallback to global if user has no analyses yet
          if (!analyses || analyses.length === 0) {
            const [analyticsRes, reviewsRes, analysisResAll] = await Promise.all([
              axios.get(`${BACKEND_URL}/api/analytics`),
              axios.get(`${BACKEND_URL}/api/reviews`),
              axios.get(`${BACKEND_URL}/api/review-analysis`),
            ]);
            analytics = analyticsRes.data || null;
            reviews = reviewsRes.data?.rows || [];
            analyses = analysisResAll.data?.rows || [];
          }
        } else {
          const [analyticsRes, reviewsRes, analysisRes] = await Promise.all([
            axios.get(`${BACKEND_URL}/api/analytics`),
            axios.get(`${BACKEND_URL}/api/reviews`),
            axios.get(`${BACKEND_URL}/api/review-analysis`),
          ]);
          analytics = analyticsRes.data || null;
          reviews = reviewsRes.data?.rows || [];
          analyses = analysisRes.data?.rows || [];
        }

        // Build 7-day trend of analysis counts (model-driven)
        const now = new Date();
        const days = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
        const dayCounts = new Array(7).fill(0);
        analyses.forEach(a => {
          const d = a.created_at ? new Date(a.created_at) : null;
          if (!d) return;
          const diff = Math.floor((now - d) / (1000*60*60*24));
          if (diff >= 0 && diff < 7) {
            dayCounts[6 - diff] += 1; // oldest to newest
          }
        });
        const reviewTrends = dayCounts.map((count, idx) => ({
          day: days[(now.getDay() - (6 - idx) + 7) % 7],
          genuine: count,
          suspicious: 0,
          fake: 0,
        }));

        // Build 24h fraud detection timeline from saved analyses
        const hourCounts = new Array(24).fill(0);
        analyses.forEach(a => {
          const d = a.created_at ? new Date(a.created_at) : null;
          if (!d) return;
          const diffHrs = (now - d) / (1000*60*60);
          if (diffHrs >= 0 && diffHrs < 24) {
            const hour = d.getHours();
            hourCounts[hour] += 1;
          }
        });
        const fraudTimeline = hourCounts.map((c, i) => ({ hour: i, detections: c, accuracy: 0 }));

        // Cluster map: group analyses by email and bucket risk by prob_fake
        const clustersMap = Object.values(
          analyses.reduce((acc, a) => {
            const key = a.email || 'unknown';
            const risk = a.analysis?.prob_fake != null ? a.analysis.prob_fake : 0;
            if (!acc[key]) acc[key] = { cluster: key, size: 0, risk: 0, type: 'Individual' };
            acc[key].size += 1;
            acc[key].risk = Math.max(acc[key].risk, Math.round(risk * 100));
            return acc;
          }, {})
        ).slice(0, 8);

        setChartData({
          analytics,
          reviewTrends,
          fraudTimeline,
          clusterMap: clustersMap,
        });
      } catch (e) {
        // keep silent to avoid breaking UI; data will be empty
        setChartData(prev => ({ ...prev }));
      }
    };
    fetchAll();
    const id = setInterval(fetchAll, 30000);
    const handler = () => fetchAll();
    window.addEventListener('analysis:updated', handler);
    return () => { clearInterval(id); window.removeEventListener('analysis:updated', handler); };
  }, []);

  const ChartCard = ({ title, icon, children, height = 300, variant = 'base' }) => {
    const base = {
      color: darkMode ? '#e5e7eb' : 'inherit',
      borderRadius: '16px',
      border: darkMode ? '1px solid rgba(6, 182, 212, 0.1)' : '1px solid rgba(6, 182, 212, 0.2)',
      height: '100%',
      position: 'relative',
      overflow: 'hidden',
      transition: 'box-shadow 0.3s ease'
    };

    const variants = {
      base: {
        background: darkMode ? 'rgba(6, 182, 212, 0.05)' : 'rgba(6, 182, 212, 0.02)'
      }
    };

    return (
      <Card sx={{ ...base, ...variants[variant] }}>
        <CardContent sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            {icon}
            <Typography variant="h6" color="#06b6d4" fontWeight="bold">
              {title}
            </Typography>
          </Box>
          <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {children}
          </Box>
        </CardContent>
      </Card>
    );
  };

  if (fullView) {
    return (
      <Box sx={{ width: '100%', mb: 4 }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
          <Tabs
            value={activeTab}
            onChange={(e, newValue) => setActiveTab(newValue)}
            sx={{
              '& .MuiTab-root': {
                color: darkMode ? '#e5e7eb' : 'text.secondary',
                '&.Mui-selected': { color: '#06b6d4' }
              },
              '& .MuiTabs-indicator': {
                backgroundColor: '#06b6d4',
                height: 3
              }
            }}
          >
            <Tab icon={<TrendingUpIcon />} label="Review Trends" />
            <Tab icon={<TimelineIcon />} label="Detection Timeline" />
            <Tab icon={<BubbleChartIcon />} label="Risk Clusters" />
            <Tab icon={<AssessmentIcon />} label="Analytics" />
          </Tabs>
        </Box>

        {activeTab === 0 && (
          <ChartCard title="📈 Review Trends (7 Days)" icon={<TrendingUpIcon sx={{ color: '#06b6d4', fontSize: 28 }} />}>
            <Box sx={{ textAlign: 'center', p: 4 }}>
              <Typography variant="h6" color="#06b6d4" gutterBottom>
                Reviews per day (last 7 days)
              </Typography>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                {chartData.reviewTrends.map((day, index) => (
                  <Box key={index} sx={{ textAlign: 'center', minWidth: 40 }}>
                    <Typography variant="body2" fontWeight="bold" sx={{ color: darkMode ? '#f1f5f9' : 'inherit' }}>
                      {day.day}
                    </Typography>
                    <Typography variant="h6" color="#10b981">
                      {day.genuine}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </Box>
          </ChartCard>
        )}

        {activeTab === 1 && (
          <ChartCard title="⏱️ Fraud Detection Timeline" icon={<TimelineIcon sx={{ color: '#06b6d4', fontSize: 28 }} />}>
            <Box sx={{ textAlign: 'center', p: 4 }}>
              <Typography variant="h6" color="#06b6d4" gutterBottom>
                24-Hour Activity Monitor
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, justifyContent: 'center' }}>
                {chartData.fraudTimeline.map((h) => (
                  <Chip key={h.hour} label={`${h.hour}:00 → ${h.detections}`} sx={{ backgroundColor: 'rgba(6, 182, 212, 0.08)', color: '#06b6d4' }} />
                ))}
              </Box>
            </Box>
          </ChartCard>
        )}

        {activeTab === 2 && (
          <ChartCard title="🔗 Risk Cluster Analysis" icon={<BubbleChartIcon sx={{ color: '#06b6d4', fontSize: 28 }} />}>
            <Box sx={{ p: 3 }}>
              <Typography variant="h6" color="#06b6d4" gutterBottom>
                Suspicious Network Clusters
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 3 }}>
                {chartData.clusterMap.map((cluster, index) => (
                  <Chip
                    key={index}
                    label={`${cluster.cluster}: ${cluster.size} analyses`}
                    sx={{
                      backgroundColor: cluster.risk > 70 ? 'rgba(239, 68, 68, 0.1)' : 'rgba(6, 182, 212, 0.1)',
                      color: cluster.risk > 70 ? '#ef4444' : '#06b6d4',
                      border: `1px solid ${cluster.risk > 70 ? 'rgba(239, 68, 68, 0.3)' : 'rgba(6, 182, 212, 0.3)'}`
                    }}
                  />
                ))}
              </Box>
              <Typography variant="caption" sx={{ color: darkMode ? 'rgba(241,245,249,0.75)' : 'text.secondary' }}>
                Based on saved analyses in the database.
              </Typography>
            </Box>
          </ChartCard>
        )}

        {activeTab === 3 && (
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <ChartCard title="🎯 AI Model Performance" icon={<AssessmentIcon sx={{ color: '#06b6d4', fontSize: 28 }} />}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h3" color="#10b981" fontWeight="bold">
                    {chartData.analytics ? `${Math.min(100, Math.max(0, (5 - Math.abs((chartData.analytics.avg_rating || 0) - 3)) * 25)).toFixed(1)}%` : '—'}
                  </Typography>
                  <Typography variant="body2" sx={{ color: darkMode ? 'rgba(241,245,249,0.85)' : 'text.secondary' }}>
                    Model Proxy Score
                  </Typography>
                  <LinearProgress
                    variant="determinate"
                    value={chartData.analytics ? Math.min(100, Math.max(0, (5 - Math.abs((chartData.analytics.avg_rating || 0) - 3)) * 25)) : 0}
                    sx={{
                      mt: 2,
                      height: 8,
                      borderRadius: 4,
                      backgroundColor: 'rgba(6, 182, 212, 0.1)',
                      '& .MuiLinearProgress-bar': {
                        borderRadius: 4,
                        backgroundColor: '#10b981'
                      }
                    }}
                  />
                </Box>
              </ChartCard>
            </Grid>
          </Grid>
        )}
      </Box>
    );
  }

  return (
    <Grid container spacing={3}>
      {/* Review Trends */}
      <Grid item xs={12} md={6}>
        <ChartCard variant="base" title="📈 Review Trends" icon={<TrendingUpIcon sx={{ color: '#06b6d4', fontSize: 28 }} />}>
          <Box sx={{ textAlign: 'center', p: 2 }}>
            <Typography variant="h6" color="#06b6d4" gutterBottom>
              7-Day Overview
            </Typography>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              {chartData.reviewTrends.slice(0, 3).map((day, index) => (
                <Box key={index} sx={{ textAlign: 'center' }}>
                  <Typography variant="body2" fontWeight="bold" sx={{ color: darkMode ? '#f1f5f9' : 'inherit' }}>
                    {day.day}
                  </Typography>
                  <Typography variant="h6" color="#10b981">
                    {day.genuine}
                  </Typography>
                  <Typography variant="caption" color="#ef4444">
                    {day.fake} fake
                  </Typography>
                </Box>
              ))}
            </Box>
            <Box sx={{ height: 100, background: 'rgba(6, 182, 212, 0.05)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Typography variant="body1" color="#06b6d4">
                📊 Trend Chart
              </Typography>
            </Box>
          </Box>
        </ChartCard>
      </Grid>

      {/* Fraud Detection Timeline */}
      <Grid item xs={12} md={6}>
        <ChartCard variant="base" title="⏱️ Detection Timeline" icon={<TimelineIcon sx={{ color: '#06b6d4', fontSize: 28 }} /> }>
          <Box sx={{ textAlign: 'center', p: 2 }}>
            <Typography variant="h6" color="#06b6d4" gutterBottom>
              Real-time Activity
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2, flexWrap: 'wrap', justifyContent: 'center' }}>
              <Typography variant="body2" sx={{ color: darkMode ? '#f1f5f9' : 'inherit' }}>Last 24h:</Typography>
              <Chip label={`${chartData.fraudTimeline.reduce((a,b)=>a+(b.detections||0),0)} detections`} sx={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' }} />
            </Box>
            <Box sx={{ height: 100, background: 'rgba(6, 182, 212, 0.05)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Typography variant="body1" color="#06b6d4">
                📈 Timeline Chart
              </Typography>
            </Box>
          </Box>
        </ChartCard>
      </Grid>

      {/* Risk Clusters */}
      <Grid item xs={12} md={6}>
        <ChartCard variant="base" title="🔗 Risk Clusters" icon={<BubbleChartIcon sx={{ color: '#06b6d4', fontSize: 28 }} />}>
          <Box sx={{ p: 2 }}>
            <Typography variant="h6" color="#06b6d4" gutterBottom>
              Network Analysis
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {chartData.clusterMap.slice(0, 4).map((cluster, index) => (
                <Chip
                  key={index}
                  label={`${cluster.cluster} (${cluster.size})`}
                  sx={{
                    backgroundColor: cluster.risk > 70 ? 'rgba(239, 68, 68, 0.1)' : 'rgba(6, 182, 212, 0.1)',
                    color: cluster.risk > 70 ? '#ef4444' : '#06b6d4',
                    mb: 1
                  }}
                />
              ))}
            </Box>
            <Box sx={{ mt: 2, height: 80, background: 'rgba(6, 182, 212, 0.05)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Typography variant="body1" color="#06b6d4">
                🗺️ Cluster Map
              </Typography>
            </Box>
          </Box>
        </ChartCard>
      </Grid>

      {/* AI Performance */}
      <Grid item xs={12} md={6}>
        <ChartCard variant="base" title="🎯 AI Performance" icon={<AssessmentIcon sx={{ color: '#06b6d4', fontSize: 28 }} />}>
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h3" color="#10b981" fontWeight="bold">
              {chartData.analytics ? `${Math.min(100, Math.max(0, (5 - Math.abs((chartData.analytics.avg_rating || 0) - 3)) * 25)).toFixed(1)}%` : '—'}
            </Typography>
            <Typography variant="body2" color={darkMode ? 'rgba(241,245,249,0.85)' : 'text.secondary'}>
              Model Proxy Score
            </Typography>
            <LinearProgress
              variant="determinate"
              value={chartData.analytics ? Math.min(100, Math.max(0, (5 - Math.abs((chartData.analytics.avg_rating || 0) - 3)) * 25)) : 0}
              sx={{
                mt: 2,
                height: 8,
                borderRadius: 4,
                backgroundColor: 'rgba(6, 182, 212, 0.1)',
                '& .MuiLinearProgress-bar': {
                  borderRadius: 4,
                  backgroundColor: '#10b981'
                }
              }}
            />
            <Typography variant="caption" sx={{ mt: 1, display: 'block', color: darkMode ? 'rgba(241,245,249,0.8)' : 'text.secondary' }}>
              Derived from dataset stats
            </Typography>
          </Box>
        </ChartCard>
      </Grid>
    </Grid>
  );
}
