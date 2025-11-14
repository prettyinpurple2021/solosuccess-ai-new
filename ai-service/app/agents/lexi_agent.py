"""Lexi - Insight Engine Agent"""

from typing import Dict, Any, List
from app.agents.base_agent import BaseAgent, AgentRole, LLMProvider, ResponseFormatter


class LexiAgent(BaseAgent):
    """
    Lexi - Insight Engine Agent
    
    Personality: Analytical data scientist with pattern recognition expertise
    Focus: Data analysis, insight generation, trend identification, metrics interpretation
    
    Lexi helps solo founders make sense of their business data by identifying patterns,
    generating actionable insights, and highlighting trends that matter for growth.
    """
    
    def __init__(self):
        super().__init__(
            agent_id="lexi",
            name="Lexi",
            role=AgentRole.ANALYTICAL,
            personality="Analytical, data-driven, and insight-focused. Acts as a data scientist who transforms raw numbers into actionable business intelligence.",
            system_prompt=(
                "You are Lexi, an Insight Engine and data analyst for solo founders. "
                "Your expertise lies in data analysis, pattern recognition, and insight generation. "
                "You help founders understand their business metrics, identify trends, and make "
                "data-driven decisions. You are analytical, precise, and always looking for the "
                "story behind the numbers. Provide clear, actionable insights with specific metrics, "
                "trends, and recommendations. Focus on translating complex data into simple, "
                "understandable insights that drive business decisions. Always include context, "
                "comparisons, and practical next steps."
            ),
            llm_provider=LLMProvider.OPENAI
        )
    
    def _initialize_templates(self):
        """Initialize Lexi's prompt templates"""
        
        # Metrics analysis template
        self.add_prompt_template(
            "metrics_analysis",
            "Analyze these business metrics and provide insights:\n\n"
            "Metrics Data:\n{metrics}\n\n"
            "Time Period: {time_period}\n"
            "Business Context: {context}\n\n"
            "Provide comprehensive analysis including:\n"
            "- Key performance indicators and their trends\n"
            "- Notable changes or anomalies\n"
            "- Correlations between metrics\n"
            "- Health assessment (what's working, what's not)\n"
            "- Actionable recommendations based on the data",
            variables=["metrics", "time_period", "context"]
        )
        
        # Trend identification template
        self.add_prompt_template(
            "trend_identification",
            "Identify and analyze trends in this data:\n\n"
            "Data:\n{data}\n\n"
            "Historical Context: {historical_context}\n"
            "Industry Benchmarks: {benchmarks}\n\n"
            "Identify and explain:\n"
            "- Upward and downward trends\n"
            "- Seasonal patterns or cycles\n"
            "- Inflection points and their causes\n"
            "- Projected trajectory based on current trends\n"
            "- Opportunities and risks indicated by trends",
            variables=["data", "historical_context", "benchmarks"]
        )
        
        # Insight generation template
        self.add_prompt_template(
            "insight_generation",
            "Generate actionable insights from this business data:\n\n"
            "Business Data:\n{business_data}\n\n"
            "Goals: {goals}\n"
            "Current Challenges: {challenges}\n\n"
            "Generate insights that:\n"
            "- Highlight hidden opportunities in the data\n"
            "- Identify potential problems before they escalate\n"
            "- Suggest specific actions to improve metrics\n"
            "- Connect data patterns to business outcomes\n"
            "- Prioritize insights by potential impact",
            variables=["business_data", "goals", "challenges"]
        )
        
        # Performance comparison template
        self.add_prompt_template(
            "performance_comparison",
            "Compare performance across these dimensions:\n\n"
            "Current Performance:\n{current_performance}\n\n"
            "Comparison Baseline:\n{baseline}\n"
            "Comparison Type: {comparison_type}\n\n"
            "Provide detailed comparison including:\n"
            "- Performance gaps (positive and negative)\n"
            "- Root causes of differences\n"
            "- Relative strengths and weaknesses\n"
            "- Recommendations to close gaps\n"
            "- Realistic improvement targets",
            variables=["current_performance", "baseline", "comparison_type"]
        )
        
        # Data story template
        self.add_prompt_template(
            "data_storytelling",
            "Tell the story behind this data:\n\n"
            "Data:\n{data}\n\n"
            "Business Context: {context}\n"
            "Audience: {audience}\n\n"
            "Create a compelling data story that:\n"
            "- Explains what happened and why\n"
            "- Highlights the most important insights\n"
            "- Uses analogies and examples for clarity\n"
            "- Connects data to business impact\n"
            "- Ends with clear recommendations",
            variables=["data", "context", "audience"]
        )
        
        # Anomaly detection template
        self.add_prompt_template(
            "anomaly_detection",
            "Analyze this data for anomalies and unusual patterns:\n\n"
            "Data:\n{data}\n\n"
            "Expected Patterns: {expected_patterns}\n"
            "Context: {context}\n\n"
            "Identify and explain:\n"
            "- Unusual spikes or drops\n"
            "- Deviations from expected patterns\n"
            "- Potential causes of anomalies\n"
            "- Whether anomalies are concerning or positive\n"
            "- Recommended actions to investigate or leverage",
            variables=["data", "expected_patterns", "context"]
        )
        
        # Predictive insights template
        self.add_prompt_template(
            "predictive_insights",
            "Generate predictive insights based on this data:\n\n"
            "Historical Data:\n{historical_data}\n\n"
            "Current Trends: {current_trends}\n"
            "External Factors: {external_factors}\n\n"
            "Provide predictive insights including:\n"
            "- Likely future scenarios based on current trajectory\n"
            "- Leading indicators to watch\n"
            "- Potential inflection points\n"
            "- Proactive actions to influence outcomes\n"
            "- Confidence levels and assumptions",
            variables=["historical_data", "current_trends", "external_factors"]
        )
        
        # Metric correlation template
        self.add_prompt_template(
            "metric_correlation",
            "Analyze correlations between these metrics:\n\n"
            "Metrics:\n{metrics}\n\n"
            "Time Period: {time_period}\n"
            "Business Model: {business_model}\n\n"
            "Analyze and explain:\n"
            "- Strong correlations (positive and negative)\n"
            "- Causal relationships vs. coincidences\n"
            "- Leading and lagging indicators\n"
            "- How to leverage correlations for growth\n"
            "- Metrics to focus on for maximum impact",
            variables=["metrics", "time_period", "business_model"]
        )
        
        # Dashboard insights template
        self.add_prompt_template(
            "dashboard_insights",
            "Generate daily insight nudges from this dashboard data:\n\n"
            "Dashboard Metrics:\n{dashboard_metrics}\n\n"
            "Previous Period: {previous_period}\n"
            "User Goals: {user_goals}\n\n"
            "Generate 3-5 insight nudges that:\n"
            "- Highlight the most important changes\n"
            "- Are actionable and specific\n"
            "- Connect to user's goals\n"
            "- Are concise (1-2 sentences each)\n"
            "- Prioritize by urgency and impact",
            variables=["dashboard_metrics", "previous_period", "user_goals"]
        )
    
    async def contribute_to_mission(
        self,
        objective: str,
        context: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Contribute analytical and insights perspective to Mission Control
        
        Lexi focuses on:
        - Data requirements and metrics definition
        - Success measurement framework
        - Trend analysis and predictions
        - Performance benchmarking
        """
        mission_prompt = (
            f"As the Insight Engine on this mission, analyze the following objective "
            f"and provide your analytical and data-driven perspective:\n\n"
            f"Objective: {objective}\n\n"
            f"Focus on:\n"
            f"1. Defining key metrics and KPIs to measure success\n"
            f"2. Identifying data requirements and tracking mechanisms\n"
            f"3. Establishing baseline measurements and targets\n"
            f"4. Recommending analytics and reporting structure\n"
            f"5. Suggesting data-driven decision points and milestones\n\n"
            f"Provide a structured analytics framework with specific metrics and insights."
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
            temperature=0.6
        )
        
        return {
            "agent_id": self.agent_id,
            "agent_name": self.name,
            "contribution_type": "analytics_framework",
            "content": result["content"],
            "focus_areas": [
                "metrics_definition",
                "data_requirements",
                "success_measurement",
                "performance_tracking"
            ],
            "confidence": "high"
        }
    
    async def analyze_metrics(
        self,
        metrics: str,
        time_period: str,
        context: str = "General business context"
    ) -> Dict[str, Any]:
        """
        Analyze business metrics and provide insights
        
        Args:
            metrics: Business metrics data
            time_period: Time period for analysis
            context: Business context
        
        Returns:
            Comprehensive metrics analysis with insights
        """
        template = self.get_prompt_template("metrics_analysis")
        prompt = template.format(
            metrics=metrics,
            time_period=time_period,
            context=context
        )
        
        context_obj = self.create_context()
        result = await self.process_message(prompt, context_obj, temperature=0.5)
        
        return result
    
    async def identify_trends(
        self,
        data: str,
        historical_context: str = "No historical context provided",
        benchmarks: str = "Industry standard benchmarks"
    ) -> Dict[str, Any]:
        """
        Identify and analyze trends in business data
        
        Args:
            data: Business data to analyze
            historical_context: Historical context for comparison
            benchmarks: Industry benchmarks for reference
        
        Returns:
            Trend analysis with patterns and predictions
        """
        template = self.get_prompt_template("trend_identification")
        prompt = template.format(
            data=data,
            historical_context=historical_context,
            benchmarks=benchmarks
        )
        
        context_obj = self.create_context()
        result = await self.process_message(prompt, context_obj, temperature=0.6)
        
        return result
    
    async def generate_insights(
        self,
        business_data: str,
        goals: str,
        challenges: str = "No specific challenges identified"
    ) -> Dict[str, Any]:
        """
        Generate actionable insights from business data
        
        Args:
            business_data: Business data to analyze
            goals: Business goals and objectives
            challenges: Current business challenges
        
        Returns:
            Actionable insights prioritized by impact
        """
        template = self.get_prompt_template("insight_generation")
        prompt = template.format(
            business_data=business_data,
            goals=goals,
            challenges=challenges
        )
        
        context_obj = self.create_context()
        result = await self.process_message(prompt, context_obj, temperature=0.7)
        
        return result
    
    async def generate_daily_nudges(
        self,
        dashboard_metrics: str,
        previous_period: str,
        user_goals: str
    ) -> Dict[str, Any]:
        """
        Generate daily insight nudges from dashboard data
        
        Args:
            dashboard_metrics: Current dashboard metrics
            previous_period: Previous period metrics for comparison
            user_goals: User's business goals
        
        Returns:
            3-5 prioritized insight nudges
        """
        template = self.get_prompt_template("dashboard_insights")
        prompt = template.format(
            dashboard_metrics=dashboard_metrics,
            previous_period=previous_period,
            user_goals=user_goals
        )
        
        context_obj = self.create_context()
        result = await self.process_message(prompt, context_obj, temperature=0.6)
        
        return result
    
    async def detect_anomalies(
        self,
        data: str,
        expected_patterns: str,
        context: str = "General business context"
    ) -> Dict[str, Any]:
        """
        Detect and analyze anomalies in business data
        
        Args:
            data: Business data to analyze
            expected_patterns: Expected patterns or norms
            context: Business context
        
        Returns:
            Anomaly analysis with explanations and recommendations
        """
        template = self.get_prompt_template("anomaly_detection")
        prompt = template.format(
            data=data,
            expected_patterns=expected_patterns,
            context=context
        )
        
        context_obj = self.create_context()
        result = await self.process_message(prompt, context_obj, temperature=0.5)
        
        return result
    
    async def compare_performance(
        self,
        current_performance: str,
        baseline: str,
        comparison_type: str = "Period over period"
    ) -> Dict[str, Any]:
        """
        Compare performance across different dimensions
        
        Args:
            current_performance: Current performance metrics
            baseline: Baseline for comparison
            comparison_type: Type of comparison (e.g., YoY, MoM, vs. benchmark)
        
        Returns:
            Performance comparison with gap analysis
        """
        template = self.get_prompt_template("performance_comparison")
        prompt = template.format(
            current_performance=current_performance,
            baseline=baseline,
            comparison_type=comparison_type
        )
        
        context_obj = self.create_context()
        result = await self.process_message(prompt, context_obj, temperature=0.5)
        
        return result
    
    async def tell_data_story(
        self,
        data: str,
        context: str,
        audience: str = "Business stakeholders"
    ) -> Dict[str, Any]:
        """
        Create a compelling narrative from data
        
        Args:
            data: Data to tell story about
            context: Business context
            audience: Target audience for the story
        
        Returns:
            Data story with insights and recommendations
        """
        template = self.get_prompt_template("data_storytelling")
        prompt = template.format(
            data=data,
            context=context,
            audience=audience
        )
        
        context_obj = self.create_context()
        result = await self.process_message(prompt, context_obj, temperature=0.7)
        
        return result
    
    async def generate_predictions(
        self,
        historical_data: str,
        current_trends: str,
        external_factors: str = "No significant external factors"
    ) -> Dict[str, Any]:
        """
        Generate predictive insights based on data trends
        
        Args:
            historical_data: Historical business data
            current_trends: Current trend analysis
            external_factors: External factors that may impact predictions
        
        Returns:
            Predictive insights with scenarios and recommendations
        """
        template = self.get_prompt_template("predictive_insights")
        prompt = template.format(
            historical_data=historical_data,
            current_trends=current_trends,
            external_factors=external_factors
        )
        
        context_obj = self.create_context()
        result = await self.process_message(prompt, context_obj, temperature=0.6)
        
        return result
    
    async def analyze_correlations(
        self,
        metrics: str,
        time_period: str,
        business_model: str
    ) -> Dict[str, Any]:
        """
        Analyze correlations between business metrics
        
        Args:
            metrics: Multiple metrics to analyze
            time_period: Time period for correlation analysis
            business_model: Business model context
        
        Returns:
            Correlation analysis with causal insights
        """
        template = self.get_prompt_template("metric_correlation")
        prompt = template.format(
            metrics=metrics,
            time_period=time_period,
            business_model=business_model
        )
        
        context_obj = self.create_context()
        result = await self.process_message(prompt, context_obj, temperature=0.6)
        
        return result
