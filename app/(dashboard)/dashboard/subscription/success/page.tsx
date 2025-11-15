'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { CheckCircle, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { GlassmorphicCard } from '@/components/ui/GlassmorphicCard';

export default function SubscriptionSuccessPage() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const [isVerifying, setIsVerifying] = useState(true);

  useEffect(() => {
    // Verify the session and update subscription
    const verifySession = async () => {
      if (!sessionId) {
        setIsVerifying(false);
        return;
      }

      // In a real app, you'd verify the session with your backend
      setTimeout(() => {
        setIsVerifying(false);
      }, 2000);
    };

    verifySession();
  }, [sessionId]);

  if (isVerifying) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-teal-900 flex items-center justify-center p-6">
        <GlassmorphicCard className="p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-white">Verifying your subscription...</p>
        </GlassmorphicCard>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-teal-900 flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-2xl"
      >
        <GlassmorphicCard className="p-12 text-center" gradient>
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            className="mb-6"
          >
            <CheckCircle className="w-24 h-24 text-green-400 mx-auto" />
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-4xl font-bold text-white mb-4"
          >
            Welcome to Premium!
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-xl text-gray-300 mb-8"
          >
            Your subscription has been activated successfully. You now have
            access to all premium features!
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white/5 rounded-lg p-6 mb-8"
          >
            <h3 className="text-white font-semibold mb-4">
              What's next?
            </h3>
            <ul className="space-y-3 text-left">
              <li className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-purple-400 mt-2" />
                <span className="text-gray-200">
                  Explore all 7 AI agents in your dashboard
                </span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-purple-400 mt-2" />
                <span className="text-gray-200">
                  Set up Competitor Stalker to track your competition
                </span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-purple-400 mt-2" />
                <span className="text-gray-200">
                  Run your first Mission Control session
                </span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-purple-400 mt-2" />
                <span className="text-gray-200">
                  Take the Shadow Self assessment
                </span>
              </li>
            </ul>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Button
              onClick={() => (window.location.href = '/dashboard')}
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 flex items-center justify-center gap-2"
            >
              Go to Dashboard
              <ArrowRight className="w-4 h-4" />
            </Button>
            <Button
              onClick={() =>
                (window.location.href = '/dashboard/subscription')
              }
              className="bg-white/10 hover:bg-white/20"
            >
              View Subscription
            </Button>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="text-sm text-gray-400 mt-8"
          >
            Need help getting started?{' '}
            <a
              href="/support"
              className="text-purple-400 hover:text-purple-300 underline"
            >
              Contact our support team
            </a>
          </motion.p>
        </GlassmorphicCard>
      </motion.div>
    </div>
  );
}
