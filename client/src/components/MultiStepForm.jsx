import { useState } from "react";
import StepIncome from "./steps/StepIncome";
import StepExpenses from "./steps/StepExpenses";
import StepAssets from "./steps/StepAssets";
import StepLiabilities from "./steps/StepLiabilities";
import StepPersonal from "./steps/StepPersonal";
import StepReview from "./steps/StepReview";

const requiredFields = {
  0: ["income"],
  1: ["rent", "food", "transport", "misc"],
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
  const [formData, setFormData] = useState(() => {
    const saved = localStorage.getItem("lifeledgerFormData");
    return saved ? JSON.parse(saved) : {};
  });
  const [errors, setErrors] = useState({});

  const StepComponent = steps[step].component;

  const validateStep = () => {
    const keysToCheck = requiredFields[step] || [];
    const newErrors = {};
    for (let key of keysToCheck) {
      if (!formData[key]) {
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

  const updateData = (newData) => {
    setFormData((prev) => ({ ...prev, ...newData }));
  };

  return (

    <div>
      {/* Progress Bar */}
      <div className="mb-8">
        <div className="relative h-2 bg-gray-700 rounded-full overflow-hidden">
          <div
            className="absolute top-0 left-0 h-full bg-accent transition-all duration-500 ease-out"
            style={{ width: `${((step + 1) / steps.length) * 100}%` }}
          ></div>
        </div>
        <div className="flex justify-between mt-2 text-xs text-gray-400">
          <span>Start</span>
          <span className="text-white font-medium">{steps[step].title}</span>
          <span>Finish</span>
        </div>
      </div>

      <div className="min-h-[400px]">
        <StepComponent formData={formData} updateForm={updateData} errors={errors} />
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between mt-8 pt-6 border-t border-white/10">
        <button
          onClick={back}
          disabled={step === 0}
          className="px-6 py-2 rounded-lg text-sm font-medium text-gray-400 hover:text-white disabled:opacity-30 transition-colors"
        >
          Back
        </button>

        {step < steps.length - 1 ? (
          <button
            onClick={next}
            className="px-8 py-3 bg-primary text-white rounded-lg font-semibold hover:bg-indigo-500 transition-colors shadow-lg shadow-indigo-500/20"
          >
            Next Step
          </button>
        ) : null}
      </div>
    </div>
  );
}
