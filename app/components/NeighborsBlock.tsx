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
  onlyIntersections?: boolean;
  onToggleIntersections?: () => void;
};

export default function NeighborsBlock({ 
  history, 
  sel, 
  onPick, 
  onMarkStrategy, 
  isMinimized, 
  onToggle, 
  onlyIntersections, 
  onToggleIntersections 
}: Props) {
  const handleMarkStrategy = (nums: number[], strategyIdx: number) => {
    const colorIndex = strategyIdx === 3 ? 6 : strategyIdx % 10;
    if (onMarkStrategy) {
      onMarkStrategy(nums, colorIndex);
    } else {
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
        <>
          <div style={{ padding: "0 10px 10px" }}>
            <button 
              onClick={onToggleIntersections}
              style={{
                width: "100%",
                padding: "8px",
                background: onlyIntersections ? "#3b82f6" : "#262626",
                color: "#fff",
                border: "1px solid #3b82f6",
                borderRadius: "4px",
                cursor: "pointer",
                fontWeight: "bold",
                fontSize: "11px",
                transition: "all 0.3s",
                boxShadow: onlyIntersections ? "0 0 10px rgba(59, 130, 246, 0.5)" : "none"
              }}
            >
              {onlyIntersections ? "MOSTRANDO APENAS INTERSECÇÕES" : "MOSTRAR APENAS INTERSECÇÕES"}
            </button>
          </div>
          
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
        </>
      )}
    </div>
  );
}
