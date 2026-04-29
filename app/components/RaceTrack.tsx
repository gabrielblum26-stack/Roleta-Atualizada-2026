"use client";

import React from "react";
import { WHEEL_EU, colorOf } from "../lib/roulette";
import type { SelState } from "../lib/selection";
import { selClass, getNumberColors } from "../lib/selection";

// Pontos da pista baseados em uma geometria oval de 900x240
type Pt = { x: number; y: number; angle: number };

function buildTrackPoints(count: number): Pt[] {
  const W = 900;
  const H = 240;
  const r = 90; // Raio das curvas
  const leftX = 120;
  const rightX = 780;
  const topY = 30;
  const bottomY = 210;
  const midY = (topY + bottomY) / 2;

  const straightLen = rightX - leftX;
  const arcLen = Math.PI * r;
  const totalLen = 2 * straightLen + 2 * arcLen;
  const step = totalLen / count;

  function pointAt(s: number): Pt {
    // Topo reto (da esquerda para a direita)
    if (s <= straightLen) {
      return { x: leftX + s, y: topY, angle: -Math.PI / 2 };
    }
    s -= straightLen;

    // Curva direita
    if (s <= arcLen) {
      const t = s / arcLen;
      const ang = -Math.PI / 2 + t * Math.PI;
      return { x: rightX + r * Math.cos(ang), y: midY + r * Math.sin(ang), angle: ang };
    }
    s -= arcLen;

    // Base reta (da direita para a esquerda)
    if (s <= straightLen) {
      return { x: rightX - s, y: bottomY, angle: Math.PI / 2 };
    }
    s -= straightLen;

    // Curva esquerda
    const t = s / arcLen;
    const ang = Math.PI / 2 + t * Math.PI;
    return { x: leftX + r * Math.cos(ang), y: midY + r * Math.sin(ang), angle: ang };
  }

  const pts: Pt[] = [];
  // Offset para alinhar o 0 no local correto (direita, no centro do arco)
  const offset = straightLen + (arcLen / 2) - (0 * step); 
  
  for (let i = 0; i < count; i++) {
    pts.push(pointAt((i * step + offset) % totalLen));
  }
  return pts;
}

function selectionFill(sel: SelState, n: number) {
  const colors = getNumberColors(sel, n);
  if (colors.length === 0) return null;
  if (colors.length === 1) return colors[0];
  return `url(#grad-race-${n})`;
}

export default function RaceTrack({
  sel,
  onPick,
}: {
  sel: SelState;
  onPick: (n: number) => void;
}) {
  const pts = buildTrackPoints(WHEEL_EU.length);
  const viewW = 1000;
  const viewH = 260;

  return (
    <div className="raceBox" style={{ padding: '10px', background: 'transparent' }}>
      <svg viewBox={`0 0 ${viewW} ${viewH}`} width="100%" height="100%" preserveAspectRatio="xMidYMid meet">
        <defs>
          {WHEEL_EU.map(n => {
            const colors = getNumberColors(sel, n);
            if (colors.length <= 1) return null;
            const step = 100 / colors.length;
            return (
              <linearGradient id={`grad-race-${n}`} key={n} x1="0%" y1="0%" x2="100%" y2="100%">
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

        {/* Estrutura de Fundo da Pista (Oval) */}
        <path
          d="M 120,30 L 780,30 A 90,90 0 0 1 780,210 L 120,210 A 90,90 0 0 1 120,30 Z"
          fill="#1a1a1a"
          stroke="#444"
          strokeWidth="4"
        />

        {/* Linhas Divisórias das Zonas */}
        {/* TIER */}
        <line x1="120" y1="30" x2="280" y2="210" stroke="#666" strokeWidth="2" />
        {/* ORPHELINS (Esquerda) */}
        <line x1="320" y1="30" x2="320" y2="210" stroke="#666" strokeWidth="2" />
        {/* ORPHELINS (Direita) / VOISINS */}
        <line x1="480" y1="30" x2="480" y2="210" stroke="#666" strokeWidth="2" />
        
        {/* Círculo do ZERO */}
        <ellipse cx="720" cy="120" rx="90" ry="65" fill="none" stroke="#666" strokeWidth="2" />

        {/* Textos das Zonas */}
        <text x="210" y="125" textAnchor="middle" fontSize="16" fontWeight="bold" fill="#888" style={{ pointerEvents: 'none' }}>TIER</text>
        <text x="400" y="125" textAnchor="middle" fontSize="16" fontWeight="bold" fill="#888" style={{ pointerEvents: 'none' }}>ORPHELINS</text>
        <text x="580" y="125" textAnchor="middle" fontSize="16" fontWeight="bold" fill="#888" style={{ pointerEvents: 'none' }}>VOISINS</text>
        <text x="720" y="125" textAnchor="middle" fontSize="16" fontWeight="bold" fill="#888" style={{ pointerEvents: 'none' }}>ZERO</text>

        {/* Números da Pista */}
        {WHEEL_EU.map((n, i) => {
          const p = pts[i];
          const base = colorOf(n);
          const override = selectionFill(sel, n);
          const fill = override ?? (base === 'red' ? '#c82d2d' : base === 'green' ? '#0f7a3a' : '#1c1c1c');
          
          const rotation = (p.angle * 180) / Math.PI + 90;

          return (
            <g 
              key={n} 
              onClick={() => onPick(n)} 
              style={{ cursor: "pointer" }}
            >
              <rect
                x={p.x - 18}
                y={p.y - 25}
                width="36"
                height="50"
                rx="2"
                fill={fill}
                stroke="#333"
                strokeWidth="1"
                transform={`rotate(${rotation}, ${p.x}, ${p.y})`}
              />
              <text 
                x={p.x} 
                y={p.y + 5} 
                textAnchor="middle" 
                fontSize="14" 
                fontWeight="bold" 
                fill="#fff"
                transform={`rotate(${rotation}, ${p.x}, ${p.y})`}
                style={{ userSelect: 'none', pointerEvents: 'none' }}
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
