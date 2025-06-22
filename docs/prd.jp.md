# RealWorldバイブコーディング実装 - PRD（プロダクト要件定義書）

## 1. プロジェクト概要

### 1.1 プロジェクト目標
バイブコーディング方法論を使用して完全なフルスタックアプリケーションを構築するRealWorldアプリケーション実装

### 1.2 プロジェクト範囲
- **フロントエンド**: React + ViteベースのSPA
- **バックエンド**: Go + 標準net/httpベースのREST API
- **データベース**: SQLite（開発）+ PostgreSQL（本番）
- **認証**: JWTベースのユーザー認証
- **デプロイ**: AWS ECS + Fargateによるコンテナデプロイ

### 1.3 成功指標
- RealWorld API仕様100%準拠
- 80%+テストカバレッジ
- 初期ロード時間3秒以下
- モバイルレスポンシブデザインサポート

## 2. 機能要件

### 2.1 ユーザー管理と認証
#### 2.1.1 ユーザー登録
- **機能**: メール、ユーザー名、パスワードベースの登録
- **検証**: メール重複チェック、ユーザー名重複チェック
- **セキュリティ**: JWTトークン発行

#### 2.1.2 ユーザーログイン
- **機能**: メール/ユーザー名とパスワードによるログイン
- **検証**: 入力値の妥当性チェック
- **セキュリティ**: JWTトークン発行

#### 2.1.3 プロフィール管理
- **取得**: 他のユーザーのプロフィール情報表示
- **情報**: メール、ユーザー名、プロフィール、自己紹介、画像情報
- **フォロー**: 他のユーザーのフォロー/アンフォロー

### 2.2 記事管理
#### 2.2.1 記事CRUD
- **作成**: タイトル、説明、本文、タグを含む記事作成
- **取得**: 個別記事詳細表示
- **情報**: 記事作成情報（作成者）
- **編集**: 記事編集（作成者のみ）

#### 2.2.2 記事リスト
- **グローバルフィード**: 全記事リスト（最新順）
- **個人フィード**: フォローしたユーザーの記事
- **タグフィルター**: 特定タグでフィルタリングされた記事
- **ページネーション**: ページあたり20記事

#### 2.2.3 記事のインタラクション
- **お気に入り**: 記事のお気に入り/お気に入り解除
- **お気に入り数**: 記事別お気に入り数表示

### 2.3 コメントシステム
#### 2.3.1 コメントCRUD
- **作成**: 記事へのコメント作成
- **取得**: 記事コメントリスト表示
- **削除**: コメント削除（作成者のみ）

### 2.4 タグシステム
- **タグリスト**: よく使われるタグリスト
- **タグフィルター**: タグ別記事フィルタリング

## 3. 技術スタックとアーキテクチャ

### 3.1 フロントエンド技術スタック
```
- フレームワーク: React with Vite
- 言語: TypeScript
- ルーター: Tanstack Router
- 状態管理: Tanstack Query（サーバー状態）、Zustand（クライアント状態）
- UIライブラリ: Mantine UI
- フォーム処理: Mantine Form + Zod検証
- スタイリング: MantineのCSS-in-JS + カスタムCSS
- アイコン: Tabler Icons（Mantineデフォルトアイコンセット）
- 通知: Mantine Notifications
- テスト: Vitest + React Testing Library
```

### 3.2 バックエンド技術スタック
```
- 言語: Go 1.21+
- HTTPサーバー: 標準net/http
- データベース: SQLite（開発）、PostgreSQL（本番）
- データベースアクセス: Pure SQL（ORM使用しない）
- 認証: JWT
- 検証: Go標準検証
- テスト: Go標準テスト + testify
```

### 3.3 開発環境
```
- プロジェクト管理: Makefile
- コンテナ化: Docker
- CI/CD: GitHub Actions
- フロントエンドデプロイ: GitHub Pages
- バックエンドデプロイ: AWS ECS + Fargate
- インフラ: AWS CDK（TypeScript）
- モニタリング: CloudWatch + X-Ray
```

## 4. API設計

### 4.1 ユーザーAPI
```
POST /api/users/login
POST /api/users
GET /api/user
PUT /api/user
```

### 4.2 プロフィールAPI
```
GET /api/profiles/:username
POST /api/profiles/:username/follow
DELETE /api/profiles/:username/follow
```

### 4.3 記事API
```
GET /api/articles
GET /api/articles/feed
GET /api/articles/:slug
POST /api/articles
PUT /api/articles/:slug
DELETE /api/articles/:slug
POST /api/articles/:slug/favorite
DELETE /api/articles/:slug/favorite
```

