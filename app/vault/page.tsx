'use client';

import { useState } from 'react';
import { formatNumber } from '@/lib/utils';

export default function VaultPage() {
  const connected = false;
  const [depositAmount, setDepositAmount] = useState('');
  const [withdrawShares, setWithdrawShares] = useState('');
  const [isDepositing, setIsDepositing] = useState(false);
  const [isWithdrawing, setIsWithdrawing] = useState(false);

  // Vault data - all zeros until wallet connected and real data fetched
  const vaultInfo = {
    totalValue: 0,
    totalShares: 0,
    userShares: 0,
    userValue: 0,
    apy: 0,
    depositors: 0,
  };

  const handleDeposit = async () => {
    if (!connected) {
      alert('WALLET_NOT_CONNECTED');
      return;
    }

    const amount = parseFloat(depositAmount);
    if (!depositAmount || amount <= 0 || isNaN(amount)) {
      alert('INVALID_AMOUNT');
      return;
    }

    setIsDepositing(true);
    try {
      console.log('Deposit transaction details:', {
        amount: amount,
        action: 'vault_deposit',
        token: 'USDC',
        note: 'Wallet adapter integration required for real transactions'
      });

      // TODO: Call Solana vault program deposit instruction
      // const { executeVaultDeposit } = await import('@/lib/solana');
      // await executeVaultDeposit(amount, userPublicKey);

      alert(`DEPOSIT_READY // AMOUNT: ${amount} USDC\\nCONNECT_WALLET_TO_EXECUTE`);
      setDepositAmount('');
    } catch (error) {
      console.error('Error depositing:', error);
      alert(`DEPOSIT_FAILED: ${error instanceof Error ? error.message : 'UNKNOWN_ERROR'}`);
    } finally {
      setIsDepositing(false);
    }
  };

  const handleWithdraw = async () => {
    if (!connected) {
      alert('WALLET_NOT_CONNECTED');
      return;
    }

    const shares = parseFloat(withdrawShares);
    if (!withdrawShares || shares <= 0 || isNaN(shares)) {
      alert('INVALID_SHARES_AMOUNT');
      return;
    }

    if (shares > vaultInfo.userShares) {
      alert(`INSUFFICIENT_SHARES // MAX: ${vaultInfo.userShares}`);
      return;
    }

    setIsWithdrawing(true);
    try {
      const estimatedValue = (shares / vaultInfo.totalShares) * vaultInfo.totalValue;

      console.log('Withdraw transaction details:', {
        shares: shares,
        estimatedValue: estimatedValue,
        action: 'vault_withdraw',
        note: 'Wallet adapter integration required for real transactions'
      });

      // TODO: Call Solana vault program withdraw instruction
      // const { executeVaultWithdraw } = await import('@/lib/solana');
      // await executeVaultWithdraw(shares, userPublicKey);

      alert(`WITHDRAW_READY // SHARES: ${shares}\\nEST_VALUE: $${estimatedValue.toFixed(2)}\\nCONNECT_WALLET_TO_EXECUTE`);
      setWithdrawShares('');
    } catch (error) {
      console.error('Error withdrawing:', error);
      alert(`WITHDRAW_FAILED: ${error instanceof Error ? error.message : 'UNKNOWN_ERROR'}`);
    } finally {
      setIsWithdrawing(false);
    }
  };

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="cyber-card p-6 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-[#ff0000] mb-1 font-mono">[03] LIQUIDITY VAULT</h1>
            <p className="text-gray-600 font-mono text-xs">DEPOSIT_USDC // EARN_FROM_ARBITRAGE</p>
          </div>
        </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main area */}
        <div className="lg:col-span-2">
          <div className="cyber-card p-6 mb-6">
            <h2 className="text-sm font-mono text-[#00cc00] mb-4">YOUR_POSITION</h2>
            <div className="space-y-3 font-mono text-sm">
              <div className="flex justify-between py-3 border-b border-gray-800">
                <span className="text-gray-600">SHARES_OWNED</span>
                <span className="text-[#00cc00]">{formatNumber(vaultInfo.userShares, 0)}</span>
              </div>
              <div className="flex justify-between py-3 border-b border-gray-800">
                <span className="text-gray-600">SHARE_VALUE</span>
                <span className="text-[#00cc00]">${((vaultInfo.userValue / vaultInfo.userShares) || 0).toFixed(4)}</span>
              </div>
              <div className="flex justify-between py-3 border-b border-gray-800">
                <span className="text-gray-600">TOTAL_VALUE</span>
                <span className="text-[#ffff00] text-lg">${vaultInfo.userValue.toFixed(2)}</span>
              </div>
              <div className="flex justify-between py-3">
                <span className="text-gray-600">POOL_SHARE</span>
                <span className="text-[#00cc00]">{((vaultInfo.userShares / vaultInfo.totalShares) * 100).toFixed(2)}%</span>
              </div>
            </div>
          </div>

          <div className="cyber-card p-6">
            <h2 className="text-sm font-mono text-[#ff9900] mb-4">HOW_IT_WORKS</h2>
            <div className="space-y-2 font-mono text-xs text-gray-600">
              <p>▸ 01: DEPOSIT_USDC_RECEIVE_SHARES</p>
              <p>▸ 02: VAULT_EXECUTES_ARBITRAGE</p>
              <p>▸ 03: EXECUTORS_GET_10%_FEE</p>
              <p>▸ 04: 90%_PROFIT_TO_VAULT</p>
              <p>▸ 05: WITHDRAW_ANYTIME_BURN_SHARES</p>
            </div>
          </div>
        </div>

        {/* Actions panel */}
        <div className="space-y-6">
          <div className="cyber-card p-6">
            <h3 className="text-sm font-mono text-[#00cc00] mb-4">DEPOSIT</h3>
            <div className="space-y-4">
              <div>
                <label className="text-xs text-gray-600 font-mono mb-1 block">AMOUNT_USDC</label>
                <input
                  type="number"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full bg-black border border-[#00cc00]/30 px-3 py-2 text-[#00cc00] font-mono text-sm focus:outline-none focus:border-[#00cc00]"
                />
              </div>
              <div className="grid grid-cols-4 gap-2">
                {[25, 50, 75, 100].map((percent) => (
                  <button
                    key={percent}
                    onClick={() => setDepositAmount((1000 * percent / 100).toString())}
                    className="px-2 py-1 bg-black border border-gray-700 hover:border-[#00cc00] transition-colors font-mono text-xs text-gray-500 hover:text-[#00cc00]"
                  >
                    {percent}%
                  </button>
                ))}
              </div>
              <button
                onClick={handleDeposit}
                disabled={!connected || !depositAmount || isDepositing}
                className="w-full py-2 border border-[#00cc00] text-[#00cc00] font-mono text-xs hover:bg-[#00cc00] hover:text-black disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                {isDepositing ? '[DEPOSITING...]' : '[DEPOSIT]'}
              </button>
            </div>
          </div>

          <div className="cyber-card p-6">
            <h3 className="text-sm font-mono text-[#ff9900] mb-4">WITHDRAW</h3>
            <div className="space-y-4">
              <div>
                <label className="text-xs text-gray-600 font-mono mb-1 block">SHARES_AMOUNT</label>
                <input
                  type="number"
                  value={withdrawShares}
                  onChange={(e) => setWithdrawShares(e.target.value)}
                  placeholder="0"
                  className="w-full bg-black border border-[#ff9900]/30 px-3 py-2 text-[#ff9900] font-mono text-sm focus:outline-none focus:border-[#ff9900]"
                />
              </div>
              <div className="grid grid-cols-4 gap-2">
                {[25, 50, 75, 100].map((percent) => (
                  <button
                    key={percent}
                    onClick={() => setWithdrawShares((vaultInfo.userShares * percent / 100).toString())}
                    className="px-2 py-1 bg-black border border-gray-700 hover:border-[#ff9900] transition-colors font-mono text-xs text-gray-500 hover:text-[#ff9900]"
                  >
                    {percent}%
                  </button>
                ))}
              </div>
              <button
                onClick={handleWithdraw}
                disabled={!connected || !withdrawShares || isWithdrawing}
                className="w-full py-2 border border-[#ff9900] text-[#ff9900] font-mono text-xs hover:bg-[#ff9900] hover:text-black disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                {isWithdrawing ? '[WITHDRAWING...]' : '[WITHDRAW]'}
              </button>
            </div>
          </div>

          <div className="cyber-card p-6">
            <h3 className="text-xs font-mono text-[#ff0000] mb-3">VAULT_STATS</h3>
            <div className="space-y-3 font-mono text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">TVL</span>
                <span className="text-[#00cc00]">${(vaultInfo.totalValue / 1000).toFixed(0)}K</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">APY</span>
                <span className="text-[#ffff00]">{vaultInfo.apy}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">DEPOSITORS</span>
                <span className="text-[#00cc00]">{vaultInfo.depositors}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">WALLET</span>
                <span className={connected ? 'text-[#00cc00]' : 'text-[#ff0000]'}>
                  {connected ? '[CONNECTED]' : '[DISCONNECTED]'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
}
