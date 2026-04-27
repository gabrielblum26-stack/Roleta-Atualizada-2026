/**
 * Definições das estratégias baseadas no padrão Zyron Spin e Roleta Brasileira
 */

export type Strategy = {
  name: string;
  nums: number[];
  color?: string;
};

export const STRATEGIES: Strategy[] = [
  { name: "CANTOS", nums: [1, 4, 7, 10, 13, 16, 19, 22, 25, 28, 31, 34, 3, 6, 9, 12, 15, 18, 21, 24, 27, 30, 33, 36], color: "#3b82f6" },
  { name: "MEIOS", nums: [2, 5, 8, 11, 14, 17, 20, 23, 26, 29, 32, 35], color: "#3b82f6" },
  { name: "ESPELHOS", nums: [12, 21, 13, 31, 23, 32], color: "#3b82f6" },
  { name: "ANTIESPELHOS", nums: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 14, 15, 16, 17, 18, 19, 20, 22, 24, 25, 26, 27, 28, 29, 30, 33, 34, 35, 36], color: "#3b82f6" },
  { name: "GÊMEOS", nums: [11, 22, 33], color: "#9333ea" },
  { name: "ANTIGÊMEOS", nums: Array.from({ length: 37 }, (_, i) => i).filter(n => ![11, 22, 33].includes(n)), color: "#9333ea" },
  { name: "JUNTOS", nums: [1, 2, 4, 5, 7, 8, 10, 11, 13, 14, 16, 17, 19, 20, 22, 23, 25, 26, 28, 29, 31, 32, 34, 35], color: "#ec4899" },
  { name: "ANTIJUNTOS", nums: [3, 6, 9, 12, 15, 18, 21, 24, 27, 30, 33, 36], color: "#ec4899" },
  { name: "LATERAIS", nums: [1, 2, 3, 34, 35, 36], color: "#ec4899" },
  { name: "PONTAS", nums: [1, 3, 34, 36], color: "#ec4899" },
  { name: "ALTOS", nums: Array.from({ length: 18 }, (_, i) => i + 19), color: "#f59e0b" },
  { name: "BAIXOS", nums: Array.from({ length: 18 }, (_, i) => i + 1), color: "#3b82f6" },
  { name: "PARES", nums: Array.from({ length: 37 }, (_, i) => i).filter(n => n !== 0 && n % 2 === 0), color: "#3b82f6" },
  { name: "IMPARES", nums: Array.from({ length: 37 }, (_, i) => i).filter(n => n % 2 !== 0), color: "#3b82f6" },
  { name: "K7", nums: [0, 7, 17, 27, 10, 20, 30], color: "#22c55e" },
  { name: "ANTI-K7", nums: Array.from({ length: 37 }, (_, i) => i).filter(n => ![0, 7, 17, 27, 10, 20, 30].includes(n)), color: "#22c55e" },
  { name: "PRETOS", nums: [2, 4, 6, 8, 10, 11, 13, 15, 17, 20, 22, 24, 26, 28, 29, 31, 33, 35], color: "#3b82f6" },
  { name: "VERMELHOS", nums: [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36], color: "#3b82f6" },
];
