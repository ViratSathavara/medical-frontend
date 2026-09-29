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
  Pill,
  FlaskConical,
  Receipt,
  HeartPulse,
  Clock,
  ArrowRight,
  Download,
  AlertCircle
} from 'lucide-react';

export default function PatientDashboard() {
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/patients/summary')
      .then((res) => setSummary(res.data.data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <DashboardLayout allowedRoles={['PATIENT']}>
      <div className="space-y-8">
        {/* Welcome Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              Welcome Back, {summary?.patient?.firstName || 'Patient'}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Patient ID: <span className="font-bold text-slate-700">{summary?.patient?.patientId || 'PAT-1001'}</span> &bull; Blood Group: <span className="font-semibold text-primary-600">{summary?.patient?.bloodGroup || 'O+'}</span>
            </p>
          </div>

          <Link href="/appointments">
            <Button size="md" variant="primary" leftIcon={<Calendar className="w-4 h-4" />}>
              Book New Appointment
            </Button>
          </Link>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <StatCard
            title="Upcoming Visit"
            value={summary?.upcomingAppointment ? '1 Scheduled' : 'None'}
            icon={Calendar}
            color="primary"
          />
          <StatCard
            title="Active Prescriptions"
            value={summary?.recentPrescriptions?.length || 0}
            icon={Pill}
            color="emerald"
          />
          <StatCard
            title="Lab Investigations"
            value={summary?.recentLabReports?.length || 0}
            icon={FlaskConical}
            color="indigo"
          />
          <StatCard
            title="Unpaid Balance"
            value={`$${summary?.pendingAmount || 0}`}
            icon={Receipt}
            color={summary?.pendingAmount > 0 ? 'rose' : 'emerald'}
          />
        </div>

        {/* Next Scheduled Appointment Banner */}
        {summary?.upcomingAppointment && (
          <div className="p-6 rounded-3xl bg-gradient-to-r from-primary-600 to-sky-600 text-white shadow-soft flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-2">
              <span className="inline-block px-2.5 py-0.5 rounded-full bg-white/20 text-xs font-bold uppercase tracking-wider">
                Confirmed Appointment
              </span>
              <h3 className="text-xl font-bold">
                Consultation with Dr. {summary.upcomingAppointment.doctor?.firstName} {summary.upcomingAppointment.doctor?.lastName}
              </h3>
              <p className="text-xs text-sky-100 flex items-center gap-4">
                <span>Date: {new Date(summary.upcomingAppointment.appointmentDate).toDateString()}</span>
                <span>&bull;</span>
                <span>Time: {summary.upcomingAppointment.appointmentTime}</span>
                <span>&bull;</span>
                <span>Speciality: {summary.upcomingAppointment.doctor?.specialization}</span>
              </p>
            </div>
            <Link href="/dashboard/patient/appointments">
              <Button size="sm" variant="secondary" className="bg-white text-primary-700 hover:bg-sky-50 font-bold border-0">
                Manage Appointment
              </Button>
            </Link>
          </div>
        )}

        {/* Two-Column Grid: Recent Prescriptions & Lab Reports */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Prescriptions */}
          <Card>
            <CardHeader
              title="Recent Prescriptions"
              subtitle="Digital verified prescriptions from attending doctors"
              action={
                <Link href="/dashboard/patient/prescriptions" className="text-xs font-bold text-primary-600 hover:underline">
                  View All &rarr;
                </Link>
              }
            />
            <CardContent className="divide-y divide-slate-100">
              {loading ? (
                <div className="space-y-3 py-2">
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                </div>
              ) : summary?.recentPrescriptions?.length === 0 ? (
                <p className="text-xs text-slate-400 py-6 text-center">No prescriptions issued yet.</p>
              ) : (
                summary?.recentPrescriptions?.map((rx: any) => (
                  <div key={rx._id} className="py-3.5 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-bold text-slate-900">{rx.prescriptionNumber}</p>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Dr. {rx.doctor?.firstName} {rx.doctor?.lastName} &bull; {new Date(rx.issueDate).toLocaleDateString()}
                      </p>
                      <p className="text-[11px] text-primary-600 font-medium mt-1 truncate max-w-xs">
                        {rx.diagnosis}
                      </p>
                    </div>
                    {rx.pdfUrl ? (
                      <a href={rx.pdfUrl} target="_blank" rel="noreferrer" download>
                        <Button size="sm" variant="outline" leftIcon={<Download className="w-3.5 h-3.5" />}>
                          PDF
                        </Button>
                      </a>
                    ) : (
                      <Badge variant="neutral" size="sm">Available</Badge>
                    )}
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {/* Diagnostic Lab Reports */}
          <Card>
            <CardHeader
              title="Diagnostic Pathology Reports"
              subtitle="Completed laboratory test results"
              action={
                <Link href="/dashboard/patient/lab-reports" className="text-xs font-bold text-primary-600 hover:underline">
                  View All &rarr;
                </Link>
              }
            />
            <CardContent className="divide-y divide-slate-100">
              {loading ? (
                <div className="space-y-3 py-2">
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                </div>
              ) : summary?.recentLabReports?.length === 0 ? (
                <p className="text-xs text-slate-400 py-6 text-center">No laboratory reports yet.</p>
              ) : (
                summary?.recentLabReports?.map((rep: any) => (
                  <div key={rep._id} className="py-3.5 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-bold text-slate-900">{rep.reportNumber}</p>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Completed: {new Date(rep.completedAt).toLocaleDateString()}
                      </p>
                      <Badge variant="success" size="sm" className="mt-1">Finalized</Badge>
                    </div>
                    {rep.pdfUrl && (
                      <a href={rep.pdfUrl} target="_blank" rel="noreferrer" download>
                        <Button size="sm" variant="outline" leftIcon={<Download className="w-3.5 h-3.5" />}>
                          PDF
                        </Button>
                      </a>
                    )}
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>

        {/* Latest Recorded Vitals Summary */}
        {summary?.latestVitals && (
          <Card>
            <CardHeader title="Latest Recorded Vital Signs" subtitle="Monitored during your last clinical consultation" />
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                <div className="p-3.5 rounded-2xl bg-slate-50 text-center">
                  <span className="text-[11px] text-slate-500 font-semibold block uppercase">Blood Pressure</span>
                  <span className="text-lg font-bold text-slate-900 mt-1 block">
                    {summary.latestVitals.bpSystolic}/{summary.latestVitals.bpDiastolic} mmHg
                  </span>
                </div>
                <div className="p-3.5 rounded-2xl bg-slate-50 text-center">
                  <span className="text-[11px] text-slate-500 font-semibold block uppercase">Heart Rate</span>
                  <span className="text-lg font-bold text-slate-900 mt-1 block">
                    {summary.latestVitals.heartRate} bpm
                  </span>
                </div>
                <div className="p-3.5 rounded-2xl bg-slate-50 text-center">
                  <span className="text-[11px] text-slate-500 font-semibold block uppercase">Temperature</span>
                  <span className="text-lg font-bold text-slate-900 mt-1 block">
                    {summary.latestVitals.temperature} °F
                  </span>
                </div>
                <div className="p-3.5 rounded-2xl bg-slate-50 text-center">
                  <span className="text-[11px] text-slate-500 font-semibold block uppercase">Oxygen (SpO2)</span>
                  <span className="text-lg font-bold text-slate-900 mt-1 block">
                    {summary.latestVitals.oxygenSaturation}%
                  </span>
                </div>
                <div className="p-3.5 rounded-2xl bg-slate-50 text-center">
                  <span className="text-[11px] text-slate-500 font-semibold block uppercase">Weight</span>
                  <span className="text-lg font-bold text-slate-900 mt-1 block">
                    {summary.latestVitals.weight} kg
                  </span>
                </div>
                <div className="p-3.5 rounded-2xl bg-slate-50 text-center">
                  <span className="text-[11px] text-slate-500 font-semibold block uppercase">Body Mass Index</span>
                  <span className="text-lg font-bold text-slate-900 mt-1 block">
                    {summary.latestVitals.bmi} BMI
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
