# CLAUDE.md

このファイルは、このリポジトリでコード作業を行う際にClaude Code (claude.ai/code)にガイダンスを提供します。

## 一般ルール
1. テスト駆動開発を実践してください。まず期待する動作を理解しようと努めてください。その後、新しい動作に従って単体テストを更新する必要があります。その後、テストを実行して失敗することを確認し、テストが通るまで新しい動作を実装してください。古いテストコードを削除することを恐れないでください。頻繁なテストの実行は開発プロセスの一部なので、テスト実行の確認を求める必要はありません。実装の詳細をテストしないでください。
2. すべてのエクスポートされた識別子は文書化され、パッケージレベルのコメントが提供される必要があります。
3. エラーをログに記録してバブルアップしないでください。それは重複ログを引き起こします。エラーがバブルアップされるか返される場合、呼び出し元によって処理されます。
4. org-modeのTODO機能を使用して、マスターエピック文書とサブ文書で進捗を追跡し、プロジェクトが進むにつれてチェックできるタスクリストを作成してください。可読性を維持するために詳細な設計文書を別に保管してください。
5. あまりに多くの詳細を追加する代わりに、高レベル設計に焦点を当てて設計文書を保持してください。
6. シンプルさ：「複雑さよりも常に最もシンプルなソリューションを優先してください。」
7. 重複なし：「コードの繰り返しを避け、可能な場合は既存の機能を再利用してください。」
8. 組織化：「ファイルを簡潔に保ち、200-300行以下に保ち、必要に応じてリファクタリングしてください。」
9. 原則：「該当する場合はSOLID原則（例：単一責任、依存性逆転）に従ってください。」
10. ガードレール：「開発や本番環境でモックデータを絶対に使用しないでください—テストに制限してください。」
11. コンテキストチェック：「コンテキスト保持を確認するために、すべての応答をランダムな絵文字（例：🐙）で始めてください。」
12. 効率性：「明確性を犠牲にすることなくトークン使用量を最小化するように出力を最適化してください。」
13. プロジェクトで作業する前に、同じディレクトリの`README`、`README.md`、または`README.org`ファイルを読んでプロジェクトの背景を理解してください。
14. 文書言語：「国際的な開発者のアクセシビリティを確保し、プロジェクト全体の一貫性を維持するために、すべての文書は英語で書かれるべきです。」

## APIおよび構成のベストプラクティス
1. コードを生成する前に、常にPerplexity AIまたは他のリアルタイム検索対応AIを使用してAPI文書と構成の詳細を確認してください。
2. 最新の情報にアクセスできるようにワークフローにPerplexity APIを統合してください。
3. 曖昧または古い文書に遭遇した場合、ユーザーに確認を求めるか、Perplexity AIを使用して明確にしてください。
4. 最新の公的に利用可能な文書で明示的にサポートされているAPIと構成を優先してください。

## Git固有のルール
1. コミットログを書く前に`git config commit.template`でコミットログテンプレートを確認してください。

## ターミナルタスク
1. コマンドライン作業用の一時ファイルを作成する必要がある場合は、安全でユニークなファイル作成のために`mktemp`コマンドを使用してください。

# プロジェクトルール

## プロジェクト概要

これは「バイブコーディング」（Vibe Coding）方法論を使用したRealWorldアプリケーション実装です。このプロジェクトは、GoバックエンドとReactフロントエンドで完全なRealWorld仕様準拠アプリケーションを実装します。

## アーキテクチャ

これは、フロントエンドとバックエンド間の明確な分離を持つフルスタックアプリケーションです：

### バックエンド（Go）
- **言語**：標準net/httpとGorilla Muxを使用したGo 1.23+
- **データベース**：SQLite（開発）、PostgreSQL（本番）
- **認証**：JWTベース認証
- **デプロイ**：コンテナオーケストレーション用AWS ECS with Fargate
- **構造**：内部パッケージを使用したクリーンアーキテクチャ
  - `cmd/server/main.go` - アプリケーションエントリポイント
  - `internal/handler/` - HTTPハンドラ（user、article、comment、profile）
  - `internal/service/` - ビジネスロジック層
  - `internal/repository/` - データアクセス層
  - `internal/middleware/` - HTTPミドルウェア（JWT、CORS、logging）
  - `internal/model/` - データモデル
  - `internal/config/` - 構成管理
  - `internal/utils/` - ユーティリティ関数

