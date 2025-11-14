'use client';

import { GlassmorphicCard } from '@/components/ui/GlassmorphicCard';
import { UserProfile } from '@/lib/api/user';
import { User, Briefcase, Building, Users, Calendar } from 'lucide-react';
import { format } from 'date-fns';

interface ProfileViewProps {
  profile: UserProfile;
  onEdit: () => void;
}

export function ProfileView({ profile, onEdit }: ProfileViewProps) {
  return (
    <GlassmorphicCard className="p-8">
      <div className="flex items-start justify-between mb-8">
        <h2 className="text-2xl font-bold text-white">Profile Information</h2>
        <button
          onClick={onEdit}
          className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg hover:opacity-90 transition-opacity"
        >
          Edit Profile
        </button>
      </div>

      <div className="space-y-6">
        {/* Personal Information */}
        <div>
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <User className="w-5 h-5" />
            Personal Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-gray-400">First Name</label>
              <p className="text-white mt-1">{profile.firstName || 'Not set'}</p>
            </div>
            <div>
              <label className="text-sm text-gray-400">Last Name</label>
              <p className="text-white mt-1">{profile.lastName || 'Not set'}</p>
            </div>
            <div className="md:col-span-2">
              <label className="text-sm text-gray-400">Email</label>
              <p className="text-white mt-1">{profile.email}</p>
            </div>
          </div>
        </div>

        {/* Business Information */}
        <div className="pt-6 border-t border-white/10">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Briefcase className="w-5 h-5" />
            Business Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-gray-400">Business Name</label>
              <p className="text-white mt-1">{profile.businessName || 'Not set'}</p>
            </div>
            <div>
              <label className="text-sm text-gray-400">Business Type</label>
              <p className="text-white mt-1">{profile.businessType || 'Not set'}</p>
            </div>
            <div>
              <label className="text-sm text-gray-400">Industry</label>
              <p className="text-white mt-1">{profile.industry || 'Not set'}</p>
            </div>
            <div>
              <label className="text-sm text-gray-400">Company Size</label>
              <p className="text-white mt-1">{profile.companySize || 'Not set'}</p>
            </div>
          </div>
        </div>

        {/* Account Information */}
        <div className="pt-6 border-t border-white/10">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Building className="w-5 h-5" />
            Account Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-gray-400">Subscription Tier</label>
              <p className="text-white mt-1 capitalize">{profile.subscriptionTier}</p>
            </div>
            <div>
              <label className="text-sm text-gray-400">Account Status</label>
              <p className="text-white mt-1 capitalize">{profile.subscriptionStatus}</p>
            </div>
            <div>
              <label className="text-sm text-gray-400">Member Since</label>
              <p className="text-white mt-1">
                {format(new Date(profile.createdAt), 'MMMM d, yyyy')}
              </p>
            </div>
            <div>
              <label className="text-sm text-gray-400">Onboarding Status</label>
              <p className="text-white mt-1">
                {profile.onboardingCompleted ? 'Completed' : 'In Progress'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </GlassmorphicCard>
  );
}
