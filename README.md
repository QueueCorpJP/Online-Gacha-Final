# SHIJON - オンライン ガチャ & トレーディングカード プラットフォーム

> **現代的なオンライン ガチャ体験を提供する包括的なWebプラットフォーム**

SHIJONは、Next.js（フロントエンド）とNestJS（バックエンド）で構築された、エンタープライズグレードのオンライン ガチャ & トレーディングカード プラットフォームです。リアルタイム演出、セキュアな決済システム、包括的な管理機能を提供し、ユーザーに最高のガチャ体験を届けます。

## 📋 目次

1. [🌟 機能概要](#-機能概要)
2. [🏗️ システムアーキテクチャ](#️-システムアーキテクチャ)
3. [🛠️ 技術スタック詳細](#️-技術スタック詳細)
4. [📊 データベース設計](#-データベース設計)
5. [🚀 セットアップガイド](#-セットアップガイド)
6. [🔧 設定詳細](#-設定詳細)
7. [📚 API仕様](#-api仕様)
8. [🔒 セキュリティ実装](#-セキュリティ実装)
9. [🚀 デプロイメント](#-デプロイメント)
10. [🧪 テスト戦略](#-テスト戦略)
11. [🔍 監視・ログ](#-監視ログ)
12. [🤝 開発ガイド](#-開発ガイド)

---

## 🌟 機能概要

### 🎰 ガチャシステム

#### 🎯 基本ガチャ機能
- **単発ガチャ**: 1回引きでの個別体験
- **10連ガチャ**: まとめて引くお得なパック
- **特別ガチャ**: 期間限定・イベント限定ガチャ
- **ステップアップガチャ**: 段階的に確率が上がるシステム

#### 🎬 演出システム
- **動画演出**: WebM/MP4形式での高品質演出
- **レアリティ別演出**: レア度に応じた異なる演出
- **スキップ機能**: 演出をスキップして結果表示
- **演出カスタマイズ**: 管理者による演出設定

#### 🏆 レアリティシステム
- **Normal (N)**: 基本レアリティ（確率: 70%）
- **Rare (R)**: 中レアリティ（確率: 25%）
- **Super Rare (SR)**: 最高レアリティ（確率: 5%）
- **動的確率調整**: 管理者による確率設定

#### 📦 在庫管理
- **リアルタイム在庫更新**: WebSocketによる即座の在庫反映
- **在庫切れ表示**: 在庫0時の視覚的フィードバック
- **在庫アラート**: 管理者向け在庫不足通知
- **自動補充**: 設定に基づく自動在庫補充

### 👤 ユーザー管理システム

#### 🔐 認証・認可
- **多段階認証**: メール + OTP認証
- **JWT Token**: ステートレス認証システム
- **セッション管理**: 自動ログアウト機能
- **パスワードポリシー**: 強度検証システム

#### 📝 プロフィール管理
- **基本情報管理**: 氏名、住所、電話番号
- **プロフィール画像**: S3連携での画像アップロード
- **設定管理**: 言語設定、通知設定
- **アカウント削除**: GDPR準拠の完全削除

#### 🏷️ アカウント状態
- **Active**: 通常利用可能状態
- **Inactive**: メール認証待ち状態
- **Suspended**: 一時停止状態
- **Banned**: 永久利用停止状態

### 💰 決済システム

#### 💳 決済方法
- **Stripe決済**: 
  - クレジットカード決済
  - Apple Pay / Google Pay
  - SEPA決済（欧州）
- **PayPay決済**:
  - QRコード決済
  - PayPay残高決済
  - PayPayあと払い

#### 🪙 内部通貨システム
- **コイン管理**: ガチャ購入用内部通貨
- **自動チャージ**: 残高不足時の自動補充
- **レート設定**: 1円 = 1コインの固定レート
- **履歴管理**: 全取引履歴の記録

#### 🎯 ポイントシステム
- **獲得ポイント**: ガチャ結果に基づくポイント付与
- **交換システム**: アイテム → ポイント変換
- **有効期限**: ポイントの期限管理
- **ランキング**: ポイント順位システム

### 🎁 招待システム

#### 📲 招待コード機能
- **ユニークコード生成**: UUID基盤の8文字コード
- **有効期限設定**: 7日間の有効期限
- **使用状況追跡**: 招待コードの使用履歴
- **統計情報**: 招待成功率の分析

#### 💝 紹介報酬システム
- **1%還元**: 被招待者の課金額の1%をポイント還元
- **リアルタイム計算**: 課金発生時の即座還元
- **上限設定**: 月間還元上限の設定
- **履歴管理**: 還元履歴の詳細記録

### 📦 在庫・賞品管理

#### 📊 在庫管理
- **リアルタイム更新**: 即座の在庫反映システム
- **在庫アラート**: 設定値以下での自動通知
- **分析ダッシュボード**: 在庫状況の可視化
- **予測機能**: 需要予測に基づく在庫提案

#### 🏆 賞品管理
- **デジタル賞品**: NFTカード、ゲーム内アイテム
- **物理賞品**: 実物カード、グッズの配送管理
- **交換システム**: デジタル ↔ ポイント変換
- **配送追跡**: 物理賞品の配送状況管理

### 🔗 外部サービス連携

#### 📱 LINE連携
- **LINE Bot**: 公式アカウント連携
- **通知システム**: ガチャ結果、キャンペーン通知
- **ユーザー認証**: LINE IDでの簡単ログイン
- **メッセージ配信**: セグメント配信機能

#### ☁️ AWS サービス
- **S3ストレージ**: 画像・動画ファイル管理
- **CloudFront CDN**: 高速コンテンツ配信
- **SES**: 大量メール送信サービス
- **Lambda**: サーバーレス処理

#### 📧 メール通知
- **取引通知**: 決済完了、ガチャ結果
- **セキュリティ通知**: ログイン検知、パスワード変更
- **マーケティング**: キャンペーン、新商品案内
- **システム通知**: メンテナンス、障害情報

### 📱 多言語・多地域対応

#### 🌐 言語サポート
- **日本語**: メイン言語（完全対応）
- **英語**: グローバル展開対応
- **中国語**: アジア市場対応
- **動的切替**: リアルタイム言語変更

#### 🕘 タイムゾーン対応
- **自動検出**: ユーザーのタイムゾーン自動設定
- **時刻表示**: 現地時間での表示
- **イベント管理**: 地域別イベント時間管理

### 📊 管理・分析機能

#### 🎛️ 管理者ダッシュボード
- **売上分析**: 日別・月別売上レポート
- **ユーザー分析**: 登録数、アクティブ率
- **ガチャ分析**: 人気ガチャ、収益性分析
- **在庫管理**: 在庫状況、補充提案

#### 📈 レポートシステム
- **売上レポート**: CSV/PDF形式でのエクスポート
- **ユーザーレポート**: 行動分析、セグメント分析
- **システムレポート**: パフォーマンス、エラー率
- **カスタムレポート**: 管理者定義のレポート作成

## 🏗️ システムアーキテクチャ

### 📐 全体アーキテクチャ

```mermaid
graph TB
    subgraph "Frontend Layer"
        A[Next.js App] --> B[Redux Store]
        A --> C[UI Components]
        A --> D[API Client]
    end
    
    subgraph "Backend Layer"
        E[NestJS API] --> F[Authentication]
        E --> G[Business Logic]
        E --> H[Database Layer]
    end
    
    subgraph "External Services"
        I[AWS S3]
        J[Stripe API]
        K[PayPay API]
        L[LINE Bot API]
        M[SMTP Server]
    end
    
    subgraph "Infrastructure"
        N[PostgreSQL]
        O[Redis Cache]
        P[File Storage]
    end
    
    D --> E
    E --> I
    E --> J
    E --> K
    E --> L
    E --> M
    H --> N
    H --> O
    H --> P
```

### 🌐 フロントエンド アーキテクチャ

#### 📁 ディレクトリ構造詳細
```
frontend/
├── 📱 app/                    # Next.js App Router
│   ├── 🏠 (home)/           # ホームページグループ
│   ├── 🔐 (auth)/           # 認証関連ページ
│   │   ├── login/
│   │   ├── signup/
│   │   ├── verify-otp/
│   │   └── reset-password/
│   ├── 🎰 gacha/            # ガチャ関連
│   │   ├── [id]/
│   │   └── result/
│   ├── 👤 profile/          # ユーザープロフィール
│   │   ├── settings/
│   │   ├── inventory/
│   │   ├── invite/
│   │   └── points/
│   ├── 💰 payment/          # 決済関連
│   │   ├── charge/
│   │   └── success/
│   ├── 🔧 admin/            # 管理者専用
│   │   ├── dashboard/
│   │   ├── users/
│   │   ├── gacha/
│   │   └── reports/
│   └── 📝 (legal)/          # 法的文書
│       ├── terms/
│       ├── privacy/
│       └── about/
├── 🧩 components/           # 再利用可能コンポーネント
│   ├── ui/                  # 基本UIコンポーネント
│   ├── forms/               # フォーム関連
│   ├── gacha/               # ガチャ専用
│   ├── profile/             # プロフィール専用
│   └── admin/               # 管理者専用
├── 🗃️ redux/               # 状態管理
│   ├── store.ts
│   └── features/
│       ├── authSlice.ts
│       ├── gachaSlice.ts
│       ├── userSlice.ts
│       └── adminSlice.ts
├── 🔧 lib/                 # ユーティリティ
│   ├── axios.ts
│   ├── utils.ts
│   └── constants.ts
├── 🪝 hooks/               # カスタムフック
│   ├── useAuth.ts
│   ├── useGacha.ts
│   └── useLocalization.ts
├── 🌐 locales/             # 多言語対応
│   ├── ja.json
│   ├── en.json
│   └── zh.json
└── 🎨 styles/              # スタイリング
    ├── globals.css
    └── components.css
```

#### 🔄 状態管理構造
```typescript
// Redux Store構造
interface RootState {
  auth: {
    user: User | null
    token: string | null
    isLoading: boolean
    error: string | null
  }
  gacha: {
    availableGacha: Gacha[]
    currentResult: GachaResult | null
    inventory: InventoryItem[]
    loading: boolean
  }
  payment: {
    coinBalance: number
    pointBalance: number
    transactions: Transaction[]
    loading: boolean
  }
  admin: {
    dashboard: DashboardData
    users: User[]
    reports: Report[]
    loading: boolean
  }
}
```

### ⚙️ バックエンド アーキテクチャ

#### 📁 モジュール構造詳細
```
backend/src/
├── 🔐 modules/
│   ├── 🆔 auth/             # 認証・認可
│   │   ├── auth.controller.ts
│   │   ├── auth.service.ts
│   │   ├── auth.module.ts
│   │   ├── strategies/
│   │   │   ├── jwt.strategy.ts
│   │   │   └── local.strategy.ts
│   │   └── entities/
│   │       ├── otp.entity.ts
│   │       └── blacklisted-token.entity.ts
│   ├── 👤 user/             # ユーザー管理
│   │   ├── user.controller.ts
│   │   ├── user.service.ts
│   │   ├── user.module.ts
│   │   ├── dto/
│   │   │   ├── create-user.dto.ts
│   │   │   └── update-user.dto.ts
│   │   └── entities/
│   │       └── user.entity.ts
│   ├── 🎰 gacha/            # ガチャシステム
│   │   ├── gacha.controller.ts
│   │   ├── gacha.service.ts
│   │   ├── gacha.module.ts
│   │   ├── engines/
│   │   │   ├── probability.engine.ts
│   │   │   └── result.engine.ts
│   │   └── entities/
│   │       ├── gacha.entity.ts
│   │       ├── gacha-item.entity.ts
│   │       └── gacha-result.entity.ts
│   ├── 💰 payments/         # 決済処理
│   │   ├── payments.controller.ts
│   │   ├── payments.service.ts
│   │   ├── payments.module.ts
│   │   ├── providers/
│   │   │   ├── stripe.provider.ts
│   │   │   └── paypay.provider.ts
│   │   └── entities/
│   │       ├── payment.entity.ts
│   │       └── transaction.entity.ts
│   ├── 🎁 invite/           # 招待システム
│   │   ├── invite.controller.ts
│   │   ├── invite.service.ts
│   │   ├── invite.module.ts
│   │   └── entities/
│   │       └── invite-code.entity.ts
│   ├── 📦 inventory/        # 在庫管理
│   │   ├── inventory.controller.ts
│   │   ├── inventory.service.ts
│   │   ├── inventory.module.ts
│   │   ├── jobs/
│   │   │   └── stock-alert.job.ts
│   │   └── entities/
│   │       ├── inventory.entity.ts
│   │       └── inventory-log.entity.ts
│   ├── 🏆 prizes/           # 賞品管理
│   │   ├── prizes.controller.ts
│   │   ├── prizes.service.ts
│   │   ├── prizes.module.ts
│   │   └── entities/
│   │       └── prize.entity.ts
│   ├── 🪙 coin/             # コインシステム
│   │   ├── coin.controller.ts
│   │   ├── coin.service.ts
│   │   ├── coin.module.ts
│   │   └── entities/
│   │       └── coin-transaction.entity.ts
│   ├── 🎯 points/           # ポイントシステム
│   │   ├── points.controller.ts
│   │   ├── points.service.ts
│   │   ├── points.module.ts
│   │   └── entities/
│   │       └── points-transaction.entity.ts
│   ├── 📱 line/             # LINE連携
│   │   ├── line.controller.ts
│   │   ├── line.service.ts
│   │   ├── line.module.ts
│   │   └── entities/
│   │       └── line-settings.entity.ts
│   ├── ☁️ s3/              # AWS S3連携
│   │   ├── s3.service.ts
│   │   └── s3.module.ts
│   ├── 📧 mail/             # メール送信
│   │   ├── mail.service.ts
│   │   ├── mail.module.ts
│   │   └── templates/
│   │       ├── welcome.hbs
│   │       ├── otp.hbs
│   │       └── password-reset.hbs
│   ├── 📰 news-blog/        # ニュース・ブログ
│   │   ├── news-blog.controller.ts
│   │   ├── news-blog.service.ts
│   │   ├── news-blog.module.ts
│   │   └── entities/
│   │       └── news-blog.entity.ts
│   ├── ❓ faqs/             # FAQ
│   │   ├── faqs.controller.ts
│   │   ├── faqs.service.ts
│   │   ├── faqs.module.ts
│   │   └── entities/
│   │       └── faq.entity.ts
│   ├── 📂 category/         # カテゴリ管理
│   │   ├── category.controller.ts
│   │   ├── category.service.ts
│   │   ├── category.module.ts
│   │   └── entities/
│   │       └── category.entity.ts
│   ├── 🔔 notifications/    # 通知システム
│   │   ├── notifications.controller.ts
│   │   ├── notifications.service.ts
│   │   ├── notifications.module.ts
│   │   └── entities/
│   │       └── notification.entity.ts
│   ├── 🔒 security/         # セキュリティログ
│   │   ├── security.service.ts
│   │   ├── security.module.ts
│   │   └── entities/
│   │       └── security-log.entity.ts
│   ├── 📊 reporting/        # レポート機能
│   │   ├── reporting.controller.ts
│   │   ├── reporting.service.ts
│   │   ├── reporting.module.ts
│   │   └── generators/
│   │       ├── sales.generator.ts
│   │       └── user.generator.ts
│   └── 🛠️ admin/           # 管理機能
│       ├── admin.controller.ts
│       ├── admin.service.ts
│       └── admin.module.ts
├── 🔧 common/              # 共通モジュール
│   ├── guards/
│   │   ├── auth.guard.ts
│   │   ├── roles.guard.ts
│   │   └── throttle.guard.ts
│   ├── decorators/
│   │   ├── current-user.decorator.ts
│   │   ├── roles.decorator.ts
│   │   └── public.decorator.ts
│   ├── filters/
│   │   ├── http-exception.filter.ts
│   │   └── validation.filter.ts
│   ├── interceptors/
│   │   ├── transform.interceptor.ts
│   │   └── logging.interceptor.ts
│   ├── pipes/
│   │   └── validation.pipe.ts
│   └── enums/
│       ├── user-roles.enum.ts
│       └── payment-status.enum.ts
├── ⚙️ config/              # 設定管理
│   ├── database.config.ts
│   ├── jwt.config.ts
│   ├── stripe.config.ts
│   ├── s3.config.ts
│   └── mail.config.ts
└── 📦 migrations/          # データベースマイグレーション
    ├── 1699000000000-InitialTables.ts
    ├── 1699000001000-AddUserProfile.ts
    ├── 1699000002000-AddInviteSystem.ts
    └── 1699000003000-AddPaymentTables.ts
```

---

## 🛠️ 技術スタック詳細

### 🖥️ フロントエンド技術

#### ⚛️ React/Next.js エコシステム
- **Next.js 14**: App Router、Server Components
- **React 18**: Concurrent Features、Suspense
- **TypeScript 5**: 型安全性、開発体験向上

#### 🎨 UI/UXライブラリ
- **Tailwind CSS 3**: ユーティリティファーストCSS
- **Radix UI**: アクセシブルなUIプリミティブ
- **Framer Motion**: 滑らかなアニメーション
- **React Hook Form**: 高性能フォーム管理
- **Zod**: スキーマベースバリデーション

#### 🗃️ 状態管理
- **Redux Toolkit**: 効率的な状態管理
- **Redux Persist**: 状態の永続化
- **React Query**: サーバー状態管理
- **Zustand**: 軽量状態管理（局所的）

#### 🔌 HTTP通信・API
- **Axios**: HTTP クライアント
- **SWR**: データフェッチング
- **Socket.io Client**: リアルタイム通信

### ⚙️ バックエンド技術

#### 🏗️ フレームワーク・ランタイム
- **NestJS 10**: エンタープライズグレードNode.jsフレームワーク
- **Node.js 18**: LTS版での安定動作
- **TypeScript 5**: 型安全なサーバーサイド開発

#### 🗄️ データベース・ORM
- **PostgreSQL 15**: 堅牢なリレーショナルデータベース
- **TypeORM 0.3**: TypeScript-first ORM
- **Redis 7**: キャッシュ・セッション管理
- **Connection Pooling**: pgBouncerによる接続管理

#### 🔐 認証・セキュリティ
- **JWT**: JSON Web Token認証
- **bcrypt**: パスワードハッシュ化
- **Passport.js**: 認証ストラテジー
- **Helmet**: セキュリティヘッダー
- **Rate Limiting**: API使用量制限

#### 💰 決済システム統合
- **Stripe API v2024**: クレジットカード決済
- **PayPay API v2**: QR決済・ウォレット決済
- **Webhook処理**: 非同期決済通知

#### ☁️ 外部サービス
- **AWS SDK v3**: クラウドサービス統合
- **Nodemailer**: SMTP メール送信
- **LINE Messaging API**: チャットボット連携
- **Socket.io**: WebSocketサーバー

### 🗄️ データベース・インフラ

#### 📊 データベース設計
- **ACID準拠**: トランザクション整合性
- **インデックス最適化**: クエリパフォーマンス向上
- **パーティショニング**: 大容量データ対応
- **レプリケーション**: 読み書き分離

#### ☁️ クラウドインフラ
- **AWS EC2**: スケーラブルなコンピューティング
- **AWS S3**: オブジェクトストレージ
- **AWS CloudFront**: CDN・キャッシュ
- **AWS RDS**: マネージドデータベース
- **AWS SES**: 大量メール配信

#### 🔄 DevOps・CI/CD
- **GitHub Actions**: 自動化パイプライン
- **Docker**: コンテナ化
- **PM2**: プロセス管理
- **Nginx**: リバースプロキシ・ロードバランサー
- **Let's Encrypt**: SSL証明書自動更新

### 🧪 テスト・品質保証

#### 🔍 テストフレームワーク
- **Jest**: ユニット・統合テスト
- **Supertest**: API テスト
- **Cypress**: E2Eテスト
- **Storybook**: UIコンポーネントテスト

#### 📏 コード品質
- **ESLint**: 静的解析・コード規約
- **Prettier**: コードフォーマット
- **Husky**: Git フック
- **SonarQube**: コード品質分析

## 📊 データベース設計

### 🗃️ エンティティ関係図 (ER図)

```mermaid
erDiagram
    User ||--o{ UserProfile : has
    User ||--o{ InviteCode : generates
    User ||--o{ GachaResult : performs
    User ||--o{ Payment : makes
    User ||--o{ CoinTransaction : has
    User ||--o{ PointsTransaction : has
    User ||--o{ InventoryItem : owns
    User ||--o{ SecurityLog : creates
    
    InviteCode ||--o{ User : referred_by
    
    Gacha ||--o{ GachaItem : contains
    Gacha ||--o{ GachaResult : produces
    
    GachaItem ||--o{ InventoryItem : becomes
    GachaItem ||--o{ Prize : links_to
    
    Payment ||--|| CoinTransaction : generates
    Payment ||--|| PointsTransaction : may_generate
    
    Category ||--o{ Gacha : categorizes
    Category ||--o{ Prize : categorizes
    
    Admin ||--o{ SecurityLog : reviews
```

### 🏗️ 主要テーブル構造

#### 👤 ユーザー関連テーブル

```sql
-- ユーザーメインテーブル
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    username VARCHAR(50) UNIQUE,
    role user_role_enum DEFAULT 'user',
    status user_status_enum DEFAULT 'inactive',
    email_verified_at TIMESTAMP,
    referred_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ユーザープロフィールテーブル
CREATE TABLE user_profiles (
    id SERIAL PRIMARY KEY,
    user_id INTEGER UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    phone VARCHAR(20),
    address TEXT,
    date_of_birth DATE,
    avatar_url VARCHAR(500),
    language VARCHAR(5) DEFAULT 'ja',
    timezone VARCHAR(50) DEFAULT 'Asia/Tokyo',
    notification_settings JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- OTP認証テーブル
CREATE TABLE otps (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    code VARCHAR(6) NOT NULL,
    purpose otp_purpose_enum NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    verified_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### 🎰 ガチャ関連テーブル

```sql
-- ガチャメインテーブル
CREATE TABLE gachas (
    id SERIAL PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    category_id INTEGER REFERENCES categories(id),
    price INTEGER NOT NULL, -- コイン単位
    is_active BOOLEAN DEFAULT true,
    start_date TIMESTAMP,
    end_date TIMESTAMP,
    video_url VARCHAR(500),
    image_url VARCHAR(500),
    total_stock INTEGER DEFAULT 0,
    remaining_stock INTEGER DEFAULT 0,
    max_per_user INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ガチャアイテムテーブル
CREATE TABLE gacha_items (
    id SERIAL PRIMARY KEY,
    gacha_id INTEGER REFERENCES gachas(id) ON DELETE CASCADE,
    prize_id INTEGER REFERENCES prizes(id),
    rarity rarity_enum NOT NULL,
    probability DECIMAL(5,4) NOT NULL, -- 0.0001 to 1.0000
    stock INTEGER DEFAULT 0,
    max_wins_per_user INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ガチャ結果テーブル
CREATE TABLE gacha_results (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    gacha_id INTEGER REFERENCES gachas(id),
    gacha_item_id INTEGER REFERENCES gacha_items(id),
    quantity INTEGER DEFAULT 1,
    points_awarded INTEGER DEFAULT 0,
    performed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### 💰 決済・経済システムテーブル

```sql
-- 決済テーブル
CREATE TABLE payments (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'JPY',
    payment_method payment_method_enum NOT NULL,
    provider_transaction_id VARCHAR(255),
    status payment_status_enum DEFAULT 'pending',
    metadata JSONB,
    processed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- コイン取引テーブル
CREATE TABLE coin_transactions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    amount INTEGER NOT NULL, -- 正数=獲得、負数=消費
    balance_after INTEGER NOT NULL,
    transaction_type coin_transaction_type_enum NOT NULL,
    reference_id INTEGER, -- payment_id や gacha_result_id など
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ポイント取引テーブル
CREATE TABLE points_transactions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    amount INTEGER NOT NULL,
    balance_after INTEGER NOT NULL,
    transaction_type points_transaction_type_enum NOT NULL,
    reference_id INTEGER,
    expires_at TIMESTAMP,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### 🎁 招待システムテーブル

```sql
-- 招待コードテーブル
CREATE TABLE invite_codes (
    id SERIAL PRIMARY KEY,
    code VARCHAR(8) UNIQUE NOT NULL,
    created_by INTEGER REFERENCES users(id),
    used_by INTEGER REFERENCES users(id),
    used_at TIMESTAMP,
    expires_at TIMESTAMP NOT NULL,
    referral_bonus_percentage DECIMAL(3,2) DEFAULT 1.00,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 招待統計テーブル
CREATE TABLE invite_stats (
    id SERIAL PRIMARY KEY,
    user_id INTEGER UNIQUE REFERENCES users(id),
    codes_generated INTEGER DEFAULT 0,
    successful_invites INTEGER DEFAULT 0,
    total_bonus_earned DECIMAL(10,2) DEFAULT 0,
    last_invite_at TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 📋 ENUM定義

```sql
-- ユーザー役割
CREATE TYPE user_role_enum AS ENUM ('user', 'admin', 'moderator');

-- ユーザー状態
CREATE TYPE user_status_enum AS ENUM ('active', 'inactive', 'suspended', 'banned');

-- OTP用途
CREATE TYPE otp_purpose_enum AS ENUM ('registration', 'login', 'password_reset', 'email_change');

-- レアリティ
CREATE TYPE rarity_enum AS ENUM ('normal', 'rare', 'super_rare');

-- 決済方法
CREATE TYPE payment_method_enum AS ENUM ('stripe', 'paypay');

-- 決済状態
CREATE TYPE payment_status_enum AS ENUM ('pending', 'completed', 'failed', 'refunded');

-- コイン取引種類
CREATE TYPE coin_transaction_type_enum AS ENUM ('purchase', 'gacha_draw', 'refund', 'bonus');

-- ポイント取引種類
CREATE TYPE points_transaction_type_enum AS ENUM ('gacha_reward', 'referral_bonus', 'exchange', 'expiry');
```

### 🔍 インデックス戦略

```sql
-- パフォーマンス最適化インデックス
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_status ON users(status);
CREATE INDEX idx_users_referred_by ON users(referred_by);

CREATE INDEX idx_gacha_results_user_id ON gacha_results(user_id);
CREATE INDEX idx_gacha_results_gacha_id ON gacha_results(gacha_id);
CREATE INDEX idx_gacha_results_performed_at ON gacha_results(performed_at);

CREATE INDEX idx_payments_user_id ON payments(user_id);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_payments_created_at ON payments(created_at);

CREATE INDEX idx_coin_transactions_user_id ON coin_transactions(user_id);
CREATE INDEX idx_coin_transactions_created_at ON coin_transactions(created_at);

CREATE INDEX idx_invite_codes_code ON invite_codes(code);
CREATE INDEX idx_invite_codes_created_by ON invite_codes(created_by);
CREATE INDEX idx_invite_codes_expires_at ON invite_codes(expires_at);
```

---

## 🚀 セットアップガイド

### 📋 事前準備

#### システム要件
- **Node.js**: v18.0.0 以上
- **npm**: v8.0.0 以上
- **PostgreSQL**: v13.0 以上
- **Redis**: v6.0 以上 (オプション、キャッシュ用)
- **Git**: v2.30 以上

#### 外部サービス準備
- **AWS アカウント** (S3, SES用)
- **Stripe アカウント** (決済用)
- **PayPay for Developers アカウント** (PayPay決済用)
- **Gmail App Password** (メール送信用)

### 📥 インストール手順

#### 1. リポジトリクローンとセットアップ

```bash
# リポジトリクローン
git clone https://github.com/your-username/online-gacha-final.git
cd online-gacha-final

# ルートディレクトリで全体依存関係確認
npm run install:all
```

#### 2. PostgreSQL データベースセットアップ

```bash
# PostgreSQL インストール (Ubuntu/Debian)
sudo apt update
sudo apt install postgresql postgresql-contrib

# PostgreSQL 起動
sudo systemctl start postgresql
sudo systemctl enable postgresql

# データベース作成
sudo -u postgres psql
CREATE DATABASE gacha;
CREATE USER gacha_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE gacha TO gacha_user;
\q
```

#### 3. バックエンド環境構築

```bash
cd backend

# 依存関係インストール
npm install

# 環境変数ファイル作成
cp .env.example .env
```

**.env ファイル設定例:**
```bash
# サーバー設定
PORT=3001
NODE_ENV=development

# データベース設定
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=gacha_user
DB_PASSWORD=your_password
DB_NAME=gacha

# JWT設定
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRES_IN=24h

# AWS S3設定
AWS_ACCESS_KEY_ID=AKIA...
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_REGION=ap-northeast-1
S3_BUCKET_NAME=your-gacha-bucket

# Stripe設定
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# PayPay設定
PAYPAY_API_KEY=your-paypay-key
PAYPAY_API_SECRET=your-paypay-secret
PAYPAY_MERCHANT_ID=your-merchant-id
PAYPAY_ENVIRONMENT=sandbox

# LINE Bot設定
LINE_CHANNEL_ACCESS_TOKEN=your-line-access-token
LINE_CLIENT_SECRET=your-line-client-secret

# メール設定
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
EMAIL_FROM="SHIJON Support <noreply@shijon.com>"

# Redis設定 (オプション)
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# ログ設定
LOG_LEVEL=debug
LOG_FILE_PATH=./logs
```

#### 4. データベースマイグレーション実行

```bash
# マイグレーション実行
npm run typeorm:run-migrations

# 初期データ投入 (オプション)
npm run seed:run
```

#### 5. バックエンド起動確認

```bash
# 開発モードで起動
npm run start:dev

# または本番モードで起動
npm run build
npm run start:prod
```

起動確認:
- API: http://localhost:3001
- Swagger文書: http://localhost:3001/api

#### 6. フロントエンド環境構築

```bash
cd ../frontend

# 依存関係インストール
npm install

# 環境変数ファイル作成
cp .env.local.example .env.local
```

**.env.local ファイル設定例:**
```bash
# API設定
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_WS_URL=ws://localhost:3001

# Stripe公開キー
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...

# PayPay設定
NEXT_PUBLIC_PAYPAY_CLIENT_ID=your-paypay-client-id

# その他設定
NEXT_PUBLIC_APP_NAME=SHIJON
NEXT_PUBLIC_APP_VERSION=1.0.0
NEXT_PUBLIC_ENVIRONMENT=development
```

#### 7. フロントエンド起動確認

```bash
# 開発モードで起動
npm run dev

# または本番ビルド
npm run build
npm start
```

起動確認:
- アプリケーション: http://localhost:3000

### 🔧 開発環境追加設定

#### VS Code 拡張機能推奨

```json
// .vscode/extensions.json
{
  "recommendations": [
    "bradlc.vscode-tailwindcss",
    "esbenp.prettier-vscode",
    "dbaeumer.vscode-eslint",
    "ms-vscode.vscode-typescript-next",
    "bradlc.vscode-tailwindcss",
    "ms-vscode.vscode-json"
  ]
}
```

#### Git フック設定

```bash
# Husky セットアップ (フロントエンド)
cd frontend
npx husky install
npx husky add .husky/pre-commit "npm run lint"
npx husky add .husky/pre-push "npm run test"
```

#### Docker環境 (オプション)

```yaml
# docker-compose.yml
version: '3.8'
services:
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: gacha
      POSTGRES_USER: gacha_user
      POSTGRES_PASSWORD: your_password
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

volumes:
  postgres_data:
```

```bash
# Docker環境起動
docker-compose up -d
```

---

## 🔧 設定詳細

### ⚙️ バックエンド設定

#### 🗄️ データベース設定

```typescript
// backend/src/config/database.config.ts
import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';

export const databaseConfig = (configService: ConfigService): TypeOrmModuleOptions => ({
  type: 'postgres',
  host: configService.get('DB_HOST'),
  port: parseInt(configService.get('DB_PORT'), 10),
  username: configService.get('DB_USERNAME'),
  password: configService.get('DB_PASSWORD'),
  database: configService.get('DB_NAME'),
  entities: ['dist/**/*.entity{.ts,.js}'],
  migrations: ['dist/migrations/*{.ts,.js}'],
  synchronize: configService.get('NODE_ENV') === 'development',
  logging: configService.get('NODE_ENV') === 'development',
  ssl: configService.get('NODE_ENV') === 'production' ? { rejectUnauthorized: false } : false,
  extra: {
    max: 20, // 最大接続数
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
  },
});
```

#### 🔐 JWT設定

```typescript
// backend/src/config/jwt.config.ts
import { ConfigService } from '@nestjs/config';
import { JwtModuleOptions } from '@nestjs/jwt';

export const jwtConfig = (configService: ConfigService): JwtModuleOptions => ({
  secret: configService.get('JWT_SECRET'),
  signOptions: {
    expiresIn: configService.get('JWT_EXPIRES_IN', '24h'),
    issuer: 'SHIJON',
    audience: 'SHIJON-API',
  },
});
```

#### 💳 決済プロバイダー設定

```typescript
// backend/src/config/payment.config.ts
export const stripeConfig = {
  secretKey: process.env.STRIPE_SECRET_KEY,
  publicKey: process.env.STRIPE_PUBLISHABLE_KEY,
  webhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
  currency: 'jpy',
  paymentMethodTypes: ['card'],
};

export const paypayConfig = {
  apiKey: process.env.PAYPAY_API_KEY,
  apiSecret: process.env.PAYPAY_API_SECRET,
  merchantId: process.env.PAYPAY_MERCHANT_ID,
  environment: process.env.PAYPAY_ENVIRONMENT || 'sandbox',
  currency: 'JPY',
};
```

### 🌐 フロントエンド設定

#### 🎨 Tailwind CSS設定

```javascript
// frontend/tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          500: '#3b82f6',
          900: '#1e3a8a',
        },
        gacha: {
          normal: '#6b7280',
          rare: '#3b82f6',
          super: '#f59e0b',
        },
      },
      animation: {
        'gacha-spin': 'spin 2s linear infinite',
        'card-flip': 'flip 0.8s ease-in-out',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
  ],
}
```

#### 🗃️ Redux設定

```typescript
// frontend/redux/store.ts
import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';

const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['auth', 'user'], // 永続化するスライス
};

export const store = configureStore({
  reducer: {
    auth: persistReducer(persistConfig, authSlice.reducer),
    user: userSlice.reducer,
    gacha: gachaSlice.reducer,
    payment: paymentSlice.reducer,
    admin: adminSlice.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
  devTools: process.env.NODE_ENV !== 'production',
});

export const persistor = persistStore(store);
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
```

## 📚 API仕様

### 🔗 APIベースURL

- **開発環境**: `http://localhost:3001`
- **本番環境**: `https://api.shijon.com`
- **API文書**: `{BASE_URL}/api` (Swagger UI)

### 🔐 認証エンドポイント

#### POST /auth/register
**新規ユーザー登録**

**リクエスト:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123",
  "username": "username",
  "inviteCode": "ABC12345" // オプション
}
```

**レスポンス (201):**
```json
{
  "success": true,
  "message": "ユーザー登録が完了しました。OTPが送信されました。",
  "data": {
    "userId": 123,
    "email": "user@example.com",
    "status": "inactive"
  }
}
```

#### POST /auth/verify-otp
**OTP認証**

**リクエスト:**
```json
{
  "email": "user@example.com",
  "code": "123456"
}
```

**レスポンス (200):**
```json
{
  "success": true,
  "message": "認証が完了しました",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 123,
      "email": "user@example.com",
      "username": "username",
      "role": "user",
      "status": "active"
    }
  }
}
```

#### POST /auth/login
**ユーザーログイン**

**リクエスト:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

**レスポンス (200):**
```json
{
  "success": true,
  "message": "ログインが完了しました",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 123,
      "email": "user@example.com",
      "username": "username",
      "role": "user",
      "coinBalance": 1000,
      "pointBalance": 500
    }
  }
}
```

### 🎰 ガチャエンドポイント

#### GET /gacha
**利用可能ガチャ一覧取得**

**レスポンス (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "プレミアムガチャ",
      "description": "レアカードが出やすい特別ガチャ",
      "price": 300,
      "imageUrl": "https://s3.amazonaws.com/gacha1.jpg",
      "videoUrl": "https://s3.amazonaws.com/gacha1.mp4",
      "isActive": true,
      "remainingStock": 100,
      "startDate": "2024-01-01T00:00:00Z",
      "endDate": "2024-12-31T23:59:59Z",
      "items": [
        {
          "id": 1,
          "rarity": "super_rare",
          "probability": 0.05,
          "stock": 10,
          "prize": {
            "id": 1,
            "name": "ドラゴンカード",
            "imageUrl": "https://s3.amazonaws.com/dragon.jpg",
            "points": 1000
          }
        }
      ]
    }
  ],
  "pagination": {
    "total": 1,
    "page": 1,
    "limit": 10
  }
}
```

#### POST /gacha/draw
**ガチャ実行**

**リクエスト:**
```json
{
  "gachaId": 1,
  "quantity": 1 // 1 or 10
}
```

**レスポンス (200):**
```json
{
  "success": true,
  "message": "ガチャを実行しました",
  "data": {
    "results": [
      {
        "id": 1001,
        "gachaItemId": 1,
        "quantity": 1,
        "pointsAwarded": 1000,
        "rarity": "super_rare",
        "prize": {
          "id": 1,
          "name": "ドラゴンカード",
          "imageUrl": "https://s3.amazonaws.com/dragon.jpg",
          "points": 1000
        }
      }
    ],
    "totalPointsAwarded": 1000,
    "newCoinBalance": 700,
    "newPointBalance": 1500
  }
}
```

### 👤 ユーザープロフィールエンドポイント

#### GET /profile
**プロフィール情報取得**

**レスポンス (200):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": 123,
      "email": "user@example.com",
      "username": "username",
      "role": "user",
      "status": "active",
      "createdAt": "2024-01-01T00:00:00Z"
    },
    "profile": {
      "firstName": "太郎",
      "lastName": "田中",
      "phone": "090-1234-5678",
      "address": "東京都渋谷区...",
      "avatarUrl": "https://s3.amazonaws.com/avatar.jpg",
      "language": "ja",
      "timezone": "Asia/Tokyo"
    },
    "balances": {
      "coins": 1000,
      "points": 500
    },
    "stats": {
      "totalGachaDraws": 50,
      "totalPointsEarned": 10000,
      "invitesGenerated": 5,
      "successfulInvites": 2
    }
  }
}
```

#### PUT /profile
**プロフィール更新**

**リクエスト:**
```json
{
  "firstName": "太郎",
  "lastName": "田中",
  "phone": "090-1234-5678",
  "address": "東京都渋谷区...",
  "language": "ja",
  "timezone": "Asia/Tokyo"
}
```

### 🎁 招待システムエンドポイント

#### POST /invite/generate
**招待コード生成**

**レスポンス (201):**
```json
{
  "success": true,
  "message": "招待コードを生成しました",
  "data": {
    "code": "ABC12345",
    "expiresAt": "2024-01-08T00:00:00Z",
    "referralBonusPercentage": 1.0
  }
}
```

#### GET /invite/stats
**招待統計取得**

**レスポンス (200):**
```json
{
  "success": true,
  "data": {
    "codesGenerated": 5,
    "successfulInvites": 2,
    "totalBonusEarned": 150.00,
    "activeCodes": 1,
    "lastInviteAt": "2024-01-01T00:00:00Z"
  }
}
```

### 💰 決済エンドポイント

#### POST /payments/stripe
**Stripe決済処理**

**リクエスト:**
```json
{
  "amount": 1000,
  "currency": "jpy",
  "paymentMethodId": "pm_1234567890"
}
```

**レスポンス (200):**
```json
{
  "success": true,
  "message": "決済が完了しました",
  "data": {
    "paymentId": "payment_123",
    "amount": 1000,
    "currency": "jpy",
    "status": "completed",
    "coinsAdded": 1000,
    "newCoinBalance": 2000
  }
}
```

#### POST /payments/paypay
**PayPay決済処理**

**リクエスト:**
```json
{
  "amount": 1000,
  "orderInfo": {
    "merchantPaymentId": "order_123",
    "codeType": "ORDER_QR"
  }
}
```

---

## 🔒 セキュリティ実装

### 🛡️ 認証セキュリティ

#### JWT実装詳細
```typescript
// JWT戦略設定
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get('JWT_SECRET'),
      issuer: 'SHIJON',
      audience: 'SHIJON-API',
    });
  }

  async validate(payload: any) {
    return {
      userId: payload.sub,
      email: payload.email,
      role: payload.role,
    };
  }
}
```

#### パスワードセキュリティ
```typescript
// パスワードハッシュ化
@Injectable()
export class AuthService {
  async hashPassword(password: string): Promise<string> {
    const saltRounds = 12;
    return await bcrypt.hash(password, saltRounds);
  }

  async validatePassword(password: string, hash: string): Promise<boolean> {
    return await bcrypt.compare(password, hash);
  }

  // パスワード強度検証
  validatePasswordStrength(password: string): boolean {
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    return password.length >= minLength && 
           hasUpperCase && 
           hasLowerCase && 
           hasNumbers && 
           hasSpecialChar;
  }
}
```

### 🔐 API セキュリティ

#### Rate Limiting実装
```typescript
// レート制限設定
@Controller('auth')
@UseGuards(ThrottlerGuard)
export class AuthController {
  @Post('login')
  @Throttle(5, 60) // 1分間に5回まで
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Post('register')
  @Throttle(3, 3600) // 1時間に3回まで
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }
}
```

#### CORS設定
```typescript
// CORS設定
app.enableCors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://shijon.com', 'https://www.shijon.com']
    : ['http://localhost:3000'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
});
```

#### セキュリティヘッダー
```typescript
// Helmet設定
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "https://js.stripe.com"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "https://api.stripe.com"],
      frameSrc: ["https://js.stripe.com"],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true,
  },
}));
```

### 📊 セキュリティログ

#### ログ記録システム
```typescript
@Injectable()
export class SecurityService {
  async logSecurityEvent(event: SecurityEvent) {
    const log = new SecurityLog();
    log.userId = event.userId;
    log.action = event.action;
    log.ipAddress = event.ipAddress;
    log.userAgent = event.userAgent;
    log.details = event.details;
    log.severity = event.severity;
    log.timestamp = new Date();

    await this.securityLogRepository.save(log);

    // 重要度が高い場合は管理者に通知
    if (event.severity === 'HIGH') {
      await this.notifyAdmins(log);
    }
  }

