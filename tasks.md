

# プロフィール画像アップロード機能の実装手順

## バックエンド実装

1. AWS S3 SDKをインストールする
   - `@aws-sdk/client-s3`と`@aws-sdk/s3-request-presigner`をインストール

2. ユーザーテーブルにprofile_urlカラムを追加するマイグレーションを作成
   - usersテーブルにprofile_url (VARCHAR, nullable) カラムを追加

3. S3サービスモジュールを作成
   - S3クライアントの初期化
   - 画像アップロード機能の実装
   - 署名付きURLの生成機能の実装

4. ProfileServiceを拡張
   - プロフィール画像のアップロード処理を追加
   - プロフィール画像のURL保存処理を追加
   - プロフィール画像の取得処理を追加

5. ProfileControllerを拡張
   - 画像アップロードエンドポイントの追加
   - ユーザーセッション検証の実装

6. 環境変数の設定
   - AWS_ACCESS_KEY_ID
   - AWS_SECRET_ACCESS_KEY
   - AWS_REGION
   - S3_BUCKET_NAME
   - S3_PROFILE_FOLDER

## フロントエンド実装

1. プロフィール画像アップロードコンポーネントの作成
   - 画像選択UI
   - プレビュー表示機能
   - ドラッグ&ドロップ対応

2. Reduxステートの拡張
   - プロフィール画像関連の状態管理を追加
   - アップロードアクションの実装
   - 画像取得アクションの実装

3. プロフィールフォームの拡張
   - 画像アップロードコンポーネントの統合
   - 既存のプロフィール情報と画像の連携

4. プロフィール画像表示コンポーネントの実装
   - ヘッダーやプロフィールページでの表示
   - デフォルト画像のフォールバック対応

5. 多言語対応
   - 画像アップロード関連の翻訳キーの追加

## セキュリティ対策

1. ファイルサイズ制限の実装
   - 最大5MBまでに制限

2. ファイル形式の検証
   - 画像ファイル（JPEG、PNG、GIF）のみ許可

3. セッション検証
   - 認証済みユーザーのみがアップロード可能

4. S3バケットポリシーの設定
   - 適切なCORS設定
   - 公開読み取り/非公開書き込みポリシー
