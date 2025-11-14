"""Test script to verify all agents are properly initialized"""

import asyncio
from app.agents import initialize_agents, agent_registry


async def test_agents():
    """Test that all agents are properly initialized"""
    print("Initializing agents...")
    initialize_agents()
    
    print("\nRegistered agents:")
    agents = agent_registry.list_agents()
    
    for agent_info in agents:
        print(f"\n- {agent_info['name']} ({agent_info['agent_id']})")
        print(f"  Role: {agent_info['role']}")
        print(f"  Personality: {agent_info['personality']}")
    
    print(f"\nTotal agents registered: {len(agents)}")
    
    # Test getting each agent
    print("\nTesting agent retrieval:")
    agent_ids = ["roxy", "echo", "blaze", "lumi", "vex", "lexi", "nova"]
    
    for agent_id in agent_ids:
        agent = agent_registry.get(agent_id)
        if agent:
            print(f"✓ {agent_id}: {agent.name}")
            info = agent.get_info()
            print(f"  Templates: {', '.join(info['available_templates'])}")
        else:
            print(f"✗ {agent_id}: NOT FOUND")
    
    # Test a simple message with one agent
    print("\n\nTesting message processing with Roxy:")
    roxy = agent_registry.get("roxy")
    if roxy:
        context = roxy.create_context()
        result = await roxy.process_message(
            "What are the top 3 priorities for a solo founder launching a SaaS product?",
            context
        )
        print(f"\nResponse from {result['agent_name']}:")
        print(f"{result['content'][:300]}...")
        print(f"\nMetadata:")
        print(f"  Model: {result['metadata']['model']}")
        print(f"  Provider: {result['metadata']['provider']}")
        print(f"  Tokens: {result['metadata']['usage']['total_tokens']}")


if __name__ == "__main__":
    asyncio.run(test_agents())
