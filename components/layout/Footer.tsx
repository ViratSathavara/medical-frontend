import React from 'react';
import Link from 'next/link';
import { HeartPulse, Phone, Mail, MapPin, ShieldCheck, Clock } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-900 text-slate-300 mt-auto border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Col 1: About */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-primary-600 flex items-center justify-center text-white shadow-lg shadow-primary-500/30">
                <HeartPulse className="w-6 h-6" />
              </div>
              <span className="text-xl font-bold text-white tracking-tight">
                Med<span className="text-primary-500">Pulse</span>
              </span>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed">
              Excellence in healthcare, compassion in healing. MedPulse delivers multidisciplinary clinical care supported by modern medical robotics and diagnostics.
            </p>
            <div className="flex items-center gap-2 text-xs text-emerald-400 font-semibold">
              <ShieldCheck className="w-4 h-4" />
              JCI & CAP Accredited Healthcare Facility
            </div>
          </div>

          {/* Col 2: Quick Links */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
              Explore Hospital
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/about" className="hover:text-white transition-colors">
                  About Our Hospital
                </Link>
              </li>
              <li>
                <Link href="/departments" className="hover:text-white transition-colors">
                  Medical Departments
                </Link>
              </li>
              <li>
                <Link href="/doctors" className="hover:text-white transition-colors">
                  Find a Doctor
                </Link>
              </li>
              <li>
                <Link href="/appointments" className="hover:text-white transition-colors">
                  Book an Appointment
                </Link>
              </li>
              <li>
                <Link href="/facilities" className="hover:text-white transition-colors">
                  Facilities & Wards
                </Link>
              </li>
              <li>
                <Link href="/emergency" className="hover:text-rose-400 transition-colors font-medium">
                  24/7 Emergency & Triage
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Medical Specialities */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
              Centers of Excellence
            </h4>
            <ul className="space-y-2.5 text-sm text-slate-400">
              <li>Cardiovascular Sciences</li>
              <li>Neurology & Neurosurgery</li>
              <li>Orthopedics & Joint Reconstruction</li>
              <li>Pediatrics & Neonatal ICU</li>
              <li>Medical & Radiation Oncology</li>
              <li>Gastroenterology & Hepatology</li>
            </ul>
          </div>

          {/* Col 4: Contact & Emergency */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
              Hospital Contact
            </h4>
            <div className="flex items-start gap-3 text-sm text-slate-400">
              <MapPin className="w-4 h-4 text-primary-400 mt-1 shrink-0" />
              <span>742 Evergreen Medical Park, New York, NY 10001, USA</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-slate-400">
              <Phone className="w-4 h-4 text-primary-400 shrink-0" />
              <span>+1 (555) 234-5678</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-slate-400">
              <Mail className="w-4 h-4 text-primary-400 shrink-0" />
              <span>contact@medpulsehospital.com</span>
            </div>
            <div className="flex items-start gap-3 text-sm text-slate-400">
              <Clock className="w-4 h-4 text-primary-400 mt-1 shrink-0" />
              <span>Emergency: 24/7 Open<br />OPD: 8:00 AM - 8:00 PM</span>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>&copy; {new Date().getFullYear()} MedPulse Hospital Management System. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <Link href="/privacy" className="hover:text-slate-400">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-slate-400">Terms & Conditions</Link>
            <Link href="/faq" className="hover:text-slate-400">Patient FAQ</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
