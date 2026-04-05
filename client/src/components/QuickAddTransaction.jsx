import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { db } from '../firebase'; // Import Firestore instance
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'; // Import Firestore functions
import useIsMobile from '../hooks/useIsMobile';

export default function QuickAddTransaction({ isOpen, onClose, onAdd, currentUser }) {
    const isMobile = useIsMobile();
    const [type, setType] = useState('expense'); // 'expense' or 'income'
    const [amount, setAmount] = useState('');
    const [category, setCategory] = useState('Food');
    const [description, setDescription] = useState('');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const expenseCategories = ['Food / Grocery', 'Dine out / Outing', 'Travel', 'Shopping', 'Personal Care', 'Subscription', 'Misc'];
    const incomeCategories = ['Salary', 'Freelance', 'Investment', 'Gift', 'Other'];

    const handleTypeChange = (newType) => {
        setType(newType);
        setCategory(newType === 'expense' ? expenseCategories[0] : incomeCategories[0]);
    };

    const handleSubmit = async (e) => {
        // ... (existing logic)
        e.preventDefault();

        if (!amount || parseFloat(amount) <= 0) {
            alert('Please enter a valid amount');
            return;
        }

        if (!currentUser?.uid) {
            alert('Please log in to add transactions');
            return;
        }

        try {
            setLoading(true);

            // Write directly to Firestore
            const docRef = await addDoc(collection(db, 'users', currentUser.uid, 'transactions'), {
                amount: parseFloat(amount),
                category,
                description,
                type,
                date: new Date(date).toISOString(),
                createdAt: serverTimestamp()
            });

            setSuccess(true);

            setTimeout(() => {
                if (onAdd) onAdd({
                    id: docRef.id,
                    amount: parseFloat(amount),
                    category,
                    description,
                    type,
                    date: new Date(date).toISOString()
                });

                setAmount('');
                setCategory(type === 'expense' ? expenseCategories[0] : incomeCategories[0]);
                setDescription('');
                setSuccess(false);
                setLoading(false);
            }, 800);
        } catch (error) {
            console.error('Error adding transaction:', error);
            alert(`Failed: ${error.message}`);
            setLoading(false);
        }
    };

    const variants = isMobile ? {
        hidden: { y: "100%", opacity: 1 },
        visible: { y: 0, opacity: 1 },
        exit: { y: "100%", opacity: 1 }
    } : {
        hidden: { scale: 0.9, opacity: 0 },
        visible: { scale: 1, opacity: 1 },
        exit: { scale: 0.9, opacity: 0 }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end md:items-center justify-center z-[100]"
                    onClick={onClose}
                    style={{ fontFamily: '"Source Code Pro", monospace' }}
                >
                    <motion.div
                        variants={variants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        transition={{ type: "spring", damping: 25, stiffness: 300 }}
                        className={`bg-white text-black p-8 md:p-10 w-full max-w-lg shadow-2xl relative ${
                            isMobile ? 'rounded-t-[32px] pb-12' : 'border border-black/5 rounded-sm m-4'
                        }`}
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Drag Handle for Mobile */}
                        {isMobile && (
                            <div className="absolute top-4 left-1/2 -translate-x-1/2 w-12 h-1 bg-black/10 rounded-full" />
                        )}

                        <button 
                            onClick={onClose}
                            className="absolute top-6 right-6 p-2 opacity-30 hover:opacity-100 transition-opacity"
                        >
                            ✕
                        </button>
                        {success ? (
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="text-center py-12 text-black"
                            >
                                <div className="text-6xl mb-4">●</div>
                                <div className="text-xs font-bold tracking-[0.3em] uppercase">Entry Logged</div>
                            </motion.div>
                        ) : (
                            <>
                                <h2 className="text-xs tracking-[0.3em] font-bold uppercase mb-10 text-black/40 italic">New Command</h2>

                                <form onSubmit={handleSubmit}>
                                    {/* Type Toggle */}
                                    <div className="flex gap-4 mb-8">
                                        <button
                                            type="button"
                                            onClick={() => handleTypeChange('expense')}
                                            className={`flex-1 py-3 text-[10px] tracking-widest uppercase border border-black transition-all ${type === 'expense' ? 'bg-black text-white px-6' : 'bg-transparent text-black opacity-30 hover:opacity-100'
                                                }`}
                                        >
                                            Money Out
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => handleTypeChange('income')}
                                            className={`flex-1 py-3 text-[10px] tracking-widest uppercase border border-black transition-all ${type === 'income' ? 'bg-black text-white px-6' : 'bg-transparent text-black opacity-30 hover:opacity-100'
                                                }`}
                                        >
                                            Money In
                                        </button>
                                    </div>

                                    {/* Amount */}
                                    <div className="mb-8">
                                        <label className="text-[10px] tracking-widest font-bold uppercase text-black/30 block mb-3">
                                            Quantity (₹)
                                        </label>
                                        <input
                                            type="number"
                                            value={amount}
                                            onChange={(e) => setAmount(e.target.value)}
                                            placeholder="0.00"
                                            className="w-full bg-transparent border-b-2 border-black text-black px-0 py-4 text-4xl font-bold focus:outline-none placeholder-black/5 font-mono"
                                            autoFocus
                                        />
                                    </div>

                                    {/* Category */}
                                    <div className="mb-8">
                                        <label className="text-[10px] tracking-widest font-bold uppercase text-black/30 block mb-3">
                                            Classification
                                        </label>
                                        <select
                                            value={category}
                                            onChange={(e) => setCategory(e.target.value)}
                                            className="w-full bg-transparent border border-black/10 text-black p-4 text-xs font-bold uppercase tracking-widest focus:outline-none appearance-none cursor-pointer"
                                        >
                                            {(type === 'expense' ? expenseCategories : incomeCategories).map(cat => (
                                                <option key={cat} value={cat} className="bg-white text-black">{cat}</option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Date Selector */}
                                    <div className="mb-8">
                                        <label className="text-[10px] tracking-widest font-bold uppercase text-black/30 block mb-3">
                                            Temporal Marker
                                        </label>
                                        <div className="flex gap-2">
                                            {[
                                                { label: 'Today', value: new Date().toISOString().split('T')[0] },
                                                { label: 'Yesterday', value: new Date(Date.now() - 86400000).toISOString().split('T')[0] }
                                            ].map((opt) => (
                                                <button
                                                    key={opt.label}
                                                    type="button"
                                                    onClick={() => setDate(opt.value)}
                                                    className={`px-4 py-2 text-[10px] font-bold tracking-widest uppercase border border-black/5 transition-all ${date === opt.value ? 'bg-black text-white border-black' : 'bg-transparent text-black opacity-30 hover:opacity-100'
                                                        }`}
                                                >
                                                    {opt.label}
                                                </button>
                                            ))}
                                            
                                            <div className="relative flex-1">
                                                <button
                                                    type="button"
                                                    className={`w-full py-2 text-[10px] font-bold tracking-widest uppercase border border-black/5 transition-all ${
                                                        date !== new Date().toISOString().split('T')[0] && 
                                                        date !== new Date(Date.now() - 86400000).toISOString().split('T')[0]
                                                        ? 'bg-black text-white border-black' : 'bg-transparent text-black opacity-30 hover:opacity-100'
                                                    }`}
                                                    onClick={() => document.getElementById('custom-date-picker').showPicker()}
                                                >
                                                    {date !== new Date().toISOString().split('T')[0] && 
                                                     date !== new Date(Date.now() - 86400000).toISOString().split('T')[0]
                                                     ? new Date(date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })
                                                     : 'Select'}
                                                </button>
                                                <input
                                                    id="custom-date-picker"
                                                    type="date"
                                                    value={date}
                                                    onChange={(e) => setDate(e.target.value)}
                                                    className="absolute inset-0 opacity-0 cursor-pointer pointer-events-none"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Description */}
                                    <div className="mb-10">
                                        <label className="text-[10px] tracking-widest font-bold uppercase text-black/30 block mb-3">
                                            Context
                                        </label>
                                        <input
                                            type="text"
                                            value={description}
                                            onChange={(e) => setDescription(e.target.value)}
                                            placeholder="..."
                                            className="w-full bg-transparent border-b border-black/10 text-black px-0 py-3 text-xs focus:outline-none placeholder-black/10 italic"
                                        />
                                    </div>

                                    {/* Submit */}
                                    <button
                                        type="submit"
                                        className="w-full py-5 bg-black text-white text-[10px] font-bold uppercase tracking-[0.4em] hover:bg-black/90 transition-all disabled:opacity-50"
                                        disabled={loading}
                                    >
                                        {loading ? 'Processing...' : 'Execute Entry'}
                                    </button>
                                </form>
                            </>
                        )}
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
