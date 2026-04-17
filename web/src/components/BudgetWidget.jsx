import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// ─── Category color palette ────────────────────────────────
const CATEGORY_COLORS = {
    'Food / Grocery': '#f59e0b',
    'Dine out / Outing': '#f97316',
    'Travel': '#3b82f6',
    'Shopping': '#8b5cf6',
    'Personal Care': '#ec4899',
    'Subscription': '#6366f1',
    'Misc': '#6b7280',
    // Legacy fallbacks for old transactions
    'Food': '#f59e0b',
    'Transport': '#3b82f6',
    'Utilities': '#6366f1',
    'Entertainment': '#ec4899',
    'Health': '#10b981',
    'Other': '#6b7280',
};

function getCategoryColor(cat) {
    return CATEGORY_COLORS[cat] || '#6b7280';
}

// ─── Progress bar color based on percentage ────────────────
function getBarStatus(pct) {
    if (pct >= 100) return { bar: '#ef4444', text: 'text-red-500', label: '🔴 Over budget' };
    if (pct >= 80) return { bar: '#eab308', text: 'text-yellow-500', label: '⚠️ Nearing limit' };
    return { bar: '#22c55e', text: 'text-green-500', label: null };
}

// ─── Component ─────────────────────────────────────────────
export default function BudgetWidget({
    totalSpent,
    budgetLimit,
    onSetBudget,
    categorySpend = {},
    categoryBudgets = {},
    onSetCategoryBudget,
    disabled
}) {
    const [editingCategory, setEditingCategory] = useState(null);
    const [editValue, setEditValue] = useState('');

    const overallPct = budgetLimit > 0 ? (totalSpent / budgetLimit) * 100 : 0;
    const overallStatus = getBarStatus(overallPct);

    // ─── Build sorted category rows ────────────────────────
    // Show every category that has spend this month, plus any that have a budget set
    const categoryRows = useMemo(() => {
        const allCats = new Set([
            ...Object.keys(categorySpend),
            ...Object.keys(categoryBudgets).filter(k => categoryBudgets[k] > 0),
        ]);

        return Array.from(allCats)
            .map(cat => {
                const spent = categorySpend[cat] || 0;
                const budget = categoryBudgets[cat] || 0;
                const pct = budget > 0 ? (spent / budget) * 100 : -1; // -1 = no budget set
                return { category: cat, spent, budget, pct };
            })
            .sort((a, b) => {
                // Over-budget first
                const aOver = a.pct >= 100 ? 1 : 0;
                const bOver = b.pct >= 100 ? 1 : 0;
                if (aOver !== bOver) return bOver - aOver;
                // Then by spend descending
                return b.spent - a.spent;
            });
    }, [categorySpend, categoryBudgets]);

    const hasBudgets = Object.values(categoryBudgets).some(v => v > 0);

    // ─── Inline edit handlers ──────────────────────────────
    const startEdit = (cat) => {
        setEditingCategory(cat);
        setEditValue(categoryBudgets[cat] || '');
    };

    const saveEdit = () => {
        if (editingCategory && onSetCategoryBudget) {
            onSetCategoryBudget(editingCategory, parseFloat(editValue) || 0);
        }
        setEditingCategory(null);
        setEditValue('');
    };

    const cancelEdit = () => {
        setEditingCategory(null);
        setEditValue('');
    };

    // ─── Render ────────────────────────────────────────────
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-mono"
        >
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-xs tracking-widest uppercase opacity-60 font-bold">Monthly Budget</h3>
            </div>

            {/* Overall Budget Summary */}
            {budgetLimit > 0 ? (
                <div className="mb-8">
                    <div className="flex justify-between items-end mb-2">
                        <div>
                            <span className={`text-2xl font-bold ${overallStatus.text}`}>
                                ₹{Math.round(totalSpent).toLocaleString()}
                            </span>
                            <span className="text-xs opacity-40 ml-2 font-bold">
                                of ₹{Math.round(budgetLimit).toLocaleString()}
                            </span>
                        </div>
                        <span className={`text-xs font-bold font-mono ${overallStatus.text}`}>
                            {Math.min(overallPct, 100).toFixed(0)}%
                        </span>
                    </div>

                    <div className="w-full bg-black/[0.04] h-2 rounded-full overflow-hidden">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${Math.min(overallPct, 100)}%` }}
                            transition={{ duration: 1, ease: 'easeOut' }}
                            className="h-full rounded-full"
                            style={{ backgroundColor: overallStatus.bar }}
                        />
                    </div>

                    {overallStatus.label && (
                        <p className={`mt-2 text-[10px] tracking-wide ${overallStatus.text} opacity-80`}>
                            {overallStatus.label}
                        </p>
                    )}
                </div>
            ) : (
                <div className="mb-8 py-4 text-center">
                    <p className="text-sm opacity-40 mb-1">No budget set yet</p>
                    <p className="text-[10px] tracking-wide opacity-25">
                        Set a budget for any category below to start tracking
                    </p>
                </div>
            )}

            {/* Category Breakdown */}
            {categoryRows.length > 0 && (
                <div>
                    <div className="flex items-center gap-3 mb-5">
                        <div className="flex-1 h-px bg-black/[0.06]" />
                        <span className="text-[9px] tracking-[0.2em] uppercase opacity-30 font-bold">
                            Category Breakdown
                        </span>
                        <div className="flex-1 h-px bg-black/[0.06]" />
                    </div>

                    <div className="space-y-4">
                        <AnimatePresence mode="popLayout">
                            {categoryRows.map(({ category, spent, budget, pct }) => {
                                const catColor = getCategoryColor(category);
                                const hasBudget = budget > 0;
                                const status = hasBudget ? getBarStatus(pct) : null;
                                const isEditing = editingCategory === category;

                                return (
                                    <motion.div
                                        key={category}
                                        layout
                                        initial={{ opacity: 0, y: 8 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -8 }}
                                        className="group"
                                    >
                                        {/* Category header row */}
                                        <div className="flex items-center justify-between mb-1.5">
                                            <div className="flex items-center gap-2">
                                                <div
                                                    className="w-2 h-2 rounded-full flex-shrink-0"
                                                    style={{ backgroundColor: catColor }}
                                                />
                                                <span className="text-xs tracking-wide font-bold">{category}</span>
                                            </div>

                                            <div className="flex items-center gap-2">
                                                <span className="text-xs font-bold font-mono">
                                                    ₹{Math.round(spent).toLocaleString()}
                                                </span>

                                                {isEditing ? (
                                                    <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                                                        <span className="text-[10px] opacity-30">/</span>
                                                        <input
                                                            type="number"
                                                            value={editValue}
                                                            onChange={(e) => setEditValue(e.target.value)}
                                                            onKeyDown={(e) => {
                                                                if (e.key === 'Enter') saveEdit();
                                                                if (e.key === 'Escape') cancelEdit();
                                                            }}
                                                            onBlur={saveEdit}
                                                            autoFocus
                                                            placeholder="₹ limit"
                                                            className="w-20 bg-transparent border border-black/20 px-1.5 py-0.5 text-[11px] font-mono text-right focus:outline-none focus:border-black/40"
                                                        />
                                                    </div>
                                                ) : hasBudget ? (
                                                    <button
                                                        onClick={() => !disabled && startEdit(category)}
                                                        className="flex items-center gap-1 group/edit"
                                                    >
                                                        <span className="text-[10px] opacity-30">/</span>
                                                        <span className="text-[11px] font-mono opacity-40 group-hover/edit:opacity-70 transition-opacity">
                                                            ₹{Math.round(budget).toLocaleString()}
                                                        </span>
                                                    </button>
                                                ) : !disabled ? (
                                                    <button
                                                        onClick={() => startEdit(category)}
                                                        className="text-[9px] tracking-widest uppercase opacity-0 group-hover:opacity-40 hover:!opacity-70 transition-opacity px-1.5 py-0.5 border border-black/10"
                                                    >
                                                        Set
                                                    </button>
                                                ) : null}

                                                {hasBudget && status && (
                                                    <span className={`text-[10px] font-bold font-mono ${status.text}`}>
                                                        {Math.min(pct, 999).toFixed(0)}%
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        {/* Progress bar */}
                                        {hasBudget ? (
                                            <div className="w-full bg-black/[0.04] h-1.5 rounded-full overflow-hidden">
                                                <motion.div
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${Math.min(pct, 100)}%` }}
                                                    transition={{ duration: 0.8, ease: 'easeOut', delay: 0.1 }}
                                                    className="h-full rounded-full"
                                                    style={{ backgroundColor: status?.bar || catColor }}
                                                />
                                            </div>
                                        ) : (
                                            <div className="w-full bg-black/[0.03] h-1.5 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full rounded-full opacity-20"
                                                    style={{ width: '100%', backgroundColor: catColor }}
                                                />
                                            </div>
                                        )}
                                    </motion.div>
                                );
                            })}
                        </AnimatePresence>
                    </div>
                </div>
            )}

            {/* Empty state — no transactions at all */}
            {categoryRows.length === 0 && !budgetLimit && (
                <div className="text-center py-8 opacity-40 text-sm">
                    Add transactions to see your spending breakdown.
                </div>
            )}
        </motion.div>
    );
}
