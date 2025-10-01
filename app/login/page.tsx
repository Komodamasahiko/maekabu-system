'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Box, Paper, TextField, Button, Typography, Alert } from '@mui/material';
import { LockOutlined as LockIcon } from '@mui/icons-material';

export default function LoginPage() {
  const [employeeNumber, setEmployeeNumber] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          employee_number: employeeNumber,
          password: password
        })
      });

      const data = await response.json();

      if (response.ok) {
        // セッション情報を保存
        sessionStorage.setItem('user', JSON.stringify(data.user));
        router.push('/');
      } else {
        setError(data.error || 'ログインに失敗しました');
      }
    } catch (error) {
      setError('ログイン処理中にエラーが発生しました');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: 3,
      }}
    >
      <Paper
        elevation={10}
        sx={{
          padding: 5,
          width: '100%',
          maxWidth: 420,
          borderRadius: 3,
        }}
      >
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <LockIcon sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
          <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
            株式会社まえかぶ
          </Typography>
          <Typography variant="h5" component="h2" gutterBottom>
            社内システム
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            社員コードとパスワードでログインしてください
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <form onSubmit={handleLogin}>
          <TextField
            fullWidth
            label="社員コード"
            placeholder="例: EMP001"
            value={employeeNumber}
            onChange={(e) => setEmployeeNumber(e.target.value)}
            required
            sx={{ mb: 3 }}
            autoComplete="username"
            autoFocus
          />

          <TextField
            fullWidth
            type="password"
            label="パスワード"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            sx={{ mb: 3 }}
            autoComplete="current-password"
          />

          <Button
            type="submit"
            fullWidth
            variant="contained"
            size="large"
            disabled={loading}
            sx={{
              py: 1.5,
              mb: 2,
              background: loading ? '#ccc' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              fontWeight: 'bold',
              fontSize: '16px',
            }}
          >
            {loading ? 'ログイン中...' : 'ログイン'}
          </Button>
        </form>
      </Paper>
    </Box>
  );
}