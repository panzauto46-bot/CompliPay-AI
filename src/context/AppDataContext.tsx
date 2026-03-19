import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { chartData as seededChartData } from '../data/mockData';
import { apiRequest } from '../lib/api';
import { useAuth } from './AuthContext';
import {
  AIAgentTask,
  AuditEvent,
  BatchExecutionResultItem,
  BatchExecutionSummary,
  ComplianceAlert,
  ComplianceResult,
  ProgrammablePayment,
  Transaction,
  WalletInfo,
} from '../types';

interface CreatePaymentPayload {
  name: string;
  type: ProgrammablePayment['type'];
  amount: number;
  currency: string;
  recipient: string;
  conditions: string[];
  nextExecution?: Date;
  recipientKycVerified: boolean;
  travelRuleReady: boolean;
}

interface ChartData {
  volumeByDay: Array<{ date: string; volume: number }>;
  transactionsByType: Array<{ name: string; value: number }>;
  complianceMetrics: Array<{ month: string; passed: number; flagged: number }>;
}

interface AppDataContextValue {
  currentUserName: string;
  loading: boolean;
  payments: ProgrammablePayment[];
  transactions: Transaction[];
  complianceAlerts: ComplianceAlert[];
  aiAgentTasks: AIAgentTask[];
  walletsData: WalletInfo[];
  auditEvents: AuditEvent[];
  chartData: ChartData;
  createPayment: (payload: CreatePaymentPayload) => Promise<ProgrammablePayment>;
  runCompliance: (paymentId: string) => Promise<ComplianceResult>;
  executePayment: (paymentId: string, mode: 'manual' | 'ai') => Promise<Transaction>;
  executeBatchPayments: (
    paymentIds: string[],
    mode: 'manual' | 'ai'
  ) => Promise<{ batchId: string; summary: BatchExecutionSummary; results: BatchExecutionResultItem[] }>;
  requestAIRecommendation: (paymentId: string) => Promise<string>;
  runAutomationTask: (taskId: string) => Promise<AIAgentTask>;
  pauseAutomationTask: (taskId: string) => Promise<AIAgentTask>;
  resolveAlert: (alertId: string) => Promise<void>;
  refreshWalletBalances: () => Promise<void>;
  exportTransactionsCsv: () => void;
}

const AppDataContext = createContext<AppDataContextValue | null>(null);

function parseDate(value?: string | Date | null): Date | undefined {
  if (!value) return undefined;
  return value instanceof Date ? value : new Date(value);
}

function hydrateComplianceResult(input?: any): ComplianceResult | undefined {
  if (!input) return undefined;
  return {
    ...input,
    evaluatedAt: parseDate(input.evaluatedAt) ?? new Date(),
  };
}

function hydratePayment(item: any): ProgrammablePayment {
  return {
    ...item,
    createdAt: parseDate(item.createdAt) ?? new Date(),
    nextExecution: parseDate(item.nextExecution),
    complianceResult: hydrateComplianceResult(item.complianceResult),
    updatedAt: parseDate(item.updatedAt),
  };
}

function hydrateTransaction(item: any): Transaction {
  return {
    ...item,
    timestamp: parseDate(item.timestamp) ?? new Date(),
  };
}

function hydrateAlert(item: any): ComplianceAlert {
  return {
    ...item,
    timestamp: parseDate(item.timestamp) ?? new Date(),
  };
}

function hydrateTask(item: any): AIAgentTask {
  return {
    ...item,
    lastRun: parseDate(item.lastRun),
    nextRun: parseDate(item.nextRun),
  };
}

function hydrateAudit(item: any): AuditEvent {
  return {
    ...item,
    timestamp: parseDate(item.timestamp) ?? new Date(),
  };
}

function formatMonth(date: Date): string {
  return date.toLocaleDateString('en-US', { month: 'short' });
}

