export default function StepPersonal({ formData, updateForm, errors }) {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">🙋 Personal Details</h2>

      <div className="mb-4">
        <label className="block mb-1">Age</label>
        <input
          type="number"
          value={formData.age || ""}
          onChange={(e) => updateForm({ age: e.target.value })}
          className="w-full p-2 border rounded"
        />
        {errors?.age && <p className="text-red-500 text-sm mt-1">{errors.age}</p>}
      </div>

      <div className="mb-4">
        <label className="block mb-1">Profession</label>
        <input
          type="text"
          value={formData.profession || ""}
          onChange={(e) => updateForm({ profession: e.target.value })}
          className="w-full p-2 border rounded"
        />
        {errors?.profession && (
          <p className="text-red-500 text-sm mt-1">{errors.profession}</p>
        )}
      </div>

      <div className="mb-4">
        <label className="block mb-1">Risk Tolerance</label>
        <select
          value={formData.risk || ""}
          onChange={(e) => updateForm({ risk: e.target.value })}
          className="w-full p-2 border rounded"
        >
          <option value="">Select...</option>
          <option value="low">Low</option>
          <option value="moderate">Moderate</option>
          <option value="high">High</option>
        </select>
      </div>
    </div>
  );
}
