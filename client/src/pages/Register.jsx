import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';

export default function Register() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { register } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validation
        if (password !== confirmPassword) {
            return setError('Passwords do not match');
        }

        if (password.length < 6) {
            return setError('Password must be at least 6 characters');
        }

        try {
            setError('');
            setLoading(true);
            await register(email, password);
            navigate('/');
        } catch (err) {
            if (err.code === 'auth/email-already-in-use') {
                setError('Email already in use');
            } else if (err.code === 'auth/invalid-email') {
                setError('Invalid email address');
            } else if (err.code === 'auth/weak-password') {
                setError('Password is too weak');
            } else {
                setError('Failed to create account. Please try again.');
            }
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

                {/* Register Form */}
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
                        Register
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

                        {/* Confirm Password Field */}
                        <div>
                            <label
                                htmlFor="confirmPassword"
                                className="block text-xs tracking-wider text-white/70 mb-2"
                                style={{ fontFamily: '"Source Code Pro", monospace' }}
                            >
                                Confirm Password
                            </label>
                            <input
                                id="confirmPassword"
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
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
                            {loading ? 'Creating account...' : 'Register'}
                        </button>
                    </form>

                    {/* Login Link */}
                    <p
                        className="text-xs text-white/70 text-center mt-6"
                        style={{ fontFamily: '"Source Code Pro", monospace' }}
                    >
                        Already have an account?{' '}
                        <Link to="/login" className="text-white hover:opacity-70 transition-opacity">
                            Login
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
