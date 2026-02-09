import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

const LoginPage = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [rememberMe, setRememberMe] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!email || !password) {
            setError('Please fill in all fields');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const response = await fetch('https://anlash-backend.onrender.com/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();

            if (response.ok && data.token) {
                // Store token
                if (rememberMe) {
                    localStorage.setItem('token', data.token);
                    localStorage.setItem('user', JSON.stringify(data.user));
                } else {
                    sessionStorage.setItem('token', data.token);
                    sessionStorage.setItem('user', JSON.stringify(data.user));
                }

                // Redirect based on role
                if (data.user.role === 'admin') {
                    navigate('/admin/dashboard');
                } else {
                    navigate('/');
                }
            } else {
                setError(data.message || 'Invalid email or password');
            }
        } catch (err) {
            setError('Connection failed. Please make sure the server is running.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#f8fafc] flex flex-col items-center justify-center p-4 relative overflow-hidden font-sans">
            {/* Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#f0f9ff] via-white to-[#f1f5f9]"></div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="bg-white rounded-2xl shadow-xl w-full max-w-[460px] p-8 relative z-10 border border-gray-100"
                style={{ boxShadow: '0 20px 60px -2px rgba(27, 33, 58, 0.15)' }}
            >
                {/* Logo */}
                <div className="flex flex-col items-center mb-8">
                    <div className="flex items-center gap-3 mb-2">
                        <svg width="40" height="35" viewBox="0 0 54 44" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M15.5 24.5C12.5 24.5 5 28 2 34C6 28 17 22 24 28C24 28 17 24 15.5 24.5Z" fill="#e3901b" />
                            <path d="M23 29C28 25 45 5 52 2C42 12 30 30 23 38C23 38 24 32 23 29Z" fill="#1a7c56" />
                        </svg>
                        <div className="flex flex-col items-start">
                            <span className="text-lg font-bold text-[#0a192f]" style={{ fontFamily: 'Cairo, sans-serif' }}>الاعتماد المهني</span>
                            <span className="text-[10px] font-semibold tracking-wider uppercase text-gray-500">PROFESSIONAL ACCREDITATION</span>
                        </div>
                    </div>
                </div>

                {/* Title */}
                <div className="mb-8 text-center">
                    <h2 className="text-2xl font-bold text-[#1e293b]">Welcome back</h2>
                    <p className="text-gray-500 text-sm mt-2">Sign in to your account</p>
                </div>

                <form className="space-y-5" onSubmit={handleLogin}>
                    {/* Error Message */}
                    {error && (
                        <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm">
                            {error}
                        </div>
                    )}

                    {/* Email */}
                    <div>
                        <label className="block text-sm font-medium text-[#475569] mb-2">Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Enter your email"
                            className="w-full px-4 py-3.5 border border-[#e2e8f0] rounded-lg focus:ring-2 focus:ring-[#0f766e]/30 focus:border-[#0f766e] outline-none transition-all text-[#1e293b] placeholder:text-[#94a3b8]"
                        />
                    </div>

                    {/* Password */}
                    <div>
                        <label className="block text-sm font-medium text-[#475569] mb-2">Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Enter your password"
                            className="w-full px-4 py-3.5 border border-[#e2e8f0] rounded-lg focus:ring-2 focus:ring-[#0f766e]/30 focus:border-[#0f766e] outline-none transition-all text-[#1e293b] placeholder:text-[#94a3b8]"
                        />
                    </div>

                    {/* Remember me & Forgot password */}
                    <div className="flex items-center justify-between pt-1">
                        <div className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                id="remember"
                                checked={rememberMe}
                                onChange={(e) => setRememberMe(e.target.checked)}
                                className="w-4 h-4 rounded border-gray-300 text-[#0f766e] focus:ring-[#0f766e]"
                            />
                            <label htmlFor="remember" className="text-sm text-gray-600">Remember me</label>
                        </div>
                        <a href="#" className="text-sm text-[#0f766e] font-medium hover:underline">Forgot password?</a>
                    </div>

                    {/* Sign In Button */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-[#0f766e] hover:bg-[#0d6b63] text-white font-semibold py-3.5 rounded-lg transition-all text-base mt-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {loading && <Loader2 className="w-5 h-5 animate-spin" />}
                        {loading ? 'Signing in...' : 'Sign in'}
                    </button>

                    {/* Sign up link */}
                    <div className="text-center pt-4">
                        <span className="text-gray-500 text-sm">Don't have an account? </span>
                        <Link to="/auth/signup" className="text-[#0f766e] font-semibold text-sm hover:underline">Sign up</Link>
                    </div>
                </form>
            </motion.div>

            {/* Back to Home */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="mt-6 z-10"
            >
                <Link to="/" className="text-gray-500 text-sm hover:text-[#0f766e] transition-colors flex items-center gap-2">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M19 12H5M12 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    Back to home
                </Link>
            </motion.div>
        </div>
    )
}

export default LoginPage;
