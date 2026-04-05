import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function RecentTransactions({ transactions, onRefresh }) {
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState('all'); // all, income, expense
    const [sortOrder, setSortOrder] = useState('newest'); // newest, oldest, highest, lowest
    
    const filteredTransactions = useMemo(() => {
        if (!transactions) return [];
        let filtered = [...transactions];
        
        // Apply type filter
        if (filterType !== 'all') {
            filtered = filtered.filter(t => t.type === filterType);
        }
        
        // Apply search
        if (searchTerm) {
            const lowerSearch = searchTerm.toLowerCase();
            filtered = filtered.filter(t => 
                (t.description || '').toLowerCase().includes(lowerSearch) ||
                (t.category || '').toLowerCase().includes(lowerSearch)
            );
        }
        
        // Apply sort
        filtered.sort((a, b) => {
            if (sortOrder === 'newest') return new Date(b.date) - new Date(a.date);
            if (sortOrder === 'oldest') return new Date(a.date) - new Date(b.date);
            if (sortOrder === 'highest') return b.amount - a.amount;
            if (sortOrder === 'lowest') return a.amount - b.amount;
            return 0;
        });
        
        return filtered;
    }, [transactions, searchTerm, filterType, sortOrder]);

    if (!transactions || transactions.length === 0) {
        return (
            <div className="p-8 border border-white border-opacity-10 rounded-sm" style={{ fontFamily: '"Source Code Pro", monospace' }}>
                <h3 className="text-xs tracking-widest uppercase mb-6 opacity-60">Recent Transactions</h3>
                <p className="text-sm opacity-40">No transactions yet. Add your first expense!</p>
            </div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-8 border border-white border-opacity-10 rounded-sm w-full"
            style={{ fontFamily: '"Source Code Pro", monospace' }}
        >
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-xs tracking-widest uppercase opacity-60">Transaction History</h3>
                {onRefresh && (
                    <button onClick={onRefresh} className="text-xs opacity-40 hover:opacity-100 transition-opacity">
                        Refresh
                    </button>
                )}
            </div>

            {/* Filters & Search Controls */}
            <div className="flex flex-col md:flex-row gap-4 mb-6 pt-2 pb-4 border-b border-white border-opacity-10">
                <input
                    type="text"
                    placeholder="Search by category or description..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="flex-1 bg-transparent border border-white border-opacity-20 px-3 py-2 text-sm focus:outline-none placeholder-gray-500"
                />
                
                <div className="flex gap-2">
                    <select
                        value={filterType}
                        onChange={(e) => setFilterType(e.target.value)}
                        className="bg-transparent border border-white border-opacity-20 text-sm focus:outline-none px-2 py-2"
                    >
                        <option className="bg-black" value="all">All Types</option>
                        <option className="bg-black" value="expense">Expenses Only</option>
                        <option className="bg-black" value="income">Income Only</option>
                    </select>

                    <select
                        value={sortOrder}
                        onChange={(e) => setSortOrder(e.target.value)}
                        className="bg-transparent border border-white border-opacity-20 text-sm focus:outline-none px-2 py-2"
                    >
                        <option className="bg-black" value="newest">Newest First</option>
                        <option className="bg-black" value="oldest">Oldest First</option>
                        <option className="bg-black" value="highest">Highest Amount</option>
                        <option className="bg-black" value="lowest">Lowest Amount</option>
                    </select>
                </div>
            </div>

            <div className="space-y-3 max-h-[400px] pr-2 overflow-y-auto custom-scrollbar">
                <AnimatePresence>
                    {filteredTransactions.length === 0 ? (
                        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-sm opacity-40 py-4">No matching transactions found.</motion.p>
                    ) : (
                        filteredTransactions.map((txn, idx) => (
                            <motion.div 
                                key={txn.id || idx} 
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="flex justify-between items-start border-b border-white border-opacity-5 pb-3 pt-1 origin-top"
                            >
                                <div className="flex-1">
                                    <div className="text-sm">{txn.description || txn.category}</div>
                                    <div className="text-xs opacity-40 mt-1">{txn.category} • {new Date(txn.date).toLocaleDateString()}</div>
                                </div>
                                <div className={`text-sm font-mono ${txn.type === 'income' ? 'text-green-400' : 'text-red-400'}`}>
                                    {txn.type === 'income' ? '+' : '-'}₹{txn.amount.toLocaleString()}
                                </div>
                            </motion.div>
                        ))
                    )}
                </AnimatePresence>
            </div>
        </motion.div>
    );
}