  // 不審なアクティビティ検出
  async detectSuspiciousActivity(userId: number): Promise<boolean> {
    const recentLogs = await this.securityLogRepository.find({
      where: { userId, timestamp: MoreThan(new Date(Date.now() - 3600000)) },
      order: { timestamp: 'DESC' },
    });

    // 1時間以内に10回以上の失敗ログイン
    const failedLogins = recentLogs.filter(log => 
      log.action === 'LOGIN_FAILED'
    );

    return failedLogins.length >= 10;
  }
}
```

### 💳 決済セキュリティ

#### Stripe Webhook検証
```typescript
@Controller('webhooks')
export class WebhookController {
  @Post('stripe')
  async handleStripeWebhook(
    @Req() req: Request,
    @Headers('stripe-signature') signature: string
  ) {
    let event: Stripe.Event;

    try {
      // Webhook署名検証
      event = this.stripe.webhooks.constructEvent(
        req.body,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET
      );
    } catch (err) {
      throw new BadRequestException('Invalid webhook signature');
    }

    // 冪等性チェック
    const existingEvent = await this.webhookEventRepository.findOne({
      where: { stripeEventId: event.id }
    });

    if (existingEvent) {
      return { received: true };
    }

    // イベント処理
    await this.processWebhookEvent(event);
    
    return { received: true };
  }
}
```

---

## 🚀 デプロイメント

### 🏗️ インフラストラクチャ

#### AWS EC2 設定
```bash
# EC2インスタンス初期設定
sudo apt update && sudo apt upgrade -y

