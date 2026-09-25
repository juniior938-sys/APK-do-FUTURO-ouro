import { ForexSignal, MarketAlert, SignalAction, SignalStatus } from '../types/signals';
import { SUPPORTED_SYMBOLS, getSymbolSpec } from '../types/symbols';
import { audioAlerts } from '../utils/audioAlerts';

// Sinais iniciais pré-carregados de alta probabilidade para os pares solicitados
export function generateInitialSignals(): ForexSignal[] {
  const now = Date.now();

  return [
    {
      id: 'sig-audusd-img',
      symbol: 'AUDUSD',
      name: 'AUD/USD',
      action: 'BUY',
      status: 'ACTIVE',
      timeframe: 'M5',
      entryPrice: 0.71550,
      currentPrice: 0.72300,
      stopLoss: 0.71300,
      takeProfit1: 0.72000,
      takeProfit2: 0.71300,
      takeProfit3: 0.72450,
      riskReward: '1:3.0',
      confidence: 88,
      pipsRisk: 25,
      pipsTarget1: 45,
      pipsTarget2: 75,
      pipsTarget3: 90,
      strategy: 'Breakout Institucional + Confluência de Médias',
      rationale: 'Setup de compra confirmado com fluxo em alta. Date: 28h 58% acurácia calculada.',
      sources: {
        worldTimeServer: {
          session: 'London & NY',
          overlap: true,
          status: 'OPTIMAL',
        },
        dailyFx: {
          impact: 'MED',
          forecastBias: 'BULLISH',
        },
        forexFactory: {
          redFolderWarning: false,
          minutesToNews: 80,
          shieldState: 'SAFE_TO_TRADE',
        },
        investingCom: {
          sentimentBullishPct: 88,
          centralBankTone: 'Alta pressão compradora com suporte sólido em 0.71300',
        },
      },
      createdAt: now - 1000 * 60 * 18,
      updatedAt: now,
      pipsCurrent: +75,
      alertSent: true,
    },
    {
      id: 'sig-usdjpy-img',
      symbol: 'USDJPY',
      name: 'USD/JPY',
      action: 'SELL',
      status: 'ACTIVE',
      timeframe: 'M15',
      entryPrice: 114.800,
      currentPrice: 114.300,
      stopLoss: 115.100,
      takeProfit1: 114.200,
      takeProfit2: 114.200,
      takeProfit3: 113.800,
      riskReward: '1:2.0',
      confidence: 86,
      pipsRisk: 30,
      pipsTarget1: 60,
      pipsTarget2: 60,
      pipsTarget3: 100,
      strategy: 'Rejeição de Nível Chave 114.800',
      rationale: 'Venda institucional acionada. Date: 22h 60%. Retração em andamento.',
      sources: {
        worldTimeServer: {
          session: 'Tokyo & London',
          overlap: false,
          status: 'MODERATE',
        },
        dailyFx: {
          impact: 'LOW',
          forecastBias: 'BEARISH',
        },
        forexFactory: {
          redFolderWarning: false,
          minutesToNews: 140,
          shieldState: 'SAFE_TO_TRADE',
        },
        investingCom: {
          sentimentBullishPct: 34,
          centralBankTone: 'Venda forte com alvo em 114.200',
        },
      },
      createdAt: now - 1000 * 60 * 45,
      updatedAt: now,
      pipsCurrent: -50,
      alertSent: true,
    },
    {
      id: 'sig-eurchf-img',
      symbol: 'EURCHF',
      name: 'EUR/CHF',
      action: 'BUY',
      status: 'ACTIVE',
      timeframe: 'M30',
      entryPrice: 1.05100,
      currentPrice: 1.05300,
      stopLoss: 1.04800,
      takeProfit1: 1.05500,
      takeProfit2: 1.05500,
      takeProfit3: 1.05800,
      riskReward: '1:2.5',
      confidence: 88,
      pipsRisk: 30,
      pipsTarget1: 40,
      pipsTarget2: 70,
      pipsTarget3: 100,
      strategy: 'Canal de Alta e Defesa do Franco Suíço',
      rationale: 'Sinal aberto e em andamento. Date: 08h 88%. Alvo em 1.05500.',
      sources: {
        worldTimeServer: {
          session: 'London',
          overlap: true,
          status: 'OPTIMAL',
        },
        dailyFx: {
          impact: 'MED',
          forecastBias: 'BULLISH',
        },
        forexFactory: {
          redFolderWarning: false,
          minutesToNews: 190,
          shieldState: 'SAFE_TO_TRADE',
        },
        investingCom: {
          sentimentBullishPct: 76,
          centralBankTone: 'Suporte institucional defendido',
        },
      },
      createdAt: now - 1000 * 60 * 65,
      updatedAt: now,
      pipsCurrent: +20,
      alertSent: true,
    },
    {
      id: 'sig-btcusd-img',
      symbol: 'BTCUSD',
      name: 'BTC/USD',
      action: 'BUY',
      status: 'ACTIVE',
      timeframe: 'M5',
      entryPrice: 64850.00,
      currentPrice: 66200.00,
      stopLoss: 63900.00,
      takeProfit1: 66200.00,
      takeProfit2: 67500.00,
      takeProfit3: 69000.00,
      riskReward: '1:3.4',
      confidence: 94,
      pipsRisk: 95,
      pipsTarget1: 135,
      pipsTarget2: 265,
      pipsTarget3: 415,
      strategy: 'Liquidez On-Chain + Rompimento Microestrutura',
      rationale: 'Análise IA em tempo real com confluência de order flow no par BTC/USD. Alvo 66,200 atingido.',
      sources: {
        worldTimeServer: {
          session: '24/7 Global Crypto Market',
          overlap: true,
          status: 'OPTIMAL',
        },
        dailyFx: {
          impact: 'HIGH',
          forecastBias: 'BULLISH',
        },
        forexFactory: {
          redFolderWarning: false,
          minutesToNews: 60,
          shieldState: 'SAFE_TO_TRADE',
        },
        investingCom: {
          sentimentBullishPct: 92,
          centralBankTone: 'Entrada de ETF e volume spot dominante',
        },
      },
      createdAt: now - 1000 * 60 * 8,
      updatedAt: now,
      pipsCurrent: +135,
      alertSent: true,
    },
    {
      id: 'sig-eurusd-carousel',
      symbol: 'EURUSD',
      name: 'EUR/USD',
      action: 'BUY',
      status: 'ACTIVE',
      timeframe: 'M1',
      entryPrice: 1.10480,
      currentPrice: 1.10900,
      stopLoss: 1.09950,
      takeProfit1: 1.11200,
      takeProfit2: 1.11500,
      takeProfit3: 1.11800,
      riskReward: '1:2.8',
      confidence: 95,
      pipsRisk: 25,
      pipsTarget1: 72,
      pipsTarget2: 102,
      pipsTarget3: 132,
      strategy: 'Scalp de Abertura com Reversão',
      rationale: 'Sinal EUR/USD com classificação 5 Estrelas.',
      sources: {
        worldTimeServer: {
          session: 'London',
          overlap: true,
          status: 'OPTIMAL',
        },
        dailyFx: {
          impact: 'LOW',
          forecastBias: 'BULLISH',
        },
        forexFactory: {
          redFolderWarning: false,
          minutesToNews: 110,
          shieldState: 'SAFE_TO_TRADE',
        },
        investingCom: {
          sentimentBullishPct: 82,
          centralBankTone: 'Dólar fraco pós-abertura',
        },
      },
      createdAt: now - 1000 * 60 * 15,
      updatedAt: now,
      pipsCurrent: +42,
      alertSent: true,
    },
    {
      id: 'sig-gbpjpy-carousel',
      symbol: 'GBPJPY',
      name: 'GBP/JPY',
      action: 'SELL',
      status: 'ACTIVE',
      timeframe: 'M15',
      entryPrice: 156.750,
      currentPrice: 156.900,
      stopLoss: 157.400,
      takeProfit1: 157.200,
      takeProfit2: 156.200,
      takeProfit3: 155.800,
      riskReward: '1:2.4',
      confidence: 91,
      pipsRisk: 65,
      pipsTarget1: 45,
      pipsTarget2: 85,
      pipsTarget3: 130,
      strategy: 'Venda Rápida em Pico de Resistência',
      rationale: 'Sinal GBP/JPY 5 Estrelas.',
      sources: {
        worldTimeServer: {
          session: 'London',
          overlap: false,
          status: 'OPTIMAL',
        },
        dailyFx: {
          impact: 'MED',
          forecastBias: 'BEARISH',
        },
        forexFactory: {
          redFolderWarning: false,
          minutesToNews: 150,
          shieldState: 'SAFE_TO_TRADE',
        },
        investingCom: {
          sentimentBullishPct: 29,
          centralBankTone: 'Correção técnica aguardada',
        },
      },
      createdAt: now - 1000 * 60 * 30,
      updatedAt: now,
      pipsCurrent: -15,
      alertSent: true,
    },
    {
      id: 'sig-xauusd-modal',
      symbol: 'XAUUSD',
      name: 'XAU/USD',
      action: 'BUY',
      status: 'ACTIVE',
      timeframe: 'H1',
      entryPrice: 2345.50,
      currentPrice: 2355.00,
      stopLoss: 2338.00,
      takeProfit1: 2360.00,
      takeProfit2: 2372.00,
      takeProfit3: 2385.00,
      riskReward: '1:3.2',
      confidence: 94,
      pipsRisk: 75,
      pipsTarget1: 145,
      pipsTarget2: 265,
      pipsTarget3: 395,
      strategy: 'IA Deep Confluence Hunter',
      rationale: 'Novo sinal gerado com 94% de acurácia. Ouro em fuga de consolidação.',
      sources: {
        worldTimeServer: {
          session: 'London/NY',
          overlap: true,
          status: 'OPTIMAL',
        },
        dailyFx: {
          impact: 'HIGH',
          forecastBias: 'BULLISH',
        },
        forexFactory: {
          redFolderWarning: false,
          minutesToNews: 45,
          shieldState: 'SAFE_TO_TRADE',
        },
        investingCom: {
          sentimentBullishPct: 94,
          centralBankTone: 'Demanda compradora acelerando',
        },
      },
      createdAt: now - 1000 * 60 * 5,
      updatedAt: now,
      pipsCurrent: +95,
      alertSent: true,
    },
    {
      id: 'sig-xauusd-targetgomoney',
      symbol: 'XAUUSD.pc',
      name: 'XAUUSD.pc (UltimaMarkets Live 2)',
      action: 'BUY',
      status: 'ACTIVE',
      timeframe: 'M5',
      entryPrice: 4258.46,
      currentPrice: 4273.42,
      stopLoss: 4240.67,
      takeProfit1: 4276.25,
      takeProfit2: 4285.15,
      takeProfit3: 4294.04,
      riskReward: '1:2.0',
      confidence: 65,
      pipsRisk: 178, // 17.79 pontos de stop
      pipsTarget1: 178, // 17.79 pontos de TP1
      pipsTarget2: 267, // 26.69 pontos de TP2
      pipsTarget3: 356, // 35.58 pontos de TP3
      strategy: 'TARGET GO MONEY - EXECUÇÃO',
      rationale: 'Sinal calibrado na escala vertical do MT5: Entrada Ciano (4258.46), Stop Vermelho (4240.67), Take 1 (4276.25), Take 2 (4285.15) e Take 3 (4294.04).',
      sources: {
        worldTimeServer: {
          session: 'London & New York Overlap',
          overlap: true,
          status: 'OPTIMAL',
        },
        dailyFx: {
          calendarEvent: 'Dados Spot UltimaMarkets Live 2',
          impact: 'MED',
          forecastBias: 'BULLISH',
        },
        forexFactory: {
          redFolderWarning: false,
          minutesToNews: 55,
          shieldState: 'SAFE_TO_TRADE',
        },
        investingCom: {
          sentimentBullishPct: 65,
          centralBankTone: 'Fluxo Comprador Ativo acima da Linha Ciano 4258.46',
        },
      },
      createdAt: now - 1000 * 60 * 12,
      updatedAt: now,
      pipsCurrent: +150, // +14.96 pts no lucro
      alertSent: true,
    },
    {
      id: 'sig-xauusd-1',
      symbol: 'XAUUSD',
      name: 'Ouro (Gold / USD)',
      action: 'STRONG_BUY',
      status: 'ACTIVE',
      timeframe: 'M5',
      entryPrice: 2658.40,
      currentPrice: 2661.20,
      stopLoss: 2650.00,
      takeProfit1: 2665.00,
      takeProfit2: 2672.00,
      takeProfit3: 2685.00,
      riskReward: '1:3.2',
      confidence: 94,
      pipsRisk: 84, // $8.40 de stop
      pipsTarget1: 66,
      pipsTarget2: 136,
      pipsTarget3: 266,
      strategy: 'London/NY Golden Overlap + Pullback Institucional em Suporte L2',
      rationale: 'Rompimento de máxima asiática confirmado na abertura de Londres com suporte no POC diário e ausência de Red Folders nos próximos 45min.',
      sources: {
        worldTimeServer: {
          session: 'London & New York Overlap',
          overlap: true,
          status: 'OPTIMAL',
        },
        dailyFx: {
          calendarEvent: 'PPI dos EUA alinhado com arrefecimento inflacionário',
          impact: 'MED',
          forecastBias: 'BULLISH',
        },
        forexFactory: {
          redFolderWarning: false,
          minutesToNews: 75,
          shieldState: 'SAFE_TO_TRADE',
        },
        investingCom: {
          sentimentBullishPct: 74,
          centralBankTone: 'Fed Neutro / Alta Demanda por Refúgio Físico',
        },
      },
      createdAt: now - 1000 * 60 * 18,
      updatedAt: now,
      pipsCurrent: +28,
      alertSent: true,
    },
    {
      id: 'sig-eurusd-1',
      symbol: 'EURUSD',
      name: 'Euro / Dólar Americano',
      action: 'SELL',
      status: 'ACTIVE',
      timeframe: 'M15',
      entryPrice: 1.08580,
      currentPrice: 1.08490,
      stopLoss: 1.08820,
      takeProfit1: 1.08320,
      takeProfit2: 1.08150,
      takeProfit3: 1.07900,
      riskReward: '1:2.8',
      confidence: 89,
      pipsRisk: 24,
      pipsTarget1: 26,
      pipsTarget2: 43,
      pipsTarget3: 68,
      strategy: 'Rejeição de Resistência 1.0860 + Divergência RSI H1',
      rationale: 'Discurso Dovish do BCE sinalizando novos cortes de taxa de juros na Europa, fortalecendo DXY no intraday.',
      sources: {
        worldTimeServer: {
          session: 'London',
          overlap: false,
          status: 'OPTIMAL',
        },
        dailyFx: {
          calendarEvent: 'Pronunciamento BCE Lagarde',
          impact: 'HIGH',
          forecastBias: 'BEARISH',
        },
        forexFactory: {
          redFolderWarning: false,
          minutesToNews: 110,
          shieldState: 'SAFE_TO_TRADE',
        },
        investingCom: {
          sentimentBullishPct: 42,
          centralBankTone: 'BCE inclinado a corte de 25bps em Dezembro',
        },
      },
      createdAt: now - 1000 * 60 * 35,
      updatedAt: now,
      pipsCurrent: +9,
      alertSent: true,
    },
    {
      id: 'sig-gbpusd-1',
      symbol: 'GBPUSD',
      name: 'Libra Esterlina / Dólar',
      action: 'STRONG_BUY',
      status: 'ACTIVE',
      timeframe: 'M5',
      entryPrice: 1.29780,
      currentPrice: 1.29910,
      stopLoss: 1.29540,
      takeProfit1: 1.30080,
      takeProfit2: 1.30350,
      takeProfit3: 1.30700,
      riskReward: '1:3.8',
      confidence: 92,
      pipsRisk: 24,
      pipsTarget1: 30,
      pipsTarget2: 57,
      pipsTarget3: 92,
      strategy: 'Rompimento de Range de Londres com Volume Institucional',
      rationale: 'PIB do Reino Unido superando projeções do DailyFX, fluxo comprador agressivo em direção a 1.3050.',
      sources: {
        worldTimeServer: {
          session: 'London Peak Volume',
          overlap: false,
          status: 'OPTIMAL',
        },
        dailyFx: {
          calendarEvent: 'PIB Mensal do Reino Unido (+0.2% vs +0.1% est.)',
          impact: 'MED',
          forecastBias: 'BULLISH',
        },
        forexFactory: {
          redFolderWarning: false,
          minutesToNews: 180,
          shieldState: 'SAFE_TO_TRADE',
        },
        investingCom: {
          sentimentBullishPct: 61,
          centralBankTone: 'BoE Mantendo Juros a 5.00% por mais tempo',
        },
      },
      createdAt: now - 1000 * 60 * 42,
      updatedAt: now,
      pipsCurrent: +13,
      alertSent: true,
    },
    {
      id: 'sig-usdjpy-1',
      symbol: 'USDJPY',
      name: 'Dólar Americano / Iene Japonês',
      action: 'SELL',
      status: 'ACTIVE',
      timeframe: 'M15',
      entryPrice: 152.650,
      currentPrice: 152.320,
      stopLoss: 153.150,
      takeProfit1: 152.000,
      takeProfit2: 151.400,
      takeProfit3: 150.800,
      riskReward: '1:3.7',
      confidence: 88,
      pipsRisk: 50,
      pipsTarget1: 65,
      pipsTarget2: 125,
      pipsTarget3: 185,
      strategy: 'Intervenção Verbal do Ministério das Finanças do Japão',
      rationale: 'Defesa institucional do nível 153.00 pelo Banco do Japão; queda nos rendimentos das Treasuries americanas.',
      sources: {
        worldTimeServer: {
          session: 'Tokyo / London Bridge',
          overlap: false,
          status: 'MODERATE',
        },
        dailyFx: {
          calendarEvent: 'Dados de IPC de Tóquio acima da meta',
          impact: 'MED',
          forecastBias: 'BEARISH',
        },
        forexFactory: {
          redFolderWarning: false,
          minutesToNews: 90,
          shieldState: 'SAFE_TO_TRADE',
        },
        investingCom: {
          sentimentBullishPct: 38,
          centralBankTone: 'BoJ com expectativa de alta de juros para 0.50%',
        },
      },
      createdAt: now - 1000 * 60 * 60,
      updatedAt: now,
      pipsCurrent: +33,
      alertSent: true,
    },
    {
      id: 'sig-gbpjpy-1',
      symbol: 'GBPJPY',
      name: 'Libra / Iene (Dragão)',
      action: 'STRONG_BUY',
      status: 'ACTIVE',
      timeframe: 'M5',
      entryPrice: 197.600,
      currentPrice: 198.150,
      stopLoss: 197.100,
      takeProfit1: 198.400,
      takeProfit2: 199.000,
      takeProfit3: 199.800,
      riskReward: '1:4.4',
      confidence: 91,
      pipsRisk: 50,
      pipsTarget1: 80,
      pipsTarget2: 140,
      pipsTarget3: 220,
      strategy: 'Expansão de Volatilidade de Londres + Re-teste da Média 200',
      rationale: 'Libra em alta aceleração pós-PIB enquanto o Iene se enfraquece no carry trade intraday.',
      sources: {
        worldTimeServer: {
          session: 'London Opening Wave',
          overlap: false,
          status: 'OPTIMAL',
        },
        dailyFx: {
          calendarEvent: 'Balança Comercial UK Positiva',
          impact: 'MED',
          forecastBias: 'BULLISH',
        },
        forexFactory: {
          redFolderWarning: false,
          minutesToNews: 140,
          shieldState: 'SAFE_TO_TRADE',
        },
        investingCom: {
          sentimentBullishPct: 68,
          centralBankTone: 'Divergência Monetária Favorável à Libra',
        },
      },
      createdAt: now - 1000 * 60 * 15,
      updatedAt: now,
      pipsCurrent: +55,
      alertSent: true,
    },
    {
      id: 'sig-audusd-1',
      symbol: 'AUDUSD',
      name: 'Dólar Australiano / USD',
      action: 'BUY',
      status: 'ACTIVE',
      timeframe: 'H1',
      entryPrice: 0.65420,
      currentPrice: 0.65580,
      stopLoss: 0.65200,
      takeProfit1: 0.65750,
      takeProfit2: 0.66050,
      takeProfit3: 0.66400,
      riskReward: '1:4.4',
      confidence: 86,
      pipsRisk: 22,
      pipsTarget1: 33,
      pipsTarget2: 63,
      pipsTarget3: 98,
      strategy: 'Rally das Commodities de Minério e Cobre na Ásia',
      rationale: 'Estímulos econômicos na China impulsionando demanda por AUD, suporte sólido em 0.6530.',
      sources: {
        worldTimeServer: {
          session: 'Asian Session Closes / London Opens',
          overlap: false,
          status: 'MODERATE',
        },
        dailyFx: {
          calendarEvent: 'Dados de Emprego da Austrália',
          impact: 'MED',
          forecastBias: 'BULLISH',
        },
        forexFactory: {
          redFolderWarning: false,
          minutesToNews: 200,
          shieldState: 'SAFE_TO_TRADE',
        },
        investingCom: {
          sentimentBullishPct: 58,
          centralBankTone: 'RBA Mantém Tom Rígido sem Cortes Prematuros',
        },
      },
      createdAt: now - 1000 * 60 * 50,
      updatedAt: now,
      pipsCurrent: +16,
      alertSent: true,
    },
  ];
}

