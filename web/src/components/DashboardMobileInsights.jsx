import { motion } from "framer-motion";
import {
    ResponsiveContainer, AreaChart, Area, LineChart, Line,
    XAxis, YAxis, CartesianGrid, Tooltip, Legend
} from "recharts";

export default function DashboardMobileInsights({ loanData, retirementData, deltaSavings, setDeltaSavings, runSimulation, simulateData, userRole }) {
    return (
        <div className="flex flex-col gap-12 pb-32 pt-20 px-6 font-mono">

            {/* ── Header ── */}
            <div>
                <p className="text-[10px] tracking-widest uppercase opacity-40 mb-3">Financial Intelligence</p>
                <h2 className="text-3xl font-light tracking-wide uppercase mb-2">Insights</h2>
                <p className="text-sm opacity-60 tracking-wide">Debt trajectory, retirement growth, and what-if scenarios.</p>
            </div>

            {/* ── Debt Freedom ── */}
            <div className="space-y-4">
                <p className="text-xs tracking-widest uppercase opacity-60">Debt Freedom</p>
                {loanData && loanData.length > 0 ? (
                    <div className="h-48 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={loanData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#ddd" vertical={false} />
                                <XAxis stroke="#999" fontSize={8} tickLine={false} axisLine={false} />
                                <YAxis stroke="#999" fontSize={8} tickLine={false} axisLine={false} />
                                <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #ddd', fontSize: '10px' }} />
                                <Line type="monotone" dataKey="remaining" stroke="#000" strokeWidth={2} dot={false} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                ) : (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="h-[160px] flex flex-col items-center justify-center bg-black/[0.02] border border-black/5 rounded-sm p-8 text-center"
                    >
                        <div className="w-10 h-10 mb-4 bg-black text-white rounded-full flex items-center justify-center text-sm shadow-sm">✓</div>
                        <h4 className="text-[10px] tracking-[0.2em] font-bold uppercase mb-2">You are Debt-Free</h4>
                        <p className="text-[10px] opacity-40 uppercase tracking-widest leading-relaxed max-w-[200px]">
                            A clean slate is the strongest foundation for wealth.
                        </p>
                    </motion.div>
                )}
            </div>

            <div className="h-px bg-black opacity-[0.05]" />

            {/* ── Retirement Corpus ── */}
            <div className="space-y-4">
                <p className="text-xs tracking-widest uppercase opacity-60">Retirement Corpus</p>
                <div className="h-48 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={retirementData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#ddd" vertical={false} />
                            <XAxis stroke="#999" fontSize={8} tickLine={false} axisLine={false} />
                            <YAxis stroke="#999" fontSize={8} tickLine={false} axisLine={false} />
                            <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #ddd', fontSize: '10px' }} />
                            <Line type="monotone" dataKey="corpus" stroke="#000" strokeWidth={2} dot={false} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <div className="h-px bg-black opacity-[0.05]" />

            {/* ── What-if Simulator ── */}
            <div className="space-y-6">
                <div>
                    <p className="text-xs tracking-widest uppercase mb-4 opacity-60">Simulator</p>
                    <p className="text-sm opacity-60">See how saving more impacts your future.</p>
                </div>

                <div className="flex flex-col gap-4">
                    <div className="flex items-center justify-between">
                        <span className="text-xs tracking-widest opacity-60 uppercase">Save Extra</span>
                        <span className="text-sm font-medium">₹{parseInt(deltaSavings).toLocaleString()}</span>
                    </div>
                    <input
                        type="range"
                        min="1000"
                        max="50000"
                        step="1000"
                        value={deltaSavings}
                        onChange={(e) => setDeltaSavings(e.target.value)}
                        disabled={userRole === 'viewer'}
                        className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-black"
                    />
                    <button
                        onClick={runSimulation}
                        disabled={userRole === 'viewer'}
                        className="w-full py-3 border border-black text-xs tracking-widest uppercase hover:bg-black hover:text-white transition-colors"
                    >
                        Simulate
                    </button>
                </div>

                {simulateData && simulateData.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="h-56 w-full"
                    >
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={simulateData}>
                                <defs>
                                    <linearGradient id="colorBumpMobile" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#000" stopOpacity={0.1} />
                                        <stop offset="95%" stopColor="#000" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#ddd" vertical={false} />
                                <XAxis dataKey="date" stroke="#999" fontSize={8} tickLine={false} axisLine={false} />
                                <YAxis stroke="#999" fontSize={8} tickLine={false} axisLine={false} />
                                <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #ddd', fontSize: '10px' }} />
                                <Legend iconType="circle" wrapperStyle={{ fontSize: '9px' }} />
                                <Area type="monotone" dataKey="baseValue" name="Current Path" stroke="#999" fill="transparent" strokeDasharray="5 5" />
                                <Area type="monotone" dataKey="bumpValue" name="Proposed Path" stroke="#000" fill="url(#colorBumpMobile)" strokeWidth={2} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </motion.div>
                )}
            </div>
        </div>
    );
}
