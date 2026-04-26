"use client";

import { useEffect } from "react";
import RaceTrack from "../components/RaceTrack";
import TableMap from "../components/TableMap";
import { initSel } from "../lib/selection";

export default function KeyboardPage() {
  const sel = initSel(); // Seleção neutra apenas para visualização no teclado

  useEffect(() => {
    // Forçar tema escuro na janela do teclado
    document.documentElement.classList.add("theme-dark");
    document.body.classList.add("theme-dark");
    document.body.style.overflow = "hidden";
    document.body.style.background = "#121212";
  }, []);

  const onPick = (n: number) => {
    // Enviar o número para a janela principal via BroadcastChannel
    const bc = new BroadcastChannel("roulette_keyboard");
    bc.postMessage({ type: "ADD_NUMBER", value: n });
    bc.close();
    
    // Feedback visual simples (opcional: som ou vibração)
    console.log("Número enviado:", n);
  };

  return (
    <div className="keyboard-container" style={{ padding: "10px", height: "100vh", display: "flex", flexDirection: "column", gap: "10px" }}>
      <div style={{ flex: 1, minHeight: 0 }}>
        <RaceTrack sel={sel} onPick={onPick} />
      </div>
      <div style={{ flex: 1, minHeight: 0 }}>
        <TableMap sel={sel} rep={new Set()} onPick={onPick} />
      </div>
      <style jsx global>{`
        .keyboard-container .raceBox {
          min-height: 150px !important;
        }
        .keyboard-container .mapBox {
          padding: 5px !important;
        }
        .keyboard-container .cell {
          font-size: 14px !important;
          height: 30px !important;
        }
      `}</style>
    </div>
  );
}
