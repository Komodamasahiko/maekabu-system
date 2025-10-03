const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://ladyoszsnntkipfikgyk.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxhZHlvc3pzbm50a2lwZmlrZ3lrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NjM2MDIyMSwiZXhwIjoyMDcxOTM2MjIxfQ._8vqmoA3NST8NPnCsXD6hw5tbd3gUEK0HzOPZBn0FY4';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkStorageBucket() {
  console.log('Checking storage buckets...');
  
  // バケットのリストを取得
  const { data: buckets, error: listError } = await supabase.storage.listBuckets();
  
  if (listError) {
    console.error('Error listing buckets:', listError);
    return;
  }
  
  console.log('Available buckets:');
  buckets.forEach(bucket => {
    console.log(`- ${bucket.name} (ID: ${bucket.id}, Public: ${bucket.public})`);
  });
  
  // vendor-invoicesバケットの存在確認
  const vendorInvoicesBucket = buckets.find(b => b.name === 'vendor-invoices' || b.id === 'vendor-invoices');
  
  if (!vendorInvoicesBucket) {
    console.log('\n⚠️ vendor-invoices bucket not found!');
    console.log('Creating vendor-invoices bucket...');
    
    const { data: newBucket, error: createError } = await supabase.storage.createBucket('vendor-invoices', {
      public: true,
      fileSizeLimit: 52428800, // 50MB
      allowedMimeTypes: ['application/pdf', 'image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/webp']
    });
    
    if (createError) {
      console.error('Failed to create bucket:', createError);
    } else {
      console.log('✓ vendor-invoices bucket created successfully');
    }
  } else {
    console.log('\n✓ vendor-invoices bucket exists');
    
    // バケット内のファイルをリスト
    const { data: files, error: filesError } = await supabase.storage
      .from('vendor-invoices')
      .list('', {
        limit: 10,
        sortBy: { column: 'created_at', order: 'desc' }
      });
    
    if (files && files.length > 0) {
      console.log('\nRecent files in vendor-invoices bucket:');
      files.forEach(file => {
        console.log(`- ${file.name} (Size: ${file.metadata?.size || 'N/A'} bytes)`);
      });
    } else {
      console.log('\nNo files in vendor-invoices bucket yet');
    }
  }
  
  // テストアップロード
  console.log('\nTesting file upload...');
  const testContent = 'Test file content';
  const testFileName = `test-${Date.now()}.txt`;
  
  const { data: uploadData, error: uploadError } = await supabase.storage
    .from('vendor-invoices')
    .upload(testFileName, Buffer.from(testContent), {
      contentType: 'text/plain',
      upsert: false
    });
  
  if (uploadError) {
    console.error('Test upload failed:', uploadError);
  } else {
    console.log('✓ Test upload successful:', uploadData);
    
    // 公開URLを取得
    const { data: { publicUrl } } = supabase.storage
      .from('vendor-invoices')
      .getPublicUrl(testFileName);
    
    console.log('Public URL:', publicUrl);
    
    // テストファイルを削除
    const { error: deleteError } = await supabase.storage
      .from('vendor-invoices')
      .remove([testFileName]);
    
    if (!deleteError) {
      console.log('✓ Test file deleted');
    }
  }
}

checkStorageBucket();