function buildChartData(transactions: Transaction[]): ChartData {
  if (transactions.length === 0) {
    return seededChartData;
  }

  const last7Days = Array.from({ length: 7 }, (_, idx) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - idx));
    d.setHours(0, 0, 0, 0);
    return d;
  });

  const volumeByDay = last7Days.map((date) => {
    const dateKey = date.toDateString();
    const volume = transactions
      .filter((tx) => tx.timestamp.toDateString() === dateKey)
      .reduce((sum, tx) => sum + tx.amount, 0);
    return {
      date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      volume,
    };
  });

  const hasRecentVolume = volumeByDay.some((entry) => entry.volume > 0);
  const typeCounts = transactions.reduce<Record<string, number>>((acc, tx) => {
    acc[tx.type] = (acc[tx.type] || 0) + 1;
    return acc;
  }, {});

  const totalCount = transactions.length;
  const transactionsByType = [
    { name: 'Payments', value: Math.round(((typeCounts.payment || 0) / totalCount) * 100) || 0 },
    { name: 'Escrow', value: Math.round(((typeCounts.escrow || 0) / totalCount) * 100) || 0 },
    { name: 'Treasury', value: Math.round(((typeCounts.treasury || 0) / totalCount) * 100) || 0 },
    {
      name: 'Subscription',
      value: Math.round(((typeCounts.subscription || 0) / totalCount) * 100) || 0,
    },
  ];

  const monthly = transactions.reduce<Record<string, { passed: number; flagged: number }>>(
    (acc, tx) => {
      const key = formatMonth(tx.timestamp);
      if (!acc[key]) {
        acc[key] = { passed: 0, flagged: 0 };
      }
      if (tx.complianceStatus === 'passed') acc[key].passed += 1;
      else acc[key].flagged += 1;
      return acc;
    },
    {}
  );

  const complianceMetrics = Object.entries(monthly).map(([month, value]) => ({
    month,
    passed: value.passed,
    flagged: value.flagged,
  }));

  return {
    volumeByDay: hasRecentVolume ? volumeByDay : seededChartData.volumeByDay,
    transactionsByType,
    complianceMetrics: complianceMetrics.length > 0 ? complianceMetrics : seededChartData.complianceMetrics,
  };
}

