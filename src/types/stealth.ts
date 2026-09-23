export interface StealthShieldConfig {
  enabled: boolean;
  virtualStopsEnabled: boolean; // Hide SL/TP from broker book; execute on client tick
  jitterEnabled: boolean; // Randomize millisecond delay (15-55ms) to mask robotic HFT patterns
  minJitterMs: number;
  maxJitterMs: number;
  spreadSpikeFilter: boolean; // Halt or widen threshold if broker spread spikes unnaturally
  maxAllowedSpreadPips: number;
  antiPatternMasking: boolean; // Subtly vary micro-lots to defeat LP toxicity scoring algorithms
  autoHeartbeatRetry: boolean; // Keepalive ping and auto-reconnect on socket disconnect
  proxyFailoverEnabled: boolean; // Route through low-latency fallback relays
  customProxyServer?: string;
  stealthLevel: 'STANDARD' | 'MAXIMUM_BLINDAGEM';
  lastInterception?: {
    time: string;
    type: 'VIRTUAL_SL_TRIGGERED' | 'SPREAD_SPIKE_BLOCKED' | 'JITTER_APPLIED' | 'HEARTBEAT_SAVED';
    details: string;
  };
}

export const DEFAULT_STEALTH_SHIELD: StealthShieldConfig = {
  enabled: true,
  virtualStopsEnabled: true,
  jitterEnabled: true,
  minJitterMs: 14,
  maxJitterMs: 48,
  spreadSpikeFilter: true,
  maxAllowedSpreadPips: 15.0, // Spread Máximo 15
  antiPatternMasking: true,
  autoHeartbeatRetry: true,
  proxyFailoverEnabled: true,
  stealthLevel: 'MAXIMUM_BLINDAGEM',
};
