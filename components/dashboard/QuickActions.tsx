'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { GlassmorphicCard } from '@/components/ui/GlassmorphicCard';
import { QuickAction } from '@/lib/api/dashboard';
import { 
  MessageSquare, 
  Rocket, 
  Eye, 
  FileText, 
  Target,
  TrendingUp,
  Zap,
  Brain
} from 'lucide-react';

interface QuickActionsProps {
  actions?: QuickAction[];
}

const iconMap: Record<string, any> = {
  MessageSquare,
  Rocket,
  Eye,
  FileText,
  Target,
  TrendingUp,
  Zap,
  Brain,
};

const defaultActions: QuickAction[] = [
  {
    id: '1',
    title: 'Chat with AI Agent',
    description: 'Start a conversation with your virtual team',
    icon: 'MessageSquare',
    href: '/dashboard/agents',
    color: 'from-blue-500 to-cyan-500',
  },
  {
    id: '2',
    title: 'Launch Mission Control',
    description: 'Delegate complex objectives to AI',
    icon: 'Rocket',
    href: '/dashboard/mission-control',
    color: 'from-purple-500 to-pink-500',
  },
  {
    id: '3',
    title: 'Track Competitors',
    description: 'Monitor competitive intelligence',
    icon: 'Eye',
    href: '/dashboard/competitor-stalker',
    color: 'from-green-500 to-emerald-500',
  },
  {
    id: '4',
    title: 'Generate Content',
    description: 'Create marketing content with AI',
    icon: 'FileText',
    href: '/dashboard/content',
    color: 'from-orange-500 to-red-500',
  },
  {
    id: '5',
    title: 'Set Goals',
    description: 'Define and track business objectives',
    icon: 'Target',
    href: '/dashboard/goals',
    color: 'from-teal-500 to-blue-500',
  },
  {
    id: '6',
    title: 'View Analytics',
    description: 'Analyze your business metrics',
    icon: 'TrendingUp',
    href: '/dashboard/analytics',
    color: 'from-indigo-500 to-purple-500',
  },
];

export function QuickActions({ actions = defaultActions }: QuickActionsProps) {
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-white">Quick Actions</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {actions.map((action, index) => {
          const Icon = iconMap[action.icon] || Zap;
          return (
            <motion.div
              key={action.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
            >
              <Link href={action.href}>
                <GlassmorphicCard className="p-6 hover:scale-105 transition-all duration-300 cursor-pointer group">
                  <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-xl bg-gradient-to-br ${action.color} bg-opacity-20 group-hover:bg-opacity-30 transition-all`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-white mb-1">
                        {action.title}
                      </h3>
                      <p className="text-sm text-gray-400 dark:text-gray-500">
                        {action.description}
                      </p>
                    </div>
                  </div>
                </GlassmorphicCard>
              </Link>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
