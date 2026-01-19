import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

export default function BudgetWidget({ totalSpent, budgetLimit, onSetBudget }) {
    const [isEditing, setIsEditing] = useState(false);
    const [newLimit, setNewLimit] = useState(budgetLimit || '');

    useEffect(() => {
        setNewLimit(budgetLimit || '');
    }, [budgetLimit]);

    const handleSave = () => {
        if (!newLimit || parseFloat(newLimit) <= 0) return;
        onSetBudget(parseFloat(newLimit));
        setIsEditing(false);
    };

    const percentage = budgetLimit > 0 ? (totalSpent / budgetLimit) * 100 : 0;

    // Determine color based on percentage
    let progressBarColor = 'bg-green-500';
    let textColor = 'text-green-400';

    if (percentage >= 100) {
        progressBarColor = 'bg-red-500';
        textColor = 'text-red-400';
    } else if (percentage >= 80) {
        progressBarColor = 'bg-yellow-500';
        textColor = 'text-yellow-400';
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-8 border border-white border-opacity-10 rounded-sm"
            style={{ fontFamily: '"Source Code Pro", monospace' }}
        >
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-xs tracking-widest uppercase opacity-60">Monthly Budget</h3>
                <button
                    onClick={() => setIsEditing(!isEditing)}
                    className="text-xs border border-white border-opacity-20 px-3 py-1 hover:bg-white hover:bg-opacity-5"
                >
                    {isEditing ? 'Cancel' : (budgetLimit ? 'Edit' : 'Set Budget')}
                </button>
            </div>

            {isEditing ? (
                <div className="mb-4">
                    <label className="text-xs opacity-60 block mb-2">Set Monthly Limit (₹)</label>
                    <div className="flex gap-2">
                        <input
                            type="number"
                            value={newLimit}
                            onChange={(e) => setNewLimit(e.target.value)}
                            className="bg-transparent border border-white border-opacity-20 p-2 text-sm w-full focus:outline-none"
                            placeholder="e.g. 20000"
                        />
                        <button
                            onClick={handleSave}
                            className="bg-white text-black px-4 text-xs uppercase tracking-widest hover:bg-opacity-90 transition-colors"
                        >
                            Save
                        </button>
                    </div>
                </div>
            ) : null}

            {budgetLimit ? (
                <div>
                    <div className="flex justify-between items-end mb-2">
                        <div>
                            <span className={`text-2xl font-light ${textColor}`}>₹{totalSpent.toLocaleString()}</span>
                            <span className="text-xs opacity-40 ml-2">spent of ₹{budgetLimit.toLocaleString()}</span>
                        </div>
                        <span className={`text-xs ${textColor}`}>{Math.min(percentage, 100).toFixed(0)}%</span>
                    </div>

                    {/* Progress Bar Container */}
                    <div className="w-full bg-white bg-opacity-5 h-2 rounded-full overflow-hidden">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${Math.min(percentage, 100)}%` }}
                            transition={{ duration: 1, ease: "easeOut" }}
                            className={`h-full ${progressBarColor}`}
                        />
                    </div>

                    {percentage >= 100 && (
                        <div className="mt-3 text-xs text-red-400 opacity-90">
                            ⚠️ You have exceeded your monthly budget.
                        </div>
                    )}
                    {percentage >= 80 && percentage < 100 && (
                        <div className="mt-3 text-xs text-yellow-400 opacity-90">
                            ⚠️ You are nearing your budget limit.
                        </div>
                    )}
                </div>
            ) : (
                !isEditing && (
                    <div className="text-center py-6 opacity-40 text-sm">
                        No budget set. Click "Set Budget" to track your spending.
                    </div>
                )
            )}
        </motion.div>
    );
}
