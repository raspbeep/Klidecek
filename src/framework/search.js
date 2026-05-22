// search.js — fuzzy-ish search across courses, topics, and subtopics.
// Normalises diacritics so "rizeni" matches "Řízení" (Czech content).
// `buildIndex(content)` flattens the manifest into a searchable list;
// `search(index, query, { scopeCourseId })` returns up to 50 ranked results.

function norm(s) {
  return (s || "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
}

export function buildIndex(content) {
  const items = [];
  for (const c of content.COURSES || []) {
    items.push({
      kind: "course",
      label: c.name,
      courseId: c.id,
      courseName: c.name,
      verified: !!c.verified,
      route: `/c/${c.id}`,
    });
    for (const t of c.topics || []) {
      items.push({
        kind: "topic",
        label: t.title,
        courseId: c.id,
        courseName: c.name,
        topicId: t.id,
        topicTitle: t.title,
        verified: !!t.verified,
        route: `/c/${c.id}/${t.id}`,
      });
      for (const s of t.subtopics || []) {
        items.push({
          kind: "sub",
          label: s.title,
          courseId: c.id,
          courseName: c.name,
          topicId: t.id,
          topicTitle: t.title,
          subId: s.id,
          verified: !!s.verified,
          route: `/c/${c.id}/${t.id}/${s.id}`,
        });
      }
    }
  }
  for (const it of items) it._n = norm(it.label);
  return items;
}

export function search(index, query, opts = {}) {
  const q = norm((query || "").trim());
  if (!q) return [];
  const tokens = q.split(/\s+/).filter(Boolean);

  const results = [];
  for (const it of index) {
    if (opts.scopeCourseId && it.courseId !== opts.scopeCourseId) continue;

    let score = 0;
    if (it._n === q) score = 1000;
    else if (it._n.startsWith(q)) score = 600;
    else if (it._n.includes(q)) score = 300;
    else if (tokens.length > 1 && tokens.every((t) => it._n.includes(t))) score = 150;

    if (score > 0) {
      score -= it._n.length * 0.15;          // shorter labels rank slightly higher
      if (it.kind === "sub") score += 25;     // leaves are usually what the reader wants
      else if (it.kind === "topic") score += 10;
      results.push({ ...it, _score: score });
    }
  }
  results.sort((a, b) => b._score - a._score);
  return results.slice(0, 50);
}

// Highlight match positions inside the original (un-normalised) label. Returns
// an array of { text, hit } segments so the caller can render <mark>…</mark>.
export function highlight(label, query) {
  const q = norm((query || "").trim());
  if (!q || !label) return [{ text: label || "", hit: false }];
  const n = norm(label);
  const tokens = Array.from(new Set([q, ...q.split(/\s+/).filter((t) => t.length >= 2)]));
  // Mark every character of `label` that falls inside any token match.
  const marks = new Array(label.length).fill(false);
  for (const tok of tokens) {
    let from = 0;
    while (from < n.length) {
      const idx = n.indexOf(tok, from);
      if (idx < 0) break;
      for (let i = idx; i < idx + tok.length && i < marks.length; i++) marks[i] = true;
      from = idx + tok.length;
    }
  }
  // Collapse consecutive matched/unmatched characters into segments.
  const segs = [];
  let cur = "";
  let curHit = marks[0] || false;
  for (let i = 0; i < label.length; i++) {
    const m = marks[i];
    if (m === curHit) cur += label[i];
    else { if (cur) segs.push({ text: cur, hit: curHit }); cur = label[i]; curHit = m; }
  }
  if (cur) segs.push({ text: cur, hit: curHit });
  return segs;
}
