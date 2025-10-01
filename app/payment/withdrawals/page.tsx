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
  Breadcrumbs,
  Link,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemButton,
} from '@mui/material';
import {
  Search,
  NavigateNext,
} from '@mui/icons-material';

interface Withdrawal {
  id: string;
  created_at: string;
  updated_at: string;
  year: number;
  month: number;
  sales_amount: number;
  reward_amount: number;
  transfer_fee: number;
  payment_amount_with_tax: number;
  payment_amount_without_tax: number;
  payment_amount_tax: number;
  creator_rate: number;
  creator_reward: number;
  bank_transaction_id: string | null;
  bank_transaction?: {
    id: string;
    transaction_date: string;
    amount: number;
    description: string;
  };
  [key: string]: any;
}

interface BankTransaction {
  id: string;
  transaction_date: string;
  amount: number;
  description: string;
  bank_account: string;
  transaction_type: string;
}

export default function WithdrawalsPage() {
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(100);
  
  // 2ヶ月前の年月を計算
  const getTwoMonthsAgo = () => {
    const now = new Date();
    const twoMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 2, 1);
    return {
      year: twoMonthsAgo.getFullYear().toString(),
      month: (twoMonthsAgo.getMonth() + 1).toString()
    };
  };

  const defaultDate = getTwoMonthsAgo();
  const [selectedYear, setSelectedYear] = useState<string>(defaultDate.year);
  const [selectedMonth, setSelectedMonth] = useState<string>(defaultDate.month);
  const [selectedPlatform, setSelectedPlatform] = useState<string>('');
  const [matchDialogOpen, setMatchDialogOpen] = useState(false);
  const [selectedWithdrawal, setSelectedWithdrawal] = useState<Withdrawal | null>(null);
  const [matchingTransactions, setMatchingTransactions] = useState<BankTransaction[]>([]);
  const router = useRouter();

  useEffect(() => {
    fetchWithdrawals();
  }, []);

  const fetchWithdrawals = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/payments?type=withdrawal');
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch withdrawals');
      }
      
      setWithdrawals(result.data || []);
    } catch (error) {
      console.error('Error fetching withdrawals:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMatchTransaction = async (withdrawal: Withdrawal) => {
    setSelectedWithdrawal(withdrawal);
    
    try {
      // 税込支払額と同じ金額のbank_transactionsを取得
      const response = await fetch(`/api/bank-transactions?bank_account=MAIN002&transaction_type=withdrawal&amount=${withdrawal.payment_amount_with_tax}`);
      const result = await response.json();
      
      if (response.ok) {
        setMatchingTransactions(result.data || []);
        setMatchDialogOpen(true);
      } else {
        console.error('Error fetching bank transactions:', result.error);
      }
    } catch (error) {
      console.error('Error fetching bank transactions:', error);
    }
  };

  const handleConfirmMatch = async (transactionId: string) => {
    if (!selectedWithdrawal) return;
    
    try {
      const response = await fetch('/api/payments/match', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          depositId: selectedWithdrawal.id,
          transactionId: transactionId,
        }),
      });
      
      if (response.ok) {
        // データを再取得して更新
        fetchWithdrawals();
        setMatchDialogOpen(false);
        setSelectedWithdrawal(null);
      } else {
        console.error('Error matching transaction');
      }
    } catch (error) {
      console.error('Error matching transaction:', error);
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

  const filteredWithdrawals = withdrawals.filter(withdrawal => {
    // 検索条件
    const matchesSearch = withdrawal.creator_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      withdrawal.platform?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      withdrawal.bank_info?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      withdrawal.note?.toLowerCase().includes(searchTerm.toLowerCase());
    
    // 年月絞り込み
    const matchesYear = selectedYear === '' || withdrawal.year?.toString() === selectedYear;
    const matchesMonth = selectedMonth === '' || withdrawal.month?.toString() === selectedMonth;
    const matchesPlatform = selectedPlatform === '' || withdrawal.platform === selectedPlatform;
    
    return matchesSearch && matchesYear && matchesMonth && matchesPlatform;
  });

  const paginatedWithdrawals = filteredWithdrawals.slice(
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
            onClick={() => router.push('/payment')}
            underline="hover"
            color="inherit"
          >
            入出金管理
          </Link>
          <Typography color="text.primary">出金一覧</Typography>
        </Breadcrumbs>

        {/* 検索バー */}
        <Paper sx={{ p: 2, mb: 3 }}>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'end' }}>
            <Box sx={{ flexGrow: 1, minWidth: 250 }}>
              <TextField
                fullWidth
                size="small"
                placeholder="クリエイター名、プラットフォーム、備考で検索..."
                value={searchTerm}
                onChange={handleSearchChange}
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <Search />
                      </InputAdornment>
                    ),
                  },
                }}
              />
            </Box>
            <Box sx={{ minWidth: 120 }}>
              <FormControl fullWidth size="small">
                <InputLabel>年</InputLabel>
                <Select
                  value={selectedYear}
                  label="年"
                  onChange={(e) => {
                    setSelectedYear(e.target.value);
                    setPage(0);
                  }}
                >
                  <MenuItem value="">全て</MenuItem>
                  {Array.from(new Set(withdrawals.map(w => w.year?.toString()).filter(Boolean))).sort((a, b) => b.localeCompare(a)).map(year => (
                    <MenuItem key={year} value={year}>
                      {year}年
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
            <Box sx={{ minWidth: 100 }}>
              <FormControl fullWidth size="small">
                <InputLabel>月</InputLabel>
                <Select
                  value={selectedMonth}
                  label="月"
                  onChange={(e) => {
                    setSelectedMonth(e.target.value);
                    setPage(0);
                  }}
                >
                  <MenuItem value="">全て</MenuItem>
                  {Array.from(new Set(withdrawals.map(w => w.month?.toString()).filter(Boolean))).sort((a, b) => Number(a) - Number(b)).map(month => (
                    <MenuItem key={month} value={month}>
                      {month}月
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
            <Box sx={{ minWidth: 200 }}>
              <FormControl fullWidth size="small">
                <InputLabel>プラットフォーム</InputLabel>
                <Select
                  value={selectedPlatform}
                  label="プラットフォーム"
                  onChange={(e) => {
                    setSelectedPlatform(e.target.value);
                    setPage(0);
                  }}
                >
                  <MenuItem value="">プラットフォーム全体</MenuItem>
                  {Array.from(new Set(withdrawals.map(w => w.platform).filter(Boolean))).map(platform => (
                    <MenuItem key={platform} value={platform}>
                      {platform}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
          </Box>
        </Paper>

        {/* テーブル */}
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                <TableCell>年月</TableCell>
                <TableCell>プラットフォーム</TableCell>
                <TableCell align="right">売上金額</TableCell>
                <TableCell align="right">報酬金額</TableCell>
                <TableCell align="right">振込手数料</TableCell>
                <TableCell align="right">税込支払額</TableCell>
                <TableCell align="right">税抜支払額</TableCell>
                <TableCell align="right">消費税</TableCell>
                <TableCell align="right">料率</TableCell>
                <TableCell align="right">クリエイター報酬</TableCell>
                <TableCell align="center">銀行照合</TableCell>
                <TableCell align="center">操作</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={12} align="center" sx={{ py: 5 }}>
                    <Typography>読み込み中...</Typography>
                  </TableCell>
                </TableRow>
              ) : paginatedWithdrawals.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={12} align="center" sx={{ py: 5 }}>
                    <Typography>データが見つかりません</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                paginatedWithdrawals.map((withdrawal) => (
                  <TableRow 
                    key={withdrawal.id} 
                    hover
                    sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                  >
                    <TableCell>
                      <Typography fontWeight="medium">
                        {withdrawal.year}年{withdrawal.month}月
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={withdrawal.platform}
                        size="small"
                        color={withdrawal.platform === 'Fantia' ? 'primary' : 'secondary'}
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell align="right">
                      <Typography fontWeight="medium">
                        ¥{withdrawal.sales_amount?.toLocaleString() || '0'}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography fontWeight="medium">
                        ¥{withdrawal.reward_amount?.toLocaleString() || '0'}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography fontWeight="medium">
                        ¥{withdrawal.transfer_fee?.toLocaleString() || '0'}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography fontWeight="medium" color="primary">
                        ¥{withdrawal.payment_amount_with_tax?.toLocaleString() || '0'}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography>
                        ¥{withdrawal.payment_amount_without_tax?.toLocaleString() || '0'}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography>
                        ¥{withdrawal.payment_amount_tax?.toLocaleString() || '0'}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography>
                        {withdrawal.creator_rate ? `${withdrawal.creator_rate}%` : '-'}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography>
                        ¥{withdrawal.creator_reward?.toLocaleString() || '0'}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      {withdrawal.bank_transaction_id ? (
                        <Chip 
                          label="照合済み" 
                          color="success" 
                          size="small" 
                        />
                      ) : (
                        <Chip 
                          label="未照合" 
                          color="warning" 
                          size="small" 
                        />
                      )}
                    </TableCell>
                    <TableCell align="center">
                      <Button 
                        size="small" 
                        variant="outlined"
                        onClick={() => handleMatchTransaction(withdrawal)}
                        disabled={!!withdrawal.bank_transaction_id}
                      >
                        {withdrawal.bank_transaction_id ? '照合済み' : '銀行照合'}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
          <TablePagination
            rowsPerPageOptions={[25, 50, 100]}
            component="div"
            count={filteredWithdrawals.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            labelRowsPerPage="表示件数:"
            labelDisplayedRows={({ from, to, count }) => `${from}-${to} / 全${count}件`}
          />
        </TableContainer>

        {/* 銀行取引照合ダイアログ */}
        <Dialog 
          open={matchDialogOpen} 
          onClose={() => setMatchDialogOpen(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>
            銀行取引との照合 - {selectedWithdrawal?.year}年{selectedWithdrawal?.month}月 {selectedWithdrawal?.platform}
          </DialogTitle>
          <DialogContent>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              税込支払額: ¥{selectedWithdrawal?.payment_amount_with_tax?.toLocaleString()}
            </Typography>
            {matchingTransactions.length === 0 ? (
              <Typography>該当する銀行取引が見つかりません。</Typography>
            ) : (
              <List>
                {matchingTransactions.map((transaction) => (
                  <ListItem key={transaction.id} disablePadding>
                    <ListItemButton onClick={() => handleConfirmMatch(transaction.id)}>
                      <ListItemText
                        primary={`${new Date(transaction.transaction_date).toLocaleDateString('ja-JP')} - ¥${transaction.amount.toLocaleString()}`}
                        secondary={`${transaction.description} (${transaction.bank_account})`}
                      />
                    </ListItemButton>
                  </ListItem>
                ))}
              </List>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setMatchDialogOpen(false)}>キャンセル</Button>
          </DialogActions>
        </Dialog>
      </Box>
    </MainLayout>
  );
}