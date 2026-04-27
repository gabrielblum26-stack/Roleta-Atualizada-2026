"use client";

import { STRATEGIES } from "../lib/strategies";
import { selClass, type SelState } from "../lib/selection";

type Props = {
  history: number[];
  sel: SelState;
  onPick: (n: number) => void;
  onMarkStrategy?: (nums: number[]) => void;
  isMinimized?: boolean;
  onToggle?: () => void;
};

export default function NeighborsBlock({ history, sel, onPick, onMarkStrategy, isMinimized, onToggle }: Props) {
  const handleMarkStrategy = (nums: number[], strategyIdx: number) => {
    // Definir a cor ativa baseada no índice da estratégia (cor 1 para est 1, cor 2 para est 2, etc.)
    // O usuário pediu "cada estratégia tem que ter sua cor"
    const colorIndex = strategyIdx % 10;
    
    // Primeiro mudamos a cor ativa para a cor desta estratégia
    const bc = new BroadcastChannel("roulette_keyboard");
    bc.postMessage({ type: "SET_ACTIVE_COLOR", value: colorIndex });
    
    if (onMarkStrategy) {
      onMarkStrategy(nums);
    } else {
      nums.forEach((n) => onPick(n));
    }
    bc.close();
  };

  return (
    <div className={`panel neighborsPanel ${isMinimized ? "minimized" : ""}`} aria-label="Estratégias personalizadas">
      <div className="panelHeader">
        <div className="neighborsTitle">ESTRATÉGIAS</div>
        {onToggle && <button className="btn-min" onClick={onToggle}>{isMinimized ? "+" : "−"}</button>}
      </div>

      {!isMinimized && (
        <div className="strategiesList">
          {STRATEGIES.map((strategy, idx) => {
            const isActive = strategy.nums.length > 0 && sel.sets[`c${(idx % 10) + 1}` as any]?.has(strategy.nums[0]);
            return (
              <div key={idx} className="strategyRow" style={{ borderLeft: `4px solid var(--selC${(idx % 10) + 1})` }}>
                <div className="strategyName" style={{ color: strategy.color }}>
                  {strategy.name}
                </div>
                
                <button 
                  className={`strategyActionBtn ${isActive ? "active" : ""}`}
                  onClick={() => handleMarkStrategy(strategy.nums, idx)}
                  title="Marcar na roleta"
                  style={{ 
                    color: isActive ? "#fff" : "var(--selC" + ((idx % 10) + 1) + ")",
                    backgroundColor: isActive ? "var(--selC" + ((idx % 10) + 1) + ")" : "transparent",
                    borderColor: "var(--selC" + ((idx % 10) + 1) + ")"
                  }}
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
