'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';
import { Button } from '../components/ui/Button';
import { Card, CardContent } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import api from '../services/api';
import { Department, Doctor } from '../types';
import {
  HeartPulse,
  Calendar,
  ShieldCheck,
  Award,
  Stethoscope,
  PhoneCall,
  Clock,
  ArrowRight,
  CheckCircle2,
  Activity,
  Ambulance,
  Pill,
  Microscope,
  Building2,
  Star
} from 'lucide-react';

export default function HomePage() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/departments'),
      api.get('/doctors?limit=4')
    ])
      .then(([deptRes, docRes]) => {
        setDepartments(deptRes.data.data?.slice(0, 8) || []);
        setDoctors(docRes.data.data || []);
      })
      .catch((err) => {
        console.error('Error fetching home data:', err);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-primary-50/60 via-white to-slate-50 pt-16 pb-24 lg:pt-24 lg:pb-32 border-b border-slate-200/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary-100/80 border border-primary-200 text-primary-800 text-xs font-semibold uppercase tracking-wider">
                <span className="w-2 h-2 rounded-full bg-primary-600 animate-pulse"></span>
                Accredited World-Class Tertiary Medical Care
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.12]">
                Your Health, Our <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-sky-500">Highest Calling</span>
              </h1>

              <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-normal">
                MedPulse combines international clinical protocols, multi-organ surgical robotics, and compassionate bedside care to deliver superior patient outcomes.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
                <Link href="/appointments" className="w-full sm:w-auto">
                  <Button size="lg" className="w-full sm:w-auto" rightIcon={<ArrowRight className="w-4 h-4" />}>
                    Schedule Doctor Visit
                  </Button>
                </Link>
                <Link href="/emergency" className="w-full sm:w-auto">
                  <Button size="lg" variant="danger" className="w-full sm:w-auto" leftIcon={<Ambulance className="w-4 h-4" />}>
                    Emergency Hotline
                  </Button>
                </Link>
                <Link href="/doctors" className="w-full sm:w-auto">
                  <Button size="lg" variant="outline" className="w-full sm:w-auto">
                    Browse Specialists
                  </Button>
                </Link>
              </div>

              {/* Key Trust Badges */}
              <div className="pt-6 grid grid-cols-3 gap-4 border-t border-slate-200/80 max-w-lg mx-auto lg:mx-0 text-left">
                <div>
                  <p className="text-2xl font-bold text-slate-900">99.4%</p>
                  <p className="text-xs text-slate-500">Clinical Success Rate</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-900">500+</p>
                  <p className="text-xs text-slate-500">Hospital Inpatient Beds</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-900">24/7</p>
                  <p className="text-xs text-slate-500">Level 1 Emergency ICU</p>
                </div>
              </div>
            </div>

            {/* Right Card Mockup */}
            <div className="lg:col-span-5 relative">
              <div className="relative mx-auto max-w-md bg-white rounded-3xl p-6 shadow-2xl border border-slate-200/80 space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary-100 text-primary-700 flex items-center justify-center font-bold">
                      MP
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">MedPulse Central Desk</h4>
                      <p className="text-xs text-emerald-600 font-medium flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Live Booking Available
                      </p>
                    </div>
                  </div>
                  <Badge variant="primary" size="sm">JCI Certified</Badge>
                </div>

                <div className="space-y-3">
                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-primary-600 text-white flex items-center justify-center shrink-0">
                      <Stethoscope className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-slate-900">14 Speciality Departments</p>
                      <p className="text-[11px] text-slate-500">Cardiology, Neurology, Pediatrics, Orthopedics</p>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
                      <Microscope className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-slate-900">Automated Pathology & 3T MRI</p>
                      <p className="text-[11px] text-slate-500">Instant Digital Diagnostic Report Access</p>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0">
                      <Pill className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-slate-900">In-House Digital Pharmacy</p>
                      <p className="text-[11px] text-slate-500">Verified Prescriptions & Dispensing</p>
                    </div>
                  </div>
                </div>

                <div className="pt-2">
                  <Link href="/appointments" className="block w-full">
                    <Button variant="primary" size="md" className="w-full">
                      Book Online Consultation
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Emergency Callout Banner */}
      <section className="bg-rose-600 text-white py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 text-center sm:text-left">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
              <PhoneCall className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-sm font-bold uppercase tracking-wider text-rose-100">Immediate Medical Emergency?</p>
              <p className="text-base font-extrabold text-white">Call 24/7 Trauma Hotline: +1 (555) 911-0000</p>
            </div>
          </div>
          <Link href="/emergency">
            <Button variant="secondary" size="sm" className="bg-white text-rose-600 hover:bg-rose-50 border-0 font-bold">
              Emergency Procedures &rarr;
            </Button>
          </Link>
        </div>
      </section>

      {/* Specialty Departments */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
            <h2 className="text-xs font-bold text-primary-600 uppercase tracking-widest">Medical Excellence</h2>
            <h3 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Specialized Clinical Departments
            </h3>
            <p className="text-sm text-slate-500">
              Our multidisciplinary healthcare institutes provide advanced diagnostic precision and patient-centered therapeutic care.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {departments.map((dept) => (
              <Card key={dept._id} hoverEffect className="group">
                <CardContent className="space-y-4">
                  <div className="w-12 h-12 rounded-2xl bg-primary-50 text-primary-600 flex items-center justify-center group-hover:bg-primary-600 group-hover:text-white transition-colors duration-200">
                    <HeartPulse className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-slate-900 group-hover:text-primary-600 transition-colors">
                      {dept.name}
                    </h4>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                      {dept.description || 'Specialized diagnostic and surgical management.'}
                    </p>
                  </div>
                  <div className="pt-2 flex items-center justify-between text-xs">
                    <span className="text-slate-400 font-medium">{dept.doctorCount || 2} Specialists</span>
                    <Link href={`/doctors?department=${dept._id}`} className="font-semibold text-primary-600 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                      View Team &rarr;
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link href="/departments">
              <Button variant="outline" size="md">
                View All Hospital Departments &rarr;
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Doctors */}
      <section className="py-20 bg-slate-50 border-t border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
            <h2 className="text-xs font-bold text-primary-600 uppercase tracking-widest">Renowned Medical Faculty</h2>
            <h3 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Consult With Leading Specialists
            </h3>
            <p className="text-sm text-slate-500">
              Board-certified clinicians and surgeons dedicated to empathetic patient care and surgical precision.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {doctors.map((doc) => (
              <Card key={doc._id} hoverEffect>
                <div className="h-44 bg-gradient-to-tr from-slate-100 to-sky-100 flex items-center justify-center relative">
                  <div className="w-20 h-20 rounded-full bg-white text-primary-700 font-extrabold text-2xl flex items-center justify-center border-4 border-white shadow-md">
                    {doc.firstName[0]}{doc.lastName[0]}
                  </div>
                  <div className="absolute top-3 right-3">
                    <Badge variant="success" size="sm">Available</Badge>
                  </div>
                </div>
                <CardContent className="space-y-3">
                  <div>
                    <h4 className="text-base font-bold text-slate-900">
                      Dr. {doc.firstName} {doc.lastName}
                    </h4>
                    <p className="text-xs font-medium text-primary-600 mt-0.5">{doc.specialization}</p>
                    <p className="text-[11px] text-slate-400">{(doc.department as any)?.name || 'General Clinic'}</p>
                  </div>

                  <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-100">
                    <span className="flex items-center gap-1 text-amber-500 font-bold">
                      <Star className="w-3.5 h-3.5 fill-current" /> {doc.rating || 4.8}
                    </span>
                    <span className="font-bold text-slate-800">${doc.consultationFee} Fee</span>
                  </div>

                  <Link href={`/appointments?doctorId=${doc._id}`} className="block pt-2">
                    <Button size="sm" variant="outline" className="w-full">
                      Book Appointment
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link href="/doctors">
              <Button size="md" variant="primary">
                Explore All Doctors &rarr;
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Facilities & Accreditations Banner */}
      <section className="py-16 bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center md:text-left">
            <div className="space-y-2">
              <ShieldCheck className="w-8 h-8 text-primary-400 mx-auto md:mx-0" />
              <h4 className="text-base font-bold">JCI & NABL Accredited</h4>
              <p className="text-xs text-slate-400">Compliant with highest international infection control & clinical safety standards.</p>
            </div>
            <div className="space-y-2">
              <Clock className="w-8 h-8 text-emerald-400 mx-auto md:mx-0" />
              <h4 className="text-base font-bold">Zero Wait Emergencies</h4>
              <p className="text-xs text-slate-400">Immediate triage with dedicated resuscitation beds and trauma surgeon on-duty.</p>
            </div>
            <div className="space-y-2">
              <Pill className="w-8 h-8 text-sky-400 mx-auto md:mx-0" />
              <h4 className="text-base font-bold">Digital E-Prescriptions</h4>
              <p className="text-xs text-slate-400">Seamless integration between doctor consultations, pharmacy, and patient app.</p>
            </div>
            <div className="space-y-2">
              <Building2 className="w-8 h-8 text-amber-400 mx-auto md:mx-0" />
              <h4 className="text-base font-bold">500 Inpatient Beds</h4>
              <p className="text-xs text-slate-400">Deluxe private suites, semi-private rooms, and modular coronary & neuro ICUs.</p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
