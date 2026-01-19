import { useState } from "react";
import { motion } from "framer-motion";
import Tesseract from "tesseract.js";
import * as pdfjsLib from "pdfjs-dist";
import parseOCRToCategories from "../utils/parseOCR";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { db } from "../firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";

// Configure PDF.js worker - use local file instead of CDN
pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';

export default function UploadPage() {
  const [ocrText, setOcrText] = useState("");
  const [editableCategories, setEditableCategories] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  // Convert PDF to image for OCR
  const convertPdfToImage = async (file) => {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    const page = await pdf.getPage(1); // Get first page

    const viewport = page.getViewport({ scale: 2.0 }); // Higher scale for better quality
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    canvas.height = viewport.height;
    canvas.width = viewport.width;

    await page.render({
      canvasContext: context,
      viewport: viewport
    }).promise;

    return canvas.toDataURL('image/png');
  };

  const handleFile = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    console.log("📁 File selected:", file.name, file.type, file.size);

    setLoading(true);
    setError("");
    setOcrText("");
    setEditableCategories({});

    try {
      let imageToProcess = file;

      // If PDF, convert to image first
      if (file.type === 'application/pdf') {
        console.log("📄 PDF detected, converting to image...");
        const imageDataUrl = await convertPdfToImage(file);
        imageToProcess = imageDataUrl;
        console.log("✅ PDF converted to image");
      }

      // Run OCR on image
      Tesseract.recognize(imageToProcess, "eng", {
        logger: m => console.log("OCR Progress:", m)
      })
        .then(({ data: { text } }) => {
          console.log("✅ OCR Success! Extracted text length:", text.length);
          setOcrText(text);
          const rawCategories = parseOCRToCategories(text);
          console.log("📊 Detected categories:", rawCategories);

          // Convert all amounts to editable strings
          const editable = {};
          for (let key in rawCategories) {
            editable[key] = rawCategories[key].toString();
          }
          setEditableCategories(editable);
          setLoading(false);
        })
        .catch((err) => {
          console.error("❌ OCR Error:", err);
          setError(`OCR failed: ${err.message || 'Unknown error'}.`);
          setLoading(false);
        });
    } catch (err) {
      console.error("❌ File processing error:", err);
      setError(`Failed to process file: ${err.message || 'Unknown error'}. Please try a different file.`);
      setLoading(false);
    }
  };

  const handleEdit = (category, value) => {
    setEditableCategories((prev) => ({
      ...prev,
      [category]: value,
    }));
  };

  const handleUseInAnalysis = async () => {
    if (!currentUser) {
      setError("Please log in to save your data.");
      return;
    }

    try {
      setLoading(true);

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

      const uploadedExpenses = {};
      for (let category in editableCategories) {
        const key = categoryKeyMap[category];
        if (key) {
          uploadedExpenses[key] = parseFloat(editableCategories[category] || 0);
        }
      }

      // Get existing user data from Firestore
      const userDocRef = doc(db, "userProfiles", currentUser.uid);
      const userDoc = await getDoc(userDocRef);

      let existingData = {};
      if (userDoc.exists()) {
        existingData = userDoc.data();
      }

      // Merge uploaded expenses with existing data
      const updatedData = {
        ...existingData,
        ...uploadedExpenses,
        lastUploadDate: new Date().toISOString(),
      };

      // Save to Firestore
      await setDoc(userDocRef, updatedData, { merge: true });

      console.log("✅ Data saved to Firestore:", updatedData);

      // Navigate to Dashboard to see updated metrics
      navigate("/dashboard");
    } catch (err) {
      console.error("❌ Error saving data:", err);
      setError(`Failed to save data: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Navigation */}
      <motion.nav
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="relative z-20 flex justify-between items-center py-6"
        style={{
          paddingLeft: '10%',
          paddingRight: '10%',
          fontFamily: '"Source Code Pro", monospace'
        }}
      >
        <div className="text-sm tracking-widest">
          ONE'S OWN
        </div>

        <div className="flex gap-8 text-sm tracking-wide">
          <button onClick={() => navigate('/')} className="hover:opacity-70 transition-opacity">Home</button>
          <button onClick={() => navigate('/dashboard')} className="hover:opacity-70 transition-opacity">Dashboard</button>
        </div>
      </motion.nav>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="px-[10%] py-12"
        style={{ fontFamily: '"Source Code Pro", monospace' }}
      >
        {/* Header */}
        <header className="mb-16">
          <h1 className="text-4xl font-light tracking-wide uppercase mb-4">
            Upload Bank Statements
          </h1>
          <p className="text-sm opacity-60 tracking-wide max-w-2xl">
            Upload a <strong>PDF or image (JPG/PNG)</strong> of your bank statement.
            The system will automatically detect expenses like food (Swiggy, Zomato),
            transport (Uber, Ola), shopping (Amazon, Flipkart), and more.
          </p>
          <p className="text-xs opacity-40 tracking-wide max-w-2xl mt-2">
            💡 PDFs are automatically converted to images for optimal text extraction.
          </p>
        </header>

        {/* Horizontal Line Separator */}
        <div className="h-px bg-white opacity-20 mb-16" />

        {/* File Upload Section */}
        <div className="mb-16">
          <h3 className="text-xs tracking-widest uppercase mb-8 opacity-60">Select Document</h3>

          <label className="inline-block px-6 py-3 border border-white text-xs tracking-widest uppercase hover:bg-white hover:text-black transition-colors cursor-pointer">
            Choose File
            <input
              type="file"
              accept="application/pdf,image/*"
              onChange={handleFile}
              className="hidden"
            />
          </label>

          {loading && (
            <p className="text-sm mt-4 opacity-60 animate-pulse">Reading your file...</p>
          )}
          {error && <p className="text-sm mt-4 text-red-600">{error}</p>}
        </div>

        {/* OCR Text Display */}
        {ocrText && (
          <>
            <div className="h-px bg-white opacity-20 mb-16" />
            <div className="mb-16">
              <h3 className="text-xs tracking-widest uppercase mb-8 opacity-60">Extracted Text</h3>
              <pre className="text-xs leading-relaxed opacity-60 font-mono overflow-x-auto whitespace-pre-wrap max-h-64 overflow-y-auto border border-white border-opacity-10 p-4">
                {ocrText}
              </pre>
            </div>
          </>
        )}

        {/* Detected Categories */}
        {Object.keys(editableCategories).length > 0 && (
          <>
            <div className="h-px bg-white opacity-20 mb-16" />
            <div className="mb-16">
              <h3 className="text-xs tracking-widest uppercase mb-4 opacity-60">Detected Categories</h3>
              <p className="text-sm opacity-60 mb-8">
                Review and adjust the detected categories before saving.
              </p>

              <table className="w-full text-sm max-w-2xl">
                <thead>
                  <tr className="border-b border-white border-opacity-10">
                    <th className="text-left py-3 text-xs tracking-wide uppercase opacity-60">Category</th>
                    <th className="text-right py-3 text-xs tracking-wide uppercase opacity-60">Amount (₹)</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(editableCategories).map(([cat, amt]) => (
                    <tr key={cat} className="border-b border-white border-opacity-10 hover:bg-white hover:bg-opacity-5 transition-colors">
                      <td className="py-3 text-sm">{cat}</td>
                      <td className="py-3 text-right">
                        <input
                          type="number"
                          value={amt}
                          onChange={(e) => handleEdit(cat, e.target.value)}
                          className="w-32 bg-transparent border-none focus:outline-none focus:ring-0 text-right font-mono"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <button
                onClick={handleUseInAnalysis}
                disabled={loading}
                className="mt-8 px-8 py-3 border border-white text-xs tracking-widest uppercase hover:bg-white hover:text-black transition-colors disabled:opacity-30"
              >
                {loading ? "Saving..." : "Save & View Dashboard"}
              </button>
            </div>
          </>
        )}
      </motion.div>
    </div>
  );
}
