import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// ─── High-fidelity Brand Logo Overrides ─────────────────────
// Used when domain-based logos are inaccurate (e.g. Apple Music showing plain Apple)
const BRAND_LOGOS = {
    'apple music': 'https://cdn.simpleicons.org/applemusic/fa2459',
    'applemusic': 'https://cdn.simpleicons.org/applemusic/fa2459',
    'icloud': 'https://cdn.simpleicons.org/icloud/0096E1',
    'apple tv': 'https://cdn.simpleicons.org/appletv/000000',
    'github': 'https://cdn.simpleicons.org/github/181717',
    'openai': 'https://cdn.simpleicons.org/openai/412991',
    'chatgpt': 'https://cdn.simpleicons.org/openai/412991',
    'google one': 'https://www.google.com/s2/favicons?domain=one.google.com&sz=128',
    'googleone': 'https://www.google.com/s2/favicons?domain=one.google.com&sz=128',
};

// ─── Service Name to Domain Mapping ────────────────────────
const SERVICE_DOMAINS = {
    'netflix': 'netflix.com',
    'spotify': 'spotify.com',
    'youtube': 'youtube.com',
    'amazon prime': 'amazon.com',
    'prime video': 'amazon.com',
    'disney+': 'disneyplus.com',
    'disney plus': 'disneyplus.com',
    'figma': 'figma.com',
    'notion': 'notion.so',
    'slack': 'slack.com',
    'zoom': 'zoom.us',
    'microsoft 365': 'microsoft.com',
    'office 365': 'microsoft.com',
    'adobe': 'adobe.com',
    'creative cloud': 'adobe.com',
    'canva': 'canva.com',
    'dropbox': 'dropbox.com',
    'google one': 'google.com',
    'hulu': 'hulu.com',
    'hbo max': 'hbomax.com',
    'max': 'max.com',
    'crunchyroll': 'crunchyroll.com',
    'audible': 'audible.com',
    'kindle': 'amazon.com',
    'linkedin': 'linkedin.com',
    'medium': 'medium.com',
    'nytimes': 'nytimes.com',
    'wsj': 'wsj.com',
    'uber': 'uber.com',
    'zomato': 'zomato.com',
    'swiggy': 'swiggy.com',
};

function getDomain(name) {
    if (!name) return null;
    const cleanName = name.toLowerCase().trim();
    
    // Check direct mapping
    if (SERVICE_DOMAINS[cleanName]) return SERVICE_DOMAINS[cleanName];
    
    // Check partial match
    for (const [key, domain] of Object.entries(SERVICE_DOMAINS)) {
        if (cleanName.includes(key)) return domain;
    }
    
    // Check if user entered a domain directly
    if (cleanName.includes('.') && !cleanName.includes(' ')) {
        return cleanName;
    }
    
    return null;
}

// ─── Deterministic color from string ───────────────────────
const AVATAR_PALETTE = [
    '#1a1a2e', '#16213e', '#0f3460', '#533483',
    '#2c3e50', '#34495e', '#7f8c8d', '#2d3436',
    '#6c5ce7', '#a29bfe', '#636e72', '#b2bec3',
];

