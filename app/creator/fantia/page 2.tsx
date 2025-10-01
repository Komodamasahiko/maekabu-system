'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import DepartmentLayout from '@/components/department/DepartmentLayout';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import {
  Box,
  Card,
  CardContent,
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
  ArrowBack,
  Person,
  Group,
  Percent,
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

export default function FantiaPage() {
  const [creators, setCreators] = useState<FanPfCreator[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const supabase = createClientComponentClient();
  const router = useRouter();

  useEffect(() => {
    fetchCreators();
  }, []);

  const fetchCreators = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('fan_pf_creator')
        .select('*')
        .eq('platform', 'Fantia')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCreators(data || []);
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
    creator.platform_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    creator.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    creator.manager?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const paginatedCreators = filteredCreators.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  // 統計計算
  const totalCreators = creators.length;
  const exclusiveCount = creators.filter(c => c.registration_type === '独占').length;
  const nonExclusiveCount = creators.filter(c => c.registration_type === '非独占').length;
  const avgCreatorRate = creators.length > 0 
    ? (creators.reduce((sum, c) => sum + (c.creator_rate || 0), 0) / creators.length * 100).toFixed(1)
    : 0;

  return (
    <DepartmentLayout departmentName="ファン事業部" departmentCode="fan_dep">
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
          <Typography color="text.primary">Fantia</Typography>
        </Breadcrumbs>

        <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
          <IconButton onClick={() => router.push('/creator')}>
            <ArrowBack />
          </IconButton>
          <Typography variant="h4">
            Fantia クリエイター
          </Typography>
        </Box>

        {/* 統計カード */}
        <Box sx={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: 2,
          mb: 3
        }}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Person sx={{ color: 'primary.main', mr: 1 }} />
                <Typography color="text.secondary" variant="body2">
                  総クリエイター数
                </Typography>
              </Box>
              <Typography variant="h5">
                {totalCreators}
              </Typography>
            </CardContent>
          </Card>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Group sx={{ color: 'success.main', mr: 1 }} />
                <Typography color="text.secondary" variant="body2">
                  独占契約
                </Typography>
              </Box>
              <Typography variant="h5">
                {exclusiveCount}
              </Typography>
            </CardContent>
          </Card>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Group sx={{ color: 'info.main', mr: 1 }} />
                <Typography color="text.secondary" variant="body2">
                  非独占契約
                </Typography>
              </Box>
              <Typography variant="h5">
                {nonExclusiveCount}
              </Typography>
            </CardContent>
          </Card>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Percent sx={{ color: 'warning.main', mr: 1 }} />
                <Typography color="text.secondary" variant="body2">
                  平均クリエイター料率
                </Typography>
              </Box>
              <Typography variant="h5">
                {avgCreatorRate}%
              </Typography>
            </CardContent>
          </Card>
        </Box>

        {/* 検索バー */}
        <Paper sx={{ p: 2, mb: 3 }}>
          <TextField
            fullWidth
            placeholder="クリエイター名、プラットフォームID、メール、マネージャーで検索..."
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
                <TableCell>プラットフォームID</TableCell>
                <TableCell>クリエイター名</TableCell>
                <TableCell>URL</TableCell>
                <TableCell>メール</TableCell>
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
                  <TableCell colSpan={9} align="center" sx={{ py: 5 }}>
                    <Typography>読み込み中...</Typography>
                  </TableCell>
                </TableRow>
              ) : paginatedCreators.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} align="center" sx={{ py: 5 }}>
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
                        color="primary"
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
                          color="primary"
                          onClick={() => window.open(creator.url, '_blank')}
                        >
                          <LinkIcon fontSize="small" />
                        </IconButton>
                      ) : '-'}
                    </TableCell>
                    <TableCell>{creator.email || '-'}</TableCell>
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
    </DepartmentLayout>
  );
}