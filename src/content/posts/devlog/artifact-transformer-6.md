---
title: "artifact-transformer 작업 일지 #6"
subtitle: "산출물 4종 추가와 신규 프로젝트로의 패턴 이식"
pubDate: 2026-05-21T18:00:00+09:00
category: "devlog"
tags: ["Python", "JSON Schema", "PlantUML", "Use Case", "Identifier Policy", "Document Generator", "Working Log"]
math: false
draft: false
---

> 이 글은 2026-05-21 하루 동안 `artifact-transformer`의 산출물 파이프라인을 확장하고, 그동안 정리한 패턴을 신규 프로젝트의 문서 저장소에 이식한 작업 기록이다.

## 배경

`artifact-transformer`는 Jira 이슈와 PlantUML 다이어그램을 입력으로 받아 요구사항 정의서, 유스케이스 명세서, 단위·통합·운영 시험서 등을 docx/xlsx로 자동 생성하는 도구다 ([#4] 참조).

오늘의 작업은 두 갈래였다.

첫째, **도구 자체 확장**. 지금까지 채워져 있던 산출물은 분석(AN) 단계의 요구사항 정의서와 유스케이스 명세서, 시험(TE) 단계의 일부였다. 산출물 코드 체계상 다음 자리들이 비어 있었다.

- AN23-1, AN23-2 — 기능 정의서, 기능 명세서
- AN31 — 시나리오 명세서
- DE12-1 — 시퀀스 정의서
- TE 운영 시험 데이터

산출물 한 종을 추가하려면 양식 파일(docx/xlsx), 입력 JSON 스키마, generator/parser, 공통 모듈 등록까지 한 묶음이 필요하다. 이 묶음 4종을 한 번에 정리했다.

둘째, **신규 프로젝트로의 패턴 이식**. `artifact-transformer`로 산출물을 자동 생성하는 프로젝트가 하나 더 늘었다. 며칠 전 정리한 두 가지 결정([#3], [#4])이 도메인이 다른 프로젝트에서도 그대로 통하는지 확인하면서, 그쪽의 유스케이스 식별자 운영 정책까지 정리했다.

- 프로젝트/문서 역할자 같은 공통 메타데이터를 산출물별 JSON에서 분리해 `_project.json` 한 곳에 모아둔다.
- 요구사항/유스케이스 식별자는 `identifier_policy.category`의 nested 구조로 한 가지 방식만 쓴다.

## 문제

작업을 시작하기 전에 보인 것들.

1. **참여자 카탈로그가 흩어져 있음** — 컴포넌트 다이어그램에서 추출한 `components.schema.json`은 컴포넌트만 들어 있고, 액터·외부 시스템은 산출물 JSON에 매번 따로 박혀 있었다. 시퀀스 다이어그램은 액터·시스템·컴포넌트가 한 줄에 같이 등장하는데, 카탈로그가 갈라져 있으면 참조 해결을 어디서 할지 매번 다시 정해야 한다.
2. **시퀀스 데이터 생성과 렌더링이 한 스크립트에 묶여 있을 위험** — 유스케이스에서 시퀀스 메시지를 자동 도출하는 작업과, 시퀀스 JSON을 엑셀로 렌더하는 작업을 한 번에 처리하면, LLM이 채운 narrative 필드가 다음 빌드에서 덮어쓰여 사라진다.
3. **`function` 스키마의 `package`가 의미적으로 패키지가 아님** — `usecase.schema.json`의 `packages[]`는 진짜 SW 패키지(모듈 단위)인데, 새로 만들 `function.schema.json`에서 `package`라고 부르려던 것은 사실 기능 분류 영역(area)이었다. 같은 단어가 다른 의미.
4. **유스케이스 다이어그램 파서가 패키지 메타를 잃어버림** — `parse_ucdg.py`가 `package "이름" as ID`에서 ID는 캡처했지만 "이름"·설명은 무시했다. 그 결과 generator가 패키지별 헤더를 만들지 못하고, 카드별로 같은 패키지 헤더가 반복돼 출력됐다.
5. **메타데이터가 산출물별 JSON에 반복 박혀 있음** — 신규 프로젝트의 `requirements.json` 안에 작성자/검토자/승인자, 프로젝트 코드, 시스템 코드가 들어 있고, 다음에 만들 `usecase.json`, `unit.json`에도 똑같이 넣어야 했다.
6. **`identifier_policy.requirement_type` 필드가 남아 있음** — 이전 스키마는 요구사항 종류별로 식별자 형식이 다를 수 있다는 가정으로 `requirement_type` 키를 두고 있었으나, 실제로 사용한 적이 없다.
7. **`category` 필드가 이슈 단위에 다시 박혀 있음** — `identifier_policy.category`에 분류 정의가 이미 있는데, 개별 요구사항 객체에도 `"category": "기능"` 같은 필드가 또 박혀 있었다. 중복 + 일관성 깨질 위험.
8. **유스케이스 다이어그램이 없음** — 신규 프로젝트의 `models/usecase/`가 비어 있고, 식별자 정책만 글로 합의된 상태. 실제로 어떤 유스케이스가 살아남는지 그림으로 정리한 적이 없다.
9. **이전 식별자 중 어느 것을 재사용해도 되는지 불분명** — Jira에 한 번 폐기한 유스케이스 식별자가 남아 있는데, 새로 만든 유스케이스에 같은 번호를 다시 붙여도 되는지 명시가 없었다.

## 결정 1 — `components` 폐기, 다중 컬렉션 `participants`로 통합

`components.schema.json`을 지우고 `participants.schema.json` 하나로 합쳤다. 카탈로그는 네 개의 컬렉션을 한 곳에 둔다.

```json
{
  "actors": [
    { "id": "ADMIN", "name": "관리자" }
  ],
  "systems": [
    { "id": "WAS", "name": "WAS", "stereotype": "container" }
  ],
  "components": [
    { "id": "COL", "name": "Collector", "tag": "backendContainer" }
  ],
  "external_systems": [
    { "id": "CLIENT", "name": "Client" }
  ]
}
```

시퀀스/유스케이스 양쪽에서 참여자를 참조할 때는 `{id, type}`만 적고, 이름은 카탈로그에서 lookup 한다.

```json
{ "from": { "id": "ADMIN", "type": "actor" },
  "to":   { "id": "COL",   "type": "component" },
  "kind": "sync" }
```

기존에 일부 산출물이 쓰던 `external_systems`라는 키를 한 번에 `systems`로 바꿀 수는 없어서, 로더에 legacy fallback을 잠깐 두기로 했다. 단순 fallback이지만 명시적으로 "임시"라는 주석을 박았다. 평탄화 마이그레이션 끝나면 한 번에 지운다.

## 결정 2 — 시퀀스 파이프라인을 `sq`/`sqd` 두 단계로 분리

시퀀스 생성을 두 스크립트로 나눴다.

| 단계 | 스크립트 | 입력 → 출력 | 책임 |
| --- | --- | --- | --- |
| 데이터 | `generate_sq.py` | `usecase.json` → `sequence.json` | 룰 기반으로 메시지 골격만 만들고 narrative는 비워둠 |
| 렌더 | `generate_sqd.py` | `sequence.json` → `*.xlsx` | 채워진 JSON을 양식에 부어 시퀀스 정의서로 출력 |

분리한 이유는 단 하나, "LLM이 narrative를 보강한 뒤 시각화만 다시 돌리는 경로"를 보장하기 위해서다. 한 스크립트에 묶어두면 매 빌드마다 데이터 재생성이 일어나면서 채운 narrative가 덮어쓰여 사라진다.

`generate_sq.py`는 동일 `scenario_id`/`related_uc`가 이미 존재하면 머지하되, 채워진 필드는 보존하는 부분 머지 정책을 쓴다. 새 시퀀스가 생기는 경우에만 `revision`을 `1.0 / 최초 작성`으로 초기화한다.

같은 패턴을 시나리오(`generate_sc.py`)에도 적용했다. 유스케이스 → 시나리오 룰 변환에서, 사용자가 이미 채운 `main_flow`나 `purpose`는 머지 시 덮어쓰지 않는다.

## 결정 3 — `function` 스키마의 `package`를 `area`로 rename

`function.schema.json`에서 분류 단위로 쓰려던 `package`/`packages[]`를 모두 `area`/`areas[]`로 바꿨다. `usecase.schema.json`의 `packages[]`(SW 모듈 단위)와 의미 충돌을 피하기 위해서다.

```diff
- "package": "DAT",
- "package_name": "데이터 영역"
+ "area": "DAT",
+ "area_name": "데이터 영역"
```

cascading 변경: `function.sample.json`, `generate_fd.py`, `generate_fs.py`, `_fill_packages_table` → `_fill_areas_table`, 양식 docx의 컬럼명까지 한 묶음으로 같이 바꿨다.

같은 단어를 다른 의미로 쓰는 게 가장 위험하다. 한국어 산출물에서는 둘 다 "영역"으로 번역되는 경향이 있어 산출물만 보면 차이가 안 보이지만, JSON 키가 같으면 머지 로직이 잘못된 자리를 합칠 수 있다.

## 결정 4 — 패키지별 헤더 + 카드 그룹으로 유스케이스 출력 재구성

`parse_ucdg.py`의 `RE_PACKAGE_OPEN`을 확장해 `package "이름" as ID` 형태에서 이름까지 캡처하도록 했다. 반환 시그니처는 `(usecases, actors)` → `(usecases, actors, packages)`로 늘렸다.

`generate_ucs.py`는 그에 맞춰 카드 출력 구조를 두 단계로 쪼갰다.

- `_make_package_heading(package)` — 패키지마다 한 번, 스타일 1 헤더와 빈 단락
- `_make_uc_table(usecase)` — 같은 패키지의 유스케이스를 그 아래에 카드로 채움

이전 구조는 카드마다 헤더를 함께 만들었기 때문에 같은 패키지명이 N번 반복됐다. 패키지가 5개, 유스케이스가 18개면 같은 헤더가 18번 출력되는 식이었다.

`_group_usecases_by_package(usecases, packages)`로 그룹핑을 한 함수에 모으고, 패키지 순서는 다이어그램에 등장한 순서(`OrderedDict`)를 따른다. 패키지가 없는 유스케이스는 마지막에 "분류 없음"으로 묶었다.

## 결정 5 — `_project.json`으로 메타데이터 분리

여기서부터는 신규 프로젝트 쪽 작업이다. `artifact-transformer`의 [#4]에서 정리한 패턴을 그대로 적용했다. `requirements.json`에서 다음을 떼어내 `_project.json`으로 옮겼다.

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

추가로 `jira_base_url`도 `_project.json` 쪽으로 옮겼다. Jira 이슈 키 → URL 변환이 산출물 종류 무관하게 필요한데, 산출물 JSON마다 베이스 URL을 박아두면 환경이 바뀔 때마다 19개 파일을 손대야 한다.

## 결정 6 — `identifier_policy.requirement_type` 제거

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

## 결정 7 — `references`를 `document` 하위로 이동

스키마 최상위에 `references`가 따로 떠 있었는데, 이건 "이 문서가 참고한 표준·법령" 메타데이터다. 산출물 본문(요구사항 목록)과 같은 레벨에 두는 게 어색해서 `document.references`로 내렸다.

이건 작은 정리지만 의미가 있다. 한 산출물 안에서 "이 문서에 대한 정보"와 "이 문서가 다루는 내용"이 같은 레벨에 섞여 있으면 머지 로직이 매번 헷갈린다.

## 결정 8 — 유스케이스 식별자 정책: 자동 동작·외부 책임 제외

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

같은 기준으로 공통 카테고리(COM-001 ~ 005)도 제외했다. 인증 토큰 발급·검증·갱신, API 호출 제한은 별도의 외부 인증/인가 시스템이 책임진다. 본 시스템은 그 토큰을 *검증하는 쪽*이라 자체 유스케이스가 아니다.

## 결정 9 — 기능 분해된 유스케이스를 액터 목표로 통합

CRUD 단위로 분해된 유스케이스가 있었다.

- CON-001 (데이터 소스 등록)
- CON-002 (데이터 소스 목록 조회)
- CON-003 (데이터 소스 연결 정보 수정)
- CON-004 (데이터 소스 삭제)

이건 액터 관점이 아니라 시스템 기능 분해다. 관리자의 *목표*는 "데이터 소스 카탈로그를 운영하는 것"이지 "삭제 API를 호출하는 것"이 아니다. 네 개를 CON-006 (데이터 소스 카탈로그 관리) 하나로 흡수했다.

같은 식으로 MON-001~003(조회 3종)은 MON-004 (시스템 운영 현황 모니터링) 하나로, ALT-001~002(알림 설정 2종)는 ALT-003 (운영 이벤트 알림 정책 운영) 하나로 통합했다.

## 결정 10 — 폐기된 식별자는 재사용하지 않음

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

- **양식 docx의 다중 run 텍스트 치환** — `[양식] AN23-2. 기능 명세서.docx`를 요구사항 명세서 양식의 복사본에서 시작했더니, 한국어 "요구사항" 단어가 본문 여러 위치에 박혀 있었다. docx 내부에서 한글 텍스트는 `w:t` run이 음절·서체 단위로 쪼개져 있어 단순 문자열 치환으로는 안 잡힌다. 다중 run에 걸친 텍스트를 패턴 매칭으로 찾아 일괄 치환하는 작은 스크립트를 따로 만들어야 했다.
- **xlsx 양식의 컬럼 수 확장** — 기능 정의서 양식을 요구사항 정의서(5컬럼)에서 출발해 12컬럼으로 늘리려고 했더니 `sharedStrings.xml`만 고치는 것으로는 안 됐다. `sheet3.xml`의 `dimension`, `cols`, `styles` 참조도 같이 갱신해야 했다. xlsx 양식 수정은 가능하면 LibreOffice/Excel에서 직접 편집한 뒤 export 받는 쪽이 낫다는 걸 다시 확인했다.
- **`_project.json` 분리 후 generator/parser 동기화** — 메타데이터를 떼고 나니 기존 산출물 일부에서 작성자 이름이 비어 채워졌다. `_project.json` 머지가 모든 산출물 경로에 들어가지 않았기 때문. `artifact-transformer/common/parser_merge.py`가 자동 머지를 처리하는 줄 알았는데, 신규 프로젝트의 산출물 일부는 그 경로를 타지 않고 직접 export되고 있었다. 임시로 `_project.json`을 산출물 JSON에 미리 머지해두는 사전 스크립트로 우회했다.
- **`requirement_type` 제거 후 마이그레이션** — `requirement_type.functional.category`로 접근하던 코드가 일부 있었는데, 제거하고 보니 `parse_rd.py`가 한 줄 경로 변경으로 깨졌다. 스키마를 평탄화할 때는 그 키를 참조하는 모든 곳을 동시에 봐야 한다는 걸 다시 확인했다.

## 마무리

도구 확장과 패턴 이식을 같은 날 한 덕에, 도구 쪽에서 깎아낸 결정이 곧바로 신규 프로젝트의 첫 산출물에 들어갈 수 있었다. 가장 의미 있었던 변화는 네 가지다.

- 참여자 카탈로그를 다중 컬렉션 하나로 합친 것 (`participants`) — 시퀀스가 등장하면서 액터/시스템/컴포넌트 구분이 자주 흐려지는 자리가 생기는데, 카탈로그가 한 군데에 있으면 참조는 `{id, type}`로 단순해진다.
- 시퀀스 파이프라인을 데이터(`sq`)와 렌더(`sqd`)로 쪼갠 것 — LLM 보강을 정식화하기 전에 미리 분리해두지 않으면, 보강한 텍스트가 다음 빌드에서 사라지는 사고가 한 번은 난다.
- `_project.json`/`identifier_policy` 패턴이 도메인이 다른 프로젝트에서도 그대로 통한 것. 다만 유스케이스에서 자동 동작·외부 책임 기능을 제외하고, 폐기된 식별자를 재사용하지 않는다는 결정은 도메인별로 따로 정해야 했다.
- 스키마 패턴은 옮겨오지만 식별자 운영 정책은 도메인이 알고 있는 일이라는 것. `identifier_policy.category`의 *형식*은 재사용 가능하지만, *어떤 카테고리를 둘지·무엇을 식별자로 인정할지*는 매번 새 결정이다.

다음에 할 것:

- LLM 보강 단계를 파이프라인의 정식 단계로 추가 (sequence·scenario의 narrative 필드 자동 채움)
- `parse_fdg.py` — 기능 다이어그램이 있다면 같이 처리할 수 있도록 신설 검토
- `participants.json` 카탈로그를 모든 산출물의 참조 해결 단일 출처로 못 박기 (legacy fallback 제거)
- 신규 프로젝트의 유스케이스 명세서(usecase.json) 본문 작성 — 다이어그램에 남긴 9개에 대한 시나리오 채우기
- `_project.json` 머지를 빌드 파이프라인에 정식 연결 (현재는 사전 머지 스크립트로 우회 중)
- `usecase_overview.puml`을 CI로 png 렌더해서 README에 임베드

[#3]: /2026/05/21/artifact-transformer-3/
[#4]: /2026/05/22/artifact-transformer-4/
