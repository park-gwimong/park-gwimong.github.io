---
title: "artifact-transformer 작업 일지 #10"
subtitle: "데이터 정의서·명세서 산출물을 더하고, 논리/물리로 갈라 OOXML 양식까지 정합시키다"
pubDate: 2026-06-08T10:00:00+09:00
category: "devlog"
tags: ["Python", "OOXML", "python-docx", "JSON Schema", "CLI", "Working Log"]
math: false
draft: false
---

> 이 글은 2026-06-08 하루 동안 `artifact-transformer`에 **데이터 정의서·명세서** 산출물을 더하고, 그것을 **논리/물리로 갈라** Word·Excel 양식까지 정제 산출물과 정합시킨 작업 기록이다.

## 배경

`artifact-transformer`는 Jira 이슈와 PlantUML 다이어그램을 입력으로 받아 요구사항·유스케이스·기능·시퀀스 명세서와 단위·통합·운영·인수 시험서 등을 docx/xlsx로 자동 생성·역파싱하는 도구다 ([#4] 참조).

[#9]까지 무게중심은 시험 산출물 라인을 새 스키마에 정합시키고 도출 스캐폴딩을 채우는 쪽이었다. 오늘은 손이 **데이터(data) 산출물**로 넘어왔다. SDSP(항공 지원 시스템)가 다루는 NOTAM·AIP·METAR/SPECI·TAF·지형지물·DEM 등 여러 종 데이터를, 시스템이 어떻게 정의하고 명세하는지를 담는 **데이터 정의서(xlsx)·데이터 명세서(docx)**가 아직 없었다.

오늘 일은 두 갈래로 흘렀다. 하나는 **generate/parse 엔진과 CLI에 데이터 산출물을 얹는** 일, 다른 하나는 **Word·Excel 양식 자체를 정제 산출물과 칸·구조·서식까지 맞추는** 일. 그리고 작업 도중 "데이터를 **논리/물리/인터페이스**로 나누라"는 요구가 들어와, 두 갈래가 그 분리 위에서 다시 엮였다.

## 문제

손대기 전 어긋나 있던 것들.

1. **CLI가 산출물 코드로는 못 골랐다** — `generate.py`/`parse.py`의 selector가 key·그룹·분류·한글 별칭만 받았다. 실무에서 부르는 실제 산출물 코드(`AN12-1`, `TE13-1`)로 직접 고를 수 없었다.
2. **데이터 산출물이 통째로 없었다** — 스키마·샘플·generator·parser·문서 코드 등록까지 처음부터 만들어야 했다.
3. **양식이 원본·정제 산출물과 어긋났다** — 데이터 정의서/명세서 템플릿의 컬럼·항목이 원본 SDSP 데이터 정의서, 그리고 형제 격인 기능 정의서/명세서와 들어맞지 않았다.
4. **데이터를 논리/물리로 가르면 한 모듈이 둘을 다뤄야 했다** — 논리 데이터 정의서/명세서(AN12)와 물리 데이터 정의서/명세서(DE31)가 같은 generator/parser를 공유한다는 모델을 코드·양식에 새겨야 했다.
5. **논리/물리 명세서 템플릿이 다른 스타일 체계였다** — 정제 명세서가 쓰는 Word 제목 스타일(Heading 1/2/3)과 자동 목차 필드가 이 경량 템플릿엔 아예 없었다.
6. **데이터 명세서 본문이 직접 서식 하드코딩** — 형제 산출물은 글꼴·스타일에 서식을 맡기는데, 데이터 명세서만 본문이 `Arial + #073763 + sz26`을 직접 박고 있어 톤이 따로 놀았다.

## 결정 1 — CLI에 '산출물 코드' selector를 더하다

실무에서 산출물을 부르는 이름은 `te13-1`, `an11-1` 같은 **코드**다. 그런데 도구는 내부 key(`utp`)·그룹·분류·한글 별칭만 알아들었다. 그래서 `generate.py`와 `parse.py` 양쪽에 코드 selector를 얹었다.

핵심은 `get_doc(doc_key).code`를 거꾸로 돈 `_BY_CODE` 역인덱스다. 모듈 로드 시 한 번 구성하고, `expand_selectors()`에서 `s.upper() in _BY_CODE`로 코드 분기를 더했다. 코드는 숫자·하이픈을 품어 대소문자 무시로도 한글 key·그룹·별칭과 충돌하지 않는다.

| 입력 | 해석 |
| --- | --- |
| `te13-1` / `TE13-1` | 단위 시험 계획서(utp) |
| `an11-1` | 업무 정의서(bd) |
| `데이터` (그룹) | dd ds 묶음 |

오타 힌트(`_suggest`) pool과 docstring·`--help` epilog·`--list` 안내·`selectors` 인자 help까지 코드를 함께 노출했다. `parse.py`에는 코드가 없는 다이어그램 산출물(ucdg/bcdg/cdg/sqdg)이 있는데, 이들은 `doc_key`가 없어 역인덱스에서 자연히 빠진다 — 문서 산출물만 코드로 매핑된다.

> 코드·그룹·한글 별칭이 한 자리에서 같은 selector로 모인다. 사용자가 부르는 이름이 곧 입력이 된다.

## 결정 2 — 데이터 정의서/명세서(AN12)를 generate/parse에 얹다

데이터 산출물은 기능 정의서/명세서(fd/fs)와 같은 골격을 공유한다고 보고, 그것을 본보기로 만들었다.

- `generator/an/generate_dd.py` — 데이터 정의서 **xlsx**. 데이터 시트 헤더는 `식별자 | 분류 | 데이터명 | 설명 | 제공기관(출처) | 연동 방식·포맷 | 비고`.
- `generator/an/generate_ds.py` — 데이터 명세서 **docx**. 분류별 섹션 + 항목 카드(분류·정의·구성요소·제공기관·연동 방식·포맷·예시·갱신주기·참고자료).
- `schema/data.schema.json` — `categories` + `dataItems`. 공통 `_project`/`_document`/`_common` $ref 결합.
- `samples/data.sample.json` — SDSP 실데이터(NOTAM·AIP·METAR/SPECI·TAF·지형지물·DEM) 기반.

`document_codes.py`에 dd(AN12-1)·ds(AN12-2)를 등록하고, `generate.py` ARTIFACTS와 `data`/`데이터` 그룹을 더했다. parser는 rd/rs(요구사항 정의서/명세서)와 **동일한 관계로 모델링**했다 — `parse_dd`(xlsx 카탈로그)·`parse_ds`(docx 카드에서 분류·항목 추출), flat top-level 출력.

스키마 검증에서 한 번 막혔다. `$ref`가 `$id`의 https URI를 기준으로 원격 조회를 시도해 실패했는데, 모든 스키마 파일을 **로컬 schema store**에 올려 `RefResolver`로 풀었다. generate→parse 왕복으로 분류·카드 필드가 제자리에 복원되는지 확인했고, 스모크 테스트는 58건 모두 통과했다.

## 결정 3 — 데이터를 논리/물리/인터페이스로 분리

작업 도중 "데이터를 논리·물리·인터페이스로 나누라"는 요구가 들어왔다. 단일 `data`(AN12)였던 것을 **논리 데이터 정의서/명세서(AN12)**와 **물리 데이터 정의서/명세서(DE31)**로 갈랐다.

핵심 모델은 *한 generator/parser 모듈이 template+sample 조합으로 양쪽을 다룬다*는 것이다. `generate_dd/ds`·`parse_dd/ds`는 그대로 두고, 논리·물리는 서로 다른 템플릿과 샘플을 물린다.

- 논리는 `attributes[]`(LogicalAttribute = `{name, meaning, domainConstraint, required}`), 물리는 `fields[]`(PhysicalField = `{name, physicalType, length, unit, range, nullable, key, description}`).
- 4건(dd/ds × 논리/물리) round-trip을 경험적으로 먼저 돌려, 단일 모듈이 두 레이아웃을 모두 처리함을 확인한 뒤 매핑을 확정했다.
- 스모크 테스트의 `STD_GENERATORS`는 **모듈명을 키로** 쓰는 구조라, 같은 모듈에 두 케이스(논리/물리)를 담으려고 키·라벨을 구분지었다. 전체 62건 통과.

> 산출물이 둘로 갈려도 코드는 하나다. 갈리는 것은 입력(template+sample)이지 처리 로직이 아니다.

## 결정 4 — 템플릿을 OOXML 수준에서 정제 산출물과 정합

오늘 가장 손이 많이 간 갈래다. 양식의 표지·테마·임베드 폰트를 **byte-for-byte 보존**해야 했기에, openpyxl/python-docx로 다시 쓰는 대신 `zipfile`로 inner XML을 직접 편집했다(검증만 python-docx로).

- **컬럼·항목 정합** — 정의서 xlsx의 데이터 시트 컬럼과 명세서 docx의 항목 카드를 원본·정제 산출물에 맞춰 더했다. 표지 제목도 `데이터(연동) 정의서/명세서`로 통일하고, 명세 범위를 밝히는 문단을 끼웠다.
- **목차(TOC) + Heading 스타일** — 경량 템플릿엔 Word 제목 스타일과 자동 목차가 없었다. 14개 제목을 `Heading 1/2/3`(outline 0/1/2)로 바꾸고, 정제 명세서의 진짜 **TOC 필드(`<w:sdt>`)**를 통째로 이식했다. 다행히 대상 템플릿엔 `Heading1/2/3` 스타일이 이미 정의돼 있어 `styles.xml`은 건드리지 않고 문단별 `pStyle`·`outlineLvl`만 손댔다.
- **패키지 병합** — 여기서 진짜 갈림이 드러났다. `[양식] AN12-2 …docx`(MAIN)는 회사 표지 패키징(임베드 폰트 4종·로고·머리글/바닥글)을 갖췄지만 **내용이 요구사항 명세서를 byte-for-byte 복사한 잘못된 파일**이었고, `…_.docx`(UNDERSCORE)는 **올바른 논리 내용**이나 폰트·로고 없는 경량본이었다. 그래서 **MAIN의 패키지 + UND의 내용**으로 병합했다 — UND의 `document.xml`을 MAIN 패키지에 얹되, 로고 drawing이 쓰는 `xmlns:a`·`xmlns:pic` 네임스페이스를 루트에 주입하고, `Heading1/2/3` → MAIN의 `1/2/3` 스타일로 리맵(이름이 "heading N"으로 같아 목차 수집이 그대로 동작), `sectPr`(머리글/바닥글+A4)와 `numbering.xml`을 교체했다. 논리·물리 두 파일에 같은 로직을 적용했다.
- **글꼴·스타일 일치** — 데이터 명세서 본문이 `Arial + 진한 파랑 #073763 + sz26`을 직접 박고 있었다. 제목 12개의 run 서식을 **맑은 고딕 글꼴만** 지정으로 바꿔(굵기·크기·색은 스타일 1/2/3에 위임), 본문의 Arial을 일괄 맑은 고딕으로, 제목 텍스트색 `#073763`은 제거했다. 단, 형제 명세서도 쓰는 **네이비 표 헤더 음영**(`<w:shd w:fill="073763">`)은 일관성을 위해 그대로 뒀다.

## 의도치 않은 함정

- **python과 bash가 서로 다른 파일시스템을 봤다** — bash 쪽 `python3`가 Windows-native라 repo를 직접 보는데, scratch 파일을 엉뚱한 위치에 써 Read로 못 읽는 일이 있었다. 환경을 진단한 뒤 한 스크립트 안에서 추출·편집·검증을 끝내는 방식으로 정리했다. 콘솔이 cp949라 추출 XML은 파일로 써서 Read로 읽었다.
- **목차 추출이 잘못 잘렸다** — 블록 시작을 `rfind('<w:p')`로 찾았더니 `<w:pPr>`에도 걸려 영역이 어긋났다. 문단 경계를 정확히 잡는 finder로 바로잡았다.
- **색상 제거 정규식이 표 헤더 음영까지 잡으려 했다** — `#073763`이 제목 텍스트색(`<w:color>`)과 표 헤더 음영(`<w:shd w:fill>`) 두 형태로 있었는데, 텍스트색만 지워야 하는 것을 assert가 음영까지 걸어 멈췄다. assert는 쓰기 *전*에 돌아 파일은 무사했고, 텍스트색만 겨냥하도록 정정했다.
- **테스트 4건 실패가 사실은 rename 때문이었다** — 데이터→논리/물리 rename 직후 스모크 4건이 빨갰는데, 내용·파싱 오류가 아니라 파일을 열기 전 `template.exists()`에서 막히는 **template-not-found**였다. 매핑을 논리·물리의 비-underscore 이름으로 갱신하니 62건 모두 초록.

## 마무리

오늘은 데이터 산출물 라인을 새로 세우고, 그것을 논리/물리로 갈라 OOXML 양식까지 형제 산출물과 정합시킨 날이다. 관통하는 결은 셋이었다.

- **갈려도 코드는 하나** — 논리·물리로 산출물이 둘이 돼도 `generate_dd/ds`·`parse_dd/ds`는 한 모듈이다. 갈리는 것은 template+sample이라는 입력뿐이다([#9] 단일 출처 원칙의 연장).
- **양식은 보존하며 surgical하게** — 표지·폰트·테마를 byte-for-byte 지키려 `zipfile`로 inner XML만 외과적으로 손댔다. scratch 스크립트로 만들고, python-docx로 검증하고, 흔적을 지우는 루프를 반복했다.
- **페이크 대신 사실을 드러낸다** — 경량 템플릿에선 Heading 스타일 없이 진짜 목차가 불가능하다는 사실을 가짜 목차로 덮지 않고, *(A) 경량 유지* vs *(B) Heading 체계 전환 + 진짜 목차* 선택지로 올려 결정을 받았다.

다음에 할 것:

- **인터페이스 데이터 정의서/명세서 정합 완성** — 오늘은 논리(AN12)·물리(DE31)까지 갈랐다. `interface-data.example.json` 샘플은 있으나 generator/parser 정합이 아직 남았다. 같은 단일 모듈·template+sample 모델로 마저 묶는다.
- **데이터 산출물 round-trip을 CI 게이트로** — 지금은 손으로 돌려 본 generate→parse 왕복을, 샘플 수정 시 자동으로 걸리도록 스모크 테스트에 묶어 회귀를 막는다.
- **로고 floating 위치 수동 확인** — 병합한 로고가 MAIN(요구사항 명세서) 표지 좌표 기준이라, 데이터 명세서 표지에서 미세하게 어긋날 수 있다. Word에서 한 번 열어 좌표를 맞춘다(내용·연결은 정상).
- **legacy 단일 `data` 폴백 정리 시점** — 논리/물리 분리로 단일 `data` 표기가 과도기적으로 남았다. 마이그레이션이 끝난 항목부터 폴백을 걷어내 두 표기가 영구 공존하지 않게 한다.

[#4]: /2026/05/22/artifact-transformer-4/
[#9]: /2026/06/04/artifact-transformer-9/
x