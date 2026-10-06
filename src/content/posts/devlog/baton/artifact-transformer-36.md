---
title: "artifact-transformer 작업 일지 #36"
subtitle: "구성 요소와 코드 사이의 끊긴 축을 이은 날 — 코드가 스스로 밝히는 소속, 그리고 그 과정에서 드러난 설계 결함"
pubDate: 2026-08-19T10:00:00+09:00
category: "devlog"
tags: ["Python", "C4 Model", "Traceability", "Architecture", "Working Log"]
math: false
draft: true
---

> 이 글은 2026-08-19 하루의 기록이다. 설계의 C4 구성 요소가 코드에 전혀 닿지 못하고 있다는 것을 확인하고, 그 축을 새로 놓았다. 저장소 셋에 걸쳐 여섯 커밋이고, 도구를 고치는 과정이 그대로 설계 검증이 됐다.

## 배경 — 구성 요소 축은 사실상 끊겨 있었다

발단은 단순한 검토 요청이었다. FDSP의 ETL 파이프라인(`fdsp-pipe`)에서 컴포넌트와 코드를 어떻게 맵핑하면 좋을지 보자는 것.

설계는 3계층(REST API / ETL Pipeline / Domain Core) 31개 컴포넌트로 정의돼 있었다. 그런데 `build/code-repos.json`은 한 줄뿐이었다.

```json
[{ "container": "celery", "path": "…/fdsp-pipe" }]
```

이 한 줄이 두 가지를 동시에 망가뜨리고 있었다.

**첫째, 저장소가 컨테이너 단위로 걸린다.** 저장소 필터가 `container_id`로 거르는데 `api`·Domain Core로 등록된 저장소가 없으니, 그쪽 컴포넌트는 파일 목록도 git 이력도 스캔 내역도 전부 빈칸이었다. 코드는 같은 저장소 안에 멀쩡히 있는데도.

**둘째, 31개 컴포넌트 전부 코드 히트가 0이었다.** 스캔 히트의 `container`는 *저장소 설정*에서 찍힌다. 즉 모든 히트가 `container="celery"`인데, 컴포넌트 노드의 `members`는 `[자기 id]`뿐이다. `"celery" ∉ ["ulogParser"]` — 영영 만나지 않는다.

그리고 등록 자체가 사실과 달랐다. `docker-compose.local.yml`을 보면 이 저장소는 이미지 하나로 컨테이너 셋을 띄운다. `api`(uvicorn), `worker`(celery), `migrate`(alembic). "fdsp-pipe = ETL Pipeline"이 아니라 **fdsp-pipe = api + celery + dbMigrator + 공유 Domain Core**였다.

## 문제

1. 컴포넌트와 코드를 무엇으로 잇나. 경로 글롭인가, 코드 안의 마커인가.
2. 한 컴포넌트가 여러 파일에 걸쳐 구현되는 건 정상인가.
3. 한 저장소가 여러 컨테이너를 담을 때, 파일의 소속은 무엇이 정하나.
4. 마커를 달아도 도구가 읽지 않으면 그건 무엇인가.

## 결정 1 — 컴포넌트 경계는 파일 수로 판정하지 않는다

대조해 보니 구현된 24개 중 21개가 파일과 1:1이었다. ETL은 특히 깨끗했다.

```
parseLogTask            → app/worker/tasks/parse_log.py
ulogParser              → app/parsers/ulog_parser/ulog_parser.py
metadataExtractor       → app/parsers/ulog_parser/extract_meta.py
parameterExtractor      → app/parsers/ulog_parser/extract_parameters.py
```

문제는 1:1이 아닌 3건이었다. 여기서 "파일이 여럿이면 잘못 그은 것"이라고 단정하고 싶어지는데, 그건 틀린 기준이다.

C4에서 컴포넌트는 파일이 아니라 "**잘 정의된 인터페이스 뒤에 묶인 관련 기능의 그룹**"이다. 판정 기준은 파일 개수가 아니라 둘이다.

1. 밖에서 이 컴포넌트를 쓸 때 진입점이 하나로 말해지는가.
2. 한 요구사항 변경이 그 파일들을 같이 건드리는가.

1:1을 강제하면 오히려 손해다. 컴포넌트 = 파일이면 컴포넌트 다이어그램은 `ls -R`과 같아져서 아키텍처 뷰가 정보를 하나도 안 담게 된다.

이 기준으로 3건을 보면 셋이 다 다르다.

| 대상 | 파일 | 판정 |
|---|---|---|
| `errorHandling` | 4 | **정상.** `core/errors/__init__.py`가 예외 20여 종을 재수출하는 단일 import 표면이다. 한 패키지 = 한 컴포넌트 |
| `flightLogsRouter` | 3 | **약함.** 묶은 근거가 `/flight-logs` mount prefix라는 구현 세부사항이지 책임이 아니다 |
| `sensorParquetWriter` | 3 | **깨졌다.** 세 파일이 서로 다른 계층에 흩어져 있다 |

> 한 패키지 안의 여러 파일은 정상이다. 여러 디렉터리·계층에 걸친 여러 파일은 경계가 잘못 그어졌다는 신호다.

