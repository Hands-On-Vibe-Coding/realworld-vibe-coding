# Documentation Overview

**🌐 Language / 言語 / 언어** - [한국어](README.ko.md) | [日本語](README.jp.md) | **English**

This directory contains comprehensive documentation for the RealWorld Vibe Coding project. All documents are available in English, Korean, and Japanese.

## 📋 Available Documentation

### Project Planning & Requirements
- **[Pre-PRD](pre-prd.md)** | **[한국어](pre-prd.ko.md)** | **[日本語](pre-prd.jp.md)**
  - Initial project analysis and technology stack selection
  - Vibe Coding methodology application strategy
  - Performance and quality requirements
  - Success metrics and validation criteria

- **[PRD (Product Requirements Document)](prd.md)** | **[한국어](prd.ko.md)** | **[日本語](prd.jp.md)**
  - Detailed functional and technical requirements
  - Complete API design specifications
  - Database schema and frontend architecture
  - Development process and deployment strategy

- **[Implementation Plan](plan.md)** | **[한국어](plan.ko.md)** | **[日本語](plan.jp.md)**
  - 28 detailed tasks across 6 development phases
  - Sprint breakdown with dependencies
  - Milestone tracking and risk management
  - Success criteria and deliverables

### Development & Operations
- **[Deployment Guide](DEPLOYMENT.md)** | **[한국어](DEPLOYMENT.ko.md)** | **[日本語](DEPLOYMENT.jp.md)**
  - AWS ECS + Fargate backend deployment
  - GitHub Pages frontend deployment
  - CI/CD pipeline configuration
  - Infrastructure management with AWS CDK
  - Monitoring and troubleshooting

- **[Git Hooks Documentation](git-hooks.md)** | **[한국어](git-hooks.ko.md)** | **[日本語](git-hooks.jp.md)**
  - Pre-commit automation with Husky
  - Linting and testing workflows
  - Code quality enforcement
  - Performance optimization strategies

### Localized Documentation Index

#### Korean (한국어)
- [Pre-PRD 문서](pre-prd.ko.md) - 프로젝트 초기 분석 및 기술 스택 선택
- [PRD 문서](prd.ko.md) - 상세한 제품 요구사항 정의
- [구현 계획](plan.ko.md) - 6단계 28개 작업의 상세 계획
- [배포 가이드](DEPLOYMENT.ko.md) - AWS 및 GitHub Pages 배포 방법
- [Git 훅 문서](git-hooks.ko.md) - 자동화된 코드 품질 관리

#### Japanese (日本語)
- [Pre-PRD文書](pre-prd.jp.md) - プロジェクト初期分析と技術スタック選択
- [PRD文書](prd.jp.md) - 詳細なプロダクト要件定義
- [実装計画](plan.jp.md) - 6フェーズ28タスクの詳細計画
- [デプロイガイド](DEPLOYMENT.jp.md) - AWSとGitHub Pagesデプロイ方法
- [Gitフック文書](git-hooks.jp.md) - 自動化されたコード品質管理

## 🏗️ Project Architecture

### Technology Stack
- **Frontend**: React 19 + Vite + TypeScript + Tanstack Router + Zustand + Tailwind CSS
- **Backend**: Go 1.23+ + Standard net/http + Gorilla Mux + SQLite/PostgreSQL + JWT
- **Infrastructure**: AWS ECS + Fargate + RDS + GitHub Actions + AWS CDK
- **Development**: Docker + Husky + ESLint + Vitest + Go Testing

### Development Methodology
This project follows **Vibe Coding** methodology, emphasizing:
1. **Rapid Prototyping** - Core functionality implementation first
2. **Iterative Improvement** - Gradual feature enhancement
3. **Real-time Feedback** - Continuous testing during development
4. **Documentation** - Real-time documentation alongside code

## 📖 How to Use This Documentation

### For Developers
1. Start with **[Pre-PRD](pre-prd.md)** to understand project context and decisions
2. Review **[PRD](prd.md)** for detailed technical specifications
3. Follow **[Implementation Plan](plan.md)** for development workflow
4. Use **[Deployment Guide](DEPLOYMENT.md)** for infrastructure setup
5. Configure **[Git Hooks](git-hooks.md)** for code quality automation

### For Project Managers
1. **[Implementation Plan](plan.md)** provides sprint breakdown and milestones
2. **[PRD](prd.md)** contains success criteria and validation requirements
3. **[Pre-PRD](pre-prd.md)** explains technology decisions and risk management

### For DevOps Engineers
1. **[Deployment Guide](DEPLOYMENT.md)** covers complete infrastructure setup
2. **[Git Hooks](git-hooks.md)** explains CI/CD automation
3. **[PRD](prd.md)** Section 9 details deployment and monitoring strategy

## 🔄 Document Maintenance

All documentation is maintained in three languages to ensure accessibility for international developers:

- **English** - Primary documentation language
- **Korean (한국어)** - For Korean-speaking team members
- **Japanese (日本語)** - For Japanese-speaking contributors

When updating documentation, please ensure all language versions remain synchronized.

## 📞 Support

For questions about this documentation:
1. Check the relevant document in your preferred language
2. Review the troubleshooting sections in deployment and git-hooks documentation
3. Refer to the project's main README for additional resources

---

*This documentation follows the project's commitment to comprehensive, multilingual, and developer-friendly information architecture.*