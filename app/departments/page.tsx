'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Navbar } from '../../components/layout/Navbar';
import { Footer } from '../../components/layout/Footer';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Skeleton } from '../../components/ui/Skeleton';
import api from '../../services/api';
import { Department } from '../../types';
import { HeartPulse, ArrowRight, Stethoscope, Users } from 'lucide-react';

export default function DepartmentsPage() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/departments')
      .then((res) => {
        setDepartments(res.data.data || []);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />

      <div className="bg-slate-900 text-white py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-3">
          <span className="text-xs font-bold uppercase tracking-widest text-primary-400">Clinical Specialties</span>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight">Hospital Medical Departments</h1>
          <p className="max-w-2xl mx-auto text-sm text-slate-300">
            From emergency trauma to complex open-heart and neurosurgical procedures, explore our certified clinical units.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 flex-1">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-48 w-full" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {departments.map((dept) => (
              <Card key={dept._id} hoverEffect className="group flex flex-col justify-between">
                <CardContent className="space-y-4">
                  <div className="w-12 h-12 rounded-2xl bg-primary-50 text-primary-600 flex items-center justify-center group-hover:bg-primary-600 group-hover:text-white transition-colors duration-200">
                    <HeartPulse className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-[11px] font-bold text-primary-600 uppercase tracking-wider">{dept.code}</span>
                    <h3 className="text-lg font-bold text-slate-900 group-hover:text-primary-600 transition-colors mt-0.5">
                      {dept.name}
                    </h3>
                    <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                      {dept.description || 'Specialized diagnostic and surgical management provided by board-certified clinical faculty.'}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="text-slate-500 font-medium flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-slate-400" />
                      {dept.doctorCount || 2} Specialists
                    </span>
                    <Link
                      href={`/doctors?department=${dept._id}`}
                      className="font-semibold text-primary-600 flex items-center gap-1 group-hover:translate-x-1 transition-transform"
                    >
                      View Doctors &rarr;
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
