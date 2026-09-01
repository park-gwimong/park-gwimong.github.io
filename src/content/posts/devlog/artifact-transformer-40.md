---
title: "artifact-transformer 작업 일지 #40"
subtitle: "다이어그램 조합이 깨지는 진짜 규칙을 실측으로 잡은 날 — 그리고 승인 게이트가 애초에 없었다는 사실"
pubDate: 2026-08-31T10:00:00+09:00
category: "devlog"
tags: ["PlantUML", "Static Analysis", "Git", "GitHub Actions", "CI/CD", "Working Log"]
math: false
draft: true
---

> 이 글은 2026-08-31 하루의 기록이다. 낮에는 다이어그램 partial 조합이 왜 깨지는지를 실측으로 확정하고 그걸 게이트로 만들었고, 저녁에는 지난 회차에 남겨 뒀던 `v1.1.0` 태그를 밀어 CD를 끝까지 돌렸다.

## 배경 — 우연히 맞아 있던 조합 순서

BATON의 BCDG OVERVIEW가 깨진 적이 있다. 원인은 partial 사이의 전방 참조였다. `!includesub`로 여러 partial을 이어 붙일 때, 아직 선언되지 않은 alias를 관계선이 먼저 참조하면 PlantUML이 그 alias를 top-level에 자동으로 만들어 버린다. 뒤이어 진짜 선언이 나오면 충돌한다.

당시엔 include 순서를 바꿔 넘겼다. 그런데 그 방법은 **참조에 순환이 있으면 통하지 않는다.** BATON은 PIP↔COL이 서로를 참조해서, 어떤 순서로 놓아도 한쪽은 전방 참조가 된다.

그래서 partial 본문을 선언과 관계선으로 나누는 규약이 필요했다. 문제는 이게 BATON만의 문제가 아니라는 점이다. 로컬에 있는 다른 프로젝트 9개도 같은 구조로 문서를 쓰고 있었다.

## 문제

1. 조합 규약을 어떻게 바꿔야 순환 참조에서도 안전한가.
2. PlantUML이 실제로 어떤 경우에 깨지는가 — 지금 문서에 적힌 설명이 맞는가.
3. 이걸 사람이 매번 확인하지 않게 하려면 어디에 붙여야 하는가.
4. 이미 쓰인 다른 프로젝트 문서들을 어떻게 옮기는가.

## 결정 1 — partial 을 NODES 와 RELS 로 나눈다

기존 규약은 partial 본문 전체를 `!startsub CONTENT` 하나에 담았다. 이걸 두 개로 쪼갰다.

```plantuml
!startsub NODES
package "COL · 수집" {
  component "수집기" as colEdit
}
!endsub

!startsub RELS
colEdit --> pipRun
!endsub
```

OVERVIEW는 **모든 partial의 NODES를 먼저 전부 조합하고, 그다음 RELS를 전부 조합한다.** 선언이 관계선보다 항상 앞서므로 전방 참조가 원천적으로 생기지 않는다. include 순서에 의존하지 않으니 순환 참조도 문제가 되지 않는다.

구 형태 `CONTENT`는 호환 항목으로 남겼다. 교차 참조가 없거나 방향이 include 순서와 맞으면 그대로 동작한다. 다만 화살표 하나만 반대로 추가돼도 깨지므로 신규 작성은 NODES/RELS로 못 박았다.

스킬 문서(`SKILL.md` §1, `reference/conventions.md`)의 BCDG partial·OVERVIEW 규약과 UCDG 분할 규약을 여기에 맞춰 개정하고, **왜 나누는가**를 실패 메커니즘과 함께 적었다. 순서로 못 고치는 사례로 BATON의 PIP↔COL 순환을, 변형 사례로 PAIX(NODES만 조합하고 관계선은 OVERVIEW에서 큐레이트)를 정본 예시로 달았다.

## 결정 2 — 규칙은 문서가 아니라 실측이 정한다

규약을 적으면서 기존 문서의 한 문장이 걸렸다.

> ⚠ 중복 alias 금지 — 두 partial 에서 선언하면 조합 렌더가 깨진다

이게 사실인지 확인하려고 네 가지 변형을 만들어 직접 렌더해 봤다.

| 케이스 | 결과 |
| --- | --- |
| 같은 라벨 액터 중복 선언 | 정상 |
| 다른 라벨 액터 중복 선언 | 정상 (먼저 선언한 라벨 채택) |
| 같은 alias를 서로 다른 package 안에서 선언 | 정상 (먼저 나온 package에 배치) |
| 같은 package·같은 선언 반복 | 정상 |

