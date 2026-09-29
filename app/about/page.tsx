'use client';

import React from 'react';
import { Navbar } from '../../components/layout/Navbar';
import { Footer } from '../../components/layout/Footer';
import { ShieldCheck, HeartPulse, Award, Users, CheckCircle2 } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />

      <div className="bg-slate-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
          <span className="text-xs uppercase font-bold tracking-widest text-primary-400">About MedPulse Hospital</span>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight">Decades of Healing and Clinical Innovation</h1>
          <p className="max-w-2xl mx-auto text-sm sm:text-base text-slate-300">
            Pioneering minimally invasive surgeries, robotic care, and personalized treatments in New York since 1998.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="space-y-4">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">
              Transforming Modern Healthcare Through Technology & Empathy
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              At MedPulse Hospital, every treatment decision is grounded in evidence-based medicine and collaborative multi-specialty tumor boards and clinical reviews. Our faculty of over 120 senior physicians, surgeons, and nurses work tirelessly around the clock to provide unparalleled medical care.
            </p>
            <div className="space-y-2 pt-2">
              <div className="flex items-center gap-2 text-sm text-slate-700">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>Zero compromise on patient safety protocols and surgical sterility</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-700">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>Paperless electronic health records with secure patient portal access</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-700">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>Dedicated 24/7 cardiac cath lab and stroke thrombolysis team</span>
              </div>
            </div>
          </div>

          <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-soft space-y-6">
            <h3 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3">
              Our Clinical Leadership
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-slate-50">
                <p className="text-2xl font-bold text-primary-600">35,000+</p>
                <p className="text-xs text-slate-500 mt-1">Successful Surgeries</p>
              </div>
              <div className="p-4 rounded-2xl bg-slate-50">
                <p className="text-2xl font-bold text-emerald-600">120+</p>
                <p className="text-xs text-slate-500 mt-1">Full-Time Doctors</p>
              </div>
              <div className="p-4 rounded-2xl bg-slate-50">
                <p className="text-2xl font-bold text-amber-600">14</p>
                <p className="text-xs text-slate-500 mt-1">Speciality Centers</p>
              </div>
              <div className="p-4 rounded-2xl bg-slate-50">
                <p className="text-2xl font-bold text-rose-600">99.4%</p>
                <p className="text-xs text-slate-500 mt-1">Patient Satisfaction</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
