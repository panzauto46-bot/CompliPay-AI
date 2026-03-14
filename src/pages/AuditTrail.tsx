import { useMemo, useState } from 'react';
import {
  Search,
  Filter,
  FileSearch,
  ShieldCheck,
  Bot,
  Sparkles,
  CircleDollarSign,
  ExternalLink,
} from 'lucide-react';
import { useAppData } from '../context/AppDataContext';
import { AuditEvent } from '../types';

type CategoryFilter = 'all' | AuditEvent['category'];

function categoryStyle(category: AuditEvent['category']) {
  switch (category) {
    case 'payment':
      return {
        badge: 'bg-cyan-500/10 text-cyan-300 border-cyan-500/30',
        icon: <CircleDollarSign className="w-4 h-4" />,
      };
    case 'compliance':
      return {
        badge: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30',
        icon: <ShieldCheck className="w-4 h-4" />,
      };
    case 'execution':
      return {
        badge: 'bg-violet-500/10 text-violet-300 border-violet-500/30',
        icon: <Sparkles className="w-4 h-4" />,
      };
    case 'ai':
      return {
        badge: 'bg-amber-500/10 text-amber-300 border-amber-500/30',
        icon: <Bot className="w-4 h-4" />,
      };
    default:
      return {
        badge: 'bg-slate-500/10 text-slate-300 border-slate-500/30',
        icon: <FileSearch className="w-4 h-4" />,
      };
  }
}

export default function AuditTrail() {
  const { auditEvents, payments, transactions } = useAppData();
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const paymentById = useMemo(
    () => new Map(payments.map((payment) => [payment.id, payment])),
    [payments]
  );
  const txById = useMemo(
    () => new Map(transactions.map((tx) => [tx.id, tx])),
    [transactions]
  );

  const filteredEvents = auditEvents.filter((event) => {
    const categoryMatched = categoryFilter === 'all' || event.category === categoryFilter;
    const query = searchQuery.trim().toLowerCase();
    const paymentName =
      event.paymentId && paymentById.has(event.paymentId)
        ? paymentById.get(event.paymentId)?.name ?? ''
        : '';
    const txHash =
      event.transactionId && txById.has(event.transactionId)
        ? txById.get(event.transactionId)?.txHash ?? ''
        : '';
    const searchMatched =
      query.length === 0 ||
      event.message.toLowerCase().includes(query) ||
      event.action.toLowerCase().includes(query) ||
      event.category.toLowerCase().includes(query) ||
      paymentName.toLowerCase().includes(query) ||
      txHash.toLowerCase().includes(query);
    return categoryMatched && searchMatched;
  });

  const openExplorer = (transactionId?: string) => {
    if (!transactionId) return;
    const tx = txById.get(transactionId);
    if (!tx) return;
    const url =
      tx.explorerUrl ??
      `https://explorer.solana.com/tx/${tx.txHash}?cluster=${
        tx.network === 'testnet' ? 'testnet' : 'devnet'
      }`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Audit Trail</h1>
        <p className="text-slate-400 mt-1">
          Immutable operational evidence for compliance and execution actions
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-slate-900 rounded-xl border border-slate-800 p-4">
          <p className="text-sm text-slate-400">Total Events</p>
          <p className="text-2xl font-semibold text-white mt-1">{auditEvents.length}</p>
        </div>
        <div className="bg-slate-900 rounded-xl border border-slate-800 p-4">
          <p className="text-sm text-slate-400">Execution Events</p>
          <p className="text-2xl font-semibold text-white mt-1">
            {auditEvents.filter((event) => event.category === 'execution').length}
          </p>
        </div>
        <div className="bg-slate-900 rounded-xl border border-slate-800 p-4">
          <p className="text-sm text-slate-400">Compliance Events</p>
          <p className="text-2xl font-semibold text-white mt-1">
            {auditEvents.filter((event) => event.category === 'compliance').length}
          </p>
        </div>
        <div className="bg-slate-900 rounded-xl border border-slate-800 p-4">
          <p className="text-sm text-slate-400">Events With Tx Evidence</p>
          <p className="text-2xl font-semibold text-white mt-1">
            {auditEvents.filter((event) => Boolean(event.transactionId)).length}
          </p>
        </div>
      </div>

      <div className="bg-slate-900 rounded-xl border border-slate-800 p-4">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search by action, message, payment, or tx hash..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <select
              value={categoryFilter}
              onChange={(event) => setCategoryFilter(event.target.value as CategoryFilter)}
              className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
            >
              <option value="all">All Categories</option>
              <option value="payment">Payment</option>
              <option value="compliance">Compliance</option>
              <option value="execution">Execution</option>
              <option value="ai">AI</option>
            </select>
          </div>
        </div>
      </div>

      <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden">
        <div className="p-4 border-b border-slate-800">
          <h2 className="text-lg font-semibold text-white">Audit Events</h2>
        </div>
        {filteredEvents.length === 0 ? (
          <div className="p-8 text-center">
            <FileSearch className="w-8 h-8 text-slate-500 mx-auto mb-2" />
            <p className="text-slate-300">No audit events found for this filter.</p>
            <p className="text-sm text-slate-500 mt-1">
              Run payment and compliance actions to generate evidence.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-800">
            {filteredEvents.map((event) => {
              const category = categoryStyle(event.category);
              const paymentName = event.paymentId
                ? paymentById.get(event.paymentId)?.name ?? event.paymentId
                : null;
              const tx = event.transactionId ? txById.get(event.transactionId) : undefined;
              return (
                <article key={event.id} className="p-4 hover:bg-slate-800/40 transition-colors">
                  <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                    <div className="flex items-start gap-3 min-w-0">
                      <div className="p-2 bg-slate-800 rounded-lg text-slate-200">
                        {category.icon}
                      </div>
                      <div className="space-y-2 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 text-xs uppercase tracking-wide font-medium rounded border ${category.badge}`}
                          >
                            {event.category}
                          </span>
                          <span className="px-2 py-0.5 text-xs rounded bg-slate-800 text-slate-300 uppercase">
                            {event.action}
                          </span>
                        </div>
                        <p className="text-sm text-white">{event.message}</p>
                        <div className="text-xs text-slate-400 space-y-1">
                          {paymentName && <p>Payment: {paymentName}</p>}
                          {tx && <p>Tx Hash: {tx.txHash}</p>}
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col items-start lg:items-end gap-2">
                      <span className="text-xs text-slate-500">
                        {event.timestamp.toLocaleString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                      {tx && (
                        <button
                          type="button"
                          onClick={() => openExplorer(event.transactionId)}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-100 rounded-lg transition-colors"
                        >
                          Open Explorer
                          <ExternalLink className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
