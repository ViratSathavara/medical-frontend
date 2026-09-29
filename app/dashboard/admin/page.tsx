'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { DashboardLayout } from '../../../components/layout/DashboardLayout';
import { Card, CardHeader, CardContent } from '../../../components/ui/Card';
import { StatCard } from '../../../components/shared/StatCard';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { Skeleton } from '../../../components/ui/Skeleton';
import api from '../../../services/api';
import {
  Users,
  Stethoscope,
  Calendar,
  DollarSign,
  BedDouble,
  FlaskConical,
  Pill,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  Activity,
  UserPlus,
  Receipt,
  Clock
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';

const COLORS = ['#0d9488', '#0284c7', '#6366f1', '#f59e0b', '#ec4899', '#10b981'];

export default function AdminDashboardPage() {
  const [analytics, setAnalytics] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/analytics');
      setAnalytics(res.data.data);
    } catch (err) {
      console.error('Failed to load admin analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  const metrics = analytics?.metrics || {};
  const charts = analytics?.charts || {};
  const recentAppointments = analytics?.recentAppointments || [];
  const recentPatients = analytics?.recentPatients || [];

  const bedOccupancyRate =
    metrics.totalBeds > 0
      ? Math.round(((metrics.occupiedBeds || 0) / metrics.totalBeds) * 100)
      : 0;

  return (
    <DashboardLayout allowedRoles={['ADMIN']}>
      <div className="space-y-8">
        {/* Top Header & Quick Actions */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Hospital Operations Executive Dashboard
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Live hospital performance, clinical patient volume, bed occupancy & financial metrics
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Link href="/dashboard/admin/inpatient">
              <Button size="sm" variant="outline" className="flex items-center gap-1.5">
                <BedDouble className="w-4 h-4 text-teal-600" /> Admit Inpatient
              </Button>
            </Link>
            <Link href="/dashboard/admin/billing">
              <Button size="sm" variant="outline" className="flex items-center gap-1.5">
                <Receipt className="w-4 h-4 text-emerald-600" /> Issue Invoice
              </Button>
            </Link>
            <Link href="/dashboard/admin/emergency">
              <Button size="sm" className="flex items-center gap-1.5 bg-rose-600 hover:bg-rose-700">
                <AlertTriangle className="w-4 h-4" /> Emergency Triage
              </Button>
            </Link>
          </div>
        </div>

        {loading ? (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <Skeleton key={i} className="h-32 rounded-xl" />
              ))}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Skeleton className="h-80 rounded-xl" />
              <Skeleton className="h-80 rounded-xl" />
            </div>
          </div>
        ) : (
          <>
            {/* 8 Primary KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard
                title="Total Revenue Collected"
                value={`$${(metrics.totalRevenue || 0).toLocaleString()}`}
                icon={DollarSign}
                change={14.8}
                description="Live receipts from billing & pharmacy"
              />
              <StatCard
                title="Total Patients Registered"
                value={metrics.totalPatients || 0}
                icon={Users}
                change={8.2}
                description="Registered clinical health records"
              />
              <StatCard
                title="Licensed Doctors"
                value={metrics.totalDoctors || 0}
                icon={Stethoscope}
                description="Active practitioners across all clinics"
              />
              <StatCard
                title="Today's Appointments"
                value={metrics.todayAppointments || 0}
                icon={Calendar}
                description={`Total scheduled: ${metrics.totalAppointments || 0}`}
              />
              <StatCard
                title="Bed Occupancy Rate"
                value={`${bedOccupancyRate}%`}
                icon={BedDouble}
                description={`${metrics.occupiedBeds || 0} occupied of ${metrics.totalBeds || 0} beds`}
              />
              <StatCard
                title="Hospital Staff Members"
                value={metrics.totalStaff || 0}
                icon={Activity}
                description="Nurses, techs, pharmacists, admins"
              />
              <StatCard
                title="Diagnostic Lab Tests"
                value={metrics.totalLabRequests || 0}
                icon={FlaskConical}
                description="Pathology & imaging orders"
              />
              <StatCard
                title="Pharmacy Medications"
                value={metrics.totalMedicines || 0}
                icon={Pill}
                description="Cataloged pharmacy drugs"
              />
            </div>

            {/* Visual Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Monthly Revenue & Appointments Trend */}
              <Card>
                <CardHeader className="border-b border-slate-100 pb-3 flex flex-row items-center justify-between">
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">Monthly Patient Volumes & Trends</h3>
                    <p className="text-xs text-slate-500 mt-0.5">Appointment counts over the last 6 months</p>
                  </div>
                  <TrendingUp className="w-4 h-4 text-teal-600" />
                </CardHeader>
                <CardContent className="p-6">
                  <div className="h-72 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={charts.monthlyTrend || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <defs>
                          <linearGradient id="colorAppts" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#0d9488" stopOpacity={0.4} />
                            <stop offset="95%" stopColor="#0d9488" stopOpacity={0.0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                        <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} tickLine={false} />
                        <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: '#0f172a',
                            borderRadius: '8px',
                            color: '#fff',
                            border: 'none',
                            fontSize: '12px'
                          }}
                        />
                        <Area
                          type="monotone"
                          dataKey="appointments"
                          name="Appointments"
                          stroke="#0d9488"
                          strokeWidth={2.5}
                          fillOpacity={1}
                          fill="url(#colorAppts)"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Department Volume Distribution */}
              <Card>
                <CardHeader className="border-b border-slate-100 pb-3 flex flex-row items-center justify-between">
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">Clinical Department Distribution</h3>
                    <p className="text-xs text-slate-500 mt-0.5">Patient consultation share across specialties</p>
                  </div>
                  <Stethoscope className="w-4 h-4 text-teal-600" />
                </CardHeader>
                <CardContent className="p-6">
                  <div className="h-72 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={charts.departmentDistribution || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                        <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} />
                        <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: '#0f172a',
                            borderRadius: '8px',
                            color: '#fff',
                            border: 'none',
                            fontSize: '12px'
                          }}
                        />
                        <Bar dataKey="value" name="Patients" fill="#0284c7" radius={[4, 4, 0, 0]}>
                          {(charts.departmentDistribution || []).map((_: any, index: number) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Tables Grid: Recent Appointments & Recent Patients */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Recent Appointments */}
              <Card className="lg:col-span-2">
                <CardHeader className="border-b border-slate-100 pb-3 flex flex-row items-center justify-between">
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">Recent Hospital Bookings</h3>
                    <p className="text-xs text-slate-500 mt-0.5">Real-time appointments scheduled across departments</p>
                  </div>
                  <Link
                    href="/dashboard/admin/appointments"
                    className="text-xs font-semibold text-teal-600 hover:text-teal-700 flex items-center gap-1"
                  >
                    View All <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </CardHeader>
                <CardContent className="p-0 overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 text-xs uppercase font-semibold">
                      <tr>
                        <th className="py-3 px-4">Patient</th>
                        <th className="py-3 px-4">Doctor</th>
                        <th className="py-3 px-4">Department</th>
                        <th className="py-3 px-4">Date & Time</th>
                        <th className="py-3 px-4">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {recentAppointments.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="py-6 text-center text-xs text-slate-400">
                            No appointments on record yet.
                          </td>
                        </tr>
                      ) : (
                        recentAppointments.map((appt: any) => (
                          <tr key={appt._id} className="hover:bg-slate-50/70 transition-colors">
                            <td className="py-3 px-4">
                              <p className="font-semibold text-slate-900">
                                {appt.patient?.firstName} {appt.patient?.lastName}
                              </p>
                              <p className="text-[11px] font-mono text-slate-400">
                                {appt.patient?.patientId}
                              </p>
                            </td>
                            <td className="py-3 px-4 text-slate-700">
                              Dr. {appt.doctor?.firstName} {appt.doctor?.lastName}
                            </td>
                            <td className="py-3 px-4 text-slate-600 text-xs">
                              {appt.department?.name || 'General Clinic'}
                            </td>
                            <td className="py-3 px-4 text-xs text-slate-500">
                              <span className="font-medium text-slate-700">
                                {new Date(appt.appointmentDate).toLocaleDateString()}
                              </span>{' '}
                              at {appt.appointmentTime}
                            </td>
                            <td className="py-3 px-4">
                              <Badge
                                variant={
                                  appt.status === 'Completed'
                                    ? 'success'
                                    : appt.status === 'Confirmed'
                                    ? 'primary'
                                    : appt.status === 'Cancelled'
                                    ? 'danger'
                                    : 'warning'
                                }
                                className="text-[11px]"
                              >
                                {appt.status}
                              </Badge>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </CardContent>
              </Card>

              {/* Newly Registered Patients */}
              <Card>
                <CardHeader className="border-b border-slate-100 pb-3 flex flex-row items-center justify-between">
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">New Patient Admissions</h3>
                    <p className="text-xs text-slate-500 mt-0.5">Recently onboarded patients</p>
                  </div>
                  <Link
                    href="/dashboard/admin/patients"
                    className="text-xs font-semibold text-teal-600 hover:text-teal-700 flex items-center gap-1"
                  >
                    All <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </CardHeader>
                <CardContent className="p-4 space-y-3">
                  {recentPatients.length === 0 ? (
                    <p className="text-xs text-slate-400 text-center py-6">No recent patients</p>
                  ) : (
                    recentPatients.map((p: any) => (
                      <div
                        key={p._id}
                        className="p-3 rounded-xl border border-slate-100 bg-slate-50/60 flex items-center justify-between"
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-teal-600/10 text-teal-700 font-bold text-xs flex items-center justify-center">
                            {p.firstName?.[0]}
                            {p.lastName?.[0]}
                          </div>
                          <div>
                            <p className="text-xs font-semibold text-slate-900">
                              {p.firstName} {p.lastName}
                            </p>
                            <p className="text-[10px] font-mono text-slate-400">
                              {p.patientId} • {p.bloodGroup || 'Blood N/A'}
                            </p>
                          </div>
                        </div>

                        <span className="text-[10px] text-slate-400">
                          {new Date(p.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
