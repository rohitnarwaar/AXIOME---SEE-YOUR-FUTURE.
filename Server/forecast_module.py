from prophet import Prophet
import pandas as pd
from datetime import datetime, timedelta

def forecast_savings(saving_per_month, months=120):
    # Create dummy savings history
    data = pd.DataFrame({
        'ds': pd.date_range(start='2023-01-01', periods=12, freq='MS'),
        'y': [saving_per_month * (i+1) for i in range(12)]  # simple growth
    })

    model = Prophet()
    model.fit(data)

    future = model.make_future_dataframe(periods=months, freq='MS')
    forecast = model.predict(future)

    result = forecast[['ds', 'yhat']].tail(12 * 10)  # next 10 years
    return result.to_dict(orient='records')

def forecast_loan_payoff(loan_amount, monthly_emi, interest_rate=0.10):
    balance = loan_amount
    monthly_interest_rate = interest_rate / 12
    timeline = []
    current_date = datetime.today()

    while balance > 0:
        interest = balance * monthly_interest_rate
        principal = monthly_emi - interest
        if principal <= 0:
            raise ValueError("EMI too low to cover interest.")
        balance -= principal
        timeline.append({
            "month": current_date.strftime("%Y-%m"),
            "remaining": round(max(balance, 0), 2)
        })
        current_date += timedelta(days=30)

    return timeline

def forecast_retirement_corpus(current_savings, monthly_contribution, months, annual_return_rate=0.08):
    monthly_return_rate = (1 + annual_return_rate) ** (1/12) - 1

    balance = current_savings
    corpus = []

    for i in range(months):
        balance += monthly_contribution
        balance *= (1 + monthly_return_rate)
        corpus.append({
            "month": (datetime.today() + timedelta(days=30 * i)).strftime("%Y-%m"),
            "projected_corpus": round(balance, 2)
        })

    return corpus
