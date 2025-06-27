# {TOOL_NAME} 평가 리포트

## 도구 개요
- **도구명**: {TOOL_NAME}
- **버전**: {VERSION}
- **평가 일시**: YYYY-MM-DD
- **평가자**: {EVALUATOR}
- **구현 브랜치**: {BRANCH_NAME}

## 종합 평가 점수

| 평가 항목 | 가중치 | 점수 (1-5) | 가중 점수 |
|-----------|--------|------------|-----------|
| 기능 완성도 | 40% | {SCORE} | {WEIGHTED_SCORE} |
| 개발 생산성 | 25% | {SCORE} | {WEIGHTED_SCORE} |
| 코드 품질 | 20% | {SCORE} | {WEIGHTED_SCORE} |
| 사용자 경험 | 10% | {SCORE} | {WEIGHTED_SCORE} |
| 배포 및 운영 | 5% | {SCORE} | {WEIGHTED_SCORE} |
| **총점** | **100%** | **{TOTAL_SCORE}** | **{FINAL_SCORE}** |

## 상세 평가

### 1. 기능 완성도 (40%) - {SCORE}/5점

#### RealWorld API 구현 현황
- **구현된 엔드포인트**: {COUNT}/22개 ({PERCENTAGE}%)
- **완전 구현**: {FULL_COUNT}개
- **부분 구현**: {PARTIAL_COUNT}개
- **미구현**: {NOT_IMPLEMENTED_COUNT}개

#### 세부 기능 체크리스트

**사용자 인증 시스템**
- [ ] 사용자 등록 (`POST /api/users`)
- [ ] 사용자 로그인 (`POST /api/users/login`)
- [ ] 현재 사용자 조회 (`GET /api/user`)
- [ ] 사용자 정보 수정 (`PUT /api/user`)

**게시글 관리**
- [ ] 게시글 목록 조회 (`GET /api/articles`)
- [ ] 게시글 피드 조회 (`GET /api/articles/feed`)
- [ ] 게시글 상세 조회 (`GET /api/articles/{slug}`)
- [ ] 게시글 생성 (`POST /api/articles`)
- [ ] 게시글 수정 (`PUT /api/articles/{slug}`)
- [ ] 게시글 삭제 (`DELETE /api/articles/{slug}`)
- [ ] 게시글 좋아요 (`POST /api/articles/{slug}/favorite`)
- [ ] 게시글 좋아요 취소 (`DELETE /api/articles/{slug}/favorite`)

**댓글 시스템**
- [ ] 댓글 목록 조회 (`GET /api/articles/{slug}/comments`)
- [ ] 댓글 생성 (`POST /api/articles/{slug}/comments`)
- [ ] 댓글 삭제 (`DELETE /api/articles/{slug}/comments/{id}`)

**프로필 및 팔로우**
- [ ] 프로필 조회 (`GET /api/profiles/{username}`)
- [ ] 사용자 팔로우 (`POST /api/profiles/{username}/follow`)
- [ ] 사용자 언팔로우 (`DELETE /api/profiles/{username}/follow`)

**태그 시스템**
- [ ] 태그 목록 조회 (`GET /api/tags`)

**프론트엔드 페이지**
- [ ] 홈 페이지 (게시글 목록)
- [ ] 로그인 페이지
- [ ] 회원가입 페이지
- [ ] 게시글 상세 페이지
- [ ] 게시글 작성/수정 페이지
- [ ] 프로필 페이지
- [ ] 설정 페이지
- [ ] 404 페이지

#### 품질 평가
- **기능 정확성**: RealWorld 스펙 준수 정도
- **UI/UX 완성도**: 디자인 및 사용성
- **모바일 지원**: 반응형 디자인 구현
- **접근성**: WCAG 가이드라인 준수

### 2. 개발 생산성 (25%) - {SCORE}/5점

#### 시간 효율성
- **총 개발 시간**: {TOTAL_HOURS}시간
- **시간당 기능 구현**: {FEATURES_PER_HOUR}개
- **기준 대비 속도**: {SPEED_RATIO}배 ({FASTER/SLOWER})

#### 개발 과정 분석
- **환경 설정 시간**: {SETUP_TIME}시간 ({SETUP_PERCENTAGE}%)
- **순수 개발 시간**: {DEV_TIME}시간 ({DEV_PERCENTAGE}%)
- **디버깅 시간**: {DEBUG_TIME}시간 ({DEBUG_PERCENTAGE}%)
- **테스트 작성 시간**: {TEST_TIME}시간 ({TEST_PERCENTAGE}%)

#### 생산성 지표
- **코드 생성 속도**: {CODE_SPEED} 라인/시간
- **에러 해결 속도**: 평균 {ERROR_RESOLUTION_TIME}분
- **리팩토링 빈도**: {REFACTOR_COUNT}회

### 3. 코드 품질 (20%) - {SCORE}/5점

#### 코드 메트릭
- **총 코드 라인 수**: {TOTAL_LINES}줄
- **소스 코드**: {SOURCE_LINES}줄
- **테스트 코드**: {TEST_LINES}줄
- **테스트 커버리지**: {COVERAGE}%

