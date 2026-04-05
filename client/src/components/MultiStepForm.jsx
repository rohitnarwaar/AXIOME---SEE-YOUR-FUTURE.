import { useState } from "react";
import { motion } from "framer-motion";
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
    <div className="min-h-screen bg-white px-6 md:px-[10%] py-10 md:py-16" style={{ fontFamily: '"Source Code Pro", monospace' }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="max-w-3xl mx-auto"
      >
        {/* Step Indicator */}
        <div className="flex justify-between mb-12 md:mb-20 pb-8 border-b border-black/10">
          {steps.map((s, i) => (
            <div
              key={i}
              className="flex flex-col items-center gap-2"
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${i === step
                  ? "bg-black text-white"
                  : i < step
                    ? "bg-black/20 text-black/60"
                    : "bg-black/5 text-black/30"
                }`}>
                {i + 1}
              </div>
              <span className={`hidden md:block text-[10px] tracking-[0.2em] uppercase transition-opacity ${i === step ? "text-black font-bold" : "text-black/30"
                }`}>
                {s.title}
              </span>
            </div>
          ))}
        </div>

        {/* Step Content */}
        <div className="mb-16 md:mb-24 min-h-[40vh]">
          <StepComponent formData={formData} updateForm={updateForm} errors={errors} />
        </div>

        {/* Navigation */}
        <div className="flex justify-between items-center pt-10 border-t border-black/10">
          <button
            onClick={back}
            disabled={step === 0}
            className={`px-10 py-4 text-[10px] font-bold tracking-[0.3em] uppercase border transition-all ${step === 0
                ? "border-black/5 text-black/10 cursor-not-allowed"
                : "border-black text-black hover:bg-black hover:text-white"
              }`}
          >
            Back
          </button>

          {step < steps.length - 1 && (
            <button
              onClick={next}
              className="px-10 py-4 text-[10px] font-bold tracking-[0.3em] uppercase bg-black text-white hover:bg-black/90 transition-all border border-black shadow-lg"
            >
              Next
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
}
