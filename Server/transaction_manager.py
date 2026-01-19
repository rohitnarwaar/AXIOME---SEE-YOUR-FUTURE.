"""
Transaction Management Module
Handles transaction operations, daily calculations, and budget tracking
"""

from datetime import datetime, timedelta
from typing import List, Dict, Any


def safe_parse_date(date_str: str) -> datetime:
    """Safely parse date string, defaulting to now if invalid"""
    if not date_str:
        return datetime.now()
    try:
        # Handle simple ISO format
        return datetime.fromisoformat(date_str.replace('Z', '+00:00'))
    except ValueError:
        try:
            # Handle other common formats if needed
            return datetime.strptime(date_str, "%Y-%m-%d")
        except ValueError:
            return datetime.now()


def calculate_daily_score(user_data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Calculate daily financial health score (0-100)
    Based on: spending vs budget, savings rate, debt payoff progress
    """
    score = 50  # Base score
    insights = []
    
    # Get user data
    income = float(user_data.get('income', 0))
    expenses = sum([
        float(user_data.get('food', 0)),
        float(user_data.get('rent', 0)),
        float(user_data.get('transport', 0)),
        float(user_data.get('utilities', 0)),
        float(user_data.get('misc', 0)),
    ])
    savings = float(user_data.get('savings', 0))
    
    # Calculate savings rate
    if income > 0:
        savings_rate = ((income - expenses) / income) * 100
        if savings_rate > 30:
            score += 25
            insights.append("Excellent savings rate! You're saving over 30% of your income.")
        elif savings_rate > 20:
            score += 15
            insights.append("Good savings rate at {:.1f}%".format(savings_rate))
        elif savings_rate > 10:
            score += 5
            insights.append("Decent savings, but aim for 20%+")
        else:
            score -= 10
            insights.append("Low savings rate. Try to reduce expenses.")
    
    # Check emergency fund
    monthly_expenses = expenses
    emergency_months = savings / monthly_expenses if monthly_expenses > 0 else 0
    if emergency_months >= 6:
        score += 20
        insights.append("Great! You have 6+ months of emergency fund.")
    elif emergency_months >= 3:
        score += 10
        insights.append("Building good emergency fund.")
    else:
        insights.append("Focus on building emergency fund (3-6 months expenses).")
    
    # Cap score between 0-100
    score = max(0, min(100, score))
    
    return {
        "score": round(score),
        "savingsRate": round(savings_rate, 1) if income > 0 else 0,
        "emergencyMonths": round(emergency_months, 1),
        "insights": insights,
        "trend": "improving" if score > 60 else "stable" if score > 40 else "needs_attention"
    }


def get_daily_summary(transactions: List[Dict]) -> Dict[str, Any]:
    """
    Calculate today's financial summary
    """
    today = datetime.now().date()
    
    today_transactions = []
    for t in transactions:
        dt = safe_parse_date(t.get('date', ''))
        if dt.date() == today:
            today_transactions.append(t)
    
    money_in = sum(t['amount'] for t in today_transactions if t.get('type') == 'income')
    money_out = sum(t['amount'] for t in today_transactions if t.get('type') == 'expense')
    
    return {
        "date": today.isoformat(),
        "moneyIn": round(money_in, 2),
        "moneyOut": round(money_out, 2),
        "net": round(money_in - money_out, 2),
        "transactionCount": len(today_transactions)
    }


def get_weekly_summary(transactions: List[Dict]) -> Dict[str, Any]:
    """
    Calculate this week's financial summary
    """
    today = datetime.now().date()
    week_start = today - timedelta(days=today.weekday())
    
    week_transactions = []
    for t in transactions:
        dt = safe_parse_date(t.get('date', ''))
        if dt.date() >= week_start:
            week_transactions.append(t)
    
    spending_by_category = {}
    for t in week_transactions:
        if t.get('type') == 'expense':
            category = t.get('category', 'Other')
            spending_by_category[category] = spending_by_category.get(category, 0) + t['amount']
    
    # Get top 3 categories
    top_categories = sorted(
        spending_by_category.items(), 
        key=lambda x: x[1], 
        reverse=True
    )[:3]
    
    total_spent = sum(t['amount'] for t in week_transactions if t.get('type') == 'expense')
    
    return {
        "weekStart": week_start.isoformat(),
        "totalSpent": round(total_spent, 2),
        "topCategories": [{"category": cat, "amount": round(amt, 2)} for cat, amt in top_categories],
        "transactionCount": len(week_transactions)
    }


def calculate_budget_status(transactions: List[Dict], budgets: Dict[str, float]) -> Dict[str, Any]:
    """
    Calculate current budget status for each category
    """
    # Get current month's transactions
    today = datetime.now()
    month_start = today.replace(day=1).date()
    
    month_transactions = []
    for t in transactions:
        dt = safe_parse_date(t.get('date', ''))
        if dt.date() >= month_start and t.get('type') == 'expense':
            month_transactions.append(t)
    
    # Calculate spending per category
    spending_by_category = {}
    for t in month_transactions:
        category = t.get('category', 'Other')
        spending_by_category[category] = spending_by_category.get(category, 0) + t['amount']
    
    # Build status for each budget category
    budget_status = {}
    for category, budget in budgets.items():
        spent = spending_by_category.get(category, 0)
        remaining = budget - spent
        percentage = (spent / budget * 100) if budget > 0 else 0
        
        # Determine trend
        if percentage < 50:
            trend = "on_track"
        elif percentage < 80:
            trend = "moderate"
        elif percentage < 100:
            trend = "warning"
        else:
            trend = "over_budget"
        
        budget_status[category] = {
            "budget": round(budget, 2),
            "spent": round(spent, 2),
            "remaining": round(remaining, 2),
            "percentage": round(percentage, 1),
            "trend": trend
        }
    
    return budget_status


def get_recent_transactions(transactions: List[Dict], limit: int = 10) -> List[Dict]:
    """
    Get most recent transactions
    """
    sorted_transactions = sorted(
        transactions,
        key=lambda t: safe_parse_date(t.get('date', '')),
        reverse=True
    )
    return sorted_transactions[:limit]


def add_transaction(
    user_id: str,
    amount: float,
    category: str,
    description: str,
    transaction_type: str = "expense",
    date: str = None,
    payment_method: str = "Cash"
) -> Dict[str, Any]:
    """
    Create a new transaction record
    """
    if date is None:
        date = datetime.now().isoformat()
    
    transaction = {
        "id": f"txn_{int(datetime.now().timestamp() * 1000)}",
        "userId": user_id,
        "amount": round(float(amount), 2),
        "category": category,
        "description": description,
        "type": transaction_type,
        "date": date,
        "paymentMethod": payment_method,
        "createdAt": datetime.now().isoformat()
    }
    
    return transaction
