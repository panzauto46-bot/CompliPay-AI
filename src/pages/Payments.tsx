import { FormEvent, useMemo, useState } from 'react';
import {
  Plus,
  Search,
  Filter,
  Play,
  Edit,
  Calendar,
  DollarSign,
  CheckCircle,
  Clock,
  Sparkles,
  ShieldCheck,
} from 'lucide-react';
import { ProgrammablePayment } from '../types';
import { useAppData } from '../context/AppDataContext';

type PaymentType = 'all' | 'escrow' | 'milestone' | 'subscription' | 'automated';

const INITIAL_FORM = {
  name: '',
  type: 'escrow' as ProgrammablePayment['type'],
  amount: '',
  currency: 'USDC',
  recipient: '',
  conditions: '',
  recipientKycVerified: true,
  travelRuleReady: true,
};

function decisionBadge(payment: ProgrammablePayment) {
  const decision = payment.complianceResult?.decision;
  if (!decision) {
    return (
      <span className="px-2 py-0.5 text-xs bg-slate-700 text-slate-300 rounded-full">
        Not Checked
      </span>
    );
  }

  if (decision === 'allow') {
    return (
      <span className="px-2 py-0.5 text-xs font-medium bg-emerald-500/10 text-emerald-400 rounded border border-emerald-500/20">
        ALLOW
      </span>
    );
  }
  if (decision === 'review') {
    return (
      <span className="px-2 py-0.5 text-xs font-medium bg-amber-500/10 text-amber-400 rounded border border-amber-500/20">
        REVIEW
      </span>
    );
  }
  return (
    <span className="px-2 py-0.5 text-xs font-medium bg-red-500/10 text-red-400 rounded border border-red-500/20">
      BLOCK
    </span>
  );
}

