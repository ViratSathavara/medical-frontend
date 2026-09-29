'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { DashboardLayout } from '../../../../components/layout/DashboardLayout';
import { Card, CardHeader, CardContent } from '../../../../components/ui/Card';
import { Button } from '../../../../components/ui/Button';
import { Badge } from '../../../../components/ui/Badge';
import { Input } from '../../../../components/ui/Input';
import { Select } from '../../../../components/ui/Select';
import { Modal } from '../../../../components/ui/Modal';
import { Skeleton } from '../../../../components/ui/Skeleton';
import { EmptyState } from '../../../../components/ui/EmptyState';
import api from '../../../../services/api';
import {
  Users,
  Search,
  Droplet,
  Eye,
  Calendar,
  Phone,
  ShieldCheck,
  FileText,
  BedDouble,
  HeartPulse
} from 'lucide-react';

export default function AdminPatientsPage() {
  const [patients, setPatients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [bloodGroupFilter, setBloodGroupFilter] = useState('All');
  const [selectedPatient, setSelectedPatient] = useState<any | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    setLoading(true);
    try {
      const res = await api.get('/patients?limit=100');
      setPatients(res.data.data || []);
    } catch (err) {
      console.error('Failed to load patients:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredPatients = patients.filter((p) => {
    const q = search.toLowerCase();
    const fullName = `${p.firstName || ''} ${p.lastName || ''}`.toLowerCase();
    const pid = (p.patientId || '').toLowerCase();
    const phone = (p.phone || '').toLowerCase();
    const matchesSearch = fullName.includes(q) || pid.includes(q) || phone.includes(q);
    const matchesBlood = bloodGroupFilter === 'All' || p.bloodGroup === bloodGroupFilter;
    return matchesSearch && matchesBlood;
  });

  const openPatientDetail = (patient: any) => {
    setSelectedPatient(patient);
    setIsDetailModalOpen(true);
  };

  return (
    <DashboardLayout allowedRoles={['ADMIN']}>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Hospital Patient Registry</h1>
            <p className="text-sm text-slate-500 mt-1">
              Central electronic database of all admitted and outpatient health profiles
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold px-3 py-1.5 rounded-full bg-slate-100 text-slate-700">
              {filteredPatients.length} Active Records
            </span>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="relative w-full sm:max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by patient name, ID (PAT-...), phone..."
              className="pl-9 bg-white"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Select
              value={bloodGroupFilter}
              onChange={(e) => setBloodGroupFilter(e.target.value)}
              options={[
                { value: 'All', label: 'All Blood Types' },
                { value: 'A+', label: 'A+' },
                { value: 'A-', label: 'A-' },
                { value: 'B+', label: 'B+' },
                { value: 'B-', label: 'B-' },
                { value: 'AB+', label: 'AB+' },
                { value: 'AB-', label: 'AB-' },
                { value: 'O+', label: 'O+' },
                { value: 'O-', label: 'O-' }
              ]}
              className="w-44 bg-white"
            />
          </div>
        </div>

        {/* Patients Table */}
        <Card>
          <CardContent className="p-0 overflow-x-auto">
            {loading ? (
              <div className="p-6 space-y-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Skeleton key={i} className="h-14 w-full rounded-lg" />
                ))}
              </div>
            ) : filteredPatients.length === 0 ? (
              <EmptyState
                icon={Users}
                title="No Patients Found"
                description={
                  search || bloodGroupFilter !== 'All'
                    ? 'No patient records match your search filters.'
                    : 'No patients registered in the hospital database.'
                }
              />
            ) : (
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 text-xs uppercase font-semibold">
                  <tr>
                    <th className="py-3 px-4">Patient Profile</th>
                    <th className="py-3 px-4">Blood & Gender</th>
                    <th className="py-3 px-4">Contact Phone</th>
                    <th className="py-3 px-4">Emergency Contact</th>
                    <th className="py-3 px-4">Registered Date</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredPatients.map((p) => (
                    <tr key={p._id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-teal-600/10 text-teal-700 font-bold text-sm flex items-center justify-center border border-teal-200">
                            {p.firstName?.[0]}
                            {p.lastName?.[0]}
                          </div>
                          <div>
                            <p className="font-semibold text-slate-900">
                              {p.firstName} {p.lastName}
                            </p>
                            <span className="text-[11px] font-mono text-slate-500">{p.patientId}</span>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          {p.bloodGroup ? (
                            <span className="inline-flex items-center text-xs font-bold px-2 py-0.5 rounded bg-rose-50 text-rose-700 border border-rose-200">
                              <Droplet className="w-3 h-3 mr-1" /> {p.bloodGroup}
                            </span>
                          ) : (
                            <span className="text-xs text-slate-400">N/A</span>
                          )}
                          <span className="text-xs text-slate-600 capitalize">
                            {p.gender || 'Unknown'}
                          </span>
                        </div>
                      </td>

                      <td className="py-3 px-4 text-xs font-medium text-slate-700">
                        {p.phone || 'No phone'}
                      </td>

                      <td className="py-3 px-4 text-xs text-slate-600">
                        {p.emergencyContact?.name
                          ? `${p.emergencyContact.name} (${p.emergencyContact.relation || 'Rel'})`
                          : 'None'}
                      </td>

                      <td className="py-3 px-4 text-xs text-slate-500">
                        {new Date(p.createdAt).toLocaleDateString()}
                      </td>

                      <td className="py-3 px-4 text-right">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openPatientDetail(p)}
                          className="text-xs flex items-center gap-1.5 ml-auto"
                        >
                          <Eye className="w-3.5 h-3.5" /> View Profile
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </CardContent>
        </Card>

        {/* Detailed Patient Modal */}
        <Modal
          isOpen={isDetailModalOpen}
          onClose={() => setIsDetailModalOpen(false)}
          title={`Clinical Profile: ${selectedPatient?.firstName || ''} ${selectedPatient?.lastName || ''}`}
        >
          {selectedPatient && (
            <div className="space-y-6">
              <div className="flex items-center gap-3 p-3 bg-teal-50/70 rounded-xl border border-teal-100">
                <div className="w-12 h-12 rounded-xl bg-teal-600 text-white font-bold text-lg flex items-center justify-center">
                  {selectedPatient.firstName?.[0]}
                  {selectedPatient.lastName?.[0]}
                </div>
                <div>
                  <h4 className="font-bold text-slate-900">
                    {selectedPatient.firstName} {selectedPatient.lastName}
                  </h4>
                  <p className="text-xs text-slate-500 font-mono">
                    ID: {selectedPatient.patientId} | DOB:{' '}
                    {selectedPatient.dateOfBirth
                      ? new Date(selectedPatient.dateOfBirth).toLocaleDateString()
                      : 'N/A'}{' '}
                    | Blood: {selectedPatient.bloodGroup || 'Unknown'}
                  </p>
                </div>
              </div>

              {/* Demographics & Contact */}
              <div>
                <h5 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                  Contact Information
                </h5>
                <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50 p-3 rounded-lg border border-slate-100">
                  <div>
                    <span className="text-slate-400 block">Phone</span>
                    <span className="font-semibold text-slate-800">{selectedPatient.phone || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Email</span>
                    <span className="font-semibold text-slate-800 truncate block">
                      {selectedPatient.user?.email || 'N/A'}
                    </span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-slate-400 block">Residential Address</span>
                    <span className="font-semibold text-slate-800">
                      {selectedPatient.address
                        ? `${selectedPatient.address.street || ''}, ${selectedPatient.address.city || ''}, ${selectedPatient.address.state || ''} ${selectedPatient.address.zipCode || ''}`
                        : 'No physical address recorded'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Medical Alerts */}
              <div>
                <h5 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                  Allergies & Medical Alerts
                </h5>
                <div className="flex flex-wrap gap-2">
                  {selectedPatient.allergies && selectedPatient.allergies.length > 0 ? (
                    selectedPatient.allergies.map((allergy: string, i: number) => (
                      <span
                        key={i}
                        className="px-2.5 py-1 text-xs font-semibold rounded-full bg-rose-50 text-rose-700 border border-rose-200"
                      >
                        {allergy}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-slate-400 italic">No drug allergies recorded</span>
                  )}
                </div>
              </div>

              {/* Chronic Conditions */}
              <div>
                <h5 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                  Chronic Diagnoses
                </h5>
                <div className="flex flex-wrap gap-2">
                  {selectedPatient.chronicConditions && selectedPatient.chronicConditions.length > 0 ? (
                    selectedPatient.chronicConditions.map((cond: string, i: number) => (
                      <span
                        key={i}
                        className="px-2.5 py-1 text-xs font-semibold rounded-full bg-amber-50 text-amber-800 border border-amber-200"
                      >
                        {cond}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-slate-400 italic">No chronic diagnoses listed</span>
                  )}
                </div>
              </div>

              {/* Navigation CTA */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <Link href={`/dashboard/admin/inpatient`}>
                  <Button size="sm" variant="outline" className="flex items-center gap-1.5 text-xs">
                    <BedDouble className="w-3.5 h-3.5 text-teal-600" /> Admit Inpatient
                  </Button>
                </Link>

                <Button size="sm" onClick={() => setIsDetailModalOpen(false)}>
                  Close
                </Button>
              </div>
            </div>
          )}
        </Modal>
      </div>
    </DashboardLayout>
  );
}
