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
  Autocomplete,
} from '@mui/material';
import {
  Search,
  NavigateNext,
  Delete,
} from '@mui/icons-material';

interface TransferRequest {
  id: string;
  created_at: string;
  updated_at: string;
  work_year: number;
  work_month: number;
  deposit_year: number;
  deposit_month: number;
  fan_pf_creator_id: number;
  deposit_amount: number;
  note: string | null;
  status: 'pending' | 'approved' | 'rejected' | 'paid';
  approved_by: string | null;
  approved_at: string | null;
  payment_date: string | null;
  bank_transaction_id: string | null;
  fan_pf_creator?: {
    id: number;
    creator_name: string;
    platform: string;
    creator_rate?: number;
    agency_id?: string;
    agency_name?: string;
    agency_rate?: number;
    distribution_method?: string;
    agency?: {
      agency_name: string;
    };
  };
  approved_employee?: {
    id: string;
    display_name: string;
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

export default function TransferRequestPage() {
  const [transferRequests, setTransferRequests] = useState<TransferRequest[]>([]);
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
  const [selectedTransferRequest, setSelectedTransferRequest] = useState<TransferRequest | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<TransferRequest | null>(null);
  const [matchingTransactions, setMatchingTransactions] = useState<BankTransaction[]>([]);
  
  // 新規入力用state
  const [newRequestDialogOpen, setNewRequestDialogOpen] = useState(false);
  const [creators, setCreators] = useState<any[]>([]);
  const [selectedPlatformForForm, setSelectedPlatformForForm] = useState<string>('');
  const [formData, setFormData] = useState({
    deposit_year: new Date().getFullYear(),
    deposit_month: new Date().getMonth() + 1,
    fan_pf_creator_id: '',
    deposit_amount: '',
    note: ''
  });
  const router = useRouter();

  useEffect(() => {
    fetchTransferRequests();
    fetchCreators();
  }, []);

  const fetchTransferRequests = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/payments?type=transfer-request');
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch transfer requests');
      }
      
      setTransferRequests(result.data || []);
    } catch (error) {
      console.error('Error fetching transfer requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCreators = async () => {
    try {
      const response = await fetch('/api/creators');
      const result = await response.json();
      
      if (response.ok) {
        setCreators(result.data || []);
      }
    } catch (error) {
      console.error('Error fetching creators:', error);
    }
  };

  const handleOpenNewRequest = () => {
    setFormData({
      deposit_year: new Date().getFullYear(),
      deposit_month: new Date().getMonth() + 1,
      fan_pf_creator_id: '',
      deposit_amount: '',
      note: ''
    });
    setSelectedPlatformForForm('');
    setNewRequestDialogOpen(true);
  };

  // プラットフォーム変更時にクリエイター選択をリセット
  const handlePlatformChange = (platform: string) => {
    setSelectedPlatformForForm(platform);
    setFormData({...formData, fan_pf_creator_id: ''});
  };

  const handleSubmitNewRequest = async () => {
    try {
      // 入金年月から2ヶ月前を稼働年月として計算
      const depositDate = new Date(formData.deposit_year, formData.deposit_month - 1);
      const workDate = new Date(depositDate.getFullYear(), depositDate.getMonth() - 2);
      const work_year = workDate.getFullYear();
      const work_month = workDate.getMonth() + 1;

      const response = await fetch('/api/payments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'transfer-request',
          work_year,
          work_month,
          deposit_year: formData.deposit_year,
          deposit_month: formData.deposit_month,
          deposit_amount: parseFloat(formData.deposit_amount),
          fan_pf_creator_id: parseInt(formData.fan_pf_creator_id),
          note: formData.note
        }),
      });

