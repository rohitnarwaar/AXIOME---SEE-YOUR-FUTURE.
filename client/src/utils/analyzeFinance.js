function toNum(v) {
  const n = parseFloat(v);
  return Number.isFinite(n) ? n : 0;
}

function generateLocalMetrics(data) {
  const income = toNum(data.income);

  const expenses =
    toNum(data.rent) +
    toNum(data.food) +
    toNum(data.transport) +
    toNum(data.misc);

  const assets =
    toNum(data.savings) +
    toNum(data.fd) +
    toNum(data.stocks) +
    toNum(data.crypto) +
    toNum(data.realEstate);

  const liabilities =
    toNum(data.loanAmount) +
    toNum(data.creditCardDebt);

  const monthlySavings = income - expenses;
  const netWorth = assets - liabilities;

  const savingsRate = income > 0 ? monthlySavings / income : 0;

  let healthScore = 100;
  if (savingsRate < 0.1) healthScore -= 20;
  if (liabilities > assets) healthScore -= 20;
  if (netWorth < 0) healthScore -= 20;
  healthScore = Math.max(0, Math.min(100, healthScore));

  const suggestedChanges = [];
  if (savingsRate < 0.1) suggestedChanges.push("Increase savings to at least 10% of your income.");
  if (liabilities > assets) suggestedChanges.push("Reduce liabilities to improve debt position.");
  if (toNum(data.creditCardDebt) > 0) suggestedChanges.push("Prioritize clearing credit card debt first.");

  return {
    healthScore,
    income,
    expenses,
    monthlySavings,
    assets,
    liabilities,
    netWorth,
    suggestedChanges,
  };
}

export default async function analyzeFinance(data) {
  const localInsights = generateLocalMetrics(data);

  const prompt = `
You're a financial advisor. Based on this user's financial data, give:
- Net worth analysis
- Budget feedback
- Debt advice
- Short actionable checklist (max 5 bullets)

User Data:
${JSON.stringify(data, null, 2)}
`;

  try {
    const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8080";

    const res = await fetch(`${API_BASE}/analyze`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt, context: data }),
    });

    const json = await res.json();
    if (!res.ok) throw new Error(json.error || "AI request failed");

    return {
      ...localInsights,
      aiSummary: json.summary || "AI summary missing.",
    };
  } catch (err) {
    console.error("Gemini analysis error:", err);
    return {
      ...localInsights,
      aiSummary: "AI analysis failed. Check backend logs / API key / model.",
    };
  }
}
