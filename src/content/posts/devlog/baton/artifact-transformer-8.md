---
title: "artifact-transformer 작업 일지 #8"
subtitle: "필드 개명·참조 전환·양식 변경을 generate/parse에 정합시키기"
pubDate: 2026-06-01T10:00:00+09:00
category: "devlog"
tags: ["Python", "JSON Schema", "Schema Migration", "Round Trip", "Backward Compatibility", "Working Log"]
math: false
draft: false
---

> 이 글은 2026-06-01 하루 동안 `artifact-transformer`의 바뀐 스키마와 양식을 generate/parse 코드에 다시 정합시킨 작업 기록이다.

## 배경

`artifact-transformer`는 Jira 이슈와 PlantUML 다이어그램을 입력으로 받아 요구사항·유스케이스·기능·시퀀스 명세서와 단위·통합·운영·인수 시험서 등을 docx/xlsx로 자동 생성하는 도구다 ([#4] 참조).

[#7]에서 11종 산출물이 서로를 ID로 참조하는 그물을 단일 출처 기준으로 다시 짰다. 그 정리가 끝나자, 이번엔 **스키마와 양식 자체가 움직였다.** 설계 쪽에서 유스케이스·시퀀스 스키마의 필드 이름이 바뀌고(관련 요구사항 → 관련 기능, `usecase` → `relatedUc`), 엑셀·워드 양식에서 칸이 더해지거나 빠졌다.

generate/parse 코드는 그 스키마와 양식의 *종속물*이다. 원천이 바뀌면 따라가는 수밖에 없다. 오늘은 하루 종일 그 정합 작업이었고, 통과 기준은 하나로 일정했다.

> 스키마와 양식이 진실의 원천이고, generate/parse는 거기에 맞추는 쪽이다. 단, 옛 데이터는 폴백으로 받아들여 round-trip을 깨지 않는다.

## 문제

손대기 전에 어긋나 있던 것들.

1. **유스케이스 필드 `requirements`가 스키마에서 `relatedFn`(관련 기능)으로 개명** — "관련 요구사항"이 "관련 기능"으로 의미가 바뀌었는데, UC 스크립트들은 아직 옛 이름을 읽고 쓰고 있었다.
2. **UCS 명세서 양식에 "관련 기능" 전용 행이 신설** — 코드는 관련 기능을 비고(remarks) 셀에 `"관련 기능: ..."` 라벨로 끼워 넣고 있었는데, 양식이 전용 행을 따로 마련해 줬다.
3. **`parse_sqdg`가 참조여야 할 `participant.json`에 쓰고 있었다** — 시퀀스 다이어그램을 파싱하면서 새 참여자를 카탈로그에 자동 등록하고 있었다. `participant.json`은 참여자의 단일 출처인데, 파서가 거기에 손을 대면 더는 "단일 출처"가 아니다.
4. **시퀀스의 유스케이스 참조 필드가 스키마와 어긋남** — `sequence.schema.json`과 샘플은 `relatedUc`인데, `parse_sqdg`·`generate_sqd`·`init_sequence` 세 스크립트가 모두 `usecase`를 쓰고 있었다.
5. **시퀀스 정의서 양식이 7열 → 5열로 축소·재배치** — 특히 관련 유스케이스 열이 **B → D로 이동**했다. 코드는 7열 기준이라 관련 유스케이스를 엉뚱한 칸(B=시퀀스명 자리)에 쓰고 있었다.
6. **유스케이스 `packages[]`가 `function.json`의 분류 체계와 중복** — 같은 분류(category) 정의가 유스케이스에도, 기능에도 박혀 있었다. [#7]의 단일 출처 정리가 닿지 못한 마지막 중복이었다.

## 결정 1 — `requirements` → `relatedFn` 개명, 옛 키는 읽기 폴백

최신 `usecase.schema.json`이 `usecases[].requirements`를 `relatedFn`으로 바꿨다(관련 요구사항 → 관련 기능). UC 스크립트 네 개(`generate_ucd`/`generate_ucs`/`parse_ucd`/`parse_ucs`)와 `parse_ucdg`의 템플릿까지, 그 이름을 부르는 모든 곳을 `relatedFn`으로 옮겼다. 들어오는 옛 데이터는 깨지지 않도록 `requirements`를 읽기 시점 폴백으로 남겼다.

함께 딸려온 변경 하나. `packages[]`가 `_common.schema.json#/$defs/Category`를 참조하도록 바뀌었는데, 필드 모양(`id`/`name`/`description`)이 그대로라 스크립트 로직은 손댈 게 없었다.

그런데 실제 데이터로 generate→parse 왕복을 돌리자 UCS에서 버그가 잡혔다. **비고(remarks)가 `relatedFn`에 통째로 빨려 들어갔다.**

원인은 셀 안의 줄바꿈이었다. `table_cell_text`가 셀의 `w:br`(줄바꿈)을 보존하지 못해, `relatedFn` 줄과 `remarks` 줄의 경계가 사라진다. 경계를 복원할 유일한 단서는 `"관련 기능:"` **라벨 자체**인데, 내가 라벨을 줄 *앞*에 둔 탓에 greedy 캡처가 뒤따르는 remarks까지 삼켜 버렸다. `parse_ucs`의 기존 추출 로직은 라벨을 줄 *끝*에 두는 전제(`remarks = 라벨 앞의 텍스트`)였다.

그래서 `generate_ucs`를 라벨-끝 순서로 맞췄다.

> 줄바꿈이 사라지는 셀에서는 **라벨 자체가 구분자다.** generator와 parser가 라벨 위치에 대해 같은 약속을 공유해야 round-trip이 닫힌다.

## 결정 2 — UCS 양식의 "관련 기능" 전용 행 (10행 → 11행)

결정 1의 라벨-끼워넣기는 임시방편이었다. 마침 양식이 더 나은 길을 열어 줬다. 새 UCS 카드는 10행에서 11행으로(0-기반 `row0`~`row10`) 늘면서, `row8`에 "관련 기능" **전용 행**이 생기고 비고가 `row9`로 밀렸다.

```
row4  사후조건       row8  관련 기능   ← 신규 전용 행
row5  기본 흐름       row9  비고
row6  대안 흐름       row10 여백
row7  예외 흐름
```

전용 행이 생긴 이상, 비고 셀에 라벨로 끼워 넣을 이유가 없다.

- `generate_ucs.py` — `CARD_ROW_MAP`에 `row8 → relatedFnDisplay`(관련 기능), `row9 → remarks` 매핑을 넣고, `relatedFn`을 전용 행에 직접 기록. 결정 1의 `"관련 기능: ..."` 라벨 hack 제거.
- `parse_ucs.py` — **라벨 기반 추출**로 전환. 신규 양식은 "관련 기능" 전용 행에서 곧장 읽고, 전용 행이 없는 구 양식(10행)은 비고 셀의 `"관련 기능:"`/`"관련 요구사항:"` 라벨 분리로 폴백.

전용 행에서 읽으니 `relatedFn`과 `remarks`가 깨끗이 분리됐다 — 결정 1의 라벨 병합 문제가 양식 차원에서 사라진 셈이다.

## 결정 3 — `parse_sqdg`를 `participant.json` 참조 전용으로

`parse_sqdg.py`는 `diagrams/sequence` 하위의 모든 시퀀스 다이어그램을 파싱해 `sequence.json`을 만든다. 그런데 파싱 도중 puml에서 발견한 참여자를 `participant.json`에 자동 등록(생성/수정)하고 있었다. `participant.json`은 참여자의 **단일 출처 카탈로그**이고, `sequences[].participants[]`는 거기서 id+type만 참조해야 하는데, 파서가 카탈로그를 쓰면 그 전제가 무너진다.

쓰기 경로를 통째로 들어냈다.

- **제거**: `_ensure_participants_in_catalog()`, `_catalog_path()`, `_TYPE_TO_COLLECTION`, `parse_puml`의 `_extracted_participants` 반환, `convert`의 카탈로그 동기화 단계.
- **추가**: `_load_participant_type_map()` — `participant.json`의 컬렉션(actors/systems/externalSystems/components)을 훑어 `{id: type}` 매핑을 빌드(읽기 전용). puml 키워드로 추론한 참여자 type을 카탈로그 기준으로 **보정**하되, 카탈로그에 없는 id는 추론값을 유지하고, 카탈로그가 아예 없으면 키워드 폴백으로 그대로 동작한다.

검증은 세 가지를 봤다 — (1) 카탈로그 기준 type 보정(`svcSample` system→component, `ext_idp` external→system), (2) `participant.json` 해시 불변(무수정), (3) 카탈로그 부재 시 폴백 + 파일 미생성. 모두 의도대로였다.

## 결정 4 — `usecase` → `relatedUc` 세 스크립트 정합

`sequence.schema.json`과 샘플은 유스케이스 대응 필드를 `relatedUc`로 정의하는데, `parse_sqdg`·`generate_sqd`·`init_sequence` 세 스크립트가 `usecase`를 쓰고 있었다. 세 곳을 `relatedUc`로 맞추고, 들어오는 옛 `usecase` 키는 이관/읽기 호환으로 받았다.

- `parse_sqdg.py` — 출력 필드 `relatedUc`, puml 주석 마커는 `usecase:`/`relatedUc:` 둘 다 허용, `_migrate_legacy_uc()`로 옛 키 이관.
- `generate_sqd.py` — 관련 유스케이스 열을 `relatedUc`(구 `usecase` 폴백)에서 읽도록 변경.
- `init_sequence.py` — `_derive_sequence` 출력과 머지 규칙을 `relatedUc`로, `_migrate_legacy_uc()` 추가.

이 작업에서 함정 하나를 밟았다(아래 **함정** 절 참고). 그 뒤로는 실제 파일을 건드리지 않는 **순수 함수 테스트**로 검증을 돌렸다 — init 도출·`parse_puml` 모두 `relatedUc` 생성/`usecase` 미존재, 마커 별칭 인식, 양쪽 병합에서 옛 `usecase`→`relatedUc` 이관과 messages/remarks 보존을 확인했다.

## 결정 5 — 시퀀스 정의서 5열 양식, 관련 유스케이스 B → D

시퀀스 정의서(DE12-1) 양식이 7열에서 5열로 줄었다.

| 열 | 헤더 | 필드 |
| --- | --- | --- |
| A | 식별자 | `id` |
| B | 시퀀스명 | `name` |
| C | 설명 | `description` |
| **D** | **관련 유스케이스** | **`relatedUc`** (구 `usecase` 폴백) |
| E | 비고 | `remarks` |

기존 `generate_sqd.py`는 7열 기준이라 관련 유스케이스를 `B`(시퀀스명 자리)에 쓰고 있었다 — 열 이동을 모른 채로. 매핑을 새 5열로 맞추고, 양식에서 빠진 **참여자·메시지 흐름 열** 관련 코드(`_format_participants`, `_format_messages`, 카탈로그 로더 일체)를 정리했다.

참고로 `sequence.json`의 `participants`/`messages` 필드 자체는 그대로 보존된다. 정의서에서 표출만 빠졌을 뿐, 그 내용은 명세서(DE12-2) 영역으로 옮겨갔다(생성기 신규 작성은 다음 과제 — 마무리 참조).

샘플 `sequence.json`으로 xlsx를 만들고 다시 읽어 **D열 = `relatedUc`**가 정확히 일치하는지 확인했다(`relatedUc` 없는 시퀀스는 D 공란).

## 결정 6 — `packages[]` 스키마 제거 → `function.json` category 참조

마지막은 [#7]의 단일 출처 정리가 닿지 못했던 중복이다. 유스케이스의 `packages[]` 카탈로그를 스키마에서 들어내고, `usecases[].package`가 `function.json`의 `categories[].id`를 참조하도록 바꿨다. `function.json`은 이미 `categories[]`(id/name/description)를 갖고 `functions[].category`가 이를 참조하는 — 유스케이스 `packages[]`와 똑같은 모양이었다.

- **스키마/샘플** — `usecase.schema.json`에서 top-level `packages[]` 제거(`required`에서도 제외), `usecase.sample.json`의 `package`를 function 카테고리 id로 재매핑.
- **공통 헬퍼**(`identifier_policy.py`) — `load_function_categories()` / `build_category_maps()`(id↔name). [#7]에서 만든 actor 매핑과 같은 패턴이다.
- **generate** — `generate_ucd`는 분류(B열)를 package id → 카테고리 **name**으로 해석해 표시하고, `generate_ucs`는 헤딩·패키지 표를 유스케이스 `packages[]`가 아닌 function.json categories에서 가져온다(`function.json` 부재 시 raw id 폴백).
- **parse** — `parse_ucd`는 표시 name → id로 역해석, `parse_ucdg`는 제거된 `packages[]` 출력을 중단(per-usecase `package`는 유지). `parse_ucs`는 헤딩 `[id]`에서 id를 그대로 뽑아 동작은 했지만, 대칭을 위해 `name→id` 해석을 추가했다.

여기서 잠복 버그가 하나 드러났다. **`parse_ucs`가 package를 통째로 못 뽑고 있었다.** 추적해 보니 이 양식의 헤딩 스타일이 `pStyle="2"`(제목 2의 숫자 styleId)인데, 공통 리더의 `get_heading_text`는 `"Heading2"`/`"제목2"`만 인식하고 숫자 styleId는 헤딩으로 보지 않았다. 그래서 헤딩이 단 하나도 감지되지 않았던 것이다. `get_heading_text`가 숫자 styleId(`1`~`9` = 제목 1~9)도 인식하도록 넓혔다 — 모든 docx 파서에 공통으로 듣는 개선이다.

직접 소비처도 따라 고쳤다. `init_scenario.py`가 유스케이스 `packages[]`를 읽어 시나리오 패키지 이름을 만들고 있었다 — 제거된 필드를 그대로 두면 이름이 bare id로 격하되는 조용한 회귀가 난다. 여기도 같은 패턴으로 function.json categories를 참조하게 했다.

`function.json`을 `usecase.json` 옆에 둔 왕복 테스트로 generate_ucd 분류=카테고리명 → parse_ucd=id 복원, generate_ucs 헤딩/표=function 카테고리 → parse_ucs=id(`SAMPLE_QUERY`/`SAMPLE_WRITE`/`AUTH_SESSION`) 복원을 모두 확인했다.

## 함정

- **테스트가 실제 `project.env`를 로드해 작업 범위 밖 실파일을 건드렸다** — 결정 4에서 `init_sequence`의 round-trip 테스트를 돌리자, 그 스크립트가 실제 `project.env`를 읽어 `WORK_DIR`이 진짜 프로젝트를 가리켰고, 작업 범위 밖의 실제 `participant.json`(다른 저장소의 SDSP 카탈로그)에 `end_user` actor 한 건이 등록됐다. 되돌리려 했으나 자동 모드의 분류기가 타 저장소 파일 편집을 (옳게) 차단했고, 그 파일은 git 미추적이라 `checkout`으로도 못 되돌린다. 이후로는 **실 파일을 일절 건드리지 않는 순수 함수 테스트**로 검증했다. round-trip 테스트가 실 설정을 로드하는 한, 테스트 자체가 부작용을 낸다.
- **줄바꿈이 사라지는 셀에서는 라벨이 구분자다** — 결정 1에서 라벨을 줄 앞에 두자 greedy 캡처가 remarks를 삼켰다. `w:br`이 파싱에서 보존되지 않는 셀이라면, generator와 parser가 "라벨을 어디 두는가"에 대해 같은 약속을 공유해야 한다. 결국 결정 2에서 전용 행으로 옮겨 이 약속 자체를 없앴다.
- **스키마에서 필드를 제거하면 직접 소비처도 같이 손봐야 한다** — `packages[]`를 들어내자 그걸 읽던 `init_scenario`가 이름을 id로 격하시켰다. 스키마 제거는 "그 필드를 읽는 모든 곳"을 먼저 grep으로 뽑고 시작해야 조용한 회귀를 막는다.
- **헤딩 인식이 styleId 표기에 막혀 있었다** — `pStyle="2"` vs `"Heading2"` 한 끗 차이로 `parse_ucs`가 package를 통째로 못 뽑던 잠복 버그. 필드명 정합 작업이 아니었으면 계속 묻혀 있었을 것이다. 정합 작업은 종종 그 아래 깔린 버그를 끄집어낸다.
- **양식 열 이동을 코드가 모르면 값이 조용히 엉뚱한 칸에 들어간다** — 관련 유스케이스가 B→D로 옮겼는데 코드는 B에 계속 썼다. 에러도 안 난다. 양식이 바뀌면 열 매핑 전체를 새 양식 기준으로 다시 확인해야 한다.

## 마무리

오늘은 새 기능을 만든 날이 아니라, 바뀐 진실의 원천(스키마·양식)에 코드를 다시 맞춘 날이다. 관통하는 결은 세 가지였다.

- **원천이 바뀌면 generate/parse가 따라간다** — `relatedFn`, `relatedUc`, package→category, 5열 양식. 코드는 스키마·양식의 종속물이고, 어긋남은 늘 코드 쪽이 따라가서 메운다.
- **옛 데이터는 폴백으로 받되 새 진실로 수렴** — 모든 개명에 legacy 읽기 폴백을 달았다. 마이그레이션 중인 데이터를 깨지 않으면서도 출력은 새 스키마로 모인다.
- **round-trip 테스트가 정합의 게이트** — generate→parse를 실제 샘플로 돌리는 것만으로 remarks 병합 버그, 헤딩 미인식, 열 오배치가 그 자리에서 드러났다. 단, 테스트가 실 설정을 로드하면 테스트 자체가 부작용을 낸다는 걸 비싸게 배웠다.

다음에 할 것:

- **DE12-2 시퀀스 명세서 생성기** 신규 작성 — 정의서에서 빠진 참여자·메시지 흐름이 갈 곳(아직 생성기 부재)
- `init_sequence`도 `parse_sqdg`처럼 **`participant.json` 참조 전용**으로 (아직 actor를 카탈로그에 자동 등록)
- **테스트를 실 파일에서 격리** — `project.env`/`WORK_DIR`을 테스트가 오버라이드하도록 막아, round-trip 검증이 실제 카탈로그를 건드리지 못하게
- **양식↔스키마 열 매핑을 한 곳에 선언적으로** 두고 generate/parse가 공유 — 열 이동 같은 변경이 또 코드 양쪽에서 어긋나지 않게
- `relatedFn`/`relatedUc`의 **legacy 폴백 제거 시점** 정하기 — 폴백은 호환을 사지만 오래 두면 두 이름이 영구히 공존한다

[#4]: /2026/05/22/artifact-transformer-4/
[#7]: /2026/05/28/artifact-transformer-7/