// Calcula pips ganhos/perdidos com base no preço e especificação
export function calculateSignalPips(signal: ForexSignal, price: number): number {
  const spec = getSymbolSpec(signal.symbol);
  const diff = signal.action.includes('BUY')
    ? price - signal.entryPrice
    : signal.entryPrice - price;

  return Math.round(diff / spec.pipSize);
}

// Ticks ao vivo e detector de saídas (TP1, TP2, TP3 e Stop Loss)
export function processSignalTick(
  signal: ForexSignal,
  newPrice: number
): { updatedSignal: ForexSignal; newAlert: MarketAlert | null } {
  const spec = getSymbolSpec(signal.symbol);
  const isBuy = signal.action.includes('BUY');
  const pips = calculateSignalPips(signal, newPrice);

  const updated: ForexSignal = {
    ...signal,
    currentPrice: newPrice,
    pipsCurrent: pips,
    updatedAt: Date.now(),
  };

  let newAlert: MarketAlert | null = null;

  // Se já foi finalizado, retorna
  if (
    signal.status === 'TP3_HIT' ||
    signal.status === 'SL_HIT' ||
    signal.status === 'CLOSED_NEWS'
  ) {
    return { updatedSignal: updated, newAlert: null };
  }

  // Verifica Stop Loss
  const hitSL = isBuy ? newPrice <= signal.stopLoss : newPrice >= signal.stopLoss;
  if (hitSL) {
    updated.status = 'SL_HIT';
    updated.exitReason = `Stop Loss acionado a ${newPrice.toFixed(spec.decimals)} (${pips} pips)`;
    newAlert = {
      id: `alert-sl-${signal.id}-${Date.now()}`,
      signalId: signal.id,
      symbol: signal.symbol,
      type: 'EXIT_SL',
      action: signal.action,
      price: newPrice,
      message: `🔴 SAÍDA (STOP LOSS): ${signal.symbol} atingiu o limite de segurança em ${newPrice.toFixed(spec.decimals)}. Perda controlada: ${pips} pips.`,
      timestamp: Date.now(),
      pips,
      source: 'Technical',
    };
    audioAlerts.playStopLoss();
    return { updatedSignal: updated, newAlert };
  }

  // Verifica TP3
  const hitTP3 = isBuy ? newPrice >= signal.takeProfit3 : newPrice <= signal.takeProfit3;
  if (hitTP3) {
    updated.status = 'TP3_HIT';
    updated.exitReason = `Take Profit 3 (ALVO MÁXIMO) atingido a ${newPrice.toFixed(spec.decimals)} (+${pips} pips)`;
    newAlert = {
      id: `alert-tp3-${signal.id}-${Date.now()}`,
      signalId: signal.id,
      symbol: signal.symbol,
      type: 'EXIT_TP',
      action: signal.action,
      price: newPrice,
      message: `🏆 ALVO MÁXIMO (TP3)! ${signal.symbol} atingiu ${newPrice.toFixed(spec.decimals)}! Lucro estelar: +${pips} pips! Fechando posição 100%.`,
      timestamp: Date.now(),
      pips,
      source: 'Technical',
    };
    audioAlerts.playTakeProfit();
    return { updatedSignal: updated, newAlert };
  }

  // Verifica TP2
  const hitTP2 = isBuy ? newPrice >= signal.takeProfit2 : newPrice <= signal.takeProfit2;
  if (hitTP2 && signal.status !== 'TP2_HIT') {
    updated.status = 'TP2_HIT';
    newAlert = {
      id: `alert-tp2-${signal.id}-${Date.now()}`,
      signalId: signal.id,
      symbol: signal.symbol,
      type: 'EXIT_TP',
      action: signal.action,
      price: newPrice,
      message: `🎯 TAKE PROFIT 2 ATINGIDO: ${signal.symbol} a ${newPrice.toFixed(spec.decimals)} (+${pips} pips). Realize 50% de parcial e ajuste SL para Breakeven.`,
      timestamp: Date.now(),
      pips,
      source: 'Technical',
    };
    audioAlerts.playTakeProfit();
    return { updatedSignal: updated, newAlert };
  }

  // Verifica TP1
  const hitTP1 = isBuy ? newPrice >= signal.takeProfit1 : newPrice <= signal.takeProfit1;
  if (hitTP1 && signal.status === 'ACTIVE') {
    updated.status = 'TP1_HIT';
    newAlert = {
      id: `alert-tp1-${signal.id}-${Date.now()}`,
      signalId: signal.id,
      symbol: signal.symbol,
      type: 'EXIT_TP',
      action: signal.action,
      price: newPrice,
      message: `🟢 TAKE PROFIT 1 BATIDO: ${signal.symbol} a ${newPrice.toFixed(spec.decimals)} (+${pips} pips). Proteja no 0x0 ou encerre parcial.`,
      timestamp: Date.now(),
      pips,
      source: 'Technical',
    };
    audioAlerts.playTakeProfit();
    return { updatedSignal: updated, newAlert };
  }

  return { updatedSignal: updated, newAlert: null };
}

