import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface CityRankingItemProps {
  rank: number;
  cityName: string;
  score: number;
  trendPercentage: number;
  maxScore: number;
}

export function CityRankingItem({ rank, cityName, score, trendPercentage, maxScore }: CityRankingItemProps) {
  const barWidth = (score / maxScore) * 100;
  const trendColor = trendPercentage > 0 ? 'text-green-600' : trendPercentage < 0 ? 'text-red-600' : 'text-slate-500';
  const TrendIcon = trendPercentage > 0 ? TrendingUp : trendPercentage < 0 ? TrendingDown : Minus;

  return (
    <div className="flex items-center gap-4 py-2">
      <div className="w-8 text-xs font-semibold text-slate-600">{rank}</div>
      <div className="w-40 text-xs font-medium text-slate-900">{cityName}</div>
      <div className="flex-1 relative h-6 bg-slate-100 rounded overflow-hidden">
        <div
          className="absolute inset-y-0 left-0 bg-blue-900 flex items-center justify-end pr-2"
          style={{ width: `${barWidth}%` }}
        >
          <div className="w-2 h-2 bg-white rounded-full"></div>
        </div>
      </div>
      <div className="w-12 text-xs font-bold text-slate-900 text-right">{score}</div>
      <div className={`w-20 flex items-center gap-1 text-xs font-medium ${trendColor}`}>
        <TrendIcon className="w-3 h-3" />
        <span>{trendPercentage > 0 ? '+' : ''}{trendPercentage.toFixed(0)}%</span>
      </div>
    </div>
  );
}
