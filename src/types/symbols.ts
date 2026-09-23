export type SymbolCategory = 'metals' | 'forex' | 'crypto' | 'indices';

export interface SymbolSpec {
  symbol: string;
  name: string;
  category: SymbolCategory;
  basePrice: number;
  decimals: number;
  pipSize: number;
  pointSize: number;
  contractSize: number;
  minLot: number;
  maxLot: number;
  lotStep: number;
  typicalSpreadPips: number;
  description: string;
  icon: string;
}

export const SUPPORTED_SYMBOLS: Record<string, SymbolSpec> = {
  XAUUSD: {
    symbol: 'XAUUSD',
    name: 'Ouro (Gold / USD)',
    category: 'metals',
    basePrice: 2658.45,
    decimals: 2,
    pipSize: 0.10,
    pointSize: 0.01,
    contractSize: 100,
    minLot: 0.01,
    maxLot: 50.0,
    lotStep: 0.01,
    typicalSpreadPips: 0.2,
    description: 'Ouro à vista contra Dólar Americano (100 oz Troy por lote).',
    icon: '🪙',
  },
  EURUSD: {
    symbol: 'EURUSD',
    name: 'Euro / Dólar Americano',
    category: 'forex',
    basePrice: 1.08520,
    decimals: 5,
    pipSize: 0.00010,
    pointSize: 0.00001,
    contractSize: 100000,
    minLot: 0.01,
    maxLot: 100.0,
    lotStep: 0.01,
    typicalSpreadPips: 0.1,
    description: 'Paridade cambial mais líquida do mercado mundial Forex.',
    icon: '💶',
  },
  GBPUSD: {
    symbol: 'GBPUSD',
    name: 'Libra Esterlina / Dólar',
    category: 'forex',
    basePrice: 1.29840,
    decimals: 5,
    pipSize: 0.00010,
    pointSize: 0.00001,
    contractSize: 100000,
    minLot: 0.01,
    maxLot: 100.0,
    lotStep: 0.01,
    typicalSpreadPips: 0.3,
    description: 'Conhecido como Cable. Alta volatilidade nas sessões de Londres e Nova York.',
    icon: '💷',
  },
  USDJPY: {
    symbol: 'USDJPY',
    name: 'Dólar Americano / Iene Japonês',
    category: 'forex',
    basePrice: 152.380,
    decimals: 3,
    pipSize: 0.010,
    pointSize: 0.001,
    contractSize: 100000,
    minLot: 0.01,
    maxLot: 100.0,
    lotStep: 0.01,
    typicalSpreadPips: 0.2,
    description: 'Par asiático de alta liquidez e correlação com rendimentos do Tesouro dos EUA.',
    icon: '💴',
  },
  BTCUSD: {
    symbol: 'BTCUSD',
    name: 'Bitcoin / US Dollar',
    category: 'crypto',
    basePrice: 67840.00,
    decimals: 2,
    pipSize: 1.00,
    pointSize: 0.01,
    contractSize: 1,
    minLot: 0.01,
    maxLot: 20.0,
    lotStep: 0.01,
    typicalSpreadPips: 3.5,
    description: 'Criptoativo líder global com negociação contínua 24/7.',
    icon: '₿',
  },
  ETHUSD: {
    symbol: 'ETHUSD',
    name: 'Ethereum / US Dollar',
    category: 'crypto',
    basePrice: 2640.50,
    decimals: 2,
    pipSize: 0.10,
    pointSize: 0.01,
    contractSize: 1,
    minLot: 0.01,
    maxLot: 50.0,
    lotStep: 0.01,
    typicalSpreadPips: 0.8,
    description: 'Segunda maior criptomoeda em valor de mercado mundial.',
    icon: '⟠',
  },
  US30: {
    symbol: 'US30',
    name: 'Dow Jones Industrial 30',
    category: 'indices',
    basePrice: 42480.0,
    decimals: 1,
    pipSize: 1.0,
    pointSize: 0.1,
    contractSize: 1,
    minLot: 0.1,
    maxLot: 50.0,
    lotStep: 0.1,
    typicalSpreadPips: 1.5,
    description: 'Índice com as 30 maiores blue chips corporativas dos Estados Unidos.',
    icon: '📈',
  },
  NAS100: {
    symbol: 'NAS100',
    name: 'Nasdaq 100 Tech Index',
    category: 'indices',
    basePrice: 20180.0,
    decimals: 1,
    pipSize: 1.0,
    pointSize: 0.1,
    contractSize: 1,
    minLot: 0.1,
    maxLot: 50.0,
    lotStep: 0.1,
    typicalSpreadPips: 1.2,
    description: 'Índice de tecnologia com Apple, Microsoft, Nvidia, Google e Amazon.',
    icon: '⚡',
  },
};

export function getSymbolSpec(symbol: string): SymbolSpec {
  // If the symbol has broker suffix e.g. XAUUSDm, XAUUSDz, XAUUSDc
  const clean = symbol.toUpperCase().replace(/(M|Z|C|\.RAW|\.PRO|\.A|\.B)$/i, '');
  if (SUPPORTED_SYMBOLS[clean]) {
    return {
      ...SUPPORTED_SYMBOLS[clean],
      symbol: symbol.toUpperCase(),
    };
  }
  return SUPPORTED_SYMBOLS.XAUUSD;
}

export function formatSymbolPrice(price: number, spec: SymbolSpec): string {
  if (isNaN(price)) return '0.00';
  return price.toLocaleString('en-US', {
    minimumFractionDigits: spec.decimals,
    maximumFractionDigits: spec.decimals,
  });
}
