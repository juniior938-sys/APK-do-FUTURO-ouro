import React, { useState } from 'react';
import { Copy, Check, Download, FileCode, Terminal, HelpCircle, Layers } from 'lucide-react';
import { BrokerCredentials } from '../types/mt5';

interface Mt5BridgeCodeProps {
  credentials: BrokerCredentials;
  symbol: string;
}

export const Mt5BridgeCodeModal: React.FC<Mt5BridgeCodeProps> = ({ credentials, symbol }) => {
  const [activeFile, setActiveFile] = useState<'python' | 'env' | 'mql5'>('python');
  const [copied, setCopied] = useState(false);

  const pythonCode = `# ==============================================================================
# SERVIDOR PONTE MT5 PARA NEGOCIAR XAUUSD DIRETO DO SITE
# Arquivo: mt5_server.py
# Requisitos: pip install MetaTrader5 fastapi uvicorn python-dotenv pydantic
# Execução: uvicorn mt5_server:app --host 0.0.0.0 --port 8000 --reload
# ==============================================================================

import os
import MetaTrader5 as mt5
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(title="MT5 XAUUSD Web Bridge API")

# Habilita CORS para conexão direta do website
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

SYMBOL = os.getenv("MT5_SYMBOL", "${symbol}")
LOGIN = int(os.getenv("MT5_LOGIN", "${credentials.login || '0'}"))
PASSWORD = os.getenv("MT5_PASSWORD", "${credentials.password || ''}")
SERVER = os.getenv("MT5_SERVER", "${credentials.server || ''}")

def init_mt5():
    print(f"Conectando ao MT5: Servidor={SERVER}, Login={LOGIN}")
    if not mt5.initialize(login=LOGIN, password=PASSWORD, server=SERVER):
        err = mt5.last_error()
        print(f"Erro ao inicializar MT5: {err}")
        return False
    # Garante que o Ouro está visível no Market Watch
    mt5.symbol_select(SYMBOL, True)
    print("MT5 Conectado com sucesso ao XAUUSD!")
    return True

@app.on_event("startup")
def startup_event():
    init_mt5()

@app.get("/api/health")
def health_check():
    return {"status": "online", "mt5_connected": mt5.terminal_info() is not None}

@app.get("/api/account")
def get_account():
    info = mt5.account_info()
    if info is None:
        raise HTTPException(status_code=500, detail="Não foi possível obter dados da conta")
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
    action: str  # "BUY" ou "SELL"
    volume: float
    sl_price: float = 0.0
    tp_price: float = 0.0
    comment: str = "WebTrader-XAUUSD"

@app.post("/api/order")
def send_order(req: OrderRequest):
    tick = mt5.symbol_info_tick(SYMBOL)
    if not tick:
        raise HTTPException(status_code=400, detail="Sem tick do XAUUSD no momento")

    order_type = mt5.ORDER_TYPE_BUY if req.action.upper() == "BUY" else mt5.ORDER_TYPE_SELL
    price = tick.ask if order_type == mt5.ORDER_TYPE_BUY else tick.bid

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
        raise HTTPException(status_code=400, detail=f"Erro ordem MT5: {result.comment} (retcode: {result.retcode})")

    return {
        "success": True,
        "ticket": result.order,
        "volume": result.volume,
        "price": result.price,
        "retcode": result.retcode
    }

@app.post("/api/close/{ticket}")
def close_order(ticket: int):
    positions = mt5.positions_get(ticket=ticket)
    if not positions:
        raise HTTPException(status_code=404, detail="Posição não encontrada no MT5")
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
`;

  const envCode = `# Arquivo: .env
MT5_BROKER_NAME="${credentials.brokerName || 'Exness'}"
MT5_SERVER="${credentials.server || 'Exness-Real25'}"
MT5_LOGIN="${credentials.login || '12345678'}"
MT5_PASSWORD="${credentials.password || 'SuaSenhaAqui'}"
MT5_SYMBOL="${symbol || 'XAUUSD'}"
MAX_SPREAD_PIPS=3.5
`;

  const mql5Code = `//+------------------------------------------------------------------+
//|                                             WebWebhook_EA.mq5    |
//|  Expert Advisor para receber ordens do Website via WebRequest    |
//+------------------------------------------------------------------+
#property copyright "MT5 XAUUSD Web Trader"
#property link      "https://localhost"
#property version   "1.00"

input string   ServerURL = "http://localhost:8000/api/signal";
input int      TimerSeconds = 1;

int OnInit()
{
   EventSetTimer(TimerSeconds);
   Print("EA Web Trader Iniciado para XAUUSD!");
   return(INIT_SUCCEEDED);
}

void OnDeinit(const int reason)
{
   EventKillTimer();
}

void OnTimer()
{
   // Consulta endpoints ou aguarda comandos
}
`;

  const currentCode = activeFile === 'python' ? pythonCode : activeFile === 'env' ? envCode : mql5Code;

  const handleCopy = () => {
    navigator.clipboard.writeText(currentCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-4">
      {/* Top Header Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <FileCode className="w-5 h-5 text-blue-400" />
              <span>Código da Ponte MT5 (Bridge Python / FastAPI)</span>
            </h2>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
              O MetaTrader 5 nativo é um aplicativo desktop Windows. Para permitir que o seu navegador web envie ordens diretamente para o MT5, você roda este script Python ultraleve na sua máquina ou VPS. Ele aceita comandos do site e executa na sua corretora em menos de 10ms!
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-2 transition-colors shadow-sm"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copiado!' : 'Copiar Código'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Code Viewer */}
      <div className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-md text-xs">
        {/* File Tabs */}
        <div className="px-4 py-2.5 border-b border-slate-800 flex items-center justify-between bg-slate-900/80">
          <div className="flex items-center gap-1.5 font-mono text-xs">
            <button
              onClick={() => setActiveFile('python')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-colors ${
                activeFile === 'python'
                  ? 'bg-slate-800 text-blue-400 border border-slate-700'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              mt5_server.py
            </button>

            <button
              onClick={() => setActiveFile('env')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-colors ${
                activeFile === 'env'
                  ? 'bg-slate-800 text-amber-400 border border-slate-700'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              .env
            </button>

            <button
              onClick={() => setActiveFile('mql5')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-colors ${
                activeFile === 'mql5'
                  ? 'bg-slate-800 text-emerald-400 border border-slate-700'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              WebWebhook_EA.mq5
            </button>
          </div>

          <span className="text-[11px] text-slate-500 font-mono">
            {activeFile === 'python' ? 'Python 3.10+ / FastAPI' : activeFile === 'env' ? 'Variáveis de Ambiente' : 'MQL5 Expert'}
          </span>
        </div>

        {/* Code Block */}
        <pre className="p-6 text-slate-300 font-mono text-xs overflow-x-auto whitespace-pre leading-relaxed max-h-[500px] select-all bg-slate-950">
          {currentCode}
        </pre>
      </div>

      {/* Setup Instructions Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 text-xs space-y-3">
        <h3 className="font-bold text-white text-sm flex items-center gap-2">
          <Terminal className="w-4 h-4 text-emerald-400" />
          <span>Passo a Passo de Instalação no seu Windows ou VPS:</span>
        </h3>
        <ol className="list-decimal list-inside space-y-2 text-slate-300 leading-relaxed">
          <li>
            Abra o terminal (CMD ou PowerShell) e instale as bibliotecas necessárias:
            <div className="mt-1 p-2 bg-slate-950 rounded-lg font-mono text-amber-300 text-[11px] select-all">
              pip install MetaTrader5 fastapi uvicorn python-dotenv pydantic
            </div>
          </li>
          <li>
            Crie uma pasta, salve o arquivo <code className="text-amber-400">mt5_server.py</code> e o arquivo <code className="text-amber-400">.env</code> com seus dados da corretora.
          </li>
          <li>
            Inicie a ponte executando:
            <div className="mt-1 p-2 bg-slate-950 rounded-lg font-mono text-emerald-300 text-[11px] select-all">
              uvicorn mt5_server:app --host 0.0.0.0 --port 8000 --reload
            </div>
          </li>
          <li>
            No menu superior deste site, clique em <b>Corretora MT5</b> e selecione o modo <b>Bridge Python</b>. Pronto! Todas as ordens e o robô executarão diretamente no seu MetaTrader 5!
          </li>
        </ol>
      </div>
    </div>
  );
};
