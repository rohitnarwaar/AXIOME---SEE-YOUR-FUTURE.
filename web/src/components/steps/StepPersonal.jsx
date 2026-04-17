import { motion } from "framer-motion";

export default function StepPersonal({ formData, updateForm, errors }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="font-mono"
    >
      <h2 className="text-[10px] tracking-[0.3em] font-bold uppercase mb-10 text-black/40 italic">Personal Details</h2>

      <div className="space-y-12">
        <div>
          <label className="text-[10px] tracking-widest font-bold uppercase text-black/30 block mb-3">
            Age
          </label>
          <input
            type="number"
            value={formData.age || ""}
            onChange={(e) => updateForm({ age: e.target.value })}
            className="w-full bg-transparent border-b-2 border-black/10 text-black px-0 py-4 text-xl font-bold focus:outline-none focus:border-black transition-all placeholder-black/5 font-mono"
            placeholder="0"
          />
          {errors?.age && (
            <p className="text-red-600 text-[10px] mt-2 tracking-widest uppercase font-bold">{errors.age}</p>
          )}
        </div>

        <div>
          <label className="text-[10px] tracking-widest font-bold uppercase text-black/30 block mb-3">
            Profession
          </label>
          <input
            type="text"
            value={formData.profession || ""}
            onChange={(e) => updateForm({ profession: e.target.value })}
            className="w-full bg-transparent border-b-2 border-black/10 text-black px-0 py-4 text-xl font-bold focus:outline-none focus:border-black transition-all placeholder-black/5 font-mono"
            placeholder="..."
          />
          {errors?.profession && (
            <p className="text-red-600 text-[10px] mt-2 tracking-widest uppercase font-bold">{errors.profession}</p>
          )}
        </div>

        <div>
          <label className="text-[10px] tracking-widest font-bold uppercase text-black/30 block mb-3">
            Risk Tolerance
          </label>
          <select
            value={formData.risk || ""}
            onChange={(e) => updateForm({ risk: e.target.value })}
            className="w-full bg-transparent border-b-2 border-black/10 text-black px-0 py-4 text-xs font-bold uppercase tracking-widest focus:outline-none focus:border-black transition-all appearance-none cursor-pointer"
          >
            <option value="">Select Protocol...</option>
            <option value="low">Low Variance</option>
            <option value="moderate">Balanced</option>
            <option value="high">High Velocity</option>
          </select>
        </div>
      </div>
    </motion.div>
  );
}
