"use client";

import { useState } from "react";
import { wheelDistance } from "../lib/roulette";

export type MovementRecord = {
  from: number;
  to: number;
  h: number;
  ah: number;
};

type DistanceMode = "shortest" | "longest";

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

  // Calcular os movimentos dos últimos 10 números
  const movements: MovementRecord[] = [];
  for (let i = 0; i < Math.min(history.length - 1, 10); i++) {
    const from = history[i + 1];
    const to = history[i];
    const { h, ah } = wheelDistance(from, to);
    movements.push({ from, to, h, ah });
  }

  return (
    <div className="movementPanel">
      <div className="movementHeader">
        <div className="movementTitle">Deslocamento (H/A)</div>
        <div className="movementModeSelector">
          <button
            className={`modeBtn ${mode === "shortest" ? "active" : ""}`}
            onClick={() => setMode("shortest")}
          >
            Mais Curto
          </button>
          <button
            className={`modeBtn ${mode === "longest" ? "active" : ""}`}
            onClick={() => setMode("longest")}
          >
            Mais Longo
          </button>
        </div>
      </div>
      <div className="movementStrip">
        {movements.length === 0 ? (
          <div className="movementEmpty">Insira números para ver o deslocamento</div>
        ) : (
          movements.map((mov, idx) => {
            // Determinar qual sentido usar baseado no modo
            let distance: number;
            let direction: string;
            let isH: boolean;

            if (mode === "shortest") {
              isH = mov.h <= mov.ah;
              distance = isH ? mov.h : mov.ah;
              direction = isH ? "H" : "A";
            } else {
              // longest
              isH = mov.h >= mov.ah;
              distance = isH ? mov.h : mov.ah;
              direction = isH ? "H" : "A";
            }

            const color = getMovementColor(distance);

            return (
              <div key={idx} className="movementCard" style={{ borderLeftColor: color }}>
                <div className="movementNum">{mov.to}</div>
                <div className="movementDist" style={{ color }}>
                  {direction}/{distance}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
