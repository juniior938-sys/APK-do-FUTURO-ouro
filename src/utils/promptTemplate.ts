import { BrokerCredentials, ExnessAccountType } from '../types/mt5';
import { EXNESS_ACCOUNT_SPECS } from './goldMath';

export interface PromptConfig {
  broker: BrokerCredentials;
  symbol: string;
  timeframe: string;
  riskPercent: number;
  maxDailyLossUsd: number;
  maxSpreadPips: number;
  defaultLot: number;
  accountType?: ExnessAccountType;
}

export function generateCorrectedPrompt(config: PromptConfig): string {
  const { broker, symbol, riskPercent, maxDailyLossUsd, maxSpreadPips, defaultLot, accountType = 'raw_spread' } = config;
  const isCloud = broker.protocol === 'metaapi_cloud';
  const spec = EXNESS_ACCOUNT_SPECS[broker.accountType || accountType || 'raw_spread'];

  return `# Instalação do Agente jev-mt5-xauusd: Trading Automatizado MT5 para XAUUSD (Exness.com)

> **Instruções para o Claude Code / Terminal:**
> Este prompt instala o skill \`jev-mt5-xauusd\` em \`~/.claude/skills/jev-mt5-xauusd/\`.
> Configurado especificamente para **XAUUSD (Ouro/Dólar)** na **Exness.com**, com suporte para contas **Raw Spread, Zero, Standard e Cent**, ajustando automaticamente spreads, comissões e tamanho de contrato!

---

## 📌 Visão Geral da Arquitetura & Especificações Exness.com

- **Conta Configurada:** ${spec.name} (${spec.badge})
  - **Símbolo Exness:** \`${spec.symbol}\`
  - **Spread Típico:** ~${spec.typicalSpreadPips.toFixed(1)} pips (${spec.minSpreadPips.toFixed(1)} - ${spec.maxSpreadPips.toFixed(1)} pips)
  - **Comissão por Lote:** $${spec.commissionPerLotUsd.toFixed(2)} USD
  - **Tamanho do Contrato:** ${spec.contractSizeOz} onças troy ${spec.isCentAccount ? '(1 Lote Cent = 1 oz / Saldo em USC)' : '(1 Lote Padrão = 100 oz)'}
  - **Pip Size:** $0.10 USD (10 Points)

- **Camada Determinística (Código Python/Node.js local):**
  - Conexão e autenticação direta no terminal MetaTrader 5 (MT5) ou MetaAPI Cloud.
  - Cálculo exato de contratos (${spec.contractSizeOz} oz por lote) e deduções de comissão ($${spec.commissionPerLotUsd}/lote).
  - Trava de perda máxima diária ($${maxDailyLossUsd} USD) e corte de spread se exceder ${spec.maxSpreadPips + 1.0} pips.
  - Envio e cancelamento de ordens via MT5 API (\`ORDER_TYPE_BUY\`, \`ORDER_TYPE_SELL\`).

- **Camada Probabilística (Bateria de 7 Julgamentos com Jev / IA):**
  1. \`regime\`: Mercado em tendência forte, consolidação de sessão asiática, alta volatilidade de notícia ou crise.
  2. \`direction\`: Viés direcional do XAUUSD para as próximas velas (Alta, Baixa ou Neutro).
  3. \`toxic_flow\`: Fluxo agressivo institucional (sweep de liquidez) vs ruído de varejo.
  4. \`liquidity_stressed\`: Alargamento de spread ou baixa profundidade no book do Ouro.
  5. \`quote_environment\`: Condição para entrada a mercado sem derrapagem (slippage).
  6. \`inventory_pressure\`: Urgência para zerar ou defender posição comprada/vendida em Ouro.
  7. \`execution_health\`: Monitor de latência de ping e rejeição de ordens da corretora.

---

## 🔑 Dados da Sua Corretora MT5 / Exness (Configuração Automática)

\`\`\`env
# ==============================================================================
# CONFIGURAÇÃO EXNESS.COM METATRADER 5 (XAUUSD)
# ==============================================================================
MT5_BROKER_NAME="${broker.brokerName || 'Exness'}"
MT5_SERVER="${broker.server || 'Exness-Real25'}"
MT5_LOGIN="${broker.login || '12345678'}"
MT5_PASSWORD="${broker.password ? '********' : 'SUA_SENHA_MT5'}"
MT5_ACCOUNT_TYPE="${broker.accountMode.toUpperCase()}"
EXNESS_ACCOUNT_PROFILE="${spec.id}" # raw_spread, zero, standard, standard_cent, pro
MT5_LEVERAGE="${broker.leverage || 500}"

# Símbolo do Ouro na Exness:
# - Raw Spread / Pro: XAUUSD
# - Zero Account: XAUUSDz
# - Standard: XAUUSDm
# - Standard Cent: XAUUSDc
MT5_SYMBOL="${spec.symbol}"
XAUUSD_CONTRACT_SIZE=${spec.contractSizeOz}
XAUUSD_COMMISSION_PER_LOT=${spec.commissionPerLotUsd}
XAUUSD_PIP_SIZE=0.10
IS_CENT_ACCOUNT=${spec.isCentAccount}

# Modo de Conexão Web:
# - 'local_bridge': Usa servidor local FastAPI (Python MetaTrader5 nativo no Windows/Wine)
# - 'metaapi_cloud': Conexão 100% nuvem via MetaAPI REST/WebSocket (sem precisar de MT5 instalado)
CONNECTION_PROTOCOL="${broker.protocol}"
${isCloud ? `METAAPI_TOKEN="${broker.metaApiToken || 'SEU_TOKEN_METAAPI'}"\nMETAAPI_ACCOUNT_ID="${broker.metaApiAccountId || 'SEU_ACCOUNT_ID_METAAPI'}"` : `LOCAL_BRIDGE_PORT=8000\nMT5_TERMINAL_PATH="C:/Program Files/MetaTrader 5/terminal64.exe"`}

# ==============================================================================
# GESTÃO DE RISCO PARA XAUUSD (OURO)
# ==============================================================================
DEFAULT_LOT_SIZE=${defaultLot || (spec.isCentAccount ? 1.0 : 0.05)}
AUTO_LOT_RISK_PERCENT=${riskPercent || 1.0}
MAX_DAILY_LOSS_USD=${maxDailyLossUsd || 150.0}
MAX_SPREAD_PIPS=${maxSpreadPips || (spec.maxSpreadPips + 0.5)}
MAX_OPEN_TRADES=3
ENFORCE_STOP_LOSS=true
\`\`\`

---

## 🛠️ Fase 1: Criação da Estrutura do Skill

Execute no seu terminal:

\`\`\`bash
mkdir -p ~/.claude/skills/jev-mt5-xauusd/mt5_engine
mkdir -p ~/.claude/skills/jev-mt5-xauusd/web_bridge
mkdir -p ~/.claude/skills/jev-mt5-xauusd/tests
\`\`\`

---

## 📄 Fase 2: Servidor Bridge Web / MT5 (\`web_bridge/mt5_server.py\`)

Este script atua como a ponte entre o site/web browser e o MetaTrader 5 nativo:

\`\`\`python
import os
import MetaTrader5 as mt5
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(title="MT5 XAUUSD Web Bridge API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

SYMBOL = os.getenv("MT5_SYMBOL", "XAUUSD")
LOGIN = int(os.getenv("MT5_LOGIN", "0"))
PASSWORD = os.getenv("MT5_PASSWORD", "")
SERVER = os.getenv("MT5_SERVER", "")

def init_mt5():
    if not mt5.initialize(login=LOGIN, password=PASSWORD, server=SERVER):
        err = mt5.last_error()
        print(f"Erro ao conectar ao MT5: {err}")
        return False
    # Garante que o XAUUSD está ativo no MarketWatch
    mt5.symbol_select(SYMBOL, True)
    return True

@app.on_event("startup")
def startup_event():
    init_mt5()

@app.get("/api/account")
def get_account():
    info = mt5.account_info()
    if info is None:
        raise HTTPException(status_code=500, detail="Não foi possível ler conta MT5")
    return {
        "login": info.login,
        "balance": info.balance,
        "equity": info.equity,
        "margin": info.margin,
        "free_margin": info.margin_free,
        "margin_level": info.margin_level,
        "profit": info.profit,
        "currency": info.currency,
        "server": info.server,
        "company": info.company,
        "leverage": info.leverage
    }

@app.get("/api/quote")
def get_quote():
    tick = mt5.symbol_info_tick(SYMBOL)
    if tick is None:
        raise HTTPException(status_code=500, detail=f"Símbolo {SYMBOL} sem cotação")
    spread_pips = round((tick.ask - tick.bid) / 0.10, 1)
    return {
        "symbol": SYMBOL,
        "bid": tick.bid,
        "ask": tick.ask,
        "spread_pips": spread_pips,
        "time": tick.time
    }

class OrderRequest(BaseModel):
    action: str # "BUY" ou "SELL"
    volume: float
    sl_price: float = 0.0
    tp_price: float = 0.0
    comment: str = "JEV-MT5-Web"

@app.post("/api/order")
def send_order(req: OrderRequest):
    tick = mt5.symbol_info_tick(SYMBOL)
    if not tick:
        raise HTTPException(status_code=400, detail="Sem tick de preço")
        
    order_type = mt5.ORDER_TYPE_BUY if req.action.upper() == "BUY" else mt5.ORDER_TYPE_SELL
    price = tick.ask if order_type == mt5.ORDER_TYPE_BUY else tick.bid
    
    # Filtro de segurança: Spread máximo para Ouro
    max_spread = float(os.getenv("MAX_SPREAD_PIPS", "3.5"))
    current_spread = (tick.ask - tick.bid) / 0.10
    if current_spread > max_spread:
        raise HTTPException(status_code=400, detail=f"Spread excessivo no Ouro ({current_spread:.1f} > {max_spread} pips). Entrada vetada.")

    request = {
        "action": mt5.TRADE_ACTION_DEAL,
        "symbol": SYMBOL,
        "volume": float(req.volume),
        "type": order_type,
        "price": price,
        "sl": float(req.sl_price) if req.sl_price > 0 else 0.0,
        "tp": float(req.tp_price) if req.tp_price > 0 else 0.0,
        "deviation": 20,
        "magic": 992026,
        "comment": req.comment,
        "type_time": mt5.ORDER_TIME_GTC,
        "type_filling": mt5.ORDER_FILLING_IOC,
    }

    result = mt5.order_send(request)
    if result.retcode != mt5.TRADE_RETCODE_DONE:
        raise HTTPException(status_code=400, detail=f"Erro ordem MT5: {result.comment} (código {result.retcode})")

    return {
        "success": True,
        "ticket": result.order,
        "volume": result.volume,
        "price": result.price,
        "retcode": result.retcode
    }

@app.post("/api/close/{ticket}")
def close_position(ticket: int):
    positions = mt5.positions_get(ticket=ticket)
    if not positions:
        raise HTTPException(status_code=404, detail="Posição não encontrada")
    pos = positions[0]
    close_type = mt5.ORDER_TYPE_SELL if pos.type == mt5.ORDER_TYPE_BUY else mt5.ORDER_TYPE_BUY
    tick = mt5.symbol_info_tick(pos.symbol)
    price = tick.bid if close_type == mt5.ORDER_TYPE_SELL else tick.ask
    
    req = {
        "action": mt5.TRADE_ACTION_DEAL,
        "position": ticket,
        "symbol": pos.symbol,
        "volume": pos.volume,
        "type": close_type,
        "price": price,
        "deviation": 20,
        "magic": 992026,
        "comment": "Close from Web",
        "type_time": mt5.ORDER_TIME_GTC,
        "type_filling": mt5.ORDER_FILLING_IOC,
    }
    res = mt5.order_send(req)
    if res.retcode != mt5.TRADE_RETCODE_DONE:
        raise HTTPException(status_code=400, detail=f"Erro ao fechar: {res.comment}")
    return {"success": True, "ticket": ticket, "profit": pos.profit}
\`\`\`

---

## ⚡ Comandos de Execução Rápida

Para iniciar a ponte no Windows ou VPS:
\`\`\`bash
pip install MetaTrader5 fastapi uvicorn python-dotenv
uvicorn web_bridge.mt5_server:app --host 0.0.0.0 --port 8000 --reload
\`\`\`

A interface web deste app se conectará diretamente a esta porta ou utilizará o conector Web nativo configurado para operar seu XAUUSD com latência mínima!
`;
}
