"""Echo - Growth Catalyst Agent"""

from typing import Dict, Any
from app.agents.base_agent import BaseAgent, AgentRole, LLMProvider, ResponseFormatter


class EchoAgent(BaseAgent):
    """
    Echo - Growth Catalyst Agent
    
    Personality: Marketing strategist with market intelligence expertise
    Focus: Market intelligence, opportunity identification, growth strategy
    
    Echo helps solo founders identify growth opportunities, understand market dynamics,
    and develop effective marketing strategies to scale their business.
    """
    
    def __init__(self):
        super().__init__(
            agent_id="echo",
            name="Echo",
            role=AgentRole.GROWTH,
            personality="Insightful, trend-aware, and opportunity-focused. Acts as a growth strategist who sees patterns and possibilities in market data.",
            system_prompt=(
                "You are Echo, a Growth Catalyst and marketing strategist for solo founders. "
                "Your expertise lies in market intelligence, opportunity identification, and growth strategy. "
                "You help founders understand market trends, identify untapped opportunities, and develop "
                "data-driven growth strategies. You are insightful, analytical, and always looking for "
                "the next growth lever. Provide actionable marketing insights with specific tactics, "
                "channels, and metrics. Focus on sustainable, scalable growth strategies."
            ),
            llm_provider=LLMProvider.OPENAI
        )
    
    def _initialize_templates(self):
        """Initialize Echo's prompt templates"""
        
        # Market intelligence template
        self.add_prompt_template(
            "market_intelligence",
            "Analyze this market and provide intelligence insights:\n\n"
            "Market: {market}\n"
            "Industry: {industry}\n"
            "Target Audience: {target_audience}\n\n"
            "Current Trends: {trends}\n\n"
            "Provide comprehensive market intelligence including:\n"
            "- Key market trends and dynamics\n"
            "- Emerging opportunities and threats\n"
            "- Competitive landscape insights\n"
            "- Target audience behavior patterns\n"
            "- Recommended positioning strategies",
            variables=["market", "industry", "target_audience", "trends"]
        )
        
        # Opportunity identification template
        self.add_prompt_template(
            "opportunity_identification",
            "Identify growth opportunities for this business:\n\n"
            "Business Description: {business}\n"
            "Current State: {current_state}\n"
            "Target Market: {target_market}\n"
            "Resources: {resources}\n\n"
            "Identify and prioritize specific growth opportunities including:\n"
            "- Untapped market segments\n"
            "- New product/service opportunities\n"
            "- Partnership and collaboration possibilities\n"
            "- Channel expansion opportunities\n"
            "- Quick wins vs. long-term plays",
            variables=["business", "current_state", "target_market", "resources"]
        )
        
        # Growth strategy template
        self.add_prompt_template(
            "growth_strategy",
            "Develop a growth strategy for this objective:\n\n"
            "Growth Goal: {goal}\n"
            "Current Metrics: {metrics}\n"
            "Timeline: {timeline}\n"
            "Budget: {budget}\n\n"
            "Create a comprehensive growth strategy with:\n"
            "- Specific growth tactics and channels\n"
            "- Projected impact and timeline\n"
            "- Resource requirements\n"
            "- Key metrics to track\n"
            "- Experimentation framework",
            variables=["goal", "metrics", "timeline", "budget"]
        )
        
        # Marketing channel analysis template
        self.add_prompt_template(
            "channel_analysis",
            "Analyze and recommend marketing channels:\n\n"
            "Business Type: {business_type}\n"
            "Target Audience: {target_audience}\n"
            "Budget: {budget}\n"
            "Current Channels: {current_channels}\n\n"
            "Provide channel recommendations with:\n"
            "- Best-fit channels for this audience\n"
            "- Expected ROI and timeline\n"
            "- Resource requirements per channel\n"
            "- Testing and optimization approach\n"
            "- Channel mix strategy",
            variables=["business_type", "target_audience", "budget", "current_channels"]
        )
        
        # Positioning strategy template
        self.add_prompt_template(
            "positioning_strategy",
            "Develop positioning strategy:\n\n"
            "Product/Service: {product}\n"
            "Target Market: {target_market}\n"
            "Competitors: {competitors}\n"
            "Unique Value: {unique_value}\n\n"
            "Create a positioning strategy including:\n"
            "- Market positioning statement\n"
            "- Differentiation strategy\n"
            "- Messaging framework\n"
            "- Brand personality and voice\n"
            "- Competitive advantages to emphasize",
            variables=["product", "target_market", "competitors", "unique_value"]
        )
        
        # Viral growth tactics template
        self.add_prompt_template(
            "viral_tactics",
            "Recommend viral growth tactics:\n\n"
            "Product: {product}\n"
            "Target Audience: {audience}\n"
            "Current Traction: {traction}\n\n"
            "Suggest viral growth tactics including:\n"
            "- Referral program ideas\n"
            "- Social sharing mechanisms\n"
            "- Network effects opportunities\n"
            "- Content virality strategies\n"
            "- Community building approaches",
            variables=["product", "audience", "traction"]
        )
    
    async def contribute_to_mission(
        self,
        objective: str,
        context: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Contribute growth and marketing perspective to Mission Control
        
        Echo focuses on:
        - Market opportunity analysis
        - Growth channel identification
        - Audience targeting and positioning
        - Marketing strategy and tactics
        """
        mission_prompt = (
            f"As the Growth Catalyst on this mission, analyze the following objective "
            f"and provide your growth and marketing perspective:\n\n"
            f"Objective: {objective}\n\n"
            f"Focus on:\n"
            f"1. Identifying market opportunities and growth levers\n"
            f"2. Recommending target audience segments and positioning\n"
            f"3. Suggesting marketing channels and tactics\n"
            f"4. Outlining growth metrics and success indicators\n"
            f"5. Proposing experimentation and optimization approaches\n\n"
            f"Provide a structured growth strategy with actionable marketing insights."
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
            "contribution_type": "growth_strategy",
            "content": result["content"],
            "focus_areas": [
                "market_opportunities",
                "growth_channels",
                "audience_targeting",
                "marketing_tactics"
            ],
            "confidence": "high"
        }
    
    async def analyze_market(
        self,
        market: str,
        industry: str,
        target_audience: str,
        trends: str = "Current market trends"
    ) -> Dict[str, Any]:
        """
        Analyze market and provide intelligence insights
        
        Args:
            market: Market description
            industry: Industry sector
            target_audience: Target audience description
            trends: Current market trends
        
        Returns:
            Market intelligence report
        """
        template = self.get_prompt_template("market_intelligence")
        prompt = template.format(
            market=market,
            industry=industry,
            target_audience=target_audience,
            trends=trends
        )
        
        context = self.create_context()
        result = await self.process_message(prompt, context, temperature=0.7)
        
        return result
    
    async def identify_opportunities(
        self,
        business: str,
        current_state: str,
        target_market: str,
        resources: str = "Standard solo founder resources"
    ) -> Dict[str, Any]:
        """
        Identify growth opportunities for a business
        
        Args:
            business: Business description
            current_state: Current business state
            target_market: Target market description
            resources: Available resources
        
        Returns:
            Growth opportunities analysis
        """
        template = self.get_prompt_template("opportunity_identification")
        prompt = template.format(
            business=business,
            current_state=current_state,
            target_market=target_market,
            resources=resources
        )
        
        context = self.create_context()
        result = await self.process_message(prompt, context, temperature=0.8)
        
        return result
