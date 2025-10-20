'use client';

import { useState } from 'react';
import ArbitrageCard from '@/components/ArbitrageCard';
import { ArbitrageOpportunity } from '@/types';
import { useArbitrage } from '@/hooks/useArbitrage';

export default function ArbitragePage() {
  const connected = false;
  const [minProfit, setMinProfit] = useState(10);
  const [enableScan, setEnableScan] = useState(false);
  const { opportunities, loading, refresh } = useArbitrage(minProfit, enableScan);

  const handleRefresh = async () => {
    setEnableScan(true);
    await refresh();
  };

  const executeArbitrage = async (opportunity: ArbitrageOpportunity) => {
    if (!connected) {
      alert('WALLET_NOT_CONNECTED');
      return;
    }

    try {
      console.log('Executing arbitrage:', opportunity);
      console.log('Arbitrage path:', {
        steps: opportunity.path.map(step => `${step.from.symbol} → ${step.to.symbol} (${step.dex})`),
        estimatedProfit: `$${opportunity.estimatedProfit.toFixed(2)}`,
        profitPercentage: `${opportunity.profitPercentage.toFixed(2)}%`,
        requiredAmount: opportunity.requiredAmount
      });

      // Get quotes for each step
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
          throw new Error(`Failed to get quote for step ${i + 1}`);
        }

        console.log(`Step ${i + 1} quote:`, {
          in: `${step.from.symbol}`,
          out: `${step.to.symbol}`,
          outAmount: parseInt(quote.outAmount) / Math.pow(10, step.to.decimals)
        });
      }

      alert(`ARBITRAGE_READY // PROFIT: $${opportunity.estimatedProfit.toFixed(2)}\nCONNECT_WALLET_TO_EXECUTE`);
    } catch (error) {
      console.error('Error executing arbitrage:', error);
      alert(`EXECUTION_FAILED: ${error instanceof Error ? error.message : 'UNKNOWN_ERROR'}`);
    }
  };

  const profitableOps = opportunities.filter((op) => op.profitPercentage > 0.5);
  const totalPotentialProfit = profitableOps.reduce((sum, op) => sum + op.estimatedProfit, 0);

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="cyber-card p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-[#ff9900] mb-1 font-mono">[02] ARBITRAGE SCANNER</h1>
              <p className="text-gray-600 font-mono text-xs">LIVE_OPPORTUNITIES // MULTI_HOP_ROUTES</p>
            </div>
            <button
              onClick={handleRefresh}
              disabled={loading}
              className="border border-[#00cc00] px-4 py-2 text-[#00cc00] hover:bg-[#00cc00] hover:text-black disabled:opacity-30 transition-colors font-mono text-xs"
            >
              {loading ? '[SCANNING...]' : '[SCAN]'}
            </button>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main area */}
          <div className="lg:col-span-2">
            <div className="cyber-card p-6 mb-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-mono text-[#00cc00]">OPPORTUNITIES [{opportunities.length}]</h2>
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

              {loading && opportunities.length === 0 ? (
                <div className="flex items-center justify-center h-96 border-2 border-dashed border-gray-800">
                  <div className="text-center">
                    <div className="w-12 h-12 border-3 border-[#00cc00] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-gray-600 font-mono text-lg">SCANNING_ROUTES...</p>
                  </div>
                </div>
              ) : opportunities.length === 0 ? (
                <div className="flex items-center justify-center h-96 border-2 border-dashed border-gray-800">
                  <div className="text-center">
                    <p className="text-gray-600 font-mono text-lg mb-2">NO_OPPORTUNITIES_FOUND</p>
                    <p className="text-gray-700 font-mono text-sm">LOWER_MIN_PROFIT_THRESHOLD</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {opportunities.map((opportunity) => (
                    <ArbitrageCard
                      key={opportunity.id}
                      opportunity={opportunity}
                      onExecute={executeArbitrage}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Stats panel */}
          <div className="space-y-6">
            <div className="cyber-card p-6">
              <h3 className="text-sm font-mono text-[#00cc00] mb-4">SCAN_STATUS</h3>
              <div className="space-y-3 font-mono text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">TOTAL_FOUND</span>
                  <span className="text-[#00cc00]">{opportunities.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">PROFITABLE</span>
                  <span className="text-[#00cc00]">{profitableOps.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">TOTAL_PROFIT</span>
                  <span className="text-[#ffff00]">${totalPotentialProfit.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">AUTO_REFRESH</span>
                  <span className="text-gray-500">20s</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">WALLET</span>
                  <span className={connected ? 'text-[#00cc00]' : 'text-[#ff0000]'}>
                    {connected ? '[CONNECTED]' : '[DISCONNECTED]'}
                  </span>
                </div>
              </div>
            </div>

            <div className="cyber-card p-6">
              <h3 className="text-xs font-mono text-[#ff9900] mb-3">SCANNER_INFO</h3>
              <div className="space-y-2 font-mono text-xs text-gray-600">
                <p>▸ SCANS: JUPITER V6 API</p>
                <p>▸ ROUTES: MULTI-HOP PATHS</p>
                <p>▸ EXECUTION: SINGLE_TX</p>
                <p>▸ MIN_PROFIT: ${minProfit}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
