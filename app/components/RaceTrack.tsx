"use client";

import { WHEEL_EU, colorOf } from "../lib/roulette";
import type { SelState } from "../lib/selection";
import { selClass } from "../lib/selection";

type Pt = { x: number; y: number; angle: number };

function buildTrackPoints(count: number): Pt[] {
  const W = 900;
  const H = 200;
  const padX = 60;
  const padY = 40;

  const r = 60; 
  const left = padX;
  const right = W - padX;
  const top = padY;
  const bottom = H - padY;

  const straightLen = (right - left) - 2 * r;
  const arcLen = Math.PI * r;
  const totalLen = 2 * straightLen + 2 * arcLen;
  const step = totalLen / count;

  const midY = (top + bottom) / 2;

  function pointAt(s: number): Pt {
    // 1) topo (esq->dir)
    if (s <= straightLen) return { x: left + r + s, y: top, angle: -Math.PI / 2 };
    s -= straightLen;

    // 2) curva direita (topo->baixo)
    if (s <= arcLen) {
      const t = s / arcLen;
      const ang = (-Math.PI / 2) + t * Math.PI;
      return { x: right - r + r * Math.cos(ang), y: midY + r * Math.sin(ang), angle: ang };
    }
    s -= arcLen;

    // 3) baixo (dir->esq)
    if (s <= straightLen) return { x: right - r - s, y: bottom, angle: Math.PI / 2 };
    s -= straightLen;

    // 4) curva esquerda (baixo->topo)
    const t = s / arcLen;
    const ang = (Math.PI / 2) + t * Math.PI;
    return { x: left + r + r * Math.cos(ang), y: midY + r * Math.sin(ang), angle: ang };
  }

  const pts: Pt[] = [];
  for (let i = 0; i < count; i++) pts.push(pointAt(i * step));
  return pts;
}

function selectionFill(scls: string) {
  if (scls && scls.startsWith("selC")) {
    const num = scls.slice(4);
    return `var(--selC${num})`;
  }
  return null;
}

function needsDarkText(scls: string) {
  const darkTextColors = ["selC2", "selC7", "selC8", "selC10", "selC11", "selC13", "selC14", "selC15", "selC17", "selC19", "selC20"];
  return darkTextColors.includes(scls);
}

export default function RaceTrack({
  sel,
  onPick,
}: {
  sel: SelState;
  onPick: (n: number) => void;
}) {
  const pts = buildTrackPoints(WHEEL_EU.length);
  const viewW = 900;
  const viewH = 200;

  // Zonas clássicas
  const zones = [
    { label: "VOISINS DU ZÉRO", start: 22, end: 25, color: "rgba(255,255,255,0.05)" },
    { label: "ORPHELINS", start: 1, end: 9, color: "rgba(255,255,255,0.05)" },
    { label: "TIERS DU CYLINDRE", start: 27, end: 33, color: "rgba(255,255,255,0.05)" },
    { label: "ORPHELINS", start: 17, end: 6, color: "rgba(255,255,255,0.05)" },
  ];

  return (
    <div className="raceBox" aria-label="Race Profissional">
      <svg viewBox={`0 0 ${viewW} ${viewH}`} width="100%" height="100%" preserveAspectRatio="xMidYMid meet">
        <defs>
          <filter id="premiumShadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="2" stdDeviation="3" floodOpacity="0.4" />
          </filter>
          <linearGradient id="trackGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="rgba(255,255,255,0.1)" />
            <stop offset="100%" stopColor="rgba(0,0,0,0.2)" />
          </linearGradient>
        </defs>

        {/* Base da Pista */}
        <path
          d="M 120,40 L 780,40 A 60,60 0 0 1 780,160 L 120,160 A 60,60 0 0 1 120,40 Z"
          fill="rgba(0,0,0,0.3)"
          stroke="rgba(255,255,255,0.1)"
          strokeWidth="40"
          strokeLinejoin="round"
        />

        {/* Zonas de Texto Centrais */}
        <text x="450" y="95" textAnchor="middle" fontSize="10" fontWeight="900" fill="rgba(255,255,255,0.3)" letterSpacing="2">
          VOISINS DU ZÉRO
        </text>
        <text x="450" y="115" textAnchor="middle" fontSize="10" fontWeight="900" fill="rgba(255,255,255,0.3)" letterSpacing="2">
          TIERS DU CYLINDRE
        </text>
        <text x="120" y="105" textAnchor="middle" fontSize="8" fontWeight="900" fill="rgba(255,255,255,0.2)" transform="rotate(-90, 120, 105)">
          ORPHELINS
        </text>
        <text x="780" y="105" textAnchor="middle" fontSize="8" fontWeight="900" fill="rgba(255,255,255,0.2)" transform="rotate(90, 780, 105)">
          ORPHELINS
        </text>

        {/* Números da Pista */}
        {WHEEL_EU.map((n, i) => {
          const p = pts[i];
          const base = colorOf(n);
          const scls = selClass(sel, n);
          const override = selectionFill(scls);
          const fill = override ?? `var(--${base})`;
          const textFill = needsDarkText(scls) ? "#111" : "#fff";

          // Rotação do marcador para alinhar com a pista
          const rotation = (p.angle * 180) / Math.PI + 90;

          return (
            <g 
              key={n} 
              onClick={() => onPick(n)} 
              style={{ cursor: "pointer" }}
              className="raceNode"
            >
              {/* Célula de fundo */}
              <rect
                x={p.x - 18}
                y={p.y - 22}
                width="36"
                height="44"
                rx="4"
                fill={fill}
                stroke="rgba(255,255,255,0.15)"
                strokeWidth="1"
                transform={`rotate(${rotation}, ${p.x}, ${p.y})`}
                className="raceCell"
              />
              
              {/* Brilho superior da célula */}
              <rect
                x={p.x - 16}
                y={p.y - 20}
                width="32"
                height="10"
                rx="2"
                fill="rgba(255,255,255,0.1)"
                transform={`rotate(${rotation}, ${p.x}, ${p.y})`}
                pointerEvents="none"
              />

              {/* Número */}
              <text 
                x={p.x} 
                y={p.y + 5} 
                textAnchor="middle" 
                fontSize="14" 
                fontWeight="1000" 
                fill={textFill}
                style={{ userSelect: 'none' }}
              >
                {n}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
