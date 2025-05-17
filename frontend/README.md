# ガチャフロントエンドプロジェクト

オンライントレーディングカードガチャウェブサイトのフロントエンド（Next.js使用）

## 使用技術

- Next.js 14
- TypeScript
- Tailwind CSS
- Redux Toolkit
- Radix UI
- Stripe決済
- shadcn/ui
- React Hook Form
- Zod
- Axios

## 必要条件

- Node.js (v18以上推奨)
- Yarnパッケージマネージャー

## 環境変数

ルートディレクトリに以下の変数を含む`.env.local`ファイルを作成してください：

```env
# API設定
NEXT_PUBLIC_API_URL=http://localhost:8000

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISH_KEY=your_stripe_publishable_key

# その他の設定
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## インストール

```bash
# 依存関係のインストール
yarn install
```

## アプリケーションの実行

```bash
# 開発モード
yarn dev

# 本番モード
yarn build
yarn start
```

開発サーバーは`http://localhost:3000`で起動します。

## プロジェクト構造

```
.
├── app/             # Nextjs 14 アプリケーションルーター
├── components/      # 共通コンポーネント
│   ├── ui/         # UIコンポーネント（shadcn/ui）
│   └── ...         # その他のコンポーネント
├── lib/            # ユーティリティ関数
├── hooks/          # カスタムフック
├── public/         # 静的ファイル
└── styles/         # グローバルスタイル
```

## 主な機能

- レスポンシブデザイン
- ダークモード対応
- アニメーション効果
- フォーム検証
- 状態管理（Redux）
- 決済処理（Stripe）
- SEO最適化
- アクセシビリティ対応
- 多言語対応

## コンポーネントライブラリ

プロジェクトではshadcn/uiをベースにしたコンポーネントを使用しています。
新しいコンポーネントの追加は以下のコマンドで行えます：

```bash
npx shadcn-ui@latest add [component-name]
```

## スタイリング

- Tailwind CSSを使用
- カスタムテーマ設定（`tailwind.config.ts`）
- アニメーション（`tailwindcss-animate`）
- ダークモード対応

## スクリプト

- `yarn dev` - 開発サーバーの起動
- `yarn build` - プロダクションビルド
- `yarn start` - プロダクションサーバーの起動
- `yarn lint` - ESLintによるコード検証

## パフォーマンス最適化

- 画像の最適化
- コンポーネントの遅延ロード
- ルートの事前フェッチ
- キャッシング戦略
- バンドルサイズの最適化

## デプロイ

プロジェクトはVercelへのデプロイに最適化されています。
以下の設定が含まれています：

- Vercel Edge Functions対応
- 自動デプロイ設定
- 環境変数の管理
- パフォーマンスモニタリング

## 開発ガイドライン

1. 新機能の開発はフィーチャーブランチで行う
2. コンポーネントは可能な限り再利用可能に設計
3. 型定義は厳密に行う
4. アクセシビリティガイドラインに従う
5. パフォーマンスを考慮したコーディング

## コントリビューション

1. フィーチャーブランチを作成
2. 変更をコミット
3. ブランチにプッシュ
4. プルリクエストを作成

## トラブルシューティング

よくある問題と解決方法：

1. ビルドエラー
   - `node_modules`を削除して再インストール
   - `.next`キャッシュをクリア

2. 環境変数の問題
   - `.env.local`ファイルの存在確認
   - 変数名の確認

## ライセンス

[MIT License](LICENSE)
