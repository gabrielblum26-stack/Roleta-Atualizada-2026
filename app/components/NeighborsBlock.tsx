"use client";

import { STRATEGIES } from "../lib/strategies";
import { type SelState, SEL_ORDER } from "../lib/selection";

type Props = {
  history: number[];
  sel: SelState;
  onPick: (n: number) => void;
  onMarkStrategy?: (nums: number[], colorIndex: number) => void;
  isMinimized?: boolean;
  onToggle?: () => void;
};

export default function NeighborsBlock({ history, sel, onPick, onMarkStrategy, isMinimized, onToggle }: Props) {
  const handleMarkStrategy = (nums: number[], strategyIdx: number) => {
    // Se for o Padrão de Saída Órfã (índice 3), usamos a cor 6 (ciano) para evitar o vermelho (índice 3)
    const colorIndex = strategyIdx === 3 ? 6 : strategyIdx % 10;
    if (onMarkStrategy) {
      onMarkStrategy(nums, colorIndex);
    } else {
      // Fallback caso a função não seja passada
      nums.forEach((n) => onPick(n));
    }
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
            const colorIdx = idx === 3 ? 6 : idx % 10;
            const colorKey = SEL_ORDER[colorIdx];
            const isActive = strategy.nums.length > 0 && sel.sets[colorKey]?.has(strategy.nums[0]);
            const colorVar = `var(--selC${colorIdx + 1})`;
            
            return (
              <div key={idx} className="strategyRow" style={{ borderLeft: `4px solid ${colorVar}` }}>
                <div className="strategyName" style={{ color: strategy.color }}>
                  {strategy.name}
                </div>
                
                <button 
                  className={`strategyActionBtn ${isActive ? "active" : ""}`}
                  onClick={() => handleMarkStrategy(strategy.nums, idx)}
                  title="Marcar na roleta"
                  style={{ 
                    color: isActive ? "#fff" : colorVar,
                    backgroundColor: isActive ? colorVar : "transparent",
                    borderColor: colorVar
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
            );
          })}
        </div>
      )}
    </div>
  );
}
