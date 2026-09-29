'use client';

import React from 'react';
import Link from 'next/link';
import { Navbar } from '../../components/layout/Navbar';
import { Footer } from '../../components/layout/Footer';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { BedDouble, Shield, Stethoscope, Microscope, Sparkles, Building2 } from 'lucide-react';

export default function FacilitiesPage() {
  const wards = [
    { title: 'Deluxe Private Suites', rate: '$250 / day', desc: 'Private room with motorized ergonomic bed, ensuite bathroom, caregiver recliner couch, television, and high-speed Wi-Fi.' },
    { title: 'Semi-Private Rooms', rate: '$120 / day', desc: 'Twin sharing air-conditioned room with acoustic privacy curtain dividers, centralized oxygen, and dedicated nurse stations.' },
    { title: 'General Medical Wards', rate: '$60 / day', desc: 'Spacious 4-bed observational and recovery ward with 24/7 nursing supervision, sterile airflow, and crash cart accessibility.' },
    { title: 'Coronary & Medical ICU', rate: '$450 / day', desc: '1:1 patient-to-nurse ratio, invasive hemodynamic blood pressure monitors, high-frequency ventilators, and continuous telemetry.' }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />

      <div className="bg-slate-900 text-white py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-3">
          <span className="text-xs font-bold uppercase tracking-widest text-primary-400">Hospital Infrastructure</span>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight">Facilities & Patient Accommodations</h1>
          <p className="max-w-2xl mx-auto text-sm text-slate-300">
            500 inpatient beds designed for patient dignity, optimal infection control, and rapid healing.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 flex-1 space-y-12">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 mb-6">Inpatient Ward Categories</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {wards.map((w, idx) => (
              <Card key={idx} hoverEffect className="flex flex-col justify-between">
                <CardContent className="space-y-4">
                  <div className="w-10 h-10 rounded-xl bg-primary-100 text-primary-700 flex items-center justify-center font-bold">
                    <BedDouble className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900">{w.title}</h3>
                    <p className="text-xs text-primary-600 font-bold mt-0.5">{w.rate}</p>
                    <p className="text-xs text-slate-500 mt-2 leading-relaxed">{w.desc}</p>
                  </div>
                </CardContent>
                <div className="p-4 pt-0">
                  <Link href="/appointments">
                    <Button size="sm" variant="outline" className="w-full">
                      Inquire Admission
                    </Button>
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Specialized Facilities */}
        <div className="bg-white p-8 rounded-3xl border border-slate-200/80 shadow-soft">
          <h3 className="text-xl font-bold text-slate-900 mb-6">Advanced Clinical Infrastructure</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm text-slate-600">
            <div className="space-y-2">
              <h4 className="font-bold text-slate-900 flex items-center gap-2">
                <Shield className="w-4 h-4 text-emerald-600" /> Positive Pressure Operation Theatres
              </h4>
              <p className="text-xs text-slate-500">HEPA-filtered laminar airflow operating rooms ensuring near-zero surgical site infection risk.</p>
            </div>
            <div className="space-y-2">
              <h4 className="font-bold text-slate-900 flex items-center gap-2">
                <Microscope className="w-4 h-4 text-primary-600" /> Molecular & Histology Labs
              </h4>
              <p className="text-xs text-slate-500">Rapid-turnaround computerized diagnostic blood gas, cardiac biomarker, and histology analyzers.</p>
            </div>
            <div className="space-y-2">
              <h4 className="font-bold text-slate-900 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-amber-600" /> Automated Central Sterilization (CSSD)
              </h4>
              <p className="text-xs text-slate-500">Hospital-wide autoclave and plasma sterilization tracking for every surgical instrument.</p>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
