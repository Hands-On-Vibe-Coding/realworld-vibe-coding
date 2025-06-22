# ドキュメント概要

**🌐 Language / 言語 / 언어** - [한국어](README.ko.md) | **日本語** | [English](README.md)

このディレクトリは、RealWorldバイブコーディングプロジェクトの包括的なドキュメントを含んでいます。すべてのドキュメントは英語、韓国語、日本語で提供されています。

## 📋 利用可能なドキュメント

### プロジェクト計画と要件
- **[Pre-PRD](pre-prd.jp.md)** | **[한국어](pre-prd.ko.md)** | **[English](pre-prd.md)**
  - 初期プロジェクト分析と技術スタック選択
  - バイブコーディング方法論適用戦略
  - パフォーマンスと品質要件
  - 成功指標と検証基準

- **[PRD（プロダクト要件定義書）](prd.jp.md)** | **[한국어](prd.ko.md)** | **[English](prd.md)**
  - 詳細な機能および技術要件
  - 完全なAPI設計仕様
  - データベーススキーマとフロントエンドアーキテクチャ
  - 開発プロセスとデプロイ戦略

- **[実装計画](plan.jp.md)** | **[한국어](plan.ko.md)** | **[English](plan.md)**
  - 6つの開発フェーズにわたる28の詳細タスク
  - 依存関係を含むスプリント分解
  - マイルストーン追跡とリスク管理
  - 成功基準と成果物

### 開発と運用
- **[デプロイガイド](DEPLOYMENT.jp.md)** | **[한국어](DEPLOYMENT.ko.md)** | **[English](DEPLOYMENT.md)**
  - AWS ECS + Fargateバックエンドデプロイ
  - GitHub Pagesフロントエンドデプロイ
  - CI/CDパイプライン構成
  - AWS CDKを使用したインフラ管理
  - 監視とトラブルシューティング

- **[Gitフックドキュメント](git-hooks.jp.md)** | **[한국어](git-hooks.ko.md)** | **[English](git-hooks.md)**
  - Huskyを使用したPre-commit自動化
  - リンティングとテストワークフロー
  - コード品質強制
  - パフォーマンス最適化戦略

### 多言語ドキュメントインデックス

#### 日本語
- [Pre-PRD文書](pre-prd.jp.md) - プロジェクト初期分析と技術スタック選択
- [PRD文書](prd.jp.md) - 詳細なプロダクト要件定義
- [実装計画](plan.jp.md) - 6フェーズ28タスクの詳細計画
- [デプロイガイド](DEPLOYMENT.jp.md) - AWSとGitHub Pagesデプロイ方法
- [Gitフック文書](git-hooks.jp.md) - 自動化されたコード品質管理

#### 韓国語（한국어）
- [Pre-PRD 문서](pre-prd.ko.md) - 프로젝트 초기 분석 및 기술 스택 선택
- [PRD 문서](prd.ko.md) - 상세한 제품 요구사항 정의
- [구현 계획](plan.ko.md) - 6단계 28개 작업의 상세 계획
- [배포 가이드](DEPLOYMENT.ko.md) - AWS 및 GitHub Pages 배포 방법
- [Git 훅 문서](git-hooks.ko.md) - 자동화된 코드 품질 관리

#### 英語（English）
- [Pre-PRD Document](pre-prd.md) - Initial project analysis and technology stack selection
- [PRD Document](prd.md) - Detailed product requirements definition
- [Implementation Plan](plan.md) - Detailed plan of 28 tasks across 6 phases
- [Deployment Guide](DEPLOYMENT.md) - AWS and GitHub Pages deployment methods
- [Git Hooks Documentation](git-hooks.md) - Automated code quality management

## 🏗️ プロジェクトアーキテクチャ

### 技術スタック
- **フロントエンド**: React 19 + Vite + TypeScript + Tanstack Router + Zustand + Tailwind CSS
- **バックエンド**: Go 1.23+ + Standard net/http + Gorilla Mux + SQLite/PostgreSQL + JWT
- **インフラ**: AWS ECS + Fargate + RDS + GitHub Actions + AWS CDK
- **開発**: Docker + Husky + ESLint + Vitest + Go Testing

### 開発方法論
このプロジェクトは**バイブコーディング**方法論に従い、以下を重視します：
1. **高速プロトタイピング** - コア機能優先実装
2. **反復的改善** - 段階的機能向上
3. **リアルタイムフィードバック** - 開発中の継続的テスト
4. **文書化** - コードと並行したリアルタイム文書化

## 📖 このドキュメントの使用方法

### 開発者向け
1. **[Pre-PRD](pre-prd.jp.md)**から開始してプロジェクトの文脈と決定事項を理解
2. **[PRD](prd.jp.md)**で詳細な技術仕様をレビュー
3. **[実装計画](plan.jp.md)**に従って開発ワークフローを進行
4. **[デプロイガイド](DEPLOYMENT.jp.md)**を使用してインフラセットアップ
5. **[Gitフック](git-hooks.jp.md)**を設定してコード品質自動化

### プロジェクトマネージャー向け
1. **[実装計画](plan.jp.md)**でスプリント分解とマイルストーンを提供
2. **[PRD](prd.jp.md)**で成功基準と検証要件を含む
3. **[Pre-PRD](pre-prd.jp.md)**で技術決定とリスク管理を説明

### DevOpsエンジニア向け
1. **[デプロイガイド](DEPLOYMENT.jp.md)**で完全なインフラセットアップをカバー
2. **[Gitフック](git-hooks.jp.md)**でCI/CD自動化を説明
3. **[PRD](prd.jp.md)**セクション9でデプロイと監視戦略を詳細化

## 🔄 ドキュメントメンテナンス

すべてのドキュメントは国際的な開発者のアクセシビリティを確保するために3つの言語で維持されています：

- **英語** - 主要ドキュメント言語
- **韓国語（한국어）** - 韓国語話者チームメンバー用
- **日本語** - 日本語話者コントリビューター用

ドキュメントを更新する際は、すべての言語バージョンが同期された状態を保つようにしてください。

## 📞 サポート

このドキュメントに関する質問については：
1. お好みの言語の関連ドキュメントを確認してください
2. デプロイとgit-hooksドキュメントのトラブルシューティングセクションをレビューしてください
3. 追加リソースについてはプロジェクトのメインREADMEを参照してください

---

*このドキュメントは、包括的で多言語的、そして開発者フレンドリーな情報アーキテクチャに対するプロジェクトのコミットメントに従います。*