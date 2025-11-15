'use client';

import { motion } from 'framer-motion';
import { GlassmorphicCard } from '@/components/ui/GlassmorphicCard';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';

interface ChartDataKey {
  key: string;
  label: string;
  color: string;
}

interface GlassmorphicChartProps {
  title: string;
  subtitle?: string;
  data: any[];
  dataKeys: ChartDataKey[];
  type?: 'line' | 'area' | 'bar' | 'pie';
  height?: number;
  showLegend?: boolean;
  showGrid?: boolean;
  animated?: boolean;
}

export function GlassmorphicChart({
  title,
  subtitle,
  data,
  dataKeys,
  type = 'line',
  height = 350,
  showLegend = true,
  showGrid = true,
  animated = true,
}: GlassmorphicChartProps) {
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-gray-900/95 backdrop-blur-xl border border-white/20 rounded-lg p-4 shadow-2xl"
        >
          <p className="text-sm font-semibold text-white mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center justify-between gap-4">
              <span className="text-sm text-gray-300">{entry.name}:</span>
              <span
                className="text-sm font-bold"
                style={{ color: entry.color }}
              >
                {typeof entry.value === 'number'
                  ? entry.value.toLocaleString()
                  : entry.value}
              </span>
            </div>
          ))}
        </motion.div>
      );
    }
    return null;
  };

  const axisStyle = {
    stroke: '#6B7280',
    style: { fontSize: '12px', fill: '#9CA3AF' },
  };

  const renderChart = () => {
    const commonProps = {
      data,
      margin: { top: 10, right: 30, left: 0, bottom: 0 },
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
            {showGrid && (
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
            )}
            <XAxis dataKey="period" {...axisStyle} />
            <YAxis {...axisStyle} />
            <Tooltip content={<CustomTooltip />} />
            {showLegend && (
              <Legend
                wrapperStyle={{ fontSize: '12px', color: '#9CA3AF' }}
                iconType="circle"
              />
            )}
            {dataKeys.map((dk) => (
              <Area
                key={dk.key}
                type="monotone"
                dataKey={dk.key}
                stroke={dk.color}
                strokeWidth={2}
                fill={`url(#gradient-${dk.key})`}
                name={dk.label}
                animationDuration={animated ? 1000 : 0}
              />
            ))}
          </AreaChart>
        );

      case 'bar':
        return (
          <BarChart {...commonProps}>
            {showGrid && (
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
            )}
            <XAxis dataKey="period" {...axisStyle} />
            <YAxis {...axisStyle} />
            <Tooltip content={<CustomTooltip />} />
            {showLegend && (
              <Legend
                wrapperStyle={{ fontSize: '12px', color: '#9CA3AF' }}
                iconType="circle"
              />
            )}
            {dataKeys.map((dk) => (
              <Bar
                key={dk.key}
                dataKey={dk.key}
                fill={dk.color}
                name={dk.label}
                radius={[8, 8, 0, 0]}
                animationDuration={animated ? 1000 : 0}
              />
            ))}
          </BarChart>
        );

      case 'pie':
        return (
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) =>
                `${name}: ${(percent * 100).toFixed(0)}%`
              }
              outerRadius={120}
              fill="#8884d8"
              dataKey={dataKeys[0]?.key || 'value'}
              animationDuration={animated ? 1000 : 0}
            >
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={dataKeys[index % dataKeys.length]?.color || '#8884d8'}
                />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        );

      default:
        return (
          <LineChart {...commonProps}>
            {showGrid && (
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
            )}
            <XAxis dataKey="period" {...axisStyle} />
            <YAxis {...axisStyle} />
            <Tooltip content={<CustomTooltip />} />
            {showLegend && (
              <Legend
                wrapperStyle={{ fontSize: '12px', color: '#9CA3AF' }}
                iconType="circle"
              />
            )}
            {dataKeys.map((dk) => (
              <Line
                key={dk.key}
                type="monotone"
                dataKey={dk.key}
                stroke={dk.color}
                strokeWidth={3}
                dot={{ fill: dk.color, r: 5, strokeWidth: 2, stroke: '#1F2937' }}
                activeDot={{ r: 7 }}
                name={dk.label}
                animationDuration={animated ? 1000 : 0}
              />
            ))}
          </LineChart>
        );
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <GlassmorphicCard className="p-6">
        <div className="mb-6">
          <h3 className="text-xl font-bold text-white mb-1">{title}</h3>
          {subtitle && <p className="text-sm text-gray-400">{subtitle}</p>}
        </div>
        <ResponsiveContainer width="100%" height={height}>
          {renderChart()}
        </ResponsiveContainer>
      </GlassmorphicCard>
    </motion.div>
  );
}
