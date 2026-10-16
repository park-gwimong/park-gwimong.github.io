---
title: "artifact-transformer 작업 일지 #37"
subtitle: "모노레포가 세 갈래로 갈라진 날 — 결합도를 재본 뒤에야 알게 된 비대칭"
pubDate: 2026-08-20T10:00:00+09:00
category: "devlog"
tags: ["Python", "Monorepo", "Git Subtree", "Architecture", "Working Log"]
math: false
draft: true
---

> 이 글은 2026-08-20 하루의 기록이다. 스캔 설정 한 줄이 코드-매핑 게이트를 무력화하고 있었다는 걸 고쳤고, 그 여세로 모노레포를 세 저장소로 쪼갰다. 쪼개려고 결합도를 재보니 세 축은 애초에 대칭이 아니었다.

## 배경 — 스캔 설정 한 줄이 게이트를 무력화하고 있었다

발단은 `code-repos.json`을 들여다보다 나온 위화감이었다. 스캔 대상을 `{container, path}` 목록으로 등록하는데, 항목 사이에 겹침을 걸러낼 방법이 없었다.

모노레포 루트를 가리키는 `pipelineCli` 컨테이너가 `webApp`·`apiServer` 소속 파일까지 통째로 다시 스캔하고 있었고, `docRepo`(경로: `data/`)는 `data/function.json`까지 스캔 대상으로 잡고 있었다.

`function.json`이 스캔에 걸린다는 게 그냥 낭비면 넘어갔을 텐데, 실제로 게이트 하나를 무력화시키고 있었다. `gate_manual._p_code_mapping`은 함수 ID가 코드 어딘가에서 한 번이라도 히트하면 "매핑됨"으로 판정한다. 그런데 `function.json`은 모든 함수 ID를 나열한 파일이라, 이 파일이 스캔 대상에 남아 있는 한 구현 코드가 한 줄도 없어도 코드-매핑 게이트는 항상 통과했다.

## 문제

1. 겹치는 스캔 범위를 어떻게 걷어내나.
2. 걷어낸 뒤 실측 수치가 실제로 줄어드는지 어떻게 확인하나.
3. (오후) ARTF를 WebIDE / CollaborationAPI / PipelineCLI 세 저장소로 쪼갤 때, 세 축이 정말 나란히 갈라지는가.
4. 쪼개면서 마주칠 숨은 결합을 사전에 어디까지 잡아낼 수 있나.

## 결정 1 — exclude 없는 스캔 설정은 반드시 겹친다

포함만 있고 제외가 없는 설정은 모노레포에서 필연적으로 겹친다. 저장소 설정 스키마에 `exclude` 필드를 추가했다.

```python
def _exclude(raw: list[str] | None) -> list[str]:
    if not raw:
        return []
    return sorted({p.strip().rstrip("/") for p in raw if p.strip()})

def scan(sources, ids, exclude=None) -> dict:
    excluded = _exclude(exclude)
    for path in walk(sources):
        if any(is_subpath(path, ex) for ex in excluded):
            continue
        ...
```

제외 내역은 조용히 버리지 않고 `sources[]`에 그대로 남겨서, 나중에 "왜 이 파일이 안 잡히지"를 감사할 수 있게 했다. UI에도 `frontend/src/components/RepoSettings.tsx`에 제외 경로 입력 필드를 붙였다.

효과는 실측으로 확인했다.

| 지표 | 이전 | 이후 |
|---|---|---|
| 스캔 대상 파일 | 718 | 527 |
| docRepo 오탐 | 111 | 0 |
| 마커 행 | 151 | 140 (실제 마커 수와 일치) |

커밋 `f87cfc4`로 반영했는데, 작업 트리에 같은 파일(`server/app.py`, `server/implcode.py`, `tests/test_impl_code.py`) 위에 다른 세션이 진행 중이던 무관한 WIP가 섞여 있었다. 파일 단위로 나눌 수 없어서 훅 단위로 이번 세션 몫만 골라 스테이징했다. `frontend/src/components/ImplNav.tsx`는 이번 커밋에서 손대지 않았다.

## 결정 2 — 쪼개기 전에 결합도부터 잰다

오후에 들어온 요청은 ARTF를 WebIDE / CollaborationAPI / PipelineCLI 세 축의 독립 저장소로 분리하는 것이었다. 세 축이 나란하다는 전제부터 의심하고, 가정 대신 실측했다.

| 축 | 파일 수 | 다른 축과의 결합 |
|---|---|---|
| `frontend/` (WebIDE) | 2,526 | 0 — HTTP 통신만 |
| `server/` (CollaborationAPI) | 30 | `from common.*` 115건, 루트 CLI 직접 import 6건, 서브프로세스 호출 9건 |
| CLI/common/generator/parser (PipelineCLI) | ~230 | `server/`에 대한 의존 없음 |

