import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { ShieldAlert, User, Lock, Loader2, Eye, EyeOff, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { login } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await login(username, password);
            toast.success('Successfully logged in');
        } catch (error) {
            console.error(error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const container = {
        hidden: { opacity: 0 },
        show: { opacity: 1, transition: { staggerChildren: 0.1 } }
    };
    const item = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100, damping: 15 } }
    };

    const features = [
        'AI-powered facial recognition',
        'End-to-end AES-256 encryption',
        'Real-time national registry access',
    ];

    return (
        <div className="min-h-screen flex" style={{ background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 50%, #eff6ff 100%)' }}>

            {/* Left panel */}
            <motion.div
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.7, ease: 'easeOut' }}
                className="hidden lg:flex w-1/2 items-center justify-center p-16"
                style={{ background: 'linear-gradient(160deg, #1d4ed8 0%, #2563eb 50%, #3b82f6 100%)' }}
            >
                <div className="max-w-lg text-center">
                    {/* Logo */}
                    <motion.div
                        animate={{ y: [0, -10, 0] }}
                        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                        className="flex justify-center mb-10"
                    >
                        <div className="w-24 h-24 rounded-3xl flex items-center justify-center"
                            style={{ background: 'rgba(255,255,255,0.2)', border: '2px solid rgba(255,255,255,0.4)', boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}>
                            <ShieldAlert className="w-12 h-12 text-white" />
                        </div>
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="text-5xl font-black text-white mb-3"
                    >
                        MCIS
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="text-blue-100 text-lg mb-10"
                    >
                        Missing Child Identification System
                    </motion.p>

                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                        transition={{ delay: 0.5 }}
                        className="space-y-3 text-left"
                    >
                        {features.map((f, i) => (
                            <motion.div
                                key={f}
                                initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.6 + i * 0.1 }}
                                className="flex items-center gap-3 px-4 py-3 rounded-xl"
                                style={{ background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.25)' }}
                            >
                                <CheckCircle className="w-5 h-5 text-white shrink-0" />
                                <span className="text-white font-medium text-sm">{f}</span>
                            </motion.div>
                        ))}
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                        transition={{ delay: 0.9 }}
                        className="mt-10 grid grid-cols-3 gap-3"
                    >
                        {[
                            { val: '98.4%', label: 'Accuracy' },
                            { val: '< 2s', label: 'Match Speed' },
                            { val: '24/7', label: 'Uptime' }
                        ].map(s => (
                            <div key={s.label} className="rounded-xl p-3 text-center"
                                style={{ background: 'rgba(255,255,255,0.15)' }}>
                                <div className="text-xl font-black text-white">{s.val}</div>
                                <div className="text-xs text-blue-200 mt-0.5">{s.label}</div>
                            </div>
                        ))}
                    </motion.div>
                </div>
            </motion.div>

            {/* Right form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
                <motion.div
                    variants={container} initial="hidden" animate="show"
                    className="w-full max-w-md"
                >
                    {/* Mobile logo */}
                    <motion.div variants={item} className="lg:hidden flex justify-center mb-8">
                        <div className="w-14 h-14 rounded-2xl flex items-center justify-center"
                            style={{ background: 'linear-gradient(135deg, #3b82f6, #2563eb)', boxShadow: '0 8px 24px rgba(59,130,246,0.4)' }}>
                            <ShieldAlert className="w-7 h-7 text-white" />
                        </div>
                    </motion.div>

                    {/* Card */}
                    <motion.div
                        variants={item}
                        className="bg-white rounded-3xl p-8 shadow-xl"
                        style={{ border: '1px solid #e2e8f0', boxShadow: '0 20px 60px rgba(59,130,246,0.12)' }}
                    >
                        <motion.div variants={item} className="mb-8">
                            <h2 className="text-2xl font-black text-slate-800">Welcome Back</h2>
                            <p className="text-slate-500 mt-1 text-sm">Sign in to the MCIS administration portal</p>
                        </motion.div>

                        <form onSubmit={handleSubmit} className="space-y-5">
                            {/* Username */}
                            <motion.div variants={item}>
                                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Username</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                        <User className="h-4 w-4 text-slate-400" />
                                    </div>
                                    <input
                                        type="text"
                                        required
                                        value={username}
                                        onChange={e => setUsername(e.target.value)}
                                        placeholder="admin"
                                        className="input-field pl-10"
                                    />
                                </div>
                            </motion.div>

                            {/* Password */}
                            <motion.div variants={item}>
                                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Password</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                        <Lock className="h-4 w-4 text-slate-400" />
                                    </div>
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        required
                                        value={password}
                                        onChange={e => setPassword(e.target.value)}
                                        placeholder="••••••••"
                                        className="input-field pl-10 pr-10"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(v => !v)}
                                        className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-blue-500 transition-colors"
                                    >
                                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    </button>
                                </div>
                            </motion.div>

                            {/* Remember / Forgot */}
                            <motion.div variants={item} className="flex items-center justify-between">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input type="checkbox" className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
                                    <span className="text-sm text-slate-600">Remember me</span>
                                </label>
                                <a href="#" className="text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors">Forgot password?</a>
                            </motion.div>

                            {/* Submit */}
                            <motion.div variants={item}>
                                <motion.button
                                    type="submit"
                                    disabled={isSubmitting}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    className="btn-primary w-full py-3 text-base mt-1"
                                >
                                    {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Sign In →'}
                                </motion.button>
                            </motion.div>
                        </form>
                    </motion.div>

                    <motion.p variants={item} className="mt-5 text-center text-xs text-slate-400">
                        🔒 Secure admin portal · Authorized access only · MCIS v2.0
                    </motion.p>
                </motion.div>
            </div>
        </div>
    );
};

export default Login;
