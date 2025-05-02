# ガチャ API プロジェクト

オンライントレーディングカードガチャウェブサイトのバックエンドAPI（NestJS使用）

## 使用技術

- Node.js
- NestJS
- TypeORM
- PostgreSQL
- TypeScript
- Swagger/OpenAPI
- LINE Bot SDK
- PayPay SDK
- Stripe
- JWT認証

## 必要条件

- Node.js (v14以上)
- PostgreSQL
- Yarnパッケージマネージャー

## 環境変数

ルートディレクトリに以下の変数を含む`.env`ファイルを作成してください：

```env
# データベース
DATABASE_URL=postgresql://user:password@localhost:5432/gacha_db

# JWT
JWT_SECRET=your_jwt_secret
JWT_EXPIRATION=24h

# フロントエンドURL (CORS)
FRONTEND_URL=http://localhost:3000

# 決済連携
STRIPE_SECRET_KEY=your_stripe_secret
PAYPAY_API_KEY=your_paypay_key
PAYPAY_API_SECRET=your_paypay_secret

# LINE連携
LINE_CLIENT_ID=your_line_client_id
LINE_CLIENT_SECRET=your_line_secret

# ファイルアップロード
UPLOAD_DIR=uploads
```

## インストール

```bash
# 依存関係のインストール
yarn install

# TypeORMマイグレーションの生成
yarn typeorm:generate-migration

# マイグレーションの実行
yarn typeorm:run-migrations
```

## アプリケーションの実行

```bash
# 開発モード
yarn start:dev

# 本番モード
yarn build
yarn start
```

APIは`http://localhost:8000`で利用可能になります。

## API ドキュメント

開発モードで実行時、Swagger UIによるAPIドキュメントは`/api/docs`で確認できます。

## プロジェクト構造

```
src/
├── common/          # ガード、デコレーター、共通ユーティリティ
├── config/          # 設定ファイル
├── modules/         # 機能モジュール
│   ├── auth/        # 認証
│   ├── gacha/       # ガチャゲームロジック
│   ├── user/        # ユーザー管理
│   ├── payment/     # 決済連携
│   └── ...
└── main.ts         # アプリケーションのエントリーポイント
```

## 主な機能

- ユーザー認証・認可
- ガチャゲームメカニクス
- 決済処理（Stripe、PayPay）
- LINEメッセージング連携
- ファイルアップロード管理
- PDFおよびCSVレポート生成
- 多言語対応
- リアルタイム通知
- 管理者ダッシュボードAPI
- ユーザーインベントリ管理

## デプロイ

プロジェクトはVercelへのデプロイに設定されています。デプロイ設定については`vercel.json`を参照してください。

## スクリプト

- `yarn start` - アプリケーションの起動
- `yarn start:dev` - 開発モードでの起動（ウォッチモード）
- `yarn build` - アプリケーションのビルド
- `yarn typeorm:generate-migration` - TypeORMマイグレーションの生成
- `yarn typeorm:create-migration` - 空のマイグレーションの作成
- `yarn typeorm:run-migrations` - 保留中のマイグレーションの実行
- `yarn typeorm:revert-migration` - 最後のマイグレーションの取り消し

## コントリビューション

1. フィーチャーブランチを作成
2. 変更をコミット
3. ブランチにプッシュ
4. プルリクエストを作成

## ライセンス

[MIT License](LICENSE)