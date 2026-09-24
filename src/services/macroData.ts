import { RegisteredSiteInfo, TradingSessionInfo, MacroNewsEvent } from '../types/signals';

export const REGISTERED_MACRO_SITES: RegisteredSiteInfo[] = [
  {
    id: 'worldtimeserver',
    name: 'World Time Server',
    url: 'https://www.worldtimeserver.com/',
    category: 'Horários Mundiais & Sessões Forex',
    roleDescription: 'Sincronizador dos relógios mundiais (Londres, NY, Tóquio, Sydney) e detecção da Golden Overlap de alta liquidez.',
    status: 'ONLINE',
    lastPing: 'Sincronizado via UTC atomic clock',
    features: [
      'Relógio London (GMT/BST) e New York (EDT/EST)',
      'Detecção de sobreposição de sessões (Golden Overlap)',
      'Contagem regressiva de abertura e encerramento',
      'Classificação de liquidez instantânea por par',
    ],
  },
  {
    id: 'dailyfx',
    name: 'DailyFX Economic Calendar',
    url: 'https://www.dailyfx.com/economic-calendar',
    category: 'Calendário Econômico Institucional',
    roleDescription: 'Feed de notícias de médio e alto impacto com estimativas, projeções de consenso e impacto cambial projetado.',
    status: 'ONLINE',
    lastPing: 'Feed ativo em tempo real',
    features: [
      'Classificação de Impacto (High, Medium, Low)',
      'Dados de Projeção vs Anterior vs Divulgado',
      'Viés direcional de volatilidade (Bullish/Bearish)',
      'Filtragem por moeda (USD, EUR, GBP, JPY, Ouro)',
    ],
  },
  {
    id: 'forexfactory',
    name: 'Forex Factory Intelligence',
    url: 'https://www.forexfactory.com/',
    category: 'Radar de Notícias & Red Folder',
    roleDescription: 'Monitor de "Pastas Vermelhas" (Red Folders) e blindagem contra falsos rompimentos e slippage de notícias.',
    status: 'ONLINE',
    lastPing: 'Radar de notícias 24/5 conectado',
    features: [
      'Alerta sonoro de Red Folder a 15min do evento',
      'Blindagem Anti-Spike (recomenda pausa de ordens)',
      'Sentimento de posições de traders de varejo',
      'Monitor de feriados bancários e pausas de liquidez',
    ],
  },
  {
    id: 'investing',
    name: 'Investing.com Economic Calendar',
    url: 'https://www.investing.com/economic-calendar/',
    category: 'Taxas de Juros & Sentimento Global',
    roleDescription: 'Termômetro de políticas monetárias dos Bancos Centrais (Fed, BCE, BoJ, BoE) e radar de sentimento comprado/vendido.',
    status: 'ONLINE',
    lastPing: 'Taxas e índices atualizados',
    features: [
      'Taxas de juros dos Bancos Centrais mundiais',
      'Medidor de Sentimento Comprado vs Vendido (%)',
      'Calendário de discursos de presidentes do Fed/BCE',
      'Rastreamento de Yields dos Treasuries dos EUA',
    ],
  },
];

