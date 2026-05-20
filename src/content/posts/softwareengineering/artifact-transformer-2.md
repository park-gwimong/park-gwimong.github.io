---
title: "artifact-transformer 작업 일지 #2"
subtitle: "산출물 출력 개선"
pubDate: 2026-05-19T15:00:00+09:00
category: "softwareengineering"
tags: ["Python", "docx", "JSON Schema", "Working Log"]
math: false
draft: false
---

## 배경

사내 표준 문서 산출물(운영 시험 정의서/계획서/절차서/결과서, 인수 시험 정의서/계획서/절차서/결과서)을 JSON 데이터로부터 자동 생성하는 `artifact-transformer`를 다듬는 중이다. 출력은 정해진 양식의 docx/xlsx로 떨어져야 하고, 입력은 `scenario.json`, `operational.json`, `acceptance.json`, `integration.json`처럼 도메인별 JSON 파일로 분리되어 있다.

이 구조에서 한 가지 신경 쓰이는 점이 있었다. **시험 케이스(TC)와 시나리오가 같은 정보를 두 번씩 들고 있다**는 점이다. 시나리오는 `mainFlow` 안에 절차를 가지고, TC는 `steps` 안에 다시 절차를 가진다. 시나리오에 `functional_area`/`requirements`/`related_usecase`가 있는데, TC에도 같은 이름의 필드가 있다. 즉, 시나리오를 한 번 고쳐도 TC를 또 손대야 하는 상황. 오늘은 이 중복을 정리하고 시험 문서 스키마를 시나리오 기준으로 다시 짰다.

## 문제

구조적으로 풀어야 할 질문이 세 가지였다.

1. **TC.steps는 시나리오와 중복인가?** 시나리오의 mainFlow가 곧 시험 절차이고, TC는 "이 시나리오를 어떤 관점(운영/인수)에서 검증하는지"만 정의하면 되는 것 아닌가?
2. **TC와 시나리오의 매핑 단위는?** 시나리오의 개별 step에 1:1로 매핑할지, 시나리오 전체에 1:N으로 매핑할지.
3. **진입/종료/중단/재개 기준은 따로 둘 것인가?** 인수 시험 계획서에는 `entry_criteria`, `exit_criteria`, `suspension_resumption_criteria`가 모두 분리되어 있었는데, 시험 단계 게이트라는 점에서 같은 계열의 기준(criteria)이다.

## 결정 1 — TC.steps 제거, `verification_points`만 남기기

중복 영역을 한 번 표로 정리했다.

| 필드 | 시나리오에도 있나? | 판단 |
| --- | --- | --- |
| `functional_area` | scenario.step_id의 카테고리로 역추적 가능 | **제거** |
| `requirements` | scenario.step.requirements에 정의됨 | **제거** |
| `related_usecase` | scenario.step.related_uc에 정의됨 | **제거** |
| `steps` | scenario.mainFlow가 절차 흐름 | **제거** |
| `preconditions` | scenario.step_trigger는 비즈니스 조건("사용자가 등록된 상태"), TC는 시험 환경 조건("Docker Compose up, DB 빈 상태") | **유지** (레벨이 다름) |
| `expected_output` | scenario.mainFlow는 절차 흐름, TC는 HTTP 응답 코드·토큰 발급 같은 구체 검증 결과 | **유지** (관점이 다름) |
| `pass_criteria` | TC 고유 판정 기준 | **유지** |

TC.steps를 제거하는 대신 `verification_points`라는 필드를 새로 두기로 했다. "시나리오 절차는 scenario.json에 있으니 따로 적지 말고, 시험 입장에서 *추가로 확인해야 하는 항목*만 기록"하자는 것이다. 예: 시나리오의 "로그인 호출" step에 대해 운영 시험은 "응답 200·토큰 디코딩 검증"을 verification_point로 남기고, 인수 시험은 "입회자 서명 증빙·UI 캡처"를 남긴다.

