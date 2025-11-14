'use client';

import React, { useState } from 'react';
import { ThemeProvider } from '@/lib/theme/ThemeContext';
import { ToastProvider, useToast } from '@/components/ui/Toast';
import {
  GlassmorphicCard,
  GlassmorphicPanel,
  Button,
  Input,
  AnimatedGradientBackground,
  GradientText,
  LoadingSpinner,
  ProgressBar,
  CircularProgress,
  Skeleton,
  SkeletonCard,
  ThemeToggle,
} from '@/components/ui';

function DemoContent() {
  const { showToast } = useToast();
  const [progress, setProgress] = useState(45);
  const [loading, setLoading] = useState(false);

  const handleToast = (type: 'success' | 'error' | 'warning' | 'info') => {
    showToast({
      type,
      title: `${type.charAt(0).toUpperCase() + type.slice(1)} Toast`,
      message: `This is a ${type} toast notification!`,
    });
  };

  return (
    <AnimatedGradientBackground theme="blue">
      <div className="container mx-auto p-8 space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <GradientText theme="blue" className="text-4xl">
              SoloSuccess AI
            </GradientText>
            <p className="text-white/80 mt-2">Component Design System Demo</p>
          </div>
          <ThemeToggle variant="dropdown" />
        </div>

        {/* Glassmorphic Cards */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-white">Glassmorphic Cards</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <GlassmorphicCard elevation="low">
              <div className="p-6">
                <h3 className="text-xl font-semibold text-white mb-2">Low Elevation</h3>
                <p className="text-white/70">Subtle shadow effect</p>
              </div>
            </GlassmorphicCard>

            <GlassmorphicCard elevation="medium" gradient>
              <div className="p-6">
                <h3 className="text-xl font-semibold text-white mb-2">Medium + Gradient</h3>
                <p className="text-white/70">With gradient background</p>
              </div>
            </GlassmorphicCard>

            <GlassmorphicCard elevation="high">
              <div className="p-6">
                <h3 className="text-xl font-semibold text-white mb-2">High Elevation</h3>
                <p className="text-white/70">Strong shadow effect</p>
              </div>
            </GlassmorphicCard>
          </div>
        </section>

        {/* Buttons */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-white">Buttons</h2>
          <GlassmorphicPanel>
            <div className="flex flex-wrap gap-4">
              <Button variant="primary">Primary</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="outline">Outline</Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="gradient">Gradient</Button>
              <Button variant="primary" loading>
                Loading
              </Button>
              <Button variant="primary" disabled>
                Disabled
              </Button>
            </div>
          </GlassmorphicPanel>
        </section>

        {/* Inputs */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-white">Input Fields</h2>
          <GlassmorphicPanel>
            <div className="space-y-4 max-w-md">
              <Input label="Email" type="email" placeholder="Enter your email" />
              <Input
                label="Password"
                type="password"
                placeholder="Enter password"
                helperText="Must be at least 8 characters"
              />
              <Input
                label="Error State"
                placeholder="Invalid input"
                error="This field is required"
              />
              <Input
                label="With Icon"
                placeholder="Search..."
                icon={
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                }
              />
            </div>
          </GlassmorphicPanel>
        </section>

        {/* Progress Indicators */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-white">Progress Indicators</h2>
          <GlassmorphicPanel>
            <div className="space-y-6">
              <div>
                <h3 className="text-white font-medium mb-2">Progress Bar</h3>
                <ProgressBar value={progress} showLabel />
                <div className="flex gap-2 mt-4">
                  <Button size="sm" onClick={() => setProgress(Math.max(0, progress - 10))}>
                    -10%
                  </Button>
                  <Button size="sm" onClick={() => setProgress(Math.min(100, progress + 10))}>
                    +10%
                  </Button>
                </div>
              </div>

              <div>
                <h3 className="text-white font-medium mb-2">Circular Progress</h3>
                <CircularProgress value={progress} />
              </div>

              <div>
                <h3 className="text-white font-medium mb-2">Loading Spinner</h3>
                <div className="flex gap-4 items-center">
                  <LoadingSpinner size="sm" />
                  <LoadingSpinner size="md" />
                  <LoadingSpinner size="lg" />
                  <LoadingSpinner size="xl" />
                </div>
              </div>
            </div>
          </GlassmorphicPanel>
        </section>

        {/* Toast Notifications */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-white">Toast Notifications</h2>
          <GlassmorphicPanel>
            <div className="flex flex-wrap gap-4">
              <Button variant="primary" onClick={() => handleToast('success')}>
                Success Toast
              </Button>
              <Button variant="secondary" onClick={() => handleToast('error')}>
                Error Toast
              </Button>
              <Button variant="outline" onClick={() => handleToast('warning')}>
                Warning Toast
              </Button>
              <Button variant="ghost" onClick={() => handleToast('info')}>
                Info Toast
              </Button>
            </div>
          </GlassmorphicPanel>
        </section>

        {/* Skeleton Loaders */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-white">Skeleton Loaders</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <GlassmorphicPanel>
              <SkeletonCard />
            </GlassmorphicPanel>
            <GlassmorphicPanel>
              <div className="space-y-4">
                <Skeleton variant="text" height={32} width="60%" />
                <Skeleton variant="rectangular" height={200} />
                <div className="flex gap-4">
                  <Skeleton variant="circular" width={48} height={48} />
                  <div className="flex-1 space-y-2">
                    <Skeleton variant="text" height={20} />
                    <Skeleton variant="text" height={16} width="80%" />
                  </div>
                </div>
              </div>
            </GlassmorphicPanel>
          </div>
        </section>
      </div>
    </AnimatedGradientBackground>
  );
}

export default function DemoPage() {
  return (
    <ThemeProvider defaultTheme="dark">
      <ToastProvider>
        <DemoContent />
      </ToastProvider>
    </ThemeProvider>
  );
}
