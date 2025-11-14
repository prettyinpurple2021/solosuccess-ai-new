export interface JurisdictionCustomization {
  jurisdiction: string;
  legalRequirements: string[];
  recommendedClauses: string[];
  warnings: string[];
  governingLaw: string;
}

export const jurisdictionCustomizations: Record<string, JurisdictionCustomization> = {
  US: {
    jurisdiction: 'United States',
    legalRequirements: [
      'Include state-specific governing law clause',
      'Consider federal and state employment laws for employment agreements',
      'Include arbitration clauses where applicable',
      'Ensure compliance with state-specific contract requirements'
    ],
    recommendedClauses: [
      'Arbitration and dispute resolution',
      'Severability clause',
      'Force majeure clause',
      'Entire agreement clause'
    ],
    warnings: [
      'Some states have specific requirements for certain contract types',
      'Non-compete clauses may be restricted in certain states',
      'Consider state-specific consumer protection laws'
    ],
    governingLaw: 'the laws of the State of [STATE]'
  },
  UK: {
    jurisdiction: 'United Kingdom',
    legalRequirements: [
      'Comply with UK Contract Law principles',
      'Consider GDPR requirements for data processing',
      'Include jurisdiction clause specifying English courts',
      'Ensure compliance with Consumer Rights Act 2015 where applicable'
    ],
    recommendedClauses: [
      'Jurisdiction and governing law (England and Wales)',
      'Data protection and GDPR compliance',
      'Limitation of liability',
      'Termination rights'
    ],
    warnings: [
      'Brexit may affect cross-border contracts',
      'Consumer contracts have specific protections under UK law',
      'Employment contracts must comply with UK employment law'
    ],
    governingLaw: 'the laws of England and Wales'
  },
  CA: {
    jurisdiction: 'Canada',
    legalRequirements: [
      'Specify provincial or federal jurisdiction',
      'Comply with provincial consumer protection laws',
      'Consider bilingual requirements in Quebec',
      'Include appropriate privacy law compliance (PIPEDA)'
    ],
    recommendedClauses: [
      'Provincial governing law clause',
      'Privacy and data protection (PIPEDA)',
      'Dispute resolution',
      'Language clause (especially for Quebec)'
    ],
    warnings: [
      'Quebec has distinct civil law system',
      'Provincial laws may vary significantly',
      'Consumer protection laws differ by province'
    ],
    governingLaw: 'the laws of the Province of [PROVINCE] and the federal laws of Canada'
  },
  AU: {
    jurisdiction: 'Australia',
    legalRequirements: [
      'Comply with Australian Consumer Law',
      'Include state/territory governing law',
      'Consider Privacy Act 1988 requirements',
      'Ensure compliance with Fair Work Act for employment matters'
    ],
    recommendedClauses: [
      'Australian Consumer Law compliance',
      'Privacy Act compliance',
      'Dispute resolution and mediation',
      'Governing law (state/territory)'
    ],
    warnings: [
      'Unfair contract terms may be void under Australian Consumer Law',
      'Employment contracts must comply with Fair Work Act',
      'State and territory laws may vary'
    ],
    governingLaw: 'the laws of [STATE/TERRITORY], Australia'
  },
  EU: {
    jurisdiction: 'European Union',
    legalRequirements: [
      'Full GDPR compliance for data processing',
      'Comply with EU consumer protection directives',
      'Include appropriate jurisdiction clause',
      'Consider cross-border contract regulations'
    ],
    recommendedClauses: [
      'GDPR compliance and data protection',
      'Consumer rights under EU law',
      'Cross-border dispute resolution',
      'Right of withdrawal (for consumer contracts)'
    ],
    warnings: [
      'GDPR penalties can be severe for non-compliance',
      'Consumer protection laws are strong in EU',
      'Member state laws may add additional requirements',
      'Brexit affects UK-EU contracts'
    ],
    governingLaw: 'the laws of [MEMBER STATE]'
  }
};

export interface BusinessTypeCustomization {
  businessType: string;
  recommendedClauses: string[];
  specificRequirements: string[];
  warnings: string[];
}