```json
{
  "tc_id": "IAMS-OT-AUTH-001",
  "name": "로그인 응답 검증",
  "related_scenarios": ["IAMS-SC-AUTH-001"],
  "verification_points": [
    { "point": "POST /auth/login 응답 코드", "expected": 200 },
    { "point": "응답 본문의 access_token 디코딩", "expected": "sub=사용자 ID, exp>now" }
  ],
  "pass_criteria": "모든 verification_point 통과"
}
```

## 결정 2 — 매핑 단위는 시나리오 레벨 (1:N)

처음에는 `IAMS-SC-AUTH-001-01` 같은 step_id 단위로 매핑했다. 정밀해 보였지만 의미가 어색한 케이스가 곧 드러났다. "관리자 계정 초기 생성"(`IAMS-OT-INIT-001`)이라는 TC가 "로그인" step(`IAMS-SC-AUTH-001-02`)에 매핑되는 식이었다. 실제로 이 TC는 *계정 생성 + 로그인 + 토큰 확인*을 포괄하는 운영 흐름이지, 로그인이라는 한 step만 검증하는 게 아니다.

시나리오 레벨로 올리니 관계가 자연스러워졌다.

> `IAMS-OT-INIT-001`은 `IAMS-SC-AUTH-001`(인증 및 세션 관리 시나리오)을 *초기 구축 관점*에서 검증한다.
> 

복수 시나리오에 걸치는 TC는 `related_scenarios: ["IAMS-SC-AUTH-001", "IAMS-SC-USR-001"]`처럼 배열로 다중 참조하면 된다. "운영/인수 시험은 시나리오 전체 흐름을 운용 관점에서 검증하는 것"이라는 도메인의 성격이 결정의 근거였다.

공통 헬퍼 `load_scenarios_map`은 두 종류 키를 모두 등록하도록 짰다. 시나리오 ID로도, step_id로도 룩업이 되어야 다른 생성기들이 깨지지 않는다.

```python
def load_scenarios_map(json_path: Path) -> dict:
    """scenario.json을 같은 디렉토리에서 로드해 두 키로 인덱싱.
    - scenario_id (예: IAMS-SC-AUTH-001) → scenario dict
    - step_id    (예: IAMS-SC-AUTH-001-01) → step + 시나리오 컨텍스트
    """
    sc_path = json_path.parent / "scenario.json"
    if not sc_path.exists():
        return {}
    data = json.loads(sc_path.read_text(encoding="utf-8"))
    out = {}
    for sc in data.get("scenarios", []):
        out[sc["scenario_id"]] = sc
        for st in sc.get("steps", []):
            out[st["step_id"]] = {
                **st,
                "name": f"{sc['name']} - {st['step_name']}",
                "category": sc.get("category"),
            }
    return out
```

## 결정 3 — 기준(criteria) 통합

인수 시험 계획서에 따로 떨어져 있던 `entry_criteria` / `exit_criteria` / `suspension_resumption_criteria` 세 섹션을 `criteria` 하나로 묶었다. 처음엔 type 필드를 가진 flat 배열로 합쳤다가, 다시 type별 그룹 객체로 한 번 더 정리했다.

```json
"criteria": {
  "entry":     [{ "id": "ENTRY-01", "description": "..." }, ...],
  "exit":      [{ "id": "EXIT-01",  "description": "..." }, ...],
  "suspension":[{ "id": "SUSP-01",  "description": "..." }, ...],
  "resumption":[{ "id": "RESM-01",  "description": "..." }, ...]
}
```

키 자체가 type 역할을 하니 각 항목의 `type` 필드는 빠진다. `assumptions_constraints`도 같은 (ID, 설명) 구조로 통일했다. 이름은 한글 키(`가정`/`제약`)였다가 코드 친화성을 위해 `assumption`/`constraint`로 영문화했다.

양식(docx) 쪽도 그대로 따라갔다. §4.2 "시험 기준" 표 한 개가 17행짜리 통합 표가 되고, §4.3 "가정 및 제약" 표는 `ID | 구분 | 내용` 3-col로 통일된다.

## 의도치 않은 함정 — 표 매칭이 데이터 행에 걸리는 문제

