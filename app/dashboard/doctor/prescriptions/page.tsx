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
import { FileText, Plus, Search, Download, Calendar, Pill, User, ExternalLink } from 'lucide-react';

export default function DoctorPrescriptionsPage() {
  const [prescriptions, setPrescriptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedRx, setSelectedRx] = useState<any | null>(null);

  useEffect(() => {
    fetchPrescriptions();
  }, []);

  const fetchPrescriptions = async () => {
    setLoading(true);
    try {
      // First get current doctor's profile ID
      const meRes = await api.get('/doctors/me');
      const doctorId = meRes.data.data?._id;
      const res = await api.get(`/prescriptions?doctorId=${doctorId}&limit=50`);
      setPrescriptions(res.data.data || []);
      if (res.data.data && res.data.data.length > 0) {
        setSelectedRx(res.data.data[0]);
      }
    } catch (err) {
      console.error('Failed to load prescriptions:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredPrescriptions = prescriptions.filter((rx) => {
    const q = search.toLowerCase();
    const rxNum = (rx.prescriptionNumber || '').toLowerCase();
    const patName = `${rx.patient?.firstName || ''} ${rx.patient?.lastName || ''}`.toLowerCase();
    const diag = (rx.diagnosis || '').toLowerCase();
    return rxNum.includes(q) || patName.includes(q) || diag.includes(q);
  });

  return (
    <DashboardLayout allowedRoles={['DOCTOR']}>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Prescriptions Management</h1>
            <p className="text-sm text-slate-500 mt-1">
              Review, search, and download verified digital prescriptions issued to patients
            </p>
          </div>
          <Link href="/dashboard/doctor/consultation?tab=prescriptions">
            <Button className="flex items-center gap-2">
              <Plus className="w-4 h-4" /> Issue New Prescription
            </Button>
          </Link>
        </div>

        {/* Filter / Search Bar */}
        <div className="relative max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by Rx number (RX-...), patient, diagnosis..."
            className="pl-9 bg-white"
          />
        </div>

        {loading ? (
          <div className="space-y-4">
            <Skeleton className="h-16 w-full rounded-xl" />
            <Skeleton className="h-64 w-full rounded-xl" />
          </div>
        ) : filteredPrescriptions.length === 0 ? (
          <EmptyState
            icon={FileText}
            title="No Prescriptions Issued"
            description={
              search
                ? `No prescription matches "${search}".`
                : 'You have not authored any patient prescriptions yet.'
            }
            actionLabel="Open Consultation Hub"
            onAction={() => window.location.assign('/dashboard/doctor/consultation')}
          />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
            {/* List */}
            <div className="space-y-3 lg:col-span-1">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-500 uppercase px-1">
                <span>{filteredPrescriptions.length} Records</span>
                <span>Select to view details</span>
              </div>
              <div className="space-y-2 max-h-[700px] overflow-y-auto pr-1">
                {filteredPrescriptions.map((rx) => {
                  const isSelected = selectedRx?._id === rx._id;
                  return (
                    <div
                      key={rx._id}
                      onClick={() => setSelectedRx(rx)}
                      className={`p-4 rounded-xl border cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-teal-50/70 border-teal-500/80 shadow-sm ring-1 ring-teal-500/20'
                          : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-xs'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <span className="font-mono text-xs font-bold text-teal-700 bg-teal-100/60 px-2 py-0.5 rounded">
                            {rx.prescriptionNumber}
                          </span>
                          <h4 className="font-semibold text-slate-900 text-sm mt-2">
                            {rx.patient?.firstName} {rx.patient?.lastName}
                          </h4>
                          <p className="text-xs text-slate-500 font-mono mt-0.5">
                            {rx.patient?.patientId}
                          </p>
                        </div>
                        <Badge variant={rx.isDispensed ? 'success' : 'secondary'} className="text-[10px]">
                          {rx.isDispensed ? 'Dispensed' : 'Active'}
                        </Badge>
                      </div>

                      <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          {new Date(rx.issueDate || rx.createdAt).toLocaleDateString()}
                        </span>
                        <span className="flex items-center gap-1 font-medium text-slate-700">
                          <Pill className="w-3.5 h-3.5 text-teal-600" />
                          {rx.medicines?.length || 0} Meds
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Selected Rx Detail View */}
            {selectedRx && (
              <div className="lg:col-span-2 space-y-6">
                <Card>
                  <CardHeader className="border-b border-slate-100 pb-4">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-sm font-bold text-teal-800 bg-teal-100 px-2.5 py-1 rounded">
                            {selectedRx.prescriptionNumber}
                          </span>
                          <Badge variant={selectedRx.isDispensed ? 'success' : 'secondary'}>
                            {selectedRx.isDispensed ? 'Dispensed by Pharmacy' : 'Pending Dispensation'}
                          </Badge>
                        </div>
                        <p className="text-xs text-slate-500 mt-2">
                          Issued on {new Date(selectedRx.issueDate || selectedRx.createdAt).toLocaleDateString()} at{' '}
                          {new Date(selectedRx.issueDate || selectedRx.createdAt).toLocaleTimeString()}
                        </p>
                      </div>

                      {selectedRx.pdfUrl && (
                        <a
                          href={selectedRx.pdfUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex"
                        >
                          <Button size="sm" className="flex items-center gap-2 bg-teal-700 hover:bg-teal-800">
                            <Download className="w-4 h-4" /> Download Official PDF
                          </Button>
                        </a>
                      )}
                    </div>
                  </CardHeader>

                  <CardContent className="p-6 space-y-6">
                    {/* Patient & Doctor Banner */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl bg-slate-50 border border-slate-100">
                      <div>
                        <p className="text-xs font-semibold uppercase text-slate-500">Patient Details</p>
                        <h4 className="text-sm font-bold text-slate-900 mt-1">
                          {selectedRx.patient?.firstName} {selectedRx.patient?.lastName}
                        </h4>
                        <p className="text-xs text-slate-500 font-mono mt-0.5">
                          ID: {selectedRx.patient?.patientId} | Phone: {selectedRx.patient?.phone || 'N/A'}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs font-semibold uppercase text-slate-500">Attending Doctor</p>
                        <h4 className="text-sm font-bold text-slate-900 mt-1">
                          Dr. {selectedRx.doctor?.firstName} {selectedRx.doctor?.lastName}
                        </h4>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {selectedRx.doctor?.specialization || 'Clinical Specialist'}
                        </p>
                      </div>
                    </div>

                    {/* Clinical Diagnosis */}
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                        Primary Clinical Diagnosis
                      </h4>
                      <div className="p-3.5 bg-teal-50/50 rounded-xl border border-teal-100 text-sm font-medium text-slate-800">
                        {selectedRx.diagnosis}
                      </div>
                    </div>

                    {/* Medicines List */}
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-1.5">
                        <Pill className="w-4 h-4 text-teal-600" /> Prescribed Medications (
                        {selectedRx.medicines?.length || 0})
                      </h4>
                      <div className="space-y-3">
                        {selectedRx.medicines?.map((med: any, idx: number) => (
                          <div
                            key={idx}
                            className="p-4 rounded-xl border border-slate-200 bg-white hover:border-slate-300 transition-colors"
                          >
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                              <div className="flex items-center gap-2">
                                <span className="w-6 h-6 rounded-full bg-teal-100 text-teal-800 text-xs font-bold flex items-center justify-center">
                                  {idx + 1}
                                </span>
                                <h5 className="font-bold text-slate-900 text-sm">{med.medicineName}</h5>
                                <Badge variant="outline" className="text-xs">
                                  {med.dosage}
                                </Badge>
                              </div>
                              <div className="flex items-center gap-3 text-xs text-slate-600">
                                <span className="bg-slate-100 px-2 py-0.5 rounded font-medium">
                                  {med.frequency}
                                </span>
                                <span className="font-semibold text-slate-700">Duration: {med.duration}</span>
                              </div>
                            </div>

                            {med.instructions && (
                              <p className="text-xs text-slate-500 mt-2 pl-8 border-l-2 border-slate-200">
                                <span className="font-semibold text-slate-600">Instructions:</span> {med.instructions}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Additional Notes */}
                    {selectedRx.notes && (
                      <div>
                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                          Clinical Notes & Advice
                        </h4>
                        <p className="text-sm text-slate-700 p-3 bg-slate-50 rounded-lg border border-slate-100 whitespace-pre-line">
                          {selectedRx.notes}
                        </p>
                      </div>
                    )}
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
