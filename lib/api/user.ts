/**
 * User API endpoints
 */

import { apiClient } from './client';

export interface UserProfile {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  avatarUrl?: string;
  businessName?: string;
  businessType?: string;
  industry?: string;
  companySize?: string;
  goals?: any;
  preferences?: any;
  onboardingCompleted: boolean;
  subscriptionTier: string;
  subscriptionStatus: string;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateProfileData {
  firstName?: string;
  lastName?: string;
  businessName?: string;
  businessType?: string;
  industry?: string;
  companySize?: string;
  goals?: any;
}

export interface NotificationPreferences {
  email: {
    insights: boolean;
    missions: boolean;
    competitors: boolean;
    marketing: boolean;
  };
  push: {
    insights: boolean;
    missions: boolean;
    competitors: boolean;
  };
  inApp: {
    insights: boolean;
    missions: boolean;
    competitors: boolean;
  };
  digestFrequency: 'daily' | 'weekly' | 'never';
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  reducedMotion: boolean;
  notifications: NotificationPreferences;
  dataPrivacy: {
    shareAnalytics: boolean;
    shareUsageData: boolean;
  };
}

export const userApi = {
  getProfile: () => apiClient.get<UserProfile>('/user/profile'),
  
  updateProfile: (data: UpdateProfileData) => 
    apiClient.put<UserProfile>('/user/profile', data),
  
  uploadAvatar: (file: File) => {
    const formData = new FormData();
    formData.append('avatar', file);
    return fetch('/api/user/avatar', {
      method: 'POST',
      body: formData,
    }).then(res => res.json());
  },
  
  getPreferences: () => apiClient.get<UserPreferences>('/user/preferences'),
  
  updatePreferences: (preferences: Partial<UserPreferences>) => 
    apiClient.put<UserPreferences>('/user/preferences', preferences),
  
  deleteAccount: (password: string) => 
    apiClient.post('/user/delete', { password }),
};
