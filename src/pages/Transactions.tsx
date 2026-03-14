import { useEffect, useMemo, useState } from 'react';
import {
  Search,
  Filter,
  Download,
  ExternalLink,
  CheckCircle,
  Clock,
  XCircle,
  RefreshCw,
  ArrowUpRight,
  ArrowDownLeft,
} from 'lucide-react';
import { Transaction } from '../types';
import { useAppData } from '../context/AppDataContext';

type StatusFilter = 'all' | 'completed' | 'processing' | 'pending' | 'failed';
type TypeFilter = 'all' | 'payment' | 'escrow' | 'subscription' | 'treasury';

export default function Transactions() {
  const { transactions, exportTransactionsCsv } = useAppData();
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);
  const [page, setPage] = useState(1);
  const pageSize = 8;

  const openExplorer = (tx: Transaction) => {
    const url =
      tx.explorerUrl ??
      `https://explorer.solana.com/tx/${tx.txHash}?cluster=${tx.network === 'testnet' ? 'testnet' : 'devnet'}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const filteredTransactions = transactions.filter((tx) => {
    const matchesStatus = statusFilter === 'all' || tx.status === statusFilter;
    const matchesType = typeFilter === 'all' || tx.type === typeFilter;
    const matchesSearch =
      tx.sender.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tx.receiver.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tx.txHash.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesType && matchesSearch;
  });

  useEffect(() => {
    setPage(1);
  }, [statusFilter, typeFilter, searchQuery, transactions.length]);

  const totalPages = Math.max(1, Math.ceil(filteredTransactions.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const paginatedTransactions = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredTransactions.slice(start, start + pageSize);
  }, [filteredTransactions, currentPage]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-emerald-500/10 text-emerald-400 rounded-full border border-emerald-500/20">
            <CheckCircle className="w-3 h-3" />
            Completed
          </span>
        );
      case 'processing':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-amber-500/10 text-amber-400 rounded-full border border-amber-500/20">
            <RefreshCw className="w-3 h-3 animate-spin" />
            Processing
          </span>
        );
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-slate-500/10 text-slate-400 rounded-full border border-slate-500/20">
            <Clock className="w-3 h-3" />
            Pending
          </span>
        );
      case 'failed':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-red-500/10 text-red-400 rounded-full border border-red-500/20">
            <XCircle className="w-3 h-3" />
            Failed
          </span>
        );
      default:
        return null;
    }
  };

  const getComplianceBadge = (status: string) => {
    switch (status) {
      case 'passed':
        return (
          <span className="px-2 py-0.5 text-xs font-medium bg-emerald-500/10 text-emerald-400 rounded border border-emerald-500/20">
            Passed
          </span>
        );
      case 'flagged':
        return (
          <span className="px-2 py-0.5 text-xs font-medium bg-red-500/10 text-red-400 rounded border border-red-500/20">
            Flagged
          </span>
        );
      case 'review':
        return (
          <span className="px-2 py-0.5 text-xs font-medium bg-amber-500/10 text-amber-400 rounded border border-amber-500/20">
            Review
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Transaction History</h1>
          <p className="text-slate-400 mt-1">On-chain audit trail of all payments</p>
        </div>
        <button
          type="button"
          onClick={exportTransactionsCsv}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-medium rounded-lg transition-colors"
        >
          <Download className="w-4 h-4" />
          Export CSV
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by address, receiver, or hash..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <span className="text-sm text-slate-400">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
              className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
            >
              <option value="all">All</option>
              <option value="completed">Completed</option>
              <option value="processing">Processing</option>
              <option value="pending">Pending</option>
              <option value="failed">Failed</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-400">Type:</span>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as TypeFilter)}
              className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
            >
              <option value="all">All</option>
              <option value="payment">Payment</option>
              <option value="escrow">Escrow</option>
              <option value="subscription">Subscription</option>
              <option value="treasury">Treasury</option>
            </select>
          </div>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-800">
                <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                  Transaction
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                  Parties
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                  Compliance
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                  Time
                </th>
                <th className="px-6 py-4 text-right text-xs font-medium text-slate-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {paginatedTransactions.map((tx) => (
                <tr
                  key={tx.id}
                  className="hover:bg-slate-800/50 transition-colors cursor-pointer"
                  onClick={() => setSelectedTx(tx)}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div
                        className={`p-2 rounded-lg ${
                          tx.type === 'payment'
                            ? 'bg-violet-500/10'
                            : tx.type === 'escrow'
                            ? 'bg-cyan-500/10'
                            : tx.type === 'treasury'
                            ? 'bg-emerald-500/10'
                            : 'bg-amber-500/10'
                        }`}
                      >
                        {tx.sender === 'Treasury Wallet' ? (
                          <ArrowUpRight className="w-4 h-4 text-emerald-400" />
                        ) : (
                          <ArrowDownLeft className="w-4 h-4 text-violet-400" />
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white capitalize">{tx.type}</p>
                        <p className="text-xs text-slate-400 font-mono">{tx.txHash}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <p className="text-sm font-medium text-white">
                      {tx.amount.toLocaleString()} {tx.currency}
                    </p>
                    <p className="text-xs text-slate-400">
                      ~${(tx.amount * 1).toLocaleString()} USD
                    </p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-white truncate max-w-[150px]">{tx.sender}</p>
                    <p className="text-xs text-slate-400 truncate max-w-[150px]">→ {tx.receiver}</p>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">{getStatusBadge(tx.status)}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getComplianceBadge(tx.complianceStatus)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <p className="text-sm text-slate-300">
                      {tx.timestamp.toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </p>
                    <p className="text-xs text-slate-500">
                      {tx.timestamp.toLocaleTimeString('en-US', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        openExplorer(tx);
                      }}
                      className="p-2 text-slate-400 hover:text-violet-400 hover:bg-slate-700 rounded-lg transition-colors"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-6 py-4 border-t border-slate-800 flex items-center justify-between">
          <p className="text-sm text-slate-400">
            Showing {paginatedTransactions.length} of {filteredTransactions.length} filtered transactions
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={currentPage === 1}
              onClick={() => setPage((prev) => Math.max(1, prev - 1))}
              className="px-3 py-1.5 text-sm text-slate-400 hover:text-white bg-slate-800 rounded-lg transition-colors disabled:opacity-50"
            >
              Previous
            </button>
            <span className="px-3 py-1.5 text-sm text-white bg-violet-500 rounded-lg">
              {currentPage} / {totalPages}
            </span>
            <button
              type="button"
              disabled={currentPage === totalPages}
              onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
              className="px-3 py-1.5 text-sm text-slate-400 hover:text-white bg-slate-800 rounded-lg transition-colors disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Transaction Detail Modal */}
      {selectedTx && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70" onClick={() => setSelectedTx(null)} />
          <div className="relative w-full max-w-lg bg-slate-900 rounded-xl border border-slate-800 p-6 shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-white">Transaction Details</h2>
              {getStatusBadge(selectedTx.status)}
            </div>

            <div className="space-y-4">
              <div className="p-4 bg-slate-800/50 rounded-lg">
                <p className="text-xs text-slate-500">Transaction Hash</p>
                <div className="flex items-center gap-2 mt-1">
                  <p className="text-sm font-mono text-violet-400">{selectedTx.txHash}</p>
                  <button
                    type="button"
                    onClick={() => openExplorer(selectedTx)}
                    className="p-1 text-slate-400 hover:text-white transition-colors"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-slate-800/50 rounded-lg">
                  <p className="text-xs text-slate-500">Amount</p>
                  <p className="text-lg font-semibold text-white mt-1">
                    {selectedTx.amount.toLocaleString()} {selectedTx.currency}
                  </p>
                </div>
                <div className="p-4 bg-slate-800/50 rounded-lg">
                  <p className="text-xs text-slate-500">Type</p>
                  <p className="text-lg font-semibold text-white mt-1 capitalize">
                    {selectedTx.type}
                  </p>
                </div>
              </div>

              <div className="p-4 bg-slate-800/50 rounded-lg">
                <p className="text-xs text-slate-500">From</p>
                <p className="text-sm text-white mt-1">{selectedTx.sender}</p>
              </div>

              <div className="p-4 bg-slate-800/50 rounded-lg">
                <p className="text-xs text-slate-500">To</p>
                <p className="text-sm text-white mt-1">{selectedTx.receiver}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-slate-800/50 rounded-lg">
                  <p className="text-xs text-slate-500">Compliance</p>
                  <div className="mt-1">{getComplianceBadge(selectedTx.complianceStatus)}</div>
                </div>
                <div className="p-4 bg-slate-800/50 rounded-lg">
                  <p className="text-xs text-slate-500">Timestamp</p>
                  <p className="text-sm text-white mt-1">
                    {selectedTx.timestamp.toLocaleString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 pt-4">
                <button
                  onClick={() => setSelectedTx(null)}
                  className="flex-1 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-medium rounded-lg transition-colors"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={() => openExplorer(selectedTx)}
                  className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-violet-500 hover:bg-violet-600 text-white font-medium rounded-lg transition-colors"
                >
                  <ExternalLink className="w-4 h-4" />
                  View on Solscan
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
