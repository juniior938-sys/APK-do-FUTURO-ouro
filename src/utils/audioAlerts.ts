import { AlertSoundSettings, SoundNoiseLevel, MarketNoiseFilter } from '../types/signals';

// High-Tech Web Audio API Synthesizer for Institutional Trading Alerts

class TradingAudioEngine {
  private ctx: AudioContext | null = null;
  private enabled: boolean = true;
  private volume: number = 0.5;
  private noiseLevel: SoundNoiseLevel = 'medium';
  private marketNoiseFilter: MarketNoiseFilter = 'all';
  private buySoundEnabled: boolean = true;
  private sellSoundEnabled: boolean = true;
  private tpSoundEnabled: boolean = true;
  private slSoundEnabled: boolean = true;
  private newsSoundEnabled: boolean = true;

  constructor() {
    try {
      const savedEnabled = localStorage.getItem('trading_audio_enabled');
      if (savedEnabled !== null) {
        this.enabled = savedEnabled === 'true';
      }
      const savedVol = localStorage.getItem('trading_audio_volume');
      if (savedVol !== null) {
        this.volume = parseFloat(savedVol);
      }
      const savedNoise = localStorage.getItem('trading_noise_level') as SoundNoiseLevel;
      if (savedNoise) {
        this.noiseLevel = savedNoise;
      }
      const savedFilter = localStorage.getItem('trading_market_noise_filter') as MarketNoiseFilter;
      if (savedFilter) {
        this.marketNoiseFilter = savedFilter;
      }
      const savedSettings = localStorage.getItem('trading_sound_settings');
      if (savedSettings) {
        const parsed = JSON.parse(savedSettings);
        if (parsed.buySoundEnabled !== undefined) this.buySoundEnabled = parsed.buySoundEnabled;
        if (parsed.sellSoundEnabled !== undefined) this.sellSoundEnabled = parsed.sellSoundEnabled;
        if (parsed.tpSoundEnabled !== undefined) this.tpSoundEnabled = parsed.tpSoundEnabled;
        if (parsed.slSoundEnabled !== undefined) this.slSoundEnabled = parsed.slSoundEnabled;
        if (parsed.newsSoundEnabled !== undefined) this.newsSoundEnabled = parsed.newsSoundEnabled;
      }
    } catch {
      this.enabled = true;
      this.volume = 0.5;
      this.noiseLevel = 'medium';
    }
  }

  private initContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  public isEnabled(): boolean {
    return this.enabled;
  }

  public setEnabled(enabled: boolean) {
    this.enabled = enabled;
    if (!enabled) {
      this.noiseLevel = 'mute';
    } else if (this.noiseLevel === 'mute') {
      this.noiseLevel = 'medium';
    }
    try {
      localStorage.setItem('trading_audio_enabled', enabled ? 'true' : 'false');
      localStorage.setItem('trading_noise_level', this.noiseLevel);
    } catch {}
    if (enabled) {
      this.playTestBeep();
    }
  }

  public getVolume(): number {
    return this.volume;
  }

  public setVolume(val: number) {
    this.volume = Math.max(0, Math.min(1, val));
    if (this.volume === 0) {
      this.noiseLevel = 'mute';
      this.enabled = false;
    } else if (this.volume <= 0.3) {
      this.noiseLevel = 'low';
      this.enabled = true;
    } else if (this.volume <= 0.7) {
      this.noiseLevel = 'medium';
      this.enabled = true;
    } else {
      this.noiseLevel = 'high';
      this.enabled = true;
    }
    try {
      localStorage.setItem('trading_audio_volume', this.volume.toString());
      localStorage.setItem('trading_audio_enabled', this.enabled ? 'true' : 'false');
      localStorage.setItem('trading_noise_level', this.noiseLevel);
    } catch {}
  }

  public getNoiseLevel(): SoundNoiseLevel {
    return this.noiseLevel;
  }

  public setNoiseLevel(level: SoundNoiseLevel) {
    this.noiseLevel = level;
    if (level === 'mute') {
      this.enabled = false;
      this.volume = 0;
    } else if (level === 'low') {
      this.enabled = true;
      this.volume = 0.25;
    } else if (level === 'medium') {
      this.enabled = true;
      this.volume = 0.55;
    } else if (level === 'high') {
      this.enabled = true;
      this.volume = 0.95;
    }
    try {
      localStorage.setItem('trading_noise_level', this.noiseLevel);
      localStorage.setItem('trading_audio_enabled', this.enabled ? 'true' : 'false');
      localStorage.setItem('trading_audio_volume', this.volume.toString());
    } catch {}
    if (this.enabled) {
      this.playTestBeep();
    }
  }

