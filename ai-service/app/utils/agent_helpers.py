"""Helper utilities for agent operations"""

from typing import List, Dict, Any
import re


def extract_action_items(text: str) -> List[str]:
    """
    Extract action items from text
    
    Looks for patterns like:
    - Action: ...
    - TODO: ...
    - Next step: ...
    - [ ] ...
    """
    action_items = []
    
    patterns = [
        r"(?:Action|TODO|Next step):\s*(.+)",
        r"\[\s*\]\s*(.+)",
        r"^\d+\.\s*(.+)",
        r"^[-•]\s*(.+)"
    ]
    
    lines = text.split("\n")
    for line in lines:
        line = line.strip()
        for pattern in patterns:
            match = re.match(pattern, line, re.IGNORECASE)
            if match:
                action_items.append(match.group(1).strip())
                break
    
    return action_items


def extract_key_points(text: str, max_points: int = 5) -> List[str]:
    """
    Extract key points from text
    
    Looks for bullet points, numbered lists, or sentences with emphasis
    """
    key_points = []
    
    # Look for bullet points and numbered lists
    lines = text.split("\n")
    for line in lines:
        line = line.strip()
        if line and (
            line.startswith("-") or
            line.startswith("•") or
            line.startswith("*") or
            (line[0].isdigit() and "." in line[:3])
        ):
            # Clean up the line
            cleaned = re.sub(r"^[-•*\d.)\s]+", "", line).strip()
            if cleaned:
                key_points.append(cleaned)
    
    # If no bullet points found, extract sentences with keywords
    if not key_points:
        sentences = re.split(r"[.!?]+", text)
        keywords = ["important", "key", "critical", "essential", "must", "should"]
        
        for sentence in sentences:
            sentence = sentence.strip()
            if any(keyword in sentence.lower() for keyword in keywords):
                key_points.append(sentence)
    
    return key_points[:max_points]


def format_structured_output(
    title: str,
    sections: Dict[str, Any],
    include_summary: bool = True
) -> str:
    """
    Format structured output with sections
    
    Args:
        title: Document title
        sections: Dictionary of section titles and content
        include_summary: Whether to include a summary section
    
    Returns:
        Formatted markdown string
    """
    output = [f"# {title}\n"]
    
    if include_summary and "summary" in sections:
        output.append(f"## Summary\n\n{sections['summary']}\n")
    
    for section_title, content in sections.items():
        if section_title.lower() == "summary" and include_summary:
            continue
        
        output.append(f"## {section_title}\n")
        
        if isinstance(content, list):
            for item in content:
                output.append(f"- {item}")
            output.append("")
        elif isinstance(content, dict):
            for key, value in content.items():
                output.append(f"### {key}\n\n{value}\n")
        else:
            output.append(f"{content}\n")
    
    return "\n".join(output)


def calculate_confidence_score(
    response_length: int,
    has_sources: bool = False,
    has_examples: bool = False,
    has_data: bool = False
) -> float:
    """
    Calculate a confidence score for an agent response
    
    Args:
        response_length: Length of the response in characters
        has_sources: Whether response includes sources/citations
        has_examples: Whether response includes examples
        has_data: Whether response includes data/statistics
    
    Returns:
        Confidence score between 0.0 and 1.0
    """
    score = 0.5  # Base score
    
    # Length factor (longer responses tend to be more detailed)
    if response_length > 500:
        score += 0.1
    if response_length > 1000:
        score += 0.1
    
    # Quality indicators
    if has_sources:
        score += 0.1
    if has_examples:
        score += 0.1
    if has_data:
        score += 0.1
    
    return min(score, 1.0)


def merge_agent_contributions(
    contributions: List[Dict[str, Any]]
) -> Dict[str, Any]:
    """
    Merge contributions from multiple agents
    
    Args:
        contributions: List of agent contribution dictionaries
    
    Returns:
        Merged contribution with combined insights
    """
    merged = {
        "agents": [c["agent_id"] for c in contributions],
        "combined_content": [],
        "all_recommendations": [],
        "consensus_points": [],
        "diverse_perspectives": []
    }
    
    # Collect all content and recommendations
    for contribution in contributions:
        merged["combined_content"].append({
            "agent": contribution["agent_name"],
            "content": contribution.get("content", "")
        })
        
        if "recommendations" in contribution:
            merged["all_recommendations"].extend(contribution["recommendations"])
    
    # Find consensus (recommendations mentioned by multiple agents)
    recommendation_counts = {}
    for rec in merged["all_recommendations"]:
        rec_lower = rec.lower()
        recommendation_counts[rec_lower] = recommendation_counts.get(rec_lower, 0) + 1
    
    # Consensus points (mentioned by 2+ agents)
    merged["consensus_points"] = [
        rec for rec, count in recommendation_counts.items()
        if count >= 2
    ]
    
    # Diverse perspectives (unique recommendations)
    merged["diverse_perspectives"] = [
        rec for rec, count in recommendation_counts.items()
        if count == 1
    ]
    
    return merged
