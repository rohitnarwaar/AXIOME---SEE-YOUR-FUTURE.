export default function StepExpenses({ formData, updateForm, errors }) {
  const fields = [
    { label: "Rent", key: "rent" },
    { label: "Food & Groceries", key: "food" },
    { label: "Transport", key: "transport" },
    { label: "Miscellaneous", key: "misc" },
  ];

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">📉 Monthly Expenses</h2>

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
