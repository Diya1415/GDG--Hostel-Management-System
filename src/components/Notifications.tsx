'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { useToast } from '@/context/ToastContext';

interface Notification {
    id: string;
    complaintId: string;
    previousStatus: string;
    newStatus: string;
    remarks: string | null;
    timestamp: string;
    complaint: {
        title: string;
        category: string;
    };
    type?: 'complaint';
}

interface MaintenanceNotification {
    id: string;
    category: string;
    description: string;
    timeline: string;
    scheduledAt: string | null;
    createdAt: string;
    type: 'maintenance';
}

type CombinedNotification = Notification | MaintenanceNotification;

export default function Notifications() {
    const { t, language } = useLanguage(); // language from context might be used for date formatting
    const [notifications, setNotifications] = useState<CombinedNotification[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);
    const lastCheckRef = useRef<string | null>(null);

    const { showToast } = useToast();
    const prevNotificationsRef = useRef<CombinedNotification[]>([]);

    useEffect(() => {
        fetchNotifications();
        const interval = setInterval(fetchNotifications, 10000);
        return () => clearInterval(interval);
    }, []);

    const fetchNotifications = async () => {
        try {
            const [complaintRes, maintenanceRes] = await Promise.all([
                fetch('/api/student/notifications'),
                fetch('/api/student/maintenance-notifications')
            ]);

            let complaintData: Notification[] = [];
            let maintenanceData: MaintenanceNotification[] = [];

            if (complaintRes.ok) {
                complaintData = (await complaintRes.json()).map((n: any) => ({ ...n, type: 'complaint' }));
            }
            if (maintenanceRes.ok) {
                maintenanceData = (await maintenanceRes.json()).map((n: any) => ({ ...n, type: 'maintenance' }));
            }

            const combined: CombinedNotification[] = [...complaintData, ...maintenanceData].sort((a, b) => {
                const timeA = 'timestamp' in a ? a.timestamp : a.createdAt;
                const timeB = 'timestamp' in b ? b.timestamp : b.createdAt;
                return new Date(timeB).getTime() - new Date(timeA).getTime();
            });

            // Track IDs of processed notifications to avoid double-toasting
            const processedIds = new Set(prevNotificationsRef.current.map(n => n.id));

            // Check for new notifications
            if (combined.length > 0) {
                const latest = combined[0];
                if (!processedIds.has(latest.id) && prevNotificationsRef.current.length > 0) {
                    if (latest.type === 'maintenance') {
                        showToast(`Maintenance Update: ${latest.category} - ${latest.timeline}`, 'info');
                    } else {
                        showToast(`Status Update: ${latest.complaint.title} is now ${latest.newStatus.replace('_', ' ')}`, 'info');
                    }
                }
            }

            setNotifications(combined);
            prevNotificationsRef.current = combined;
        } catch (error) {
            console.error("Failed to fetch notifications", error);
        }
    };

    const toggleOpen = () => {
        setIsOpen(!isOpen);
        if (!isOpen) {
            setUnreadCount(0); // Mark seen when opened
        }
    };

    // Format date helper
    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return new Intl.DateTimeFormat(language === 'en' ? 'en-US' : language, {
            month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
        }).format(date);
    };

    return (
        <div className="relative z-50">
            <button
                onClick={toggleOpen}
                className="relative p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                aria-label={t('notifications')}
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-600 dark:text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                {/* Red dot if needed, logic to be refined */}
                {notifications.length > 0 && (('timestamp' in notifications[0] ? notifications[0].timestamp : notifications[0].createdAt) > (lastCheckRef.current || '')) && (
                    <span className="absolute top-0 right-0 block h-3 w-3 rounded-full ring-2 ring-white bg-red-500"></span>
                )}
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-80 md:w-96 bg-white dark:bg-gray-800 rounded-lg shadow-xl ring-1 ring-black ring-opacity-5 overflow-hidden border border-gray-200 dark:border-gray-700">
                    <div className="px-5 py-4 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-b border-slate-100 dark:border-slate-800 flex justify-between items-center relative z-10">
                        <div className="flex items-center gap-2">
                            <h3 className="font-black text-slate-900 dark:text-white tracking-tight">{t('notifications')}</h3>
                            <div className="w-1 h-1 bg-slate-300 rounded-full"></div>
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mt-0.5">
                                {notifications.length} {notifications.length === 1 ? 'Alert' : 'Alerts'}
                            </span>
                        </div>
                        <button
                            onClick={() => setIsOpen(false)}
                            className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors text-slate-400"
                        >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    <div className="max-h-96 overflow-y-auto">
                        {notifications.length === 0 ? (
                            <div className="p-4 text-center text-gray-500">
                                {t('noNotifications')}
                            </div>
                        ) : (
                            <ul className="divide-y divide-gray-100 dark:divide-gray-700">
                                {notifications.map((notif) => (
                                    <li key={notif.id} className={`p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition relative overflow-hidden ${notif.type === 'maintenance' ? 'bg-indigo-50/50 dark:bg-indigo-900/20' : ''}`}>
                                        {notif.type === 'maintenance' && (
                                            <div className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-500"></div>
                                        )}
                                        <div className="flex justify-between items-start mb-1">
                                            <p className={`text-sm font-bold ${notif.type === 'maintenance' ? 'text-indigo-600 dark:text-indigo-400' : 'text-blue-600 dark:text-blue-400'}`}>
                                                {notif.type === 'maintenance' ? t('maintenanceUpdate') : notif.complaint.title}
                                            </p>
                                            <span className="text-[10px] text-gray-400 font-medium whitespace-nowrap ml-2">
                                                {formatDate(notif.type === 'maintenance' ? notif.createdAt : notif.timestamp)}
                                            </span>
                                        </div>
                                        {notif.type === 'maintenance' ? (
                                            <div className="space-y-3">
                                                <div className="flex items-center gap-2">
                                                    <span className="px-2 py-0.5 bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 text-[10px] font-black uppercase tracking-widest rounded-md">
                                                        {t(notif.category)}
                                                    </span>
                                                </div>
                                                <p className="text-sm font-medium text-slate-600 dark:text-slate-300 leading-relaxed pl-2 border-l-2 border-slate-100 dark:border-slate-800">
                                                    {notif.description}
                                                </p>
                                                <div className="flex items-center gap-2 pt-2">
                                                    <div className="w-6 h-6 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg flex items-center justify-center">
                                                        <svg className="w-3.5 h-3.5 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 0 0118 0z" />
                                                        </svg>
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">{t('expected')}</span>
                                                        <span className="text-xs font-bold text-slate-700 dark:text-slate-200">
                                                            {notif.timeline === 'custom' && notif.scheduledAt ? new Date(notif.scheduledAt).toLocaleString() : t(notif.timeline)}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="space-y-2">
                                                <p className="text-sm font-medium text-slate-600 dark:text-slate-300">
                                                    {t('statusChanged')}: <span className="font-black text-slate-900 dark:text-white uppercase text-[10px] tracking-widest bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-md ml-1">{t(notif.newStatus)}</span>
                                                </p>
                                                {notif.remarks && (
                                                    <p className="text-xs text-slate-400 italic bg-slate-50 dark:bg-slate-900/50 p-2 rounded-xl border border-slate-100 dark:border-slate-800">
                                                        "{notif.remarks}"
                                                    </p>
                                                )}
                                            </div>
                                        )}
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
