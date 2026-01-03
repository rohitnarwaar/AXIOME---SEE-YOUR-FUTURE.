import MultiStepForm from "../components/MultiStepForm";

export default function InputPage() {
  return (
    <div className="max-w-3xl mx-auto p-6 pt-32 md:p-10 md:pt-36">
      <h1 className="text-3xl md:text-4xl font-bold mb-4 text-center">
        🧾 Enter Your Financial Details
      </h1>
      <p className="text-gray-600 text-center mb-8">
        Provide your income, expenses, assets, and liabilities. This helps LifeLedger generate personalized insights.
      </p>

      <div className="glass-panel p-8 rounded-2xl">
        <MultiStepForm />
      </div>
    </div>
  );
}
