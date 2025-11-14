'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils/cn';
import { useTheme, Theme } from '@/lib/theme/ThemeContext';

export interface ThemeToggleProps {
  className?: string;
  variant?: 'icon' | 'dropdown';
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({
  className,
  variant = 'icon',
}) => {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  if (variant === 'dropdown') {
    return (
      <div className={cn('relative', className)}>
        <button
          onClick={() => setDropdownOpen(!dropdownOpen)}
          className="p-2 rounded-lg hover:bg-white/10 transition-colors"
        >
          <ThemeIcon theme={resolvedTheme} />
        </button>

        <AnimatePresence>
          {dropdownOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute right-0 mt-2 w-40 backdrop-blur-xl bg-white/10 dark:bg-black/20 border border-white/20 rounded-xl shadow-2xl overflow-hidden"
            >
              <ThemeOption
                label="Light"
                icon="sun"
                active={theme === 'light'}
                onClick={() => {
                  setTheme('light');
                  setDropdownOpen(false);
                }}
              />
              <ThemeOption
                label="Dark"
                icon="moon"
                active={theme === 'dark'}
                onClick={() => {
                  setTheme('dark');
                  setDropdownOpen(false);
                }}
              />
              <ThemeOption
                label="System"
                icon="system"
                active={theme === 'system'}
                onClick={() => {
                  setTheme('system');
                  setDropdownOpen(false);
                }}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  // Icon variant - simple toggle
  const handleToggle = () => {
    setTheme(resolvedTheme === 'dark' ? 'light' : 'dark');
  };

  return (
    <motion.button
      onClick={handleToggle}
      className={cn(
        'p-2 rounded-lg hover:bg-white/10 transition-colors',
        className
      )}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={resolvedTheme}
          initial={{ rotate: -90, opacity: 0 }}
          animate={{ rotate: 0, opacity: 1 }}
          exit={{ rotate: 90, opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <ThemeIcon theme={resolvedTheme} />
        </motion.div>
      </AnimatePresence>
    </motion.button>
  );
};

const ThemeIcon: React.FC<{ theme: 'light' | 'dark' }> = ({ theme }) => {
  if (theme === 'dark') {
    return (
      <svg
        className="w-6 h-6 text-white"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
        />
      </svg>
    );
  }

  return (
    <svg
      className="w-6 h-6 text-white"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
      />
    </svg>
  );
};

interface ThemeOptionProps {
  label: string;
  icon: 'sun' | 'moon' | 'system';
  active: boolean;
  onClick: () => void;
}

const ThemeOption: React.FC<ThemeOptionProps> = ({ label, icon, active, onClick }) => {
  const icons = {
    sun: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
        />
      </svg>
    ),
    moon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
        />
      </svg>
    ),
    system: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
        />
      </svg>
    ),
  };

  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full flex items-center gap-3 px-4 py-3 transition-colors',
        'hover:bg-white/10',
        active && 'bg-white/20'
      )}
    >
      <span className={cn('text-white', active && 'text-blue-300')}>
        {icons[icon]}
      </span>
      <span className={cn('text-white font-medium', active && 'text-blue-300')}>
        {label}
      </span>
      {active && (
        <svg
          className="w-4 h-4 text-blue-300 ml-auto"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      )}
    </button>
  );
};
