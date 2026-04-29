"use client";

import { useState } from "react";
import { wheelDistance, WHEEL_EU } from "../lib/roulette";

export type MovementRecord = {
  from: number;
  to: number;
  h: number;
  ah: number;
};

type DistanceMode = "shortest" | "longest";

// Cores para marcação manual no painel de deslocamento
const MARK_COLORS = ["#3b82f6", "#a855f7", "#ec4899", "#eab308"]; // Azul, Roxo, Rosa, Amarelo

function getMovementColor(distance: number): string {
  if (distance <= 5) return "#ffd000"; // Amarelo (curto)
  if (distance <= 12) return "#ff6b6b"; // Vermelho (médio)
  return "#26d07c"; // Verde (longo)
}

export default function MovementPanel({
  history,
}: {
  history: number[];
}) {
  const [mode, setMode] = useState<DistanceMode>("shortest");
  const [activeMarkColor, setActiveMarkColor] = useState<number>(0);
  // Mapa de "Direção/Distância" para cor de marcação (ex: "A/16" -> "#3b82f6")
  const [marks, setMarks] = useState<Record<string, string>>({});

  // Calcular os movimentos dos últimos 100 números
  const movements: MovementRecord[] = [];
  for (let i = 0; i < Math.min(history.length - 1, 100); i++) {
    const from = history[i + 1];
    const to = history[i];
    const { h, ah } = wheelDistance(from, to);
    movements.push({ from, to, h, ah });
  }

  // Pegar o último movimento para destaque
  const lastMovement = movements.length > 0 ? movements[0] : null;
  let lastDistance = 0;
  let lastDirection = "";
  let lastIsH = false;

  let leftNum = -1;
  let rightNum = -1;

  if (lastMovement) {
    lastIsH = lastMovement.h <= lastMovement.ah;
    lastDistance = lastIsH ? lastMovement.h : lastMovement.ah;
    lastDirection = lastIsH ? "H" : "A";

    // Lógica ESQUERDA/DIREITA: X casas de intervalo significa o (X+1)º número
    const currentIdx = WHEEL_EU.indexOf(lastMovement.to);
    if (currentIdx >= 0) {
      const L = WHEEL_EU.length;
      const step = lastDistance + 1;
      
      // ESQUERDA (Anti-Horário): X - (dist + 1)
      leftNum = WHEEL_EU[(currentIdx - step + L * 10) % L];
      // DIREITA (Horário): X + (dist + 1)
      rightNum = WHEEL_EU[(currentIdx + step) % L];
    }
  }

  const handleCellClick = (direction: string, distance: number) => {
    const key = `${direction}/${distance}`;
    const color = MARK_COLORS[activeMarkColor];
    
    setMarks(prev => {
      const next = { ...prev };
      if (next[key] === color) {
        delete next[key]; // Desmarcar se clicar com a mesma cor
      } else {
        next[key] = color; // Marcar ou mudar cor
      }
      return next;
    });
  };

  const resetMarks = () => {
    setMarks({});
  };

  return (
    <div className="movementPanel">
      <div className="movementHeader">
        <div className="movementTitle">Deslocamento (H/A) - Últimos 100</div>
        <div className="movementControls">
          <div className="markColorPicker">
            {MARK_COLORS.map((c, idx) => (
              <div
                key={idx}
                className={`markColorCircle ${activeMarkColor === idx ? "active" : ""}`}
                style={{ backgroundColor: c }}
                onClick={() => setActiveMarkColor(idx)}
              />
            ))}
          </div>
          <button className="btn-reset-marks" onClick={resetMarks} title="Resetar marcações de deslocamento">
            RESET
          </button>
          <div className="movementModeSelector">
            <button
              className={`modeBtn ${mode === "shortest" ? "active" : ""}`}
              onClick={() => setMode("shortest")}
            >
              Curto
            </button>
            <button
              className={`modeBtn ${mode === "longest" ? "active" : ""}`}
              onClick={() => setMode("longest")}
            >
              Longo
            </button>
          </div>
        </div>
      </div>

      {/* Seção de Destaque do Último Movimento */}
      {lastMovement && (
        <div className="movementHighlight">
          <div className="highlightBox">
            <div className="highlightLabel">H ATUAL</div>
            <div className="highlightValue" style={{ color: lastIsH ? "#ffd000" : "#aaa" }}>
              {lastMovement.h}
            </div>
          </div>
          <div className="highlightBox">
            <div className="highlightLabel">ÚLTIMO</div>
            <div className="highlightValue">{lastMovement.to}</div>
          </div>
          <div className="highlightBox">
            <div className="highlightLabel">AH</div>
            <div className="highlightValue" style={{ color: !lastIsH ? "#ffd000" : "#aaa" }}>
              {lastMovement.ah}
            </div>
          </div>
          <div className="highlightBox">
            <div className="highlightLabel">RESULTADO</div>
            <div className="highlightValue" style={{ color: getMovementColor(lastDistance) }}>
              {lastDirection}/{lastDistance}
            </div>
          </div>
          <div className="highlightBox">
            <div className="highlightLabel">ESQUERDA</div>
            <div className="highlightValue" style={{ color: "#26d07c" }}>{leftNum !== -1 ? leftNum : "--"}</div>
          </div>
          <div className="highlightBox">
            <div className="highlightLabel">DIREITA</div>
            <div className="highlightValue" style={{ color: "#26d07c" }}>{rightNum !== -1 ? rightNum : "--"}</div>
          </div>
        </div>
      )}

      {/* Grade 10x10 dos últimos 100 movimentos */}
      <div className="movementGrid">
        {movements.length === 0 ? (
          <div className="movementEmpty">Insira números para ver o deslocamento</div>
        ) : (
          movements.map((mov, idx) => {
            let distance: number;
            let direction: string;
            let isH: boolean;

            if (mode === "shortest") {
              isH = mov.h <= mov.ah;
              distance = isH ? mov.h : mov.ah;
              direction = isH ? "H" : "A";
            } else {
              isH = mov.h >= mov.ah;
              distance = isH ? mov.h : mov.ah;
              direction = isH ? "H" : "A";
            }

            const baseColor = getMovementColor(distance);
            const markColor = marks[`${direction}/${distance}`];
            const isLatest = idx === 0;

            return (
              <div
                key={idx}
                className={`movementGridCell ${isLatest ? "latest" : ""}`}
                style={{ 
                  borderLeftColor: baseColor,
                  backgroundColor: markColor ? `${markColor}33` : "transparent",
                  borderColor: markColor || "rgba(255,255,255,0.05)"
                }}
                onClick={() => handleCellClick(direction, distance)}
              >
                <div className="gridCellNum">{mov.to}</div>
                <div className="gridCellDist" style={{ color: markColor || baseColor }}>
                  {direction}/{distance}
                </div>
              </div>
            );
          })
        )}
      </div>

      <style jsx>{`
        .movementControls {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .markColorPicker {
          display: flex;
          gap: 5px;
          background: rgba(0,0,0,0.2);
          padding: 4px 8px;
          border-radius: 20px;
          border: 1px solid rgba(255,255,255,0.1);
        }
        .markColorCircle {
          width: 16px;
          height: 16px;
          border-radius: 50%;
          cursor: pointer;
          border: 2px solid transparent;
          transition: all 0.2s;
        }
        .markColorCircle.active {
          border-color: #fff;
          transform: scale(1.2);
        }
        .btn-reset-marks {
          background: #ef4444;
          color: #fff;
          border: none;
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 10px;
          font-weight: bold;
          cursor: pointer;
          text-transform: uppercase;
        }
        .btn-reset-marks:hover {
          background: #dc2626;
        }
        .movementGridCell {
          cursor: pointer;
          transition: all 0.2s;
          border: 1px solid rgba(255,255,255,0.05);
        }
        .movementGridCell:hover {
          background: rgba(255,255,255,0.05);
        }
      `}</style>
    </div>
  );
}
