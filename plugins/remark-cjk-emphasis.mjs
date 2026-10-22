// CommonMark는 닫는 `**` 앞이 기호이고 뒤가 한글이면 강조로 인식하지 않는다.
//   예) **TOC 필드(`w:sdt`)**를  →  별표가 그대로 노출됨
// 파서가 처리하고 남은 `**`/`*`를 같은 문단 안에서 짝지어 strong/emphasis로 바꾼다.
// 이미 정상 파싱된 강조는 노드가 따로 있어서 영향이 없고, 코드 블록·인라인 코드는
// text 노드가 아니므로 건드리지 않는다.

const PASSES = [
  { re: /\*\*/g, type: 'strong' },
  { re: /(?<!\*)\*(?!\*)/g, type: 'emphasis' },
];

function wrap(parent, { re, type }) {
  const items = [];
  for (const child of parent.children) {
    if (child.type !== 'text') {
      items.push({ node: child });
      continue;
    }
    const value = child.value;
    let last = 0;
    for (const m of value.matchAll(re)) {
      if (m.index > last) items.push({ node: { type: 'text', value: value.slice(last, m.index) } });
      const prev = m.index > 0 ? value[m.index - 1] : null;
      const next = m.index + m[0].length < value.length ? value[m.index + m[0].length] : null;
      items.push({
        token: m[0],
        // 노드 경계는 공백이 아닌 것으로 본다
        canOpen: next === null || !/\s/.test(next),
        canClose: prev === null || !/\s/.test(prev),
      });
      last = m.index + m[0].length;
    }
    if (last < value.length) items.push({ node: { type: 'text', value: value.slice(last) } });
  }

  if (!items.some(i => i.token)) return false;

  const out = [];
  let open = -1;
  items.forEach((item, i) => {
    if (!item.token) return;
    if (open < 0 && item.canOpen) open = i;
    else if (open >= 0 && item.canClose) {
      const inner = items.slice(open + 1, i).map(x => x.node ?? { type: 'text', value: x.token });
      if (inner.length > 0) {
        items[open].wrapped = { type, children: inner };
        items[open].end = i;
      }
      open = -1;
    }
  });

  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    if (item.wrapped) {
      out.push(item.wrapped);
      i = item.end;
    } else if (item.token) {
      out.push({ type: 'text', value: item.token });
    } else {
      out.push(item.node);
    }
  }

  // 인접한 text 노드를 합친다
  parent.children = out.reduce((acc, node) => {
    const prev = acc[acc.length - 1];
    if (prev && prev.type === 'text' && node.type === 'text') prev.value += node.value;
    else acc.push(node);
    return acc;
  }, []);
  return true;
}

function walk(node) {
  if (!node.children) return;
  for (const child of node.children) walk(child);
  if (['paragraph', 'heading', 'tableCell', 'listItem'].includes(node.type) || node.type === 'strong' || node.type === 'emphasis' || node.type === 'link') {
    if (node.children.some(c => c.type === 'text')) {
      for (const pass of PASSES) wrap(node, pass);
    }
  }
}

export default function remarkCjkEmphasis() {
  return tree => walk(tree);
}
