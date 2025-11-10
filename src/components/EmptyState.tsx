import { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="bg-white border border-slate-200 rounded-lg p-8 text-center">
      <div className="flex justify-center mb-4">
        <div className="p-3 bg-slate-100 rounded-full">
          <Icon className="w-8 h-8 text-slate-400" />
        </div>
      </div>
      <h3 className="text-base font-semibold text-slate-900 mb-2">{title}</h3>
      <p className="text-sm text-slate-600 mb-4 max-w-md mx-auto">{description}</p>
      {action && (
        <button
          onClick={action.onClick}
          className="px-4 py-2 bg-blue-900 text-white rounded text-sm font-medium hover:bg-blue-800 transition-colors"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}
