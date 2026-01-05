import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            setError('');
            setLoading(true);
            await login(email, password);
            navigate('/dashboard');
        } catch (err) {
            setError('Failed to log in. Please check your credentials.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-black flex items-center justify-center px-6">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="w-full max-w-md"
            >
                {/* Logo/Title */}
                <Link to="/">
                    <motion.h1
                        className="text-4xl font-bold tracking-tight text-white text-center mb-12"
                        style={{ fontFamily: '"Source Code Pro", monospace' }}
                    >
                        AXIOMÉ
                    </motion.h1>
                </Link>

                {/* Login Form */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    className="space-y-6"
                >
                    <h2
                        className="text-xs tracking-widest text-white uppercase mb-8"
                        style={{ fontFamily: '"Source Code Pro", monospace' }}
                    >
                        Login
                    </h2>

                    {error && (
                        <div
                            className="text-xs text-red-400 p-3 border border-red-400/30 bg-red-400/10"
                            style={{ fontFamily: '"Source Code Pro", monospace' }}
                        >
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Email Field */}
                        <div>
                            <label
                                htmlFor="email"
                                className="block text-xs tracking-wider text-white/70 mb-2"
                                style={{ fontFamily: '"Source Code Pro", monospace' }}
                            >
                                Email
                            </label>
                            <input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="w-full bg-transparent border border-white/20 text-white text-sm px-4 py-3 focus:outline-none focus:border-white/40 transition-colors"
                                style={{ fontFamily: '"Source Code Pro", monospace' }}
                                placeholder="your@email.com"
                            />
                        </div>

                        {/* Password Field */}
                        <div>
                            <label
                                htmlFor="password"
                                className="block text-xs tracking-wider text-white/70 mb-2"
                                style={{ fontFamily: '"Source Code Pro", monospace' }}
                            >
                                Password
                            </label>
                            <input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                className="w-full bg-transparent border border-white/20 text-white text-sm px-4 py-3 focus:outline-none focus:border-white/40 transition-colors"
                                style={{ fontFamily: '"Source Code Pro", monospace' }}
                                placeholder="••••••••"
                            />
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-white text-black text-xs tracking-widest uppercase py-3 px-6 hover:bg-white/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-6"
                            style={{ fontFamily: '"Source Code Pro", monospace' }}
                        >
                            {loading ? 'Logging in...' : 'Login'}
                        </button>
                    </form>

                    {/* Register Link */}
                    <p
                        className="text-xs text-white/70 text-center mt-6"
                        style={{ fontFamily: '"Source Code Pro", monospace' }}
                    >
                        Don't have an account?{' '}
                        <Link to="/register" className="text-white hover:opacity-70 transition-opacity">
                            Register
                        </Link>
                    </p>

                    {/* Back to Home */}
                    <Link
                        to="/"
                        className="block text-xs text-white/50 text-center mt-4 hover:text-white/70 transition-colors"
                        style={{ fontFamily: '"Source Code Pro", monospace' }}
                    >
                        ← Back to Home
                    </Link>
                </motion.div>
            </motion.div>
        </div>
    );
}
