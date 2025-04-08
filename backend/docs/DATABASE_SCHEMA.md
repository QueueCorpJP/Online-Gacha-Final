# データベーススキーマ設計書

## テーブル構造

### users
ユーザー情報を管理するテーブル

| カラム名 | データ型 | 制約 | 説明 |
|----------|----------|------|------|
| id | UUID | PK, NOT NULL | ユーザーID |
| email | VARCHAR(255) | UNIQUE, NOT NULL | メールアドレス |
| username | VARCHAR(100) | UNIQUE, NOT NULL | ユーザー名 |
| password | VARCHAR(255) | NOT NULL | ハッシュ化されたパスワード |
| firstName | VARCHAR(100) | NOT NULL | 名 |
| lastName | VARCHAR(100) | NOT NULL | 姓 |
| roles | VARCHAR[] | NOT NULL | 権限配列 |
| postalCode | VARCHAR(10) | | 郵便番号 |
| address | TEXT | | 住所 |
| phone | VARCHAR(20) | | 電話番号 |
| coinBalance | INTEGER | DEFAULT 0 | コイン残高 |
| status | user_status_enum | NOT NULL | アカウント状態 |
| referralCode | VARCHAR(20) | UNIQUE | 紹介コード |
| referredBy | UUID | FK(users.id) | 紹介者ID |
| createdAt | TIMESTAMP | NOT NULL | 作成日時 |
| updatedAt | TIMESTAMP | NOT NULL | 更新日時 |

インデックス:
- `users_email_idx` (email)
- `users_username_idx` (username)
- `users_referral_code_idx` (referralCode)

### gachas
ガチャ商品を管理するテーブル

| カラム名 | データ型 | 制約 | 説明 |
|----------|----------|------|------|
| id | UUID | PK, NOT NULL | ガチャID |
| type | gacha_type_enum | NOT NULL | ガチャタイプ |
| categoryId | UUID | FK(categories.id) | カテゴリーID |
| translations | JSONB | NOT NULL | 多言語対応データ |
| price | DECIMAL(10,2) | NOT NULL | 価格 |
| period | INTEGER | | 期間 |
| dailyLimit | INTEGER | | 1日の制限回数 |
| thumbnail | VARCHAR(255) | | サムネイルURL |
| isActive | BOOLEAN | DEFAULT true | アクティブ状態 |
| rating | FLOAT | | 評価 |
| createdAt | TIMESTAMP | NOT NULL | 作成日時 |
| updatedAt | TIMESTAMP | NOT NULL | 更新日時 |

インデックス:
- `gachas_category_id_idx` (categoryId)
- `gachas_type_idx` (type)

### gachaItems
ガチャアイテムを管理するテーブル

| カラム名 | データ型 | 制約 | 説明 |
|----------|----------|------|------|
| id | UUID | PK, NOT NULL | アイテムID |
| gachaId | UUID | FK(gachas.id) | ガチャID |
| name | VARCHAR(255) | NOT NULL | アイテム名 |
| description | TEXT | | 説明 |
| rarity | VARCHAR(50) | NOT NULL | レアリティ |
| probability | DECIMAL(5,4) | NOT NULL | 出現確率 |
| imageUrl | VARCHAR(255) | | 画像URL |
| status | item_status_enum | NOT NULL | ステータス |
| createdAt | TIMESTAMP | NOT NULL | 作成日時 |
| updatedAt | TIMESTAMP | NOT NULL | 更新日時 |

インデックス:
- `gacha_items_gacha_id_idx` (gachaId)
- `gacha_items_rarity_idx` (rarity)

### inventory
ユーザーの所持アイテムを管理するテーブル

| カラム名 | データ型 | 制約 | 説明 |
|----------|----------|------|------|
| id | UUID | PK, NOT NULL | インベントリID |
| userId | UUID | FK(users.id) | ユーザーID |
| itemId | UUID | FK(gachaItems.id) | アイテムID |
| status | inventory_status_enum | NOT NULL | ステータス |
| createdAt | TIMESTAMP | NOT NULL | 作成日時 |
| updatedAt | TIMESTAMP | NOT NULL | 更新日時 |

インデックス:
- `inventory_user_id_idx` (userId)
- `inventory_item_id_idx` (itemId)
- `inventory_status_idx` (status)

### payments
決済情報を管理するテーブル

| カラム名 | データ型 | 制約 | 説明 |
|----------|----------|------|------|
| id | UUID | PK, NOT NULL | 決済ID |
| userId | UUID | FK(users.id) | ユーザーID |
| amount | DECIMAL(10,2) | NOT NULL | 金額 |
| coins | INTEGER | NOT NULL | コイン数 |
| method | VARCHAR(50) | NOT NULL | 決済方法 |
| status | payment_status_enum | NOT NULL | 決済状態 |
| stripePaymentIntentId | VARCHAR(255) | | Stripe決済ID |
| createdAt | TIMESTAMP | NOT NULL | 作成日時 |
| updatedAt | TIMESTAMP | NOT NULL | 更新日時 |

インデックス:
- `payments_user_id_idx` (userId)
- `payments_status_idx` (status)

