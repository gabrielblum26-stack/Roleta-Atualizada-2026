# Roleta — Webapp de Análise (Europeia)

Atualizado com:
- **Race** com visual de *racetrack* (pista real, não apenas oval).
- Seleção em camadas (Azul/Amarelo/Verde) **substitui a cor do chip inteiro** (bem chamativo).
- Botão **RESET DE CORES** limpa seleções sem apagar histórico.
- Sem scroll em absolutamente nada.

## Rodar
```bash
npm install
npm run dev
```

- Bloco central **Vizinhos** (V-1 | Atual | V+1) do último número inserido.
- Histórico longo ajustado para **100** para caber no layout 3 colunas.

- Bloco central **Vizinhos (10)**: V-1 | Atual | V+1 para os **10 últimos** números inseridos.
- Seleção com **9 cores** em ciclo (3 originais + 6 novas).

- Seleção agora tem **20 cores** em ciclo. Ao usar a 20ª cor, aparece aviso: **“FOI USADO 20 CORES, DESEJA RESETAR AS CORES?”**
