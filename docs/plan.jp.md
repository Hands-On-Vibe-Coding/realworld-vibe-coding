# RealWorldバイブコーディング実装計画

## プロジェクト概要
バイブコーディング方法論を使用したRealWorldアプリケーション構築の完全実装計画。
- **フロントエンド**: React + Vite + TypeScript + Mantine UI
- **バックエンド**: Go + SQLite/PostgreSQL + JWT
- **デプロイ**: AWS ECS + Fargate

## 開発フェーズ計画

### フェーズ1: 基本インフラとプロジェクトセットアップ（1週間）

#### TASK-01: バックエンドプロジェクト構造セットアップ
- **説明**: Goベースのバックエンドプロジェクト構造作成
- **依存関係**: なし
- **成果物**: backend/ディレクトリ構造、go.mod、Makefile

#### TASK-02: フロントエンドプロジェクト構造セットアップ  
- **説明**: Mantine UI設定を含むReact + Vite + TypeScriptプロジェクトセットアップ完了
- **依存関係**: なし
- **成果物**: 完全なfrontend/ディレクトリ設定、package.json、vite.config.ts

#### TASK-03: データベーススキーマとマイグレーション
- **説明**: SQLiteベースのデータベーススキーマ設計とマイグレーションスクリプト
- **依存関係**: TASK-01
- **成果物**: migrations/ディレクトリ、テーブル作成スクリプト

#### TASK-04: Docker開発環境セットアップ
- **説明**: Docker Composeを使用した統合開発環境
- **依存関係**: TASK-01、TASK-02
- **成果物**: docker-compose.yml、Dockerfile（フロントエンド/バックエンド）

### フェーズ2: ユーザー認証システム（1週間）

#### TASK-05: JWT認証ミドルウェア実装
- **説明**: Go JWTトークン生成/検証ミドルウェア
- **依存関係**: TASK-01、TASK-03
- **成果物**: internal/middleware/jwt.go、internal/utils/jwt.go

#### TASK-06: ユーザー登録API
- **説明**: ユーザー登録REST APIエンドポイント
- **依存関係**: TASK-05
- **成果物**: internal/handler/user.go（Register）、internal/service/user.go

#### TASK-07: ユーザーログインAPI
- **説明**: ユーザーログインREST APIエンドポイント
- **依存関係**: TASK-06
- **成果物**: internal/handler/user.go（Login）、JWTトークン発行

#### TASK-08: フロントエンド認証状態管理
- **説明**: Zustandベースの認証ストアとAPIクライアント
- **依存関係**: TASK-02
- **成果物**: src/stores/authStore.ts、src/lib/api.ts

#### TASK-09: ログイン/登録ページ実装
- **説明**: Mantine Formを使用したログイン/登録UI
- **依存関係**: TASK-08
- **成果物**: src/pages/Login.tsx、src/pages/Register.tsx

### フェーズ3: 記事管理システム（1.5週間）

#### TASK-10: 記事CRUD API
- **説明**: 記事作成/読み取り/更新/削除REST API
- **依存関係**: TASK-05
- **成果物**: internal/handler/article.go、internal/service/article.go

#### TASK-11: 記事リストAPI（ページネーション）
- **説明**: 記事リスト取得とページネーション実装
- **依存関係**: TASK-10
- **成果物**: 記事リストAPI、ページネーションロジック

#### TASK-12: タグシステムAPI
- **説明**: タグ管理とタグベースの記事フィルタリング
- **依存関係**: TASK-10
- **成果物**: internal/handler/tag.go、タグ関連テーブル

#### TASK-13: フロントエンド記事状態管理
- **説明**: TanStack Queryを使用した記事データ管理
- **依存関係**: TASK-08
- **成果物**: src/hooks/useArticles.ts、記事関連クエリ

#### TASK-14: 記事リストページ実装
- **説明**: Mantine Cardを使用した記事リストUI
- **依存関係**: TASK-13
- **成果物**: src/pages/Home.tsx、src/components/Article/ArticleList.tsx

#### TASK-15: 記事詳細ページ実装
- **説明**: 記事詳細表示と編集UI
- **依存関係**: TASK-14
- **成果物**: src/pages/Article.tsx、src/components/Article/ArticleDetail.tsx

#### TASK-16: 記事作成/編集ページ実装
- **説明**: Mantine Formを使用した記事エディター
- **依存関係**: TASK-13
- **成果物**: src/pages/Editor.tsx、src/components/Article/ArticleForm.tsx

