'use client';

import React, { useState } from 'react';
import { Navbar } from '../../components/layout/Navbar';
import { Footer } from '../../components/layout/Footer';
import { Card, CardContent } from '../../components/ui/Card';
import { ChevronDown, ChevronUp, HelpCircle } from 'lucide-react';

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      q: 'How do I book an appointment with a specialist?',
      a: 'You can book online directly through our website by navigating to the "Appointments" page, selecting your preferred medical department, selecting a doctor, choosing a verified available slot, and confirming your visit.'
    },
    {
      q: 'Can I access my lab reports and prescriptions online?',
      a: 'Yes! Once registered as a patient, log into your Patient Portal. You can view, print, and download PDF copies of all verified prescriptions, diagnostic pathology reports, and billing invoices.'
    },
    {
      q: 'What should I do in an emergency?',
      a: 'In a life-threatening medical emergency, call our 24/7 Trauma Hotline immediately at +1 (555) 911-0000 or proceed directly to our Emergency Department at Gate 1, 742 Evergreen Medical Park.'
    },
    {
      q: 'Which insurance providers are accepted?',
      a: 'MedPulse Hospital is paneled with major health insurance networks including BlueCross BlueShield, Aetna, Cigna, UnitedHealthcare, Medicare, and international travel insurance providers.'
    },
    {
      q: 'What are the visiting hours for inpatients?',
      a: 'General Ward visiting hours are 04:00 PM to 07:00 PM daily. ICU visiting is strictly limited to 11:00 AM - 12:00 PM and 05:00 PM - 06:00 PM (one designated attendant at a time) to prevent nosocomial infections.'
    }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />

      <div className="bg-slate-900 text-white py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-3">
          <span className="text-xs font-bold uppercase tracking-widest text-primary-400">Patient Guide</span>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight">Frequently Asked Questions</h1>
          <p className="max-w-2xl mx-auto text-sm text-slate-300">
            Answers to common questions regarding appointments, admissions, emergency care, and portal access.
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 flex-1 space-y-4">
        {faqs.map((faq, idx) => {
          const isOpen = openIndex === idx;
          return (
            <Card key={idx} className="overflow-hidden">
              <button
                onClick={() => setOpenIndex(isOpen ? null : idx)}
                className="w-full px-6 py-4 text-left flex items-center justify-between gap-4 hover:bg-slate-50 transition-colors"
              >
                <span className="text-sm font-bold text-slate-900 flex items-center gap-3">
                  <HelpCircle className="w-4 h-4 text-primary-600 shrink-0" />
                  {faq.q}
                </span>
                {isOpen ? <ChevronUp className="w-4 h-4 text-slate-400 shrink-0" /> : <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />}
              </button>
              {isOpen && (
                <div className="px-6 pb-5 pt-1 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100 bg-slate-50/50">
                  {faq.a}
                </div>
              )}
            </Card>
          );
        })}
      </div>

      <Footer />
    </div>
  );
}
