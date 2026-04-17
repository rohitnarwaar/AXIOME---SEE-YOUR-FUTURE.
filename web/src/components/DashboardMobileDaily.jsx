import { motion } from "framer-motion";
import DailyScoreWidget from "./DailyScoreWidget";
import TodaySummaryWidget from "./TodaySummaryWidget";
import BudgetWidget from "./BudgetWidget";
import GoalsWidget from "./GoalsWidget";
import SubscriptionsWidget from "./SubscriptionsWidget";
import RecentTransactions from "./RecentTransactions";
import DailyTipWidget from "./DailyTipWidget";
import StreaksWidget from "./StreaksWidget";
import AchievementsWidget from "./AchievementsWidget";
import QuickAddTransaction from "./QuickAddTransaction";

export default function DashboardMobileDaily({
    transactions,
    monthlyIncome,
    monthlySpent,
    dailyInsights,
    subscriptions,
    formData,
    goals,
    streaks,
    achievements,
    budgetLimit,
    categorySpend,
    categoryBudgets,
    userRole,
    currentUser,
    onCreateGoal,
    onSetBudget,
    onSetCategoryBudget,
    onAddSubscription,
    onUpdateSubscription,
    onDeleteSubscription,
    onRefreshInsights,
    showAddTransaction,
    setShowAddTransaction,
    onTransactionAdded,
}) {
    return (
        <div className="flex flex-col gap-12 pb-32 pt-20 px-4 font-mono">

            {/* ── Header ── */}
            <div>
                <p className="text-[10px] tracking-widest uppercase opacity-40 mb-3 font-bold">Operational Finance</p>
                <h2 className="text-3xl font-bold tracking-wide uppercase mb-2">Daily Finances</h2>
                <p className="text-sm opacity-60 tracking-wide font-medium">Real-time cashflow and active goals.</p>
            </div>

            {/* ── Daily Score ── */}
            <DailyScoreWidget userData={formData} transactions={transactions} />

            <div className="h-px bg-black opacity-[0.05]" />

            {/* ── Today Summary ── */}
            <div className="bg-black/[0.02] border border-black/5 p-6 rounded-sm">
                <TodaySummaryWidget todaySummary={dailyInsights?.todaySummary} />
            </div>

            <div className="h-px bg-black opacity-[0.05]" />

            {/* ── Budget ── */}
            <BudgetWidget
                totalSpent={monthlySpent}
                budgetLimit={budgetLimit}
                onSetBudget={onSetBudget}
                categorySpend={categorySpend}
                categoryBudgets={categoryBudgets}
                onSetCategoryBudget={onSetCategoryBudget}
                disabled={userRole === 'viewer'}
            />

            <div className="h-px bg-black opacity-[0.05]" />

            {/* ── Goals ── */}
            <GoalsWidget
                goals={goals}
                onCreateGoal={onCreateGoal}
                disabled={userRole === 'viewer'}
            />

            <div className="h-px bg-black opacity-[0.05]" />

            {/* ── Subscriptions ── */}
            <SubscriptionsWidget
                subscriptions={subscriptions}
                onAdd={onAddSubscription}
                onUpdate={onUpdateSubscription}
                onDelete={onDeleteSubscription}
                disabled={userRole === 'viewer'}
            />

            <div className="h-px bg-black opacity-[0.05]" />

            {/* ── Transactions ── */}
            <RecentTransactions transactions={transactions} onRefresh={onRefreshInsights} />

            <div className="h-px bg-black opacity-[0.05]" />

            {/* ── Daily Tip ── */}
            <div className="border border-black/10 p-6 rounded-sm bg-white">
                <h3 className="text-[10px] tracking-widest uppercase mb-4 opacity-40 font-bold">Daily Optimization</h3>
                <DailyTipWidget userData={formData} transactions={transactions} />
            </div>

            <div className="h-px bg-black opacity-[0.05]" />

            {/* ── Streaks & Achievements ── */}
            <div className="space-y-6">
                <h3 className="text-[10px] tracking-widest uppercase opacity-40 font-bold">Psychological Momentum</h3>
                <StreaksWidget streaks={streaks} />
                <AchievementsWidget achievements={achievements} />
            </div>

            {/* ── Floating Add Transaction ── */}
            {userRole === 'admin' && (
                <motion.button
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.5, type: "spring" }}
                    onClick={() => setShowAddTransaction(true)}
                    className="fixed bottom-24 right-6 w-14 h-14 bg-black text-white rounded-full flex items-center justify-center text-2xl shadow-lg hover:scale-110 transition-transform z-30"
                >
                    +
                </motion.button>
            )}

            <QuickAddTransaction
                isOpen={showAddTransaction}
                onClose={() => setShowAddTransaction(false)}
                onAdd={onTransactionAdded}
                currentUser={currentUser}
            />
        </div>
    );
}
