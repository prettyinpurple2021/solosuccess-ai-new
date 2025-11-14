'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { GlassmorphicPanel } from '@/components/ui/GlassmorphicPanel';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useCreateCompetitor, useUpdateCompetitor, CompetitorProfile } from '@/lib/hooks/useCompetitors';

interface CompetitorFormProps {
  competitor?: CompetitorProfile;
  onCancelAction: () => void;
  onSuccessAction: () => void;
}

export const CompetitorForm: React.FC<CompetitorFormProps> = ({
  competitor,
  onCancelAction,
  onSuccessAction,
}) => {
  const [formData, setFormData] = useState({
    name: competitor?.name || '',
    website: competitor?.website || '',
    industry: competitor?.industry || '',
    description: competitor?.description || '',
    trackingSources: {
      website: competitor?.trackingSources?.website !== undefined ? competitor.trackingSources.website : true,
      twitter: competitor?.trackingSources?.twitter || '',
      linkedin: competitor?.trackingSources?.linkedin || '',
      facebook: competitor?.trackingSources?.facebook || '',
      instagram: competitor?.trackingSources?.instagram || '',
      blog: competitor?.trackingSources?.blog || '',
    },
  });

  const { mutate: createCompetitor, isPending: isCreating } = useCreateCompetitor();
  const { mutate: updateCompetitor, isPending: isUpdating } = useUpdateCompetitor();

  const isPending = isCreating || isUpdating;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      return;
    }

    const data = {
      name: formData.name.trim(),
      website: formData.website.trim() || undefined,
      industry: formData.industry.trim() || undefined,
      description: formData.description.trim() || undefined,
      trackingSources: formData.trackingSources,
    };

    if (competitor) {
      updateCompetitor(
        { id: competitor.id, data },
        {
          onSuccess: () => {
            onSuccessAction();
          },
        }
      );
    } else {
      createCompetitor(data, {
        onSuccess: () => {
          onSuccessAction();
        },
      });
    }
  };

  return (
    <GlassmorphicPanel>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h3 className="text-2xl font-semibold text-white">
            {competitor ? 'Edit Competitor' : 'Add New Competitor'}
          </h3>
          <button
            type="button"
            onClick={onCancelAction}
            className="text-white/60 hover:text-white transition-colors"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Basic Information */}
        <div className="space-y-4">
          <h4 className="text-lg font-medium text-white">Basic Information</h4>
          
          <Input
            label="Competitor Name *"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            placeholder="e.g., Acme Corp"
            required
          />

          <Input
            label="Website"
            value={formData.website}
            onChange={(e) => setFormData(prev => ({ ...prev, website: e.target.value }))}
            placeholder="https://example.com"
            type="url"
          />

          <Input
            label="Industry"
            value={formData.industry}
            onChange={(e) => setFormData(prev => ({ ...prev, industry: e.target.value }))}
            placeholder="e.g., SaaS, E-commerce, Consulting"
          />

          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Brief description of the competitor and what they do..."
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              rows={3}
            />
          </div>
        </div>

        {/* Tracking Sources */}
        <div className="space-y-4">
          <h4 className="text-lg font-medium text-white">Tracking Sources</h4>
          <p className="text-sm text-white/60">
            Configure which sources to monitor for competitor activity
          </p>

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="track-website"
              checked={formData.trackingSources.website}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                trackingSources: { ...prev.trackingSources, website: e.target.checked }
              }))}
              className="w-4 h-4 rounded border-white/20 bg-white/10 text-blue-600 focus:ring-blue-500"
            />
            <label htmlFor="track-website" className="text-sm text-white">
              Monitor website for changes
            </label>
          </div>

          <Input
            label="Twitter/X Handle"
            value={formData.trackingSources.twitter}
            onChange={(e) => setFormData(prev => ({
              ...prev,
              trackingSources: { ...prev.trackingSources, twitter: e.target.value }
            }))}
            placeholder="@username"
          />

          <Input
            label="LinkedIn Profile"
            value={formData.trackingSources.linkedin}
            onChange={(e) => setFormData(prev => ({
              ...prev,
              trackingSources: { ...prev.trackingSources, linkedin: e.target.value }
            }))}
            placeholder="https://linkedin.com/company/..."
            type="url"
          />

          <Input
            label="Facebook Page"
            value={formData.trackingSources.facebook}
            onChange={(e) => setFormData(prev => ({
              ...prev,
              trackingSources: { ...prev.trackingSources, facebook: e.target.value }
            }))}
            placeholder="https://facebook.com/..."
            type="url"
          />

          <Input
            label="Instagram Handle"
            value={formData.trackingSources.instagram}
            onChange={(e) => setFormData(prev => ({
              ...prev,
              trackingSources: { ...prev.trackingSources, instagram: e.target.value }
            }))}
            placeholder="@username"
          />

          <Input
            label="Blog/News URL"
            value={formData.trackingSources.blog}
            onChange={(e) => setFormData(prev => ({
              ...prev,
              trackingSources: { ...prev.trackingSources, blog: e.target.value }
            }))}
            placeholder="https://blog.example.com"
            type="url"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
          <Button
            type="button"
            variant="ghost"
            onClick={onCancelAction}
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="gradient"
            disabled={!formData.name.trim() || isPending}
            loading={isPending}
          >
            {isPending ? 'Saving...' : competitor ? 'Update Competitor' : 'Add Competitor'}
          </Button>
        </div>
      </form>
    </GlassmorphicPanel>
  );
};
