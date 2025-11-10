interface RegionHeatmapCellProps {
  regionName: string;
  score: number;
  intensityLevel: string;
}

const getIntensityColor = (level: string): string => {
  switch (level) {
    case 'Very High':
      return 'bg-blue-900 text-white border-blue-900';
    case 'High':
      return 'bg-blue-700 text-white border-blue-700';
    case 'Moderate':
      return 'bg-blue-400 text-white border-blue-400';
    case 'Low':
      return 'bg-slate-200 text-slate-900 border-slate-300';
    default:
      return 'bg-slate-100 text-slate-900 border-slate-200';
  }
};

export function RegionHeatmapCell({ regionName, score, intensityLevel }: RegionHeatmapCellProps) {
  return (
    <div className={`rounded border p-3 ${getIntensityColor(intensityLevel)}`}>
      <div className="font-medium text-xs mb-1">{regionName}</div>
      <div className="text-xl font-bold mb-0.5">{score}</div>
      <div className="text-xs opacity-80">{intensityLevel}</div>
    </div>
  );
}
