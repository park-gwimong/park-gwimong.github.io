---
title: "artifact-transformer 작업 일지 #3"
subtitle: "스키마 정리와 Skill 워크플로우 묶기"
pubDate: 2026-05-21T20:00:00+09:00
category: "softwareengineering"
tags: ["Python", "JSON Schema", "Jira", "Claude Code", "Skill", "Working Log"]
math: false
draft: false
---

> 이 글은 2026-05-20 하루 동안 `artifact-transformer` 프로젝트에서 진행한 작업을 정리한 초안이다.

## 배경

`artifact-transformer`는 양식 파일(`.docx`/`.xlsx`)과 입력 JSON으로부터 SW 산출물 21종(분석 5종, 단위·통합·운영·인수 시험 각 4종)을 자동 생성하는 도구다. 시작은 단순한 잔버그였다 — `parse_jira.py`에서 `story_points` 맵핑이 빠졌고, `category1/2/3` 분류 기준이 이상했다. 그런데 `generate rs`/`generate rd` 단계에서 문서 매핑이 자꾸 깨지는 걸 보면서, 결국 스키마와 호출 인터페이스 양쪽으로 손이 갔다.

오늘 정리한 건 세 갈래다 — (1) 공통 메타데이터 중복 제거, (2) 식별자 정책 개편, (3) 산출물 생성 워크플로우를 Claude Code Skill로 묶기.

## 문제

풀어야 했던 문제들을 한 자리에 모아 보면 이렇다.

1. 매번 모든 산출물 JSON 파일에 `project_code`, `system_code`, 작성자·검토자·결재자, `jira_base_url` 같은 메타데이터가 통째로 박혀 있다. `references`와 `identifier_policy`도 마찬가지로 N번 복제되어 있어 한 곳을 바꾸려면 N번 수정해야 한다.
2. 식별자 정책이 산출물 키별로 흩어져 있어, 정책을 한 번 손대면 여러 파일이 동시에 깨진다.
3. Generator는 21개인데 **양식·JSON 매핑이 암묵지로만 존재**한다. 어떤 산출물이 어떤 JSON을 입력으로 받는지가 사람 머릿속에만 있다.
4. **CLI 인자를 매번 손으로 넣어야** 한다. 양식 폴더, 출력 폴더, JSON 경로가 다 인자다.
5. **참조 무결성을 사후에야 발견**한다. 생성된 docx 안에서 `REQ-001`이 깨진 걸 보고 다시 JSON으로 돌아가는 일이 잦았다.

## 결정 1 — 공통 메타데이터를 단일 출처로

`project_code`, `system_code`, 작성자·검토자·결재자, `jira_base_url`, `references`, `identifier_policy`를 별도 파일로 빼고 산출물 JSON은 이를 참조만 하도록 했다. "그냥 복붙해두면 편하지" 라는 처음의 판단이 식별자 정책을 한 번 바꾸자마자 비싸졌다. **이미 N번 박혀 있다는 사실 자체가 신호**였다. 두 번째 바뀔 때 구조화하는 게 아니라, 처음 N번 복제되는 시점이 이미 정리 타이밍이었다.

## 결정 2 — 식별자 정책 개편

새 포맷은 다음과 같다.

```
[프로젝트코드]-[산출물 유형 코드]-[category1]-[category2]-NNN
```

Confluence의 "SW 산출물 식별자 정책" 페이지(2.2 단계별 산출물 목록)에 분류1 코드(영어명·약어)를 통합한 것도 같은 흐름이었다. 산출물 키와 분류 코드를 같은 출처에서 받게 했더니 generator/parser 양쪽의 분기가 줄었다.

## 결정 3 — CLI 인자 0개 원칙

`generate-artifact` Skill은 사용자가 "rd 만들어줘"라고 말하면 다음 한 줄을 실행한다.

```bash
python Generator/generate_rd.py
```

인자가 0개다. 경로 해석은 Skill이 아니라 Generator 스크립트 본체가 한다. 세 단계 폴백으로 처리했다.

1. `WORK_DIR/documents/`
2. `Sample/`
3. 스크립트 기준 3단계 상위 디렉토리 탐색

`project.env` 같은 별도 환경 파일에는 의존하지 않도록 했다. 환경 파일이 또 다른 진실의 출처가 되면 "왜 안 됨?"의 원인이 한 군데 더 생긴다. 폴더 컨벤션만으로 풀리는데 굳이.

## 결정 4 — family 접두로 JSON 자동 매핑

산출물 키 앞에 family 접두가 붙는다(`ut_`, `it_`, `ot_`, `at_` 등). 이걸 사용해 JSON을 자동 선택한다.

