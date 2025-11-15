'use client';

import { GlassmorphicCard } from '@/components/ui/GlassmorphicCard';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface AnalyticsChartProps {
  title: string;
  data: any[];
  dataKeys: { key: string; label: string; color: string }[];
  type?: 'line' | 'area' | 'bar';
  height?: number;
}

export function AnalyticsChart({
  title,
  data,
  dataKeys,
  type = 'line',
  height = 300,
}: AnalyticsChartProps) {
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-gray-900/95 backdrop-blur-xl border border-white/10 rounded-lg p-3 shadow-xl">
          <p className="text-sm text-gray-400 mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {entry.value.toLocaleString()}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const renderChart = () => {
    const commonProps = {
      data,
      margin: { top: 10, right: 30, left: 0, bottom: 0 },
    };

    const axisProps = {
      stroke: '#4B5563',
      style: { fontSize: '12px', fill: '#9CA3AF' },
    };

    switch (type) {
      case 'area':
        return (
          <AreaChart {...commonProps}>
            <defs>
              {dataKeys.map((dk) => (
                <linearGradient
                  key={dk.key}
                  id={`gradient-${dk.key}`}
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop offset="5%" stopColor={dk.color} stopOpacity={0.8} />
                  <stop offset="95%" stopColor={dk.color} stopOpacity={0.1} />
                </linearGradient>
              ))}
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="period" {...axisProps} />
            <YAxis {...axisProps} />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ fontSize: '12px', color: '#9CA3AF' }} />
            {dataKeys.map((dk) => (
              <Area
                key={dk.key}
                type="monotone"
                dataKey={dk.key}
                stroke={dk.color}
                fill={`url(#gradient-${dk.key})`}
                name={dk.label}
              />
            ))}
          </AreaChart>
        );

      case 'bar':
        return (
          <BarChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="period" {...axisProps} />
            <YAxis {...axisProps} />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ fontSize: '12px', color: '#9CA3AF' }} />
            {dataKeys.map((dk) => (
              <Bar key={dk.key} dataKey={dk.key} fill={dk.color} name={dk.label} />
            ))}
          </BarChart>
        );

      default:
        return (
          <LineChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="period" {...axisProps} />
            <YAxis {...axisProps} />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ fontSize: '12px', color: '#9CA3AF' }} />
            {dataKeys.map((dk) => (
              <Line
                key={dk.key}
                type="monotone"
                dataKey={dk.key}
                stroke={dk.color}
                strokeWidth={2}
                dot={{ fill: dk.color, r: 4 }}
                name={dk.label}
              />
            ))}
          </LineChart>
        );
    }
  };

  return (
    <GlassmorphicCard className="p-6">
      <h3 className="text-lg font-semibold text-white mb-4">{title}</h3>
      <ResponsiveContainer width="100%" height={height}>
        {renderChart()}
      </ResponsiveContainer>
    </GlassmorphicCard>
  );
}
