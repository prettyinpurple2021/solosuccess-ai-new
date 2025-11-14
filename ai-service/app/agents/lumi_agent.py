"""Lumi - Legal & Docs Agent"""

from typing import Dict, Any
from app.agents.base_agent import BaseAgent, AgentRole, LLMProvider, ResponseFormatter


class LumiAgent(BaseAgent):
    """
    Lumi - Legal & Docs Agent
    
    Personality: Legal advisor with document generation expertise
    Focus: Legal guidance, document generation, contract templates, compliance
    
    Lumi helps solo founders understand legal requirements, generate business documents,
    and navigate compliance issues. Always includes appropriate disclaimers.
    """
    
    # Legal disclaimer constant
    LEGAL_DISCLAIMER = (
        "\n\n---\n"
        "⚠️ **LEGAL DISCLAIMER**: This information is provided for educational purposes only "
        "and does not constitute legal advice. AI-generated legal content should be reviewed "
        "by a qualified attorney before use. Laws vary by jurisdiction, and professional legal "
        "counsel is recommended for your specific situation."
    )
    
    def __init__(self):
        super().__init__(
            agent_id="lumi",
            name="Lumi",
            role=AgentRole.LEGAL,
            personality="Professional, precise, and cautious. Acts as a legal advisor who emphasizes clarity, compliance, and risk mitigation.",
            system_prompt=(
                "You are Lumi, a Legal & Docs specialist for solo founders. "
                "Your expertise lies in legal guidance, document generation, contract templates, "
                "and compliance requirements. You help founders understand legal concepts, "
                "create business documents, and navigate regulatory requirements. "
                "You are professional, precise, and always emphasize the importance of "
                "consulting qualified legal professionals for specific advice. "
                "Provide clear explanations of legal concepts with practical guidance. "
                "Always include appropriate disclaimers and recommend professional review. "
                "Focus on risk mitigation, compliance, and proper documentation."
            ),
            llm_provider=LLMProvider.OPENAI
        )
    
    def _initialize_templates(self):
        """Initialize Lumi's prompt templates"""
        
        # Document generation template
        self.add_prompt_template(
            "document_generation",
            "Generate a {document_type} document with the following details:\n\n"
            "Business Context: {business_context}\n"
            "Parties Involved: {parties}\n"
            "Key Terms: {key_terms}\n"
            "Jurisdiction: {jurisdiction}\n\n"
            "Create a professional document template that includes:\n"
            "- Standard legal structure and sections\n"
            "- Clear definitions and terms\n"
            "- Appropriate clauses for this document type\n"
            "- Placeholders for customization\n"
            "- Notes on sections requiring legal review",
            variables=["document_type", "business_context", "parties", "key_terms", "jurisdiction"]
        )
        
        # Contract template template
        self.add_prompt_template(
            "contract_template",
            "Create a contract template for:\n\n"
            "Contract Type: {contract_type}\n"
            "Business Type: {business_type}\n"
            "Key Provisions: {provisions}\n"
            "Jurisdiction: {jurisdiction}\n\n"
            "Provide a comprehensive contract template with:\n"
            "- Essential contract clauses\n"
            "- Standard terms and conditions\n"
            "- Protection clauses (liability, indemnification, etc.)\n"
            "- Termination and dispute resolution\n"
            "- Customization guidance",
            variables=["contract_type", "business_type", "provisions", "jurisdiction"]
        )
        
        # Legal compliance template
        self.add_prompt_template(
            "legal_compliance",
            "Provide legal compliance guidance for:\n\n"
            "Business Type: {business_type}\n"
            "Industry: {industry}\n"
            "Location: {location}\n"
            "Business Activities: {activities}\n\n"
            "Outline compliance requirements including:\n"
            "- Business registration and licensing\n"
            "- Tax obligations and reporting\n"
            "- Industry-specific regulations\n"
            "- Data privacy and security requirements\n"
            "- Employment and contractor considerations",
            variables=["business_type", "industry", "location", "activities"]
        )
        
        # Terms of service template
        self.add_prompt_template(
            "terms_of_service",
            "Generate Terms of Service for:\n\n"
            "Service Description: {service}\n"
            "Business Model: {business_model}\n"
            "User Obligations: {user_obligations}\n"
            "Jurisdiction: {jurisdiction}\n\n"
            "Create comprehensive Terms of Service including:\n"
            "- Service description and scope\n"
            "- User rights and responsibilities\n"
            "- Payment and refund terms\n"
            "- Intellectual property provisions\n"
            "- Limitation of liability\n"
            "- Dispute resolution",
            variables=["service", "business_model", "user_obligations", "jurisdiction"]
        )
        
        # Privacy policy template
        self.add_prompt_template(
            "privacy_policy",
            "Generate a Privacy Policy for:\n\n"
            "Service/Product: {product}\n"
            "Data Collected: {data_collected}\n"
            "Data Usage: {data_usage}\n"
            "Jurisdiction: {jurisdiction}\n\n"
            "Create a comprehensive Privacy Policy including:\n"
            "- Types of data collected\n"
            "- Purpose and legal basis for processing\n"
            "- Data sharing and third parties\n"
            "- User rights (GDPR, CCPA compliance)\n"
            "- Security measures\n"
            "- Cookie policy",
            variables=["product", "data_collected", "data_usage", "jurisdiction"]
        )
        
        # Legal risk assessment template
        self.add_prompt_template(
            "risk_assessment",
            "Assess legal risks for this situation:\n\n"
            "Situation: {situation}\n"
            "Business Context: {context}\n"
            "Proposed Action: {action}\n"
            "Jurisdiction: {jurisdiction}\n\n"
            "Provide legal risk assessment including:\n"
            "- Identified legal risks and concerns\n"
            "- Potential liabilities and consequences\n"
            "- Risk mitigation strategies\n"
            "- Recommended protective measures\n"
            "- When to consult an attorney",
            variables=["situation", "context", "action", "jurisdiction"]
        )
    
    def _add_legal_disclaimer(self, content: str) -> str:
        """Add legal disclaimer to all responses"""
        return content + self.LEGAL_DISCLAIMER
    
    async def process_message(
        self,
        message: str,
        context,
        **kwargs
    ) -> Dict[str, Any]:
        """Override to add legal disclaimer to all responses"""
        result = await super().process_message(message, context, **kwargs)
        result["content"] = self._add_legal_disclaimer(result["content"])
        result["metadata"]["disclaimer_included"] = True
        return result
    
    async def contribute_to_mission(
        self,
        objective: str,
        context: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Contribute legal and documentation perspective to Mission Control
        
        Lumi focuses on:
        - Legal requirements and compliance
        - Document and contract needs
        - Risk assessment and mitigation
        - Intellectual property protection
        """
        mission_prompt = (
            f"As the Legal & Docs specialist on this mission, analyze the following objective "
            f"and provide your legal and documentation perspective:\n\n"
            f"Objective: {objective}\n\n"
            f"Focus on:\n"
            f"1. Identifying legal requirements and compliance considerations\n"
            f"2. Recommending necessary documents and contracts\n"
            f"3. Assessing legal risks and mitigation strategies\n"
            f"4. Outlining intellectual property protection needs\n"
            f"5. Suggesting when to consult legal professionals\n\n"
            f"Provide a structured legal analysis with practical guidance."
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
            temperature=0.5
        )
        
        return {
            "agent_id": self.agent_id,
            "agent_name": self.name,
            "contribution_type": "legal_analysis",
            "content": result["content"],
            "focus_areas": [
                "legal_compliance",
                "documentation",
                "risk_assessment",
                "ip_protection"
            ],
            "confidence": "medium",
            "disclaimer": "Legal review recommended"
        }
    
    async def generate_document(
        self,
        document_type: str,
        business_context: str,
        parties: str,
        key_terms: str,
        jurisdiction: str = "United States"
    ) -> Dict[str, Any]:
        """
        Generate a legal document template
        
        Args:
            document_type: Type of document (NDA, contract, agreement, etc.)
            business_context: Business context and purpose
            parties: Parties involved in the document
            key_terms: Key terms and conditions
            jurisdiction: Legal jurisdiction
        
        Returns:
            Generated document template with disclaimer
        """
        template = self.get_prompt_template("document_generation")
        prompt = template.format(
            document_type=document_type,
            business_context=business_context,
            parties=parties,
            key_terms=key_terms,
            jurisdiction=jurisdiction
        )
        
        context = self.create_context()
        result = await self.process_message(prompt, context, temperature=0.3)
        
        return result
    
    async def assess_compliance(
        self,
        business_type: str,
        industry: str,
        location: str,
        activities: str
    ) -> Dict[str, Any]:
        """
        Assess legal compliance requirements
        
        Args:
            business_type: Type of business entity
            industry: Industry sector
            location: Business location/jurisdiction
            activities: Business activities description
        
        Returns:
            Compliance requirements and guidance
        """
        template = self.get_prompt_template("legal_compliance")
        prompt = template.format(
            business_type=business_type,
            industry=industry,
            location=location,
            activities=activities
        )
        
        context = self.create_context()
        result = await self.process_message(prompt, context, temperature=0.4)
        
        return result
