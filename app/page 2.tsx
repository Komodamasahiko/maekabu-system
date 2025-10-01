'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Box, Card, CardContent, Typography, CircularProgress } from '@mui/material';
import { People, AccountBalance } from '@mui/icons-material';

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    // 自動的にクリエイター管理ページにリダイレクト
    router.push('/creator');
  }, [router]);

  return (
    <Box sx={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center',
      minHeight: '100vh',
      backgroundColor: '#f5f5f5'
    }}>
      <Card sx={{ p: 4 }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <CircularProgress />
            <Typography variant="h6">
              クリエイター管理システムを読み込み中...
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}