숫자가 말하는 결론은 하나다. **세 축은 대칭이 아니다.** apiServer는 pipelineCli 위에 얹힌 구조지, 나란히 선 구조가 아니었다. 이 비대칭을 무시하고 세 저장소를 동급으로 쪼갰다면, apiServer 쪽은 매 배포마다 CLI 코드 사본을 끌고 다니거나 깨진 import를 안고 시작했을 것이다.

## 결정 3 — subtree split로 이력을 보존한 채 web을 먼저 떼어낸다

결합이 0인 축부터 떼어내는 게 안전하다. `git subtree split`로 `frontend/`를 이력 211개 커밋을 보존한 채 `artf-web`으로 분리했다.

나머지 두 축은 결합이 있는 만큼 순서와 계약을 정해야 했다. CLI 계층을 설치 가능한 패키지 `artf-cli`(674 커밋)로 만들고 실제 `pyproject.toml`을 채웠다. `artf-api`(673 커밋)는 `sys.path` 삽입 대신 `-e ../artf-cli`로 의존하게 바꿨다.

```toml
# artf-api/pyproject.toml (발췌)
[project]
dependencies = [
    "artf-cli @ file://../artf-cli",
]
```

서브프로세스 호출 계약도 손봤다. 예전에는 `ROOT/generate.py`라는 하드코딩된 경로를 호출했는데, 이제 저장소 경계가 생기니 그 경로가 더 이상 유효하지 않다. `python -m generate`로 바꿔서 어느 디렉터리에 설치돼 있든 동작하게 했다.

환경 변수 resolution도 한 곳으로 모았다. `common.env.ENV_DIR` / `AT_ENV_DIR`가 유일한 출처가 되도록 정리했다. 저장소가 둘로 나뉜 상태에서 `WORK_DIR` 계산 로직이 양쪽에 따로 있으면 반드시 어느 한쪽이 낡는다.

489개 추적 파일 전부가 세 저장소로 무손실 이관됐다.

## 결정 4 — /ui 정적 서빙 대신 CORS로 경계를 긋는다

`server/`가 `frontend/dist`를 `/ui`로 정적 서빙하던 방식은 두 저장소가 분리된 순간 성립하지 않는다. CORS로 바꿨다.

```python
ALLOWED_ORIGINS = os.environ["AT_WEB_ORIGINS"].split(",")
# Authorization 헤더를 쓰므로 와일드카드 금지
app.add_middleware(CORSMiddleware, allow_origins=ALLOWED_ORIGINS, allow_credentials=True)
```

정적 서빙이 없어지니 루트 접근을 `AT_WEB_BASE_URL`로 리다이렉트해야 했고, 도메인이 갈라진 김에 Keycloak 리다이렉트 URI도 같이 고쳤다.

배포 축이 두 개(API, 파이프라인)로 나뉘면 "API는 새 버전인데 파이프라인은 구버전"인 드리프트가 생길 수 있다. `/api/version`을 API 버전과 설치된 파이프라인 버전, 두 부분으로 확장해서 이 드리프트를 바로 확인할 수 있게 했다.

## 의도치 않은 함정 — 쪼개고 나서야 보인 것들

분리 자체가 검증이었다. 합쳐 있을 때는 안 보이던 문제 두 개가 나왔다.

`mcp` 패키지를 2.0으로 올리는 순간 `mcp.server.fastmcp`가 사라진 걸 알았다. `artf-cli`를 독립 패키지로 만들면서 의존성 버전을 처음으로 명시적으로 고정하게 됐고, 그 과정에서 발견했다. `mcp<2`로 눌러서 회피했다.

`jira_*` 관련 설계 마커는 원래 apiServer 소속으로 붙어 있었는데, 실제 코드(`revise.py`, `tools/jira.py`)는 CLI 계층과 공유되는 코드였다. 하나의 저장소 안에 있을 때는 "어느 저장소 소속인가"가 질문이 되지 않으니 이 오귀속이 드러나지 않았다. 재마킹하고 나서야 컴포넌트 14/14, 함수 13/13, 경계 충돌 0건으로 정확히 맞아떨어졌다.

## 마무리

오늘 확인한 것은 셋이다.

- **포함만 있고 제외가 없는 설정은 모노레포에서 반드시 겹친다.** 그 겹침이 우연히 게이트 하나를 통째로 무력화시키고 있었다.
- **결합도는 재봐야 안다.** "세 축으로 나눈다"는 요청 자체가 세 축이 대칭이라는 가정을 깔고 있었는데, 실측해 보니 하나는 다른 하나 위에 얹혀 있었다.
- **분리는 최후의 검증이다.** 합쳐 있을 때는 절대 드러나지 않는 오귀속·버전 고정 누락이, 경계를 실제로 그어야만 튀어나온다.

남은 것은 `artf-api`와 `artf-cli`의 버전을 각자 태그로 굴릴지, 아니면 동기화된 릴리스로 묶을지 정하는 일이다. `/api/version`이 드리프트를 보여주기는 하지만, 지금은 드리프트가 나도 되는지 아닌지에 대한 정책이 없다.
