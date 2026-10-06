---
title: "artifact-transformer 작업 일지 #5"
subtitle: "_project.json 패턴 이식과 유스케이스 식별자 정리"
pubDate: 2026-05-23T15:00:00+09:00
category: "devlog"
tags: ["JSON Schema", "PlantUML", "Use Case", "Identifier Policy", "Working Log"]
math: false
draft: false
---

> 이 글은 2026-05-21 하루 동안 `artifact-transformer` 패턴을 다른 프로젝트에 적용하면서 정리한 작업 기록이다.

## 배경

`artifact-transformer`로 산출물을 자동 생성하는 다른 프로젝트가 하나 더 생겼다. 요구사항 정의서·유스케이스 명세서·C4 아키텍처 다이어그램 등을 모아두는 저장소에서, `artifact-transformer`의 입력 JSON과 같은 모양을 따라 작업을 시작했다.

`artifact-transformer` 쪽에서 며칠 전 정리한 두 가지 결정이 있었다 ([#3], [#4]).

- 프로젝트/문서 역할자 같은 공통 메타데이터를 산출물별 JSON에서 분리해 `_project.json` 한 곳에 모아둔다.
- 요구사항/유스케이스 식별자는 `identifier_policy.category`의 nested 구조로 한 가지 방식만 쓴다.

이 패턴이 다른 프로젝트에서도 그대로 통하는지 확인할 시점이었다. 동시에 그쪽 유스케이스가 아직 다이어그램으로 정리되지 않아 식별자가 정해지지 않은 상태였다.

## 문제

신규 프로젝트의 `documents/`를 열어보니 다음이 보였다.

1. **메타데이터가 산출물별 JSON에 반복 박혀 있음** — `requirements.json` 안에 작성자/검토자/승인자, 프로젝트 코드, 시스템 코드가 들어 있고, 다음에 만들 `usecase.json`, `unit.json`에도 똑같이 넣어야 했다.
2. **`identifier_policy.requirement_type` 필드가 남아 있음** — 이전 스키마는 요구사항 종류별로 식별자 형식이 다를 수 있다는 가정으로 `requirement_type` 키를 두고 있었으나, 실제로 사용한 적이 없다.
3. **`category` 필드가 이슈 단위에 다시 박혀 있음** — `identifier_policy.category`에 분류 정의가 이미 있는데, 개별 요구사항 객체에도 `"category": "기능"` 같은 필드가 또 박혀 있었다. 중복 + 일관성 깨질 위험.
4. **유스케이스 다이어그램이 없음** — `models/usecase/`가 비어 있고, 식별자 정책만 글로 합의된 상태. 실제로 어떤 유스케이스가 살아남는지 그림으로 정리한 적이 없다.
5. **이전 식별자 중 어느 것을 재사용해도 되는지 불분명** — Jira에서 한 번 폐기한 유스케이스 식별자가 있는데, 새로 만든 유스케이스에 같은 번호를 다시 붙여도 되는지 명시가 없었다.

## 결정 1 — `_project.json`으로 메타데이터 분리

`artifact-transformer`의 [#4]에서 정리한 패턴을 그대로 적용했다. `requirements.json`에서 다음을 떼어내 `_project.json`으로 옮겼다.

```json
{
  "project": {
    "code": "...",
    "name_kr": "...",
    "system_code": "...",
    "system_name_kr": "...",
    "system_name_en": "..."
  },
  "document": {
    "writer":   { "name": "...", "affiliation": "...", "date": "" },
    "reviewer": { "name": "...", "affiliation": "...", "date": "" },
    "approver": { "name": "...", "affiliation": "...", "date": "" }
  }
}
```

산출물별 JSON에는 산출물 고유의 내용(요구사항 목록·유스케이스 시나리오·시험 절차 등)만 남기고, 표지·문서이력·역할자 같은 공통 메타데이터는 `_project.json`에서 머지한다. `artifact-transformer/common/parser_merge.py`가 이미 이 패턴을 처리한다.

추가로 `jira_base_url`도 `_project.json` 쪽으로 옮겼다. Jira 이슈 키 → URL 변환이 산출물 종류 무관하게 필요한데, 산출물 JSON마다 베이스 URL을 박아두면 환경 바뀔 때마다 19개 파일을 손대야 한다.

## 결정 2 — `identifier_policy.requirement_type` 제거

`identifier_policy`는 한 가지 형식만 쓰기로 정리했다. `requirement_type` 키는 "이 정책은 요구사항 종류별로 다를 수 있다"는 추상적 확장성을 위한 것이었으나, 어느 프로젝트에서도 한 번도 분기한 적이 없다. 미래의 가정을 위해 한 단계 깊이를 더한 셈이라 제거했다.

```diff
 "identifier_policy": {
-  "requirement_type": {
-    "functional": { "format": "...", "category": {...} },
-    "non_functional": { "format": "...", "category": {...} }
-  }
+  "format": "<SYSTEM>-<TYPE>-<CATEGORY1>-<CATEGORY2>-<번호>",
+  "category": {
+    "SFR": { "name": "기능 요구사항", "category2": { ... } }
+  }
 }
```

같은 맥락에서 개별 요구사항 객체에 박혀 있던 `"category": "기능"` 필드도 제거했다. 분류는 식별자(`<SYS>-FR-SFR-DAT-COL-001`의 `SFR`/`DAT`/`COL` 자리)에서 파싱할 수 있고, `identifier_policy`가 그 정의의 단일 출처다.

## 결정 3 — `references`를 `document` 하위로 이동

스키마 최상위에 `references`가 따로 떠 있었는데, 이건 "이 문서가 참고한 표준·법령" 메타데이터다. 산출물 본문(요구사항 목록)과 같은 레벨에 두는 게 어색해서 `document.references`로 내렸다.

이건 작은 정리지만 의미가 있다. 한 산출물 안에서 "이 문서에 대한 정보"와 "이 문서가 다루는 내용"이 같은 레벨에 섞여 있으면 머지 로직이 매번 헷갈린다.

## 결정 4 — 유스케이스 식별자 정책: 자동 동작·외부 책임 제외

`models/usecase/usecase_overview.puml`을 새로 만들었다. 그리면서 가장 신경 쓴 건 "어떤 동작이 유스케이스가 되는가"였다.

Jira 이슈에는 데이터 카테고리(DAT-001 ~ 011)에 번호가 매겨진 항목이 11개 있었는데, 그중 6개를 다이어그램에서 제외했다.

| 식별자 | 내용 | 제외 사유 |
| --- | --- | --- |
| DAT-001 | 보조 데이터 수집 | 시스템이 스케줄러로 자동 수행 — 액터 목표 아님 |
| DAT-002 | 수집 실패 재시도 | 시스템 내부 동작 |
| DAT-003 | 캐시 응답 | 시스템 내부 동작 |
| DAT-004 | 만료 데이터 자동 삭제 | 시스템 내부 동작 |
| DAT-005 | 데이터 버전 이력 관리 | 시스템 내부 동작 |
| DAT-006 | 데이터 자동 백업 | 시스템 내부 동작 |

유스케이스는 액터(사람 또는 외부 시스템)가 시스템을 통해 달성하려는 *목표*다. "백그라운드 작업"은 액터의 목표가 아니라 시스템의 내부 동작이라 SFR 본문에는 들어가지만 유스케이스 다이어그램에는 올리지 않는다.

같은 기준으로 공통 카테고리(COM-001~005)도 제외했다. 인증 토큰 발급·검증·갱신, API 호출 제한은 별도의 인증/인가 시스템이 책임진다. 본 시스템은 그 토큰을 *검증하는 쪽*이라 자체 유스케이스가 아니다.

## 결정 5 — 기능 분해된 유스케이스를 액터 목표로 통합

CRUD 단위로 분해된 유스케이스가 있었다.

- CON-001 (데이터 소스 등록)
- CON-002 (데이터 소스 목록 조회)
- CON-003 (데이터 소스 연결 정보 수정)
- CON-004 (데이터 소스 삭제)

이건 액터 관점이 아니라 시스템 기능 분해다. 관리자의 *목표*는 "데이터 소스 카탈로그를 운영하는 것"이지 "삭제 API를 호출하는 것"이 아니다. 네 개를 CON-006 (데이터 소스 카탈로그 관리) 하나로 흡수했다.

같은 식으로 MON-001~003(조회 3종)은 MON-004 (시스템 운영 현황 모니터링) 하나로, ALT-001~002(알림 설정 2종)는 ALT-003 (운영 이벤트 알림 정책 운영) 하나로 통합했다.

## 결정 6 — 폐기된 식별자는 재사용하지 않음

위의 11개 중 6개를 제외하고 5개를 다른 식별자에 흡수하면 빈 번호가 생긴다. CON-001~004, MON-001~003 같은 자리.

"빈 자리니까 새 유스케이스에 재할당하자"는 충동이 있었지만 명시적으로 막았다. 이유는 두 가지다.

- Jira에 같은 식별자로 등록된 과거 이슈·논의 이력이 살아 있다. 새 유스케이스가 같은 식별자를 쓰면 검색 결과가 섞인다.
- 식별자는 시간에 따른 단조 증가가 안전하다. 비워두면 "왜 빠졌는지" 한 번 적어두는 것만으로 충분하지만, 재할당하면 재할당된 자리에 대해서도 매번 "원래 이게 아니었음" 주석을 달아야 한다.

`usecase_overview.puml`의 끝에 deprecated 식별자 목록을 주석으로 남겼다. 다이어그램을 보는 사람이 "왜 DAT-001~006이 안 보이지"라고 묻기 전에 답이 보이도록.

```
' Deprecated identifiers (재사용 금지)
' [사유 1] 시스템이 자동으로 수행하는 동작 — 유스케이스 부적합
'   <SYS>-UC-SFR-DAT-001 ~ 006
' [사유 2] 외부 인증/인가 시스템 연동 — 본 시스템 책임 범위 밖
'   <SYS>-UC-SFR-COM-001 ~ 005
' [사유 3] 기능 분해 — 액터 목표로 통합
'   <SYS>-UC-SFR-CON-001 ~ 004 → CON-006 흡수
' [사유 4] 액터 관점·분류 재정의
'   <SYS>-UC-SFR-DAT-010 → DAT-011 (관심 데이터 변경 추적)로 재정의
```

## 함정

- **`_project.json` 분리 후 generator/parser 동기화** — 메타데이터를 떼고 나니 기존 산출물 일부에서 작성자 이름이 비어 채워졌다. `_project.json` 머지가 모든 산출물 경로에 들어가지 않았기 때문. `artifact-transformer/common/parser_merge.py`가 자동 머지를 처리하는 줄 알았는데, 신규 프로젝트의 산출물 일부는 그 경로를 타지 않고 직접 export되고 있었다. 임시로 `_project.json`을 산출물 JSON에 미리 머지해두는 사전 스크립트로 우회했다.
- **`requirement_type` 제거 후 마이그레이션** — `requirement_type.functional.category`로 접근하던 코드가 일부 있었는데, 제거하고 보니 `parse_rd.py`가 한 줄 경로 변경으로 깨졌다. 스키마를 평탄화할 때는 그 키를 참조하는 모든 곳을 동시에 봐야 한다는 걸 다시 확인했다.

## 마무리

`artifact-transformer`에서 정리한 `_project.json`/`identifier_policy` 패턴은 다른 프로젝트에서도 그대로 통했다. 다만 그 프로젝트 고유의 결정 — 유스케이스에서 자동 동작·외부 책임 기능을 제외하고, 폐기된 식별자를 재사용하지 않는다 — 는 도메인별로 따로 정해야 했다.

스키마 패턴은 옮겨오지만 식별자 운영 정책은 도메인이 알고 있는 일이다. `identifier_policy.category`의 *형식*은 재사용 가능하지만, *어떤 카테고리를 둘지·무엇을 식별자로 인정할지*는 매번 새 결정이다.

다음에 할 것:

- 유스케이스 명세서(usecase.json) 본문 작성 — 다이어그램에 남긴 9개에 대한 시나리오 채우기
- `_project.json` 머지를 빌드 파이프라인에 정식 연결 (현재는 사전 머지 스크립트로 우회 중)
- `usecase_overview.puml`을 CI로 png 렌더해서 README에 임베드

[#3]: /2026/05/21/artifact-transformer-3/
[#4]: /2026/05/22/artifact-transformer-4/
