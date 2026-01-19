import { motion } from 'framer-motion';

export default function RecentTransactions({ transactions, onRefresh }) {
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
            className="p-8 border border-white border-opacity-10 rounded-sm"
            style={{ fontFamily: '"Source Code Pro", monospace' }}
        >
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-xs tracking-widest uppercase opacity-60">Recent Transactions</h3>
                {onRefresh && (
                    <button onClick={onRefresh} className="text-xs opacity-40 hover:opacity-100 transition-opacity">
                        Refresh
                    </button>
                )}
            </div>

            <div className="space-y-3">
                {transactions.slice(0, 5).map((txn, idx) => (
                    <div key={txn.id || idx} className="flex justify-between items-start border-b border-white border-opacity-5 pb-3">
                        <div className="flex-1">
                            <div className="text-sm">{txn.description || txn.category}</div>
                            <div className="text-xs opacity-40 mt-1">{txn.category} • {new Date(txn.date).toLocaleDateString()}</div>
                        </div>
                        <div className={`text-sm font-mono ${txn.type === 'income' ? 'text-green-400' : 'text-red-400'}`}>
                            {txn.type === 'income' ? '+' : '-'}₹{txn.amount.toLocaleString()}
                        </div>
                    </div>
                ))}
            </div>
        </motion.div>
    );
}