### 4.4 コメントAPI
```
GET /api/articles/:slug/comments
POST /api/articles/:slug/comments
DELETE /api/articles/:slug/comments/:id
```

### 4.5 タグAPI
```
GET /api/tags
```

## 5. データベース設計

### 5.1 ユーザーテーブル（users）
```sql
id (Primary Key)
email (Unique)
username (Unique)
password_hash
bio
image
created_at
updated_at
```

### 5.2 記事テーブル（articles）
```sql
id (Primary Key)
slug (Unique)
title
description
body
author_id (Foreign Key -> users.id)
created_at
updated_at
```

### 5.3 タグテーブル（tags）
```sql
id (Primary Key)
name (Unique)
```

### 5.4 記事-タグ関係テーブル（article_tags）
```sql
article_id (Foreign Key -> articles.id)
tag_id (Foreign Key -> tags.id)
```

### 5.5 フォロー関係テーブル（follows）
```sql
follower_id (Foreign Key -> users.id)
followed_id (Foreign Key -> users.id)
created_at
```

### 5.6 お気に入りテーブル（favorites）
```sql
user_id (Foreign Key -> users.id)
article_id (Foreign Key -> articles.id)
created_at
```

### 5.7 コメントテーブル（comments）
```sql
id (Primary Key)
body
author_id (Foreign Key -> users.id)
article_id (Foreign Key -> articles.id)
created_at
updated_at
```

## 6. フロントエンド設計

### 6.1 ページ構造
```
/ (ホーム - グローバルフィード)
/login (ログイン)
/register (登録)
/settings (設定)
/profile/:username (プロフィール)
/editor (記事作成)
/editor/:slug (記事編集)
/article/:slug (記事詳細)
```

### 6.2 コンポーネント構造
```
components/
├── Layout/
│   ├── Header.tsx (Mantine Header、Navbar使用)
│   ├── Footer.tsx (Mantine Footer使用)
│   └── AppShell.tsx (Mantine AppShell使用)
├── Article/
│   ├── ArticleList.tsx (Mantine Grid、Card使用)
│   ├── ArticlePreview.tsx (Mantine Card、Badge使用)
│   ├── ArticleDetail.tsx (Mantine Container、TypographyStylesProvider使用)
│   └── ArticleForm.tsx (Mantine Form、TextInput、Textarea使用)
├── Comment/
│   ├── CommentList.tsx (Mantine Stack使用)
│   ├── CommentForm.tsx (Mantine Form、Textarea、Button使用)
│   └── CommentItem.tsx (Mantine Paper、Avatar、Text使用)
├── Profile/
│   ├── ProfileInfo.tsx (Mantine Avatar、Text、Group使用)
│   └── FollowButton.tsx (Mantine Button、ActionIcon使用)
├── Common/
│   ├── Loading.tsx (Mantine Loader、LoadingOverlay使用)
│   ├── ErrorBoundary.tsx (Mantine Alert、Notification使用)
│   ├── Pagination.tsx (Mantine Pagination使用)
│   └── TagsList.tsx (Mantine Badge、Group使用)
└── forms/
    ├── LoginForm.tsx (Mantine Form、PasswordInput使用)
    ├── RegisterForm.tsx (Mantine Form、TextInput使用)
    └── SettingsForm.tsx (Mantine Form、FileInput使用)
```

### 6.3 UIテーマとスタイリング（Mantine）
```typescript
// theme/index.ts
import { MantineProvider, createTheme } from '@mantine/core';

const theme = createTheme({
  primaryColor: 'green', // RealWorldブランドカラー
  colors: {
    brand: [
      '#f0f9ff', '#e0f2fe', '#bae6fd', '#7dd3fc',
      '#38bdf8', '#0ea5e9', '#0284c7', '#0369a1',
      '#075985', '#0c4a6e'
    ]
  },
  components: {
    Button: Button.extend({
      defaultProps: {
        size: 'md',
        radius: 'md'
      }
    }),
    Card: Card.extend({
      defaultProps: {
        shadow: 'sm',
        radius: 'md',
        withBorder: true
      }
    })
  }
});

// App.tsxでMantineProviderを適用
<MantineProvider theme={theme}>
  <Notifications />
  <Router />
</MantineProvider>
```

