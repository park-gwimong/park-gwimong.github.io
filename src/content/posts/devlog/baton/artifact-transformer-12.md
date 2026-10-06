---
title: "artifact-transformer 작업 일지 #12"
subtitle: "연동 데이터를 중계형 모델로 갈아엎고, 검증을 CI 게이트로 묶고, 두 시스템에 실전 투입하다"
pubDate: 2026-06-10T10:00:00+09:00
category: "devlog"
tags: ["Python", "JSON Schema", "OOXML", "CI", "PlantUML", "Working Log"]
math: false
draft: true
---

> 이 글은 2026-06-10 하루 동안 `artifact-transformer`의 연동 데이터(IDR/IDS) 라인을 **역파서까지 닫고**, 실데이터를 계기로 스키마를 **중계형 모델로 갈아엎고**, 스키마 검증·추적성 게이트를 **CI로 묶은** 뒤, 그 도구를 **두 실제 시스템(IAMS·FDSP)에 일괄 투입**한 작업 기록이다.

## 배경

`artifact-transformer`는 Jira 이슈와 PlantUML 다이어그램을 입력으로 받아 요구사항·유스케이스·기능·시퀀스 명세서와 데이터 정의서/명세서 등을 docx/xlsx로 자동 생성·역파싱하는 도구다 ([#4] 참조).

[#11]까지 데이터 산출물을 논리·물리·인터페이스 세 레이어로 갈라 왔고, 전날 저녁에는 연동 소요서(IDR, xlsx)·연동 규격서(IDS, docx) 양식을 처음 만들어 두었다. 오늘은 그 연동 데이터 라인을 끝까지 미는 날이었다 — 그런데 아침에 라운드트립을 돌려 보다 시작부터 구멍을 발견했고, 낮에는 실데이터가 스키마 자체를 갈아엎게 만들었다.

## 문제

손대기 전 상태에서 풀어야 했던 질문들.

1. **IDR/IDS에 역파서가 없었다** — `generate.py`에 생성기는 등록돼 있었지만 `parse_idr`/`parse_ids` 모듈 자체가 부재했다. 생성만 되고 역추출이 안 되는, 왕복이 열린 산출물이었다.
2. **스키마가 단방향·평문 모델이었다** — 연동 항목을 납작한 문자열 속성으로만 담아, "XML로 받아 가공해 REST로 제공"하는 중계형 연동을 표현할 수 없었다. 제거하기로 한 category taxonomy도 연동 스키마에는 아직 남아 있었다.
3. **샘플·스키마 드리프트를 잡는 자동 장치가 약했다** — `{stem}.json`이 `{stem}.schema.json`과 어긋나도, 추적성이 깨져도, 사람이 돌려 보기 전엔 몰랐다.
4. **도구가 SDSP 밖에서 굴러본 적이 없었다** — 다이어그램 명명·경로 규약이 코드 곳곳에 흩어져 있었고, 다른 시스템의 데이터로 전체 파이프라인을 돌린 검증이 없었다.

## 결정 1 — IDR/IDS 역파서를 만들어 왕복을 닫다

아침에 "parse.py로 라운드트립 확인"을 돌리다 IDR/IDS에 파서가 아예 없는 걸 발견했다. 검증된 pdd/pds 파서 패턴을 따라 `parser/an/parse_idr.py`(xlsx, A~M 13열)와 `parser/de/parse_ids.py`(docx)를 신설했다.

- 분류 코드는 식별번호(`SDSP-IDE-WX-001`)에서 **직접 파생**하도록 했다 — 이름→id 역변환 테이블 없이 식별자 자체가 분류를 들고 다니게.
- 검증은 원본 위에 덮어쓰는 trivial 왕복이 아니라, **빈 베이스에 IDR+IDS를 합쳐 파싱해 19개 필드 전부를 재구성**하는 방식으로 했다. 소요서=분석 뷰, 규격서=설계 뷰라는 단일 원천(`interface-data.json`) 모델이 실제로 합산 복원되는지를 보는 것이다.
- 스모크의 `ROUND_TRIP_CASES`에 idr/ids 2건을 추가하고, README 식별자 표·generator 카탈로그에 IDE 형식을 문서화했다. 이 과정에서 README의 파서 카운트 "27종"이 이미 stale(실제 31종)인 것도 걸렸다.

> 생성기만 있는 산출물은 단방향 출력일 뿐이다. 파서가 생겨야 산출물이 데이터의 또 다른 표현이 된다.

## 결정 2 — 실데이터가 스키마를 갈아엎다: source/provision 중계형 모델

오전에 연동 스키마에서 category taxonomy를 걷어내고 추적을 `relatedReq`로 일원화했다(논리 데이터가 먼저 거친 전환과 같은 결). 그런데 진짜 수술은 그다음이었다 — 실제 항공 기상 데이터(항공기상청 TAF/METAR API) 구조를 스키마에 얹어 보니, 현재 모델이 **단방향·평문**이라 "XML 수신 → 가공 → REST 제공" 같은 중계형 연동을 표현하지 못했다.

- `_common.schema.json`에 `InterfaceField`/`InterfaceEndpoint` `$defs`를 신설하고, 연동 항목을 `source`(수신)/`provision`(제공) **2채널 + `fields[]`** 구조로 전면 개편했다.
- IDS 규격서는 **5블록 카드**(개요/수신/수신필드/제공/제공필드)로 재설계했다. 필드 표는 검증된 PDS의 `fields[]` 표 패턴을 재사용했고, 수신/제공 채널 표는 같은 9필드로 대칭화했다.
- 순서 전략을 의식적으로 지켰다 — **되돌리기 어려운 양식(docx) 수술 전에, 되돌리기 쉬운 스키마·샘플 계층부터** 바꿔서 검증했다.
- check-traceability에 `fields[].logicalRef` → 논리 데이터 속성 추적 검사를 추가해, 연동 필드가 논리 레이어에 닿아 있는지를 기계가 보게 했다.

> 스키마는 머리로 설계한 모델이 아니라 실데이터가 두드려서 모양이 잡힌다. TAF API 하나가 평문 모델을 중계형 모델로 바꿨다.

## 결정 3 — 스키마 검증·추적성 게이트를 CI로 올리다

워크플로우 전체를 검토하고 검증 인프라를 한 번에 보강했다.

- `common/schema_validate.py` 신설 — draft-07 스키마들을 `referencing.Registry`로 묶어 상대 `$ref`를 해석하고, `{stem}.json → {stem}.schema.json` 매핑을 일괄 검증한다. 단독 실행용 `validate.py` CLI도 추가.
- `generate.py --check`(스키마+추적성 게이트), `parse.py --diff`(`common/json_diff.py`로 왕복 변경 가시화)를 붙이고, GitHub Actions CI(`.github/workflows/ci.yml`)로 묶었다.
- 검증 모듈이 가동 즉시 밥값을 했다 — `example.json` 3개의 `project` 블록이 별칭 형식(`projectNameKr`)으로 정본(`code/nameKr/nameEn`)과 어긋나 있던 드리프트를 그 자리에서 적발했다.

[#11]에서 round-trip을 스모크로 올렸다면, 오늘은 그 앞단 — 입력 JSON이 스키마·추적성부터 정합한지 — 를 게이트로 세운 것이다.

## 결정 4 — 다이어그램 규약을 단일 출처로 모으다

다이어그램 명명·경로 규약이 파서 4종과 ERD 생성기에 흩어져 있던 것을 `common/diagram_paths.py` 한 곳으로 모았다.

- `{SYS}-{약어}DG-{분류}-{NNN}.puml` 명명 규약의 단일 출처. 실제 예시 저장소의 디렉터리 구조를 정본 삼아, 단계>유형 계층(`diagrams/analysis/usecase/` 등)을 우선 탐색하고 legacy 구조는 폴백으로 받는다.
- 다른 다이어그램을 import만 하는 **OVERVIEW 파일은 파싱 입력에서 제외**하고 generate 시에만 만들어 내도록 `is_overview()`/`overview_filename()` 헬퍼를 추가했다. 조합 전용 진입점이 데이터로 역류하지 않게.
- ERD 출력은 `{SYS}-ERDG-*.puml` split 모드(root+partials)로 정리했다.

## 결정 5 — 두 시스템에 실전 투입하다

저녁에는 도구를 SDSP 밖으로 끌고 나갔다. 두 시스템의 문서 저장소에 전체 파이프라인을 돌렸다.

- **IAMS**: 문서 35종 + ERD 7파일 생성. 구버전 데이터(snake_case 필드, 구 식별자 토큰)를 정본 규칙으로 마이그레이션하고 requirements 30건을 정규화했다. 스키마·추적성 ERROR/WARN 0건.
- **FDSP**: 전체 산출물 35종 + ERD 3파일, **39/39 성공**. 이 과정에서 env(`SYSTEM_CODE=SDSP` 복붙 오타)·데이터(FLSP)·폴더(fdsp)가 셋 다 다른 3자 불일치를 발견해 FDSP로 통일했다.

도구가 잡아낸 건 도구 자신의 버그가 아니라 **데이터와 환경의 불일치**였다. 게이트가 있으니 다른 시스템 투입이 "돌려 보고 눈으로 확인"이 아니라 "ERROR/WARN 0건 확인"으로 끝난다.

## 의도치 않은 함정

- **Word가 표를 합쳐 버렸다** — `RuntimeError: 템플릿 카드 표 5개를 찾지 못했습니다`. 원인은 코드가 아니라 Word였다. 사이에 단락 없이 인접한 표들을 Word에서 열고 저장하면 **하나의 표로 병합**하는 OOXML 동작 때문에, 5개 표(6+7+3+7+3행)가 26행짜리 표 1개가 돼 있었다. 양식 표 사이 빈 단락 삽입 + generator의 위치 고정 탐색을 스캔 방식으로 + 출력 시에도 표 사이 단락 삽입, 3중으로 견고화했다.
- **cp949 콘솔이 두 번 물었다** — `✓` 출력이 Windows 콘솔에서 크래시해 stdout을 UTF-8로 reconfigure했는데, 이번엔 `-h`가 help 텍스트의 em-dash에서 터졌다. argparse가 reconfigure **전에** 출력하고 있던 것 — reconfigure를 `parse_args` 앞으로 옮겨서야 끝났다.
- **정합은 양방향이었다** — Confluence「SW 산출물 식별자 정책」과 코드를 전수 대조하다 `common/identifier.py`의 `_TYPE_TOKENS` 정규식에 IDE만 누락(LDE/PDE는 있음)된 걸 발견해 코드를 고쳤고, 역으로 Confluence 표의 오타(RDD/RDS → LDD/LDS)를 발견해 문서 쪽을 고쳤다. 정본 대조는 코드→문서 한 방향이 아니었다.

## 마무리

오늘은 연동 데이터 라인을 역파서까지 닫고, 스키마를 실데이터에 맞춰 갈아엎고, 그 전체를 게이트 뒤에 세운 뒤 두 시스템에 투입한 날이다. 관통하는 결은 셋이다.

- **왕복이 닫혀야 산출물이다** — IDR/IDS 역파서 신설로 연동 데이터도 빈 베이스에서 19필드 전부 복원되는 왕복을 갖췄다.
- **실데이터가 스키마를 설계한다** — TAF/METAR 실구조 하나가 평문 모델을 source/provision 중계형 모델로 바꿨다. 머리로 만든 스키마는 실데이터 첫 충돌까지만 유효하다.
- **게이트가 있어야 실전 투입이 가볍다** — schema_validate·--check·CI 위에서 IAMS·FDSP 일괄 생성이 ERROR/WARN 0건 확인으로 끝났고, 게이트는 도구 버그 대신 데이터·환경 불일치를 잡았다.

다음에 할 것:

- **IAMS·FDSP 산출물 내용 검수** — 오늘 생성분은 스키마·추적성 통과 기준의 초안이다. 내용 차원의 검수와 보강이 남았다.
- **연동 샘플의 실데이터 커버리지 확대** — TAF/METAR로 검증한 중계형 모델을 다른 연동 유형(파일 연계, DB 링크 등)으로도 두드려 본다.
- **legacy 폴백 일몰 시점 결정** — `diagram_paths.py`의 구 구조 폴백을 언제 닫을지, [#9]의 폴백 정리 원칙대로 마감 시점을 정한다.

[#4]: /2026/05/22/artifact-transformer-4/
[#9]: /2026/06/04/artifact-transformer-9/
[#11]: /2026/06/09/artifact-transformer-11/
