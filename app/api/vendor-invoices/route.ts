import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const paymentStatus = searchParams.get('payment_status')
    
    let query = supabase
      .from('vendor_invoices')
      .select(`
        *,
        vendor:clients!vendor_invoices_vendor_id_fkey(id, client_name)
      `)
      .eq('company_id', 'c7b60aee-a256-4880-b308-fa02e0394712')
    
    if (paymentStatus) {
      query = query.eq('payment_status', paymentStatus)
    }
    
    const { data, error } = await query
      .order('due_date', { ascending: false })
    
    if (error) {
      console.error('Error fetching vendor invoices:', error)
      return NextResponse.json(
        { error: 'Failed to fetch vendor invoices' },
        { status: 500 }
      )
    }
    
    const invoices = (data || []).map(invoice => ({
      ...invoice,
      vendor_name: invoice.vendor?.client_name || invoice.vendor_name || '不明',
      // file_urlsまたはpdf_urlをfile_urlとして返す
      file_url: invoice.pdf_url || (invoice.file_urls && invoice.file_urls[0]) || null
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
    
    // file_urlとfile_nameを file_urls 配列に変換
    let processedBody = { ...body }
    if (body.file_url && body.file_name) {
      processedBody.file_urls = [body.file_url]
      processedBody.pdf_url = body.file_url // pdf_urlカラムも使用
      delete processedBody.file_url
      delete processedBody.file_name
    }
    
    const { data, error } = await supabase
      .from('vendor_invoices')
      .insert({
        ...processedBody,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single()
    
    if (error) {
      console.error('Error creating vendor invoice:', error)
      return NextResponse.json(
        { error: 'Failed to create vendor invoice', message: error.message },
        { status: 500 }
      )
    }
    
    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}