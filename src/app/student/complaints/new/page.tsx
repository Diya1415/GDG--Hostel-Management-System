"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Upload, X, Loader2, MessageSquarePlus, Sparkles, Image as ImageIcon, Video, ArrowLeft, Wand2 } from 'lucide-react';
import Link from 'next/link';
import { COMPLAINT_CATEGORIES, PRIORITY_LEVELS } from '@/lib/constants';
import { useLanguage } from '@/context/LanguageContext';

export default function NewComplaint() {
    const router = useRouter();
    const { t } = useLanguage();
    const [description, setDescription] = useState('');
    const [media, setMedia] = useState<string | null>(null);
    const [mediaType, setMediaType] = useState<'image' | 'video' | null>(null);

    // Categorization State
    const [category, setCategory] = useState('');
    const [subCategory, setSubCategory] = useState('');
    const [priority, setPriority] = useState('NORMAL');
    const [title, setTitle] = useState('');

    const [loading, setLoading] = useState(false);
    const [analyzing, setAnalyzing] = useState(false);

    // Subcategory options based on selected category
    const currentSubCategories = COMPLAINT_CATEGORIES.find(c => c.name === category)?.subCategories || [];

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 10 * 1024 * 1024) {
                alert("File too large. Max 10MB.");
                return;
            }

            const reader = new FileReader();
            reader.onloadend = () => {
                setMedia(reader.result as string);
                setMediaType(file.type.startsWith('video') ? 'video' : 'image');
            };
            reader.readAsDataURL(file);
        }
    };

    const handleAnalyze = async () => {
        if (!description || description.length < 10) return;
        setAnalyzing(true);
        try {
            const res = await fetch('/api/complaints/analyze', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ description, mediaBase64: media })
            });
            const data = await res.json();

            if (data.category && data.subCategory) {
                setCategory(data.category);
                setSubCategory(data.subCategory);
                setPriority(data.priority || 'NORMAL');
                setTitle(data.summary);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setAnalyzing(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await fetch('/api/complaints', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    description,
                    mediaBase64: media,
                    mediaType,
                    category,
                    subCategory,
                    priority,
                    title
                }),
            });

            if (!res.ok) throw new Error('Failed to submit');

            router.push('/student/dashboard');
        } catch (error) {
            console.error(error);
            alert("Failed to submit complaint. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#fafafa] p-6 md:p-12 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-indigo-50/50 to-transparent" />

            <div className="max-w-3xl mx-auto relative z-10 space-y-8">
                <Link href="/student/dashboard" className="inline-flex items-center gap-2 text-slate-500 hover:text-indigo-600 transition-colors group font-bold">
                    <div className="w-10 h-10 bg-white shadow-md rounded-2xl flex items-center justify-center group-hover:-translate-x-1 transition-transform">
                        <ArrowLeft className="w-5 h-5" />
                    </div>
                    {t('dashboard')}
                </Link>

                <Card className="border-none shadow-[0_32px_64px_-16px_rgba(0,0,0,0.08)] bg-white rounded-[3rem] overflow-hidden">
                    <div className="h-3 bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500 animate-gradient-x bg-[length:200%_100%]" />
                    <CardHeader className="pt-12 pb-2 text-center">
                        <div className="w-20 h-20 bg-indigo-50 rounded-[2rem] flex items-center justify-center mx-auto mb-6 shadow-inner ring-8 ring-indigo-50/50">
                            <MessageSquarePlus className="w-10 h-10 text-indigo-600" />
                        </div>
                        <CardTitle className="text-4xl font-black text-slate-900 tracking-tight leading-none mb-3">{t('newComplaint')}</CardTitle>
                        <p className="text-slate-500 font-medium text-lg max-w-md mx-auto leading-relaxed">
                            Describe the issue and categorize it accurately for faster resolution.
                        </p>
                    </CardHeader>
                    <CardContent className="px-10 pb-16 pt-8">
                        <form onSubmit={handleSubmit} className="space-y-10">

                            <div className="space-y-4">
                                <div className="flex items-center justify-between px-2">
                                    <label className="text-sm font-black text-slate-400 uppercase tracking-widest">Description</label>
                                    <button
                                        type="button"
                                        onClick={handleAnalyze}
                                        disabled={analyzing || description.length < 5}
                                        className="flex items-center gap-1.5 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100 hover:bg-indigo-100 transition-colors disabled:opacity-50"
                                    >
                                        {analyzing ? <Loader2 className="w-3 h-3 animate-spin text-indigo-600" /> : <Wand2 className="w-3 h-3 text-indigo-600" />}
                                        <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider">
                                            {analyzing ? "Analyzing..." : "Auto-Fill with AI"}
                                        </span>
                                    </button>
                                </div>
                                <Textarea
                                    className="min-h-[150px] rounded-[2rem] border-slate-200 bg-slate-50/50 focus:bg-white p-6 text-lg font-medium resize-none focus:ring-4 focus:ring-indigo-100 transition-all placeholder:text-slate-300"
                                    placeholder="Describe your issue..."
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    // Auto analyze on blur if not empty
                                    onBlur={() => { if (!category && description.length > 10) handleAnalyze(); }}
                                    required
                                />
                            </div>

                            {/* Categorization Section */}
                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-black text-slate-400 uppercase tracking-widest px-2">Category</label>
                                    <select
                                        value={category}
                                        onChange={(e) => { setCategory(e.target.value); setSubCategory(''); }} // Reset sub on change
                                        className="w-full h-14 px-6 rounded-2xl bg-slate-50 border-transparent focus:bg-white focus:ring-4 focus:ring-indigo-100 transition-all font-bold text-slate-700 appearance-none"
                                        required
                                    >
                                        <option value="">Select Category</option>
                                        {COMPLAINT_CATEGORIES.map(cat => (
                                            <option key={cat.name} value={cat.name}>{t(cat.name)}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-black text-slate-400 uppercase tracking-widest px-2">Sub-Category</label>
                                    <select
                                        value={subCategory}
                                        onChange={(e) => setSubCategory(e.target.value)}
                                        className="w-full h-14 px-6 rounded-2xl bg-slate-50 border-transparent focus:bg-white focus:ring-4 focus:ring-indigo-100 transition-all font-bold text-slate-700 appearance-none"
                                        required
                                        disabled={!category}
                                    >
                                        <option value="">Select Issue</option>
                                        {currentSubCategories.map(sub => (
                                            <option key={sub} value={sub}>{t(sub)}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-black text-slate-400 uppercase tracking-widest px-2">Priority</label>
                                    <select
                                        value={priority}
                                        onChange={(e) => setPriority(e.target.value)}
                                        className="w-full h-14 px-6 rounded-2xl bg-slate-50 border-transparent focus:bg-white focus:ring-4 focus:ring-indigo-100 transition-all font-bold text-slate-700 appearance-none"
                                    >
                                        {PRIORITY_LEVELS.map(p => (
                                            <option key={p} value={p}>{p}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <label className="text-sm font-black text-slate-400 uppercase tracking-widest px-2">Media (Optional)</label>
                                {!media ? (
                                    <div className="group border-2 border-dashed border-slate-200 hover:border-indigo-400 rounded-[2.5rem] p-8 flex flex-col items-center justify-center text-slate-400 hover:bg-indigo-50/30 transition-all cursor-pointer relative overflow-hidden">
                                        <input type="file" accept="image/*,video/*" className="absolute inset-0 opacity-0 cursor-pointer z-20" onChange={handleFileChange} />
                                        <div className="w-16 h-16 bg-slate-50 rounded-3xl flex items-center justify-center mb-4 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500">
                                            <ImageIcon className="w-8 h-8 text-slate-300 group-hover:text-indigo-400" />
                                        </div>
                                        <span className="font-bold text-slate-900">Upload Photo/Video</span>
                                    </div>
                                ) : (
                                    <div className="relative rounded-[2.5rem] overflow-hidden bg-slate-100 border-4 border-white shadow-2xl shadow-slate-200 h-48 group">
                                        <button type="button" className="absolute top-4 right-4 bg-slate-900/80 hover:bg-rose-500 text-white z-30 w-10 h-10 rounded-xl flex items-center justify-center transition-all shadow-xl backdrop-blur-md" onClick={() => { setMedia(null); setMediaType(null); }}>
                                            <X className="w-5 h-5" />
                                        </button>
                                        {mediaType === 'image' ? (
                                            <img src={media} alt="Preview" className="w-full h-full object-cover" />
                                        ) : (
                                            <video src={media} className="w-full h-full object-cover" controls />
                                        )}
                                    </div>
                                )}
                            </div>

                            <Button type="submit" className="w-full h-20 rounded-[2rem] bg-indigo-600 hover:bg-slate-900 transition-all duration-500 font-black text-2xl shadow-2xl shadow-indigo-200 text-white transform hover:scale-[1.01]" disabled={loading}>
                                {loading ? (
                                    <div className="flex items-center gap-4">
                                        <Loader2 className="w-8 h-8 animate-spin" />
                                        Submitting...
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-3">
                                        <span>Submit Complaint</span>
                                        <Sparkles className="w-6 h-6 fill-white" />
                                    </div>
                                )}
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
