'use client';

import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { GlassmorphicPanel } from '@/components/ui/GlassmorphicPanel';
import { AGENTS } from '@/lib/constants/agents';
import { 
  Sparkles, 
  Target, 
  Eye, 
  AlertTriangle, 
  Brain, 
  FileText, 
  BarChart3,
  Palette,
  ArrowRight,
  Check,
  Star
} from 'lucide-react';

const features = [
  {
    icon: Target,
    title: 'Mission Control',
    description: 'Delegate complex projects to AI. Get comprehensive plans in 30 minutes.',
    gradient: 'from-blue-500 to-cyan-500'
  },
  {
    icon: Eye,
    title: 'Competitor Stalker',
    description: 'Track competitors 24/7. Get daily intelligence briefings and real-time alerts.',
    gradient: 'from-purple-500 to-pink-500'
  },
  {
    icon: AlertTriangle,
    title: 'Chaos Mode',
    description: 'Run pre-mortem simulations. Identify risks before they become problems.',
    gradient: 'from-orange-500 to-red-500'
  },
  {
    icon: Brain,
    title: 'Shadow Self',
    description: 'Discover cognitive biases. Get personalized coaching to make better decisions.',
    gradient: 'from-teal-500 to-emerald-500'
  },
  {
    icon: Sparkles,
    title: 'Content Generation',
    description: 'Create marketing content in seconds. Social posts, emails, blogs, and more.',
    gradient: 'from-indigo-500 to-blue-500'
  },
  {
    icon: FileText,
    title: 'Document Generation',
    description: 'Professional contracts and legal docs. Customized for your business.',
    gradient: 'from-violet-500 to-purple-500'
  },
  {
    icon: BarChart3,
    title: 'Data Analytics',
    description: 'Connect your tools. Get AI-powered insights and daily nudges.',
    gradient: 'from-pink-500 to-rose-500'
  },
  {
    icon: Palette,
    title: 'Beautiful Design',
    description: '3D glassmorphism with dynamic gradients. An experience as inspiring as it is functional.',
    gradient: 'from-cyan-500 to-blue-500'
  }
];

const testimonials = [
  {
    quote: "SoloSuccess AI is like having a team of senior executives on call 24/7. Mission Control alone has saved me hundreds of hours of planning.",
    author: "Sarah Chen",
    role: "Founder @ TechFlow",
    avatar: "👩‍💼"
  },
  {
    quote: "The Competitor Stalker feature is a game-changer. I get daily briefings that would take me hours to compile manually.",
    author: "Marcus Rodriguez",
    role: "Founder @ GrowthLabs",
    avatar: "👨‍💻"
  },
  {
    quote: "I was drowning in decisions. The Shadow Self assessment helped me identify blind spots I didn't even know I had.",
    author: "Emily Watson",
    role: "Founder @ DesignCo",
    avatar: "👩‍🎨"
  }
];

