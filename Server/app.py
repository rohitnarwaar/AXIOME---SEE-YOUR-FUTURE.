import os
from flask import Flask, request, jsonify, make_response
from dotenv import load_dotenv
from datetime import datetime, timedelta

from forecast_module import (
    forecast_savings,
    forecast_loan_payoff,
    forecast_retirement_corpus,
    forecast_spending_clusters,
)

load_dotenv()




app = Flask(__name__)

# Manual CORS - no library
@app.after_request
def after_request(response):
    response.headers['Access-Control-Allow-Origin'] = '*'
    response.headers['Access-Control-Allow-Headers'] = '*'
    response.headers['Access-Control-Allow-Methods'] = '*'
    response.headers['Access-Control-Max-Age'] = '3600'
    return response

# Handle all OPTIONS requests
@app.route('/', defaults={'path': ''}, methods=['OPTIONS'])
@app.route('/<path:path>', methods=['OPTIONS'])
def options_handler(path=''):
    print(f"OPTIONS request received for path: /{path}")
    response = make_response('', 200)
    response.headers['Access-Control-Allow-Origin'] = '*'
    response.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization'
    response.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS'
    print(f"Returning 200 OK with CORS headers for /{path}")
    return response

# ---------- Health ----------
@app.route("/health", methods=["GET"])
def health():
    return jsonify({"ok": True}), 200

# ---------- Savings forecast ----------
@app.route("/forecast", methods=["POST"])
def forecast_route():
    try:
        data = request.get_json(force=True) or {}
        monthly_saving = float(data.get("monthlySaving", 0))
        months = int(data.get("months", 120))
        if months <= 0:
            return jsonify({"error": "Invalid inputs"}), 400

        series = forecast_savings(monthly_saving, months=months)
        return jsonify({"series": series}), 200
    except Exception as e:
        import traceback
        print("❌ ERROR in forecast_route:")
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500

# ---------- Loan payoff ----------
@app.route("/loan-payoff", methods=["POST"])
def loan_payoff_route():
    try:
        data = request.get_json(force=True) or {}

        principal = float(data.get("principal", 0))
        annual_interest_rate = float(
            data.get("annual_interest_rate") or data.get("annualInterestRate") or 0
        )
        monthly_emi = float(
            data.get("monthly_emi") or data.get("monthlyEmi") or 0
        )

        if principal <= 0 or annual_interest_rate <= 0 or monthly_emi <= 0:
            return jsonify({"error": "Invalid inputs"}), 400

        timeline = forecast_loan_payoff(
            loan_amount=principal,
            interest_rate=annual_interest_rate,
            monthly_emi=monthly_emi,
        )

        return jsonify({"timeline": timeline}), 200

    except Exception as e:
        import traceback
        print("❌ ERROR in loan_payoff_route:")
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500


# ---------- Retirement corpus ----------
@app.route("/retirement", methods=["POST"])
def retirement_route():
    try:
        data = request.get_json(force=True) or {}
        current_savings = float(data.get("currentSavings", 0))
        monthly_contribution = float(data.get("monthlyContribution", 0))
        annual_return_rate = float(data.get("annualReturnRate", 0.08))
        months = int(data.get("months", 360))  # 30 years default

        if current_savings < 0 or monthly_contribution < 0 or months <= 0:
            return jsonify({"error": "Invalid inputs"}), 400

        corpus = forecast_retirement_corpus(
            current_savings=current_savings,
            monthly_contribution=monthly_contribution,
            annual_return_rate=annual_return_rate,
            months=months,
        )
        return jsonify({"corpus": corpus}), 200
    except Exception as e:
        import traceback
        print("❌ ERROR in retirement_route:")
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500

# ---------- Spending Clusters ----------
@app.route("/analyze/clusters", methods=["POST"])
def clusters_route():
    try:
        data = request.get_json(force=True) or {}
        # User sends: {"Rent": 2000, "Food": 500, ...}
        expenses = data.get("expenses", {})
        
        clusters = forecast_spending_clusters(expenses)
        return jsonify({"clusters": clusters}), 200
    except Exception as e:
        import traceback
        print("❌ ERROR in clusters_route:")
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500

# ---------- AI Narrative (Groq) ----------
@app.route("/analyze", methods=["POST"])
def analyze_route():
    try:
        data = request.get_json(force=True) or {}
        context = data.get("context", {})
        
        # Use local logic engine
        from reasoning_engine import analyze_portfolio
        summary = analyze_portfolio(context)
        
        return jsonify({"summary": summary}), 200

    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500

# ---------- Daily Insights ----------
@app.route("/insights/daily", methods=["POST"])
def daily_insights_route():
    try:
        data = request.get_json(force=True) or {}
        user_data = data.get("userData", {})
        transactions = data.get("transactions", [])
        
        from transaction_manager import calculate_daily_score, get_daily_summary, get_weekly_summary
        
        daily_score = calculate_daily_score(user_data)
        daily_summary = get_daily_summary(transactions)
        weekly_summary = get_weekly_summary(transactions)
        
        return jsonify({
            "dailyScore": daily_score,
            "todaySummary": daily_summary,
            "weeklySummary": weekly_summary
        }), 200
    except Exception as e:
        import traceback
        print("❌ ERROR in daily_insights_route:")
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500

