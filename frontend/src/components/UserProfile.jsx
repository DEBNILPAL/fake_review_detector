import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  TextField,
  Button,
  Avatar,
  Grid,
  Divider,
  Switch,
  FormControlLabel,
  Alert,
  Paper
} from '@mui/material';
import {
  Person as PersonIcon,
  Email as EmailIcon,
  Notifications as NotificationsIcon,
  Save as SaveIcon
} from '@mui/icons-material';

const UserProfile = ({ user, onUpdateUser, darkMode }) => {
  const [profile, setProfile] = useState({
    username: user?.username || '',
    email: user?.email || '',
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    bio: user?.bio || ''
  });
  
  const [settings, setSettings] = useState({
    emailNotifications: true,
    reviewAlerts: true,
    // darkMode removed from settings controls — component still receives `darkMode` prop for styling
  });
  
  const [success, setSuccess] = useState(false);

  // Profile picture (persist in localStorage)
  const [profilePic, setProfilePic] = useState(localStorage.getItem('profilePic') || '');

  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setProfilePic(reader.result);
        try {
          localStorage.setItem('profilePic', reader.result);
        } catch {}
        // Optional backend upload
        // const formData = new FormData();
        // formData.append('file', file);
        // axios.post('/api/upload-profile-pic', formData);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleProfileChange = (field) => (event) => {
    setProfile({ ...profile, [field]: event.target.value });
  };

  const handleSettingsChange = (field) => (event) => {
    setSettings({ ...settings, [field]: event.target.checked });
  };

  const handleSave = () => {
    onUpdateUser?.(profile);
    setSuccess(true);
    setTimeout(() => setSuccess(false), 3000);
  };

  return (
    <Box
      sx={{
        minHeight: 'calc(100vh - 140px)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        px: { xs: 2, md: 6 },
        py: { xs: 4, md: 6 },
      }}
    >
      {/* Header */}
      <Box sx={{ mb: 3, textAlign: 'center', width: '100%', maxWidth: 1200, mx: 'auto' }}>
        <Typography
          variant="h4"
          sx={{
            fontWeight: 'bold',
            background: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 50%, #0e7490 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            mb: 2
          }}
        >
          👤 User Profile & Settings
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Manage your account settings and preferences
        </Typography>
      </Box>

      {success && (
        <Alert severity="success" sx={{ mb: 3 }}>
          Profile updated successfully!
        </Alert>
      )}

      <Grid
        container
        spacing={3}
        sx={{ width: '100%', maxWidth: 1200, mx: 'auto' }}
      >
        {/* Profile Information */}
        <Grid item xs={12} md={8}>
          <Card
            sx={{
              background: darkMode ? 'rgba(15, 23, 42, 0.8)' : 'rgba(255, 255, 255, 0.9)',
              backdropFilter: 'blur(20px)',
              border: `1px solid ${darkMode ? 'rgba(148, 163, 184, 0.1)' : 'rgba(148, 163, 184, 0.2)'}`,
              borderRadius: 3,
              boxShadow: '0 0 20px rgba(0,191,255,0.18)'
            }}
          >
            <CardContent sx={{ p: { xs: 3, md: 4 } }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <PersonIcon sx={{ mr: 2, color: '#06b6d4' }} />
                <Typography variant="h6" fontWeight="bold">
                  Profile Information
                </Typography>
              </Box>

              <Box sx={{ textAlign: 'center', mb: 3 }}>
                <Box
                  sx={{
                    width: 96,
                    height: 96,
                    mx: 'auto',
                    mb: 1.5,
                    borderRadius: '50%',
                    overflow: 'hidden',
                    border: '1px solid rgba(34, 211, 238, 0.4)',
                    boxShadow: '0 0 15px rgba(0,191,255,0.25)',
                    transition: 'transform 0.2s ease',
                    '&:hover': { transform: 'scale(1.05)' }
                  }}
                >
                  {profilePic ? (
                    <img src={profilePic} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%', color: '#22d3ee', fontSize: '1.75rem', fontWeight: 700 }}>
                      {profile.username?.charAt(0)?.toUpperCase() || 'U'}
                    </Box>
                  )}
                </Box>

                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoChange}
                  id="upload-photo"
                  style={{ display: 'none' }}
                />
                <label htmlFor="upload-photo">
                  <Button
                    component="span"
                    size="small"
                    sx={{
                      px: 1.75,
                      py: 0.5,
                      color: '#67e8f9',
                      backgroundColor: 'rgba(8,145,178,0.2)',
                      border: '1px solid rgba(34, 211, 238, 0.4)',
                      borderRadius: 1,
                      textTransform: 'uppercase',
                      letterSpacing: '0.04em',
                      fontWeight: 700,
                      '&:hover': { backgroundColor: 'rgba(8,145,178,0.4)' }
                    }}
                  >
                    Change Photo
                  </Button>
                </label>
              </Box>

              <TextField
                fullWidth
                label="Username"
                value={profile.username}
                onChange={handleProfileChange('username')}
                sx={{ mb: 2 }}
              />
              
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={profile.email}
                onChange={handleProfileChange('email')}
                sx={{ mb: 2 }}
              />

              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label="First Name"
                    value={profile.firstName}
                    onChange={handleProfileChange('firstName')}
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label="Last Name"
                    value={profile.lastName}
                    onChange={handleProfileChange('lastName')}
                  />
                </Grid>
              </Grid>

              <TextField
                fullWidth
                label="Bio"
                multiline
                rows={3}
                value={profile.bio}
                onChange={handleProfileChange('bio')}
                placeholder="Tell us about yourself..."
                sx={{ mt: 2 }}
              />
            </CardContent>
          </Card>
        </Grid>

        {/* Security & Preferences */}
        <Grid item xs={12} md={4}>
          {/* Security Settings removed per request */}

          {/* Notification Preferences */}
          <Card
            sx={{
              background: darkMode ? 'rgba(15, 23, 42, 0.8)' : 'rgba(255, 255, 255, 0.9)',
              backdropFilter: 'blur(20px)',
              border: `1px solid ${darkMode ? 'rgba(148, 163, 184, 0.1)' : 'rgba(148, 163, 184, 0.2)'}`,
              borderRadius: 3,
              boxShadow: '0 0 20px rgba(0,191,255,0.18)'
            }}
          >
            <CardContent sx={{ p: { xs: 3, md: 4 } }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <NotificationsIcon sx={{ mr: 2, color: '#06b6d4' }} />
                <Typography variant="h6" fontWeight="bold">
                  Notifications
                </Typography>
              </Box>

              <FormControlLabel
                control={
                  <Switch
                    checked={settings.emailNotifications}
                    onChange={handleSettingsChange('emailNotifications')}
                    color="primary"
                  />
                }
                label="Email Notifications"
                sx={{ display: 'block', mb: 2 }}
              />

              <FormControlLabel
                control={
                  <Switch
                    checked={settings.reviewAlerts}
                    onChange={handleSettingsChange('reviewAlerts')}
                    color="primary"
                  />
                }
                label="Review Fraud Alerts"
                sx={{ display: 'block', mb: 2 }}
              />

              {/* Dark Mode control removed from Notifications per request */}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Save Button */}
      <Box sx={{ textAlign: 'center', mt: 3 }}>
        <Button
          variant="contained"
          size="large"
          startIcon={<SaveIcon />}
          onClick={handleSave}
          sx={{
            px: 4,
            py: 1.5,
            background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
            fontWeight: 'bold',
            borderRadius: 2,
            boxShadow: '0 0 16px rgba(33,203,243,0.25)'
          }}
        >
          Save Changes
        </Button>
      </Box>

      {/* Account Stats */}
      <Paper
        sx={{
          mt: 3,
          p: { xs: 2.5, md: 3 },
          width: '100%',
          maxWidth: 1200,
          mx: 'auto',
          background: darkMode ? 'rgba(15, 23, 42, 0.8)' : 'rgba(255, 255, 255, 0.9)',
          backdropFilter: 'blur(20px)',
          border: `1px solid ${darkMode ? 'rgba(148, 163, 184, 0.1)' : 'rgba(148, 163, 184, 0.2)'}`,
          borderRadius: 3,
          boxShadow: '0 0 16px rgba(0,191,255,0.14)'
        }}
      >
        <Typography variant="h6" fontWeight="bold" mb={2}>
          📊 Account Statistics
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={6} md={3}>
            <Box textAlign="center">
              <Typography variant="h4" color="primary" fontWeight="bold">
                42
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Reviews Analyzed
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={6} md={3}>
            <Box textAlign="center">
              <Typography variant="h4" color="primary" fontWeight="bold">
                15
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Fake Reviews Found
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={6} md={3}>
            <Box textAlign="center">
              <Typography variant="h4" color="primary" fontWeight="bold">
                128
              </Typography>
              <Typography variant="body2" color="text.secondary">
                RVT Tokens Earned
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={6} md={3}>
            <Box textAlign="center">
              <Typography variant="h4" color="primary" fontWeight="bold">
                97%
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Accuracy Rate
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
};

export default UserProfile;