import random

def analyze_portfolio(data):

    
    # 1. Parse Data
    try:
        # Check for real-time overrides
        real_income = data.get('real_income')
        real_expenses = data.get('real_expenses')

        if real_income is not None:
            income = float(real_income)
        else:
            income = float(data.get('income', 0))

        if real_expenses is not None:
            expenses = float(real_expenses)
        else:
            expenses = (
                float(data.get('rent', 0)) + 
                float(data.get('food', 0)) + 
                float(data.get('transport', 0)) + 
                float(data.get('utilities', 0)) + 
                float(data.get('misc', 0))
            )

        assets = float(data.get('savings', 0)) + float(data.get('fd', 0)) + float(data.get('stocks', 0))
        liabilities = float(data.get('loanAmount', 0)) + float(data.get('creditCardDebt', 0))
        age = int(data.get('age', 30))
        emi = float(data.get('monthlyEmi', 0)) or float(data.get('emi', 0))
        
        savings = income - expenses
        savings_rate = (savings / income) if income > 0 else 0
        dti_ratio = (emi / income) if income > 0 else 0 # Debt-to-Income
    except (ValueError, TypeError):
        return "I couldn't process your financial numbers accurately. Please ensure your profile is complete."

    narrative = []

    # 2. Net Worth & General Health Analysis
    net_worth = assets - liabilities
    if net_worth > 0:
        narrative.append(f"Net Worth Analysis:\nYou are in a positive position with a net worth of ₹{net_worth:,.2f}. Your asset base is building nicely.")
    else:
        narrative.append(f"Net Worth Analysis:\nYour liabilities currently exceed your assets by ₹{abs(net_worth):,.2f}. Focusing on debt reduction should be your primary goal.")

    # 3. Budget & Savings Feedback
    if savings_rate >= 0.20:
        narrative.append(f"Budget Feedback:\nExcellent discipline. You are saving {savings_rate*100:.1f}% of your income. This surplus gives you strong leverage for future investments.")
    elif savings_rate >= 0.10:
        narrative.append(f"Budget Feedback:\nYou are saving {savings_rate*100:.1f}% of your income. This is a healthy start, but try to push towards 20% to accelerate your goals.")
    else:
        narrative.append(f"Budget Feedback:\nYour current savings rate is {savings_rate*100:.1f}%, which is tight. Review your discretionary spending (Food/Misc) to unlock more free cash flow.")

    # 4. Debt Advice
    if dti_ratio > 0.40:
        narrative.append("Debt Advice:\nCaution: Your debt obligations (EMIs) consume over 40% of your income. This is a high-risk zone. Avoid new loans and consider restructuring existing debt.")
    elif dti_ratio > 0:
        narrative.append("Debt Advice:\nYour debt load is manageable. Ensure you are prepaying high-interest loans (like Credit Cards) first to minimize interest leaks.")
    else:
        narrative.append("Debt Advice:\nYou are debt-free or have no significant monthly obligations. This is a fantastic foundation for aggressive wealth compounding.")

    # 5. Actionable Checklist
    checklist = ["Actionable Steps:"]
    if assets < (expenses * 3):
        checklist.append(f"- Build an emergency fund of ₹{expenses*3:,.0f} (3 months expenses).")
    
    if liabilities > 0 and savings > 0:
        checklist.append("- Allocate 50% of your monthly surplus to debt prepayment.")
    
    if savings_rate > 0.20 and assets > (expenses * 6):
        checklist.append("- Consider diversifying your excess savings into index funds or mutual funds.")
        
    if len(checklist) == 1: # Default if no specific triggers
        checklist.append("- Maintain your current trajectory; review your portfolio quarterly.")
        checklist.append("- Look for opportunities to increase your primary income stream.")

    narrative.append("\n".join(checklist))

    # 6. Personality Injection (New Layer)
    intro = ""
    if age < 30:
        intro = f"Strategy Mode: AGGRESSIVE GROWTH (Age {age})\nTime is your biggest asset. Your focus should be on maximizing income and high-growth investments."
    elif age < 50:
        intro = f"Strategy Mode: BALANCED COMPOUNDING (Age {age})\nYou are in your prime earning years. The goal is to balance lifestyle needs with debt reduction and consistent investing."
    else:
        intro = f"Strategy Mode: WEALTH PRESERVATION (Age {age})\nSecurity is paramount. Your focus shifts from high risk to capital protection and liquidity for retirement."

    # Prepend intro to narrative
    narrative.insert(0, intro)

    return "\n\n".join(narrative)
