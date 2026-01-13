import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../../contexts/AuthContext";

export default function StepReview({ formData }) {
  const navigate = useNavigate();
  const { currentUser, markOnboardingComplete } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    console.log("Submit button clicked");
    console.log("Current user:", currentUser);
    console.log("Form data:", formData);

    setLoading(true);
    setError("");

    // Save locally
    localStorage.setItem("lifeledgerFormData", JSON.stringify(formData));
    console.log("Saved to localStorage");

    try {
      if (currentUser) {
        console.log("Saving to Firestore for user:", currentUser.uid);
        // Save to Firestore with user ID
        const success = await markOnboardingComplete(currentUser.uid, formData);
        console.log("Firestore save result:", success);
        if (!success) {
          throw new Error("Failed to save data to Firestore");
        }
        localStorage.setItem("lifeledgerUserId", currentUser.uid);
      } else {
        console.log("No current user, skipping Firestore save");
      }

      // Navigate to dashboard
      console.log("Navigating to dashboard...");
      navigate("/dashboard");
    } catch (e) {
      console.error("❌ Error:", e);
      setError(`Failed to save: ${e.message}`);
      setLoading(false);
      // Still try to navigate even if save failed
      setTimeout(() => {
        console.log("Navigating to dashboard despite error...");
        navigate("/dashboard");
      }, 2000);
    }
  };

  const formattedEntries = Object.entries(formData).map(([key, value]) => (
    <div key={key} className="flex justify-between py-3 border-b border-black/10">
      <span className="text-xs uppercase tracking-wide text-black/70">
        {key.replace(/([A-Z])/g, " $1")}
      </span>
      <span className="text-sm text-black">{value || "N/A"}</span>
    </div>
  ));

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      style={{ fontFamily: '"Source Code Pro", monospace' }}
    >
      <h2 className="text-xs tracking-widest uppercase mb-8 text-black/70">REVIEW YOUR DETAILS</h2>

      <div className="mb-8 max-w-2xl">{formattedEntries}</div>

      {error && (
        <p className="text-red-600 text-xs mb-4 tracking-wide">{error}</p>
      )}

      <button
        onClick={handleSubmit}
        disabled={loading}
        className="px-8 py-3 bg-black text-white text-xs tracking-widest uppercase hover:opacity-80 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? "Submitting..." : "Submit & View Dashboard"}
      </button>
    </motion.div>
  );
}
