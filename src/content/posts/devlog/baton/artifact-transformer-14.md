---
title: "artifact-transformer 작업 일지 #14"
subtitle: "도구를 여러 시스템에 동시에 들이대다 — Jira Capability 정합, 빈 다이어그램 채우기, 그리고 식별자·액터의 원천 일원화"
pubDate: 2026-06-16T10:00:00+09:00
category: "devlog"
tags: ["Python", "Jira", "PlantUML", "REST API", "Traceability", "Working Log"]
math: false
draft: true
---

> 이 글은 2026-06-15 하루 동안 `artifact-transformer` 파이프라인을 **LORAS·SUGCS·SUOMS을 비롯한 여러 시스템에 동시에 투입**하며, 각 시스템의 데이터 정합성을 맞추고, **Jira Capability Code를 요구사항 분류의 원천으로 묶고**, 비어 있던 다이어그램을 데이터로 채우고, **식별자와 액터를 `as` 별칭·아키텍처 기준으로 일원화**한 작업 기록이다. 세션을 프로젝트별로 갈라 병렬로 돌렸다.

## 배경

`artifact-transformer`는 Jira 이슈와 PlantUML 다이어그램을 입력으로 받아 요구사항·유스케이스·기능·시퀀스 명세서와 데이터 정의서/명세서 등을 docx/xlsx로 자동 생성·역파싱하는 도구다 ([#4] 참조).

[#13]에서 파이프라인의 입구(다이어그램 → participant.json 초기화)와 출구(Drive 인도)를 자동화하고, 결정적 검증을 LLM에서 떼어내 `check.py`로 묶었다. 도구의 가운데 토막은 제법 단단해졌다.

오늘은 그 도구를 **여러 실제 시스템에 동시에 들이대는** 날이었다. 세션을 프로젝트별로 갈라 — LORAS는 LORAS대로, SUGCS는 SUGCS대로, SUOMS는 SUOMS대로 — 병렬로 돌렸다. 도구가 단단한지는 한 시스템 안에서가 아니라, 여러 시스템에 동시에 부딪힐 때 드러난다. 그리고 부딪혀 보니 빈틈은 대부분 한 가지 질문으로 수렴했다 — **"이 값의 정본(원천)이 어디냐."**

## 문제

손대기 전, 프로젝트마다 반복해서 걸린 질문들.

1. **Jira Capability Code와 요구사항 분류가 따로 놀았다** — 각 프로젝트의 `requirement.json` category가 Jira의 Capability 이슈와 연결되지 않아, 같은 분류를 두 곳에서 따로 관리하고 있었다.
2. **다이어그램이 비어 있거나 어긋나 있었다** — 흐름도(BPDG)·유스케이스(UCDG)·시퀀스(SQDG)가 JSON은 있는데 .puml이 없거나, 컨테이너 레벨이어야 할 시퀀스가 컴포넌트 레벨로 그려져 있었다.
3. **식별자가 snake_case와 표시명에 묶여 있었다** — 다이어그램 라벨이 곧 JSON PK라, 표기 한 줄을 바꾸면 데이터가 깨졌다.
4. **액터가 산출물마다 달랐다** — 유스케이스 액터가 표시명을 쓰거나, 아키텍처에 정의되지 않은 액터를 참조했다.

## 결정 1 — Jira Capability Code를 요구사항 분류의 단일 출처로

요구사항 category를 산출물 안에서 닫지 않고, **Jira의 Capability를 정본으로 삼아 거기에 맞췄다.** 모든 프로젝트(LORAS·SUOMS·SUGCS·SDSP 등)에 걸쳐 Capability Code를 생성하고 `requirement.json`의 category를 그 코드와 일치시켰다.

- REST 헬퍼(`build/loras_jira.py`)를 두어 `system.env`의 토큰·이슈타입 id(story=10002, epic=10000, capability=10249)·Capability Code 필드(`customfield_10247`)를 한 곳에 모았다.
- Capability 유형의 Capability Code 속성을 바꾸는 슬래시 커맨드를 추가하고, `init_requirement.py`가 그 코드를 읽어 요구사항 생성 시 매칭하도록 보강했다.

부딪힌 현실들.

- **테넌트가 갈려 있었다** — MCP Atlassian은 `gwimong.atlassian.net`만 접근한다. LORAS 등은 `pabloair.atlassian.net`에 있어, `system.env`의 `JIRA_API_TOKEN`으로 REST를 직접 호출했다.
- **계층 제약** — Story → Epic → Capability → Initiative 순이라, Story를 Capability에 직접 붙일 수 없었다(중간 Epic 필요). Capability 생성도 부모 Initiative가 있어야 했다(`필드 상위 항목이 필요`).
- **라이브 삭제는 정책 분류기가 막았다** — 중복 Jira 스토리를 코드로 지우는 건 우회가 불가능했다. 수동 삭제용 JQL을 만들어 넘기는 것으로 갈음했다.

에픽 이름도 IAM·SDSP의 기존 규약(기능 테마 명사구, `[코드]` 접두 제거)을 참고해 스킬로 정리하고, 기존 Story·Task를 연관 에픽으로 이전했다. Story 요약은 `name`이 아니라 `summary` 속성으로 생성하도록 규약을 바로잡았다.

> 분류는 산출물 안에서 닫히지 않는다. Jira의 Capability가 분류의 원천이면, 요구사항 category는 그 코드를 따라가야 한다 — 같은 값을 두 곳에서 관리하는 순간 어긋난다.

## 결정 2 — 비어 있는 다이어그램을 데이터로 채우고 왕복으로 검증

JSON은 있는데 .puml이 없는 다이어그램들을 **데이터 원천에 맞춰** 작성했다.

- **BPDG(업무 흐름도, AN11-4)** — 파서 없는 표시 전용 아티팩트. 업무 1건당 1개를 스윔레인(평가요청자·시스템·운영자·외부) 액티비티로 작성하고, 흐름은 레거시 `models/workflow/*.puml`에서 가져왔다. 검증·반려 루프는 `detach`(끊긴 화살표) 대신 `repeat … repeat while`로 닫았다.
- **BCDG(업무 구성도)** — 리치 스타일을 기본으로 쓰되 라운드트립을 지켰다. 외부 시스템은 반드시 `card`로 선언한다(`component`/`actor`/`cloud`로 쓰면 각각 업무·이해관계자로 오인식된다).
- **SQDG(시퀀스)** — SUOMS는 비어 있던 시퀀스 21종을 신설했다. `relatedUc`의 유스케이스 mainFlow와 participant 카탈로그의 CTL/SVC/REPO 3계층을 바탕으로 actor→controller→service→repository 흐름을 그렸다. SUGCS는 컴포넌트 레벨로 잘못 그려진 시퀀스들을 컨테이너 레벨로 내리고, 단일 컨테이너 15개에 외부 엔드포인트를 보강했다.

핵심 함정을 다시 확인했다 — **`parse.py {bcdg,ucdg,sqdg}`는 .puml을 읽어 JSON을 덮어쓴다(역추출).** 작성한 .puml이 파서 규약을 어기면 그대로 JSON이 오염된다. 그래서 작성 직후 반드시 `--diff`가 **[+0 -0 ~0]**인지부터 확인하고, 그다음 `check.py`로 스키마·추적성을 통과시켰다. 이 과정에서 굳은 규약들은 `gen-diagrams` 스킬에 반영했다.

> 데이터 기반 생성의 목표는 "파싱하면 원본 JSON 그대로 나오는" 다이어그램이다. 다이어그램이 산출물이 아니라 원천일 때, 라벨 한 줄이 곧 PK다.

## 결정 3 — 식별자를 camelCase로, 표시명과 PK를 `as` 별칭으로 분리

라벨이 곧 PK인 탓에 묶여 있던 식별자를 풀었다. 모든 다이어그램의 package·entity 등 **JSON으로 파싱되는 명칭을 camelCase로 통일**했다.

- LORAS에서 snake_case 식별자 19종을 camelCase로 치환했다(`web_app`→`webApp`, `loras_was`→`lorasWas` 등). 한 스크립트로 `documents/*.json`과 `diagrams/**/*.puml`을 가로질러 586건을 바꿨다(participant 19·physical-data 26·sequence 222·SQDG/C4 puml 다수). `spa`/`iam`/`sdsp`처럼 이미 짧은 토큰은 건드리지 않았다.
- 그다음 **`as` 별칭을 도입**했다 — 다이어그램에는 사람이 읽기 좋은 표시명을 두고, JSON에는 안정적인 PK(별칭)를 쓰도록 갈랐다. 다이어그램을 파싱하는 코드가 별칭을 인식하도록 보강했고, ERD의 entity에도 같은 방식으로 별칭을 붙였다.

검증은 평소대로 왕복이다 — `parse.py {sqdg,ucdg} --diff`가 [+0 -0 ~0]이고(라이프라인·액터와 JSON 참여자를 함께 바꿨으니 어긋나면 안 된다), `check.py`의 `PARTICIPANT_DANGLING`이 깨끗해야 한다. 개정 이력을 기록하고 커밋까지 마쳤다.

> 라벨이 곧 PK이면 표기를 바꿀 수 없다. `as`로 표시명과 식별자를 가르면, 사람은 다이어그램을 읽기 좋게 쓰고 데이터는 안정적인 PK로 남는다 — 표시와 원천을 분리하는 것이 별칭의 본질이다.

## 결정 4 — 액터를 아키텍처 기준으로 일원화

산출물마다 제각각이던 액터를 **시스템 아키텍처(C4)를 정본으로** 통일했다. C4에 `user` 하나만 있던 것을 `guest`/`admin`까지 더해 3개 레벨 모두 participant 카탈로그와 정합을 맞췄다.

유스케이스 액터의 규약도 못 박았다 — 액터는 **표시명이 아니라 아키텍처 액터 id(`participant.actors[].id`)를 가리켜야 한다.** `parse_ucdg`가 .puml의 액터 표시명을 participant id로 변환해 정합을 유지하고, `check.py`가 불일치를 잡는다. SUGCS의 `UC_CON`처럼 아키텍처에 없는 액터를 참조하던 유스케이스를 이 규칙으로 바로잡고, 관련 정합 규약을 `check-traceability` 스킬에 업데이트했다.

## 의도치 않은 함정

- **parse bcdg가 business.json을 오염시켰다** — 업무 구성도에 외부 시스템(IAM/SDSP/메일/기상청)을 `component`로 그려 두니, 역파싱이 그것을 업무로 오인해 `business.json`에 집어넣었다. INF 라벨이 여러 줄이라 name까지 오염됐다. 외부 시스템을 `card`로, name을 한 줄로 고치고 [+0 -0 ~0]을 확인했다. 외부 시스템은 업무 구성도의 원천이 아니다 — C4·인터페이스 데이터 쪽에 산다.
- **dedup 리네임이 name↔summary를 어긋나게 남겼다** — 요구사항 중복을 통합하면서 `name`은 바뀌고 `summary`는 옛 값이 남는 쌍이 생겼다(예: name "비행정보" ↔ summary "경로"). 5건을 보정하고 Jira까지 동기화했다.
- **`logical-data.json`에 유령 데이터가 끼어 있었다** — 초기화기가 업무 I/O에서 데이터를 도출하며 ERD에 없는 항목 3건(`control={}`)을 만들어 두었다. 제거하고, ERD가 정본인 이 파일은 초기화기를 재실행하지 않도록 기록했다.

## 마무리

오늘은 도구를 여러 시스템에 동시에 투입한 날이고, 관통하는 결은 하나였다 — **원천 일원화를 세 층위에 적용한 것.**

- **분류의 원천은 Jira Capability** — 요구사항 category가 Capability Code를 따라가게 묶었다.
- **액터의 원천은 아키텍처** — 모든 산출물 액터를 C4 카탈로그 id로 통일하고, 유스케이스가 표시명 아닌 id를 참조하게 했다.
- **식별자의 원천은 다이어그램, 표기는 별칭으로 분리** — camelCase 통일과 `as` 별칭으로, 다이어그램이 PK의 원천이면서도 표기는 자유롭게 했다.

여러 시스템에 한꺼번에 부딪히니 도구의 빈틈이 동시에 드러났는데, 그 빈틈은 거의 다 "정본이 어디냐"의 문제였다. 정본을 한 곳으로 정하고 나머지를 그쪽으로 끌어다 맞추면, 검증은 그저 그 정합을 확인하는 일이 된다.

다음에 할 것:

- **문서 재생성(docx/xlsx)** — 오늘 JSON 변경분이 많이 쌓였다. 일괄 재생성은 뒤로 미뤘다.
- **중복 Jira 스토리 수동 삭제** — 정책상 코드로 못 지우는 6건을, 넘긴 JQL로 직접 정리한다.
- **나머지 프로젝트 Capability/category 정합 마무리** — 오늘 손대지 못한 시스템들도 같은 흐름에 태운다.

[#4]: /2026/05/22/artifact-transformer-4/
[#13]: /2026/06/11/artifact-transformer-13/
