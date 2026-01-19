import { motion } from 'framer-motion';

export default function StreaksWidget({ streaks }) {
    if (!streaks) return null;

    const streakItems = [
        { name: 'Tracking Streak', value: streaks.trackingStreak, icon: '📊', color: 'text-blue-400' },
        { name: 'Savings Streak', value: streaks.savingsStreak, icon: '💰', color: 'text-green-400' },
        { name: 'Budget Streak', value: streaks.budgetStreak, icon: '🎯', color: 'text-yellow-400' },
    ];

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-8 border border-white border-opacity-10 rounded-sm"
            style={{ fontFamily: '"Source Code Pro", monospace' }}
        >
            <h3 className="text-xs tracking-widest uppercase mb-6 opacity-60">Your Streaks</h3>

            <div className="grid grid-cols-3 gap-4">
                {streakItems.map((item, idx) => (
                    <div key={idx} className="text-center">
                        <div className="text-3xl mb-2">{item.icon}</div>
                        <div className={`text-2xl font-light ${item.color}`}>{item.value}</div>
                        <div className="text-xs opacity-40 mt-1">{item.name}</div>
                    </div>
                ))}
            </div>

            {streaks.trackingStreak >= 7 && (
                <div className="mt-6 text-xs text-center opacity-60 border-t border-white border-opacity-10 pt-4">
                    🔥 You're on fire! {streaks.trackingStreak} days tracked!
                </div>
            )}
        </motion.div>
    );
}
