'use client';

import { useState } from 'react';
import { GlassmorphicCard } from '@/components/ui/GlassmorphicCard';
import { Button } from '@/components/ui/Button';

interface DateRangeSelectorProps {
  onDateRangeChange: (startDate: string, endDate: string) => void;
}

export function DateRangeSelector({ onDateRangeChange }: DateRangeSelectorProps) {
  const [selectedRange, setSelectedRange] = useState('30d');

  const presets = [
    { label: 'Last 7 days', value: '7d', days: 7 },
    { label: 'Last 30 days', value: '30d', days: 30 },
    { label: 'Last 90 days', value: '90d', days: 90 },
    { label: 'Last year', value: '365d', days: 365 },
  ];

  const handlePresetClick = (preset: typeof presets[0]) => {
    setSelectedRange(preset.value);
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - preset.days);

    onDateRangeChange(
      startDate.toISOString().split('T')[0],
      endDate.toISOString().split('T')[0]
    );
  };

  return (
    <GlassmorphicCard className="p-4">
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-sm text-gray-400 mr-2">Time Range:</span>
        {presets.map((preset) => (
          <Button
            key={preset.value}
            variant={selectedRange === preset.value ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => handlePresetClick(preset)}
          >
            {preset.label}
          </Button>
        ))}
      </div>
    </GlassmorphicCard>
  );
}
