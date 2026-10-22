// 글에 내부 정보가 섞여 들어가지 않았는지 검사한다. 걸리면 종료 코드 1로 빌드를 막는다.
//
// 1) 기본 규칙(아래 RULES): 개인 로컬 경로, 사설 IP, 회사 Jira 주소처럼 일반적인 유출 패턴
//    업무 기록이 들어가는 devlog 글에만 적용한다. 옛 튜토리얼 글의 /home/ubuntu, 192.168.x 같은
//    예시 값은 오탐이라 제외한다. 토큰 형태 검사만 전체에 적용한다.
// 2) 금지어 목록: 실제 프로젝트 코드명, 사내 도메인 등. 저장소가 공개라서 목록 자체는 저장소에 두지 않는다.
//    - CI: GitHub Secrets의 SENSITIVE_TERMS (줄바꿈 또는 쉼표로 구분)
//    - 로컬: 저장소 루트의 .sensitive-terms (gitignore 대상, 한 줄에 하나, # 주석 가능)
//
// 공개 CI 로그에 금지어가 남지 않도록, 걸린 파일·줄 번호·규칙 번호만 출력하고 일치한 내용은 출력하지 않는다.

import { readFileSync, readdirSync, existsSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const ROOT = new URL('..', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1');
const SCAN_DIRS = ['src/content', 'src/pages', 'src/layouts', 'src/components'];
const EXTENSIONS = ['.md', '.mdx', '.astro', '.ts'];

const DEVLOG = /^src\/content\/posts\/devlog\//;

const RULES = [
  { id: 'local-path-windows', re: /[A-Za-z]:[\\/]+Users[\\/]+(?!<user>|\.\.\.|\*|%|Public|Default)[^\\/\s`'")]+/i, note: 'Windows 사용자 경로', scope: DEVLOG },
  { id: 'local-path-unix', re: /(?:^|[\s`'"(=])\/(?:Users|home)\/(?!<user>|\.\.\.|\*|runner)[a-z][\w.-]*/, note: 'Unix 사용자 경로', scope: DEVLOG },
  { id: 'private-ip', re: /\b(?:10\.\d{1,3}|192\.168|172\.(?:1[6-9]|2\d|3[01]))\.\d{1,3}\.\d{1,3}\b/, note: '사설 IP 주소', scope: DEVLOG },
  { id: 'atlassian-tenant', re: /\b(?!example\b|gwimong\b)[a-z0-9-]+\.atlassian\.net\b/i, note: 'Atlassian 테넌트 주소', scope: DEVLOG },
  { id: 'secret-like', re: /\b(?:ghp_[A-Za-z0-9]{30,}|github_pat_[A-Za-z0-9_]{30,}|AKIA[0-9A-Z]{16}|xox[bap]-[A-Za-z0-9-]{20,})\b/, note: '토큰 형태 문자열' },
];

function loadTerms() {
  const raw = [process.env.SENSITIVE_TERMS ?? ''];
  const file = join(ROOT, '.sensitive-terms');
  if (existsSync(file)) raw.push(readFileSync(file, 'utf8'));
  return raw
    .join('\n')
    .split(/\r?\n/)
    .filter(line => !line.trim().startsWith('#')) // 주석 줄은 쉼표로 쪼개기 전에 제거한다
    .flatMap(line => line.split(','))
    .map(t => t.trim())
    .filter(Boolean);
}

const escapeRe = s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

function* walk(dir) {
  if (!existsSync(dir)) return;
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) yield* walk(p);
    else if (EXTENSIONS.some(e => p.endsWith(e))) yield p;
  }
}

const terms = loadTerms();
const termRules = terms.map((t, i) => ({
  id: `term-${i + 1}`,
  // 영문·숫자에 붙어 있지 않을 때만 일치로 본다 (한글 조사 앞뒤는 허용)
  re: new RegExp(`(?<![A-Za-z0-9])${escapeRe(t)}(?![A-Za-z0-9])`, 'i'),
  note: '금지어 목록',
}));

if (terms.length === 0) {
  console.log('::notice::금지어 목록(SENSITIVE_TERMS 또는 .sensitive-terms)이 없어 기본 규칙만 검사합니다.');
}

const hits = [];
for (const dir of SCAN_DIRS) {
  for (const file of walk(join(ROOT, dir))) {
    const rel = relative(ROOT, file).replace(/\\/g, '/');
    const rules = [...RULES, ...termRules].filter(r => !r.scope || r.scope.test(rel));
    readFileSync(file, 'utf8').split(/\r?\n/).forEach((line, i) => {
      for (const rule of rules) {
        if (rule.re.test(line)) hits.push({ file: rel, line: i + 1, rule });
      }
    });
  }
}

if (hits.length > 0) {
  console.error(`\n내부 정보로 보이는 내용이 ${hits.length}건 발견됐습니다. (일치한 내용은 로그에 남기지 않습니다)\n`);
  for (const h of hits) {
    console.error(`  ${h.file}:${h.line}  [${h.rule.id}] ${h.rule.note}`);
  }
  console.error('\n실제 이름은 가상 이름으로 바꾸거나 일반 표현으로 서술하세요.');
  process.exit(1);
}

console.log(`내용 검사 통과: 기본 규칙 ${RULES.length}개 + 금지어 ${terms.length}개`);
