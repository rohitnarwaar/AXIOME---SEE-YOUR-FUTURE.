import { motion } from "framer-motion";

export default function StepExpenses({ formData, updateForm, errors }) {
  const fields = [
    { label: "Rent", key: "rent" },
    { label: "Food & Groceries", key: "food" },
    { label: "Transport", key: "transport" },
    { label: "Utilities", key: "utilities" },
    { label: "Miscellaneous", key: "misc" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      style={{ fontFamily: '"Source Code Pro", monospace' }}
    >
      <h2 className="text-sm tracking-widest uppercase mb-12 text-black font-medium">MONTHLY EXPENSES</h2>

      <div className="space-y-6">
        {fields.map(({ label, key }) => (
          <div key={key}>
            <label className="block mb-4 text-xs tracking-wide uppercase text-black/80 font-medium">
              {label} (₹)
            </label>
            <input
              type="number"
              value={formData[key] || ""}
              onChange={(e) => updateForm({ [key]: e.target.value })}
              className="w-full p-4 border-2 border-black/20 text-base text-black placeholder:text-black/30 focus:outline-none focus:border-black transition-colors"
              placeholder={`Enter ${label.toLowerCase()}`}
            />
            {errors?.[key] && (
              <p className="text-red-600 text-xs mt-2 tracking-wide">{errors[key]}</p>
            )}
          </div>
        ))}
      </div>
    </motion.div>
  );
}