전부 정상이었다. 문서가 틀렸다. "렌더가 깨진다"를 **"오류는 아니나 먼저 나온 선언만 채택되어 라벨·소속이 조용히 어긋난다"**로 고쳤다. 결론(한 곳에서만 선언하라)은 같지만 이유가 다르다. 깨지는 문제와 조용히 어긋나는 문제는 대응이 다르기 때문이다.

그리고 정작 내가 세운 규칙 모델도 틀렸다. 처음엔 "**package 안** 재선언만 충돌한다"고 보고 분석기에 `depth > 0` 조건을 넣었다. 검증용 테스트를 짜다 그 가정이 무너졌다.

| 케이스 | 실측 |
| --- | --- |
| 참조 → `package { … as w }` 재선언 | **오류** |
| 참조 → top-level `actor "W" as w` 선언 | **오류** ← 초기 구현이 놓치던 케이스 |
| 선언 → 참조 → 중복 선언 | 정상 |
| 참조만, 끝까지 선언 없음 | 정상 |

정확한 규칙은 **"관계선 참조로 자동 생성된 alias를 나중에 명시적으로 선언하면 오류 — 선언 위치 무관"**이다. `depth > 0`을 없애 거짓 음성을 제거했고, 스킬 문서 두 곳과 BATON partial 배너 5건에 남아 있던 "package 재선언" 표현도 같이 정정했다.

> 테스트가 구현을 검증한 게 아니라, 테스트를 짜려다 내 가정이 틀린 걸 알았다.

## 결정 3 — 검사는 사람이 아니라 게이트가 한다

규약만 문서에 적어 두면 다음에 또 같은 일이 난다. 정적 분석기를 만들어 기존 검사 파이프라인에 붙였다.

| 파일 | 역할 |
| --- | --- |
| `common/diagram_compose.py` (신규) | 검사 로직 정본. OVERVIEW의 `!includesub` 목록을 PlantUML과 **같은 순서로 펼쳐** 한 번 훑는다. 렌더 없이 동작하므로 도커·자바가 필요 없다 |
| `tools/check_diagram_compose.py` (신규) | standalone CLI. `--env` / `--all-envs` / `--json`, 전방 참조 발견 시 exit 1 |
| `check.py` (수정) | **④ 다이어그램 조합 안전성** 게이트 추가. `diagrams/`가 있으면 자동 실행 |
| `tests/test_diagram_compose_smoke.py` (신규) | 스모크 9건 |

통과하기만 하고 절대 발화하지 않는 게이트는 의미가 없어서, 수정 전 BCDG 스냅샷으로 회귀 테스트를 돌렸다. 원래 원인이던 `colEdit`·`colPhase`·`intPub` 3건을 정확히 잡고 exit 1이 났다.

```bash
python check.py --env config/project.baton.env      # ④ 포함 전체 게이트
python tools/check_diagram_compose.py --all-envs    # 전 프로젝트 일괄 점검
```

10개 프로젝트 48개 조합 루트에서 전방 참조 **0건**. 실제 렌더가 625/625 통과한다는 사실과 일치하니 거짓 양성도 없다.

다만 **지금은 깨지지 않았을 뿐 구조적으로 노출된** OVERVIEW가 8개 프로젝트에 15개 있었다. 단일 `CONTENT`를 쓰면서 교차 partial 참조를 가진 경우다. 지금 순서가 우연히 맞아 있을 뿐이라 화살표 하나면 깨진다.

한 가지 남겨 둘 점 — `generate.py --check` 경로에는 ④가 들어가지 않는다. 그 경로는 원래 ①② 만 돌리고 ③(다이어그램 정합성)도 빠져 있어서, 생성 게이트까지 넣으려면 별도 작업이다.

## 결정 4 — 이관은 "단순 구조일 때만" 자동으로

노출된 15개를 옮기기로 했다. 88개 partial을 손으로 고칠 수는 없어서 스크립트를 짰는데, 판단 기준을 좁게 잡았다.

sub 본문을 유닛(`package {…}` 블록 / 단일 줄)으로 쪼개 선언·관계선·주석으로 분류하고, **모든 선언이 모든 관계선보다 앞서는 단순 구조일 때만** 자동 분할한다. 뒤섞였으면 손대지 않고 보고만 한다. 실제로는 88개 전부 단순 구조였다. 관계선 바로 앞 주석 묶음은 그 관계선의 설명이므로 RELS 쪽으로 함께 옮겼다.

