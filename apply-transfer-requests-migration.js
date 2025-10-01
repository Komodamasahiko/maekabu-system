const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const supabaseUrl = 'https://ladyoszsnntkipfikgyk.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxhZHlvc3pzbm50a2lwZmlrZ3lrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NjM2MDIyMSwiZXhwIjoyMDcxOTM2MjIxfQ._8vqmoA3NST8NPnCsXD6hw5tbd3gUEK0HzOPZBn0FY4';

async function applyMigration() {
  const supabase = createClient(supabaseUrl, supabaseServiceKey);
  
  try {
    // SQLファイルを読み込み
    const sqlContent = fs.readFileSync('./supabase/migrations/20241001_create_transfer_requests.sql', 'utf8');
    
    console.log('マイグレーションを実行中...');
    
    // SQLを実行
    const { data, error } = await supabase.rpc('exec_sql', {
      sql: sqlContent
    });
    
    if (error) {
      console.error('エラーが発生しました:', error);
    } else {
      console.log('マイグレーション完了!');
      console.log('結果:', data);
    }
    
    // テーブルが作成されたか確認
    const { data: tableCheck, error: checkError } = await supabase
      .from('fan_platform_transfer_requests')
      .select('*')
      .limit(1);
      
    if (checkError) {
      console.error('テーブル確認エラー:', checkError);
    } else {
      console.log('✅ fan_platform_transfer_requests テーブルが正常に作成されました');
    }
    
  } catch (error) {
    console.error('実行エラー:', error);
  }
}

applyMigration();