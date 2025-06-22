# 문서 개요

**🌐 Language / 言語 / 언어** - **한국어** | [日本語](README.jp.md) | [English](README.md)

이 디렉터리는 RealWorld 바이브 코딩 프로젝트의 포괄적인 문서를 포함합니다. 모든 문서는 영어, 한국어, 일본어로 제공됩니다.

## 📋 사용 가능한 문서

### 프로젝트 계획 및 요구사항
- **[Pre-PRD](pre-prd.ko.md)** | **[English](pre-prd.md)** | **[日本語](pre-prd.jp.md)**
  - 초기 프로젝트 분석 및 기술 스택 선택
  - 바이브 코딩 방법론 적용 전략
  - 성능 및 품질 요구사항
  - 성공 지표 및 검증 기준

- **[PRD (제품 요구사항 문서)](prd.ko.md)** | **[English](prd.md)** | **[日本語](prd.jp.md)**
  - 상세한 기능 및 기술 요구사항
  - 완전한 API 설계 사양
  - 데이터베이스 스키마 및 프론트엔드 아키텍처
  - 개발 프로세스 및 배포 전략

- **[구현 계획](plan.ko.md)** | **[English](plan.md)** | **[日本語](plan.jp.md)**
  - 6개 개발 단계에 걸친 28개의 상세 작업
  - 의존성을 포함한 스프린트 분해
  - 마일스톤 추적 및 위험 관리
  - 성공 기준 및 결과물

### 개발 및 운영
- **[배포 가이드](DEPLOYMENT.ko.md)** | **[English](DEPLOYMENT.md)** | **[日本語](DEPLOYMENT.jp.md)**
  - AWS ECS + Fargate 백엔드 배포
  - GitHub Pages 프론트엔드 배포
  - CI/CD 파이프라인 구성
  - AWS CDK를 사용한 인프라 관리
  - 모니터링 및 문제 해결

- **[Git 훅 문서](git-hooks.ko.md)** | **[English](git-hooks.md)** | **[日本語](git-hooks.jp.md)**
  - Husky를 사용한 Pre-commit 자동화
  - 린팅 및 테스트 워크플로우
  - 코드 품질 강제
  - 성능 최적화 전략

### 다국어 문서 색인

#### 한국어
- [Pre-PRD 문서](pre-prd.ko.md) - 프로젝트 초기 분석 및 기술 스택 선택
- [PRD 문서](prd.ko.md) - 상세한 제품 요구사항 정의
- [구현 계획](plan.ko.md) - 6단계 28개 작업의 상세 계획
- [배포 가이드](DEPLOYMENT.ko.md) - AWS 및 GitHub Pages 배포 방법
- [Git 훅 문서](git-hooks.ko.md) - 자동화된 코드 품질 관리

#### 일본어 (日本語)
- [Pre-PRD文書](pre-prd.jp.md) - プロジェクト初期分析と技術スタック選択
- [PRD文書](prd.jp.md) - 詳細なプロダクト要件定義
- [実装計画](plan.jp.md) - 6フェーズ28タスクの詳細計画
- [デプロイガイド](DEPLOYMENT.jp.md) - AWSとGitHub Pagesデプロイ方法
- [Gitフック文書](git-hooks.jp.md) - 自動化されたコード品質管理

#### 영어 (English)
- [Pre-PRD Document](pre-prd.md) - Initial project analysis and technology stack selection
- [PRD Document](prd.md) - Detailed product requirements definition
- [Implementation Plan](plan.md) - Detailed plan of 28 tasks across 6 phases
- [Deployment Guide](DEPLOYMENT.md) - AWS and GitHub Pages deployment methods
- [Git Hooks Documentation](git-hooks.md) - Automated code quality management

## 🏗️ 프로젝트 아키텍처

### 기술 스택
- **프론트엔드**: React 19 + Vite + TypeScript + Tanstack Router + Zustand + Tailwind CSS
- **백엔드**: Go 1.23+ + Standard net/http + Gorilla Mux + SQLite/PostgreSQL + JWT
- **인프라**: AWS ECS + Fargate + RDS + GitHub Actions + AWS CDK
- **개발**: Docker + Husky + ESLint + Vitest + Go Testing

### 개발 방법론
이 프로젝트는 **바이브 코딩** 방법론을 따르며, 다음을 강조합니다:
1. **빠른 프로토타이핑** - 핵심 기능 우선 구현
2. **반복적 개선** - 점진적 기능 향상
3. **실시간 피드백** - 개발 중 지속적 테스트
4. **문서화** - 코드와 함께 실시간 문서화

## 📖 이 문서 사용 방법

### 개발자용
1. **[Pre-PRD](pre-prd.ko.md)**로 시작하여 프로젝트 맥락과 결정사항 이해
2. **[PRD](prd.ko.md)**에서 상세한 기술 사양 검토
3. **[구현 계획](plan.ko.md)**을 따라 개발 워크플로우 진행
4. **[배포 가이드](DEPLOYMENT.ko.md)**를 사용하여 인프라 설정
5. **[Git 훅](git-hooks.ko.md)**을 구성하여 코드 품질 자동화

### 프로젝트 매니저용
1. **[구현 계획](plan.ko.md)**에서 스프린트 분해 및 마일스톤 제공
2. **[PRD](prd.ko.md)**에서 성공 기준 및 검증 요구사항 포함
3. **[Pre-PRD](pre-prd.ko.md)**에서 기술 결정 및 위험 관리 설명

### DevOps 엔지니어용
1. **[배포 가이드](DEPLOYMENT.ko.md)**에서 완전한 인프라 설정 다루기
2. **[Git 훅](git-hooks.ko.md)**에서 CI/CD 자동화 설명
3. **[PRD](prd.ko.md)** 9장에서 배포 및 모니터링 전략 상세화

## 🔄 문서 유지보수

모든 문서는 국제 개발자의 접근성을 보장하기 위해 세 가지 언어로 유지됩니다:

- **영어** - 주요 문서 언어
- **한국어** - 한국어 사용 팀원용
- **일본어** - 일본어 사용 기여자용

문서를 업데이트할 때는 모든 언어 버전이 동기화된 상태로 유지되도록 해주세요.

## 📞 지원

이 문서에 대한 질문이 있으시면:
1. 선호하는 언어의 관련 문서를 확인하세요
2. 배포 및 git-hooks 문서의 문제 해결 섹션을 검토하세요
3. 추가 리소스는 프로젝트의 메인 README를 참조하세요

---

*이 문서는 포괄적이고 다국어적이며 개발자 친화적인 정보 아키텍처에 대한 프로젝트의 약속을 따릅니다.*