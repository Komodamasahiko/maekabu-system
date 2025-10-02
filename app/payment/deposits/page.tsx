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
  Breadcrumbs,
  Link,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import {
  Search,
  NavigateNext,
} from '@mui/icons-material';

interface BankTransaction {
  id: string;
  transaction_date: string;
  transaction_type: string;
  bank_account: string;
  counterpart_name: string;
  amount: number;
  description: string;
  balance: number;
  created_at: string;
  updated_at: string;
}

export default function DepositsPage() {
  const [transactions, setTransactions] = useState<BankTransaction[]>([]);
  const [allTransactions, setAllTransactions] = useState<BankTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [myfansTotal, setMyfansTotal] = useState(0);
  const [fantiaTotal, setFantiaTotal] = useState(0);
  
  // 期間絞り込み用のstate（初期値は当月）
  const currentDate = new Date();
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth() + 1);
  
  const router = useRouter();

  useEffect(() => {
    fetchTransactions();
  }, []);

  useEffect(() => {
    filterTransactionsByPeriod();
  }, [selectedYear, selectedMonth, allTransactions]);

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      // bank_transactionsテーブルから transaction_type=deposit, bank_account=MAIN002 のデータを取得
      const response = await fetch('/api/bank-transactions?bank_account=MAIN002&transaction_type=deposit');
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch transactions');
      }
      
      // 振込先名に「トクネコ」または「トラノアナ」を含むデータのみフィルタリング
      const filteredData = (result.data || []).filter((transaction: BankTransaction) => {
        const description = transaction.description || '';
        return description.includes('トクネコ') || 
               description.includes('トラノアナ');
      });
      
      setAllTransactions(filteredData);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterTransactionsByPeriod = () => {
    if (allTransactions.length === 0) return;
    
    const filtered = allTransactions.filter(transaction => {
      const transactionDate = new Date(transaction.transaction_date);
      return transactionDate.getFullYear() === selectedYear &&
             transactionDate.getMonth() + 1 === selectedMonth;
    });
    
    // マイファンズ（トクネコ）とファンティア（トラノアナ）の合計を計算
    let myfans = 0;
    let fantia = 0;
    
    filtered.forEach(transaction => {
      const description = transaction.description || '';
      if (description.includes('トクネコ')) {
        myfans += transaction.amount;
      } else if (description.includes('トラノアナ')) {
        fantia += transaction.amount;
      }
    });
    
    setMyfansTotal(myfans);
    setFantiaTotal(fantia);
    setTransactions(filtered);
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

  // 検索フィルタリング
  const filteredTransactions = transactions.filter(transaction => {
    const matchesSearch = 
      transaction.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.amount?.toString().includes(searchTerm);
    
    return matchesSearch;
  });

  // ページネーション
  const paginatedTransactions = filteredTransactions.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  return (
    <MainLayout>
      <Box sx={{ p: 3 }}>
        {/* パンくずリスト */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Breadcrumbs separator={<NavigateNext fontSize="small" />}>
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
        </Box>

        {/* 検索バー と 期間絞り込み */}
        <Paper sx={{ p: 2, mb: 3 }}>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center', mb: 2 }}>
            <TextField
              sx={{ flex: 1, minWidth: 250 }}
              size="small"
              placeholder="振込先名、金額で検索..."
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
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>年</InputLabel>
              <Select
                value={selectedYear}
                label="年"
                onChange={(e) => {
                  setSelectedYear(Number(e.target.value));
                  setPage(0);
                }}
              >
                {[2024, 2025, 2026].map(year => (
                  <MenuItem key={year} value={year}>{year}年</MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl size="small" sx={{ minWidth: 100 }}>
              <InputLabel>月</InputLabel>
              <Select
                value={selectedMonth}
                label="月"
                onChange={(e) => {
                  setSelectedMonth(Number(e.target.value));
                  setPage(0);
                }}
              >
                {Array.from({length: 12}, (_, i) => i + 1).map(month => (
                  <MenuItem key={month} value={month}>{month}月</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
          
          {/* 月別入金額合計 */}
          {!loading && (
            <>
              <Box sx={{ 
                display: 'flex', 
                gap: 3, 
                p: 2, 
                backgroundColor: '#f5f5f5', 
                borderRadius: 1,
                flexWrap: 'wrap'
              }}>
                <Box>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    マイファンズ入金（トクネコ）
                  </Typography>
                  <Typography variant="h6" color="primary">
                    ¥{myfansTotal.toLocaleString()}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    ファンティア入金（トラノアナ）
                  </Typography>
                  <Typography variant="h6" color="primary">
                    ¥{fantiaTotal.toLocaleString()}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    合計入金額
                  </Typography>
                  <Typography variant="h6" fontWeight="bold">
                    ¥{(myfansTotal + fantiaTotal).toLocaleString()}
                  </Typography>
                </Box>
              </Box>
              <Typography 
                variant="caption" 
                color="text.secondary" 
                sx={{ mt: 1, display: 'block' }}
              >
                ※データは銀行の入金データになります。
              </Typography>
            </>
          )}
        </Paper>

        {/* テーブル */}
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                <TableCell>取引日</TableCell>
                <TableCell>振込先名</TableCell>
                <TableCell align="right">入金額</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={3} align="center" sx={{ py: 5 }}>
                    <Typography>読み込み中...</Typography>
                  </TableCell>
                </TableRow>
              ) : paginatedTransactions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} align="center" sx={{ py: 5 }}>
                    <Typography>データが見つかりません</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                paginatedTransactions.map((transaction) => (
                  <TableRow 
                    key={transaction.id} 
                    hover
                    sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                  >
                    <TableCell>
                      <Typography variant="body2">
                        {new Date(transaction.transaction_date).toLocaleDateString('ja-JP', {
                          year: 'numeric',
                          month: '2-digit',
                          day: '2-digit'
                        })}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {transaction.description || '-'}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body2" fontWeight="medium" color="primary">
                        ¥{transaction.amount.toLocaleString()}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
          <TablePagination
            rowsPerPageOptions={[25, 50, 100]}
            component="div"
            count={filteredTransactions.length}
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