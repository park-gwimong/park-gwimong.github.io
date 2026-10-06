---
title: "artifact-transformer 작업 일지 #1"
subtitle: "산출물 데이터 구조 개선"
pubDate: 2026-05-18T15:00:00+09:00
category: "devlog"
tags: ["Python", "docx", "JSON Schema", "Working Log"]
math: false
---

> 이 글은 2026-05-18 하루 동안 `artifact-transformer` 프로젝트에서 진행한 작업을 정리한 초안이다.
> 

## 발단: integration.json 구조를 손대기 시작했다

`artifact-transformer`는 JSON 데이터와 시험 산출물 Word 양식(TE11~TE14 계열: 단위/통합/인수/운영 시험 계획서·절차서·정의서·결과서)을 양방향으로 변환하는 도구다. 한쪽에는 의미가 살아 있는 nested JSON이 있고, 다른쪽에는 기능영역1, REVIEWER, 영역코드 같은 placeholder가 박힌 docx 템플릿이 있다(이 글에서는 표기 충돌을 피하기 위해 중괄호는 생략한다). 사이를 잇는 게 `common/replacements.py`의 normalize/denormalize 헬퍼들이다.

아침에 통합 시험용 `integration.json`의 구조를 정리하기 시작했다. 시작은 가벼웠다:

- `references.domestic` / `references.international`의 항목 구조를 (number, name, version)으로 통일
- `test_target.functional_areas`에 `sequence_count`, `tc_count`, `preconditions` 추가
- `test_scope.exclusions`를 `test_target.exclusions` 아래로 옮기고 `test_scope` 자체는 제거
- `document.writer / reviewer / approver`를 문자열에서 (name, affiliation, date) 객체로 승격

네 가지 변경이지만 영향 범위는 컸다. 하루가 끝났을 때 손댄 파일은 이렇게 됐다.

```
common/replacements.py            26회
Generator/TE/generate_otp.py      19회
Generator/TE/generate_otpr.py     16회
Generator/TE/generate_itpr.py     15회
Generator/TE/generate_itp.py      14회
Parser/TE/parse_itp.py            10회
Generator/TE/generate_utpr.py      9회
Generator/TE/generate_otr.py       8회
Generator/TE/generate_otd.py       5회
... (총 ~20개 파일)
```

bash 헬퍼 호출은 78번. 거의 다 `python -c` 일회성 스크립트로 round-trip 테스트를 돌리거나 docx 내부 XML을 뜯어 보는 코드였다.

## 패턴 1: nested ↔ flat round-trip은 한 곳에서만

템플릿 치환은 평면적인 key-value를 좋아한다. WRITER, HARDWARE 같은 단일 placeholder를 일괄 치환하려면 nested 객체보다 flat dict가 편하다. 반면 사용자가 직접 편집하는 JSON은 의미 단위로 묶여 있는 편이 낫다.

그래서 두 모양 사이를 오가는 헬퍼를 `common/replacements.py`에 모았다.

```python
flat   = normalize_integration_data(nested)     # generator 진입 시
nested = denormalize_integration_data(flat)     # parser가 추출한 결과
ensure_integration_schema_skeleton(data)        # 빠진 필드 채움 + 구 형식 마이그레이션
fill_integration_env_defaults(data, env_overrides)
```

핵심은 "양 끝의 모양은 다르지만, 변환은 한 곳에서만 정의한다"는 점이다. 어제처럼 스키마가 흔들리는 날, 매핑 코드가 generator마다 흩어져 있었다면 같은 버그를 N번 고쳐야 했을 것이다.

## 패턴 2: 구 스키마 마이그레이션은 skeleton-ensure 시점에

`test_scope`를 없애고 `exclusions`를 옮기기로 했는데, 이미 만들어 둔 샘플 JSON과 사용자의 in-flight 데이터는 구 형식을 그대로 들고 있다. 매번 손으로 마이그레이션할 수는 없다.

`ensure_integration_schema_skeleton`이 이 일을 떠안았다. 호출 시 누락된 신 키를 만들면서, 구 키가 있으면 신 위치로 옮겨 준다.

```python
old = {
    'test_env':   {'exclusions': [{'target': 'OLD-ENV-EX',   ...}]},
    'test_scope': {'exclusions': [{'target': 'OLD-SCOPE-EX', ...}]},
}
ensure_integration_schema_skeleton(old)
# → old['test_target']['exclusions'] 안에 두 값이 합쳐져 들어감
# → old['test_scope']는 사라짐
```

