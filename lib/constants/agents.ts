/**
 * AI Agent Definitions
 * 
 * Defines the seven core AI agents available in SoloSuccess AI
 */

export interface Agent {
  id: string;
  name: string;
  role: string;
  personality: string;
  description: string;
  avatar: string;
  color: string;
  gradient: string;
  expertise: string[];
  icon: string;
}

export const AGENTS: Agent[] = [
  {
    id: 'roxy',
    name: 'Roxy',
    role: 'Strategic Operator',
    personality: 'Professional, organized, and strategic',
    description: 'Your executive assistant focused on schedule management, workflow optimization, and strategic planning.',
    avatar: '👔',
    color: 'blue',
    gradient: 'from-blue-500 to-cyan-500',
    expertise: ['Schedule Management', 'Workflow Optimization', 'Strategic Planning', 'Priority Assessment'],
    icon: '📊'
  },
  {
    id: 'echo',
    name: 'Echo',
    role: 'Growth Catalyst',
    personality: 'Energetic, insightful, and market-savvy',
    description: 'Market intelligence expert who identifies growth opportunities and analyzes market trends.',
    avatar: '🚀',
    color: 'purple',
    gradient: 'from-purple-500 to-pink-500',
    expertise: ['Market Intelligence', 'Growth Strategy', 'Opportunity Identification', 'Trend Analysis'],
    icon: '📈'
  },
  {
    id: 'blaze',
    name: 'Blaze',
    role: 'Growth & Sales Strategist',
    personality: 'Bold, persuasive, and results-driven',
    description: 'Sales strategy expert who creates funnel blueprints and pitch decks to drive revenue growth.',
    avatar: '🔥',
    color: 'orange',
    gradient: 'from-orange-500 to-red-500',
    expertise: ['Sales Strategy', 'Funnel Design', 'Pitch Development', 'Revenue Growth'],
    icon: '💰'
  },
  {
    id: 'lumi',
    name: 'Lumi',
    role: 'Legal & Docs Agent',
    personality: 'Precise, thorough, and protective',
    description: 'Legal document specialist who generates contracts, NDAs, and ensures compliance.',
    avatar: '⚖️',
    color: 'teal',
    gradient: 'from-teal-500 to-emerald-500',
    expertise: ['Legal Documents', 'Contract Generation', 'Compliance', 'Risk Management'],
    icon: '📜'
  },
  {
    id: 'vex',
    name: 'Vex',
    role: 'Technical Architect',
    personality: 'Analytical, innovative, and detail-oriented',
    description: 'Technical expert who provides architecture guidance and technology recommendations.',
    avatar: '⚙️',
    color: 'indigo',
    gradient: 'from-indigo-500 to-blue-500',
    expertise: ['Technical Architecture', 'Technology Stack', 'System Design', 'Development Planning'],
    icon: '💻'
  },
  {
    id: 'lexi',
    name: 'Lexi',
    role: 'Insight Engine',
    personality: 'Analytical, curious, and data-driven',
    description: 'Data analysis expert who generates insights from metrics and identifies trends.',
    avatar: '🔍',
    color: 'violet',
    gradient: 'from-violet-500 to-purple-500',
    expertise: ['Data Analysis', 'Insight Generation', 'Trend Identification', 'Metrics Interpretation'],
    icon: '📊'
  },
  {
    id: 'nova',
    name: 'Nova',
    role: 'Product Designer',
    personality: 'Creative, user-focused, and innovative',
    description: 'Design expert who provides UI/UX guidance and creates wireframe suggestions.',
    avatar: '✨',
    color: 'pink',
    gradient: 'from-pink-500 to-rose-500',
    expertise: ['UI/UX Design', 'Wireframing', 'Design Systems', 'User Experience'],
    icon: '🎨'
  }
];

export const getAgentById = (id: string): Agent | undefined => {
  return AGENTS.find(agent => agent.id === id);
};

export const getAgentsByExpertise = (expertise: string): Agent[] => {
  return AGENTS.filter(agent => 
    agent.expertise.some(exp => 
      exp.toLowerCase().includes(expertise.toLowerCase())
    )
  );
};
