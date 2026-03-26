"use client";

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Clock, CheckCircle, AlertCircle, Filter, Building,
    LayoutDashboard, Search, Calendar as CalendarIcon,
    BarChart3, Settings, LogOut, ChevronDown, ChevronRight,
    Zap, Home, Sparkles, MapPin, X, Star, BellRing
} from 'lucide-react';
import MaintenanceForm from '@/components/warden/MaintenanceForm';
import { motion, AnimatePresence } from 'framer-motion';
import { format, subDays, startOfWeek, startOfMonth, startOfYear, endOfDay, isSameDay } from 'date-fns';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

interface Complaint {
    id: string;
    title: string;
    description: string;
    status: string;
    createdAt: string;
    priority: string;
    category: string;
    subCategory: string;
    student: {
        name: string;
        roomNumber: string;
        phone: string;
    };
    floorNumber: string;
    hostelName: string;
    mediaUrl?: string;
    feedback?: {
        rating: number;
        comment: string;
    } | null;
}

interface AnalyticsData {
    statusData: any[];
    categoryData: any[];
    priorityData: any[];
    insights: string;
    detectedPatterns?: any[];
    feedbackStats?: {
        byCategory: any[];
        byFloor: any[];
    };
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];
const STATUS_COLORS = {
    PENDING: '#d97706', // amber-600
    IN_PROGRESS: '#4f46e5', // indigo-600
    RESOLVED: '#059669', // emerald-600
} as any;

