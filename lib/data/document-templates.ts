export interface DocumentTemplateData {
  name: string;
  description: string;
  category: string;
  documentType: string;
  content: string;
  fields: {
    name: string;
    label: string;
    type: 'text' | 'textarea' | 'date' | 'select' | 'number';
    required: boolean;
    placeholder?: string;
    options?: string[];
    defaultValue?: string;
  }[];
  jurisdictions: string[];
  businessTypes: string[];
}

export const documentTemplates: DocumentTemplateData[] = [
  {
    name: 'Non-Disclosure Agreement (NDA)',
    description: 'Protect confidential information shared with partners, contractors, or employees',
    category: 'Legal',
    documentType: 'nda',
    content: `NON-DISCLOSURE AGREEMENT

This Non-Disclosure Agreement ("Agreement") is entered into as of {{effective_date}} by and between:

{{party_name}} ("Disclosing Party")
Address: {{party_address}}

AND

{{recipient_name}} ("Receiving Party")
Address: {{recipient_address}}

1. CONFIDENTIAL INFORMATION
The Disclosing Party agrees to disclose, and the Receiving Party agrees to receive, certain confidential and proprietary information ("Confidential Information") for the purpose of {{purpose}}.

2. OBLIGATIONS
The Receiving Party agrees to:
a) Hold the Confidential Information in strict confidence
b) Not disclose the Confidential Information to any third parties
c) Use the Confidential Information solely for the purpose stated above
d) Protect the Confidential Information with the same degree of care used to protect its own confidential information

3. TERM
This Agreement shall remain in effect for a period of {{term_years}} years from the Effective Date.

4. RETURN OF MATERIALS
Upon request or termination of this Agreement, the Receiving Party shall return or destroy all Confidential Information.

5. GOVERNING LAW
This Agreement shall be governed by the laws of {{jurisdiction}}.

IN WITNESS WHEREOF, the parties have executed this Agreement as of the date first written above.

{{party_name}}                    {{recipient_name}}
_____________________            _____________________
Signature                        Signature

Date: _______________            Date: _______________`,
    fields: [
      { name: 'effective_date', label: 'Effective Date', type: 'date', required: true },
      { name: 'party_name', label: 'Your Company Name', type: 'text', required: true },
      { name: 'party_address', label: 'Your Company Address', type: 'textarea', required: true },
      { name: 'recipient_name', label: 'Recipient Name', type: 'text', required: true },
      { name: 'recipient_address', label: 'Recipient Address', type: 'textarea', required: true },
      { name: 'purpose', label: 'Purpose of Disclosure', type: 'textarea', required: true },
      { name: 'term_years', label: 'Term (Years)', type: 'number', required: true, defaultValue: '2' },
      { name: 'jurisdiction', label: 'Governing Jurisdiction', type: 'text', required: true }
    ],
    jurisdictions: ['US', 'UK', 'CA', 'AU'],
    businessTypes: ['all']
  },
  {
    name: 'Service Agreement',
    description: 'Define terms for services provided to clients',
    category: 'Legal',
    documentType: 'service_agreement',
    content: `SERVICE AGREEMENT

This Service Agreement ("Agreement") is entered into as of {{effective_date}} by and between:

SERVICE PROVIDER:
{{provider_name}}
{{provider_address}}

CLIENT:
{{client_name}}
{{client_address}}

1. SERVICES
The Service Provider agrees to provide the following services ("Services"):
{{services_description}}

2. COMPENSATION
The Client agrees to pay the Service Provider:
- Rate: {{payment_rate}}
- Payment Terms: {{payment_terms}}
- Total Project Value: {{total_value}}

3. TERM AND TERMINATION
This Agreement shall commence on {{start_date}} and continue until {{end_date}}, unless terminated earlier by either party with {{notice_period}} days written notice.

4. DELIVERABLES
The Service Provider shall deliver:
{{deliverables}}

5. INTELLECTUAL PROPERTY
{{ip_clause}}

6. CONFIDENTIALITY
Both parties agree to maintain the confidentiality of any proprietary information shared during the course of this Agreement.

7. LIABILITY
{{liability_clause}}

8. GOVERNING LAW
This Agreement shall be governed by the laws of {{jurisdiction}}.

IN WITNESS WHEREOF, the parties have executed this Agreement as of the date first written above.

{{provider_name}}                {{client_name}}
_____________________            _____________________
Service Provider                 Client

Date: _______________            Date: _______________`,
    fields: [
      { name: 'effective_date', label: 'Effective Date', type: 'date', required: true },
      { name: 'provider_name', label: 'Service Provider Name', type: 'text', required: true },
      { name: 'provider_address', label: 'Provider Address', type: 'textarea', required: true },
      { name: 'client_name', label: 'Client Name', type: 'text', required: true },
      { name: 'client_address', label: 'Client Address', type: 'textarea', required: true },
      { name: 'services_description', label: 'Services Description', type: 'textarea', required: true },
      { name: 'payment_rate', label: 'Payment Rate', type: 'text', required: true, placeholder: 'e.g., $100/hour' },
      { name: 'payment_terms', label: 'Payment Terms', type: 'text', required: true, placeholder: 'e.g., Net 30' },
      { name: 'total_value', label: 'Total Project Value', type: 'text', required: false },
      { name: 'start_date', label: 'Start Date', type: 'date', required: true },
      { name: 'end_date', label: 'End Date', type: 'date', required: false },
      { name: 'notice_period', label: 'Notice Period (Days)', type: 'number', required: true, defaultValue: '30' },
      { name: 'deliverables', label: 'Deliverables', type: 'textarea', required: true },
      { name: 'ip_clause', label: 'Intellectual Property Terms', type: 'textarea', required: true },
      { name: 'liability_clause', label: 'Liability Terms', type: 'textarea', required: true },
      { name: 'jurisdiction', label: 'Governing Jurisdiction', type: 'text', required: true }
    ],
    jurisdictions: ['US', 'UK', 'CA', 'AU'],
    businessTypes: ['all']
  },
  {
    name: 'Business Proposal',
    description: 'Professional proposal template for pitching services or projects',
    category: 'Business',
    documentType: 'proposal',
    content: `BUSINESS PROPOSAL

Prepared for: {{client_name}}
Prepared by: {{company_name}}
Date: {{proposal_date}}

EXECUTIVE SUMMARY
{{executive_summary}}

PROBLEM STATEMENT
{{problem_statement}}

PROPOSED SOLUTION
{{proposed_solution}}

SCOPE OF WORK
{{scope_of_work}}

TIMELINE
Project Duration: {{project_duration}}
Key Milestones:
{{milestones}}

INVESTMENT
{{pricing_details}}

Total Investment: {{total_investment}}

ABOUT US
{{company_background}}

NEXT STEPS
{{next_steps}}

We look forward to the opportunity to work with you.

Sincerely,

{{contact_name}}
{{contact_title}}
{{company_name}}
{{contact_email}}
{{contact_phone}}`,
    fields: [
      { name: 'client_name', label: 'Client Name', type: 'text', required: true },
      { name: 'company_name', label: 'Your Company Name', type: 'text', required: true },
      { name: 'proposal_date', label: 'Proposal Date', type: 'date', required: true },
      { name: 'executive_summary', label: 'Executive Summary', type: 'textarea', required: true },
      { name: 'problem_statement', label: 'Problem Statement', type: 'textarea', required: true },
      { name: 'proposed_solution', label: 'Proposed Solution', type: 'textarea', required: true },
      { name: 'scope_of_work', label: 'Scope of Work', type: 'textarea', required: true },
      { name: 'project_duration', label: 'Project Duration', type: 'text', required: true },
      { name: 'milestones', label: 'Key Milestones', type: 'textarea', required: true },
      { name: 'pricing_details', label: 'Pricing Details', type: 'textarea', required: true },
      { name: 'total_investment', label: 'Total Investment', type: 'text', required: true },
      { name: 'company_background', label: 'Company Background', type: 'textarea', required: true },
      { name: 'next_steps', label: 'Next Steps', type: 'textarea', required: true },
      { name: 'contact_name', label: 'Contact Name', type: 'text', required: true },
      { name: 'contact_title', label: 'Contact Title', type: 'text', required: true },
      { name: 'contact_email', label: 'Contact Email', type: 'text', required: true },
      { name: 'contact_phone', label: 'Contact Phone', type: 'text', required: true }
    ],
    jurisdictions: ['all'],
    businessTypes: ['all']
  },
  {
    name: 'Terms of Service',
    description: 'Standard terms of service for your website or application',
    category: 'Legal',
    documentType: 'terms_of_service',
    content: `TERMS OF SERVICE

Last Updated: {{last_updated}}

1. ACCEPTANCE OF TERMS
By accessing or using {{service_name}} ("Service"), you agree to be bound by these Terms of Service.

2. DESCRIPTION OF SERVICE
{{service_description}}

3. USER ACCOUNTS
{{account_terms}}

4. USER CONDUCT
Users agree not to:
- Violate any applicable laws or regulations
- Infringe on intellectual property rights
- Transmit harmful or malicious code
- Engage in unauthorized access or use

5. INTELLECTUAL PROPERTY
{{ip_terms}}

6. PAYMENT TERMS
{{payment_terms}}

7. PRIVACY
Your use of the Service is also governed by our Privacy Policy.

8. DISCLAIMERS
THE SERVICE IS PROVIDED "AS IS" WITHOUT WARRANTIES OF ANY KIND.

9. LIMITATION OF LIABILITY
{{liability_terms}}

10. TERMINATION
We reserve the right to terminate or suspend access to the Service at our discretion.

11. GOVERNING LAW
These Terms shall be governed by the laws of {{jurisdiction}}.

12. CONTACT
For questions about these Terms, contact us at:
{{contact_email}}

{{company_name}}
{{company_address}}`,
    fields: [
      { name: 'last_updated', label: 'Last Updated Date', type: 'date', required: true },
      { name: 'service_name', label: 'Service/Product Name', type: 'text', required: true },
      { name: 'service_description', label: 'Service Description', type: 'textarea', required: true },
      { name: 'account_terms', label: 'Account Terms', type: 'textarea', required: true },
      { name: 'ip_terms', label: 'Intellectual Property Terms', type: 'textarea', required: true },
      { name: 'payment_terms', label: 'Payment Terms', type: 'textarea', required: true },
      { name: 'liability_terms', label: 'Liability Terms', type: 'textarea', required: true },
      { name: 'jurisdiction', label: 'Governing Jurisdiction', type: 'text', required: true },
      { name: 'contact_email', label: 'Contact Email', type: 'text', required: true },
      { name: 'company_name', label: 'Company Name', type: 'text', required: true },
      { name: 'company_address', label: 'Company Address', type: 'textarea', required: true }
    ],
    jurisdictions: ['US', 'UK', 'CA', 'AU'],
    businessTypes: ['saas', 'ecommerce', 'service']
  },
  {
    name: 'Privacy Policy',
    description: 'Privacy policy template for data collection and usage',
    category: 'Legal',
    documentType: 'privacy_policy',
    content: `PRIVACY POLICY

Last Updated: {{last_updated}}

{{company_name}} ("we," "us," or "our") operates {{service_name}} (the "Service").

1. INFORMATION WE COLLECT
We collect the following types of information:
{{information_collected}}

2. HOW WE USE YOUR INFORMATION
We use your information to:
{{information_usage}}

3. INFORMATION SHARING
{{sharing_policy}}

4. DATA SECURITY
{{security_measures}}

5. YOUR RIGHTS
You have the right to:
- Access your personal data
- Correct inaccurate data
- Request deletion of your data
- Object to data processing
- Data portability

6. COOKIES
{{cookie_policy}}

7. THIRD-PARTY SERVICES
{{third_party_services}}

8. CHILDREN'S PRIVACY
Our Service is not intended for children under {{minimum_age}} years of age.

9. CHANGES TO THIS POLICY
We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page.

10. CONTACT US
If you have questions about this Privacy Policy, contact us at:
{{contact_email}}

{{company_name}}
{{company_address}}`,
    fields: [
      { name: 'last_updated', label: 'Last Updated Date', type: 'date', required: true },
      { name: 'company_name', label: 'Company Name', type: 'text', required: true },
      { name: 'service_name', label: 'Service/Product Name', type: 'text', required: true },
      { name: 'information_collected', label: 'Information Collected', type: 'textarea', required: true },
      { name: 'information_usage', label: 'How Information is Used', type: 'textarea', required: true },
      { name: 'sharing_policy', label: 'Information Sharing Policy', type: 'textarea', required: true },
      { name: 'security_measures', label: 'Security Measures', type: 'textarea', required: true },
      { name: 'cookie_policy', label: 'Cookie Policy', type: 'textarea', required: true },
      { name: 'third_party_services', label: 'Third-Party Services', type: 'textarea', required: true },
      { name: 'minimum_age', label: 'Minimum Age', type: 'number', required: true, defaultValue: '13' },
      { name: 'contact_email', label: 'Contact Email', type: 'text', required: true },
      { name: 'company_address', label: 'Company Address', type: 'textarea', required: true }
    ],
    jurisdictions: ['US', 'UK', 'CA', 'AU', 'EU'],
    businessTypes: ['all']
  }
];

export const documentCategories = [
  { value: 'Legal', label: 'Legal Documents' },
  { value: 'Business', label: 'Business Documents' },
  { value: 'HR', label: 'Human Resources' },
  { value: 'Financial', label: 'Financial Documents' }
];

export const jurisdictions = [
  { value: 'US', label: 'United States' },
  { value: 'UK', label: 'United Kingdom' },
  { value: 'CA', label: 'Canada' },
  { value: 'AU', label: 'Australia' },
  { value: 'EU', label: 'European Union' }
];

export const businessTypes = [
  { value: 'all', label: 'All Business Types' },
  { value: 'saas', label: 'SaaS' },
  { value: 'ecommerce', label: 'E-commerce' },
  { value: 'service', label: 'Service Business' },
  { value: 'consulting', label: 'Consulting' },
  { value: 'agency', label: 'Agency' }
];
