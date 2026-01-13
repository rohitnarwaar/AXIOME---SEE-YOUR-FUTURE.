import { motion } from "framer-motion";

export default function StepPersonal({ formData, updateForm, errors }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      style={{ fontFamily: '"Source Code Pro", monospace' }}
    >
      <h2 className="text-sm tracking-widest uppercase mb-12 text-black font-medium">PERSONAL DETAILS</h2>

      <div className="space-y-6">
        <div>
          <label className="block mb-4 text-xs tracking-wide uppercase text-black/80 font-medium">
            Age
          </label>
          <input
            type="number"
            value={formData.age || ""}
            onChange={(e) => updateForm({ age: e.target.value })}
            className="w-full p-4 border-2 border-black/20 text-base text-black placeholder:text-black/30 focus:outline-none focus:border-black transition-colors"
            placeholder="Enter your age"
          />
          {errors?.age && (
            <p className="text-red-600 text-xs mt-2 tracking-wide">{errors.age}</p>
          )}
        </div>

        <div>
          <label className="block mb-4 text-xs tracking-wide uppercase text-black/80 font-medium">
            Profession
          </label>
          <input
            type="text"
            value={formData.profession || ""}
            onChange={(e) => updateForm({ profession: e.target.value })}
            className="w-full p-4 border-2 border-black/20 text-base text-black placeholder:text-black/30 focus:outline-none focus:border-black transition-colors"
            placeholder="Enter your profession"
          />
          {errors?.profession && (
            <p className="text-red-600 text-xs mt-2 tracking-wide">{errors.profession}</p>
          )}
        </div>

        <div>
          <label className="block mb-4 text-xs tracking-wide uppercase text-black/80 font-medium">
            Risk Tolerance
          </label>
          <select
            value={formData.risk || ""}
            onChange={(e) => updateForm({ risk: e.target.value })}
            className="w-full p-4 border-2 border-black/20 text-base text-black focus:outline-none focus:border-black transition-colors bg-white"
          >
            <option value="">Select...</option>
            <option value="low">Low</option>
            <option value="moderate">Moderate</option>
            <option value="high">High</option>
          </select>
        </div>
      </div>
    </motion.div>
  );
}
