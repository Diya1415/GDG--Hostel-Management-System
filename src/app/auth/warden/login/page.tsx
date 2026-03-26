"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { ShieldCheck, Phone, Lock, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function WardenLogin() {
    const router = useRouter();
    const [formData, setFormData] = useState({ phone: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const res = await fetch('/api/auth/warden/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Login failed');

            router.push('/warden/dashboard');
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen relative overflow-hidden bg-[#f8fafc] flex items-center justify-center p-4">
            {/* Background Decorative Elements */}
            <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 2, repeat: Infinity, repeatType: "reverse" }}
                className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-slate-200/40 rounded-full blur-[120px]"
            />
            <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 3, repeat: Infinity, repeatType: "reverse", delay: 1 }}
                className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-rose-100/40 rounded-full blur-[120px]"
            />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="w-full max-w-lg relative z-10"
            >
                <Card className="border-none shadow-2xl shadow-slate-200/60 bg-white/80 backdrop-blur-2xl rounded-[3rem] overflow-hidden">
                    <div className="h-3 bg-gradient-to-r from-slate-900 via-rose-500 to-slate-900" />

                    <CardHeader className="pt-16 text-center space-y-4">
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.2 }}
                            className="w-24 h-24 bg-slate-900 rounded-[2.5rem] flex items-center justify-center mx-auto mb-2 shadow-2xl shadow-slate-300 transform -rotate-12 border-4 border-white"
                        >
                            <ShieldCheck className="w-12 h-12 text-rose-400" />
                        </motion.div>
                        <div>
                            <CardTitle className="text-5xl font-black text-slate-900 tracking-tighter">Warden Login</CardTitle>
                            <p className="text-rose-500 font-black uppercase text-xs tracking-[0.3em] mt-2">Warden and Administrator portal</p>
                        </div>
                    </CardHeader>

                    <CardContent className="px-12 pb-20 pt-8">
                        <form onSubmit={handleSubmit} className="space-y-8">
                            <AnimatePresence>
                                {error && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: "auto" }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="bg-rose-50 border-l-4 border-rose-500 text-rose-700 px-6 py-4 rounded-2xl text-sm font-bold shadow-sm"
                                    >
                                        {error}
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <div className="space-y-6">
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Official Credentials</label>
                                    <div className="relative group">
                                        <Phone className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-rose-500 transition-colors" />
                                        <Input
                                            type="tel"
                                            className="pl-14 h-18 rounded-[1.5rem] border-slate-100 bg-white/50 focus:bg-white focus:ring-4 focus:ring-rose-50 transition-all text-xl font-bold tracking-tight shadow-inner"
                                            placeholder="Contact Number"
                                            value={formData.phone}
                                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Secure Access Key</label>
                                    <div className="relative group">
                                        <Lock className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-rose-500 transition-colors" />
                                        <Input
                                            type="password"
                                            className="pl-14 h-18 rounded-[1.5rem] border-slate-100 bg-white/50 focus:bg-white focus:ring-4 focus:ring-rose-50 transition-all text-xl font-black tracking-[0.3em] shadow-inner"
                                            placeholder="••••••••"
                                            value={formData.password}
                                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                            required
                                        />
                                    </div>
                                </div>
                            </div>

                            <motion.div
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                <Button
                                    type="submit"
                                    className="w-full h-20 py-6 rounded-[2rem] bg-slate-900 hover:bg-rose-600 transition-all duration-500 font-black text-2xl shadow-2xl shadow-slate-200 text-white flex items-center justify-center gap-3"
                                    disabled={loading}
                                >
                                    {loading ? (
                                        <div className="flex items-center gap-3 font-bold uppercase tracking-widest text-sm">
                                            <div className="w-5 h-5 border-4 border-white/20 border-t-white rounded-full animate-spin" />
                                            Signing you in...
                                        </div>
                                    ) : (
                                        <>
                                            Sign In
                                            <ChevronRight className="w-6 h-6" />
                                        </>
                                    )}
                                </Button>
                            </motion.div>
                        </form>
                    </CardContent>
                </Card>

                <div className="text-center mt-10">
                    <p className="text-slate-400 font-bold text-sm">
                        New Warden? <Link href="/auth/warden/signup" className="text-rose-500 font-black hover:underline underline-offset-8 decoration-2 flex items-center justify-center gap-2 mt-2 group">
                            Create Account <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </p>
                </div>

                <p className="text-center mt-8 text-slate-400 text-[10px] font-black uppercase tracking-[0.3em]">
                    Institutional Login • Administration only
                </p>
            </motion.div>
        </div>
    );
}
