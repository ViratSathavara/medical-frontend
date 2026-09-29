'use client';

import React, { useEffect, useState } from 'react';
import { DashboardLayout } from '../../../../components/layout/DashboardLayout';
import { Card, CardHeader, CardContent } from '../../../../components/ui/Card';
import { Badge } from '../../../../components/ui/Badge';
import { EmptyState } from '../../../../components/ui/EmptyState';
import { Skeleton } from '../../../../components/ui/Skeleton';
import api from '../../../../services/api';
import { MedicalRecord } from '../../../../types';
import { FileText, Calendar, HeartPulse, User, Activity, AlertCircle } from 'lucide-react';

export default function PatientMedicalRecords() {
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/medical-records?limit=50')
      .then((res) => setRecords(res.data.data || []))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <DashboardLayout allowedRoles={['PATIENT']}>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Electronic Health Records (EMR)</h1>
          <p className="text-xs text-slate-500 mt-1">Verified clinical diagnoses, treatment regimens, and doctor consultation notes</p>
        </div>

        {loading ? (
          <div className="space-y-4">
            <Skeleton className="h-40 w-full" />
            <Skeleton className="h-40 w-full" />
          </div>
        ) : records.length === 0 ? (
          <EmptyState
            title="No Medical Records"
            description="Your consultation and diagnosis records will appear here following doctor evaluations."
          />
        ) : (
          <div className="space-y-6">
            {records.map((rec) => (
              <Card key={rec._id} className="p-6 space-y-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center font-bold">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-slate-900">{rec.diagnosis}</h3>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Consultant: Dr. {rec.doctor?.firstName} {rec.doctor?.lastName} ({rec.doctor?.specialization})
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-xs">
                    <span className="font-semibold text-slate-500 flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" /> {new Date(rec.visitDate).toLocaleDateString()}
                    </span>
                    <Badge variant="primary" size="sm">{rec.recordNumber}</Badge>
                  </div>
                </div>

                {/* Vitals Grid if recorded */}
                {rec.vitalSigns && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-100">
                    <div className="text-center">
                      <span className="text-[10px] text-slate-400 font-semibold uppercase">Blood Pressure</span>
                      <span className="text-sm font-bold text-slate-800 block mt-0.5">
                        {rec.vitalSigns.bpSystolic}/{rec.vitalSigns.bpDiastolic} mmHg
                      </span>
                    </div>
                    <div className="text-center">
                      <span className="text-[10px] text-slate-400 font-semibold uppercase">Heart Rate</span>
                      <span className="text-sm font-bold text-slate-800 block mt-0.5">{rec.vitalSigns.heartRate} bpm</span>
                    </div>
                    <div className="text-center">
                      <span className="text-[10px] text-slate-400 font-semibold uppercase">Temperature</span>
                      <span className="text-sm font-bold text-slate-800 block mt-0.5">{rec.vitalSigns.temperature} °F</span>
                    </div>
                    <div className="text-center">
                      <span className="text-[10px] text-slate-400 font-semibold uppercase">Oxygen SpO2</span>
                      <span className="text-sm font-bold text-slate-800 block mt-0.5">{rec.vitalSigns.oxygenSaturation}%</span>
                    </div>
                    <div className="text-center">
                      <span className="text-[10px] text-slate-400 font-semibold uppercase">Weight</span>
                      <span className="text-sm font-bold text-slate-800 block mt-0.5">{rec.vitalSigns.weight} kg</span>
                    </div>
                    <div className="text-center">
                      <span className="text-[10px] text-slate-400 font-semibold uppercase">BMI</span>
                      <span className="text-sm font-bold text-slate-800 block mt-0.5">{rec.vitalSigns.bmi}</span>
                    </div>
                  </div>
                )}

                {/* Symptoms & Treatment */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-slate-700">
                  <div className="space-y-1.5">
                    <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px]">Reported Symptoms</h4>
                    <p className="p-3 rounded-xl bg-slate-50 border border-slate-100 leading-relaxed">
                      {rec.symptoms && rec.symptoms.length > 0 ? rec.symptoms.join(', ') : 'No acute symptoms noted.'}
                    </p>
                  </div>

                  <div className="space-y-1.5">
                    <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px]">Prescribed Clinical Plan</h4>
                    <p className="p-3 rounded-xl bg-slate-50 border border-slate-100 leading-relaxed">
                      {rec.treatment}
                    </p>
                  </div>
                </div>

                {rec.clinicalNotes && (
                  <div className="space-y-1.5 text-xs text-slate-700">
                    <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px]">Doctor Clinical Notes</h4>
                    <p className="p-3 rounded-xl bg-slate-50 border border-slate-100 leading-relaxed text-slate-600">
                      {rec.clinicalNotes}
                    </p>
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
