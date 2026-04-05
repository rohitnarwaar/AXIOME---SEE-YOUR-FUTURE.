import { motion } from 'framer-motion';

export default function TodaySummaryWidget({ todaySummary }) {
    if (!todaySummary) return null;

    const isPositive = todaySummary.net >= 0;

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ fontFamily: '"Source Code Pro", monospace' }}
            className="flex flex-col gap-6"
        >
            <h3 className="text-[10px] tracking-[0.2em] uppercase opacity-40 font-bold">Today's Summary</h3>

            <div className="space-y-6">
                {/* Money In */}
                <div className="flex justify-between items-end">
                    <div>
                        <p className="text-[10px] opacity-30 uppercase tracking-wider mb-1">Money In</p>
                        <p className="text-2xl font-light text-green-500">
                            ₹{todaySummary.moneyIn.toLocaleString()}
                        </p>
                    </div>
                </div>

                {/* Money Out */}
                <div className="flex justify-between items-end pb-6 border-b border-black/[0.04]">
                    <div>
                        <p className="text-[10px] opacity-30 uppercase tracking-wider mb-1">Money Out</p>
                        <p className="text-2xl font-light text-red-500">
                            ₹{todaySummary.moneyOut.toLocaleString()}
                        </p>
                    </div>
                </div>

                {/* Net Cashflow */}
                <div className="flex justify-between items-center">
                    <div>
                        <p className="text-[10px] opacity-30 uppercase tracking-wider mb-1">Net Position</p>
                        <p className={`text-3xl font-light ${isPositive ? 'text-black' : 'text-red-500'}`}>
                            {isPositive ? '+' : '-'}₹{Math.abs(todaySummary.net).toLocaleString()}
                        </p>
                    </div>
                    <div className={`px-2 py-1 rounded-full text-[10px] font-bold tracking-tighter ${isPositive ? 'bg-green-500/10 text-green-600' : 'bg-red-500/10 text-red-600'}`}>
                        {isPositive ? 'SURPLUS' : 'DEFICIT'}
                    </div>
                </div>
            </div>

            <div className="pt-4 flex items-center gap-2">
                <div className="w-1 h-1 rounded-full bg-black/20" />
                <p className="text-[10px] opacity-30 tracking-tight">
                    {todaySummary.transactionCount} transaction{todaySummary.transactionCount !== 1 ? 's' : ''} logged today
                </p>
            </div>
        </motion.div>
    );
}