장점: 호출자(generator/parser)가 "이게 신 스키마인지 구 스키마인지" 신경 쓸 필요가 없다. 단점: 마이그레이션 규칙이 자라면서 이 함수가 무거워진다. 적당한 시점에 한 번 정리할 필요는 있다.

## 패턴 3: 표지의 "성명/소속/날짜"는 placeholder가 아니라 테이블 셀

낮 무렵 "REVIEWER placeholder가 안 박힌다"는 보고가 들어왔다. 양식 docx를 뜯어 보니 작성/검토/승인 정보는 placeholder가 아니라 표지의 4행짜리 표였다. 머리행이 (분류, 성명, 소속, 날짜)로 잡혀 있고, 아래 3행이 작성/검토/승인.

placeholder 치환으로는 풀 수 없는 모양이다. 그래서 `common/cover.py`에 새 헬퍼를 추가했다.

```python
find_role_table_docx(body)     # 표지에서 4x4 역할 표를 찾아 반환
fill_role_table_docx(
    body,
    writer  ={'name': '...', 'affiliation': '...', 'date': '...'},
    reviewer={...},
    approver={...},
)
```

동시에 `build_docx_cover_map`에서 WRITER, REVIEWER 같은 표지용 placeholder 키들은 제거했다. 두 경로가 공존하면 누가 어디서 채워지는지 헷갈리고, 결국 한쪽이 다른쪽을 덮어쓰는 사고로 이어진다.

## 조용히 새는 매핑 누락

오늘 하루 가장 많이 본 패턴은 다음 형식의 메시지였다.

- "functional_areas의 id, name이 매칭되어 입력되어 있지 않아"
- "각 test_cases의 입력 명세, 시험 환경, step이 맵핑 되어 있지 않아"
- "itr 결과 탭의 기능영역이 미맵핑"
- "otpr 영역 코드 맵핑이 안 되어 있어"
- "otpr 운영 시험 절차에서 functional_area별 제목2 서식이 첫 영역만 추가됨"
- "첫번째 영역이 중복 생성되었어"

공통 증상: 코드는 잘 돌고, 산출물 docx도 생성되고, 외관상 아무 문제가 없다. 다만 결과를 사람이 열어 봐야 placeholder가 그대로 박혀 있거나 첫 영역만 들어 있다는 걸 알 수 있다. 단위 테스트로 잡기 까다로운 종류의 버그다.

**개선 아이디어 (다음 작업으로):**

1. **생성된 docx에 남은 placeholder 검출 검사.** 결과 파일의 텍스트를 한 번 스캔해서 중괄호로 감싼 토큰이 남아 있으면 경고를 띄운다. 진짜 중괄호 사용과 충돌하지 않게 placeholder 형식만 매칭하면 된다.
2. **functional_areas 같은 "각 항목마다 섹션 복제" 로직의 단위 테스트.** 어제 "첫 영역만 들어감" → "첫 영역이 중복됨"의 두 단계 버그가 모두 docx를 열어 봐야 보였다. 복제된 단락 수를 세는 짧은 테스트만 있어도 됐다.
3. **스키마 변경 시 영향 받는 generator/parser 목록을 코드에서 추적.** 지금은 머릿속에 "integration이 바뀌었으니 itp, itpr, itd, itr, 그리고 otp/otpr/otd/otr도"라고 떠올려야 한다. 매핑 테이블이 있으면 빠뜨릴 일이 줄어든다.

## 작은 깨달음 하나

오류 메시지 중 가장 가벼웠던 건 13시 21분의 `NameError: name 'json' is not defined`였다. 1300줄짜리 generator 안에서 `import json`을 빠뜨려 있던 평범한 실수. 무거운 스키마 작업 중에도 가장 시간이 안 든 수정이 가장 평범한 import 버그였던 게 묘하게 위안이 됐다.

오늘 작업은 "스키마를 정한다"가 아니라 "스키마와 그 주변의 코드/템플릿/마이그레이션이 어긋나지 않는 모양을 만든다"에 가까웠다. 다음에 또 한 번 정도는 더 흔들 거고, 그때까지 위의 검출 검사를 붙여 두는 게 우선순위가 높을 것 같다.