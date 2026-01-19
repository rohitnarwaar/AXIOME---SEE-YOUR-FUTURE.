"""
Goals Management Module
Handles savings goals, milestones, and progress tracking
"""

from datetime import datetime, timedelta
from typing import List, Dict, Any


def create_goal(
    user_id: str,
    name: str,
    target_amount: float,
    current_amount: float = 0,
    deadline: str = None,
    priority: str = "medium"
) -> Dict[str, Any]:
    """Create a new savings goal"""
    goal_id = f"goal_{int(datetime.now().timestamp() * 1000)}"
    
    # Calculate milestones (25%, 50%, 75%, 100%)
    milestones = [
        target_amount * 0.25,
        target_amount * 0.50,
        target_amount * 0.75,
        target_amount
    ]
    
    # Calculate monthly contribution needed
    if deadline:
        deadline_date = datetime.fromisoformat(deadline)
        months_remaining = max(1, (deadline_date - datetime.now()).days / 30)
        monthly_needed = (target_amount - current_amount) / months_remaining
    else:
        monthly_needed = 0
    
    return {
        "id": goal_id,
        "userId": user_id,
        "name": name,
        "targetAmount": round(target_amount, 2),
        "currentAmount": round(current_amount, 2),
        "deadline": deadline,
        "priority": priority,
        "status": "active",
        "milestones": [round(m, 2) for m in milestones],
        "monthlyContributionNeeded": round(monthly_needed, 2),
        "progress": round((current_amount / target_amount * 100), 1) if target_amount > 0 else 0,
        "createdAt": datetime.now().isoformat()
    }


def update_goal_progress(goal: Dict, new_amount: float) -> Dict[str, Any]:
    """Update goal with new current amount"""
    goal["currentAmount"] = round(new_amount, 2)
    goal["progress"] = round((new_amount / goal["targetAmount"] * 100), 1) if goal["targetAmount"] > 0 else 0
    
    # Check if goal completed
    if new_amount >= goal["targetAmount"]:
        goal["status"] = "completed"
        goal["completedAt"] = datetime.now().isoformat()
    
    return goal


def get_goal_projection(goal: Dict) -> Dict[str, Any]:
    """Calculate when goal will be reached at current pace"""
    if goal["status"] == "completed":
        return {
            "daysToCompletion": 0,
            "projectedDate": goal.get("completedAt", ""),
            "onTrack": True
        }
    
    remaining = goal["targetAmount"] - goal["currentAmount"]
    monthly_contribution = goal.get("monthlyContributionNeeded", 0)
    
    if monthly_contribution <= 0:
        return {
            "daysToCompletion": -1,
            "projectedDate": None,
            "onTrack": False
        }
    
    months_needed = remaining / monthly_contribution
    projected_date = datetime.now() + timedelta(days=months_needed * 30)
    
    # Check if on track
    if goal.get("deadline"):
        deadline = datetime.fromisoformat(goal["deadline"])
        on_track = projected_date <= deadline
    else:
        on_track = True
    
    return {
        "daysToCompletion": int(months_needed * 30),
        "projectedDate": projected_date.isoformat(),
        "onTrack": on_track
    }
