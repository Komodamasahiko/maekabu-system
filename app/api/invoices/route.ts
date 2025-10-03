import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

// セッションからログイン中のemployee_idを取得する関数
function getCurrentEmployeeId(): string | null {
  try {
    const cookieStore = cookies()
    const sessionCookie = cookieStore.get('session')
    
    if (sessionCookie) {
      const session = JSON.parse(sessionCookie.value)
      if (session.logged_in && session.employee_id) {
        return session.employee_id
      }
    }
    return null
  } catch (error) {
    console.error('Error getting current employee ID:', error)
    return null
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const paymentStatus = searchParams.get('payment_status')
    
    let query = supabase
      .from('invoices')
      .select(`
        *,
        client:clients(id, client_name)
      `)
      .eq('company_id', 'c7b60aee-a256-4880-b308-fa02e0394712')
    
    if (paymentStatus) {
      query = query.eq('payment_status', paymentStatus)
    }
    
    const { data, error } = await query
      .order('due_date', { ascending: false })
    
    if (error) {
      console.error('Error fetching invoices:', error)
      return NextResponse.json(
        { error: 'Failed to fetch invoices' },
        { status: 500 }
      )
    }
    
    const invoices = (data || []).map(invoice => ({
      ...invoice,
      client_name: invoice.client?.client_name || invoice.client_name || '不明'
    }))
    
    return NextResponse.json({ invoices })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { items, ...invoiceData } = body
    
    // ログイン中のemployee_idを取得
    const currentEmployeeId = getCurrentEmployeeId()
    
    if (!currentEmployeeId) {
      return NextResponse.json(
        { error: 'ログインが必要です' },
        { status: 401 }
      )
    }
    
    // まず請求書を作成
    const { data: invoice, error: invoiceError } = await supabase
      .from('invoices')
      .insert({
        ...invoiceData,
        created_by: currentEmployeeId, // ログイン中のemployee_idを設定
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single()
    
    if (invoiceError) {
      console.error('Error creating invoice:', invoiceError)
      return NextResponse.json(
        { error: 'Failed to create invoice', message: invoiceError.message },
        { status: 500 }
      )
    }
    
    // 明細が存在する場合、invoice_itemsテーブルに保存
    if (items && items.length > 0) {
      const itemsToInsert = items.map((item: any, index: number) => ({
        invoice_id: invoice.id,
        description: item.description,
        quantity: item.quantity,
        unit_price: item.unit_price,
        amount: item.amount,
        tax_amount: Math.floor(item.amount * 0.1), // 10%消費税を計算
        item_order: index + 1,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }))
      
      const { error: itemsError } = await supabase
        .from('invoice_items')
        .insert(itemsToInsert)
      
      if (itemsError) {
        console.error('Error creating invoice items:', itemsError)
        // 請求書は作成されているので、エラーログを出すが成功レスポンスを返す
        console.warn('Invoice created but items failed to save:', itemsError.message)
      }
    }
    
    return NextResponse.json({ success: true, data: invoice })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}