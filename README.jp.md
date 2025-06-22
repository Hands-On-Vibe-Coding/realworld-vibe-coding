# RealWorld アプリケーション - Vibe Coding 実装

**🌐 Language / 言語 / 언어**
- [한국어](README.ko.md) | **日本語** | [English](README.md)

> Vibe Coding 方法論を使用してGoバックエンドとReactフロントエンドで構築されたフルスタックRealWorldアプリケーションです。

## 概要

このプロジェクトは[RealWorld](https://github.com/gothinkster/realworld)アプリケーション仕様を実装しています - 現代的なWeb技術の実世界での使用法を示すMedium.comクローンです。迅速なプロトタイピング、反復的改善、リアルタイムドキュメンテーションに焦点を当てて構築されています。

## 技術スタック

このプロジェクトは、Armin Ronacherのブログ投稿["Agentic Coding Recommendations"](https://lucumr.pocoo.org/2025/6/12/agentic-coding/)で推奨されている技術スタックを使用して構築されており、シンプルさ、信頼性、AI フレンドリーな開発パターンを重視しています。

### バックエンド
- **言語**: Go 1.21+ 
- **フレームワーク**: Gorilla Muxを使用した標準net/http
- **データベース**: SQLite（開発環境）/ PostgreSQL（本番環境）
- **認証**: JWTベース認証
- **アーキテクチャ**: 依存性注入を使用したクリーンアーキテクチャ

### フロントエンド
- **フレームワーク**: TypeScriptを使用したReact 19
- **ビルドツール**: Vite
- **UIライブラリ**: Mantine v8
- **ルーティング**: TanStack Router（型安全）
- **状態管理**: 
  - Zustand（クライアント状態）
  - TanStack Query（サーバー状態）
- **フォーム**: Zod検証を使用したReact Hook Form
- **スタイリング**: Tailwind CSS

## クイックスタート

### 前提条件
- Go 1.21+
- Node.js 18+
- npm または yarn

### 開発環境セットアップ

1. **リポジトリのクローン**
   ```bash
   git clone https://github.com/hands-on-vibe-coding/realworld-vibe-coding.git
   cd realworld-vibe-coding
   ```

2. **開発環境セットアップ**
   ```bash
   make setup
   ```

3. **開発サーバーの起動**
   ```bash
   make dev
   ```
   
   以下が起動します：
   - バックエンドサーバー: http://localhost:8080
   - フロントエンドサーバー: http://localhost:5173

## 利用可能なコマンド

### プロジェクトレベルコマンド
```bash
make setup          # 初期開発環境セットアップ
make dev            # フロントエンドとバックエンドサーバーの両方を実行
make build          # フロントエンドとバックエンドの両方をビルド
make test           # すべてのテストを実行
make lint           # 両プロジェクトのリンティングを実行
make clean          # ビルドアーティファクトをクリア
```

### バックエンドコマンド
```bash
make dev-back       # バックエンドサーバーのみ実行
make test-back      # バックエンドテストを実行
make build-back     # バックエンドバイナリをビルド

# 直接Goコマンド（backend/ディレクトリから）
go run cmd/server/main.go    # サーバーを直接実行
go test ./...                # テストを実行
go vet ./...                 # コードリンティング
```

### フロントエンドコマンド  
```bash
make dev-front      # フロントエンド開発サーバーのみ実行
make test-front     # フロントエンドテストを実行
make build-front    # フロントエンド本番ビルド

# 直接npmコマンド（frontend/ディレクトリから）
npm run dev         # 開発サーバー
npm run build       # 本番ビルド
npm run test        # テストを実行
npm run lint        # ESLintチェック
```

## プロジェクト構造

```
├── backend/                 # Go バックエンド
│   ├── cmd/server/         # アプリケーションエントリーポイント
│   ├── internal/           # 内部パッケージ
│   │   ├── config/         # 設定管理
│   │   ├── db/            # データベース接続とマイグレーション
│   │   ├── handler/       # HTTPハンドラー
│   │   ├── middleware/    # HTTPミドルウェア
│   │   ├── model/         # データモデル
│   │   ├── repository/    # データアクセス層
│   │   ├── service/       # ビジネスロジック層
│   │   └── utils/         # ユーティリティ関数
│   ├── migrations/        # データベースマイグレーションファイル
│   └── pkg/              # パブリックパッケージ
├── frontend/              # React フロントエンド
│   ├── src/
│   │   ├── components/    # 再利用可能なコンポーネント
│   │   ├── pages/        # ページコンポーネント
│   │   ├── stores/       # Zustandストア
│   │   ├── lib/          # APIクライアントとユーティリティ
│   │   ├── types/        # TypeScript型定義
│   │   └── theme/        # Mantineテーマ設定
│   └── public/           # 静的アセット
└── docs/                 # プロジェクトドキュメント
```

## データベーススキーマ

アプリケーションは以下のエンティティを含むリレーショナルデータベースを使用します：

- **Users**: 認証を含むユーザーアカウント
- **Articles**: スラッグベースURLを持つブログ投稿
- **Comments**: 記事に対するネストコメント
- **Tags**: 記事分類
- **Follows**: ユーザー関係管理
- **Favorites**: 記事ブックマーク

データベースマイグレーションはサーバー起動時に自動的に適用されます。

## API エンドポイント

バックエンドは完全な[RealWorld API仕様](https://realworld-docs.netlify.app/docs/specs/backend-specs/endpoints)を実装しています：

### 認証
- `POST /api/users` - ユーザー登録
- `POST /api/users/login` - ユーザーログイン
- `GET /api/user` - 現在のユーザー取得
- `PUT /api/user` - ユーザー更新

### 記事
- `GET /api/articles` - 記事一覧（ページネーション付き）
- `GET /api/articles/feed` - ユーザーフィード取得
- `GET /api/articles/{slug}` - スラッグで記事取得
- `POST /api/articles` - 記事作成
- `PUT /api/articles/{slug}` - 記事更新
- `DELETE /api/articles/{slug}` - 記事削除

### プロフィール & ソーシャル機能
- `GET /api/profiles/{username}` - ユーザープロフィール取得
- `POST /api/profiles/{username}/follow` - ユーザーフォロー
- `DELETE /api/profiles/{username}/follow` - ユーザーアンフォロー
- `POST /api/articles/{slug}/favorite` - 記事をお気に入り
- `DELETE /api/articles/{slug}/favorite` - 記事のお気に入り解除

### コメント & タグ
- `GET /api/articles/{slug}/comments` - コメント取得
- `POST /api/articles/{slug}/comments` - コメント追加
- `DELETE /api/articles/{slug}/comments/{id}` - コメント削除
- `GET /api/tags` - 人気タグ取得

## 開発方法論

このプロジェクトは「Vibe Coding」原則に従います：

1. **迅速なプロトタイピング**: コア機能を最優先
2. **反復的改善**: 段階的な機能向上
3. **リアルタイムフィードバック**: 開発中の継続的テスト
4. **ドキュメンテーション**: コードと併せたリアルタイムドキュメンテーション

## テスト

### バックエンドテスト
- ビジネスロジックのユニットテスト
- APIエンドポイントの統合テスト
- データベースマイグレーションテスト
- 目標: 80%+ コードカバレッジ

### フロントエンドテスト
- React Testing Libraryを使用したコンポーネントユニットテスト
- ユーザーワークフローの統合テスト
- Playwrightを使用したEnd-to-Endテスト
- TypeScript strictモードでの型安全性

### Gitフック
プロジェクトはコード品質を保証するために自動化されたpre-commitフックを使用しています：
- **リンティングとフォーマット**: ステージされたファイルに対して自動実行
- **テスト**: 変更された部分（フロントエンド/バックエンド）のテストのみ実行
- **Go品質チェック**: バックエンドコードに対する`go fmt`と`go vet`

詳細情報については、[Gitフックドキュメント](./docs/git-hooks.jp.md)を参照してください。

## 貢献

1. リポジトリをフォークしてください
2. 機能ブランチを作成してください（`git checkout -b feature/amazing-feature`）
3. コーディング標準に従い、テストを実行してください
4. 変更をコミットしてください（`git commit -m 'Add amazing feature'`）
5. ブランチにプッシュしてください（`git push origin feature/amazing-feature`）
6. Pull Requestを開いてください

## デプロイメント

このアプリケーションは自動化されたCI/CDパイプラインと共にハイブリッドデプロイメント戦略を使用しています：

- **フロントエンド**: 自動化されたデプロイメントを伴うGitHub Pages
- **バックエンド**: Fargateコンテナを使用したAWS ECS
- **データベース**: AWS RDS PostgreSQL
- **インフラストラクチャ**: Infrastructure as CodeのためのAWS CDK

### クイックスタートデプロイメント

1. **フロントエンド**: すべてのプッシュで https://dohyunjung.github.io/realworld-vibe-coding/ に自動デプロイ
2. **バックエンド**: AWSインフラセットアップとGitHub secretsの設定が必要

### 詳細なデプロイメントガイド

以下を含む包括的なデプロイメント手順：

- CDKを使用したAWSインフラセットアップ
- GitHub Actions CI/CD設定
- 環境変数とシークレット管理
- モニタリングとトラブルシューティング
- コスト最適化戦略
- セキュリティ考慮事項

**📖 完全な手順については[デプロイメントガイド](docs/DEPLOYMENT.jp.md)を参照してください。**

### ローカル開発

```bash
# バックエンド
PORT=8080
DATABASE_URL=realworld.db
JWT_SECRET=your-secret-key
ENVIRONMENT=development

# フロントエンド
VITE_API_BASE_URL=http://localhost:8080
```

## ライセンス

このプロジェクトはMITライセンスの下でライセンスされています - 詳細については[LICENSE](LICENSE)ファイルを参照してください。

## 謝辞

- [RealWorld](https://github.com/gothinkster/realworld) - 仕様とコミュニティ
- [Mantine](https://mantine.dev/) - Reactコンポーネントライブラリ
- [TanStack](https://tanstack.com/) - 現代的なReactツール
- 優れた標準ライブラリとエコシステムを提供するGoコミュニティ

---

❤️を込めてVibe Coding方法論で構築されました