  public getMarketNoiseFilter(): MarketNoiseFilter {
    return this.marketNoiseFilter;
  }

  public setMarketNoiseFilter(filter: MarketNoiseFilter) {
    this.marketNoiseFilter = filter;
    try {
      localStorage.setItem('trading_market_noise_filter', filter);
    } catch {}
  }

  public getSettings(): AlertSoundSettings {
    return {
      noiseLevel: this.noiseLevel,
      volume: this.volume,
      marketNoiseFilter: this.marketNoiseFilter,
      buySoundEnabled: this.buySoundEnabled,
      sellSoundEnabled: this.sellSoundEnabled,
      tpSoundEnabled: this.tpSoundEnabled,
      slSoundEnabled: this.slSoundEnabled,
      newsSoundEnabled: this.newsSoundEnabled,
    };
  }

  public updateSettings(partial: Partial<AlertSoundSettings>) {
    if (partial.noiseLevel !== undefined) this.setNoiseLevel(partial.noiseLevel);
    if (partial.volume !== undefined) this.setVolume(partial.volume);
    if (partial.marketNoiseFilter !== undefined) this.setMarketNoiseFilter(partial.marketNoiseFilter);
    if (partial.buySoundEnabled !== undefined) this.buySoundEnabled = partial.buySoundEnabled;
    if (partial.sellSoundEnabled !== undefined) this.sellSoundEnabled = partial.sellSoundEnabled;
    if (partial.tpSoundEnabled !== undefined) this.tpSoundEnabled = partial.tpSoundEnabled;
    if (partial.slSoundEnabled !== undefined) this.slSoundEnabled = partial.slSoundEnabled;
    if (partial.newsSoundEnabled !== undefined) this.newsSoundEnabled = partial.newsSoundEnabled;

    try {
      localStorage.setItem(
        'trading_sound_settings',
        JSON.stringify({
          buySoundEnabled: this.buySoundEnabled,
          sellSoundEnabled: this.sellSoundEnabled,
          tpSoundEnabled: this.tpSoundEnabled,
          slSoundEnabled: this.slSoundEnabled,
          newsSoundEnabled: this.newsSoundEnabled,
        })
      );
    } catch {}
  }

  // ALERTA DE ENTRADA (COMPRA): Tom ascendente cristalino e enérgico
  public playEntryBuy() {
    if (!this.enabled || !this.buySoundEnabled) return;
    const ctx = this.initContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6 (Acorde Maior Ascendente)

    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + idx * 0.07);

