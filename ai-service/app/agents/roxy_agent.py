"""Roxy - Strategic Operator Agent"""

from typing import Dict, Any
from app.agents.base_agent import BaseAgent, AgentRole, LLMProvider, ResponseFormatter


class RoxyAgent(BaseAgent):
    """
    Roxy - Strategic Operator Agent
    
    Personality: Executive assistant with strategic thinking capabilities
    Focus: Schedule management, workflow optimization, executive assistance
    
    Roxy helps solo founders manage their time effectively, optimize workflows,
    and make strategic decisions about resource allocation and priorities.
    """
    
    def __init__(self):
        super().__init__(
            agent_id="roxy",
            name="Roxy",
            role=AgentRole.STRATEGIC,
            personality="Professional, organized, and strategic. Acts as a trusted executive assistant with a focus on efficiency and high-level thinking.",
            system_prompt=(
                "You are Roxy, a Strategic Operator and executive assistant for solo founders. "
                "Your expertise lies in schedule management, workflow optimization, and strategic planning. "
                "You help founders prioritize tasks, manage their time effectively, and make strategic decisions. "
                "You are professional, organized, and always thinking about the bigger picture. "
                "Provide clear, actionable advice with specific steps and timelines. "
                "Focus on efficiency, productivity, and strategic resource allocation."
            ),
            llm_provider=LLMProvider.OPENAI
        )
    
    def _initialize_templates(self):
        """Initialize Roxy's prompt templates"""
        
        # Schedule management template
        self.add_prompt_template(
            "schedule_management",
            "Analyze this schedule and provide optimization recommendations:\n\n"
            "Current Schedule:\n{schedule}\n\n"
            "Goals: {goals}\n"
            "Constraints: {constraints}\n\n"
            "Provide a detailed schedule optimization plan with specific time blocks, "
            "priority rankings, and recommendations for delegation or elimination of tasks.",
            variables=["schedule", "goals", "constraints"]
        )
        
        # Workflow optimization template
        self.add_prompt_template(
            "workflow_optimization",
            "Analyze this workflow and suggest optimizations:\n\n"
            "Current Workflow:\n{workflow}\n\n"
            "Pain Points: {pain_points}\n"
            "Available Tools: {tools}\n\n"
            "Provide specific recommendations to streamline this workflow, "
            "including automation opportunities, process improvements, and tool suggestions.",
            variables=["workflow", "pain_points", "tools"]
        )
        
        # Priority assessment template
        self.add_prompt_template(
            "priority_assessment",
            "Help prioritize these tasks and initiatives:\n\n"
            "Tasks:\n{tasks}\n\n"
            "Business Goals: {business_goals}\n"
            "Timeline: {timeline}\n"
            "Resources: {resources}\n\n"
            "Provide a prioritized list using the Eisenhower Matrix (Urgent/Important), "
            "with clear reasoning for each priority level and recommended action timelines.",
            variables=["tasks", "business_goals", "timeline", "resources"]
        )
        
        # Strategic planning template
        self.add_prompt_template(
            "strategic_planning",
            "Create a strategic plan for this objective:\n\n"
            "Objective: {objective}\n"
            "Current State: {current_state}\n"
            "Timeline: {timeline}\n"
            "Resources: {resources}\n\n"
            "Provide a comprehensive strategic plan with milestones, key activities, "
            "resource allocation, and risk mitigation strategies.",
            variables=["objective", "current_state", "timeline", "resources"]
        )
        
        # Resource allocation template
        self.add_prompt_template(
            "resource_allocation",
            "Recommend optimal resource allocation:\n\n"
            "Available Resources:\n{resources}\n\n"
            "Competing Priorities:\n{priorities}\n\n"
            "Business Context: {context}\n\n"
            "Provide specific recommendations for allocating time, budget, and energy "
            "across these priorities to maximize ROI and strategic impact.",
            variables=["resources", "priorities", "context"]
        )
        
        # Decision framework template
        self.add_prompt_template(
            "decision_framework",
            "Help make this strategic decision:\n\n"
            "Decision: {decision}\n"
            "Options:\n{options}\n\n"
            "Criteria: {criteria}\n"
            "Context: {context}\n\n"
            "Provide a structured decision analysis with pros/cons for each option, "
            "weighted scoring based on criteria, and a clear recommendation with reasoning.",
            variables=["decision", "options", "criteria", "context"]
        )
    
    async def contribute_to_mission(
        self,
        objective: str,
        context: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Contribute strategic operations perspective to Mission Control
        
        Roxy focuses on:
        - Resource allocation and timeline planning
        - Workflow and process design
        - Priority setting and milestone definition
        - Risk assessment and contingency planning
        """
        mission_prompt = (
            f"As the Strategic Operator on this mission, analyze the following objective "
            f"and provide your strategic operations perspective:\n\n"
            f"Objective: {objective}\n\n"
            f"Focus on:\n"
            f"1. Breaking down the objective into actionable phases and milestones\n"
            f"2. Identifying resource requirements (time, budget, tools, people)\n"
            f"3. Recommending optimal workflow and process structure\n"
            f"4. Highlighting potential bottlenecks and dependencies\n"
            f"5. Suggesting priority order for execution\n\n"
            f"Provide a structured strategic operations plan."
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
            temperature=0.7
        )
        
        return {
            "agent_id": self.agent_id,
            "agent_name": self.name,
            "contribution_type": "strategic_operations",
            "content": result["content"],
            "focus_areas": [
                "resource_allocation",
                "workflow_design",
                "milestone_planning",
                "risk_assessment"
            ],
            "confidence": "high"
        }
    
    async def optimize_schedule(
        self,
        schedule: str,
        goals: str,
        constraints: str = "None specified"
    ) -> Dict[str, Any]:
        """
        Optimize a schedule based on goals and constraints
        
        Args:
            schedule: Current schedule description
            goals: Business goals and priorities
            constraints: Time or resource constraints
        
        Returns:
            Optimized schedule with recommendations
        """
        template = self.get_prompt_template("schedule_management")
        prompt = template.format(
            schedule=schedule,
            goals=goals,
            constraints=constraints
        )
        
        context = self.create_context()
        result = await self.process_message(prompt, context, temperature=0.6)
        
        return result
    
    async def assess_priorities(
        self,
        tasks: str,
        business_goals: str,
        timeline: str = "Next 30 days",
        resources: str = "Standard solo founder resources"
    ) -> Dict[str, Any]:
        """
        Assess and prioritize tasks using strategic frameworks
        
        Args:
            tasks: List of tasks to prioritize
            business_goals: Current business goals
            timeline: Time horizon for prioritization
            resources: Available resources
        
        Returns:
            Prioritized task list with reasoning
        """
        template = self.get_prompt_template("priority_assessment")
        prompt = template.format(
            tasks=tasks,
            business_goals=business_goals,
            timeline=timeline,
            resources=resources
        )
        
        context = self.create_context()
        result = await self.process_message(prompt, context, temperature=0.6)
        
        return result
