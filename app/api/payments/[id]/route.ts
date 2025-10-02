import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    
    if (!type) {
      return NextResponse.json(
        { error: 'Missing type parameter' },
        { status: 400 }
      );
    }
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    if (type === 'transfer-request') {
      const { error } = await supabase
        .from('fan_platform_transfer_requests')
        .delete()
        .eq('id', params.id);
      
      if (error) {
        console.error('Delete error:', error);
        return NextResponse.json(
          { error: 'Failed to delete transfer request', details: error.message },
          { status: 500 }
        );
      }
      
      return NextResponse.json({
        success: true,
        message: 'Transfer request deleted successfully'
      });
    }
    
    return NextResponse.json(
      { error: 'Invalid request type' },
      { status: 400 }
    );
    
  } catch (error) {
    console.error('Delete API error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}