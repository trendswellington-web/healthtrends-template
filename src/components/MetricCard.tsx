import { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  icon: LucideIcon;
  title: string;
  value: string | number;
  subtitle?: string;
  gradient?: string;
}

export function MetricCard({ icon: Icon, title, value, subtitle }: MetricCardProps) {
  return (
    <div className="bg-white border border-slate-200 rounded-lg p-4">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <Icon className="w-4 h-4 text-blue-900" />
            <div className="text-xs font-medium text-slate-600">{title}</div>
          </div>
          <div className="text-2xl font-bold text-slate-900 mb-0.5">{value}</div>
          {subtitle && (
            <div className="text-xs text-slate-500">{subtitle}</div>
          )}
        </div>
      </div>
    </div>
  );
}