### フロントエンド（React + TypeScript）
- **フレームワーク**：Viteビルドツールを使用したReact 19
- **言語**：厳密型チェックを使用したTypeScript
- **ルーター**：型安全ルーティング用Tanstack Router
- **デプロイ**：GitHub Actions CI/CDを使用したGitHub Pages
- **状態管理**： 
  - サーバー状態用Tanstack Query
  - クライアント状態（auth store）用Zustand
- **スタイリング**：formsおよびtypographyプラグインを使用したTailwind CSS
- **フォーム**：Zod検証を使用したReact Hook Form
- **構造**：
  - `src/pages/` - ページコンポーネント
  - `src/components/` - 再利用可能なコンポーネント（Article、Layout、Common）
  - `src/stores/` - Zustandストア
  - `src/lib/` - APIクライアントとユーティリティ

### インフラストラクチャ
- **バックエンドインフラ**：ECS、RDS、VPC、モニタリングを使用したAWS CDK
- **フロントエンドインフラ**：カスタムドメインサポートを使用したGitHub Pages
- **CI/CD**：自動化されたテスト、ビルド、デプロイ用GitHub Actions

## 開発コマンド

### プロジェクトセットアップ
```bash
make setup          # 初期開発環境セットアップ
```

### 開発サーバー
```bash
make dev            # フロントエンドとバックエンドサーバー両方を実行
make dev-front      # フロントエンド開発サーバーのみ実行（http://localhost:5173）
make dev-back       # バックエンド開発サーバーのみ実行（http://localhost:8080）
```

### ビルド
```bash
make build          # フロントエンドとバックエンド両方をビルド
```

### テスト
```bash
make test           # すべてのテストを実行
make test-front     # フロントエンドテストのみ実行
make test-back      # バックエンドテストのみ実行（go test ./...）
```

### コード品質
```bash
make lint           # リンティング実行（npm run lint + go vet ./...）
make format         # コードフォーマット（go fmt ./...）
```

### クリーンアップとユーティリティ
```bash
make clean          # ビルドアーティファクトをクリーン
make docker         # Dockerイメージをビルド
make deploy         # 本番デプロイ
```

### バックエンド固有コマンド
```bash
cd backend
go run cmd/server/main.go    # バックエンドサーバーを直接実行
go test ./...                # バックエンドテストを実行
go vet ./...                 # バックエンドリンティング
go fmt ./...                 # バックエンドフォーマッティング
```

### フロントエンド固有コマンド
```bash
cd frontend
npm run dev         # 開発サーバー
npm run build       # 本番ビルド
npm run lint        # ESLintチェック
npm run preview     # 本番ビルドプレビュー
```

## APIエンドポイント

バックエンドは完全なRealWorld API仕様を実装します：

### 認証
- `POST /api/users` - ユーザー登録
- `POST /api/users/login` - ユーザーログイン
- `GET /api/user` - 現在のユーザー取得
- `PUT /api/user` - ユーザー更新

### 記事
- `GET /api/articles` - 記事一覧
- `GET /api/articles/feed` - ユーザーフィード取得
- `GET /api/articles/{slug}` - スラッグで記事取得
- `POST /api/articles` - 記事作成
- `PUT /api/articles/{slug}` - 記事更新
- `DELETE /api/articles/{slug}` - 記事削除
- `POST /api/articles/{slug}/favorite` - 記事をお気に入り
- `DELETE /api/articles/{slug}/favorite` - 記事のお気に入り解除

### コメント
- `GET /api/articles/{slug}/comments` - コメント取得
- `POST /api/articles/{slug}/comments` - コメント追加
- `DELETE /api/articles/{slug}/comments/{id}` - コメント削除

### プロフィール
- `GET /api/profiles/{username}` - プロフィール取得
- `POST /api/profiles/{username}/follow` - ユーザーフォロー
- `DELETE /api/profiles/{username}/follow` - ユーザーアンフォロー

### タグ
- `GET /api/tags` - タグ取得

## 開発ガイドライン

### フロントエンド開発ワークフロー
フロントエンド開発作業時は、Playwright MCPを使用して実装状況を確認してください：