export default function WardenDashboard() {
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const [complaints, setComplaints] = useState<Complaint[]>([]);
    const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
    const [warden, setWarden] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState<'list' | 'analytics' | 'maintenance'>('list');

    // Filters
    const [searchTerm, setSearchTerm] = useState('');
    const [dateFilterType, setDateFilterType] = useState('today'); // today, yesterday, week, month, year, custom
    const [customStartDate, setCustomStartDate] = useState('');
    const [customEndDate, setCustomEndDate] = useState('');

    const [statusFilter, setStatusFilter] = useState('all');
    const [categoryFilter, setCategoryFilter] = useState('all');
    const [floorFilter, setFloorFilter] = useState('all');
    const [priorityFilter, setPriorityFilter] = useState('all');

    useEffect(() => {
        fetchWardenProfile();
    }, []);

    const fetchWardenProfile = async () => {
        try {
            const res = await fetch('/api/warden/profile');
            if (res.ok) {
                const data = await res.json();
                setWarden(data);
            }
        } catch (error) {
            console.error('Failed to fetch warden profile', error);
        }
    };

    useEffect(() => {
        if (viewMode === 'maintenance') return;

        fetchData();
        const interval = setInterval(() => fetchData(true), 30000); // Poll every 30s silently
        return () => clearInterval(interval);
    }, [dateFilterType, customStartDate, customEndDate, statusFilter, categoryFilter, floorFilter, priorityFilter, viewMode]);
    // Initial load - ensures defaults are respected
    useEffect(() => {
        // Default to TODAY if just loading
        setDateFilterType('today');
    }, []);

    const getDateRangeParams = () => {
        const now = new Date();
        let start = new Date();
        let end = new Date();

        switch (dateFilterType) {
            case 'today':
                start.setHours(0, 0, 0, 0);
                end.setHours(23, 59, 59, 999);
                break;
            case 'yesterday':
                start = subDays(start, 1);
                start.setHours(0, 0, 0, 0);
                end = subDays(end, 1);
                end.setHours(23, 59, 59, 999);
                break;
            case 'week':
                start = startOfWeek(now);
                break;
            case 'month':
                start = startOfMonth(now);
                break;
            case 'year':
                start = startOfYear(now);
                break;
            case 'custom':
                if (customStartDate && customEndDate) {
                    start = new Date(customStartDate);
                    end = new Date(customEndDate);
                    end.setHours(23, 59, 59, 999);
                }
                break;
        }

        return {
            startDate: start.toISOString(),
            endDate: end.toISOString()
        };
    };

    const fetchData = async (isBackground = false) => {
        if (viewMode === 'maintenance') return;

        if (!isBackground) setLoading(true);
        try {
            const { startDate, endDate } = getDateRangeParams();
            const params = new URLSearchParams({
                startDate,
                endDate,
                status: statusFilter,
                category: categoryFilter,
                floor: floorFilter,
                priority: priorityFilter,
                search: searchTerm
            });

            if (viewMode === 'list') {
                const res = await fetch(`/api/complaints?${params.toString()}`);
                const data = await res.json();
                setComplaints(data.complaints || []);
            } else if (viewMode === 'analytics') {
                const res = await fetch(`/api/analytics?${params.toString()}`);
                const data = await res.json();
                setAnalytics(data);
            }
        } catch (error) {
            console.error(error);
        } finally {
            if (!isBackground) setLoading(false);
        }
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        fetchData();
    };

    const updateStatus = async (id: string, newStatus: string) => {
        try {
            await fetch(`/api/complaints/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus, remarks: "Admin Update" })
            });
            // Optimistic update
            setComplaints(complaints.map(c => c.id === id ? { ...c, status: newStatus } : c));
        } catch (error) {
            alert("Failed to update status");
        }
    };

    const statusConfig = {
        PENDING: { color: 'text-amber-600 bg-amber-50 border-amber-200', label: 'Pending' },
        IN_PROGRESS: { color: 'text-indigo-600 bg-indigo-50 border-indigo-200', label: 'Issue being looked at' },
        RESOLVED: { color: 'text-emerald-600 bg-emerald-50 border-emerald-200', label: 'Issue resolved' },
    } as any;

    return (
        <div className="min-h-screen bg-[#f8fafc] flex font-sans text-slate-900">
            {/* Sidebar */}
            <aside className={`hidden md:flex flex-col bg-slate-900 text-white p-6 space-y-8 sticky top-0 h-screen transition-all duration-300 ease-in-out ${isSidebarCollapsed ? 'w-20' : 'w-72'}`}>
                <div className="flex items-center justify-between gap-3 overflow-hidden">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-rose-500 to-orange-500 rounded-xl flex items-center justify-center font-black text-xl shadow-lg shadow-rose-900/50 shrink-0">H</div>
                        {!isSidebarCollapsed && (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                                <h1 className="text-xl font-black tracking-tight">HostelCare</h1>
                                <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">Warden Panel</p>
                            </motion.div>
                        )}
                    </div>
                </div>

                <nav className="flex-1 space-y-2 overflow-hidden">
                    <button
                        onClick={() => setViewMode('list')}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl font-bold transition-all ${viewMode === 'list' ? 'bg-rose-600 text-white shadow-lg shadow-rose-900/20' : 'text-slate-400 hover:bg-white/10'}`}
                        title="Complaints Log"
                    >
                        <LayoutDashboard className="w-5 h-5 shrink-0" />
                        {!isSidebarCollapsed && <span>Complaints Log</span>}
                    </button>
                    <button
                        onClick={() => setViewMode('analytics')}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl font-bold transition-all ${viewMode === 'analytics' ? 'bg-rose-600 text-white shadow-lg shadow-rose-900/20' : 'text-slate-400 hover:bg-white/10'}`}
                        title="Smart Analytics"
                    >
                        <BarChart3 className="w-5 h-5 shrink-0" />
                        {!isSidebarCollapsed && <span>Smart Analytics</span>}
                    </button>
                    <button
                        onClick={() => setViewMode('maintenance')}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl font-bold transition-all ${viewMode === 'maintenance' ? 'bg-rose-600 text-white shadow-lg shadow-rose-900/20' : 'text-slate-400 hover:bg-white/10'}`}
                        title="Maintenance Notifications"
                    >
                        <BellRing className="w-5 h-5 shrink-0" />
                        {!isSidebarCollapsed && <span>Maintenance Work</span>}
                    </button>
                </nav>

                {!isSidebarCollapsed && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-4 bg-white/5 rounded-2xl">
                        <p className="text-xs text-slate-400 font-medium mb-2">Quick Stats (Today)</p>
                        <div className="flex justify-between items-end">
                            <span className="text-3xl font-black">
                                {complaints.filter(c => isSameDay(new Date(c.createdAt), new Date())).length}
                            </span>
                            <span className="text-xs text-emerald-400 font-bold mb-1">+ New</span>
                        </div>
                    </motion.div>
                )}

                <button
                    onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                    className="flex mt-auto mb-4 items-center justify-center p-2 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
                >
                    {isSidebarCollapsed ? <ChevronRight className="w-5 h-5" /> : <X className="w-5 h-5" />}
                </button>
            </aside>

            {/* Main Content */}
            <main className="flex-1 p-4 md:p-8 overflow-y-auto h-screen">
                <div className="max-w-7xl mx-auto space-y-8">

                    {/* Header & Search */}
                    <header className="flex flex-col md:flex-row gap-6 justify-between items-start md:items-center">
                        <div>
                            <h1 className="text-3xl font-black text-slate-900 tracking-tight">
                                {viewMode === 'list' ? 'Dashboard Overview' : 'Analytics & Insights'}
                            </h1>
                            <p className="text-slate-500 font-medium mt-1">
                                Managing {complaints.length} records for <span className="font-bold text-indigo-600">Shambhavi Hall</span>
                            </p>
                        </div>

                        <form onSubmit={handleSearch} className="flex-1 max-w-lg w-full relative group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
                            <input
                                type="text"
                                placeholder="Search title, student, or description..."
                                className="w-full h-14 pl-12 pr-4 bg-white rounded-2xl border-none shadow-sm focus:ring-4 focus:ring-indigo-50 transition-all font-medium text-lg placeholder:text-slate-300"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                            <button type="submit" className="absolute right-2 top-2 h-10 w-10 bg-slate-900 rounded-xl flex items-center justify-center text-white hover:bg-indigo-600 transition-colors">
                                <ChevronRight className="w-5 h-5" />
                            </button>
                        </form>
                    </header>

                    {/* Filters Toolbar */}
                    <div className="bg-white p-4 rounded-[2rem] shadow-sm space-y-4 md:space-y-0 md:flex md:items-center md:justify-between md:gap-4 overflow-x-auto">
                        <div className="flex items-center gap-2 shrink-0">
                            <span className="text-xs font-black text-slate-400 uppercase tracking-widest px-2">Timeframe</span>
                            <div className="flex bg-slate-100 p-1 rounded-xl">
                                {['today', 'yesterday', 'week', 'month', 'year'].map((t) => (
                                    <button
                                        key={t}
                                        onClick={() => setDateFilterType(t)}
                                        className={`px-4 py-2 rounded-lg text-sm font-bold capitalize transition-all ${dateFilterType === t ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                                    >
                                        {t}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="h-8 w-[1px] bg-slate-100 hidden md:block" />

                        <div className="flex items-center gap-4 flex-1 overflow-x-auto pb-2 md:pb-0">
                            <select
                                value={categoryFilter}
                                onChange={(e) => setCategoryFilter(e.target.value)}
                                className="h-11 px-4 rounded-xl bg-slate-50 border-none text-sm font-bold text-slate-600 focus:ring-2 focus:ring-indigo-100 cursor-pointer"
                            >
                                <option value="all">All Categories</option>
                                <option value="Plumbing">Plumbing</option>
                                <option value="Electrical">Electrical</option>
                                <option value="Infrastructure">Infrastructure</option>
                                <option value="Cleanliness">Cleanliness</option>
                                <option value="Internet">Internet/WiFi</option>
                                <option value="Security">Security</option>
                            </select>

                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="h-11 px-4 rounded-xl bg-slate-50 border-none text-sm font-bold text-slate-600 focus:ring-2 focus:ring-indigo-100 cursor-pointer"
                            >
                                <option value="all">All Status</option>
                                <option value="PENDING">Pending</option>
                                <option value="IN_PROGRESS">In Progress</option>
                                <option value="RESOLVED">Resolved</option>
                            </select>

                            <select
                                value={floorFilter}
                                onChange={(e) => setFloorFilter(e.target.value)}
                                className="h-11 px-4 rounded-xl bg-slate-50 border-none text-sm font-bold text-slate-600 focus:ring-2 focus:ring-indigo-100 cursor-pointer"
                            >
                                <option value="all">All Floors</option>
                                <option value="1">1st Floor</option>
                                <option value="2">2nd Floor</option>
                                <option value="3">3rd Floor</option>
                                <option value="4">4th Floor</option>
                                <option value="5">5th Floor</option>
                                <option value="6">6th Floor</option>
                                <option value="7">7th Floor</option>
                            </select>

                            <select
                                value={priorityFilter}
                                onChange={(e) => setPriorityFilter(e.target.value)}
                                className="h-11 px-4 rounded-xl bg-slate-50 border-none text-sm font-bold text-slate-600 focus:ring-2 focus:ring-indigo-100 cursor-pointer"
                            >
                                <option value="all">Priority: All</option>
                                <option value="URGENT">Urgent Only</option>
                                <option value="NORMAL">Normal Only</option>
                            </select>
                        </div>
                    </div>

                    {/* Content Area */}
                    <AnimatePresence mode="wait">
                        {loading ? (
                            <motion.div
                                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                className="flex flex-col items-center justify-center py-20"
                            >
                                <div className="w-12 h-12 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin mb-4" />
                                <span className="text-slate-400 font-bold uppercase tracking-widest text-xs">Fetching Analytics...</span>
                            </motion.div>
                        ) : viewMode === 'list' ? (
                            <motion.div
                                key="list"
                                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
                                className="grid grid-cols-1 gap-4"
                            >
                                {complaints.length === 0 ? (
                                    <div className="text-center py-20 bg-white rounded-[2.5rem]">
                                        <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <CheckCircle className="w-8 h-8 text-slate-300" />
                                        </div>
                                        <h3 className="text-xl font-bold text-slate-900">All caught up!</h3>
                                        <p className="text-slate-500">No complaints found for the selected filters.</p>
                                    </div>
                                ) : (
                                    complaints.map((complaint) => (
                                        <Card key={complaint.id} className="border-none shadow-sm hover:shadow-md transition-shadow bg-white rounded-3xl overflow-hidden group">
                                            <CardContent className="p-6 md:p-8 flex flex-col md:flex-row gap-6 md:gap-10">
                                                {/* Left: Priority & Category */}
                                                <div className="md:w-48 shrink-0 space-y-3">
                                                    <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${complaint.priority === 'URGENT' ? 'bg-rose-100 text-rose-600' : 'bg-slate-100 text-slate-500'}`}>
                                                        <AlertCircle className="w-3 h-3" />
                                                        {complaint.priority}
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Category</span>
                                                        <span className="text-lg font-black text-slate-800">{complaint.category}</span>
                                                        <span className="text-sm font-medium text-slate-500">{complaint.subCategory || 'General'}</span>
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Location</span>
                                                        <span className="text-sm font-bold text-slate-700 flex items-center gap-1">
                                                            <Home className="w-3 h-3" />
                                                            {complaint.hostelName}, Room {complaint.student.roomNumber}
                                                        </span>
                                                    </div>
                                                </div>

                                                {/* Middle: Content */}
                                                <div className="flex-1 space-y-3">
                                                    <div className="flex items-start justify-between">
                                                        <h3 className="text-xl font-black text-slate-900 leading-tight group-hover:text-indigo-600 transition-colors">{complaint.title}</h3>
                                                        <span className="text-xs font-bold text-slate-400 hidden md:block">
                                                            {format(new Date(complaint.createdAt), 'PPP p')}
                                                        </span>
                                                    </div>
                                                    <p className="text-slate-600 font-medium leading-relaxed">
                                                        {complaint.description}
                                                    </p>
                                                    {complaint.mediaUrl && (
                                                        <div className="mt-4 rounded-2xl overflow-hidden border border-slate-100 max-w-sm">
                                                            <img
                                                                src={complaint.mediaUrl}
                                                                alt="Complaint Media"
                                                                className="w-full h-auto object-cover max-h-60"
                                                            />
                                                        </div>
                                                    )}
                                                    <div className="pt-2 flex items-center gap-4 text-xs font-bold text-slate-400">
                                                        <span className="flex items-center gap-1 bg-slate-50 px-2 py-1 rounded-md">
                                                            <LayoutDashboard className="w-3 h-3" />
                                                            Floor {complaint.floorNumber}
                                                        </span>
                                                        <span>•</span>
                                                        <span>Reported by {complaint.student.name}</span>
                                                    </div>

                                                    {complaint.status === 'RESOLVED' && complaint.feedback && (
                                                        <div className="mt-4 p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-2">
                                                            <div className="flex items-center gap-1">
                                                                {[...Array(5)].map((_, i) => (
                                                                    <Star key={i} className={`w-3 h-3 ${i < complaint.feedback!.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-200'}`} />
                                                                ))}
                                                                <span className="ml-2 text-xs font-black text-slate-400 uppercase tracking-widest">Student Feedback</span>
                                                            </div>
                                                            {complaint.feedback.comment && (
                                                                <p className="text-sm font-medium text-slate-600 italic">"{complaint.feedback.comment}"</p>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Right: Actions */}
                                                <div className="md:w-48 shrink-0 flex flex-col justify-between items-end gap-4 border-t md:border-t-0 md:border-l border-slate-100 pt-4 md:pt-0 md:pl-6">
                                                    <div className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest border ${statusConfig[complaint.status].color}`}>
                                                        {statusConfig[complaint.status].label}
                                                    </div>

                                                    <div className="space-y-2 w-full">
                                                        {complaint.status === 'PENDING' && (
                                                            <Button onClick={() => updateStatus(complaint.id, 'IN_PROGRESS')} className="w-full bg-slate-900 hover:bg-indigo-600 text-white font-bold rounded-xl h-10 shadow-lg shadow-slate-200">
                                                                Start Fixing
                                                            </Button>
                                                        )}
                                                        {complaint.status === 'IN_PROGRESS' && (
                                                            <Button onClick={() => updateStatus(complaint.id, 'RESOLVED')} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl h-10 shadow-lg shadow-emerald-200">
                                                                Mark as Fixed
                                                            </Button>
                                                        )}
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))
                                )}
                            </motion.div>
                        ) : viewMode === 'maintenance' ? (
                            <motion.div
                                key="maintenance"
                                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
                            >
                                <MaintenanceForm
                                    hostelName={(warden?.hostelName || "Shambhavi").replace(" Hall", "").trim()}
                                    onSuccess={() => setViewMode('list')}
                                />
                            </motion.div>
                        ) : (
                            <motion.div
                                key="analytics"
                                initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }}
                                className="space-y-12 pb-20"
                            >
                                {/* 1. AI Insights Summary Card */}
                                <div className="bg-slate-50 border border-slate-100 rounded-[3rem] p-10 md:p-14 shadow-sm relative overflow-hidden">
                                    <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-50/30 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2" />

                                    <div className="relative z-10 space-y-12">
                                        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                                            <div className="space-y-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm">
                                                        <Sparkles className="w-6 h-6 text-indigo-500" />
                                                    </div>
                                                    <h3 className="text-3xl font-black text-slate-900 tracking-tight">Management Summary</h3>
                                                </div>
                                                <p className="text-xl font-medium text-slate-600 leading-relaxed max-w-4xl">
                                                    {(analytics?.insights?.split('**Recommendation:**')[0] || "Synthesizing latest maintenance data...")
                                                        .split('\n')
                                                        .filter(line => !line.includes('⚠️')) // Filter out raw pattern alert from description
                                                        .join(' ')
                                                        .replace(/\*/g, '')
                                                        .trim()}
                                                </p>
                                            </div>

                                            {/* Primary Focus Badge */}
                                            <div className="shrink-0 px-6 py-3 bg-white rounded-2xl shadow-sm border border-slate-100">
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Top Priority Area</p>
                                                <p className="text-lg font-black text-indigo-600">
                                                    {analytics?.categoryData?.reduce((prev: any, curr: any) => {
                                                        const currTotal = curr.PENDING + curr.IN_PROGRESS + curr.RESOLVED;
                                                        return currTotal > prev.total ? { cat: curr.category, total: currTotal } : prev;
                                                    }, { cat: 'None', total: -1 }).cat}
                                                </p>
                                            </div>
                                        </div>

                                        {/* 2. Key Metrics Grid */}
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                            <div className="p-8 rounded-[2.5rem] bg-white border border-slate-100 space-y-2 group hover:shadow-md transition-all">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <div className="p-2 bg-slate-50 rounded-lg group-hover:bg-indigo-50 transition-colors">
                                                        <Clock className="w-5 h-5 text-slate-400 group-hover:text-indigo-500" />
                                                    </div>
                                                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Total Active Cases</p>
                                                </div>
                                                <div className="flex items-baseline gap-2">
                                                    <span className="text-5xl font-black text-slate-900">
                                                        {analytics?.statusData?.reduce((acc: number, curr: any) => acc + curr._count.id, 0) || 0}
                                                    </span>
                                                    <span className="text-sm font-bold text-slate-400">Tickets</span>
                                                </div>
                                            </div>

                                            <div className="p-8 rounded-[2.5rem] bg-white border border-slate-100 space-y-2 group hover:shadow-md transition-all">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <div className="p-2 bg-slate-50 rounded-lg group-hover:bg-amber-50 transition-colors">
                                                        <AlertCircle className="w-5 h-5 text-slate-400 group-hover:text-amber-500" />
                                                    </div>
                                                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Urgent Actions</p>
                                                </div>
                                                <div className="flex items-baseline gap-2">
                                                    <span className="text-5xl font-black text-amber-500">
                                                        {analytics?.statusData?.find((s: any) => s.status === 'PENDING')?._count.id || 0}
                                                    </span>
                                                    <span className="text-sm font-bold text-slate-400 text-amber-500/60">Pending</span>
                                                </div>
                                            </div>

                                            <div className="p-8 rounded-[2.5rem] bg-indigo-600 border border-indigo-700 space-y-2 group hover:shadow-lg hover:shadow-indigo-100 transition-all">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <div className="p-2 bg-white/10 rounded-lg">
                                                        <CheckCircle className="w-5 h-5 text-indigo-100" />
                                                    </div>
                                                    <p className="text-xs font-black text-indigo-200 uppercase tracking-widest">Success Rate</p>
                                                </div>
                                                <div className="flex items-baseline gap-2">
                                                    <span className="text-5xl font-black text-white">
                                                        {Math.round(((analytics?.statusData?.find((s: any) => s.status === 'RESOLVED')?._count.id || 0) /
                                                            (analytics?.statusData?.reduce((acc: number, curr: any) => acc + curr._count.id, 0) || 1)) * 100)}%
                                                    </span>
                                                    <span className="text-sm font-bold text-indigo-200">Resolved</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* 3. Primary Alert Card (Systemic Patterns) */}
                                        {analytics?.detectedPatterns && analytics.detectedPatterns.length > 0 && (
                                            <div className="bg-white/80 backdrop-blur-md border border-amber-100 rounded-[2.5rem] p-8 space-y-6">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
                                                        <AlertCircle className="w-6 h-6 text-amber-600" />
                                                    </div>
                                                    <div>
                                                        <h4 className="text-lg font-black text-slate-900">Systemic Issues Detected</h4>
                                                        <p className="text-sm font-medium text-slate-500">Repeated patterns requiring immediate investigation</p>
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                                    {analytics.detectedPatterns.slice(0, 3).map((pattern, idx) => (
                                                        <div key={idx} className="p-5 bg-white border border-slate-100 rounded-2xl space-y-4">
                                                            <div className="flex justify-between items-start">
                                                                <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-[10px] font-black uppercase tracking-widest">
                                                                    Floor {pattern.floor}
                                                                </span>
                                                                <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2 py-1 rounded-md">
                                                                    {pattern.total} Reports
                                                                </span>
                                                            </div>
                                                            <p className="text-base font-black text-slate-800">{pattern.category}</p>
                                                            <div className="space-y-1">
                                                                <div className="flex justify-between text-[10px] font-black text-slate-400 uppercase tracking-wider">
                                                                    <span>Pending Impact</span>
                                                                    <span>{Math.round((pattern.open / pattern.total) * 100)}%</span>
                                                                </div>
                                                                <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                                                    <div
                                                                        className="h-full bg-amber-400 transition-all duration-1000"
                                                                        style={{ width: `${(pattern.open / pattern.total) * 100}%` }}
                                                                    />
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* 4. Admin Advice (Single Recommendation) */}
                                        {analytics?.insights?.includes('**Recommendation:**') && (
                                            <div className="flex flex-col md:flex-row items-center gap-6 p-8 bg-slate-900 text-white rounded-[2.5rem]">
                                                <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center shrink-0">
                                                    <Zap className="w-8 h-8 text-indigo-400" />
                                                </div>
                                                <div className="space-y-1 text-center md:text-left">
                                                    <p className="text-xs font-black text-indigo-400 uppercase tracking-[0.2em]">Suggested Primary Action</p>
                                                    <p className="text-xl font-bold leading-tight">
                                                        {analytics.insights.split('**Recommendation:**')[1]?.replace(/\*/g, '').trim()}
                                                    </p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Detailed Visualizations Header */}
                                <div className="pt-8 text-center space-y-2">
                                    <h4 className="text-2xl font-black text-slate-900">Analytical Breakdown</h4>
                                    <p className="text-slate-500 font-medium">Deep dive into category distributions and feedback ratings</p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    {/* Charts remains but styled cleaner */}
                                    <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm">
                                        <div className="flex items-center gap-3 mb-8">
                                            <BarChart3 className="w-6 h-6 text-indigo-600" />
                                            <h3 className="text-xl font-black text-slate-900">Activity Distribution</h3>
                                        </div>
                                        <div className="h-80">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <BarChart data={analytics?.categoryData || []} margin={{ top: 20, right: 30, left: 20, bottom: 40 }}>
                                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                                    <XAxis dataKey="category" tick={{ fontSize: 11, fontWeight: 'bold', fill: '#94a3b8' }} axisLine={false} tickLine={false} height={60} interval={0} angle={-25} textAnchor="end" />
                                                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fontWeight: 'bold', fill: '#94a3b8' }} />
                                                    <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }} />
                                                    <Bar dataKey="PENDING" stackId="a" fill="#94a3b8" radius={[0, 0, 4, 4]} barSize={45} name="Pending" />
                                                    <Bar dataKey="IN_PROGRESS" stackId="a" fill="#6366f1" barSize={45} name="In Progress" />
                                                    <Bar dataKey="RESOLVED" stackId="a" fill="#10b981" radius={[8, 8, 0, 0]} barSize={45} name="Resolved" />
                                                </BarChart>
                                            </ResponsiveContainer>
                                        </div>
                                    </div>

                                    <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm">
                                        <div className="flex items-center gap-3 mb-8">
                                            <Star className="w-6 h-6 text-amber-500" />
                                            <h3 className="text-xl font-black text-slate-900">Quality Ratings</h3>
                                        </div>
                                        <div className="h-80">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <BarChart data={analytics?.feedbackStats?.byCategory || []} margin={{ top: 20, right: 30, left: 20, bottom: 40 }}>
                                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                                    <XAxis dataKey="category" tick={{ fontSize: 11, fontWeight: 'bold', fill: '#94a3b8' }} axisLine={false} tickLine={false} height={60} interval={0} angle={-25} textAnchor="end" />
                                                    <YAxis domain={[0, 5]} axisLine={false} tickLine={false} tick={{ fontSize: 11, fontWeight: 'bold', fill: '#94a3b8' }} />
                                                    <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }} />
                                                    <Bar dataKey="averageRating" fill="#fbbf24" radius={[12, 12, 4, 4]} barSize={45} name="Avg. Rating" />
                                                </BarChart>
                                            </ResponsiveContainer>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </main>
        </div>
    );
}