#### 아키텍처 품질
- **모듈화 수준**: {MODULARITY_SCORE}/5
- **코드 재사용성**: {REUSABILITY_SCORE}/5
- **일관성**: {CONSISTENCY_SCORE}/5
- **문서화**: {DOCUMENTATION_SCORE}/5

#### 정적 분석 결과
- **복잡도 평균**: {COMPLEXITY}
- **중복 코드 비율**: {DUPLICATION}%
- **보안 이슈**: {SECURITY_ISSUES}개
- **성능 이슈**: {PERFORMANCE_ISSUES}개

### 4. 사용자 경험 (10%) - {SCORE}/5점

#### 도구 사용성
- **학습 곡선**: {LEARNING_CURVE}/5 (5=쉬움)
- **자동완성 품질**: {AUTOCOMPLETE}/5
- **코드 생성 품질**: {CODE_GEN_QUALITY}/5
- **오류 감지 및 수정**: {ERROR_DETECTION}/5

#### 개발 경험
- **IDE 통합도**: {IDE_INTEGRATION}/5
- **디버깅 편의성**: {DEBUGGING}/5
- **문서화 지원**: {DOCS_SUPPORT}/5
- **커뮤니티 지원**: {COMMUNITY}/5

### 5. 배포 및 운영 (5%) - {SCORE}/5점

#### 배포 성공률
- **빌드 성공률**: {BUILD_SUCCESS}% ({SUCCESS_COUNT}/{TOTAL_COUNT})
- **배포 성공률**: {DEPLOY_SUCCESS}% ({DEPLOY_SUCCESS_COUNT}/{DEPLOY_TOTAL_COUNT})
- **평균 배포 시간**: {DEPLOY_TIME}분

#### 운영 품질
- **런타임 안정성**: {RUNTIME_STABILITY}/5
- **성능**: {PERFORMANCE}/5
- **모니터링**: {MONITORING}/5

## 비교 분석

### 기준선 대비 비교 (Claude Sonnet 4)

| 지표 | Claude Sonnet 4 | {TOOL_NAME} | 차이 |
|------|-----------------|-------------|------|
| 총 개발 시간 | {BASELINE_TIME}시간 | {CURRENT_TIME}시간 | {DIFF_TIME} |
| 기능 완성도 | {BASELINE_FEATURES}% | {CURRENT_FEATURES}% | {DIFF_FEATURES}% |
| 테스트 커버리지 | {BASELINE_COVERAGE}% | {CURRENT_COVERAGE}% | {DIFF_COVERAGE}% |
| 코드 품질 점수 | {BASELINE_QUALITY}/5 | {CURRENT_QUALITY}/5 | {DIFF_QUALITY} |

### 상대적 강점
1. **{STRENGTH_1}**
   - 설명: {STRENGTH_1_DESC}
   - 영향도: {HIGH/MEDIUM/LOW}

2. **{STRENGTH_2}**
   - 설명: {STRENGTH_2_DESC}
   - 영향도: {HIGH/MEDIUM/LOW}

3. **{STRENGTH_3}**
   - 설명: {STRENGTH_3_DESC}
   - 영향도: {HIGH/MEDIUM/LOW}

### 상대적 약점
1. **{WEAKNESS_1}**
   - 설명: {WEAKNESS_1_DESC}
   - 영향도: {HIGH/MEDIUM/LOW}
   - 개선 방안: {IMPROVEMENT_1}

2. **{WEAKNESS_2}**
   - 설명: {WEAKNESS_2_DESC}
   - 영향도: {HIGH/MEDIUM/LOW}
   - 개선 방안: {IMPROVEMENT_2}

## 권장사항

### 적합한 사용 사례
1. **{USE_CASE_1}**
   - 이유: {REASON_1}
   - 조건: {CONDITION_1}

2. **{USE_CASE_2}**
   - 이유: {REASON_2}
   - 조건: {CONDITION_2}

### 부적합한 사용 사례
1. **{NOT_SUITABLE_1}**
   - 이유: {REASON_1}

2. **{NOT_SUITABLE_2}**
   - 이유: {REASON_2}

### 최적화 제안
1. **{OPTIMIZATION_1}**
   - 현재 문제: {CURRENT_ISSUE_1}
   - 개선 방안: {SOLUTION_1}

2. **{OPTIMIZATION_2}**
   - 현재 문제: {CURRENT_ISSUE_2}
   - 개선 방안: {SOLUTION_2}

## 결론

### 종합 평가
{TOOL_NAME}는 {OVERALL_ASSESSMENT}한 도구로 평가됩니다. 특히 {MAIN_STRENGTH} 측면에서 뛰어난 성능을 보였으나, {MAIN_WEAKNESS} 부분에서는 개선이 필요합니다.

### 추천 여부
- **전반적 추천**: {YES/NO/CONDITIONAL}
- **추천 이유**: {RECOMMENDATION_REASON}
- **조건부 추천 사항**: {CONDITIONAL_REQUIREMENTS}

### 향후 개선 기대
- **단기 개선 포인트**: {SHORT_TERM_IMPROVEMENTS}
- **장기 발전 가능성**: {LONG_TERM_POTENTIAL}

---

*이 평가는 RealWorld 애플리케이션 구현을 통한 실증적 분석을 바탕으로 작성되었으며, 실제 사용 환경과 요구사항에 따라 결과가 달라질 수 있습니다.*