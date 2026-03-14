import { ReactNode } from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string;
  change?: number;
  icon: ReactNode;
  iconBg?: string;
}

export default function StatCard({ title, value, change, icon, iconBg = 'bg-violet-500/10' }: StatCardProps) {
  return (
    <div className="bg-slate-900 rounded-xl border border-slate-800 p-6">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-slate-400">{title}</p>
          <p className="mt-2 text-2xl font-semibold text-white">{value}</p>
          {change !== undefined && (
            <div className="flex items-center gap-1 mt-2">
              {change >= 0 ? (
                <TrendingUp className="w-4 h-4 text-emerald-400" />
              ) : (
                <TrendingDown className="w-4 h-4 text-red-400" />
              )}
              <span className={`text-sm ${change >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                {change >= 0 ? '+' : ''}{change}%
              </span>
              <span className="text-sm text-slate-500">vs last week</span>
            </div>
          )}
        </div>
        <div className={`p-3 rounded-lg ${iconBg}`}>
          {icon}
        </div>
      </div>
    </div>
  );
}
