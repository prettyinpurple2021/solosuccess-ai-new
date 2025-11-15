'use client';

import { motion } from 'framer-motion';
import { GlassmorphicPanel } from '@/components/ui/GlassmorphicPanel';
import { Button } from '@/components/ui/Button';
import { Briefcase, Heart, Zap, Users, Globe, TrendingUp } from 'lucide-react';

const openPositions = [
  {
    title: 'Senior Full-Stack Engineer',
    department: 'Engineering',
    location: 'Remote',
    type: 'Full-time',
    description: 'Build the future of AI-powered business tools for solo founders.'
  },
  {
    title: 'AI/ML Engineer',
    department: 'Engineering',
    location: 'Remote',
    type: 'Full-time',
    description: 'Develop and optimize our AI agent systems and natural language processing capabilities.'
  },
  {
    title: 'Product Designer',
    department: 'Design',
    location: 'Remote',
    type: 'Full-time',
    description: 'Create beautiful, intuitive experiences with our glassmorphic design system.'
  },
  {
    title: 'Customer Success Manager',
    department: 'Customer Success',
    location: 'Remote',
    type: 'Full-time',
    description: 'Help solo founders succeed with our platform and build lasting relationships.'
  },
  {
    title: 'Content Marketing Manager',
    department: 'Marketing',
    location: 'Remote',
    type: 'Full-time',
    description: 'Tell the story of solo entrepreneurship and grow our community.'
  },
  {
    title: 'DevOps Engineer',
    department: 'Engineering',
    location: 'Remote',
    type: 'Full-time',
    description: 'Build and maintain our cloud infrastructure for scale and reliability.'
  }
];

const benefits = [
  {
    icon: Globe,
    title: 'Remote First',
    description: 'Work from anywhere in the world. We believe in flexibility and trust.',
    gradient: 'from-blue-500 to-cyan-500'
  },
  {
    icon: Heart,
    title: 'Health & Wellness',
    description: 'Comprehensive health insurance, mental health support, and wellness stipend.',
    gradient: 'from-purple-500 to-pink-500'
  },
  {
    icon: TrendingUp,
    title: 'Equity & Growth',
    description: 'Competitive salary, equity options, and clear career progression paths.',
    gradient: 'from-orange-500 to-red-500'
  },
  {
    icon: Zap,
    title: 'Learning Budget',
    description: '$2,000 annual budget for courses, conferences, and professional development.',
    gradient: 'from-teal-500 to-emerald-500'
  },
  {
    icon: Users,
    title: 'Amazing Team',
    description: 'Work with talented, passionate people who care about making an impact.',
    gradient: 'from-indigo-500 to-blue-500'
  },
  {
    icon: Briefcase,
    title: 'Unlimited PTO',
    description: 'Take the time you need to recharge. We trust you to manage your time.',
    gradient: 'from-violet-500 to-purple-500'
  }
];

export default function CareersPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-teal-900">
      <div className="container mx-auto px-4 py-20">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mx-auto mb-6">
            <Briefcase className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
            Join Our Mission
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            We're building the future of solo entrepreneurship. Help us empower founders around the world with AI-powered tools.
          </p>
        </motion.div>

        {/* Mission Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="max-w-4xl mx-auto mb-16"
        >
          <GlassmorphicPanel className="p-12 text-center">
            <h2 className="text-3xl font-bold text-white mb-4">Why SoloSuccess AI?</h2>
            <p className="text-lg text-gray-300 leading-relaxed">
              We're not just building software—we're democratizing entrepreneurship. Every day, we help solo founders overcome the challenges of going it alone. Our team is small but mighty, and every person makes a real impact. If you're passionate about AI, entrepreneurship, and helping people succeed, we'd love to meet you.
            </p>
          </GlassmorphicPanel>
        </motion.div>

        {/* Benefits Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="max-w-6xl mx-auto mb-16"
        >
          <h2 className="text-4xl font-bold text-white text-center mb-12">Benefits & Perks</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {benefits.map((benefit, i) => {
              const Icon = benefit.icon;
              return (
                <GlassmorphicPanel key={i}>
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${benefit.gradient} flex items-center justify-center mb-4`}>
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">{benefit.title}</h3>
                  <p className="text-gray-300">{benefit.description}</p>
                </GlassmorphicPanel>
              );
            })}
          </div>
        </motion.div>

        {/* Open Positions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="max-w-5xl mx-auto mb-16"
        >
          <h2 className="text-4xl font-bold text-white text-center mb-12">Open Positions</h2>
          <div className="space-y-4">
            {openPositions.map((position, i) => (
              <GlassmorphicPanel key={i} className="p-6 hover:bg-white/15 transition-all cursor-pointer">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-white mb-2">{position.title}</h3>
                    <p className="text-gray-300 mb-3">{position.description}</p>
                    <div className="flex flex-wrap gap-3 text-sm">
                      <span className="px-3 py-1 bg-white/10 rounded-full text-cyan-400">
                        {position.department}
                      </span>
                      <span className="px-3 py-1 bg-white/10 rounded-full text-gray-300">
                        📍 {position.location}
                      </span>
                      <span className="px-3 py-1 bg-white/10 rounded-full text-gray-300">
                        ⏰ {position.type}
                      </span>
                    </div>
                  </div>
                  <Button variant="gradient">
                    Apply Now
                  </Button>
                </div>
              </GlassmorphicPanel>
            ))}
          </div>
        </motion.div>

        {/* Culture Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="max-w-4xl mx-auto mb-16"
        >
          <GlassmorphicPanel className="p-12">
            <h2 className="text-3xl font-bold text-white mb-6 text-center">Our Values</h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="text-4xl mb-3">🚀</div>
                <h3 className="text-lg font-semibold text-white mb-2">Move Fast</h3>
                <p className="text-gray-300 text-sm">Ship quickly, iterate constantly, and learn from everything.</p>
              </div>
              <div className="text-center">
                <div className="text-4xl mb-3">💡</div>
                <h3 className="text-lg font-semibold text-white mb-2">Think Different</h3>
                <p className="text-gray-300 text-sm">Challenge assumptions and find creative solutions.</p>
              </div>
              <div className="text-center">
                <div className="text-4xl mb-3">🤝</div>
                <h3 className="text-lg font-semibold text-white mb-2">Support Each Other</h3>
                <p className="text-gray-300 text-sm">We win together and lift each other up.</p>
              </div>
            </div>
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
              Don't See the Right Role?
            </h2>
            <p className="text-lg text-gray-300 mb-8">
              We're always looking for talented people. Send us your resume and tell us why you'd be a great fit.
            </p>
            <Button
              variant="gradient"
              size="lg"
              onClick={() => window.location.href = 'mailto:careers@solosuccess.ai'}
            >
              Get in Touch
            </Button>
          </GlassmorphicPanel>
        </motion.div>
      </div>
    </div>
  );
}
