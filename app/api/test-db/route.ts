import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function GET() {
  try {
    // Use service role key for server-side access
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    console.log('Testing database connection with service role...');
    
    // Test fan_creator table
    const { data: fanCreatorData, error: fanCreatorError } = await supabase
      .from('fan_creator')
      .select('*')
      .limit(5);
    
    // Test fan_pf_creator table
    const { data: fanPfCreatorData, error: fanPfCreatorError } = await supabase
      .from('fan_pf_creator')
      .select('*')
      .limit(5);
    
    const result = {
      environment: {
        SUPABASE_URL: supabaseUrl,
        HAS_SERVICE_KEY: !!supabaseServiceKey,
      },
      fan_creator: {
        data: fanCreatorData,
        error: fanCreatorError,
        count: fanCreatorData?.length || 0,
      },
      fan_pf_creator: {
        data: fanPfCreatorData,
        error: fanPfCreatorError,
        count: fanPfCreatorData?.length || 0,
      },
      success: !fanCreatorError && !fanPfCreatorError,
    };
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('Server error:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}