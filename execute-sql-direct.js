const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://ladyoszsnntkipfikgyk.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxhZHlvc3pzbm50a2lwZmlrZ3lrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NjM2MDIyMSwiZXhwIjoyMDcxOTM2MjIxfQ._8vqmoA3NST8NPnCsXD6hw5tbd3gUEK0HzOPZBn0FY4';

async function executeSQL() {
  try {
    const response = await fetch('https://ladyoszsnntkipfikgyk.supabase.co/rest/v1/rpc/exec', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${supabaseServiceKey}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify({
        sql: `
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
              approved_by UUID REFERENCES employees(id),
              approved_at TIMESTAMP WITH TIME ZONE,
              
              -- 支払い関連
              payment_date DATE,
              bank_transaction_id UUID REFERENCES bank_transactions(id),
              
              -- インデックス用
              UNIQUE(fan_pf_creator_id, work_year, work_month)
          );
          
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
        `
      })
    });

    if (response.ok) {
      console.log('✅ テーブル作成成功!');
      
      // テーブル確認
      const supabase = createClient(supabaseUrl, supabaseServiceKey);
      const { data, error } = await supabase
        .from('fan_platform_transfer_requests')
        .select('*')
        .limit(1);
        
      if (!error) {
        console.log('✅ fan_platform_transfer_requests テーブルが正常に作成されました');
      }
    } else {
      const errorText = await response.text();
      console.error('エラー:', errorText);
    }
    
  } catch (error) {
    console.error('実行エラー:', error);
  }
}

executeSQL();