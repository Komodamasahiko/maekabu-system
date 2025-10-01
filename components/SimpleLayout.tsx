'use client';

import { Box, AppBar, Toolbar, Typography, Container } from '@mui/material';

interface SimpleLayoutProps {
  children: React.ReactNode;
  title?: string;
}

export default function SimpleLayout({ children, title = 'Maekabu System' }: SimpleLayoutProps) {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            {title}
          </Typography>
        </Toolbar>
      </AppBar>
      <Container component="main" sx={{ mt: 4, mb: 4, flexGrow: 1 }}>
        {children}
      </Container>
    </Box>
  );
}