import React, { useState } from 'react';
import { Box, Paper, Typography, Button, LinearProgress, Alert } from '@mui/material';
import axios from 'axios';
import { BACKEND_URL } from '../config';

export default function CSVUpload({ user, darkMode }) {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState(null);

  const onFileChange = (e) => {
    setMessage(null);
    setFile(e.target.files?.[0] || null);
  };

  const handleUpload = async () => {
    if (!user?.email || !user?.username) {
      setMessage({ type: 'error', text: 'Please sign in before uploading.' });
      return;
    }
    if (!file) {
      setMessage({ type: 'error', text: 'Choose a CSV file to upload.' });
      return;
    }

    try {
      setUploading(true);
      const text = await file.text();
      const res = await axios.post(`${BACKEND_URL}/api/batch-analytics`, {
        csv: text,
        email: user.email,
        full_name: user.username || user.full_name || 'User',
      }, {
        headers: { 'Content-Type': 'application/json' },
        timeout: 60000,
      });
      setMessage({ type: 'success', text: `Processed ${res.data?.saved || 0} rows (${res.data?.errors || 0} errors).` });
      // Activate user-scoped analytics
      localStorage.setItem('analysisActive', 'true');
      localStorage.setItem('analysisEmail', user.email);
      // Simple signal for other components
      window.dispatchEvent(new Event('analysis:updated'));
    } catch (e) {
      setMessage({ type: 'error', text: e.response?.data?.error || 'Failed to process CSV.' });
    } finally {
      setUploading(false);
    }
  };

  return (
    <Paper elevation={0} sx={{
      mb: 3,
      p: 3,
      background: darkMode ? 'rgba(6, 182, 212, 0.05)' : 'rgba(6, 182, 212, 0.02)',
      borderRadius: '16px',
      border: darkMode ? '1px solid rgba(6, 182, 212, 0.1)' : '1px solid rgba(6, 182, 212, 0.2)'
    }}>
      <Typography variant="h6" color="#06b6d4" fontWeight={700} sx={{ mb: 1 }}>
        📥 Upload CSV for Detailed Analysis
      </Typography>
      <Typography variant="body2" sx={{ mb: 2, color: darkMode ? 'rgba(241,245,249,0.85)' : 'text.secondary' }}>
        Upload a CSV with a review_text/text column (optional: rating, product_id, reviewer_id). The dashboard and graphs will reflect your analyzed data.
      </Typography>
      <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
        <input type="file" accept=".csv" onChange={onFileChange} disabled={uploading} />
        <Button variant="contained" onClick={handleUpload} disabled={uploading || !file}>
          {uploading ? 'Analyzing…' : 'Analyze CSV'}
        </Button>
        <Button variant="outlined" onClick={() => { localStorage.removeItem('analysisActive'); localStorage.removeItem('analysisEmail'); window.dispatchEvent(new Event('analysis:updated')); }}>
          Reset to Global Data
        </Button>
      </Box>
      {uploading && (<Box sx={{ mt: 2 }}><LinearProgress /></Box>)}
      {message && (
        <Box sx={{ mt: 2 }}>
          <Alert severity={message.type}>{message.text}</Alert>
        </Box>
      )}
    </Paper>
  );
}
