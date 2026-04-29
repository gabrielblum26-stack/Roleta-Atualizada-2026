"use client";

import React from "react";
import { WHEEL_EU, colorOf } from "../lib/roulette";
import type { SelState } from "../lib/selection";
import { selClass, getNumberColors } from "../lib/selection";

type Pt = { x: number; y: number; angle: number; n: number };

/**
 * Constrói os pontos da Racetrack:
 * - 0 posicionado uma casa abaixo do extremo direito.
 * - Ordem original da roleta europeia (WHEEL_EU).
 */
function buildTrackPoints(): Pt[] {
  const W = 900;
  const H = 240;
  const r = 90; // Raio das curvas
  const paddingX = 80;
  const straightLen = W - 2 * paddingX - 2 * r;
  
  const leftX = paddingX + r;
  const rightX = W - paddingX - r;
  const topY = (H / 2) - r;
  const bottomY = (H / 2) + r;
  const midY = H / 2;

  const arcLen = Math.PI * r;
  const totalLen = 2 * straightLen + 2 * arcLen;
  const step = totalLen / WHEEL_EU.length;

  // O extremo direito (centro do arco direito) é s = arcLen / 2.
  // O usuário quer o 0 "uma casa abaixo" dessa posição.
  // Como a sequência deve seguir a ordem da roleta, e queremos que ela suba ou desça corretamente,
  // vamos definir o offset para que o índice 0 (número 0) fique uma casa (step) abaixo do centro.
  // Centro do arco direito (ângulo 0) é arcLen / 2.
  // "Abaixo" no arco direito significa aumentar o valor de s (indo em direção ao bottomY).
  const offset = (arcLen / 2) + step;

  function pointAt(index: number): Pt {
    // Usamos a ordem original WHEEL_EU.
    // s aumenta conforme o índice aumenta, percorrendo a pista.
    let s = (offset + (index * step)) % totalLen;
    const n = WHEEL_EU[index];

    // 1. Arco Direito (Descendo/Subindo pela direita)
    // s=0 é o topo da curva direita. s=arcLen é o fundo da curva direita.
    if (s <= arcLen) {
      const t = s / arcLen;
      const ang = (-Math.PI / 2) + t * Math.PI;
      return { x: rightX + r * Math.cos(ang), y: midY + r * Math.sin(ang), angle: ang, n };
    }
    s -= arcLen;

    // 2. Reta Inferior (Direita -> Esquerda)
    if (s <= straightLen) {
      return { x: rightX - s, y: bottomY, angle: Math.PI / 2, n };
    }
    s -= straightLen;

    // 3. Arco Esquerdo (Subindo/Descendo pela esquerda)
    if (s <= arcLen) {
      const t = s / arcLen;
      const ang = (Math.PI / 2) + t * Math.PI;
      return { x: leftX + r * Math.cos(ang), y: midY + r * Math.sin(ang), angle: ang, n };
    }
    s -= arcLen;

    // 4. Reta Superior (Esquerda -> Direita)
    return { x: leftX + s, y: topY, angle: -Math.PI / 2, n };
  }

  const pts: Pt[] = [];
  for (let i = 0; i < WHEEL_EU.length; i++) {
    pts.push(pointAt(i));
  }
  return pts;
}

function selectionFill(sel: SelState, n: number) {
  const colors = getNumberColors(sel, n);
  if (colors.length === 0) return null;
  if (colors.length === 1) return colors[0];
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
  const pts = buildTrackPoints();
  const viewW = 900;
  const viewH = 240;

  return (
    <div className="raceBox" aria-label="Race Profissional">
      <svg viewBox={`0 0 ${viewW} ${viewH}`} width="100%" height="100%" preserveAspectRatio="xMidYMid meet">
        <defs>
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

        {/* Fundo da Pista (Pista externa) */}
        <path
          d="M 170,30 L 730,30 A 90,90 0 0 1 730,210 L 170,210 A 90,90 0 0 1 170,30 Z"
          fill="rgba(0,0,0,0.8)"
          stroke="rgba(255,255,255,0.3)"
          strokeWidth="2"
        />

        {/* Linha interna da pista */}
        <path
          d="M 170,75 L 730,75 A 45,45 0 0 1 730,165 L 170,165 A 45,45 0 0 1 170,75 Z"
          fill="none"
          stroke="rgba(255,255,255,0.3)"
          strokeWidth="2"
        />

        {/* Divisórias de Zonas baseadas na imagem */}
        {/* TIER / ORPHELINS (Esquerda) */}
        <line x1="280" y1="75" x2="360" y2="165" stroke="rgba(255,255,255,0.5)" strokeWidth="2" />
        
        {/* ORPHELINS / VOISINS (Centro) */}
        <line x1="480" y1="75" x2="480" y2="165" stroke="rgba(255,255,255,0.5)" strokeWidth="2" />
        
        {/* VOISINS / ZERO (Direita) */}
        <path d="M 680,75 Q 740,120 680,165" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="2" />

        {/* Textos das Zonas */}
        <text x="230" y="125" textAnchor="middle" fontSize="16" fontWeight="bold" fill="rgba(255,255,255,0.7)">TIER</text>
        <text x="410" y="125" textAnchor="middle" fontSize="16" fontWeight="bold" fill="rgba(255,255,255,0.7)">ORPHELINS</text>
        <text x="580" y="125" textAnchor="middle" fontSize="16" fontWeight="bold" fill="rgba(255,255,255,0.7)">VOISINS</text>
        <text x="750" y="125" textAnchor="middle" fontSize="16" fontWeight="bold" fill="rgba(255,255,255,0.7)">ZERO</text>

        {/* Números da Pista */}
        {pts.map((p) => {
          const n = p.n;
          const base = colorOf(n);
          const scls = selClass(sel, n);
          const override = selectionFill(sel, n);
          const fill = override ?? `var(--${base})`;
          const textFill = needsDarkText(scls) ? "#111" : "#fff";

          return (
            <g 
              key={n} 
              onClick={() => onPick(n)} 
              style={{ cursor: "pointer" }}
              className="raceNode"
            >
              {/* Célula de fundo circular */}
              <circle
                cx={p.x}
                cy={p.y}
                r="18"
                fill={fill}
                stroke="rgba(255,255,255,0.2)"
                strokeWidth="1"
                className="raceCell"
              />
              
              {/* Número */}
              <text 
                x={p.x} 
                y={p.y + 5} 
                textAnchor="middle" 
                fontSize="14" 
                fontWeight="bold" 
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
