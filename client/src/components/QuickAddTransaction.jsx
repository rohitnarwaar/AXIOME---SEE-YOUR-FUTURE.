import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { db } from '../firebase'; // Import Firestore instance
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'; // Import Firestore functions

export default function QuickAddTransaction({ isOpen, onClose, onAdd, currentUser }) {
    const [type, setType] = useState('expense'); // 'expense' or 'income'
    const [amount, setAmount] = useState('');
    const [category, setCategory] = useState('Food');
    const [description, setDescription] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const expenseCategories = ['Food', 'Transport', 'Shopping', 'Utilities', 'Entertainment', 'Health', 'Other'];
    const incomeCategories = ['Salary', 'Freelance', 'Investment', 'Gift', 'Other'];

    const handleTypeChange = (newType) => {
        setType(newType);
        setCategory(newType === 'expense' ? expenseCategories[0] : incomeCategories[0]);
    };

    const handleSubmit = async (e) => {
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

            console.log('Adding transaction to Firestore:', {
                userId: currentUser.uid,
                amount: parseFloat(amount),
                category,
                description,
                type
            });

            // Write directly to Firestore
            const docRef = await addDoc(collection(db, 'users', currentUser.uid, 'transactions'), {
                amount: parseFloat(amount),
                category,
                description,
                type,
                date: new Date().toISOString(),
                createdAt: serverTimestamp()
            });

            console.log('Transaction written with ID: ', docRef.id);

            setSuccess(true);

            setTimeout(() => {
                // Pass the new transaction to parent if needed (optional now since listener will catch it)
                if (onAdd) onAdd({
                    id: docRef.id,
                    amount: parseFloat(amount),
                    category,
                    description,
                    type,
                    date: new Date().toISOString()
                });

                // Reset form for next entry
                setAmount('');
                // Keep the same type for convenience, or reset? Let's keep same type.
                // setType('expense'); 
                setCategory(type === 'expense' ? expenseCategories[0] : incomeCategories[0]);
                setDescription('');
                setSuccess(false);
                setLoading(false);

                // Do NOT close automatically - Keep open for multiple entries
                // onClose(); 
            }, 800);
        } catch (error) {
            console.error('Error adding transaction:', error);
            alert(`Failed: ${error.message}`);
            setLoading(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50"
                    onClick={onClose}
                    style={{ fontFamily: '"Source Code Pro", monospace' }}
                >
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.9, opacity: 0 }}
                        className="bg-black border-2 border-white p-8 max-w-md w-full mx-4"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {success ? (
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="text-center py-8 text-white"
                            >
                                <div className="text-5xl mb-3">✓</div>
                                <div className="text-base tracking-wide">Transaction Added!</div>
                            </motion.div>
                        ) : (
                            <>
                                <h2 className="text-xl tracking-wide uppercase mb-6 text-white">Quick Add Transaction</h2>

                                <form onSubmit={handleSubmit}>
                                    {/* Type Toggle */}
                                    <div className="flex gap-4 mb-6">
                                        <button
                                            type="button"
                                            onClick={() => handleTypeChange('expense')}
                                            className={`flex-1 py-2 text-xs tracking-widest uppercase border border-white transition-colors ${type === 'expense' ? 'bg-white text-black' : 'bg-transparent text-white opacity-50 hover:opacity-100'
                                                }`}
                                        >
                                            Money Out
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => handleTypeChange('income')}
                                            className={`flex-1 py-2 text-xs tracking-widest uppercase border border-white transition-colors ${type === 'income' ? 'bg-white text-black' : 'bg-transparent text-white opacity-50 hover:opacity-100'
                                                }`}
                                        >
                                            Money In
                                        </button>
                                    </div>

                                    {/* Amount */}
                                    <div className="mb-6">
                                        <label className="text-xs tracking-wide uppercase text-white opacity-80 block mb-2">
                                            Amount (₹)
                                        </label>
                                        <input
                                            type="number"
                                            value={amount}
                                            onChange={(e) => setAmount(e.target.value)}
                                            placeholder="500"
                                            className="w-full bg-transparent border-2 border-white text-white p-3 text-2xl focus:outline-none placeholder-white placeholder-opacity-30"
                                            autoFocus
                                        />
                                    </div>

                                    {/* Category */}
                                    <div className="mb-6">
                                        <label className="text-xs tracking-wide uppercase text-white opacity-80 block mb-2">
                                            Category
                                        </label>
                                        <select
                                            value={category}
                                            onChange={(e) => setCategory(e.target.value)}
                                            className="w-full bg-black border-2 border-white text-white p-3 text-sm focus:outline-none"
                                        >
                                            {(type === 'expense' ? expenseCategories : incomeCategories).map(cat => (
                                                <option key={cat} value={cat} className="bg-black text-white">{cat}</option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Description */}
                                    <div className="mb-8">
                                        <label className="text-xs tracking-wide uppercase text-white opacity-80 block mb-2">
                                            Description (Optional)
                                        </label>
                                        <input
                                            type="text"
                                            value={description}
                                            onChange={(e) => setDescription(e.target.value)}
                                            placeholder={type === 'expense' ? "Lunch at cafe" : "Monthly Salary"}
                                            className="w-full bg-transparent border-2 border-white text-white p-3 text-sm focus:outline-none placeholder-white placeholder-opacity-30"
                                        />
                                    </div>

                                    {/* Buttons */}
                                    <div className="flex gap-4">
                                        <button
                                            type="button"
                                            onClick={onClose}
                                            className="flex-1 py-3 border-2 border-white text-white text-xs tracking-widest uppercase hover:bg-white hover:bg-opacity-10 transition-colors"
                                            disabled={loading}
                                        >
                                            Close
                                        </button>
                                        <button
                                            type="submit"
                                            className="flex-1 py-3 bg-white text-black text-xs tracking-widest uppercase hover:bg-opacity-90 transition-colors disabled:opacity-50"
                                            disabled={loading}
                                        >
                                            {loading ? 'Adding...' : 'Add'}
                                        </button>
                                    </div>
                                </form>
                            </>
                        )}
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