## 결정 2 — 경로 글롭이 아니라 코드 안의 마커로 잇는다

두 방식이 후보였고, 마커를 골랐다. 이유는 하나다. **마커는 경계 오류를 스스로 드러낸다.**

`FDSP-CMP-sensorParquetWriter`를 `worker/tasks/parse_log.py`에 붙이려는 순간, 거기엔 이미 `FDSP-CMP-parseLogTask`가 있다. "두 컴포넌트가 같은 파일을 주장한다"가 눈에 보인다. 경로 글롭으로는 이게 조용히 겹쳐 지나간다.

즉 마커를 다는 작업은 매핑을 채우는 일인 동시에 **전수 검증**이다. 24개를 붙이면서 "이 마커를 어디 붙여야 하지?"가 막히는 지점이 곧 설계 결함 후보다.

형태는 `{SYSTEM_CODE}-CMP-{컴포넌트 id}`로 정했다.

```python
# FDSP-CMP-sessionScope — SessionScope (Cross-cutting): DB 세션 수명·트랜잭션 경계 관리
from contextlib import contextmanager
```

접두사를 붙인 이유는 컴포넌트 id가 camelCase 낱말이기 때문이다. `ulogParser`·`sessionScope`를 맨 이름으로 훑으면 지역 변수와 산문에 걸린다.

그리고 이 토큰은 **산출물 식별자가 아니다.** 문서에 실리지 않고 코드와 설계를 잇는 조인 키로만 쓰인다. 원천은 여전히 `participant.json`과 CMPDG `.puml`이라, 식별자 정책을 확장할 필요가 없다.

26개 파일에 일괄 삽입했다. `videos.py` 하나에 BOM이 있어 그것까지 보존하도록 스크립트로 넣었고, 전체 컴파일과 BOM 보존을 확인한 뒤 스캔 탐지율 24/24를 봤다.

## 결정 3 — 소속 판정은 마커가 저장소 설정을 이긴다

마커를 붙여도 도구가 읽지 않으면 그건 사람만 읽는 주석이다. `scan()`을 확장했다.

```python
def scan(sources, ids, component_markers=None) -> dict:
    ...
    tokens = sorted(set(ids) | set(markers), key=len, reverse=True)
    pat = re.compile("|".join(re.escape(t) for t in tokens))
```

정규식 하나로 파일당 한 번만 훑는 기존 구조를 그대로 두고, 훑을 토큰 집합에 마커를 합쳤다. 마커를 찾으면 두 가지를 남긴다.

- `components`: 그 구성 요소의 코드가 어디인가
- 같은 파일에서 나온 기능 히트의 `components` 필드: 그 히트가 어느 구성 요소의 코드인가

```python
# 이 파일을 소유한 구성 요소 — 여럿이면 그것이 곧 경계 충돌이다.
owners = sorted({cid for tok, cid in markers.items() if tok in text})
```

핵심은 우선순위다. **소속 판정은 마커를 먼저 보고, 없을 때만 저장소 설정으로 물러선다.** 마커는 코드가 스스로 밝힌 사실이고 저장소 설정은 사람이 적어 넣은 추정이라서다.

효과는 실측으로 갈렸다.

| 구성 요소 | 이전 | 이후 |
|---|---|---|
| `flightLogsRouter` | 저장소 0 · 코드 0 | 저장소 1 · 마커 3 · 코드히트 14 · 이력 20 |
| `sessionScope` (기능 ID 없음) | 저장소 0 · 코드 0 | 저장소 1 · 마커 1 · 이력 5 |
| `api` 컨테이너 | 코드히트 0 | 코드히트 25 |

기능 ID가 없는 인프라 7종 — 세션 경계, 논리삭제 정책, 에러 체계, 리포지토리 4종 — 이 처음으로 자기 코드와 이력을 갖게 됐다. 기능 ID 축만으로는 이들이 영영 코드에 닿지 못한다. 기능이 없으니까.

저장소 등록도 바로잡았다. `container`를 `celery`에서 `""`(공통)으로 내렸다. 이미지 하나로 컨테이너 셋을 띄우는 모노레포를 어느 하나로 선언하면 나머지가 오귀속된다. 파일별 소속은 이제 마커가 밝힌다.

## 결정 4 — 마커가 드러낸 어긋남은 설계에서 고친다

전수 삽입으로 드러난 것은 충돌 2건과 공백 3건이었다.

**`sensorParquetWriter`가 가장 컸다.** 설계와 코드가 의존 구조에서 어긋나 있었다.

| | 설계 | 코드 |
|---|---|---|
| 쓰기 경로 | `sensorParquetWriter → ParquetStore` 직접 | `ParquetService → ParquetRepository → disk` |
| `sensorParquetWriter → parquetRepository` | 간선 없음 | 실제로는 이 경로 |
| 원자적 게시 | `sensorParquetWriter` 소유 | `parse_log.py`의 `_publish_staged_dir` |

