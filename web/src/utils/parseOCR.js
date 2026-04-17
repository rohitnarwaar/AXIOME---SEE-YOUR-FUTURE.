import keywordCategoryMap from "./keywordCategoryMap";

export default function parseOCRToCategories(rawText) {
  const lines = rawText.split("\n").map((line) => line.toLowerCase());

  const categorized = {};

  for (const line of lines) {
    for (const keyword in keywordCategoryMap) {
      if (line.includes(keyword)) {
        const category = keywordCategoryMap[keyword];
        categorized[category] = (categorized[category] || 0) + estimateAmount(line);
      }
    }
  }

  return categorized;
}

function estimateAmount(line) {
  const match = line.match(/(?:rs\.?|₹)\s?(\d{2,6})/i);
  if (match) return parseFloat(match[1]);
  const fallback = line.match(/\d{3,6}/); // fallback number match
  return fallback ? parseFloat(fallback[0]) : 0;
}
