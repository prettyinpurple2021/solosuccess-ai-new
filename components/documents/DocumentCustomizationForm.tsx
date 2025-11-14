'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, FileText, Loader2 } from 'lucide-react';
import { DocumentTemplate, useGenerateDocument } from '@/lib/hooks/useDocumentGeneration';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Label } from '@/components/ui/Label';
import { SimpleSelect } from '@/components/ui/SimpleSelect';
import { Button } from '@/components/ui/Button';
import { jurisdictions, businessTypes } from '@/lib/data/document-templates';

interface DocumentCustomizationFormProps {
  template: DocumentTemplate;
  onBack: () => void;
  onSuccess: (documentId: string) => void;
}

export function DocumentCustomizationForm({
  template,
  onBack,
  onSuccess
}: DocumentCustomizationFormProps) {
  const [title, setTitle] = useState(`${template.name} - ${new Date().toLocaleDateString()}`);
  const [jurisdiction, setJurisdiction] = useState('');
  const [businessType, setBusinessType] = useState('');
  const [customizations, setCustomizations] = useState<Record<string, any>>(() => {
    const initial: Record<string, any> = {};
    template.fields.forEach((field: any) => {
      initial[field.name] = field.defaultValue || '';
    });
    return initial;
  });

  const generateDocument = useGenerateDocument();

  const handleFieldChange = (fieldName: string, value: any) => {
    setCustomizations(prev => ({
      ...prev,
      [fieldName]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const document = await generateDocument.mutateAsync({
        templateId: template.id,
        title,
        customizations,
        jurisdiction: jurisdiction || undefined,
        businessType: businessType || undefined
      });

      onSuccess(document.id);
    } catch (error) {
      console.error('Error generating document:', error);
    }
  };

  const renderField = (field: {
    name: string;
    label: string;
    type: string;
    required: boolean;
    placeholder?: string;
    options?: string[];
  }) => {
    const commonProps = {
      id: field.name,
      value: customizations[field.name] || '',
      onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
        handleFieldChange(field.name, e.target.value),
      required: field.required,
      placeholder: field.placeholder
    };

    switch (field.type) {
      case 'textarea':
        return <Textarea {...commonProps} rows={4} />;
      case 'select':
        return (
          <SimpleSelect {...commonProps}>
            <option value="">Select {field.label}</option>
            {field.options?.map((option: string) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </SimpleSelect>
        );
      case 'date':
        return <Input {...commonProps} type="date" />;
      case 'number':
        return <Input {...commonProps} type="number" />;
      default:
        return <Input {...commonProps} type="text" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={onBack}
          className="p-2 rounded-xl backdrop-blur-xl bg-white/10 hover:bg-white/20 border border-white/20 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            Customize Document
          </h2>
          <p className="text-gray-400">{template.name}</p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Document Title */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="backdrop-blur-xl bg-white/10 dark:bg-black/20 border border-white/20 dark:border-white/10 rounded-2xl p-6"
        >
          <Label htmlFor="title">Document Title</Label>
          <Input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            placeholder="Enter document title"
          />
        </motion.div>

        {/* Jurisdiction and Business Type */}
        {(template.jurisdictions.length > 1 || template.businessTypes.length > 1) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="backdrop-blur-xl bg-white/10 dark:bg-black/20 border border-white/20 dark:border-white/10 rounded-2xl p-6"
          >
            <h3 className="text-lg font-semibold mb-4">Document Settings</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {template.jurisdictions.length > 1 && (
                <div>
                  <Label htmlFor="jurisdiction">Jurisdiction</Label>
                  <SimpleSelect
                    id="jurisdiction"
                    value={jurisdiction}
                    onChange={(e) => setJurisdiction(e.target.value)}
                  >
                    <option value="">Select Jurisdiction</option>
                    {jurisdictions
                      .filter(j => template.jurisdictions.includes(j.value) || template.jurisdictions.includes('all'))
                      .map(j => (
                        <option key={j.value} value={j.value}>
                          {j.label}
                        </option>
                      ))}
                  </SimpleSelect>
                </div>
              )}

              {template.businessTypes.length > 1 && (
                <div>
                  <Label htmlFor="businessType">Business Type</Label>
                  <SimpleSelect
                    id="businessType"
                    value={businessType}
                    onChange={(e) => setBusinessType(e.target.value)}
                  >
                    <option value="">Select Business Type</option>
                    {businessTypes
                      .filter(b => template.businessTypes.includes(b.value) || template.businessTypes.includes('all'))
                      .map(b => (
                        <option key={b.value} value={b.value}>
                          {b.label}
                        </option>
                      ))}
                  </SimpleSelect>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* Template Fields */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="backdrop-blur-xl bg-white/10 dark:bg-black/20 border border-white/20 dark:border-white/10 rounded-2xl p-6"
        >
          <h3 className="text-lg font-semibold mb-4">Document Details</h3>
          <div className="space-y-4">
            {template.fields.map((field: any, index: number) => (
              <motion.div
                key={field.name}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + index * 0.05 }}
              >
                <Label htmlFor={field.name}>
                  {field.label}
                  {field.required && <span className="text-red-400 ml-1">*</span>}
                </Label>
                {renderField(field)}
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Submit Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="flex justify-end gap-4"
        >
          <Button
            type="button"
            variant="secondary"
            onClick={onBack}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={generateDocument.isPending}
            className="min-w-[200px]"
          >
            {generateDocument.isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <FileText className="w-4 h-4 mr-2" />
                Generate Document
              </>
            )}
          </Button>
        </motion.div>
      </form>
    </div>
  );
}