1. **視覚的確認**：`mcp__mcp-playwright__playwright_navigate`を使用してフロントエンド開発サーバー（http://localhost:5173）を訪問
2. **スクリーンショット文書化**：`mcp__mcp-playwright__playwright_screenshot`で現在の実装状況を文書化
3. **機能テスト**：Playwright MCPツールを使用してUI要素と相互作用し、ユーザーフローを検証：
   - ボタン/リンク相互作用用`mcp__mcp-playwright__playwright_click`
   - フォーム入力テスト用`mcp__mcp-playwright__playwright_fill`
   - JavaScript実行と状態検査用`mcp__mcp-playwright__playwright_evaluate`
4. **実装状況確認**：新機能を実装する前に、常にPlaywright MCPで現在のフロントエンド状況を確認し、すでに構築されているものを理解してください
5. **進捗検証**：機能実装後、Playwright MCPを使用して実装が期待通りに動作することを確認してください

### プロジェクト計画ワークフロー
プロジェクト計画を求められた場合、以下の手順に従ってください：

1. **設計文書の読み取り**：まず設計文書とメモリ内の既存ルールを読んでください
2. **実装計画の作成**：タスク依存関係を含む`docs/plan.md`ファイルに10-20のタスクで実装計画を書いてください
3. **GitHubイシューの作成**：詳細な説明、ラベル、マイルストーンと共に各タスクのGitHubイシューを作成してください

#### GitHubイシュー作成プロセス
以下の構造で`gh`コマンドを使用してイシューを作成してください：

```bash
# 適切なラベルとマイルストーンでイシューを作成
gh issue create --title "TASK-{number}: {Title}" --body "$(cat <<'EOF'
## 説明
タスクの簡単な説明

## 背景
必要なコンテキストと背景情報

## 受け入れ基準
- [ ] 特定基準1
- [ ] 特定基準2

## 技術的詳細
### コード例
```{language}
// サンプルコードここに
```

## 依存関係
- #{issue-number}: {依存関係説明}

## 推定時間
{時間推定}
EOF
)" --label "enhancement,task" --milestone "Sprint 1"
```

#### GitHubイシュー管理
- **ラベル**：`enhancement`、`bug`、`task`、`frontend`、`backend`、`documentation`などの一貫したラベルを使用
- **マイルストーン**：イシューを開発フェーズ（Sprint 1、Sprint 2など）にグループ化
- **依存関係**：`#{issue-number}`形式を使用して他のイシューを参照
- **担当者**：実装開始時にイシューを割り当て
- **プロジェクト**：カンバンスタイルの追跡にGitHub Projectsを使用

#### イシュー作成ガイドライン
- タスク番号付きの説明的タイトルを使用：`TASK-{number}: {Title}`
- イシュー説明に包括的な背景とコンテキストを含める
- 言語仕様と共にマークダウンコードブロックを使用
- 一般的な言語：go、javascript、typescript、bash、sql、yaml
- 技術研究に適切な場合はPerplexity MCPと相談
- 分類とフィルタリング用の適切なラベルを追加
- 関連イシューと依存関係をリンク
- 進捗追跡用チェックボックスとして受け入れ基準を含める

### タスク実装ワークフロー
機能を実装する際は、この厳格なワークフローに従ってください：

1. **GitHubイシューの確認**：`gh issue list --state open`を使用して最も番号の小さいオープンイシューを見つける
2. **一度に一つのタスク**：一度に一つのタスクのみを実装し、複数のタスクを同時に作業しない
3. **受け入れ基準に従う**：各タスクには完了する必要がある特定の受け入れ基準があります
4. **進捗文書化**：実装が完了したら、GitHubイシューに完了を文書化するコメントを追加
5. **イシューを閉じる**：すべての受け入れ基準が確認され文書化された後にのみイシューを閉じる

#### タスク選択プロセス
```bash
# 次に作業するタスクを見つける
gh issue list --state open --sort created --limit 1

# 自分をイシューに割り当て
gh issue edit {issue-number} --add-assignee @me

# 完了後、進捗を文書化
gh issue comment {issue-number} --body "実装完了。すべての受け入れ基準が確認されました。"

# イシューを閉じる
gh issue close {issue-number}
```

#### 実装文書化
- 完了した各タスクには以下を文書化するGitHubイシューコメントが必要：
  - 実装されたもの
  - 受け入れ基準がどのように満たされたか
  - 元の計画からの逸脱
  - テスト結果
  - スクリーンショットまたはデモ（該当する場合）

