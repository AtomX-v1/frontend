'use client';

import { useState, useEffect, useRef } from 'react';
import ArbitrageCard from '@/components/ArbitrageCard';
import { ArbitrageOpportunity } from '@/types';
import { useArbitrage } from '@/hooks/useArbitrage';

interface LogEntry {
  timestamp: string;
  type: 'info' | 'success' | 'error' | 'scan';
  message: string;
}

export default function ArbitragePage() {
  const connected = false;
  const [minProfit, setMinProfit] = useState(-10);
  const [enableScan, setEnableScan] = useState(false);
  const { opportunities, loading, refresh } = useArbitrage(minProfit, enableScan);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [scanCount, setScanCount] = useState(0);
  const [bootComplete, setBootComplete] = useState(false);
  const logsEndRef = useRef<HTMLDivElement>(null);
  const [networkLatency, setNetworkLatency] = useState(0);

  const addLog = (type: LogEntry['type'], message: string) => {
    const timestamp = new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
    setLogs(prev => [...prev.slice(-50), { timestamp, type, message }]);
  };

  useEffect(() => {
    const bootSequence = async () => {
      const messages = [
        'INITIALIZING ATOMX TERMINAL v2.1.0',
        'LOADING SOLANA MAINNET RPC CONNECTION',
        'CONNECTING TO JUPITER AGGREGATOR V6',
        'INITIALIZING ARBITRAGE DETECTION ENGINE',
        'LOADING DEX LIQUIDITY POOLS',
        'CALIBRATING PROFIT CALCULATION MATRIX',
        'ESTABLISHING WEBSOCKET CONNECTIONS',
        'SYSTEM READY - MAINNET ARBITRAGE SCANNER ONLINE'
      ];

      for (let i = 0; i < messages.length; i++) {
        await new Promise(resolve => setTimeout(resolve, 150));
        addLog('info', messages[i]);
      }
      setBootComplete(true);
      addLog('success', 'SCANNER READY - CLICK [SCAN] TO START');
    };

    bootSequence();
  }, []);

  useEffect(() => {
    if (bootComplete && enableScan && opportunities.length > 0) {
      setScanCount(prev => prev + 1);
      addLog('scan', `SCAN #${scanCount + 1} COMPLETED - FOUND ${opportunities.length} ROUTES`);

      const profitable = opportunities.filter(o => o.profitPercentage > 0.1);
      if (profitable.length > 0) {
        addLog('success', `DETECTED ${profitable.length} PROFITABLE OPPORTUNITIES`);
      } else {
        addLog('info', `FOUND ${opportunities.length} ROUTES - SHOWING ALL PATHS`);
      }
    }
  }, [opportunities, bootComplete]);

  useEffect(() => {
    const measureLatency = async () => {
      const start = performance.now();
      try {
        await fetch('https://quote-api.jup.ag/v6/quote?inputMint=So11111111111111111111111111111111111111112&outputMint=EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v&amount=1000000&onlyDirectRoutes=true');
        const latency = Math.round(performance.now() - start);
        setNetworkLatency(latency);
      } catch {
        setNetworkLatency(999);
      }
    };

    measureLatency();
    const interval = setInterval(measureLatency, 10000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  const handleRefresh = async () => {
    if (!enableScan) setEnableScan(true);
    addLog('scan', 'MANUAL SCAN INITIATED - ANALYZING MARKET');
    await refresh();
  };

  const executeArbitrage = async (opportunity: ArbitrageOpportunity) => {
    if (!connected) {
      addLog('error', 'WALLET NOT CONNECTED - EXECUTION ABORTED');
      return;
    }

    try {
      addLog('info', `EXECUTING ARBITRAGE: ${opportunity.id.substring(0, 8)}`);

      const { getJupiterQuote } = await import('@/lib/jupiter');

      for (let i = 0; i < opportunity.path.length; i++) {
        const step = opportunity.path[i];
        const amountIn = i === 0
          ? Math.floor(opportunity.requiredAmount * Math.pow(10, step.from.decimals))
          : Math.floor(step.expectedOutput * Math.pow(10, step.from.decimals));

        const quote = await getJupiterQuote(
          step.from.mint,
          step.to.mint,
          amountIn
        );

        if (!quote) {
          throw new Error(`QUOTE FAILED FOR STEP ${i + 1}`);
        }

        addLog('info', `STEP ${i + 1}: ${step.from.symbol} -> ${step.to.symbol} [${step.dex.toUpperCase()}]`);
      }

      addLog('success', `TX READY - PROFIT: $${opportunity.estimatedProfit.toFixed(2)}`);
    } catch (error) {
      addLog('error', `EXECUTION FAILED: ${error instanceof Error ? error.message : 'UNKNOWN'}`);
    }
  };

  const profitableOps = opportunities.filter((op) => op.profitPercentage > 0.1);
  const totalPotentialProfit = profitableOps.reduce((sum, op) => sum + op.estimatedProfit, 0);

  return (
    <div className="min-h-screen p-4 md:p-6">
      <div className="max-w-[1800px] mx-auto">
        <div className="cyber-card p-6 mb-6 bg-black/90 backdrop-blur-sm">
          <pre className="text-[11px] md:text-sm text-[#00cc00] leading-tight mb-4 overflow-x-auto">
{`
 █████╗ ████████╗ ██████╗ ███╗   ███╗██╗  ██╗
██╔══██╗╚══██╔══╝██╔═══██╗████╗ ████║╚██╗██╔╝
███████║   ██║   ██║   ██║██╔████╔██║ ╚███╔╝
██╔══██║   ██║   ██║   ██║██║╚██╔╝██║ ██╔██╗
██║  ██║   ██║   ╚██████╔╝██║ ╚═╝ ██║██╔╝ ██╗
╚═╝  ╚═╝   ╚═╝    ╚═════╝ ╚═╝     ╚═╝╚═╝  ╚═╝

      MAINNET ARBITRAGE SCANNER // EXECUTION PROTOCOL
`}
          </pre>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="font-mono text-xs">
              <span className="text-gray-600">NETWORK:</span>{' '}
              <span className="text-[#00cc00]">SOLANA-MAINNET</span>
              <span className="text-gray-600 ml-4">LATENCY:</span>{' '}
              <span className={networkLatency < 200 ? 'text-[#00cc00]' : networkLatency < 500 ? 'text-[#ffff00]' : 'text-[#ff0000]'}>
                {networkLatency}ms
              </span>
              <span className="text-gray-600 ml-4">SCANS:</span>{' '}
              <span className="text-[#ff9900]">{scanCount}</span>
            </div>
            <button
              onClick={handleRefresh}
              disabled={loading}
              className="border border-[#00cc00] px-4 py-2 text-[#00cc00] hover:bg-[#00cc00] hover:text-black disabled:opacity-30 transition-colors font-mono text-xs"
            >
              {loading ? '[SCANNING...]' : '[SCAN NOW]'}
            </button>
          </div>
        </div>

        <div className="grid lg:grid-cols-[1fr_400px] gap-6">
          <div className="space-y-6">
            <div className="cyber-card p-6 bg-black/90 backdrop-blur-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="font-mono text-sm">
                  <span className="text-[#00cc00]">LIVE OPPORTUNITIES</span>
                  <span className="text-gray-600 ml-2">[{opportunities.length}]</span>
                </div>
                <label className="flex items-center gap-2 text-xs font-mono text-gray-600">
                  MIN_PROFIT_$
                  <input
                    type="number"
                    value={minProfit}
                    onChange={(e) => setMinProfit(parseFloat(e.target.value))}
                    className="w-20 bg-black border border-[#00cc00]/30 px-2 py-1 text-[#00cc00] font-mono text-sm focus:outline-none focus:border-[#00cc00]"
                  />
                </label>
              </div>

              {loading ? (
                <div className="flex items-center justify-center h-96 border-2 border-dashed border-gray-800">
                  <div className="text-center">
                    <div className="w-12 h-12 border-3 border-[#00cc00] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-gray-600 font-mono text-lg">SCANNING LIQUIDITY POOLS...</p>
                    <p className="text-gray-700 font-mono text-xs mt-2">CHECKING 64 TOKEN PAIRS</p>
                  </div>
                </div>
              ) : !enableScan ? (
                <div className="flex items-center justify-center h-96 border-2 border-dashed border-gray-800">
                  <div className="text-center">
                    <p className="text-gray-600 font-mono text-lg mb-4">SCANNER READY</p>
                    <p className="text-gray-700 font-mono text-sm mb-6">CLICK [SCAN NOW] TO SEARCH FOR ARBITRAGE OPPORTUNITIES</p>
                    <button
                      onClick={handleRefresh}
                      className="border border-[#00cc00] px-6 py-3 text-[#00cc00] hover:bg-[#00cc00] hover:text-black transition-colors font-mono text-sm"
                    >
                      [START SCANNING]
                    </button>
                  </div>
                </div>
              ) : opportunities.length === 0 ? (
                <div className="flex items-center justify-center h-96 border-2 border-dashed border-gray-800">
                  <div className="text-center">
                    <p className="text-gray-600 font-mono text-lg mb-2">NO_ROUTES_DETECTED</p>
                    <p className="text-gray-700 font-mono text-sm">ALL TOKEN PAIRS CHECKED</p>
                    <p className="text-gray-800 font-mono text-xs mt-4">MARKETS ARE HIGHLY EFFICIENT</p>
                    <p className="text-gray-800 font-mono text-xs">TRY AGAIN IN A FEW SECONDS</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4 max-h-[800px] overflow-y-auto pr-2 custom-scrollbar">
                  {opportunities.map((opportunity) => (
                    <ArbitrageCard
                      key={opportunity.id}
                      opportunity={opportunity}
                      onExecute={executeArbitrage}
                      connected={connected}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="space-y-6">
            <div className="cyber-card p-4 bg-black/90 backdrop-blur-sm">
              <h3 className="text-sm font-mono text-[#00cc00] mb-3 border-b border-[#00cc00]/30 pb-2 flex items-center justify-between">
                <span>SYSTEM LOGS</span>
                <span className="text-gray-600">[LIVE]</span>
              </h3>
              <div className="h-96 overflow-y-auto space-y-1 font-mono text-[10px] custom-scrollbar">
                {logs.map((log, i) => (
                  <div key={i} className="flex gap-2">
                    <span className="text-gray-700">[{log.timestamp}]</span>
                    <span className={
                      log.type === 'success' ? 'text-[#00cc00]' :
                      log.type === 'error' ? 'text-[#ff0000]' :
                      log.type === 'scan' ? 'text-[#ff9900]' :
                      'text-gray-600'
                    }>
                      {log.message}
                    </span>
                  </div>
                ))}
                <div ref={logsEndRef} />
              </div>
            </div>

            <div className="cyber-card p-6 bg-black/90 backdrop-blur-sm">
              <h3 className="text-sm font-mono text-[#ff9900] mb-4 border-b border-[#ff9900]/30 pb-2">
                SCANNER CONFIG
              </h3>
              <div className="space-y-2 font-mono text-xs text-gray-600">
                <p>▸ API: JUPITER_V6_AGGREGATOR</p>
                <p>▸ NETWORK: SOLANA_MAINNET_BETA</p>
                <p>▸ TOKENS: 12_TOKENS_SCANNED</p>
                <p>▸ ROUTES: MULTI_HOP_ENABLED</p>
                <p>▸ AMOUNTS: 5_SIZES_PER_PAIR</p>
                <p>▸ SLIPPAGE: 0.5%_TOLERANCE</p>
                <p>▸ MIN_PROFIT: ${minProfit}_USD</p>
                <p>▸ TOTAL_CHECKS: ~660_ROUTES</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
