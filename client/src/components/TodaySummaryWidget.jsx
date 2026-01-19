import { motion } from 'framer-motion';

export default function TodaySummaryWidget({ todaySummary }) {
    if (!todaySummary) return null;

    const isPositive = todaySummary.net >= 0;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-8 border border-white border-opacity-10 rounded-sm"
            style={{ fontFamily: '"Source Code Pro", monospace' }}
        >
            <h3 className="text-xs tracking-widest uppercase mb-6 opacity-60">Today's Summary</h3>

            <div className="grid grid-cols-3 gap-6 mb-6">
                <div>
                    <div className="text-xs opacity-40 mb-2">Money In</div>
                    <div className="text-2xl font-light text-green-400">₹{todaySummary.moneyIn.toLocaleString()}</div>
                </div>
                <div>
                    <div className="text-xs opacity-40 mb-2">Money Out</div>
                    <div className="text-2xl font-light text-red-400">₹{todaySummary.moneyOut.toLocaleString()}</div>
                </div>
                <div>
                    <div className="text-xs opacity-40 mb-2">Net</div>
                    <div className={`text-2xl font-light ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
                        {isPositive ? '+' : ''}₹{todaySummary.net.toLocaleString()}
                    </div>
                </div>
            </div>

            <div className="text-xs opacity-60">
                {todaySummary.transactionCount} transaction{todaySummary.transactionCount !== 1 ? 's' : ''} today
            </div>
        </motion.div>
    );
}
