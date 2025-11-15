'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { motion, AnimatePresence } from 'framer-motion';

interface ShareButtonProps {
  title: string;
  description?: string;
}

export function ShareButton({ title, description }: ShareButtonProps) {
  const [showMenu, setShowMenu] = useState(false);
  const [copied, setCopied] = useState(false);

  const shareUrl = typeof window !== 'undefined' ? window.location.href : '';

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const shareViaEmail = () => {
    const subject = encodeURIComponent(title);
    const body = encodeURIComponent(
      `${description || ''}\n\nView the analytics dashboard: ${shareUrl}`
    );
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
    setShowMenu(false);
  };

  const shareViaTwitter = () => {
    const text = encodeURIComponent(title);
    const url = encodeURIComponent(shareUrl);
    window.open(
      `https://twitter.com/intent/tweet?text=${text}&url=${url}`,
      '_blank'
    );
    setShowMenu(false);
  };

  const shareViaLinkedIn = () => {
    const url = encodeURIComponent(shareUrl);
    window.open(
      `https://www.linkedin.com/sharing/share-offsite/?url=${url}`,
      '_blank'
    );
    setShowMenu(false);
  };

  return (
    <div className="relative">
      <Button
        variant="secondary"
        size="sm"
        onClick={() => setShowMenu(!showMenu)}
      >
        🔗 Share
      </Button>

      <AnimatePresence>
        {showMenu && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute right-0 mt-2 w-56 bg-gray-900/95 backdrop-blur-xl border border-white/20 rounded-lg shadow-xl z-50"
          >
            <div className="py-2">
              <button
                onClick={copyToClipboard}
                className="w-full px-4 py-2 text-left text-sm text-gray-300 hover:bg-white/10 hover:text-white transition-colors flex items-center gap-2"
              >
                {copied ? '✓ Copied!' : '📋 Copy Link'}
              </button>
              <button
                onClick={shareViaEmail}
                className="w-full px-4 py-2 text-left text-sm text-gray-300 hover:bg-white/10 hover:text-white transition-colors flex items-center gap-2"
              >
                📧 Share via Email
              </button>
              <button
                onClick={shareViaTwitter}
                className="w-full px-4 py-2 text-left text-sm text-gray-300 hover:bg-white/10 hover:text-white transition-colors flex items-center gap-2"
              >
                🐦 Share on Twitter
              </button>
              <button
                onClick={shareViaLinkedIn}
                className="w-full px-4 py-2 text-left text-sm text-gray-300 hover:bg-white/10 hover:text-white transition-colors flex items-center gap-2"
              >
                💼 Share on LinkedIn
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {showMenu && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowMenu(false)}
        />
      )}
    </div>
  );
}
