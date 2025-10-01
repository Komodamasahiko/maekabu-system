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
  Grid,
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

interface Deposit {
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

export default function DepositsPage() {
  const [deposits, setDeposits] = useState<Deposit[]>([]);
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
  const [selectedDeposit, setSelectedDeposit] = useState<Deposit | null>(null);
  const [matchingTransactions, setMatchingTransactions] = useState<BankTransaction[]>([]);
  const router = useRouter();

  useEffect(() => {
    fetchDeposits();
  }, []);

  const fetchDeposits = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/payments?type=deposit');
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch deposits');
      }
      
      setDeposits(result.data || []);
    } catch (error) {
      console.error('Error fetching deposits:', error);
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

  const filteredDeposits = deposits.filter(deposit => {
    // 検索テキストフィルター
    const matchesSearch = searchTerm === '' || 
      (deposit.creator_name || deposit.real_name || deposit.fan_creator?.real_name || deposit.fan_creator?.creator_name || '')
        .toLowerCase().includes(searchTerm.toLowerCase()) ||
      (deposit.platform || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (deposit.note || deposit.description || '').toLowerCase().includes(searchTerm.toLowerCase());
    
    // 年フィルター
    const matchesYear = selectedYear === '' || deposit.year?.toString() === selectedYear;
    
    // 月フィルター
    const matchesMonth = selectedMonth === '' || deposit.month?.toString() === selectedMonth;
    
    // プラットフォームフィルター
    const matchesPlatform = selectedPlatform === '' || deposit.platform === selectedPlatform;
    
    return matchesSearch && matchesYear && matchesMonth && matchesPlatform;
  });

  const paginatedDeposits = filteredDeposits.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  // 年の選択肢を生成（データから動的に取得 + 固定年も追加）
  const dataYears = Array.from(new Set(deposits.map(d => d.year).filter(year => year != null)));
  const currentYear = new Date().getFullYear();
  const allYears = Array.from(new Set([...dataYears, currentYear, currentYear - 1, currentYear - 2]));
  const availableYears = allYears.sort((a, b) => b - a);
  
  // 月の選択肢
  const availableMonths = Array.from({length: 12}, (_, i) => i + 1);
  
  // プラットフォームの選択肢を生成（データから動的に取得 + 固定プラットフォーム追加）
  const dataPlatforms = Array.from(new Set(deposits.map(d => d.platform).filter(Boolean)));
  const fixedPlatforms = ['Fantia', 'Myfans'];
  const allPlatforms = Array.from(new Set([...dataPlatforms, ...fixedPlatforms]));
  const availablePlatforms = allPlatforms.sort();

  // 銀行取引との照合ダイアログを開く
  const handleOpenMatchDialog = async (deposit: Deposit) => {
    setSelectedDeposit(deposit);
    setMatchDialogOpen(true);
    
    // 税込支払額と同じ金額の銀行取引を取得
    try {
      const response = await fetch(`/api/bank-transactions?amount=${deposit.payment_amount_with_tax}`);
      const result = await response.json();
      
      if (response.ok) {
        setMatchingTransactions(result.data || []);
      } else {
        console.error('Failed to fetch matching transactions:', result.error);
        setMatchingTransactions([]);
      }
    } catch (error) {
      console.error('Error fetching matching transactions:', error);
      setMatchingTransactions([]);
    }
  };

  // 銀行取引との照合を実行
  const handleMatchTransaction = async (bankTransactionId: string) => {
    if (!selectedDeposit) return;
    
    try {
      // TODO: API実装 - fan_platform_depositのbank_transaction_idを更新
      console.log('Matching deposit', selectedDeposit.id, 'with bank transaction', bankTransactionId);
      
      // 一時的にローカルで更新（実際はAPIを呼ぶ）
      setDeposits(prev => prev.map(d => 
        d.id === selectedDeposit.id 
          ? { ...d, bank_transaction_id: bankTransactionId }
          : d
      ));
      
      setMatchDialogOpen(false);
      setSelectedDeposit(null);
      setMatchingTransactions([]);
    } catch (error) {
      console.error('Error matching transaction:', error);
    }
  };

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
          <Typography color="text.primary">入金一覧</Typography>
        </Breadcrumbs>

        {/* 検索・フィルター */}
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
                  {availableYears.map(year => (
                    <MenuItem key={year} value={year.toString()}>
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
                  {availableMonths.map(month => (
                    <MenuItem key={month} value={month.toString()}>
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
                  {availablePlatforms.map(platform => (
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
                <TableCell>クリエイター名</TableCell>
                <TableCell>プラットフォーム</TableCell>
                <TableCell align="right">売上金額</TableCell>
                <TableCell align="right">報酬金額</TableCell>
                <TableCell align="right">振込手数料</TableCell>
                <TableCell align="right">税込支払額</TableCell>
                <TableCell align="right">税抜支払額</TableCell>
                <TableCell align="right">消費税</TableCell>
                <TableCell align="center">料率</TableCell>
                <TableCell align="right">CR報酬</TableCell>
                <TableCell align="center">銀行照合</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={12} align="center" sx={{ py: 5 }}>
                    <Typography>読み込み中...</Typography>
                  </TableCell>
                </TableRow>
              ) : paginatedDeposits.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={12} align="center" sx={{ py: 5 }}>
                    <Typography>データが見つかりません</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                paginatedDeposits.map((deposit) => (
                  <TableRow 
                    key={deposit.id} 
                    hover
                    sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                  >
                    <TableCell>
                      <Typography fontWeight="medium">
                        {deposit.year}年{deposit.month}月
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography fontWeight="medium">
                        {deposit.creator_name || deposit.real_name || deposit.fan_creator?.real_name || deposit.fan_creator?.creator_name || '-'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={deposit.platform || '-'}
                        size="small"
                        color={deposit.platform === 'Fantia' ? 'primary' : 'secondary'}
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell align="right">
                      ¥{(deposit.sales_amount || 0).toLocaleString()}
                    </TableCell>
                    <TableCell align="right">
                      ¥{(deposit.reward_amount || 0).toLocaleString()}
                    </TableCell>
                    <TableCell align="right">
                      ¥{(deposit.transfer_fee || 0).toLocaleString()}
                    </TableCell>
                    <TableCell align="right">
                      <Typography fontWeight="medium">
                        ¥{(deposit.payment_amount_with_tax || 0).toLocaleString()}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      ¥{(deposit.payment_amount_without_tax || 0).toLocaleString()}
                    </TableCell>
                    <TableCell align="right">
                      ¥{(deposit.payment_amount_tax || 0).toLocaleString()}
                    </TableCell>
                    <TableCell align="center">
                      {deposit.creator_rate || 0}%
                    </TableCell>
                    <TableCell align="right">
                      <Typography fontWeight="medium" color="primary">
                        ¥{(deposit.creator_reward || 0).toLocaleString()}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      {deposit.bank_transaction_id ? (
                        <Chip 
                          label="照合済" 
                          size="small"
                          color="success"
                          variant="filled"
                        />
                      ) : (
                        <Button
                          size="small"
                          variant="outlined"
                          color="primary"
                          onClick={() => handleOpenMatchDialog(deposit)}
                        >
                          照合
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
          <TablePagination
            rowsPerPageOptions={[50, 100, 200, 500]}
            component="div"
            count={filteredDeposits.length}
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
            銀行取引との照合
            {selectedDeposit && (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                対象金額: ¥{(selectedDeposit.payment_amount_with_tax || 0).toLocaleString()}
              </Typography>
            )}
          </DialogTitle>
          <DialogContent>
            {matchingTransactions.length === 0 ? (
              <Typography color="text.secondary" sx={{ py: 3, textAlign: 'center' }}>
                該当する銀行取引が見つかりません
              </Typography>
            ) : (
              <List>
                {matchingTransactions.map((transaction) => (
                  <ListItem key={transaction.id} disablePadding>
                    <ListItemButton onClick={() => handleMatchTransaction(transaction.id)}>
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Typography fontWeight="medium">
                              {new Date(transaction.transaction_date).toLocaleDateString('ja-JP')}
                            </Typography>
                            <Typography fontWeight="bold" color="primary">
                              ¥{transaction.amount.toLocaleString()}
                            </Typography>
                          </Box>
                        }
                        secondary={
                          <Box>
                            <Typography variant="body2">
                              {transaction.description}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {transaction.bank_account} - {transaction.transaction_type}
                            </Typography>
                          </Box>
                        }
                      />
                    </ListItemButton>
                  </ListItem>
                ))}
              </List>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setMatchDialogOpen(false)}>
              キャンセル
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </MainLayout>
  );
}