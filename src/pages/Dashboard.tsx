import {
  DollarSign,
  ArrowUpRight,
  Shield,
  Bot,
  AlertTriangle,
  CheckCircle,
  Clock,
  XCircle,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import StatCard from '../components/StatCard';
import { useAppData } from '../context/AppDataContext';

const COLORS = ['#8b5cf6', '#06b6d4', '#10b981', '#f59e0b'];

export default function Dashboard() {
  const { transactions, complianceAlerts, aiAgentTasks, chartData, walletsData } = useAppData();
  const totalBalance = walletsData.reduce((acc, w) => acc + w.balance, 0);
  const activeAlerts = complianceAlerts.filter(a => a.status !== 'resolved').length;
  const runningTasks = aiAgentTasks.filter(t => t.status === 'running').length;
  const twentyFourHoursAgo = Date.now() - 24 * 60 * 60 * 1000;
  const volume24h = transactions
    .filter((tx) => tx.timestamp.getTime() >= twentyFourHoursAgo)
    .reduce((sum, tx) => sum + tx.amount, 0);
  const compliancePassed = transactions.filter((tx) => tx.complianceStatus === 'passed').length;
  const complianceScore = transactions.length
    ? ((compliancePassed / transactions.length) * 100).toFixed(1)
    : '0.0';

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-emerald-400" />;
      case 'processing':
        return <Clock className="w-4 h-4 text-amber-400" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-slate-400" />;
      case 'failed':
        return <XCircle className="w-4 h-4 text-red-400" />;
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
      <div>
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <p className="text-slate-400 mt-1">Overview of your payment infrastructure</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Balance"
          value={`$${(totalBalance / 1000000).toFixed(2)}M`}
          change={12.5}
          icon={<DollarSign className="w-5 h-5 text-violet-400" />}
          iconBg="bg-violet-500/10"
        />
        <StatCard
          title="24h Volume"
          value={`$${(volume24h / 1000000).toFixed(2)}M`}
          change={8.3}
          icon={<ArrowUpRight className="w-5 h-5 text-cyan-400" />}
          iconBg="bg-cyan-500/10"
        />
        <StatCard
          title="Compliance Score"
          value={`${complianceScore}%`}
          change={1.2}
          icon={<Shield className="w-5 h-5 text-emerald-400" />}
          iconBg="bg-emerald-500/10"
        />
        <StatCard
          title="AI Tasks Active"
          value={`${runningTasks}`}
          icon={<Bot className="w-5 h-5 text-amber-400" />}
          iconBg="bg-amber-500/10"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Volume Chart */}
        <div className="lg:col-span-2 bg-slate-900 rounded-xl border border-slate-800 p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Transaction Volume</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData.volumeByDay}>
                <defs>
                  <linearGradient id="volumeGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="date" stroke="#64748b" fontSize={12} />
                <YAxis
                  stroke="#64748b"
                  fontSize={12}
                  tickFormatter={(value) => `$${(value / 1000000).toFixed(1)}M`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    border: '1px solid #334155',
                    borderRadius: '8px',
                  }}
                  labelStyle={{ color: '#f8fafc' }}
                  formatter={(value) => [`$${Number(value).toLocaleString()}`, 'Volume']}
                />
                <Area
                  type="monotone"
                  dataKey="volume"
                  stroke="#8b5cf6"
                  strokeWidth={2}
                  fill="url(#volumeGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Transaction Types Pie Chart */}
        <div className="bg-slate-900 rounded-xl border border-slate-800 p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Transaction Types</h2>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData.transactionsByType}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={70}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {chartData.transactionsByType.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    border: '1px solid #334155',
                    borderRadius: '8px',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 space-y-2">
            {chartData.transactionsByType.map((item, index) => (
              <div key={item.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: COLORS[index] }}
                  />
                  <span className="text-sm text-slate-400">{item.name}</span>
                </div>
                <span className="text-sm font-medium text-white">{item.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Transactions & Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Transactions */}
        <div className="bg-slate-900 rounded-xl border border-slate-800">
          <div className="flex items-center justify-between p-4 border-b border-slate-800">
            <h2 className="text-lg font-semibold text-white">Recent Transactions</h2>
            <a href="/transactions" className="text-sm text-violet-400 hover:text-violet-300">
              View all
            </a>
          </div>
          <div className="divide-y divide-slate-800">
            {transactions.slice(0, 5).map((tx) => (
              <div key={tx.id} className="p-4 hover:bg-slate-800/50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(tx.status)}
                    <div>
                      <p className="text-sm font-medium text-white">{tx.receiver}</p>
                      <p className="text-xs text-slate-400 capitalize">{tx.type}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-white">
                      {tx.amount.toLocaleString()} {tx.currency}
                    </p>
                    {getComplianceBadge(tx.complianceStatus)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Compliance Alerts */}
        <div className="bg-slate-900 rounded-xl border border-slate-800">
          <div className="flex items-center justify-between p-4 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-semibold text-white">Compliance Alerts</h2>
              {activeAlerts > 0 && (
                <span className="px-2 py-0.5 text-xs font-medium bg-red-500/10 text-red-400 rounded-full">
                  {activeAlerts}
                </span>
              )}
            </div>
            <a href="/compliance" className="text-sm text-violet-400 hover:text-violet-300">
              View all
            </a>
          </div>
          <div className="divide-y divide-slate-800">
            {complianceAlerts.slice(0, 4).map((alert) => (
              <div key={alert.id} className="p-4 hover:bg-slate-800/50 transition-colors">
                <div className="flex items-start gap-3">
                  <div
                    className={`p-2 rounded-lg ${
                      alert.severity === 'high' || alert.severity === 'critical'
                        ? 'bg-red-500/10'
                        : alert.severity === 'medium'
                        ? 'bg-amber-500/10'
                        : 'bg-slate-700'
                    }`}
                  >
                    <AlertTriangle
                      className={`w-4 h-4 ${
                        alert.severity === 'high' || alert.severity === 'critical'
                          ? 'text-red-400'
                          : alert.severity === 'medium'
                          ? 'text-amber-400'
                          : 'text-slate-400'
                      }`}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-slate-400 uppercase">
                        {alert.type}
                      </span>
                      <span
                        className={`px-1.5 py-0.5 text-xs rounded ${
                          alert.status === 'resolved'
                            ? 'bg-emerald-500/10 text-emerald-400'
                            : alert.status === 'investigating'
                            ? 'bg-amber-500/10 text-amber-400'
                            : 'bg-slate-700 text-slate-300'
                        }`}
                      >
                        {alert.status}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-white truncate">{alert.message}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
