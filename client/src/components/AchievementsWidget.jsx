import { motion } from 'framer-motion';

export default function AchievementsWidget({ achievements }) {
    if (!achievements || achievements.length === 0) {
        return (
            <div className="p-8 border border-white border-opacity-10 rounded-sm" style={{ fontFamily: '"Source Code Pro", monospace' }}>
                <h3 className="text-xs tracking-widest uppercase mb-6 opacity-60">Achievements</h3>
                <p className="text-sm opacity-40">Keep tracking to unlock achievements!</p>
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
            <h3 className="text-xs tracking-widest uppercase mb-6 opacity-60">Achievements</h3>

            <div className="grid grid-cols-2 gap-4">
                {achievements.map((achievement, idx) => (
                    <motion.div
                        key={achievement.id || idx}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: idx * 0.1 }}
                        className="text-center p-4 border border-white border-opacity-10 rounded-sm hover:bg-white hover:bg-opacity-5 transition-colors"
                    >
                        <div className="text-4xl mb-2">{achievement.icon}</div>
                        <div className="text-sm mb-1">{achievement.name}</div>
                        <div className="text-xs opacity-40">{achievement.description}</div>
                    </motion.div>
                ))}
            </div>
        </motion.div>
    );
}