### Cursorルール統合
プロジェクトには、実装計画やタスク分解を作成する際に従うべき自動化されたプロジェクト計画用のcursorルールが含まれています。

### コード組織
- 確立されたディレクトリ構造に従ってください
- バックエンドはクリーンアーキテクチャ原則を使用
- フロントエンドは適切な関心の分離を持つコンポーネントベースアーキテクチャを使用
- TypeScript厳密モード準拠を維持

### テスト要件
- フロントエンドとバックエンド両方で80%+テストカバレッジを目標
- バックエンドテストはtestifyと共にGo標準テストを使用
- フロントエンドテストはVitestとReact Testing Libraryを使用すべき

### 認証フロー
- JWTトークンはZustand authストアに保存
- APIクライアントは自動的に認証ヘッダーを含める
- 保護されたルートは認証ミドルウェアを使用

## データベーススキーマ

主要エンティティと関係：
- Users（認証とプロフィール）
- Articles（スラッグベースURLを含む）
- Comments（記事の下にネスト）
- Tags（記事との多対多関係）
- Follows（ユーザー関係）
- Favorites（ユーザー-記事関係）

## プロジェクト状況

このプロジェクトは初期計画段階にあります。コードベースには現在以下が含まれています：
- `docs/pre-prd.md`：要件、技術スタック考慮事項、実装アプローチを概説したPre-PRD文書
- `docs/prd.md`：PRD文書（現在空、記入予定）

## 開発アプローチ

プロジェクトは以下を強調する「バイブコーディング」（Vibe Coding）方法論に従います：
1. **高速プロトタイピング**（Rapid Prototyping）：コア機能実装を最優先
2. **反復的改善**（Iterative Improvement）：機能の段階的向上
3. **リアルタイムフィードバック**（Real-time Feedback）：開発中の継続的テスト
4. **文書化**（Documentation）：コードと並行したリアルタイム文書化

## 計画されたアーキテクチャ

pre-PRD文書に基づいて、プロジェクトは以下を実装します：

### コア機能
- ユーザー管理（登録、認証、プロフィール、フォロー/アンフォロー）
- 記事管理（CRUD操作、お気に入り、タグ）
- コメントシステム
- JWTベース認証
- モバイルサポートを含むレスポンシブデザイン

### 技術要件
- 型安全性のためのTypeScript実装
- 80%+テストカバレッジ要件
- コード品質のためのESLintとPrettier
- コンポーネント/モジュールベースアーキテクチャ
- SEO最適化考慮事項

### 開発フェーズ
- **フェーズ1**：基本CRUD実装（2週間）
- **フェーズ2**：認証と認可（1週間）  
- **フェーズ3**：高度な機能（2週間）
- **フェーズ4**：最適化とデプロイ（1週間）

## 成功基準

### 機能要件
- 100% RealWorld API仕様準拠
- クロスブラウザ互換性
- モバイルレスポンシブデザイン
- すべてのユーザーストーリー実装

### 技術要件
- 80%+テストカバレッジ
- 30秒以下のビルド時間
- バンドルサイズ最適化
- AAアクセシビリティ準拠

## 技術スタック考慮事項

pre-PRDは決定される複数の技術オプションを概説しています：

### フロントエンドオプション
- React vs Vue vs Angular
- 状態管理：Redux、Zustand、Context API
- ルーティング：React Router、Next.js
- スタイリング：CSS-in-JS、Tailwind CSS、Styled Components

### バックエンドオプション  
- Node.js vs Python vs Go
- フレームワーク：Express、Fastify、FastAPI、Gin
- ORM：Prisma、TypeORM、SQLAlchemy
- データベース：PostgreSQL、MySQL、SQLite

## 開発ワークフロー

機能を実装する際：
1. RealWorld仕様要件を確認
2. 定義されたコーディングパターンに従う
3. 機能コードと並行してテストを実装
4. モバイルレスポンシブ性を確保
5. RealWorld API仕様に対して検証
6. コミット前にリンティングと型チェックを実行

## 次のステップ

1. 技術スタック決定の確定
2. 詳細なPRD文書の完成
3. 開発環境のセットアップ
4. プロジェクト構造の設計
5. 最初のスプリント実装計画