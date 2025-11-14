'use client';

import { useState } from 'react';
import { GlassmorphicCard } from '@/components/ui/GlassmorphicCard';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { AlertTriangle, X } from 'lucide-react';

interface DeleteAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (password: string) => Promise<void>;
}

export function DeleteAccountModal({ isOpen, onClose, onConfirm }: DeleteAccountModalProps) {
  const [password, setPassword] = useState('');
  const [confirmText, setConfirmText] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleConfirm = async () => {
    if (confirmText !== 'DELETE') {
      setError('Please type DELETE to confirm');
      return;
    }

    if (!password) {
      setError('Please enter your password');
      return;
    }

    setDeleting(true);
    setError(null);

    try {
      await onConfirm(password);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete account');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-md">
        <GlassmorphicCard className="p-8">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-500/20 rounded-lg">
                <AlertTriangle className="w-6 h-6 text-red-400" />
              </div>
              <h2 className="text-2xl font-bold text-white">Delete Account</h2>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="space-y-6">
            <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
              <p className="text-red-200 text-sm">
                <strong>Warning:</strong> This action is permanent and cannot be undone. All your data, including:
              </p>
              <ul className="mt-2 ml-4 text-red-200 text-sm list-disc space-y-1">
                <li>AI conversations and history</li>
                <li>Business plans and goals</li>
                <li>Generated content</li>
                <li>Competitor tracking data</li>
                <li>Account settings and preferences</li>
              </ul>
              <p className="mt-2 text-red-200 text-sm">
                will be permanently deleted.
              </p>
            </div>

            {error && (
              <div className="p-4 bg-red-500/20 border border-red-500/50 rounded-lg">
                <p className="text-red-200 text-sm">{error}</p>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Type <span className="font-bold text-white">DELETE</span> to confirm
              </label>
              <Input
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                placeholder="DELETE"
                className="font-mono"
              />
            </div>

            <Input
              type="password"
              label="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Your password"
            />

            <div className="flex gap-4">
              <Button
                onClick={handleConfirm}
                disabled={deleting || confirmText !== 'DELETE' || !password}
                className="flex-1 bg-red-500 hover:bg-red-600"
              >
                {deleting ? 'Deleting...' : 'Delete My Account'}
              </Button>
              <Button
                onClick={onClose}
                variant="secondary"
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </div>
        </GlassmorphicCard>
      </div>
    </div>
  );
}
