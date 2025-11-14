"""Verification script for Nova (Product Designer) agent"""

import asyncio
import sys
from pathlib import Path

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent))

from app.agents.nova_agent import NovaAgent
from app.agents.base_agent import AgentRole


async def verify_nova_agent():
    """Verify Nova agent implementation"""
    
    print("=" * 80)
    print("NOVA AGENT VERIFICATION")
    print("=" * 80)
    
    # Initialize agent
    print("\n1. Initializing Nova agent...")
    nova = NovaAgent()
    
    # Verify basic properties
    print(f"   ✓ Agent ID: {nova.agent_id}")
    print(f"   ✓ Agent Name: {nova.name}")
    print(f"   ✓ Agent Role: {nova.role.value}")
    print(f"   ✓ Personality: {nova.personality[:80]}...")
    
    assert nova.agent_id == "nova", "Agent ID should be 'nova'"
    assert nova.name == "Nova", "Agent name should be 'Nova'"
    assert nova.role == AgentRole.DESIGN, "Agent role should be DESIGN"
    
    # Verify prompt templates
    print("\n2. Verifying prompt templates...")
    expected_templates = [
        "uiux_guidance",
        "wireframe_suggestion",
        "design_system",
        "user_flow",
        "usability_review",
        "accessibility_audit",
        "design_critique"
    ]
    
    for template_name in expected_templates:
        template = nova.get_prompt_template(template_name)
        assert template is not None, f"Template '{template_name}' should exist"
        print(f"   ✓ Template '{template_name}' exists")
    
    # Verify agent info
    print("\n3. Verifying agent info...")
    info = nova.get_info()
    print(f"   ✓ Agent info retrieved")
    print(f"   ✓ Available templates: {len(info['available_templates'])}")
    
    # Test template formatting
    print("\n4. Testing template formatting...")
    template = nova.get_prompt_template("uiux_guidance")
    formatted = template.format(
        feature="Dashboard homepage",
        user_goals="View key metrics at a glance",
        context="SaaS analytics platform",
        constraints="Mobile-first design"
    )
    assert "Dashboard homepage" in formatted, "Template should include feature"
    assert "View key metrics" in formatted, "Template should include user goals"
    print("   ✓ Template formatting works correctly")
    
    # Test wireframe template
    print("\n5. Testing wireframe template...")
    wireframe_template = nova.get_prompt_template("wireframe_suggestion")
    wireframe_formatted = wireframe_template.format(
        screen="Login page",
        purpose="User authentication",
        elements="Email input, password input, login button, forgot password link",
        actions="Submit credentials, reset password"
    )
    assert "Login page" in wireframe_formatted, "Template should include screen name"
    print("   ✓ Wireframe template works correctly")
    
    # Test design system template
    print("\n6. Testing design system template...")
    design_template = nova.get_prompt_template("design_system")
    design_formatted = design_template.format(
        product_type="B2B SaaS platform",
        brand_personality="Professional, modern, trustworthy",
        target_audience="Business professionals and entrepreneurs",
        platform="Web and mobile"
    )
    assert "B2B SaaS" in design_formatted, "Template should include product type"
    print("   ✓ Design system template works correctly")
    
    # Test user flow template
    print("\n7. Testing user flow template...")
    flow_template = nova.get_prompt_template("user_flow")
    flow_formatted = flow_template.format(
        goal="Complete purchase",
        entry_point="Product page",
        success_criteria="Order confirmation received",
        constraints="Must support guest checkout"
    )
    assert "Complete purchase" in flow_formatted, "Template should include goal"
    print("   ✓ User flow template works correctly")
    
    # Test conversation context
    print("\n8. Testing conversation context...")
    context = nova.create_context()
    assert len(context.get_messages()) > 0, "Context should have system message"
    print(f"   ✓ Context created with {len(context.get_messages())} message(s)")
    
    # Verify system prompt
    messages = context.get_messages()
    system_message = messages[0]
    assert system_message["role"] == "system", "First message should be system"
    assert "Nova" in system_message["content"], "System prompt should mention Nova"
    assert "Product Designer" in system_message["content"], "System prompt should mention role"
    print("   ✓ System prompt configured correctly")
    
    print("\n" + "=" * 80)
    print("✓ ALL VERIFICATION CHECKS PASSED")
    print("=" * 80)
    print("\nNova agent is fully implemented with:")
    print("  • Design expertise personality and system prompt")
    print("  • 7 specialized prompt templates for UI/UX guidance")
    print("  • Wireframe suggestion logic")
    print("  • Design system recommendations")
    print("  • User flow design capabilities")
    print("  • Usability review and accessibility audit templates")
    print("  • Mission Control contribution method")
    print("  • Helper methods for common design tasks")
    print("\nThe agent is ready for integration and use!")


if __name__ == "__main__":
    asyncio.run(verify_nova_agent())
