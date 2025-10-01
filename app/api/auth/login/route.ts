import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function POST(request: NextRequest) {
  try {
    const { employee_number, password } = await request.json();
    
    // Supabaseクライアントを作成
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // employeesテーブルのemployee_numberカラムで認証
    const { data: employee, error } = await supabase
      .from('employees')
      .select('*')
      .eq('employee_number', employee_number)
      .single();
    
    if (error) {
      console.error('Database error:', error);
    }
    
    if (employee) {
      // 簡易的なパスワード確認 (実際はハッシュ化されたパスワードと比較すべき)
      // 現在は全てのパスワードを'password'として扱う
      if (password === 'password') {
        const cookieStore = cookies();
        const userName = employee.display_name || 
                        (employee.first_name && employee.last_name ? 
                          `${employee.last_name} ${employee.first_name}` : 
                          employee.employee_number);
        
        cookieStore.set('session', JSON.stringify({
          employee_number: employee.employee_number,
          employee_id: employee.id,
          name: userName,
          department: employee.department || '株式会社まえかぶ',
          logged_in: true,
        }), {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          maxAge: 60 * 60 * 24, // 24時間
        });
        
        return NextResponse.json({
          success: true,
          user: {
            employee_number: employee.employee_number,
            name: userName,
            department: employee.department || '株式会社まえかぶ',
          }
        });
      } else {
        return NextResponse.json(
          { error: 'パスワードが間違っています' },
          { status: 401 }
        );
      }
    }
    
    return NextResponse.json(
      { error: '社員コードまたはパスワードが間違っています' },
      { status: 401 }
    );
    
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'ログイン処理中にエラーが発生しました' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const cookieStore = cookies();
    const sessionCookie = cookieStore.get('session');
    
    if (sessionCookie) {
      const session = JSON.parse(sessionCookie.value);
      if (session.logged_in) {
        return NextResponse.json({
          authenticated: true,
          user: {
            employee_number: session.employee_number,
            name: session.name,
            department: session.department,
          }
        });
      }
    }
    
    return NextResponse.json({ authenticated: false });
  } catch (error) {
    return NextResponse.json({ authenticated: false });
  }
}