import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import analyzeFinance from "../utils/analyzeFinance";
import {
    LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from "recharts";
import { db } from "../firebase";
import { collection, query, orderBy, limit, getDocs, doc, getDoc, onSnapshot, addDoc, serverTimestamp } from "firebase/firestore";
import { useAuth } from "../contexts/AuthContext";

// Daily-use feature components
import DailyScoreWidget from "../components/DailyScoreWidget";
import TodaySummaryWidget from "../components/TodaySummaryWidget";
import QuickAddTransaction from "../components/QuickAddTransaction";
import RecentTransactions from "../components/RecentTransactions";
import GoalsWidget from "../components/GoalsWidget";
import StreaksWidget from "../components/StreaksWidget";
import AchievementsWidget from "../components/AchievementsWidget";
import DailyTipWidget from "../components/DailyTipWidget";
import BudgetWidget from "../components/BudgetWidget";

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
    const [simulateData, setSimulateData] = useState([]);
    const [deltaSavings, setDeltaSavings] = useState(5000);
    const [spendingClusters, setSpendingClusters] = useState([]);

    // Daily-use feature state
    const [transactions, setTransactions] = useState([]);
    const [goals, setGoals] = useState([]);
    const [streaks, setStreaks] = useState(null);
    const [achievements, setAchievements] = useState([]);
    const [dailyInsights, setDailyInsights] = useState(null);
    const [budgetLimit, setBudgetLimit] = useState(0);
    const [monthlySpent, setMonthlySpent] = useState(0);
    const [monthlyIncome, setMonthlyIncome] = useState(0);
    const [showAddTransaction, setShowAddTransaction] = useState(false);

    const handleLogout = async () => {
        try {
            await logout();
            navigate('/');
        } catch (error) {
            console.error('Failed to log out:', error);
        }
    };

    // --- Firestore Real-time Listeners ---
    useEffect(() => {
        if (!currentUser?.uid) return;

        // 1. Transactions Listener
        const qTransactions = query(
            collection(db, "users", currentUser.uid, "transactions"),
            orderBy("date", "desc")
        );
        const unsubscribeTransactions = onSnapshot(qTransactions, (snapshot) => {
            const txns = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setTransactions(txns);
        }, (error) => {
            console.error("Error fetching transactions:", error);
        });

        // 2. Goals Listener
        const qGoals = query(
            collection(db, "users", currentUser.uid, "goals"),
            orderBy("createdAt", "desc")
        );
        const unsubscribeGoals = onSnapshot(qGoals, (snapshot) => {
            const goalsData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setGoals(goalsData);
        }, (error) => {
            console.error("Error fetching goals:", error);
        });

        return () => {
            unsubscribeTransactions();
            unsubscribeGoals();
        };
    }, [currentUser]);

    // 3. User Settings Listener (for Budget)
    useEffect(() => {
        if (!currentUser?.uid) return;
        const unsubscribeSettings = onSnapshot(doc(db, "users", currentUser.uid, "settings", "budget"), (docSnap) => {
            if (docSnap.exists()) {
                setBudgetLimit(docSnap.data().limit || 0);
            }
        });
        return () => unsubscribeSettings();
    }, [currentUser]);

    // 4. Calculate Monthly Spent
    useEffect(() => {
        if (!transactions) return;
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();

        const spent = transactions
            .filter(t => {
                const d = new Date(t.date);
                return d.getMonth() === currentMonth &&
                    d.getFullYear() === currentYear &&
                    t.type === 'expense';
            })
            .reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0);

        const earned = transactions
            .filter(t => {
                const d = new Date(t.date);
                return d.getMonth() === currentMonth &&
                    d.getFullYear() === currentYear &&
                    t.type === 'income';
            })
            .reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0);

        setMonthlySpent(spent);
        setMonthlyIncome(earned);
    }, [transactions]);

    useEffect(() => {
        const fetchUserDataAndCheckOnboarding = async () => {
            // ... (keep existing loading logic, relying on listeners for txns)
            // But we still need to load USER PROFILE data once
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
                    setLoading(false);
                    return;
                }

                // User has completed onboarding, fetch their profile data
                const userDoc = await getDoc(doc(db, "userProfiles", currentUser.uid));
                if (!userDoc.exists()) {
                    setError("No user data found. Please complete the onboarding form.");
                    setHasCompletedOnboarding(false);
                    setLoading(false);
                    return;
                }

                const userData = userDoc.data();
                setFormData(userData);

                // --- Analyze Finance & Loan Payoff moved to dynamic useEffect ---
                // We do this to ensure they use the latest transaction data along with profile data.



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

                // --- Spending Clusters removed from here as it was duplicated in replacement above (wait, I need to check target) ---
                // Actually I am replacing the whole block including spending clusters logic in the target, so I should just let the first block handle Loan and Clusters.
                // But wait, the previous block I wrote handles Loan and Clusters.
                // And I removed Forecast and Retirement from it.
                // So now I need to add the useEffect for Forecast and Retirement.

                // Let's add the useEffect AFTER the fetchUserDataAndCheckOnboarding function or inside the component body.
                // Logic:
                // 1. Remove the static fetch block from `fetchUserDataAndCheckOnboarding` (done in chunk 1).
                // 2. Add new `useEffect` hook.


                setLoading(false);
            } catch (err) {
                console.error(err);
                setError("Error loading dashboard data.");
                setLoading(false);
            }
        };

        fetchUserDataAndCheckOnboarding();
    }, [currentUser, checkOnboardingStatus]);

    // --- Auto-scroll to section based on hash ---
    useEffect(() => {
        if (!loading && window.location.hash) {
            const id = window.location.hash.replace("#", "");
            const element = document.getElementById(id);
            if (element) {
                setTimeout(() => {
                    element.scrollIntoView({ behavior: "smooth", block: "start" });
                }, 500);
            }
        }
    }, [loading]);

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

            const mergedData = (data.base || []).map((item, index) => {
                const bumpItem = (data.bump || [])[index] || {};
                return {
                    date: item.ds?.slice(0, 10),
                    baseValue: parseFloat(item.yhat),
                    bumpValue: parseFloat(bumpItem.yhat)
                };
            });
            setSimulateData(mergedData);
        } catch (e) {
            console.error(e);
            setError("Simulation failed.");
        }
    };

    // --- Daily-use Features Functions ---
    const fetchDailyInsights = async () => {
        // Only fetch if we have form data
        if (!formData || Object.keys(formData).length === 0) return;

        try {
            const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/insights/daily`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    userData: formData,
                    transactions // Using latest state from Firestore listener
                })
            });
            if (res.ok) {
                const data = await res.json();
                setDailyInsights(data);
            }
        } catch (error) {
            console.error("Failed to fetch daily insights:", error);
        }
    };

    const fetchStreaks = async () => {
        try {
            const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/streaks`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ transactions })
            });
            if (res.ok) {
                const data = await res.json();
                setStreaks(data.streaks);
            }
        } catch (error) {
            console.error("Failed to fetch streaks:", error);
        }
    };

    const fetchAchievements = async () => {
        try {
            const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/achievements`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    userData: formData,
                    transactions,
                    goals
                })
            });
            if (res.ok) {
                const data = await res.json();
                setAchievements(data.achievements);
            }
        } catch (error) {
            console.error("Failed to fetch achievements:", error);
        }
    };

    const handleTransactionAdded = (transaction) => {
        // No manual state update needed, Firestore listener handles it
        // setShowAddTransaction(false); // <--- Removed to keep modal open for multiple adds
    };

    const handleCreateGoal = async (goalData) => {
        if (!currentUser?.uid) return;

        try {
            // Write to Firestore instead of API
            await addDoc(collection(db, "users", currentUser.uid, "goals"), {
                ...goalData,
                currentAmount: 0,
                progress: 0,
                createdAt: serverTimestamp()
            });
            // Listener will update state
        } catch (error) {
            console.error("Failed to create goal:", error);
        }
    };

    const handleSetBudget = async (limit) => {
        if (!currentUser?.uid) return;
        try {
            // Write to settings subcollection
            const settingsRef = doc(db, "users", currentUser.uid, "settings", "budget");
            // Use setDoc with merge: true or just setDoc, settings might not exist
            const { setDoc } = await import("firebase/firestore");
            await setDoc(settingsRef, { limit }, { merge: true });
        } catch (error) {
            console.error("Failed to set budget:", error);
        }
    };

    // React to data changes to update insights
    useEffect(() => {
        if (formData && Object.keys(formData).length > 0) {
            fetchDailyInsights();
            fetchStreaks();
            fetchAchievements();
        }
    }, [formData, transactions, goals]); // Depend on transactions/goals to re-run analysis

    // --- Dynamic Forecasts (Real-time Integration) ---
    useEffect(() => {
        if (!formData || Object.keys(formData).length === 0) return;

        // Calculate Real Savings: Income (Profile) - Monthly Spent (Real-time)
        // If Monthly Spent is 0 (start of month), maybe fallback to profile expenses?
        // For "Connected" feel, let's use:
        // Savings = Income - Max(ProfileExpenses, MonthlySpent) 
        // OR just Income - MonthlySpent (but that implies 0 expenses at start of month = massive savings forecast)
        // Let's use: Estimated Savings = Income - (MonthlySpent + EstimatedRemainingFixedExpenses?)
        // To keep it simple and requested: "If I spend more, forecast drops".
        // Let's use: Estimated Savings = Income - monthlySpent. 
        // But we should clamp it reasonable.

        const income = parseFloat(formData.income || 0);
        // Combine Profile Income with Real-time Income?
        // Usually Profile Income is "Expected Monthly Salary".
        // Real-time Income is "Actual Money Received".
        // If user logs their salary, we shouldn't double count.
        // A simple heuristic: If MonthlyIncome > 0, use it as the base? 
        // Or just ADD `monthlyIncome` (assuming they are extra incomings)?
        // For simplicity and "connection": Let's assume Profile is BASE, and Transactions are ACTUAL flows.
        // If I add "Salary" transaction, I want it to count.
        // Let's use: TotalIncome = Max(ProfileIncome, monthlyIncome) ? 
        // Or just ProfileIncome + monthlyIncome (if Profile is just 'base' and they log specific checks).
        // Let's go with: Total Available = (ProfileIncome) - monthlySpent. 
        // Wait, if I add an Income transaction, it should OFFSET the spending.
        // So Savings = ProfileIncome + monthlyIncome - monthlySpent.

        const totalIncome = income + monthlyIncome;

        // Dynamic Savings Calculation (Allow negative to show crash)
        const dynamicSavings = totalIncome - monthlySpent;

        // 1. Forecast API
        fetch(`${import.meta.env.VITE_API_BASE_URL}/forecast`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                monthlySaving: dynamicSavings,
                months: 120
            }),
        })
            .then(res => res.json())
            .then(data => {
                const series = data.series || data;
                if (Array.isArray(series)) {
                    setForecastData(series.map((d) => ({
                        date: d.ds?.slice(0, 10),
                        netWorth: parseFloat(d.yhat || 0),
                    })));
                }
            })
            .catch(err => console.error("Dynamic forecast failed:", err));

        // 2. Retirement API
        const initialSavings = parseFloat(formData.savings || 0);

        fetch(`${import.meta.env.VITE_API_BASE_URL}/retirement`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                currentSavings: initialSavings,
                monthlyContribution: dynamicSavings,
                annualReturnRate: 0.08,
                months: 360,
            }),
        })
            .then(res => res.json())
            .then(data => {
                const corpus = data.corpus || data;
                if (Array.isArray(corpus)) {
                    setRetirementData(corpus.map((d) => ({
                        date: d.month,
                        corpus: parseFloat(d.projected_corpus || 0),
                    })));
                }
            })
            .catch(err => console.error("Dynamic retirement failed:", err));

        // 3. Dynamic Loan Payoff
        // Calculate total debt payments from transactions matching 'Debt', 'Loan', 'EMI'
        const debtPaid = transactions
            .filter(t =>
                t.type === 'expense' &&
                ['debt', 'loan', 'emi', 'repayment'].some(k => t.category?.toLowerCase().includes(k) || t.description?.toLowerCase().includes(k))
            )
            .reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0);

        const initialLoan = parseFloat(formData.loanAmount || 0);
        const emi = parseFloat(formData.emi || formData.monthlyEMI || 0);
        const rate = parseFloat(formData.interestRate || 0.1);
        const realPrincipal = Math.max(0, initialLoan - debtPaid);

        if (initialLoan > 0 && emi > 0) {
            fetch(`${import.meta.env.VITE_API_BASE_URL}/loan-payoff`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    principal: realPrincipal,
                    monthlyEmi: emi,
                    annualInterestRate: rate,
                }),
            })
                .then(res => res.json())
                .then(data => {
                    const timeline = data.timeline || data;
                    if (Array.isArray(timeline)) {
                        setLoanData(timeline.map((d) => ({
                            date: d.month,
                            remaining: parseFloat(d.remaining || 0),
                        })));
                    }
                })
                .catch(err => console.error("Dynamic loan fetch failed:", err));
        }

        // 4. Dynamic Advisor AI
        fetch(`${import.meta.env.VITE_API_BASE_URL}/analyze`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                context: {
                    ...formData,
                    real_income: totalIncome,
                    real_expenses: monthlySpent
                }
            }),
        })
            .then(res => res.json())
            .then(result => {
                if (result.summary) setInsights(result);
            })
            .catch(err => console.error("Dynamic AI fetch failed:", err));

    }, [formData, monthlySpent, monthlyIncome, transactions]);

    if (loading) return (
        <div className="min-h-screen bg-white flex items-center justify-center" style={{ fontFamily: '"Source Code Pro", monospace' }}>
            <p className="text-sm tracking-widest uppercase">Loading your financial universe...</p>
        </div>
    );

    // ... (rest of the render logic same as before)
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

    if (!hasCompletedOnboarding) {
        navigate('/onboarding');
        return null;
    }

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
                    <button onClick={() => navigate('/upload')} className="hover:opacity-70 transition-opacity">Upload</button>
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

                {/* DAILY-USE FEATURES SECTION */}
                <div className="mb-16 space-y-8">
                    {/* Daily Overview Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <DailyScoreWidget userData={formData} transactions={transactions} />
                        <TodaySummaryWidget todaySummary={dailyInsights?.todaySummary} />
                    </div>

                    {/* Daily Tip */}
                    <DailyTipWidget userData={formData} transactions={transactions} />

                    {/* Gamification Grid */}
                    <StreaksWidget streaks={streaks} />
                    <AchievementsWidget achievements={achievements} />
                </div>

                {/* Budget & Goals Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <BudgetWidget totalSpent={monthlySpent} budgetLimit={budgetLimit} onSetBudget={handleSetBudget} />
                    <GoalsWidget goals={goals} onCreateGoal={handleCreateGoal} />
                </div>

                {/* Recent Transactions (Full Width) */}
                <RecentTransactions transactions={transactions} onRefresh={fetchDailyInsights} />

                {/* Horizontal Line Separator */}
                <div className="h-px bg-black opacity-20 mb-16" />

                {/* Net Worth Forecast */}
                <div className="mb-16" id="net-worth">
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
                <div className="mb-16" id="ai-advisor">
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
                    <div id="debt">
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
                    <div id="retirement">
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
                <div className="mb-16" id="spending-tiers">
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
                <div className="mb-16" id="simulator">
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
                            className="w-48 h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-black hover:bg-gray-300 transition-colors"
                        />
                        <span className="text-sm">+₹{parseInt(deltaSavings).toLocaleString()}</span>
                        <button
                            onClick={runSimulation}
                            className="px-6 py-2 border border-black text-xs tracking-widest uppercase hover:bg-black hover:text-white transition-colors"
                        >
                            Run
                        </button>
                    </div>

                    {simulateData.length > 0 && (
                        <ResponsiveContainer width="100%" height={300}>
                            <AreaChart data={simulateData}>
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
                                <Area type="monotone" dataKey="baseValue" name="Current Path" stroke="#999" fill="transparent" strokeDasharray="5 5" />
                                <Area type="monotone" dataKey="bumpValue" name="With Extra Savings" stroke="#000" fill="url(#colorBump)" strokeWidth={2} />
                            </AreaChart>
                        </ResponsiveContainer>
                    )}
                </div>
            </motion.div >

            {/* Floating Add Transaction Button */}
            < motion.button
                initial={{ scale: 0 }
                }
                animate={{ scale: 1 }}
                transition={{ delay: 0.5, type: "spring" }}
                onClick={() => setShowAddTransaction(true)}
                className="fixed bottom-8 right-8 w-16 h-16 bg-black text-white rounded-full flex items-center justify-center text-2xl shadow-lg hover:scale-110 transition-transform z-30"
                style={{ fontFamily: '"Source Code Pro", monospace' }}
            >
                +
            </motion.button >

            {/* Quick Add Transaction Modal */}
            < QuickAddTransaction
                isOpen={showAddTransaction}
                onClose={() => setShowAddTransaction(false)}
                onAdd={handleTransactionAdded}
                currentUser={currentUser}
            />
        </div >
    );
}
