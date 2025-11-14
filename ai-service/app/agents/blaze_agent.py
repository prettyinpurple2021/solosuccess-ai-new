"""Blaze - Growth & Sales Strategist Agent"""

from typing import Dict, Any
from app.agents.base_agent import BaseAgent, AgentRole, LLMProvider, ResponseFormatter


class BlazeAgent(BaseAgent):
    """
    Blaze - Growth & Sales Strategist Agent
    
    Personality: Sales expert with strategic sales methodology expertise
    Focus: Sales strategy, funnel optimization, pitch development, conversion tactics
    
    Blaze helps solo founders develop effective sales strategies, optimize their
    sales funnels, and create compelling pitches that convert prospects into customers.
    """
    
    def __init__(self):
        super().__init__(
            agent_id="blaze",
            name="Blaze",
            role=AgentRole.SALES,
            personality="Energetic, results-driven, and persuasive. Acts as a sales strategist who understands psychology, conversion optimization, and deal closing.",
            system_prompt=(
                "You are Blaze, a Growth & Sales Strategist for solo founders. "
                "Your expertise lies in sales strategy, funnel optimization, pitch development, "
                "and conversion tactics. You help founders build effective sales processes, "
                "create compelling pitches, and optimize every stage of the customer journey. "
                "You are energetic, results-focused, and understand the psychology of selling. "
                "Provide actionable sales advice with specific tactics, scripts, and frameworks. "
                "Focus on conversion optimization, objection handling, and closing techniques."
            ),
            llm_provider=LLMProvider.OPENAI
        )
    
    def _initialize_templates(self):
        """Initialize Blaze's prompt templates"""
        
        # Sales strategy template
        self.add_prompt_template(
            "sales_strategy",
            "Develop a sales strategy for this business:\n\n"
            "Product/Service: {product}\n"
            "Target Customer: {target_customer}\n"
            "Price Point: {price_point}\n"
            "Sales Cycle: {sales_cycle}\n\n"
            "Create a comprehensive sales strategy including:\n"
            "- Sales process and methodology\n"
            "- Lead generation tactics\n"
            "- Qualification criteria\n"
            "- Closing techniques\n"
            "- Follow-up sequences",
            variables=["product", "target_customer", "price_point", "sales_cycle"]
        )
        
        # Funnel blueprint template
        self.add_prompt_template(
            "funnel_blueprint",
            "Design a sales funnel for this offering:\n\n"
            "Offering: {offering}\n"
            "Target Audience: {audience}\n"
            "Current Conversion Rates: {conversion_rates}\n"
            "Goals: {goals}\n\n"
            "Create a detailed funnel blueprint with:\n"
            "- Each funnel stage and objective\n"
            "- Content and messaging per stage\n"
            "- Conversion optimization tactics\n"
            "- Metrics to track\n"
            "- A/B testing recommendations",
            variables=["offering", "audience", "conversion_rates", "goals"]
        )
        
        # Pitch deck assistance template
        self.add_prompt_template(
            "pitch_deck",
            "Help create a compelling pitch deck:\n\n"
            "Purpose: {purpose}\n"
            "Audience: {audience}\n"
            "Key Message: {key_message}\n"
            "Unique Value: {unique_value}\n\n"
            "Provide pitch deck structure and content including:\n"
            "- Slide-by-slide outline\n"
            "- Key talking points\n"
            "- Compelling narratives\n"
            "- Data and proof points\n"
            "- Call to action",
            variables=["purpose", "audience", "key_message", "unique_value"]
        )
        
        # Objection handling template
        self.add_prompt_template(
            "objection_handling",
            "Develop objection handling strategies:\n\n"
            "Common Objections:\n{objections}\n\n"
            "Product/Service: {product}\n"
            "Value Proposition: {value_prop}\n\n"
            "Provide objection handling responses including:\n"
            "- Empathetic acknowledgment\n"
            "- Reframing techniques\n"
            "- Proof points and social proof\n"
            "- Alternative perspectives\n"
            "- Closing questions",
            variables=["objections", "product", "value_prop"]
        )
        
        # Sales script template
        self.add_prompt_template(
            "sales_script",
            "Create a sales script for this scenario:\n\n"
            "Sales Context: {context}\n"
            "Target Customer: {customer}\n"
            "Product/Service: {product}\n"
            "Desired Outcome: {outcome}\n\n"
            "Create a conversational sales script with:\n"
            "- Opening hook\n"
            "- Discovery questions\n"
            "- Value presentation\n"
            "- Objection handling\n"
            "- Closing sequence",
            variables=["context", "customer", "product", "outcome"]
        )
        
        # Conversion optimization template
        self.add_prompt_template(
            "conversion_optimization",
            "Optimize conversion for this funnel stage:\n\n"
            "Funnel Stage: {stage}\n"
            "Current Performance: {performance}\n"
            "Target Metrics: {targets}\n"
            "Constraints: {constraints}\n\n"
            "Provide conversion optimization recommendations:\n"
            "- Friction points to address\n"
            "- Copy and messaging improvements\n"
            "- Design and UX enhancements\n"
            "- Trust and credibility elements\n"
            "- Testing priorities",
            variables=["stage", "performance", "targets", "constraints"]
        )
    
    async def contribute_to_mission(
        self,
        objective: str,
        context: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Contribute sales and conversion perspective to Mission Control
        
        Blaze focuses on:
        - Sales strategy and process design
        - Funnel optimization and conversion tactics
        - Pitch and messaging development
        - Customer acquisition and retention
        """
        mission_prompt = (
            f"As the Growth & Sales Strategist on this mission, analyze the following objective "
            f"and provide your sales and conversion perspective:\n\n"
            f"Objective: {objective}\n\n"
            f"Focus on:\n"
            f"1. Designing the sales strategy and customer acquisition approach\n"
            f"2. Optimizing the sales funnel and conversion path\n"
            f"3. Developing compelling pitches and messaging\n"
            f"4. Identifying conversion bottlenecks and solutions\n"
            f"5. Recommending sales metrics and KPIs to track\n\n"
            f"Provide a structured sales strategy with actionable conversion tactics."
        )
        
        # Add context if available
        if context:
            mission_prompt += f"\n\nAdditional Context:\n"
            for key, value in context.items():
                mission_prompt += f"- {key}: {value}\n"
        
        # Create temporary context for mission
        mission_context = self.create_context(max_history=5)
        
        # Process the mission objective
        result = await self.process_message(
            message=mission_prompt,
            context=mission_context,
            temperature=0.8
        )
        
        return {
            "agent_id": self.agent_id,
            "agent_name": self.name,
            "contribution_type": "sales_strategy",
            "content": result["content"],
            "focus_areas": [
                "sales_process",
                "funnel_optimization",
                "pitch_development",
                "conversion_tactics"
            ],
            "confidence": "high"
        }
    
    async def design_funnel(
        self,
        offering: str,
        audience: str,
        conversion_rates: str = "Not yet measured",
        goals: str = "Maximize conversions"
    ) -> Dict[str, Any]:
        """
        Design a sales funnel blueprint
        
        Args:
            offering: Product or service offering
            audience: Target audience description
            conversion_rates: Current conversion metrics
            goals: Funnel goals
        
        Returns:
            Funnel blueprint with optimization recommendations
        """
        template = self.get_prompt_template("funnel_blueprint")
        prompt = template.format(
            offering=offering,
            audience=audience,
            conversion_rates=conversion_rates,
            goals=goals
        )
        
        context = self.create_context()
        result = await self.process_message(prompt, context, temperature=0.7)
        
        return result
    
    async def create_pitch(
        self,
        purpose: str,
        audience: str,
        key_message: str,
        unique_value: str
    ) -> Dict[str, Any]:
        """
        Create a compelling pitch deck structure
        
        Args:
            purpose: Purpose of the pitch (investor, customer, partner)
            audience: Target audience
            key_message: Core message to convey
            unique_value: Unique value proposition
        
        Returns:
            Pitch deck structure and content
        """
        template = self.get_prompt_template("pitch_deck")
        prompt = template.format(
            purpose=purpose,
            audience=audience,
            key_message=key_message,
            unique_value=unique_value
        )
        
        context = self.create_context()
        result = await self.process_message(prompt, context, temperature=0.8)
        
        return result