export default function LandingPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-teal-900 overflow-hidden">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-0 left-0 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl"
          animate={{
            x: [0, 100, 0],
            y: [0, 50, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute bottom-0 right-0 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl"
          animate={{
            x: [0, -100, 0],
            y: [0, -50, 0],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </div>

      {/* Navigation */}
      <nav className="relative z-50 container mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2"
          >
            <Sparkles className="w-8 h-8 text-cyan-400" />
            <span className="text-2xl font-bold text-white">SoloSuccess AI</span>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-4"
          >
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push('/pricing')}
            >
              Pricing
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push('/auth/login')}
            >
              Sign In
            </Button>
            <Button
              variant="gradient"
              size="sm"
              onClick={() => router.push('/auth/register')}
            >
              Start Free
            </Button>
          </motion.div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 container mx-auto px-4 py-20 md:py-32">
        <div className="max-w-5xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
              Your Virtual Executive Team.
              <br />
              <span className="bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                Powered by AI.
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-300 mb-12 max-w-3xl mx-auto">
              Stop juggling everything alone. SoloSuccess AI gives solo founders a team of specialized AI agents to handle strategy, growth, legal, tech, and more—so you can focus on building your business.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button
                variant="gradient"
                size="lg"
                onClick={() => router.push('/auth/register')}
                className="group"
              >
                Start Free Today
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={() => router.push('/demo')}
              >
                See How It Works
              </Button>
            </div>

            <p className="text-sm text-gray-400 mt-6">
              No credit card required • 14-day free trial • Cancel anytime
            </p>
          </motion.div>
        </div>
      </section>

      {/* Problem Section */}
      <section className="relative z-10 container mx-auto px-4 py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="max-w-4xl mx-auto"
        >
          <GlassmorphicPanel className="p-12 text-center">
            <h2 className="text-4xl font-bold text-white mb-6">
              Solo Founders Shouldn't Have to Do It All
            </h2>
            <p className="text-xl text-gray-300 mb-8">
              Running a business solo means wearing every hat—strategist, marketer, developer, legal advisor, analyst. The cognitive overload is real, and it's holding you back from what matters most: growing your business.
            </p>
            
            <div className="grid md:grid-cols-2 gap-6 mt-12">
              {[
                { icon: '🎯', title: 'Strategic Isolation', desc: 'No one to bounce ideas off or validate decisions' },
                { icon: '🧠', title: 'Cognitive Overload', desc: 'Too many hats, not enough hours' },
                { icon: '💰', title: 'Expensive Expertise', desc: "Can't afford a full executive team" },
                { icon: '⚖️', title: 'Decision Paralysis', desc: 'Uncertainty about the right path forward' }
              ].map((pain, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + i * 0.1 }}
                  className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 text-left"
                >
                  <div className="text-4xl mb-3">{pain.icon}</div>
                  <h3 className="text-lg font-semibold text-white mb-2">{pain.title}</h3>
                  <p className="text-gray-400">{pain.desc}</p>
                </motion.div>
              ))}
            </div>
          </GlassmorphicPanel>
        </motion.div>
      </section>

      {/* AI Agents Section */}
      <section className="relative z-10 container mx-auto px-4 py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Meet Your AI Executive Team
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Seven specialized AI agents, each an expert in their domain. They work together to give you strategic guidance, actionable insights, and intelligent automation—24/7.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 max-w-7xl mx-auto">
          {AGENTS.map((agent, i) => (
            <motion.div
              key={agent.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5 + i * 0.1 }}
              whileHover={{ scale: 1.05, y: -5 }}
              className="cursor-pointer"
              onClick={() => router.push('/agents')}
            >
              <GlassmorphicPanel className="h-full hover:bg-white/15 transition-all">
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${agent.gradient} flex items-center justify-center text-3xl mb-4`}>
                  {agent.avatar}
                </div>
                <h3 className="text-xl font-bold text-white mb-2">{agent.name}</h3>
                <p className="text-sm text-cyan-400 mb-3">{agent.role}</p>
                <p className="text-gray-300 text-sm">{agent.description}</p>
              </GlassmorphicPanel>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section className="relative z-10 container mx-auto px-4 py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Everything You Need to Scale Solo
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Powerful features designed specifically for solo founders who want to move fast without sacrificing quality.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
          {features.map((feature, i) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 + i * 0.1 }}
                whileHover={{ scale: 1.05, y: -5 }}
              >
                <GlassmorphicPanel className="h-full hover:bg-white/15 transition-all">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-4`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">{feature.title}</h3>
                  <p className="text-gray-300 text-sm">{feature.description}</p>
                </GlassmorphicPanel>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* Social Proof Section */}
      <section className="relative z-10 container mx-auto px-4 py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Trusted by Solo Founders Worldwide
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {testimonials.map((testimonial, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 + i * 0.1 }}
            >
              <GlassmorphicPanel className="h-full">
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-200 mb-6 italic">"{testimonial.quote}"</p>
                <div className="flex items-center gap-3">
                  <div className="text-3xl">{testimonial.avatar}</div>
                  <div>
                    <div className="font-semibold text-white">{testimonial.author}</div>
                    <div className="text-sm text-gray-400">{testimonial.role}</div>
                  </div>
                </div>
              </GlassmorphicPanel>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Pricing Preview Section */}
      <section className="relative z-10 container mx-auto px-4 py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.0 }}
          className="max-w-5xl mx-auto"
        >
          <GlassmorphicPanel className="p-12 text-center" blur="strong">
            <h2 className="text-4xl font-bold text-white mb-4">
              Plans That Scale With You
            </h2>
            <p className="text-xl text-gray-300 mb-12">
              Start free, upgrade when you're ready. No credit card required.
            </p>

            <div className="grid md:grid-cols-3 gap-8 mb-12">
              {[
                { name: 'Free', price: '$0', features: ['3 AI agents', '50 messages/month', 'Basic analytics', 'Community support'] },
                { name: 'Accelerator', price: '$49', features: ['All 7 AI agents', 'Unlimited messages', 'Competitor Stalker', 'Chaos Mode', 'Content generation'], highlight: true },
                { name: 'Premium', price: '$149', features: ['Everything in Accelerator', 'Mission Control', 'Intel Academy', 'Dedicated manager', 'API access'] }
              ].map((tier, i) => (
                <div
                  key={i}
                  className={`bg-white/5 backdrop-blur-sm border ${tier.highlight ? 'border-purple-400 shadow-lg shadow-purple-500/50' : 'border-white/10'} rounded-xl p-6 relative`}
                >
                  {tier.highlight && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-1 rounded-full text-sm font-semibold">
                      Most Popular
                    </div>
                  )}
                  <h3 className="text-2xl font-bold text-white mb-2">{tier.name}</h3>
                  <div className="text-4xl font-bold text-white mb-6">
                    {tier.price}
                    <span className="text-lg text-gray-400">/mo</span>
                  </div>
                  <ul className="space-y-3 mb-6">
                    {tier.features.map((feature, j) => (
                      <li key={j} className="flex items-start gap-2 text-gray-300 text-sm">
                        <Check className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            <Button
              variant="outline"
              size="lg"
              onClick={() => router.push('/pricing')}
            >
              View Full Pricing
            </Button>
          </GlassmorphicPanel>
        </motion.div>
      </section>

      {/* Final CTA Section */}
      <section className="relative z-10 container mx-auto px-4 py-20 mb-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.2 }}
          className="max-w-4xl mx-auto"
        >
          <GlassmorphicPanel className="p-16 text-center" blur="strong">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Ready to Stop Going It Alone?
            </h2>
            <p className="text-xl text-gray-300 mb-10">
              Join thousands of solo founders who've built their virtual executive team with SoloSuccess AI.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                variant="gradient"
                size="lg"
                onClick={() => router.push('/auth/register')}
                className="group"
              >
                Start Your Free Trial
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={() => router.push('/demo')}
              >
                Schedule a Demo
              </Button>
            </div>

            <p className="text-sm text-gray-400 mt-8">
              First 1,000 users get lifetime 20% discount
            </p>
          </GlassmorphicPanel>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/10 bg-black/20 backdrop-blur-xl">
        <div className="container mx-auto px-4 py-12">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="w-6 h-6 text-cyan-400" />
                <span className="text-lg font-bold text-white">SoloSuccess AI</span>
              </div>
              <p className="text-gray-400 text-sm">
                Your Virtual Executive Team
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-white mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="/pricing" className="hover:text-white transition-colors">Pricing</a></li>
                <li><a href="/features" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="/agents" className="hover:text-white transition-colors">AI Agents</a></li>
                <li><a href="/demo" className="hover:text-white transition-colors">Demo</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-white mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="/about" className="hover:text-white transition-colors">About</a></li>
                <li><a href="/blog" className="hover:text-white transition-colors">Blog</a></li>
                <li><a href="/careers" className="hover:text-white transition-colors">Careers</a></li>
                <li><a href="/contact" className="hover:text-white transition-colors">Contact</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-white mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="/privacy" className="hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="/terms" className="hover:text-white transition-colors">Terms of Service</a></li>
                <li><a href="/security" className="hover:text-white transition-colors">Security</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-white/10 pt-8 text-center text-sm text-gray-400">
            <p>© 2024 SoloSuccess AI. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
