// komise-context.jsx — app-wide shared state for the committee data.
//
// One place owns the merged index, the repository list, and the selected commission
// (board), so the /k page AND the exam-prep pages stay in sync. The index is loaded
// *lazily*: the provider does nothing until a consumer calls ensureLoaded() (the first
// time an exam topic page or the Komise page mounts), so users who never touch the
// feature don't pay for the fetch.

import { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import { loadRepos, loadBoard, saveBoard, fetchAll, buildIndex, clearRepoCache } from "./komise.js";

const KomiseCtx = createContext(null);

export function KomiseProvider({ children }) {
  const [repos, setReposState] = useState(() => loadRepos());
  const [board, setBoardState] = useState(() => loadBoard());
  const [data, setData] = useState({ status: "idle", index: null, errors: [] });
  const started = useRef(false);

  const load = useCallback((list, { fresh = false } = {}) => {
    const repoList = list || loadRepos();
    if (fresh) clearRepoCache();
    started.current = true;
    setData((d) => ({ ...d, status: "loading" }));
    fetchAll(repoList).then(({ payloads, errors }) => {
      setData({ status: "ready", index: buildIndex(payloads), errors });
    });
  }, []);

  // idempotent: first consumer triggers the one fetch, later ones are no-ops
  const ensureLoaded = useCallback(() => { if (!started.current) load(); }, [load]);

  const reload = useCallback((list, opts) => load(list, opts), [load]);
  const setRepos = useCallback((next, opts) => { setReposState(next); load(next, opts); }, [load]);
  const setBoard = useCallback((keys) => { setBoardState(keys); saveBoard(keys); }, []);

  const value = { repos, setRepos, board, setBoard, reload, ensureLoaded, ...data };
  return <KomiseCtx.Provider value={value}>{children}</KomiseCtx.Provider>;
}

export function useKomise() {
  return useContext(KomiseCtx);
}

// Convenience for pages that only need the index: ensures the load is kicked off.
export function useKomiseLoaded() {
  const k = useKomise();
  useEffect(() => { if (k) k.ensureLoaded(); }, [k]);
  return k;
}
