'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import MainLayout from '@/components/Layout/MainLayout';
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Paper,
  TextField,
  InputAdornment,
  Chip,
  IconButton,
  Breadcrumbs,
  Link,
} from '@mui/material';
import {
  Search,
  NavigateNext,
  Link as LinkIcon,
} from '@mui/icons-material';

interface FanPfCreator {
  id: string;
  fan_creator_id: number;
  platform_id: string;
  platform: string;
  creator_name: string;
  url: string;
  email: string;
  password: string;
  manager: string;
  registration_type: string;
  creator_rate: number;
  agency_id: string;
  agency_rate: number;
  distribution_method: string;
  created_at: string;
  updated_at: string;
}

export default function MyfansPage() {
  const [creators, setCreators] = useState<FanPfCreator[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const router = useRouter();

  useEffect(() => {
    fetchCreators();
  }, []);

  const fetchCreators = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/pf-creators?platform=Myfans');
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch creators');
      }
      
      setCreators(result.data || []);
    } catch (error) {
      console.error('Error fetching creators:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
    setPage(0);
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const filteredCreators = creators.filter(creator =>
    creator.creator_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    creator.platform_id?.toString().includes(searchTerm) ||
    creator.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    creator.manager?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const paginatedCreators = filteredCreators.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  return (
    <MainLayout>
      <Box sx={{ p: 3 }}>
        {/* パンくずリスト */}
        <Breadcrumbs separator={<NavigateNext fontSize="small" />} sx={{ mb: 2 }}>
          <Link
            component="button"
            variant="body1"
            onClick={() => router.push('/')}
            underline="hover"
            color="inherit"
          >
            ダッシュボード
          </Link>
          <Link
            component="button"
            variant="body1"
            onClick={() => router.push('/creator')}
            underline="hover"
            color="inherit"
          >
            クリエイター管理
          </Link>
          <Typography color="text.primary">Myfans</Typography>
        </Breadcrumbs>


        {/* 検索バー */}
        <Paper sx={{ p: 2, mb: 3 }}>
          <TextField
            fullWidth
            placeholder="クリエイター名、PF_ID、メール、マネージャーで検索..."
            value={searchTerm}
            onChange={handleSearchChange}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              ),
            }}
          />
        </Paper>

        {/* テーブル */}
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                <TableCell>PF_ID</TableCell>
                <TableCell>クリエイター名</TableCell>
                <TableCell>URL</TableCell>
                <TableCell>メール</TableCell>
                <TableCell>パスワード</TableCell>
                <TableCell>マネージャー</TableCell>
                <TableCell align="center">登録タイプ</TableCell>
                <TableCell align="center">CR料率</TableCell>
                <TableCell align="center">代理店料率</TableCell>
                <TableCell align="center">分配方法</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={10} align="center" sx={{ py: 5 }}>
                    <Typography>読み込み中...</Typography>
                  </TableCell>
                </TableRow>
              ) : paginatedCreators.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={10} align="center" sx={{ py: 5 }}>
                    <Typography>データが見つかりません</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                paginatedCreators.map((creator) => (
                  <TableRow 
                    key={creator.id} 
                    hover
                    sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                  >
                    <TableCell>
                      <Chip 
                        label={creator.platform_id || '-'}
                        size="small"
                        color="secondary"
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography fontWeight="medium">
                        {creator.creator_name || '-'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      {creator.url ? (
                        <IconButton
                          size="small"
                          color="secondary"
                          onClick={() => window.open(creator.url, '_blank')}
                        >
                          <LinkIcon fontSize="small" />
                        </IconButton>
                      ) : '-'}
                    </TableCell>
                    <TableCell>{creator.email || '-'}</TableCell>
                    <TableCell>
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          fontFamily: 'monospace',
                          backgroundColor: 'grey.100',
                          padding: '2px 6px',
                          borderRadius: '4px',
                          fontSize: '0.85rem'
                        }}
                      >
                        {creator.password || '-'}
                      </Typography>
                    </TableCell>
                    <TableCell>{creator.manager || '-'}</TableCell>
                    <TableCell align="center">
                      <Chip 
                        label={creator.registration_type || '-'}
                        size="small"
                        color={creator.registration_type === '独占' ? 'success' : 'default'}
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Chip 
                        label={`${(creator.creator_rate * 100).toFixed(0)}%`}
                        size="small"
                        color="secondary"
                      />
                    </TableCell>
                    <TableCell align="center">
                      {creator.agency_rate ? 
                        `${(creator.agency_rate * 100).toFixed(0)}%` : 
                        '-'
                      }
                    </TableCell>
                    <TableCell align="center">
                      <Chip 
                        label={creator.distribution_method || '-'}
                        size="small"
                        variant="outlined"
                      />
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
          <TablePagination
            rowsPerPageOptions={[5, 10, 25, 50]}
            component="div"
            count={filteredCreators.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            labelRowsPerPage="表示件数:"
            labelDisplayedRows={({ from, to, count }) => `${from}-${to} / 全${count}件`}
          />
        </TableContainer>
      </Box>
    </MainLayout>
  );
}