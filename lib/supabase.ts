import { createClient } from '@supabase/supabase-js'

// Supabase configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
  global: {
    headers: {
      'x-application-name': 'tiktok-agency-system'
    }
  }
})

// Database Types based on schema
export interface Agency {
  id: string
  name: string
  name_jp?: string
  code: string
  contact_info: {
    email: string
    phone?: string
    address?: string
    representative_name?: string
  }
  contract_terms?: {
    commission_rate: number
    payment_terms: string
    minimum_streamers?: number
  }
  bank_details?: Record<string, any>
  max_livestreamers: number
  current_livestreamer_count: number
  status: 'active' | 'inactive' | 'suspended'
  metadata?: Record<string, any>
  created_at: string
  updated_at: string
}

export interface Platform {
  id: string
  name: string
  name_jp?: string
  platform_type: string
  api_config?: Record<string, any>
  commission_structure?: {
    platform_rate: number
    currency: string
    calculation_method: string
  }
  is_active: boolean
  supported_regions: string[]
  created_at: string
  updated_at: string
}

export interface Livestreamer {
  id: string
  agency_id: string
  username: string
  display_name: string
  display_name_jp?: string
  email?: string
  phone?: string
  platforms: Array<{
    platform_id: string
    username: string
    follower_count: number
    account_status: string
  }>
  revenue_data: {
    total_earnings?: number
    monthly_earnings?: number
    currency?: string
    last_payout?: string
  }
  personal_info?: Record<string, any>
  bank_details?: Record<string, any>
  performance_metrics?: {
    avg_viewers?: number
    engagement_rate?: number
    stream_frequency?: number
  }
  status: 'active' | 'inactive' | 'pending' | 'suspended' | 'terminated'
  onboarding_date?: string
  last_active_date?: string
  tags: string[]
  notes?: string
  created_at: string
  updated_at: string
}

export interface Contract {
  id: string
  livestreamer_id: string
  agency_id: string
  contract_number: string
  contract_type: string
  terms: {
    commission_rate: number
    payment_schedule: string
    exclusivity_clause?: string
    termination_conditions?: string
  }
  start_date: string
  expiry_date?: string
  auto_renewal: boolean
  renewal_terms?: Record<string, any>
  signed_documents?: string[]
  status: 'draft' | 'active' | 'expired' | 'terminated' | 'renewed'
  termination_date?: string
  termination_reason?: string
  created_at: string
  updated_at: string
}

export interface Stream {
  id: string
  livestreamer_id: string
  platform_id: string
  stream_key?: string
  title?: string
  description?: string
  start_time: string
  end_time?: string
  duration?: number
  viewer_stats: {
    peak_viewers?: number
    avg_viewers?: number
    unique_viewers?: number
    engagement_rate?: number
  }
  revenue: number
  revenue_breakdown?: {
    gifts?: number
    subscriptions?: number
    super_chats?: number
    ads?: number
  }
  gift_details?: Array<{
    gift_type: string
    quantity: number
    value: number
    sender_info?: any
  }>
  performance_score?: number
  recording_url?: string
  thumbnail_url?: string
  tags: string[]
  status: 'scheduled' | 'live' | 'ended' | 'cancelled' | 'error'
  created_at: string
  updated_at: string
}

export interface RevenueCalculation {
  id: string
  livestreamer_id: string
  agency_id: string
  calculation_period_start: string
  calculation_period_end: string
  gross_revenue: number
  platform_fees: number
  agency_commission: number
  livestreamer_earnings: number
  tax_deductions: number
  net_payout: number
  currency: string
  exchange_rate: number
  calculation_details?: {
    streams_count?: number
    total_hours?: number
    bonus_amount?: number
    deductions?: any[]
  }
  payment_status: 'pending' | 'approved' | 'processing' | 'paid' | 'failed'
  payment_date?: string
  payment_reference?: string
  notes?: string
  approved_by?: string
  approved_at?: string
  created_at: string
  updated_at: string
}

export interface CSVImport {
  id: string
  agency_id?: string
  import_type: string
  file_name: string
  file_size?: number
  row_count?: number
  successful_rows: number
  failed_rows: number
  error_log: Array<{
    row_number: number
    error_message: string
    data?: any
  }>
  mapping_config?: Record<string, any>
  import_status: 'pending' | 'processing' | 'completed' | 'failed' | 'partial'
  started_at?: string
  completed_at?: string
  imported_by?: string
  rollback_available: boolean
  rollback_data?: Record<string, any>
  created_at: string
  updated_at: string
}