function stringToColor(str) {
    let hash = 0;
    for (let i = 0; i < (str || '').length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    return AVATAR_PALETTE[Math.abs(hash) % AVATAR_PALETTE.length];
}

// ─── Service Avatar Component ──────────────────────────────
function ServiceAvatar({ name, size = "w-10 h-10", className = "" }) {
    const domain = getDomain(name);
    const [imgSourceIdx, setImgSourceIdx] = useState(0);
    const [isLoading, setIsLoading] = useState(!!domain);
    const color = stringToColor(name);

    // Check for high-fidelity overrides first
    const override = useMemo(() => {
        if (!name) return null;
        const clean = name.toLowerCase().trim();
        if (BRAND_LOGOS[clean]) return BRAND_LOGOS[clean];
        for (const [key, url] of Object.entries(BRAND_LOGOS)) {
            if (clean.includes(key)) return url;
        }
        return null;
    }, [name]);

    // Multiple sources for reliability
    const sources = useMemo(() => {
        const list = [];
        if (override) list.push(override);
        if (domain) {
            list.push(`https://logo.clearbit.com/${domain}`);
            list.push(`https://www.google.com/s2/favicons?domain=${domain}&sz=128`);
            list.push(`https://unavatar.io/${domain}`);
        }
        return list;
    }, [domain, override]);

    useEffect(() => {
        setImgSourceIdx(0);
        setIsLoading(!!domain || !!override);
    }, [domain, override, name]);

    const handleError = () => {
        if (imgSourceIdx < sources.length - 1) {
            setImgSourceIdx(curr => curr + 1);
        } else {
            setIsLoading(false);
        }
    };

    if ((domain || override) && imgSourceIdx < sources.length) {
        return (
            <div className={`${size} overflow-hidden flex items-center justify-center relative ${className}`}>
                {isLoading && (
                    <div className="absolute inset-0 bg-black/[0.02] animate-pulse rounded-md" />
                )}
                <motion.img
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: isLoading ? 0 : 1, scale: isLoading ? 0.8 : 1 }}
                    src={sources[imgSourceIdx]}
                    alt={name}
                    className="w-full h-full object-contain"
                    onLoad={() => setIsLoading(false)}
                    onError={handleError}
                />
            </div>
        );
    }

    return (
        <div
            className={`${size} rounded-md flex items-center justify-center text-white text-sm font-medium flex-shrink-0 shadow-sm ${className}`}
            style={{ backgroundColor: color }}
        >
            {(name || '?').charAt(0).toUpperCase()}
        </div>
    );
}

// ─── Category presets ──────────────────────────────────────
const CATEGORIES = [
    'Entertainment', 'Music', 'Productivity', 'Cloud Storage',
    'Health & Fitness', 'News & Reading', 'Gaming', 'Finance',
    'Education', 'Shopping', 'Other'
];

const BILLING_CYCLES = [
    { value: 'monthly', label: 'Monthly' },
    { value: 'yearly', label: 'Yearly' },
    { value: 'weekly', label: 'Weekly' },
];

// ─── Normalize to monthly cost ─────────────────────────────
function toMonthlyCost(amount, cycle) {
    const a = parseFloat(amount) || 0;
    if (cycle === 'yearly') return a / 12;
    if (cycle === 'weekly') return a * 4.33;
    return a;
}

function formatDate(dateStr) {
    if (!dateStr) return '—';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}

function daysUntil(dateStr) {
    if (!dateStr) return null;
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const target = new Date(dateStr);
    target.setHours(0, 0, 0, 0);
    const diff = Math.ceil((target - now) / (1000 * 60 * 60 * 24));
    return diff;
}

