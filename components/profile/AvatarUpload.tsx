'use client';

import { useState, useRef } from 'react';
import { GlassmorphicCard } from '@/components/ui/GlassmorphicCard';
import { Button } from '@/components/ui/Button';
import { Upload, User, X } from 'lucide-react';
import { userApi } from '@/lib/api/user';

interface AvatarUploadProps {
  currentAvatarUrl?: string;
  onUploadSuccess: (url: string) => void;
}

export function AvatarUpload({ currentAvatarUrl, onUploadSuccess }: AvatarUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('File size must be less than 5MB');
      return;
    }

    setError(null);

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleUpload = async () => {
    const file = fileInputRef.current?.files?.[0];
    if (!file) return;

    setUploading(true);
    setError(null);

    try {
      const response = await userApi.uploadAvatar(file);
      if (response.success && response.data?.avatarUrl) {
        onUploadSuccess(response.data.avatarUrl);
        setPreview(null);
      } else {
        throw new Error('Upload failed');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload avatar');
    } finally {
      setUploading(false);
    }
  };

  const handleCancel = () => {
    setPreview(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const displayUrl = preview || currentAvatarUrl;

  return (
    <GlassmorphicCard className="p-6">
      <h3 className="text-lg font-semibold text-white mb-4">Profile Picture</h3>
      
      <div className="flex flex-col items-center gap-4">
        {/* Avatar Display */}
        <div className="relative">
          <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 p-1">
            <div className="w-full h-full rounded-full bg-gray-900 flex items-center justify-center overflow-hidden">
              {displayUrl ? (
                <img 
                  src={displayUrl} 
                  alt="Profile" 
                  className="w-full h-full object-cover"
                />
              ) : (
                <User className="w-16 h-16 text-gray-400" />
              )}
            </div>
          </div>
          {preview && (
            <button
              onClick={handleCancel}
              className="absolute top-0 right-0 p-1 bg-red-500 rounded-full hover:bg-red-600 transition-colors"
            >
              <X className="w-4 h-4 text-white" />
            </button>
          )}
        </div>

        {error && (
          <div className="w-full p-3 bg-red-500/20 border border-red-500/50 rounded-lg">
            <p className="text-red-200 text-sm text-center">{error}</p>
          </div>
        )}

        {/* Upload Controls */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
        />

        {preview ? (
          <div className="flex gap-2 w-full">
            <Button
              onClick={handleUpload}
              disabled={uploading}
              className="flex-1"
            >
              <Upload className="w-4 h-4 mr-2" />
              {uploading ? 'Uploading...' : 'Upload'}
            </Button>
            <Button
              onClick={handleCancel}
              variant="secondary"
              className="flex-1"
            >
              Cancel
            </Button>
          </div>
        ) : (
          <Button
            onClick={() => fileInputRef.current?.click()}
            variant="secondary"
            className="w-full"
          >
            <Upload className="w-4 h-4 mr-2" />
            Choose Image
          </Button>
        )}

        <p className="text-xs text-gray-400 text-center">
          Recommended: Square image, at least 200x200px, max 5MB
        </p>
      </div>
    </GlassmorphicCard>
  );
}
