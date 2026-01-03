import { useEffect, useState } from "react";
import analyzeFinance from "../utils/analyzeFinance";
import {
  LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from "recharts";
import { db } from "../firebase";
import { collection, query, orderBy, limit, getDocs, doc, getDoc, where } from "firebase/firestore";
import { motion } from "framer-motion";

export default function Dashboard() {
  const [formData, setFormData] = useState({});
  const [insights, setInsights] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  // ... (state hooks same as before) ...
  const [forecastData, setForecastData] = useState([]);
  const [loanData, setLoanData] = useState([]);
  const [retirementData, setRetirementData] = useState([]);
  const [simulateData, setSimulateData] = useState({ base: [], bump: [] });
  const [deltaSavings, setDeltaSavings] = useState(5000);
  const [spendingClusters, setSpendingClusters] = useState([]); // ✅ New State for Clusters

  useEffect(() => {
    const fetchLatestUserData = async () => {
      setLoading(true);
      setError("");
      try {
        const userId = localStorage.getItem("lifeledgerUserId");
        let userData = null;

        // 1. Try fetching from Firestore if ID is valid and not explicitly local
        if (userId && !userId.startsWith("local_")) {
          try {
            const userDoc = await getDoc(doc(db, "users", userId));
            if (userDoc.exists()) {
              userData = userDoc.data();
            }
          } catch (err) {
            console.warn("⚠️ Firestore fetch failed, trying local storage");
          }
        }

        // 2. Fallback to LocalStorage
        if (!userData) {
          const localData = localStorage.getItem("lifeledgerFormData");
          if (localData) {
            console.log("📱 Using Offline Data");
            userData = JSON.parse(localData);
          }
        }

        // 3. Fallback to latest Firestore doc (Demo Mode only)
        if (!userData) {
          try {
            const q = query(collection(db, "users"), orderBy("createdAt", "desc"), limit(1));
            const snapshot = await getDocs(q);
            if (!snapshot.empty) {
              userData = snapshot.docs[0].data();
              localStorage.setItem("lifeledgerUserId", snapshot.docs[0].id);
            }
          } catch (err) { console.warn("Demo fetch failed"); }
        }

        if (!userData) {
          setError("No user data found. Please fill the form.");
          setLoading(false);
          return;
        }

        setFormData(userData);

        // --- Analyze with Gemini ---
        analyzeFinance(userData)
          .then((result) => setInsights(result))
          .catch(() => setError("Failed to analyze finance data."));

        const income = parseFloat(userData.income || 0);
        const expenses =
          parseFloat(userData.food || 0) +
          parseFloat(userData.rent || 0) +
          parseFloat(userData.transport || 0) +
          parseFloat(userData.utilities || 0) +
          parseFloat(userData.misc || 0);

        const savings = income - expenses;

        // --- Savings forecast ---
        if (savings > 0) {
          fetch(`${import.meta.env.VITE_API_BASE}/forecast`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ monthlySaving: savings, months: 120 }),
          })
            .then((res) => res.json())
            .then((data) => {
              const series = data.series || data;
              setForecastData(
                series.map((d) => ({
                  date: d.ds?.slice(0, 10),
                  netWorth: parseFloat(d.yhat || 0),
                }))
              );
            })
            .catch(() => setError("Failed to fetch forecast data."));
        }

        // --- Loan payoff ---
        const loanAmount = parseFloat(userData.loanAmount || 0);
        const emi = parseFloat(userData.emi || userData.monthlyEMI || 0);
        const rate = parseFloat(userData.interestRate || 0.1);
        if (loanAmount > 0 && emi > 0) {
          fetch(`${import.meta.env.VITE_API_BASE}/loan-payoff`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              principal: loanAmount,
              monthlyEmi: emi,
              annualInterestRate: rate,
            }),
          })
            .then((res) => res.json())
            .then((data) => {
              const timeline = data.timeline || data;
              setLoanData(
                timeline.map((d) => ({
                  date: d.month,
                  remaining: parseFloat(d.remaining || 0),
                }))
              );
            })
            .catch(() => setError("Failed to fetch loan payoff data."));
        }

        // --- Retirement corpus ---
        const currentSavings = parseFloat(userData.currentSavings || savings * 12);
        const monthlyContribution = parseFloat(userData.monthlyContribution || savings);
        fetch(`${import.meta.env.VITE_API_BASE}/retirement`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            currentSavings,
            monthlyContribution,
            annualReturnRate: 0.08,
            months: 360,
          }),
        })
          .then((res) => res.json())
          .then((data) => {
            const corpus = data.corpus || data;
            setRetirementData(
              corpus.map((d) => ({
                date: d.month,
                corpus: parseFloat(d.projected_corpus || 0),
              }))
            );
          })
          .catch(() => setError("Failed to fetch retirement forecast."));

        // --- Spending Clusters ---
        // Construct detailed expenses object from formData
        const expensePayload = {
          Rent: parseFloat(userData.rent || 0),
          Food: parseFloat(userData.food || 0),
          Transport: parseFloat(userData.transport || 0),
          Utilities: parseFloat(userData.utilities || 0),
          Misc: parseFloat(userData.misc || 0),
          EMI: parseFloat(userData.monthlyEmi || userData.emi || 0)
        };

        fetch(`${import.meta.env.VITE_API_BASE}/clusters`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ expenses: expensePayload }),
        })
          .then((res) => res.json())
          .then((data) => {
            setSpendingClusters(data.clusters || []);
          })
          .catch((err) => console.error("Cluster fetch failed", err));

        setLoading(false);
      } catch (err) {
        console.error(err);
        setError("Error loading dashboard data.");
        setLoading(false);
      }
    };

    fetchLatestUserData();
  }, []);

  // --- What-if Simulation ---
  const runSimulation = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE}/simulate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          baseMonthlySaving: parseFloat(formData.income || 0) - parseFloat(formData.expenses || 0),
          deltaMonthlySaving: parseFloat(deltaSavings),
          months: 120,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Simulation failed");

      const base = (data.base || []).map((d) => ({
        date: d.ds?.slice(0, 10),
        value: parseFloat(d.yhat),
      }));
      const bump = (data.bump || []).map((d) => ({
        date: d.ds?.slice(0, 10),
        value: parseFloat(d.yhat),
      }));
      setSimulateData({ base, bump });
    } catch (e) {
      console.error(e);
      setError("Simulation failed.");
    }
  };



  // ... existing imports

  if (loading) return <div className="h-screen flex items-center justify-center text-primary">Loading your financial universe...</div>;
  if (error) return <div className="h-screen flex items-center justify-center text-red-500">{error}</div>;

  return (
    <div className="min-h-screen bg-background text-gray-100 p-6 pt-32">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-7xl mx-auto space-y-8"
      >

        {/* Header */}
        <header className="flex justify-between items-end mb-8">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-gray-500 bg-clip-text text-transparent">
              Financial Overview
            </h1>
            <p className="text-gray-400 mt-2">Welcome back. Here is your wealth trajectory.</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500">Net Worth Forecast</p>
            <p className="text-2xl font-mono text-accent">
              ₹{forecastData.length > 0 ? Math.round(forecastData[forecastData.length - 1].netWorth).toLocaleString() : "---"}
            </p>
          </div>
        </header>

        {/* Bento Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Main Chart - Savings */}
          <div className="lg:col-span-2">
            <div className="glass-panel p-6 rounded-2xl h-full">
              <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-accent"></span> Wealth Trajectory
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={forecastData}>
                  <defs>
                    <linearGradient id="colorNetWorth" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                  <XAxis dataKey="date" stroke="#666" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#666" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `₹${val / 1000}k`} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px' }}
                    itemStyle={{ color: '#fff' }}
                  />
                  <Area type="monotone" dataKey="netWorth" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorNetWorth)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* AI Insights Card */}
          <div className="lg:col-span-1">
            <div className="glass-panel p-6 rounded-2xl h-full flex flex-col relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 blur-[50px] rounded-full pointer-events-none"></div>
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <span className="text-xl">✨</span> Advisor AI
              </h3>
              <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar text-gray-300 text-sm leading-relaxed space-y-4">
                {insights ? (
                  <p className="whitespace-pre-line">{insights.summary}</p>
                ) : (
                  <div className="animate-pulse space-y-2">
                    <div className="h-2 bg-gray-700 rounded w-3/4"></div>
                    <div className="h-2 bg-gray-700 rounded w-full"></div>
                    <div className="h-2 bg-gray-700 rounded w-5/6"></div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Loan Payoff */}
          <div className="glass-panel p-6 rounded-2xl">
            <h3 className="text-lg font-semibold mb-4 text-secondary">Debt Freedom</h3>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={loanData}>
                <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: 'none' }} />
                <Line type="monotone" dataKey="remaining" stroke="#ec4899" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Retirement */}
          <div className="glass-panel p-6 rounded-2xl">
            <h3 className="text-lg font-semibold mb-4 text-primary">Retirement Corpus</h3>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={retirementData}>
                <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: 'none' }} />
                <Line type="monotone" dataKey="corpus" stroke="#6366f1" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Spending Clusters */}
          <div className="glass-panel p-6 rounded-2xl lg:col-span-1">
            <h3 className="text-lg font-semibold mb-4 opacity-80">Spending Tiers</h3>
            <div className="space-y-3">
              {spendingClusters.map((item, idx) => (
                <div key={idx} className="flex justify-between items-center p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
                  <div>
                    <p className="text-sm text-gray-300">{item.category}</p>
                    <p className={`text-xs ${item.cluster.includes("High") ? "text-red-400" : "text-green-400"
                      }`}>{item.cluster}</p>
                  </div>
                  <span className="font-mono text-white">₹{item.amount}</span>
                </div>
              ))}
              {spendingClusters.length === 0 && <p className="text-sm text-gray-500">No expense data to cluster.</p>}
            </div>
          </div>

        </div>

        {/* What-if Simulation (Full Width) */}
        <div className="glass-panel p-8 rounded-2xl">
          <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
            <div>
              <h3 className="text-2xl font-bold">Simulator</h3>
              <p className="text-gray-400 text-sm">See how saving more impacts your future.</p>
            </div>
            <div className="flex items-center gap-6 bg-black/30 p-4 rounded-xl border border-white/10">
              <span className="text-sm text-gray-400">Save extra:</span>
              <input
                type="range"
                min="1000"
                max="50000"
                step="1000"
                value={deltaSavings}
                onChange={(e) => setDeltaSavings(e.target.value)}
                className="w-48 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-accent"
              />
              <span className="font-mono text-accent text-lg">+₹{parseInt(deltaSavings).toLocaleString()}</span>
              <button onClick={runSimulation} className="bg-accent text-black px-4 py-2 rounded-lg font-bold text-sm hover:opacity-90 transition-opacity">
                Run
              </button>
            </div>
          </div>

          {simulateData.base.length > 0 && (
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart>
                <defs>
                  <linearGradient id="colorBump" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.1} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                <XAxis dataKey="date" stroke="#666" />
                <YAxis stroke="#666" />
                <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: 'none' }} />
                <Legend />
                <Area type="monotone" dataKey="value" data={simulateData.base} name="Current Path" stroke="#666" fill="transparent" strokeDasharray="5 5" />
                <Area type="monotone" dataKey="value" data={simulateData.bump} name="With Extra Savings" stroke="#10b981" fill="url(#colorBump)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

      </motion.div>
    </div >
  );
}
