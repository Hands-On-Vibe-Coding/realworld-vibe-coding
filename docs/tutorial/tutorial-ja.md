# RealWorld バイブコーディング チュートリアル

## はじめに

このチュートリアルは、Claude CodeとVibe Codingの方法論を使用して、完全なRealWorldアプリケーションを構築する方法を説明します。このプロジェクトは、Goバックエンド、Reactフロントエンド、および教育用に最適化された現代的なクラウドデプロイメントプラクティスを使用したフルスタック実装を示しています。

## Vibe Codingとは？

Vibe Codingは、以下を重視する開発方法論です：
- **迅速なプロトタイピング**：まずコア機能を実装
- **反復的改善**：機能別の段階的向上
- **リアルタイムフィードバック**：開発中の継続的なテスト
- **文書化**：開発と並行したリアルタイム文書化

## プロジェクト概要

RealWorldアプリケーションは、以下の機能を示すMedium.comの完全なクローンです：
- ユーザー認証とプロファイル
- 記事の作成、編集、管理
- コメントとソーシャル機能
- 現代的なWeb開発プラクティス
- コスト最適化されたクラウドデプロイメント

## チュートリアルの構造

このチュートリアルは、アプリケーションの構築に使用された主要なプロンプトと開発フェーズを中心に構成されており、反復的な開発プロセスと意思決定を示しています。

## 関連文書

このチュートリアルは複数のプロジェクト文書を参照しています。包括的な理解のために、以下の文書も参照してください：

- **📋 [Pre-PRD](../pre-prd.jp.md)** - 初期要件と技術評価
- **📊 [PRD](../prd.jp.md)** - 詳細な製品要件と仕様
- **🗺️ [プロジェクト計画](../plan.jp.md)** - タスク分解と実装ロードマップ
- **🚀 [デプロイメントガイド](../DEPLOYMENT.jp.md)** - 完全なデプロイメントとインフラストラクチャ設定
- **🔧 [Git フック](../git-hooks.jp.md)** - 開発ワークフローと品質ゲート
- **📈 [実装ログ](../implementations/claude-sonnet4/implementation-log.md)** - 詳細な開発進捗追跡

## フェーズ1：プロジェクト計画とセットアップ

### ステップ1：初期プロジェクト計画

**主要プロンプト：**
```
このプロジェクトの目標は、Realworldをバイブコーディングで実装することです。アーキテクチャ要件の定義から実装まで、すべてClaudeに任せる予定です。まず、PRDを作成するための要件を定義するために必要な準備文書として、pre-prd.mdを最初に作成してください。
```

**このアプローチを取る理由：**
- 明確なプロジェクトスコープと目標の確立
- 実装前の技術要件の定義
- アーキテクチャ決定の基盤作成
- 適切なリソース計画の実現

**結果：**
- 包括的な[Pre-PRD文書](../pre-prd.jp.md)の作成
- 技術スタック選択基準の定義
- 成功指標とタイムラインの確立
- 開発フェーズの概要作成

**主要な学習ポイント：** コーディングの前に必ず計画文書から始めてください。これはスコープクリープを防ぎ、すべての関係者がプロジェクトの目標を理解できるようにします。

**📖 関連文書：**
- [Pre-PRD](../pre-prd.jp.md) - 完全な初期要件分析
- [PRD](../prd.jp.md) - その後に作成された詳細な製品仕様

### ステップ2：技術スタックの選択

**決定フレームワーク：**
プロジェクトは技術選択のために特定の基準を使用しました：

**バックエンドの考慮事項：**
- **Go with Gin**：パフォーマンスとシンプルさのために選択
- **SQLite**：エンタープライズデータベースより教育用に最適化
- **JWT認証**：ステートレス認証の業界標準

**フロントエンドの考慮事項：**
- **React 19 + TypeScript**：型安全性を持つ現代的なReact
- **Vite**：開発のための高速ビルドツール
- **TanStack Router**：型安全なルーティングソリューション
- **Zustand + TanStack Query**：軽量な状態管理

**これらの選択の理由：**
- 教育的価値と現代的プラクティスのバランス
- コストとシンプルさの最適化
- 実世界に適用可能なスキルの提供
- 迅速な開発サイクルのサポート

**主要な学習ポイント：** 技術選択はプロジェクトの目標と一致させる必要があります。教育プロジェクトの場合、エンタープライズの複雑さよりもシンプルさとコスト効率を優先してください。

### ステップ3：開発環境のセットアップ

**主要プロンプト：**
```
git hookで、フロントエンドとバックエンドそれぞれに変更があった場合、lintとユニットテストが実行されるように設定されているか確認してください。
```