      if (response.ok) {
        setNewRequestDialogOpen(false);
        fetchTransferRequests(); // データを再取得
      } else {
        const error = await response.json();
        console.error('Error creating transfer request:', error);
        alert('申請の作成に失敗しました');
      }
    } catch (error) {
      console.error('Error creating transfer request:', error);
      alert('申請の作成に失敗しました');
    }
  };

  const handleMatchTransaction = async (transferRequest: TransferRequest) => {
    setSelectedTransferRequest(transferRequest);
    
    try {
      // 入金額と同じ金額のbank_transactionsを取得
      const response = await fetch(`/api/bank-transactions?bank_account=MAIN002&transaction_type=withdrawal&amount=${transferRequest.deposit_amount}`);
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

  const handleDeleteClick = (request: TransferRequest) => {
    setDeleteTarget(request);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    
    try {
      const response = await fetch(`/api/payments/${deleteTarget.id}?type=transfer-request`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        setDeleteDialogOpen(false);
        setDeleteTarget(null);
        fetchTransferRequests(); // データを再取得
      } else {
        const error = await response.json();
        console.error('Error deleting transfer request:', error);
        alert('削除に失敗しました');
      }
    } catch (error) {
      console.error('Error deleting transfer request:', error);
      alert('削除に失敗しました');
    }
  };

  const handleConfirmMatch = async (transactionId: string) => {
    if (!selectedTransferRequest) return;
    
    try {
      const response = await fetch('/api/payments/match', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          depositId: selectedTransferRequest.id,
          transactionId: transactionId,
        }),
      });
      
      if (response.ok) {
        // データを再取得して更新
        fetchTransferRequests();
        setMatchDialogOpen(false);
        setSelectedTransferRequest(null);
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

  const filteredTransferRequests = transferRequests.filter(request => {
    // 検索条件
    const matchesSearch = request.fan_pf_creator?.creator_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.fan_pf_creator?.platform?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.note?.toLowerCase().includes(searchTerm.toLowerCase());
    
    // 年月絞り込み（稼働年月で絞り込み）
    const matchesYear = selectedYear === '' || request.work_year?.toString() === selectedYear;
    const matchesMonth = selectedMonth === '' || request.work_month?.toString() === selectedMonth;
    const matchesPlatform = selectedPlatform === '' || request.fan_pf_creator?.platform === selectedPlatform;
    
    return matchesSearch && matchesYear && matchesMonth && matchesPlatform;
  });

  const paginatedTransferRequests = filteredTransferRequests.slice(
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
            <Typography color="text.primary">振込申請</Typography>
          </Breadcrumbs>
          
          <Button
            variant="contained"
            color="primary"
            size="small"
            onClick={handleOpenNewRequest}
          >
            新規入力
          </Button>
        </Box>

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
                  {Array.from(new Set(transferRequests.map(r => r.work_year?.toString()).filter(Boolean))).sort((a, b) => b.localeCompare(a)).map(year => (
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
                  {Array.from(new Set(transferRequests.map(r => r.work_month?.toString()).filter(Boolean))).sort((a, b) => Number(a) - Number(b)).map(month => (
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
                  {Array.from(new Set(transferRequests.map(r => r.fan_pf_creator?.platform).filter(Boolean))).map(platform => (
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
                <TableCell>稼働年月</TableCell>
                <TableCell>入金年月</TableCell>
                <TableCell>クリエイター名</TableCell>
                <TableCell>プラットフォーム</TableCell>
                <TableCell align="center">料率(%)</TableCell>
                <TableCell>エージェンシー</TableCell>
                <TableCell align="center">エージェンシー率(%)</TableCell>
                <TableCell>配信方法</TableCell>
                <TableCell align="right">入金額</TableCell>
                <TableCell>備考</TableCell>
                <TableCell align="center">ステータス</TableCell>
                <TableCell>承認者</TableCell>
                <TableCell align="center">銀行照合</TableCell>
                <TableCell align="center">操作</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={14} align="center" sx={{ py: 5 }}>
                    <Typography>読み込み中...</Typography>
                  </TableCell>
                </TableRow>
              ) : paginatedTransferRequests.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={14} align="center" sx={{ py: 5 }}>
                    <Typography>データが見つかりません</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                paginatedTransferRequests.map((request) => (
                  <TableRow 
                    key={request.id} 
                    hover
                    sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                  >
                    <TableCell>
                      <Typography fontWeight="medium">
                        {request.work_year}年{request.work_month}月
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography>
                        {request.deposit_year}年{request.deposit_month}月
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography fontWeight="medium">
                        {request.fan_pf_creator?.creator_name || '-'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={request.fan_pf_creator?.platform || '-'}
                        size="small"
                        color={request.fan_pf_creator?.platform === 'Fantia' ? 'primary' : 'secondary'}
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Typography variant="body2">
                        {request.fan_pf_creator?.creator_rate ? (request.fan_pf_creator.creator_rate * 100).toFixed(0) + '%' : '-'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {request.fan_pf_creator?.agency_name || 
                         (request.fan_pf_creator?.agency_id ? `Agency ${request.fan_pf_creator.agency_id}` : '-')}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Typography variant="body2">
                        {request.fan_pf_creator?.agency_rate ? (request.fan_pf_creator.agency_rate * 100).toFixed(0) + '%' : '-'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {request.fan_pf_creator?.distribution_method || '-'}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography fontWeight="medium" color="primary">
                        ¥{request.deposit_amount?.toLocaleString() || '0'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {request.note || '-'}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Chip 
                        label={
                          request.status === 'pending' ? '申請中' :
                          request.status === 'approved' ? '承認済み' :
                          request.status === 'rejected' ? '却下' :
                          request.status === 'paid' ? '支払済み' : request.status
                        }
                        size="small"
                        color={
                          request.status === 'pending' ? 'warning' :
                          request.status === 'approved' ? 'info' :
                          request.status === 'rejected' ? 'error' :
                          request.status === 'paid' ? 'success' : 'default'
                        }
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {request.approved_employee?.display_name || '-'}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      {request.bank_transaction_id ? (
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
                      <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                        <Button 
                          size="small" 
                          variant="outlined"
                          onClick={() => handleMatchTransaction(request)}
                          disabled={!!request.bank_transaction_id}
                        >
                          {request.bank_transaction_id ? '照合済み' : '銀行照合'}
                        </Button>
                        <Button
                          size="small"
                          variant="outlined"
                          color="error"
                          onClick={() => handleDeleteClick(request)}
                          startIcon={<Delete />}
                        >
                          削除
                        </Button>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
          <TablePagination
            rowsPerPageOptions={[25, 50, 100]}
            component="div"
            count={filteredTransferRequests.length}
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
            銀行取引との照合 - {selectedTransferRequest?.work_year}年{selectedTransferRequest?.work_month}月 {selectedTransferRequest?.fan_pf_creator?.platform}
          </DialogTitle>
          <DialogContent>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              入金額: ¥{selectedTransferRequest?.deposit_amount?.toLocaleString()}
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

        {/* 新規入力ダイアログ */}
        <Dialog 
          open={newRequestDialogOpen} 
          onClose={() => setNewRequestDialogOpen(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>新規振込入力</DialogTitle>
          <DialogContent>
            <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 3 }}>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <TextField
                  fullWidth
                  label="入金年"
                  type="number"
                  value={formData.deposit_year}
                  onChange={(e) => setFormData({...formData, deposit_year: parseInt(e.target.value)})}
                  InputProps={{ inputProps: { min: 2020, max: 2030 } }}
                />
                <FormControl fullWidth>
                  <InputLabel>入金月</InputLabel>
                  <Select
                    value={formData.deposit_month}
                    label="入金月"
                    onChange={(e) => setFormData({...formData, deposit_month: e.target.value as number})}
                  >
                    {Array.from({length: 12}, (_, i) => (
                      <MenuItem key={i+1} value={i+1}>{i+1}月</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>

              <FormControl fullWidth>
                <InputLabel>プラットフォーム</InputLabel>
                <Select
                  value={selectedPlatformForForm}
                  label="プラットフォーム"
                  onChange={(e) => handlePlatformChange(e.target.value)}
                >
                  <MenuItem value="">全てのプラットフォーム</MenuItem>
                  {Array.from(new Set(creators.map(c => c.platform))).map(platform => (
                    <MenuItem key={platform} value={platform}>
                      {platform}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <Autocomplete
                fullWidth
                options={creators.filter(creator => !selectedPlatformForForm || creator.platform === selectedPlatformForForm)}
                getOptionLabel={(option) => option.creator_name}
                value={creators.find(c => c.id === formData.fan_pf_creator_id) || null}
                onChange={(event, newValue) => {
                  setFormData({...formData, fan_pf_creator_id: newValue ? newValue.id : ''});
                }}
                disabled={!selectedPlatformForForm}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="クリエイター"
                    placeholder="クリエイター名を入力して検索"
                  />
                )}
                noOptionsText="該当するクリエイターが見つかりません"
                isOptionEqualToValue={(option, value) => option.id === value.id}
              />

              <TextField
                fullWidth
                label="入金額"
                type="number"
                value={formData.deposit_amount}
                onChange={(e) => setFormData({...formData, deposit_amount: e.target.value})}
                InputProps={{
                  startAdornment: <InputAdornment position="start">¥</InputAdornment>,
                  inputProps: { min: 0, step: 1 }
                }}
              />

              <TextField
                fullWidth
                label="備考"
                multiline
                rows={3}
                value={formData.note}
                onChange={(e) => setFormData({...formData, note: e.target.value})}
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setNewRequestDialogOpen(false)}>キャンセル</Button>
            <Button 
              onClick={handleSubmitNewRequest}
              variant="contained"
              disabled={!selectedPlatformForForm || !formData.fan_pf_creator_id || !formData.deposit_amount}
            >
              入力する
            </Button>
          </DialogActions>
        </Dialog>

        {/* 削除確認ダイアログ */}
        <Dialog 
          open={deleteDialogOpen}
          onClose={() => setDeleteDialogOpen(false)}
        >
          <DialogTitle>振込申請の削除</DialogTitle>
          <DialogContent>
            <Typography>
              以下の振込申請を削除しますか？
            </Typography>
            {deleteTarget && (
              <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
                <Typography variant="body2">
                  <strong>稼働年月:</strong> {deleteTarget.work_year}年{deleteTarget.work_month}月
                </Typography>
                <Typography variant="body2">
                  <strong>クリエイター:</strong> {deleteTarget.fan_pf_creator?.creator_name || '-'}
                </Typography>
                <Typography variant="body2">
                  <strong>入金額:</strong> ¥{deleteTarget.deposit_amount?.toLocaleString() || '0'}
                </Typography>
                <Typography variant="body2" color="error" sx={{ mt: 1 }}>
                  ※ この操作は取り消せません
                </Typography>
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDeleteDialogOpen(false)}>キャンセル</Button>
            <Button 
              onClick={handleDeleteConfirm}
              color="error"
              variant="contained"
            >
              削除する
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </MainLayout>
  );
}