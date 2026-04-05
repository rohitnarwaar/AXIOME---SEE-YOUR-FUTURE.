import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// ─── Helpers ───────────────────────────────────────────────
const MONTH_NAMES = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
];

function getMonday(d) {
    const date = new Date(d);
    const day = date.getDay();
    const diff = date.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(date.setDate(diff));
}

function isSameMonth(dateStr, month, year) {
    const d = new Date(dateStr);
    return d.getMonth() === month && d.getFullYear() === year;
}

function isInWeek(dateStr, refDate) {
    const d = new Date(dateStr);
    const monday = getMonday(refDate);
    monday.setHours(0, 0, 0, 0);
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    sunday.setHours(23, 59, 59, 999);
    return d >= monday && d <= sunday;
}

// ─── Component ─────────────────────────────────────────────
export default function RecentTransactions({ transactions, onRefresh }) {
    const now = new Date();

    // View state
    const [filterType, setFilterType] = useState('all');       // all | income | expense
    const [timeRange, setTimeRange] = useState('month');        // week | month
    const [viewMonth, setViewMonth] = useState(now.getMonth());
    const [viewYear, setViewYear] = useState(now.getFullYear());

    // Existing controls
    const [searchTerm, setSearchTerm] = useState('');
    const [sortOrder, setSortOrder] = useState('newest');

    const isCurrentMonth = viewMonth === now.getMonth() && viewYear === now.getFullYear();

    // ─── Month Navigation ──────────────────────────────────
    const goToPrevMonth = () => {
        if (viewMonth === 0) {
            setViewMonth(11);
            setViewYear(y => y - 1);
        } else {
            setViewMonth(m => m - 1);
        }
        // When navigating to a past month, always show full month
        setTimeRange('month');
    };

    const goToNextMonth = () => {
        if (isCurrentMonth) return; // can't go forward past current
        if (viewMonth === 11) {
            setViewMonth(0);
            setViewYear(y => y + 1);
        } else {
            setViewMonth(m => m + 1);
        }
    };

    const resetToCurrentMonth = () => {
        setViewMonth(now.getMonth());
        setViewYear(now.getFullYear());
    };

    // ─── Filter Pipeline ───────────────────────────────────
    const filteredTransactions = useMemo(() => {
        if (!transactions) return [];
        let filtered = [...transactions];

        // 1. Month filter
        filtered = filtered.filter(t => isSameMonth(t.date, viewMonth, viewYear));

        // 2. Week filter (only available in current month)
        if (timeRange === 'week' && isCurrentMonth) {
            filtered = filtered.filter(t => isInWeek(t.date, now));
        }

        // 3. Type filter
        if (filterType !== 'all') {
            filtered = filtered.filter(t => t.type === filterType);
        }

        // 4. Search
        if (searchTerm) {
            const lower = searchTerm.toLowerCase();
            filtered = filtered.filter(t =>
                (t.description || '').toLowerCase().includes(lower) ||
                (t.category || '').toLowerCase().includes(lower)
            );
        }

        // 5. Sort
        filtered.sort((a, b) => {
            if (sortOrder === 'newest') return new Date(b.date) - new Date(a.date);
            if (sortOrder === 'oldest') return new Date(a.date) - new Date(b.date);
            if (sortOrder === 'highest') return (parseFloat(b.amount) || 0) - (parseFloat(a.amount) || 0);
            if (sortOrder === 'lowest') return (parseFloat(a.amount) || 0) - (parseFloat(b.amount) || 0);
            return 0;
        });

        return filtered;
    }, [transactions, viewMonth, viewYear, timeRange, filterType, searchTerm, sortOrder]);

    // ─── Summary Stats ─────────────────────────────────────
    const stats = useMemo(() => {
        const totalIn = filteredTransactions
            .filter(t => t.type === 'income')
            .reduce((s, t) => s + (parseFloat(t.amount) || 0), 0);
        const totalOut = filteredTransactions
            .filter(t => t.type === 'expense')
            .reduce((s, t) => s + (parseFloat(t.amount) || 0), 0);
        return {
            count: filteredTransactions.length,
            totalIn,
            totalOut,
            net: totalIn - totalOut
        };
    }, [filteredTransactions]);

    // ─── Format helpers ────────────────────────────────────
    const fmt = (n) => {
        if (n >= 100000) return `₹${(n / 100000).toFixed(1)}L`;
        if (n >= 1000) return `₹${(n / 1000).toFixed(1)}K`;
        return `₹${Math.round(n).toLocaleString()}`;
    };

    // ─── Empty state ───────────────────────────────────────
    if (!transactions || transactions.length === 0) {
        return (
            <div className="p-8 border border-black/10 rounded-sm" style={{ fontFamily: '"Source Code Pro", monospace' }}>
                <h3 className="text-xs tracking-widest uppercase mb-6 opacity-60">Transaction Hub</h3>
                <p className="text-sm opacity-40">No transactions yet. Add your first entry!</p>
            </div>
        );
    }

    // ─── Tab button helper ─────────────────────────────────
    const TypeTab = ({ value, label, accentColor }) => (
        <button
            onClick={() => setFilterType(value)}
            className="relative px-5 py-2 text-[10px] tracking-[0.2em] uppercase transition-all duration-200"
            style={{
                backgroundColor: filterType === value ? (accentColor || '#000') : 'transparent',
                color: filterType === value ? '#fff' : '#000',
                border: `1px solid ${filterType === value ? (accentColor || '#000') : 'rgba(0,0,0,0.12)'}`,
                fontFamily: '"Source Code Pro", monospace',
            }}
        >
            {label}
            {filterType === value && (
                <motion.div
                    layoutId="activeTypeTab"
                    className="absolute inset-0"
                    style={{ backgroundColor: accentColor || '#000', zIndex: -1 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                />
            )}
        </button>
    );

    const RangeChip = ({ value, label }) => (
        <button
            onClick={() => setTimeRange(value)}
            className="px-4 py-1.5 text-[9px] tracking-[0.18em] uppercase transition-all duration-200"
            style={{
                backgroundColor: timeRange === value ? '#000' : 'transparent',
                color: timeRange === value ? '#fff' : 'rgba(0,0,0,0.45)',
                border: `1px solid ${timeRange === value ? '#000' : 'rgba(0,0,0,0.08)'}`,
                fontFamily: '"Source Code Pro", monospace',
            }}
        >
            {label}
        </button>
    );

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full"
            style={{ fontFamily: '"Source Code Pro", monospace' }}
        >
            {/* ─── Month Navigator ──────────────────────────── */}
            <div className="flex items-center justify-between mb-6">
                <button
                    onClick={goToPrevMonth}
                    className="w-8 h-8 flex items-center justify-center border border-black/10 hover:bg-black hover:text-white transition-all duration-200 text-xs"
                >
                    ◀
                </button>

                <button
                    onClick={resetToCurrentMonth}
                    className="group flex flex-col items-center"
                >
                    <span className="text-sm tracking-[0.25em] uppercase font-medium">
                        {MONTH_NAMES[viewMonth]} {viewYear}
                    </span>
                    {!isCurrentMonth && (
                        <motion.span
                            initial={{ opacity: 0, y: -4 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-[9px] tracking-widest uppercase opacity-40 group-hover:opacity-100 transition-opacity mt-1"
                        >
                            ↻ back to current
                        </motion.span>
                    )}
                </button>

                <button
                    onClick={goToNextMonth}
                    disabled={isCurrentMonth}
                    className={`w-8 h-8 flex items-center justify-center border border-black/10 transition-all duration-200 text-xs
                        ${isCurrentMonth ? 'opacity-20 cursor-not-allowed' : 'hover:bg-black hover:text-white'}`}
                >
                    ▶
                </button>
            </div>

            {/* ─── Historical Mode Banner ───────────────────── */}
            <AnimatePresence>
                {!isCurrentMonth && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                    >
                        <div className="mb-5 px-4 py-2.5 border border-dashed border-black/15 bg-black/[0.02] flex items-center justify-between">
                            <span className="text-[10px] tracking-[0.15em] uppercase opacity-50">
                                Viewing {MONTH_NAMES[viewMonth]} {viewYear}
                            </span>
                            <button
                                onClick={resetToCurrentMonth}
                                className="text-[10px] tracking-widest uppercase opacity-40 hover:opacity-100 transition-opacity"
                            >
                                Return to now →
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ─── Type Tabs ────────────────────────────────── */}
            <div className="flex gap-2 mb-4">
                <TypeTab value="all" label="All" accentColor="#000" />
                <TypeTab value="expense" label="Expenses" accentColor="#b91c1c" />
                <TypeTab value="income" label="Income" accentColor="#15803d" />
            </div>

            {/* ─── Time Range Toggle ────────────────────────── */}
            <div className="flex gap-2 mb-5">
                {isCurrentMonth && (
                    <RangeChip value="week" label="This Week" />
                )}
                <RangeChip value="month" label={isCurrentMonth ? 'Full Month' : `All of ${MONTH_NAMES[viewMonth]}`} />
            </div>

            {/* ─── Summary Stats Strip ──────────────────────── */}
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 py-3 px-4 mb-5 border border-black/[0.06] bg-black/[0.015] rounded-sm">
                <span className="text-[10px] tracking-widest uppercase opacity-50">
                    {stats.count} transaction{stats.count !== 1 ? 's' : ''}
                </span>

                {(filterType === 'all' || filterType === 'expense') && (
                    <span className="text-[10px] tracking-widest uppercase">
                        <span className="opacity-40">Out </span>
                        <span className="font-mono text-red-700/70">{fmt(stats.totalOut)}</span>
                    </span>
                )}

                {(filterType === 'all' || filterType === 'income') && (
                    <span className="text-[10px] tracking-widest uppercase">
                        <span className="opacity-40">In </span>
                        <span className="font-mono text-green-700/70">{fmt(stats.totalIn)}</span>
                    </span>
                )}

                {filterType === 'all' && (
                    <span className="text-[10px] tracking-widest uppercase ml-auto">
                        <span className="opacity-40">Net </span>
                        <span className={`font-mono ${stats.net >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                            {stats.net >= 0 ? '+' : ''}{fmt(Math.abs(stats.net))}
                        </span>
                    </span>
                )}
            </div>

            {/* ─── Search + Sort ─────────────────────────────── */}
            <div className="flex flex-col sm:flex-row gap-3 mb-5">
                <input
                    type="text"
                    placeholder="Search by category or description..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="flex-1 bg-transparent border border-black/10 px-3 py-2 text-xs tracking-wide focus:outline-none focus:border-black/30 transition-colors placeholder:text-black/25"
                />

                <select
                    value={sortOrder}
                    onChange={(e) => setSortOrder(e.target.value)}
                    className="bg-transparent border border-black/10 text-xs tracking-wide focus:outline-none px-3 py-2"
                >
                    <option value="newest">Newest First</option>
                    <option value="oldest">Oldest First</option>
                    <option value="highest">Highest Amount</option>
                    <option value="lowest">Lowest Amount</option>
                </select>
            </div>

            {/* ─── Transaction List ──────────────────────────── */}
            <div className="space-y-0 max-h-[450px] pr-1 overflow-y-auto custom-scrollbar">
                <AnimatePresence mode="popLayout">
                    {filteredTransactions.length === 0 ? (
                        <motion.div
                            key="empty"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="py-12 flex flex-col items-center justify-center text-center"
                        >
                            <div className="w-10 h-10 mb-4 border border-black/10 rounded-full flex items-center justify-center text-sm opacity-30">∅</div>
                            <p className="text-xs tracking-widest uppercase opacity-30 mb-1">
                                No {filterType !== 'all' ? filterType + ' ' : ''}transactions
                            </p>
                            <p className="text-[10px] opacity-20 tracking-wide">
                                {!isCurrentMonth
                                    ? `Nothing recorded in ${MONTH_NAMES[viewMonth]} ${viewYear}`
                                    : timeRange === 'week'
                                        ? 'Nothing this week yet'
                                        : 'Start logging to see data here'}
                            </p>
                        </motion.div>
                    ) : (
                        filteredTransactions.map((txn, idx) => (
                            <motion.div
                                key={txn.id || idx}
                                layout
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -8 }}
                                transition={{ duration: 0.2, delay: idx < 10 ? idx * 0.03 : 0 }}
                                className="flex justify-between items-center py-3.5 border-b border-black/[0.06] group hover:bg-black/[0.01] transition-colors px-1"
                            >
                                {/* Left: Info */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                        {/* Type indicator dot */}
                                        <span
                                            className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                                            style={{ backgroundColor: txn.type === 'income' ? '#15803d' : '#b91c1c' }}
                                        />
                                        <span className="text-sm truncate">
                                            {txn.description || txn.category}
                                        </span>
                                    </div>
                                    <div className="text-[10px] tracking-wide opacity-35 mt-1 pl-3.5">
                                        {txn.category} · {new Date(txn.date).toLocaleDateString('en-IN', {
                                            day: 'numeric',
                                            month: 'short',
                                            year: viewYear !== now.getFullYear() ? 'numeric' : undefined
                                        })}
                                    </div>
                                </div>

                                {/* Right: Amount */}
                                <div
                                    className="text-sm font-mono pl-4 flex-shrink-0"
                                    style={{ color: txn.type === 'income' ? '#15803d' : '#b91c1c' }}
                                >
                                    {txn.type === 'income' ? '+' : '-'}₹{parseFloat(txn.amount).toLocaleString()}
                                </div>
                            </motion.div>
                        ))
                    )}
                </AnimatePresence>
            </div>

            {/* ─── Footer: Count ─────────────────────────────── */}
            {filteredTransactions.length > 0 && (
                <div className="mt-4 pt-3 border-t border-black/[0.05] flex justify-between items-center">
                    <span className="text-[9px] tracking-widest uppercase opacity-25">
                        Showing {filteredTransactions.length} of {transactions.length} total
                    </span>
                    {onRefresh && (
                        <button
                            onClick={onRefresh}
                            className="text-[9px] tracking-widest uppercase opacity-25 hover:opacity-60 transition-opacity"
                        >
                            Refresh
                        </button>
                    )}
                </div>
            )}
        </motion.div>
    );
}