// Database helper functions
export const db = {
  agencies: {
    async getAll() {
      const { data, error } = await supabase
        .from('agencies')
        .select('*')
        .order('created_at', { ascending: false })
      
      if (error) throw error
      return data as Agency[]
    },

    async getById(id: string) {
      const { data, error } = await supabase
        .from('agencies')
        .select('*')
        .eq('id', id)
        .single()
      
      if (error) throw error
      return data as Agency
    },

    async create(agency: Omit<Agency, 'id' | 'created_at' | 'updated_at'>) {
      const { data, error } = await supabase
        .from('agencies')
        .insert(agency)
        .select()
        .single()
      
      if (error) throw error
      return data as Agency
    },

    async update(id: string, updates: Partial<Agency>) {
      const { data, error } = await supabase
        .from('agencies')
        .update(updates)
        .eq('id', id)
        .select()
        .single()
      
      if (error) throw error
      return data as Agency
    }
  },

  livestreamers: {
    async getByAgency(agencyId: string) {
      const { data, error } = await supabase
        .from('livestreamers')
        .select('*')
        .eq('agency_id', agencyId)
        .order('created_at', { ascending: false })
      
      if (error) throw error
      return data as Livestreamer[]
    },

    async getById(id: string) {
      const { data, error } = await supabase
        .from('livestreamers')
        .select('*')
        .eq('id', id)
        .single()
      
      if (error) throw error
      return data as Livestreamer
    },

    async create(livestreamer: Omit<Livestreamer, 'id' | 'created_at' | 'updated_at'>) {
      const { data, error } = await supabase
        .from('livestreamers')
        .insert(livestreamer)
        .select()
        .single()
      
      if (error) throw error
      return data as Livestreamer
    },

    async update(id: string, updates: Partial<Livestreamer>) {
      const { data, error } = await supabase
        .from('livestreamers')
        .update(updates)
        .eq('id', id)
        .select()
        .single()
      
      if (error) throw error
      return data as Livestreamer
    },

    async bulkImport(livestreamers: Omit<Livestreamer, 'id' | 'created_at' | 'updated_at'>[]) {
      const { data, error } = await supabase
        .from('livestreamers')
        .insert(livestreamers)
        .select()
      
      if (error) throw error
      return data as Livestreamer[]
    }
  },

  streams: {
    async getByLivestreamer(livestreamerId: string, limit = 50) {
      const { data, error } = await supabase
        .from('streams')
        .select('*')
        .eq('livestreamer_id', livestreamerId)
        .order('start_time', { ascending: false })
        .limit(limit)
      
      if (error) throw error
      return data as Stream[]
    },

    async getLive() {
      const { data, error } = await supabase
        .from('streams')
        .select('*')
        .eq('status', 'live')
        .order('start_time', { ascending: false })
      
      if (error) throw error
      return data as Stream[]
    },

    async create(stream: Omit<Stream, 'id' | 'created_at' | 'updated_at'>) {
      const { data, error } = await supabase
        .from('streams')
        .insert(stream)
        .select()
        .single()
      
      if (error) throw error
      return data as Stream
    }
  },

  revenue: {
    async calculate(livestreamerId: string, startDate: string, endDate: string) {
      const { data, error } = await supabase
        .from('revenue_calculations')
        .select('*')
        .eq('livestreamer_id', livestreamerId)
        .gte('calculation_period_start', startDate)
        .lte('calculation_period_end', endDate)
        .order('calculation_period_start', { ascending: false })
      
      if (error) throw error
      return data as RevenueCalculation[]
    },

    async create(calculation: Omit<RevenueCalculation, 'id' | 'created_at' | 'updated_at'>) {
      const { data, error } = await supabase
        .from('revenue_calculations')
        .insert(calculation)
        .select()
        .single()
      
      if (error) throw error
      return data as RevenueCalculation
    },

    async approve(id: string, approvedBy: string) {
      const { data, error } = await supabase
        .from('revenue_calculations')
        .update({
          payment_status: 'approved',
          approved_by: approvedBy,
          approved_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single()
      
      if (error) throw error
      return data as RevenueCalculation
    }
  },

  contracts: {
    async getByLivestreamer(livestreamerId: string) {
      const { data, error } = await supabase
        .from('contracts')
        .select('*')
        .eq('livestreamer_id', livestreamerId)
        .order('start_date', { ascending: false })
      
      if (error) throw error
      return data as Contract[]
    },

    async getActive(agencyId: string) {
      const { data, error } = await supabase
        .from('contracts')
        .select('*')
        .eq('agency_id', agencyId)
        .eq('status', 'active')
        .order('start_date', { ascending: false })
      
      if (error) throw error
      return data as Contract[]
    },

    async create(contract: Omit<Contract, 'id' | 'created_at' | 'updated_at'>) {
      const { data, error } = await supabase
        .from('contracts')
        .insert(contract)
        .select()
        .single()
      
      if (error) throw error
      return data as Contract
    }
  },

  csvImports: {
    async create(importData: Omit<CSVImport, 'id' | 'created_at' | 'updated_at'>) {
      const { data, error } = await supabase
        .from('csv_imports')
        .insert(importData)
        .select()
        .single()
      
      if (error) throw error
      return data as CSVImport
    },

    async updateStatus(id: string, status: CSVImport['import_status'], details?: Partial<CSVImport>) {
      const { data, error } = await supabase
        .from('csv_imports')
        .update({
          import_status: status,
          ...details
        })
        .eq('id', id)
        .select()
        .single()
      
      if (error) throw error
      return data as CSVImport
    }
  },

  clients: {
    async getAll() {
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .eq('is_active', true)
        .order('client_name', { ascending: true })
      
      if (error) throw error
      return data as Client[]
    },

    async getById(id: string) {
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .eq('id', id)
        .single()
      
      if (error) throw error
      return data as Client
    },

    async create(client: Omit<Client, 'id' | 'created_at' | 'updated_at'>) {
      const { data, error } = await supabase
        .from('clients')
        .insert(client)
        .select()
        .single()
      
      if (error) throw error
      return data as Client
    },

    async update(id: string, updates: Partial<Client>) {
      const { data, error } = await supabase
        .from('clients')
        .update(updates)
        .eq('id', id)
        .select()
        .single()
      
      if (error) throw error
      return data as Client
    }
  },

  invoices: {
    async getAll() {
      const { data, error } = await supabase
        .from('invoices')
        .select('*')
        .order('invoice_date', { ascending: false })
      
      if (error) throw error
      return data as Invoice[]
    },

    async getById(id: string) {
      const { data, error } = await supabase
        .from('invoices')
        .select(`
          *,
          invoice_items (*)
        `)
        .eq('id', id)
        .single()
      
      if (error) throw error
      return data as Invoice & { invoice_items: InvoiceItem[] }
    },

    async create(invoice: Omit<Invoice, 'id' | 'invoice_number' | 'created_at' | 'updated_at'>) {
      const { data, error } = await supabase
        .from('invoices')
        .insert(invoice)
        .select()
        .single()
      
      if (error) throw error
      return data as Invoice
    },

    async update(id: string, updates: Partial<Invoice>) {
      const { data, error } = await supabase
        .from('invoices')
        .update(updates)
        .eq('id', id)
        .select()
        .single()
      
      if (error) throw error
      return data as Invoice
    },

    async delete(id: string) {
      const { error } = await supabase
        .from('invoices')
        .delete()
        .eq('id', id)
      
      if (error) throw error
    }
  },

  invoiceItems: {
    async getByInvoice(invoiceId: string) {
      const { data, error } = await supabase
        .from('invoice_items')
        .select('*')
        .eq('invoice_id', invoiceId)
        .order('item_order', { ascending: true })
      
      if (error) throw error
      return data as InvoiceItem[]
    },

    async create(item: Omit<InvoiceItem, 'id' | 'created_at' | 'updated_at'>) {
      const { data, error } = await supabase
        .from('invoice_items')
        .insert(item)
        .select()
        .single()
      
      if (error) throw error
      return data as InvoiceItem
    },

    async update(id: string, updates: Partial<InvoiceItem>) {
      const { data, error } = await supabase
        .from('invoice_items')
        .update(updates)
        .eq('id', id)
        .select()
        .single()
      
      if (error) throw error
      return data as InvoiceItem
    },

    async delete(id: string) {
      const { error } = await supabase
        .from('invoice_items')
        .delete()
        .eq('id', id)
      
      if (error) throw error
    },

    async bulkCreate(invoiceId: string, items: Omit<InvoiceItem, 'id' | 'invoice_id' | 'created_at' | 'updated_at'>[]) {
      const itemsWithInvoiceId = items.map(item => ({
        ...item,
        invoice_id: invoiceId
      }))
      
      const { data, error } = await supabase
        .from('invoice_items')
        .insert(itemsWithInvoiceId)
        .select()
      
      if (error) throw error
      return data as InvoiceItem[]
    }
  }
}

// Types for invoice management
export interface Client {
  id: string
  client_code: string
  client_name: string
  client_name_kana?: string
  postal_code?: string
  prefecture?: string
  city?: string
  address?: string
  building?: string
  phone?: string
  fax?: string
  email?: string
  department?: string
  contact_person?: string
  contact_person_title?: string
  payment_terms?: number
  payment_method?: string
  // 受取銀行情報
  bank_name?: string
  bank_branch?: string
  bank_account_type?: string
  bank_account_number?: string
  bank_account_name?: string
  // 振込先銀行情報
  remittance_bank_name?: string
  remittance_bank_branch?: string
  remittance_bank_account_type?: string
  remittance_bank_account_number?: string
  remittance_bank_account_name?: string
  remittance_bank_swift_code?: string
  remittance_notes?: string
  // フラグ
  is_active: boolean
  is_vendor?: boolean
  is_customer?: boolean
  notes?: string
  tags?: string[]
  custom_fields?: any
  created_at: string
  updated_at: string
  created_by?: string
  updated_by?: string
}

export interface Invoice {
  id: string
  invoice_number: string
  invoice_date: string
  due_date: string
  client_id?: string
  client_name: string
  client_address?: string
  issuing_department?: string
  issuing_department_code?: string
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled'
  subtotal: number
  tax_rate: number
  tax_amount: number
  total_amount: number
  payment_date?: string
  payment_method?: string
  payment_notes?: string
  title?: string
  notes?: string
  internal_notes?: string
  sent_at?: string
  paid_at?: string
  created_at: string
  updated_at: string
  created_by?: string
  updated_by?: string
}

export interface InvoiceItem {
  id: string
  invoice_id: string
  item_order: number
  description: string
  quantity: number
  unit: string
  unit_price: number
  amount: number
  tax_rate: number
  tax_amount: number
  category?: string
  created_at: string
  updated_at: string
}