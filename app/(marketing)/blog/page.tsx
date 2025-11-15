'use client';

import { motion } from 'framer-motion';
import { GlassmorphicPanel } from '@/components/ui/GlassmorphicPanel';
import { Button } from '@/components/ui/Button';
import { useRouter } from 'next/navigation';
import { BookOpen, Calendar, User, ArrowRight } from 'lucide-react';

const blogPosts = [
  {
    title: '7 AI Agents Every Solo Founder Needs in 2024',
    excerpt: 'Discover how specialized AI agents can transform your solo founder journey by providing expert guidance across all business functions.',
    author: 'Sarah Chen',
    date: 'November 10, 2024',
    category: 'AI & Automation',
    readTime: '5 min read',
    image: '📚'
  },
  {
    title: 'Mission Control: How to Plan Complex Projects in 30 Minutes',
    excerpt: 'Learn how to leverage AI collaboration to create comprehensive project plans that would normally take days to develop.',
    author: 'Marcus Rodriguez',
    date: 'November 8, 2024',
    category: 'Productivity',
    readTime: '7 min read',
    image: '🎯'
  },
  {
    title: 'The Solo Founder\'s Guide to Competitive Intelligence',
    excerpt: 'Stay ahead of your competition with automated tracking and AI-powered analysis. Here\'s how to do it right.',
    author: 'Emily Watson',
    date: 'November 5, 2024',
    category: 'Strategy',
    readTime: '6 min read',
    image: '🔍'
  },
  {
    title: 'Cognitive Biases That Sabotage Solo Founders',
    excerpt: 'Identify and overcome the mental traps that hold back solo entrepreneurs from making optimal business decisions.',
    author: 'David Kim',
    date: 'November 1, 2024',
    category: 'Psychology',
    readTime: '8 min read',
    image: '🧠'
  },
  {
    title: 'From Idea to Launch: A 90-Day Solo Founder Roadmap',
    excerpt: 'A practical guide to launching your startup as a solo founder, with AI-powered tools to accelerate every step.',
    author: 'Sarah Chen',
    date: 'October 28, 2024',
    category: 'Startup Guide',
    readTime: '10 min read',
    image: '🚀'
  },
  {
    title: 'How AI is Democratizing Entrepreneurship',
    excerpt: 'The tools that once required entire teams are now accessible to solo founders. Here\'s what that means for the future.',
    author: 'Marcus Rodriguez',
    date: 'October 25, 2024',
    category: 'Industry Trends',
    readTime: '6 min read',
    image: '💡'
  }
];

export default function BlogPage() {
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
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center mx-auto mb-6">
            <BookOpen className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
            SoloSuccess Blog
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Insights, strategies, and stories for solo founders building the future.
          </p>
        </motion.div>

        {/* Featured Post */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="max-w-5xl mx-auto mb-16"
        >
          <GlassmorphicPanel className="p-8 md:p-12">
            <div className="flex items-center gap-2 mb-4">
              <span className="px-3 py-1 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full text-sm font-semibold text-white">
                Featured
              </span>
              <span className="text-gray-400 text-sm">{blogPosts[0].category}</span>
            </div>
            <h2 className="text-4xl font-bold text-white mb-4">{blogPosts[0].title}</h2>
            <p className="text-xl text-gray-300 mb-6">{blogPosts[0].excerpt}</p>
            <div className="flex items-center gap-6 mb-6">
              <div className="flex items-center gap-2 text-gray-400">
                <User className="w-4 h-4" />
                <span className="text-sm">{blogPosts[0].author}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-400">
                <Calendar className="w-4 h-4" />
                <span className="text-sm">{blogPosts[0].date}</span>
              </div>
              <span className="text-sm text-gray-400">{blogPosts[0].readTime}</span>
            </div>
            <Button variant="gradient" className="group">
              Read Article
              <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </GlassmorphicPanel>
        </motion.div>

        {/* Blog Grid */}
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-white mb-8">Recent Articles</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {blogPosts.slice(1).map((post, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + i * 0.1 }}
                whileHover={{ scale: 1.02, y: -5 }}
                className="cursor-pointer"
              >
                <GlassmorphicPanel className="h-full hover:bg-white/15 transition-all">
                  <div className="text-6xl mb-4">{post.image}</div>
                  <span className="inline-block px-3 py-1 bg-white/10 rounded-full text-xs font-semibold text-cyan-400 mb-3">
                    {post.category}
                  </span>
                  <h3 className="text-xl font-bold text-white mb-3">{post.title}</h3>
                  <p className="text-gray-300 text-sm mb-4 line-clamp-3">{post.excerpt}</p>
                  <div className="flex items-center gap-4 text-xs text-gray-400 mb-4">
                    <span>{post.author}</span>
                    <span>•</span>
                    <span>{post.readTime}</span>
                  </div>
                  <Button variant="ghost" size="sm" className="group">
                    Read More
                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </GlassmorphicPanel>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Newsletter CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="max-w-4xl mx-auto mt-20"
        >
          <GlassmorphicPanel className="p-12 text-center">
            <h2 className="text-3xl font-bold text-white mb-4">
              Never Miss an Update
            </h2>
            <p className="text-lg text-gray-300 mb-8">
              Get the latest insights, strategies, and stories delivered to your inbox every week.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <input
                type="email"
                placeholder="your@email.com"
                className="flex-1 px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <Button variant="gradient">
                Subscribe
              </Button>
            </div>
            <p className="text-sm text-gray-400 mt-4">
              Join 10,000+ solo founders. Unsubscribe anytime.
            </p>
          </GlassmorphicPanel>
        </motion.div>
      </div>
    </div>
  );
}
