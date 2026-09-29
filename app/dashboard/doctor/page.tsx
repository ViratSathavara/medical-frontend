'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { DashboardLayout } from '../../../components/layout/DashboardLayout';
import { Card, CardHeader, CardContent } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { StatCard } from '../../../components/shared/StatCard';
import { Skeleton } from '../../../components/ui/Skeleton';
import api from '../../../services/api';
import {
  Calendar,
  Users,
  CheckCircle2,
  Clock,
  ArrowRight,
  FileText,
  Stethoscope,
  Activity
} from 'lucide-react';

export default function DoctorDashboard() {
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/doctors/dashboard-summary')
      .then((res) => setSummary(res.data.data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <DashboardLayout allowedRoles={['DOCTOR']}>
      <div className="space-y-8">
        {/* Welcome Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              Dr. {summary?.doctor?.firstName} {summary?.doctor?.lastName}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Specialization: <span className="font-semibold text-primary-600">{summary?.doctor?.specialization}</span> &bull; Room: <span className="font-bold text-slate-700">{summary?.doctor?.roomNumber || 'Suite 302'}</span>
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/dashboard/doctor/consultation">
              <Button size="md" variant="primary" leftIcon={<FileText className="w-4 h-4" />}>
                New Clinical Consultation
              </Button>
            </Link>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <StatCard
            title="Today's Schedule"
            value={summary?.metrics?.todayCount || 0}
            icon={Calendar}
            color="primary"
          />
          <StatCard
            title="Pending Requests"
            value={summary?.metrics?.pendingCount || 0}
            icon={Clock}
            color="amber"
          />
          <StatCard
            title="Completed Consultations"
            value={summary?.metrics?.completedCount || 0}
            icon={CheckCircle2}
            color="emerald"
          />
          <StatCard
            title="Total Unique Patients"
            value={summary?.metrics?.totalPatientsCount || 0}
            icon={Users}
            color="indigo"
          />
        </div>

        {/* Today's Appointments Schedule */}
        <Card>
          <CardHeader
            title="Today's Outpatient Appointments"
            subtitle="Patients booked for clinical consultation today"
            action={
              <Link href="/dashboard/doctor/appointments" className="text-xs font-bold text-primary-600 hover:underline">
                View All Appointments &rarr;
              </Link>
            }
          />
          <CardContent className="divide-y divide-slate-100">
            {loading ? (
              <div className="space-y-3 py-2">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
            ) : summary?.todayAppointments?.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">No appointments scheduled for today.</p>
            ) : (
              summary?.todayAppointments?.map((apt: any) => (
                <div key={apt._id} className="py-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center font-bold">
                      <Clock className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900">
                        {apt.patient?.firstName} {apt.patient?.lastName}
                      </p>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Slot: <span className="font-semibold text-slate-800">{apt.appointmentTime}</span> &bull; Blood: {apt.patient?.bloodGroup || 'N/A'} &bull; Phone: {apt.patient?.phone}
                      </p>
                      <p className="text-[11px] text-slate-400 italic">Chief Complaint: "{apt.reason}"</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Badge variant={apt.status === 'Completed' ? 'success' : 'primary'} size="sm">
                      {apt.status}
                    </Badge>
                    <Link href={`/dashboard/doctor/consultation?appointmentId=${apt._id}&patientId=${apt.patient?._id}`}>
                      <Button size="sm" variant="outline">
                        Start EMR
                      </Button>
                    </Link>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Two Columns: Recent Medical Records & Prescriptions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Records */}
          <Card>
            <CardHeader
              title="Recent Clinical Records"
              subtitle="Latest electronic medical records authored"
            />
            <CardContent className="divide-y divide-slate-100">
              {summary?.recentMedicalRecords?.length === 0 ? (
                <p className="text-xs text-slate-400 py-6 text-center">No recent records found.</p>
              ) : (
                summary?.recentMedicalRecords?.map((rec: any) => (
                  <div key={rec._id} className="py-3 flex items-center justify-between text-xs">
                    <div>
                      <p className="font-bold text-slate-900">{rec.patient?.firstName} {rec.patient?.lastName}</p>
                      <p className="text-primary-600 font-semibold mt-0.5">{rec.diagnosis}</p>
                      <p className="text-slate-400 text-[10px]">{new Date(rec.visitDate).toLocaleDateString()}</p>
                    </div>
                    <Badge variant="neutral" size="sm">{rec.recordNumber}</Badge>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {/* Recent Prescriptions */}
          <Card>
            <CardHeader
              title="Recent Prescriptions"
              subtitle="Medications prescribed to patients"
            />
            <CardContent className="divide-y divide-slate-100">
              {summary?.recentPrescriptions?.length === 0 ? (
                <p className="text-xs text-slate-400 py-6 text-center">No prescriptions issued yet.</p>
              ) : (
                summary?.recentPrescriptions?.map((rx: any) => (
                  <div key={rx._id} className="py-3 flex items-center justify-between text-xs">
                    <div>
                      <p className="font-bold text-slate-900">{rx.patient?.firstName} {rx.patient?.lastName}</p>
                      <p className="text-slate-500 mt-0.5">{rx.medicines?.length || 1} Medications prescribed</p>
                      <p className="text-slate-400 text-[10px]">{new Date(rx.issueDate).toLocaleDateString()}</p>
                    </div>
                    <Badge variant="success" size="sm">{rx.prescriptionNumber}</Badge>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
