# Maekabu System

ファン事業部クリエイター管理システム

## 概要

TikTokエージェンシーシステムから独立した、ファン事業部専用の管理システムです。

## 技術スタック

- **Framework**: Next.js 14.2.5
- **Language**: TypeScript
- **Database**: Supabase (PostgreSQL) - 既存DBと共有
- **UI**: Material-UI
- **Styling**: Tailwind CSS

## 機能

- クリエイター基本情報管理
- Fantia/Myfans プラットフォーム別管理
- 銀行口座情報管理
- インボイス管理

## セットアップ

### 1. 依存関係のインストール

```bash
npm install
```

### 2. 環境変数の設定

`.env.local` ファイルに以下を設定:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### 3. 開発サーバーの起動

```bash
npm run dev
```

ブラウザで [http://localhost:3000](http://localhost:3000) を開いてアクセス

## プロジェクト構造

```
maekabu_sys/
├── app/
│   ├── page.tsx              # ホームページ（自動リダイレクト）
│   ├── creator/
│   │   ├── page.tsx          # クリエイター管理メイン
│   │   ├── fantia/
│   │   │   └── page.tsx      # Fantiaクリエイター管理
│   │   └── myfans/
│   │       └── page.tsx      # Myfansクリエイター管理
│   └── layout.tsx            # ルートレイアウト
├── components/
│   └── department/           # 部門共通コンポーネント
├── lib/
│   └── supabase.ts          # Supabase設定
└── public/
    └── pf/                  # プラットフォームアイコン
```

## デプロイ

### GitHub リポジトリの作成

1. GitHubで新規リポジトリ `maekabu-system` を作成
2. 以下のコマンドを実行:

```bash
git remote add origin https://github.com/YOUR_USERNAME/maekabu-system.git
git push -u origin main
```

### Vercel へのデプロイ

1. [Vercel](https://vercel.com) にログイン
2. 新規プロジェクトをインポート
3. GitHubリポジトリを選択
4. 環境変数を設定
5. デプロイ

## ライセンス

Private