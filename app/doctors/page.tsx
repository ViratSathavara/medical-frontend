'use client';

import React, { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Navbar } from '../../components/layout/Navbar';
import { Footer } from '../../components/layout/Footer';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { DebouncedSearch } from '../../components/shared/DebouncedSearch';
import { Skeleton } from '../../components/ui/Skeleton';
import { EmptyState } from '../../components/ui/EmptyState';
import api from '../../services/api';
import { Doctor, Department } from '../../types';
import { Star, Calendar, Stethoscope, Award, MapPin } from 'lucide-react';

function DoctorsContent() {
  const searchParams = useSearchParams();
  const initialDept = searchParams.get('department') || '';

  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [selectedDept, setSelectedDept] = useState(initialDept);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  // Fetch departments for filter tabs
  useEffect(() => {
    api.get('/departments')
      .then((res) => setDepartments(res.data.data || []))
      .catch((err) => console.error(err));
  }, []);

  // Fetch doctors with filters
  useEffect(() => {
    setLoading(true);
    let url = `/doctors?limit=30`;
    if (selectedDept) url += `&department=${selectedDept}`;
    if (searchTerm) url += `&search=${encodeURIComponent(searchTerm)}`;

    api.get(url)
      .then((res) => {
        setDoctors(res.data.data || []);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [selectedDept, searchTerm]);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />

      <div className="bg-slate-900 text-white py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-3">
          <span className="text-xs font-bold uppercase tracking-widest text-primary-400">Our Medical Team</span>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight">Find Hospital Specialists</h1>
          <p className="max-w-2xl mx-auto text-sm text-slate-300">
            Consult with certified clinical faculty across 14 specialized medical disciplines.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1 space-y-8">
        {/* Search and Filters */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-soft">
          <div className="w-full md:w-80">
            <DebouncedSearch
              value={searchTerm}
              onSearch={(query) => setSearchTerm(query)}
              placeholder="Search by doctor name or speciality..."
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0">
            <button
              onClick={() => setSelectedDept('')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                selectedDept === ''
                  ? 'bg-primary-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              All Specialities
            </button>
            {departments.slice(0, 6).map((dept) => (
              <button
                key={dept._id}
                onClick={() => setSelectedDept(dept._id)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                  selectedDept === dept._id
                    ? 'bg-primary-600 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {dept.name}
              </button>
            ))}
          </div>
        </div>

        {/* Doctor Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-72 w-full" />
            ))}
          </div>
        ) : doctors.length === 0 ? (
          <EmptyState
            title="No Doctors Found"
            description="Try adjusting your department filter or search keywords."
            onAction={() => {
              setSelectedDept('');
              setSearchTerm('');
            }}
            actionText="Reset Filters"
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {doctors.map((doc) => (
              <Card key={doc._id} hoverEffect className="flex flex-col justify-between">
                <div>
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
                      <h3 className="text-base font-bold text-slate-900 leading-tight">
                        Dr. {doc.firstName} {doc.lastName}
                      </h3>
                      <p className="text-xs font-semibold text-primary-600 mt-1">{doc.specialization}</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">{(doc.department as any)?.name || 'General Clinic'}</p>
                    </div>

                    <div className="space-y-1 text-xs text-slate-500">
                      <div className="flex items-center gap-1.5">
                        <Award className="w-3.5 h-3.5 text-slate-400" />
                        <span>{doc.experienceYears || 10}+ Years Clinical Experience</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        <span>{doc.roomNumber || 'Consultation Suite 101'}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs pt-3 border-t border-slate-100">
                      <span className="flex items-center gap-1 text-amber-500 font-bold">
                        <Star className="w-3.5 h-3.5 fill-current" /> {doc.rating || 4.8}
                      </span>
                      <span className="font-bold text-slate-900">${doc.consultationFee} Consultation</span>
                    </div>
                  </CardContent>
                </div>

                <div className="p-4 pt-0">
                  <Link href={`/appointments?doctorId=${doc._id}`} className="block">
                    <Button size="sm" variant="primary" className="w-full" leftIcon={<Calendar className="w-4 h-4" />}>
                      Book Visit
                    </Button>
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}

export default function DoctorsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50 flex items-center justify-center">Loading...</div>}>
      <DoctorsContent />
    </Suspense>
  );
}
