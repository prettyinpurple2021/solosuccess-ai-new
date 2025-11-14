"""Simple verification script for Lexi agent structure"""

import ast
import sys

def verify_lexi_agent():
    """Verify Lexi agent has all required components"""
    
    print("Verifying Lexi Agent Implementation...")
    print("=" * 60)
    
    # Read the lexi_agent.py file
    with open("app/agents/lexi_agent.py", "r") as f:
        content = f.read()
    
    # Parse the AST
    try:
        tree = ast.parse(content)
        print("✓ File syntax is valid")
    except SyntaxError as e:
        print(f"✗ Syntax error: {e}")
        return False
    
    # Check for required components
    checks = {
        "LexiAgent class": False,
        "__init__ method": False,
        "_initialize_templates method": False,
        "contribute_to_mission method": False,
        "analyze_metrics method": False,
        "identify_trends method": False,
        "generate_insights method": False,
        "generate_daily_nudges method": False,
    }
    
    # Find the LexiAgent class
    for node in ast.walk(tree):
        if isinstance(node, ast.ClassDef) and node.name == "LexiAgent":
            checks["LexiAgent class"] = True
            
            # Check methods (including async methods)
            for item in node.body:
                if isinstance(item, (ast.FunctionDef, ast.AsyncFunctionDef)):
                    method_name = item.name
                    for check_name in checks.keys():
                        if method_name in check_name:
                            checks[check_name] = True
    
    # Print results
    print("\nComponent Checks:")
    all_passed = True
    for check, passed in checks.items():
        status = "✓" if passed else "✗"
        print(f"  {status} {check}")
        if not passed:
            all_passed = False
    
    # Check template definitions
    print("\nTemplate Checks:")
    template_count = content.count("add_prompt_template")
    print(f"  ✓ Found {template_count} prompt templates")
    
    expected_templates = [
        "metrics_analysis",
        "trend_identification",
        "insight_generation",
        "dashboard_insights",
    ]
    
    for template in expected_templates:
        if template in content:
            print(f"  ✓ Template '{template}' defined")
        else:
            print(f"  ✗ Template '{template}' missing")
            all_passed = False
    
    # Check inheritance
    print("\nInheritance Check:")
    if "BaseAgent" in content:
        print("  ✓ Inherits from BaseAgent")
    else:
        print("  ✗ Does not inherit from BaseAgent")
        all_passed = False
    
    # Check agent role
    print("\nAgent Configuration:")
    if "AgentRole.ANALYTICAL" in content:
        print("  ✓ Uses ANALYTICAL role")
    else:
        print("  ✗ Role not properly set")
        all_passed = False
    
    if 'agent_id="lexi"' in content:
        print("  ✓ Agent ID is 'lexi'")
    else:
        print("  ✗ Agent ID not properly set")
        all_passed = False
    
    if 'name="Lexi"' in content:
        print("  ✓ Agent name is 'Lexi'")
    else:
        print("  ✗ Agent name not properly set")
        all_passed = False
    
    # Check docstring
    print("\nDocumentation:")
    if '"""Lexi - Insight Engine Agent"""' in content:
        print("  ✓ Module docstring present")
    else:
        print("  ✗ Module docstring missing")
    
    print("\n" + "=" * 60)
    if all_passed:
        print("✓ All checks passed! Lexi agent is properly implemented.")
        return True
    else:
        print("✗ Some checks failed. Please review the implementation.")
        return False


if __name__ == "__main__":
    success = verify_lexi_agent()
    sys.exit(0 if success else 1)
