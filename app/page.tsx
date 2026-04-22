"use client";

import { useEffect, useMemo, useState } from "react";
import { colorOf, parseInput, neighborsEU } from "./lib/roulette";
import RaceTrack from "./components/RaceTrack";
import TableMap, { RepHighlight } from "./components/TableMap";
import NeighborsBlock from "./components/NeighborsBlock";
import { initSel, applyClick, selClass, SelMode, setActiveColor, SEL_ORDER } from "./lib/selection";
import { computeStreaks } from "./lib/streaks";
import { computeTerminals } from "./lib/terminals";
import { TerminalCard } from "./components/TerminalCard";
import { Metric } from "./components/Metric";

const SHORT_N = 20;
const LONG_N = 150; // ajustado para caber com o bloco de vizinhos (sem scroll)

export default function Page() {
  const [raw, setRaw] = useState("");
  const [history, setHistory] = useState<number[]>([]); // mais recente primeiro
  const [sel, setSel] = useState(initSel());
  const [selMode, setSelMode] = useState<SelMode>("neighbors");
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [showEaster99, setShowEaster99] = useState(false);

  function triggerEaster99() {
    if (typeof window === "undefined") return;
    const key = "easter99Seen";
    if (window.localStorage.getItem(key) === "1") return;
    window.localStorage.setItem(key, "1");
    setShowEaster99(true);
    window.setTimeout(() => setShowEaster99(false), 2600);
  }

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem("themeMode");
      if (saved === "dark" || saved === "light") setTheme(saved);
    } catch {}
  }, []);

  useEffect(() => {
    try {
      window.localStorage.setItem("themeMode", theme);
    } catch {}
    if (typeof document !== "undefined") {
      document.documentElement.classList.remove("theme-light", "theme-dark");
      document.body.classList.remove("theme-light", "theme-dark");
      document.documentElement.classList.add(theme === "dark" ? "theme-dark" : "theme-light");
      document.body.classList.add(theme === "dark" ? "theme-dark" : "theme-light");
    }
  }, [theme]);

  function addNumber(n: number) {
    setHistory((prev) => {
      const next = [n, ...prev];
      return next.slice(0, LONG_N);
    });
  }

  function onSend() {
    const parts = raw.split(/[,\s]+/).map((s) => s.trim()).filter(Boolean);
    if (parts.length === 0) return;
    let didSomething = false;
    for (const p of parts) {
      const n = Number(p);
      if (!Number.isFinite(n)) continue;
      if (n === 99) {
        triggerEaster99();
        didSomething = true;
        continue;
      }
      if (Number.isInteger(n) && n >= 0 && n <= 36) {
        addNumber(n);
        didSomething = true;
      }
    }
    if (didSomething) setRaw("");
  }

  function onUndoLast() {
    setHistory((prev) => (prev.length ? prev.slice(1) : prev));
  }

  function onResetAll() {
    setRaw("");
    setHistory([]);
    setSel(initSel());
  }

  function onResetColors() {
    setSel(initSel());
  }

  function onSelect(n: number) {
    setSel((prev) => applyClick(prev, n, selMode));
  }

  function onColorChange(index: number) {
    setSel((prev) => setActiveColor(prev, index));
  }

  const streaks = useMemo(() => computeStreaks(history), [history]);
  const terminals = useMemo(() => computeTerminals(history), [history]);

  const repHighlights = useMemo(() => {
    const s = new Set<RepHighlight>();
    if (streaks.color.count >= 2) {
      if (streaks.color.key === "red") s.add("red");
      if (streaks.color.key === "black") s.add("black");
    }
    if (streaks.parity.count >= 2) {
      if (streaks.parity.key === "even") s.add("even");
      if (streaks.parity.key === "odd") s.add("odd");
    }
    if (streaks.half.count >= 2) {
      if (streaks.half.key === "low") s.add("low");
      if (streaks.half.key === "high") s.add("high");
    }
    if (streaks.dozen.count >= 2) {
      if (streaks.dozen.key === 1) s.add("dozen1");
      if (streaks.dozen.key === 2) s.add("dozen2");
      if (streaks.dozen.key === 3) s.add("dozen3");
    }
    if (streaks.column.count >= 2) {
      if (streaks.column.key === 1) s.add("col1");
      if (streaks.column.key === 2) s.add("col2");
      if (streaks.column.key === 3) s.add("col3");
    }
    return s;
  }, [streaks]);

  const longGridItems = useMemo(() => {
    const arr: (number | null)[] = [];
    for (let i = 0; i < LONG_N; i++) arr.push(history[i] ?? null);
    return arr;
  }, [history]);

  const topZonePattern = useMemo(() => {
    const chrono = [...history].reverse();
    const digitalRoot = (n: number) => {
      const a = Math.abs(n);
      if (a === 0) return 0;
      return 1 + ((a - 1) % 9);
    };
    const disguisedKey = (n: number) => (n === 28 ? 0 : digitalRoot(n));
    const allNums = Array.from({ length: 37 }, (_, n) => n);
    const membersOfTerminal = (t: number) => allNums.filter((n) => n % 10 === t);
    const membersOfDisfar = (s: number) => allNums.filter((n) => disguisedKey(n) === s);
    type Trigger = { kind: "N" | "T" | "D" | "S"; id: string; label: string; members: number[] };
    const triggersFor = (x: number): Trigger[] => {
      const t = x % 10;
      const d = disguisedKey(x);
      const list: Trigger[] = [
        { kind: "N", id: `N:${x}`, label: `X ${x}`, members: [x] },
        { kind: "T", id: `T:${t}`, label: `Terminal ${t}`, members: membersOfTerminal(t) },
        { kind: "D", id: `D:${d}`, label: `Disfarçado ${d}`, members: membersOfDisfar(d) },
      ];
      if (d === x) list.push({ kind: "S", id: `S:${x}`, label: `Seco ${String(x).padStart(2, "0")}`, members: [x] });
      return list;
    };
    type Pattern = {
      triggerLabel: string;
      triggerKind: Trigger["kind"];
      triggerMembers: number[];
      xExample: number;
      count: number;
      setNums: number[];
      zones9: number[];
    };
    const counts = new Map<string, Pattern>();
    const zoneOf = (n: number) => {
      const nb = neighborsEU(n);
      return [nb.prev, n, nb.next] as [number, number, number];
    };
    for (let i = 0; i + 3 < chrono.length; i++) {
      const x = chrono[i];
      const w1 = chrono[i + 1];
      const w2 = chrono[i + 2];
      const w3 = chrono[i + 3];
      if (x === undefined || w1 === undefined || w2 === undefined || w3 === undefined) continue;
      const z1 = zoneOf(w1);
      const z2 = zoneOf(w2);
      const z3 = zoneOf(w3);
      const set = new Set<number>([...z1, ...z2, ...z3]);
      const setNums = Array.from(set).sort((a, b) => a - b);
      const setKey = setNums.join("-");
      for (const tr of triggersFor(x)) {
        const key = `${tr.id}|${setKey}`;
        const prev = counts.get(key);
        if (prev) prev.count += 1;
        else
          counts.set(key, {
            triggerLabel: tr.label,
            triggerKind: tr.kind,
            triggerMembers: tr.members,
            xExample: x,
            count: 1,
            setNums,
            zones9: [...z1, ...z2, ...z3],
          });
      }
    }
    const repeated = Array.from(counts.values()).filter((p) => p.count > 1);
    if (repeated.length === 0) return null;
    const kindRank = (k: Pattern["triggerKind"]) => (k === "T" || k === "D" || k === "S" ? 0 : 1);
    repeated.sort((a, b) => {
      if (b.count !== a.count) return b.count - a.count;
      const ca = a.setNums.length;
      const cb = b.setNums.length;
      if (ca !== cb) return ca - cb;
      const ka = kindRank(a.triggerKind);
      const kb = kindRank(b.triggerKind);
      if (ka !== kb) return ka - kb;
      return a.triggerLabel.localeCompare(b.triggerLabel);
    });
    return repeated[0];
  }, [history]);

  const disguisedKey = (n: number) => {
    if (n === 28) return 0;
    const a = Math.abs(n);
    if (a === 0) return 0;
    return 1 + ((a - 1) % 9);
  };

  const disguisedPairIdx = useMemo(() => {
    const marked = new Set<number>();
    for (let i = 0; i + 1 < history.length; i++) {
      const a = history[i];
      const b = history[i + 1];
      if (disguisedKey(a) === disguisedKey(b)) {
        marked.add(i);
        marked.add(i + 1);
      }
    }
    return marked;
  }, [history]);

  const selChipClass = (n: number) => selClass(sel, n);
  const lastTen = history.slice(0, 10);

  return (
    <div className={`app ${theme === "dark" ? "theme-dark" : "theme-light"}`}>
      {showEaster99 && (
        <div className="easterOverlay" onClick={() => setShowEaster99(false)}>
          <img src="/easter-99.gif" alt="Easter 99" />
        </div>
      )}
      <div className="panel topbar">
        <label>Digite (vírgula):</label>
        <div className="inputWrap">
          <input
            type="text"
            placeholder="Ex: 1,24,36"
            value={raw}
            onChange={(e) => setRaw(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                onSend();
              }
            }}
          />
        </div>
        <button className="btn btn-send" onClick={onSend}>ENVIAR</button>
        <button className="btn btn-undo" onClick={onUndoLast}>APAGAR</button>
        <button className="btn btn-colors" onClick={onResetColors} title="Limpa apenas seleções">
          RESET DE CORES
        </button>

        <div className="colorPicker">
          <span className="colorLabel">COR ATIVA:</span>
          {SEL_ORDER.map((_, idx) => (
            <div
              key={idx}
              className={`colorCircle activeC${idx + 1} ${sel.activeColorIndex === idx ? "active" : ""}`}
              style={{ backgroundColor: `var(--selC${idx + 1})` }}
              onClick={() => onColorChange(idx)}
              title={`Cor ${idx + 1}`}
            />
          ))}
        </div>

        <div className="modeSelectWrap" title="Muda a função do seletor de cores">
          <span className="modeLabel">MODO</span>
          <select
            className="modeSelect"
            value={selMode}
            onChange={(e) => setSelMode(e.target.value as SelMode)}
            aria-label="Modo do seletor de cores"
          >
            <option value="neighbors">1 — Vizinhos</option>
            <option value="unique">2 — Único</option>
            <option value="terminalDisguised">3 — Disfarçados do Terminal</option>
            <option value="sumDisguised">4 — Disfarçados da Soma</option>
            <option value="newMarking">5 — Nova marcação</option>
          </select>
        </div>

        <button className="btn btn-theme" onClick={() => setTheme((t) => (t === "light" ? "dark" : "light"))} title="Mudar tema claro/escuro">
          {theme === "light" ? "🌙" : "☀️"}
        </button>
        <button className="btn btn-reset" onClick={onResetAll}>RESET</button>
      </div>

      <div className="panel lastStrip" aria-label="Últimos números (curto)">
        {history.slice(0, SHORT_N).map((n, i) => (
          <div
            key={`${n}-${i}`}
            className={`chip ${colorOf(n)} ${selChipClass(n)}`}
            onClick={() => onSelect(n)}
            title="Clique para selecionar (não registra)"
          >
            {n}
          </div>
        ))}
      </div>

      <div className="panel zoneStrip" aria-label="Padrão de zona (top)">
        <div className="zoneTitle">Padrão de Zona (Top)</div>
        {!topZonePattern ? (
          <div className="zoneEmpty">Sem padrão repetido ainda (precisa de X + 3 giros depois, repetindo &gt; 1)</div>
        ) : (
          <div className="zoneWrap">
            <div className="zoneHead">
              <div
                className={`chip ${colorOf(topZonePattern.xExample)} ${selChipClass(topZonePattern.xExample)}`}
                onClick={() => onSelect(topZonePattern.xExample)}
                title="X exemplo (clique seleciona)"
              >
                {topZonePattern.triggerKind === "T"
                  ? topZonePattern.triggerLabel.replace("Terminal ", "")
                  : topZonePattern.triggerKind === "D"
                  ? topZonePattern.triggerLabel.replace("Disfarçado ", "")
                  : topZonePattern.triggerKind === "S"
                  ? topZonePattern.triggerLabel.replace("Seco ", "")
                  : topZonePattern.xExample}
              </div>
              <div className="zoneMeta">
                <div className="zoneCount">{topZonePattern.count}x</div>
                <div className="zoneBadges">
                  <span className="zb">{topZonePattern.triggerLabel}</span>
                  {topZonePattern.triggerMembers.length > 1 && (
                    <span className="zb">{topZonePattern.triggerMembers.join(", ")}</span>
                  )}
                </div>
              </div>
            </div>
            <div className="zoneZones">
              {[0, 3, 6].map((off) => (
                <div key={off} className="zone3">
                  {topZonePattern.zones9.slice(off, off + 3).map((n, idx) => (
                    <div
                      key={idx}
                      className={`chip chipSmall ${colorOf(n)} ${selChipClass(n)}`}
                      onClick={() => onSelect(n)}
                      title="Número da zona (clique seleciona)"
                    >
                      {n}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="main">
        <div className="panel left">
          <div className="sectionTitle">Histórico (150)</div>
          <div className="longGrid" aria-label="Histórico longo">
            {longGridItems.map((n, idx) => {
              if (n === null) return <div key={idx} className="longCell empty" />;
              return (
                <div
                  key={idx}
                  className={`longCell ${colorOf(n)} ${selChipClass(n)} ${disguisedPairIdx.has(idx) ? "historyPair" : ""}`}
                  onClick={() => onSelect(n)}
                  title="Clique para selecionar (não registra)"
                >
                  {n}
                </div>
              );
            })}
          </div>
          <div className="hint">
            Entrada só pelo input. Clique em número seleciona N e vizinhos (ou outro modo) com a cor ativa.
            A seleção substitui a cor do chip. “RESET DE CORES” limpa as marcações.
          </div>
        </div>
        <NeighborsBlock history={lastTen} sel={sel} onPick={onSelect} />
        <div className="panel right">
          <RaceTrack sel={sel} onPick={onSelect} />
          <TableMap sel={sel} rep={repHighlights} onPick={onSelect} />
        </div>
      </div>

      <div className="panel terminals" aria-label="Terminais">
        {terminals.map((t) => <TerminalCard key={t.d} s={t} />)}
      </div>

      <div className="panel reps" aria-label="Repetições">
        <Metric title="VERMELHO" value={streaks.color.key === "red" ? streaks.color.count : null} />
        <Metric title="PRETO" value={streaks.color.key === "black" ? streaks.color.count : null} />
        <Metric title="PAR" value={streaks.parity.key === "even" ? streaks.parity.count : null} />
        <Metric title="ÍMPAR" value={streaks.parity.key === "odd" ? streaks.parity.count : null} />
        <Metric title="BAIXO" value={streaks.half.key === "low" ? streaks.half.count : null} />
        <Metric title="ALTO" value={streaks.half.key === "high" ? streaks.half.count : null} />
        <Metric title="COL 1" value={streaks.column.key === 1 ? streaks.column.count : null} />
        <Metric title="COL 2" value={streaks.column.key === 2 ? streaks.column.count : null} />
        <Metric title="COL 3" value={streaks.column.key === 3 ? streaks.column.count : null} />
        <Metric title="1ª DUZ" value={streaks.dozen.key === 1 ? streaks.dozen.count : null} />
        <Metric title="2ª DUZ" value={streaks.dozen.key === 2 ? streaks.dozen.count : null} />
        <Metric title="3ª DUZ" value={streaks.dozen.key === 3 ? streaks.dozen.count : null} />
      </div>

      <div className="versionBadge">v2.3.0</div>
    </div>
  );
}
