import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import analyzeFinance from "../utils/analyzeFinance";
import {
  LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from "recharts";
import { db } from "../firebase";
import { collection, query, orderBy, limit, getDocs, doc, getDoc } from "firebase/firestore";
import { useAuth } from "../contexts/AuthContext";

export default function Dashboard() {
  const [formData, setFormData] = useState({});
  const [insights, setInsights] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);
  const { currentUser, logout, checkOnboardingStatus } = useAuth();
  const navigate = useNavigate();

  const [forecastData, setForecastData] = useState([]);
  const [loanData, setLoanData] = useState([]);
  const [retirementData, setRetirementData] = useState([]);
  const [simulateData, setSimulateData] = useState({ base: [], bump: [] });
  const [deltaSavings, setDeltaSavings] = useState(5000);
  const [spendingClusters, setSpendingClusters] = useState([]);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Failed to log out:', error);
    }
  };

  useEffect(() => {
    const fetchUserDataAndCheckOnboarding = async () => {
      setLoading(true);
      setError("");

      try {
        if (!currentUser) {
          setError("Please log in to view your dashboard.");
          setLoading(false);
          return;
        }

        // Check if user has completed onboarding
        const completed = await checkOnboardingStatus(currentUser.uid);
        setHasCompletedOnboarding(completed);

        if (!completed) {
          // User hasn't completed onboarding, show the form
          setLoading(false);
          return;
        }

        // User has completed onboarding, fetch their data
        const userDoc = await getDoc(doc(db, "userProfiles", currentUser.uid));
        if (!userDoc.exists()) {
          setError("No user data found. Please complete the onboarding form.");
          setHasCompletedOnboarding(false);
          setLoading(false);
          return;
        }

        const userData = userDoc.data();
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

        // --- Savings forecast ---
        let savings = income - expenses;
        const initialSavings = parseFloat(userData.savings || 0);

        // API requires non-negative monthly saving usually, but let's send what we have
        // If savings is negative, the backend might reject it with 400.
        // We should treat negative savings as 0 for "growth" forecast or handle debt logic.
        // For now, let's clamp valid input to avoid 400 crash.
        const effectiveMonthlySaving = Math.max(0, savings);

        fetch(`${import.meta.env.VITE_API_BASE_URL}/forecast`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            monthlySaving: effectiveMonthlySaving,
            months: 120
          }),
        })
          .then((res) => {
            if (!res.ok) throw new Error("Forecast API error " + res.status);
            return res.json();
          })
          .then((data) => {
            const series = data.series || data;
            setForecastData(
              series.map((d) => ({
                date: d.ds?.slice(0, 10),
                netWorth: parseFloat(d.yhat || 0),
              }))
            );
          })
          .catch((err) => console.error("Forecast fetch failed:", err));

        // --- Loan payoff ---
        const loanAmount = parseFloat(userData.loanAmount || 0);
        const emi = parseFloat(userData.emi || userData.monthlyEMI || 0);
        const rate = parseFloat(userData.interestRate || 0.1);
        if (loanAmount > 0 && emi > 0) {
          fetch(`${import.meta.env.VITE_API_BASE_URL}/loan-payoff`, {
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
        const currentSavings = parseFloat(userData.currentSavings || initialSavings);
        const monthlyContribution = parseFloat(userData.monthlyContribution || savings);

        fetch(`${import.meta.env.VITE_API_BASE_URL}/retirement`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            currentSavings,
            monthlyContribution: Math.max(0, monthlyContribution),
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
          .catch(() => console.log("Retirement fetch skipped or failed"));

        // --- Spending Clusters ---
        const expensePayload = {
          Rent: parseFloat(userData.rent || 0),
          Food: parseFloat(userData.food || 0),
          Transport: parseFloat(userData.transport || 0),
          Utilities: parseFloat(userData.utilities || 0),
          Misc: parseFloat(userData.misc || 0),
          EMI: parseFloat(userData.monthlyEmi || userData.emi || 0)
        };

        fetch(`${import.meta.env.VITE_API_BASE_URL}/analyze/clusters`, {
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

    fetchUserDataAndCheckOnboarding();
  }, [currentUser, checkOnboardingStatus]);

  // --- What-if Simulation ---
  const runSimulation = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/simulate`, {
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

  if (loading) return (
    <div className="min-h-screen bg-white flex items-center justify-center" style={{ fontFamily: '"Source Code Pro", monospace' }}>
      <p className="text-sm tracking-widest uppercase">Loading your financial universe...</p>
    </div>
  );

  if (error && !formData.income) return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-6" style={{ fontFamily: '"Source Code Pro", monospace' }}>
      <p className="text-sm tracking-widest uppercase text-red-600 mb-4">{error}</p>
      <button
        onClick={() => navigate('/')}
        className="px-6 py-2 border-2 border-black text-xs tracking-widest uppercase hover:bg-black hover:text-white transition-colors"
      >
        Go Home
      </button>
    </div>
  );

  // Show onboarding form if user hasn't completed it
  if (!hasCompletedOnboarding) {
    navigate('/onboarding');
    return null;
  }

  // Show dashboard for users who have completed onboarding
  return (
    <div className="min-h-screen bg-white text-black">
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
          <button onClick={handleLogout} className="hover:opacity-70 transition-opacity">Logout</button>
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
            Financial Overview
          </h1>
          <p className="text-sm opacity-60 tracking-wide">
            Welcome back. Here is your wealth trajectory.
          </p>
        </header>

        {/* Horizontal Line Separator */}
        <div className="h-px bg-black opacity-20 mb-16" />

        {/* Net Worth Forecast */}
        <div className="mb-16">
          <h3 className="text-xs tracking-widest uppercase mb-8 opacity-60">NET WORTH FORECAST</h3>
          <p className="text-3xl font-light mb-8">
            ₹{forecastData.length > 0 ? Math.round(forecastData[forecastData.length - 1].netWorth).toLocaleString() : "---"}
          </p>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={forecastData}>
              <defs>
                <linearGradient id="colorNetWorth" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#000" stopOpacity={0.1} />
                  <stop offset="95%" stopColor="#000" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#ddd" vertical={false} />
              <XAxis dataKey="date" stroke="#999" fontSize={10} tickLine={false} axisLine={false} />
              <YAxis stroke="#999" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(val) => `₹${val / 1000}k`} />
              <Tooltip
                contentStyle={{ backgroundColor: '#fff', border: '1px solid #ddd', borderRadius: '4px', fontSize: '12px' }}
                itemStyle={{ color: '#000' }}
              />
              <Area type="monotone" dataKey="netWorth" stroke="#000" strokeWidth={2} fillOpacity={1} fill="url(#colorNetWorth)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Horizontal Line Separator */}
        <div className="h-px bg-black opacity-20 mb-16" />

        {/* AI Insights */}
        <div className="mb-16">
          <h3 className="text-xs tracking-widest uppercase mb-8 opacity-60">ADVISOR AI</h3>
          <div className="text-sm leading-relaxed opacity-80 max-w-3xl">
            {insights ? (
              <p className="whitespace-pre-line">{insights.aiSummary}</p>
            ) : (
              <p className="opacity-50">Analyzing your financial data...</p>
            )}
          </div>
        </div>

        {/* Horizontal Line Separator */}
        <div className="h-px bg-black opacity-20 mb-16" />

        {/* Charts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 mb-16">
          {/* Debt Freedom */}
          <div>
            <h3 className="text-xs tracking-widest uppercase mb-8 opacity-60">DEBT FREEDOM</h3>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={loanData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ddd" vertical={false} />
                <XAxis stroke="#999" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="#999" fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #ddd' }} />
                <Line type="monotone" dataKey="remaining" stroke="#000" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Retirement Corpus */}
          <div>
            <h3 className="text-xs tracking-widest uppercase mb-8 opacity-60">RETIREMENT CORPUS</h3>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={retirementData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ddd" vertical={false} />
                <XAxis stroke="#999" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="#999" fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #ddd' }} />
                <Line type="monotone" dataKey="corpus" stroke="#000" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Horizontal Line Separator */}
        <div className="h-px bg-black opacity-20 mb-16" />

        {/* Spending Tiers */}
        <div className="mb-16">
          <h3 className="text-xs tracking-widest uppercase mb-8 opacity-60">SPENDING TIERS</h3>
          <div className="space-y-4 max-w-2xl">
            {spendingClusters.map((item, idx) => (
              <div key={idx} className="flex justify-between items-center py-3 border-b border-black/10">
                <div>
                  <p className="text-sm uppercase tracking-wide">{item.category}</p>
                  <p className="text-xs opacity-50 mt-1">{item.cluster}</p>
                </div>
                <span className="text-sm">₹{item.amount}</span>
              </div>
            ))}
            {spendingClusters.length === 0 && <p className="text-sm opacity-50">No expense data to cluster.</p>}
          </div>
        </div>

        {/* Horizontal Line Separator */}
        <div className="h-px bg-black opacity-20 mb-16" />

        {/* What-if Simulator */}
        <div className="mb-16">
          <div className="mb-8">
            <h3 className="text-xs tracking-widest uppercase mb-4 opacity-60">SIMULATOR</h3>
            <p className="text-sm opacity-60">See how saving more impacts your future.</p>
          </div>

          <div className="flex items-center gap-6 mb-8">
            <span className="text-xs tracking-wide opacity-60">SAVE EXTRA:</span>
            <input
              type="range"
              min="1000"
              max="50000"
              step="1000"
              value={deltaSavings}
              onChange={(e) => setDeltaSavings(e.target.value)}
              className="w-48 h-1 bg-gray-300 rounded-lg appearance-none cursor-pointer accent-black"
            />
            <span className="text-sm">+₹{parseInt(deltaSavings).toLocaleString()}</span>
            <button
              onClick={runSimulation}
              className="px-6 py-2 border border-black text-xs tracking-widest uppercase hover:bg-black hover:text-white transition-colors"
            >
              Run
            </button>
          </div>

          {simulateData.base.length > 0 && (
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart>
                <defs>
                  <linearGradient id="colorBump" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#000" stopOpacity={0.1} />
                    <stop offset="95%" stopColor="#000" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#ddd" vertical={false} />
                <XAxis dataKey="date" stroke="#999" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="#999" fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #ddd' }} />
                <Legend />
                <Area type="monotone" dataKey="value" data={simulateData.base} name="Current Path" stroke="#999" fill="transparent" strokeDasharray="5 5" />
                <Area type="monotone" dataKey="value" data={simulateData.bump} name="With Extra Savings" stroke="#000" fill="url(#colorBump)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </motion.div>
    </div>
  );
}
