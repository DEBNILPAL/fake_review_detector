import React, { useState, useMemo } from 'react';
import { useNavigate, useLocation, Routes, Route } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Avatar,
  TextField,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton,
  Container,
  Badge,
  Fade,
  Slide,
  Zoom,
  useMediaQuery,
  Menu,
  MenuItem,
  Divider,
  Snackbar,
  ThemeProvider,
  createTheme
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Reviews as ReviewsIcon,
  Analytics as AnalyticsIcon,
  Security as SecurityIcon,
  Settings as SettingsIcon,
  Search as SearchIcon,
  Notifications as NotificationsIcon,
  Menu as MenuIcon,
  Psychology as PsychologyIcon,
  Shield as ShieldIcon,
  Person as PersonIcon,
  Logout as LogoutIcon,
  AccountCircle as AccountCircleIcon
} from '@mui/icons-material';

import AnalyticsCards from './components/AnalyticsCards';
import ReviewDetailPanel from './components/ReviewDetailPanel';
import ChartsSection from './components/ChartsSection';
import ConnectWalletButton from './components/ConnectWalletButton';
import ProductPage from './components/ProductPage';
import LandingPage from './components/LandingPage';
import UserProfile from './components/UserProfile';
import WelcomeAnimation from './components/WelcomeAnimation';
// CSVUpload removed per request

const EXPANDED_WIDTH = 280;
const COLLAPSED_WIDTH = 80;

