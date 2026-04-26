"use client";

import { WHEEL_EU, colorOf } from "../lib/roulette";
import type { SelState } from "../lib/selection";
import { selClass } from "../lib/selection";

type Pt = { x: number; y: number; angle: number };

function buildTrackPoints(count: number): Pt[] {
  // Aumentando a área útil para o Racetrack ocupar mais espaço
  const W = 900;
  const H = 350; // Aumentado para dar mais altura
  const padX = 50;
  const padY = 50;

  const r = 100; // Raio maior para curvas mais abertas
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
    if (s <= straightLen) return { x: left + r + s, y: top, angle: -Math.PI / 2 };
    s -= straightLen;

    if (s <= arcLen) {
      const t = s / arcLen;
      const ang = (-Math.PI / 2) + t * Math.PI;
      return { x: right - r + r * Math.cos(ang), y: midY + r * Math.sin(ang), angle: ang };
    }
    s -= arcLen;

    if (s <= straightLen) return { x: right - r - s, y: bottom, angle: Math.PI / 2 };
    s -= straightLen;

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
  const viewH = 350; // Sincronizado com buildTrackPoints

  return (
    <div className="raceBox" aria-label="Race Profissional">
      <svg viewBox={`0 0 ${viewW} ${viewH}`} width="100%" height="100%" preserveAspectRatio="xMidYMid meet">
        <defs>
          <filter id="premiumShadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="3" stdDeviation="4" floodOpacity="0.5" />
          </filter>
        </defs>

        {/* Base da Pista (Fundo) */}
        <path
          d={`M 150,50 L 750,50 A 125,125 0 0 1 750,300 L 150,300 A 125,125 0 0 1 150,50 Z`}
          fill="rgba(0,0,0,0.4)"
          stroke="rgba(255,255,255,0.05)"
          strokeWidth="60"
        />

        {/* Zonas de Texto Centrais - Maiores e mais visíveis */}
        <text x="450" y="160" textAnchor="middle" fontSize="16" fontWeight="900" fill="rgba(255,255,255,0.15)" letterSpacing="4">
          VOISINS DU ZÉRO
        </text>
        <text x="450" y="200" textAnchor="middle" fontSize="16" fontWeight="900" fill="rgba(255,255,255,0.15)" letterSpacing="4">
          TIERS DU CYLINDRE
        </text>
        <text x="100" y="175" textAnchor="middle" fontSize="12" fontWeight="900" fill="rgba(255,255,255,0.1)" transform="rotate(-90, 100, 175)">
          ORPHELINS
        </text>
        <text x="800" y="175" textAnchor="middle" fontSize="12" fontWeight="900" fill="rgba(255,255,255,0.1)" transform="rotate(90, 800, 175)">
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

          const rotation = (p.angle * 180) / Math.PI + 90;

          return (
            <g 
              key={n} 
              onClick={() => onPick(n)} 
              style={{ cursor: "pointer" }}
              className="raceNode"
            >
              {/* Célula de fundo - Maior para facilitar o clique */}
              <rect
                x={p.x - 22}
                y={p.y - 28}
                width="44"
                height="56"
                rx="6"
                fill={fill}
                stroke="rgba(255,255,255,0.2)"
                strokeWidth="1.5"
                transform={`rotate(${rotation}, ${p.x}, ${p.y})`}
                className="raceCell"
              />
              
              {/* Brilho superior */}
              <rect
                x={p.x - 18}
                y={p.y - 24}
                width="36"
                height="12"
                rx="3"
                fill="rgba(255,255,255,0.15)"
                transform={`rotate(${rotation}, ${p.x}, ${p.y})`}
                pointerEvents="none"
              />

              {/* Número - Maior e mais nítido */}
              <text 
                x={p.x} 
                y={p.y + 7} 
                textAnchor="middle" 
                fontSize="18" 
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
