'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import MainLayout from '@/components/Layout/MainLayout'
import {
  Box,
  Card,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  TextField,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tabs,
  Tab,
  Breadcrumbs,
  Link,
  Stepper,
  Step,
  StepLabel,
  Alert,
  Tooltip,
  Autocomplete,
} from '@mui/material'
import {
  Add,
  Edit,
  Delete,
  Search,
  NavigateNext,
  Description,
  Receipt,
  PictureAsPdf,
  PersonAdd,
} from '@mui/icons-material'

interface Invoice {
  id: string
  invoice_number: string
  title?: string
  client_id: string
  client_code?: string
  client_name: string
  invoice_date: string
  due_date: string
  subtotal: number
  tax_amount: number
  total_amount: number
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled'
  payment_status: 'unpaid' | 'partial' | 'paid'
  revenue_category_code?: string
  expense_category_code?: string
  department_code?: string
  company_code?: string
}

interface VendorInvoice {
  id: string
  vendor_id?: string
  vendor_name: string
  vendor_invoice_number: string
  internal_number: string
  invoice_date: string
  due_date: string
  received_date: string
  total_amount: number
  title?: string
  remarks?: string
  pdf_url?: string
  file_url?: string
  file_name?: string
  payment_status: 'pending' | 'paid' | 'overdue'
  company_id?: string
  department_id?: string
  expense_category_id?: string
  created_at: string
  updated_at: string
}

interface Company {
  id: string
  company_code: string
  company_name: string
}

interface Client {
  id: string
  client_code: string
  client_name: string
  client_name_kana?: string
  postal_code?: string
  address?: string
  phone?: string
  email?: string
  contact_person?: string
  invoice_tax_number?: string
  bank_name?: string
  bank_code?: string
  bank_branch?: string
  bank_branch_code?: string
  bank_account_type?: string
  bank_account_number?: string
  bank_account_name?: string
}

interface ClientFormData {
  client_code: string
  client_name: string
  client_name_kana: string
  postal_code: string
  invoice_tax_number: string
  bank_name: string
  bank_code: string
  bank_branch: string
  bank_branch_code: string
  bank_account_type: string
  bank_account_number: string
  bank_account_name: string
}

interface VendorInvoiceFormData {
  vendor_id: string
  vendor_name: string
  vendor_invoice_number: string
  invoice_date: string
  due_date: string
  received_date: string
  total_amount: number
  title: string
  company_id: string
  file_url?: string
  file_name?: string
}

interface InvoiceItem {
  id?: string
  description: string
  quantity: number
  unit_price: number
  amount: number
}

interface InvoiceFormData {
  invoice_number: string
  title: string
  client_id: string
  invoice_date: string
  due_date: string
  subtotal: number
  tax_amount: number
  total_amount: number
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled'
  payment_status: 'unpaid' | 'partial' | 'paid'
  company_id: string
  items: InvoiceItem[]
}

