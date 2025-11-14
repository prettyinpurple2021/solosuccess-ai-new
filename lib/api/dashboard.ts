/**
 * Dashboard API endpoints
 */

import { apiClient } from './client';

export interface DashboardMetrics {
  totalConversations: number;
  activeGoals: number;
  completedMissions: number;
  generatedContent: number;
  weeklyActivity: number;
  subscriptionTier: string;
}

export interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: string;
  href: string;
  color: string;
}

export interface RecentActivity {
  id: string;
  type: 'conversation' | 'mission' | 'content' | 'goal';
  title: string;
  description: string;
  timestamp: string;
  agentId?: string;
  agentName?: string;
}

export interface AgentStatus {
  id: string;
  name: string;
  personality: string;
  avatar: string;
  status: 'available' | 'busy' | 'offline';
  lastInteraction?: string;
  conversationCount: number;
}

export const dashboardApi = {
  getMetrics: () => apiClient.get<DashboardMetrics>('/dashboard/metrics'),
  
  getQuickActions: () => apiClient.get<QuickAction[]>('/dashboard/quick-actions'),
  
  getRecentActivity: (limit: number = 10) => 
    apiClient.get<RecentActivity[]>(`/dashboard/recent-activity?limit=${limit}`),
  
  getAgentStatuses: () => apiClient.get<AgentStatus[]>('/dashboard/agent-statuses'),
};
