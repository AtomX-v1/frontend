'use client';

import { ArbitrageOpportunity } from '@/types';
import { formatNumber, cn } from '@/lib/utils';

interface ArbitrageCardProps {
  opportunity: ArbitrageOpportunity;
  onExecute: (opportunity: ArbitrageOpportunity) => void;
}

const DEX_COLORS: Record<string, string> = {
  orca: '#00cc00',
  raydium: '#ff9900',
  meteora: '#ff0000',
  jupiter: '#ffff00',
};

export default function ArbitrageCard({ opportunity, onExecute }: ArbitrageCardProps) {
  const isProfitable = opportunity.profitPercentage > 0.5;
  const timeSince = Math.floor((Date.now() - opportunity.timestamp) / 1000);

  return (
    <div className="cyber-card p-4">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-lg font-bold font-mono text-[#ffff00]">
              ${opportunity.estimatedProfit.toFixed(2)}
            </span>
            <span className={cn(
              "text-xs font-mono",
              isProfitable ? 'text-[#00cc00]' : 'text-gray-600'
            )}>
              (+{opportunity.profitPercentage.toFixed(2)}%)
            </span>
          </div>
          <div className="text-xs font-mono text-gray-600">
            FOUND_{timeSince}s_AGO
          </div>
        </div>
        <button
          onClick={() => onExecute(opportunity)}
          disabled={!isProfitable}
          className={cn(
            "px-3 py-1 font-mono text-xs border transition-colors",
            isProfitable
              ? "border-[#ffff00] text-[#ffff00] hover:bg-[#ffff00] hover:text-black"
              : "border-gray-700 text-gray-600 cursor-not-allowed"
          )}
        >
          [EXEC]
        </button>
      </div>

      <div className="space-y-2 mb-4">
        {opportunity.path.map((step, index) => (
          <div key={index} className="flex items-center gap-2">
            <div
              className="px-2 py-1 font-mono text-xs border-2"
              style={{
                borderColor: DEX_COLORS[step.dex],
                color: DEX_COLORS[step.dex],
              }}
            >
              {step.dex.toUpperCase()}
            </div>
            <div className="flex-1 flex items-center gap-2 font-mono text-sm">
              <span className="text-[#00cc00]">{step.from.symbol}</span>
              <span className="text-gray-700">→</span>
              <span className="text-[#ff9900]">{step.to.symbol}</span>
              <span className="text-xs text-gray-600 ml-auto">
                {formatNumber(step.expectedOutput, 4)}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="pt-3 border-t border-gray-800 grid grid-cols-2 gap-4 font-mono text-xs">
        <div>
          <div className="text-gray-600">REQUIRED</div>
          <div className="text-[#00cc00]">${opportunity.requiredAmount.toFixed(2)}</div>
        </div>
        <div>
          <div className="text-gray-600">HOPS</div>
          <div className="text-[#00cc00]">{opportunity.path.length}</div>
        </div>
      </div>
    </div>
  );
}
