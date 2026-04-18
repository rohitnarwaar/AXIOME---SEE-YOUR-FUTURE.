"use client";
import { useEffect, useState, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import analyzeFinance from "@/utils/analyzeFinance";
import {
    LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    PieChart, Pie, Cell
} from "recharts";
import { db } from "@/lib/firebase";
import { collection, query, orderBy, limit, getDocs, doc, getDoc, setDoc, onSnapshot, addDoc, deleteDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import { useAuth } from "@/contexts/AuthContext";

// Daily-use feature components
import DailyScoreWidget from "@/components/DailyScoreWidget";
import TodaySummaryWidget from "@/components/TodaySummaryWidget";
import QuickAddTransaction from "@/components/QuickAddTransaction";
import RecentTransactions from "@/components/RecentTransactions";
import GoalsWidget from "@/components/GoalsWidget";
import StreaksWidget from "@/components/StreaksWidget";
import AchievementsWidget from "@/components/AchievementsWidget";
import DailyTipWidget from "@/components/DailyTipWidget";
import BudgetWidget from "@/components/BudgetWidget";
import SubscriptionsWidget from "@/components/SubscriptionsWidget";

// Mobile-specific components
import MobileHeader from "@/components/MobileHeader";
import MobileNavigation from "@/components/MobileNavigation";
import DashboardMobileDaily from "@/components/DashboardMobileDaily";
import DashboardMobileWealth from "@/components/DashboardMobileWealth";
import DashboardMobileInsights from "@/components/DashboardMobileInsights";

export default function Dashboard() {
    const [userRole, setUserRole] = useState("admin"); // "admin" or "viewer"
    const [formData, setFormData] = useState({});
    const [insights, setInsights] = useState(null);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(true);
    const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);
    const { currentUser, logout, checkOnboardingStatus } = useAuth();
    const router = useRouter();

    const [forecastData, setForecastData] = useState([]);
    const [loanData, setLoanData] = useState([]);
    const [retirementData, setRetirementData] = useState([]);
    const [simulateData, setSimulateData] = useState([]);
    const [deltaSavings, setDeltaSavings] = useState(5000);
    const [spendingClusters, setSpendingClusters] = useState([]);
    const [isSpendingExpanded, setIsSpendingExpanded] = useState(false);
    const [editingCategory, setEditingCategory] = useState(null);

    // Daily-use feature state
    const [transactions, setTransactions] = useState([]);
    const [subscriptions, setSubscriptions] = useState([]);
    const [goals, setGoals] = useState([]);
    const [streaks, setStreaks] = useState(null);
    const [achievements, setAchievements] = useState([]);
    const [dailyInsights, setDailyInsights] = useState(null);
    const [budgetLimit, setBudgetLimit] = useState(0);
    const [categoryBudgets, setCategoryBudgets] = useState({});
    const [showAddTransaction, setShowAddTransaction] = useState(false);
    const [activeView, setActiveView] = useState("wealth"); // "wealth" or "daily"
    const [sidebarOpen, setSidebarOpen] = useState(false); // mobile sidebar toggle

    const handleLogout = async () => {
        try {
            await logout();
            router.push('/');
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

        // 3. Subscriptions Listener
        const qSubscriptions = query(
            collection(db, "users", currentUser.uid, "subscriptions"),
            orderBy("createdAt", "desc")
        );
        const unsubscribeSubscriptions = onSnapshot(qSubscriptions, (snapshot) => {
            const subsData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setSubscriptions(subsData);
        }, (error) => {
            console.error("Error fetching subscriptions:", error);
        });

        return () => {
            unsubscribeTransactions();
            unsubscribeGoals();
            unsubscribeSubscriptions();
        };
    }, [currentUser]);

    // 3. User Settings Listener (for Budget — overall + per-category)
    useEffect(() => {
        if (!currentUser?.uid) return;
        const unsubscribeSettings = onSnapshot(doc(db, "users", currentUser.uid, "settings", "budget"), (docSnap) => {
            if (docSnap.exists()) {
                const data = docSnap.data();
                setBudgetLimit(data.limit || 0);
                setCategoryBudgets(data.categories || {});
            }
        });
        return () => unsubscribeSettings();
    }, [currentUser]);

    // 3b. Compute per-category spend from this month's expense transactions
    const categorySpend = useMemo(() => {
        if (!transactions) return {};
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();
        const map = {};
        transactions
            .filter(t => {
                const d = new Date(t.date);
                return d.getMonth() === currentMonth &&
                    d.getFullYear() === currentYear &&
                    t.type === 'expense';
            })
            .forEach(t => {
                const cat = t.category || 'Other';
                map[cat] = (map[cat] || 0) + (parseFloat(t.amount) || 0);
            });
        return map;
    }, [transactions]);

    // 4. Calculate Monthly Spent & Income
    const { monthlySpent, monthlyIncome } = useMemo(() => {
        if (!transactions) return { monthlySpent: 0, monthlyIncome: 0 };
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

        return { monthlySpent: spent, monthlyIncome: earned };
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

                fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/analyze/clusters`, {
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

    // --- Update Budget Category ---
    const handleUpdateCategory = async (category, newAmount) => {
        setEditingCategory(null);
        if (!newAmount || isNaN(newAmount) || parseFloat(newAmount) < 0) return;

        try {
            const fieldMap = {
                'Rent': 'rent',
                'Food': 'food',
                'Transport': 'transport',
                'Utilities': 'utilities',
                'Misc': 'misc',
                'EMI': 'monthlyEmi'
            };
            const field = fieldMap[category];
            if (!field) return;

            await setDoc(doc(db, "userProfiles", currentUser.uid), {
                [field]: parseFloat(newAmount)
            }, { merge: true });

            // Refresh profile data
            const userDocData = await getDoc(doc(db, "userProfiles", currentUser.uid));
            if (userDocData.exists()) {
                setFormData(userDocData.data());
                // Trigger re-fetch of clusters
                fetchClusters(userDocData.data());
            }
        } catch (err) {
            console.error("Update failed", err);
        }
    };

    const fetchClusters = (userData) => {
        const expensePayload = {
            Rent: parseFloat(userData.rent || 0),
            Food: parseFloat(userData.food || 0),
            Transport: parseFloat(userData.transport || 0),
            Utilities: parseFloat(userData.utilities || 0),
            Misc: parseFloat(userData.misc || 0),
            EMI: parseFloat(userData.monthlyEmi || userData.emi || 0)
        };

        fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/analyze/clusters`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ expenses: expensePayload }),
        })
            .then((res) => res.json())
            .then((data) => {
                setSpendingClusters(data.clusters || []);
            })
            .catch((err) => console.error("Cluster fetch failed", err));
    };

    // --- What-if Simulation ---
    const runSimulation = async () => {
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/simulate`, {
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
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/insights/daily`, {
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
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/streaks`, {
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
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/achievements`, {
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
        // Close modal after addition as requested
        setShowAddTransaction(false);
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
            const settingsRef = doc(db, "users", currentUser.uid, "settings", "budget");
            const { setDoc: fsSetDoc } = await import("firebase/firestore");
            await fsSetDoc(settingsRef, { limit }, { merge: true });
        } catch (error) {
            console.error("Failed to set budget:", error);
        }
    };

    // Set a single category's budget, then auto-compute overall limit
    const handleSetCategoryBudget = async (category, amount) => {
        if (!currentUser?.uid) return;
        try {
            const updated = { ...categoryBudgets, [category]: parseFloat(amount) || 0 };
            const autoLimit = Object.values(updated).reduce((s, v) => s + v, 0);
            const settingsRef = doc(db, "users", currentUser.uid, "settings", "budget");
            const { setDoc: fsSetDoc } = await import("firebase/firestore");
            await fsSetDoc(settingsRef, { categories: updated, limit: autoLimit }, { merge: true });
        } catch (error) {
            console.error("Failed to set category budget:", error);
        }
    };

    // --- Subscription CRUD ---
    const handleAddSubscription = async (subData) => {
        if (!currentUser?.uid) return;
        try {
            await addDoc(collection(db, "users", currentUser.uid, "subscriptions"), {
                ...subData,
                startDate: new Date().toISOString(),
                createdAt: serverTimestamp()
            });
        } catch (error) {
            console.error("Failed to add subscription:", error);
        }
    };

    const handleUpdateSubscription = async (id, updates) => {
        if (!currentUser?.uid) return;
        try {
            const subRef = doc(db, "users", currentUser.uid, "subscriptions", id);
            await updateDoc(subRef, updates);
        } catch (error) {
            console.error("Failed to update subscription:", error);
        }
    };

    const handleDeleteSubscription = async (id) => {
        if (!currentUser?.uid) return;
        try {
            await deleteDoc(doc(db, "users", currentUser.uid, "subscriptions", id));
        } catch (error) {
            console.error("Failed to delete subscription:", error);
        }
    };

    // --- Auto-pay: Create transactions for due subscriptions ---
    const autoPayProcessedRef = useRef(new Set());

    useEffect(() => {
        if (!currentUser?.uid || !subscriptions || subscriptions.length === 0) return;

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const todayStr = today.toISOString().split('T')[0];

        const processAutoPayments = async () => {
            for (const sub of subscriptions) {
                if (sub.status !== 'active' || !sub.nextBillingDate) continue;

                // Skip if already processed in this browser session
                const sessionKey = `${sub.id}_${sub.nextBillingDate}`;
                if (autoPayProcessedRef.current.has(sessionKey)) continue;

                const billingDate = new Date(sub.nextBillingDate);
                billingDate.setHours(0, 0, 0, 0);

                // Skip if billing date is in the future
                if (billingDate > today) continue;

                // Skip if already auto-logged for this billing cycle (persisted check)
                if (sub.lastAutoLogged) {
                    const lastLogged = new Date(sub.lastAutoLogged);
                    lastLogged.setHours(0, 0, 0, 0);
                    if (lastLogged >= billingDate) {
                        autoPayProcessedRef.current.add(sessionKey);
                        continue;
                    }
                }

                // Mark as processed BEFORE writing to prevent re-entry
                autoPayProcessedRef.current.add(sessionKey);

                try {
                    // 1. Create the transaction
                    await addDoc(collection(db, "users", currentUser.uid, "transactions"), {
                        amount: parseFloat(sub.amount) || 0,
                        category: 'Subscription',
                        description: `${sub.name} (auto-pay)`,
                        type: 'expense',
                        date: new Date(sub.nextBillingDate).toISOString(),
                        createdAt: serverTimestamp(),
                        autoGenerated: true,
                        subscriptionId: sub.id,
                    });

                    // 2. Advance the nextBillingDate
                    const next = new Date(sub.nextBillingDate);
                    if (sub.billingCycle === 'yearly') {
                        next.setFullYear(next.getFullYear() + 1);
                    } else if (sub.billingCycle === 'weekly') {
                        next.setDate(next.getDate() + 7);
                    } else {
                        next.setMonth(next.getMonth() + 1);
                    }

                    // 3. Mark as auto-logged and update next date
                    const subRef = doc(db, "users", currentUser.uid, "subscriptions", sub.id);
                    await updateDoc(subRef, {
                        nextBillingDate: next.toISOString(),
                        lastAutoLogged: new Date().toISOString(),
                    });

                    console.log(`Auto-pay: ${sub.name} → ₹${sub.amount} logged, next: ${next.toLocaleDateString()}`);
                } catch (error) {
                    console.error(`Auto-pay failed for ${sub.name}:`, error);
                    // Remove from processed so it can retry
                    autoPayProcessedRef.current.delete(sessionKey);
                }
            }
        };

        processAutoPayments();
    }, [currentUser, subscriptions]);

    // React to data changes to update insights
    useEffect(() => {
        const loadInsights = async () => {
            if (formData && Object.keys(formData).length > 0) {
                await fetchDailyInsights();
                await fetchStreaks();
                await fetchAchievements();
            }
        };
        loadInsights();
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

        // Calculate total planned expenses from Spending Architecture
        const plannedExpenses = (
            parseFloat(formData.rent || 0) +
            parseFloat(formData.food || 0) +
            parseFloat(formData.transport || 0) +
            parseFloat(formData.utilities || 0) +
            parseFloat(formData.misc || 0) +
            parseFloat(formData.monthlyEmi || formData.emi || 0)
        );

        // Savings = Income - Architecture Budget
        // This ensures the graphs react immediately when you optimize your Spending Architecture.
        const dynamicSavings = income - plannedExpenses;

        // totalIncome for Advisor context (Profile + Real-time Incomings)
        const totalIncome = income + monthlyIncome;

        // 1. Forecast API
        fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/forecast`, {
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

        fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/retirement`, {
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

        if (realPrincipal > 0 && emi > 0) {
            fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/loan-payoff`, {
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
        fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/analyze`, {
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

    // --- Onboarding redirect (must be before early returns to maintain hook order) ---
    useEffect(() => {
        if (!loading && !hasCompletedOnboarding) {
            router.push('/onboarding');
        }
    }, [loading, hasCompletedOnboarding, router]);

    if (loading) return (
        <div className="min-h-screen bg-white flex items-center justify-center font-mono">
            <p className="text-sm tracking-widest uppercase">Loading your financial universe...</p>
        </div>
    );

    // ... (rest of the render logic same as before)
    if (error && !formData.income) return (
        <div className="min-h-screen bg-white flex flex-col items-center justify-center px-6 font-mono">
            <p className="text-sm tracking-widest uppercase text-red-600 mb-4">{error}</p>
            <button
                onClick={() => router.push('/')}
                className="px-6 py-2 border-2 border-black text-xs tracking-widest uppercase hover:bg-black hover:text-white transition-colors"
            >
                Go Home
            </button>
        </div>
    );

    if (!hasCompletedOnboarding) {
        return null;
    }

    const userName = currentUser?.displayName || formData?.name || currentUser?.email?.split('@')[0] || 'User';

    // Monthly Breakdown Data
    const pieData = [
        { name: 'Income', value: monthlyIncome, color: '#000000' },
        { name: 'Expenses', value: monthlySpent, color: '#e5e5e5' }
    ];
    const hasData = monthlyIncome > 0 || monthlySpent > 0;
    const netCashflow = monthlyIncome - monthlySpent;

    return (
        <div className="min-h-screen bg-white text-black flex font-mono">


            {/* ========== MOBILE LAYOUT ========== */}
            <div className="md:hidden w-full bg-white min-h-screen font-mono">
                <MobileHeader 
                    onMenuClick={() => setSidebarOpen(true)} 
                    userName={userName}
                />

                <main className="w-full">
                    <motion.div
                        key={`mobile-${activeView}`}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.4 }}
                    >
                        {activeView === "daily" && (
                            <DashboardMobileDaily 
                                transactions={transactions}
                                monthlyIncome={monthlyIncome}
                                monthlySpent={monthlySpent}
                                dailyInsights={dailyInsights}
                                subscriptions={subscriptions}
                                formData={formData}
                                goals={goals}
                                streaks={streaks}
                                achievements={achievements}
                                budgetLimit={budgetLimit}
                                categorySpend={categorySpend}
                                categoryBudgets={categoryBudgets}
                                userRole={userRole}
                                currentUser={currentUser}
                                onCreateGoal={handleCreateGoal}
                                onSetBudget={handleSetBudget}
                                onSetCategoryBudget={handleSetCategoryBudget}
                                onAddSubscription={handleAddSubscription}
                                onUpdateSubscription={handleUpdateSubscription}
                                onDeleteSubscription={handleDeleteSubscription}
                                onRefreshInsights={fetchDailyInsights}
                                showAddTransaction={showAddTransaction}
                                setShowAddTransaction={setShowAddTransaction}
                                onTransactionAdded={handleTransactionAdded}
                            />
                        )}

                        {activeView === "wealth" && (
                            <DashboardMobileWealth 
                                forecastData={forecastData}
                                formData={formData}
                                spendingClusters={spendingClusters}
                                monthlySpent={monthlySpent}
                                monthlyIncome={monthlyIncome}
                                insights={insights}
                            />
                        )}

                        {activeView === "insights" && (
                            <DashboardMobileInsights 
                                loanData={loanData}
                                retirementData={retirementData}
                                deltaSavings={deltaSavings}
                                setDeltaSavings={setDeltaSavings}
                                runSimulation={runSimulation}
                                simulateData={simulateData}
                                userRole={userRole}
                            />
                        )}

                        {activeView === "profile" && (
                            <div className="flex flex-col items-center justify-center min-h-screen px-6 space-y-8 pt-20 pb-32">
                                <div className="w-24 h-24 bg-black/[0.03] border border-black/5 flex items-center justify-center overflow-hidden">
                                    <span className="text-4xl uppercase opacity-40 font-bold">{userName?.charAt(0) || 'U'}</span>
                                </div>
                                <div className="text-center space-y-2">
                                    <p className="text-sm tracking-[0.2em] font-bold uppercase opacity-30 italic">User Profile</p>
                                    <h2 className="text-2xl font-bold tracking-tight">{userName}</h2>
                                    <p className="text-xs opacity-40 uppercase tracking-widest">{currentUser?.email}</p>
                                </div>

                                {/* Role Switcher (Mobile) */}
                                <div className="w-full pt-6">
                                    <p className="text-[10px] tracking-widest uppercase opacity-40 mb-3 text-center">Access Level</p>
                                    <div className="flex border border-black/10 overflow-hidden">
                                        <button
                                            onClick={() => setUserRole('admin')}
                                            className={`flex-1 py-3 text-[10px] font-bold uppercase tracking-[0.2em] transition-all ${
                                                userRole === 'admin'
                                                    ? 'bg-black text-white'
                                                    : 'bg-white text-black/40 hover:text-black/70'
                                            }`}
                                        >
                                            Admin
                                        </button>
                                        <button
                                            onClick={() => setUserRole('viewer')}
                                            className={`flex-1 py-3 text-[10px] font-bold uppercase tracking-[0.2em] transition-all ${
                                                userRole === 'viewer'
                                                    ? 'bg-black text-white'
                                                    : 'bg-white text-black/40 hover:text-black/70'
                                            }`}
                                        >
                                            Viewer
                                        </button>
                                    </div>
                                    {userRole === 'viewer' && (
                                        <p className="text-[10px] text-yellow-600 mt-2 tracking-wide text-center">Read-only mode active</p>
                                    )}
                                </div>

                                <div className="w-full space-y-3 pt-4">
                                    <button 
                                        onClick={() => navigate('/')}
                                        className="w-full bg-black text-white py-4 text-[10px] font-bold uppercase tracking-[0.3em] hover:bg-black/90 transition-all border border-black"
                                    >
                                        Home
                                    </button>
                                    <button 
                                        onClick={handleLogout}
                                        className="w-full bg-white text-red-500 py-4 text-[10px] font-bold uppercase tracking-[0.3em] hover:bg-red-50 transition-all border border-red-500/10"
                                    >
                                        Logout
                                    </button>
                                </div>
                            </div>
                        )}
                    </motion.div>
                </main>

                <MobileNavigation 
                    activeView={activeView} 
                    onTabChange={setActiveView} 
                />
            </div>


            {/* ========== DESKTOP LAYOUT (Perfect as it is) ========== */}
            <div className="hidden md:flex w-full min-h-screen">

            {/* ========== SIDEBAR (Left) ========== */}
            <motion.aside
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.6 }}
                className={`
                    fixed top-0 left-0 h-screen w-64 bg-white border-r border-black/10
                    flex flex-col justify-between py-10 px-8 z-40
                    transition-transform duration-300 ease-in-out
                    ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
                    md:translate-x-0
                `}
            >
                {/* Top Section */}
                <div>
                    {/* Brand */}
                    <div className="mb-12">
                        <h1 className="text-sm tracking-[0.3em] uppercase font-bold">AXIOMÉ</h1>
                        <div className="h-px bg-black/10 mt-4" />
                    </div>

                    {/* User Identity */}
                    <div className="mb-12">
                        <p className="text-[10px] tracking-widest uppercase opacity-40 mb-2 font-bold">Welcome back</p>
                        <p className="text-sm tracking-wide font-bold truncate">{userName}</p>
                    </div>

                    {/* Navigation */}
                    <nav className="space-y-2 mb-12">
                        <p className="text-[10px] tracking-widest uppercase opacity-40 mb-3 font-bold">Dashboard</p>

                        <button
                            onClick={() => { setActiveView("wealth"); setSidebarOpen(false); }}
                            className={`
                                w-full text-left px-4 py-3 text-xs tracking-widest uppercase font-bold transition-all duration-200
                                ${activeView === "wealth"
                                    ? "bg-black text-white"
                                    : "hover:bg-black/5"
                                }
                            `}
                        >
                            ◈ Wealth
                        </button>

                        <button
                            onClick={() => { setActiveView("daily"); setSidebarOpen(false); }}
                            className={`
                                w-full text-left px-4 py-3 text-xs tracking-widest uppercase font-bold transition-all duration-200
                                ${activeView === "daily"
                                    ? "bg-black text-white"
                                    : "hover:bg-black/5"
                                }
                            `}
                        >
                            ◉ Daily
                        </button>
                    </nav>

                    {/* Role Switcher */}
                    <div className="mb-8">
                        <p className="text-[10px] tracking-widest uppercase opacity-40 mb-3">Access</p>
                        <div className="border border-black/10 px-3 py-2 flex items-center justify-between">
                            <span className="text-[10px] uppercase tracking-widest opacity-60">Role</span>
                            <select
                                value={userRole}
                                onChange={(e) => setUserRole(e.target.value)}
                                className="bg-transparent text-xs tracking-wider uppercase focus:outline-none cursor-pointer text-right"
                            >
                                <option value="admin">Admin</option>
                                <option value="viewer">Viewer</option>
                            </select>
                        </div>
                        {userRole === 'viewer' && (
                            <p className="text-[10px] text-yellow-600 mt-2 tracking-wide">Read-only mode active</p>
                        )}
                    </div>
                </div>

                {/* Bottom Section — Actions */}
                <div className="space-y-1">
                    <div className="h-px bg-black/10 mb-4" />
                    <button onClick={() => router.push('/')} className="w-full text-left px-4 py-2 text-xs tracking-widest uppercase opacity-50 hover:opacity-100 transition-opacity">
                        Home
                    </button>
                    <button onClick={() => router.push('/upload')} className="w-full text-left px-4 py-2 text-xs tracking-widest uppercase opacity-50 hover:opacity-100 transition-opacity">
                        Upload
                    </button>
                    <button onClick={handleLogout} className="w-full text-left px-4 py-2 text-xs tracking-widest uppercase opacity-50 hover:opacity-100 transition-opacity text-red-500">
                        Logout
                    </button>
                </div>
            </motion.aside>

            {/* ========== MAIN CONTENT (Flexible + Right Panel) ========== */}
            <main className="flex-1 md:ml-64 min-h-screen">
                <motion.div
                    key={activeView}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="px-8 lg:px-12 py-12"
                >
                    {/* ===== WEALTH VIEW ===== */}
                    {activeView === "wealth" && (
                        <div className="lg:grid lg:grid-cols-[1fr_380px]">
                            {/* Wealth: Primary Column */}
                            <div className="lg:pr-16">
                                <header className="mb-16">
                                    <p className="text-[10px] tracking-widest uppercase opacity-40 mb-3 font-bold">Financial Intelligence</p>
                                    <h2 className="text-4xl font-bold tracking-wide uppercase mb-4">
                                        Wealth Overview
                                    </h2>
                                    <p className="text-sm opacity-60 tracking-wide font-medium">
                                        Your long-term financial trajectory and growth.
                                    </p>
                                </header>

                                {/* Net Worth Forecast */}
                                <div className="mb-16" id="net-worth">
                                    <h3 className="text-xs tracking-widest uppercase mb-8 opacity-60 font-bold">NET WORTH FORECAST</h3>
                                    <p className="text-3xl font-bold mb-8">
                                        ₹{forecastData.length > 0 ? Math.round(forecastData[forecastData.length - 1].netWorth).toLocaleString() : "---"}
                                    </p>
                                    <ResponsiveContainer width="100%" height={350}>
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

                                <div className="h-px bg-black opacity-[0.05] mb-16" />

                                {/* Charts Grid — Debt + Retirement */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-16">
                                    <div id="debt">
                                        <h3 className="text-xs tracking-widest uppercase mb-8 opacity-60 font-bold">DEBT FREEDOM</h3>
                                        {loanData.length > 0 ? (
                                            <ResponsiveContainer width="100%" height={200}>
                                                <LineChart data={loanData}>
                                                    <CartesianGrid strokeDasharray="3 3" stroke="#ddd" vertical={false} />
                                                    <XAxis stroke="#999" fontSize={10} tickLine={false} axisLine={false} />
                                                    <YAxis stroke="#999" fontSize={10} tickLine={false} axisLine={false} />
                                                    <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #ddd' }} />
                                                    <Line type="monotone" dataKey="remaining" stroke="#000" strokeWidth={2} dot={false} />
                                                </LineChart>
                                            </ResponsiveContainer>
                                        ) : (
                                            <motion.div
                                                initial={{ opacity: 0, scale: 0.95 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                className="h-[200px] flex flex-col items-center justify-center bg-black/[0.02] border border-black/5 rounded-sm p-8 text-center"
                                            >
                                                <div className="w-10 h-10 mb-4 bg-black text-white rounded-full flex items-center justify-center text-sm shadow-sm">✓</div>
                                                <h4 className="text-[10px] tracking-[0.2em] font-bold uppercase mb-2">You are Debt-Free</h4>
                                                <p className="text-[10px] opacity-40 uppercase tracking-widest leading-relaxed max-w-[200px]">
                                                    A clean slate is the strongest foundation for wealth.
                                                </p>
                                            </motion.div>
                                        )}
                                    </div>

                                    <div id="retirement">
                                        <h3 className="text-xs tracking-widest uppercase mb-8 opacity-60 font-bold">RETIREMENT CORPUS</h3>
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

                                <div className="h-px bg-black opacity-[0.05] mb-16" />

                                {/* AI Financial Advisor — Central Insight */}
                                <div className="mb-16" id="ai-advisor">
                                    <h3 className="text-xs tracking-widest uppercase mb-8 opacity-60 font-bold">AI INSIGHTS</h3>
                                    <div className="bg-black/[0.02] border border-black/5 p-10 rounded-sm">
                                        <div className="text-sm leading-relaxed opacity-80">
                                            {insights ? (
                                                <p className="whitespace-pre-line">{insights.summary}</p>
                                            ) : (
                                                <p className="opacity-50 italic">Synthesizing data...</p>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="h-px bg-black opacity-[0.05] mb-16" />

                                {/* What-if Simulator */}
                                <div className="mb-16" id="simulator">
                                    <div className="mb-8">
                                        <h3 className="text-xs tracking-widest uppercase mb-4 opacity-60 font-bold">SIMULATOR</h3>
                                        <p className="text-sm opacity-60 font-medium">See how saving more impacts your future.</p>
                                    </div>

                                    <div className="flex flex-wrap items-center gap-6 mb-8">
                                        <span className="text-xs tracking-white opacity-60 uppercase tracking-tighter">Save Extra</span>
                                        <input
                                            type="range"
                                            min="1000"
                                            max="50000"
                                            step="1000"
                                            value={deltaSavings}
                                            onChange={(e) => setDeltaSavings(e.target.value)}
                                            disabled={userRole === 'viewer'}
                                            className="grow md:grow-0 w-48 h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-black"
                                        />
                                        <span className="text-sm font-medium">₹{parseInt(deltaSavings).toLocaleString()}</span>
                                        <button
                                            onClick={runSimulation}
                                            disabled={userRole === 'viewer'}
                                            className="px-6 py-2 border border-black text-xs tracking-widest uppercase hover:bg-black hover:text-white transition-colors"
                                        >
                                            Simulate
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
                                                <Legend iconType="circle" />
                                                <Area type="monotone" dataKey="baseValue" name="Current Path" stroke="#999" fill="transparent" strokeDasharray="5 5" />
                                                <Area type="monotone" dataKey="bumpValue" name="Proposed Path" stroke="#000" fill="url(#colorBump)" strokeWidth={2} />
                                            </AreaChart>
                                        </ResponsiveContainer>
                                    )}
                                </div>
                            </div>

                            {/* Wealth: Intelligence Panel (Right) */}
                            <div className="hidden lg:block border-l border-black/[0.08] pl-16">
                                <div className="sticky top-12 space-y-12">
                                    {/* Monthly Cashflow Donut */}
                                    <div className="bg-black/[0.01] border border-black/5 p-8 rounded-sm">
                                        <h3 className="text-[10px] tracking-widest uppercase opacity-40 mb-6">This Month Breakdown</h3>

                                        <div className="relative h-48 flex items-center justify-center">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <PieChart>
                                                    <Pie
                                                        data={hasData ? pieData : [{ value: 1 }]}
                                                        innerRadius={60}
                                                        outerRadius={80}
                                                        paddingAngle={5}
                                                        dataKey="value"
                                                        stroke="none"
                                                    >
                                                        {hasData ? (
                                                            pieData.map((entry, index) => (
                                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                                            ))
                                                        ) : (
                                                            <Cell fill="#f3f4f6" />
                                                        )}
                                                    </Pie>
                                                    <Tooltip
                                                        enabled={hasData}
                                                        contentStyle={{
                                                            fontSize: '10px',
                                                            border: '1px solid #eee',
                                                            borderRadius: '0px'
                                                        }}
                                                    />
                                                </PieChart>
                                            </ResponsiveContainer>

                                            {/* Center Text */}
                                            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                                                {hasData ? (
                                                    <>
                                                        <span className="text-[10px] uppercase opacity-40 tracking-tighter">Net</span>
                                                        <span className={`text-sm font-mono ${netCashflow >= 0 ? 'text-black' : 'text-red-500'}`}>
                                                            {netCashflow >= 0 ? '+' : ''}₹{Math.abs(Math.round(netCashflow)).toLocaleString()}
                                                        </span>
                                                    </>
                                                ) : (
                                                    <span className="text-[10px] uppercase opacity-30">No Data</span>
                                                )}
                                            </div>
                                        </div>

                                        {/* Legend */}
                                        <div className="mt-6 space-y-3">
                                            <div className="flex justify-between items-center text-[10px] tracking-widest uppercase">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-2 h-2 bg-black" />
                                                    <span className="opacity-60">Income</span>
                                                </div>
                                                <span className="font-mono">₹{monthlyIncome.toLocaleString()}</span>
                                            </div>
                                            <div className="flex justify-between items-center text-[10px] tracking-widest uppercase">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-2 h-2 bg-[#e5e5e5]" />
                                                    <span className="opacity-60">Expenses</span>
                                                </div>
                                                <span className="font-mono">₹{monthlySpent.toLocaleString()}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Spending Tiers Card */}
                                    <div id="spending-tiers">
                                        <button
                                            onClick={() => setIsSpendingExpanded(!isSpendingExpanded)}
                                            className="w-full flex justify-between items-center mb-6 group"
                                        >
                                            <h3 className="text-[10px] tracking-widest uppercase opacity-40 font-bold">Spending Architecture</h3>
                                            <span className="text-[10px] opacity-40 group-hover:opacity-100 transition-opacity">
                                                {isSpendingExpanded ? '[-]' : '[+]'}
                                            </span>
                                        </button>
                                        <motion.div
                                            initial={false}
                                            animate={{
                                                height: isSpendingExpanded ? 'auto' : 0,
                                                opacity: isSpendingExpanded ? 1 : 0
                                            }}
                                            transition={{ duration: 0.3, ease: [0.04, 0.62, 0.23, 0.98] }}
                                            className="overflow-hidden"
                                        >
                                            <div className="space-y-4">
                                                {spendingClusters.map((item, idx) => (
                                                    <div
                                                        key={idx}
                                                        className={`group relative flex justify-between items-center py-3 border-b border-black/[0.08] hover:bg-black/[0.005] transition-colors ${userRole === 'admin' ? 'cursor-pointer' : 'cursor-default'}`}
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            if (userRole === 'admin') setEditingCategory(item.category);
                                                        }}
                                                    >
                                                        <div>
                                                            <p className="text-xs uppercase tracking-widest">{item.category}</p>
                                                            <p className="text-[10px] opacity-40 mt-1 uppercase">{item.cluster}</p>
                                                        </div>
                                                        {editingCategory === item.category ? (
                                                            <div onClick={(e) => e.stopPropagation()}>
                                                                <input
                                                                    type="number"
                                                                    autoFocus
                                                                    defaultValue={item.amount}
                                                                    onBlur={(e) => handleUpdateCategory(item.category, e.target.value)}
                                                                    onKeyDown={(e) => e.key === 'Enter' && handleUpdateCategory(item.category, e.target.value)}
                                                                    className="w-24 bg-white border border-black px-2 py-1 text-xs font-mono text-right focus:outline-none"
                                                                />
                                                            </div>
                                                        ) : (
                                                            <div className="flex items-center gap-3">
                                                                <span className="text-xs font-mono">₹{item.amount.toLocaleString()}</span>
                                                                {userRole === 'admin' && <span className="text-[10px] opacity-0 group-hover:opacity-40 transition-opacity">EDIT</span>}
                                                            </div>
                                                        )}
                                                    </div>
                                                ))}
                                                {spendingClusters.length === 0 && <p className="text-xs opacity-50 px-1 py-4">No budget data synced.</p>}
                                            </div>
                                        </motion.div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ===== DAILY VIEW ===== */}
                    {activeView === "daily" && (
                        <div className="lg:grid lg:grid-cols-[1fr_380px]">
                            {/* Daily: Primary Column */}
                            <div className="lg:pr-16">
                                <header className="mb-16">
                                    <p className="text-[10px] tracking-widest uppercase opacity-40 mb-3 font-bold">Operational Finance</p>
                                    <h2 className="text-4xl font-bold tracking-wide uppercase mb-4">
                                        Daily Finances
                                    </h2>
                                    <p className="text-sm opacity-60 tracking-wide font-medium">
                                        Real-time cashflow and active goals.
                                    </p>
                                </header>

                                {/* Daily Overview Grid */}
                                <div className="mb-12">
                                    <DailyScoreWidget userData={formData} transactions={transactions} />
                                </div>

                                {/* Daily Financial Architecture: Stacked Budget/Goals + Subscriptions Side-by-Side */}
                                <div className="grid grid-cols-1 md:grid-cols-[1fr_400px] gap-12 mb-16 items-start">
                                    {/* Left Stack: Primary Controls */}
                                    <div className="space-y-16">
                                        <BudgetWidget
                                            totalSpent={monthlySpent}
                                            budgetLimit={budgetLimit}
                                            onSetBudget={handleSetBudget}
                                            categorySpend={categorySpend}
                                            categoryBudgets={categoryBudgets}
                                            onSetCategoryBudget={handleSetCategoryBudget}
                                            disabled={userRole === 'viewer'}
                                        />
                                        <div className="h-px bg-black opacity-[0.05]" />
                                        <GoalsWidget goals={goals} onCreateGoal={handleCreateGoal} disabled={userRole === 'viewer'} />
                                    </div>

                                    {/* Right: Recurring Commitments */}
                                    <SubscriptionsWidget
                                        subscriptions={subscriptions}
                                        onAdd={handleAddSubscription}
                                        onUpdate={handleUpdateSubscription}
                                        onDelete={handleDeleteSubscription}
                                        disabled={userRole === 'viewer'}
                                    />
                                </div>

                                <div className="h-px bg-black opacity-[0.05] mb-12" />

                                {/* Transaction History */}
                                <RecentTransactions transactions={transactions} onRefresh={fetchDailyInsights} />
                            </div>

                            {/* Daily: Intelligence Panel (Right) */}
                            <div className="hidden lg:block border-l border-black/[0.08] pl-16">
                                <div className="sticky top-12 space-y-12">
                                    {/* Today Summary */}
                                    <div className="bg-black/[0.02] border border-black/5 p-8 rounded-sm">
                                        <TodaySummaryWidget todaySummary={dailyInsights?.todaySummary} />
                                    </div>

                                    {/* Daily Tip */}
                                    <div className="border border-black/10 p-6 rounded-sm bg-white">
                                        <h3 className="text-[10px] tracking-widest uppercase mb-4 opacity-40 font-bold">Daily Optimization</h3>
                                        <DailyTipWidget userData={formData} transactions={transactions} />
                                    </div>

                                    {/* Streaks & Progress */}
                                    <div className="space-y-6">
                                        <h3 className="text-[10px] tracking-widest uppercase opacity-40 font-bold">Psychological Momentum</h3>
                                        <StreaksWidget streaks={streaks} />
                                        <AchievementsWidget achievements={achievements} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    </motion.div>
                </main>

                {/* Floating Add Transaction Button (Desktop Only - Mobile has it in navigation or drawer) */}
                {activeView === "daily" && userRole === 'admin' && (
                    <motion.button
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.5, type: "spring" }}
                        onClick={() => setShowAddTransaction(true)}
                        className="fixed bottom-8 right-8 w-16 h-16 bg-black text-white rounded-full flex items-center justify-center text-2xl shadow-lg hover:scale-110 transition-transform z-30"
                    >
                        +
                    </motion.button>
                )}
            </div>

            <QuickAddTransaction
                isOpen={showAddTransaction}
                onClose={() => setShowAddTransaction(false)}
                onAdd={handleTransactionAdded}
                currentUser={currentUser}
            />
        </div>
    );
}