**📖 関連文書：** [Git フックセットアップガイド](../git-hooks.jp.md)

**セットアッププロセス：**
1. **Husky設定**：品質ゲートのためのpre-commitフック
2. **Lint-staged**：変更されたファイルの段階的リンティング
3. **自動テスト**：コミット前のユニットテスト実行
4. **文書化**：チーム用のgitフック文書化

**実装：**
```bash
# 開発依存関係のインストール
npm install --save-dev husky lint-staged

# pre-commitフックの設定
npx husky install
npx husky add .husky/pre-commit "npx lint-staged"
```

**主要な学習ポイント：** 開発初期に品質ゲートを確立してください。自動化されたチェックは、メインブランチにバグが入るのを防ぎ、コード品質を維持します。

**📖 詳細セットアップ：** 完全な設定詳細については[Git フック文書](../git-hooks.jp.md)を参照してください。

## フェーズ2：コアアーキテクチャの実装

### ステップ4：バックエンドAPI開発

**アーキテクチャパターン：**
バックエンドはクリーンアーキテクチャ原則に従います：

```
cmd/server/main.go          # エントリーポイント
internal/
├── handler/                # HTTPハンドラー
├── service/                # ビジネスロジック
├── repository/             # データアクセス
├── middleware/             # HTTPミドルウェア
├── model/                  # データモデル
└── utils/                  # ユーティリティ関数
```

**主要実装プロンプト：**
- "JWTを使用したユーザー認証の実装"
- "記事管理エンドポイントの作成"
- "適切な認可を持つコメントシステムの追加"
- "記事分類のためのタグシステムの実装"

**データベース設計：**
教育目的でSQLiteを選択しました：
- 簡素化されたデプロイメント（管理データベース不要）
- ゼロコストの開発環境
- 簡単なバックアップとマイグレーション
- 教育用ワークロードに十分

**主要な学習ポイント：** クリーンアーキテクチャは保守可能なコードを可能にします。各レイヤーは明確な責任を持ち、依存関係は内向きに流れます。

### ステップ5：リアルタイム検証を使ったフロントエンド開発

**革新的アプローチ：**
プロジェクトはリアルタイムフロントエンド検証のためにPlaywright MCPを使用しました：

**主要プロンプト：**
```
フロントエンド開発を行う際、Playwright MCPを使用して実装状態を確認してください。
```

**検証プロセス：**
1. **視覚的検証**：開発サーバーへのナビゲーション
2. **スクリーンショット文書化**：実装進捗のキャプチャ
3. **機能テスト**：ユーザーインタラクションのテスト
4. **実装検証**：機能が正しく動作するかの確認

**ワークフロー例：**
```javascript
// 開発サーバーへのナビゲーション
await page.goto('http://localhost:5173');

// 文書化のためのスクリーンショット撮影
await page.screenshot({ path: 'implementation-progress.png' });

// ユーザーインタラクションのテスト
await page.click('[data-testid="login-button"]');
await page.fill('[data-testid="email-input"]', 'test@example.com');
```

**主要な学習ポイント：** 開発中のリアルタイム検証は問題を早期に発見し、実装進捗に対する即座のフィードバックを提供します。

## フェーズ3：認証と状態管理

### ステップ6：JWT認証実装

**課題：** 適切なエラーハンドリングを持つ複雑な認証フロー

**主要プロンプト：**
- "JWTトークンの生成と検証の実装"
- "保護されたルートのための認証ミドルウェア作成"
- "トークンのリフレッシュと有効期限の処理"

**ソリューションアーキテクチャ：**
```go
// JWTユーティリティ関数
func GenerateJWT(userID uint) (string, error) {
    claims := jwt.MapClaims{
        "user_id": userID,
        "exp":     time.Now().Add(time.Hour * 24).Unix(),
    }
    token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
    return token.SignedString([]byte(secretKey))
}

// 認証ミドルウェア
func AuthMiddleware(next http.Handler) http.Handler {
    return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
        tokenString := extractTokenFromHeader(r)
        if tokenString == "" {
            http.Error(w, "Missing authorization header", http.StatusUnauthorized)
            return
        }
        // トークンの検証とクレームの抽出
        // ...
    })
}
```

**フロントエンド状態管理：**
```typescript
// Zustand認証ストア
export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  login: async (email: string, password: string) => {
    const response = await api.post('/users/login', { email, password });
    set({ 
      user: response.data.user, 
      token: response.data.token,
      isAuthenticated: true 
    });
  },
  logout: () => set({ user: null, token: null, isAuthenticated: false }),
}));
```

