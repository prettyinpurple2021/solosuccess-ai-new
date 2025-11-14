'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils/cn';
import { GlassmorphicPanel } from '@/components/ui/GlassmorphicPanel';
import { Breadcrumbs } from './Breadcrumbs';

interface DashboardHeaderProps {
  onMenuClick: () => void;
  onSidebarToggle: () => void;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  onMenuClick,
  onSidebarToggle,
}) => {
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-30 p-4">
      <GlassmorphicPanel blur="medium" className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {/* Mobile Menu Button */}
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 rounded-lg hover:bg-white/10 transition-colors"
          >
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
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>

          {/* Desktop Sidebar Toggle */}
          <button
            onClick={onSidebarToggle}
            className="hidden lg:block p-2 rounded-lg hover:bg-white/10 transition-colors"
          >
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
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>

          {/* Breadcrumbs */}
          <Breadcrumbs />
        </div>

        <div className="flex items-center gap-4">
          {/* Search */}
          <button className="hidden md:flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
            <svg
              className="w-5 h-5 text-white/60"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <span className="text-white/60 text-sm">Search...</span>
          </button>

          {/* Notifications */}
          <button className="relative p-2 rounded-lg hover:bg-white/10 transition-colors">
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
                d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
              />
            </svg>
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
          </button>

          {/* User Menu */}
          <div className="relative">
            <button
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="flex items-center gap-2 p-2 rounded-lg hover:bg-white/10 transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                <span className="text-white font-medium text-sm">U</span>
              </div>
              <svg
                className={cn(
                  'w-4 h-4 text-white transition-transform',
                  userMenuOpen && 'rotate-180'
                )}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>

            {/* User Dropdown */}
            <AnimatePresence>
              {userMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute right-0 mt-2 w-48"
                >
                  <GlassmorphicPanel blur="strong" className="space-y-1">
                    <button className="w-full text-left px-4 py-2 rounded-lg hover:bg-white/10 transition-colors text-white">
                      Profile
                    </button>
                    <button className="w-full text-left px-4 py-2 rounded-lg hover:bg-white/10 transition-colors text-white">
                      Settings
                    </button>
                    <button className="w-full text-left px-4 py-2 rounded-lg hover:bg-white/10 transition-colors text-white">
                      Billing
                    </button>
                    <hr className="border-white/10" />
                    <button className="w-full text-left px-4 py-2 rounded-lg hover:bg-white/10 transition-colors text-red-400">
                      Sign Out
                    </button>
                  </GlassmorphicPanel>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </GlassmorphicPanel>
    </header>
  );
};