| family 접두 | JSON 파일 |
| --- | --- |
| `ut_` | `unit.json` |
| `ot_` | `operational.json` |

통합·인수 시험(`it_`, `at_`)도 같은 family 접두 패턴을 따른다. 분석 계열(요구사항·유스케이스·시나리오)은 별도 JSON(`requirements.json`, `usecase.json`, `scenario.json`)을 직접 가리킨다.

매핑 표를 Generator 코드가 아니라 **Skill의 `SKILL.md`에 명시**한 게 핵심이다. 모델이 사용자 발화에서 산출물 키를 뽑은 직후, 어떤 JSON을 읽으면 되는지 SKILL.md만 봐도 알 수 있다.

## 결정 5 — 스키마와 실제 데이터 분리

요구사항 JSON을 두 파일로 쪼갰다.

- `Sample/requirements.json` — **스키마**(필드 목록·타입만)
- `Sample/data/requirements_sample.json` — **실제 데이터 예시**

스키마와 데이터가 한 파일에 섞이면 "예시를 지우면 스키마도 함께 사라지는" 문제가 생긴다. 분리해두면 데이터 파일을 통째로 갈아끼우거나 비워도 스키마 정의는 그대로 남는다.

## 결정 6 — check-traceability Skill로 사전 검증

산출물 생성 전에 한 번 돌리는 정합성 검사를 별도 Skill로 뽑았다.

```bash
python .claude/skills/check-traceability/check_traceability.py --strict
```

검사는 세 층위로 나뉜다.

1. **파일 내부** — ID 중복·누락, `depends_on`·`include_usecases` 같은 내부 참조의 댕글링.
2. **파일 교차** — `requirement` → `usecase`·`acceptance` 추적성, `layer`·`functional_area`·`operational_mode` 같은 분류값의 존재성.
3. **패턴 규칙** — `scenario_step_id`가 `<scenario_id>-NN` 형태를 따르는지. 단 이 항목은 **WARN**으로만 처리해 의도적 편차를 허용했다.

WARN과 ERROR를 나눈 이유는 단순하다. 모든 위반을 ERROR로 두면, 의도적 예외가 한 건 생긴 순간 검사 자체를 끄게 된다. 진짜 끊어진 참조만 ERROR로 남기면 검사 결과를 계속 신뢰할 수 있다.

`generate-artifact`와 `check-traceability`를 분리한 건, 검증이 실패해도 생성은 별도로 시도할 수 있어야 했기 때문이다. 검증을 생성 앞에 묶어 두면 디버깅 중 일부 데이터가 깨졌을 때 아무것도 못 만든다.

## 의도치 않은 함정

- **식별자 구조를 바꾸자 `generate rd`의 요구사항 매핑이 다시 깨졌다.** 결국 늦은 저녁에 다시 잡았다. 스키마를 바꿀 때는 파서와 제너레이터를 **동시에** 봐야 한다는 걸 또 잊었다.
- **자동 추측의 유혹.** "사용자 발화를 받아 산출물 키를 자동으로 추측해 채워주는" 동작을 넣고 싶었는데, 자연어가 모호한 경우 임의로 진행하면 잘못된 산출물이 생성되더라도 곧장 알아차리기 어렵다. 결국 SKILL.md에 **임의 추측 금지** 규칙을 박고, 후보가 둘 이상이면 사용자에게 선택지를 보여주도록 바꿨다. 자동화의 한 발 후퇴지만, 잘못된 산출물을 사후에 발견하는 비용보다 싸다.

## 마무리

- 구조화는 "두 번째 바뀔 때"가 아니라 **이미 N번 복제된 시점**에 해야 한다. 그 사실이 신호다.
- 호출 인터페이스를 단순화하는 가장 빠른 길은 인자 자체를 없애는 것이다. 폴더 컨벤션이 인자보다 약하다는 통념이 있지만, 한 번 정해두면 모두가 본다.
- 검증과 생성은 **분리**하되, 같은 메타데이터(매핑 표)는 **한 곳**에 두자. 인터페이스만 분리한다고 능사가 아니다.
- 정적 변환과 LLM 추론이 같은 파이프라인 안에 공존하는 모양이 흥미롭다. "generate로 만들 수 없는 값은 LLM으로 자동 채움"이라는 아이디어가 다음 단계의 후보다.

다음에는 `check-traceability` 결과를 `generate-artifact`가 권장 사항으로 읽어, 의심스러운 ID가 있으면 보고만 하고 진행 여부는 사용자에게 묻는 형태로 이어 볼 생각이다. 그리고 블로그 글쓰기 Skill을 만들겠다고 마음먹은 게 오늘 오후였는데 — 이 일기 자체가 그 결과물의 일부다.
