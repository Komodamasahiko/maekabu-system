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
    const companyId = searchParams.get('company_id')
    
    let query = supabase
      .from('clients')
      .select('*')
    
    // company_idパラメータがある場合はフィルタリング
    if (companyId) {
      query = query.eq('company_id', companyId)
    }
    
    const { data, error } = await query
      .order('client_name', { ascending: true })
    
    if (error) {
      console.error('Error fetching clients:', error)
      return NextResponse.json(
        { error: 'Failed to fetch clients' },
        { status: 500 }
      )
    }
    
    return NextResponse.json({ clients: data || [] })
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
    
    // ログイン中のemployee_idを取得
    const currentEmployeeId = getCurrentEmployeeId()
    
    if (!currentEmployeeId) {
      return NextResponse.json(
        { error: 'ログインが必要です' },
        { status: 401 }
      )
    }
    
    const { data, error } = await supabase
      .from('clients')
      .insert({
        ...body,
        created_by: currentEmployeeId, // ログイン中のemployee_idを設定
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single()
    
    if (error) {
      console.error('Error creating client:', error)
      return NextResponse.json(
        { error: 'Failed to create client', message: error.message },
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