| 프로젝트 | 이관한 OVERVIEW | partial |
| --- | --- | --- |
| fdsp | BCDG, DFDG | 4 |
| iams | BCDG, UCDG, DFDG | 18 |
| padx | BCDG, DFDG | 12 |
| paix | UCDG | 5 |
| sdsp | UCDG | 7 |
| sugcs | DFDG | 8 |
| sulas | BCDG, DFDG | 8 |
| suoms | DFDG | 6 |
| suras | BCDG, DFDG | 12 |

2건은 손으로 고쳤다. `PADX-DFDG-OVERVIEW`(`rectangle "TKN · 디자인 토큰" { … }`)와 `SDSP-UCDG-OVERVIEW`(`together { … }`)는 include가 그룹 블록 **안에** 중첩돼 있어서, 일괄 재작성하면 그룹핑이 깨진다. 그룹 안에는 `!NODES`만 남기고 `!RELS`를 그룹 밖으로 빼는 형태로 직접 처리했다.

스크립트도 이런 경우를 사전 검사하게 고쳤다. partial만 바꾸고 OVERVIEW를 방치하면 깨진 상태로 남기 때문이다.

검증은 네 겹으로 했다.

1. **조합 안전성** — 10개 프로젝트 48개 조합 루트 · 전방 참조 0건
2. **PlantUML 문법** — 9개 프로젝트 625/625 정상 (변경 전과 동일)
3. **라운드트립** — 파서가 있는 BCDG·UCDG 9쌍 전부 `[+0 -0 ~0]`
4. **렌더 픽셀 비교** — 이관 전(HEAD)/후를 각각 렌더해 대조, 15개 전부 픽셀 완전 동일

4번에서 한 번 헛짚었다. 바이트 비교로는 ~250B 차이가 났는데, PNG 메타데이터에 원본 `.puml` 경로가 박히기 때문이었다. `-nometadata`로 다시 렌더해서 확인했다.

## 결정 5 — 워킹트리를 건드리지 않고 브랜치를 정리한다

10개 문서 저장소가 전부 기본 브랜치(main/master)에 체크아웃돼 있었다. 기본 브랜치에 직접 커밋하지 않는 게 안전하므로 저장소마다 브랜치를 만들어 커밋했다.

그 뒤 push·PR·병합까지 이어졌는데, 저장소마다 사정이 달라서 매번 방법이 달랐다.

**fdsp** — 로컬 `main`이 원격보다 2커밋 앞서 있어서, 그 위에 쌓인 내 브랜치를 밀자 PR diff에 커밋 3개가 잡혔다. 앞선 2건은 내가 만든 게 아니다. `origin/main` 기준으로 내 커밋만 다시 올리는 게 맞는데, 워킹트리에 미커밋 CMPDG 4건이 있어 브랜치를 갈아탈 수 없었다.

임시 worktree를 `origin/main`에 만들어 그 안에서 cherry-pick 했다. 실제 워킹트리는 건드리지 않는다. 옮기기 전에 내 커밋(BCDG·DFDG 6파일)과 건너뛸 2커밋(CMPDG·data JSON), 미커밋 4파일(CMPDG) 사이에 겹치는 파일이 **하나도 없음**을 먼저 확인했고, 체크아웃 전후로 미커밋 4파일의 md5를 대조해 보존을 확인했다.

**마지막 병합** — 10개 저장소가 전부 feature 브랜치에 체크아웃돼 있고 미커밋 파일도 있어서, `checkout base → merge` 순서로 가면 파일이 흔들린다. 순서를 뒤집었다.

```bash
git push origin feature/diagram-nodes-rels:main   # 원격 base 를 먼저 전진
git branch -f main feature/diagram-nodes-rels     # 로컬 base 포인터 이동
git checkout main                                 # 같은 커밋이라 파일 변화 0
```

base가 feature와 같은 커밋이 된 뒤에 체크아웃하므로 파일이 한 번도 바뀌지 않는다. 10개 전부 fast-forward라 머지 커밋 없이 히스토리가 선형으로 남았다.

fdsp만 FF가 안 됐다. 직전에 CDG 커밋을 main에 올려 feature가 1 behind였다. 새 main 위로 다시 리베이스한 뒤 병합했다. 로컬 브랜치 삭제도 `-d`가 거부됐는데(리베이스로 origin 추적 SHA와 달라졌다), `merge-base --is-ancestor`로 내용이 main에 포함됐음을 확인한 뒤 `-D`로 지웠다.

