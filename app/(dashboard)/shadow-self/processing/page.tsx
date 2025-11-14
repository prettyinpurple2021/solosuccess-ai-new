'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Brain, Sparkles } from 'lucide-react';

export default function ProcessingPage() {
  const router = useRouter();

  useEffect(() => {
    // In a real implementation, this would poll for completion
    // For now, we'll simulate a delay
    const timer = setTimeout(() => {
      // Redirect to report page (you'd get the actual assessment ID from context)
      // router.push('/shadow-self/report/[assessmentId]');
    }, 3000);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="max-w-2xl mx-auto text-center space-y-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center justify-center w-32 h-32 rounded-full bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30 relative"
        >
          <Brain className="w-16 h-16 text-purple-400" />
          <motion.div
            className="absolute inset-0 rounded-full border-4 border-purple-500/30 border-t-purple-500"
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="space-y-4"
        >
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
            Analyzing Your Responses
          </h1>
          
          <p className="text-xl text-gray-300">
            Our AI is identifying patterns and generating your personalized report...
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="space-y-4"
        >
          <div className="flex items-center justify-center gap-2 text-purple-400">
            <Sparkles className="w-5 h-5 animate-pulse" />
            <span className="text-sm">This usually takes 30-60 seconds</span>
          </div>

          <div className="max-w-md mx-auto space-y-3 text-left">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.8 }}
              className="flex items-center gap-3 p-3 rounded-lg bg-white/5"
            >
              <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              <span className="text-gray-300 text-sm">Analyzing response patterns</span>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1.2 }}
              className="flex items-center gap-3 p-3 rounded-lg bg-white/5"
            >
              <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
              <span className="text-gray-300 text-sm">Identifying cognitive biases</span>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1.6 }}
              className="flex items-center gap-3 p-3 rounded-lg bg-white/5"
            >
              <div className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
              <span className="text-gray-300 text-sm">Generating personalized recommendations</span>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
