"""Agent registry for managing available agents"""

from typing import Dict, Optional, List
import structlog

from app.agents.base_agent import BaseAgent

logger = structlog.get_logger()


class AgentRegistry:
    """Registry for managing and accessing AI agents"""
    
    def __init__(self):
        self._agents: Dict[str, BaseAgent] = {}
        logger.info("agent_registry_initialized")
    
    def register(self, agent: BaseAgent):
        """Register an agent"""
        if agent.agent_id in self._agents:
            logger.warning(
                "agent_already_registered",
                agent_id=agent.agent_id
            )
            return
        
        self._agents[agent.agent_id] = agent
        logger.info(
            "agent_registered",
            agent_id=agent.agent_id,
            name=agent.name
        )
    
    def unregister(self, agent_id: str):
        """Unregister an agent"""
        if agent_id in self._agents:
            del self._agents[agent_id]
            logger.info("agent_unregistered", agent_id=agent_id)
    
    def get(self, agent_id: str) -> Optional[BaseAgent]:
        """Get an agent by ID"""
        return self._agents.get(agent_id)
    
    def get_all(self) -> List[BaseAgent]:
        """Get all registered agents"""
        return list(self._agents.values())
    
    def get_by_role(self, role: str) -> List[BaseAgent]:
        """Get agents by role"""
        return [
            agent for agent in self._agents.values()
            if agent.role.value == role
        ]
    
    def list_agents(self) -> List[Dict[str, str]]:
        """List all agents with basic info"""
        return [
            {
                "agent_id": agent.agent_id,
                "name": agent.name,
                "role": agent.role.value,
                "personality": agent.personality
            }
            for agent in self._agents.values()
        ]
    
    def exists(self, agent_id: str) -> bool:
        """Check if an agent exists"""
        return agent_id in self._agents


# Global agent registry instance
agent_registry = AgentRegistry()
