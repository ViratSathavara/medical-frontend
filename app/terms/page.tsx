'use client';

import React from 'react';
import { Navbar } from '../../components/layout/Navbar';
import { Footer } from '../../components/layout/Footer';
import { Card } from '../../components/ui/Card';

export default function TermsPage() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />

      <div className="bg-slate-900 text-white py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-3">
          <span className="text-xs font-bold uppercase tracking-widest text-primary-400">Legal Agreement</span>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight">Terms & Conditions of Service</h1>
          <p className="max-w-2xl mx-auto text-sm text-slate-300">
            Terms governing appointments, patient portal usage, and hospital consultations.
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 flex-1">
        <Card className="p-8 space-y-6 text-sm text-slate-600 leading-relaxed">
          <section className="space-y-2">
            <h3 className="text-base font-bold text-slate-900">1. Appointment Scheduling & Cancellations</h3>
            <p>
              Appointments booked online can be rescheduled or cancelled up to 2 hours prior to the scheduled consultation time slot. In the event of unforeseen clinical emergency surgeries, the hospital reserves the right to reschedule non-urgent outpatient appointments with prior notice.
            </p>
          </section>

          <section className="space-y-2">
            <h3 className="text-base font-bold text-slate-900">2. Medical Advice & Tele-Consultations</h3>
            <p>
              Online video consultations are intended for clinical follow-ups and preliminary assessments. Patients experiencing severe chest pain, acute respiratory distress, or trauma must report immediately to the nearest Emergency Department.
            </p>
          </section>

          <section className="space-y-2">
            <h3 className="text-base font-bold text-slate-900">3. Electronic Prescriptions</h3>
            <p>
              Digital prescriptions issued through the MedPulse Hospital Management System carry a unique digital validation signature and are valid across licensed pharmacies in accordance with federal prescription dispensing regulations.
            </p>
          </section>
        </Card>
      </div>

      <Footer />
    </div>
  );
}
