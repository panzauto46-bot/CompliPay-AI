import { useState } from 'react';
import {
  Wallet,
  Plus,
  Copy,
  ExternalLink,
  RefreshCw,
  ArrowUpRight,
  ArrowDownLeft,
  Shield,
  CheckCircle,
} from 'lucide-react';
import { WalletInfo } from '../types';
import { useAppData } from '../context/AppDataContext';

export default function Wallets() {
  const { walletsData, refreshWalletBalances } = useAppData();
  const [selectedWallet, setSelectedWallet] = useState<WalletInfo | null>(null);
  const [showConnectModal, setShowConnectModal] = useState(false);

  const totalBalance = walletsData.reduce((acc, w) => acc + w.balance, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Wallet Management</h1>
          <p className="text-slate-400 mt-1">Manage institutional custody integrations</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => refreshWalletBalances().catch(() => null)}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-medium rounded-lg transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh Balances
          </button>
          <button
            onClick={() => setShowConnectModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-violet-500 hover:bg-violet-600 text-white font-medium rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
            Connect Wallet
          </button>
        </div>
      </div>

      {/* Total Balance Card */}
      <div className="bg-gradient-to-br from-violet-600 to-cyan-600 rounded-xl p-6 text-white">
        <p className="text-sm text-white/70">Total Portfolio Balance</p>
        <p className="text-4xl font-bold mt-2">${(totalBalance / 1000000).toFixed(2)}M</p>
        <div className="flex items-center gap-4 mt-4">
          <span className="text-sm text-white/70">{walletsData.length} wallets connected</span>
          <span className="px-2 py-0.5 text-xs font-medium bg-white/20 rounded">
            Multi-sig enabled
          </span>
        </div>
      </div>

      {/* Wallets Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {walletsData.map((wallet, index) => (
          <div
            key={index}
            className="bg-slate-900 rounded-xl border border-slate-800 p-6 hover:border-slate-700 transition-colors cursor-pointer"
            onClick={() => setSelectedWallet(wallet)}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div
                  className={`p-2 rounded-lg ${
                    wallet.provider === 'fireblocks' ? 'bg-orange-500/10' : 'bg-violet-500/10'
                  }`}
                >
                  <Wallet
                    className={`w-5 h-5 ${
                      wallet.provider === 'fireblocks' ? 'text-orange-400' : 'text-violet-400'
                    }`}
                  />
                </div>
                <div>
                  <p className="text-sm font-medium text-white capitalize">{wallet.provider}</p>
                  <p className="text-xs text-slate-400 font-mono">{wallet.address}</p>
                </div>
              </div>
              <span
                className={`px-2 py-0.5 text-xs font-medium rounded ${
                  wallet.status === 'connected'
                    ? 'bg-emerald-500/10 text-emerald-400'
                    : 'bg-red-500/10 text-red-400'
                }`}
              >
                {wallet.status}
              </span>
            </div>

            <div className="mt-4">
              <p className="text-xs text-slate-500">Balance</p>
              <p className="text-2xl font-semibold text-white">
                {wallet.balance.toLocaleString()} <span className="text-base">{wallet.currency}</span>
              </p>
              <p className="text-sm text-slate-400">
                ~${wallet.balance.toLocaleString()} USD
              </p>
            </div>

            <div className="mt-4 pt-4 border-t border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                  }}
                  className="p-2 text-slate-400 hover:text-emerald-400 hover:bg-slate-800 rounded-lg transition-colors"
                  title="Send"
                >
                  <ArrowUpRight className="w-4 h-4" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                  }}
                  className="p-2 text-slate-400 hover:text-cyan-400 hover:bg-slate-800 rounded-lg transition-colors"
                  title="Receive"
                >
                  <ArrowDownLeft className="w-4 h-4" />
                </button>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                }}
                className="p-2 text-slate-400 hover:text-violet-400 hover:bg-slate-800 rounded-lg transition-colors"
                title="Copy address"
              >
                <Copy className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}

        {/* Add Wallet Card */}
        <button
          onClick={() => setShowConnectModal(true)}
          className="bg-slate-900/50 border-2 border-dashed border-slate-700 rounded-xl p-6 flex flex-col items-center justify-center gap-3 hover:border-violet-500/50 hover:bg-slate-900 transition-colors min-h-[200px]"
        >
          <div className="p-3 bg-slate-800 rounded-lg">
            <Plus className="w-6 h-6 text-slate-400" />
          </div>
          <p className="text-sm font-medium text-slate-400">Connect New Wallet</p>
        </button>
      </div>

      {/* Custody Providers */}
      <div className="bg-slate-900 rounded-xl border border-slate-800 p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Supported Custody Providers</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-orange-500/10 rounded-lg">
                <Shield className="w-5 h-5 text-orange-400" />
              </div>
              <div>
                <p className="font-medium text-white">Fireblocks</p>
                <p className="text-xs text-emerald-400">Connected</p>
              </div>
            </div>
            <p className="text-sm text-slate-400">
              Enterprise-grade custody with MPC technology
            </p>
          </div>

          <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700 opacity-60">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-blue-500/10 rounded-lg">
                <Shield className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <p className="font-medium text-white">Coinbase Prime</p>
                <p className="text-xs text-slate-400">Coming Soon</p>
              </div>
            </div>
            <p className="text-sm text-slate-400">
              Institutional trading and custody platform
            </p>
          </div>

          <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700 opacity-60">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-purple-500/10 rounded-lg">
                <Shield className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <p className="font-medium text-white">BitGo</p>
                <p className="text-xs text-slate-400">Coming Soon</p>
              </div>
            </div>
            <p className="text-sm text-slate-400">
              Qualified custodian for digital assets
            </p>
          </div>
        </div>
      </div>

      {/* Wallet Detail Modal */}
      {selectedWallet && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70" onClick={() => setSelectedWallet(null)} />
          <div className="relative w-full max-w-lg bg-slate-900 rounded-xl border border-slate-800 p-6 shadow-xl">
            <div className="flex items-center gap-4 mb-6">
              <div
                className={`p-3 rounded-lg ${
                  selectedWallet.provider === 'fireblocks' ? 'bg-orange-500/10' : 'bg-violet-500/10'
                }`}
              >
                <Wallet
                  className={`w-6 h-6 ${
                    selectedWallet.provider === 'fireblocks' ? 'text-orange-400' : 'text-violet-400'
                  }`}
                />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-white capitalize">
                  {selectedWallet.provider} Wallet
                </h2>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-sm text-slate-400 font-mono">{selectedWallet.address}</span>
                  <button className="p-1 text-slate-400 hover:text-white transition-colors">
                    <Copy className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="p-4 bg-gradient-to-br from-violet-500/20 to-cyan-500/20 border border-violet-500/30 rounded-lg">
                <p className="text-xs text-slate-400">Balance</p>
                <p className="text-3xl font-bold text-white mt-1">
                  {selectedWallet.balance.toLocaleString()} {selectedWallet.currency}
                </p>
                <p className="text-sm text-slate-400 mt-1">
                  ~${selectedWallet.balance.toLocaleString()} USD
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-slate-800/50 rounded-lg">
                  <p className="text-xs text-slate-500">Provider</p>
                  <p className="text-sm text-white mt-1 capitalize">{selectedWallet.provider}</p>
                </div>
                <div className="p-4 bg-slate-800/50 rounded-lg">
                  <p className="text-xs text-slate-500">Status</p>
                  <div className="flex items-center gap-2 mt-1">
                    <CheckCircle className="w-4 h-4 text-emerald-400" />
                    <span className="text-sm text-emerald-400 capitalize">
                      {selectedWallet.status}
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-slate-800/50 rounded-lg">
                <p className="text-xs text-slate-500 mb-3">Quick Actions</p>
                <div className="grid grid-cols-3 gap-2">
                  <button className="flex flex-col items-center gap-2 p-3 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors">
                    <ArrowUpRight className="w-5 h-5 text-emerald-400" />
                    <span className="text-xs text-slate-300">Send</span>
                  </button>
                  <button className="flex flex-col items-center gap-2 p-3 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors">
                    <ArrowDownLeft className="w-5 h-5 text-cyan-400" />
                    <span className="text-xs text-slate-300">Receive</span>
                  </button>
                  <button className="flex flex-col items-center gap-2 p-3 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors">
                    <RefreshCw className="w-5 h-5 text-violet-400" />
                    <span className="text-xs text-slate-300">Swap</span>
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-3 pt-4">
                <button
                  onClick={() => setSelectedWallet(null)}
                  className="flex-1 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-medium rounded-lg transition-colors"
                >
                  Close
                </button>
                <button className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-violet-500 hover:bg-violet-600 text-white font-medium rounded-lg transition-colors">
                  <ExternalLink className="w-4 h-4" />
                  View on Explorer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Connect Wallet Modal */}
      {showConnectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70" onClick={() => setShowConnectModal(false)} />
          <div className="relative w-full max-w-md bg-slate-900 rounded-xl border border-slate-800 p-6 shadow-xl">
            <h2 className="text-xl font-semibold text-white mb-6">Connect Wallet</h2>

            <div className="space-y-3">
              <button className="w-full flex items-center gap-4 p-4 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors">
                <div className="p-2 bg-orange-500/10 rounded-lg">
                  <Shield className="w-6 h-6 text-orange-400" />
                </div>
                <div className="flex-1 text-left">
                  <p className="font-medium text-white">Fireblocks</p>
                  <p className="text-xs text-slate-400">Connect via API key</p>
                </div>
              </button>

              <button className="w-full flex items-center gap-4 p-4 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors">
                <div className="p-2 bg-purple-500/10 rounded-lg">
                  <Wallet className="w-6 h-6 text-purple-400" />
                </div>
                <div className="flex-1 text-left">
                  <p className="font-medium text-white">Phantom</p>
                  <p className="text-xs text-slate-400">Connect browser wallet</p>
                </div>
              </button>

              <button className="w-full flex items-center gap-4 p-4 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors">
                <div className="p-2 bg-cyan-500/10 rounded-lg">
                  <Wallet className="w-6 h-6 text-cyan-400" />
                </div>
                <div className="flex-1 text-left">
                  <p className="font-medium text-white">Solflare</p>
                  <p className="text-xs text-slate-400">Connect browser wallet</p>
                </div>
              </button>

              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-700" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-slate-900 text-slate-400">or</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Import Wallet Address
                </label>
                <input
                  type="text"
                  placeholder="Enter Solana wallet address"
                  className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500"
                />
              </div>
            </div>

            <div className="flex items-center gap-3 mt-6">
              <button
                onClick={() => setShowConnectModal(false)}
                className="flex-1 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-medium rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button className="flex-1 px-4 py-2.5 bg-violet-500 hover:bg-violet-600 text-white font-medium rounded-lg transition-colors">
                Connect
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
