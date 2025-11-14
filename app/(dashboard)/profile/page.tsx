'use client';

import { useEffect, useState } from 'react';
import { AnimatedGradientBackground } from '@/components/ui/AnimatedGradientBackground';
import { DashboardLayout } from '@/components/layouts/DashboardLayout';
import { ProfileView } from '@/components/profile/ProfileView';
import { ProfileEditForm } from '@/components/profile/ProfileEditForm';
import { AvatarUpload } from '@/components/profile/AvatarUpload';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { userApi, UserProfile, UpdateProfileData } from '@/lib/api/user';

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const data = await userApi.getProfile();
      setProfile(data);
    } catch (err) {
      console.error('Error fetching profile:', err);
      setError('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async (data: UpdateProfileData) => {
    try {
      const updatedProfile = await userApi.updateProfile(data);
      setProfile(updatedProfile);
      setIsEditing(false);
    } catch (err) {
      throw err; // Let the form handle the error
    }
  };

  const handleAvatarUpload = async (url: string) => {
    // Refresh profile to get updated avatar
    await fetchProfile();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <AnimatedGradientBackground />
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <AnimatedGradientBackground />
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Error Loading Profile</h2>
          <p className="text-gray-400">{error || 'An unexpected error occurred'}</p>
        </div>
      </div>
    );
  }

  return (
    <DashboardLayout>
      <AnimatedGradientBackground />
      <div className="relative z-10 space-y-8 p-6">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            Profile Settings
          </h1>
          <p className="text-gray-400">
            Manage your personal and business information
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Avatar Upload - Sidebar */}
          <div className="lg:col-span-1">
            <AvatarUpload
              currentAvatarUrl={profile.avatarUrl}
              onUploadSuccess={handleAvatarUpload}
            />
          </div>

          {/* Profile Information - Main Content */}
          <div className="lg:col-span-2">
            {isEditing ? (
              <ProfileEditForm
                profile={profile}
                onSave={handleSaveProfile}
                onCancel={() => setIsEditing(false)}
              />
            ) : (
              <ProfileView
                profile={profile}
                onEdit={() => setIsEditing(true)}
              />
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
