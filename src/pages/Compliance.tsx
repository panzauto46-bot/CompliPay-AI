import { useState } from 'react';
import {
  Shield,
  AlertTriangle,
  CheckCircle,
  Clock,
  Eye,
  FileText,
  UserCheck,
  Activity,
  Globe,
  Search,
  Filter,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { ComplianceAlert } from '../types';
import { useAppData } from '../context/AppDataContext';
import { useAuth } from '../context/AuthContext';

type AlertFilter = 'all' | 'open' | 'investigating' | 'resolved';

export default function Compliance() {
  const { user } = useAuth();
  const { complianceAlerts, chartData, resolveAlert } = useAppData();
  const [alertFilter, setAlertFilter] = useState<AlertFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAlert, setSelectedAlert] = useState<ComplianceAlert | null>(null);
  const canResolveAlerts = user?.role === 'admin' || user?.role === 'operator';

  const filteredAlerts = complianceAlerts.filter((alert) => {
    const statusMatched = alertFilter === 'all' || alert.status === alertFilter;
    const query = searchQuery.trim().toLowerCase();
    const searchMatched =
      query.length === 0 ||
      alert.message.toLowerCase().includes(query) ||
      alert.type.toLowerCase().includes(query) ||
      (alert.transactionId ?? '').toLowerCase().includes(query);
    return statusMatched && searchMatched;
  });

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'text-red-500 bg-red-500/10 border-red-500/20';
      case 'high':
        return 'text-red-400 bg-red-500/10 border-red-500/20';
      case 'medium':
        return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
      case 'low':
        return 'text-slate-400 bg-slate-500/10 border-slate-500/20';
      default:
        return 'text-slate-400 bg-slate-500/10 border-slate-500/20';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'resolved':
        return <CheckCircle className="w-4 h-4 text-emerald-400" />;
      case 'investigating':
        return <Eye className="w-4 h-4 text-amber-400" />;
      case 'open':
        return <Clock className="w-4 h-4 text-slate-400" />;
      default:
        return null;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'kyc':
        return <UserCheck className="w-5 h-5" />;
      case 'kyt':
        return <Activity className="w-5 h-5" />;
      case 'aml':
        return <Shield className="w-5 h-5" />;
      case 'travel_rule':
        return <Globe className="w-5 h-5" />;
      default:
        return <AlertTriangle className="w-5 h-5" />;
    }
  };

  const complianceStats = [
    {
      label: 'KYC Verified',
      value: '156',
      icon: <UserCheck className="w-5 h-5 text-emerald-400" />,
      bg: 'bg-emerald-500/10',
    },
    {
      label: 'KYT Monitored',
      value: '2,340',
      icon: <Activity className="w-5 h-5 text-cyan-400" />,
      bg: 'bg-cyan-500/10',
    },
    {
      label: 'AML Checks',
      value: '98.5%',
      icon: <Shield className="w-5 h-5 text-violet-400" />,
      bg: 'bg-violet-500/10',
    },
    {
      label: 'Travel Rule',
      value: '100%',
      icon: <Globe className="w-5 h-5 text-amber-400" />,
      bg: 'bg-amber-500/10',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Compliance</h1>
        <p className="text-slate-400 mt-1">Monitor KYC, KYT, AML, and Travel Rule compliance</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {complianceStats.map((stat) => (
          <div
            key={stat.label}
            className="bg-slate-900 rounded-xl border border-slate-800 p-4"
          >
            <div className="flex items-center justify-between">
              <p className="text-sm text-slate-400">{stat.label}</p>
              <div className={`p-2 rounded-lg ${stat.bg}`}>{stat.icon}</div>
            </div>
            <p className="mt-2 text-2xl font-semibold text-white">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Compliance Chart */}
      <div className="bg-slate-900 rounded-xl border border-slate-800 p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Compliance Metrics</h2>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData.complianceMetrics}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="month" stroke="#64748b" fontSize={12} />
              <YAxis stroke="#64748b" fontSize={12} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1e293b',
                  border: '1px solid #334155',
                  borderRadius: '8px',
                }}
                labelStyle={{ color: '#f8fafc' }}
              />
              <Legend />
              <Bar dataKey="passed" name="Passed" fill="#10b981" radius={[4, 4, 0, 0]} />
              <Bar dataKey="flagged" name="Flagged" fill="#ef4444" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Alerts Section */}
      <div className="bg-slate-900 rounded-xl border border-slate-800">
        <div className="p-4 border-b border-slate-800">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h2 className="text-lg font-semibold text-white">Compliance Alerts</h2>
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search alerts..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500"
                />
              </div>
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-slate-400" />
                <select
                  value={alertFilter}
                  onChange={(e) => setAlertFilter(e.target.value as AlertFilter)}
                  className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
                >
                  <option value="all">All Status</option>
                  <option value="open">Open</option>
                  <option value="investigating">Investigating</option>
                  <option value="resolved">Resolved</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <div className="divide-y divide-slate-800">
          {filteredAlerts.map((alert) => (
            <div
              key={alert.id}
              className="p-4 hover:bg-slate-800/50 transition-colors cursor-pointer"
              onClick={() => setSelectedAlert(alert)}
            >
              <div className="flex items-start gap-4">
                <div
                  className={`p-2 rounded-lg ${
                    alert.severity === 'high' || alert.severity === 'critical'
                      ? 'bg-red-500/10'
                      : alert.severity === 'medium'
                      ? 'bg-amber-500/10'
                      : 'bg-slate-700'
                  }`}
                >
                  {getTypeIcon(alert.type)}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className={`px-2 py-0.5 text-xs font-medium rounded border uppercase ${getSeverityColor(
                        alert.severity
                      )}`}
                    >
                      {alert.severity}
                    </span>
                    <span className="text-xs text-slate-500 uppercase">{alert.type}</span>
                  </div>
                  <p className="text-sm text-white">{alert.message}</p>
                  <div className="flex items-center gap-4 mt-2">
                    <div className="flex items-center gap-1 text-xs text-slate-400">
                      {getStatusIcon(alert.status)}
                      <span className="capitalize">{alert.status}</span>
                    </div>
                    <span className="text-xs text-slate-500">
                      {alert.timestamp.toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                    {alert.transactionId && (
                      <span className="text-xs text-slate-500">TX: {alert.transactionId}</span>
                    )}
                  </div>
                </div>

                <button className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors">
                  <FileText className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Alert Detail Modal */}
      {selectedAlert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70" onClick={() => setSelectedAlert(null)} />
          <div className="relative w-full max-w-lg bg-slate-900 rounded-xl border border-slate-800 p-6 shadow-xl">
            <div className="flex items-start gap-4 mb-6">
              <div
                className={`p-3 rounded-lg ${
                  selectedAlert.severity === 'high' || selectedAlert.severity === 'critical'
                    ? 'bg-red-500/10'
                    : selectedAlert.severity === 'medium'
                    ? 'bg-amber-500/10'
                    : 'bg-slate-700'
                }`}
              >
                {getTypeIcon(selectedAlert.type)}
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span
                    className={`px-2 py-0.5 text-xs font-medium rounded border uppercase ${getSeverityColor(
                      selectedAlert.severity
                    )}`}
                  >
                    {selectedAlert.severity}
                  </span>
                  <span className="text-xs text-slate-500 uppercase">{selectedAlert.type}</span>
                </div>
                <h2 className="text-lg font-semibold text-white">Alert Details</h2>
              </div>
            </div>

            <div className="space-y-4">
              <div className="p-4 bg-slate-800/50 rounded-lg">
                <p className="text-sm text-white">{selectedAlert.message}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-slate-800/50 rounded-lg">
                  <p className="text-xs text-slate-500">Status</p>
                  <div className="flex items-center gap-2 mt-1">
                    {getStatusIcon(selectedAlert.status)}
                    <span className="text-sm text-white capitalize">{selectedAlert.status}</span>
                  </div>
                </div>
                <div className="p-4 bg-slate-800/50 rounded-lg">
                  <p className="text-xs text-slate-500">Timestamp</p>
                  <p className="text-sm text-white mt-1">
                    {selectedAlert.timestamp.toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              </div>

              {selectedAlert.transactionId && (
                <div className="p-4 bg-slate-800/50 rounded-lg">
                  <p className="text-xs text-slate-500">Related Transaction</p>
                  <p className="text-sm font-mono text-violet-400 mt-1">
                    {selectedAlert.transactionId}
                  </p>
                </div>
              )}

              <div className="flex items-center gap-3 pt-4">
                <button
                  onClick={() => setSelectedAlert(null)}
                  className="flex-1 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-medium rounded-lg transition-colors"
                >
                  Close
                </button>
                {selectedAlert.status !== 'resolved' && canResolveAlerts && (
                  <button
                    onClick={async () => {
                      try {
                        await resolveAlert(selectedAlert.id);
                        setSelectedAlert((prev) =>
                          prev ? { ...prev, status: 'resolved' } : null
                        );
                      } catch {
                        // Keep modal open if API fails.
                      }
                    }}
                    className="flex-1 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-medium rounded-lg transition-colors"
                  >
                    Mark Resolved
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
