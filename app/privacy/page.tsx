'use client';

import React from 'react';
import { Navbar } from '../../components/layout/Navbar';
import { Footer } from '../../components/layout/Footer';
import { Card, CardContent } from '../../components/ui/Card';
import { ShieldCheck, Lock } from 'lucide-react';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />

      <div className="bg-slate-900 text-white py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-3">
          <span className="text-xs font-bold uppercase tracking-widest text-primary-400">Security & HIPAA Compliance</span>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight">Patient Privacy & Data Protection</h1>
          <p className="max-w-2xl mx-auto text-sm text-slate-300">
            How MedPulse Hospital safeguards confidential medical records and personal health data.
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 flex-1">
        <Card className="p-8 space-y-6 text-sm text-slate-600 leading-relaxed">
          <div className="flex items-center gap-3 text-emerald-600 font-bold border-b border-slate-100 pb-4">
            <Lock className="w-5 h-5" />
            <span>HIPAA and Medical Data Privacy Policy</span>
          </div>

          <section className="space-y-2">
            <h3 className="text-base font-bold text-slate-900">1. Medical Information Confidentiality</h3>
            <p>
              MedPulse Hospital treats all electronic medical records (EMR), prescriptions, laboratory investigations, and clinical consultation notes as strictly confidential Protected Health Information (PHI). We adhere to stringent HIPAA (Health Insurance Portability and Accountability Act) compliance regulations.
            </p>
          </section>

          <section className="space-y-2">
            <h3 className="text-base font-bold text-slate-900">2. Role-Based Access Control (RBAC)</h3>
            <p>
              Our database architecture strictly isolates patient health records. A patient may only view their own records, prescriptions, and invoices. Doctors are granted access exclusively to patient profiles relevant to active medical care. System administrators maintain auditable access trails with IP address logging.
            </p>
          </section>

          <section className="space-y-2">
            <h3 className="text-base font-bold text-slate-900">3. Encryption at Rest & In Transit</h3>
            <p>
              All digital communications and API transfers between your browser and our medical servers utilize TLS 1.3 encryption. Passwords and authentication credentials are cryptographically secured using salted bcrypt hashing.
            </p>
          </section>
        </Card>
      </div>

      <Footer />
    </div>
  );
}
