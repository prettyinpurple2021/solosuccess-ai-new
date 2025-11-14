"""
Basic usage examples for the AI Service

This file demonstrates how to use the AI service components programmatically.
"""

import asyncio
from app.services.llm_service import llm_service, LLMProvider
from app.services.vector_service import vector_service
from app.agents.sample_agent import SampleAgent
from app.agents.agent_registry import agent_registry


async def example_llm_completion():
    """Example: Generate a completion using LLM service"""
    print("\n=== LLM Completion Example ===")
    
    messages = [
        {"role": "system", "content": "You are a helpful business advisor."},
        {"role": "user", "content": "What are the top 3 priorities for a new solo founder?"}
    ]
    
    result = await llm_service.generate_completion(
        messages=messages,
        provider=LLMProvider.OPENAI,
        fallback=True
    )
    
    print(f"Response: {result['content'][:200]}...")
    print(f"Model: {result['model']}")
    print(f"Tokens used: {result['usage']['total_tokens']}")


async def example_vector_operations():
    """Example: Store and search vectors"""
    print("\n=== Vector Database Example ===")
    
    # Store some business advice
    texts = [
        "Focus on product-market fit before scaling your business",
        "Build a strong brand identity early in your journey",
        "Prioritize customer feedback and iterate quickly"
    ]
    
    print("Storing texts...")
    for i, text in enumerate(texts):
        result = await vector_service.store_text(
            text=text,
            metadata={"category": "advice", "index": i},
            namespace="business_advice"
        )
        print(f"Stored: {result['vector_id']}")
    
    # Perform semantic search
    print("\nSearching for similar content...")
    query = "How should I grow my startup?"
    results = await vector_service.semantic_search(
        query=query,
        top_k=2,
        namespace="business_advice"
    )
    
    print(f"Query: {query}")
    for match in results:
        print(f"  - Score: {match['score']:.4f}")
        print(f"    Metadata: {match['metadata']}")


async def example_agent_usage():
    """Example: Use an AI agent"""
    print("\n=== AI Agent Example ===")
    
    # Create and register agent
    agent = SampleAgent()
    agent_registry.register(agent)
    
    # Create conversation context
    context = agent.create_context()
    
    # Process messages
    messages = [
        "I'm struggling to prioritize my tasks as a solo founder",
        "What framework would you recommend for time management?"
    ]
    
    for message in messages:
        print(f"\nUser: {message}")
        result = await agent.process_message(message, context)
        print(f"Agent: {result['content'][:150]}...")
        print(f"Context length: {result['metadata']['context_length']} messages")


async def example_mission_contribution():
    """Example: Agent contributing to a mission"""
    print("\n=== Mission Control Example ===")
    
    agent = SampleAgent()
    
    objective = "Create a go-to-market strategy for a new SaaS product targeting solo founders"
    context = {
        "product": "AI-powered business assistant",
        "target_market": "solo founders and solopreneurs",
        "timeline": "3 months"
    }
    
    print(f"Objective: {objective}")
    contribution = await agent.contribute_to_mission(objective, context)
    
    print(f"\nAgent: {contribution['agent_name']}")
    print(f"Contribution type: {contribution['contribution_type']}")
    print(f"Recommendations: {len(contribution['recommendations'])}")
    for i, rec in enumerate(contribution['recommendations'][:3], 1):
        print(f"  {i}. {rec}")


async def example_cost_tracking():
    """Example: View cost tracking statistics"""
    print("\n=== Cost Tracking Example ===")
    
    # Generate some completions first
    await example_llm_completion()
    
    # Get cost stats
    stats = llm_service.get_cost_stats()
    if stats:
        print(f"Total cost: ${stats['total_cost']:.4f}")
        print(f"Total requests: {stats['total_requests']}")
        print(f"Recent requests: {len(stats['recent_requests'])}")


async def main():
    """Run all examples"""
    print("=" * 60)
    print("SoloSuccess AI Service - Usage Examples")
    print("=" * 60)
    
    try:
        # Run examples
        await example_llm_completion()
        await example_vector_operations()
        await example_agent_usage()
        await example_mission_contribution()
        await example_cost_tracking()
        
        print("\n" + "=" * 60)
        print("All examples completed successfully!")
        print("=" * 60)
        
    except Exception as e:
        print(f"\nError running examples: {e}")
        print("Make sure you have:")
        print("1. Set up your .env file with API keys")
        print("2. Installed all dependencies (pip install -r requirements.txt)")
        print("3. Started the service if testing API endpoints")


if __name__ == "__main__":
    # Note: This requires the service to be running or proper environment setup
    print("\nNote: These examples require proper API keys in .env file")
    print("Some examples may fail if services are not configured.\n")
    
    asyncio.run(main())
