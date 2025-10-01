-- Add bank_transaction_id column to fan_platform_deposit table for bank transaction matching
ALTER TABLE fan_platform_deposit 
ADD COLUMN bank_transaction_id UUID REFERENCES bank_transactions(id);

-- Add index for better performance on lookups
CREATE INDEX idx_fan_platform_deposit_bank_transaction_id 
ON fan_platform_deposit(bank_transaction_id);

-- Add comment to explain the purpose
COMMENT ON COLUMN fan_platform_deposit.bank_transaction_id IS '銀行取引データとの照合用ID（消し込み作業用）';