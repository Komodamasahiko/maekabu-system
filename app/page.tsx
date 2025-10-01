'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Box, CircularProgress, Typography } from '@mui/material';

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth/login');
      const data = await response.json();
      
      if (data.authenticated) {
        // ログイン済みならクリエイター管理ページへ
        router.push('/creator');
      } else {
        // 未ログインならログインページへ
        router.push('/login');
      }
    } catch (error) {
      console.error('Auth check error:', error);
      router.push('/login');
    }
  };

  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column',
      justifyContent: 'center', 
      alignItems: 'center',
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    }}>
      <CircularProgress size={60} sx={{ color: 'white', mb: 3 }} />
      <Typography variant="h5" sx={{ color: 'white' }}>
        認証を確認中...
      </Typography>
    </Box>
  );
}