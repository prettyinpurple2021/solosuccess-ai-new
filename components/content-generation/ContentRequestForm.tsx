'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import { GlassmorphicCard } from '@/components/ui/GlassmorphicCard';
import { cn } from '@/lib/utils/cn';

export interface ContentRequestFormData {
  contentType: string;
  platform?: string;
  tone?: string;
  length?: string;
  targetAudience?: string;
  keywords?: string;
  brief: string;
}

interface ContentRequestFormProps {
  onSubmit: (data: ContentRequestFormData) => void;
  isLoading?: boolean;
}

const contentTypes = [
  { value: 'social-post', label: 'Social Media Post' },
  { value: 'blog-post', label: 'Blog Post' },
  { value: 'email', label: 'Email' },
  { value: 'ad-copy', label: 'Ad Copy' },
  { value: 'product-description', label: 'Product Description' },
  { value: 'landing-page', label: 'Landing Page Copy' },
];

const platforms = [
  { value: 'linkedin', label: 'LinkedIn' },
  { value: 'twitter', label: 'Twitter/X' },
  { value: 'facebook', label: 'Facebook' },
  { value: 'instagram', label: 'Instagram' },
  { value: 'tiktok', label: 'TikTok' },
  { value: 'general', label: 'General' },
];

const tones = [
  { value: 'professional', label: 'Professional' },
  { value: 'casual', label: 'Casual' },
  { value: 'friendly', label: 'Friendly' },
  { value: 'authoritative', label: 'Authoritative' },
  { value: 'humorous', label: 'Humorous' },
  { value: 'inspirational', label: 'Inspirational' },
];

const lengths = [
  { value: 'short', label: 'Short (50-100 words)' },
  { value: 'medium', label: 'Medium (100-300 words)' },
  { value: 'long', label: 'Long (300-500 words)' },
  { value: 'very-long', label: 'Very Long (500+ words)' },
];

export const ContentRequestForm: React.FC<ContentRequestFormProps> = ({
  onSubmit,
  isLoading = false,
}) => {
  const [formData, setFormData] = useState<ContentRequestFormData>({
    contentType: 'social-post',
    platform: 'linkedin',
    tone: 'professional',
    length: 'short',
    targetAudience: '',
    keywords: '',
    brief: '',
  });

  const [errors, setErrors] = useState<Partial<Record<keyof ContentRequestFormData, string>>>({});

  const handleChange = (field: keyof ContentRequestFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof ContentRequestFormData, string>> = {};

    if (!formData.brief.trim()) {
      newErrors.brief = 'Content brief is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onSubmit(formData);
    }
  };

  return (
    <GlassmorphicCard className="p-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <h3 className="text-xl font-semibold text-white mb-4">Content Request</h3>
          <p className="text-white/70 text-sm">
            Fill in the details below to generate AI-powered content tailored to your needs.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Select
            label="Content Type"
            options={contentTypes}
            value={formData.contentType}
            onChange={(e) => handleChange('contentType', e.target.value)}
          />

          <Select
            label="Platform"
            options={platforms}
            value={formData.platform}
            onChange={(e) => handleChange('platform', e.target.value)}
            helperText="Select the platform where this content will be published"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Select
            label="Tone"
            options={tones}
            value={formData.tone}
            onChange={(e) => handleChange('tone', e.target.value)}
            helperText="Choose the voice and style for your content"
          />

          <Select
            label="Length"
            options={lengths}
            value={formData.length}
            onChange={(e) => handleChange('length', e.target.value)}
          />
        </div>

        <Input
          label="Target Audience"
          placeholder="e.g., Solo founders, B2B decision makers, tech enthusiasts"
          value={formData.targetAudience}
          onChange={(e) => handleChange('targetAudience', e.target.value)}
          helperText="Who is this content for?"
        />

        <Input
          label="Keywords (Optional)"
          placeholder="e.g., AI, productivity, automation"
          value={formData.keywords}
          onChange={(e) => handleChange('keywords', e.target.value)}
          helperText="Comma-separated keywords to include"
        />

        <Textarea
          label="Content Brief"
          placeholder="Describe what you want the content to be about. Include key points, messages, or specific information you want to convey..."
          value={formData.brief}
          onChange={(e) => handleChange('brief', e.target.value)}
          error={errors.brief}
          rows={6}
          required
        />

        <div className="flex justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setFormData({
                contentType: 'social-post',
                platform: 'linkedin',
                tone: 'professional',
                length: 'short',
                targetAudience: '',
                keywords: '',
                brief: '',
              });
              setErrors({});
            }}
            disabled={isLoading}
          >
            Reset
          </Button>
          <Button
            type="submit"
            variant="gradient"
            loading={isLoading}
            disabled={isLoading}
          >
            Generate Content
          </Button>
        </div>
      </form>
    </GlassmorphicCard>
  );
};
