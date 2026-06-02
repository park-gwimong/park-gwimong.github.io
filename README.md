# Gwimong's Dev Blog

개발하면서 겪었던 문제들과 해결 과정을 정리하는 기술 블로그입니다.

🔗 <https://park-gwimong.github.io>

## Tech Stack

- [Astro](https://astro.build/) 4.x - Static Site Generator
- [MathJax](https://www.mathjax.org/) - 수식 렌더링
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

# 프로덕션 빌드
npm run build

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
- **RSS 피드**: `/rss.xml`

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
draft: false
---
```

## License

[MIT](LICENSE)
