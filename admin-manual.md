# SHIJON 管理者操作マニュアル

## 目次
1. [はじめに](#はじめに)
2. [ログイン方法](#ログイン方法)
3. [管理画面の基本構成](#管理画面の基本構成)
4. [ガチャ管理](#ガチャ管理)
5. [カテゴリー管理](#カテゴリー管理)
6. [ユーザー管理](#ユーザー管理)
7. [決済管理](#決済管理)
8. [在庫管理](#在庫管理)
9. [発送管理](#発送管理)
10. [レポート](#レポート)
11. [通知管理](#通知管理)
12. [セキュリティ](#セキュリティ)
13. [カスタマーサポート](#カスタマーサポート)
14. [トラブルシューティング](#トラブルシューティング)

## はじめに

SHIJON管理画面は、オンラインガチャサービス「SHIJON」のすべての管理機能を提供する管理者専用インターフェースです。このマニュアルでは、各管理機能の操作方法を詳しく説明します。

## ログイン方法

1. ブラウザで管理者ページにアクセスします（https://shijon.jp/admin）
2. 管理者アカウントのメールアドレスとパスワードを入力
3. 「ログイン」ボタンをクリック
4. 初回ログイン時やセキュリティ設定によっては二段階認証が必要な場合があります

## 管理画面の基本構成

管理画面は以下の要素で構成されています：

- **トップナビゲーション**: アカウント情報、通知、ログアウトボタンがあります
- **サイドナビゲーション**: 各管理機能へのリンクが表示されます
- **メインコンテンツエリア**: 選択した管理機能の内容が表示されます

## ガチャ管理

ガチャ管理では、新しいガチャの作成、既存ガチャの編集、公開設定の管理を行います。

### ガチャを新規作成する

1. ガチャ管理画面で「新規作成」ボタンをクリック
2. ガチャの基本情報を入力：
   - **名前（多言語対応）**: 日本語、英語、中国語でのガチャ名
   - **説明（多言語対応）**: 各言語での説明文
   - **カテゴリ**: ガチャのカテゴリを選択
   - **タイプ**: 通常/限定/特別から選択
   - **価格**: ガチャ1回の価格（コイン）
   - **期間**: 販売期間（日数）、空白の場合は無期限
   - **1日の制限**: 1日あたりの購入制限、チェックを外すと無制限

3. サムネイル画像をアップロード
4. 商品アイテムを追加：
   - 「アイテム追加」ボタンをクリック
   - アイテム名を入力
   - レア度を選択（S/A/B/C/D）
   - 当選確率を設定（%）
   - 在庫数を設定
   - 交換レートを設定（コイン返却時）
   - アイテム画像をアップロード
   - 必要に応じて複数アイテムを追加

5. 設定オプション：
   - **初回無料**: 初回のみ無料で引けるかどうか
   - **確率上昇システム**: 一定回数引いた後の確率上昇設定
   - **公開設定**: 作成後すぐに公開するかどうか

6. 「保存」ボタンをクリック

### 既存ガチャを編集する

1. ガチャ一覧から編集したいガチャの「編集」ボタンをクリック
2. 情報を変更
3. 「保存」ボタンをクリック

### ガチャの公開/非公開を切り替える

1. ガチャ一覧から対象ガチャの「公開/非公開」スイッチを切り替え

### ガチャを削除する

1. ガチャ一覧から削除したいガチャの「削除」ボタンをクリック
2. 確認ダイアログで「削除」を選択

## カテゴリー管理

カテゴリー管理では、ガチャのカテゴリを作成・編集・削除できます。

### カテゴリーを追加する

1. カテゴリー管理画面で入力フィールドにカテゴリ名を入力
2. 「追加」ボタンをクリック

### カテゴリーの順序を変更する

1. カテゴリーの左側のハンドルアイコンをドラッグ
2. 希望の位置に移動してドロップ
3. 順序は自動的に保存されます

### カテゴリーを削除する

1. 削除したいカテゴリーの右側にある「×」ボタンをクリック

## ユーザー管理

ユーザー管理では、登録ユーザーの検索、詳細確認、ステータス変更ができます。

### ユーザーを検索する

1. ユーザー管理画面の検索フィールドにキーワード（メールアドレス、ユーザーID等）を入力
2. 「検索」ボタンをクリック

### ユーザー詳細を確認する

1. ユーザー一覧から確認したいユーザーの「詳細」ボタンをクリック
2. ユーザープロフィール、コイン残高、購入履歴、当選履歴などが表示されます

### ユーザーステータスを変更する

1. ユーザー一覧またはユーザー詳細画面でステータスドロップダウンを選択
2. 「アクティブ」「一時停止」「禁止」から適切なステータスを選択
3. 変更は即時反映されます

## 決済管理

決済管理では、ユーザーの支払い履歴を確認し、必要に応じて払い戻し処理を行います。

### 決済履歴を検索・フィルタリングする

1. 決済管理画面の検索フィールドにキーワード（ユーザーID、決済ID等）を入力
2. フィルターを設定：
   - **ステータス**: すべて/完了/保留中/払い戻し済み
   - **期間**: すべて/今日/過去7日/過去30日
3. 「検索」ボタンをクリック

### 払い戻し処理を行う

1. 決済一覧から対象の決済の「払い戻し」ボタンをクリック
2. 確認ダイアログで「払い戻し」を選択
3. 払い戻し理由を入力
4. 「確定」ボタンをクリック

## 在庫管理

在庫管理では、商品の在庫状況を監視し、アラート設定を行います。

### 在庫状況を確認する

1. 在庫管理画面で全商品の在庫状況が一覧表示されます

### 在庫アラートのしきい値を設定する

1. 「在庫設定」タブで全体のしきい値を設定
2. 個別アイテムのしきい値を変更する場合は、各アイテムの「しきい値」欄に値を入力
3. 設定は自動的に保存されます

### 通知方法を設定する

1. 「在庫設定」タブで通知方法を選択（LINE/メール/Slack）
2. 「リアルタイム更新」のオン/オフを切り替え
3. 「保存」ボタンをクリック

## 発送管理

発送管理では、ユーザーへの商品発送状況の管理を行います。

### 発送リクエストを確認する

1. 発送管理画面で発送待ちの商品一覧が表示されます

### 発送ステータスを更新する

1. 対象商品のステータスドロップダウンをクリック
2. 適切なステータスを選択：
   - **利用可能**: 未発送（初期状態）
   - **発送中**: 発送手続き中
   - **発送済み**: 発送完了
   - **交換済み**: コインに交換済み
3. 変更は即時反映され、ユーザーに自動通知されます

### 発送リストをフィルタリングする

1. 「ステータスでフィルター」ドロップダウンから条件を選択
2. メールアドレス検索欄にユーザーのメールアドレスを入力して絞り込み

## レポート

レポート機能では、売上や利用状況などのデータを可視化し、CSV/PDFでエクスポートできます。

### レポートを表示する

1. レポート画面でレポートタイプを選択：
   - **売上**: 期間ごとの売上推移
   - **ユーザー**: ユーザー数の推移とステータス内訳
   - **在庫**: 在庫状況の推移

### レポートをエクスポートする

1. 表示したいレポートタイプを選択
2. 「CSVエクスポート」または「PDFエクスポート」ボタンをクリック
3. ファイルが自動的にダウンロードされます

## 通知管理

通知管理では、ユーザーへの一斉通知やターゲット通知の送信ができます。

### 一斉通知を送信する

1. 通知管理画面で「新規通知」ボタンをクリック
2. 通知内容を入力：
   - **タイトル**: 通知のタイトル
   - **本文**: 通知の本文
   - **対象**: 全ユーザー/特定条件のユーザー
   - **通知方法**: アプリ内/メール/LINE
3. 「プレビュー」ボタンで確認
4. 「送信」ボタンをクリック

### 通知テンプレートを作成する

1. 「テンプレート」タブをクリック
2. 「新規テンプレート」ボタンをクリック
3. テンプレート情報を入力：
   - **名前**: テンプレート名
   - **タイトル**: 通知のタイトル
   - **本文**: 通知の本文（変数を含めることが可能）
4. 「保存」ボタンをクリック

## セキュリティ

セキュリティ設定では、管理者アカウントのセキュリティ設定や不正アクセス対策を管理します。

### 二段階認証を設定する

1. セキュリティ画面で「二段階認証」タブをクリック
2. 「有効化」ボタンをクリック
3. 指示に従って認証アプリと連携

### アクセスログを確認する

1. 「アクセスログ」タブをクリック
2. 管理者のログイン履歴や操作履歴を確認

### IPアドレス制限を設定する

1. 「IPアドレス制限」タブをクリック
2. 「追加」ボタンをクリック
3. 許可するIPアドレスまたはIP範囲を入力
4. 「保存」ボタンをクリック

## カスタマーサポート

カスタマーサポート機能では、ユーザーからの問い合わせ管理や対応を行います。

### 問い合わせを確認・対応する

1. カスタマーサポート画面で未対応の問い合わせ一覧が表示されます
2. 対応したい問い合わせをクリック
3. 内容を確認し、返信フォームに回答を入力
4. 「返信」ボタンをクリック

### よくある質問を管理する

1. 「FAQ管理」タブをクリック
2. 既存のFAQを編集、または「新規追加」ボタンで新しいFAQを作成
3. 質問と回答を入力
4. カテゴリと表示順を設定
5. 「保存」ボタンをクリック

## トラブルシューティング

よくある問題とその解決方法を紹介します。

### ログインできない場合

1. メールアドレスとパスワードが正しいか確認
2. パスワードリセットを試みる
3. システム管理者に連絡

### ページが正しく表示されない場合

1. ブラウザのキャッシュをクリア
2. 最新のブラウザを使用しているか確認
3. 別のブラウザでアクセスを試みる

### データが更新されない場合

1. ページを再読み込み
2. ブラウザのキャッシュをクリア
3. システム管理者に連絡

---

本マニュアルは随時更新されます。最新版は管理画面の「ヘルプ」セクションからご確認ください。 