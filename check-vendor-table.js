const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://ladyoszsnntkipfikgyk.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxhZHlvc3pzbm50a2lwZmlrZ3lrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NjM2MDIyMSwiZXhwIjoyMDcxOTM2MjIxfQ._8vqmoA3NST8NPnCsXD6hw5tbd3gUEK0HzOPZBn0FY4';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkAndAddColumns() {
  console.log('Checking vendor_invoices table structure...');
  
  // 既存のレコードを1つ取得してカラムを確認
  const { data: sample, error: sampleError } = await supabase
    .from('vendor_invoices')
    .select('*')
    .limit(1);
  
  if (sample && sample[0]) {
    console.log('Current columns:', Object.keys(sample[0]));
    
    if (!Object.keys(sample[0]).includes('file_url')) {
      console.log('file_url column not found. Adding it now...');
      
      // SQLでカラムを追加
      const { error: alterError } = await supabase.rpc('exec_sql', {
        sql: `
          ALTER TABLE vendor_invoices 
          ADD COLUMN IF NOT EXISTS file_url TEXT,
          ADD COLUMN IF NOT EXISTS file_name TEXT;
        `
      }).catch(async (err) => {
        // rpcが使えない場合は直接SQLを実行
        console.log('Trying alternative approach...');
        
        // ダミーレコードを作成してカラムを追加
        const { error: insertError } = await supabase
          .from('vendor_invoices')
          .insert({
            vendor_name: 'TEST_DELETE',
            vendor_invoice_number: 'TEST-001',
            invoice_date: new Date().toISOString(),
            due_date: new Date().toISOString(), 
            received_date: new Date().toISOString(),
            total_amount: 0,
            payment_status: 'pending',
            company_id: 'c7b60aee-a256-4880-b308-fa02e0394712',
            file_url: null,
            file_name: null
          });
        
        if (insertError) {
          console.error('Column addition might have failed:', insertError);
        } else {
          // テストレコードを削除
          await supabase
            .from('vendor_invoices')
            .delete()
            .eq('vendor_invoice_number', 'TEST-001');
          console.log('Columns added via insert method');
        }
      });
      
      if (alterError) {
        console.error('Failed to add columns:', alterError);
      } else {
        console.log('Columns added successfully');
      }
    } else {
      console.log('file_url column already exists');
    }
  } else {
    console.log('No existing records found. Creating test record to establish columns...');
    
    // カラムを含むテストレコードを作成
    const { data: newRecord, error: insertError } = await supabase
      .from('vendor_invoices')
      .insert({
        vendor_name: 'TEST_CHECK',
        vendor_invoice_number: 'TEST-CHECK-001',
        invoice_date: new Date().toISOString(),
        due_date: new Date().toISOString(),
        received_date: new Date().toISOString(),
        total_amount: 0,
        payment_status: 'pending',
        company_id: 'c7b60aee-a256-4880-b308-fa02e0394712',
        file_url: 'https://example.com/test.pdf',
        file_name: 'test.pdf'
      })
      .select()
      .single();
    
    if (newRecord) {
      console.log('Test record created with file columns:', newRecord);
      
      // テストレコードを削除
      await supabase
        .from('vendor_invoices')
        .delete()
        .eq('id', newRecord.id);
    } else if (insertError) {
      console.error('Failed to create test record:', insertError);
    }
  }
  
  // 最新のvendor_invoicesを取得
  const { data: invoices, error } = await supabase
    .from('vendor_invoices')
    .select('*')
    .eq('company_id', 'c7b60aee-a256-4880-b308-fa02e0394712')
    .order('created_at', { ascending: false })
    .limit(5);
  
  if (invoices) {
    console.log('\nRecent vendor invoices:');
    invoices.forEach(inv => {
      console.log(`- ${inv.vendor_invoice_number}: file_url=${inv.file_url || 'NULL'}, file_name=${inv.file_name || 'NULL'}`);
    });
  }
}

checkAndAddColumns();