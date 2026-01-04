export default function StepLiabilities({ formData, updateForm, errors }) {
  const fields = [
    { label: "Loan Amount (Total)", key: "loanAmount" },
    { label: "Monthly EMI", key: "emi" },
    { label: "Credit Card Debt", key: "creditCardDebt" },
  ];

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">💳 Liabilities</h2>

      {fields.map(({ label, key }) => (
        <div key={key} className="mb-4">
          <label className="block mb-1">{label} (₹)</label>
          <input
            type="number"
            value={formData[key] || ""}
            onChange={(e) => updateForm({ [key]: e.target.value })}
            className="w-full p-2 border rounded"
          />
          {errors?.[key] && <p className="text-red-500 text-sm mt-1">{errors[key]}</p>}
        </div>
      ))}
    </div>
  );
}
