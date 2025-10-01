const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://ladyoszsnntkipfikgyk.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxhZHlvc3pzbm50a2lwZmlrZ3lrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NjM2MDIyMSwiZXhwIjoyMDcxOTM2MjIxfQ._8vqmoA3NST8NPnCsXD6hw5tbd3gUEK0HzOPZBn0FY4';

async function createTable() {
  const supabase = createClient(supabaseUrl, supabaseServiceKey);
  
  try {
    console.log('fan_platform_transfer_requests テーブルを作成中...');
    
    // テーブル作成SQL
    const createTableSQL = `
      CREATE TABLE fan_platform_transfer_requests (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          
          -- 稼働年月
          work_year INTEGER NOT NULL,
          work_month INTEGER NOT NULL CHECK (work_month >= 1 AND work_month <= 12),
          
          -- 入金年月
          deposit_year INTEGER NOT NULL,
          deposit_month INTEGER NOT NULL CHECK (deposit_month >= 1 AND deposit_month <= 12),
          
          -- クリエイター関連
          fan_pf_creator_id BIGINT REFERENCES fan_pf_creator(id) ON DELETE CASCADE,
          
          -- 金額・備考
          deposit_amount DECIMAL(12,2) NOT NULL CHECK (deposit_amount >= 0),
          note TEXT,
          
          -- 審査・承認関連
          status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'paid')),
          approved_by BIGINT REFERENCES employees(id),
          approved_at TIMESTAMP WITH TIME ZONE,
          
          -- 支払い関連
          payment_date DATE,
          bank_transaction_id BIGINT REFERENCES bank_transactions(id),
          
          -- インデックス用
          UNIQUE(fan_pf_creator_id, work_year, work_month)
      );
    `;
    
    const { error: createError } = await supabase.from('fan_platform_transfer_requests').select('id').limit(1);
    
    if (createError && createError.code === 'PGRST205') {
      // テーブルが存在しない場合、Raw SQLで作成を試行
      console.log('テーブルが存在しません。作成を試行中...');
      
      // 代替方法：一つずつ実行
      console.log('✅ テーブル作成が必要です');
      console.log('');
      console.log('以下のSQLを手動でSupabase SQL Editorで実行してください：');
      console.log('='.repeat(80));
      console.log(createTableSQL);
      console.log('='.repeat(80));
      console.log('');
      console.log('または、以下のコマンドを実行してください：');
      console.log('curl -X POST https://ladyoszsnntkipfikgyk.supabase.co/rest/v1/rpc/exec \\');
      console.log('  -H "Authorization: Bearer ' + supabaseServiceKey + '" \\');
      console.log('  -H "Content-Type: application/json" \\');
      console.log('  -d \'{"sql": "' + createTableSQL.replace(/"/g, '\\"').replace(/\n/g, '\\n') + '"}\'');
      
    } else {
      console.log('✅ fan_platform_transfer_requests テーブルは既に存在します');
    }
    
    // インデックスとトリガーも作成
    console.log('');
    console.log('次に、以下のインデックスとトリガーも実行してください：');
    console.log('-'.repeat(60));
    
    const indexSQL = `
      -- インデックスを作成
      CREATE INDEX idx_fan_platform_transfer_requests_work_period ON fan_platform_transfer_requests(work_year, work_month);
      CREATE INDEX idx_fan_platform_transfer_requests_deposit_period ON fan_platform_transfer_requests(deposit_year, deposit_month);
      CREATE INDEX idx_fan_platform_transfer_requests_creator ON fan_platform_transfer_requests(fan_pf_creator_id);
      CREATE INDEX idx_fan_platform_transfer_requests_status ON fan_platform_transfer_requests(status);
      
      -- 更新トリガーを作成
      CREATE OR REPLACE FUNCTION update_fan_platform_transfer_requests_updated_at()
      RETURNS TRIGGER AS $$
      BEGIN
          NEW.updated_at = NOW();
          RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;

      CREATE TRIGGER trigger_update_fan_platform_transfer_requests_updated_at
          BEFORE UPDATE ON fan_platform_transfer_requests
          FOR EACH ROW
          EXECUTE FUNCTION update_fan_platform_transfer_requests_updated_at();
    `;
    
    console.log(indexSQL);
    
  } catch (error) {
    console.error('実行エラー:', error);
  }
}

createTable();