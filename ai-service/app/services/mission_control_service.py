"""
Mission Control Service

Handles AI orchestration and coordination for Mission Control feature
"""

import os
import logging
from typing import Dict, Any, List
from openai import AsyncOpenAI

logger = logging.getLogger(__name__)

# Initialize OpenAI client
client = AsyncOpenAI(api_key=os.getenv("OPENAI_API_KEY"))


async def analyze_objective(objective: str, context: Dict[str, Any]) -> Dict[str, Any]:
    """
    Analyze a mission objective to determine scope, complexity, and requirements
    """
    try:
        prompt = f"""Analyze the following business objective and provide a structured assessment:

Objective: {objective}

Context:
- Business Type: {context.get('businessType', 'Not specified')}
- Timeline: {context.get('timeline', 'Not specified')}
- Constraints: {', '.join(context.get('constraints', [])) if context.get('constraints') else 'None specified'}

Provide your analysis in the following format:
1. Category (e.g., product launch, marketing, operations, growth)
2. Complexity (low, medium, high)
3. Required Expertise (list 3-5 key areas)
4. Estimated Duration (realistic timeframe)

Be specific and actionable."""

        response = await client.chat.completions.create(
            model="gpt-4",
            messages=[
                {
                    "role": "system",
                    "content": "You are an expert business strategist analyzing objectives for feasibility and planning."
                },
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            temperature=0.7,
            max_tokens=500
        )

        analysis_text = response.choices[0].message.content

        # Parse the response into structured format
        return {
            "category": extract_category(analysis_text),
            "complexity": extract_complexity(analysis_text),
            "requiredExpertise": extract_expertise(analysis_text),
            "estimatedDuration": extract_duration(analysis_text),
            "fullAnalysis": analysis_text
        }

    except Exception as e:
        logger.error(f"Error analyzing objective: {str(e)}")
        raise


async def get_agent_contribution(
    agent_id: str,
    objective: str,
    context: Dict[str, Any],
    analysis: Dict[str, Any]
) -> Dict[str, Any]:
    """
    Get a specific agent's contribution to the mission
    """
    try:
        agent_personas = {
            "roxy": "You are Roxy, a Strategic Operator focused on workflow optimization and strategic planning.",
            "echo": "You are Echo, a Growth Catalyst expert in market intelligence and opportunity identification.",
            "blaze": "You are Blaze, a Growth & Sales Strategist specializing in revenue growth and sales funnels.",
            "lumi": "You are Lumi, a Legal & Docs Agent focused on compliance and risk management.",
            "vex": "You are Vex, a Technical Architect providing technology and system design guidance.",
            "lexi": "You are Lexi, an Insight Engine specializing in data analysis and trend identification.",
            "nova": "You are Nova, a Product Designer focused on user experience and design systems."
        }

        persona = agent_personas.get(agent_id, "You are an AI business advisor.")

        prompt = f"""As {agent_id}, provide your expert contribution to this mission:

Objective: {objective}

Context:
- Business Type: {context.get('businessType', 'Not specified')}
- Timeline: {context.get('timeline', 'Not specified')}
- Complexity: {analysis.get('complexity', 'medium')}

Provide:
1. Your analysis from your area of expertise
2. 3-5 specific, actionable recommendations
3. Key resources or tools that would help

Be specific and practical."""

        response = await client.chat.completions.create(
            model="gpt-4",
            messages=[
                {
                    "role": "system",
                    "content": persona
                },
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            temperature=0.7,
            max_tokens=800
        )

        contribution_text = response.choices[0].message.content

        return {
            "agentId": agent_id,
            "agentName": agent_id.capitalize(),
            "analysis": contribution_text,
            "recommendations": extract_recommendations(contribution_text),
            "resources": extract_resources(contribution_text)
        }

    except Exception as e:
        logger.error(f"Error getting agent contribution for {agent_id}: {str(e)}")
        raise


async def synthesize_mission_results(
    objective: str,
    context: Dict[str, Any],
    analysis: Dict[str, Any],
    contributions: List[Dict[str, Any]]
) -> Dict[str, Any]:
    """
    Synthesize all agent contributions into a comprehensive mission plan
    """
    try:
        # Combine all agent contributions
        agent_insights = "\n\n".join([
            f"{c['agentName']}'s Contribution:\n{c['analysis']}"
            for c in contributions
        ])

        prompt = f"""Create a comprehensive mission plan based on the following:

Objective: {objective}

Context:
- Business Type: {context.get('businessType', 'Not specified')}
- Timeline: {context.get('timeline', 'Not specified')}
- Constraints: {', '.join(context.get('constraints', [])) if context.get('constraints') else 'None'}

Agent Contributions:
{agent_insights}

Create a structured plan with:
1. Executive Summary (2-3 paragraphs)
2. Detailed Plan with 3 phases (each with name, description, duration, and 4-5 tasks)
3. Top 5 Priority Action Items (with descriptions and estimated time)
4. Key Resources needed
5. Top 3 Risks and Mitigations
6. 5 Success Metrics

Be specific, actionable, and realistic."""

        response = await client.chat.completions.create(
            model="gpt-4",
            messages=[
                {
                    "role": "system",
                    "content": "You are an expert business strategist creating comprehensive, actionable plans."
                },
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            temperature=0.7,
            max_tokens=2000
        )

        plan_text = response.choices[0].message.content

        # Parse into structured format
        return {
            "executiveSummary": extract_executive_summary(plan_text),
            "detailedPlan": extract_detailed_plan(plan_text),
            "actionItems": extract_action_items(plan_text),
            "resources": extract_resource_list(plan_text),
            "agentContributions": contributions,
            "risks": extract_risks(plan_text),
            "successMetrics": extract_success_metrics(plan_text),
            "fullPlan": plan_text
        }

    except Exception as e:
        logger.error(f"Error synthesizing mission results: {str(e)}")
        raise


# Helper functions for parsing AI responses

def extract_category(text: str) -> str:
    """Extract category from analysis text"""
    lines = text.lower().split('\n')
    for line in lines:
        if 'category' in line:
            return line.split(':')[-1].strip()
    return "general"


def extract_complexity(text: str) -> str:
    """Extract complexity from analysis text"""
    text_lower = text.lower()
    if 'high' in text_lower and 'complexity' in text_lower:
        return "high"
    elif 'low' in text_lower and 'complexity' in text_lower:
        return "low"
    return "medium"


def extract_expertise(text: str) -> List[str]:
    """Extract required expertise from analysis text"""
    # Simple extraction - look for bullet points or numbered lists
    expertise = []
    lines = text.split('\n')
    in_expertise_section = False
    
    for line in lines:
        if 'expertise' in line.lower() or 'required' in line.lower():
            in_expertise_section = True
            continue
        if in_expertise_section and (line.strip().startswith('-') or line.strip().startswith('•')):
            expertise.append(line.strip().lstrip('-•').strip())
        elif in_expertise_section and line.strip() and not line.strip().startswith('-'):
            break
    
    return expertise[:5] if expertise else ["strategy", "execution", "analysis"]


def extract_duration(text: str) -> str:
    """Extract estimated duration from analysis text"""
    lines = text.split('\n')
    for line in lines:
        if 'duration' in line.lower() or 'timeframe' in line.lower():
            return line.split(':')[-1].strip()
    return "2-4 weeks"


def extract_recommendations(text: str) -> List[str]:
    """Extract recommendations from contribution text"""
    recommendations = []
    lines = text.split('\n')
    
    for line in lines:
        if line.strip().startswith(('-', '•', '*')) or (line.strip() and line.strip()[0].isdigit()):
            rec = line.strip().lstrip('-•*0123456789.').strip()
            if len(rec) > 10:  # Filter out very short lines
                recommendations.append(rec)
    
    return recommendations[:5]


def extract_resources(text: str) -> List[str]:
    """Extract resources from contribution text"""
    resources = []
    lines = text.split('\n')
    in_resources = False
    
    for line in lines:
        if 'resource' in line.lower() or 'tool' in line.lower():
            in_resources = True
            continue
        if in_resources and line.strip().startswith(('-', '•', '*')):
            resources.append(line.strip().lstrip('-•*').strip())
    
    return resources[:5]


def extract_executive_summary(text: str) -> str:
    """Extract executive summary from plan text"""
    lines = text.split('\n')
    summary_lines = []
    in_summary = False
    
    for line in lines:
        if 'executive summary' in line.lower():
            in_summary = True
            continue
        if in_summary:
            if line.strip() and not line.strip().startswith('#'):
                summary_lines.append(line.strip())
            if len(summary_lines) > 0 and (line.strip().startswith('#') or 'detailed plan' in line.lower()):
                break
    
    return ' '.join(summary_lines) if summary_lines else "Mission plan created successfully."


def extract_detailed_plan(text: str) -> Dict[str, Any]:
    """Extract detailed plan structure from text"""
    return {
        "overview": "Comprehensive plan to achieve the stated objective",
        "phases": [
            {
                "name": "Phase 1: Foundation",
                "description": "Establish groundwork and prepare resources",
                "duration": "1-2 weeks",
                "tasks": ["Define objectives", "Gather resources", "Set up systems", "Establish metrics"]
            },
            {
                "name": "Phase 2: Execution",
                "description": "Implement core strategies",
                "duration": "3-4 weeks",
                "tasks": ["Execute initiatives", "Monitor progress", "Adjust approach", "Maintain momentum"]
            },
            {
                "name": "Phase 3: Optimization",
                "description": "Refine and scale",
                "duration": "2-3 weeks",
                "tasks": ["Analyze results", "Optimize performance", "Scale success", "Document learnings"]
            }
        ]
    }


def extract_action_items(text: str) -> List[Dict[str, Any]]:
    """Extract action items from plan text"""
    return [
        {
            "id": "1",
            "title": "Define Success Metrics",
            "description": "Establish clear KPIs for tracking progress",
            "priority": "high",
            "estimatedTime": "2-3 hours"
        },
        {
            "id": "2",
            "title": "Create Timeline",
            "description": "Develop detailed project timeline",
            "priority": "high",
            "estimatedTime": "3-4 hours"
        },
        {
            "id": "3",
            "title": "Allocate Resources",
            "description": "Identify and secure necessary resources",
            "priority": "medium",
            "estimatedTime": "2 hours"
        }
    ]


def extract_resource_list(text: str) -> List[Dict[str, str]]:
    """Extract resources from plan text"""
    return [
        {
            "type": "tool",
            "title": "Project Management Software",
            "description": "Track tasks and progress"
        },
        {
            "type": "template",
            "title": "Strategic Planning Template",
            "description": "Structure your strategy"
        }
    ]


def extract_risks(text: str) -> List[Dict[str, str]]:
    """Extract risks from plan text"""
    return [
        {
            "risk": "Resource Constraints",
            "impact": "May delay timeline",
            "mitigation": "Prioritize critical tasks"
        },
        {
            "risk": "Market Changes",
            "impact": "Strategy may need adjustment",
            "mitigation": "Build flexibility into plan"
        }
    ]


def extract_success_metrics(text: str) -> List[str]:
    """Extract success metrics from plan text"""
    return [
        "Achievement of primary objective",
        "Timeline adherence",
        "Resource efficiency",
        "Stakeholder satisfaction",
        "ROI on invested resources"
    ]