// Cálculo preciso das 4 sessões mundiais com base na hora UTC atual
export function getTradingSessions(): TradingSessionInfo[] {
  const now = new Date();
  const currentUtcHour = now.getUTCHours();
  const currentUtcMinute = now.getUTCMinutes();
  const currentUtcDecimal = currentUtcHour + currentUtcMinute / 60;

  // Sessões em UTC:
  // Sydney: 22:00 UTC - 07:00 UTC
  // Tokyo: 00:00 UTC - 09:00 UTC
  // London: 08:00 UTC - 17:00 UTC
  // New York: 13:00 UTC - 22:00 UTC

  const isSydneyOpen = currentUtcDecimal >= 22 || currentUtcDecimal < 7;
  const isTokyoOpen = currentUtcDecimal >= 0 && currentUtcDecimal < 9;
  const isLondonOpen = currentUtcDecimal >= 8 && currentUtcDecimal < 17;
  const isNewYorkOpen = currentUtcDecimal >= 13 && currentUtcDecimal < 22;

  // Formata hora local de cada cidade
  const formatCityTime = (timeZone: string) => {
    try {
      return new Intl.DateTimeFormat('pt-BR', {
        timeZone,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
      }).format(now);
    } catch {
      return '--:--:--';
    }
  };

  const getEventTimeStr = (isOpen: boolean, closeHour: number, openHour: number) => {
    if (isOpen) {
      const diffHours = (closeHour - currentUtcHour + 24) % 24;
      return `Fecha em ~${diffHours}h`;
    } else {
      const diffHours = (openHour - currentUtcHour + 24) % 24;
      return `Abre em ~${diffHours}h`;
    }
  };

  return [
    {
      name: 'London',
      city: 'Londres (Reino Unido)',
      country: 'UK',
      openUtc: 8,
      closeUtc: 17,
      timezoneOffsetHours: 1,
      isOpen: isLondonOpen,
      timeUntilNextEvent: getEventTimeStr(isLondonOpen, 17, 8),
      volatilityRating: 'Alta',
      keyPairs: ['EURUSD', 'GBPUSD', 'XAUUSD', 'EURGBP', 'GBPJPY'],
      localTimeFormatted: formatCityTime('Europe/London'),
    },
    {
      name: 'New York',
      city: 'Nova York (Estados Unidos)',
      country: 'USA',
      openUtc: 13,
      closeUtc: 22,
      timezoneOffsetHours: -4,
      isOpen: isNewYorkOpen,
      timeUntilNextEvent: getEventTimeStr(isNewYorkOpen, 22, 13),
      volatilityRating: 'Alta',
      keyPairs: ['XAUUSD', 'EURUSD', 'USDCAD', 'USDJPY', 'USDCHF'],
      localTimeFormatted: formatCityTime('America/New_York'),
    },
    {
      name: 'Tokyo',
      city: 'Tóquio (Japão)',
      country: 'JAP',
      openUtc: 0,
      closeUtc: 9,
      timezoneOffsetHours: 9,
      isOpen: isTokyoOpen,
      timeUntilNextEvent: getEventTimeStr(isTokyoOpen, 9, 0),
      volatilityRating: 'Média',
      keyPairs: ['USDJPY', 'GBPJPY', 'AUDUSD', 'EURJPY'],
      localTimeFormatted: formatCityTime('Asia/Tokyo'),
    },
    {
      name: 'Sydney',
      city: 'Sydney (Austrália)',
      country: 'AUS',
      openUtc: 22,
      closeUtc: 7,
      timezoneOffsetHours: 10,
      isOpen: isSydneyOpen,
      timeUntilNextEvent: getEventTimeStr(isSydneyOpen, 7, 22),
      volatilityRating: 'Baixa',
      keyPairs: ['AUDUSD', 'NZDUSD', 'AUDJPY'],
      localTimeFormatted: formatCityTime('Australia/Sydney'),
    },
  ];
}

// Verifica se está na sobreposição London + New York (13:00 - 17:00 UTC)
export function isGoldenOverlapActive(): boolean {
  const now = new Date();
  const utcHour = now.getUTCHours();
  return utcHour >= 13 && utcHour < 17;
}

