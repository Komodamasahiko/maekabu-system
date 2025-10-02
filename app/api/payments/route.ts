import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type'); // 'deposit', 'withdrawal', or 'transfer-request'
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    let query;
    
    if (type === 'transfer-request') {
      // fan_platform_transfer_requestsテーブルからデータを取得（クリエイター情報も含む）
      query = supabase
        .from('fan_platform_transfer_requests')
        .select(`
          *,
          fan_pf_creator:fan_pf_creator_id (
            id,
            creator_name,
            platform,
            creator_rate,
            agency_id,
            agency_rate,
            distribution_method
          ),
          approved_employee:approved_by (
            id,
            display_name
          )
        `)
        .order('work_year', { ascending: false })
        .order('work_month', { ascending: false });
    } else {
      // fan_platform_depositテーブルからデータを取得
      query = supabase
        .from('fan_platform_deposit')
        .select('*');
      
      // 年月で降順ソート
      if (type === 'deposit') {
        query = query.order('year', { ascending: false }).order('month', { ascending: false });
      }
    }
    
    const { data, error } = await query;
    
    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch payments', details: error.message },
        { status: 500 }
      );
    }
    
    // transfer-requestの場合、agency_idからagency_nameを取得
    if (type === 'transfer-request' && data) {
      // 全てのユニークなagency_idを収集（文字列を数値に変換）
      const agencyIds = new Set<number>();
      data.forEach((item: any) => {
        if (item.fan_pf_creator?.agency_id) {
          const agencyIdNum = parseInt(item.fan_pf_creator.agency_id);
          if (!isNaN(agencyIdNum)) {
            agencyIds.add(agencyIdNum);
          }
        }
      });
      
      // agency_idの配列からagenciesテーブルのデータを取得
      if (agencyIds.size > 0) {
        const { data: agencies, error: agencyError } = await supabase
          .from('agencies')
          .select('agency_id, agency_name')
          .in('agency_id', Array.from(agencyIds));
        
        if (!agencyError && agencies) {
          // agency_idをキーとしたマップを作成
          const agencyMap = new Map(
            agencies.map(agency => [agency.agency_id.toString(), agency.agency_name])
          );
          
          // dataにagency_nameを追加
          data.forEach((item: any) => {
            if (item.fan_pf_creator?.agency_id) {
              item.fan_pf_creator.agency_name = agencyMap.get(item.fan_pf_creator.agency_id) || `Agency ${item.fan_pf_creator.agency_id}`;
            }
          });
        }
      }
    }
    
    console.log('Fetched data:', data); // デバッグ用ログ
    
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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, ...data } = body;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    if (type === 'transfer-request') {
      // 新規振込申請を作成
      const { error } = await supabase
        .from('fan_platform_transfer_requests')
        .insert([{
          work_year: data.work_year,
          work_month: data.work_month,
          deposit_year: data.deposit_year,
          deposit_month: data.deposit_month,
          fan_pf_creator_id: data.fan_pf_creator_id,
          deposit_amount: data.deposit_amount,
          note: data.note || null,
          status: 'pending'
        }]);
      
      if (error) {
        console.error('Database error:', error);
        return NextResponse.json(
          { error: 'Failed to create transfer request', details: error.message },
          { status: 500 }
        );
      }
      
      return NextResponse.json({
        success: true,
        message: 'Transfer request created successfully'
      });
    }
    
    return NextResponse.json(
      { error: 'Invalid request type' },
      { status: 400 }
    );
    
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}