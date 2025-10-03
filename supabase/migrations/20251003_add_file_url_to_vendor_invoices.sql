-- vendor_invoicesテーブルにファイルURL用のカラムを追加
ALTER TABLE vendor_invoices 
ADD COLUMN IF NOT EXISTS file_url TEXT,
ADD COLUMN IF NOT EXISTS file_name TEXT;

-- コメント追加
COMMENT ON COLUMN vendor_invoices.file_url IS 'アップロードされたPDFファイルのURL';
COMMENT ON COLUMN vendor_invoices.file_name IS 'アップロードされたファイルの名前';