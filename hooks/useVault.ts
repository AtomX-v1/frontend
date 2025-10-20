import { useState, useEffect } from 'react';
import { PublicKey } from '@solana/web3.js';
import { BN } from '@coral-xyz/anchor';

export function useVault(wallet: any | null) {
  const [vaultData, setVaultData] = useState({
    totalValue: 0,
    totalShares: 0,
    userShares: 0,
    userValue: 0,
    apy: 0,
    depositors: 0,
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!wallet || !wallet.publicKey) {
      setVaultData({
        totalValue: 0,
        totalShares: 0,
        userShares: 0,
        userValue: 0,
        apy: 0,
        depositors: 0,
      });
      return;
    }

    fetchVaultData();
  }, [wallet]);

  const fetchVaultData = async () => {
    if (!wallet || !wallet.publicKey) return;

    setLoading(true);
    try {
      const { getProvider } = await import('@/lib/anchor/provider');
      const { getVaultProgram, getVaultPDA, getUserPositionPDA } = await import('@/lib/anchor/vault');

      const provider = getProvider(wallet);
      const program = getVaultProgram(provider);
      const vaultPDA = getVaultPDA();

      const vaultAccount = await (program.account as any).vault.fetch(vaultPDA);

      const userPositionPDA = getUserPositionPDA(wallet.publicKey);
      let userShares = 0;

      try {
        const userPosition = await (program.account as any).userPosition.fetch(userPositionPDA);
        userShares = userPosition.shares.toNumber();
      } catch (e) {
      }

      const totalShares = vaultAccount.totalShares.toNumber();

      setVaultData({
        totalValue: 0,
        totalShares,
        userShares,
        userValue: 0,
        apy: 0,
        depositors: 0,
      });
    } catch (error) {
      console.error('Error fetching vault data:', error);
    } finally {
      setLoading(false);
    }
  };

  const deposit = async (amount: number, userToken: PublicKey, vaultToken: PublicKey) => {
    if (!wallet || !wallet.publicKey) throw new Error('Wallet not connected');

    const { getProvider } = await import('@/lib/anchor/provider');
    const { getVaultProgram, deposit: executeDeposit } = await import('@/lib/anchor/vault');

    const provider = getProvider(wallet);
    const program = getVaultProgram(provider);

    const amountBN = new BN(amount);

    await executeDeposit(
      program,
      wallet.publicKey,
      userToken,
      vaultToken,
      amountBN
    );

    await fetchVaultData();
  };

  const withdraw = async (shares: number, userToken: PublicKey, vaultToken: PublicKey) => {
    if (!wallet || !wallet.publicKey) throw new Error('Wallet not connected');

    const { getProvider } = await import('@/lib/anchor/provider');
    const { getVaultProgram, withdraw: executeWithdraw } = await import('@/lib/anchor/vault');

    const provider = getProvider(wallet);
    const program = getVaultProgram(provider);

    const sharesBN = new BN(shares);

    await executeWithdraw(
      program,
      wallet.publicKey,
      userToken,
      vaultToken,
      sharesBN
    );

    await fetchVaultData();
  };

  return {
    vaultData,
    loading,
    deposit,
    withdraw,
    refresh: fetchVaultData,
  };
}
