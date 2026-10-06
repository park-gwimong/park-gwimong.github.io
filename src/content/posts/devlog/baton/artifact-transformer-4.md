---
title: "artifact-transformer 작업 일지 #4"
subtitle: "Generator/Parser 19개에서 공통 모듈 점진 추출"
pubDate: 2026-05-22T15:00:00+09:00
category: "devlog"
tags: ["Python", "Refactoring", "Common Module", "docx", "Working Log"]
math: false
draft: false
---

> 어제 하루 동안 `artifact-transformer`의 Parser 2개 + Generator 17개(총 19개 파이썬 파일, 약 6,400줄)를 두 worktree(`condescending-easley`, `serene-faraday`)에서 점진적으로 공통 모듈화했다. 한 번에 큰 `common/` 패키지를 설계해 일괄 추출하지 않고, 좁은 도메인에서 추출 → 검증 → 일반화의 6단계로 나눠서 진행한 과정과 그 이유를 정리한다. 메타데이터·식별자 정책 흐름은 [#3]에 따로 있다.
> 

## 배경

`artifact-transformer`는 Jira 이슈와 PlantUML 다이어그램을 입력으로 받아 요구사항 정의서/명세서, 유스케이스 명세서, 단위·통합·운영·인수 시험서 등의 SW 산출물을 docx/xlsx로 자동 생성하는 도구다.

구조는 단순하다.

- **Parser** — Jira CSV/API, 유스케이스 다이어그램, 컴포넌트 다이어그램 등을 읽어 `requirements.json`, `usecase.json`, `unit.json` 같은 정규화된 JSON으로 변환
- **Generator** — 그 JSON과 양식 파일(docx/xlsx)을 받아 산출물 채워서 출력

같은 패턴이 19개 파일에 반복돼 있었다. 환경 변수 로딩, JSON 입출력, 양식 파일 경로 해석, 표 채우기, 개정 이력 삽입 — 어느 파일을 열어도 비슷한 30~50줄짜리 보일러플레이트가 있었다.

## 문제

전체 코드를 검토했더니 다음과 같은 문제가 보였다.

1. **CSV 인코딩 불일치** — `parse_jira.py`는 `utf-8-sig`, 다른 파일은 `utf-8`. 한글 문자 손상 가능성.
2. **JSON 로드 예외 처리 부재** — 모든 `load_json()` 호출에 try/except 없음. 손상된 파일이면 즉시 크래시.
3. **Windows 하드코딩 경로** — `project.env`에 `WORK_DIR=C:\Users\parkg\...` 같은 백슬래시 경로가 그대로 노출됨.
4. **양식 파일 인덱스 의존** — `doc.tables[14]` 같은 절대 인덱스를 직접 참조. 표 한 개만 추가해도 깨짐.
5. **메타데이터 중복** — `project_code`, `system_code`, `writer/reviewer/approver` 등 동일한 메타데이터가 19개 generator에서 따로 채워짐.

특히 5번이 가장 컸다. 산출물 1개 추가할 때마다 같은 메타데이터 처리 로직을 또 한 번 복사해야 했다.

## 결정 1 — 도메인 하나(AT)에서 먼저 추출

처음 떠오른 방안은 "전체 generator를 한 번에 훑어서 공통 함수를 다 뽑자"였지만 보류했다. 19개 파일을 동시에 손대면 검증 범위가 폭발하고, 추출한 공통 함수가 실제 다른 generator에 잘 맞는지 검증할 방법이 없다.

그래서 인수 시험(AT) 4종(`atd/atp/atpr/atr`) 전용으로 `at_common.py`를 먼저 만들었다. 이 도메인은 다음 특성이 있다.

- 모두 같은 입력 (`acceptance.json`)을 공유
- 모두 같은 출력 양식 패밀리(`[양식] TE14-*.docx`)
- 메타데이터 처리, 표 채우기, 개정 이력이 거의 똑같음

4개 파일에서 공통 부분을 뽑으니 `load_data()`와 `main()` 두 함수로 정리됐다. 4개 generator는 각자의 차이점(섹션 채우기 로직)만 남기고 100~150줄로 줄었다.

## 결정 2 — "AT 전용"이 사실은 일반적이었다는 걸 발견

`at_common.py`를 다른 generator(UT, IT, OT)에도 적용 가능한지 검토했다. `at_common.py`의 `load_data()`는 사실 다음만 하고 있었다.

```python
def load_data(input_path):
    data = load_json(input_path)
    merge_project_metadata(data)  # _project.json 머지
    return data
```

그리고 `main()`은 `argparse` + 입출력 경로 해석 + `generate()` 호출 — generator 종류에 관계없이 동일했다.

이건 "AT 전용"이 아니라 "모든 generator 공통"이었다. 결정을 뒤집어 `at_common.py`를 폐기하고 `common/` 패키지로 일반화하기로 했다. 도메인별 변형이 필요했다면 그때 `at_common` 같은 도메인 레이어를 다시 만들 수 있다.

## 결정 3 — 책임 단위로 모듈을 쪼개기

`common/` 패키지를 한 파일로 만들지 않고, 책임 단위로 잘랐다.

| 모듈 | 책임 |
| --- | --- |
| `common/env.py` | `project.env` 로드, 경로 정규화 |
| `common/io_json.py` | JSON 로드/저장, 손상 파일 예외 처리 |
| `common/io_path.py` | 입력 파일 해석(`WORK_DIR`과 `SYSTEM_CODE` 조합) |
| `common/excel_utils.py` | openpyxl 기반 표 채우기, 셀 병합 보존 |
| `common/docx_utils.py` | python-docx 기반 표/플레이스홀더 치환 |
| `common/cover.py` | 표지 페이지 메타데이터 채우기 |
| `common/cli.py` | argparse 공통 옵션, `main()` 본체 |

쪼개고 나니 각 모듈이 100줄 미만이 됐고, 어떤 generator가 어떤 모듈을 쓰는지 import 문만 봐도 분명해졌다.

## 결정 4 — Parser 쪽도 같은 방식으로

Parser 쪽은 처음에 손대지 않았다. Generator만큼 통일된 패턴이 보이지 않았기 때문이다. 그런데 작업 중반에 Parser 2개에서도 같은 메타데이터 머지 코드가 반복되고 있다는 게 보였다.

`common/parser_merge.py`를 추가해 다음을 묶었다.

- `_project.json`의 프로젝트/시스템/문서 역할자 메타데이터를 파싱 결과에 자동 머지
- 옵션 추가 시 기존 값 초기화 여부 제어 (기본은 머지, `--reset` 옵션 시 초기화)

또한 `Parser/parse_utils.py`로 따로 있던 헬퍼를 `common/`으로 이동하면서 명칭을 재검토했다. "Parser 전용"이 아니므로 위치도 이름도 그에 맞게 바꿨다.

## 결정 5 — 기본 입출력 경로를 파서에 내장

Parser 호출 시 매번 `--input C:\...\Jira.csv --output C:\...\requirements.json` 같은 긴 경로를 적던 것을 정리했다. `project.env`의 `WORK_DIR`과 `SYSTEM_CODE`가 있으면 기본 입출력 경로가 자동으로 결정된다.

```
기본 입력: {WORK_DIR}/documents/{SYSTEM_CODE} - {타입명}.{ext}
기본 출력: {WORK_DIR}/documents/{타입명}.json
```

이 과정에서 다른 프로젝트(`loras-docs`)의 잔여 경로가 기본값으로 박혀 있던 버그를 찾아 같이 제거했다.

## 결정 6 — 스키마 변경을 같은 흐름에 흡수

중반에 `identifier_policy` 스키마가 flat 구조에서 nested category 구조로 바뀌었다.

```diff
-"identifier_policy": {
-  "format": "...",
-  "project_code": "...",
-  "category": "기능"
-}
+"identifier_policy": {
+  "category": {
+    "category1": { "FN": { "name": "기능", "definition": "..." } },
+    "category2": { ... },
+    "category3": { ... }
+  }
+}
```

이건 generator(요구사항명세서 3.1 분류 기준 섹션)와 parser(`parse_rd.py`, `parse_rs.py`)를 동시에 손봐야 했다. `common/` 분리가 미리 돼 있었던 덕분에, 메타데이터 머지 로직 한 곳만 바꿔도 19개 파일이 그대로 따라왔다.

다만 `common/` 안에서도 생성기와 파서가 같은 스키마를 양방향으로 쓰기 때문에, 한쪽만 바꾸면 "역방향 매핑이 다르다"는 오류가 즉시 났다. 스키마를 바꿀 땐 generator/parser를 같이 봐야 한다는 걸 다시 확인했다.

## 함정

- **두 worktree에서 같은 작업을 갈라쳐 진행** — `condescending-easley`(AT/공통 모듈 추출)와 `serene-faraday`(스키마 개편/Jira API 전환)를 동시에 돌렸다. 결과적으로 같은 generator에 양쪽 변경이 모두 들어가야 했고, 합칠 때 일부 파일에서 충돌이 났다. 다음에는 worktree를 갈라치기 전에 "이 작업이 다른 worktree와 같은 파일을 만질 가능성"을 먼저 짚어야 한다.
- **`at_common.py`라는 이름의 함정** — 도메인 이름을 모듈명에 박으면 "AT 전용이라 다른 데 못 쓴다"는 잘못된 신호를 준다. 작게 시작할 때도 이름은 `common/io_json.py`처럼 책임 단위로 잡는 게 안전하다. 이번에 결정을 뒤집어 `common/`으로 일반화하면서 한 번 더 확인했다.

## 마무리

약 6,400줄의 generator 17개 + parser 2개에서 메타데이터 처리·입출력·양식 채우기·표지 작성 부분을 `common/` 7개 모듈(약 600줄)로 추출했다. 각 generator는 평균 320줄에서 180줄로 줄었고, 이후 스키마 한 번 변경이 한 곳 수정으로 끝났다.

한 가지 다시 확인한 것: 처음부터 큰 공통 모듈을 설계하면 어떤 함수가 진짜 공통인지 알 수 없다. 한 도메인에서 추출해 검증한 다음 일반화하는 쪽이, 결과적으로 더 작고 명확한 공통 모듈을 만든다. "AT 전용"이 사실은 공통이었다는 걸 발견한 건 추출을 작게 시작했기 때문이다.

다음에 할 것:

- 양식 파일을 절대 인덱스 대신 플레이스홀더 텍스트로 찾도록 `common/docx_utils.py` 확장
- Generator 출력 후 `check-traceability`로 RQ ↔ UC ↔ TC 매핑 자동 검증
- LLM 기반 자동 채움 후보 식별 (`Sample/data/*_sample.json`에서 패턴 추출)