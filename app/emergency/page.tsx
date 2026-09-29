'use client';

import React from 'react';
import Link from 'next/link';
import { Navbar } from '../../components/layout/Navbar';
import { Footer } from '../../components/layout/Footer';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import {
  Ambulance,
  PhoneCall,
  AlertTriangle,
  Clock,
  HeartPulse,
  Activity,
  ShieldAlert,
  MapPin
} from 'lucide-react';

export default function EmergencyPage() {
  const triageLevels = [
    { level: 'Level 1: Critical (Immediate)', badge: 'danger', desc: 'Cardiac arrest, severe respiratory failure, massive hemorrhaging, multi-trauma shock. Zero waiting time.' },
    { level: 'Level 2: High Priority (Emergent)', badge: 'warning', desc: 'Suspected acute myocardial infarction (heart attack), stroke, severe fractures with neurovascular compromise. Triage within 10 minutes.' },
    { level: 'Level 3: Urgent', badge: 'info', desc: 'High fever, acute abdominal pain, moderate asthma attack, closed fractures. Triage within 30 minutes.' },
    { level: 'Level 4: Non-Urgent', badge: 'neutral', desc: 'Minor lacerations, mild sprains, chronic symptom review. Triage evaluated by urgent outpatient care.' }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />

      {/* Hero Alert Banner */}
      <div className="bg-rose-600 text-white py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 text-xs font-bold uppercase tracking-wider">
            <span className="w-2 h-2 rounded-full bg-white animate-ping"></span> 24/7 Emergency & Level-1 Trauma Center
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight">Need Urgent Emergency Care?</h1>
          <p className="max-w-2xl mx-auto text-sm sm:text-base text-rose-100">
            Our trauma surgeons, emergency intensivists, and life-support mobile ambulances are on standby 24 hours a day, 365 days a year.
          </p>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="tel:+15559110000"
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-white text-rose-700 font-extrabold text-base shadow-lg hover:bg-rose-50 transition-colors"
            >
              <PhoneCall className="w-5 h-5 text-rose-600" />
              Call Emergency: +1 (555) 911-0000
            </a>
            <a
              href="tel:+15552345678"
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-rose-700/60 border border-white/30 text-white font-bold text-base hover:bg-rose-700 transition-colors"
            >
              <Ambulance className="w-5 h-5" />
              Dispatch Ambulance
            </a>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 flex-1 space-y-12">
        {/* Triage Protocol */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-slate-900">Emergency Triage Classification (ESI Protocol)</h2>
          <p className="text-sm text-slate-500">
            Patients arriving at the MedPulse emergency department are evaluated immediately by certified triage nurses. Priority is assigned based on clinical acuity:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
            {triageLevels.map((t, idx) => (
              <Card key={idx}>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-bold text-slate-900">{t.level}</h3>
                    <Badge variant={t.badge as any} size="sm">Active</Badge>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">{t.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Location & Directions */}
        <div className="bg-white p-8 rounded-3xl border border-slate-200/80 shadow-soft grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-slate-900">Emergency Entrance & Ambulance Bay</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              The emergency trauma driveway is accessible directly from Evergreen Avenue with dedicated zero-barrier ramp access for ambulances and emergency drop-offs.
            </p>
            <div className="space-y-2 text-sm text-slate-700">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-rose-600 shrink-0" />
                <span>742 Evergreen Medical Park, Emergency Gate 1, New York, NY 10001</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-rose-600 shrink-0" />
                <span>Open 24 Hours / 7 Days a Week</span>
              </div>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-rose-50 border border-rose-100 text-center space-y-3">
            <ShieldAlert className="w-12 h-12 text-rose-600 mx-auto" />
            <h4 className="text-base font-bold text-rose-950">Stroke & Heart Attack Rapid Protocol</h4>
            <p className="text-xs text-rose-800">
              Door-to-balloon time for STEMI angioplasty under 60 minutes. Immediate non-contrast brain CT on arrival for suspected acute ischemic stroke.
            </p>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