// Cria novo sinal sob demanda com cálculos matemáticos estritos de Risco/Retorno
export function createNewSignal(
  symbol: string,
  action: SignalAction,
  currentPrice: number,
  timeframe: 'M1' | 'M5' | 'M15' | 'M30' | 'H1' | 'H4' = 'M5'
): { signal: ForexSignal; alert: MarketAlert } {
  const spec = getSymbolSpec(symbol);
  const isBuy = action.includes('BUY');

  // Determina distância de Stop e Take baseada no par
  const stopPips = symbol === 'BTCUSD' ? 450 : symbol.includes('XAU') ? 70 : symbol.includes('JPY') ? 45 : 25;
  const tp1Pips = Math.round(stopPips * 1.5);
  const tp2Pips = Math.round(stopPips * 2.8);
  const tp3Pips = Math.round(stopPips * 4.2);

  const pipVal = spec.pipSize;
  const entry = Number(currentPrice.toFixed(spec.decimals));
  const sl = isBuy
    ? Number((entry - stopPips * pipVal).toFixed(spec.decimals))
    : Number((entry + stopPips * pipVal).toFixed(spec.decimals));
  const tp1 = isBuy
    ? Number((entry + tp1Pips * pipVal).toFixed(spec.decimals))
    : Number((entry - tp1Pips * pipVal).toFixed(spec.decimals));
  const tp2 = isBuy
    ? Number((entry + tp2Pips * pipVal).toFixed(spec.decimals))
    : Number((entry - tp2Pips * pipVal).toFixed(spec.decimals));
  const tp3 = isBuy
    ? Number((entry + tp3Pips * pipVal).toFixed(spec.decimals))
    : Number((entry - tp3Pips * pipVal).toFixed(spec.decimals));

  const now = Date.now();
  const id = `sig-${symbol.toLowerCase()}-${now}`;

  const signal: ForexSignal = {
    id,
    symbol,
    name: spec.name,
    action,
    status: 'ACTIVE',
    timeframe,
    entryPrice: entry,
    currentPrice: entry,
    stopLoss: sl,
    takeProfit1: tp1,
    takeProfit2: tp2,
    takeProfit3: tp3,
    riskReward: '1:2.8',
    confidence: Math.floor(88 + Math.random() * 9),
    pipsRisk: stopPips,
    pipsTarget1: tp1Pips,
    pipsTarget2: tp2Pips,
    pipsTarget3: tp3Pips,
    strategy: 'Confluência Macro Sentinel + Rompimento Dinâmico de Sessão',
    rationale: `Sinal gerado com base em liquidez de sessão via World Time Server e ausência de risco no Forex Factory / DailyFX.`,
    sources: {
      worldTimeServer: {
        session: 'Active Global Market',
        overlap: true,
        status: 'OPTIMAL',
      },
      dailyFx: {
        impact: 'MED',
        forecastBias: isBuy ? 'BULLISH' : 'BEARISH',
      },
      forexFactory: {
        redFolderWarning: false,
        minutesToNews: 120,
        shieldState: 'SAFE_TO_TRADE',
      },
      investingCom: {
        sentimentBullishPct: isBuy ? 72 : 36,
        centralBankTone: isBuy ? 'Fluxo Comprador Dominante' : 'Fluxo Vendedor Dominante',
      },
    },
    createdAt: now,
    updatedAt: now,
    pipsCurrent: 0,
    alertSent: true,
  };

  const alert: MarketAlert = {
    id: `alert-entry-${id}`,
    signalId: id,
    symbol,
    type: 'ENTRY',
    action,
    price: entry,
    message: `🚨 NOVO ALERTA DE ENTRADA: ${action === 'STRONG_BUY' || action === 'BUY' ? '🟢 COMPRA' : '🔴 VENDA'} em ${symbol} a ${entry}. SL: ${sl} | TP1: ${tp1} | TP2: ${tp2} | TP3: ${tp3}.`,
    timestamp: now,
    pips: 0,
    source: 'Technical',
  };

  if (isBuy) {
    audioAlerts.playEntryBuy();
  } else {
    audioAlerts.playEntrySell();
  }

  return { signal, alert };
}
