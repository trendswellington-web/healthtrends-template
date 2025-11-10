import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { ChartDataPoint } from '../types';

interface InterestOverTimeChartProps {
  data: ChartDataPoint[];
  keywords: string[];
}

const colors = ['#1e40af', '#475569', '#64748b', '#334155'];

export function InterestOverTimeChart({ data, keywords }: InterestOverTimeChartProps) {
  return (
    <div className="bg-white border border-slate-200 rounded-lg p-4">
      <h2 className="text-lg font-semibold text-slate-900 mb-4">Interest Over Time</h2>
      <ResponsiveContainer width="100%" height={350}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis
            dataKey="date"
            stroke="#94a3b8"
            tick={{ fontSize: 11 }}
            tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          />
          <YAxis stroke="#94a3b8" tick={{ fontSize: 11 }} domain={[0, 100]} />
          <Tooltip
            contentStyle={{
              backgroundColor: 'white',
              border: '1px solid #e2e8f0',
              borderRadius: '4px',
              padding: '8px 12px',
              fontSize: '12px'
            }}
            labelFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          />
          <Legend wrapperStyle={{ paddingTop: '16px', fontSize: '12px' }} />
          {keywords.map((keyword, index) => (
            <Line
              key={keyword}
              type="monotone"
              dataKey={keyword}
              stroke={colors[index % colors.length]}
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4 }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
