"""
Gamification Module
Handles streaks, achievements, and challenges
"""

from datetime import datetime, timedelta
from typing import List, Dict, Any


def calculate_streaks(transactions: List[Dict]) -> Dict[str, Any]:
    """Calculate user streaks"""
    if not transactions:
        return {
            "savingsStreak": 0,
            "budgetStreak": 0,
            "trackingStreak": 0,
            "noSpendDays": 0
        }
    
    # Sort transactions by date
    sorted_txns = sorted(transactions, key=lambda t: t.get('date', ''), reverse=True)
    
    # Tracking streak - consecutive days with transactions
    tracking_streak = 0
    current_date = datetime.now().date()
    
    for i in range(30):  # Check last 30 days
        check_date = current_date - timedelta(days=i)
        has_transaction = any(
            datetime.fromisoformat(t.get('date', '')).date() == check_date 
            for t in sorted_txns
        )
        if has_transaction:
            tracking_streak += 1
        else:
            break
    
    # Savings streak - days where income > expenses
    savings_streak = 0
    for i in range(30):
        check_date = current_date - timedelta(days=i)
        day_txns = [t for t in sorted_txns if datetime.fromisoformat(t.get('date', '')).date() == check_date]
        
        income = sum(t['amount'] for t in day_txns if t.get('type') == 'income')
        expenses = sum(t['amount'] for t in day_txns if t.get('type') == 'expense')
        
        if income > expenses:
            savings_streak += 1
        else:
            break
    
    return {
        "savingsStreak": savings_streak,
        "budgetStreak": 0,  # Would need budget data
        "trackingStreak": tracking_streak,
        "noSpendDays": 0,  # Would need to track
        "longestSavingsStreak": tracking_streak  # Simplified
    }


def check_achievements(user_data: Dict, transactions: List[Dict], goals: List[Dict]) -> List[Dict]:
    """Check which achievements user has earned"""
    achievements = []
    
    # First Week Tracked
    if len(transactions) >= 7:
        achievements.append({
            "id": "first_week",
            "name": "First Week Tracked",
            "description": "Logged expenses for 7 days",
            "icon": "🎖️",
            "unlockedAt": datetime.now().isoformat()
        })
    
    # Saved 10k
    total_savings = user_data.get('savings', 0)
    if total_savings >= 10000:
        achievements.append({
            "id": "saved_10k",
            "name": "First 10K",
            "description": "Saved ₹10,000",
            "icon": "💰",
            "unlockedAt": datetime.now().isoformat()
        })
    
    # Goal Completed
    completed_goals = [g for g in goals if g.get('status') == 'completed']
    if completed_goals:
        achievements.append({
            "id": "goal_complete",
            "name": "Goal Achiever",
            "description": "Completed your first savings goal",
            "icon": "🎯",
            "unlockedAt": datetime.now().isoformat()
        })
    
    # Transaction Master
    if len(transactions) >= 100:
        achievements.append({
            "id": "transaction_master",
            "name": "Transaction Master",
            "description": "Logged 100 transactions",
            "icon": "📊",
            "unlockedAt": datetime.now().isoformat()
        })
    
    return achievements


def get_active_challenges() -> List[Dict]:
    """Get current weekly/monthly challenges"""
    return [
        {
            "id": "weekly_budget",
            "name": "Budget Champion",
            "description": "Stay under budget for 7 days straight",
            "type": "weekly",
            "target": 7,
            "current": 0,
            "reward": 100,
            "expiresAt": (datetime.now() + timedelta(days=7)).isoformat()
        },
        {
            "id": "save_5k",
            "name": "Saver",
            "description": "Save ₹5,000 this month",
            "type": "monthly",
            "target": 5000,
            "current": 0,
            "reward": 200,
            "expiresAt": (datetime.now().replace(day=1) + timedelta(days=32)).replace(day=1).isoformat()
        },
        {
            "id": "no_dining_out",
            "name": "Home Chef",
            "description": "Don't spend on dining out for 3 days",
            "type": "challenge",
            "target": 3,
            "current": 0,
            "reward": 50,
            "expiresAt": (datetime.now() + timedelta(days=3)).isoformat()
        }
    ]