# Node.js インストール
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# PM2 インストール
sudo npm install -g pm2

# Nginx インストール
sudo apt install nginx -y

# PostgreSQL インストール
sudo apt install postgresql postgresql-contrib -y

# SSL証明書 (Let's Encrypt)
sudo apt install certbot python3-certbot-nginx -y
```

#### Nginx設定
```nginx
# /etc/nginx/sites-available/shijon
server {
    listen 80;
    server_name shijon.com www.shijon.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name shijon.com www.shijon.com;

    ssl_certificate /etc/letsencrypt/live/shijon.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/shijon.com/privkey.pem;

    # SSL設定
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512;
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;

    # セキュリティヘッダー
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Strict-Transport-Security "max-age=63072000" always;

    # フロントエンド
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # API
    location /api {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # API専用設定
        client_max_body_size 10M;
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # 静的ファイル
    location /uploads {
        root /var/www/shijon;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

### 🔄 CI/CD パイプライン

#### GitHub Actions設定
```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: test
          POSTGRES_DB: gacha_test
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

    steps:
    - uses: actions/checkout@v4
    
    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: '18'
        cache: 'npm'
        cache-dependency-path: |
          backend/package-lock.json
          frontend/package-lock.json

    - name: Install Backend Dependencies
      run: |
        cd backend
        npm ci

    - name: Install Frontend Dependencies
      run: |
        cd frontend
        npm ci

    - name: Run Backend Tests
      run: |
        cd backend
        npm run test:cov
      env:
        DATABASE_URL: postgres://postgres:test@localhost:5432/gacha_test

    - name: Run Frontend Tests
      run: |
        cd frontend
        npm run test:ci

    - name: Build Backend
      run: |
        cd backend
        npm run build

    - name: Build Frontend
      run: |
        cd frontend
        npm run build

  deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'

    steps:
    - uses: actions/checkout@v4

    - name: Deploy to Server
      uses: appleboy/ssh-action@v0.1.5
      with:
        host: ${{ secrets.EC2_HOST }}
        username: ${{ secrets.EC2_USER }}
        key: ${{ secrets.EC2_PRIVATE_KEY }}
        script: |
          cd /var/www/shijon
          git pull origin main
          
          # Backend Deploy
          cd backend
          npm ci --production
          npm run build
          pm2 restart gacha-backend
          
          # Frontend Deploy  
          cd ../frontend
          npm ci --production
          npm run build
          pm2 restart gacha-frontend
          
          # Nginx reload
          sudo nginx -t && sudo systemctl reload nginx
```

### 📦 PM2 プロセス管理

#### PM2 設定ファイル
```javascript
// ecosystem.config.js
module.exports = {
  apps: [
    {
      name: 'gacha-backend',
      script: './backend/dist/main.js',
      cwd: '/var/www/shijon',
      instances: 2,
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 3001,
      },
      log_file: '/var/log/pm2/gacha-backend.log',
      out_file: '/var/log/pm2/gacha-backend-out.log',
      error_file: '/var/log/pm2/gacha-backend-error.log',
      merge_logs: true,
      time: true,
      max_memory_restart: '1G',
      node_args: '--max-old-space-size=1024',
    },
    {
      name: 'gacha-frontend',
      script: 'npm',
      args: 'start',
      cwd: '/var/www/shijon/frontend',
      instances: 1,
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
      },
      log_file: '/var/log/pm2/gacha-frontend.log',
      max_memory_restart: '512M',
    }
  ],

  deploy: {
    production: {
      user: 'ubuntu',
      host: 'your-ec2-host',
      ref: 'origin/main',
      repo: 'git@github.com:your-username/online-gacha-final.git',
      path: '/var/www/shijon',
      'post-deploy': 'npm install && pm2 reload ecosystem.config.js --env production',
    }
  }
};
```

### 📊 監視・ログ管理

#### ログローテーション設定
```bash
# /etc/logrotate.d/gacha
/var/log/pm2/*.log {
    daily
    missingok
    rotate 30
    compress
    delaycompress
    notifempty
    create 644 ubuntu ubuntu
    postrotate
        pm2 reloadLogs
    endscript
}
```

#### システム監視スクリプト
```bash
#!/bin/bash
# /usr/local/bin/monitor-gacha.sh

# CPU使用率チェック
CPU_USAGE=$(top -bn1 | grep "Cpu(s)" | awk '{print $2}' | cut -d'%' -f1)
if (( $(echo "$CPU_USAGE > 80" | bc -l) )); then
    echo "High CPU usage: $CPU_USAGE%" | mail -s "ALERT: High CPU" admin@shijon.com
fi

# メモリ使用率チェック
MEM_USAGE=$(free | grep Mem | awk '{printf("%.1f", $3/$2 * 100.0)}')
if (( $(echo "$MEM_USAGE > 85" | bc -l) )); then
    echo "High memory usage: $MEM_USAGE%" | mail -s "ALERT: High Memory" admin@shijon.com
fi

# PM2プロセス確認
pm2 jlist | jq -r '.[] | select(.pm2_env.status != "online") | .name' | while read -r app; do
    echo "Application $app is not running" | mail -s "ALERT: App Down" admin@shijon.com
    pm2 restart "$app"
done

# ディスク容量チェック
DISK_USAGE=$(df -h / | awk 'NR==2 {print $5}' | cut -d'%' -f1)
if [ "$DISK_USAGE" -gt 85 ]; then
    echo "Disk usage is $DISK_USAGE%" | mail -s "ALERT: High Disk Usage" admin@shijon.com
fi
```

## 🤝 開発ガイド

1. Forkしてブランチ作成
2. 機能開発・バグ修正
3. テスト追加
4. Pull Request作成

### 開発ガイドライン
- **コミット規約**: Conventional Commits
- **コードスタイル**: ESLint + Prettier
- **命名規則**: camelCase (JS/TS), kebab-case (CSS)

## 📄 ライセンス

MIT License - 詳細は[LICENSE](LICENSE)ファイルを参照

## 🆘 サポート・トラブルシューティング

### よくある問題

1. **データベース接続エラー**
   - PostgreSQLサービス起動確認
   - 接続情報確認

2. **ビルドエラー**
   - Node.jsバージョン確認
   - node_modules削除後再インストール

3. **認証エラー**
   - JWT_SECRET設定確認
   - トークン有効期限確認

---

**開発チーム**: SHIJON Development Team  
**バージョン**: 1.0.0  