// ─── Component ─────────────────────────────────────────────
export default function SubscriptionsWidget({
    subscriptions = [],
    onAdd,
    onUpdate,
    onDelete,
    disabled = false
}) {
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [activeMenu, setActiveMenu] = useState(null);
    const [showPaused, setShowPaused] = useState(false);
    const [confirmDelete, setConfirmDelete] = useState(null);

    // Form state
    const [formName, setFormName] = useState('');
    const [formAmount, setFormAmount] = useState('');
    const [formCategory, setFormCategory] = useState(CATEGORIES[0]);
    const [formCycle, setFormCycle] = useState('monthly');
    const [formNextDate, setFormNextDate] = useState(
        new Date().toISOString().split('T')[0]
    );

    // ─── Derived data ──────────────────────────────────────
    const activeSubs = useMemo(
        () => (subscriptions || []).filter(s => s.status === 'active'),
        [subscriptions]
    );
    const pausedSubs = useMemo(
        () => (subscriptions || []).filter(s => s.status === 'paused'),
        [subscriptions]
    );

    const totalMonthlyBurn = useMemo(
        () => activeSubs.reduce((sum, s) => sum + toMonthlyCost(s.amount, s.billingCycle), 0),
        [activeSubs]
    );

    // ─── Form handlers ─────────────────────────────────────
    const resetForm = () => {
        setFormName('');
        setFormAmount('');
        setFormCategory(CATEGORIES[0]);
        setFormCycle('monthly');
        setFormNextDate(new Date().toISOString().split('T')[0]);
        setShowForm(false);
        setEditingId(null);
    };

    const openEditForm = (sub) => {
        setFormName(sub.name);
        setFormAmount(String(sub.amount));
        setFormCategory(sub.category || CATEGORIES[0]);
        setFormCycle(sub.billingCycle || 'monthly');
        setFormNextDate(sub.nextBillingDate
            ? new Date(sub.nextBillingDate).toISOString().split('T')[0]
            : new Date().toISOString().split('T')[0]
        );
        setEditingId(sub.id);
        setShowForm(true);
        setActiveMenu(null);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!formName.trim() || !formAmount || parseFloat(formAmount) <= 0) return;

        const data = {
            name: formName.trim(),
            amount: parseFloat(formAmount),
            category: formCategory,
            billingCycle: formCycle,
            nextBillingDate: new Date(formNextDate).toISOString(),
            status: 'active',
        };

        if (editingId) {
            onUpdate(editingId, data);
        } else {
            onAdd(data);
        }
        resetForm();
    };

    const handleTogglePause = (sub) => {
        onUpdate(sub.id, {
            status: sub.status === 'active' ? 'paused' : 'active'
        });
        setActiveMenu(null);
    };

    const handleDelete = (id) => {
        onDelete(id);
        setConfirmDelete(null);
        setActiveMenu(null);
    };

    // ─── Subscription card ─────────────────────────────────
    const SubCard = ({ sub, isPaused = false }) => {
        const days = daysUntil(sub.nextBillingDate);
        const cycleLbl = BILLING_CYCLES.find(c => c.value === sub.billingCycle)?.label || 'Monthly';

        return (
            <motion.div
                layout
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: isPaused ? 0.5 : 1, y: 0 }}
                exit={{ opacity: 0, y: -12, height: 0 }}
                className={`flex items-center gap-4 py-3.5 px-1 border-b border-black/[0.05] group
                    ${isPaused ? 'opacity-50' : 'hover:bg-black/[0.01]'} transition-colors`}
            >
                <ServiceAvatar name={sub.name} />

                {/* Info */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-medium truncate">{sub.name}</span>
                        {isPaused && (
                            <span className="text-[8px] tracking-widest uppercase px-1.5 py-0.5 border border-black/10 text-black/40">
                                Paused
                            </span>
                        )}
                    </div>
                    <div className="text-[10px] tracking-wide opacity-35 mt-0.5">
                        {sub.category}
                    </div>
                </div>

                {/* Right: amount + billing info */}
                <div className="text-right flex-shrink-0">
                    <div className="text-sm font-mono">₹{parseFloat(sub.amount).toLocaleString()}</div>
                    <div className="text-[10px] tracking-wide opacity-35 mt-0.5">
                        {isPaused
                            ? `Since ${formatDate(sub.nextBillingDate)}`
                            : days !== null && days >= 0
                                ? days === 0 ? 'Due today'
                                    : days <= 3 ? `Due in ${days}d`
                                        : `Next: ${formatDate(sub.nextBillingDate)}`
                                : cycleLbl
                        }
                    </div>
                </div>

                {/* Action menu */}
                {!disabled && (
                    <div className="relative flex-shrink-0">
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                setActiveMenu(activeMenu === sub.id ? null : sub.id);
                                setConfirmDelete(null);
                            }}
                            className="w-7 h-7 flex items-center justify-center opacity-0 group-hover:opacity-40 hover:!opacity-100 transition-opacity text-xs"
                        >
                            ⋯
                        </button>

                        <AnimatePresence>
                            {activeMenu === sub.id && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    className="absolute right-0 top-8 z-20 bg-white border border-black/10 shadow-lg min-w-[140px] py-1"
                                    style={{ fontFamily: '"Source Code Pro", monospace' }}
                                >
                                    <button
                                        onClick={() => openEditForm(sub)}
                                        className="w-full text-left px-4 py-2 text-[10px] tracking-widest uppercase hover:bg-black/[0.03] transition-colors"
                                    >
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => handleTogglePause(sub)}
                                        className="w-full text-left px-4 py-2 text-[10px] tracking-widest uppercase hover:bg-black/[0.03] transition-colors"
                                    >
                                        {sub.status === 'active' ? 'Pause' : 'Resume'}
                                    </button>
                                    <div className="h-px bg-black/5 mx-3" />
                                    {confirmDelete === sub.id ? (
                                        <div className="px-4 py-2 flex gap-2">
                                            <button
                                                onClick={() => handleDelete(sub.id)}
                                                className="flex-1 text-[9px] tracking-widest uppercase py-1 bg-red-600 text-white hover:bg-red-700 transition-colors"
                                            >
                                                Yes
                                            </button>
                                            <button
                                                onClick={() => setConfirmDelete(null)}
                                                className="flex-1 text-[9px] tracking-widest uppercase py-1 border border-black/10 hover:bg-black/[0.03] transition-colors"
                                            >
                                                No
                                            </button>
                                        </div>
                                    ) : (
                                        <button
                                            onClick={() => setConfirmDelete(sub.id)}
                                            className="w-full text-left px-4 py-2 text-[10px] tracking-widest uppercase text-red-600 hover:bg-red-50 transition-colors"
                                        >
                                            Delete
                                        </button>
                                    )}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                )}
            </motion.div>
        );
    };

    // ─── Render ─────────────────────────────────────────────
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-12"
            style={{ fontFamily: '"Source Code Pro", monospace' }}
            onClick={() => { setActiveMenu(null); setConfirmDelete(null); }}
        >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h3 className="text-xs tracking-widest uppercase opacity-60">
                        Active Subscriptions
                    </h3>
                    {activeSubs.length > 0 && (
                        <div className="mt-2 flex items-baseline gap-2">
                            <span className="text-[10px] tracking-widest uppercase opacity-35">
                                Monthly Burn
                            </span>
                            <span className="text-xl font-light font-mono">
                                ₹{Math.round(totalMonthlyBurn).toLocaleString()}
                            </span>
                        </div>
                    )}
                </div>

                {!disabled && (
                    <button
                        onClick={() => {
                            if (showForm && !editingId) {
                                resetForm();
                            } else {
                                resetForm();
                                setShowForm(true);
                            }
                        }}
                        className="px-4 py-2 text-[10px] tracking-[0.2em] uppercase border border-black/10 hover:bg-black hover:text-white transition-all duration-200"
                    >
                        {showForm && !editingId ? '✕ Cancel' : '+ Add New'}
                    </button>
                )}
            </div>

            {/* Monthly Burn Bar (visual) */}
            {activeSubs.length > 0 && (
                <div className="mb-6">
                    <div className="w-full h-1 bg-black/[0.04] rounded-full overflow-hidden">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: '100%' }}
                            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                            className="h-full bg-black/20 rounded-full"
                        />
                    </div>
                    <div className="flex justify-between mt-1.5">
                        <span className="text-[9px] tracking-widest uppercase opacity-25">
                            {activeSubs.length} active
                        </span>
                        <span className="text-[9px] tracking-widest uppercase opacity-25">
                            ₹{Math.round(totalMonthlyBurn * 12).toLocaleString()}/yr
                        </span>
                    </div>
                </div>
            )}

            {/* Add/Edit Form (inline slide-down) */}
            <AnimatePresence>
                {showForm && (
                    <motion.form
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: [0.04, 0.62, 0.23, 0.98] }}
                        className="overflow-hidden"
                        onSubmit={handleSubmit}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="border border-black/10 bg-black/[0.015] p-6 mb-6 space-y-4">
                            <div className="flex items-center gap-4 mb-2">
                                <ServiceAvatar name={formName} size="w-12 h-12" />
                                <div>
                                    <p className="text-[10px] tracking-[0.2em] uppercase opacity-40">
                                        {editingId ? 'Edit Subscription' : 'New Subscription'}
                                    </p>
                                    <h4 className="text-xs font-medium tracking-wide">
                                        {formName || 'Type a service name...'}
                                    </h4>
                                </div>
                            </div>

                            {/* Row 1: Name + Amount */}
                            <div className="grid grid-cols-1 sm:grid-cols-[1fr_140px] gap-3">
                                <input
                                    type="text"
                                    value={formName}
                                    onChange={(e) => setFormName(e.target.value)}
                                    placeholder="Subscription name (e.g. Netflix)"
                                    className="bg-transparent border border-black/10 px-3 py-2.5 text-sm tracking-wide focus:outline-none focus:border-black/30 transition-colors placeholder:text-black/20"
                                    autoFocus
                                />
                                <input
                                    type="number"
                                    value={formAmount}
                                    onChange={(e) => setFormAmount(e.target.value)}
                                    placeholder="₹ Amount"
                                    className="bg-transparent border border-black/10 px-3 py-2.5 text-sm font-mono focus:outline-none focus:border-black/30 transition-colors placeholder:text-black/20"
                                />
                            </div>

                            {/* Row 2: Category + Billing Cycle */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <select
                                    value={formCategory}
                                    onChange={(e) => setFormCategory(e.target.value)}
                                    className="bg-transparent border border-black/10 px-3 py-2.5 text-xs tracking-wide focus:outline-none"
                                >
                                    {CATEGORIES.map(cat => (
                                        <option key={cat} value={cat}>{cat}</option>
                                    ))}
                                </select>

                                <div className="flex gap-1">
                                    {BILLING_CYCLES.map(c => (
                                        <button
                                            key={c.value}
                                            type="button"
                                            onClick={() => setFormCycle(c.value)}
                                            className="flex-1 py-2.5 text-[9px] tracking-[0.15em] uppercase border transition-all duration-200"
                                            style={{
                                                backgroundColor: formCycle === c.value ? '#000' : 'transparent',
                                                color: formCycle === c.value ? '#fff' : 'rgba(0,0,0,0.35)',
                                                borderColor: formCycle === c.value ? '#000' : 'rgba(0,0,0,0.1)',
                                            }}
                                        >
                                            {c.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Row 3: Next billing date */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                    <label className="text-[9px] tracking-widest uppercase opacity-30 block mb-1">
                                        Next Billing Date
                                    </label>
                                    <input
                                        type="date"
                                        value={formNextDate}
                                        onChange={(e) => setFormNextDate(e.target.value)}
                                        className="w-full bg-transparent border border-black/10 px-3 py-2.5 text-xs tracking-wide focus:outline-none focus:border-black/30 transition-colors"
                                    />
                                </div>
                                <div className="flex items-end">
                                    <button
                                        type="submit"
                                        className="w-full py-2.5 bg-black text-white text-[10px] tracking-[0.2em] uppercase hover:bg-black/85 transition-colors"
                                    >
                                        {editingId ? 'Save Changes' : 'Add Subscription'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </motion.form>
                )}
            </AnimatePresence>

            {/* Active Subscriptions List */}
            {activeSubs.length > 0 ? (
                <div>
                    <AnimatePresence mode="popLayout">
                        {activeSubs.map(sub => (
                            <SubCard key={sub.id} sub={sub} />
                        ))}
                    </AnimatePresence>
                </div>
            ) : !showForm ? (
                <div className="py-12 flex flex-col items-center justify-center text-center border border-dashed border-black/[0.08] rounded-sm">
                    <div className="w-12 h-12 mb-4 border border-black/10 rounded-full flex items-center justify-center text-lg opacity-20">
                        ↻
                    </div>
                    <p className="text-xs tracking-widest uppercase opacity-30 mb-1">
                        No subscriptions tracked
                    </p>
                    <p className="text-[10px] opacity-20 tracking-wide">
                        Add your recurring services to see your monthly burn
                    </p>
                </div>
            ) : null}

            {/* Paused Subscriptions (collapsible) */}
            {pausedSubs.length > 0 && (
                <div className="mt-4">
                    <button
                        onClick={() => setShowPaused(!showPaused)}
                        className="flex items-center gap-3 w-full py-2 group"
                    >
                        <div className="flex-1 h-px bg-black/[0.06]" />
                        <span className="text-[9px] tracking-[0.2em] uppercase opacity-30 group-hover:opacity-60 transition-opacity">
                            {pausedSubs.length} paused {showPaused ? '▴' : '▾'}
                        </span>
                        <div className="flex-1 h-px bg-black/[0.06]" />
                    </button>

                    <AnimatePresence>
                        {showPaused && (
                            <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="overflow-hidden"
                            >
                                {pausedSubs.map(sub => (
                                    <SubCard key={sub.id} sub={sub} isPaused />
                                ))}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            )}
        </motion.div>
    );
}
