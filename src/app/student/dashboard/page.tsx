"use client";

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import Link from 'next/link';
import { PlusCircle, Clock, CheckCircle, AlertCircle, LayoutDashboard, LogOut, MessageSquareText, ShieldAlert, Zap } from 'lucide-react';
import Notifications from '@/components/Notifications';
import FeedbackModal from '@/components/FeedbackModal';
import { AnimatePresence } from 'framer-motion';

interface Complaint {
    id: string;
    title: string;
    description: string;
    status: string;
    createdAt: string;
    priority: string;
    category: string;
    mediaUrl?: string;
    feedback?: {
        id: string;
        rating: number;
        comment?: string;
    } | null;
}

export default function StudentDashboard() {
    const [complaints, setComplaints] = useState<Complaint[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedComplaintId, setSelectedComplaintId] = useState<string | null>(null);

    useEffect(() => {
        fetchComplaints();
        const interval = setInterval(fetchComplaints, 15000); // Poll every 15s
        return () => clearInterval(interval);
    }, []);

    const fetchComplaints = async () => {
        try {
            const res = await fetch('/api/complaints');
            if (res.ok) {
                const data = await res.json();
                setComplaints(data.complaints);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const statusConfig = {
        PENDING: { color: 'text-amber-600 bg-amber-50 border-amber-200', icon: Clock, label: 'Pending' },
        IN_PROGRESS: { color: 'text-indigo-600 bg-indigo-50 border-indigo-200', icon: AlertCircle, label: 'Issue being looked at' },
        RESOLVED: { color: 'text-emerald-600 bg-emerald-50 border-emerald-200', icon: CheckCircle, label: 'Issue resolved' },
    } as any;

    return (
        <div className="min-h-screen bg-[#fafafa] flex">
            {/* Sidebar - Desktop */}
            <aside className="hidden md:flex w-72 bg-white border-r border-slate-100 flex-col p-8 space-y-10 relative z-20">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200 font-black text-white italic">H</div>
                    <span className="text-xl font-black text-slate-900 tracking-tighter">HostelCare</span>
                </div>

                <nav className="flex-1 space-y-2">
                    <Link href="/student/dashboard" className="flex items-center gap-3 px-4 py-3 bg-indigo-50 text-indigo-600 rounded-2xl font-bold transition-all">
                        <LayoutDashboard className="w-5 h-5" />
                        Dashboard
                    </Link>
                    <Link href="/student/complaints/new" className="flex items-center gap-3 px-4 py-3 text-slate-500 hover:bg-slate-50 rounded-2xl font-bold transition-all">
                        <MessageSquareText className="w-5 h-5" />
                        My Complaints
                    </Link>
                </nav>

                <Link href="/" className="flex items-center gap-3 px-4 py-3 text-rose-500 hover:bg-rose-50 rounded-2xl font-bold transition-all">
                    <LogOut className="w-5 h-5" />
                    Sign Out
                </Link>
            </aside>

            {/* Main Content */}
            <main className="flex-1 p-6 md:p-12 relative overflow-hidden">
                {/* Background Gradients */}
                <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-100/50 rounded-full blur-[100px] pointer-events-none" />

                <div className="max-w-5xl mx-auto space-y-10 relative z-10">

                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                        <div className="space-y-2">
                            <div className="inline-flex items-center gap-2 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100 mb-2">
                                <Zap className="w-3 h-3 text-indigo-600 fill-indigo-600" />
                                <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">Active Status</span>
                            </div>
                            <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight">Student Dashboard</h1>
                            <p className="text-slate-500 font-medium text-lg">You have {complaints.length} active complaints.</p>
                        </div>

                        <div className="flex items-center gap-4">
                            <Button
                                variant="outline"
                                size="icon"
                                onClick={fetchComplaints}
                                className="rounded-full hover:bg-white transition-all border-slate-200"
                                title="Refresh Complaints"
                                disabled={loading}
                            >
                                <Zap className={`w-4 h-4 ${loading ? 'animate-pulse text-indigo-400' : 'text-slate-400'}`} />
                            </Button>
                            <Notifications />
                            <Link href="/student/complaints/new" className="shrink-0 hidden md:block">
                                <Button className="h-14 px-8 rounded-2xl bg-indigo-600 hover:bg-slate-900 transition-all duration-300 font-black text-lg gap-3 shadow-xl shadow-indigo-100 group">
                                    <PlusCircle className="w-6 h-6 group-hover:rotate-90 transition-transform duration-300" />
                                    Report New Issue
                                </Button>
                            </Link>
                        </div>
                    </div>

                    {/* Mobile Only New Issue Button */}
                    <div className="md:hidden">
                        <Link href="/student/complaints/new" className="w-full block">
                            <Button className="w-full h-14 rounded-2xl bg-indigo-600 hover:bg-slate-900 font-black text-lg gap-3 shadow-xl shadow-indigo-100 group">
                                <PlusCircle className="w-6 h-6" />
                                Report New Issue
                            </Button>
                        </Link>
                    </div>

                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-24 space-y-4">
                            <div className="w-12 h-12 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin" />
                            <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Loading Complaints...</p>
                        </div>
                    ) : complaints.length === 0 ? (
                        <Card className="text-center py-20 border-2 border-dashed border-slate-200 bg-white/50 rounded-[3rem] shadow-none">
                            <CardContent className="space-y-6">
                                <div className="w-20 h-20 bg-slate-100 rounded-3xl flex items-center justify-center mx-auto">
                                    <ShieldAlert className="w-10 h-10 text-slate-300" />
                                </div>
                                <div className="space-y-2">
                                    <h3 className="text-2xl font-black text-slate-900">All Systems Clear</h3>
                                    <p className="text-slate-500 font-medium max-w-sm mx-auto">No issues reported in your quarters. Everything seems to be in perfect order.</p>
                                </div>
                                <Link href="/student/complaints/new" className="inline-block pt-4">
                                    <Button variant="outline" className="border-2 border-slate-200 h-14 px-10 rounded-2xl font-black text-slate-900 hover:bg-slate-50">Raise Alert Now</Button>
                                </Link>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="grid gap-6">
                            {complaints.map((complaint) => {
                                const StatusIcon = statusConfig[complaint.status]?.icon || Clock;
                                return (
                                    <Card key={complaint.id} className="group border-none shadow-xl shadow-slate-200/40 bg-white/80 backdrop-blur-md hover:bg-white transition-all duration-500 transform hover:-translate-y-1 rounded-[2.5rem] overflow-hidden p-2">
                                        <CardHeader className="flex flex-row items-start justify-between pb-4 pt-6 px-8 text-left">
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-3">
                                                    {complaint.priority === 'URGENT' && (
                                                        <span className="flex h-3 w-3 relative">
                                                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                                                            <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500"></span>
                                                        </span>
                                                    )}
                                                    <CardTitle className="text-2xl font-black text-slate-900 group-hover:text-indigo-600 transition-colors">
                                                        {complaint.title}
                                                    </CardTitle>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em]">{complaint.category}</span>
                                                    <span className="w-1 h-1 bg-slate-300 rounded-full" />
                                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em]">{new Date(complaint.createdAt).toLocaleDateString()}</span>
                                                </div>
                                            </div>
                                            <div className={`px-4 py-2 rounded-2xl text-xs font-black border flex items-center gap-2 uppercase tracking-wider ${statusConfig[complaint.status]?.color}`}>
                                                <StatusIcon className="w-4 h-4" />
                                                {statusConfig[complaint.status]?.label || complaint.status}
                                            </div>
                                        </CardHeader>
                                        <CardContent className="px-8 pb-8 text-left">
                                            <p className="text-slate-500 font-medium text-lg leading-relaxed line-clamp-2">{complaint.description}</p>

                                            {complaint.mediaUrl && (
                                                <div className="mt-4 rounded-2xl overflow-hidden border border-slate-100 max-w-sm">
                                                    <img
                                                        src={complaint.mediaUrl}
                                                        alt="Complaint Media"
                                                        className="w-full h-auto object-cover max-h-60"
                                                    />
                                                </div>
                                            )}

                                            <div className="mt-8 flex items-center justify-between pt-6 border-t border-slate-50">
                                                <div className="flex items-center gap-2 text-slate-400">
                                                    <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-black">QC</div>
                                                    <span className="text-xs font-bold uppercase tracking-widest">Quality Verified</span>
                                                </div>
                                                <button className="text-indigo-600 font-black text-xs uppercase tracking-widest hover:underline underline-offset-4">View Full History</button>
                                            </div>

                                            {complaint.status === 'RESOLVED' && (
                                                <div className="mt-4">
                                                    {complaint.feedback ? (
                                                        <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-xl w-fit">
                                                            <CheckCircle className="w-4 h-4" />
                                                            <span className="text-xs font-black uppercase tracking-wider">Feedback Submitted</span>
                                                        </div>
                                                    ) : (
                                                        <Button
                                                            onClick={() => setSelectedComplaintId(complaint.id)}
                                                            className="bg-indigo-600 hover:bg-slate-900 text-white font-bold rounded-xl h-10 px-6 shadow-lg shadow-indigo-100"
                                                        >
                                                            Give Feedback
                                                        </Button>
                                                    )}
                                                </div>
                                            )}
                                        </CardContent>
                                    </Card>
                                )
                            })}
                        </div>
                    )}
                </div>
            </main>

            <AnimatePresence>
                {selectedComplaintId && (
                    <FeedbackModal
                        complaintId={selectedComplaintId}
                        onClose={() => setSelectedComplaintId(null)}
                        onSuccess={fetchComplaints}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}
