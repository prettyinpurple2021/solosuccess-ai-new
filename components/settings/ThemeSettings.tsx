'use client';

import { GlassmorphicCard } from '@/components/ui/GlassmorphicCard';
import { useTheme } from '@/lib/theme/ThemeContext';
import { Sun, Moon, Monitor, Zap } from 'lucide-react';

export function ThemeSettings() {
  const { theme, setTheme, reducedMotion, setReducedMotion } = useTheme();

  const themeOptions = [
    { value: 'light', label: 'Light', icon: Sun, description: 'Bright and clean' },
    { value: 'dark', label: 'Dark', icon: Moon, description: 'Easy on the eyes' },
    { value: 'system', label: 'System', icon: Monitor, description: 'Match your device' },
  ];

  return (
    <GlassmorphicCard className="p-8">
      <div className="flex items-center gap-3 mb-6">
        <Zap className="w-6 h-6 text-yellow-400" />
        <h2 className="text-2xl font-bold text-white">Theme & Display</h2>
      </div>

      <div className="space-y-6">
        {/* Theme Selection */}
        <div>
          <h3 className="text-lg font-semibold text-white mb-4">Color Theme</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {themeOptions.map(option => {
              const Icon = option.icon;
              const isSelected = theme === option.value;
              return (
                <button
                  key={option.value}
                  onClick={() => setTheme(option.value as any)}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    isSelected
                      ? 'border-blue-500 bg-blue-500/20'
                      : 'border-white/10 bg-white/5 hover:bg-white/10'
                  }`}
                >
                  <Icon className={`w-8 h-8 mx-auto mb-2 ${isSelected ? 'text-blue-400' : 'text-gray-400'}`} />
                  <div className="text-center">
                    <p className={`font-semibold ${isSelected ? 'text-white' : 'text-gray-300'}`}>
                      {option.label}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">{option.description}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Motion Settings */}
        <div className="pt-6 border-t border-white/10">
          <h3 className="text-lg font-semibold text-white mb-4">Accessibility</h3>
          <label className="flex items-center justify-between p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-colors cursor-pointer">
            <div>
              <p className="text-white font-medium">Reduce Motion</p>
              <p className="text-sm text-gray-400 mt-1">
                Minimize animations and transitions
              </p>
            </div>
            <input
              type="checkbox"
              checked={reducedMotion}
              onChange={(e) => setReducedMotion(e.target.checked)}
              className="w-5 h-5 rounded bg-white/10 border-white/20 text-blue-500 focus:ring-2 focus:ring-blue-500"
            />
          </label>
        </div>
      </div>
    </GlassmorphicCard>
  );
}