게다가 `parquetRepository`도 설명이 "조회·적재"라, 같은 저장소에 대한 쓰기를 두 컴포넌트가 동시에 주장하고 있었다. 코드대로 고쳤다. 쓰기·압축은 `parquetRepository`, 스테이징의 원자적 게시는 실제 소유자인 `parseLogTask`.

**두 번째는 발행 컴포넌트 부재였다.** 설계에는 수신(`eventBridge`)과 전파(`eventDispatcher`)만 있고 **발행**이 없었다. 그런데 관계도에는 `flightLogsRouter → queue "이벤트 발행"`, `parseLogTask → queue "이벤트 발행"`이 그려져 있었다. 실제로는 `core/events.py`를 API와 워커가 함께 쓴다. `eventPublisher`를 신설해 메웠다.

세 번째 `datasetQueryService`는 설계가 REST API 계층인데 코드가 `domain/services/`에 있는 계층 불일치였다.

역방향도 봤다. `app/` 실질 61개 파일 중 34개가 어느 컴포넌트에도 안 잡히는데, 대부분은 정상이다. 모델 8종과 enum 4종은 ERD 소관이고, FastAPI 배선·설정·진입점은 애초에 컴포넌트가 아니다. 실제 공백은 위의 셋뿐이었다.

결과는 **구현 컴포넌트 25종 전부 매핑, 경계 충돌 0건.** 검증은 다이어그램 라운드트립 `[+0 -0 ~0]`, 정합성 검사 드리프트 0, 파이프라인 테스트 740 passed였다.

## 결정 5 — 백엔드가 내려줘도 화면이 안 쓰면 없는 것과 같다

서버가 `markers`·`markerConflicts`를 내려주기 시작했지만 UI가 표시하지 않으면 사람은 여전히 볼 수 없다. 구성 요소 화면 [정보] 얼굴, [코드 저장소] 패널 바로 아래에 [이 구성 요소의 코드] 패널을 넣었다. "어느 체크아웃인가" 다음 질문이 "그 안 어디인가"라서 그 자리가 제자리다.

한 가지는 서버로 넘겼다. **마커 토큰은 서버가 만들어 내려준다**(`info.markerToken`). 접두사 규칙을 화면이 다시 짜면 두 곳이 언젠가 어긋난다.

경계 충돌은 경고 배너로 띄운다. 파일명과 주장하는 컴포넌트를 나열하고 한 줄을 덧붙였다.

> 다이어그램을 고치거나 코드를 옮기거나 — 마커를 지우는 것은 답이 아니다.

지금 FDSP는 충돌 0건이라 안 보이지만, 경계가 어긋나는 순간 뜬다.

## 의도치 않은 함정 — 커밋에 내 작업이 아닌 것이 섞였다

마지막으로 밀린 UI 작업을 커밋하려는데, 작업 트리에 두 갈래가 섞여 있었다. 세션 중에 다른 커밋들이 따로 올라간 걸로 봐서 병렬로 작업이 진행되고 있었다.

파일 단위로 나눌 수가 없었다. `theme.css`와 `App.tsx`가 두 갈래 변경을 **같은 파일 안에** 담고 있어서다. 훅 단위로 쪼개면 CSS 없는 JSX가 중간 커밋에 남아 깨진 상태가 된다.

한 커밋으로 묶되 커밋 메시지에 다섯 갈래를 모두 명시하는 쪽으로 정했다.

> 병렬 작업은 파일 경계를 따라 갈라지지 않는다. 커밋을 나눌 수 없으면 최소한 메시지가 나눠야 한다.

빌드하면서 하나 더 나왔다. README에는 "빌드 산출물이 저장소에 포함되어 서버에는 node가 필요 없다"고 적혀 있는데, `frontend/dist`는 `.gitignore` 대상이라 실제로는 추적되지 않는다. 둘 중 하나가 낡았다. 배포 방식이 바뀐 것이면 README를 고쳐야 한다.

## 마무리

오늘 확인한 것은 셋이다.

- **축이 다르면 도구도 둘이어야 한다.** 기능 ID는 "이 기능이 여기 구현됐다"를, 컴포넌트 마커는 "이 파일이 어느 구성 요소인가"를 말한다. 기능이 없는 인프라 컴포넌트는 기능 ID 축만으로는 영영 코드에 닿지 못한다.
- **추정보다 코드가 밝힌 사실이 먼저다.** 저장소 설정의 `container`는 사람이 적어 넣은 값이라 모노레포에서 반드시 틀린다. 마커를 우선하고 설정은 폴백으로 내리는 순서가 핵심이었다.
- **매핑을 채우는 작업이 곧 설계 검증이었다.** 마커를 어디 붙일지 막히는 지점이 전부 설계 결함이었고, 붙이기 전에 예상한 3건 외에 발행 컴포넌트 부재까지 같이 나왔다. 경로 글롭이었다면 넷 다 조용히 지나갔을 것이다.

남은 것은 `flightLogsRouter`의 묶음 근거를 다시 보는 일이다. `parsedDataRouter`를 별도 컴포넌트로 승격하는 편이 설계로서 낫다고 보지만, 지금은 충돌 0건이라 급하지 않다.
