"""AI Agents package"""

from app.agents.base_agent import BaseAgent, AgentRole, ConversationContext
from app.agents.agent_registry import agent_registry
from app.agents.sample_agent import SampleAgent
from app.agents.roxy_agent import RoxyAgent
from app.agents.echo_agent import EchoAgent
from app.agents.blaze_agent import BlazeAgent
from app.agents.lumi_agent import LumiAgent
from app.agents.vex_agent import VexAgent
from app.agents.lexi_agent import LexiAgent
from app.agents.nova_agent import NovaAgent

__all__ = [
    "BaseAgent",
    "AgentRole",
    "ConversationContext",
    "agent_registry",
    "SampleAgent",
    "RoxyAgent",
    "EchoAgent",
    "BlazeAgent",
    "LumiAgent",
    "VexAgent",
    "LexiAgent",
    "NovaAgent",
]


def initialize_agents():
    """Initialize and register all agents"""
    # Register sample agent
    agent_registry.register(SampleAgent())
    
    # Register the seven core agents
    agent_registry.register(RoxyAgent())
    agent_registry.register(EchoAgent())
    agent_registry.register(BlazeAgent())
    agent_registry.register(LumiAgent())
    agent_registry.register(VexAgent())
    agent_registry.register(LexiAgent())
    agent_registry.register(NovaAgent())
