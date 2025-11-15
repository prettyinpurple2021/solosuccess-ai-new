'use client';

import { motion } from 'framer-motion';
import { GlassmorphicPanel } from '@/components/ui/GlassmorphicPanel';
import { Button } from '@/components/ui/Button';
import { useRouter } from 'next/navigation';
import { Sparkles, Target, Users, Zap, Heart } from 'lucide-react';

export default function AboutPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-teal-900">
      <div className="container mx-auto px-4 py-20">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
            About SoloSuccess AI
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            We're on a mission to empower solo founders with the tools and intelligence they need to succeed without sacrificing their independence.
          </p>
        </motion.div>

        {/* Mission Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="max-w-4xl mx-auto mb-16"
        >
          <GlassmorphicPanel className="p-12">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                <Target className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-white">Our Mission</h2>
            </div>
            <p className="text-lg text-gray-300 leading-relaxed">
              Solo founders are the backbone of innovation, but they face an impossible challenge: being an expert at everything. We believe that shouldn't be the case. SoloSuccess AI was built to give solo founders access to a virtual executive team—specialized AI agents that provide expert guidance across strategy, growth, legal, technical, and creative domains.
            </p>
          </GlassmorphicPanel>
        </motion.div>

        {/* Story Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="max-w-4xl mx-auto mb-16"
        >
          <GlassmorphicPanel className="p-12">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-white">Our Story</h2>
            </div>
            <div className="space-y-4 text-lg text-gray-300 leading-relaxed">
              <p>
                SoloSuccess AI was born from firsthand experience. Our founders were solo entrepreneurs who felt the weight of wearing every hat—strategist, marketer, developer, legal advisor, and more. The cognitive overload was real, and it was holding them back from what mattered most: building their vision.
              </p>
              <p>
                We realized that while hiring a full executive team wasn't realistic for most solo founders, AI technology had reached a point where it could provide expert-level guidance across multiple domains. But existing AI tools were generic—they didn't understand the unique challenges of solo entrepreneurship.
              </p>
              <p>
                So we built SoloSuccess AI: a platform specifically designed for solo founders, with specialized AI agents that understand your context, remember your business details, and work together to give you the strategic advantage of a full team—without the overhead.
              </p>
            </div>
          </GlassmorphicPanel>
        </motion.div>

        {/* Values Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="max-w-6xl mx-auto mb-16"
        >
          <h2 className="text-4xl font-bold text-white text-center mb-12">Our Values</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Users,
                title: 'Solo Founder First',
                description: 'Every feature is designed with the unique needs and constraints of solo founders in mind.',
                gradient: 'from-blue-500 to-cyan-500'
              },
              {
                icon: Zap,
                title: 'Speed & Efficiency',
                description: 'We respect your time. Our tools help you make decisions faster and execute with confidence.',
                gradient: 'from-purple-500 to-pink-500'
              },
              {
                icon: Heart,
                title: 'Empowerment',
                description: 'We believe in augmenting human intelligence, not replacing it. You stay in control.',
                gradient: 'from-orange-500 to-red-500'
              }
            ].map((value, i) => {
              const Icon = value.icon;
              return (
                <GlassmorphicPanel key={i} className="text-center">
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${value.gradient} flex items-center justify-center mx-auto mb-4`}>
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3">{value.title}</h3>
                  <p className="text-gray-300">{value.description}</p>
                </GlassmorphicPanel>
              );
            })}
          </div>
        </motion.div>

        {/* Team Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="max-w-4xl mx-auto mb-16"
        >
          <GlassmorphicPanel className="p-12 text-center">
            <h2 className="text-3xl font-bold text-white mb-6">Built by Solo Founders, For Solo Founders</h2>
            <p className="text-lg text-gray-300 mb-8">
              Our team has walked in your shoes. We've experienced the challenges, the late nights, the tough decisions, and the incredible rewards of building something from nothing. That's why we're so passionate about making your journey easier.
            </p>
            <div className="text-6xl mb-6">🚀</div>
            <p className="text-gray-400 italic">
              "We're not just building a product. We're building the support system we wish we had when we started."
            </p>
          </GlassmorphicPanel>
        </motion.div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="max-w-4xl mx-auto text-center"
        >
          <GlassmorphicPanel className="p-12">
            <h2 className="text-3xl font-bold text-white mb-4">
              Join Thousands of Solo Founders
            </h2>
            <p className="text-lg text-gray-300 mb-8">
              Start building with your virtual executive team today.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                variant="gradient"
                size="lg"
                onClick={() => router.push('/auth/register')}
              >
                Start Free Trial
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={() => router.push('/')}
              >
                Back to Home
              </Button>
            </div>
          </GlassmorphicPanel>
        </motion.div>
      </div>
    </div>
  );
}
