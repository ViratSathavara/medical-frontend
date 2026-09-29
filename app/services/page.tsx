'use client';

import React from 'react';
import Link from 'next/link';
import { Navbar } from '../../components/layout/Navbar';
import { Footer } from '../../components/layout/Footer';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import {
  HeartPulse,
  Activity,
  Ambulance,
  Pill,
  Microscope,
  Stethoscope,
  Scissors,
  Baby,
  Eye,
  Scan,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';

export default function ServicesPage() {
  const clinicalServices = [
    { title: 'Cardiology & Angioplasty', icon: HeartPulse, desc: 'Coronary angiography, drug-eluting stent placement, electrophysiology, and open bypass cardiac surgical care.' },
    { title: 'Neurosurgery & Spine', icon: Activity, desc: 'Microsurgical aneurysm clipping, minimally invasive spine decompression, stroke intervention, and brain trauma surgery.' },
    { title: 'Level-1 Emergency Trauma', icon: Ambulance, desc: 'Dedicated 24/7 polytrauma response teams, acute resuscitation bays, and emergency surgical operating theaters.' },
    { title: 'Diagnostic Pathology & Lab', icon: Microscope, desc: 'Fully automated biochemistry, molecular microbiology, hematology panels, and computerized cytology.' },
    { title: 'Robotic Laparoscopy', icon: Scissors, desc: 'High-precision DaVinci robotic gastrointestinal, bariatric, and complex hernia reconstructions.' },
    { title: '3T MRI & 128-Slice CT', icon: Scan, desc: 'High resolution digital radiodiagnostics, virtual coronary scans, musculoskeletal MRI, and ultrasound.' },
    { title: 'Pediatric Intensive Care', icon: Baby, desc: 'Level-3 Neonatal ICU (NICU) with dedicated neonatal ventilators, incubators, and pediatric subspecialists.' },
    { title: 'Digital Pharmacy & Dispensing', icon: Pill, desc: 'Integrated e-prescription processing, bedside dose verification, cold-chain biologics, and emergency delivery.' }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />

      <div className="bg-slate-900 text-white py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-3">
          <span className="text-xs font-bold uppercase tracking-widest text-primary-400">Clinical Capabilities</span>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight">Our Medical Services</h1>
          <p className="max-w-2xl mx-auto text-sm text-slate-300">
            Comprehensive outpatient diagnostics, acute inpatient monitoring, and specialized surgical care.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 flex-1">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {clinicalServices.map((srv, idx) => {
            const Icon = srv.icon;
            return (
              <Card key={idx} hoverEffect className="group">
                <CardContent className="space-y-4">
                  <div className="w-12 h-12 rounded-2xl bg-primary-50 text-primary-600 flex items-center justify-center group-hover:bg-primary-600 group-hover:text-white transition-colors">
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-base font-bold text-slate-900 group-hover:text-primary-600 transition-colors">
                    {srv.title}
                  </h3>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    {srv.desc}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="mt-16 bg-white p-8 rounded-3xl border border-slate-200/80 shadow-soft text-center space-y-4">
          <h3 className="text-xl font-bold text-slate-900">Need Immediate Medical Advice or Second Opinion?</h3>
          <p className="text-sm text-slate-500 max-w-xl mx-auto">
            Our medical coordinators assist in arranging fast-track doctor appointments and insurance pre-authorizations.
          </p>
          <div className="pt-2">
            <Link href="/appointments">
              <Button size="md" variant="primary">
                Book a Consultation Today
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
