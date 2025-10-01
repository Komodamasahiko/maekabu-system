'use client';

import { useEffect, useState } from 'react';
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
  IconButton,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tabs,
  Tab,
} from '@mui/material';
import {
  Search,
  Person,
  AccountBalance,
  Email,
  ArrowForward,
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';

interface FanCreator {
  id: number;
  status: string | null;
  real_name: string | null;
  creator_name: string | null;
  invoice_number: string | null;
  login_id: string;
  login_password: string | null;
  transfer_fee_burden: string | null;
  bank_code: string | null;
  bank_name: string | null;
  branch_code: string | null;
  branch_name: string | null;
  account_type: string | null;
  account_holder: string | null;
  account_number: string | null;
  address: string | null;
  phone: string | null;
  email: string | null;
  birthday: string | null;
  created_at: string;
  updated_at: string;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

export default function CreatorManagement() {
  const [creators, setCreators] = useState<FanCreator[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [selectedCreator, setSelectedCreator] = useState<FanCreator | null>(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const supabase = createClientComponentClient();
  const router = useRouter();

  useEffect(() => {
    fetchCreators();
  }, []);

  const fetchCreators = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('fan_creator')
        .select('*')
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

  const handleViewDetails = (creator: FanCreator) => {
    setSelectedCreator(creator);
    setDetailDialogOpen(true);
    setTabValue(0);
  };

  const handleCloseDialog = () => {
    setDetailDialogOpen(false);
    setSelectedCreator(null);
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const filteredCreators = creators.filter(creator =>
    creator.real_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    creator.creator_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    creator.login_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    creator.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    creator.invoice_number?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const paginatedCreators = filteredCreators.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  return (
    <DepartmentLayout departmentName="ファン事業部" departmentCode="fan_dep">
      <Box sx={{ p: 3 }}>
        <Box sx={{ mb: 3 }}>
          <Typography variant="h4" gutterBottom>
            クリエイター管理
          </Typography>
        </Box>

        {/* プラットフォーム別ナビゲーション */}
        <Box sx={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: 2,
          mb: 3
        }}>
          <Card 
            sx={{ 
              cursor: 'pointer',
              transition: 'all 0.3s',
              '&:hover': { 
                transform: 'translateY(-4px)',
                boxShadow: 3,
                backgroundColor: 'primary.lighter'
              }
            }}
            onClick={() => router.push('/creator/fantia')}
          >
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="h6" color="primary">
                    Fantia
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    クリエイターデータを表示
                  </Typography>
                </Box>
                <ArrowForward sx={{ color: 'primary.main' }} />
              </Box>
            </CardContent>
          </Card>
          
          <Card 
            sx={{ 
              cursor: 'pointer',
              transition: 'all 0.3s',
              '&:hover': { 
                transform: 'translateY(-4px)',
                boxShadow: 3,
                backgroundColor: 'secondary.lighter'
              }
            }}
            onClick={() => router.push('/creator/myfans')}
          >
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="h6" color="secondary">
                    Myfans
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    クリエイターデータを表示
                  </Typography>
                </Box>
                <ArrowForward sx={{ color: 'secondary.main' }} />
              </Box>
            </CardContent>
          </Card>
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
              <Typography variant="h4">
                {creators.length}
              </Typography>
            </CardContent>
          </Card>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <AccountBalance sx={{ color: 'success.main', mr: 1 }} />
                <Typography color="text.secondary" variant="body2">
                  銀行口座登録済み
                </Typography>
              </Box>
              <Typography variant="h4">
                {creators.filter(c => c.bank_name).length}
              </Typography>
            </CardContent>
          </Card>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Email sx={{ color: 'info.main', mr: 1 }} />
                <Typography color="text.secondary" variant="body2">
                  メールアドレス登録済み
                </Typography>
              </Box>
              <Typography variant="h4">
                {creators.filter(c => c.email).length}
              </Typography>
            </CardContent>
          </Card>
        </Box>

        {/* 検索バー */}
        <Paper sx={{ p: 2, mb: 3 }}>
          <TextField
            fullWidth
            placeholder="本名、CR名、ログインID、メールアドレス、インボイス番号で検索..."
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
                <TableCell>ID</TableCell>
                <TableCell>状態</TableCell>
                <TableCell>本名</TableCell>
                <TableCell>インボイス番号</TableCell>
                <TableCell>メール</TableCell>
                <TableCell>電話番号</TableCell>
                <TableCell>誕生日</TableCell>
                <TableCell align="center">詳細</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ py: 5 }}>
                    <Typography>読み込み中...</Typography>
                  </TableCell>
                </TableRow>
              ) : paginatedCreators.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ py: 5 }}>
                    <Typography>データが見つかりません</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                paginatedCreators.map((creator) => (
                  <TableRow 
                    key={creator.id} 
                    hover
                    sx={{ 
                      '&:last-child td, &:last-child th': { border: 0 },
                      cursor: 'pointer' 
                    }}
                    onClick={() => handleViewDetails(creator)}
                  >
                    <TableCell>{creator.id}</TableCell>
                    <TableCell>
                      <Chip 
                        label={creator.status || '稼働'} 
                        size="small"
                        color={creator.status === '稼働' ? 'success' : 'default'}
                      />
                    </TableCell>
                    <TableCell>{creator.real_name || '-'}</TableCell>
                    <TableCell>{creator.invoice_number || '-'}</TableCell>
                    <TableCell>{creator.email || '-'}</TableCell>
                    <TableCell>{creator.phone || '-'}</TableCell>
                    <TableCell>
                      {creator.birthday ? 
                        new Date(creator.birthday).toLocaleDateString('ja-JP') : 
                        '-'
                      }
                    </TableCell>
                    <TableCell align="center">
                      <Button 
                        size="small" 
                        variant="outlined"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleViewDetails(creator);
                        }}
                      >
                        詳細
                      </Button>
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

        {/* 詳細ダイアログ */}
        <Dialog 
          open={detailDialogOpen} 
          onClose={handleCloseDialog}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>
            クリエイター詳細情報
          </DialogTitle>
          <DialogContent>
            {selectedCreator && (
              <Box>
                <Tabs value={tabValue} onChange={handleTabChange} sx={{ borderBottom: 1, borderColor: 'divider' }}>
                  <Tab label="基本情報" />
                  <Tab label="銀行口座情報" />
                </Tabs>

                <TabPanel value={tabValue} index={0}>
                  <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 2 }}>
                    <Box>
                      <Typography variant="caption" color="text.secondary">状態</Typography>
                      <Typography variant="body1" gutterBottom>{selectedCreator.status || '稼働'}</Typography>
                    </Box>
                    <Box>
                      <Typography variant="caption" color="text.secondary">本名</Typography>
                      <Typography variant="body1" gutterBottom>{selectedCreator.real_name || '-'}</Typography>
                    </Box>
                    <Box>
                      <Typography variant="caption" color="text.secondary">クリエイター名</Typography>
                      <Typography variant="body1" gutterBottom>{selectedCreator.creator_name || '-'}</Typography>
                    </Box>
                    <Box>
                      <Typography variant="caption" color="text.secondary">インボイス番号</Typography>
                      <Typography variant="body1" gutterBottom>{selectedCreator.invoice_number || '-'}</Typography>
                    </Box>
                    <Box>
                      <Typography variant="caption" color="text.secondary">ログインID</Typography>
                      <Typography variant="body1" gutterBottom>{selectedCreator.login_id}</Typography>
                    </Box>
                    <Box>
                      <Typography variant="caption" color="text.secondary">ログインパスワード</Typography>
                      <Typography variant="body1" gutterBottom>{'********'}</Typography>
                    </Box>
                    <Box>
                      <Typography variant="caption" color="text.secondary">振込手数料負担</Typography>
                      <Typography variant="body1" gutterBottom>{selectedCreator.transfer_fee_burden || '-'}</Typography>
                    </Box>
                    <Box>
                      <Typography variant="caption" color="text.secondary">誕生日</Typography>
                      <Typography variant="body1" gutterBottom>
                        {selectedCreator.birthday ? new Date(selectedCreator.birthday).toLocaleDateString('ja-JP') : '-'}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="caption" color="text.secondary">メールアドレス</Typography>
                      <Typography variant="body1" gutterBottom>{selectedCreator.email || '-'}</Typography>
                    </Box>
                    <Box>
                      <Typography variant="caption" color="text.secondary">電話番号</Typography>
                      <Typography variant="body1" gutterBottom>{selectedCreator.phone || '-'}</Typography>
                    </Box>
                    <Box sx={{ gridColumn: 'span 2' }}>
                      <Typography variant="caption" color="text.secondary">住所</Typography>
                      <Typography variant="body1" gutterBottom>{selectedCreator.address || '-'}</Typography>
                    </Box>
                    <Box>
                      <Typography variant="caption" color="text.secondary">作成日</Typography>
                      <Typography variant="body1" gutterBottom>
                        {new Date(selectedCreator.created_at).toLocaleDateString('ja-JP')}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="caption" color="text.secondary">更新日</Typography>
                      <Typography variant="body1" gutterBottom>
                        {new Date(selectedCreator.updated_at).toLocaleDateString('ja-JP')}
                      </Typography>
                    </Box>
                  </Box>
                </TabPanel>

                <TabPanel value={tabValue} index={1}>
                  <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 2 }}>
                    <Box>
                      <Typography variant="caption" color="text.secondary">銀行コード</Typography>
                      <Typography variant="body1" gutterBottom>{selectedCreator.bank_code || '-'}</Typography>
                    </Box>
                    <Box>
                      <Typography variant="caption" color="text.secondary">銀行名</Typography>
                      <Typography variant="body1" gutterBottom>{selectedCreator.bank_name || '-'}</Typography>
                    </Box>
                    <Box>
                      <Typography variant="caption" color="text.secondary">支店コード</Typography>
                      <Typography variant="body1" gutterBottom>{selectedCreator.branch_code || '-'}</Typography>
                    </Box>
                    <Box>
                      <Typography variant="caption" color="text.secondary">支店名</Typography>
                      <Typography variant="body1" gutterBottom>{selectedCreator.branch_name || '-'}</Typography>
                    </Box>
                    <Box>
                      <Typography variant="caption" color="text.secondary">口座種別</Typography>
                      <Typography variant="body1" gutterBottom>{selectedCreator.account_type || '-'}</Typography>
                    </Box>
                    <Box>
                      <Typography variant="caption" color="text.secondary">口座番号</Typography>
                      <Typography variant="body1" gutterBottom>{selectedCreator.account_number || '-'}</Typography>
                    </Box>
                    <Box sx={{ gridColumn: 'span 2' }}>
                      <Typography variant="caption" color="text.secondary">口座名義</Typography>
                      <Typography variant="body1" gutterBottom>{selectedCreator.account_holder || '-'}</Typography>
                    </Box>
                  </Box>
                </TabPanel>
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog} variant="contained" color="primary">
              閉じる
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </DepartmentLayout>
  );
}