      gain.gain.setValueAtTime(0, now + idx * 0.07);
      gain.gain.linearRampToValueAtTime(0.25 * this.volume, now + idx * 0.07 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.07 + 0.22);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + idx * 0.07);
      osc.stop(now + idx * 0.07 + 0.25);
    });
  }

  // ALERTA DE ENTRADA (VENDA): Tom focado descendente
  public playEntrySell() {
    if (!this.enabled || !this.sellSoundEnabled) return;
    const ctx = this.initContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const notes = [880.00, 783.99, 659.25, 523.25]; // A5, G5, E5, C5 (Descendente Rápido)

    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, now + idx * 0.07);

      gain.gain.setValueAtTime(0, now + idx * 0.07);
      gain.gain.linearRampToValueAtTime(0.18 * this.volume, now + idx * 0.07 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.07 + 0.22);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + idx * 0.07);
      osc.stop(now + idx * 0.07 + 0.25);
    });
  }

  // ALERTA DE SAÍDA (TAKE PROFIT): Toque festivo duplo triunfante
  public playTakeProfit() {
    if (!this.enabled || !this.tpSoundEnabled) return;
    const ctx = this.initContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const freqs = [1046.50, 1318.51, 1567.98]; // C6, E6, G6

    freqs.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.09);

      gain.gain.setValueAtTime(0, now + idx * 0.09);
      gain.gain.linearRampToValueAtTime(0.3 * this.volume, now + idx * 0.09 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.09 + 0.35);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + idx * 0.09);
      osc.stop(now + idx * 0.09 + 0.38);
    });
  }

  // ALERTA DE SAÍDA (STOP LOSS / SAÍDA DE EMERGÊNCIA): Tom duplo de proteção
  public playStopLoss() {
    if (!this.enabled || !this.slSoundEnabled) return;
    const ctx = this.initContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const notes = [349.23, 293.66]; // F4, D4

    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'square';
      osc.frequency.setValueAtTime(freq, now + idx * 0.14);

      gain.gain.setValueAtTime(0, now + idx * 0.14);
      gain.gain.linearRampToValueAtTime(0.15 * this.volume, now + idx * 0.14 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.14 + 0.25);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + idx * 0.14);
      osc.stop(now + idx * 0.14 + 0.28);
    });
  }

  // ALERTA DE NOTÍCIA (FOREX FACTORY / DAILYFX RED FOLDER): Alerta de pulso triplo
  public playNewsWarning() {
    if (!this.enabled || !this.newsSoundEnabled) return;
    const ctx = this.initContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    [660, 660, 660].forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.12);

      gain.gain.setValueAtTime(0, now + idx * 0.12);
      gain.gain.linearRampToValueAtTime(0.2 * this.volume, now + idx * 0.12 + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.12 + 0.09);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + idx * 0.12);
      osc.stop(now + idx * 0.12 + 0.10);
    });
  }

  // Permite testar o som do sintetizador mesmo se estiver silenciado no filtro
  public forceTestSound(type: 'buy' | 'sell' | 'tp' | 'sl' | 'news') {
    const prevEnabled = this.enabled;
    const prevVol = this.volume;
    this.enabled = true;
    if (this.volume === 0) this.volume = 0.5;

    const ctx = this.initContext();
    if (!ctx) return;

    if (type === 'buy') {
      const now = ctx.currentTime;
      [523.25, 659.25, 783.99, 1046.50].forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + idx * 0.07);
        gain.gain.setValueAtTime(0, now + idx * 0.07);
        gain.gain.linearRampToValueAtTime(0.25 * this.volume, now + idx * 0.07 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.07 + 0.22);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + idx * 0.07);
        osc.stop(now + idx * 0.07 + 0.25);
      });
    } else if (type === 'sell') {
      const now = ctx.currentTime;
      [880.00, 783.99, 659.25, 523.25].forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(freq, now + idx * 0.07);
        gain.gain.setValueAtTime(0, now + idx * 0.07);
        gain.gain.linearRampToValueAtTime(0.18 * this.volume, now + idx * 0.07 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.07 + 0.22);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + idx * 0.07);
        osc.stop(now + idx * 0.07 + 0.25);
      });
    } else if (type === 'tp') {
      const now = ctx.currentTime;
      [1046.50, 1318.51, 1567.98].forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.09);
        gain.gain.setValueAtTime(0, now + idx * 0.09);
        gain.gain.linearRampToValueAtTime(0.3 * this.volume, now + idx * 0.09 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.09 + 0.35);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + idx * 0.09);
        osc.stop(now + idx * 0.09 + 0.38);
      });
    } else if (type === 'sl') {
      const now = ctx.currentTime;
      [349.23, 293.66].forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(freq, now + idx * 0.14);
        gain.gain.setValueAtTime(0, now + idx * 0.14);
        gain.gain.linearRampToValueAtTime(0.15 * this.volume, now + idx * 0.14 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.14 + 0.25);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + idx * 0.14);
        osc.stop(now + idx * 0.14 + 0.28);
      });
    } else if (type === 'news') {
      const now = ctx.currentTime;
      [660, 660, 660].forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.12);
        gain.gain.setValueAtTime(0, now + idx * 0.12);
        gain.gain.linearRampToValueAtTime(0.2 * this.volume, now + idx * 0.12 + 0.01);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.12 + 0.09);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + idx * 0.12);
        osc.stop(now + idx * 0.12 + 0.10);
      });
    }

    // Restore previous state if it was mute
    if (!prevEnabled) {
      setTimeout(() => {
        this.enabled = prevEnabled;
        this.volume = prevVol;
      }, 500);
    }
  }

  public playTestBeep() {
    const ctx = this.initContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, now);
    gain.gain.setValueAtTime(0.15 * this.volume, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.15);
  }
}

export const audioAlerts = new TradingAudioEngine();