### フェーズ4: 高度な機能実装（1週間）

#### TASK-17: コメントシステムAPI
- **説明**: コメント作成/読み取り/削除REST API
- **依存関係**: TASK-10
- **成果物**: internal/handler/comment.go、internal/service/comment.go

#### TASK-18: ユーザープロフィールとフォローAPI
- **説明**: ユーザープロフィール取得とフォロー/アンフォローAPI
- **依存関係**: TASK-05
- **成果物**: internal/handler/profile.go、フォロー関係テーブル

#### TASK-19: 記事お気に入りAPI
- **説明**: 記事お気に入り/お気に入り解除API
- **依存関係**: TASK-10
- **成果物**: お気に入り関連API、favoritesテーブル

#### TASK-20: コメントシステムフロントエンド実装
- **説明**: コメントリスト/作成UI実装
- **依存関係**: TASK-15、TASK-17
- **成果物**: src/components/Comment/、コメント関連コンポーネント

#### TASK-21: ユーザープロフィールページ実装
- **説明**: プロフィール表示とフォローボタンUI
- **依存関係**: TASK-08、TASK-18
- **成果物**: src/pages/Profile.tsx、src/components/Profile/

#### TASK-22: 個人フィード実装
- **説明**: フォローしたユーザーからの記事フィード
- **依存関係**: TASK-18、TASK-14
- **成果物**: 個人フィードAPIとUI

### フェーズ5: テストと品質改善（1週間）

#### TASK-23: バックエンド単体テスト実装
- **説明**: Go標準テストツールを使用して80%テストカバレッジを達成
- **依存関係**: TASK-01〜TASK-22
- **成果物**: *_test.goファイル、テストカバレッジレポート

#### TASK-24: フロントエンドテスト実装
- **説明**: Vitest + React Testing Libraryを使用したコンポーネントテスト
- **依存関係**: TASK-02〜TASK-22
- **成果物**: *.test.tsxファイル、テストカバレッジレポート

#### TASK-25: E2Eテスト実装
- **説明**: Playwrightを使用した完全なユーザーフローテスト
- **依存関係**: TASK-23、TASK-24
- **成果物**: e2e/テストディレクトリ、CI/CD統合

### フェーズ6: デプロイと運用（1週間）

#### TASK-26: GitHub Actions CI/CDパイプライン
- **説明**: 自動化されたテストとデプロイパイプライン
- **依存関係**: TASK-25
- **成果物**: .github/workflows/、Dockerイメージ自動化

#### TASK-27: AWS ECSインフラセットアップ
- **説明**: AWS CDKを使用したInfrastructure as Code
- **依存関係**: TASK-04
- **成果物**: infrastructure/ディレクトリ、CDKスタック

#### TASK-28: 本番デプロイとモニタリング
- **説明**: 本番環境デプロイとモニタリングセットアップ
- **依存関係**: TASK-26、TASK-27
- **成果物**: 本番デプロイ、CloudWatchダッシュボード

## マイルストーン要約

### スプリント1: 基本インフラ + 認証
- TASK-01 〜 TASK-09
- **目標**: ユーザー登録/ログイン機能完了

### スプリント2: 記事システム
- TASK-10 〜 TASK-16  
- **目標**: 記事CRUD機能完了

### スプリント3: 高度な機能
- TASK-17 〜 TASK-22
- **目標**: コメント、プロフィール、お気に入り機能完了

### スプリント4: 品質改善
- TASK-23 〜 TASK-25
- **目標**: 80%テストカバレッジ達成

### スプリント5: デプロイ準備
- TASK-26 〜 TASK-28
- **目標**: 本番デプロイ完了

## 成功基準
- [ ] RealWorld API仕様100%準拠
- [ ] 80%+テストカバレッジ（フロントエンド + バックエンド）
- [ ] 初期ロード時間3秒以下
- [ ] モバイルレスポンシブデザインサポート
- [ ] AAアクセシビリティ準拠
- [ ] 安定した本番環境動作

## リスク管理
1. **技術的複雑性**: シンプルなアーキテクチャを最優先で適用
2. **スケジュール遅延**: コア機能の優先順位を維持
3. **品質問題**: TDDアプローチで進行
4. **デプロイの複雑性**: Dockerベースのアプローチで簡素化

---
*この計画は、高速プロトタイピングと反復的改善を通じたバイブコーディング方法論に従います。*