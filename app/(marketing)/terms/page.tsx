'use client';

import { motion } from 'framer-motion';
import { GlassmorphicPanel } from '@/components/ui/GlassmorphicPanel';
import { FileText } from 'lucide-react';

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-teal-900">
      <div className="container mx-auto px-4 py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl mx-auto"
        >
          <div className="text-center mb-12">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mx-auto mb-6">
              <FileText className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-5xl font-bold text-white mb-4">Terms of Service</h1>
            <p className="text-gray-300">Last Updated: November 15, 2024</p>
          </div>

          <GlassmorphicPanel className="p-8 md:p-12">
            <div className="prose prose-invert max-w-none">
              <section className="mb-8">
                <h2 className="text-2xl font-bold text-white mb-4">1. Acceptance of Terms</h2>
                <p className="text-gray-300 leading-relaxed">
                  By accessing or using SoloSuccess AI ("the Service"), you agree to be bound by these Terms of Service ("Terms"). If you do not agree to these Terms, you may not access or use the Service. These Terms apply to all users, including visitors, registered users, and subscribers.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-white mb-4">2. Description of Service</h2>
                <p className="text-gray-300 leading-relaxed mb-4">
                  SoloSuccess AI provides AI-powered business assistance tools for solo founders and entrepreneurs, including but not limited to:
                </p>
                <ul className="list-disc list-inside text-gray-300 space-y-2">
                  <li>AI agent conversations for strategic guidance</li>
                  <li>Mission Control for complex project planning</li>
                  <li>Competitor intelligence tracking</li>
                  <li>Content and document generation</li>
                  <li>Data analytics and insights</li>
                  <li>Business planning and risk assessment tools</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-white mb-4">3. User Accounts</h2>
                
                <h3 className="text-xl font-semibold text-white mb-3">3.1 Account Creation</h3>
                <p className="text-gray-300 leading-relaxed mb-4">
                  To use certain features of the Service, you must create an account. You agree to:
                </p>
                <ul className="list-disc list-inside text-gray-300 space-y-2 mb-4">
                  <li>Provide accurate, current, and complete information</li>
                  <li>Maintain and update your information to keep it accurate</li>
                  <li>Maintain the security of your password</li>
                  <li>Accept responsibility for all activities under your account</li>
                  <li>Notify us immediately of any unauthorized use</li>
                </ul>

                <h3 className="text-xl font-semibold text-white mb-3">3.2 Account Eligibility</h3>
                <p className="text-gray-300 leading-relaxed">
                  You must be at least 18 years old to create an account. By creating an account, you represent that you meet this age requirement and have the legal capacity to enter into these Terms.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-white mb-4">4. Subscription and Payment</h2>
                
                <h3 className="text-xl font-semibold text-white mb-3">4.1 Subscription Plans</h3>
                <p className="text-gray-300 leading-relaxed mb-4">
                  We offer various subscription plans with different features and pricing. Current plans and pricing are available on our pricing page.
                </p>

                <h3 className="text-xl font-semibold text-white mb-3">4.2 Billing</h3>
                <p className="text-gray-300 leading-relaxed mb-4">
                  Subscription fees are billed in advance on a monthly or annual basis. You authorize us to charge your payment method for all fees incurred. All fees are non-refundable except as required by law or as explicitly stated in our refund policy.
                </p>

                <h3 className="text-xl font-semibold text-white mb-3">4.3 Free Trial</h3>
                <p className="text-gray-300 leading-relaxed mb-4">
                  We may offer a free trial period. At the end of the trial, your subscription will automatically convert to a paid subscription unless you cancel before the trial ends.
                </p>

                <h3 className="text-xl font-semibold text-white mb-3">4.4 Cancellation</h3>
                <p className="text-gray-300 leading-relaxed mb-4">
                  You may cancel your subscription at any time. Cancellation will take effect at the end of your current billing period. You will retain access to paid features until the end of the billing period.
                </p>

                <h3 className="text-xl font-semibold text-white mb-3">4.5 Refund Policy</h3>
                <p className="text-gray-300 leading-relaxed">
                  We offer a 14-day money-back guarantee on all paid plans. If you are not satisfied within the first 14 days of your subscription, contact us for a full refund.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-white mb-4">5. Acceptable Use</h2>
                <p className="text-gray-300 leading-relaxed mb-4">
                  You agree not to use the Service to:
                </p>
                <ul className="list-disc list-inside text-gray-300 space-y-2">
                  <li>Violate any laws or regulations</li>
                  <li>Infringe on intellectual property rights</li>
                  <li>Transmit harmful or malicious code</li>
                  <li>Attempt to gain unauthorized access to systems</li>
                  <li>Interfere with or disrupt the Service</li>
                  <li>Use the Service for any illegal or unauthorized purpose</li>
                  <li>Harass, abuse, or harm others</li>
                  <li>Impersonate any person or entity</li>
                  <li>Collect or store personal data about other users</li>
                  <li>Use automated systems to access the Service without permission</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-white mb-4">6. AI-Generated Content</h2>
                
                <h3 className="text-xl font-semibold text-white mb-3">6.1 Nature of AI Content</h3>
                <p className="text-gray-300 leading-relaxed mb-4">
                  Content generated by our AI agents is provided for informational and assistance purposes only. AI-generated content:
                </p>
                <ul className="list-disc list-inside text-gray-300 space-y-2 mb-4">
                  <li>Should not be considered professional advice (legal, financial, medical, etc.)</li>
                  <li>May contain errors or inaccuracies</li>
                  <li>Should be reviewed and verified before use</li>
                  <li>Is not a substitute for professional consultation</li>
                </ul>

                <h3 className="text-xl font-semibold text-white mb-3">6.2 Your Responsibility</h3>
                <p className="text-gray-300 leading-relaxed mb-4">
                  You are solely responsible for:
                </p>
                <ul className="list-disc list-inside text-gray-300 space-y-2">
                  <li>Reviewing and verifying AI-generated content</li>
                  <li>Decisions made based on AI recommendations</li>
                  <li>Compliance with applicable laws and regulations</li>
                  <li>Seeking professional advice when appropriate</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-white mb-4">7. Intellectual Property</h2>
                
                <h3 className="text-xl font-semibold text-white mb-3">7.1 Our Rights</h3>
                <p className="text-gray-300 leading-relaxed mb-4">
                  The Service and its original content, features, and functionality are owned by SoloSuccess AI and are protected by international copyright, trademark, patent, trade secret, and other intellectual property laws.
                </p>

                <h3 className="text-xl font-semibold text-white mb-3">7.2 Your Content</h3>
                <p className="text-gray-300 leading-relaxed mb-4">
                  You retain ownership of content you submit to the Service. By submitting content, you grant us a worldwide, non-exclusive, royalty-free license to use, reproduce, modify, and display your content solely for the purpose of providing and improving the Service.
                </p>

                <h3 className="text-xl font-semibold text-white mb-3">7.3 AI-Generated Content Ownership</h3>
                <p className="text-gray-300 leading-relaxed">
                  You own the output generated by our AI agents in response to your inputs, subject to our rights in the underlying AI models and technology.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-white mb-4">8. Privacy and Data Protection</h2>
                <p className="text-gray-300 leading-relaxed">
                  Your use of the Service is also governed by our Privacy Policy. By using the Service, you consent to the collection and use of your information as described in the Privacy Policy.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-white mb-4">9. Disclaimers and Limitations of Liability</h2>
                
                <h3 className="text-xl font-semibold text-white mb-3">9.1 Service "As Is"</h3>
                <p className="text-gray-300 leading-relaxed mb-4">
                  THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT.
                </p>

                <h3 className="text-xl font-semibold text-white mb-3">9.2 Limitation of Liability</h3>
                <p className="text-gray-300 leading-relaxed mb-4">
                  TO THE MAXIMUM EXTENT PERMITTED BY LAW, SOLOSUCCESS AI SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR ANY LOSS OF PROFITS OR REVENUES, WHETHER INCURRED DIRECTLY OR INDIRECTLY, OR ANY LOSS OF DATA, USE, GOODWILL, OR OTHER INTANGIBLE LOSSES.
                </p>

                <h3 className="text-xl font-semibold text-white mb-3">9.3 Maximum Liability</h3>
                <p className="text-gray-300 leading-relaxed">
                  Our total liability to you for any claims arising from or related to the Service shall not exceed the amount you paid us in the 12 months preceding the claim.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-white mb-4">10. Indemnification</h2>
                <p className="text-gray-300 leading-relaxed">
                  You agree to indemnify, defend, and hold harmless SoloSuccess AI and its officers, directors, employees, and agents from any claims, liabilities, damages, losses, and expenses arising from your use of the Service or violation of these Terms.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-white mb-4">11. Termination</h2>
                <p className="text-gray-300 leading-relaxed mb-4">
                  We may terminate or suspend your account and access to the Service immediately, without prior notice, for any reason, including:
                </p>
                <ul className="list-disc list-inside text-gray-300 space-y-2 mb-4">
                  <li>Violation of these Terms</li>
                  <li>Fraudulent or illegal activity</li>
                  <li>Extended period of inactivity</li>
                  <li>Request by law enforcement or government agencies</li>
                </ul>
                <p className="text-gray-300 leading-relaxed">
                  Upon termination, your right to use the Service will immediately cease. All provisions of these Terms that by their nature should survive termination shall survive.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-white mb-4">12. Changes to Terms</h2>
                <p className="text-gray-300 leading-relaxed">
                  We reserve the right to modify these Terms at any time. We will notify you of material changes by email or through the Service. Your continued use of the Service after changes become effective constitutes acceptance of the modified Terms.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-white mb-4">13. Governing Law and Dispute Resolution</h2>
                <p className="text-gray-300 leading-relaxed mb-4">
                  These Terms shall be governed by the laws of the State of California, United States, without regard to its conflict of law provisions.
                </p>
                <p className="text-gray-300 leading-relaxed">
                  Any disputes arising from these Terms or the Service shall be resolved through binding arbitration in accordance with the rules of the American Arbitration Association, except that either party may seek injunctive relief in court.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-white mb-4">14. Severability</h2>
                <p className="text-gray-300 leading-relaxed">
                  If any provision of these Terms is found to be unenforceable or invalid, that provision shall be limited or eliminated to the minimum extent necessary, and the remaining provisions shall remain in full force and effect.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-white mb-4">15. Entire Agreement</h2>
                <p className="text-gray-300 leading-relaxed">
                  These Terms, together with our Privacy Policy, constitute the entire agreement between you and SoloSuccess AI regarding the Service and supersede all prior agreements and understandings.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4">16. Contact Information</h2>
                <p className="text-gray-300 leading-relaxed mb-4">
                  If you have questions about these Terms, please contact us:
                </p>
                <div className="bg-white/5 border border-white/10 rounded-lg p-6">
                  <p className="text-gray-300">
                    <strong className="text-white">Email:</strong> legal@solosuccess.ai<br />
                    <strong className="text-white">Address:</strong> SoloSuccess AI, Inc.<br />
                    123 Innovation Drive<br />
                    San Francisco, CA 94105<br />
                    United States
                  </p>
                </div>
              </section>
            </div>
          </GlassmorphicPanel>
        </motion.div>
      </div>
    </div>
  );
}
