'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { COMPLAINT_CATEGORIES } from '@/lib/constants';
import { AlertCircle, Clock, Send, Eye, X, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface MaintenanceFormProps {
    hostelName: string;
    onSuccess: () => void;
}

const TIMELINE_OPTIONS = [
    { value: 'today', label: 'Today' },
    { value: '1h', label: 'In 1 hour' },
    { value: '2h', label: 'In 2 hours' },
    { value: 'tomorrow', label: 'Tomorrow' },
    { value: '2days', label: 'After 2 days' },
    { value: 'custom', label: 'Custom' }
];

export default function MaintenanceForm({ hostelName, onSuccess }: MaintenanceFormProps) {
    const [formData, setFormData] = useState({
        floor: 'all',
        roomNumber: '',
        category: '',
        description: '',
        timeline: 'today',
        scheduledAt: ''
    });
    const [showPreview, setShowPreview] = useState(false);
    const [isSending, setIsSending] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSending(true);

        try {
            const res = await fetch('/api/warden/maintenance-notifications', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    hostelName
                })
            });

            if (res.ok) {
                setFormData({
                    floor: 'all',
                    roomNumber: '',
                    category: '',
                    description: '',
                    timeline: 'today',
                    scheduledAt: ''
                });
                setShowPreview(false);
                alert('Notification sent successfully!');
                onSuccess();
            } else {
                alert('Failed to send notification');
            }
        } catch (error) {
            console.error(error);
            alert('An error occurred');
        } finally {
            setIsSending(false);
        }
    };

    const getTimelineLabel = (val: string) => {
        return TIMELINE_OPTIONS.find(opt => opt.value === val)?.label || val;
    };

    return (
        <div className="space-y-6">
            <Card className="border-none shadow-sm bg-white rounded-[2rem] overflow-hidden">
                <CardHeader className="bg-slate-50 border-b border-slate-100 p-8">
                    <CardTitle className="text-2xl font-black text-slate-900 flex items-center gap-3">
                        <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white">
                            <Send className="w-5 h-5" />
                        </div>
                        Create New notification
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-8">
                    <form onSubmit={(e) => { e.preventDefault(); setShowPreview(true); }} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-400 uppercase tracking-widest">Target Floor</label>
                                <select
                                    value={formData.floor}
                                    onChange={(e) => setFormData({ ...formData, floor: e.target.value })}
                                    className="w-full h-12 px-4 rounded-xl bg-slate-50 border-none text-sm font-bold text-slate-600 focus:ring-2 focus:ring-indigo-100 cursor-pointer"
                                >
                                    <option value="all">All Floors</option>
                                    {[1, 2, 3, 4, 5, 6, 7].map(f => (
                                        <option key={f} value={f.toString()}>{f}th Floor</option>
                                    ))}
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-400 uppercase tracking-widest">Target Room(s) (Optional)</label>
                                <input
                                    type="text"
                                    placeholder="e.g. 101, 102 or leave blank"
                                    value={formData.roomNumber}
                                    onChange={(e) => setFormData({ ...formData, roomNumber: e.target.value })}
                                    className="w-full h-12 px-4 rounded-xl bg-slate-50 border-none text-sm font-bold text-slate-600 focus:ring-2 focus:ring-indigo-100"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-400 uppercase tracking-widest">Category</label>
                                <select
                                    required
                                    value={formData.category}
                                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                    className="w-full h-12 px-4 rounded-xl bg-slate-50 border-none text-sm font-bold text-slate-600 focus:ring-2 focus:ring-indigo-100 cursor-pointer"
                                >
                                    <option value="">Select Category</option>
                                    {COMPLAINT_CATEGORIES.map(cat => (
                                        <option key={cat.name} value={cat.name}>{cat.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-400 uppercase tracking-widest">Timeline</label>
                                <select
                                    value={formData.timeline}
                                    onChange={(e) => setFormData({ ...formData, timeline: e.target.value })}
                                    className="w-full h-12 px-4 rounded-xl bg-slate-50 border-none text-sm font-bold text-slate-600 focus:ring-2 focus:ring-indigo-100 cursor-pointer"
                                >
                                    {TIMELINE_OPTIONS.map(opt => (
                                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {formData.timeline === 'custom' && (
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-400 uppercase tracking-widest">Custom Date & Time</label>
                                <input
                                    type="datetime-local"
                                    required
                                    value={formData.scheduledAt}
                                    onChange={(e) => setFormData({ ...formData, scheduledAt: e.target.value })}
                                    className="w-full h-12 px-4 rounded-xl bg-slate-50 border-none text-sm font-bold text-slate-600 focus:ring-2 focus:ring-indigo-100"
                                />
                            </div>
                        )}

                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-400 uppercase tracking-widest">Description of Work</label>
                            <textarea
                                required
                                rows={4}
                                placeholder="Describe the maintenance work..."
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                className="w-full p-4 rounded-xl bg-slate-50 border-none text-sm font-bold text-slate-600 focus:ring-2 focus:ring-indigo-100 resize-none"
                            />
                        </div>

                        <div className="flex justify-end">
                            <Button type="submit" className="bg-slate-900 hover:bg-indigo-600 text-white font-bold rounded-xl h-12 px-8 flex items-center gap-2 transition-all">
                                <Eye className="w-5 h-5" />
                                Preview notification
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>

            <AnimatePresence>
                {showPreview && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                        className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
                    >
                        <Card className="w-full max-w-lg border-none shadow-2xl bg-white rounded-[2.5rem] overflow-hidden">
                            <div className="p-8 bg-indigo-600 text-white relative">
                                <button
                                    onClick={() => setShowPreview(false)}
                                    className="absolute top-6 right-6 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
                                        <AlertCircle className="w-6 h-6" />
                                    </div>
                                    <h3 className="text-2xl font-black italic tracking-tight">Maintenance Update</h3>
                                </div>
                                <p className="text-indigo-100 font-medium">Preview of what students will see</p>
                            </div>

                            <CardContent className="p-8 space-y-6">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-4 bg-slate-50 rounded-2xl">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Type</p>
                                        <p className="font-bold text-slate-900">{formData.category || 'N/A'}</p>
                                    </div>
                                    <div className="p-4 bg-slate-50 rounded-2xl">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Time</p>
                                        <p className="font-bold text-slate-900">
                                            {formData.timeline === 'custom' ? new Date(formData.scheduledAt).toLocaleString() : getTimelineLabel(formData.timeline)}
                                        </p>
                                    </div>
                                </div>

                                <div className="p-6 border-2 border-indigo-50 bg-indigo-50/30 rounded-2xl">
                                    <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-2">Affected Area</p>
                                    <p className="font-bold text-slate-800">
                                        {formData.floor === 'all' ? 'All Floors' : `Floor ${formData.floor}`}
                                        {formData.roomNumber ? `, Room ${formData.roomNumber}` : ' (All Rooms)'}
                                    </p>
                                </div>

                                <div className="space-y-2">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Message</p>
                                    <p className="text-slate-700 font-medium leading-relaxed bg-slate-50 p-4 rounded-xl">
                                        {formData.description || 'No description provided.'}
                                    </p>
                                </div>

                                <div className="flex flex-col gap-3 pt-4">
                                    <Button
                                        onClick={handleSubmit}
                                        disabled={isSending}
                                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white h-14 rounded-2xl font-black text-lg shadow-xl shadow-indigo-100 flex items-center justify-center gap-3 transition-all"
                                    >
                                        {isSending ? (
                                            <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin" />
                                        ) : (
                                            <>
                                                <Send className="w-6 h-6" />
                                                Send notifications Now
                                            </>
                                        )}
                                    </Button>
                                    <button
                                        onClick={() => setShowPreview(false)}
                                        className="w-full h-12 text-slate-400 font-bold hover:text-slate-600 transition-colors"
                                    >
                                        Go back and edit
                                    </button>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