**主要な学習ポイント：** 認証はフロントエンドとバックエンド間の慎重な調整が必要です。状態管理は集中化され、一貫性を保つ必要があります。

### ステップ7：認証問題のデバッグ

**一般的な問題：** リクエストと一緒に認証ヘッダーが送信されない

**デバッグプロセス：**
1. **ブラウザコンソール分析**：ネットワークリクエストのチェック
2. **コードレビュー**：APIクライアント設定の検証
3. **体系的テスト**：各コンポーネントの個別テスト
4. **実装修正**：ヘッダーハンドリングの更新

**主要プロンプト：**
```
ログイン後にユーザー情報を取得する際、Authorizationヘッダーが正しく送信されない問題が発生しています。この問題を解決してください。
```

**ソリューション：**
```typescript
// 自動認証ヘッダー付きAPIクライアント
const apiClient = axios.create({
  baseURL: '/api',
});

apiClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

**主要な学習ポイント：** 体系的なデバッグアプローチが重要です。症状分析から始めて、システムを体系的に検証してください。

## フェーズ4：フロントエンドユーザーインターフェース

### ステップ8：コンポーネントベースアーキテクチャ

**アーキテクチャパターン：**
```
src/
├── components/
│   ├── Article/           # 記事関連コンポーネント
│   ├── Comment/           # コメントコンポーネント
│   ├── Common/            # 共通コンポーネント
│   ├── Layout/            # レイアウトコンポーネント
│   └── Profile/           # プロフィールコンポーネント
├── pages/                 # ページコンポーネント
├── hooks/                 # カスタムフック
├── stores/                # 状態管理
└── lib/                   # ユーティリティとAPI
```

**主要実装プロンプト：**
- "ページネーション付き記事リストコンポーネントの作成"
- "リアルタイム更新付きコメントシステムの実装"
- "フォロー/アンフォロー機能付きプロフィールページの追加"
- "タグ管理付き記事エディターの作成"

**コンポーネント設計原則：**
1. **単一責任**：各コンポーネントは一つの明確な目的を持つ
2. **再利用性**：コンポーネントは異なるページで使用可能
3. **型安全性**：完全なTypeScript統合
4. **アクセシビリティ**：適切なARIA属性とキーボードナビゲーション

**主要な学習ポイント：** コンポーネントベースアーキテクチャはコードの再利用性と保守性を促進します。明確な関心の分離により、コードベースの理解と修正が容易になります。

### ステップ9：状態管理戦略

**ハイブリッドアプローチ：**
- **Zustand**：クライアントサイド状態（認証、UI状態）
- **TanStack Query**：サーバー状態（記事、コメント、プロフィール）

**実装例：**
```typescript
// TanStack Queryを使用したサーバー状態
export const useArticles = (filters: ArticleFilters) => {
  return useQuery({
    queryKey: ['articles', filters],
    queryFn: () => api.getArticles(filters),
    staleTime: 5 * 60 * 1000, // 5分
  });
};

