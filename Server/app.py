import os
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
import google.generativeai as genai

from forecast_module import (
    forecast_savings,
    forecast_loan_payoff,
    forecast_retirement_corpus,
)

load_dotenv()
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
print("✅ GEMINI_API_KEY loaded:", bool(GEMINI_API_KEY))


app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})

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
        if monthly_saving < 0 or months <= 0:
            return jsonify({"error": "Invalid inputs"}), 400

        series = forecast_savings(monthly_saving, months=months)
        return jsonify({"series": series}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# ---------- Loan payoff ----------
@app.route("/loan-payoff", methods=["POST"])
def loan_payoff_route():
    try:
        data = request.get_json(force=True) or {}
        principal = float(data.get("principal", 0))
        annual_interest_rate = float(data.get("annualInterestRate", 0))
        monthly_emi = float(data.get("monthlyEmi", 0))

        if principal <= 0 or annual_interest_rate < 0 or monthly_emi <= 0:
            return jsonify({"error": "Invalid inputs"}), 400

        timeline = forecast_loan_payoff(
            principal=principal,
            annual_interest_rate=annual_interest_rate,
            monthly_emi=monthly_emi,
        )
        return jsonify({"timeline": timeline}), 200
    except Exception as e:
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
        return jsonify({"error": str(e)}), 500

# ---------- AI Narrative (Gemini) ----------
@app.route("/analyze", methods=["POST"])
def analyze_route():
    try:
        if not GEMINI_API_KEY:
            print("❌ Missing GEMINI_API_KEY")
            return jsonify({"error": "GEMINI_API_KEY not set"}), 500

        data = request.get_json(force=True) or {}
        print("📩 Incoming /analyze data:", data)

        prompt = data.get("prompt", "Provide a concise personal finance analysis.")
        context = data.get("context", {})

        genai.configure(api_key=GEMINI_API_KEY)
        model = genai.GenerativeModel("gemini-1.5-flash-latest")

        user_text = f"""You're a financial advisor. Analyze this user's data:
{context}

Return:
- Net worth analysis
- Budget feedback
- Debt advice
- Short actionable checklist (max 5 bullets)
"""

        print("🧠 Sending prompt to Gemini API...")
        resp = model.generate_content(user_text)
        print("✅ Gemini API response received")

        text = getattr(resp, "text", str(resp))
        return jsonify({"summary": text}), 200

    except Exception as e:
        import traceback
        print("❌ ERROR in /analyze route:", e)
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