interface TabPanelProps {
  children?: React.ReactNode
  index: number
  value: number
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`invoice-tabpanel-${index}`}
      aria-labelledby={`invoice-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  )
}

export default function InvoicesPage() {
  const [tabValue, setTabValue] = useState(0)
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [vendorInvoices, setVendorInvoices] = useState<VendorInvoice[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [vendorDialogOpen, setVendorDialogOpen] = useState(false)
  const [clientDialogOpen, setClientDialogOpen] = useState(false)
  const [companies, setCompanies] = useState<Company[]>([])
  const [clients, setClients] = useState<Client[]>([])
  const [vendors, setVendors] = useState<Client[]>([])
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [clientFormData, setClientFormData] = useState<ClientFormData>({
    client_code: '',
    client_name: '',
    client_name_kana: '',
    postal_code: '',
    invoice_tax_number: '',
    bank_name: '',
    bank_code: '',
    bank_branch: '',
    bank_branch_code: '',
    bank_account_type: '',
    bank_account_number: '',
    bank_account_name: ''
  })
  const [formData, setFormData] = useState<InvoiceFormData>({
    invoice_number: '',
    title: '',
    client_id: '',
    invoice_date: new Date().toISOString().split('T')[0],
    due_date: new Date().toISOString().split('T')[0],
    subtotal: 0,
    tax_amount: 0,
    total_amount: 0,
    status: 'draft',
    payment_status: 'unpaid',
    company_id: 'c7b60aee-a256-4880-b308-fa02e0394712',
    items: [{ description: '', quantity: 1, unit_price: 0, amount: 0 }]
  })
  const [vendorFormData, setVendorFormData] = useState<VendorInvoiceFormData>({
    vendor_id: '',
    vendor_name: '',
    vendor_invoice_number: '',
    invoice_date: new Date().toISOString().split('T')[0],
    due_date: new Date().toISOString().split('T')[0],
    received_date: new Date().toISOString().split('T')[0],
    total_amount: 0,
    title: '',
    company_id: 'c7b60aee-a256-4880-b308-fa02e0394712'
  })

  // 新規作成ダイアログを開く時に請求書番号を自動生成
  const handleOpenDialog = () => {
    const today = new Date()
    const year = today.getFullYear()
    const month = String(today.getMonth() + 1).padStart(2, '0')
    const day = String(today.getDate()).padStart(2, '0')
    const time = String(today.getTime()).slice(-4) // 時刻の下4桁
    const invoiceNumber = `INV-${year}${month}${day}-${time}`
    
    setFormData(prev => ({
      ...prev,
      invoice_number: invoiceNumber
    }))
    setDialogOpen(true)
  }
  const router = useRouter()

  useEffect(() => {
    if (tabValue === 0) {
      fetchInvoices()
    } else {
      fetchVendorInvoices()
    }
    fetchCompanies()
    fetchClients()
    fetchVendors()
  }, [tabValue])

  const fetchInvoices = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/invoices')
      if (response.ok) {
        const data = await response.json()
        setInvoices(data.invoices || [])
      }
    } catch (error) {
      console.error('Failed to fetch invoices:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchVendorInvoices = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/vendor-invoices')
      if (response.ok) {
        const data = await response.json()
        setVendorInvoices(data.invoices || [])
      }
    } catch (error) {
      console.error('Failed to fetch vendor invoices:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchCompanies = async () => {
    try {
      const response = await fetch('/api/companies')
      if (response.ok) {
        const data = await response.json()
        setCompanies(data.companies || [])
      }
    } catch (error) {
      console.error('Failed to fetch companies:', error)
    }
  }

  const fetchClients = async () => {
    try {
      const response = await fetch('/api/clients?company_id=c7b60aee-a256-4880-b308-fa02e0394712')
      if (response.ok) {
        const data = await response.json()
        setClients(data.clients || [])
      }
    } catch (error) {
      console.error('Failed to fetch clients:', error)
    }
  }

  const fetchVendors = async () => {
    try {
      const response = await fetch('/api/clients?company_id=c7b60aee-a256-4880-b308-fa02e0394712')
      if (response.ok) {
        const data = await response.json()
        setVendors(data.clients || [])
      }
    } catch (error) {
      console.error('Failed to fetch vendors:', error)
    }
  }

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue)
    setSearchTerm('')
  }

  const handleDelete = async (id: string, isVendor: boolean = false) => {
    if (!confirm('この請求書を削除しますか？')) return
    
    try {
      const endpoint = isVendor ? `/api/vendor-invoices/${id}` : `/api/invoices/${id}`
      const response = await fetch(endpoint, {
        method: 'DELETE',
      })
      
      if (response.ok) {
        if (isVendor) {
          await fetchVendorInvoices()
        } else {
          await fetchInvoices()
        }
        alert('請求書を削除しました')
      }
    } catch (error) {
      console.error('Failed to delete invoice:', error)
      alert('削除に失敗しました')
    }
  }

  const handleFormSubmit = async () => {
    try {
      const response = await fetch('/api/invoices', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })
      
      if (response.ok) {
        setDialogOpen(false)
        await fetchInvoices()
        alert('請求書を作成しました')
        setFormData({
          invoice_number: '',
          title: '',
          client_id: '',
          invoice_date: new Date().toISOString().split('T')[0],
          due_date: new Date().toISOString().split('T')[0],
          subtotal: 0,
          tax_amount: 0,
          total_amount: 0,
          status: 'draft',
          payment_status: 'unpaid',
          company_id: 'c7b60aee-a256-4880-b308-fa02e0394712',
          items: [{ description: '', quantity: 1, unit_price: 0, amount: 0 }]
        })
      } else {
        alert('作成に失敗しました')
      }
    } catch (error) {
      console.error('Failed to create invoice:', error)
      alert('作成に失敗しました')
    }
  }

  const handlePdfView = (invoice: Invoice) => {
    window.open(`/api/invoices/${invoice.id}/pdf`, '_blank')
  }

  const handleVendorFormChange = (field: keyof VendorInvoiceFormData, value: any) => {
    setVendorFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleFileUpload = async (file: File): Promise<{ fileUrl: string; fileName: string } | null> => {
    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      if (response.ok) {
        const data = await response.json()
        return { fileUrl: data.fileUrl, fileName: data.fileName }
      } else {
        console.error('File upload failed')
        return null
      }
    } catch (error) {
      console.error('File upload error:', error)
      return null
    } finally {
      setUploading(false)
    }
  }

  const handleVendorFormSubmit = async () => {
    try {
      // ファイルがアップロードされている場合は処理
      let fileData = {}
      if (uploadedFile) {
        const uploadResult = await handleFileUpload(uploadedFile)
        if (uploadResult) {
          fileData = {
            file_url: uploadResult.fileUrl,
            file_name: uploadResult.fileName
          }
        }
      }

      // 受領請求書番号を自動生成
      const today = new Date()
      const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '')
      const randomNum = Math.floor(Math.random() * 10000).toString().padStart(4, '0')
      const autoVendorInvoiceNumber = `VINV-${dateStr}-${randomNum}`
      
      const response = await fetch('/api/vendor-invoices', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...vendorFormData,
          ...fileData,
          vendor_invoice_number: autoVendorInvoiceNumber,
          payment_status: 'pending' // デフォルトで設定
        }),
      })
      
      if (response.ok) {
        setVendorDialogOpen(false)
        setUploadedFile(null)
        await fetchVendorInvoices()
        alert('受領請求書を作成しました')
        setVendorFormData({
          vendor_id: '',
          vendor_name: '',
          vendor_invoice_number: '',
          invoice_date: new Date().toISOString().split('T')[0],
          due_date: new Date().toISOString().split('T')[0],
          received_date: new Date().toISOString().split('T')[0],
          total_amount: 0,
          title: '',
          company_id: 'c7b60aee-a256-4880-b308-fa02e0394712'
        })
      } else {
        alert('作成に失敗しました')
      }
    } catch (error) {
      console.error('Failed to create vendor invoice:', error)
      alert('作成に失敗しました')
    }
  }

  const handleClientDialogOpen = () => {
    setClientDialogOpen(true)
  }

  const handleClientFormChange = (field: keyof ClientFormData, value: string) => {
    setClientFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleClientFormSubmit = async () => {
    try {
      const response = await fetch('/api/clients', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...clientFormData,
          company_id: 'c7b60aee-a256-4880-b308-fa02e0394712' // 株式会社まえかぶのcompany_idを設定
        }),
      })
      
      if (response.ok) {
        setClientDialogOpen(false)
        await fetchClients() // 取引先一覧を再読み込み
        alert('取引先を作成しました')
        setClientFormData({
          client_code: '',
          client_name: '',
          client_name_kana: '',
          postal_code: '',
          invoice_tax_number: '',
          bank_name: '',
          bank_code: '',
          bank_branch: '',
          bank_branch_code: '',
          bank_account_type: '',
          bank_account_number: '',
          bank_account_name: ''
        })
      } else {
        alert('作成に失敗しました')
      }
    } catch (error) {
      console.error('Failed to create client:', error)
      alert('作成に失敗しました')
    }
  }

  const handleFormChange = (field: keyof InvoiceFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  // 明細行の変更
  const handleItemChange = (index: number, field: keyof InvoiceItem, value: any) => {
    const newItems = [...formData.items]
    newItems[index] = { ...newItems[index], [field]: value }
    
    // 数量と単価から金額を自動計算
    if (field === 'quantity' || field === 'unit_price') {
      const quantity = field === 'quantity' ? value : newItems[index].quantity
      const unitPrice = field === 'unit_price' ? value : newItems[index].unit_price
      newItems[index].amount = quantity * unitPrice
    }
    
    setFormData(prev => ({
      ...prev,
      items: newItems
    }))
    
    // 小計と税額、合計を再計算
    calculateTotals(newItems)
  }

  // 明細行を追加
  const addItem = () => {
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, { description: '', quantity: 1, unit_price: 0, amount: 0 }]
    }))
  }

  // 明細行を削除
  const removeItem = (index: number) => {
    if (formData.items.length > 1) {
      const newItems = formData.items.filter((_, i) => i !== index)
      setFormData(prev => ({
        ...prev,
        items: newItems
      }))
      calculateTotals(newItems)
    }
  }

  // 合計を計算
  const calculateTotals = (items: InvoiceItem[]) => {
    const subtotal = items.reduce((sum, item) => sum + item.amount, 0)
    const taxAmount = Math.floor(subtotal * 0.1) // 10%消費税
    const totalAmount = subtotal + taxAmount
    
    setFormData(prev => ({
      ...prev,
      subtotal,
      tax_amount: taxAmount,
      total_amount: totalAmount
    }))
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'success'
      case 'sent':
        return 'info'
      case 'pending':
        return 'warning'
      case 'overdue':
        return 'error'
      case 'draft':
        return 'default'
      default:
        return 'default'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'paid':
        return '支払済'
      case 'sent':
        return '送信済'
      case 'pending':
        return '未払い'
      case 'overdue':
        return '期限超過'
      case 'draft':
        return '下書き'
      case 'cancelled':
        return 'キャンセル'
      default:
        return status
    }
  }

  const filteredInvoices = invoices.filter(invoice =>
    invoice.invoice_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    invoice.client_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    invoice.title?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const filteredVendorInvoices = vendorInvoices.filter(invoice =>
    invoice.vendor_invoice_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    invoice.vendor_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    invoice.title?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <MainLayout>
      <Box sx={{ p: 3 }}>
        {/* パンくずリスト */}
        <Breadcrumbs separator={<NavigateNext fontSize="small" />} sx={{ mb: 3 }}>
          <Link
            component="button"
            variant="body1"
            onClick={() => router.push('/')}
            underline="hover"
            color="inherit"
          >
            ダッシュボード
          </Link>
          <Typography color="text.primary">請求書管理</Typography>
        </Breadcrumbs>

        <Card>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs value={tabValue} onChange={handleTabChange} aria-label="invoice tabs">
              <Tab icon={<Description />} label="発行請求書" />
              <Tab icon={<Receipt />} label="受領請求書" />
            </Tabs>
          </Box>

          <TabPanel value={tabValue} index={0}>
            {/* 発行請求書 */}
            <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <TextField
                placeholder="請求書番号、顧客名、件名で検索..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                sx={{ width: 400 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search />
                    </InputAdornment>
                  ),
                }}
              />
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button
                  variant="outlined"
                  color="primary"
                  startIcon={<PersonAdd />}
                  onClick={handleClientDialogOpen}
                >
                  取引先追加
                </Button>
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<Add />}
                  onClick={handleOpenDialog}
                >
                  新規請求書
                </Button>
              </Box>
            </Box>

            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                    <TableCell>請求書番号</TableCell>
                    <TableCell>顧客名</TableCell>
                    <TableCell>件名</TableCell>
                    <TableCell>請求日</TableCell>
                    <TableCell>支払期日</TableCell>
                    <TableCell align="right">金額</TableCell>
                    <TableCell align="center">ステータス</TableCell>
                    <TableCell align="center">操作</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={8} align="center" sx={{ py: 5 }}>
                        <Typography>読み込み中...</Typography>
                      </TableCell>
                    </TableRow>
                  ) : filteredInvoices.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} align="center" sx={{ py: 5 }}>
                        <Typography>データが見つかりません</Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredInvoices.map((invoice) => (
                      <TableRow key={invoice.id} hover>
                        <TableCell>{invoice.invoice_number}</TableCell>
                        <TableCell>{invoice.client_name}</TableCell>
                        <TableCell>{invoice.title || '-'}</TableCell>
                        <TableCell>
                          {new Date(invoice.invoice_date).toLocaleDateString('ja-JP')}
                        </TableCell>
                        <TableCell>
                          {new Date(invoice.due_date).toLocaleDateString('ja-JP')}
                        </TableCell>
                        <TableCell align="right">
                          ¥{invoice.total_amount?.toLocaleString() || '0'}
                        </TableCell>
                        <TableCell align="center">
                          <Chip
                            label={getStatusLabel(invoice.status)}
                            color={getStatusColor(invoice.status) as any}
                            size="small"
                          />
                        </TableCell>
                        <TableCell align="center">
                          <Tooltip title="PDFを表示">
                            <IconButton 
                              size="small" 
                              color="primary"
                              onClick={() => handlePdfView(invoice)}
                            >
                              <PictureAsPdf />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="編集">
                            <IconButton size="small" color="primary">
                              <Edit />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="削除">
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => handleDelete(invoice.id)}
                            >
                              <Delete />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </TabPanel>

          <TabPanel value={tabValue} index={1}>
            {/* 受領請求書 */}
            <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <TextField
                placeholder="請求書番号、仕入先名、件名で検索..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                sx={{ width: 400 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search />
                    </InputAdornment>
                  ),
                }}
              />
              <Button
                variant="contained"
                color="primary"
                startIcon={<Add />}
                onClick={() => setVendorDialogOpen(true)}
              >
                新規受領請求書
              </Button>
            </Box>

            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                    <TableCell>請求書番号</TableCell>
                    <TableCell>仕入先名</TableCell>
                    <TableCell>件名</TableCell>
                    <TableCell>請求日</TableCell>
                    <TableCell>支払期日</TableCell>
                    <TableCell>受領日</TableCell>
                    <TableCell align="right">金額</TableCell>
                    <TableCell align="center">ステータス</TableCell>
                    <TableCell align="center">操作</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={9} align="center" sx={{ py: 5 }}>
                        <Typography>読み込み中...</Typography>
                      </TableCell>
                    </TableRow>
                  ) : filteredVendorInvoices.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} align="center" sx={{ py: 5 }}>
                        <Typography>データが見つかりません</Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredVendorInvoices.map((invoice) => (
                      <TableRow key={invoice.id} hover>
                        <TableCell>{invoice.vendor_invoice_number}</TableCell>
                        <TableCell>{invoice.vendor_name}</TableCell>
                        <TableCell>{invoice.title || '-'}</TableCell>
                        <TableCell>
                          {new Date(invoice.invoice_date).toLocaleDateString('ja-JP')}
                        </TableCell>
                        <TableCell>
                          {new Date(invoice.due_date).toLocaleDateString('ja-JP')}
                        </TableCell>
                        <TableCell>
                          {new Date(invoice.received_date).toLocaleDateString('ja-JP')}
                        </TableCell>
                        <TableCell align="right">
                          ¥{invoice.total_amount?.toLocaleString() || '0'}
                        </TableCell>
                        <TableCell align="center">
                          <Chip
                            label={getStatusLabel(invoice.payment_status)}
                            color={getStatusColor(invoice.payment_status) as any}
                            size="small"
                          />
                        </TableCell>
                        <TableCell align="center">
                          {invoice.file_url && (
                            <Tooltip title="アップロードされたPDFを表示">
                              <IconButton 
                                size="small" 
                                color="primary"
                                onClick={() => window.open(invoice.file_url, '_blank')}
                              >
                                <PictureAsPdf />
                              </IconButton>
                            </Tooltip>
                          )}
                          <Tooltip title="編集">
                            <IconButton size="small" color="primary">
                              <Edit />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="削除">
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => handleDelete(invoice.id, true)}
                            >
                              <Delete />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </TabPanel>
        </Card>

        {/* 新規請求書作成ダイアログ */}
        <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth>
          <DialogTitle>新規請求書作成</DialogTitle>
          <DialogContent>
            <Box sx={{ pt: 1 }}>
              <Box sx={{ 
                display: 'grid', 
                gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, 
                gap: 2 
              }}>
                <TextField
                  fullWidth
                  label="請求書番号"
                  value={formData.invoice_number}
                  margin="normal"
                  slotProps={{
                    input: { readOnly: true }
                  }}
                />
                <TextField
                  fullWidth
                  label="件名"
                  value={formData.title}
                  onChange={(e) => handleFormChange('title', e.target.value)}
                  margin="normal"
                />
                <Autocomplete
                  fullWidth
                  options={clients}
                  getOptionLabel={(option) => option.client_name || ''}
                  value={clients.find(client => client.id === formData.client_id) || null}
                  onChange={(event, newValue) => {
                    handleFormChange('client_id', newValue?.id || '')
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="顧客"
                      margin="normal"
                      placeholder="顧客名を入力して検索..."
                    />
                  )}
                  renderOption={(props, option) => (
                    <Box component="li" {...props}>
                      <Box>
                        <Box sx={{ fontWeight: 'bold' }}>{option.client_name}</Box>
                        {option.client_code && (
                          <Box sx={{ fontSize: '0.8em', color: 'text.secondary' }}>
                            コード: {option.client_code}
                          </Box>
                        )}
                      </Box>
                    </Box>
                  )}
                  filterOptions={(options, { inputValue }) => {
                    return options.filter(option =>
                      option.client_name?.toLowerCase().includes(inputValue.toLowerCase()) ||
                      option.client_code?.toLowerCase().includes(inputValue.toLowerCase())
                    )
                  }}
                  noOptionsText="該当する顧客が見つかりません"
                />
                <FormControl fullWidth margin="normal">
                  <InputLabel>ステータス</InputLabel>
                  <Select
                    value={formData.status}
                    onChange={(e) => handleFormChange('status', e.target.value)}
                    label="ステータス"
                  >
                    <MenuItem value="draft">下書き</MenuItem>
                    <MenuItem value="sent">送信済</MenuItem>
                    <MenuItem value="paid">支払済</MenuItem>
                    <MenuItem value="overdue">期限超過</MenuItem>
                    <MenuItem value="cancelled">キャンセル</MenuItem>
                  </Select>
                </FormControl>
                <TextField
                  fullWidth
                  label="請求日"
                  type="date"
                  value={formData.invoice_date}
                  onChange={(e) => handleFormChange('invoice_date', e.target.value)}
                  margin="normal"
                  slotProps={{
                    inputLabel: { shrink: true }
                  }}
                />
                <TextField
                  fullWidth
                  label="支払期日"
                  type="date"
                  value={formData.due_date}
                  onChange={(e) => handleFormChange('due_date', e.target.value)}
                  margin="normal"
                  slotProps={{
                    inputLabel: { shrink: true }
                  }}
                />
              </Box>

              {/* 明細行セクション */}
              <Box sx={{ mt: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6">明細項目</Typography>
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<Add />}
                    onClick={addItem}
                  >
                    項目追加
                  </Button>
                </Box>

                {formData.items.map((item, index) => (
                  <Box key={index} sx={{ 
                    border: '1px solid #ddd', 
                    borderRadius: 1, 
                    p: 2, 
                    mb: 2,
                    backgroundColor: '#f9f9f9'
                  }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                      <Typography variant="subtitle2">項目 {index + 1}</Typography>
                      {formData.items.length > 1 && (
                        <IconButton 
                          size="small" 
                          color="error"
                          onClick={() => removeItem(index)}
                        >
                          <Delete />
                        </IconButton>
                      )}
                    </Box>
                    
                    <Box sx={{ 
                      display: 'grid', 
                      gridTemplateColumns: { xs: '1fr', md: '2fr 1fr 1fr 1fr' }, 
                      gap: 1
                    }}>
                      <TextField
                        fullWidth
                        label="項目名"
                        value={item.description}
                        onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                        size="small"
                      />
                      <TextField
                        fullWidth
                        label="数量"
                        type="number"
                        value={item.quantity}
                        onChange={(e) => handleItemChange(index, 'quantity', Number(e.target.value))}
                        size="small"
                      />
                      <TextField
                        fullWidth
                        label="単価"
                        type="number"
                        value={item.unit_price}
                        onChange={(e) => handleItemChange(index, 'unit_price', Number(e.target.value))}
                        size="small"
                      />
                      <TextField
                        fullWidth
                        label="金額"
                        type="number"
                        value={item.amount}
                        size="small"
                        slotProps={{
                          input: { readOnly: true }
                        }}
                      />
                    </Box>
                  </Box>
                ))}
              </Box>

              <Box sx={{ 
                display: 'grid', 
                gridTemplateColumns: { xs: '1fr', md: '1fr 1fr 1fr' }, 
                gap: 2,
                mt: 2
              }}>
                <TextField
                  fullWidth
                  label="小計"
                  type="number"
                  value={formData.subtotal}
                  margin="normal"
                  slotProps={{
                    input: { readOnly: true }
                  }}
                />
                <TextField
                  fullWidth
                  label="税額 (10%)"
                  type="number"
                  value={formData.tax_amount}
                  margin="normal"
                  slotProps={{
                    input: { readOnly: true }
                  }}
                />
                <TextField
                  fullWidth
                  label="合計金額"
                  type="number"
                  value={formData.total_amount}
                  margin="normal"
                  slotProps={{
                    input: { readOnly: true }
                  }}
                />
              </Box>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDialogOpen(false)}>キャンセル</Button>
            <Button onClick={handleFormSubmit} variant="contained">作成</Button>
          </DialogActions>
        </Dialog>

        {/* 取引先追加ダイアログ */}
        <Dialog open={clientDialogOpen} onClose={() => setClientDialogOpen(false)} maxWidth="md" fullWidth>
          <DialogTitle>新規取引先追加</DialogTitle>
          <DialogContent>
            <Box sx={{ pt: 1 }}>
              <Box sx={{ 
                display: 'flex', 
                flexDirection: 'column',
                gap: 2 
              }}>
                {/* 基本情報 */}
                <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>基本情報</Typography>
                
                <TextField
                  fullWidth
                  label="取引先コード"
                  value={clientFormData.client_code}
                  onChange={(e) => handleClientFormChange('client_code', e.target.value)}
                  margin="normal"
                  required
                  placeholder="例: CLI001"
                />
                <TextField
                  fullWidth
                  label="取引先名"
                  value={clientFormData.client_name}
                  onChange={(e) => handleClientFormChange('client_name', e.target.value)}
                  margin="normal"
                  required
                />
                <TextField
                  fullWidth
                  label="フリガナ"
                  value={clientFormData.client_name_kana}
                  onChange={(e) => handleClientFormChange('client_name_kana', e.target.value)}
                  margin="normal"
                  required
                  placeholder="例: カブシキガイシャマエカブ"
                />
                <TextField
                  fullWidth
                  label="郵便番号"
                  value={clientFormData.postal_code}
                  onChange={(e) => handleClientFormChange('postal_code', e.target.value)}
                  margin="normal"
                  required
                  placeholder="例: 100-0001"
                />
                <TextField
                  fullWidth
                  label="インボイス番号"
                  value={clientFormData.invoice_tax_number}
                  onChange={(e) => handleClientFormChange('invoice_tax_number', e.target.value)}
                  margin="normal"
                  required
                  placeholder="例: T1234567890123"
                />

                {/* 銀行口座情報 */}
                <Typography variant="h6" sx={{ mt: 3, mb: 1 }}>銀行口座情報</Typography>
                
                <Box sx={{ 
                  display: 'grid', 
                  gridTemplateColumns: { xs: '1fr', md: '2fr 1fr' }, 
                  gap: 2 
                }}>
                  <TextField
                    fullWidth
                    label="銀行名"
                    value={clientFormData.bank_name}
                    onChange={(e) => handleClientFormChange('bank_name', e.target.value)}
                    margin="normal"
                    required
                    placeholder="例: みずほ銀行"
                  />
                  <TextField
                    fullWidth
                    label="金融コード"
                    value={clientFormData.bank_code}
                    onChange={(e) => handleClientFormChange('bank_code', e.target.value)}
                    margin="normal"
                    required
                    placeholder="例: 0001"
                  />
                </Box>

                <Box sx={{ 
                  display: 'grid', 
                  gridTemplateColumns: { xs: '1fr', md: '2fr 1fr' }, 
                  gap: 2 
                }}>
                  <TextField
                    fullWidth
                    label="支店名"
                    value={clientFormData.bank_branch}
                    onChange={(e) => handleClientFormChange('bank_branch', e.target.value)}
                    margin="normal"
                    required
                    placeholder="例: 東京営業部"
                  />
                  <TextField
                    fullWidth
                    label="支店コード"
                    value={clientFormData.bank_branch_code}
                    onChange={(e) => handleClientFormChange('bank_branch_code', e.target.value)}
                    margin="normal"
                    required
                    placeholder="例: 001"
                  />
                </Box>

                <FormControl fullWidth margin="normal" required>
                  <InputLabel>口座種別</InputLabel>
                  <Select
                    value={clientFormData.bank_account_type}
                    onChange={(e) => handleClientFormChange('bank_account_type', e.target.value)}
                    label="口座種別"
                  >
                    <MenuItem value="普通">普通</MenuItem>
                    <MenuItem value="当座">当座</MenuItem>
                    <MenuItem value="貯蓄">貯蓄</MenuItem>
                  </Select>
                </FormControl>

                <TextField
                  fullWidth
                  label="口座番号"
                  value={clientFormData.bank_account_number}
                  onChange={(e) => handleClientFormChange('bank_account_number', e.target.value)}
                  margin="normal"
                  required
                  placeholder="例: 1234567"
                />
                
                <TextField
                  fullWidth
                  label="振込口座名（カタカナ）"
                  value={clientFormData.bank_account_name}
                  onChange={(e) => handleClientFormChange('bank_account_name', e.target.value)}
                  margin="normal"
                  required
                  placeholder="例: カブシキガイシャマエカブ"
                />
              </Box>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setClientDialogOpen(false)}>キャンセル</Button>
            <Button onClick={handleClientFormSubmit} variant="contained">作成</Button>
          </DialogActions>
        </Dialog>

        {/* 受領請求書作成ダイアログ */}
        <Dialog open={vendorDialogOpen} onClose={() => setVendorDialogOpen(false)} maxWidth="md" fullWidth>
          <DialogTitle>新規受領請求書作成</DialogTitle>
          <DialogContent>
            <Box sx={{ pt: 2 }}>
              <Autocomplete
                freeSolo
                options={vendors}
                getOptionLabel={(option) => 
                  typeof option === 'string' ? option : option.client_name || ''
                }
                value={vendors.find(v => v.id === vendorFormData.vendor_id) || vendorFormData.vendor_name}
                onInputChange={(event, value) => {
                  handleVendorFormChange('vendor_name', value || '')
                }}
                onChange={(event, value) => {
                  if (value && typeof value !== 'string') {
                    handleVendorFormChange('vendor_id', value.id)
                    handleVendorFormChange('vendor_name', value.client_name || '')
                  }
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="取引先"
                    margin="normal"
                    required
                    placeholder="取引先を選択または入力"
                  />
                )}
                sx={{ mb: 2 }}
              />

              <TextField
                fullWidth
                label="件名"
                value={vendorFormData.title}
                onChange={(e) => handleVendorFormChange('title', e.target.value)}
                margin="normal"
                required
                placeholder="請求書の件名"
              />

              <Box sx={{ 
                display: 'grid', 
                gridTemplateColumns: { xs: '1fr', md: '1fr 1fr 1fr' }, 
                gap: 2,
                mt: 2
              }}>
                <TextField
                  fullWidth
                  label="請求日"
                  type="date"
                  value={vendorFormData.invoice_date}
                  onChange={(e) => handleVendorFormChange('invoice_date', e.target.value)}
                  margin="normal"
                  required
                  InputLabelProps={{ shrink: true }}
                />
                
                <TextField
                  fullWidth
                  label="支払期限"
                  type="date"
                  value={vendorFormData.due_date}
                  onChange={(e) => handleVendorFormChange('due_date', e.target.value)}
                  margin="normal"
                  required
                  InputLabelProps={{ shrink: true }}
                />
                
                <TextField
                  fullWidth
                  label="受領日"
                  type="date"
                  value={vendorFormData.received_date}
                  onChange={(e) => handleVendorFormChange('received_date', e.target.value)}
                  margin="normal"
                  required
                  InputLabelProps={{ shrink: true }}
                />
              </Box>

              <TextField
                fullWidth
                label="合計金額"
                type="number"
                value={vendorFormData.total_amount}
                onChange={(e) => handleVendorFormChange('total_amount', parseFloat(e.target.value) || 0)}
                margin="normal"
                required
                placeholder="0"
                InputProps={{
                  startAdornment: <Typography sx={{ mr: 1 }}>¥</Typography>
                }}
              />

              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle2" sx={{ mb: 1 }}>
                  請求書ファイル（PDF）
                </Typography>
                <input
                  accept="application/pdf,image/*"
                  style={{ display: 'none' }}
                  id="vendor-invoice-file"
                  type="file"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) {
                      setUploadedFile(file)
                    }
                  }}
                />
                <label htmlFor="vendor-invoice-file">
                  <Button
                    variant="outlined"
                    component="span"
                    fullWidth
                    disabled={uploading}
                  >
                    {uploadedFile ? uploadedFile.name : 'ファイルを選択'}
                  </Button>
                </label>
                {uploadedFile && (
                  <Box sx={{ mt: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <Typography variant="body2" color="text.secondary">
                        選択済み: {uploadedFile.name}
                      </Typography>
                      <Button
                        size="small"
                        color="primary"
                        onClick={() => {
                          const fileUrl = URL.createObjectURL(uploadedFile)
                          window.open(fileUrl, '_blank')
                        }}
                      >
                        プレビュー
                      </Button>
                      <Button
                        size="small"
                        color="error"
                        onClick={() => setUploadedFile(null)}
                      >
                        削除
                      </Button>
                    </Box>
                    {uploadedFile.type === 'application/pdf' && (
                      <Box sx={{ 
                        border: '1px solid #ddd', 
                        borderRadius: 1, 
                        height: 400, 
                        overflow: 'hidden',
                        bgcolor: '#f5f5f5'
                      }}>
                        <iframe
                          src={URL.createObjectURL(uploadedFile)}
                          style={{
                            width: '100%',
                            height: '100%',
                            border: 'none'
                          }}
                          title="PDFプレビュー"
                        />
                      </Box>
                    )}
                    {uploadedFile.type.startsWith('image/') && (
                      <Box sx={{ 
                        border: '1px solid #ddd', 
                        borderRadius: 1,
                        p: 1,
                        textAlign: 'center',
                        bgcolor: '#f5f5f5'
                      }}>
                        <img
                          src={URL.createObjectURL(uploadedFile)}
                          alt="プレビュー"
                          style={{
                            maxWidth: '100%',
                            maxHeight: '400px',
                            objectFit: 'contain'
                          }}
                        />
                      </Box>
                    )}
                  </Box>
                )}
              </Box>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => {
              setVendorDialogOpen(false)
              setUploadedFile(null)
            }}>キャンセル</Button>
            <Button onClick={handleVendorFormSubmit} variant="contained" disabled={uploading}>
              {uploading ? '作成中...' : '作成'}
            </Button>
          </DialogActions>
        </Dialog>

      </Box>
    </MainLayout>
  )
}