---
title: "artifact-transformer 작업 일지 #7"
subtitle: "데이터 모델 단일 출처 정리와 cross-reference 검증"
pubDate: 2026-05-28T10:00:00+09:00
category: "devlog"
tags: ["Python", "JSON Schema", "Single Source of Truth", "Data Modeling", "Cross Reference", "Working Log"]
math: false
draft: false
---

> 이 글은 2026-05-28 하루 동안 `artifact-transformer`의 스키마와 샘플 데이터 전체를 정합성 기준으로 정리한 작업 기록이다.

## 배경

`artifact-transformer`는 Jira 이슈와 PlantUML 다이어그램을 입력으로 받아 요구사항·유스케이스·기능·시퀀스 명세서와 단위·통합·운영·인수 시험서 등을 docx/xlsx로 자동 생성하는 도구다 ([#4] 참조).

[#6]에서 산출물 종류를 한 번에 4종 늘리고, "참여자 카탈로그를 모든 산출물의 참조 해결 단일 출처로 못 박기"와 "신규 프로젝트의 샘플 본문 채우기"를 다음 할 일로 남겨뒀다. 오늘은 그 연장선이다.

산출물이 11종으로 늘면서 한 가지 증상이 또렷해졌다. **같은 정보가 여러 JSON에 중복 정의되고, 어느 쪽이 진짜인지 매번 다시 정해야 했다.** 기능 분류(`area`)는 요구사항 쪽에도 기능 쪽에도 있었고, 참여자 이름은 카탈로그에도 산출물 본문에도 있었다. 파일명 규칙마저 한 군데만 어긋나 있었다.

오늘의 작업을 한 문장으로 줄이면 이렇다.

> 한 가지 정보는 한 군데에만 둔다(single source of truth). 나머지는 ID로 참조한다.

## 문제

손대기 전에 보인 것들.

1. **`requirement` 산출물만 파일명이 복수형** — 다른 산출물은 전부 단수(`function`, `usecase`, `sequence`)인데 `requirements.schema.json` / `requirements.json`만 복수였다. 규칙이 한 군데만 어긋나면 코드에서 매번 "얘만 복수였지" 하고 멈칫하게 된다.
2. **`functionalArea` 정의가 두 곳에** — `requirement.json`에 top-level `functionalArea[]` 배열이 있고, `function.json`에도 `areas[]`가 있었다. 같은 분류 체계가 두 산출물에 각자 박혀 있어, 둘이 어긋나면 어느 쪽이 맞는지 알 수 없다.
3. **샘플 하나만 다른 도메인** — 11개 샘플 중 `business.sample.json`만 이전 도메인의 데이터였고 나머지는 전부 동일 샘플 프로젝트(`code=SAMPLE-001`)를 공유했다. cross-reference를 검증하려는데 출발 프로젝트가 섞여 있으면 참조가 닿을 리 없다.
4. **참여자 참조가 표시명으로 박힘** — `usecase.json`의 `actors` 필드가 `["사용자"]`처럼 한국어 표시명으로 들어가 있었다. 카탈로그(`participant.json`)는 `end_user` 같은 ID로 관리하는데, 본문은 이름으로 끊어져 있어 같은 인물을 ID로 추적할 수 없었다.
5. **시나리오 식별자가 유스케이스와 같은 ID 공간을 씀** — `scenario.packages`가 `UC-SAMPLE`처럼 유스케이스와 동일한 `UC-` 접두사를 쓰고 있었다. 둘은 별개 개념인데 ID 공간이 겹치면 참조가 어디를 가리키는지 모호하다.
6. **시험 산출물 샘플에 구멍** — `operational.sample.json`, `acceptance.sample.json`은 스키마만 있고 샘플 데이터가 아예 없었다. 시퀀스·시나리오 커버리지를 따지려 해도 받는 쪽이 비어 있었다.
7. **요구사항 → 업무 역추적 링크가 없음** — `requirement`에서 관련 업무(`business`)로 가는 참조 필드가 없어, 추적성 매트릭스의 한 변이 끊겨 있었다.
8. **cross-reference 무결성을 보장하는 장치가 없음** — 11개 파일이 서로를 ID로 참조하는데, 매달린(dangling) 참조나 커버리지 구멍을 사람 눈으로만 잡고 있었다.

## 결정 1 — `requirements` → `requirement` 명칭 단수화

파일명 규칙을 단수로 통일했다. `requirements.schema.json` → `requirement.schema.json`, `requirements.sample.json` → `requirement.sample.json`.

핵심은 `git mv`로 옮겨 히스토리를 보존하고, 스키마 내부 `$id`의 자기참조와 **그 이름을 부르는 모든 곳**을 한 번에 바꾸는 것이다.

- `common/document_codes.py` — `DEFAULT_JSON_BY_FAMILY`의 rd/rs 매핑
- `common/identifier_policy.py` — 모듈·함수 docstring
- `Parser/AN/extract_project_meta.py` — `_DOC_JSON_NAMES` 튜플
- `Parser/AN/parse_jira.py` — 출력 경로 default, argparse description

`jira_to_requirements` 같은 함수 이름은 그대로 뒀다. 이번에 바꾸려던 건 *파일명*이지 코드 심볼이 아니다. 변경 후 바뀐 모듈이 모두 깨끗이 import되고, `grep`으로 옛 이름이 0건 남았는지 확인했다.

## 결정 2 — `businessRefs`로 요구사항 → 업무 역추적 링크 추가

`requirement.schema.json`의 요구사항 항목에 `businessRefs`(관련 업무 식별자 문자열 배열)를 추가했다. `business.schema.json#/businesses`의 `id`를 가리킨다.

모델은 이미 있던 패턴을 그대로 따랐다. `usecase.schema.json`의 `requirements` 필드가 요구사항 ID 배열인데, 그 형태를 복사했다.

```json
"businessRefs": {
  "type": "array",
  "items": { "type": "string" },
  "description": "관련 업무 식별자 목록 — business.schema.json#/businesses 의 id 참조"
}
```

> 새 참조를 만들 때는 기존에 잘 도는 참조 패턴을 베끼는 게 가장 안전하다. 머지·검증 로직이 같은 모양을 이미 처리하고 있기 때문이다.

## 결정 3 — `functionalArea`는 `function.json` 단일 출처

기능 분류(`area`)가 두 산출물에 중복 정의돼 있던 문제를 정리했다. `requirement.json`의 top-level `functionalArea[]` 배열을 제거하고, 분류 정의는 `function.json`의 `areas[]`에만 둔다. 요구사항은 `requirements[].functionalArea`에서 그 ID를 *참조만* 한다.

cascading 변경이 따라붙었다.

- `parse_rs.py` — §3.1.2 표에서 `functionalArea[]`를 추출하던 로직 제거
- `generate_rd.py` / `generate_rs.py` — `function.json`의 `areas[]`를 로드해 ID→이름을 해석한 뒤 본문에 주입
- `generate_bu.py` — `requirements.functionalArea[]`에서 분류를 만들던 것을 `function.json` 참조로 변경

`function.json`이 없으면 ID를 원형 그대로 출력하고(raw fallback), 있으면 이름으로 해석하도록 했다. 형제 디렉토리에서 `function.json`을 찾는 `resolve_function_path()`로 경로를 맞춘다.

같은 작업의 끝에 `function.sample.json`의 area ID도 손봤다. `FN-SAMPLE`/`FN-AUTH`로 자기만의 접두사를 쓰고 있었는데, 다른 샘플(`requirement`, `participant`)은 전부 `SAMPLE`/`AUTH`였다. 이제 `function`이 area의 단일 출처가 됐으니 참조하는 쪽 컨벤션에 맞춰 접두사를 떼어냈다.

## 결정 4 — 샘플 데이터를 단일 프로젝트로 통일

`business.sample.json`만 다른 도메인이던 outlier를 다시 썼다. 이전 파일은 8개 업무와 8명의 RACI actor를 담고 있었는데, 다른 어떤 샘플과도 참조가 닿지 않았다.

새 내용은 `requirement.sample.json`의 3개 요구사항(샘플 데이터 조회/생성/삭제)과 1:1로 정렬되는 3개 업무(`SAMPLE-BIZ-01/02/03`)로 다시 썼다. 이걸로 11개 샘플이 전부 `code=SAMPLE-001`을 공유하게 됐다.

샘플 데이터는 "도구가 정상 동작하는 한 벌의 완결된 예시"여야 한다. 그 안에서 프로젝트가 섞이면 예시로서의 가치가 없다.

## 결정 5 — 참여자는 ID로 참조, 표시명은 카탈로그에서 lookup

`usecase.sample.json`의 `actors`를 `["사용자"]`에서 `["end_user"]`로 바꿨다. 본문이 카탈로그 ID를 가리키도록 정렬한 것이다.

문제는 이 필드가 docx와 round-trip한다는 점이었다. 파서는 문서의 쉼표 구분 표시명을 읽고, generator는 다시 그 이름을 문서에 쓴다. ID로 그냥 바꾸면 문서에 `end_user`라고 찍힌다. 그래서 양방향 해석 헬퍼를 `identifier_policy.py`에 새로 넣었다.

```python
load_participant_actors(path)      # participant.json 의 actors[] 로드 (없으면 [])
build_actor_maps(actors)           # (id→name, name→id) 매핑 튜플
resolve_actor_display(id, id2name) # 생성: end_user → 사용자
resolve_actor_id(name, name2id)    # 파싱: 사용자 → end_user
```

`generate_ucs.py`(생성)는 ID를 표시명으로, `parse_ucs.py`(파싱)는 표시명을 ID로 변환한다. 카탈로그에 없는 값은 원형 그대로 통과시켜(raw fallback), 마이그레이션 중인 데이터도 깨지지 않게 했다.

같은 정리를 하면서 `participant.sample.json`의 actor를 1명(`end_user`)에서 3명(`end_user`/`admin`/`auditor`)으로 늘렸고, 결정 4에서 다시 쓴 `business.sample.json`의 RACI도 동일한 3명 actor 기준으로 정렬했다.

## 결정 6 — 시나리오는 `SC-` 별개 ID 공간으로 분리

`scenario.sample.json`의 package 접두사를 `UC-`에서 `SC-`로 바꿨다. `UC-SAMPLE` → `SC-SAMPLE`. 유스케이스 package와 시나리오 package는 별개 개념인데 같은 ID 공간을 쓰면 참조가 모호해진다.

분리하면서 관리자·감사자 책임 영역도 채웠다. 운영 관리(`OPS`) category를 추가하고, 운영 시나리오 2종(사용자 권한 관리, 감사 로그 검토)을 새로 넣었다. 새 `admin`/`auditor` actor가 실제로 등장하는 자리를 만들어준 셈이다.

## 결정 7 — 빠진 시험 산출물 샘플 신규 작성 + 커버리지 100%

스키마만 있고 샘플이 없던 두 파일을 처음부터 작성했다.

- `operational.sample.json` — 운영 시험 케이스 6종 + `test_results`(Pass/Skip 등 실제 실행 결과 흉내)
- `acceptance.sample.json` — 인수 시험 케이스 5종 + 인수 고유 필드(`scenario_objective`, `acceptance_evidence[]`, 입회자 서명)

같은 흐름으로 단위·통합 시험 샘플의 커버리지 구멍도 메웠다.

| 샘플 | 변경 | 커버리지 |
| --- | --- | --- |
| `unit-testcase` | 테스트 케이스 5 → 8건 | 유스케이스 6/6 = 100% |
| `integration` | 테스트 케이스 4 → 9건 | 시퀀스·시나리오 100% |
| `sequence` | 시퀀스 4 → 8건 | 참여자 3명 모두 사용 |

유스케이스부터 시퀀스·단위·통합·운영·인수까지, 한 흐름이 산출물 사슬 전체를 관통하도록 채웠다.

## 결정 8 — cross-reference 검증을 스크립트로 못 박기

마지막으로 11개 샘플 전수 검증 스크립트를 작성했다. 27개 cross-reference 체크 + 4개 커버리지 항목.

검증 항목 일부:

| 참조 방향 | 결과 |
| --- | --- |
| `requirement.functionalArea` → `function.areas` | OK |
| `requirement.businessRefs` → `business.businesses` | OK |
| `function.functions.requirements` → `requirement.requirements[].id` | OK |
| `business.raci.actor_id` → `participant.actors` | OK |

검증을 돌리자 곧바로 한 건이 걸렸다. **`businessRefs`를 스키마에서 required로 만들었는데 `requirement.sample.json`에는 그 필드가 없었다.** 결정 2에서 스키마만 고치고 샘플을 따라 고치지 않은 흔적이다. 채워 넣고 통과.

검증 직후 따라온 질문 하나 — "`business.sample.json`에 왜 `areas`가 있나". 추적해 보니 이전 도메인 샘플 시절의 잔재였다. `business.schema.json`에는 `areas` property가 정의돼 있지도 않은데, generator(`generate_bu.py`)가 `function.json`의 areas를 출력에 실어 보내던 동작을 샘플이 흉내내면서 따라 들어온 것이었다.

스키마에 없는 + `function.areas`와 중복되는 필드 = 단일 출처 위반. 샘플에서 제거하고, generator도 정리했다.

- `generate_bu.py` — `result["areas"] = ...` 출력 제거, `_merge_categories`/`_CATEGORY_TEMPLATE`/관련 import 삭제
- `generate_bud.py` — `business.areas`를 읽던 `_build_category_map`을 `function.json` 참조로 변경
- 검증 스크립트 자신의 `business["areas"]` 참조도 함께 정리

`business.sample.json`은 이제 `project / document / businesses` 3개 키만 남았다.

## 함정

- **스키마를 required로 바꾸면 샘플은 반드시 따라가야 한다** — `businessRefs`를 required로 올린 뒤 샘플을 안 고쳐 검증에서 걸렸다. 스키마와 샘플은 한 쌍이라 한쪽만 손대면 다음 검증까지 잠복한다.
- **generator output을 흉내내다 스키마에 없는 필드가 샘플에 섞임** — `business.sample.json`의 `areas`가 그랬다. 샘플은 "스키마가 정의한 형태"여야지 "generator가 뱉는 형태"여야 하는 게 아니다. 둘이 다를 수 있다는 걸 놓쳤다.
- **표시명 참조를 ID로 바꿀 때 round-trip을 먼저 본다** — actor를 ID로 바꾸려다, 그 필드가 docx와 양방향으로 오간다는 걸 뒤늦게 확인했다. 단순 치환했으면 문서에 `end_user`가 그대로 찍혔을 것이다. 변환 헬퍼를 양쪽(생성/파싱)에 다 넣어야 round-trip이 닫힌다.
- **복수→단수 rename은 `git mv` + `$id` + 모든 참조를 동시에** — 파일만 옮기고 `$id` 자기참조나 코드의 문자열 경로를 빠뜨리면 import는 되는데 런타임에 파일을 못 찾는다. rename은 "이름을 부르는 모든 곳"의 목록을 먼저 grep으로 뽑고 시작해야 한다.

## 마무리

오늘은 새 기능을 거의 안 만들었다. 대신 11개 산출물이 서로를 ID로 참조하는 그물을 단일 출처 기준으로 다시 짰다. 가장 의미 있었던 변화는 세 가지다.

- **한 정보는 한 곳에** — `functionalArea`/`area`를 `function.json`으로, 참여자 표시명을 `participant.json`으로 일원화했다. 중복을 지우니 "어느 쪽이 맞나" 하는 질문 자체가 사라졌다.
- **본문은 ID로 참조, 표시는 lookup** — actor를 ID로 가리키고 이름은 카탈로그에서 푼다. round-trip만 닫아두면 문서 표시는 그대로 유지된다.
- **무결성을 사람이 아니라 스크립트가 본다** — 27개 cross-ref 체크를 스크립트로 박아두니, 스키마를 required로 바꾼 뒤 샘플을 안 고친 실수가 그 자리에서 잡혔다. 단일 출처 정책은 검증 장치가 없으면 시간이 지나며 다시 흐트러진다.

다음에 할 것:

- `businessRefs` 추적성 매트릭스를 산출물로 렌더 (요구사항 ↔ 업무 ↔ 유스케이스 trace)
- `_project.json` 머지를 빌드 파이프라인에 정식 연결 ([#6]에서 사전 머지 스크립트로 우회 중)
- cross-reference 검증 스크립트를 CI 단계로 승격 — 샘플 수정 시 자동 게이트
- 단일 출처로 모은 `function.areas`를 generator 전반의 분류 해석 단일 진입점으로 못 박기
- LLM 보강 단계(sequence·scenario narrative 자동 채움)를 파이프라인 정식 단계로 추가

[#4]: /2026/05/22/artifact-transformer-4/
[#6]: /2026/05/21/artifact-transformer-6/
