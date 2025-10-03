import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    
    if (!file) {
      return NextResponse.json(
        { error: 'ファイルが選択されていません' },
        { status: 400 }
      )
    }

    // ファイル名を生成（タイムスタンプ付き、日本語対応）
    const timestamp = Date.now()
    // ファイル拡張子を取得
    const ext = file.name.split('.').pop() || 'pdf'
    // 日本語を含む特殊文字を避けるため、ランダムな文字列を使用
    const randomStr = Math.random().toString(36).substring(7)
    const fileName = `${timestamp}_${randomStr}.${ext}`
    
    // ファイルをArrayBufferとして読み込む
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Supabase Storageにアップロード（vendor-invoicesバケットを使用）
    console.log('Uploading file:', fileName, 'Type:', file.type, 'Size:', buffer.length)
    
    const { data, error } = await supabase.storage
      .from('vendor-invoices')
      .upload(fileName, buffer, {
        contentType: file.type,
        upsert: false
      })

    if (error) {
      console.error('Upload error:', error)
      return NextResponse.json(
        { error: 'ファイルのアップロードに失敗しました', details: error.message },
        { status: 500 }
      )
    }

    console.log('Upload successful:', data)

    // 公開URLを取得
    const { data: { publicUrl } } = supabase.storage
      .from('vendor-invoices')
      .getPublicUrl(fileName)

    console.log('Public URL:', publicUrl)

    return NextResponse.json({
      success: true,
      fileUrl: publicUrl,
      fileName: file.name
    })

  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json(
      { error: 'ファイルのアップロードに失敗しました' },
      { status: 500 }
    )
  }
}