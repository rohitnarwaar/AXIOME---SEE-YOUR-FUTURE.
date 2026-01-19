import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

export default function DailyScoreWidget({ userData, transactions }) {
    const [scoreData, setScoreData] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (userData && Object.keys(userData).length > 0) {
            fetchDailyScore();
        }
    }, [userData, transactions]);

    const fetchDailyScore = async () => {
        try {
            setLoading(true);
            const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/insights/daily`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userData: userData || {},
                    transactions: transactions || []
                })
            });

            if (!response.ok) throw new Error('Failed to fetch daily score');

            const data = await response.json();
            setScoreData(data);
        } catch (error) {
            console.error('Error fetching daily score:', error);
        } finally {
            setLoading(false);
        }
    };

    // Show default state if no data yet
    const dailyScore = scoreData?.dailyScore || {
        score: 50,
        savingsRate: 0,
        emergencyMonths: 0,
        insights: ['Start tracking expenses to see your financial health!'],
        trend: 'stable'
    };

    const scoreColor = dailyScore.score >= 70 ? 'text-green-400' : dailyScore.score >= 40 ? 'text-yellow-400' : 'text-red-400';

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-8 border border-white border-opacity-10 rounded-sm"
            style={{ fontFamily: '"Source Code Pro", monospace' }}
        >
            <h3 className="text-xs tracking-widest uppercase mb-6 opacity-60">Financial Health</h3>

            {/* Score Circle */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <div className={`text-6xl font-light ${scoreColor}`}>
                        {dailyScore.score}
                    </div>
                    <div className="text-xs tracking-wide opacity-40 mt-2">
                        {dailyScore.trend === 'improving' ? '📈 Improving' :
                            dailyScore.trend === 'stable' ? '➡️ Stable' :
                                '📉 Needs Attention'}
                    </div>
                </div>

                <div className="text-right">
                    <div className="text-sm opacity-60">Savings Rate</div>
                    <div className="text-2xl font-light">{dailyScore.savingsRate}%</div>

                    <div className="text-sm opacity-60 mt-4">Emergency Fund</div>
                    <div className="text-lg font-light">{dailyScore.emergencyMonths} months</div>
                </div>
            </div>

            {/* Insights */}
            <div className="border-t border-white border-opacity-10 pt-6">
                {dailyScore.insights.slice(0, 2).map((insight, idx) => (
                    <div key={idx} className="text-xs opacity-60 mb-2">
                        • {insight}
                    </div>
                ))}
            </div>
        </motion.div>
    );
}
