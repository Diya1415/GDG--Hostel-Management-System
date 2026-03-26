"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { ShieldCheck, UserPlus, Phone, Lock, Building, Sparkles, ArrowLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function WardenSignup() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        password: '',
        hostelName: 'Shambhavi'
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const res = await fetch('/api/auth/warden/signup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Registration failed');

            router.push('/auth/warden/login');
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen relative overflow-hidden bg-[#f8fafc] flex items-center justify-center p-4 py-20">
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
                className="w-full max-w-xl relative z-10"
            >
                <Link href="/auth/warden/login" className="inline-flex items-center gap-2 text-slate-500 hover:text-rose-600 transition-colors group font-black uppercase text-[10px] tracking-[0.3em] mb-8 ml-4">
                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                    Secure Login
                </Link>

                <Card className="border-none shadow-2xl shadow-slate-200/60 bg-white/80 backdrop-blur-2xl rounded-[3rem] overflow-hidden">
                    <div className="h-3 bg-gradient-to-r from-slate-900 via-rose-500 to-slate-900" />

                    <CardHeader className="pt-12 text-center space-y-4">
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.2 }}
                            className="w-20 h-20 bg-slate-900 rounded-[2rem] flex items-center justify-center mx-auto mb-2 shadow-2xl shadow-slate-300 border-4 border-white"
                        >
                            <UserPlus className="w-10 h-10 text-rose-400" />
                        </motion.div>
                        <div>
                            <CardTitle className="text-4xl font-black text-slate-900 tracking-tighter">Warden Sign Up</CardTitle>
                            <p className="text-rose-500 font-black uppercase text-xs tracking-[0.3em] mt-2 italic">Administrator access</p>
                        </div>
                    </CardHeader>

                    <CardContent className="px-12 pb-16 pt-6">
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
                                <div className="space-y-2 group">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Full Name</label>
                                    <div className="relative">
                                        <ShieldCheck className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-rose-500 transition-colors" />
                                        <Input
                                            className="pl-14 h-16 rounded-[1.5rem] border-slate-100 bg-white/50 focus:bg-white focus:ring-4 focus:ring-rose-50 transition-all text-lg font-bold shadow-inner"
                                            placeholder="Enter full name"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2 group">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Assigned Hostel</label>
                                        <div className="relative">
                                            <Building className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-rose-500 transition-colors pointer-events-none" />
                                            <select
                                                className="w-full h-16 pl-14 pr-6 rounded-[1.5rem] border-slate-100 bg-white/50 focus:bg-white focus:ring-4 focus:ring-rose-50 transition-all text-lg font-bold shadow-inner appearance-none outline-none cursor-pointer"
                                                value={formData.hostelName}
                                                onChange={(e) => setFormData({ ...formData, hostelName: e.target.value })}
                                            >
                                                <option value="Shambhavi">Shambhavi Hall</option>
                                                <option value="Shalmala">Shalmala Hall</option>
                                                <option value="Saraswati">Saraswati Hall</option>
                                                <option value="Sharavati">Sharavati Hall</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div className="space-y-2 group">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Phone Number</label>
                                        <div className="relative">
                                            <Phone className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-rose-500 transition-colors" />
                                            <Input
                                                type="tel"
                                                className="pl-14 h-16 rounded-[1.5rem] border-slate-100 bg-white/50 focus:bg-white focus:ring-4 focus:ring-rose-50 transition-all text-lg font-bold shadow-inner"
                                                placeholder="9876543210"
                                                value={formData.phone}
                                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                                required
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2 group">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Password</label>
                                    <div className="relative">
                                        <Lock className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-rose-500 transition-colors" />
                                        <Input
                                            type="password"
                                            className="pl-14 h-16 rounded-[1.5rem] border-slate-100 bg-white/50 focus:bg-white focus:ring-4 focus:ring-rose-50 transition-all text-lg font-black tracking-[0.3em] shadow-inner"
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
                                    className="w-full h-20 rounded-[2.5rem] bg-slate-900 hover:bg-rose-600 transition-all duration-500 font-black text-2xl shadow-2xl shadow-slate-200 text-white flex items-center justify-center gap-3 mt-4"
                                    disabled={loading}
                                >
                                    {loading ? (
                                        <div className="flex items-center gap-3 font-bold uppercase tracking-widest text-sm text-rose-100">
                                            <div className="w-5 h-5 border-4 border-rose-100/20 border-t-white rounded-full animate-spin" />
                                            Creating account...
                                        </div>
                                    ) : (
                                        <>
                                            Create Account
                                            <ChevronRight className="w-6 h-6" />
                                        </>
                                    )}
                                </Button>
                            </motion.div>
                        </form>

                        <div className="text-center mt-10">
                            <p className="text-slate-400 font-bold text-sm">
                                Existing administrator? <Link href="/auth/warden/login" className="text-rose-500 font-black hover:underline underline-offset-8 decoration-2 flex items-center justify-center gap-2 mt-2 group">
                                    Sign In <ArrowLeft className="w-4 h-4 rotate-180 group-hover:translate-x-1 transition-transform" />
                                </Link>
                            </p>
                        </div>
                    </CardContent>
                </Card>

                <div className="text-center mt-8 inline-flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] justify-center w-full">
                    <Sparkles className="w-3 h-3 text-rose-300" />
                    Hostel Management
                </div>
            </motion.div>
        </div>
    );
}
