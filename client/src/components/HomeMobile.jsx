import { Link, useNavigate } from "react-router-dom";
import { motion, useScroll, useTransform } from "framer-motion";
import { useAuth } from "../contexts/AuthContext";
import CircleImage from '../assets/CIRCLE.png';
import CassetteImage from '../assets/CASST.png';

export default function HomeMobile() {
    const { currentUser } = useAuth();
    const navigate = useNavigate();
    const { scrollYProgress } = useScroll();

    // Color Transforms (mimicking desktop "vibe")
    // 0-0.05: Red -> White
    // 0.05-0.7: White background (List section)
    // 0.7-0.8: White -> Black (BIOS/Footer)
    const backgroundColor = useTransform(
        scrollYProgress,
        [0, 0.05, 0.7, 0.8],
        ['rgb(220, 38, 38)', 'rgb(255, 255, 255)', 'rgb(255, 255, 255)', 'rgb(0, 0, 0)']
    );

    const textColor = useTransform(
        scrollYProgress,
        [0, 0.05, 0.7, 0.8],
        ['rgb(255, 255, 255)', 'rgb(0, 0, 0)', 'rgb(0, 0, 0)', 'rgb(255, 255, 255)']
    );

    const scenarios = [
        { date: '01 / I', city: 'Present State Model', desc: 'Baseline financial reality.', target: 'net-worth' },
        { date: '02 / II', city: 'Income & Expense Structure', desc: 'Categorized inflows & outflows.', target: 'spending-tiers' },
        { date: '03 / III', city: 'Cash Flow Patterns', desc: 'Timing & liquidity analysis.', target: 'net-worth' },
        { date: '04 / IV', city: 'Savings Forecast', desc: 'Projected accumulation curves.', target: 'net-worth' },
        { date: '05 / V', city: 'Spending Behaviour Signals', desc: 'Habitual anomalies detected.', target: 'spending-tiers' },
        { date: '06 / VI', city: 'Risk Indicators', desc: 'Volatility & exposure stress-tests.', target: 'ai-advisor' },
        { date: '07 / VII', city: 'Short-Term Outlook', desc: '3-12 month liquidity horizon.', target: 'net-worth' },
        { date: '08 / VIII', city: 'Long-Term Projections', desc: 'Multi-decade compound trajectories.', target: 'retirement' },
        { date: '09 / IX', city: 'Loan Payoff Path', desc: 'Debt extinction timeline.', target: 'debt' },
        { date: '10 / X', city: 'Retirement Projection', desc: 'Post-work sustainability model.', target: 'retirement' },
        { date: '11 / XI', city: 'Net Worth Trajectory', desc: 'Total asset evolution.', target: 'net-worth' },
        { date: '12 / XII', city: 'What-If Scenarios', desc: 'Alternative reality simulation.', target: 'simulator' },
        { date: '13 / XIII', city: 'Decision Notes', desc: 'Synthesized actionable intelligence.', target: 'ai-advisor' }
    ];

    return (
        <motion.div
            className="min-h-[200vh] pb-20 font-mono"
            style={{ backgroundColor, color: textColor }}
        >
            {/* Mobile Nav */}
            <nav className="flex justify-between items-center p-6 sticky top-0 z-50 backdrop-blur-sm">
                <span className="text-sm tracking-widest font-bold">ONE'S OWN</span>
                {currentUser ? (
                    <Link to="/dashboard" className="text-xs bg-black text-white px-4 py-2 rounded-full border border-white/20">Dashboard</Link>
                ) : (
                    <div className="flex gap-2">
                        <Link to="/login" className="text-xs bg-transparent text-black px-4 py-2 rounded-full border border-black/20">Login</Link>
                        <Link to="/register" className="text-xs bg-black text-white px-4 py-2 rounded-full border border-white/20">Register</Link>
                    </div>
                )}
            </nav>

            {/* Hero */}
            {/* Hero - Full Screen */}
            <div className="h-screen flex flex-col justify-center items-center px-6 -mt-20">
                <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="text-[4rem] leading-none font-black tracking-tighter mb-4 text-center"
                >
                    AXIOMÉ
                </motion.h1>
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="text-xs text-center max-w-[250px] leading-relaxed opacity-80"
                >
                    A personal system for modeling the present and reasoning about the future.
                </motion.p>

                {/* Scroll Indicator */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.4 }}
                    transition={{ delay: 1, duration: 1 }}
                    className="absolute bottom-12 text-xs opacity-40 animate-bounce"
                >
                    ↓
                </motion.div>
            </div>

            {/* Intro Info Section - Buffer */}
            <div className="px-6 py-24 flex flex-col items-center">
                <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    transition={{ duration: 0.8 }}
                    className="max-w-xs space-y-6"
                >
                    <p className="text-xs leading-relaxed font-mono opacity-80">
                        It brings together fragmented financial signals into a coherent structure.
                    </p>
                    <p className="text-xs leading-relaxed font-mono opacity-60">
                        Rather than recording what has already happened, AXIOMÉ focuses on exploring what could happen, and why.
                    </p>
                </motion.div>
            </div>



            {/* Vertical Card Stack */}
            <div className="px-6 space-y-4 mb-32">
                <h3 className="text-xs tracking-widest uppercase opacity-40 mb-8 text-center">MODELS & SCENARIOS</h3>

                {/* Visual Lens - Moved Here */}
                <div className="w-full aspect-square relative overflow-hidden mb-12 rounded-full">
                    <motion.img
                        src={CircleImage}
                        alt="Lens"
                        className="w-full h-full object-cover scale-110 opacity-90"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-white/20 via-transparent to-transparent pointer-events-none" />
                </div>

                {scenarios.map((item, idx) => (
                    <motion.div
                        key={idx}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-10% 0px -10% 0px" }}
                        transition={{ duration: 0.5, delay: idx * 0.02 }}
                        className="border-b border-current py-6"
                        style={{ borderColor: 'rgba(120,120,120,0.2)' }}
                    >
                        <div className="flex justify-between items-end">
                            <div>
                                <span className="text-[10px] tracking-widest opacity-40 block mb-1">{item.date}</span>
                                <span className="text-lg font-medium block mb-1 leading-tight">{item.city}</span>
                                <span className="text-xs opacity-60">{item.desc}</span>
                            </div>
                            <button
                                onClick={() => currentUser ? navigate(`/dashboard#${item.target}`) : navigate('/login')}
                                className="w-8 h-8 rounded-full border border-current flex items-center justify-center opacity-60"
                            >
                                →
                            </button>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Simplified BIOS */}
            <div className="px-6 py-20 mt-20">
                <h3 className="text-xs tracking-widest uppercase opacity-40 mb-8">SYSTEM BIOS</h3>
                <div className="space-y-12">
                    <div>
                        <p className="font-bold mb-2">Present State</p>
                        <p className="text-xs opacity-60 leading-relaxed">Aggregates all income and outflows to reveal the baseline truth. Nothing is hidden; everything is accounted for.</p>
                    </div>
                    <div>
                        <p className="font-bold mb-2">Future Outlook</p>
                        <p className="text-xs opacity-60 leading-relaxed">Projects current habits forward to show long-term consequences. See the compounding effect of today's choices.</p>
                    </div>
                </div>
            </div>

            {/* Cassette Tape Section - Restored */}
            <div className="pb-20 px-6">
                <h3 className="text-sm tracking-widest mb-8 font-light uppercase text-center opacity-80">
                    SEE YOUR FUTURE — BEFORE YOU LIVE IT.
                </h3>
                <div className="flex justify-center">
                    <div className="w-full max-w-sm">
                        <img
                            src={CassetteImage}
                            alt="Cassette Tape"
                            className="w-full h-auto opacity-90 invert-0"
                        />
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-12 text-[10px] opacity-40 text-center">
                AXIOMÉ © 2026
            </div>
        </motion.div>
    );
}