// Zustandを使用したクライアント状態
export const useUIStore = create<UIState>((set) => ({
  theme: 'light',
  sidebarOpen: false,
  toggleTheme: () => set((state) => ({ 
    theme: state.theme === 'light' ? 'dark' : 'light' 
  })),
  toggleSidebar: () => set((state) => ({ 
    sidebarOpen: !state.sidebarOpen 
  })),
}));
```

**主要な学習ポイント：** 異なるタイプの状態には異なる管理戦略が必要です。サーバー状態とクライアント状態は異なる特性を持ち、それに応じて処理される必要があります。

## フェーズ5：テストと品質保証

### ステップ10：テスト戦略

**多層テストアプローチ：**
1. **単体テスト**：コンポーネントとユーティリティ関数のテスト
2. **統合テスト**：APIエンドポイントのテスト
3. **エンドツーエンドテスト**：完全なユーザーワークフローのテスト

**バックエンドテスト：**
```go
func TestUserAuthentication(t *testing.T) {
    // テストデータベースのセットアップ
    db := setupTestDB()
    defer db.Close()
    
    // ユーザー登録のテスト
    user := &model.User{
        Email:    "test@example.com",
        Username: "testuser",
        Password: "hashedpassword",
    }
    
    err := userService.CreateUser(user)
    assert.NoError(t, err)
    
    // ログインのテスト
    token, err := userService.Login("test@example.com", "password")
    assert.NoError(t, err)
    assert.NotEmpty(t, token)
}
```

**フロントエンドテスト：**
```typescript
// React Testing Libraryを使用したコンポーネントテスト
describe('ArticleList', () => {
  it('renders articles correctly', () => {
    const mockArticles = [
      { title: 'Test Article', author: 'Test Author' },
    ];
    
    render(<ArticleList articles={mockArticles} />);
    
    expect(screen.getByText('Test Article')).toBeInTheDocument();
    expect(screen.getByText('Test Author')).toBeInTheDocument();
  });
});
```

**主要な学習ポイント：** テストは最後に追加されるのではなく、開発全体に統合されるべきです。異なるテストレベルは異なる目的を持ち、一緒に使用される必要があります。

### ステップ11：コード品質とリンティング

**品質ツール設定：**
- **ESLint**：JavaScript/TypeScriptリンティング
- **Prettier**：コードフォーマッティング
- **Go fmt**：Goコードフォーマッティング
- **Go vet**：Goコード分析

**Pre-commitフック設定：**
```json
{
  "lint-staged": {
    "*.{js,jsx,ts,tsx}": [
      "eslint --fix",
      "prettier --write"
    ],
    "*.go": [
      "go fmt",
      "go vet"
    ]
  }
}
```

**主要な学習ポイント：** 自動化された品質チェックは一貫性を維持し、問題を早期に発見します。設定はプロジェクト固有で、チームで合意されるべきです。

## フェーズ6：デプロイメントとインフラストラクチャ

### ステップ12：コスト最適化クラウドアーキテクチャ

**教育用インフラストラクチャ設計：**
- **バックエンド**：AWS ECS with Fargate Spotインスタンス（70%コスト削減）
- **フロントエンド**：GitHub Pages（無料ホスティング）
- **データベース**：コンテナ内SQLite（管理データベースコストなし）
- **CDN**：グローバル配信のためのCloudFront

**📖 完全セットアップガイド：** [デプロイメント文書](../DEPLOYMENT.jp.md)

**主要プロンプト：**
```
教育用プロジェクトに最適なインフラを構築してください。コスト効率を最優先しつつ、実際の運用環境と類似した構造を構築してください。
```

**Infrastructure as Code：**
```typescript
// インフラストラクチャ用AWS CDK
export class RealWorldStack extends Stack {
  constructor(scope: Construct, id: string, props: StackProps) {
    super(scope, id, props);
    
    // Spotインスタンス付きECSクラスター
    const cluster = new ecs.Cluster(this, 'RealWorldCluster', {
      vpc: vpc,
      capacityProviders: ['FARGATE_SPOT'],
    });
    
    // 最小リソース付きタスク定義
    const taskDefinition = new ecs.FargateTaskDefinition(this, 'TaskDef', {
      memoryLimitMiB: 512,
      cpu: 256,
    });
  }
}
```

**デプロイメントパイプライン：**
```yaml
# CI/CD用GitHub Actions
name: Deploy to Production
on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Build and Deploy Backend
        run: |
          docker build -t realworld-backend .
          aws ecs update-service --cluster realworld --service backend
      - name: Deploy Frontend
        run: |
          npm run build
          aws s3 sync dist/ s3://realworld-frontend/
