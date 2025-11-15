'use client';

import { motion } from 'framer-motion';
import { GlassmorphicCard } from '@/components/ui/GlassmorphicCard';
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';

interface ComparisonChartProps {
  title: string;
  currentPeriodData: any[];
  previousPeriodData: any[];
  dataKey: string;
  dataLabel: string;
  height?: number;
}

export function ComparisonChart({
  title,
  currentPeriodData,
  previousPeriodData,
  dataKey,
  dataLabel,
  height = 300,
}: ComparisonChartProps) {
  // Merge data for comparison
  const mergedData = currentPeriodData.map((current, index) => ({
    period: current.period,
    current: current[dataKey] || 0,
    previous: previousPeriodData[index]?.[dataKey] || 0,
  }));

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const current = payload.find((p: any) => p.dataKey === 'current');
      const previous = payload.find((p: any) => p.dataKey === 'previous');
      const change =
        previous?.value > 0
          ? (((current?.value - previous?.value) / previous?.value) * 100).toFixed(1)
          : 0;

      return (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-gray-900/95 backdrop-blur-xl border border-white/20 rounded-lg p-4 shadow-2xl"
        >
          <p className="text-sm font-semibold text-white mb-2">{label}</p>
          <div className="space-y-1">
            <div className="flex items-center justify-between gap-4">
              <span className="text-sm text-blue-400">Current:</span>
              <span className="text-sm font-bold text-blue-400">
                {current?.value?.toLocaleString()}
              </span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="text-sm text-gray-400">Previous:</span>
              <span className="text-sm font-bold text-gray-400">
                {previous?.value?.toLocaleString()}
              </span>
            </div>
            <div className="flex items-center justify-between gap-4 pt-2 border-t border-white/10">
              <span className="text-sm text-gray-300">Change:</span>
              <span
                className={`text-sm font-bold ${
                  Number(change) > 0
                    ? 'text-green-400'
                    : Number(change) < 0
                      ? 'text-red-400'
                      : 'text-gray-400'
                }`}
              >
                {Number(change) > 0 ? '+' : ''}
                {change}%
              </span>
            </div>
          </div>
        </motion.div>
      );
    }
    return null;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <GlassmorphicCard className="p-6">
        <h3 className="text-xl font-bold text-white mb-6">{title}</h3>
        <ResponsiveContainer width="100%" height={height}>
          <ComposedChart
            data={mergedData}
            margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
          >
            <defs>
              <linearGradient id="currentGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.1} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
            <XAxis
              dataKey="period"
              stroke="#6B7280"
              style={{ fontSize: '12px', fill: '#9CA3AF' }}
            />
            <YAxis
              stroke="#6B7280"
              style={{ fontSize: '12px', fill: '#9CA3AF' }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              wrapperStyle={{ fontSize: '12px', color: '#9CA3AF' }}
              iconType="circle"
            />
            <Bar
              dataKey="previous"
              fill="#6B7280"
              name={`Previous ${dataLabel}`}
              radius={[4, 4, 0, 0]}
              opacity={0.5}
            />
            <Line
              type="monotone"
              dataKey="current"
              stroke="#3B82F6"
              strokeWidth={3}
              dot={{ fill: '#3B82F6', r: 5 }}
              name={`Current ${dataLabel}`}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </GlassmorphicCard>
    </motion.div>
  );
}
