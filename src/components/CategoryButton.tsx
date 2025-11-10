import { LucideIcon } from 'lucide-react';

interface CategoryButtonProps {
  label: string;
  icon: LucideIcon;
  isActive: boolean;
  onClick: () => void;
}

export function CategoryButton({ label, icon: Icon, isActive, onClick }: CategoryButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`
        flex items-center gap-2 px-3 py-1.5 rounded text-xs font-medium whitespace-nowrap
        transition-colors
        ${isActive
          ? 'bg-blue-900 text-white'
          : 'bg-white text-slate-700 border border-slate-300 hover:border-blue-900 hover:text-blue-900'
        }
      `}
    >
      <Icon className="w-3.5 h-3.5" />
      <span>{label}</span>
    </button>
  );
}
