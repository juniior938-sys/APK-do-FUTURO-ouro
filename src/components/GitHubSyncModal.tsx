import React, { useState } from 'react';
import {
  X,
  Github,
  GitBranch,
  Copy,
  Check,
  Download,
  AlertCircle,
  ExternalLink,
  ShieldAlert,
  Terminal,
  HelpCircle,
  FolderArchive,
  Key,
} from 'lucide-react';
import JSZip from 'jszip';

interface GitHubSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GitHubSyncModal: React.FC<GitHubSyncModalProps> = ({ isOpen, onClose }) => {
  const [repoUrl, setRepoUrl] = useState<string>('');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [isZipping, setIsZipping] = useState<boolean>(false);
  const [authMethod, setAuthMethod] = useState<'token' | 'ssh' | 'desktop'>('token');

  if (!isOpen) return null;

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(id);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const cleanRepoUrl = repoUrl.trim().replace(/\/$/, '');
  const urlToUse = cleanRepoUrl || 'https://github.com/SEU-USUARIO/NOME-DO-REPOSITORIO.git';

  // Commands
  const initAndPushCommands = `# 1. Acesse a pasta do projeto no seu terminal
# 2. Inicialize e adicione todos os arquivos:
git init
git add .
git commit -m "feat: MT5 Algo Scalper com Multi-Corretora, Pares e Anti-Bloqueio"
git branch -M main

# 3. Vincule ao seu repositório no GitHub:
git remote remove origin 2>/dev/null
git remote add origin ${urlToUse}

# 4. Envie o código para o GitHub:
git push -u origin main --force`;

  const tokenPushExample = `# Quando o Git pedir senha, NUNCA use a senha comum da sua conta GitHub!
# O GitHub exige um Personal Access Token (PAT):
# Username: seu_usuario_github
# Password: ghp_xxxxxxxxxxxxxxxxxxxx (Seu Personal Access Token com permissão 'repo')`;

