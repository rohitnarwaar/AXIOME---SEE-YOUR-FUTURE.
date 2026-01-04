import { useState } from "react";
import Tesseract from "tesseract.js";
import parseOCRToCategories from "../utils/parseOCR";
import { useNavigate } from "react-router-dom";
// Optional: Firestore if you want to save uploads
// import { db } from "../firebase";
// import { collection, addDoc } from "firebase/firestore";

export default function UploadPage() {
  const [ocrText, setOcrText] = useState("");
  const [editableCategories, setEditableCategories] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setLoading(true);
    setError("");

    Tesseract.recognize(file, "eng")
      .then(({ data: { text } }) => {
        setOcrText(text);
        const rawCategories = parseOCRToCategories(text);

        // Convert all amounts to editable strings
        const editable = {};
        for (let key in rawCategories) {
          editable[key] = rawCategories[key].toString();
        }
        setEditableCategories(editable);
      })
      .catch((err) => {
        console.error("❌ OCR Error:", err);
        setError("Failed to process file. Please upload a clearer scan or smaller file.");
      })
      .finally(() => setLoading(false));
  };

  const handleEdit = (category, value) => {
    setEditableCategories((prev) => ({
      ...prev,
      [category]: value,
    }));
  };

  const handleUseInAnalysis = async () => {
    // Map category names to formData keys
    const categoryKeyMap = {
      Food: "food",
      Transport: "transport",
      Shopping: "shopping",
      Subscriptions: "subscriptions",
      Housing: "rent",
      Loans: "emi",
      Groceries: "groceries",
      Utilities: "utilities",
    };

    const mergedData = {};
    for (let category in editableCategories) {
      const key = categoryKeyMap[category];
      if (key) {
        mergedData[key] = parseFloat(editableCategories[category] || 0);
      }
    }

    // Merge with existing form data in localStorage
    const existingData = JSON.parse(localStorage.getItem("lifeledgerFormData") || "{}");
    const updated = { ...existingData, ...mergedData };

    localStorage.setItem("lifeledgerFormData", JSON.stringify(updated));

    // Optional: Save OCR results to Firestore
    // try {
    //   await addDoc(collection(db, "ocrUploads"), {
    //     categories: mergedData,
    //     createdAt: new Date(),
    //   });
    //   console.log("✅ OCR upload saved to Firestore");
    // } catch (e) {
    //   console.error("❌ Error saving OCR upload:", e);
    // }

    navigate("/input");
  };

  return (
    <div className="max-w-xl mx-auto p-6 pt-32 md:pt-36">
      <h1 className="text-3xl font-bold mb-4">📁 Upload Bank Statements</h1>
      <p className="text-lg text-gray-700 mb-6">
        Upload a PDF or image of your bank statement for automatic categorization.
      </p>

      <input
        type="file"
        accept="application/pdf,image/*"
        onChange={handleFile}
        className="mb-4"
      />

      {loading && <p className="text-accent animate-pulse">🕐 Reading your file...</p>}
      {error && <p className="text-red-400 mt-2">{error}</p>}

      {ocrText && (
        <div className="mt-8 glass-panel p-6 rounded-2xl">
          <h2 className="text-lg font-bold mb-4 text-primary">🧾 Extracted Text:</h2>
          <pre className="whitespace-pre-wrap text-sm text-gray-400 font-mono overflow-x-auto">{ocrText}</pre>
        </div>
      )}

      {Object.keys(editableCategories).length > 0 && (
        <div className="mt-8 glass-panel p-6 rounded-2xl">
          <h2 className="text-lg font-semibold mb-2 flex items-center gap-2">
            <span className="text-xl">🧠</span> Detected Categories
          </h2>
          <p className="text-gray-400 text-sm mb-6">
            Review and adjust the detected categories before saving.
          </p>

          <table className="w-full text-sm border-separate border-spacing-y-2">
            <thead>
              <tr className="text-gray-500">
                <th className="p-2 text-left">Category</th>
                <th className="p-2 text-left">Amount (₹)</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(editableCategories).map(([cat, amt]) => (
                <tr key={cat} className="group">
                  <td className="p-3 bg-white/5 rounded-l-lg group-hover:bg-white/10 transition-colors">{cat}</td>
                  <td className="p-3 bg-white/5 rounded-r-lg group-hover:bg-white/10 transition-colors">
                    <input
                      type="number"
                      value={amt}
                      onChange={(e) => handleEdit(cat, e.target.value)}
                      className="w-full bg-transparent border-none focus:ring-0 text-accent font-mono text-right"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <button
            onClick={handleUseInAnalysis}
            disabled={loading}
            className="mt-6 w-full py-3 bg-primary text-white rounded-xl font-bold hover:opacity-90 transition-opacity shadow-lg shadow-primary/20"
          >
            {loading ? "Processing..." : "Use Data in Analysis"}
          </button>
        </div>
      )}
    </div>
  );
}
