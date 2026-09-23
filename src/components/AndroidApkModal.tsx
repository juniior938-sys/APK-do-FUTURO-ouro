import React, { useState } from 'react';
import { X, Smartphone, Download, CheckCircle2, ShieldCheck, Sparkles, Terminal, Copy, Check, ExternalLink, Play } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface AndroidApkModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AndroidApkModal: React.FC<AndroidApkModalProps> = ({ isOpen, onClose }) => {
  const { isInstallable, isInstalled, isAndroid, isIOS, install } = usePWAInstall();
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'instant' | 'raw_apk'>('instant');

  if (!isOpen) return null;

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(id);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleDirectInstall = async () => {
    if (isInstallable) {
      const ok = await install();
      if (ok) {
        onClose();
      }
    }
  };

  const capacitorCode = `# 1. Instalar Capacitor para compilar APK Android nativo:
npm install @capacitor/core @capacitor/cli @capacitor/android

# 2. Inicializar o projeto Android:
npx cap init "Gold Scalper AI" "com.goldhft.trader" --web-dir dist

# 3. Compilar a aplicação:
npm run build

# 4. Adicionar a plataforma Android:
npx cap add android
npx cap copy

# 5. Abrir no Android Studio e gerar APK Release assinado:
npx cap open android
# No Android Studio: Build > Generate Signed Bundle / APK > APK (debug ou release)`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden text-slate-100 flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between bg-gradient-to-r from-emerald-950/40 via-slate-900 to-amber-950/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-inner">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white">Aplicativo Android (APK & WebAPK)</h2>
                <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-semibold">
                  Nativo Android
                </span>
              </div>
              <p className="text-xs text-slate-400">Instalação direta no smartphone ou exportação de pacote APK para distribuição</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab selection */}
        <div className="flex border-b border-slate-800 px-5 pt-3 gap-3 bg-slate-950/40 text-xs">
          <button
            onClick={() => setActiveTab('instant')}
            className={`pb-2.5 font-semibold flex items-center gap-1.5 transition-colors border-b-2 ${
              activeTab === 'instant'
                ? 'border-emerald-400 text-emerald-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Download className="w-3.5 h-3.5" />
            <span>1-Clique Instalação Android (WebAPK)</span>
          </button>
          <button
            onClick={() => setActiveTab('raw_apk')}
            className={`pb-2.5 font-semibold flex items-center gap-1.5 transition-colors border-b-2 ${
              activeTab === 'raw_apk'
                ? 'border-amber-400 text-amber-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>Gerar APK Standalone (.apk com Capacitor)</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-4 overflow-y-auto flex-1 text-xs">
          {activeTab === 'instant' ? (
            <div className="space-y-4">
              {/* Status Banner */}
              <div className="p-4 rounded-xl border border-emerald-500/30 bg-emerald-950/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-emerald-300 font-bold text-sm">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Pronto para Instalação no Android</span>
                  </div>
                  <p className="text-slate-300 text-xs leading-relaxed">
                    O Android usa a tecnologia oficial <b>Google WebAPK</b> para transformar este terminal em um aplicativo nativo completo instalado diretamente no seu celular (sem barra de navegador).
                  </p>
                </div>
                {isInstallable ? (
                  <button
                    onClick={handleDirectInstall}
                    className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 transition-all shrink-0 active:scale-95"
                  >
                    <Download className="w-4 h-4" />
                    <span>Instalar APK Agora</span>
                  </button>
                ) : isInstalled ? (
                  <span className="px-3 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-semibold flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5" /> App Já Instalado
                  </span>
                ) : (
                  <button
                    onClick={() => {
                      alert('Para instalar no Android pelo Chrome: toque nos 3 pontinhos (⋮) do navegador e selecione "Instalar aplicativo" ou "Adicionar à tela inicial".');
                    }}
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium flex items-center justify-center gap-1.5 transition-colors shrink-0"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Ver Como Instalar</span>
                  </button>
                )}
              </div>

              {/* Benefits of the Android App */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                  <div className="text-amber-400 font-bold flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Tela Cheia & 0 Lag</span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Roda em modo standalone sem menus de URL do navegador, com máxima taxa de quadros e baixa latência de toque.
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                  <div className="text-emerald-400 font-bold flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Cache Offline & PWA</span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    O Service Worker armazena recursos em cache e reconecta automaticamente à corretora em oscilações 4G/5G.
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                  <div className="text-sky-400 font-bold flex items-center gap-1.5">
                    <Smartphone className="w-3.5 h-3.5" />
                    <span>Ícone na Gaveta de Apps</span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Cria ícone com branding dourado nativo com suporte a toque longo e notificações do robô HFT.
                  </p>
                </div>
              </div>

              {/* Passo a Passo no Android Chrome */}
              <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2.5">
                <h3 className="font-bold text-slate-200 text-xs uppercase tracking-wider flex items-center gap-2">
                  <span>Passo a Passo Rápido no Celular:</span>
                </h3>
                <ol className="list-decimal list-inside space-y-1.5 text-slate-300 text-xs">
                  <li>Abra o link desta aplicação no <b>Google Chrome</b> do seu celular Android.</li>
                  <li>Clique no banner flutuante ou no botão <b>"Instalar App Android"</b> na barra superior.</li>
                  <li>Ou abra o menu de opções do Chrome tocando nos <b>3 pontinhos (⋮)</b> no topo direito.</li>
                  <li>Selecione <b>"Instalar aplicativo"</b> (ou "Adicionar à tela principal").</li>
                  <li>O Android compila e instala o WebAPK instantaneamente na sua lista de apps!</li>
                </ol>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-slate-300 text-xs leading-relaxed space-y-1">
                <div className="font-bold text-amber-300 flex items-center gap-2">
                  <Terminal className="w-4 h-4" />
                  <span>Compilação de APK Standalone (.apk / .aab)</span>
                </div>
                <p className="text-slate-400 text-[11px]">
                  Caso deseje gerar um arquivo binário <code className="text-amber-400 font-mono">app-release.apk</code> para enviar via WhatsApp, Telegram ou publicar na Google Play Store, você pode usar o <b>Capacitor da Ionic</b>:
                </p>
              </div>

              {/* Code block */}
              <div className="relative rounded-xl bg-slate-950 border border-slate-800 overflow-hidden">
                <div className="px-4 py-2 bg-slate-900/80 border-b border-slate-800 flex items-center justify-between text-[11px] text-slate-400 font-mono">
                  <span>Terminal (Linux / Mac / Windows Bash)</span>
                  <button
                    onClick={() => handleCopy(capacitorCode, 'capacitor')}
                    className="flex items-center gap-1 text-slate-300 hover:text-white transition-colors"
                  >
                    {copiedCode === 'capacitor' ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-400">Copiado</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copiar Comandos</span>
                      </>
                    )}
                  </button>
                </div>
                <pre className="p-4 text-[11px] font-mono text-emerald-400 overflow-x-auto whitespace-pre leading-relaxed">
                  {capacitorCode}
                </pre>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
                <span>Alternativa online sem instalar Android Studio: use a ferramenta oficial do Google <b>Bubblewrap / PWA2APK</b>.</span>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-2 text-[11px] text-slate-400">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Manifest V3 e Service Worker 100% integrados</span>
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
