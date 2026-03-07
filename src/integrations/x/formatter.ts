export function normalizeWhitespace(text: string) {
  return text.replace(/\r\n/g, '\n').replace(/\t/g, ' ').replace(/[ \u3000]+\n/g, '\n').replace(/\n{3,}/g, '\n\n').trim();
}

export function formatChineseNumberedPoints(text: string) {
  let s = normalizeWhitespace(text);
  if (!s.includes('\n')) {
    s = s.replace(/\s*([1-9]\d*[、.．)）])/g, '\n$1');
  }
  s = s.replace(/^\n+/, '');
  return s;
}

export function splitThread(text: string, maxLen = 260): string[] {
  const formatted = formatChineseNumberedPoints(text);
  const paragraphs = formatted.split(/\n+/).map(x => x.trim()).filter(Boolean);
  const chunks: string[] = [];
  let current = '';
  for (const p of paragraphs) {
    const candidate = current ? `${current}\n\n${p}` : p;
    if (candidate.length <= maxLen) {
      current = candidate;
      continue;
    }
    if (current) chunks.push(current);
    if (p.length <= maxLen) {
      current = p;
      continue;
    }
    // fallback hard split
    let rest = p;
    while (rest.length > maxLen) {
      chunks.push(rest.slice(0, maxLen));
      rest = rest.slice(maxLen);
    }
    current = rest;
  }
  if (current) chunks.push(current);
  if (chunks.length <= 1) return [formatted];
  const total = chunks.length;
  return chunks.map((c, i) => `(${i + 1}/${total}) ${c}`);
}
