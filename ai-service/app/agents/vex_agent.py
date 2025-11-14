"""Vex - Technical Architect Agent"""

from typing import Dict, Any
from app.agents.base_agent import BaseAgent, AgentRole, LLMProvider, ResponseFormatter


class VexAgent(BaseAgent):
    """
    Vex - Technical Architect Agent
    
    Personality: Technical expert with architecture and engineering expertise
    Focus: Technical specifications, technology recommendations, architecture design
    
    Vex helps solo founders make informed technical decisions, design system architectures,
    and choose the right technologies for their products and infrastructure.
    """
    
    def __init__(self):
        super().__init__(
            agent_id="vex",
            name="Vex",
            role=AgentRole.TECHNICAL,
            personality="Analytical, detail-oriented, and pragmatic. Acts as a technical architect who balances best practices with practical constraints.",
            system_prompt=(
                "You are Vex, a Technical Architect for solo founders. "
                "Your expertise lies in technical specifications, technology recommendations, "
                "system architecture design, and engineering best practices. "
                "You help founders make informed technical decisions, design scalable systems, "
                "and choose appropriate technologies for their needs. "
                "You are analytical, pragmatic, and understand the constraints of solo founders. "
                "Provide clear technical guidance with specific recommendations, trade-offs, "
                "and implementation considerations. Focus on simplicity, scalability, and "
                "maintainability while avoiding over-engineering."
            ),
            llm_provider=LLMProvider.OPENAI
        )
    
    def _initialize_templates(self):
        """Initialize Vex's prompt templates"""
        
        # Technical specifications template
        self.add_prompt_template(
            "technical_specs",
            "Create technical specifications for:\n\n"
            "Project: {project}\n"
            "Requirements: {requirements}\n"
            "Constraints: {constraints}\n"
            "Scale: {scale}\n\n"
            "Provide comprehensive technical specifications including:\n"
            "- System architecture overview\n"
            "- Technology stack recommendations\n"
            "- Data models and schemas\n"
            "- API design and interfaces\n"
            "- Security and performance considerations\n"
            "- Deployment and infrastructure needs",
            variables=["project", "requirements", "constraints", "scale"]
        )
        
        # Technology recommendation template
        self.add_prompt_template(
            "tech_recommendation",
            "Recommend technologies for this use case:\n\n"
            "Use Case: {use_case}\n"
            "Requirements: {requirements}\n"
            "Team Skills: {skills}\n"
            "Budget: {budget}\n"
            "Timeline: {timeline}\n\n"
            "Provide technology recommendations with:\n"
            "- Recommended tech stack with rationale\n"
            "- Alternative options and trade-offs\n"
            "- Learning curve considerations\n"
            "- Cost implications\n"
            "- Ecosystem and community support\n"
            "- Migration and scaling paths",
            variables=["use_case", "requirements", "skills", "budget", "timeline"]
        )
        
        # Architecture design template
        self.add_prompt_template(
            "architecture_design",
            "Design system architecture for:\n\n"
            "System: {system}\n"
            "Functional Requirements: {functional_requirements}\n"
            "Non-Functional Requirements: {non_functional_requirements}\n"
            "Scale: {scale}\n\n"
            "Create architecture design including:\n"
            "- High-level architecture diagram description\n"
            "- Component breakdown and responsibilities\n"
            "- Data flow and integration points\n"
            "- Scalability and performance strategy\n"
            "- Security architecture\n"
            "- Deployment architecture",
            variables=["system", "functional_requirements", "non_functional_requirements", "scale"]
        )
        
        # Database design template
        self.add_prompt_template(
            "database_design",
            "Design database schema for:\n\n"
            "Application: {application}\n"
            "Data Requirements: {data_requirements}\n"
            "Query Patterns: {query_patterns}\n"
            "Scale: {scale}\n\n"
            "Provide database design including:\n"
            "- Database type recommendation (SQL/NoSQL)\n"
            "- Schema design with tables/collections\n"
            "- Relationships and constraints\n"
            "- Indexing strategy\n"
            "- Data migration considerations\n"
            "- Backup and recovery approach",
            variables=["application", "data_requirements", "query_patterns", "scale"]
        )
        
        # API design template
        self.add_prompt_template(
            "api_design",
            "Design API for this service:\n\n"
            "Service: {service}\n"
            "Use Cases: {use_cases}\n"
            "Consumers: {consumers}\n"
            "Requirements: {requirements}\n\n"
            "Create API design including:\n"
            "- API architecture (REST, GraphQL, etc.)\n"
            "- Endpoint structure and naming\n"
            "- Request/response formats\n"
            "- Authentication and authorization\n"
            "- Rate limiting and versioning\n"
            "- Error handling and documentation",
            variables=["service", "use_cases", "consumers", "requirements"]
        )
        
        # Technical debt assessment template
        self.add_prompt_template(
            "tech_debt_assessment",
            "Assess technical debt in this system:\n\n"
            "System Description: {system}\n"
            "Current Issues: {issues}\n"
            "Growth Plans: {growth_plans}\n"
            "Resources: {resources}\n\n"
            "Provide technical debt assessment including:\n"
            "- Identified technical debt areas\n"
            "- Impact and risk analysis\n"
            "- Prioritized remediation plan\n"
            "- Effort estimates\n"
            "- Prevention strategies",
            variables=["system", "issues", "growth_plans", "resources"]
        )
        
        # Architecture diagram template
        self.add_prompt_template(
            "architecture_diagram",
            "Generate architecture diagram description for:\n\n"
            "System: {system}\n"
            "Components: {components}\n"
            "Integrations: {integrations}\n\n"
            "Provide detailed diagram description including:\n"
            "- Component layout and grouping\n"
            "- Connection types and protocols\n"
            "- Data flow directions\n"
            "- External dependencies\n"
            "- Mermaid diagram syntax if applicable",
            variables=["system", "components", "integrations"]
        )
    
    async def contribute_to_mission(
        self,
        objective: str,
        context: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Contribute technical architecture perspective to Mission Control
        
        Vex focuses on:
        - Technical feasibility and architecture
        - Technology stack recommendations
        - System design and scalability
        - Implementation complexity and timeline
        """
        mission_prompt = (
            f"As the Technical Architect on this mission, analyze the following objective "
            f"and provide your technical perspective:\n\n"
            f"Objective: {objective}\n\n"
            f"Focus on:\n"
            f"1. Assessing technical feasibility and complexity\n"
            f"2. Recommending appropriate technology stack and architecture\n"
            f"3. Identifying technical risks and mitigation strategies\n"
            f"4. Outlining system design and component structure\n"
            f"5. Estimating technical effort and implementation timeline\n\n"
            f"Provide a structured technical analysis with practical recommendations."
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
            "contribution_type": "technical_architecture",
            "content": result["content"],
            "focus_areas": [
                "technical_feasibility",
                "architecture_design",
                "technology_selection",
                "implementation_planning"
            ],
            "confidence": "high"
        }
    
    async def recommend_technologies(
        self,
        use_case: str,
        requirements: str,
        skills: str = "General web development",
        budget: str = "Moderate",
        timeline: str = "3-6 months"
    ) -> Dict[str, Any]:
        """
        Recommend technologies for a use case
        
        Args:
            use_case: Description of the use case
            requirements: Technical requirements
            skills: Team/founder technical skills
            budget: Budget constraints
            timeline: Project timeline
        
        Returns:
            Technology recommendations with trade-offs
        """
        template = self.get_prompt_template("tech_recommendation")
        prompt = template.format(
            use_case=use_case,
            requirements=requirements,
            skills=skills,
            budget=budget,
            timeline=timeline
        )
        
        context = self.create_context()
        result = await self.process_message(prompt, context, temperature=0.6)
        
        return result
    
    async def design_architecture(
        self,
        system: str,
        functional_requirements: str,
        non_functional_requirements: str,
        scale: str = "Small to medium scale"
    ) -> Dict[str, Any]:
        """
        Design system architecture
        
        Args:
            system: System description
            functional_requirements: What the system must do
            non_functional_requirements: Performance, security, etc.
            scale: Expected scale and load
        
        Returns:
            Architecture design with diagrams and explanations
        """
        template = self.get_prompt_template("architecture_design")
        prompt = template.format(
            system=system,
            functional_requirements=functional_requirements,
            non_functional_requirements=non_functional_requirements,
            scale=scale
        )
        
        context = self.create_context()
        result = await self.process_message(prompt, context, temperature=0.5)
        
        return result
    
    async def generate_diagram_description(
        self,
        system: str,
        components: str,
        integrations: str = "None"
    ) -> Dict[str, Any]:
        """
        Generate architecture diagram description
        
        Args:
            system: System name and description
            components: List of system components
            integrations: External integrations
        
        Returns:
            Diagram description and Mermaid syntax
        """
        template = self.get_prompt_template("architecture_diagram")
        prompt = template.format(
            system=system,
            components=components,
            integrations=integrations
        )
        
        context = self.create_context()
        result = await self.process_message(prompt, context, temperature=0.4)
        
        return result
