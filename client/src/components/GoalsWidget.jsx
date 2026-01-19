import { useState } from 'react';
import { motion } from 'framer-motion';

export default function GoalsWidget({ goals, onCreateGoal }) {
    const [showCreate, setShowCreate] = useState(false);
    const [newGoal, setNewGoal] = useState({
        name: '',
        targetAmount: '',
        deadline: ''
    });

    const handleCreate = async (e) => {
        e.preventDefault();
        if (onCreateGoal) {
            await onCreateGoal(newGoal);
            setNewGoal({ name: '', targetAmount: '', deadline: '' });
            setShowCreate(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-8 border border-white border-opacity-10 rounded-sm"
            style={{ fontFamily: '"Source Code Pro", monospace' }}
        >
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-xs tracking-widest uppercase opacity-60">Savings Goals</h3>
                <button
                    onClick={() => setShowCreate(!showCreate)}
                    className="text-xs border border-white border-opacity-20 px-3 py-1 hover:bg-white hover:bg-opacity-5"
                >
                    {showCreate ? 'Cancel' : '+ New Goal'}
                </button>
            </div>

            {showCreate && (
                <form onSubmit={handleCreate} className="mb-6 p-4 border border-white border-opacity-10">
                    <input
                        type="text"
                        placeholder="Goal name"
                        value={newGoal.name}
                        onChange={(e) => setNewGoal({ ...newGoal, name: e.target.value })}
                        className="w-full bg-transparent border-b border-white border-opacity-20 p-2 text-sm mb-3 focus:outline-none"
                        required
                    />
                    <input
                        type="number"
                        placeholder="Target amount"
                        value={newGoal.targetAmount}
                        onChange={(e) => setNewGoal({ ...newGoal, targetAmount: e.target.value })}
                        className="w-full bg-transparent border-b border-white border-opacity-20 p-2 text-sm mb-3 focus:outline-none"
                        required
                    />
                    <input
                        type="date"
                        value={newGoal.deadline}
                        onChange={(e) => setNewGoal({ ...newGoal, deadline: e.target.value })}
                        className="w-full bg-transparent border-b border-white border-opacity-20 p-2 text-sm mb-3 focus:outline-none"
                    />
                    <button type="submit" className="w-full py-2 border border-white text-xs tracking-wide hover:bg-white hover:text-black transition-colors">
                        Create Goal
                    </button>
                </form>
            )}

            {goals && goals.length > 0 ? (
                <div className="space-y-4">
                    {goals.map((goal, idx) => (
                        <div key={goal.id || idx} className="border-b border-white border-opacity-5 pb-4">
                            <div className="flex justify-between mb-2">
                                <span className="text-sm">{goal.name}</span>
                                <span className="text-sm">{goal.progress}%</span>
                            </div>
                            <div className="w-full bg-white bg-opacity-5 h-2 rounded-full overflow-hidden">
                                <div
                                    className="bg-white h-full transition-all duration-500"
                                    style={{ width: `${Math.min(goal.progress, 100)}%` }}
                                />
                            </div>
                            <div className="flex justify-between mt-2 text-xs opacity-60">
                                <span>₹{goal.currentAmount.toLocaleString()} / ₹{goal.targetAmount.toLocaleString()}</span>
                                {goal.deadline && <span>Due: {new Date(goal.deadline).toLocaleDateString()}</span>}
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <p className="text-sm opacity-40">No goals yet. Create your first savings goal!</p>
            )}
        </motion.div>
    );
}