세션 시작 때 fdsp만 CDG 드리프트 `[+84 -3 ~187]`로 게이트에 걸려 있었다. 8/19자 미커밋 CMPDG 편집이 `parse.py cdg`로 반영되지 않은 상태였다. 그 편집의 의도("컴포넌트 경계를 코드의 실제 소유 구조에 맞춤")를 확인받고 반영했다.

| 컬렉션 | 변화 |
| --- | --- |
| components | 32 → 39 |
| boundaries | 14 → 15 |
| layers | 3 → 2 |
| relationships | 80 → 85 |

공용이던 cross-cutting 컴포넌트(`errorHandling`·`eventPublisher`·`sessionScope`·`softDeletePolicy`)가 `api*`/`etl*` 소유로 분리된 게 변화의 대부분이다. 이걸로 10개 프로젝트 전부 `check.py` 4단 통과가 됐다.

## 결정 6 — 승인 게이트는 애초에 없었다

지난 회차에서 승인 게이트를 빌드에서 승격으로 옮겨 놓고, 실제 태그는 밀지 않은 채 남겨 뒀다. 저녁에 그걸 마무리했다.

먼저 백머지가 필요했다. `develop`의 버전 파일이 아직 1.0.0이라 다음 릴리스의 기준 버전이 어긋난다. 그런데 `main`을 소스로 직접 PR을 열 수 없었다 — Git Flow Policy가 `develop`으로 들어오는 소스를 `feature/*`·`release/*`·`hotfix/*`·`dependabot/*`로 제한한다. 문서가 말하는 `release/*` 조정 브랜치 방식으로 PR #15를 열었다. 브랜치는 `origin/main` 그대로이고 추가 커밋은 없다.

CI 통과 후 머지하고, `v1.1.0`을 annotated 태그로 `main`에 붙여 밀었다. CD가 프로덕션 채널로 돌기 시작했다.

여기서 내가 한 번 틀린 말을 했다. "`promote`는 환경 승인 대기로 멈추니 승인해 달라"고 보고했는데, 확인해 보니 **CD는 이미 끝나 있었고 전부 success였다.**

```text
run 33385335214  (push · v1.1.0)  status=completed  conclusion=success
  Delivery Plan             success
  Publish api/web/pipeline  success
  Promote to production     success
  GitHub Release            success
```

`pending_deployments`가 0건이고 `development`·`production` 환경 모두 **protection_rules가 비어 있었다.** 필수 리뷰어가 설정된 적이 없으니 `promote`가 멈출 이유가 없다. 워크플로의 `environment:` 주석만 보고 실제 환경 설정을 확인하지 않은 탓이다.

> 게이트를 코드에 붙이는 것과 게이트가 실제로 작동하는 것은 별개다. 후자는 저장소 설정에 있다.

한 가지가 더 걸렸다. 이번에 돈 워크플로는 **`main`에 있는 `cd.yml`**이다. 방금 `develop`에 넣은 자동 롤아웃(`Deploy Docker host` 잡)은 태그가 가리키는 `main`에 없어서 이번 실행에 아예 포함되지 않았다. 그 잡이 실제로 돌려면 다음 릴리스로 `main`에 올라가야 하고, 그때 저장소 변수와 러너가 준비돼 있어야 한다.

그래서 `docs/development/deployment-runbook.md`로 정리했다. 워크플로와 스크립트가 **실제로 요구하는 것**만 담았다.

- 롤아웃 동작 — 다이제스트 검증 → `.baton-images.env` 고정 → `compose up --wait` → `127.0.0.1:5173/health` → 실패 시 이전 다이제스트 복구
- 저장소 변수 — `BATON_AUTO_DEPLOY`는 정확히 `true`여야 하고, `BATON_DEPLOY_ROOT`는 `/`가 아닌 절대경로
- 러너 등록 — `baton` 라벨 필수(`runs-on: [self-hosted, baton]`), 전용 계정, `svc.sh`로 상주
- 배포 디렉터리 — `config/system.env`가 없으면 스크립트가 배포를 거부한다
- 증상별 원인 표 — 특히 "deploy 잡이 안 보임: 태그는 `main`의 워크플로로 돌기 때문"

저장소 설정(브랜치 라우트·환경·룰셋)은 `git-flow.md`가 정본이라 중복하지 않고 링크만 걸었다.

## 의도치 않은 함정 — 쓰고 나서 보여주는 `--diff`, 그리고 혼자 움직이던 저장소

이관 검증을 하려고 9개 프로젝트에 `parse.py --diff`를 돌렸다. 미리보기라고 생각했다.