export function AppDataProvider({ children }: { children: ReactNode }) {
  const { user, isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(true);
  const [currentUserName, setCurrentUserName] = useState<string>('User');
  const [payments, setPayments] = useState<ProgrammablePayment[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [complianceAlerts, setComplianceAlerts] = useState<ComplianceAlert[]>([]);
  const [aiAgentTasks, setAiAgentTasks] = useState<AIAgentTask[]>([]);
  const [walletsData, setWalletsData] = useState<WalletInfo[]>([]);
  const [auditEvents, setAuditEvents] = useState<AuditEvent[]>([]);

  const loadBootstrap = async () => {
    setLoading(true);
    try {
      const response = await apiRequest<{
        currentUser: { name: string };
        payments: any[];
        transactions: any[];
        complianceAlerts: any[];
        aiAgentTasks: any[];
        wallets: WalletInfo[];
        auditEvents: any[];
      }>('/api/bootstrap');

      setCurrentUserName(response.currentUser?.name || user?.name || 'User');
      setPayments(response.payments.map(hydratePayment));
      setTransactions(response.transactions.map(hydrateTransaction));
      setComplianceAlerts(response.complianceAlerts.map(hydrateAlert));
      setAiAgentTasks(response.aiAgentTasks.map(hydrateTask));
      setWalletsData(response.wallets || []);
      setAuditEvents(response.auditEvents.map(hydrateAudit));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isAuthenticated) {
      setCurrentUserName('User');
      setPayments([]);
      setTransactions([]);
      setComplianceAlerts([]);
      setAiAgentTasks([]);
      setWalletsData([]);
      setAuditEvents([]);
      setLoading(false);
      return;
    }

    loadBootstrap().catch(() => {
      setLoading(false);
    });
  }, [isAuthenticated, user?.id]);

  const createPayment = async (payload: CreatePaymentPayload): Promise<ProgrammablePayment> => {
    const response = await apiRequest<{ payment: any; auditEvent?: any }>('/api/payments', {
      method: 'POST',
      body: JSON.stringify({
        ...payload,
        nextExecution: payload.nextExecution?.toISOString(),
      }),
    });
    const payment = hydratePayment(response.payment);
    setPayments((prev) => [payment, ...prev]);
    if (response.auditEvent) {
      setAuditEvents((prev) => [hydrateAudit(response.auditEvent), ...prev]);
    }
    return payment;
  };

  const runCompliance = async (paymentId: string): Promise<ComplianceResult> => {
    const response = await apiRequest<{
      result: any;
      payment: any;
      alerts: any[];
      auditEvent?: any;
    }>(`/api/payments/${paymentId}/compliance`, {
      method: 'POST',
    });

    const nextPayment = hydratePayment(response.payment);
    setPayments((prev) => prev.map((item) => (item.id === nextPayment.id ? nextPayment : item)));
    if (Array.isArray(response.alerts) && response.alerts.length > 0) {
      setComplianceAlerts((prev) => [...response.alerts.map(hydrateAlert), ...prev]);
    }
    if (response.auditEvent) {
      setAuditEvents((prev) => [hydrateAudit(response.auditEvent), ...prev]);
    }
    return hydrateComplianceResult(response.result)!;
  };

  const requestAIRecommendation = async (paymentId: string): Promise<string> => {
    const response = await apiRequest<{
      recommendation: string;
      task?: any;
      auditEvent?: any;
    }>(`/api/payments/${paymentId}/ai-recommendation`, {
      method: 'POST',
    });

    if (response.task) {
      const task = hydrateTask(response.task);
      setAiAgentTasks((prev) => prev.map((item) => (item.id === task.id ? task : item)));
    }
    if (response.auditEvent) {
      setAuditEvents((prev) => [hydrateAudit(response.auditEvent), ...prev]);
    }
    return response.recommendation;
  };

  const runAutomationTask = async (taskId: string): Promise<AIAgentTask> => {
    const response = await apiRequest<{ task: any; auditEvent?: any }>(`/api/ai/tasks/${taskId}/run`, {
      method: 'POST',
    });

    const task = hydrateTask(response.task);
    setAiAgentTasks((prev) => prev.map((item) => (item.id === task.id ? task : item)));
    if (response.auditEvent) {
      setAuditEvents((prev) => [hydrateAudit(response.auditEvent), ...prev]);
    }
    return task;
  };

  const pauseAutomationTask = async (taskId: string): Promise<AIAgentTask> => {
    const response = await apiRequest<{ task: any; auditEvent?: any }>(`/api/ai/tasks/${taskId}/pause`, {
      method: 'POST',
    });

    const task = hydrateTask(response.task);
    setAiAgentTasks((prev) => prev.map((item) => (item.id === task.id ? task : item)));
    if (response.auditEvent) {
      setAuditEvents((prev) => [hydrateAudit(response.auditEvent), ...prev]);
    }
    return task;
  };

  const executePayment = async (
    paymentId: string,
    mode: 'manual' | 'ai'
  ): Promise<Transaction> => {
    const response = await apiRequest<{
      transaction: any;
      payment: any;
      alerts: any[];
      auditEvent?: any;
    }>(`/api/payments/${paymentId}/execute`, {
      method: 'POST',
      body: JSON.stringify({ mode }),
    });

    const transaction = hydrateTransaction(response.transaction);
    const payment = hydratePayment(response.payment);
    setTransactions((prev) => [transaction, ...prev]);
    setPayments((prev) => prev.map((item) => (item.id === payment.id ? payment : item)));
    if (Array.isArray(response.alerts) && response.alerts.length > 0) {
      setComplianceAlerts((prev) => [...response.alerts.map(hydrateAlert), ...prev]);
    }
    if (response.auditEvent) {
      setAuditEvents((prev) => [hydrateAudit(response.auditEvent), ...prev]);
    }
    return transaction;
  };

  const executeBatchPayments = async (paymentIds: string[], mode: 'manual' | 'ai') => {
    const response = await apiRequest<{
      batchId: string;
      summary: BatchExecutionSummary;
      results: BatchExecutionResultItem[];
      transactions: any[];
      payments: any[];
      alerts: any[];
      auditEvents: any[];
    }>('/api/payments/batch-execute', {
      method: 'POST',
      body: JSON.stringify({ paymentIds, mode }),
    });

    if (Array.isArray(response.transactions) && response.transactions.length > 0) {
      const nextTransactions = response.transactions.map(hydrateTransaction);
      setTransactions((prev) => [...nextTransactions, ...prev]);
    }
    if (Array.isArray(response.payments) && response.payments.length > 0) {
      const nextPayments = response.payments.map(hydratePayment);
      setPayments((prev) =>
        prev.map((item) => nextPayments.find((next) => next.id === item.id) ?? item)
      );
    }
    if (Array.isArray(response.alerts) && response.alerts.length > 0) {
      setComplianceAlerts((prev) => [...response.alerts.map(hydrateAlert), ...prev]);
    }
    if (Array.isArray(response.auditEvents) && response.auditEvents.length > 0) {
      setAuditEvents((prev) => [...response.auditEvents.map(hydrateAudit), ...prev]);
    }

    return {
      batchId: response.batchId,
      summary: response.summary,
      results: response.results,
    };
  };

  const resolveAlert = async (alertId: string) => {
    const response = await apiRequest<{ alert: any; auditEvent?: any }>(
      `/api/compliance/alerts/${alertId}/resolve`,
      {
        method: 'POST',
      }
    );
    const nextAlert = hydrateAlert(response.alert);
    setComplianceAlerts((prev) => prev.map((item) => (item.id === nextAlert.id ? nextAlert : item)));
    if (response.auditEvent) {
      setAuditEvents((prev) => [hydrateAudit(response.auditEvent), ...prev]);
    }
  };

  const refreshWalletBalances = async () => {
    const response = await apiRequest<{ wallets: WalletInfo[] }>('/api/wallets/refresh', {
      method: 'POST',
    });
    setWalletsData(response.wallets);
    loadBootstrap().catch(() => null);
  };

  const exportTransactionsCsv = () => {
    const header =
      'id,type,amount,currency,status,sender,receiver,timestamp,txHash,network,simulated,assetType,tokenMint,batchId\n';
    const rows = transactions
      .map((tx) =>
        [
          tx.id,
          tx.type,
          tx.amount,
          tx.currency,
          tx.status,
          `"${tx.sender}"`,
          `"${tx.receiver}"`,
          tx.timestamp.toISOString(),
          tx.txHash,
          tx.network ?? '',
          tx.simulated ? 'true' : 'false',
          tx.assetType ?? 'sol',
          tx.tokenMint ?? '',
          tx.batchId ?? '',
        ].join(',')
      )
      .join('\n');

    const blob = new Blob([header + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'complipay-transactions.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const chartData = useMemo(() => buildChartData(transactions), [transactions]);

  const value: AppDataContextValue = {
    currentUserName,
    loading,
    payments,
    transactions,
    complianceAlerts,
    aiAgentTasks,
    walletsData,
    auditEvents,
    chartData,
    createPayment,
    runCompliance,
    executePayment,
    executeBatchPayments,
    requestAIRecommendation,
    runAutomationTask,
    pauseAutomationTask,
    resolveAlert,
    refreshWalletBalances,
    exportTransactionsCsv,
  };

  return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>;
}

export function useAppData() {
  const ctx = useContext(AppDataContext);
  if (!ctx) {
    throw new Error('useAppData must be used inside AppDataProvider.');
  }
  return ctx;
}
