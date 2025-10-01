-- Create fan_platform_transfer_requests table for payment transfer applications
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

-- コメントを追加
COMMENT ON TABLE fan_platform_transfer_requests IS '振込申請テーブル - クリエイターからの支払い申請を管理';
COMMENT ON COLUMN fan_platform_transfer_requests.work_year IS '稼働年';
COMMENT ON COLUMN fan_platform_transfer_requests.work_month IS '稼働月';
COMMENT ON COLUMN fan_platform_transfer_requests.deposit_year IS '入金年';
COMMENT ON COLUMN fan_platform_transfer_requests.deposit_month IS '入金月';
COMMENT ON COLUMN fan_platform_transfer_requests.fan_pf_creator_id IS 'クリエイターID（fan_pf_creatorテーブルへの外部キー）';
COMMENT ON COLUMN fan_platform_transfer_requests.deposit_amount IS '入金額';
COMMENT ON COLUMN fan_platform_transfer_requests.note IS '備考';
COMMENT ON COLUMN fan_platform_transfer_requests.status IS 'ステータス（pending:申請中, approved:承認済み, rejected:却下, paid:支払い済み）';
COMMENT ON COLUMN fan_platform_transfer_requests.approved_by IS '承認者（employeesテーブルへの外部キー）';
COMMENT ON COLUMN fan_platform_transfer_requests.approved_at IS '承認日時';
COMMENT ON COLUMN fan_platform_transfer_requests.payment_date IS '支払い日';
COMMENT ON COLUMN fan_platform_transfer_requests.bank_transaction_id IS '銀行取引ID（bank_transactionsテーブルへの外部キー）';