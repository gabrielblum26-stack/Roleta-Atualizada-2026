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
  const prevMovement = movements.length > 1 ? movements[1] : null;

  let lastDistance = 0;
  let lastDirection = "";
  let lastIsH = false;

  // Novos campos: Soma e Projeções baseadas na soma
  let sumDist = 0;
  let sumLeftNum = -1;
  let sumRightNum = -1;

  if (lastMovement) {
    lastIsH = lastMovement.h <= lastMovement.ah;
    lastDistance = lastIsH ? lastMovement.h : lastMovement.ah;
    lastDirection = lastIsH ? "H" : "A";

    const currentIdx = WHEEL_EU.indexOf(lastMovement.to);
    if (currentIdx >= 0) {
      const L = WHEEL_EU.length;

      // Lógica da SOMA dos últimos 2 deslocamentos
      if (prevMovement) {
        // Pega a distância do movimento anterior baseada no modo atual (curto/longo)
        const prevIsH = mode === "shortest" ? prevMovement.h <= prevMovement.ah : prevMovement.h >= prevMovement.ah;
        const prevDistance = prevIsH ? prevMovement.h : prevMovement.ah;
        
        // Soma dos últimos 2 (independente de direção)
        sumDist = lastDistance + prevDistance;
        
        // Projeção baseada na SOMA saindo do número ATUAL
        // ESQUERDA (Anti-Horário): atual - soma
        sumLeftNum = WHEEL_EU[(currentIdx - sumDist + L * 10) % L];
        // DIREITA (Horário): atual + soma
        sumRightNum = WHEEL_EU[(currentIdx + sumDist) % L];
      }
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
        <div className="movementTitle">DESLOCAMENTO (H/A) - ÚLTIMOS 100</div>
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
          <button className="btn-reset-marks" onClick={resetMarks}>
            RESET
          </button>
          <div className="movementModeSelector">
            <button
              className={`modeBtn ${mode === "shortest" ? "active" : ""}`}
              onClick={() => setMode("shortest")}
            >
              CURTO
            </button>
            <button
              className={`modeBtn ${mode === "longest" ? "active" : ""}`}
              onClick={() => setMode("longest")}
            >
              LONGO
            </button>
          </div>
        </div>
      </div>

      {/* Seção de Destaque do Último Movimento */}
      {lastMovement && (
        <div className="movementHighlight">
          <div className="highlightRow">
            <div className="highlightBox">
              <div className="highlightLabel">HORÁRIO</div>
              <div className="highlightValue" style={{ color: lastIsH ? "#ffd000" : "#aaa" }}>
                {lastMovement.h}
              </div>
            </div>
            <div className="highlightBox">
              <div className="highlightLabel">ATUAL</div>
              <div className="highlightValue" style={{ color: "#fff" }}>{lastMovement.to}</div>
            </div>
            <div className="highlightBox">
              <div className="highlightLabel">ANTI-HORÁRIO</div>
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
          </div>

          <div className="highlightRow secondary">
            <div className="highlightBox">
              <div className="highlightLabel">SOMA ÚLT. 2</div>
              <div className="highlightValue" style={{ color: "#ffd000" }}>{sumDist || "--"}</div>
            </div>
            <div className="highlightBox highlightEsquerda">
              <div className="highlightLabel">ESQUERDA</div>
              <div className="highlightValue" style={{ color: "#26d07c" }}>{sumLeftNum !== -1 ? sumLeftNum : "--"}</div>
            </div>
            <div className="highlightBox highlightDireita">
              <div className="highlightLabel">DIREITA</div>
              <div className="highlightValue" style={{ color: "#26d07c" }}>{sumRightNum !== -1 ? sumRightNum : "--"}</div>
            </div>
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
        .movementHighlight {
          display: flex;
          flex-direction: column;
          gap: 8px;
          margin-bottom: 15px;
          background: rgba(255,255,255,0.02);
          padding: 10px;
          border-radius: 8px;
          border: 1px solid rgba(255,255,255,0.05);
        }
        .highlightRow {
          display: flex;
          gap: 8px;
          justify-content: space-between;
        }
        .highlightRow.secondary {
          border-top: 1px solid rgba(255,255,255,0.08);
          padding-top: 8px;
        }
        .highlightBox {
          flex: 1;
          background: rgba(0,0,0,0.4);
          padding: 6px;
          border-radius: 6px;
          text-align: center;
          border: 1px solid rgba(255,255,255,0.03);
        }
        .highlightEsquerda, .highlightDireita {
           background: rgba(38, 208, 124, 0.05);
           border-color: rgba(38, 208, 124, 0.2);
        }
        .highlightLabel {
          font-size: 8px;
          color: #aaa;
          font-weight: 800;
          margin-bottom: 2px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .highlightValue {
          font-size: 16px;
          font-weight: 900;
        }
        .movementControls {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .markColorPicker {
          display: flex;
          gap: 4px;
          background: rgba(0,0,0,0.3);
          padding: 4px 8px;
          border-radius: 20px;
        }
        .markColorCircle {
          width: 14px;
          height: 14px;
          border-radius: 50%;
          cursor: pointer;
          border: 1.5px solid transparent;
        }
        .markColorCircle.active {
          border-color: #fff;
        }
        .btn-reset-marks {
          background: #ef4444;
          color: #fff;
          border: none;
          padding: 4px 10px;
          border-radius: 4px;
          font-size: 10px;
          font-weight: 900;
          cursor: pointer;
        }
        .movementGridCell {
          cursor: pointer;
          border: 1px solid rgba(255,255,255,0.05);
        }
      `}</style>
    </div>
  );
}
