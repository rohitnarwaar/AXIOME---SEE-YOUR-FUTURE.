import pandas as pd
from datetime import datetime, timedelta
from dateutil.relativedelta import relativedelta


def forecast_savings(saving_per_month, months=120):
    """
    Simple savings forecast using compound growth.
    Assumes a modest 6% annual return on savings.
    """
    from datetime import datetime
    from dateutil.relativedelta import relativedelta
    
    annual_return_rate = 0.06
    monthly_return_rate = (1 + annual_return_rate) ** (1/12) - 1
    
    result = []
    balance = 0
    current_date = datetime.now()
    
    for month in range(months):
        # Add monthly saving
        balance += saving_per_month
        # Apply monthly return
        balance *= (1 + monthly_return_rate)
        
        result.append({
            'ds': (current_date + relativedelta(months=month)).strftime('%Y-%m-%d'),
            'yhat': round(balance, 2)
        })
    
    return result




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

def forecast_spending_clusters(expenses_dict):
    """
    Clusters expenses into groups (e.g., High, Medium, Low) using K-Means.
    Input: {'Rent': 2000, 'Food': 500, ...}
    Output: {'Rent': 'Cluster 1', 'Food': 'Cluster 0', ...}
    """
    if not expenses_dict:
        return {}

    from sklearn.cluster import KMeans
    import numpy as np

    # Prepare data: values need to be 2D array [[v1], [v2], ...]
    labels = list(expenses_dict.keys())
    values = np.array(list(expenses_dict.values())).reshape(-1, 1)

    # If we have very few items, k-means might fail or be trivial.
    # We try to find 3 clusters (High, Medium, Low) or fewer if not enough data.
    k = min(3, len(values))
    if k < 1:
        return {}
    
    kmeans = KMeans(n_clusters=k, random_state=42, n_init=10)
    kmeans.fit(values)
    
    # Map cluster IDs back to items
    # We can also label the clusters by their center value to make it meaningful (e.g. "High Cost")
    cluster_centers = kmeans.cluster_centers_.flatten()
    # Sort clusters by value to give them consistent meaning (0=Low, 1=Med, 2=High)
    sorted_indices = np.argsort(cluster_centers)
    rank_map = {old_idx: new_rank for new_rank, old_idx in enumerate(sorted_indices)}
    
    result = []
    for label, val, cluster_id in zip(labels, values, kmeans.labels_):
        rank = rank_map[cluster_id]
        category_name = ["Low", "Medium", "High"][rank] if k == 3 else f"Tier {rank+1}"
        
        result.append({
            "category": label,
            "amount": float(val[0]), # numpy float to python float
            "cluster": category_name
        })
        
    return result
