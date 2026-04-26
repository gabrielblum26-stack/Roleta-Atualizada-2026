"use client";

import { colorOf, wheelDistance } from "../lib/roulette";
import { selClass, type SelState } from "../lib/selection";

type Props = {
  history: number[]; // mais recente primeiro
  sel: SelState;
  onPick: (n: number) => void;
  max?: number;
};

export default function RaceDistBlock({ history, sel, onPick, max = 10 }: Props) {
  const Mini = ({
    value,
    tone,
    actualColor,
    selClass,
    clickable,
    neutral,
  }: {
    value: number | string | null;
    tone: "neutral" | "colored";
    actualColor?: string;
    selClass?: string;
    clickable?: boolean;
    neutral?: boolean;
  }) => {
    const empty = value === null || value === undefined;
    const cls =
      "nbMini " +
      (tone === "colored" ? `nbColored ${actualColor ?? ""} ${selClass ?? ""}` : "nbNeutral") +
      (neutral ? " nbNeutralForce" : "") +
      (empty ? " nbEmpty" : "") +
      (clickable ? " nbClickable" : "");
    return (
      <div
        className={cls}
        onClick={() => {
          if (clickable && typeof value === "number") onPick(value);
        }}
      >
        {empty ? "—" : value}
      </div>
    );
  };

  const ColTitle = ({ children }: { children: string }) => <div className="nbColTitle">{children}</div>;

  return (
    <div className="panel neighborsPanel raceDistPanel" aria-label="Análise de deslocamento na Race">
      <div className="neighborsTitle">DESLOCAMENTO RACE (10)</div>
      
      <div className="rdGrid">
        <div className="rdHeader">
          <ColTitle>AH</ColTitle>
          <ColTitle>ATUAL</ColTitle>
          <ColTitle>ANTES</ColTitle>
          <ColTitle>H</ColTitle>
        </div>
        
        <div className="nbStack">
          {Array.from({ length: max }).map((_, idx) => {
            const current = history[idx];
            const before = history[idx + 1];
            
            if (typeof current !== "number" || typeof before !== "number") {
              return (
                <div className="rdRow" key={idx}>
                  <Mini value={null} tone="neutral" neutral />
                  <Mini value={null} tone="colored" />
                  <Mini value={null} tone="colored" />
                  <Mini value={null} tone="neutral" neutral />
                </div>
              );
            }

            const dist = wheelDistance(before, current);
            return (
              <div className="rdRow" key={idx}>
                <Mini value={dist.ah} tone="neutral" neutral />
                <Mini 
                  value={current} 
                  tone="colored" 
                  actualColor={colorOf(current)} 
                  clickable 
                  selClass={selClass(sel, current)} 
                />
                <Mini 
                  value={before} 
                  tone="colored" 
                  actualColor={colorOf(before)} 
                  clickable 
                  selClass={selClass(sel, before)} 
                />
                <Mini value={dist.h} tone="neutral" neutral />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