# ---------- Budget Status ----------
@app.route("/budget/status", methods=["POST"])
def budget_status_route():
    try:
        data = request.get_json(force=True) or {}
        transactions = data.get("transactions", [])
        budgets = data.get("budgets", {})
        
        from transaction_manager import calculate_budget_status
        
        status = calculate_budget_status(transactions, budgets)
        return jsonify({"budgets": status}), 200
    except Exception as e:
        import traceback
        print("❌ ERROR in budget_status_route:")
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500

# ---------- Transactions ----------
@app.route("/transactions/add", methods=["POST"])
def add_transaction_route():
    try:
        data = request.get_json(force=True) or {}
        user_id = data.get("userId", "")
        amount = float(data.get("amount", 0))
        category = data.get("category", "Other")
        description = data.get("description", "")
        transaction_type = data.get("type", "expense")
        date = data.get("date")
        payment_method = data.get("paymentMethod", "Cash")
        
        if not user_id or amount <= 0:
            return jsonify({"error": "Invalid transaction data"}), 400
        
        from transaction_manager import add_transaction
        
        transaction = add_transaction(
            user_id=user_id,
            amount=amount,
            category=category,
            description=description,
            transaction_type=transaction_type,
            date=date,
            payment_method=payment_method
        )
        
        return jsonify({"transaction": transaction}), 201
    except Exception as e:
        import traceback
        print("❌ ERROR in add_transaction_route:")
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500

@app.route("/transactions/recent", methods=["POST"])
def recent_transactions_route():
    try:
        data = request.get_json(force=True) or {}
        transactions = data.get("transactions", [])
        limit = int(data.get("limit", 10))
        
        from transaction_manager import get_recent_transactions
        
        recent = get_recent_transactions(transactions, limit)
        return jsonify({"transactions": recent}), 200
    except Exception as e:
        import traceback
        print("❌ ERROR in recent_transactions_route:")
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500

# ---------- Goals ----------
@app.route("/goals/create", methods=["POST"])
def create_goal_route():
    try:
        data = request.get_json(force=True) or {}
        from goals_manager import create_goal
        
        goal = create_goal(
            user_id=data.get("userId", ""),
            name=data.get("name", ""),
            target_amount=float(data.get("targetAmount", 0)),
            current_amount=float(data.get("currentAmount", 0)),
            deadline=data.get("deadline"),
            priority=data.get("priority", "medium")
        )
        
        return jsonify({"goal": goal}), 201
    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500

@app.route("/goals/projection", methods=["POST"])
def goal_projection_route():
    try:
        data = request.get_json(force=True) or {}
        goal = data.get("goal", {})
        
        from goals_manager import get_goal_projection
        
        projection = get_goal_projection(goal)
        return jsonify({"projection": projection}), 200
    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500

# ---------- Gamification ----------
@app.route("/streaks", methods=["POST"])
def streaks_route():
    try:
        data = request.get_json(force=True) or {}
        transactions = data.get("transactions", [])
        
        from gamification import calculate_streaks
        
        streaks = calculate_streaks(transactions)
        return jsonify({"streaks": streaks}), 200
    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500

@app.route("/achievements", methods=["POST"])
def achievements_route():
    try:
        data = request.get_json(force=True) or {}
        user_data = data.get("userData", {})
        transactions = data.get("transactions", [])
        goals = data.get("goals", [])
        
        from gamification import check_achievements
        
        achievements = check_achievements(user_data, transactions, goals)
        return jsonify({"achievements": achievements}), 200
    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500

@app.route("/challenges/active", methods=["GET"])
def active_challenges_route():
    try:
        from gamification import get_active_challenges
        
        challenges = get_active_challenges()
        return jsonify({"challenges": challenges}), 200
    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500

# ---------- AI Daily Tip ----------
@app.route("/ai/daily-tip", methods=["POST"])
def daily_tip_route():
    try:
        data = request.get_json(force=True) or {}
        user_data = data.get("userData", {})
        transactions = data.get("transactions", [])
        
        # Generate personalized tip based on recent activity
        tips = [
            "💡 Try setting a daily spending limit to stay on track.",
            "🎯 You're doing great! Keep tracking your expenses consistently.",
            "💰 Consider setting up an emergency fund if you haven't already.",
            "📊 Review your top spending categories and see where you can cut back.",
            "🔥 Maintain your tracking streak! Consistency is key to financial success.",
        ]
        
        # Simple logic - can be enhanced with ML later
        import random
        tip = random.choice(tips)
        
        return jsonify({
            "tip": tip,
            "category": "general",
            "expiresAt": (datetime.now() + timedelta(days=1)).isoformat()
        }), 200
    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500



# ---------- What-if (optional convenience) ----------
@app.route("/simulate", methods=["POST"])
def simulate_route():
    try:
        data = request.get_json(force=True) or {}
        base = float(data.get("baseMonthlySaving", 0))
        delta = float(data.get("deltaMonthlySaving", 0))
        months = int(data.get("months", 120))
        if months <= 0:
            return jsonify({"error": "Invalid months"}), 400

        base_series = forecast_savings(base, months=months)
        bump_series = forecast_savings(base + delta, months=months)
        return jsonify({"base": base_series, "bump": bump_series}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    port = int(os.environ.get("PORT", "8080"))
    app.run(host="0.0.0.0", port=port)
