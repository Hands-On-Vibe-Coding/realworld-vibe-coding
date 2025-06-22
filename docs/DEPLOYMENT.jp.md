# デプロイメントガイド

このドキュメントは、RealWorldアプリケーションのデプロイに関する詳細な手順を提供します。

## アーキテクチャ概要

アプリケーションはハイブリッドデプロイメント戦略を使用しています：

- **フロントエンド**: GitHub Pages（静的サイト）
- **バックエンド**: AWS ECS with Fargate（コンテナ化されたAPI）
- **データベース**: AWS RDS PostgreSQL
- **インフラストラクチャ**: AWS CDK（TypeScript）

## 前提条件

### 1. GitHub リポジトリのセットアップ

リポジトリに以下のシークレットが設定されていることを確認してください：

```
AWS_ROLE_ARN: arn:aws:iam::931016744724:role/GitHubActionsRole
AWS_REGION: ap-northeast-2
```

### 2. AWS CLI設定

適切な認証情報でAWS CLIをインストールし、設定してください：

```bash
aws configure
```

### 3. 必要なツール

- **Node.js 18+** および npm
- **AWS CDK v2**: `npm install -g aws-cdk`
- **Docker**（ローカルテスト用）
- **Go 1.21+**（バックエンド開発用）

## 初期セットアップ

### 1. AWS OIDC認証

提供されたスクリプトを実行してGitHub Actions認証をセットアップしてください：

```bash
./scripts/setup-oidc.sh
```

これにより以下が作成されます：
- OIDC Identity Provider
- GitHub Actions用IAMロール
- ECR、ECS、その他のAWSサービスに必要なポリシー

### 2. インフラストラクチャデプロイ

AWSインフラストラクチャスタックを順番にデプロイしてください：

```bash
cd infrastructure

# 依存関係をインストール
npm install

# CDKブートストラップ（一回限りのセットアップ）
npx cdk bootstrap

# 開発環境用のすべてのスタックをデプロイ
npm run deploy:dev

# または本番環境用にデプロイ
npm run deploy:prod
```

デプロイメントにより以下が作成されます：
- **NetworkStack**: VPC、サブネット、セキュリティグループ
- **DatabaseStack**: RDS PostgreSQLインスタンス
- **ECSStack**: ECSクラスター、ALB、タスク定義
- **MonitoringStack**: CloudWatchダッシュボードとアラーム

## デプロイメントワークフロー

### フロントエンドデプロイメント（自動）

以下の場合にフロントエンドがGitHub Pagesに自動的にデプロイされます：

- `main`ブランチにコードをプッシュ
- `frontend/**`ディレクトリに変更
- ワークフローファイル`.github/workflows/frontend-deploy.yml`を変更

**プロセス：**
1. 依存関係をインストール
2. テストとリンティングを実行
3. 正しいベースパスで本番用ビルド
4. GitHub Pagesにデプロイ

**URL**: https://dohyunjung.github.io/realworld-vibe-coding/

### バックエンドデプロイメント（自動）

以下の場合にバックエンドがAWS ECSに自動的にデプロイされます：

- `main`ブランチにコードをプッシュ
- `backend/**`ディレクトリに変更
- インフラストラクチャの変更
- ワークフローファイル`.github/workflows/backend-deploy.yml`を変更

**プロセス：**
1. Goテストとコード品質チェックを実行
2. linux/amd64用Dockerイメージをビルド
3. Amazon ECRにイメージをプッシュ
4. ECSタスク定義を更新
5. ECSサービスにデプロイ
6. ヘルスチェックを検証
7. 古いECRイメージをクリーンアップ

## 手動デプロイメント

### バックエンド手動ビルドとプッシュ

```bash
# ECRにログイン
aws ecr get-login-password --region ap-northeast-2 | \
  docker login --username AWS --password-stdin \
  931016744724.dkr.ecr.ap-northeast-2.amazonaws.com

# イメージをビルド
docker build -t realworld-backend ./backend

# ECR用にタグ付け
docker tag realworld-backend:latest \
  931016744724.dkr.ecr.ap-northeast-2.amazonaws.com/realworld-backend:latest

# ECRにプッシュ
docker push 931016744724.dkr.ecr.ap-northeast-2.amazonaws.com/realworld-backend:latest

# ECSサービスを更新
aws ecs update-service \
  --cluster realworld-dev-cluster \
  --service realworld-dev-service \
  --force-new-deployment
```

### フロントエンド手動ビルドとデプロイ

```bash
cd frontend

# 依存関係をインストール
npm install

# GitHub Pages用にビルド
VITE_BASE_URL=/realworld-vibe-coding/ npm run build

# デプロイ（mainブランチにコミットすると自動デプロイ）
git add dist/
git commit -m "feat: manual frontend deployment"
git push origin main
```

