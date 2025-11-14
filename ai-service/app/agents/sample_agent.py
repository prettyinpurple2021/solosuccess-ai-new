"""Sample agent implementation for demonstration"""

from typing import Dict, Any
from app.agents.base_agent import BaseAgent, AgentRole, LLMProvider


class SampleAgent(BaseAgent):
    """
    Sample agent implementation demonstrating the base agent class
    
    This is a simple example agent that can be used as a template
    for implementing the seven core agents (Roxy, Echo, Blaze, etc.)
    """
    
    def __init__(self):
        super().__init__(
            agent_id="sample",
            name="Sample Agent",
            role=AgentRole.STRATEGIC,
            personality="Helpful and professional assistant",
            system_prompt=(
                "You are a helpful AI assistant for solo founders. "
                "Provide clear, actionable advice and maintain a professional yet friendly tone. "
                "Focus on practical solutions and strategic thinking."
            ),
            llm_provider=LLMProvider.OPENAI
        )
    
    def _initialize_templates(self):
        """Initialize prompt templates for this agent"""
        
        # Template for general advice
        self.add_prompt_template(
            "general_advice",
            "As an expert advisor for solo founders, provide advice on: {topic}\n\n"
            "Consider the following context:\n{context}\n\n"
            "Provide actionable recommendations.",
            variables=["topic", "context"]
        )
        
        # Template for problem solving
        self.add_prompt_template(
            "problem_solving",
            "Help solve this business challenge: {problem}\n\n"
            "Current situation: {situation}\n\n"
            "Provide a structured solution with specific steps.",
            variables=["problem", "situation"]
        )
        
        # Template for strategic planning
        self.add_prompt_template(
            "strategic_planning",
            "Create a strategic plan for: {objective}\n\n"
            "Timeline: {timeline}\n"
            "Resources: {resources}\n\n"
            "Provide a detailed plan with milestones and action items.",
            variables=["objective", "timeline", "resources"]
        )
    
    async def contribute_to_mission(
        self,
        objective: str,
        context: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Contribute to a Mission Control objective
        
        This method is called when the agent participates in a
        collaborative Mission Control session.
        """
        # Create a focused prompt for mission contribution
        mission_prompt = (
            f"As part of a collaborative team working on this objective:\n\n"
            f"{objective}\n\n"
            f"Provide your strategic perspective and recommendations. "
            f"Focus on high-level strategy and key considerations."
        )
        
        # Create temporary context for mission
        mission_context = self.create_context(max_history=5)
        
        # Process the mission objective
        result = await self.process_message(
            message=mission_prompt,
            context=mission_context
        )
        
        return {
            "agent_id": self.agent_id,
            "agent_name": self.name,
            "contribution_type": "strategic_analysis",
            "content": result["content"],
            "recommendations": self._extract_recommendations(result["content"]),
            "confidence": "high"
        }
    
    def _extract_recommendations(self, content: str) -> list:
        """
        Extract key recommendations from content
        
        In a production implementation, this could use NLP or
        structured prompting to extract specific recommendations.
        """
        # Simple implementation - split by lines and filter
        lines = content.split("\n")
        recommendations = []
        
        for line in lines:
            line = line.strip()
            if line and (
                line.startswith("-") or
                line.startswith("•") or
                line[0].isdigit() and "." in line[:3]
            ):
                recommendations.append(line.lstrip("-•0123456789. "))
        
        return recommendations[:5]  # Return top 5 recommendations