### coinTransactions
コイン取引履歴を管理するテーブル

| カラム名 | データ型 | 制約 | 説明 |
|----------|----------|------|------|
| id | UUID | PK, NOT NULL | 取引ID |
| userId | UUID | FK(users.id) | ユーザーID |
| amount | INTEGER | NOT NULL | 取引量 |
| type | transaction_type_enum | NOT NULL | 取引タイプ |
| description | TEXT | | 取引説明 |
| createdAt | TIMESTAMP | NOT NULL | 作成日時 |

インデックス:
- `coin_transactions_user_id_idx` (userId)
- `coin_transactions_type_idx` (type)

### newsBlog
ニュース・ブログ記事を管理するテーブル

| カラム名 | データ型 | 制約 | 説明 |
|----------|----------|------|------|
| id | UUID | PK, NOT NULL | 記事ID |
| title | VARCHAR(255) | NOT NULL | タイトル |
| content | TEXT | NOT NULL | 内容 |
| image | VARCHAR(255) | | 画像URL |
| type | news_type_enum | NOT NULL | 記事タイプ |
| createdAt | TIMESTAMP | NOT NULL | 作成日時 |
| updatedAt | TIMESTAMP | NOT NULL | 更新日時 |

インデックス:
- `news_blog_type_idx` (type)
- `news_blog_created_at_idx` (createdAt)

### faqs
よくある質問を管理するテーブル

| カラム名 | データ型 | 制約 | 説明 |
|----------|----------|------|------|
| id | UUID | PK, NOT NULL | FAQID |
| question | TEXT | NOT NULL | 質問 |
| answer | TEXT | NOT NULL | 回答 |
| createdAt | TIMESTAMP | NOT NULL | 作成日時 |
| updatedAt | TIMESTAMP | NOT NULL | 更新日時 |

### inquiries
問い合わせを管理するテーブル

| カラム名 | データ型 | 制約 | 説明 |
|----------|----------|------|------|
| id | UUID | PK, NOT NULL | 問い合わせID |
| userId | UUID | FK(users.id) | ユーザーID |
| subject | VARCHAR(255) | NOT NULL | 件名 |
| message | TEXT | NOT NULL | メッセージ |
| status | inquiry_status_enum | NOT NULL | ステータス |
| createdAt | TIMESTAMP | NOT NULL | 作成日時 |
| updatedAt | TIMESTAMP | NOT NULL | 更新日時 |

インデックス:
- `inquiries_user_id_idx` (userId)
- `inquiries_status_idx` (status)

## ENUMタイプ

```sql
CREATE TYPE user_status_enum AS ENUM (
    'ACTIVE',
    'SUSPENDED',
    'BANNED',
    'INACTIVE'
);

CREATE TYPE gacha_type_enum AS ENUM (
    'normal',
    'limited',
    'special'
);

CREATE TYPE inventory_status_enum AS ENUM (
    'available',
    'exchanged',
    'locked',
    'shipping',
    'shipped'
);

CREATE TYPE payment_status_enum AS ENUM (
    'PENDING',
    'COMPLETED',
    'FAILED',
    'REFUNDED'
);

CREATE TYPE transaction_type_enum AS ENUM (
    'PURCHASE',
    'USE',
    'REFUND'
);

CREATE TYPE news_type_enum AS ENUM (
    'news',
    'event',
    'campaign',
    'card-info',
    'other'
);

CREATE TYPE inquiry_status_enum AS ENUM (
    'PENDING',
    'IN_PROGRESS',
    'RESOLVED'
);
```

## 外部キー制約

```sql
ALTER TABLE users
ADD CONSTRAINT fk_referred_by
FOREIGN KEY (referred_by) REFERENCES users(id);

ALTER TABLE gachas
ADD CONSTRAINT fk_category
FOREIGN KEY (category_id) REFERENCES categories(id);

ALTER TABLE gacha_items
ADD CONSTRAINT fk_gacha
FOREIGN KEY (gacha_id) REFERENCES gachas(id);

ALTER TABLE inventory
ADD CONSTRAINT fk_inventory_user
FOREIGN KEY (user_id) REFERENCES users(id),
ADD CONSTRAINT fk_inventory_item
FOREIGN KEY (item_id) REFERENCES gacha_items(id);

ALTER TABLE payments
ADD CONSTRAINT fk_payment_user
FOREIGN KEY (user_id) REFERENCES users(id);

ALTER TABLE coin_transactions
ADD CONSTRAINT fk_transaction_user
FOREIGN KEY (user_id) REFERENCES users(id);

ALTER TABLE inquiries
ADD CONSTRAINT fk_inquiry_user
FOREIGN KEY (user_id) REFERENCES users(id);
```

## 注意事項

1. パフォーマンス最適化
   - 頻繁にアクセスされるカラムにはインデックスを作成
   - 大規模テーブルはパーティショニングを検討

2. データ整合性
   - 外部キー制約の適切な設定
   - トランザクション管理の実装

3. セキュリティ
   - パスワードは必ずハッシュ化して保存
   - 機密情報の暗号化対策

4. バックアップ
   - 定期的なバックアップの実施
   - リストア手順の確認
