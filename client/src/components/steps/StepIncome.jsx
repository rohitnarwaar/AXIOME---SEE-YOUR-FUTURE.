import { motion } from "framer-motion";

export default function StepIncome({ formData, updateForm, errors }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      style={{ fontFamily: '"Source Code Pro", monospace' }}
    >
      <h2 className="text-sm tracking-widest uppercase mb-12 text-black font-medium">INCOME DETAILS</h2>

      <div className="mb-8">
        <label className="block mb-4 text-xs tracking-wide uppercase text-black/80 font-medium">
          Monthly Income (₹)
        </label>
        <input
          type="number"
          value={formData.income || ""}
          onChange={(e) => updateForm({ income: e.target.value })}
          className="w-full p-4 border-2 border-black/20 text-base text-black placeholder:text-black/30 focus:outline-none focus:border-black transition-colors"
          placeholder="Enter your monthly income"
        />
        {errors?.income && (
          <p className="text-red-600 text-xs mt-2 tracking-wide">{errors.income}</p>
        )}
      </div>
    </motion.div>
  );
}
