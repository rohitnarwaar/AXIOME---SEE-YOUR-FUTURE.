import { motion } from "framer-motion";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell } from "recharts";
import { Home, Utensils, Bus, MoreHorizontal } from "lucide-react";

export default function DashboardMobileWealth({ forecastData, formData, spendingClusters, monthlySpent, monthlyIncome, insights }) {
    const forecastTotal = forecastData.length > 0 ? forecastData[forecastData.length - 1].netWorth : 0;
    const netCashflow = monthlyIncome - monthlySpent;
    const hasData = monthlyIncome > 0 || monthlySpent > 0;

    const pieData = [
        { name: 'Income', value: monthlyIncome, color: '#000000' },
        { name: 'Expenses', value: monthlySpent, color: '#e5e5e5' }
    ];

    return (
        <div className="flex flex-col gap-12 pb-32 pt-20 px-6 font-mono">

            {/* ── Net Worth Forecast ── */}
            <div className="space-y-6">
                <div>
                    <p className="text-[10px] tracking-widest uppercase opacity-40 mb-3 font-bold">Net Worth Forecast</p>
                    <p className="text-3xl font-bold mb-2">
                        ₹{forecastData.length > 0 ? Math.round(forecastTotal).toLocaleString() : "---"}
                    </p>
                </div>

                <div className="h-56 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={forecastData}>
                            <defs>
                                <linearGradient id="colorNetWorthMobile" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#000" stopOpacity={0.1} />
                                    <stop offset="95%" stopColor="#000" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#ddd" vertical={false} />
                            <XAxis dataKey="date" stroke="#999" fontSize={8} tickLine={false} axisLine={false} />
                            <YAxis stroke="#999" fontSize={8} tickLine={false} axisLine={false} tickFormatter={(val) => `₹${val / 1000}k`} />
                            <Tooltip
                                contentStyle={{ backgroundColor: '#fff', border: '1px solid #ddd', borderRadius: '4px', fontSize: '10px' }}
                                itemStyle={{ color: '#000' }}
                            />
                            <Area type="monotone" dataKey="netWorth" stroke="#000" strokeWidth={2} fillOpacity={1} fill="url(#colorNetWorthMobile)" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <div className="h-px bg-black opacity-[0.05]" />

            {/* ── This Month Breakdown (Donut) ── */}
            <div className="space-y-6">
                <p className="text-[10px] tracking-widest uppercase opacity-40 font-bold">This Month Breakdown</p>

                <div className="relative h-40 flex items-center justify-center">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={hasData ? pieData : [{ value: 1 }]}
                                innerRadius={50}
                                outerRadius={68}
                                paddingAngle={5}
                                dataKey="value"
                                stroke="none"
                            >
                                {hasData ? (
                                    pieData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))
                                ) : (
                                    <Cell fill="#f3f4f6" />
                                )}
                            </Pie>
                            <Tooltip
                                enabled={hasData}
                                contentStyle={{
                                    fontSize: '10px',
                                    border: '1px solid #eee',
                                    borderRadius: '0px'
                                }}
                            />
                        </PieChart>
                    </ResponsiveContainer>

                    {/* Center Text */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                        {hasData ? (
                            <>
                                <span className="text-[10px] uppercase opacity-40 tracking-tighter">Net</span>
                                <span className={`text-sm font-mono ${netCashflow >= 0 ? 'text-black' : 'text-red-500'}`}>
                                    {netCashflow >= 0 ? '+' : ''}₹{Math.abs(Math.round(netCashflow)).toLocaleString()}
                                </span>
                            </>
                        ) : (
                            <span className="text-[10px] uppercase opacity-30">No Data</span>
                        )}
                    </div>
                </div>

                {/* Legend */}
                <div className="space-y-3">
                    <div className="flex justify-between items-center text-[10px] tracking-widest uppercase">
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-black" />
                            <span className="opacity-60">Income</span>
                        </div>
                        <span className="font-mono">₹{monthlyIncome.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center text-[10px] tracking-widest uppercase">
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-[#e5e5e5]" />
                            <span className="opacity-60">Expenses</span>
                        </div>
                        <span className="font-mono">₹{monthlySpent.toLocaleString()}</span>
                    </div>
                </div>
            </div>

            <div className="h-px bg-black opacity-[0.05]" />

            {/* ── AI Insights ── */}
            <div className="space-y-4">
                <p className="text-[10px] tracking-widest uppercase opacity-40 font-bold">AI Insights</p>
                <div className="bg-black/[0.02] border border-black/5 p-6 rounded-sm">
                    <div className="text-xs leading-relaxed opacity-80">
                        {insights ? (
                            <p className="whitespace-pre-line">{insights.summary}</p>
                        ) : (
                            <p className="opacity-50 italic">Synthesizing data...</p>
                        )}
                    </div>
                </div>
            </div>

            <div className="h-px bg-black opacity-[0.05]" />

            {/* ── Spending Architecture ── */}
            <div className="space-y-6">
                <p className="text-[10px] tracking-widest uppercase opacity-40 font-bold">Spending Architecture</p>
                <div className="space-y-4">
                    {spendingClusters.map((item, idx) => (
                        <div key={idx} className="flex justify-between items-center py-3 border-b border-black/[0.08]">
                            <div className="flex items-center gap-4">
                                <div className="w-9 h-9 bg-black/[0.02] flex items-center justify-center">
                                    {item.category === 'Rent' && <Home size={14} strokeWidth={1.5} />}
                                    {item.category === 'Food' && <Utensils size={14} strokeWidth={1.5} />}
                                    {item.category === 'Transport' && <Bus size={14} strokeWidth={1.5} />}
                                    {!['Rent', 'Food', 'Transport'].includes(item.category) && <MoreHorizontal size={14} strokeWidth={1.5} />}
                                </div>
                                <div>
                                    <p className="text-xs uppercase tracking-widest">{item.category}</p>
                                    <p className="text-[10px] opacity-40 mt-1 uppercase">{item.cluster}</p>
                                </div>
                            </div>
                            <span className="text-xs font-mono">₹{item.amount.toLocaleString()}</span>
                        </div>
                    ))}
                    {spendingClusters.length === 0 && <p className="text-xs opacity-50 py-4">No budget data synced.</p>}
                </div>
            </div>
        </div>
    );
}
