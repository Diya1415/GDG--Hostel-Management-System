"use client";

import { LanguageProvider, useLanguage } from "@/context/LanguageContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { Globe, ShieldCheck, GraduationCap, Building2, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

function LandingPage() {
  const { t, setLanguage, language } = useLanguage();

  return (
    <div className="min-h-screen relative overflow-hidden bg-[#fafafa] font-sans selection:bg-indigo-100 selection:text-indigo-900">
      {/* Background Orbs with Motion */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 2, repeat: Infinity, repeatType: "reverse" }}
        className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-200/40 rounded-full blur-[120px]"
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 3, repeat: Infinity, repeatType: "reverse", delay: 1 }}
        className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-rose-100/40 rounded-full blur-[120px]"
      />

      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen p-6">
        {/* Header / Language Switcher */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="absolute top-6 right-6 flex items-center gap-3 bg-white/90 backdrop-blur-md border border-white/50 p-2 px-4 rounded-2xl shadow-xl shadow-slate-200/50"
        >
          <Globe className="w-5 h-5 text-indigo-600" />
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value as any)}
            className="bg-transparent border-none text-sm font-bold focus:ring-0 cursor-pointer outline-none text-slate-700 appearance-none pr-4"
          >
            <option value="en">English</option>
            <option value="hi">हिंदी (Hindi)</option>
            <option value="kn">ಕನ್ನಡ (Kannada)</option>
          </select>
        </motion.div>

        <div className="max-w-5xl w-full text-center space-y-16 py-20">
          {/* Hero Section */}
          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-md px-6 py-2 rounded-full border border-indigo-100 mb-4 shadow-sm"
            >
              <ShieldCheck className="w-4 h-4 text-indigo-600" />
              <span className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.2em]">Institutional Command Center</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="text-6xl md:text-8xl font-black text-slate-900 tracking-tighter leading-[0.9] flex flex-col gap-2"
            >
              <span>{t('welcome').split(' ')[0]}</span>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-rose-500 pb-2">
                {t('welcome').split(' ').slice(1).join(' ')}
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 1 }}
              className="text-slate-500 text-lg md:text-2xl max-w-2xl mx-auto font-medium leading-relaxed"
            >
              Precision resolution for campus living. Instant categorization and priority handling for every request.
            </motion.p>
          </div>

          {/* Role Selection Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mt-20">
            <motion.div
              whileHover={{ y: -10, scale: 1.02 }}
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.7 }}
            >
              <Link href="/auth/student/login" className="group">
                <Card className="h-full border border-white/50 shadow-2xl shadow-indigo-100/50 bg-white/40 backdrop-blur-2xl hover:bg-white/60 transition-all duration-500 rounded-[2.5rem] overflow-hidden relative p-4">
                  <div className="absolute -top-12 -right-12 p-8 text-indigo-50/50 group-hover:text-indigo-100/50 transition-all duration-700">
                    <GraduationCap className="w-48 h-48 rotate-12" />
                  </div>
                  <CardHeader className="text-left relative z-10 pt-8 pl-6">
                    <motion.div
                      whileHover={{ rotate: 12, scale: 1.1 }}
                      className="w-16 h-16 bg-indigo-600 rounded-3xl flex items-center justify-center mb-6 shadow-2xl shadow-indigo-300"
                    >
                      <GraduationCap className="w-8 h-8 text-white" />
                    </motion.div>
                    <CardTitle className="text-3xl font-black text-slate-900 leading-none mb-2">
                      {t('studentLogin')}
                    </CardTitle>
                    <p className="text-slate-500 font-bold text-sm tracking-wide group-hover:text-indigo-600 transition-colors uppercase">Resident Services</p>
                  </CardHeader>
                  <CardContent className="text-left relative z-10 pl-6 pb-8">
                    <p className="text-slate-500 mb-10 font-medium text-lg pr-12">Submit requests with photos or videos. Track every step of the resolution in real-time.</p>
                    <Button className="w-full h-14 rounded-[1.5rem] bg-slate-900 hover:bg-indigo-600 transition-all duration-500 font-black text-lg shadow-2xl shadow-indigo-200">
                      Open Student Portal
                    </Button>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>

            <motion.div
              whileHover={{ y: -10, scale: 1.02 }}
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.7 }}
            >
              <Link href="/auth/warden/login" className="group">
                <Card className="h-full border border-white/50 shadow-2xl shadow-rose-100/80 bg-white/40 backdrop-blur-2xl hover:bg-white/60 transition-all duration-500 rounded-[2.5rem] overflow-hidden relative p-4">
                  <div className="absolute -top-12 -right-12 p-8 text-rose-50/50 group-hover:text-rose-100/50 transition-all duration-700">
                    <Building2 className="w-48 h-48 -rotate-12" />
                  </div>
                  <CardHeader className="text-left relative z-10 pt-8 pl-6">
                    <motion.div
                      whileHover={{ rotate: -12, scale: 1.1 }}
                      className="w-16 h-16 bg-rose-500 rounded-3xl flex items-center justify-center mb-6 shadow-2xl shadow-rose-200"
                    >
                      <Building2 className="w-6 h-6 text-white" />
                    </motion.div>
                    <CardTitle className="text-3xl font-black text-slate-900 leading-none mb-2">
                      {t('wardenLogin')}
                    </CardTitle>
                    <p className="text-slate-500 font-bold text-sm tracking-wide group-hover:text-rose-600 transition-colors uppercase">Administration</p>
                  </CardHeader>
                  <CardContent className="text-left relative z-10 pl-6 pb-8">
                    <p className="text-slate-500 mb-10 font-medium text-lg pr-12">Monitor incoming alerts, assign staff, and track performance insights for entire hostels.</p>
                    <Button className="w-full h-14 rounded-[1.5rem] bg-slate-900 hover:bg-rose-500 transition-all duration-500 font-black text-lg shadow-2xl shadow-rose-100">
                      Administrator Login
                    </Button>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2 }}
            className="flex items-center justify-center gap-2 text-slate-400 font-bold text-[10px] uppercase tracking-[0.3em]"
          >
            <Sparkles className="w-3 h-3" />
            Empowering Campus Communication
          </motion.div>
        </div>
      </div>
    </div>
  );
}

export default function Page() {
  return (
    <LanguageProvider>
      <LandingPage />
    </LanguageProvider>
  );
}
