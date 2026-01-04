import { useState } from "react";
import StepIncome from "./steps/StepIncome";
import StepExpenses from "./steps/StepExpenses";
import StepAssets from "./steps/StepAssets";
import StepLiabilities from "./steps/StepLiabilities";
import StepPersonal from "./steps/StepPersonal";
import StepReview from "./steps/StepReview";

const requiredFields = {
  0: ["income"],
  1: ["rent", "food", "transport"],
  2: ["savings"],
  3: ["loanAmount", "emi"],
  4: ["age", "profession"],
};

const steps = [
  { component: StepIncome, title: "Income" },
  { component: StepExpenses, title: "Expenses" },
  { component: StepAssets, title: "Assets" },
  { component: StepLiabilities, title: "Liabilities" },
  { component: StepPersonal, title: "Personal Info" },
  { component: StepReview, title: "Review & Submit" },
];

export default function MultiStepForm() {
  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState({});
  const [errors, setErrors] = useState({});

  const StepComponent = steps[step].component;

  const updateForm = (newData) => {
    setFormData((prev) => ({ ...prev, ...newData }));
    // Clear error for updated keys
    setErrors((prev) => {
      const next = { ...prev };
      Object.keys(newData).forEach((k) => delete next[k]);
      return next;
    });
  };

  const validateStep = () => {
    const keysToCheck = requiredFields[step] || [];
    const newErrors = {};

    for (let key of keysToCheck) {
      const v = formData[key];
      if (v === undefined || v === null || String(v).trim() === "") {
        newErrors[key] = `${key} is required`;
      }
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const next = () => {
    if (!validateStep()) return;
    setStep((prev) => Math.min(prev + 1, steps.length - 1));
  };

  const back = () => setStep((prev) => Math.max(prev - 1, 0));

  return (
    <div>
      <div className="flex justify-between mb-6 gap-2 flex-wrap">
        {steps.map((s, i) => (
          <div
            key={i}
            className={`text-sm ${i === step ? "font-bold text-blue-600" : "text-gray-400"
              }`}
          >
            {s.title}
          </div>
        ))}
      </div>

      <StepComponent formData={formData} updateForm={updateForm} errors={errors} />

      <div className="flex justify-between mt-6">
        <button
          onClick={back}
          disabled={step === 0}
          className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
        >
          Back
        </button>

        {step < steps.length - 1 ? (
          <button
            onClick={next}
            className="px-4 py-2 bg-blue-600 text-white rounded"
          >
            Next
          </button>
        ) : null}
      </div>
    </div>
  );
}
