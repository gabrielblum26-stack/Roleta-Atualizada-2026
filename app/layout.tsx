import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Roleta — Análise ao Vivo",
  description: "Webapp de análise visual para roleta europeia (sem apostas).",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
