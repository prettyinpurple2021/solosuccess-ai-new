"""Base AI Agent class and interfaces"""

from abc import ABC, abstractmethod
from typing import List, Dict, Any, Optional
from datetime import datetime
from enum import Enum
import structlog

from app.services.llm_service import llm_service, LLMProvider

logger = structlog.get_logger()


class AgentRole(str, Enum):
    """Agent role types"""
    STRATEGIC = "strategic"
    GROWTH = "growth"
    SALES = "sales"
    LEGAL = "legal"
    TECHNICAL = "technical"
    ANALYTICAL = "analytical"
    DESIGN = "design"


class ConversationContext:
    """Manages conversation context and history"""
    
    def __init__(self, max_history: int = 10):
        self.messages: List[Dict[str, str]] = []
        self.max_history = max_history
        self.metadata: Dict[str, Any] = {}
    
    def add_message(self, role: str, content: str):
        """Add a message to the conversation history"""
        self.messages.append({
            "role": role,
            "content": content,
            "timestamp": datetime.utcnow().isoformat()
        })
        
        # Keep only recent messages to manage context window
        if len(self.messages) > self.max_history:
            # Keep system message if present
            system_msgs = [msg for msg in self.messages if msg["role"] == "system"]
            recent_msgs = [msg for msg in self.messages if msg["role"] != "system"][-self.max_history:]
            self.messages = system_msgs + recent_msgs
    
    def get_messages(self, include_timestamps: bool = False) -> List[Dict[str, str]]:
        """Get conversation messages"""
        if include_timestamps:
            return self.messages
        return [{"role": msg["role"], "content": msg["content"]} for msg in self.messages]
    
    def clear(self):
        """Clear conversation history"""
        self.messages = []
        self.metadata = {}
    
    def set_metadata(self, key: str, value: Any):
        """Set metadata for the conversation"""
        self.metadata[key] = value
    
    def get_metadata(self, key: str, default: Any = None) -> Any:
        """Get metadata from the conversation"""
        return self.metadata.get(key, default)


class PromptTemplate:
    """Template for agent prompts"""
    
    def __init__(self, template: str, variables: Optional[List[str]] = None):
        self.template = template
        self.variables = variables or []
    
    def format(self, **kwargs) -> str:
        """Format the template with provided variables"""
        try:
            return self.template.format(**kwargs)
        except KeyError as e:
            logger.error(
                "prompt_template_formatting_failed",
                error=str(e),
                missing_variable=str(e)
            )
            raise ValueError(f"Missing required variable: {e}")