```

**主要な学習ポイント：** 教育プロジェクトはコスト最適化と共にプロダクション対応インフラストラクチャを使用できます。Spotインスタンスとサーバーレスサービスは、機能を維持しながら大幅なコスト削減を提供します。

**📖 実装詳細：**
- [デプロイメントガイド](../DEPLOYMENT.jp.md) - 完全なインフラストラクチャ設定
- [プロジェクト計画](../plan.jp.md) - 元のインフラストラクチャ計画決定

### ステップ13：監視と観測性

**観測性スタック：**
- **アプリケーションログ**：コンテキスト付き構造化ログ
- **メトリクス**：基本的なパフォーマンスメトリクス
- **ヘルスチェック**：アプリケーションヘルス監視

**実装：**
```go
// 構造化ログ
func (h *Handler) CreateArticle(w http.ResponseWriter, r *http.Request) {
    logger := log.With().
        Str("method", r.Method).
        Str("path", r.URL.Path).
        Logger()
    
    logger.Info().Msg("Creating article")
    
    // 実装...
    
    logger.Info().
        Uint("article_id", article.ID).
        Msg("Article created successfully")
}
```

**主要な学習ポイント：** 観測性は最初からアプリケーションに組み込まれるべきです。シンプルな監視は監視がないよりも優れています。

## フェーズ7：文書化と知識移転

### ステップ14：生きた文書化

**文書化戦略：**
- **コードコメント**：何ではなく、なぜに焦点
- **API文書**：OpenAPI/Swagger仕様
- **アーキテクチャ決定記録**：重要な決定の文書化
- **チュートリアル文書**：このチュートリアル自体

**主要プロンプト：**
```
プロジェクトのすべての文書を英語で作成してください。国際的な開発者もアクセスできるようにし、プロジェクト全体で一貫性を保つためです。
```

**文書化アプローチ：**
1. **リアルタイム更新**：コード変更と共に文書を更新
2. **多言語**：英語、韓国語、日本語版
3. **実用的な例**：理論的ではなく実際のコード例
4. **決定コンテキスト**：何をしたかではなく、なぜ決定したか

**主要な学習ポイント：** 文書化は第一級市民として扱われるべきです。国際的なアクセシビリティは英語文書を必要としますが、現地語版は価値を追加します。

## Vibe Coding原則の実践的適用

### 1. 迅速なプロトタイピング
- コアユーザー認証から開始
- 基本的なCRUD操作を最初に実装
- 機能を段階的に追加

### 2. 反復的改善
- テストに基づいてUIコンポーネントを改善
- 基本機能の後にパフォーマンスを最適化
- 時間をかけてエラーハンドリングを向上

### 3. リアルタイムフィードバック
- 継続的な検証のためのPlaywright MCP使用
- 開発のためのホットリロード実装
- 開発中の定期的なテスト

### 4. 文書化
- 開発全体を通じてREADMEファイルを維持
- この包括的なチュートリアルの作成
- アーキテクチャ決定の文書化

## 一般的な落とし穴と解決策

### 認証問題
**問題**：リクエストと一緒にトークンが送信されない
**解決策**：自動ヘッダー注入付きの集中化APIクライアント

### 状態管理の複雑性
**問題**：サーバー状態とクライアント状態の混在
**解決策**：異なる状態タイプに対して異なるツールを使用

### データベース選択
**問題**：エンタープライズデータベースでの過度なエンジニアリング
**解決策**：教育プロジェクトにはSQLite、本番環境にはPostgreSQL

### デプロイメントコスト
**問題**：学習プロジェクトの高いクラウドコスト
**解決策**：Spotインスタンス、可能な場所でのサーバーレス、フロントエンド用GitHub Pages

## 結論

このチュートリアルは、Vibe Coding方法論を適用して完全でプロダクション対応のアプリケーションを構築する方法を示しています。主要な洞察は以下の通りです：

1. **計画から始める**：適切な文書化と計画はスコープクリープを防ぎます
2. **適切な技術選択**：技術選択をプロジェクトの目標に合わせます
3. **早期に品質ゲートを構築**：最初から自動化されたテストとリンティング
4. **リアルタイムフィードバックを使用**：開発中の継続的な検証
5. **コンテキストに最適化**：教育プロジェクトはエンタープライズプロジェクトと異なる制約を持ちます
6. **すべてを文書化**：知識移転はプロジェクトの成功に重要です

結果は、学習ツールであり、現代的なWeb開発プラクティスの実践例としても機能するRealWorldアプリケーションです。このプロジェクトは、適切な方法論によって導かれたときに、AI支援開発が高品質で、よく文書化された保守可能なコードを生成できることを成功裏に実証しています。

## 次のステップ

学習を続けるには：

1. **アプリケーションを拡張**：通知、検索、ソーシャルシェアなどの機能を追加
2. **異なるスタックを探索**：異なる技術で同じプロジェクトを試す
3. **アーキテクチャをスケール**：マイクロサービスまたはサーバーレスアーキテクチャに移行
4. **高度な機能を実装**：WebSocketでリアルタイム機能を追加
5. **パフォーマンスを最適化**：キャッシュ、CDN、パフォーマンス監視を実装

このチュートリアルが提供する基盤は、Vibe Coding方法論のコア原則を維持しながら、これらの高度な探索を可能にします。

## 追加リソース

### プロジェクト文書
- **📋 [Pre-PRD](../pre-prd.jp.md)** - 初期要件と技術評価
- **📊 [PRD](../prd.jp.md)** - 完全な製品要件文書
- **🗺️ [プロジェクト計画](../plan.jp.md)** - 詳細な実装ロードマップ
- **🚀 [デプロイメントガイド](../DEPLOYMENT.jp.md)** - インフラストラクチャとデプロイメント設定
- **🔧 [Git フック](../git-hooks.jp.md)** - 開発ワークフロー設定

### 実装追跡
- **📈 [Claude Sonnet 4実装](../implementations/claude-sonnet4/implementation-log.md)** - 詳細な開発ログ
- **📊 [Vibe Coding実験計画](../vibe-coding-experiment-plan.md)** - ツール比較方法論

### 言語別バージョン
- **🇺🇸 [English Tutorial](tutorial.md)** - 英語チュートリアル
- **🇰🇷 [Korean Tutorial](tutorial-ko.md)** - 한국어 튜토리얼