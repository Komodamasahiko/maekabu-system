const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://ladyoszsnntkipfikgyk.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxhZHlvc3pzbm50a2lwZmlrZ3lrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NjM2MDIyMSwiZXhwIjoyMDcxOTM2MjIxfQ._8vqmoA3NST8NPnCsXD6hw5tbd3gUEK0HzOPZBn0FY4';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkRecentInvoices() {
  console.log('Fetching recent vendor invoices...\n');
  
  const { data: invoices, error } = await supabase
    .from('vendor_invoices')
    .select('*')
    .eq('company_id', 'c7b60aee-a256-4880-b308-fa02e0394712')
    .order('created_at', { ascending: false })
    .limit(5);
  
  if (error) {
    console.error('Error fetching invoices:', error);
    return;
  }
  
  if (!invoices || invoices.length === 0) {
    console.log('No vendor invoices found for company c7b60aee-a256-4880-b308-fa02e0394712');
    return;
  }
  
  console.log('Recent vendor invoices:');
  invoices.forEach((inv, index) => {
    console.log(`\n${index + 1}. ${inv.vendor_invoice_number}`);
    console.log('   Vendor:', inv.vendor_name);
    console.log('   Date:', inv.invoice_date);
    console.log('   Amount:', inv.total_amount);
    console.log('   pdf_url:', inv.pdf_url || 'NULL');
    console.log('   file_urls:', inv.file_urls ? JSON.stringify(inv.file_urls) : 'NULL');
    console.log('   Created:', inv.created_at);
  });
  
  // pdf_urlが空の最初のレコードを更新テスト
  const emptyPdfInvoice = invoices.find(inv => !inv.pdf_url && !inv.file_urls);
  
  if (emptyPdfInvoice) {
    console.log('\n\n---Testing update on invoice without PDF---');
    console.log('Invoice:', emptyPdfInvoice.vendor_invoice_number);
    
    // テスト用のURLを設定
    const testUrl = 'https://ladyoszsnntkipfikgyk.supabase.co/storage/v1/object/public/vendor-invoices/test-file.pdf';
    
    const { data: updated, error: updateError } = await supabase
      .from('vendor_invoices')
      .update({
        pdf_url: testUrl,
        file_urls: [testUrl]
      })
      .eq('id', emptyPdfInvoice.id)
      .select()
      .single();
    
    if (updateError) {
      console.error('Update failed:', updateError);
    } else {
      console.log('✓ Successfully updated pdf_url and file_urls');
      console.log('   pdf_url:', updated.pdf_url);
      console.log('   file_urls:', updated.file_urls);
    }
  } else {
    console.log('\nAll recent invoices have PDF URLs set');
  }
}

checkRecentInvoices();