export const businessTypeCustomizations: Record<string, BusinessTypeCustomization> = {
  saas: {
    businessType: 'SaaS',
    recommendedClauses: [
      'Service Level Agreement (SLA)',
      'Data security and privacy',
      'Subscription and payment terms',
      'Intellectual property rights',
      'Limitation of liability',
      'Acceptable use policy'
    ],
    specificRequirements: [
      'Define uptime guarantees and service availability',
      'Specify data ownership and portability',
      'Include subscription renewal and cancellation terms',
      'Address software updates and maintenance'
    ],
    warnings: [
      'Ensure GDPR/privacy law compliance for user data',
      'Clearly define service limitations and exclusions',
      'Consider liability caps appropriate for SaaS'
    ]
  },
  ecommerce: {
    businessType: 'E-commerce',
    recommendedClauses: [
      'Return and refund policy',
      'Shipping and delivery terms',
      'Product warranties',
      'Payment processing terms',
      'Consumer protection compliance'
    ],
    specificRequirements: [
      'Comply with consumer protection laws',
      'Include clear pricing and payment terms',
      'Define shipping responsibilities and timelines',
      'Specify return and refund procedures'
    ],
    warnings: [
      'Consumer protection laws vary by jurisdiction',
      'Distance selling regulations may apply',
      'Payment card industry (PCI) compliance required'
    ]
  },
  service: {
    businessType: 'Service Business',
    recommendedClauses: [
      'Scope of services',
      'Payment terms and schedule',
      'Deliverables and timelines',
      'Change order procedures',
      'Professional liability'
    ],
    specificRequirements: [
      'Clearly define service deliverables',
      'Specify payment milestones',
      'Include change management process',
      'Define acceptance criteria'
    ],
    warnings: [
      'Consider professional indemnity insurance',
      'Clearly scope services to avoid scope creep',
      'Include termination provisions'
    ]
  },
  consulting: {
    businessType: 'Consulting',
    recommendedClauses: [
      'Scope of consulting services',
      'Confidentiality and NDA',
      'Intellectual property ownership',
      'Professional liability',
      'Non-compete and non-solicitation'
    ],
    specificRequirements: [
      'Define consulting deliverables and reports',
      'Specify confidentiality obligations',
      'Clarify IP ownership of work product',
      'Include professional standards compliance'
    ],
    warnings: [
      'Non-compete clauses may be restricted in some jurisdictions',
      'Professional liability insurance recommended',
      'Clearly define independent contractor relationship'
    ]
  },
  agency: {
    businessType: 'Agency',
    recommendedClauses: [
      'Scope of agency services',
      'Client approval processes',
      'Intellectual property rights',
      'Revisions and change requests',
      'Portfolio and case study rights'
    ],
    specificRequirements: [
      'Define creative deliverables',
      'Specify revision limits',
      'Clarify IP transfer upon payment',
      'Include client approval workflows'
    ],
    warnings: [
      'Clearly define IP ownership and usage rights',
      'Include kill fee provisions',
      'Specify portfolio usage rights'
    ]
  }
};

export function getJurisdictionCustomization(jurisdiction: string): JurisdictionCustomization | null {
  return jurisdictionCustomizations[jurisdiction] || null;
}

export function getBusinessTypeCustomization(businessType: string): BusinessTypeCustomization | null {
  return businessTypeCustomizations[businessType] || null;
}

export function getCustomizationWarnings(
  jurisdiction?: string,
  businessType?: string
): string[] {
  const warnings: string[] = [];

  if (jurisdiction) {
    const jurisdictionCustom = getJurisdictionCustomization(jurisdiction);
    if (jurisdictionCustom) {
      warnings.push(...jurisdictionCustom.warnings);
    }
  }

  if (businessType) {
    const businessCustom = getBusinessTypeCustomization(businessType);
    if (businessCustom) {
      warnings.push(...businessCustom.warnings);
    }
  }

  return warnings;
}

export function getRecommendedClauses(
  jurisdiction?: string,
  businessType?: string
): string[] {
  const clauses: string[] = [];

  if (jurisdiction) {
    const jurisdictionCustom = getJurisdictionCustomization(jurisdiction);
    if (jurisdictionCustom) {
      clauses.push(...jurisdictionCustom.recommendedClauses);
    }
  }

  if (businessType) {
    const businessCustom = getBusinessTypeCustomization(businessType);
    if (businessCustom) {
      clauses.push(...businessCustom.recommendedClauses);
    }
  }

  // Remove duplicates
  return Array.from(new Set(clauses));
}
