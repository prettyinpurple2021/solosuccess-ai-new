'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  CreditCard,
  Download,
  Calendar,
  DollarSign,
  FileText,
  ExternalLink,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { GlassmorphicCard } from '@/components/ui/GlassmorphicCard';

interface Invoice {
  id: string;
  number: string | null;
  amount: number;
  currency: string;
  status: string;
  created: Date;
  pdfUrl: string | null;
  hostedUrl: string | null;
  periodStart: Date | null;
  periodEnd: Date | null;
}

interface PaymentMethod {
  id: string;
  type: string;
  card: {
    brand: string;
    last4: string;
    expMonth: number;
    expYear: number;
  } | null;
}

interface BillingPortalProps {
  userId: string;
}

export function BillingPortal({ userId }: BillingPortalProps) {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isManagingBilling, setIsManagingBilling] = useState(false);

  useEffect(() => {
    fetchBillingData();
  }, [userId]);

  const fetchBillingData = async () => {
    setIsLoading(true);
    try {
      const [invoicesRes, paymentMethodsRes] = await Promise.all([
        fetch(`/api/stripe/invoices?userId=${userId}`),
        fetch(`/api/stripe/payment-methods?userId=${userId}`),
      ]);

      if (invoicesRes.ok) {
        const data = await invoicesRes.json();
        setInvoices(
          data.invoices.map((inv: any) => ({
            ...inv,
            created: new Date(inv.created),
            periodStart: inv.periodStart ? new Date(inv.periodStart) : null,
            periodEnd: inv.periodEnd ? new Date(inv.periodEnd) : null,
          }))
        );
      }

      if (paymentMethodsRes.ok) {
        const data = await paymentMethodsRes.json();
        setPaymentMethods(data.paymentMethods);
      }
    } catch (error) {
      console.error('Error fetching billing data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleManageBilling = async () => {
    setIsManagingBilling(true);
    try {
      const response = await fetch('/api/stripe/portal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });

      if (response.ok) {
        const data = await response.json();
        window.location.href = data.url;
      }
    } catch (error) {
      console.error('Error opening billing portal:', error);
    } finally {
      setIsManagingBilling(false);
    }
  };

  const formatAmount = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase(),
    }).format(amount / 100);
  };

  const getCardBrandIcon = (brand: string) => {
    // In a real app, you'd use actual card brand logos
    return brand.charAt(0).toUpperCase() + brand.slice(1);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Payment Methods */}
      <GlassmorphicCard className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <CreditCard className="w-6 h-6 text-purple-400" />
            <h3 className="text-2xl font-bold text-white">Payment Methods</h3>
          </div>
          <Button
            onClick={handleManageBilling}
            disabled={isManagingBilling}
            className="bg-purple-500 hover:bg-purple-600"
          >
            {isManagingBilling ? 'Loading...' : 'Manage Billing'}
          </Button>
        </div>

        {paymentMethods.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-400">No payment methods on file</p>
            <Button
              onClick={handleManageBilling}
              className="mt-4 bg-purple-500 hover:bg-purple-600"
            >
              Add Payment Method
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {paymentMethods.map((method) => (
              <motion.div
                key={method.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded flex items-center justify-center text-white text-xs font-bold">
                    {method.card ? getCardBrandIcon(method.card.brand) : 'CARD'}
                  </div>
                  <div>
                    <p className="text-white font-semibold">
                      {method.card
                        ? `•••• •••• •••• ${method.card.last4}`
                        : 'Card'}
                    </p>
                    {method.card && (
                      <p className="text-sm text-gray-400">
                        Expires {method.card.expMonth}/{method.card.expYear}
                      </p>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </GlassmorphicCard>

      {/* Invoice History */}
      <GlassmorphicCard className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <FileText className="w-6 h-6 text-purple-400" />
          <h3 className="text-2xl font-bold text-white">Invoice History</h3>
        </div>

        {invoices.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-400">No invoices yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {invoices.map((invoice) => (
              <motion.div
                key={invoice.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 bg-white/5 rounded-lg border border-white/10"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <p className="text-white font-semibold">
                        {invoice.number || `Invoice ${invoice.id.slice(-8)}`}
                      </p>
                      <span
                        className={`px-2 py-1 rounded text-xs font-semibold ${
                          invoice.status === 'paid'
                            ? 'bg-green-500/20 text-green-400'
                            : invoice.status === 'open'
                            ? 'bg-yellow-500/20 text-yellow-400'
                            : 'bg-red-500/20 text-red-400'
                        }`}
                      >
                        {invoice.status}
                      </span>
                    </div>

                    <div className="flex items-center gap-6 text-sm text-gray-400">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        <span>{invoice.created.toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <DollarSign className="w-4 h-4" />
                        <span>
                          {formatAmount(invoice.amount, invoice.currency)}
                        </span>
                      </div>
                      {invoice.periodStart && invoice.periodEnd && (
                        <span>
                          {invoice.periodStart.toLocaleDateString()} -{' '}
                          {invoice.periodEnd.toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {invoice.pdfUrl && (
                      <a
                        href={invoice.pdfUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
                        title="Download PDF"
                      >
                        <Download className="w-5 h-5 text-white" />
                      </a>
                    )}
                    {invoice.hostedUrl && (
                      <a
                        href={invoice.hostedUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
                        title="View Invoice"
                      >
                        <ExternalLink className="w-5 h-5 text-white" />
                      </a>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </GlassmorphicCard>

      {/* Billing Address */}
      <GlassmorphicCard className="p-6">
        <h3 className="text-2xl font-bold text-white mb-4">Billing Address</h3>
        <p className="text-gray-400 mb-4">
          Manage your billing address and tax information through the Stripe
          billing portal.
        </p>
        <Button
          onClick={handleManageBilling}
          disabled={isManagingBilling}
          className="bg-white/10 hover:bg-white/20"
        >
          Update Billing Information
        </Button>
      </GlassmorphicCard>
    </div>
  );
}
