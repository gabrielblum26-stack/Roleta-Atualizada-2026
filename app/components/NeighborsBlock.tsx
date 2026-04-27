"use client";

import { STRATEGIES } from "../lib/strategies";
import { selClass, type SelState } from "../lib/selection";

type Props = {
  history: number[];
  sel: SelState;
  onPick: (n: number) => void;
  isMinimized?: boolean;
  onToggle?: () => void;
};

export default function NeighborsBlock({ history, sel, onPick, isMinimized, onToggle }: Props) {
  return (
    <div className={`panel neighborsPanel ${isMinimized ? "minimized" : ""}`} aria-label="Estratégias personalizadas">
      <div className="panelHeader">
        <div className="neighborsTitle">ESTRATÉGIAS</div>
        {onToggle && <button className="btn-min" onClick={onToggle}>{isMinimized ? "+" : "−"}</button>}
      </div>

      {!isMinimized && (
        <div className="strategiesGrid">
          {STRATEGIES.map((strategy) => (
            <button
              key={strategy.name}
              className="strategyBtn"
              style={{
                backgroundColor: strategy.color,
                color: strategy.color === "#ffd000" ? "#000" : "#fff",
              }}
              onClick={() => {
                strategy.nums.forEach((n) => onPick(n));
              }}
              title={`Números: ${strategy.nums.join(", ")}`}
            >
              {strategy.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
