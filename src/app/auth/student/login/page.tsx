"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { KeyRound, ShieldCheck, MapPin } from 'lucide-react';

export default function StudentLogin() {
    const router = useRouter();
    const [formData, setFormData] = useState({ roomNumber: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const res = await fetch('/api/auth/student/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Login failed');

            router.push('/student/dashboard');
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen relative overflow-hidden bg-slate-50 flex items-center justify-center p-4">
            {/* Background Gradients */}
            <div className="absolute top-[20%] left-[10%] w-[30%] h-[30%] bg-indigo-200/40 rounded-full blur-[100px]" />
            <div className="absolute bottom-[20%] right-[10%] w-[30%] h-[30%] bg-rose-100/40 rounded-full blur-[100px]" />

            <Card className="w-full max-w-lg border-none shadow-2xl shadow-indigo-100/50 bg-white/70 backdrop-blur-2xl rounded-[2.5rem] overflow-hidden relative z-10">
                <div className="h-3 bg-gradient-to-r from-indigo-600 to-indigo-400" />
                <CardHeader className="pt-12 text-center">
                    <div className="w-20 h-20 bg-indigo-600 rounded-[2rem] flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-indigo-300 transform -rotate-6">
                        <KeyRound className="w-10 h-10 text-white" />
                    </div>
                    <CardTitle className="text-4xl font-black text-slate-900 tracking-tight">Student Login</CardTitle>
                    <p className="text-slate-500 font-bold uppercase text-[10px] tracking-[0.2em] mt-2 text-indigo-600">Access your hostel account</p>
                </CardHeader>
                <CardContent className="px-12 pb-16 pt-8">
                    <form onSubmit={handleSubmit} className="space-y-8">
                        {error && (
                            <div className="bg-rose-50 border-l-4 border-rose-500 text-rose-700 px-6 py-4 rounded-xl text-sm font-bold shadow-sm animate-in fade-in slide-in-from-top-2">
                                {error}
                            </div>
                        )}

                        <div className="space-y-3">
                            <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Room Number</label>
                            <div className="relative group">
                                <MapPin className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
                                <Input
                                    className="pl-14 h-16 rounded-2xl border-slate-200 bg-white focus:ring-4 focus:ring-indigo-50 transition-all text-xl font-bold tracking-tight shadow-sm"
                                    placeholder="e.g. A504"
                                    value={formData.roomNumber}
                                    onChange={(e) => setFormData({ ...formData, roomNumber: e.target.value })}
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-3">
                            <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Password (USN)</label>
                            <div className="relative group">
                                <ShieldCheck className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
                                <Input
                                    type="password"
                                    className="pl-14 h-16 rounded-2xl border-slate-200 bg-white focus:ring-4 focus:ring-indigo-50 transition-all text-xl font-black tracking-[0.3em] shadow-sm"
                                    placeholder="••••••••••"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    required
                                />
                            </div>
                        </div>

                        <Button type="submit" className="w-full h-18 py-6 rounded-2xl bg-indigo-600 hover:bg-slate-900 transition-all duration-500 font-black text-2xl shadow-2xl shadow-indigo-300 text-white transform hover:scale-[1.02]" disabled={loading}>
                            {loading ? (
                                <div className="flex items-center gap-3">
                                    <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin" />
                                    Signing you in...
                                </div>
                            ) : 'Sign In'}
                        </Button>

                        <div className="text-center pt-4">
                            <p className="text-slate-500 font-medium">
                                New resident?{' '}
                                <Link href="/auth/student/signup" className="text-indigo-600 font-black hover:underline transition-all underline-offset-4">
                                    Create Account
                                </Link>
                            </p>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
