'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { GlassmorphicPanel } from '@/components/ui/GlassmorphicPanel';
import { Input } from '@/components/ui/Input';
import { HelpCircle, Search, ChevronDown } from 'lucide-react';

const faqCategories = [
  {
    category: 'General Questions',
    questions: [
      {
        q: 'What is SoloSuccess AI?',
        a: 'SoloSuccess AI is an AI-powered platform that provides solo founders and entrepreneurs with a virtual executive team of specialized AI agents. Each agent helps with different aspects of running a business, from strategy to marketing to legal documents.'
      },
      {
        q: 'Who is SoloSuccess AI for?',
        a: 'SoloSuccess AI is designed for solo founders building startups, freelancers and consultants, small business owners, side project entrepreneurs, and anyone running a business without a full team.'
      },
      {
        q: 'How is this different from ChatGPT?',
        a: 'While ChatGPT is a general-purpose AI, SoloSuccess AI offers specialized agents trained for specific business functions, context retention across conversations, integrated tools like competitor tracking and analytics, Mission Control for multi-agent collaboration, and optimization specifically for entrepreneurial needs.'
      },
      {
        q: 'Do I need technical skills to use SoloSuccess AI?',
        a: 'No technical skills required! The platform is designed to be intuitive and user-friendly. If you can use email or social media, you can use SoloSuccess AI.'
      }
    ]
  },
  {
    category: 'Account & Billing',
    questions: [
      {
        q: 'What subscription plans are available?',
        a: 'We offer three tiers: Free ($0/month) with access to all 7 agents and 100 messages/month, Accelerator ($49/month) with unlimited conversations and premium features, and Premium ($149/month) with everything plus unlimited Mission Control and dedicated support.'
      },
      {
        q: 'Can I change my plan anytime?',
        a: 'Yes! Upgrade or downgrade anytime from Settings → Subscription. Changes take effect immediately.'
      },
      {
        q: 'Is there a free trial?',
        a: 'Yes! All new users start with the Free tier. Upgrade to Accelerator or Premium anytime. Premium users get a 14-day money-back guarantee.'
      },
      {
        q: 'Can I cancel anytime?',
        a: 'Absolutely. Cancel anytime from your subscription settings. No questions asked, no cancellation fees. You\'ll retain access until the end of your billing period.'
      },
      {
        q: 'Do you offer refunds?',
        a: 'Premium tier includes a 14-day money-back guarantee. If you\'re not satisfied, contact support@solosuccess.ai within 14 days for a full refund.'
      }
    ]
  },
  {
    category: 'AI Agents',
    questions: [
      {
        q: 'How many AI agents are available?',
        a: 'Seven specialized AI agents: Roxy (Strategic Operator), Echo (Growth Catalyst), Blaze (Sales Strategist), Lumi (Legal & Docs), Vex (Technical Architect), Lexi (Insight Engine), and Nova (Product Designer).'
      },
      {
        q: 'Do agents remember previous conversations?',
        a: 'Yes! Each agent maintains conversation context for 30 days. They remember your business details, previous discussions, and ongoing projects.'
      },
      {
        q: 'How fast do agents respond?',
        a: 'Simple queries: 2-5 seconds, Complex analysis: 5-10 seconds, Mission Control sessions: 15-30 minutes.'
      },
      {
        q: 'Are agent responses accurate?',
        a: 'Our AI agents are powered by state-of-the-art language models (GPT-4 and Claude) and are highly accurate. However, always verify critical information, especially for legal, financial, or technical decisions.'
      }
    ]
  },
  {
    category: 'Mission Control',
    questions: [
      {
        q: 'What is Mission Control?',
        a: 'Mission Control is our flagship feature where multiple AI agents collaborate on complex business objectives. You describe your goal, and relevant agents work together to create a comprehensive, actionable plan.'
      },
      {
        q: 'How long does a Mission Control session take?',
        a: 'Standard objectives: 15-30 minutes, Complex strategic plans: 30-60 minutes. You\'ll receive real-time progress updates.'
      },
      {
        q: 'How many Mission Control sessions can I run?',
        a: 'Free Tier: Not available, Accelerator Tier: 5 sessions per month, Premium Tier: Unlimited sessions.'
      },
      {
        q: 'Can I export Mission Control results?',
        a: 'Yes! Export results as PDF (formatted report), DOCX (editable document), JSON (structured data), or Markdown (plain text).'
      }
    ]
  },
  {
    category: 'Data & Privacy',
    questions: [
      {
        q: 'Is my data secure?',
        a: 'Yes. We use bank-level security with AES-256 encryption at rest, TLS 1.3 encryption in transit, SOC 2 Type II certification, regular security audits, and GDPR/CCPA compliance.'
      },
      {
        q: 'Who can see my data?',
        a: 'Only you. Your conversations, documents, and business data are private and never shared with other users or used to train AI models.'
      },
      {
        q: 'Can I export my data?',
        a: 'Yes! Export all your data anytime from Settings → Data & Privacy. You\'ll receive all conversations, generated content, documents, analytics data, and account information.'
      },
      {
        q: 'Do you use my data to train AI models?',
        a: 'No. Your data is never used to train AI models or improve algorithms. Your conversations and business information remain completely private.'
      }
    ]
  },
  {
    category: 'Support',
    questions: [
      {
        q: 'How do I get help?',
        a: 'Multiple support channels: In-App Chat (click the ? icon), Email (support@solosuccess.ai), Community (community.solosuccess.ai), and Documentation (docs.solosuccess.ai).'
      },
      {
        q: 'What\'s your response time?',
        a: 'Free Tier: 48 hours via email, Accelerator Tier: 24 hours via email, Premium Tier: 4 hours via email, instant via live chat during business hours.'
      },
      {
        q: 'Do you offer onboarding?',
        a: 'Free & Accelerator: Self-service onboarding with video tutorials. Premium: White-glove onboarding with a dedicated success manager.'
      }
    ]
  }
];

