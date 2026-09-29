'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { DashboardLayout } from '../../../../components/layout/DashboardLayout';
import { Card, CardHeader, CardContent } from '../../../../components/ui/Card';
import { Button } from '../../../../components/ui/Button';
import { Badge } from '../../../../components/ui/Badge';
import { Input } from '../../../../components/ui/Input';
import { Skeleton } from '../../../../components/ui/Skeleton';
import { EmptyState } from '../../../../components/ui/EmptyState';
import api from '../../../../services/api';
import { Users, Search, Stethoscope, FileText, Phone, Droplet, Calendar, ShieldCheck, ChevronRight } from 'lucide-react';

export default function DoctorPatientsPage() {
  const [patients, setPatients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedPatient, setSelectedPatient] = useState<any | null>(null);

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    setLoading(true);
    try {
      const res = await api.get('/doctors/patients');
      setPatients(res.data.data || []);
      if (res.data.data && res.data.data.length > 0) {
        setSelectedPatient(res.data.data[0]);
      }
    } catch (err) {
      console.error('Failed to load doctor patients:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredPatients = patients.filter((p) => {
    const q = search.toLowerCase();
    const fullName = `${p.firstName || ''} ${p.lastName || ''}`.toLowerCase();
    const pid = (p.patientId || '').toLowerCase();
    const phone = (p.phone || '').toLowerCase();
    return fullName.includes(q) || pid.includes(q) || phone.includes(q);
  });

  return (
    <DashboardLayout allowedRoles={['DOCTOR']}>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Patient Directory</h1>
            <p className="text-sm text-slate-500 mt-1">
              Active clinical records and consultation histories for your patients
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/dashboard/doctor/consultation">
              <Button className="flex items-center gap-2">
                <Stethoscope className="w-4 h-4" /> Start Consultation Hub
              </Button>
            </Link>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by patient name, ID (e.g. PAT-), or phone..."
            className="pl-9 bg-white"
          />
        </div>

        {loading ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Skeleton className="h-96 rounded-xl" />
            <Skeleton className="h-96 rounded-xl lg:col-span-2" />
          </div>
        ) : filteredPatients.length === 0 ? (
          <EmptyState
            icon={Users}
            title="No Patients Found"
            description={
              search
                ? `No patients match "${search}". Try checking for typos.`
                : 'No patients are currently assigned or booked under your care.'
            }
          />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
            {/* Patients List */}
            <div className="space-y-3 lg:col-span-1">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-500 uppercase px-1">
                <span>{filteredPatients.length} Patients Recorded</span>
                <span>Select to inspect</span>
              </div>
              <div className="space-y-2 max-h-[700px] overflow-y-auto pr-1">
                {filteredPatients.map((p) => {
                  const isSelected = selectedPatient?._id === p._id;
                  return (
                    <div
                      key={p._id}
                      onClick={() => setSelectedPatient(p)}
                      className={`p-4 rounded-xl border cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-teal-50/70 border-teal-500/80 shadow-sm ring-1 ring-teal-500/20'
                          : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-xs'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-teal-600/10 text-teal-700 font-bold flex items-center justify-center text-sm border border-teal-200">
                            {p.firstName?.[0]}
                            {p.lastName?.[0]}
                          </div>
                          <div>
                            <h4 className="font-semibold text-slate-900 text-sm">
                              {p.firstName} {p.lastName}
                            </h4>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="text-xs font-mono text-slate-500">{p.patientId}</span>
                              {p.bloodGroup && (
                                <span className="inline-flex items-center text-[10px] font-bold px-1.5 py-0.5 rounded bg-rose-50 text-rose-700 border border-rose-200">
                                  {p.bloodGroup}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <ChevronRight
                          className={`w-4 h-4 transition-transform ${
                            isSelected ? 'text-teal-600 translate-x-1' : 'text-slate-300'
                          }`}
                        />
                      </div>

                      <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          {p.dateOfBirth ? new Date(p.dateOfBirth).toLocaleDateString() : 'DOB N/A'}
                        </span>
                        <span className="capitalize">{p.gender || 'Not specified'}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Patient Clinical Profile View */}
            {selectedPatient && (
              <div className="lg:col-span-2 space-y-6">
                <Card>
                  <CardHeader className="border-b border-slate-100 pb-4">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="w-14 h-14 rounded-2xl bg-teal-600 text-white font-bold text-xl flex items-center justify-center shadow-sm">
                          {selectedPatient.firstName?.[0]}
                          {selectedPatient.lastName?.[0]}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h2 className="text-xl font-bold text-slate-900">
                              {selectedPatient.firstName} {selectedPatient.lastName}
                            </h2>
                            <Badge variant="outline" className="font-mono text-xs">
                              {selectedPatient.patientId}
                            </Badge>
                          </div>
                          <p className="text-xs text-slate-500 mt-1 flex items-center gap-3">
                            <span>{selectedPatient.gender ? `${selectedPatient.gender.toUpperCase()}` : 'GENDER N/A'}</span>
                            <span>•</span>
                            <span>
                              DOB: {selectedPatient.dateOfBirth ? new Date(selectedPatient.dateOfBirth).toLocaleDateString() : 'N/A'}
                            </span>
                            <span>•</span>
                            <span className="text-rose-600 font-semibold flex items-center gap-1">
                              <Droplet className="w-3 h-3" /> Blood Group: {selectedPatient.bloodGroup || 'Unknown'}
                            </span>
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Link href={`/dashboard/doctor/consultation?patientId=${selectedPatient._id}`}>
                          <Button size="sm" className="flex items-center gap-2">
                            <Stethoscope className="w-4 h-4" /> Consult Patient
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="p-6 space-y-6">
                    {/* Contact & Demographics */}
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
                        Contact & Emergency Information
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                          <p className="text-xs text-slate-500">Phone Number</p>
                          <p className="text-sm font-semibold text-slate-800 mt-0.5">
                            {selectedPatient.phone || 'None recorded'}
                          </p>
                        </div>
                        <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                          <p className="text-xs text-slate-500">Email Address</p>
                          <p className="text-sm font-semibold text-slate-800 mt-0.5 truncate">
                            {selectedPatient.user?.email || 'None recorded'}
                          </p>
                        </div>
                        <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                          <p className="text-xs text-slate-500">Emergency Contact</p>
                          <p className="text-sm font-semibold text-slate-800 mt-0.5">
                            {selectedPatient.emergencyContact?.name
                              ? `${selectedPatient.emergencyContact.name} (${selectedPatient.emergencyContact.relation || 'Rel'}) - ${selectedPatient.emergencyContact.phone || ''}`
                              : 'None listed'}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Allergies & Chronic Conditions */}
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
                        Known Allergies & Clinical Alerts
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedPatient.allergies && selectedPatient.allergies.length > 0 ? (
                          selectedPatient.allergies.map((allergy: string, i: number) => (
                            <span
                              key={i}
                              className="px-3 py-1 text-xs font-medium rounded-full bg-rose-50 text-rose-700 border border-rose-200 flex items-center gap-1.5"
                            >
                              <ShieldCheck className="w-3.5 h-3.5" />
                              {allergy}
                            </span>
                          ))
                        ) : (
                          <span className="text-sm text-slate-500 italic">No known drug or environmental allergies on file</span>
                        )}
                      </div>
                    </div>

                    {/* Past Medical Conditions */}
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
                        Chronic Conditions & Medical History
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedPatient.chronicConditions && selectedPatient.chronicConditions.length > 0 ? (
                          selectedPatient.chronicConditions.map((cond: string, i: number) => (
                            <span
                              key={i}
                              className="px-3 py-1 text-xs font-medium rounded-full bg-amber-50 text-amber-800 border border-amber-200"
                            >
                              {cond}
                            </span>
                          ))
                        ) : (
                          <span className="text-sm text-slate-500 italic">No prior chronic conditions recorded</span>
                        )}
                      </div>
                    </div>

                    {/* Quick Action Navigation Cards */}
                    <div className="pt-4 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between">
                        <div>
                          <h5 className="text-sm font-semibold text-slate-900">Issue Medication</h5>
                          <p className="text-xs text-slate-500 mt-0.5">Generate prescription with PDF</p>
                        </div>
                        <Link href={`/dashboard/doctor/consultation?patientId=${selectedPatient._id}&tab=prescriptions`}>
                          <Button size="sm" variant="outline">Create Rx</Button>
                        </Link>
                      </div>

                      <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between">
                        <div>
                          <h5 className="text-sm font-semibold text-slate-900">Request Diagnostic Lab</h5>
                          <p className="text-xs text-slate-500 mt-0.5">Order tests & monitor flags</p>
                        </div>
                        <Link href={`/dashboard/doctor/consultation?patientId=${selectedPatient._id}&tab=labs`}>
                          <Button size="sm" variant="outline">Order Test</Button>
                        </Link>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