양식 docx의 빈 표를 찾아서 데이터로 채우는 매처는 "표에서 특정 헤더 단어들이 보이면 매칭"하는 식이었다. 그런데 §4.1 "시험 영역" 표에 functional_area 데이터(설명 칸에 "역할", "인원" 같은 단어 포함)를 채우고 나니, 뒤이어 §7.2 "역할 분담" 표를 찾던 매처가 *같은 표를 다시 매칭*해 덮어쓰는 버그가 나왔다.

원인은 단순했다. `_texts(table)`이 헤더 + 데이터 행을 *모두* 합쳐 텍스트로 비교하고 있었던 것. 헤더만 비교하는 `_header_texts`를 분리하고 모든 매처를 그쪽으로 옮겼다.

```python
def _header_texts(table) -> str:
    """표의 첫 번째 행(헤더)만 합쳐 반환. 데이터 행 텍스트는 매칭에 쓰지 않음."""
    if not table.rows:
        return ""
    return " ".join(cell.text for cell in table.rows[0].cells)
```

자동 매칭의 본질적인 약점이다 — "의미 있는 식별자"를 양식 내에 별도 마커로 박지 않는 한 결국 텍스트로 추측하게 되고, 데이터가 들어차는 순간 매칭이 깨질 위험이 늘어난다. 헤더만 본다는 약한 제약을 추가한 정도라, 다음 정리 때 *placeholder 텍스트나 컨텐츠 컨트롤* 같은 명시적 마커 기반으로 한 번 갈아엎을 계획이다.

## 결과서(xlsx)도 9시트 → 6시트 통합

인수 시험 결과서(TE14-4)는 원래 `결과 요약`, `시나리오별 결과`, `요구사항 충족 현황`, `인수 판정`, `결함관리`, `인수 확인` 등 9개 시트로 흩어져 있었고, 그 중 `시나리오별 결과`는 외부 Google Sheets를 가리키는 IMPORTRANGE 수식이 박혀 있는 깨진 상태였다. 이걸 `결과총괄` 한 시트가 §1~§4 (수행 요약 / 시나리오별 결과 / 최종 인수 판정 / 서명)을 들고 가는 구조로 통합했다.

생성기 쪽에서 함정 하나 — openpyxl로 `insert_rows`를 호출하면 *데이터*는 잘 밀려나지만 *병합된 셀과 수식 참조*는 자동으로 따라오지 않는다. functional_areas 행을 §2에 5개 끼워 넣으면 그 아래 §3 수식의 `F11:F15` 같은 범위가 안 따라간다. 결국 "삽입 영역과 그 아래 모든 병합 범위를 먼저 unmerge → insert_rows → 영향 받은 수식의 행 번호 명시적으로 재계산 → 다시 merge" 순서로 명시적으로 처리해야 했다.

## 마무리

오늘은 결국 "시험 문서는 시나리오를 기준으로 한 번만 정의하면 되도록" 스키마를 다듬는 하루였다. 핵심 두 가지를 정리하면,

- **단일 출처**: 시나리오에 있는 정보는 TC에 다시 적지 않는다. TC는 "이 시나리오를 어떤 관점에서 보는지(`verification_points`)"와 "어떻게 판정하는지(`pass_criteria`/`expected_output`)"만 들고 있다.
- **매핑 단위는 도메인 의미에 맞춰서**: step 단위가 더 정밀해 보였지만, 운영/인수 시험이 시나리오 흐름을 통째로 검증하는 성격이므로 시나리오 단위(1:N)가 의미상 자연스럽다. 정밀함보다 자연스러움을 택했다.

남은 작업은 양식 자동 매칭의 식별 방식을 더 명시적인 마커 기반으로 바꾸는 것, 그리고 통합 시험(integration)도 같은 단일 출처 원칙으로 정리하는 것이다. 통합 시험은 모듈 간 인터페이스 검증이 핵심이라 시나리오 기반 모델과는 결이 좀 다른데, 어디까지 맞춰야 할지는 다음에 다시 본다.