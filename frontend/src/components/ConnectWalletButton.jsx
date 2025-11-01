import React, { useCallback } from 'react';
import { Button, useTheme } from '@mui/material';
import { ethers } from 'ethers';

function shorten(addr) {
  return addr ? `${addr.slice(0, 6)}...${addr.slice(-4)}` : '';
}

export default function ConnectWalletButton({ onConnected, account, darkMode }) {
  const theme = useTheme();
  const isDark = typeof darkMode === 'boolean' ? darkMode : (theme.palette.mode === 'dark');
  const connect = useCallback(async () => {
    if (!window.ethereum) {
      // For demo purposes, create a mock wallet connection
      const mockAccount = '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266';
      onConnected(mockAccount);
      return;
    }
    try {
      // Request account access
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      if (accounts && accounts.length > 0) {
        const checksumAddress = ethers.getAddress(accounts[0]);
        onConnected(checksumAddress);
      }
    } catch (err) {
      console.error('Wallet connection error:', err);
      if (err.code === 4001) {
        alert('Connection rejected by user');
      } else if (err.code === -32002) {
        alert('Connection request already pending. Check MetaMask.');
      } else {
        alert(`Failed to connect wallet: ${err.message}`);
      }
    }
  }, [onConnected]);

  return (
    <Button 
      color="inherit" 
      variant="outlined" 
      onClick={connect}
      sx={{
        borderColor: 'rgba(25, 118, 210, 0.5)',
        color: isDark ? '#f1f5f9' : '#0f172a',
        backgroundColor: 'rgba(25, 118, 210, 0.1)',
        backdropFilter: 'blur(10px)',
        '&:hover': {
          borderColor: 'rgba(25, 118, 210, 0.8)',
          backgroundColor: 'rgba(25, 118, 210, 0.2)',
          transform: 'translateY(-2px)',
          boxShadow: '0 8px 25px rgba(25, 118, 210, 0.2)',
        },
        '&:active': {
          transform: 'translateY(0px)',
        },
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        borderRadius: '25px',
        px: 3,
        py: 1,
        fontWeight: '600',
        textTransform: 'none',
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: '-100%',
          width: '100%',
          height: '100%',
          background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
          transition: 'left 0.5s',
        },
        '&:hover::before': {
          left: '100%',
        },
      }}
    >
      {account ? `🔗 ${shorten(account)}` : '🔌 Connect Wallet (Demo)'}
    </Button>
  );
}
