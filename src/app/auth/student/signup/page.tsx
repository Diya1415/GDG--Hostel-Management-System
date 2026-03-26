"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { UserPlus, Sparkles, MapPin, Building, Smartphone, GraduationCap } from 'lucide-react';

export default function StudentSignup() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        name: '',
        roomNumber: '',
        floorNumber: '',
        usn: '',
        phone: '',
        email: '',
        hostelName: 'Shambhavi'
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const res = await fetch('/api/auth/student/signup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Signup failed');

            router.push('/auth/student/login');
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen relative overflow-hidden bg-slate-50 flex items-center justify-center p-4 py-12">
            {/* Background Orbs */}
            <div className="absolute top-0 left-0 w-96 h-96 bg-indigo-200/40 rounded-full blur-[100px] -translate-x-1/2 -translate-y-1/2" />
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-rose-200/30 rounded-full blur-[100px] translate-x-1/2 translate-y-1/2" />

            <Card className="w-full max-w-xl border-none shadow-2xl shadow-indigo-100/50 bg-white/80 backdrop-blur-xl relative z-10 rounded-[2rem] overflow-hidden">
                <div className="h-2 bg-gradient-to-r from-indigo-600 via-purple-600 to-rose-500" />
                <CardHeader className="pt-10 pb-2 text-center">
                    <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-indigo-100 shadow-inner">
                        <UserPlus className="w-8 h-8 text-indigo-600" />
                    </div>
                    <CardTitle className="text-3xl font-black text-slate-900">Student Sign Up</CardTitle>
                    <p className="text-slate-500 font-medium">Create your hostel account</p>
                </CardHeader>
                <CardContent className="px-10 pb-12">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {error && (
                            <div className="bg-rose-50 border border-rose-100 text-rose-600 px-4 py-3 rounded-2xl text-sm font-bold flex items-center gap-2 animate-in fade-in zoom-in-95">
                                <Sparkles className="w-4 h-4" />
                                {error}
                            </div>
                        )}

                        <div className="space-y-2 group">
                            <label className="text-xs font-black text-slate-400 uppercase tracking-widest pl-1">Full Name</label>
                            <div className="relative">
                                <GraduationCap className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
                                <Input
                                    className="pl-12 h-14 rounded-2xl border-slate-200 bg-white/50 focus:bg-white focus:ring-4 focus:ring-indigo-50 transition-all text-lg font-medium"
                                    placeholder="Enter your full name"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    required
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-2 group">
                                <label className="text-xs font-black text-slate-400 uppercase tracking-widest pl-1">Hostel</label>
                                <div className="relative">
                                    <Building className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                    <select
                                        className="flex h-14 w-full rounded-2xl border border-slate-200 bg-white/50 px-12 py-2 text-lg font-medium outline-none focus:ring-4 focus:ring-indigo-50 appearance-none transition-all cursor-pointer"
                                        value={formData.hostelName}
                                        onChange={(e) => setFormData({ ...formData, hostelName: e.target.value })}
                                    >
                                        <option value="Shambhavi">Shambhavi</option>
                                        <option value="Shalmala">Shalmala</option>
                                        <option value="Saraswati">Saraswati</option>
                                        <option value="Sharavati">Sharavati</option>
                                    </select>
                                </div>
                            </div>
                            <div className="space-y-2 group">
                                <label className="text-xs font-black text-slate-400 uppercase tracking-widest pl-1">Floor Level</label>
                                <div className="relative">
                                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none z-10" />
                                    <select
                                        className="flex h-14 w-full rounded-2xl border border-slate-200 bg-white/50 px-12 py-2 text-lg font-medium outline-none focus:ring-4 focus:ring-indigo-50 appearance-none transition-all cursor-pointer"
                                        value={formData.floorNumber}
                                        onChange={(e) => setFormData({ ...formData, floorNumber: e.target.value })}
                                        required
                                    >
                                        <option value="" disabled>Select Floor</option>
                                        {[1, 2, 3, 4, 5, 6, 7].map(num => (
                                            <option key={num} value={num}>{num}{num === 1 ? 'st' : num === 2 ? 'nd' : num === 3 ? 'rd' : 'th'} Floor</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-black text-slate-400 uppercase tracking-widest pl-1">Room Number</label>
                            <Input
                                className="h-14 rounded-2xl border-slate-200 bg-white/50 focus:bg-white transition-all text-lg font-medium px-6"
                                placeholder="Room Number (e.g. A504)"
                                value={formData.roomNumber}
                                onChange={(e) => setFormData({ ...formData, roomNumber: e.target.value })}
                                required
                            />
                        </div>

                        <div className="space-y-2 group">
                            <label className="text-xs font-black text-slate-400 uppercase tracking-widest pl-1">University Serial Number (USN)</label>
                            <Input
                                className="h-14 rounded-2xl border-slate-200 bg-white/50 focus:bg-white transition-all text-lg font-black uppercase tracking-widest px-6 focus:ring-4 focus:ring-indigo-50"
                                placeholder="2KE24CS039"
                                value={formData.usn}
                                onChange={(e) => setFormData({ ...formData, usn: e.target.value.toUpperCase() })}
                                required
                            />
                            <p className="text-[10px] font-bold text-indigo-500 uppercase tracking-wider pl-1 italic">Note: Your USN will be your initial access credential.</p>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-black text-slate-400 uppercase tracking-widest pl-1">Phone Number</label>
                            <div className="relative">
                                <Smartphone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                <Input
                                    type="tel"
                                    className="pl-12 h-14 rounded-2xl border-slate-200 bg-white/50 focus:bg-white transition-all text-lg font-medium"
                                    placeholder="+91 XXXXX XXXXX"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    required
                                />
                            </div>
                        </div>

                        <Button type="submit" className="w-full h-16 rounded-2xl bg-indigo-600 hover:bg-slate-900 transition-all duration-500 font-black text-xl shadow-2xl shadow-indigo-200 text-white" disabled={loading}>
                            {loading ? (
                                <div className="flex items-center gap-2">
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    Creating account...
                                </div>
                            ) : 'Create Account'}
                        </Button>

                        <div className="text-center">
                            <p className="text-slate-500 font-medium">
                                Already registered?{' '}
                                <Link href="/auth/student/login" className="text-indigo-600 font-extrabold hover:underline transition-all">
                                    Sign in
                                </Link>
                            </p>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
