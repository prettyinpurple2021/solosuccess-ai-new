export interface AssessmentQuestion {
  id: string;
  category: string;
  question: string;
  options: {
    value: string;
    label: string;
    biasIndicator?: string;
  }[];
  biasType: string[];
}

export const SHADOW_SELF_QUESTIONS: AssessmentQuestion[] = [
  // Confirmation Bias
  {
    id: 'q1',
    category: 'Information Processing',
    question: 'When researching a new business opportunity, how do you typically approach information gathering?',
    options: [
      { value: 'seek_confirming', label: 'I focus on finding evidence that supports my initial idea', biasIndicator: 'confirmation_bias' },
      { value: 'balanced', label: 'I actively seek both supporting and contradicting evidence' },
      { value: 'devil_advocate', label: 'I primarily look for reasons why it might fail' },
      { value: 'quick_decision', label: 'I trust my gut and make quick decisions', biasIndicator: 'overconfidence' }
    ],
    biasType: ['confirmation_bias', 'overconfidence']
  },
  
  // Sunk Cost Fallacy
  {
    id: 'q2',
    category: 'Decision Making',
    question: 'You\'ve invested 6 months and $10,000 into a project that\'s not showing results. What do you do?',
    options: [
      { value: 'continue', label: 'Continue because I\'ve already invested so much', biasIndicator: 'sunk_cost_fallacy' },
      { value: 'evaluate', label: 'Objectively evaluate if future investment makes sense' },
      { value: 'pivot', label: 'Immediately pivot to something new' },
      { value: 'double_down', label: 'Invest more to make it work', biasIndicator: 'sunk_cost_fallacy' }
    ],
    biasType: ['sunk_cost_fallacy', 'loss_aversion']
  },
  
  // Optimism Bias
  {
    id: 'q3',
    category: 'Planning',
    question: 'When estimating how long a project will take, you typically:',
    options: [
      { value: 'optimistic', label: 'Estimate the best-case scenario', biasIndicator: 'optimism_bias' },
      { value: 'realistic', label: 'Use historical data and add buffer time' },
      { value: 'pessimistic', label: 'Assume everything will take longer than expected' },
      { value: 'no_planning', label: 'Don\'t plan much, just start working', biasIndicator: 'planning_fallacy' }
    ],
    biasType: ['optimism_bias', 'planning_fallacy']
  },
  
  // Availability Heuristic
  {
    id: 'q4',
    category: 'Risk Assessment',
    question: 'How do you assess risks in your business?',
    options: [
      { value: 'recent_events', label: 'Based on recent news or events I\'ve heard about', biasIndicator: 'availability_heuristic' },
      { value: 'data_driven', label: 'Using statistical data and probability analysis' },
      { value: 'personal_experience', label: 'Based on my personal experiences', biasIndicator: 'availability_heuristic' },
      { value: 'ignore_risks', label: 'I don\'t worry much about risks', biasIndicator: 'optimism_bias' }
    ],
    biasType: ['availability_heuristic', 'optimism_bias']
  },
  
  // Anchoring Bias
  {
    id: 'q5',
    category: 'Pricing & Valuation',
    question: 'When pricing your product or service, what influences you most?',
    options: [
      { value: 'first_number', label: 'The first price point I researched or heard', biasIndicator: 'anchoring_bias' },
      { value: 'value_based', label: 'The value it provides to customers' },
      { value: 'competitor_match', label: 'What competitors charge', biasIndicator: 'anchoring_bias' },
      { value: 'cost_plus', label: 'My costs plus desired margin' }
    ],
    biasType: ['anchoring_bias']
  },
  
  // Dunning-Kruger Effect
  {
    id: 'q6',
    category: 'Self-Assessment',
    question: 'When entering a new area of business you\'re unfamiliar with:',
    options: [
      { value: 'confident', label: 'I feel confident I can figure it out quickly', biasIndicator: 'dunning_kruger' },
      { value: 'seek_expertise', label: 'I seek expert advice and education first' },
      { value: 'overestimate', label: 'I believe my general business skills transfer directly', biasIndicator: 'dunning_kruger' },
      { value: 'cautious', label: 'I\'m very cautious and aware of what I don\'t know' }
    ],
    biasType: ['dunning_kruger', 'overconfidence']
  },
  
  // Loss Aversion
  {
    id: 'q7',
    category: 'Risk Taking',
    question: 'You have a choice: guaranteed $5,000 profit or 50% chance of $12,000 profit. You choose:',
    options: [
      { value: 'guaranteed', label: 'The guaranteed $5,000', biasIndicator: 'loss_aversion' },
      { value: 'calculated', label: 'The $12,000 chance after calculating expected value' },
      { value: 'always_safe', label: 'Always take the safe option', biasIndicator: 'loss_aversion' },
      { value: 'always_risk', label: 'Always take the risky option', biasIndicator: 'risk_seeking' }
    ],
    biasType: ['loss_aversion', 'risk_seeking']
  },
  
  // Recency Bias
  {
    id: 'q8',
    category: 'Strategy',
    question: 'When making strategic decisions, you give most weight to:',
    options: [
      { value: 'recent_results', label: 'Recent performance and results', biasIndicator: 'recency_bias' },
      { value: 'long_term_trends', label: 'Long-term trends and patterns' },
      { value: 'latest_advice', label: 'The latest advice or strategy you learned', biasIndicator: 'recency_bias' },
      { value: 'proven_methods', label: 'Proven methods regardless of timing' }
    ],
    biasType: ['recency_bias']
  },
  
  // Status Quo Bias
  {
    id: 'q9',
    category: 'Change Management',
    question: 'When considering a major change to your business model:',
    options: [
      { value: 'resist_change', label: 'I prefer to stick with what\'s working', biasIndicator: 'status_quo_bias' },
      { value: 'evaluate_objectively', label: 'I objectively evaluate if change is needed' },
      { value: 'fear_unknown', label: 'I worry about the unknown consequences', biasIndicator: 'status_quo_bias' },
      { value: 'embrace_change', label: 'I actively seek opportunities to innovate' }
    ],
    biasType: ['status_quo_bias', 'loss_aversion']
  },
  
  // Bandwagon Effect
  {
    id: 'q10',
    category: 'Trend Following',
    question: 'When you see a business trend gaining popularity:',
    options: [
      { value: 'jump_on', label: 'I want to jump on it before it\'s too late', biasIndicator: 'bandwagon_effect' },
      { value: 'research_first', label: 'I research if it fits my business strategy' },
      { value: 'follow_crowd', label: 'If everyone\'s doing it, it must be good', biasIndicator: 'bandwagon_effect' },
      { value: 'contrarian', label: 'I tend to go against popular trends' }
    ],
    biasType: ['bandwagon_effect', 'herd_mentality']
  },
  
  // Hindsight Bias
  {
    id: 'q11',
    category: 'Learning from Mistakes',
    question: 'When looking back at a failed decision:',
    options: [
      { value: 'knew_it', label: 'I often think "I knew that would happen"', biasIndicator: 'hindsight_bias' },
      { value: 'honest_reflection', label: 'I honestly assess what I knew at the time' },
      { value: 'obvious_now', label: 'It seems obvious now what I should have done', biasIndicator: 'hindsight_bias' },
      { value: 'learn_patterns', label: 'I focus on identifying patterns for future decisions' }
    ],
    biasType: ['hindsight_bias']
  },
  
  // Overconfidence Bias
  {
    id: 'q12',
    category: 'Forecasting',
    question: 'When predicting your business outcomes:',
    options: [
      { value: 'very_confident', label: 'I\'m usually very confident in my predictions', biasIndicator: 'overconfidence' },
      { value: 'range_estimates', label: 'I provide range estimates with confidence levels' },
      { value: 'rarely_wrong', label: 'I believe I\'m rarely wrong about my business', biasIndicator: 'overconfidence' },
      { value: 'humble_uncertain', label: 'I acknowledge high uncertainty in predictions' }
    ],
    biasType: ['overconfidence', 'illusion_of_control']
  },
  
  // Fundamental Attribution Error
  {
    id: 'q13',
    category: 'Success & Failure',
    question: 'When your business succeeds, you attribute it to:',
    options: [
      { value: 'my_skills', label: 'My skills and hard work', biasIndicator: 'self_serving_bias' },
      { value: 'balanced_view', label: 'A combination of my efforts and favorable circumstances' },
      { value: 'all_me', label: 'My superior decision-making', biasIndicator: 'self_serving_bias' },
      { value: 'luck_timing', label: 'Mostly luck and good timing' }
    ],
    biasType: ['self_serving_bias', 'fundamental_attribution_error']
  },
  
  // Illusion of Control
  {
    id: 'q14',
    category: 'Control & Influence',
    question: 'Regarding factors outside your control (economy, market trends):',
    options: [
      { value: 'can_overcome', label: 'I believe I can overcome any external factor', biasIndicator: 'illusion_of_control' },
      { value: 'adapt_plan', label: 'I plan for multiple scenarios and adapt' },
      { value: 'control_everything', label: 'I focus on controlling as much as possible', biasIndicator: 'illusion_of_control' },
      { value: 'accept_limits', label: 'I accept what I cannot control and focus on what I can' }
    ],
    biasType: ['illusion_of_control']
  },
  
  // Groupthink
  {
    id: 'q15',
    category: 'Advice & Feedback',
    question: 'When seeking advice from your network:',
    options: [
      { value: 'similar_thinkers', label: 'I prefer people who think like me', biasIndicator: 'confirmation_bias' },
      { value: 'diverse_views', label: 'I actively seek diverse perspectives' },
      { value: 'echo_chamber', label: 'I mostly talk to people in my industry', biasIndicator: 'groupthink' },
      { value: 'challenge_me', label: 'I want people who will challenge my assumptions' }
    ],
    biasType: ['groupthink', 'confirmation_bias']
  }
];