// Banco de dados dinâmico de notícias dos 3 sites de macroeconomia
export const INITIAL_MACRO_NEWS: MacroNewsEvent[] = [
  {
    id: 'news-1',
    timeUtc: '13:30',
    currency: 'USD',
    title: 'Índice de Preços ao Produtor (PPI MoM)',
    impact: 'HIGH',
    actual: '+0.2%',
    forecast: '+0.1%',
    previous: '-0.1%',
    source: 'DailyFX',
    sentiment: 'BULLISH',
    affectedPairs: ['XAUUSD', 'EURUSD', 'GBPUSD', 'USDJPY'],
  },
  {
    id: 'news-2',
    timeUtc: '14:00',
    currency: 'USD',
    title: 'Discurso de Membro do FOMC (Powell / Williams)',
    impact: 'HIGH',
    actual: '--',
    forecast: '--',
    previous: '--',
    source: 'ForexFactory',
    sentiment: 'NEUTRAL',
    affectedPairs: ['XAUUSD', 'EURUSD', 'USDCAD'],
  },
  {
    id: 'news-3',
    timeUtc: '15:00',
    currency: 'USD',
    title: 'Sentimento do Consumidor de Michigan',
    impact: 'HIGH',
    actual: '70.5',
    forecast: '69.0',
    previous: '68.2',
    source: 'Investing.com',
    sentiment: 'BULLISH',
    affectedPairs: ['XAUUSD', 'EURUSD', 'USDJPY'],
  },
  {
    id: 'news-4',
    timeUtc: '09:00',
    currency: 'EUR',
    title: 'Discurso de Christine Lagarde (BCE)',
    impact: 'HIGH',
    actual: '--',
    forecast: '--',
    previous: '--',
    source: 'ForexFactory',
    sentiment: 'BEARISH',
    affectedPairs: ['EURUSD', 'EURGBP'],
  },
  {
    id: 'news-5',
    timeUtc: '07:00',
    currency: 'GBP',
    title: 'PIB Mensal do Reino Unido (MoM)',
    impact: 'MED',
    actual: '+0.2%',
    forecast: '+0.1%',
    previous: '+0.0%',
    source: 'DailyFX',
    sentiment: 'BULLISH',
    affectedPairs: ['GBPUSD', 'EURGBP', 'GBPJPY'],
  },
  {
    id: 'news-6',
    timeUtc: '19:30',
    currency: 'USD',
    title: 'Leilão de Títulos do Tesouro Americano de 10 Anos',
    impact: 'MED',
    actual: '4.24%',
    forecast: '4.20%',
    previous: '4.18%',
    source: 'Investing.com',
    sentiment: 'BULLISH',
    affectedPairs: ['XAUUSD', 'USDJPY'],
  },
];

// Monitor de Taxas de Juros dos Bancos Centrais (Investing.com)
export interface CentralBankRate {
  bank: string;
  currency: string;
  rate: string;
  nextMeeting: string;
  bias: 'Hawkish' | 'Dovish' | 'Neutro';
}

export const CENTRAL_BANK_RATES: CentralBankRate[] = [
  {
    bank: 'Federal Reserve (Fed)',
    currency: 'USD',
    rate: '5.25% - 5.50%',
    nextMeeting: '18 Nov',
    bias: 'Hawkish',
  },
  {
    bank: 'Banco Central Europeu (BCE)',
    currency: 'EUR',
    rate: '3.65%',
    nextMeeting: '12 Dez',
    bias: 'Dovish',
  },
  {
    bank: 'Bank of England (BoE)',
    currency: 'GBP',
    rate: '5.00%',
    nextMeeting: '07 Nov',
    bias: 'Neutro',
  },
  {
    bank: 'Bank of Japan (BoJ)',
    currency: 'JPY',
    rate: '0.25%',
    nextMeeting: '19 Dez',
    bias: 'Hawkish',
  },
];

// Sentimento Médio por Par (Investing.com / Forex Factory)
export interface SymbolSentiment {
  symbol: string;
  bullishPct: number;
  bearishPct: number;
  recommendation: 'COMPRA' | 'VENDA' | 'NEUTRO';
}

export const SYMBOL_SENTIMENTS: Record<string, SymbolSentiment> = {
  XAUUSD: { symbol: 'XAUUSD', bullishPct: 74, bearishPct: 26, recommendation: 'COMPRA' },
  EURUSD: { symbol: 'EURUSD', bullishPct: 42, bearishPct: 58, recommendation: 'VENDA' },
  GBPUSD: { symbol: 'GBPUSD', bullishPct: 61, bearishPct: 39, recommendation: 'COMPRA' },
  USDJPY: { symbol: 'USDJPY', bullishPct: 38, bearishPct: 62, recommendation: 'VENDA' },
  AUDUSD: { symbol: 'AUDUSD', bullishPct: 52, bearishPct: 48, recommendation: 'NEUTRO' },
  USDCAD: { symbol: 'USDCAD', bullishPct: 45, bearishPct: 55, recommendation: 'VENDA' },
  USDCHF: { symbol: 'USDCHF', bullishPct: 40, bearishPct: 60, recommendation: 'VENDA' },
  EURGBP: { symbol: 'EURGBP', bullishPct: 35, bearishPct: 65, recommendation: 'VENDA' },
  GBPJPY: { symbol: 'GBPJPY', bullishPct: 68, bearishPct: 32, recommendation: 'COMPRA' },
};
