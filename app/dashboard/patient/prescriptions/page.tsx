'use client';

import React, { useEffect, useState } from 'react';
import { DashboardLayout } from '../../../../components/layout/DashboardLayout';
import { Card, CardHeader, CardContent } from '../../../../components/ui/Card';
import { Button } from '../../../../components/ui/Button';
import { Badge } from '../../../../components/ui/Badge';
import { EmptyState } from '../../../../components/ui/EmptyState';
import { Skeleton } from '../../../../components/ui/Skeleton';
import api from '../../../../services/api';
import { Prescription } from '../../../../types';
import { Pill, Download, Calendar, Stethoscope, CheckCircle2 } from 'lucide-react';

export default function PatientPrescriptions() {
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/prescriptions?limit=50')
      .then((res) => setPrescriptions(res.data.data || []))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <DashboardLayout allowedRoles={['PATIENT']}>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">My Prescriptions</h1>
          <p className="text-xs text-slate-500 mt-1">
            Doctor prescribed medication regimens, dosage instructions, and downloadable verified PDFs
          </p>
        </div>

        {loading ? (
          <div className="space-y-4">
            <Skeleton className="h-44 w-full" />
            <Skeleton className="h-44 w-full" />
          </div>
        ) : prescriptions.length === 0 ? (
          <EmptyState
            title="No Prescriptions Issued"
            description="Your doctor will issue digital prescriptions after your medical evaluation."
          />
        ) : (
          <div className="space-y-6">
            {prescriptions.map((rx) => (
              <Card key={rx._id} className="p-6 space-y-5">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                      <Pill className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-bold text-slate-900">{rx.prescriptionNumber}</h3>
                        {rx.dispensed ? (
                          <Badge variant="success" size="sm">Dispensed by Pharmacy</Badge>
                        ) : (
                          <Badge variant="warning" size="sm">Active Medication</Badge>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Prescribed by: Dr. {rx.doctor?.firstName} {rx.doctor?.lastName} ({rx.doctor?.specialization})
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-xs text-slate-500 flex items-center gap-1 font-medium">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      {new Date(rx.issueDate).toLocaleDateString()}
                    </span>
                    {rx.pdfUrl && (
                      <a href={rx.pdfUrl} target="_blank" rel="noreferrer" download>
                        <Button size="sm" variant="primary" leftIcon={<Download className="w-4 h-4" />}>
                          Download PDF
                        </Button>
                      </a>
                    )}
                  </div>
                </div>

                <div className="text-xs">
                  <span className="text-slate-400 font-semibold uppercase text-[10px]">Diagnosis</span>
                  <p className="text-sm font-semibold text-slate-800 mt-0.5">{rx.diagnosis}</p>
                </div>

                {/* Medications Table */}
                <div className="overflow-x-auto rounded-xl border border-slate-200/80">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200">
                      <tr>
                        <th className="py-2.5 px-4">Medicine Name</th>
                        <th className="py-2.5 px-4">Dosage</th>
                        <th className="py-2.5 px-4">Frequency</th>
                        <th className="py-2.5 px-4">Duration</th>
                        <th className="py-2.5 px-4">Instructions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700">
                      {rx.medicines?.map((med, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/50">
                          <td className="py-2.5 px-4 font-bold text-slate-900">{med.name}</td>
                          <td className="py-2.5 px-4">{med.dosage}</td>
                          <td className="py-2.5 px-4">{med.frequency}</td>
                          <td className="py-2.5 px-4">{med.duration}</td>
                          <td className="py-2.5 px-4 text-slate-500">{med.instructions || 'After meals with water'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {rx.notes && (
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-600">
                    <span className="font-bold text-slate-700 block mb-0.5">Special Advice / Notes:</span>
                    {rx.notes}
                  </div>
                )}
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