export const BIAS_DESCRIPTIONS: Record<string, { name: string; description: string; impact: string }> = {
  confirmation_bias: {
    name: 'Confirmation Bias',
    description: 'The tendency to search for, interpret, and recall information that confirms your pre-existing beliefs.',
    impact: 'You may miss critical warning signs or alternative opportunities because you\'re only seeing what you want to see.'
  },
  sunk_cost_fallacy: {
    name: 'Sunk Cost Fallacy',
    description: 'Continuing an endeavor because of previously invested resources, even when it\'s no longer rational.',
    impact: 'You may waste additional time and money on failing projects instead of cutting losses and pivoting.'
  },
  optimism_bias: {
    name: 'Optimism Bias',
    description: 'The tendency to overestimate the likelihood of positive outcomes and underestimate risks.',
    impact: 'You may be unprepared for challenges, underestimate competition, and make overly aggressive commitments.'
  },
  availability_heuristic: {
    name: 'Availability Heuristic',
    description: 'Overestimating the importance of information that\'s readily available or recent.',
    impact: 'You may make decisions based on vivid recent events rather than statistical reality, leading to poor risk assessment.'
  },
  anchoring_bias: {
    name: 'Anchoring Bias',
    description: 'Relying too heavily on the first piece of information encountered when making decisions.',
    impact: 'Your pricing, valuations, and negotiations may be skewed by arbitrary initial numbers rather than true value.'
  },
  dunning_kruger: {
    name: 'Dunning-Kruger Effect',
    description: 'Overestimating your competence in areas where you have limited knowledge.',
    impact: 'You may take on challenges you\'re not prepared for or fail to seek necessary expertise, leading to costly mistakes.'
  },
  loss_aversion: {
    name: 'Loss Aversion',
    description: 'The tendency to prefer avoiding losses over acquiring equivalent gains.',
    impact: 'You may miss growth opportunities by playing it too safe or hold onto losing investments too long.'
  },
  recency_bias: {
    name: 'Recency Bias',
    description: 'Giving more weight to recent events than historical data.',
    impact: 'You may overreact to short-term fluctuations and make strategic errors based on temporary conditions.'
  },
  status_quo_bias: {
    name: 'Status Quo Bias',
    description: 'Preferring things to stay the same and resisting change.',
    impact: 'You may miss innovation opportunities and fail to adapt to market changes, letting competitors pass you by.'
  },
  bandwagon_effect: {
    name: 'Bandwagon Effect',
    description: 'Adopting beliefs or behaviors because many others are doing so.',
    impact: 'You may chase trends that don\'t fit your business or enter oversaturated markets at the wrong time.'
  },
  hindsight_bias: {
    name: 'Hindsight Bias',
    description: 'Believing past events were more predictable than they actually were.',
    impact: 'You may fail to learn from mistakes because you convince yourself you "knew it all along," preventing real growth.'
  },
  overconfidence: {
    name: 'Overconfidence Bias',
    description: 'Excessive confidence in your own abilities, knowledge, or predictions.',
    impact: 'You may take excessive risks, ignore expert advice, and be blindsided by outcomes you didn\'t anticipate.'
  },
  self_serving_bias: {
    name: 'Self-Serving Bias',
    description: 'Attributing successes to your abilities and failures to external factors.',
    impact: 'You may fail to learn from mistakes and develop an unrealistic view of your capabilities.'
  },
  illusion_of_control: {
    name: 'Illusion of Control',
    description: 'Overestimating your ability to control or influence outcomes.',
    impact: 'You may fail to prepare for uncontrollable events and blame yourself for things beyond your control.'
  },
  groupthink: {
    name: 'Groupthink',
    description: 'Conforming to group consensus without critical evaluation.',
    impact: 'You may miss important dissenting views and make poor decisions due to echo chamber effects.'
  },
  planning_fallacy: {
    name: 'Planning Fallacy',
    description: 'Underestimating the time, costs, and risks of future actions.',
    impact: 'You may consistently miss deadlines, exceed budgets, and disappoint stakeholders.'
  },
  herd_mentality: {
    name: 'Herd Mentality',
    description: 'Following the crowd without independent analysis.',
    impact: 'You may make decisions based on what others are doing rather than what\'s right for your business.'
  },
  risk_seeking: {
    name: 'Excessive Risk-Seeking',
    description: 'Taking unnecessary risks without proper evaluation.',
    impact: 'You may gamble with your business by taking on excessive risk without adequate preparation or resources.'
  }
};
