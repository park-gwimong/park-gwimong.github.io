# Gwimong's Dev Blog

개발하면서 겪었던 문제들과 해결 과정을 정리하는 기술 블로그입니다.

🔗 <https://park-gwimong.github.io>

## Tech Stack

- [Astro](https://astro.build/) 4.x - Static Site Generator
- [MathJax](https://www.mathjax.org/) - 수식 렌더링 (frontmatter `math: true`인 글만 로드)
- [Pagefind](https://pagefind.app/) - 정적 검색 (빌드 후 색인 생성)
- [Disqus](https://disqus.com/) - 댓글
- GitHub Pages - Hosting
- GitHub Actions - CI/CD

## Topics

- **Software Engineering** - 개발 방법론, 아키텍처, 추적성
- **Programming** - Java, Spring, C#, JavaScript, Qt 등
- **AWS** - EC2, CLI
- **Linux / System** - 시스템 관리
- **Database**
- **Network / Security**
- **Troubleshooting** - 문제 해결 기록
- **Devlog** - 개발 일지

## Development

```bash
# 의존성 설치
npm install

# 개발 서버 실행 (http://localhost:5000)
npm run dev

# 프로덕션 빌드 (내용 검사 → 빌드 → 검색 색인 생성)
npm run build

# 글에 내부 정보가 섞였는지만 검사
npm run check:content

# Astro 타입 검사
npm run check

# 빌드 결과 미리보기
npm run preview
```

`main` 브랜치에 푸시하면 GitHub Actions를 통해 자동 배포됩니다.

## Project Structure

```
src/
├── content/posts/   # 카테고리별 마크다운 블로그 글
├── content/config.ts # 콘텐츠 컬렉션 스키마
├── layouts/         # 페이지 레이아웃 (BaseLayout, PostLayout)
├── pages/           # 라우트 및 동적 라우트
├── components/      # UI 컴포넌트
└── styles/          # 전역 CSS
public/
├── resource/        # 연도별 게시물 이미지
└── favicon.ico
```

- **Permalink 구조**: `/:year/:month/:day/:slug/`
- **RSS 피드**: `/rss.xml`, **사이트맵**: `/sitemap-index.xml`, **검색**: `/search/` (어느 페이지에서나 `/` 키)
- **시리즈**: 카테고리 폴더 아래 한 단계 더 폴더를 두면 시리즈로 묶인다 (예: `devlog/baton/`). 표시 이름은 `src/lib/posts.ts`의 `SERIES_TITLES`에 등록한다.
- **초안**: `draft: true`인 글은 프로덕션 빌드의 페이지·목록·검색·사이트맵·RSS에서 모두 빠지고 개발 서버(`npm run dev`)에서만 보인다.
- 검색은 빌드할 때 색인을 만들어서 `npm run dev`에서는 동작하지 않는다. `npm run build && npm run preview`로 확인한다.

## 내용 검사 (민감 정보 방지)

`npm run check:content`는 글에 실제 프로젝트명·사내 도메인·개인 경로 등이 섞였는지 검사하고, 걸리면 빌드를 막는다. CI에서도 같은 검사를 돌리며 PR에서도 실행된다.

- **기본 규칙**: 개인 경로, 사설 IP, 외부 Atlassian 주소(`devlog/` 아래), 토큰 형태 문자열
- **금지어 목록**: 저장소가 공개라서 목록 자체는 저장소에 두지 않는다.
  - 로컬: 저장소 루트의 `.sensitive-terms` (gitignore 대상, 한 줄에 하나, `#` 주석)
  - CI: GitHub Secrets의 `SENSITIVE_TERMS` (줄바꿈 또는 쉼표로 구분). 없으면 기본 규칙만 검사한다.
- 공개 CI 로그에 남지 않도록 걸린 **파일·줄 번호·규칙 번호만** 출력하고 일치한 내용은 출력하지 않는다.

## Writing a Post

`src/content/posts/<category>/` 아래에 kebab-case 소문자 파일명으로 작성합니다.

```yaml
---
title: 글 제목
subtitle: 선택적 부제
pubDate: 2024-01-15
category: softwareengineering  # posts 하위 디렉터리명과 일치 (소문자)
tags: [tag1, tag2, tag3]
math: true                     # LaTeX/MathJax 포함 시에만 true
draft: true
---
```

## License

[MIT](LICENSE)