export default function App() {
  const navigate = useNavigate();
  const location = useLocation();
  const [darkMode] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [account, setAccount] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [userMenuAnchor, setUserMenuAnchor] = useState(null);
  const [notification, setNotification] = useState({ open: false, message: '' });
  const [showWelcome, setShowWelcome] = useState(false);
  const [welcomeUsername, setWelcomeUsername] = useState('');

  // Create dynamic theme (forced dark mode)
  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode: 'dark',
          primary: {
            main: '#06b6d4',
          },
          secondary: {
            main: '#0891b2',
          },
          background: {
            default: '#0f172a',
            paper: '#1e293b',
          },
          text: {
            primary: '#f1f5f9',
            secondary: '#94a3b8',
          },
        },
      }),
    []
  );
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  // Map path to active section for highlighting
  const pathToSection = (path) => {
    if (path.startsWith('/app-demo')) return 'dapp';
    if (path.startsWith('/reviews')) return 'reviews';
    if (path.startsWith('/graph-explorer')) return 'analytics';
    if (path.startsWith('/settings')) return 'settings';
    return 'dashboard';
  };
  React.useEffect(() => {
    setActiveSection(pathToSection(location.pathname));
  }, [location.pathname]);

  const handleDrawerToggle = () => setMobileOpen(!mobileOpen);
  const handleUserMenuOpen = (event) => setUserMenuAnchor(event.currentTarget);
  const handleUserMenuClose = () => setUserMenuAnchor(null);

  const handleAuthComplete = (userData) => {
    // Set username for welcome animation
    setWelcomeUsername(userData.username || userData.email?.split('@')[0] || 'User');
    setShowWelcome(true);

    // Set user data but keep them on landing page during animation
    setUser(userData);

    console.log('User authenticated:', userData);
  };

  const handleWelcomeComplete = () => {
    // After welcome animation completes, show the main app
    setShowWelcome(false);
    setIsAuthenticated(true);

    // Show notification
    const welcomeMessage = user?.isSignUp
      ? `Welcome ${welcomeUsername}! 🎉`
      : `Welcome back ${welcomeUsername}! 👋`;

    setNotification({ open: true, message: welcomeMessage });
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUser(null);
    setAccount(null);
    setActiveSection('dashboard');
    setNotification({ open: true, message: 'You have been logged out successfully. See you soon! 👋' });
    console.log('User logged out');
  };

  const handleUpdateUser = (updatedProfile) => {
    setUser({ ...user, ...updatedProfile });
    setNotification({ open: true, message: 'Profile updated successfully! ✅' });
    console.log('User profile updated:', updatedProfile);
  };

  const handleCloseNotification = () => {
    setNotification({ ...notification, open: false });
  };

  // Show welcome animation during authentication
  if (showWelcome) {
    return (
      <WelcomeAnimation
        username={welcomeUsername}
        onComplete={handleWelcomeComplete}
        darkMode={darkMode}
      />
    );
  }

  // Show landing page if not authenticated
  if (!isAuthenticated) {
    return <LandingPage onAuthComplete={handleAuthComplete} />;
  }

  const navigationItems = [
    { id: 'dashboard', path: '/', label: 'Dashboard', icon: <DashboardIcon />, badge: null },
    { id: 'dapp', path: '/app-demo', label: 'App Demo', icon: <DashboardIcon />, badge: null },
    { id: 'reviews', path: '/reviews', label: 'Reviews', icon: <ReviewsIcon />, badge: '12' },
    { id: 'analytics', path: '/graph-explorer', label: 'Graph Explorer', icon: <AnalyticsIcon />, badge: null },
    { id: 'settings', path: '/settings', label: 'Settings', icon: <SettingsIcon />, badge: null },
  ];

  const drawerWidth = sidebarCollapsed ? COLLAPSED_WIDTH : EXPANDED_WIDTH;

  const drawer = (
    <motion.div animate={{ width: drawerWidth }} transition={{ type: 'tween', duration: 0.25 }} style={{ height: '100%' }}>
      <Box
        sx={{
          height: '100%',
          background: 'linear-gradient(180deg, #0f172a 0%, #1e293b 50%, #334155 100%)',
          color: '#e5e7eb',
          backdropFilter: 'blur(20px)',
          borderRight: '1px solid rgba(148, 163, 184, 0.1)',
        }}
      >
        <Box sx={{ p: 3, display: 'flex', alignItems: 'center', justifyContent: sidebarCollapsed ? 'center' : 'space-between' }}>
          {!sidebarCollapsed && (
            <Box sx={{ textAlign: 'left' }}>
              <Typography
                variant="h4"
                sx={{
                  fontWeight: 'bold',
                  background: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 50%, #0e7490 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  mb: 0.5
                }}
              >
                🔍 TrustLens
              </Typography>
            </Box>
          )}

          <IconButton onClick={() => setSidebarCollapsed(!sidebarCollapsed)} aria-label="toggle sidebar" size="small">
            {sidebarCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
          </IconButton>
        </Box>

        <List sx={{ px: 2 }}>
          {navigationItems.map((item) => (
            <ListItem key={item.id} disablePadding sx={{ mb: 1 }}>
              <ListItemButton
                onClick={() => {
                  navigate(item.path);
                  if (isMobile) setMobileOpen(false);
                }}
                sx={{
                  borderRadius: '12px',
                  backgroundColor:
                    activeSection === item.id
                      ? 'rgba(6, 182, 212, 0.1)'
                      : 'transparent',
                  color: activeSection === item.id ? '#06b6d4' : 'inherit',
                  justifyContent: sidebarCollapsed ? 'center' : 'flex-start',
                  '&:hover': {
                    backgroundColor: 'rgba(6, 182, 212, 0.05)',
                    transform: 'translateX(4px)',
                  },
                  transition: 'all 0.3s ease',
                }}
              >
                <ListItemIcon sx={{ color: activeSection === item.id ? '#06b6d4' : 'inherit', minWidth: sidebarCollapsed ? 0 : 40 }}>
                  {item.badge ? <Badge badgeContent={item.badge} color="error">{item.icon}</Badge> : item.icon}
                </ListItemIcon>
                {!sidebarCollapsed && (
                  <ListItemText
                    primary={item.label}
                    sx={{ '& .MuiListItemText-primary': { fontWeight: activeSection === item.id ? 600 : 400 } }}
                  />
                )}
              </ListItemButton>
            </ListItem>
          ))}
        </List>

        {!sidebarCollapsed && (
          <Box sx={{ position: 'absolute', bottom: 20, left: 20, right: 20 }}>
            <Box
              sx={{
                p: 2,
                borderRadius: '12px',
                background: 'rgba(6, 182, 212, 0.05)',
                border: '1px solid rgba(6, 182, 212, 0.1)',
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                <PsychologyIcon sx={{ color: '#06b6d4', fontSize: 20 }} />
                <Typography variant="body2" fontWeight={600} color="#06b6d4">
                  AI Engine
                </Typography>
              </Box>
              <Typography variant="caption" color="text.secondary">
                Neural networks analyzing patterns
              </Typography>
              <Box sx={{ mt: 1, height: 4, background: 'rgba(6, 182, 212, 0.1)', borderRadius: 2, overflow: 'hidden' }}>
                <Box
                  sx={{
                    height: '100%',
                    width: '85%',
                    background: 'linear-gradient(90deg, #06b6d4, #0891b2)',
                    borderRadius: 2,
                    animation: 'pulse 2s infinite',
                  }}
                />
              </Box>
            </Box>
          </Box>
        )}
      </Box>
    </motion.div>
  );

  return (
    <ThemeProvider theme={theme}>
      {/* Global Background Image */}
      <Box sx={{ position: 'fixed', inset: 0, zIndex: 0, overflow: 'hidden' }}>
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            backgroundImage: 'url(/download.jpeg)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            '&::after': {
              content: '""',
              position: 'absolute',
              inset: 0,
              background: 'rgba(2,6,23,0.75)', // Darker overlay for better readability
              backdropFilter: 'blur(3px)', // Slight blur effect
            }
          }}
        />
      </Box>
      <Box
        sx={{
          display: 'flex',
          minHeight: '100vh',
          background: 'transparent',
          color: theme.palette.text.primary,
          position: 'relative',
          zIndex: 1,
        }}
      >
        {/* Sidebar */}
        <Box component="nav" sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}>
          <Drawer
            variant="temporary"
            open={mobileOpen}
            onClose={handleDrawerToggle}
            ModalProps={{ keepMounted: true }}
            sx={{ display: { xs: 'block', md: 'none' }, '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth } }}
          >
            {drawer}
          </Drawer>
          <Drawer
            variant="permanent"
            sx={{ display: { xs: 'none', md: 'block' }, '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth, transition: 'width 200ms ease' } }}
            open
          >
            {drawer}
          </Drawer>
        </Box>

        {/* Main Content */}
        <Box component="main" sx={{ flexGrow: 1, p: 3, width: { md: `calc(100% - ${drawerWidth}px)` }, background: 'transparent' }}>
          {/* Top App Bar */}
          <AppBar
            position="static"
            elevation={0}
            sx={{
              background: 'rgba(15, 23, 42, 0.85)',
              color: '#f1f5f9',
              backdropFilter: 'blur(20px)',
              borderRadius: '16px',
              border: '1px solid rgba(148, 163, 184, 0.1)',
              mb: 4,
            }}
          >
            <Toolbar>
              <IconButton color="inherit" edge="start" onClick={handleDrawerToggle} sx={{ mr: 2, display: { md: 'none' } }}>
                <MenuIcon />
              </IconButton>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexGrow: 1 }}>
                <SearchIcon sx={{ color: '#06b6d4' }} />
                <TextField
                  placeholder="Search reviews, users, analytics..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  sx={{
                    flexGrow: 1,
                    maxWidth: 400,
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '25px',
                      backgroundColor: 'rgba(6, 182, 212, 0.05)',
                      '& fieldset': { borderColor: 'rgba(6, 182, 212, 0.2)' },
                      '&:hover fieldset': { borderColor: 'rgba(6, 182, 212, 0.4)' },
                      '&.Mui-focused fieldset': { borderColor: '#06b6d4' },
                    },
                    '& .MuiInputBase-input': {
                      color: '#f1f5f9',
                      '::placeholder': {
                        color: 'rgba(241,245,249,0.7)',
                      },
                    },
                    '& .MuiInputLabel-root': {
                      color: 'rgba(226,232,240,0.8)',
                    },
                  }}
                />
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                {/* Connect Wallet Button for DApp functionality - REMOVED */}
                {/* <ConnectWalletButton onConnected={setAccount} account={account} darkMode={darkMode} /> */}

                <IconButton sx={{ color: '#06b6d4' }}>
                  <Badge badgeContent={3} color="error">
                    <NotificationsIcon />
                  </Badge>
                </IconButton>

                <Avatar
                  onClick={handleUserMenuOpen}
                  sx={{
                    background: 'linear-gradient(135deg, #06b6d4, #0891b2)',
                    cursor: 'pointer',
                    '&:hover': { transform: 'scale(1.1)' },
                    transition: 'transform 0.2s ease'
                  }}
                >
                  {user?.username ? user.username.charAt(0).toUpperCase() : 'U'}
                </Avatar>
                
                {/* User Profile Menu */}
                <Menu
                  anchorEl={userMenuAnchor}
                  open={Boolean(userMenuAnchor)}
                  onClose={handleUserMenuClose}
                  PaperProps={{
                    sx: {
                      mt: 1,
                      minWidth: 200,
                      background: darkMode ? 'rgba(15, 23, 42, 0.95)' : 'rgba(255, 255, 255, 0.95)',
                      backdropFilter: 'blur(20px)',
                      border: `1px solid ${darkMode ? 'rgba(148, 163, 184, 0.1)' : 'rgba(148, 163, 184, 0.2)'}`,
                      borderRadius: 2
                    }
                  }}
                >
                  <Box sx={{ px: 2, py: 1 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                      Welcome back!
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {user?.username || 'User'}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {user?.email || 'user@trustlens.com'}
                    </Typography>
                  </Box>
                  <Divider />
                  <MenuItem onClick={() => { handleUserMenuClose(); navigate('/settings'); }}>
                    <ListItemIcon>
                      <PersonIcon fontSize="small" />
                    </ListItemIcon>
                    Profile Settings
                  </MenuItem>
                  <MenuItem onClick={() => { handleUserMenuClose(); navigate('/settings'); }}>
                    <ListItemIcon>
                      <SettingsIcon fontSize="small" />
                    </ListItemIcon>
                    Preferences
                  </MenuItem>
                  <Divider />
                  <MenuItem onClick={() => { handleUserMenuClose(); handleLogout(); navigate('/'); }}>
                    <ListItemIcon>
                      <LogoutIcon fontSize="small" />
                    </ListItemIcon>
                    Sign Out
                  </MenuItem>
                </Menu>
              </Box>
            </Toolbar>
          </AppBar>

          {/* Dashboard Content */}
          <Fade in timeout={600}>
            <Container maxWidth="xl">
              <Routes>
                <Route
                  path="/"
                  element={
                    <>
                      <Zoom in timeout={800}>
                        <Box sx={{ mb: 4 }}>
                          <Typography
                            variant="h3"
                            sx={{
                              fontWeight: 'bold',
                              background: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 50%, #0e7490 100%)',
                              WebkitBackgroundClip: 'text',
                              WebkitTextFillColor: 'transparent',
                              mb: 1
                            }}
                          >
                            🛡️ {user?.isSignUp ? `Welcome ${user?.username || 'User'}!` : `Welcome back, ${user?.username || 'User'}!`}
                          </Typography>
                          <Typography
                            variant="h6"
                            sx={{ color: darkMode ? 'rgba(226,232,240,0.85)' : 'text.secondary' }}
                          >
                            TrustLens Command Center - Real-time AI-powered review fraud detection
                          </Typography>
                        </Box>
                      </Zoom>
                      <AnalyticsCards darkMode={darkMode} user={user} />
                      <ChartsSection darkMode={darkMode} user={user} />
                    </>
                  }
                />
                <Route path="/app-demo" element={<ProductPage account={account} user={user} />} />
                <Route path="/reviews" element={<ReviewDetailPanel darkMode={darkMode} />} />
                <Route path="/graph-explorer" element={<ChartsSection darkMode={darkMode} fullView />} />
                <Route
                  path="/settings"
                  element={
                    <UserProfile
                      user={user}
                      onUpdateUser={handleUpdateUser}
                      darkMode={darkMode}
                    />
                  }
                />
              </Routes>
            </Container>
          </Fade>
        </Box>

        {/* Notification Snackbar */}
        <Snackbar
          open={notification.open}
          autoHideDuration={4000}
          onClose={handleCloseNotification}
          message={notification.message}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          sx={{
            '& .MuiSnackbarContent-root': {
              background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
              borderRadius: 2,
              fontWeight: 'bold'
            }
          }}
        />
      </Box>
    </ThemeProvider>
  );
}