## 環境設定

### 開発環境

**フロントエンド：**
```bash
VITE_API_BASE_URL=http://localhost:8080
VITE_BASE_URL=/
```

**バックエンド：**
```bash
PORT=8080
DATABASE_URL=realworld.db
JWT_SECRET=dev-secret-key
ENVIRONMENT=development
```

### 本番環境

**フロントエンド：**
```bash
VITE_API_BASE_URL=http://realworld-dev-alb-123456789.ap-northeast-2.elb.amazonaws.com
VITE_BASE_URL=/realworld-vibe-coding/
```

**バックエンド（ECSタスク定義経由）：**
```bash
PORT=8080
DATABASE_URL=postgresql://username:password@rds-endpoint:5432/realworld
JWT_SECRET=<from-secrets-manager>
ENVIRONMENT=production
```

## モニタリングとデバッグ

### CloudWatchログ

```bash
# ECSタスクログを表示
aws logs tail /aws/ecs/realworld-dev --follow

# 特定のログループを表示
aws logs describe-log-groups --log-group-name-prefix "/aws/ecs/realworld"
```

### ヘルスチェック

**フロントエンド：** https://dohyunjung.github.io/realworld-vibe-coding/

**バックエンド：** http://ALB_DNS_NAME/health

### 一般的な問題

1. **ECSタスクが開始しない**
   - ECRイメージが存在するかを確認
   - タスク定義設定を検証
   - CloudWatchログを確認

2. **データベース接続問題**
   - セキュリティグループがECS → RDS通信を許可しているかを確認
   - Secrets Managerでデータベース認証情報を検証
   - VPCとサブネット設定を確認

3. **フロントエンドAPIコール失敗**
   - バックエンドのCORS設定を検証
   - VITE_API_BASE_URL環境変数を確認
   - ALBセキュリティグループがHTTPトラフィックを許可しているかを確認

## コスト管理

### 開発環境

- ECS: 2タスク × t3.micro相当
- RDS: db.t3.microインスタンス
- ALB: 標準ロードバランサー
- **推定コスト**: 月額 ~$50-70

### 本番環境

- ECS: 2-4タスク × t3.small相当
- RDS: Multi-AZを使用したdb.t3.small
- ALB: 高トラフィックを伴う標準ロードバランサー
- **推定コスト**: 月額 ~$120-150

### コスト最適化

1. **自動スケーリング**: CPU/メモリベースのECSタスクスケール
2. **イメージクリーンアップ**: 古いECRイメージの自動削除
3. **開発環境シャットダウン**: 不要時に開発環境で`npx cdk destroy`を使用

## セキュリティ考慮事項

1. **IAMロール**: OIDCを使用した最小権限
2. **VPCセキュリティ**: すべてのリソースがプライベートサブネットに配置
3. **データベース**: 保存時暗号化、Secrets Managerの認証情報
4. **コンテナセキュリティ**: 非rootユーザー、最小限のAlpineイメージ
5. **HTTPS**: CloudFront/ALBがSSL終端を処理

## ロールバック手順

### バックエンドロールバック

```bash
# 最近のタスク定義をリスト
aws ecs list-task-definitions --family-prefix realworld-dev-task

# 前のタスク定義にサービスを更新
aws ecs update-service \
  --cluster realworld-dev-cluster \
  --service realworld-dev-service \
  --task-definition realworld-dev-task:PREVIOUS_REVISION
```

### フロントエンドロールバック

```bash
# 前のコミットに戻す
git revert HEAD
git push origin main

# GitHub Actionsが自動的に再デプロイ
```

## トラブルシューティングコマンド

```bash
# ECSサービス状態を確認
aws ecs describe-services \
  --cluster realworld-dev-cluster \
  --services realworld-dev-service

# 実行中のタスクをリスト
aws ecs list-tasks \
  --cluster realworld-dev-cluster \
  --service-name realworld-dev-service

# タスク詳細を記述
aws ecs describe-tasks \
  --cluster realworld-dev-cluster \
  --tasks TASK_ID

# ALBターゲットヘルスを確認
aws elbv2 describe-target-health \
  --target-group-arn TARGET_GROUP_ARN

# データベース状態を表示
aws rds describe-db-instances \
  --db-instance-identifier realworld-dev
```

## サポート

デプロイメント問題については：

1. GitHub Actionsログを確認
2. CloudWatchログを確認
3. AWSリソース状態を確認
4. このドキュメントを参照
5. 詳細なトラブルシューティングについてはインフラストラクチャREADMEを確認