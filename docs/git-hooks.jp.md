# Gitフックドキュメント

このドキュメントは、RealWorld Vibe CodingプロジェクトのGitフック設定について説明し、コミット前の自動化されたリンティングとテストを通じてコード品質を保証します。

## 概要

プロジェクトはHuskyを使用して、自動化されたリンティングとテストワークフローと共にGitフックを管理しています。pre-commitフックは変更をコミットしようとするたびに実行され、適切にフォーマットされテストされたコードのみがリポジトリに入ることを保証します。

## Pre-commitフック設定

### 場所
- **Husky設定**: `.husky/pre-commit`
- **パッケージ設定**: `package.json`（lint-stagedセクション）

### ワークフロー

Pre-commitフックは以下の順序に従います：

1. **リンティングとフォーマッティング**（lint-staged経由）
   - フロントエンドファイル（`*.ts`, `*.tsx`, `*.js`, `*.jsx`）: ESLintの自動修正と共に実行
   - バックエンドファイル（`*.go`）: `go fmt`と`go vet`を実行

2. **条件付きテスト**
   - コードベースのどの部分が変更されたかを検出
   - フロントエンドファイルが変更された場合のみフロントエンドテストを実行
   - バックエンドファイルが変更された場合のみバックエンドテストを実行
   - コード変更が検出されない場合はテストをスキップ

### サポートされるファイルタイプ

#### フロントエンド
- **拡張子**: `.ts`, `.tsx`, `.js`, `.jsx`
- **パス**: `frontend/src/**/*`
- **アクション**: 
  - 自動修正付きリンティング: `npm run lint:fix`
  - テスト: `npm run test`（Vitest）

#### バックエンド
- **拡張子**: `.go`
- **パス**: `backend/**/*`
- **アクション**:
  - フォーマッティング: `go fmt`
  - リンティング: `go vet`
  - テスト: `go test ./...`

## コマンドリファレンス

### ルートレベルコマンド
```bash
# 全てのリンティングを実行（フロントエンド + バックエンド）
npm run lint

# 全てのテストを実行（フロントエンド + バックエンド）
npm run test

# 全てのビルドを実行（フロントエンド + バックエンド）
npm run build
```

### フロントエンド特化
```bash
cd frontend
npm run lint        # ESLintチェック
npm run lint:fix    # ESLintの自動修正
npm run test        # Vitestテスト
npm run build       # 本番ビルド
```

### バックエンド特化
```bash
cd backend
go fmt ./...        # Goコードのフォーマット
go vet ./...        # Go静的解析
go test ./...       # Goテストを実行
go build -o server cmd/server/main.go  # バイナリをビルド
```

## フック動作

### 成功したコミットフロー
1. 🔍 Pre-commitチェック開始
2. 📝 Lint-staged実行（フォーマッティング/リンティング）
3. 🧪 テスト実行（コード変更が検出された場合）
4. ✅ コミット進行

### 失敗したコミットフロー
- リンティング失敗時: コミットブロック、ファイルが自動修正される可能性
- テスト失敗時: コミットブロック、手動修正が必要
- フォーマッティング失敗時: コミットブロック、手動修正が必要

### テストスキップシナリオ
コード以外のファイルのみが変更された場合（例：ドキュメント、設定）、テストは「ℹ️ コード変更が検出されないため、テストをスキップします。」メッセージと共にスキップされます。

## 設定ファイル

### package.json
```json
{
  "lint-staged": {
    "frontend/src/**/*.{js,jsx,ts,tsx}": [
      "cd frontend && npm run lint:fix"
    ],
    "backend/**/*.go": [
      "cd backend && go fmt ./...",
      "cd backend && go vet ./..."
    ]
  }
}
```

### .husky/pre-commit
```bash
#!/usr/bin/env sh
echo "🔍 Running pre-commit checks..."

# リンティングとフォーマッティングのためのlint-staged実行
echo "📝 Running linting and formatting..."
npx lint-staged

# 変更されたファイルに基づく条件付きテスト
if git diff --cached --name-only | grep -E "(frontend/.*\.(ts|tsx|js|jsx)|backend/.*\.go)$" > /dev/null; then
  echo "🧪 Running tests..."
  
  # フロントエンドファイルが変更された場合のフロントエンドテスト
  if git diff --cached --name-only | grep "frontend/" > /dev/null; then
    echo "🔍 Running frontend tests..."
    npm run test:frontend
  fi
  
  # バックエンドファイルが変更された場合のバックエンドテスト
  if git diff --cached --name-only | grep "backend/" > /dev/null; then
    echo "🔍 Running backend tests..."
    npm run test:backend
  fi
else
  echo "ℹ️  No code changes detected, skipping tests."
fi

echo "✅ Pre-commit checks passed!"
```

## トラブルシューティング

### 一般的な問題

1. **テスト失敗**: コミット前に失敗したテストを修正してください
2. **リンティングエラー**: `npm run lint`を実行してすべての問題を確認してください。いくつかは自動修正される可能性があります
3. **Goフォーマッティング問題**: バックエンドディレクトリで`go fmt ./...`を実行してください
4. **Huskyがインストールされていない**: `npm run prepare`を実行してHuskyをセットアップしてください

### フックのバイパス（推奨しません）
```bash
# pre-commitフックをスキップ（緊急時のみ）
git commit --no-verify -m "commit message"
```

### フックの再インストール
```bash
# フックを削除して再インストール
rm -rf .husky
npm run prepare
```

## ベストプラクティス

1. **ローカルでテストを実行** - 問題を早期に発見するためにコミット前にテストを実行してください
2. **意味のあるコミットメッセージを使用** - 変更を説明するメッセージを書いてください
3. **フォーカスしたコミットを保つ** - 単一の機能や修正に集中してください
4. **フックをスキップしない** - 絶対に必要でない限りフックをスキップしないでください
5. **リンティング問題を修正** - バイパスするよりもリンティング問題を修正してください

## パフォーマンス考慮事項

- テストは変更されたファイルタイプ（フロントエンド/バックエンド）に対してのみ実行されます
- Lint-stagedはステージされたファイルのみを処理します
- 可能な場合は並列実行
- コード変更がない場合の早期終了

この設定は、インテリジェントな選択的テストとフォーマッティングを通じて開発者の生産性を維持しながら、高いコード品質を保証します。