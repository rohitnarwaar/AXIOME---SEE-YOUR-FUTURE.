import { motion } from "framer-motion";

export default function StepLiabilities({ formData, updateForm, errors }) {
  const fields = [
    { label: "Loan Amount (Total)", key: "loanAmount" },
    { label: "Monthly EMI", key: "emi" },
    { label: "Credit Card Debt", key: "creditCardDebt" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      style={{ fontFamily: '"Source Code Pro", monospace' }}
    >
      <h2 className="text-[10px] tracking-[0.3em] font-bold uppercase mb-10 text-black/40 italic">Liabilities</h2>

      <div className="space-y-12">
        {fields.map(({ label, key }) => (
          <div key={key}>
            <label className="text-[10px] tracking-widest font-bold uppercase text-black/30 block mb-3">
              {label} (₹)
            </label>
            <input
              type="number"
              value={formData[key] || ""}
              onChange={(e) => updateForm({ [key]: e.target.value })}
              className="w-full bg-transparent border-b-2 border-black/10 text-black px-0 py-4 text-xl font-bold focus:outline-none focus:border-black transition-all placeholder-black/5 font-mono"
              placeholder="0.00"
            />
            {errors?.[key] && (
              <p className="text-red-600 text-[10px] mt-2 tracking-widest uppercase font-bold">{errors[key]}</p>
            )}
          </div>
        ))}
      </div>
    </motion.div>
  );
}