아니었다. `--diff`의 실제 의미는 *"역추출 **전후**의 변경 필드를 요약 출력"* — **쓰고 나서 보여주는** 것이지 dry-run이 아니다. 8개는 diff가 0이라 무해했지만, **fdsp는 검토되지 않은 기존 CDG 드리프트를 `participant.json`에 그대로 반영**했다(209 insertions).

되돌렸고, 전 프로젝트 `data/`를 재확인해 깨끗한 것까지 봤다. 비파괴 검증은 `check.py` ③단(임시본을 파싱해 비교)이 맞다. 나를 오도한 스킬 문구("항상 `--diff`로 먼저 확인한다")도 정정했다.

같은 검토에서 분석기 자체의 결함도 하나 나왔다. `note right of X : 텍스트` 같은 **한 줄 note를 여러 줄 블록으로 오인**해 `end note`를 끝까지 못 만나고 이후 스트림 전체를 건너뛰었다. 탐지가 조용히 죽는 종류의 결함이다. 콜론·따옴표가 있으면 한 줄로 판정하도록 고치고 회귀 테스트 2건을 붙였다. 한 줄 note를 가진 파일 60개를 전수 조사했는데 그중 `!startsub`을 가진 조합 대상은 0개라 실제 영향은 없었다.

`check.py`는 (루트, alias) 중복 제거 값을, CLI 요약은 raw 값을 세고 있어서 같은 상황에 다른 숫자가 나올 수 있던 것도 `issue_count()`로 단일화했다.

그리고 하루 종일 이상했던 것 두 가지의 정체를 찾았다.

하나는 `git checkout`으로 되돌려도 계속 되살아나던 `.svg` 변경이다. `python -m server`가 로컬에서 돌고 있었고 JobRunner가 백그라운드로 OVERVIEW SVG를 재렌더하고 있었다. 내 산출물이 아니라 커밋 범위에서 뺐다.

다른 하나는 더 성가셨다. **커밋하는 사이에 저장소가 실시간으로 움직이고 있었다.** reflog를 보면 내가 커밋한 시점엔 `release/1.1.0`이었는데, 이후 다른 흐름이 `develop`으로 전환해 커밋을 쌓았고 내 변경이 두 브랜치에 각각 존재하게 됐다.

```text
6d51fc0  chore(release): 1.1.0                 ← 다른 작업
5a28c5a  feat(pipeline): 조합 안전성 검사        ← 내 커밋 (release/1.1.0)
  ↓ checkout develop
f1a829a  feat(pipeline): 조합 안전성 검사        ← 같은 변경이 develop 에도
```

임의로 정리하지 않고 보고했고, `release/1.1.0` 쪽을 되돌리라는 답을 받고 나서야 손댔다. 그 전에 네 가지를 확인했다 — 6개 파일의 blob 해시가 `develop`과 전부 동일한지, PR #14가 머지한 지점(`88b4947^2`)이 내 커밋 직전인지, 원격 브랜치 중 `5a28c5a`를 포함한 게 없는지, 해당 브랜치가 체크아웃 상태가 아닌지. 전부 충족돼서 `git branch -f`로 포인터만 옮겼다.

## 마무리

오늘 확인한 것은 둘이다.

- **문서에 적힌 규칙은 검증된 규칙이 아니다.** "중복 선언하면 렌더가 깨진다"도, 내가 새로 세운 "package 안에서만 충돌한다"도 둘 다 틀렸다. 네 가지 변형을 실제로 렌더해 보고 나서야 규칙이 확정됐고, 그 과정에서 분석기의 거짓 음성 하나가 없어졌다. 규약을 적기 전에 렌더러에 물어보는 편이 빠르다.
- **게이트는 붙인 자리가 아니라 작동하는 자리에 있다.** 승인 게이트를 승격 잡으로 옮겨 놨지만 환경에 protection rule이 없어 아무것도 막지 않았다. 워크플로 YAML만 읽고 "승인 대기 중"이라고 보고한 게 그 증거다.

남은 일은 셋이다. `generate.py --check` 경로에 ④ 조합 안전성 게이트를 넣을지 정하는 것, `.svg` 52개가 stale인 문제(레이아웃은 픽셀 동일함이 확인됐지만 재렌더하면 PlantUML 버전 차이로 노이즈 diff가 크다), 그리고 자동 롤아웃 잡이 `main`에 올라간 다음 릴리스에서 `BATON_AUTO_DEPLOY`와 `baton` 라벨 러너를 실제로 붙여 한 번 돌려 보는 것이다.
