'use client';

import { useState } from 'react';
import { GlassmorphicCard } from '@/components/ui/GlassmorphicCard';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { UserProfile, UpdateProfileData } from '@/lib/api/user';
import { User, Briefcase, Save, X } from 'lucide-react';

interface ProfileEditFormProps {
  profile: UserProfile;
  onSave: (data: UpdateProfileData) => Promise<void>;
  onCancel: () => void;
}

export function ProfileEditForm({ profile, onSave, onCancel }: ProfileEditFormProps) {
  const [formData, setFormData] = useState<UpdateProfileData>({
    firstName: profile.firstName || '',
    lastName: profile.lastName || '',
    businessName: profile.businessName || '',
    businessType: profile.businessType || '',
    industry: profile.industry || '',
    companySize: profile.companySize || '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSaving(true);

    try {
      await onSave(formData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save profile');
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (field: keyof UpdateProfileData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <GlassmorphicCard className="p-8">
      <div className="flex items-start justify-between mb-8">
        <h2 className="text-2xl font-bold text-white">Edit Profile</h2>
        <button
          onClick={onCancel}
          className="text-gray-400 hover:text-white transition-colors"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-lg">
          <p className="text-red-200 text-sm">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Personal Information */}
        <div>
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <User className="w-5 h-5" />
            Personal Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="First Name"
              value={formData.firstName}
              onChange={(e) => handleChange('firstName', e.target.value)}
              placeholder="Enter your first name"
            />
            <Input
              label="Last Name"
              value={formData.lastName}
              onChange={(e) => handleChange('lastName', e.target.value)}
              placeholder="Enter your last name"
            />
          </div>
        </div>

        {/* Business Information */}
        <div className="pt-6 border-t border-white/10">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Briefcase className="w-5 h-5" />
            Business Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Business Name"
              value={formData.businessName}
              onChange={(e) => handleChange('businessName', e.target.value)}
              placeholder="Enter your business name"
            />
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Business Type
              </label>
              <select
                value={formData.businessType}
                onChange={(e) => handleChange('businessType', e.target.value)}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select business type</option>
                <option value="sole-proprietorship">Sole Proprietorship</option>
                <option value="llc">LLC</option>
                <option value="corporation">Corporation</option>
                <option value="partnership">Partnership</option>
                <option value="other">Other</option>
              </select>
            </div>
            <Input
              label="Industry"
              value={formData.industry}
              onChange={(e) => handleChange('industry', e.target.value)}
              placeholder="e.g., Technology, Healthcare"
            />
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Company Size
              </label>
              <select
                value={formData.companySize}
                onChange={(e) => handleChange('companySize', e.target.value)}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select company size</option>
                <option value="1">Just me</option>
                <option value="2-10">2-10 employees</option>
                <option value="11-50">11-50 employees</option>
                <option value="51-200">51-200 employees</option>
                <option value="200+">200+ employees</option>
              </select>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 pt-6 border-t border-white/10">
          <Button
            type="submit"
            disabled={saving}
            className="flex-1"
          >
            <Save className="w-4 h-4 mr-2" />
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
          <Button
            type="button"
            onClick={onCancel}
            variant="secondary"
            className="flex-1"
          >
            Cancel
          </Button>
        </div>
      </form>
    </GlassmorphicCard>
  );
}
