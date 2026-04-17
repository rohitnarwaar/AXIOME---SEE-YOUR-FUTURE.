import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

export default function DailyTipWidget({ userData, transactions }) {
    const [tip, setTip] = useState(null);

    useEffect(() => {
        const fetchDailyTip = async () => {
            try {
                const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/ai/daily-tip`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        userData: userData || {},
                        transactions: transactions || []
                    })
                });

                if (response.ok) {
                    const data = await response.json();
                    setTip(data.tip);
                }
            } catch (error) {
                console.error('Error fetching daily tip:', error);
            }
        };

        fetchDailyTip();
    }, [userData, transactions]);

    if (!tip) return null;

    return (
        <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="p-6 border border-white border-opacity-10 rounded-sm bg-white bg-opacity-5 font-mono"
        >
            <div className="flex items-start gap-3">
                <div className="text-2xl">💡</div>
                <div>
                    <div className="text-xs tracking-wide uppercase opacity-60 mb-2">Daily Tip</div>
                    <div className="text-sm opacity-80">{tip}</div>
                </div>
            </div>
        </motion.div>
    );
}