class BaseAgent(ABC):
    """
    Base class for all AI agents
    
    Provides common functionality for:
    - Conversation context management
    - Prompt template system
    - LLM interaction
    - Response formatting
    """
    
    def __init__(
        self,
        agent_id: str,
        name: str,
        role: AgentRole,
        personality: str,
        system_prompt: str,
        llm_provider: LLMProvider = LLMProvider.OPENAI
    ):
        self.agent_id = agent_id
        self.name = name
        self.role = role
        self.personality = personality
        self.system_prompt = system_prompt
        self.llm_provider = llm_provider
        
        # Initialize prompt templates
        self.prompt_templates: Dict[str, PromptTemplate] = {}
        self._initialize_templates()
        
        logger.info(
            "agent_initialized",
            agent_id=agent_id,
            name=name,
            role=role.value
        )
    
    @abstractmethod
    def _initialize_templates(self):
        """Initialize agent-specific prompt templates"""
        pass
    
    def create_context(self, max_history: int = 10) -> ConversationContext:
        """Create a new conversation context"""
        context = ConversationContext(max_history=max_history)
        context.add_message("system", self.system_prompt)
        return context
    
    def add_prompt_template(self, name: str, template: str, variables: Optional[List[str]] = None):
        """Add a prompt template"""
        self.prompt_templates[name] = PromptTemplate(template, variables)
    
    def get_prompt_template(self, name: str) -> Optional[PromptTemplate]:
        """Get a prompt template by name"""
        return self.prompt_templates.get(name)
    
    async def process_message(
        self,
        message: str,
        context: ConversationContext,
        **kwargs
    ) -> Dict[str, Any]:
        """
        Process a user message and generate a response
        
        Args:
            message: User message
            context: Conversation context
            **kwargs: Additional parameters
        
        Returns:
            Dictionary containing response and metadata
        """
        try:
            logger.info(
                "agent_processing_message",
                agent_id=self.agent_id,
                message_length=len(message)
            )
            
            # Add user message to context
            context.add_message("user", message)
            
            # Get conversation messages
            messages = context.get_messages()
            
            # Generate response using LLM
            result = await llm_service.generate_completion(
                messages=messages,
                provider=self.llm_provider,
                fallback=True,
                **kwargs
            )
            
            # Add assistant response to context
            context.add_message("assistant", result["content"])
            
            # Format response
            response = self._format_response(result, context)
            
            logger.info(
                "agent_message_processed",
                agent_id=self.agent_id,
                response_length=len(result["content"])
            )
            
            return response
            
        except Exception as e:
            logger.error(
                "agent_processing_failed",
                agent_id=self.agent_id,
                error=str(e)
            )
            raise
    
    def _format_response(
        self,
        llm_result: Dict[str, Any],
        context: ConversationContext
    ) -> Dict[str, Any]:
        """
        Format the LLM response with agent-specific metadata
        
        Args:
            llm_result: Raw LLM response
            context: Conversation context
        
        Returns:
            Formatted response dictionary
        """
        return {
            "agent_id": self.agent_id,
            "agent_name": self.name,
            "role": self.role.value,
            "content": llm_result["content"],
            "timestamp": datetime.utcnow().isoformat(),
            "metadata": {
                "model": llm_result["model"],
                "provider": llm_result["provider"],
                "usage": llm_result["usage"],
                "personality": self.personality,
                "context_length": len(context.get_messages())
            }
        }
    
    @abstractmethod
    async def contribute_to_mission(
        self,
        objective: str,
        context: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Contribute to a Mission Control objective
        
        Args:
            objective: Mission objective description
            context: Mission context and parameters
        
        Returns:
            Agent's contribution to the mission
        """
        pass
    
    def get_info(self) -> Dict[str, Any]:
        """Get agent information"""
        return {
            "agent_id": self.agent_id,
            "name": self.name,
            "role": self.role.value,
            "personality": self.personality,
            "available_templates": list(self.prompt_templates.keys())
        }


class ResponseFormatter:
    """Utility class for formatting agent responses"""
    
    @staticmethod
    def format_as_markdown(content: str, title: Optional[str] = None) -> str:
        """Format content as markdown"""
        if title:
            return f"# {title}\n\n{content}"
        return content
    
    @staticmethod
    def format_as_list(items: List[str], ordered: bool = False) -> str:
        """Format items as a list"""
        if ordered:
            return "\n".join([f"{i+1}. {item}" for i, item in enumerate(items)])
        return "\n".join([f"- {item}" for item in items])
    
    @staticmethod
    def format_as_sections(sections: Dict[str, str]) -> str:
        """Format content as sections"""
        formatted = []
        for title, content in sections.items():
            formatted.append(f"## {title}\n\n{content}")
        return "\n\n".join(formatted)
    
    @staticmethod
    def add_suggestions(content: str, suggestions: List[str]) -> str:
        """Add suggestions to content"""
        suggestions_text = ResponseFormatter.format_as_list(suggestions)
        return f"{content}\n\n### Suggestions\n\n{suggestions_text}"
    
    @staticmethod
    def add_next_steps(content: str, steps: List[str]) -> str:
        """Add next steps to content"""
        steps_text = ResponseFormatter.format_as_list(steps, ordered=True)
        return f"{content}\n\n### Next Steps\n\n{steps_text}"
