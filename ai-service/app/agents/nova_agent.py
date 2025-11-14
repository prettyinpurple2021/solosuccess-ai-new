"""Nova - Product Designer Agent"""

from typing import Dict, Any
from app.agents.base_agent import BaseAgent, AgentRole, LLMProvider, ResponseFormatter


class NovaAgent(BaseAgent):
    """
    Nova - Product Designer Agent
    
    Personality: Design expert with UI/UX and product design expertise
    Focus: UI/UX guidance, wireframe suggestions, design systems, user experience
    
    Nova helps solo founders create intuitive, beautiful products with excellent
    user experience through design guidance and best practices.
    """
    
    def __init__(self):
        super().__init__(
            agent_id="nova",
            name="Nova",
            role=AgentRole.DESIGN,
            personality="Creative, user-focused, and detail-oriented. Acts as a product designer who balances aesthetics with usability and business goals.",
            system_prompt=(
                "You are Nova, a Product Designer for solo founders. "
                "Your expertise lies in UI/UX design, wireframe creation, design systems, "
                "and user experience optimization. You help founders create intuitive, "
                "beautiful products that users love. You understand design principles, "
                "accessibility, and the psychology of user interaction. "
                "You are creative yet practical, always considering both aesthetics and usability. "
                "Provide specific design guidance with clear rationale, best practices, "
                "and actionable recommendations. Focus on user-centered design that "
                "balances beauty, usability, and business objectives."
            ),
            llm_provider=LLMProvider.OPENAI
        )
    
    def _initialize_templates(self):
        """Initialize Nova's prompt templates"""
        
        # UI/UX guidance template
        self.add_prompt_template(
            "uiux_guidance",
            "Provide UI/UX guidance for:\n\n"
            "Feature/Screen: {feature}\n"
            "User Goals: {user_goals}\n"
            "Context: {context}\n"
            "Constraints: {constraints}\n\n"
            "Provide comprehensive UI/UX guidance including:\n"
            "- Layout and information architecture\n"
            "- User flow and interaction patterns\n"
            "- Visual hierarchy and emphasis\n"
            "- Accessibility considerations\n"
            "- Best practices and design patterns\n"
            "- Common pitfalls to avoid",
            variables=["feature", "user_goals", "context", "constraints"]
        )
        
        # Wireframe suggestion template
        self.add_prompt_template(
            "wireframe_suggestion",
            "Suggest wireframe structure for:\n\n"
            "Screen/Page: {screen}\n"
            "Purpose: {purpose}\n"
            "Key Elements: {elements}\n"
            "User Actions: {actions}\n\n"
            "Provide wireframe suggestions including:\n"
            "- Layout structure and grid\n"
            "- Component placement and sizing\n"
            "- Content hierarchy\n"
            "- Interactive elements and CTAs\n"
            "- Responsive considerations\n"
            "- ASCII or text-based wireframe representation",
            variables=["screen", "purpose", "elements", "actions"]
        )
        
        # Design system template
        self.add_prompt_template(
            "design_system",
            "Recommend design system for:\n\n"
            "Product Type: {product_type}\n"
            "Brand Personality: {brand_personality}\n"
            "Target Audience: {target_audience}\n"
            "Platform: {platform}\n\n"
            "Provide design system recommendations including:\n"
            "- Color palette and usage guidelines\n"
            "- Typography scale and hierarchy\n"
            "- Spacing and layout system\n"
            "- Component library essentials\n"
            "- Design tokens and variables\n"
            "- Accessibility standards",
            variables=["product_type", "brand_personality", "target_audience", "platform"]
        )
        
        # User flow template
        self.add_prompt_template(
            "user_flow",
            "Design user flow for:\n\n"
            "User Goal: {goal}\n"
            "Entry Point: {entry_point}\n"
            "Success Criteria: {success_criteria}\n"
            "Constraints: {constraints}\n\n"
            "Create user flow including:\n"
            "- Step-by-step flow description\n"
            "- Decision points and branches\n"
            "- Error states and edge cases\n"
            "- Friction points and optimizations\n"
            "- Alternative paths\n"
            "- Flow diagram description",
            variables=["goal", "entry_point", "success_criteria", "constraints"]
        )
        
        # Usability review template
        self.add_prompt_template(
            "usability_review",
            "Review usability of:\n\n"
            "Interface Description: {interface}\n"
            "User Feedback: {feedback}\n"
            "Analytics Data: {analytics}\n\n"
            "Provide usability review including:\n"
            "- Identified usability issues\n"
            "- Severity and impact assessment\n"
            "- Root cause analysis\n"
            "- Specific improvement recommendations\n"
            "- Quick wins vs. long-term improvements\n"
            "- Testing and validation approach",
            variables=["interface", "feedback", "analytics"]
        )
        
        # Accessibility audit template
        self.add_prompt_template(
            "accessibility_audit",
            "Audit accessibility for:\n\n"
            "Interface: {interface}\n"
            "Target WCAG Level: {wcag_level}\n"
            "Known Issues: {known_issues}\n\n"
            "Provide accessibility audit including:\n"
            "- WCAG compliance assessment\n"
            "- Identified accessibility barriers\n"
            "- Priority fixes by impact\n"
            "- Implementation guidance\n"
            "- Testing recommendations\n"
            "- Inclusive design best practices",
            variables=["interface", "wcag_level", "known_issues"]
        )
        
        # Design critique template
        self.add_prompt_template(
            "design_critique",
            "Critique this design:\n\n"
            "Design Description: {design}\n"
            "Design Goals: {goals}\n"
            "Target Users: {users}\n\n"
            "Provide constructive design critique including:\n"
            "- What's working well and why\n"
            "- Areas for improvement\n"
            "- Alignment with design principles\n"
            "- User experience considerations\n"
            "- Specific actionable suggestions\n"
            "- Alternative approaches to consider",
            variables=["design", "goals", "users"]
        )
    
    async def contribute_to_mission(
        self,
        objective: str,
        context: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Contribute product design perspective to Mission Control
        
        Nova focuses on:
        - User experience and interface design
        - Design system and visual consistency
        - Usability and accessibility
        - User-centered design approach
        """
        mission_prompt = (
            f"As the Product Designer on this mission, analyze the following objective "
            f"and provide your design and user experience perspective:\n\n"
            f"Objective: {objective}\n\n"
            f"Focus on:\n"
            f"1. Defining user experience goals and success criteria\n"
            f"2. Recommending interface design approach and patterns\n"
            f"3. Outlining design system and visual direction\n"
            f"4. Identifying usability and accessibility requirements\n"
            f"5. Suggesting user research and testing approaches\n\n"
            f"Provide a structured design strategy with user-centered recommendations."
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
            "contribution_type": "design_strategy",
            "content": result["content"],
            "focus_areas": [
                "user_experience",
                "interface_design",
                "design_systems",
                "accessibility"
            ],
            "confidence": "high"
        }
    
    async def provide_uiux_guidance(
        self,
        feature: str,
        user_goals: str,
        context: str = "General web/mobile application",
        constraints: str = "Standard constraints"
    ) -> Dict[str, Any]:
        """
        Provide UI/UX guidance for a feature
        
        Args:
            feature: Feature or screen description
            user_goals: What users want to accomplish
            context: Usage context
            constraints: Design constraints
        
        Returns:
            UI/UX guidance and recommendations
        """
        template = self.get_prompt_template("uiux_guidance")
        prompt = template.format(
            feature=feature,
            user_goals=user_goals,
            context=context,
            constraints=constraints
        )
        
        context_obj = self.create_context()
        result = await self.process_message(prompt, context_obj, temperature=0.7)
        
        return result
    
    async def suggest_wireframe(
        self,
        screen: str,
        purpose: str,
        elements: str,
        actions: str
    ) -> Dict[str, Any]:
        """
        Suggest wireframe structure for a screen
        
        Args:
            screen: Screen or page name
            purpose: Purpose of the screen
            elements: Key elements to include
            actions: User actions to support
        
        Returns:
            Wireframe suggestions and structure
        """
        template = self.get_prompt_template("wireframe_suggestion")
        prompt = template.format(
            screen=screen,
            purpose=purpose,
            elements=elements,
            actions=actions
        )
        
        context = self.create_context()
        result = await self.process_message(prompt, context, temperature=0.7)
        
        return result
    
    async def recommend_design_system(
        self,
        product_type: str,
        brand_personality: str,
        target_audience: str,
        platform: str = "Web and mobile"
    ) -> Dict[str, Any]:
        """
        Recommend design system components
        
        Args:
            product_type: Type of product
            brand_personality: Brand personality traits
            target_audience: Target audience description
            platform: Platform(s) to support
        
        Returns:
            Design system recommendations
        """
        template = self.get_prompt_template("design_system")
        prompt = template.format(
            product_type=product_type,
            brand_personality=brand_personality,
            target_audience=target_audience,
            platform=platform
        )
        
        context = self.create_context()
        result = await self.process_message(prompt, context, temperature=0.7)
        
        return result
    
    async def design_user_flow(
        self,
        goal: str,
        entry_point: str,
        success_criteria: str,
        constraints: str = "None specified"
    ) -> Dict[str, Any]:
        """
        Design user flow for a goal
        
        Args:
            goal: User goal to accomplish
            entry_point: Where user starts
            success_criteria: What defines success
            constraints: Flow constraints
        
        Returns:
            User flow design and diagram
        """
        template = self.get_prompt_template("user_flow")
        prompt = template.format(
            goal=goal,
            entry_point=entry_point,
            success_criteria=success_criteria,
            constraints=constraints
        )
        
        context = self.create_context()
        result = await self.process_message(prompt, context, temperature=0.6)
        
        return result
