'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { DashboardLayout } from '../../../../components/layout/DashboardLayout';
import { Card, CardHeader, CardContent } from '../../../../components/ui/Card';
import { Button } from '../../../../components/ui/Button';
import { Badge } from '../../../../components/ui/Badge';
import { EmptyState } from '../../../../components/ui/EmptyState';
import { Skeleton } from '../../../../components/ui/Skeleton';
import api from '../../../../services/api';
import { Appointment } from '../../../../types';
import { Calendar, Clock, Check, X, FileText, User } from 'lucide-react';

export default function DoctorAppointments() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [statusFilter, setStatusFilter] = useState('All');
  const [loading, setLoading] = useState(true);

  const fetchAppointments = () => {
    setLoading(true);
    let url = '/appointments?limit=50';
    if (statusFilter !== 'All') url += `&status=${statusFilter}`;

    api.get(url)
      .then((res) => setAppointments(res.data.data || []))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchAppointments();
  }, [statusFilter]);

  const updateStatus = async (appointmentId: string, newStatus: string) => {
    try {
      await api.patch(`/appointments/${appointmentId}/status`, { status: newStatus });
      fetchAppointments();
    } catch (err) {
      console.error(err);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Confirmed': return <Badge variant="primary">Confirmed</Badge>;
      case 'Completed': return <Badge variant="success">Completed</Badge>;
      case 'Cancelled': return <Badge variant="danger">Cancelled</Badge>;
      case 'Rejected': return <Badge variant="danger">Rejected</Badge>;
      case 'Pending': return <Badge variant="warning">Pending Review</Badge>;
      default: return <Badge variant="neutral">{status}</Badge>;
    }
  };

  return (
    <DashboardLayout allowedRoles={['DOCTOR']}>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Manage Patient Appointments</h1>
          <p className="text-xs text-slate-500 mt-1">Accept, reschedule, complete, or launch clinical consultations</p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          {['All', 'Pending', 'Confirmed', 'Completed', 'Cancelled'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                statusFilter === st
                  ? 'bg-primary-600 text-white shadow-sm'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              {st}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="space-y-4">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
        ) : appointments.length === 0 ? (
          <EmptyState
            title="No Appointments Found"
            description="No scheduled consultations match this filter."
          />
        ) : (
          <div className="space-y-4">
            {appointments.map((apt) => (
              <Card key={apt._id} className="p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-3">
                    <span className="text-base font-bold text-slate-900">
                      {apt.patient?.firstName} {apt.patient?.lastName}
                    </span>
                    {getStatusBadge(apt.status)}
                    <span className="text-xs text-slate-400">ID: {apt.appointmentNumber}</span>
                  </div>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500">
                    <span className="flex items-center gap-1.5 font-medium text-slate-700">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      {new Date(apt.appointmentDate).toDateString()}
                    </span>
                    <span className="flex items-center gap-1.5 font-medium text-slate-700">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      {apt.appointmentTime}
                    </span>
                    <span>Blood: <strong className="text-slate-800">{apt.patient?.bloodGroup || 'N/A'}</strong></span>
                    <span>Phone: {apt.patient?.phone}</span>
                  </div>

                  <p className="text-xs text-slate-600 pt-1">
                    <span className="font-semibold text-slate-700">Chief Complaint:</span> "{apt.reason}"
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-end pt-3 md:pt-0 border-t md:border-t-0 border-slate-100">
                  {apt.status === 'Pending' && (
                    <>
                      <Button
                        size="sm"
                        variant="primary"
                        leftIcon={<Check className="w-4 h-4" />}
                        onClick={() => updateStatus(apt._id, 'Confirmed')}
                      >
                        Accept
                      </Button>
                      <Button
                        size="sm"
                        variant="danger"
                        leftIcon={<X className="w-4 h-4" />}
                        onClick={() => updateStatus(apt._id, 'Rejected')}
                      >
                        Reject
                      </Button>
                    </>
                  )}

                  {apt.status === 'Confirmed' && (
                    <>
                      <Link href={`/dashboard/doctor/consultation?appointmentId=${apt._id}&patientId=${apt.patient?._id}`}>
                        <Button size="sm" variant="primary" leftIcon={<FileText className="w-4 h-4" />}>
                          Start Consultation
                        </Button>
                      </Link>
                      <Button
                        size="sm"
                        variant="emerald"
                        leftIcon={<Check className="w-4 h-4" />}
                        onClick={() => updateStatus(apt._id, 'Completed')}
                      >
                        Mark Completed
                      </Button>
                    </>
                  )}

                  {apt.status === 'Completed' && (
                    <Link href={`/dashboard/doctor/consultation?patientId=${apt.patient?._id}`}>
                      <Button size="sm" variant="outline" leftIcon={<FileText className="w-4 h-4" />}>
                        Review EMR
                      </Button>
                    </Link>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