export default function Payments() {
  const {
    payments,
    createPayment,
    runCompliance,
    executePayment,
    requestAIRecommendation,
  } = useAppData();

  const [filterType, setFilterType] = useState<PaymentType>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedPaymentId, setSelectedPaymentId] = useState<string | null>(null);
  const [isExecuting, setIsExecuting] = useState(false);
  const [form, setForm] = useState(INITIAL_FORM);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [aiRecommendation, setAiRecommendation] = useState<{
    paymentId: string;
    message: string;
  } | null>(null);

  const selectedPayment = useMemo(
    () => payments.find((payment) => payment.id === selectedPaymentId) ?? null,
    [payments, selectedPaymentId]
  );

  const filteredPayments = payments.filter((payment) => {
    const matchesType = filterType === 'all' || payment.type === filterType;
    const matchesSearch =
      payment.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      payment.recipient.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesSearch;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-emerald-500/10 text-emerald-400 rounded-full border border-emerald-500/20">
            <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
            Active
          </span>
        );
      case 'paused':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-amber-500/10 text-amber-400 rounded-full border border-amber-500/20">
            Paused
          </span>
        );
      case 'completed':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-slate-500/10 text-slate-400 rounded-full border border-slate-500/20">
            Completed
          </span>
        );
      case 'draft':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-slate-700 text-slate-300 rounded-full">
            Draft
          </span>
        );
      default:
        return null;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'escrow':
        return <DollarSign className="w-5 h-5 text-violet-400" />;
      case 'milestone':
        return <CheckCircle className="w-5 h-5 text-cyan-400" />;
      case 'subscription':
        return <Calendar className="w-5 h-5 text-emerald-400" />;
      case 'automated':
        return <Clock className="w-5 h-5 text-amber-400" />;
      default:
        return null;
    }
  };

  const handleCreatePayment = async (event: FormEvent) => {
    event.preventDefault();
    const amount = Number(form.amount);
    if (!form.name.trim() || !form.recipient.trim() || !amount || amount <= 0) {
      setFeedback('Please provide a valid name, recipient, and amount.');
      return;
    }

    const conditions = form.conditions
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean);

    try {
      const created = await createPayment({
        name: form.name.trim(),
        type: form.type,
        amount,
        currency: form.currency,
        recipient: form.recipient.trim(),
        conditions: conditions.length > 0 ? conditions : ['Policy validated'],
        recipientKycVerified: form.recipientKycVerified,
        travelRuleReady: form.travelRuleReady,
      });

      setFeedback(`Payment contract "${created.name}" created successfully.`);
      setForm(INITIAL_FORM);
      setShowCreateModal(false);
      setSelectedPaymentId(created.id);
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : 'Failed to create payment contract.');
    }
  };

  const handleRunCompliance = async (paymentId: string) => {
    try {
      const result = await runCompliance(paymentId);
      setFeedback(`Compliance result: ${result.decision.toUpperCase()} (score ${result.score}).`);
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : 'Failed to run compliance.');
    }
  };

  const handleAIRecommendation = async (paymentId: string) => {
    try {
      const recommendation = await requestAIRecommendation(paymentId);
      setAiRecommendation({ paymentId, message: recommendation });
      setFeedback('AI recommendation generated.');
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : 'Failed to generate AI recommendation.');
    }
  };

  const handleExecutePayment = async (paymentId: string, mode: 'manual' | 'ai') => {
    setIsExecuting(true);
    try {
      const tx = await executePayment(paymentId, mode);
      setFeedback(
        `${mode.toUpperCase()} execution ${tx.simulated ? 'simulated' : 'confirmed'} on ${tx.network}. Tx: ${tx.txHash.slice(0, 12)}...`
      );
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : 'Execution failed.');
    } finally {
      setIsExecuting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Programmable Payments</h1>
          <p className="text-slate-400 mt-1">
            Create contracts, run compliance, then execute on Solana.
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-violet-500 hover:bg-violet-600 text-white font-medium rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          Create Payment
        </button>
      </div>

      {feedback && (
        <div className="p-3 bg-slate-800/60 border border-slate-700 rounded-lg text-sm text-slate-200">
          {feedback}
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search payments..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <div className="flex bg-slate-800 rounded-lg p-1">
            {(['all', 'escrow', 'milestone', 'subscription', 'automated'] as PaymentType[]).map(
              (type) => (
                <button
                  key={type}
                  onClick={() => setFilterType(type)}
                  className={`px-3 py-1.5 text-sm font-medium rounded-md capitalize transition-colors ${
                    filterType === type
                      ? 'bg-violet-500 text-white'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {type}
                </button>
              )
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredPayments.map((payment) => (
          <div
            key={payment.id}
            className="bg-slate-900 rounded-xl border border-slate-800 p-6 hover:border-slate-700 transition-colors cursor-pointer"
            onClick={() => setSelectedPaymentId(payment.id)}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-slate-800 rounded-lg">{getTypeIcon(payment.type)}</div>
                <div>
                  <h3 className="font-medium text-white">{payment.name}</h3>
                  <p className="text-sm text-slate-400 capitalize">{payment.type} payment</p>
                </div>
              </div>
              <div className="flex flex-col items-end gap-1">
                {getStatusBadge(payment.status)}
                {decisionBadge(payment)}
              </div>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-slate-500">Amount</p>
                <p className="text-lg font-semibold text-white">
                  {payment.amount.toLocaleString()} {payment.currency}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Recipient</p>
                <p className="text-sm text-slate-300 truncate">{payment.recipient}</p>
              </div>
            </div>

            <div className="mt-4">
              <p className="text-xs text-slate-500 mb-2">Conditions</p>
              <div className="flex flex-wrap gap-2">
                {payment.conditions.slice(0, 2).map((condition, index) => (
                  <span key={index} className="px-2 py-1 text-xs bg-slate-800 text-slate-300 rounded">
                    {condition}
                  </span>
                ))}
                {payment.conditions.length > 2 && (
                  <span className="px-2 py-1 text-xs bg-slate-800 text-slate-400 rounded">
                    +{payment.conditions.length - 2} more
                  </span>
                )}
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRunCompliance(payment.id);
                  }}
                  className="p-2 text-slate-400 hover:text-emerald-400 hover:bg-slate-800 rounded-lg transition-colors"
                  title="Run compliance"
                >
                  <ShieldCheck className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleAIRecommendation(payment.id);
                  }}
                  className="p-2 text-slate-400 hover:text-cyan-400 hover:bg-slate-800 rounded-lg transition-colors"
                  title="AI recommendation"
                >
                  <Sparkles className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedPaymentId(payment.id);
                  }}
                  className="p-2 text-slate-400 hover:text-violet-400 hover:bg-slate-800 rounded-lg transition-colors"
                  title="Open details"
                >
                  <Edit className="w-4 h-4" />
                </button>
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleExecutePayment(payment.id, 'manual');
                }}
                className="p-2 text-slate-400 hover:text-emerald-400 hover:bg-slate-800 rounded-lg transition-colors"
                title="Execute now"
              >
                <Play className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70" onClick={() => setShowCreateModal(false)} />
          <div className="relative w-full max-w-lg bg-slate-900 rounded-xl border border-slate-800 p-6 shadow-xl">
            <h2 className="text-xl font-semibold text-white mb-6">Create Programmable Payment</h2>

            <form className="space-y-4" onSubmit={handleCreatePayment}>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Payment Name</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                  placeholder="Quarterly supplier payout"
                  className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Payment Type</label>
                <select
                  value={form.type}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      type: e.target.value as ProgrammablePayment['type'],
                    }))
                  }
                  className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
                >
                  <option value="escrow">Escrow</option>
                  <option value="milestone">Milestone</option>
                  <option value="subscription">Subscription</option>
                  <option value="automated">Automated Treasury</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Amount</label>
                  <input
                    type="number"
                    value={form.amount}
                    onChange={(e) => setForm((prev) => ({ ...prev, amount: e.target.value }))}
                    placeholder="100000"
                    className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Currency</label>
                  <select
                    value={form.currency}
                    onChange={(e) => setForm((prev) => ({ ...prev, currency: e.target.value }))}
                    className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
                  >
                    <option value="USDC">USDC</option>
                    <option value="USDT">USDT</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Recipient</label>
                <input
                  type="text"
                  value={form.recipient}
                  onChange={(e) => setForm((prev) => ({ ...prev, recipient: e.target.value }))}
                  placeholder="Institutional counterparty"
                  className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Conditions</label>
                <textarea
                  value={form.conditions}
                  onChange={(e) => setForm((prev) => ({ ...prev, conditions: e.target.value }))}
                  placeholder="Invoice approved&#10;Service delivered"
                  rows={3}
                  className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500 resize-none"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <label className="flex items-center gap-2 text-sm text-slate-300">
                  <input
                    type="checkbox"
                    checked={form.recipientKycVerified}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, recipientKycVerified: e.target.checked }))
                    }
                  />
                  Recipient KYC verified
                </label>
                <label className="flex items-center gap-2 text-sm text-slate-300">
                  <input
                    type="checkbox"
                    checked={form.travelRuleReady}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, travelRuleReady: e.target.checked }))
                    }
                  />
                  Travel Rule data ready
                </label>
              </div>

              <div className="flex items-center gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-medium rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2.5 bg-violet-500 hover:bg-violet-600 text-white font-medium rounded-lg transition-colors"
                >
                  Create Payment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {selectedPayment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70" onClick={() => setSelectedPaymentId(null)} />
          <div className="relative w-full max-w-xl bg-slate-900 rounded-xl border border-slate-800 p-6 shadow-xl">
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-slate-800 rounded-lg">{getTypeIcon(selectedPayment.type)}</div>
                <div>
                  <h2 className="text-xl font-semibold text-white">{selectedPayment.name}</h2>
                  <p className="text-sm text-slate-400 capitalize">{selectedPayment.type} payment</p>
                </div>
              </div>
              <div className="flex flex-col items-end gap-1">
                {getStatusBadge(selectedPayment.status)}
                {decisionBadge(selectedPayment)}
              </div>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-slate-800/50 rounded-lg">
                  <p className="text-xs text-slate-500">Amount</p>
                  <p className="text-xl font-semibold text-white">
                    {selectedPayment.amount.toLocaleString()} {selectedPayment.currency}
                  </p>
                </div>
                <div className="p-4 bg-slate-800/50 rounded-lg">
                  <p className="text-xs text-slate-500">Recipient</p>
                  <p className="text-sm text-white truncate">{selectedPayment.recipient}</p>
                </div>
              </div>

              <div className="p-4 bg-slate-800/50 rounded-lg">
                <p className="text-xs text-slate-500 mb-2">Compliance Summary</p>
                {selectedPayment.complianceResult ? (
                  <div className="space-y-2 text-sm text-slate-200">
                    <p>
                      Decision: <span className="font-semibold">{selectedPayment.complianceResult.decision.toUpperCase()}</span>
                      {' '}• Score: <span className="font-semibold">{selectedPayment.complianceResult.score}</span>
                    </p>
                    <ul className="list-disc pl-5 space-y-1 text-slate-300">
                      {selectedPayment.complianceResult.reasons.map((reason, index) => (
                        <li key={index}>{reason}</li>
                      ))}
                    </ul>
                  </div>
                ) : (
                  <p className="text-sm text-slate-400">
                    Compliance has not been evaluated for this payment yet.
                  </p>
                )}
              </div>

              <div className="p-4 bg-slate-800/50 rounded-lg">
                <p className="text-xs text-slate-500 mb-3">Conditions</p>
                <div className="space-y-2">
                  {selectedPayment.conditions.map((condition, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-slate-500" />
                      <span className="text-sm text-slate-300">{condition}</span>
                    </div>
                  ))}
                </div>
              </div>

              {aiRecommendation?.paymentId === selectedPayment.id && (
                <div className="p-4 bg-cyan-500/10 border border-cyan-500/20 rounded-lg">
                  <p className="text-xs text-cyan-300 mb-1">AI Recommendation</p>
                  <p className="text-sm text-cyan-100">{aiRecommendation.message}</p>
                </div>
              )}

              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => handleRunCompliance(selectedPayment.id)}
                  className="flex-1 min-w-[160px] inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-medium rounded-lg transition-colors"
                >
                  <ShieldCheck className="w-4 h-4" />
                  Run Compliance
                </button>
                <button
                  type="button"
                  onClick={() => handleAIRecommendation(selectedPayment.id)}
                  className="flex-1 min-w-[160px] inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-cyan-500 hover:bg-cyan-600 text-white font-medium rounded-lg transition-colors"
                >
                  <Sparkles className="w-4 h-4" />
                  AI Recommend
                </button>
                <button
                  type="button"
                  onClick={() => handleExecutePayment(selectedPayment.id, 'manual')}
                  disabled={isExecuting}
                  className="flex-1 min-w-[160px] inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-violet-500 hover:bg-violet-600 disabled:opacity-60 text-white font-medium rounded-lg transition-colors"
                >
                  <Play className="w-4 h-4" />
                  {isExecuting ? 'Executing...' : 'Execute Now'}
                </button>
                <button
                  type="button"
                  onClick={() => handleExecutePayment(selectedPayment.id, 'ai')}
                  disabled={isExecuting}
                  className="flex-1 min-w-[160px] inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-amber-500 hover:bg-amber-600 disabled:opacity-60 text-white font-medium rounded-lg transition-colors"
                >
                  <Sparkles className="w-4 h-4" />
                  {isExecuting ? 'Executing...' : 'Execute With AI'}
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedPaymentId(null)}
                  className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-medium rounded-lg transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
