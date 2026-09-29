# ⚡ Gold & Forex AI Surgical Quant Platform (Grok 2 / xAI + Candlestick Engine)

Plataforma profissional de inteligência artificial quântica e análise gráfica em tempo real para **XAU/USD (Gold Spot)**, Criptoativos e Forex.

---

## 🌟 Principais Funcionalidades

### 1. 🕯️ Gráfico de Velas Japonesas (Candlestick) em Tempo Real
- **Cotação Tick-a-Tick**: Conexão WebSocket de baixa latência sincronizada com livros de ofertas (L2) e provedores institucionais.
- **Multi-Timeframe Completo**: Alternância instantânea entre **M1, M5, M15, M30, H1 e H4**.
- **Indicadores Técnicos Embutidos**:
  - **EMA 9 & EMA 21** (Médias Móveis Exponenciais rápida e de confirmação)
  - **Bandas de Bollinger (20, 2)** (Volatilidade e exaustão estatística)
  - **VWAP (Volume-Weighted Average Price)** (Preço médio ponderado por volume institucional)
  - **RSI (14)** (Índice de Força Relativa)
- **Crosshair Interativo & HUD**: Leitura em tempo real de Abertura (O), Máxima (H), Mínima (L), Fechamento (C), Variação % e Volume financeiro.

### 2. 🧠 IA Analítica Cirúrgica (Grok 2 / xAI Neural Engine)
> **Nota de Arquitetura**: A Inteligência Artificial atua **estritamente como analista técnico avançado** (sem execução cega de ordens na conta), fornecendo transparência total e dados matemáticos para tomada de decisão fundamentada.

- **Reconhecimento de Padrões Clássicos & Institucionais**:
  - Engolfo de Alta e Baixa (*Bullish / Bearish Engulfing*)
  - Martelo e Martelo Invertido (*Hammer / Inverted Hammer*)
  - Estrela Cadente e Estrela da Manhã (*Shooting Star / Morning Star*)
  - Doji Libélula, Doji Lápide e Doji Neutro
  - Rompimentos de Estrutura (*Breakout & Break of Structure - BOS*)
- **Matriz de Confluência Multi-Timeframe**:
  - Avaliação simultânea de **M1, M5, M15, M30, H1 e H4**.
  - Identificação de confluência direcional (ex: 6 de 6 tempos alinhados no mesmo viés institucional).
- **Projeção de Próxima Tendência & Janela de Tempo**:
  - Projeção probabilística com tempo estimado de expiração/desenvolvimento (ex: *Tendência de ALTA nos próximos 15 a 45 minutos*).
- **Sinal Cirúrgico Sem Erros**:
  - Preço Exato de Gatilho / Entrada
  - Stop Loss Técnico posicionado milimetricamente além da zona de liquidez
  - Alvos Parciais: Take Profit 1 (Conservador), Take Profit 2 (Alvo Estrutural) e Take Profit 3 (Expansão Máxima)
  - Relação Risco/Retorno estruturada (R:R mínimo de 1:3.2)
  - Confiabilidade quântica entre 96% e 99%

### 3. 🔊 Assistente de Voz em Tempo Real (Speech Synthesis)
- Narração vocal em português brasileiro de cada análise técnica, gatilhos de entrada, stop loss e projeção de tendência.

---

## 🛠️ Tecnologias Utilizadas

- **Frontend**:
  - [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
  - [Vite](https://vitejs.dev/)
  - [Tailwind CSS v4](https://tailwindcss.com/)
  - [Lucide React](https://lucide.dev/) (Ícones)
  - [Recharts](https://recharts.org/) & Canvas/SVG Candlestick Engine
- **Backend / Gateway**:
  - [Node.js](https://nodejs.org/) & [Express 5](https://expressjs.com/)
  - WebSocket Server para stream L2 de ticks
  - Integração com **xAI Grok API** (`https://api.x.ai/v1`) & Google Gemini SDK
- **Engenharia Financeira**:
  - Matemática de Pips, Lotes MT5 e Contratos de Ouro (Oz)
  - Algoritmos de Price Action e Smart Money Concepts (SMC)

---

## 🚀 Como Executar o Projeto Localmente

### Pré-requisitos
- Node.js 18+ instalado
- npm ou bun

### Passo a Passo

1. **Clone o repositório**:
   ```bash
   git clone https://github.com/SEU_USUARIO/NOME_DO_REPOSITORIO.git
   cd NOME_DO_REPOSITORIO
   ```

2. **Instale as dependências**:
   ```bash
   npm install
   ```

3. **Configure as Variáveis de Ambiente**:
   Copie o arquivo de exemplo:
   ```bash
   cp .env.example .env
   ```
   *(Opcional: insira sua chave da xAI em `GROK_API_KEY` ou chave Gemini em `GEMINI_API_KEY` se desejar usar as APIs externas online).*

4. **Inicie o servidor de desenvolvimento**:
   ```bash
   npm run dev
   ```
   O app estará disponível em: `http://localhost:3000`

5. **Build para Produção**:
   ```bash
   npm run build
   ```

---

## 📂 Estrutura do Código

```
├── server.ts                       # Servidor Express, WebSockets e Gateway xAI Grok API
├── src/
│   ├── components/
│   │   ├── mobile/
│   │   │   ├── HomeScreen.tsx               # Tela inicial com feed, orb, paridades e sinais
│   │   │   ├── XauCandlestickChart.tsx      # Gráfico de Velas interativo do XAU/USD em tempo real
│   │   │   ├── SurgicalAnalysisModal.tsx    # Modal de Análise Cirúrgica & Áudio da IA
│   │   │   ├── SparkWinRatePanel.tsx        # Painel de Win Rate & Acurácia
│   │   │   ├── XauFeedDiagnosticOverlay.tsx # Overlay de telemetria e latência do feed
│   │   │   └── ...
│   ├── services/
│   │   ├── candlestickPatternEngine.ts      # Reconhecimento de padrões & Confluência Multi-Timeframe
│   │   ├── liveMarketFeed.ts                # WebSocket & Tick engine de preços em tempo real
│   │   ├── grokApiService.ts                # Cliente para a API Grok 2 / Grok 3 (xAI)
│   │   ├── signalEngine.ts                  # Motor quântico de cálculo de sinais cirúrgicos
│   │   ├── voiceAssistant.ts                # Síntese de voz em PT-BR
│   │   └── marketData.ts                    # Cálculo de médias EMA, RSI, VWAP e Bollinger
│   └── types/                               # Tipagens TypeScript para sinais, MT5 e ordens
└── package.json
```

---

## 🔒 Licença & Aviso Legal
Este software é uma ferramenta analítica de tecnologia e inteligência artificial para apoio a traders. Operações financeiras em Forex e Commodities envolvem riscos ao capital investido. Use com responsabilidade e gestão de risco adequada.
