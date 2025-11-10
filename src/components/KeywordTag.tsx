import { X } from 'lucide-react';

interface KeywordTagProps {
  keyword: string;
  onRemove: () => void;
}

export function KeywordTag({ keyword, onRemove }: KeywordTagProps) {
  return (
    <div className="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-300 text-slate-700 rounded text-xs font-medium">
      <span>{keyword}</span>
      <button
        onClick={onRemove}
        className="hover:text-slate-900 transition-colors"
        aria-label={`Remove ${keyword}`}
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