### 6.4 状態管理（Zustand + TanStack Query）
```typescript
// stores/authStore.ts
interface AuthState {
  user: User | null
  token: string | null
  login: (user: User, token: string) => void
  logout: () => void
  updateUser: (user: User) => void
}

// Mantine Notificationsとの統合
import { notifications } from '@mantine/notifications';

const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  login: (user, token) => {
    set({ user, token });
    notifications.show({
      title: 'ログイン成功',
      message: `ようこそ、${user.username}さん！`,
      color: 'green'
    });
  },
  logout: () => {
    set({ user: null, token: null });
    notifications.show({
      title: 'ログアウト',
      message: '安全にログアウトしました。',
      color: 'blue'
    });
  }
}));
```

## 7. バックエンド設計

### 7.1 プロジェクト構造
```
backend/
├── cmd/
│   └── server/
│       └── main.go
├── internal/
│   ├── config/
│   ├── handler/
│   ├── middleware/
│   ├── model/
│   ├── repository/
│   ├── service/
│   └── utils/
├── pkg/
├── migrations/
├── go.mod
├── go.sum
└── Makefile
```

### 7.2 ハンドラー構造
```go
// internal/handler/user.go
type UserHandler struct {
    userService service.UserService
}

func (h *UserHandler) Register(w http.ResponseWriter, r *http.Request) error
func (h *UserHandler) Login(w http.ResponseWriter, r *http.Request) error
func (h *UserHandler) GetCurrentUser(w http.ResponseWriter, r *http.Request) error
func (h *UserHandler) UpdateUser(w http.ResponseWriter, r *http.Request) error
```

### 7.3 ミドルウェア
```go
// JWT認証ミドルウェア
func JWTMiddleware() http.Handler

// CORSミドルウェア
func CORSMiddleware() http.Handler

// ロギングミドルウェア
func LoggingMiddleware() http.Handler
```

## 8. 開発プロセス

### 8.1 開発フェーズ
1. **フェーズ1**: 基本CRUDと認証実装
2. **フェーズ2**: 高度な機能（フォロー、お気に入り）実装
3. **フェーズ3**: UI/UX改善と最適化
4. **フェーズ4**: テスト作成とデプロイ

### 8.2 バイブコーディング適用
- **高速プロトタイピング**: MVP機能優先実装
- **反復的改善**: 機能完成度の段階的向上
- **リアルタイムフィードバック**: TDD適用とリアルタイムテスト
- **文書化**: コード開発と同時API文書化

### 8.3 品質管理
- **コードレビュー**: 全PRに対するコードレビュー
- **自動化テスト**: CI/CDパイプラインでの自動テスト実行
- **パフォーマンス監視**: 開発中およびデプロイ後のパフォーマンス監視

## 9. デプロイと運用

### 9.1 デプロイ環境
- **開発環境**: ローカル開発サーバー
- **フロントエンド本番**: GitHub Pages自動デプロイ
- **バックエンドステージング**: AWS ECSテスト環境
- **バックエンド本番**: AWS ECS本番環境

### 9.2 CI/CDパイプライン
```yaml
# フロントエンドパイプライン（.github/workflows/frontend-deploy.yml）
name: Deploy Frontend to GitHub Pages
on:
  push:
    branches: [main]
    paths: ['frontend/**']
jobs:
  build:
    - フロントエンドテスト実行
    - リンティングと型チェック実行
    - GitHub Pages用ビルド
    - GitHub Pagesデプロイ

# バックエンドパイプライン（.github/workflows/backend-deploy.yml）
name: Deploy Backend to AWS
on:
  push:
    branches: [main]
    paths: ['backend/**']
jobs:
  test:
    - バックエンドテスト実行
    - Dockerイメージビルド
  deploy:
    - ECRにイメージプッシュ
    - ECSサービス更新
```

### 9.3 監視
- **サーバー監視**: CloudWatchによるサーバー監視
- **アプリケーションパフォーマンス**: アプリケーションパフォーマンスのログ記録と追跡
- **使用統計**: デプロイ後の使用量と開発統計

## 10. 検証基準

### 10.1 機能検証基準
- [ ] RealWorld API仕様の全項目実装
- [ ] 全フロントエンドページ実装
- [ ] ユーザーシナリオテスト合格
- [ ] モバイルレスポンシブデザイン正常動作

### 10.2 技術検証基準
- [ ] バックエンドテストカバレッジ80%以上
- [ ] フロントエンドテストカバレッジ80%以上
- [ ] パフォーマンス要件達成（ロード時間3秒以下）
- [ ] アクセシビリティAAグレード達成

### 10.3 運用検証基準
- [ ] CI/CDパイプライン構築
- [ ] 本番環境デプロイ
- [ ] 監視システム構築
- [ ] 文書化完了（API文書、ユーザーガイド）

---

*このPRDは、RealWorldバイブコーディング実装プロジェクトの詳細要件を定義します。*