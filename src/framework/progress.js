// progress.js — localStorage-backed completion tracker.
// Key: "okruhy.progress.v1" → { "<courseId>/<topicId>/<subtopicId>": timestamp }
//
// Exposes a small store + a React hook (useProgress) that re-renders when
// progress changes anywhere in the app or in another tab.

import { useEffect, useState, useMemo } from "react";

const PROGRESS_KEY = "okruhy.progress.v1";
const LAST_EXAM_SPEC_KEY = "okruhy.lastExamSpec.v1";
const TWEAKS_KEY = "okruhy.tweaks.v1";
const COLLAPSED_KEY = "okruhy.collapsed.v1";

export function loadProgress() {
  try {
    return JSON.parse(localStorage.getItem(PROGRESS_KEY) || "{}");
  } catch {
    return {};
  }
}

export function saveProgress(p) {
  localStorage.setItem(PROGRESS_KEY, JSON.stringify(p));
  window.dispatchEvent(new CustomEvent("okruhy:progress-changed"));
}

export function exportProgress() {
  return JSON.stringify(
    { version: 1, exportedAt: new Date().toISOString(), progress: loadProgress() },
    null,
    2
  );
}

export function importProgress(json) {
  const parsed = JSON.parse(json);
  if (!parsed.progress || typeof parsed.progress !== "object") {
    throw new Error("Invalid progress file");
  }
  const current = loadProgress();
  const merged = { ...current };
  for (const k of Object.keys(parsed.progress)) {
    merged[k] = Math.max(current[k] || 0, parsed.progress[k] || 0);
  }
  saveProgress(merged);
  return Object.keys(parsed.progress).length;
}

export function loadLastExamSpec() {
  try { return localStorage.getItem(LAST_EXAM_SPEC_KEY) || null; } catch { return null; }
}
export function saveLastExamSpec(id) {
  try { localStorage.setItem(LAST_EXAM_SPEC_KEY, id); } catch {}
}

export function loadTweaks() {
  try { return JSON.parse(localStorage.getItem(TWEAKS_KEY) || "{}"); } catch { return {}; }
}
export function saveTweaks(t) {
  localStorage.setItem(TWEAKS_KEY, JSON.stringify(t));
  window.dispatchEvent(new CustomEvent("okruhy:tweaks-changed"));
}

export function useProgress(content) {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const onChange = () => setTick((t) => t + 1);
    window.addEventListener("okruhy:progress-changed", onChange);
    window.addEventListener("storage", onChange);
    return () => {
      window.removeEventListener("okruhy:progress-changed", onChange);
      window.removeEventListener("storage", onChange);
    };
  }, []);

  const data = useMemo(loadProgress, [tick]);
  const set = useMemo(() => new Set(Object.keys(data)), [data]);

  const toggle = (key) => {
    const p = loadProgress();
    if (p[key]) delete p[key];
    else p[key] = Date.now();
    saveProgress(p);
  };

  const courseStats = (course) => {
    let total = 0, done = 0;
    for (const t of course.topics) {
      for (const s of t.subtopics) {
        total++;
        if (set.has(`${course.id}/${t.id}/${s.id}`)) done++;
      }
    }
    return { total, done, pct: total ? done / total : 0 };
  };

  const specStats = (specId) => {
    let total = 0, done = 0;
    if (!content) return { total, done, pct: 0 };
    for (const c of content.COURSES) {
      if (!c.specializations?.includes(specId)) continue;
      const s = courseStats(c);
      total += s.total;
      done += s.done;
    }
    return { total, done, pct: total ? done / total : 0 };
  };

  const examStats = (specId) => {
    if (!content) return { total: 0, done: 0, pct: 0 };
    const topics = content.EXAM_TOPICS[specId] || [];
    let total = 0, done = 0;
    for (const t of topics) {
      for (const [cid, tid, sid] of t.refs) {
        total++;
        if (set.has(`${cid}/${tid}/${sid}`)) done++;
      }
    }
    return { total, done, pct: total ? done / total : 0 };
  };

  return { raw: data, set, toggle, courseStats, specStats, examStats };
}

// Collapsed-section store: records the user's *explicit* expand/collapse choices.
// A stored `1` = collapsed, `0` = expanded; a key that's absent falls back to the
// caller-supplied `defaultCollapsed` (so non-core content can default to collapsed
// while everything else defaults to expanded). Legacy entries were `1`-only, so
// they still read as collapsed — backward compatible.
// Keys are app-defined strings like "topic:PDS/transport", "sub:PDS/transport/arq-okno",
// or "sec:PRL/stromy/expression-eval#2-aplikace-v-praxi" (a non-core section).
function loadCollapsed() {
  try { return JSON.parse(localStorage.getItem(COLLAPSED_KEY) || "{}"); } catch { return {}; }
}
function saveCollapsed(c) {
  localStorage.setItem(COLLAPSED_KEY, JSON.stringify(c));
  window.dispatchEvent(new CustomEvent("okruhy:collapsed-changed"));
}

export function useCollapsed() {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const on = () => setTick((t) => t + 1);
    window.addEventListener("okruhy:collapsed-changed", on);
    window.addEventListener("storage", on);
    return () => {
      window.removeEventListener("okruhy:collapsed-changed", on);
      window.removeEventListener("storage", on);
    };
  }, []);
  const data = useMemo(loadCollapsed, [tick]);
  const isCollapsed = (key, defaultCollapsed = false) =>
    (key in data ? data[key] === 1 : defaultCollapsed);
  // Always store the explicit choice (1/0) — never delete — so a user expanding a
  // default-collapsed item (or collapsing a default-expanded one) actually sticks.
  const setCollapsed = (key, collapsed) => {
    const c = loadCollapsed();
    c[key] = collapsed ? 1 : 0;
    saveCollapsed(c);
  };
  const toggle = (key, defaultCollapsed = false) =>
    setCollapsed(key, !isCollapsed(key, defaultCollapsed));
  return { isCollapsed, setCollapsed, toggle };
}

export function useTweaks(defaults) {
  const [state, setState] = useState(() => ({ ...defaults, ...loadTweaks() }));
  useEffect(() => {
    const on = () => setState((s) => ({ ...s, ...loadTweaks() }));
    window.addEventListener("okruhy:tweaks-changed", on);
    return () => window.removeEventListener("okruhy:tweaks-changed", on);
  }, []);
  const setOne = (k, v) => {
    setState((s) => {
      const next = { ...s, [k]: v };
      saveTweaks(next);
      return next;
    });
  };
  return [state, setOne];
}
