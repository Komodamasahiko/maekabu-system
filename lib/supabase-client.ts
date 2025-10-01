import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// 通常のクライアント（ブラウザ用）
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// サービスロールクライアント（サーバーサイドまたは管理者権限が必要な場合）
export const supabaseAdmin = typeof window === 'undefined' && supabaseServiceKey
  ? createClient(supabaseUrl, supabaseServiceKey)
  : null;