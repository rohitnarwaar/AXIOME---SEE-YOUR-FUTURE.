// client/src/utils/analyzeFinance.js

function generateLocalMetrics(data) {
  const income = parseFloat(data.monthlyIncome || 0);
  const expenses = parseFloat(data.monthlyExpenses || 0);
  const liabilities = parseFloat(data.liabilities || 0);
  const assets = parseFloat(data.assets || 0);
  const savings = income - expenses;
  const netWorth = assets - liabilities;

  const savingsRate = income > 0 ? savings / income : 0;
  const debtRatio = assets > 0 ? liabilities / assets : 1;
  const emiBurden = income > 0 ? liabilities / income : 1;

  let healthScore = 100;
  if (savingsRate < 0.1) healthScore -= 20;
  if (debtRatio > 0.5) healthScore -= 20;
  if (emiBurden > 0.4) healthScore -= 20;
  if (netWorth < 0) healthScore -= 20;
  if (income < 20000) healthScore -= 10;
  healthScore = Math.max(0, Math.min(100, healthScore));

  const suggestedChanges = [];
  if (savingsRate < 0.1) suggestedChanges.push("Increase savings to at least 10% of your income.");
  if (debtRatio > 0.5) suggestedChanges.push("Reduce liabilities to improve debt-to-asset ratio.");
  if (emiBurden > 0.4) suggestedChanges.push("EMI burden is high. Consider refinancing or repaying loans early.");
  if (netWorth < 0) suggestedChanges.push("Net worth is negative. Focus on reducing debt and increasing assets.");
  if (income < 20000) suggestedChanges.push("Consider upskilling or seeking higher-paying opportunities.");

  return {
    healthScore,
    debtToAssetRatio: +(debtRatio * 100).toFixed(2),
    monthlyBurn: expenses,
    netWorth,
    savingsRate: (savingsRate * 100).toFixed(2) + "%",
    suggestedChanges,
    summary: savings > 0
      ? "You're saving money. Keep going!"
      : "You're overspending. Reduce your expenses.",
  };
}

export default async function analyzeFinance(data) {
  const localInsights = generateLocalMetrics(data);

  const prompt = `
You're a financial advisor. Based on this user's financial data, give:
- Net worth analysis
- Budget feedback
- Debt advice
- Goal alignment
- Investment strategy

User Data:
${JSON.stringify(data, null, 2)}
`;

  try {
    // ✅ Call Flask backend (Gemini)
    const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:8080";
    const res = await fetch(`${API_BASE}/analyze`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt, context: data }),
    });

    const json = await res.json();
    const aiSummary = json.result || "⚠️ AI analysis failed.";

    return {
      ...localInsights,
      aiSummary,
    };
  } catch (err) {
    console.error("Gemini analysis error:", err);
    return {
      ...localInsights,
      aiSummary: "⚠️ AI analysis failed. Please try again.",
    };
  }
}
