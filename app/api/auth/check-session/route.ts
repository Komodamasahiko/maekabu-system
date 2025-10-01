import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// 簡易的なセッションチェックAPI
export async function GET() {
  try {
    // 環境変数からSupabase設定を取得
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({ 
        authenticated: false,
        message: 'Supabase not configured' 
      });
    }

    // 現時点では認証なしでアクセス可能
    // 将来的に認証を追加する場合はここで実装
    return NextResponse.json({ 
      authenticated: true,
      user: null,
      message: 'No authentication required' 
    });

  } catch (error) {
    console.error('Session check error:', error);
    return NextResponse.json({ 
      authenticated: false,
      error: 'Internal server error' 
    }, { status: 500 });
  }
}