export default function FAQPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  const toggleItem = (id: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedItems(newExpanded);
  };

  const filteredCategories = faqCategories.map(category => ({
    ...category,
    questions: category.questions.filter(
      q =>
        q.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
        q.a.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(category => category.questions.length > 0);

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
            <HelpCircle className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
            Frequently Asked Questions
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Find answers to common questions about SoloSuccess AI
          </p>
        </motion.div>

        {/* Search */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="max-w-2xl mx-auto mb-12"
        >
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              type="text"
              placeholder="Search for answers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12"
            />
          </div>
        </motion.div>

        {/* FAQ Categories */}
        <div className="max-w-4xl mx-auto space-y-8">
          {filteredCategories.map((category, categoryIndex) => (
            <motion.div
              key={category.category}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + categoryIndex * 0.1 }}
            >
              <h2 className="text-3xl font-bold text-white mb-6">{category.category}</h2>
              <div className="space-y-4">
                {category.questions.map((item, index) => {
                  const itemId = `${category.category}-${index}`;
                  const isExpanded = expandedItems.has(itemId);

                  return (
                    <GlassmorphicPanel
                      key={itemId}
                      className="cursor-pointer transition-all hover:bg-white/15"
                      onClick={() => toggleItem(itemId)}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <h3 className="text-lg font-semibold text-white flex-1">
                          {item.q}
                        </h3>
                        <motion.div
                          animate={{ rotate: isExpanded ? 180 : 0 }}
                          transition={{ duration: 0.3 }}
                        >
                          <ChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0" />
                        </motion.div>
                      </div>

                      <motion.div
                        initial={false}
                        animate={{
                          height: isExpanded ? 'auto' : 0,
                          opacity: isExpanded ? 1 : 0,
                        }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden"
                      >
                        <p className="text-gray-300 mt-4 leading-relaxed">
                          {item.a}
                        </p>
                      </motion.div>
                    </GlassmorphicPanel>
                  );
                })}
              </div>
            </motion.div>
          ))}

          {filteredCategories.length === 0 && (
            <GlassmorphicPanel className="p-12 text-center">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-xl font-semibold text-white mb-2">
                No results found
              </h3>
              <p className="text-gray-300">
                Try adjusting your search or browse all categories above
              </p>
            </GlassmorphicPanel>
          )}
        </div>

        {/* Contact CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="max-w-4xl mx-auto mt-16"
        >
          <GlassmorphicPanel className="p-12 text-center">
            <h2 className="text-3xl font-bold text-white mb-4">
              Still Have Questions?
            </h2>
            <p className="text-lg text-gray-300 mb-8">
              Can't find what you're looking for? Our support team is here to help.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="mailto:support@solosuccess.ai"
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium rounded-lg transition-all"
              >
                Email Support
              </a>
              <a
                href="/contact"
                className="px-6 py-3 border-2 border-white/30 hover:border-white/50 bg-transparent hover:bg-white/10 text-white font-medium rounded-lg transition-all"
              >
                Contact Us
              </a>
            </div>
          </GlassmorphicPanel>
        </motion.div>
      </div>
    </div>
  );
}
