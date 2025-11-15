'use client';

import { motion } from 'framer-motion';
import { GlassmorphicPanel } from '@/components/ui/GlassmorphicPanel';
import { Shield, Lock, Eye, Server, FileCheck, AlertTriangle, CheckCircle } from 'lucide-react';

const securityFeatures = [
  {
    icon: Lock,
    title: 'End-to-End Encryption',
    description: 'All data is encrypted in transit using TLS 1.3 and at rest using AES-256 encryption.',
    gradient: 'from-blue-500 to-cyan-500'
  },
  {
    icon: Server,
    title: 'Secure Infrastructure',
    description: 'Hosted on AWS with SOC 2 Type II compliance, regular security audits, and 99.9% uptime SLA.',
    gradient: 'from-purple-500 to-pink-500'
  },
  {
    icon: Eye,
    title: 'Privacy by Design',
    description: 'We collect only what we need and never sell your data. GDPR and CCPA compliant.',
    gradient: 'from-orange-500 to-red-500'
  },
  {
    icon: FileCheck,
    title: 'Regular Audits',
    description: 'Third-party security audits, penetration testing, and vulnerability assessments.',
    gradient: 'from-teal-500 to-emerald-500'
  },
  {
    icon: AlertTriangle,
    title: 'Incident Response',
    description: '24/7 security monitoring with automated threat detection and rapid response protocols.',
    gradient: 'from-indigo-500 to-blue-500'
  },
  {
    icon: CheckCircle,
    title: 'Access Controls',
    description: 'Multi-factor authentication, role-based access control, and session management.',
    gradient: 'from-violet-500 to-purple-500'
  }
];

const certifications = [
  { name: 'SOC 2 Type II', status: 'Certified' },
  { name: 'GDPR', status: 'Compliant' },
  { name: 'CCPA', status: 'Compliant' },
  { name: 'ISO 27001', status: 'In Progress' },
  { name: 'HIPAA', status: 'Available for Enterprise' }
];

export default function SecurityPage() {
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
            <Shield className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
            Security & Compliance
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Your data security is our top priority. We implement industry-leading security practices to protect your business information.
          </p>
        </motion.div>

        {/* Security Features */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="max-w-6xl mx-auto mb-16"
        >
          <h2 className="text-4xl font-bold text-white text-center mb-12">How We Protect Your Data</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {securityFeatures.map((feature, i) => {
              const Icon = feature.icon;
              return (
                <GlassmorphicPanel key={i}>
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-4`}>
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">{feature.title}</h3>
                  <p className="text-gray-300">{feature.description}</p>
                </GlassmorphicPanel>
              );
            })}
          </div>
        </motion.div>

        {/* Data Protection */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="max-w-4xl mx-auto mb-16"
        >
          <GlassmorphicPanel className="p-12">
            <h2 className="text-3xl font-bold text-white mb-6">Data Protection Practices</h2>
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold text-white mb-3">Encryption</h3>
                <ul className="space-y-2 text-gray-300">
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                    <span>TLS 1.3 for all data in transit</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                    <span>AES-256 encryption for data at rest</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                    <span>Field-level encryption for sensitive data</span>
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-white mb-3">Access Control</h3>
                <ul className="space-y-2 text-gray-300">
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                    <span>Multi-factor authentication (MFA) required</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                    <span>Role-based access control (RBAC)</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                    <span>Automatic session timeout and management</span>
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-white mb-3">Monitoring & Response</h3>
                <ul className="space-y-2 text-gray-300">
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                    <span>24/7 security monitoring and alerting</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                    <span>Automated threat detection and prevention</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                    <span>Incident response team on standby</span>
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-white mb-3">Backup & Recovery</h3>
                <ul className="space-y-2 text-gray-300">
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                    <span>Automated daily backups with encryption</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                    <span>Point-in-time recovery capabilities</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                    <span>Disaster recovery plan tested quarterly</span>
                  </li>
                </ul>
              </div>
            </div>
          </GlassmorphicPanel>
        </motion.div>

        {/* Certifications */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="max-w-4xl mx-auto mb-16"
        >
          <GlassmorphicPanel className="p-12">
            <h2 className="text-3xl font-bold text-white mb-6 text-center">Certifications & Compliance</h2>
            <div className="grid md:grid-cols-2 gap-6">
              {certifications.map((cert, i) => (
                <div key={i} className="flex items-center justify-between bg-white/5 border border-white/10 rounded-lg p-4">
                  <span className="text-lg font-semibold text-white">{cert.name}</span>
                  <span className="px-3 py-1 bg-green-500/20 border border-green-500/50 rounded-full text-sm text-green-400">
                    {cert.status}
                  </span>
                </div>
              ))}
            </div>
          </GlassmorphicPanel>
        </motion.div>

        {/* Responsible Disclosure */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="max-w-4xl mx-auto mb-16"
        >
          <GlassmorphicPanel className="p-12">
            <h2 className="text-3xl font-bold text-white mb-6">Responsible Disclosure</h2>
            <p className="text-gray-300 mb-6 leading-relaxed">
              We take security vulnerabilities seriously. If you discover a security issue, please report it to us responsibly:
            </p>
            <div className="bg-white/5 border border-white/10 rounded-lg p-6 mb-6">
              <p className="text-gray-300 mb-2">
                <strong className="text-white">Email:</strong> security@solosuccess.ai
              </p>
              <p className="text-gray-300 mb-2">
                <strong className="text-white">PGP Key:</strong> Available upon request
              </p>
              <p className="text-gray-300">
                <strong className="text-white">Response Time:</strong> Within 24 hours
              </p>
            </div>
            <p className="text-gray-300 leading-relaxed">
              We appreciate the security research community and will acknowledge researchers who report valid vulnerabilities. We do not currently offer a bug bounty program but may provide recognition and swag for significant findings.
            </p>
          </GlassmorphicPanel>
        </motion.div>

        {/* Security Updates */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="max-w-4xl mx-auto"
        >
          <GlassmorphicPanel className="p-12 text-center">
            <h2 className="text-3xl font-bold text-white mb-4">
              Questions About Security?
            </h2>
            <p className="text-lg text-gray-300 mb-8">
              Our security team is here to answer your questions and provide additional documentation.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="mailto:security@solosuccess.ai"
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium rounded-lg transition-all"
              >
                Contact Security Team
              </a>
              <a
                href="/privacy"
                className="px-6 py-3 border-2 border-white/30 hover:border-white/50 bg-transparent hover:bg-white/10 text-white font-medium rounded-lg transition-all"
              >
                View Privacy Policy
              </a>
            </div>
          </GlassmorphicPanel>
        </motion.div>
      </div>
    </div>
  );
}