  // Download project ZIP client-side
  const handleDownloadZip = async () => {
    try {
      setIsZipping(true);
      const zip = new JSZip();

      // Core config files
      const fileList = [
        'package.json',
        'tsconfig.json',
        'vite.config.ts',
        'index.html',
        'metadata.json',
        '.gitignore',
        '.env.example',
        'src/main.tsx',
        'src/App.tsx',
        'src/index.css',
        'src/types/mt5.ts',
        'src/types/hft.ts',
        'src/types/stealth.ts',
        'src/types/symbols.ts',
        'src/utils/goldMath.ts',
        'src/utils/pdfReportGenerator.ts',
        'src/utils/promptTemplate.ts',
        'src/services/marketData.ts',
        'src/services/hftEngine.ts',
        'src/hooks/usePWAInstall.ts',
        'src/components/Header.tsx',
        'src/components/HFTCockpit.tsx',
        'src/components/TradesTimelineChart.tsx',
        'src/components/DailyPerformanceModal.tsx',
        'src/components/StealthShieldModal.tsx',
        'src/components/AndroidApkModal.tsx',
        'src/components/PairSelector.tsx',
        'src/components/BrokerModal.tsx',
        'src/components/PositionsTable.tsx',
        'src/components/XAUUSDChart.tsx',
        'src/components/OrderPanel.tsx',
        'src/components/BotEnginePanel.tsx',
        'src/components/PromptCorrectionTab.tsx',
        'src/components/Mt5BridgeCodeModal.tsx',
        'src/components/AccountSummary.tsx',
        'src/components/GitHubSyncModal.tsx',
        'public/icon.svg',
      ];

      for (const filePath of fileList) {
        try {
          const res = await fetch(`/${filePath}`);
          if (res.ok) {
            const content = await res.text();
            zip.file(filePath, content);
          }
        } catch {
          // ignore individual missing files
        }
      }

      // Add a helpful README.md
      zip.file(
        'README.md',
        `# MT5 Algo Scalper & HFT Engine

Terminal profissional de alta frequência e scalping para MetaTrader 5 com suporte a:
- Conexão com qualquer corretora (Exness, IC Markets, XM, FBS, etc.)
- Multi-paridades: Ouro (XAUUSD), Forex, Cripto e Índices
- Blindagem anti-bloqueio com stops invisíveis, anti-spike e micro-jitter
- Aplicativo Android com Google WebAPK e suporte a compilação Capacitor
- Relatório de performance 24H com exportação PDF

## Como Rodar Localmente

\`\`\`bash
npm install
npm run dev
\`\`\`
`
      );

      const blob = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'mt5-algo-scalper-source.zip';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to generate zip:', err);
      alert('Não foi possível gerar o ZIP automaticamente. Use os comandos do terminal ao lado.');
    } finally {
      setIsZipping(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden text-slate-100 flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between bg-gradient-to-r from-slate-900 via-slate-800/80 to-slate-900">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center text-white shadow-inner">
              <Github className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white">Enviar Projeto para o GitHub</h2>
                <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-semibold">
                  Git Repositório Pronto
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Solução para os erros mais comuns de envio, autenticação e vinculação de repositório
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-4 overflow-y-auto flex-1 text-xs">
          {/* Main Error Explanation Banner */}
          <div className="p-4 rounded-xl border border-amber-500/30 bg-amber-950/20 space-y-2">
            <div className="flex items-center gap-2 text-amber-300 font-bold text-sm">
              <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
              <span>Por que o Git costuma falhar ao enviar para o GitHub?</span>
            </div>
            <p className="text-slate-300 text-xs leading-relaxed">
              O motivo mais comum de erro é que <b>o GitHub desativou o login por senha comum</b> no terminal. Se você digitar sua senha normal do GitHub, o terminal retornará erro de <code className="text-rose-400 font-mono">Authentication failed</code> ou <code className="text-rose-400 font-mono">Support for password authentication was removed</code>.
            </p>
          </div>

          {/* Quick Repo URL Input */}
          <div className="space-y-1.5 bg-slate-950 p-3.5 rounded-xl border border-slate-800">
            <label className="block text-slate-200 font-semibold text-xs flex items-center justify-between">
              <span>Cole a URL do seu Repositório no GitHub:</span>
              <a
                href="https://github.com/new"
                target="_blank"
                rel="noreferrer"
                className="text-amber-400 hover:text-amber-300 flex items-center gap-1 text-[11px]"
              >
                <span>Criar Novo Repositório no GitHub</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </label>
            <input
              type="text"
              value={repoUrl}
              onChange={(e) => setRepoUrl(e.target.value)}
              placeholder="Ex: https://github.com/juniior9388/gold-scalper-mt5.git"
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 font-mono text-xs focus:outline-none focus:border-amber-500 placeholder-slate-600"
            />
          </div>

          {/* Tabs for Methods */}
          <div className="flex border-b border-slate-800 gap-3 text-xs pt-1">
            <button
              onClick={() => setAuthMethod('token')}
              className={`pb-2 font-semibold flex items-center gap-1.5 transition-colors border-b-2 ${
                authMethod === 'token'
                  ? 'border-amber-400 text-amber-300'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Key className="w-3.5 h-3.5" />
              <span>1. Com Personal Access Token (Recomendado)</span>
            </button>
            <button
              onClick={() => setAuthMethod('desktop')}
              className={`pb-2 font-semibold flex items-center gap-1.5 transition-colors border-b-2 ${
                authMethod === 'desktop'
                  ? 'border-emerald-400 text-emerald-300'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <FolderArchive className="w-3.5 h-3.5" />
              <span>2. Baixar .ZIP / GitHub Desktop</span>
            </button>
          </div>

          {authMethod === 'token' ? (
            <div className="space-y-3">
              {/* Step 1: Token Generation Guide */}
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2 text-slate-300">
                <div className="font-bold text-slate-100 flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center text-[10px] font-mono">1</span>
                  <span>Gere o Token de Acesso no GitHub (Leva 1 minuto):</span>
                </div>
                <ol className="list-decimal list-inside space-y-1 text-slate-400 text-xs pl-1">
                  <li>
                    Acesse{' '}
                    <a
                      href="https://github.com/settings/tokens/new"
                      target="_blank"
                      rel="noreferrer"
                      className="text-amber-400 underline underline-offset-2"
                    >
                      github.com/settings/tokens/new
                    </a>
                  </li>
                  <li>Dê um nome para o token (ex: <i>MT5 Trader Token</i>).</li>
                  <li>Marque a caixinha principal <b className="text-white">repo</b> (Acesso total a repositórios).</li>
                  <li>Clique no botão verde <b className="text-white">Generate token</b> no rodapé.</li>
                  <li>Copie o código gerado que começa com <code className="text-amber-400 font-mono">ghp_...</code>.</li>
                </ol>
              </div>

              {/* Step 2: Commands to Run */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-200 flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center text-[10px] font-mono">2</span>
                    <span>Copie e cole estes comandos no seu Terminal:</span>
                  </span>
                  <button
                    onClick={() => handleCopy(initAndPushCommands, 'init')}
                    className="flex items-center gap-1 text-amber-400 hover:text-amber-300 font-mono text-[11px]"
                  >
                    {copiedKey === 'init' ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-400 font-sans font-bold">Copiado!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copiar Comandos</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="rounded-xl bg-slate-950 border border-slate-800 p-3 overflow-x-auto">
                  <pre className="font-mono text-[11px] text-emerald-400 whitespace-pre leading-relaxed">
                    {initAndPushCommands}
                  </pre>
                </div>
              </div>

              {/* Step 3: Auth hint */}
              <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1 text-slate-400">
                <div className="font-semibold text-slate-300 text-xs">Na hora de enviar:</div>
                <p>• Quando o Git pedir <b>Username</b>: Digite seu usuário do GitHub.</p>
                <p>• Quando o Git pedir <b>Password</b>: Cole o token <code className="text-amber-400 font-mono">ghp_...</code> que você gerou.</p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="space-y-1">
                  <div className="font-bold text-slate-200 text-sm flex items-center gap-2">
                    <FolderArchive className="w-4 h-4 text-emerald-400" />
                    <span>Baixar o Código em Arquivo .ZIP (Sem Erro de Terminal)</span>
                  </div>
                  <p className="text-slate-400 text-xs leading-relaxed">
                    Se você não quer usar linha de comando ou continuar tendo problemas com permissão no terminal, você pode baixar o arquivo <code className="text-amber-400 font-mono">.zip</code> completo do projeto com 1 clique e subir diretamente pelo site do GitHub ou usando o <b>GitHub Desktop</b>.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleDownloadZip}
                  disabled={isZipping}
                  className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 transition-all active:scale-98 disabled:opacity-50 text-xs cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>{isZipping ? 'Compactando arquivos do projeto...' : 'Baixar Arquivo .ZIP do Código Agora'}</span>
                </button>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2 text-slate-300">
                <div className="font-bold text-white text-xs">Como subir o .ZIP no GitHub pelo Navegador:</div>
                <ol className="list-decimal list-inside space-y-1.5 text-slate-400 text-xs">
                  <li>Extraia a pasta do arquivo <b>mt5-algo-scalper-source.zip</b> no seu computador.</li>
                  <li>Acesse o repositório que você criou em <a href="https://github.com" target="_blank" rel="noreferrer" className="text-amber-400 underline">github.com</a>.</li>
                  <li>Clique no botão <b>Add file &gt; Upload files</b>.</li>
                  <li>Arraste todos os arquivos da pasta extraída para dentro do GitHub e clique em <b>Commit changes</b>!</li>
                </ol>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-2 text-[11px] text-slate-400">
            <GitBranch className="w-3.5 h-3.5 text-amber-400" />
            <span>Branch principal: <b className="text-white font-mono">main</b></span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium transition-colors text-xs"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
