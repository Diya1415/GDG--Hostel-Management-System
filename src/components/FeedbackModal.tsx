"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Star, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface FeedbackModalProps {
    complaintId: string;
    onClose: () => void;
    onSuccess: () => void;
}

export default function FeedbackModal({ complaintId, onClose, onSuccess }: FeedbackModalProps) {
    const [rating, setRating] = useState(0);
    const [hover, setHover] = useState(0);
    const [comment, setComment] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async () => {
        if (rating === 0) return;
        setLoading(true);
        try {
            const res = await fetch(`/api/complaints/${complaintId}/feedback`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ rating, comment })
            });

            if (res.ok) {
                onSuccess();
                onClose();
            } else {
                const data = await res.json();
                alert(data.error || "Failed to submit feedback");
            }
        } catch (error) {
            console.error(error);
            alert("Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
            <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-md overflow-hidden relative"
            >
                <div className="p-8 space-y-8">
                    <div className="flex items-center justify-between">
                        <h2 className="text-2xl font-black text-slate-900 tracking-tight">How was it?</h2>
                        <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                            <X className="w-5 h-5 text-slate-400" />
                        </button>
                    </div>

                    <p className="text-slate-500 font-medium">Your feedback helps us improve the service for everyone.</p>

                    <div className="flex justify-center gap-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <button
                                key={star}
                                onMouseEnter={() => setHover(star)}
                                onMouseLeave={() => setHover(0)}
                                onClick={() => setRating(star)}
                                className="p-1 transition-transform active:scale-90"
                            >
                                <Star
                                    className={`w-10 h-10 ${(hover || rating) >= star
                                            ? 'fill-amber-400 text-amber-400'
                                            : 'text-slate-200'
                                        } transition-colors`}
                                />
                            </button>
                        ))}
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-black text-slate-400 uppercase tracking-widest px-2">Optional Comment</label>
                        <textarea
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            placeholder="Tell us what went well or what could be better..."
                            className="w-full h-32 p-4 bg-slate-50 rounded-2xl border-none focus:ring-4 focus:ring-indigo-50 transition-all font-medium text-slate-700 placeholder:text-slate-300 resize-none"
                        />
                    </div>

                    <Button
                        onClick={handleSubmit}
                        disabled={rating === 0 || loading}
                        className="w-full h-14 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-lg transition-all shadow-xl shadow-indigo-100"
                    >
                        {loading ? "Submitting..." : "Submit Feedback"}
                    </Button>
                </div>
            </motion.div>
        </div>
    );
}
