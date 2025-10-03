import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // 請求書データを取得
    const { data: invoice, error: invoiceError } = await supabase
      .from('invoices')
      .select(`
        *,
        client:clients(*)
      `)
      .eq('id', params.id)
      .single()

    if (invoiceError || !invoice) {
      return NextResponse.json(
        { error: 'Invoice not found' },
        { status: 404 }
      )
    }

    // company_idを使って会社情報を取得
    let company = null
    if (invoice.company_id) {
      const { data: companyData } = await supabase
        .from('companies')
        .select('*')
        .eq('id', invoice.company_id)
        .single()
      company = companyData
    } else {
      // company_idがない場合は株式会社まえかぶの情報を使用
      const { data: companyData } = await supabase
        .from('companies')
        .select('*')
        .eq('id', 'c7b60aee-a256-4880-b308-fa02e0394712')
        .single()
      company = companyData
    }

    // invoice_itemsテーブルから明細を取得
    const { data: items, error: itemsError } = await supabase
      .from('invoice_items')
      .select('*')
      .eq('invoice_id', params.id)
      .order('item_order', { ascending: true })
    
    if (itemsError) {
      console.error('Error fetching invoice items:', itemsError)
    }

    // HTML形式でPDFプレビュー用のコンテンツを生成
    const html = `
<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>請求書 ${invoice.invoice_number}</title>
  <style>
    @page {
      size: A4;
      margin: 10mm;
    }
    body {
      font-family: 'Noto Sans JP', sans-serif;
      line-height: 1.3;
      color: #333;
      max-width: 210mm;
      margin: 0 auto;
      padding: 8px;
      font-size: 10px;
    }
    .header {
      display: flex;
      justify-content: space-between;
      margin-bottom: 10px;
      padding-bottom: 8px;
      border-bottom: 1px solid #333;
      position: relative;
    }
    .title {
      font-size: 20px;
      font-weight: bold;
      color: #1565C0;
      letter-spacing: 3px;
    }
    .subtitle {
      font-size: 12px;
      color: #666;
      margin-top: 3px;
    }
    .invoice-info {
      text-align: right;
    }
    .invoice-number {
      font-size: 10px;
      color: #666;
    }
    .date-info {
      margin: 3px 0;
      font-size: 10px;
    }
    .client-info {
      margin: 10px 0;
      padding: 8px;
      background-color: #f5f5f5;
      border-radius: 3px;
    }
    .client-name {
      font-size: 13px;
      font-weight: bold;
      margin-bottom: 4px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 10px 0;
    }
    th {
      background-color: #1565C0;
      color: white;
      padding: 5px;
      text-align: left;
      font-weight: normal;
      font-size: 9px;
    }
    td {
      padding: 4px;
      border-bottom: 1px solid #ddd;
      font-size: 9px;
    }
    .text-right {
      text-align: right;
    }
    .total-section {
      margin-top: 8px;
      padding: 8px;
      background-color: #f9f9f9;
      border-radius: 3px;
    }
    .total-row {
      display: flex;
      justify-content: space-between;
      padding: 3px 0;
      font-size: 10px;
    }
    .total-label {
      font-weight: bold;
    }
    .grand-total {
      font-size: 12px;
      color: #1565C0;
      border-top: 1px solid #1565C0;
      padding-top: 4px;
      margin-top: 4px;
    }
    .footer {
      margin-top: 10px;
      padding-top: 8px;
      text-align: center;
      color: #666;
      font-size: 8px;
    }
    .company-section {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-top: 10px;
    }
    .company-info {
      flex: 1;
      padding: 8px;
      background-color: #e3f2fd;
      border-radius: 3px;
      font-size: 9px;
    }
    .stamp-box {
      display: flex;
      gap: 4px;
    }
    .stamp {
      width: 40px;
      height: 40px;
      border: 1px solid #ccc;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 8px;
      color: #999;
    }
    .status-badge {
      display: inline-block;
      padding: 2px 8px;
      border-radius: 3px;
      font-size: 9px;
      font-weight: bold;
      margin-left: 8px;
    }
    .status-paid {
      background-color: #4CAF50;
      color: white;
    }
    .status-unpaid {
      background-color: #f44336;
      color: white;
    }
    .status-partial {
      background-color: #FF9800;
      color: white;
    }
    @media print {
      body {
        padding: 0;
      }
      .no-print {
        display: none;
      }
    }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <div class="title">請 求 書</div>
      ${invoice.title ? `<div class="subtitle">${invoice.title}</div>` : ''}
      <div class="invoice-number">No. ${invoice.invoice_number}</div>
    </div>
    <div class="invoice-info">
      <div class="date-info">発行日: ${new Date(invoice.invoice_date).toLocaleDateString('ja-JP')}</div>
      <div class="date-info">支払期限: ${new Date(invoice.due_date).toLocaleDateString('ja-JP')}</div>
      
      <div style="margin-top: 8px; padding-top: 8px; border-top: 1px solid #ddd;">
        ${company ? `
          <div style="display: flex; justify-content: flex-end; align-items: center;">
            <div style="text-align: right; margin-right: 10px;">
              <div style="font-size: 10px; font-weight: bold; margin-bottom: 3px;">${company.company_name || ''}</div>
              ${company.postal_code ? `<div style="font-size: 8px;">〒${company.postal_code}</div>` : ''}
              ${company.address ? `<div style="font-size: 8px;">${company.address}</div>` : ''}
              ${company.phone ? `<div style="font-size: 8px;">TEL: ${company.phone}</div>` : ''}
              ${company.representative_name ? `<div style="font-size: 8px;">${company.representative_title || ''} ${company.representative_name}</div>` : ''}
            </div>
            <div style="width: 50px; height: 50px; flex-shrink: 0;">
              <img src="https://www.ttt-db-hub.com/images/seals/seal-COMPANY-002-1757051757961.png" alt="社印" style="width: 50px; height: 50px; object-fit: contain; opacity: 0.8;" />
            </div>
          </div>
        ` : `
          <div style="color: #999; font-size: 8px;">会社情報が登録されていません</div>
        `}
      </div>
    </div>
  </div>

  <div class="client-info" style="margin-top: 60px;">
    <div class="client-name">${invoice.client?.client_name || invoice.client_name} 御中</div>
    ${invoice.client?.address ? `<div style="font-size: 9px;">〒${invoice.client.postal_code || ''} ${invoice.client.address}</div>` : ''}
    ${invoice.client?.phone ? `<div style="font-size: 9px;">TEL: ${invoice.client.phone}</div>` : ''}
  </div>

  ${invoice.title ? `
    <div style="margin: 15px 0; padding: 10px; background-color: #e3f2fd; border-left: 4px solid #1565C0; border-radius: 3px;">
      <div style="font-size: 14px; font-weight: bold; color: #1565C0;">件名: ${invoice.title}</div>
    </div>
  ` : ''}

  <table>
    <thead>
      <tr>
        <th style="width: 50%">項目</th>
        <th style="width: 15%" class="text-right">数量</th>
        <th style="width: 20%" class="text-right">単価</th>
        <th style="width: 15%" class="text-right">金額</th>
      </tr>
    </thead>
    <tbody>
      ${items && items.length > 0 ? items.map(item => `
        <tr>
          <td>${item.description || ''}</td>
          <td class="text-right">${item.quantity || 1}</td>
          <td class="text-right">¥${(item.unit_price || 0).toLocaleString()}</td>
          <td class="text-right">¥${(item.amount || 0).toLocaleString()}</td>
        </tr>
      `).join('') : `
        <tr>
          <td>${invoice.title || 'サービス料金'}</td>
          <td class="text-right">1</td>
          <td class="text-right">¥${(invoice.subtotal || 0).toLocaleString()}</td>
          <td class="text-right">¥${(invoice.subtotal || 0).toLocaleString()}</td>
        </tr>
      `}
    </tbody>
  </table>

  <div class="total-section">
    <div class="total-row">
      <div class="total-label">小計:</div>
      <div>¥${(invoice.subtotal || 0).toLocaleString()}</div>
    </div>
    <div class="total-row">
      <div class="total-label">消費税 (10%):</div>
      <div>¥${(invoice.tax_amount || 0).toLocaleString()}</div>
    </div>
    <div class="total-row grand-total">
      <div class="total-label">合計金額:</div>
      <div>¥${(invoice.total_amount || 0).toLocaleString()}</div>
    </div>
  </div>

  ${company?.bank_name ? `
    <div style="margin-top: 8px; padding: 6px; background-color: #f5f5f5; border-radius: 3px;">
      <div style="font-weight: bold; margin-bottom: 4px; font-size: 9px;">お振込先:</div>
      <div style="font-size: 9px;">
        ${company.bank_name} ${company.bank_branch || ''}<br>
        ${company.bank_account_type || ''}預金 ${company.bank_account_number || ''}<br>
        ${company.bank_account_name || ''}
      </div>
    </div>
  ` : ''}

  <div class="footer">
    <p>ご不明な点がございましたら、お気軽にお問い合わせください。</p>
  </div>
</body>
</html>
    `

    // HTMLレスポンスを返す（ブラウザでプレビュー表示）
    return new NextResponse(html, {
      status: 200,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
      },
    })
  } catch (error) {
    console.error('Error generating invoice preview:', error)
    return NextResponse.json(
      { error: 'Failed to generate invoice preview' },
      { status: 500 }
    )
  }
}