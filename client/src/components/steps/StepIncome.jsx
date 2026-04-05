import { motion } from "framer-motion";

export default function StepIncome({ formData, updateForm, errors }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      style={{ fontFamily: '"Source Code Pro", monospace' }}
    >
      <h2 className="text-[10px] tracking-[0.3em] font-bold uppercase mb-10 text-black/40 italic">Income Details</h2>

      <div className="mb-10">
        <label className="text-[10px] tracking-widest font-bold uppercase text-black/30 block mb-3">
          Monthly Income (₹)
        </label>
        <input
          type="number"
          value={formData.income || ""}
          onChange={(e) => updateForm({ income: e.target.value })}
          className="w-full bg-transparent border-b-2 border-black/10 text-black px-0 py-4 text-3xl font-bold focus:outline-none focus:border-black transition-all placeholder-black/5 font-mono"
          placeholder="0.00"
          autoFocus
        />
        {errors?.income && (
          <p className="text-red-600 text-xs mt-2 tracking-wide">{errors.income}</p>
        )}
      </div>
    </motion.div>
  );
}
