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
  const onMarkStrategy = (nums: number[]) => {
    nums.forEach((n) => onPick(n));
  };

  return (
    <div className={`panel neighborsPanel ${isMinimized ? "minimized" : ""}`} aria-label="Estratégias personalizadas">
      <div className="panelHeader">
        <div className="neighborsTitle">ESTRATÉGIAS</div>
        {onToggle && <button className="btn-min" onClick={onToggle}>{isMinimized ? "+" : "−"}</button>}
      </div>

      {!isMinimized && (
        <div className="strategiesList">
          {STRATEGIES.map((strategy, idx) => (
            <div key={idx} className="strategyRow">
              <div className="strategyName" style={{ color: strategy.color }}>
                {strategy.name}
              </div>
              
              <button 
                className="strategyActionBtn"
                onClick={() => onMarkStrategy(strategy.nums)}
                title="Marcar na roleta"
              >
                ⚡
              </button>

              <div className="strategyHistory">
                {Array.from({ length: 15 }).map((_, hIdx) => {
                  const num = history[hIdx];
                  const hit = num !== undefined && strategy.nums.includes(num);
                  return (
                    <div 
                      key={hIdx} 
                      className={`historyBox ${hit ? "hit" : "miss"}`}
                    />
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
