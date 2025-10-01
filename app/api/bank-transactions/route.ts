import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const bankAccount = searchParams.get('bank_account') || 'MAIN002';
    const transactionType = searchParams.get('transaction_type') || 'deposit';
    const amount = searchParams.get('amount'); // 税込支払額での絞り込み用
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // bank_transactionsテーブルから条件に合うデータを取得
    let query = supabase
      .from('bank_transactions')
      .select('*')
      .eq('bank_account', bankAccount)
      .eq('transaction_type', transactionType)
      .order('transaction_date', { ascending: false });
    
    // 金額での絞り込み（税込支払額と同じ金額）
    if (amount) {
      query = query.eq('amount', parseFloat(amount));
    }
    
    const { data, error } = await query;
    
    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch bank transactions', details: error.message },
        { status: 500 }
      );
    }
    
    console.log('Fetched bank transactions:', data); // デバッグ用ログ
    
    return NextResponse.json({
      success: true,
      data: data || []
    });
    
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}