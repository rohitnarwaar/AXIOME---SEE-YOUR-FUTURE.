import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { db } from "../../firebase";
import { collection, addDoc } from "firebase/firestore";
import analyzeFinance from "../../utils/analyzeFinance"; // ✅ Gemini helper

export default function StepReview({ formData }) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    setLoading(true);
    setError("");

    // Save locally
    localStorage.setItem("lifeledgerFormData", JSON.stringify(formData));

    try {
      // Sanitize data (Firestore doesn't like undefined)
      const cleanData = JSON.parse(JSON.stringify(formData));

      // Save to Firestore with timestamp
      const docRef = await addDoc(collection(db, "users"), {
        ...cleanData,
        createdAt: new Date()
      });

      // ✅ Save User ID to LocalStorage for Dashboard retrieval
      localStorage.setItem("lifeledgerUserId", docRef.id);

      // Call Gemini for AI insights
      // We wrap this in a separate try-catch so it doesn't block the flow if it fails
      let aiResult = { summary: "AI analysis pending..." };
      try {
        aiResult = await analyzeFinance(cleanData);
      } catch (aiErr) {
        console.error("AI Analysis failed but continuing:", aiErr);
      }

      // Save AI result also in Firestore
      await addDoc(collection(db, "insights"), {
        userId: docRef.id,
        ...aiResult,
        createdAt: new Date(),
      });

      // Navigate to dashboard
      navigate("/dashboard");
    } catch (e) {
      console.error("❌ Error:", e);
      setError(`Failed to save: ${e.message}`);
    }

    setLoading(false);
  };

  const formattedEntries = Object.entries(formData).map(([key, value]) => (
    <div key={key} className="flex justify-between border-b py-2">
      <span className="capitalize">{key.replace(/([A-Z])/g, " $1")}</span>
      <span className="font-medium">{value || "N/A"}</span>
    </div>
  ));

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">✅ Review Your Details</h2>
      <div className="space-y-2">{formattedEntries}</div>

      {error && <p className="text-red-600 mt-2">{error}</p>}

      <button
        onClick={handleSubmit}
        disabled={loading}
        className="mt-6 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
      >
        {loading ? "Submitting..." : "Submit & View Dashboard"}
      </button>
    </div>
  );
}
