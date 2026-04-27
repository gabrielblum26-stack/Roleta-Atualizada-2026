"use client";

import React from "react";
import { WHEEL_EU, colorOf } from "../lib/roulette";
import type { SelState } from "../lib/selection";
import { selClass, getNumberColors } from "../lib/selection";

type Pt = { x: number; y: number; angle: number };

function buildTrackPoints(count: number): Pt[] {
  const W = 900;
  const H = 200; // Reduzido para remover espaço vazio vertical
  const padX = 60;
  const padY = 30; // Reduzido

  const r = 70; // Ajustado para a nova altura
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

function selectionFill(sel: SelState, n: number) {
  const colors = getNumberColors(sel, n);
  if (colors.length === 0) return null;
  if (colors.length === 1) return colors[0];
  
  // Para SVG, usamos um ID de gradiente definido nos <defs>
  return `url(#grad-${n})`;
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
  const viewH = 200; // Sincronizado com buildTrackPoints

  return (
    <div className="raceBox" aria-label="Race Profissional">
      <svg viewBox={`0 0 ${viewW} ${viewH}`} width="100%" height="100%" preserveAspectRatio="xMidYMid meet">
        <defs>
          <filter id="premiumShadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="3" stdDeviation="4" floodOpacity="0.5" />
          </filter>
          {WHEEL_EU.map(n => {
            const colors = getNumberColors(sel, n);
            if (colors.length <= 1) return null;
            const step = 100 / colors.length;
            return (
              <linearGradient id={`grad-${n}`} key={n} x1="0%" y1="0%" x2="100%" y2="100%">
                {colors.map((c, idx) => (
                  <React.Fragment key={idx}>
                    <stop offset={`${idx * step}%`} stopColor={c} />
                    <stop offset={`${(idx + 1) * step}%`} stopColor={c} />
                  </React.Fragment>
                ))}
              </linearGradient>
            );
          })}
        </defs>

        {/* Fundo da Pista */}
        <path
          d="M 140,40 L 760,40 A 80,80 0 0 1 760,200 L 140,200 A 80,80 0 0 1 140,40 Z"
          fill="rgba(0,0,0,0.6)"
          stroke="rgba(255,255,255,0.1)"
          strokeWidth="2"
        />

        {/* Linhas Divisórias de Zonas (Baseadas na imagem de referência) */}
        {/* Divisória Tiers / Orphelins (Esquerda) */}
        <line x1="320" y1="40" x2="360" y2="200" stroke="#3b82f6" strokeWidth="3" strokeOpacity="0.8" />
        
        {/* Divisória Orphelins / Voisins (Centro-Esquerda) */}
        <line x1="500" y1="40" x2="480" y2="200" stroke="#f97316" strokeWidth="3" strokeOpacity="0.8" />
        
        {/* Divisória Voisins / Zero (Direita) */}
        <path d="M 700,40 Q 750,120 700,200" fill="none" stroke="#eab308" strokeWidth="3" strokeOpacity="0.8" />

        {/* Textos das Zonas */}
        <text x="230" y="125" textAnchor="middle" fontSize="18" fontWeight="900" fill="rgba(255,255,255,0.4)" letterSpacing="2">TIERS</text>
        <text x="425" y="125" textAnchor="middle" fontSize="18" fontWeight="900" fill="rgba(255,255,255,0.4)" letterSpacing="2">ORPHELINS</text>
        <text x="590" y="125" textAnchor="middle" fontSize="18" fontWeight="900" fill="rgba(255,255,255,0.4)" letterSpacing="2">VOISINS</text>
        <text x="780" y="125" textAnchor="middle" fontSize="18" fontWeight="900" fill="rgba(255,255,255,0.4)" letterSpacing="2">ZERO</text>

        {/* Números da Pista */}
        {WHEEL_EU.map((n, i) => {
          const p = pts[i];
          const base = colorOf(n);
          const scls = selClass(sel, n);
          const override = selectionFill(sel, n);
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
              {/* Célula de fundo */}
              <rect
                x={p.x - 20}
                y={p.y - 26}
                width="40"
                height="52"
                rx="4"
                fill={fill}
                stroke="rgba(255,255,255,0.2)"
                strokeWidth="1"
                transform={`rotate(${rotation}, ${p.x}, ${p.y})`}
                className="raceCell"
              />
              
              {/* Brilho superior */}
              <rect
                x={p.x - 16}
                y={p.y - 22}
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
                y={p.y + 6} 
                textAnchor="middle" 
                fontSize="16" 
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
