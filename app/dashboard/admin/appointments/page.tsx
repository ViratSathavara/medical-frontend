'use client';

import React, { useEffect, useState } from 'react';
import { DashboardLayout } from '../../../../components/layout/DashboardLayout';
import { Card, CardHeader, CardContent } from '../../../../components/ui/Card';
import { Button } from '../../../../components/ui/Button';
import { Badge } from '../../../../components/ui/Badge';
import { Input } from '../../../../components/ui/Input';
import { Select } from '../../../../components/ui/Select';
import { Skeleton } from '../../../../components/ui/Skeleton';
import { EmptyState } from '../../../../components/ui/EmptyState';
import api from '../../../../services/api';
import {
  Calendar,
  Search,
  Filter,
  CheckCircle,
  XCircle,
  Clock,
  User,
  Stethoscope,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

export default function AdminAppointmentsPage() {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    fetchAppointments();
  }, [statusFilter]);

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const res = await api.get('/appointments', {
        params: {
          limit: 100,
          status: statusFilter !== 'All' ? statusFilter : undefined
        }
      });
      setAppointments(res.data.data || []);
    } catch (err) {
      console.error('Failed to load appointments:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (id: string, newStatus: string) => {
    try {
      await api.patch(`/appointments/${id}/status`, { status: newStatus });
      setMessage({ type: 'success', text: `Appointment status updated to ${newStatus}.` });
      setTimeout(() => setMessage(null), 3000);
      fetchAppointments();
    } catch (err: any) {
      setMessage({
        type: 'error',
        text: err.response?.data?.message || 'Failed to update appointment status.'
      });
    }
  };

  const filtered = appointments.filter((appt) => {
    const q = search.toLowerCase();
    const pat = `${appt.patient?.firstName || ''} ${appt.patient?.lastName || ''}`.toLowerCase();
    const doc = `${appt.doctor?.firstName || ''} ${appt.doctor?.lastName || ''}`.toLowerCase();
    const reason = (appt.reason || '').toLowerCase();
    return pat.includes(q) || doc.includes(q) || reason.includes(q);
  });

  return (
    <DashboardLayout allowedRoles={['ADMIN']}>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Hospital Appointments Master Log</h1>
            <p className="text-sm text-slate-500 mt-1">
              Centralized appointment schedule tracking, live doctor allocation & status reconciliation
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold px-3 py-1.5 rounded-full bg-slate-100 text-slate-700">
              {filtered.length} Bookings Listed
            </span>
          </div>
        </div>

        {message && (
          <div
            className={`p-3.5 rounded-xl border flex items-center gap-2 text-sm font-medium ${
              message.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                : 'bg-rose-50 text-rose-800 border-rose-200'
            }`}
          >
            {message.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            {message.text}
          </div>
        )}

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="relative w-full sm:max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by patient, doctor, or chief complaint..."
              className="pl-9 bg-white"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Filter className="w-4 h-4 text-slate-400" />
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              options={[
                { value: 'All', label: 'All Booking Statuses' },
                { value: 'Pending', label: 'Pending' },
                { value: 'Confirmed', label: 'Confirmed' },
                { value: 'Completed', label: 'Completed' },
                { value: 'Cancelled', label: 'Cancelled' }
              ]}
              className="w-48 bg-white"
            />
          </div>
        </div>

        {/* Table */}
        <Card>
          <CardContent className="p-0 overflow-x-auto">
            {loading ? (
              <div className="p-6 space-y-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Skeleton key={i} className="h-14 w-full rounded-lg" />
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <EmptyState
                icon={Calendar}
                title="No Appointments Found"
                description={
                  search || statusFilter !== 'All'
                    ? 'No appointments meet the specified filter criteria.'
                    : 'No appointments on record.'
                }
              />
            ) : (
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 text-xs uppercase font-semibold">
                  <tr>
                    <th className="py-3 px-4">Patient</th>
                    <th className="py-3 px-4">Doctor & Clinic</th>
                    <th className="py-3 px-4">Date & Time Slot</th>
                    <th className="py-3 px-4">Chief Complaint</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Update Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filtered.map((appt) => (
                    <tr key={appt._id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-4">
                        <p className="font-semibold text-slate-900">
                          {appt.patient?.firstName} {appt.patient?.lastName}
                        </p>
                        <span className="text-[11px] font-mono text-slate-400">
                          {appt.patient?.patientId}
                        </span>
                      </td>

                      <td className="py-3 px-4">
                        <p className="font-medium text-slate-900">
                          Dr. {appt.doctor?.firstName} {appt.doctor?.lastName}
                        </p>
                        <p className="text-xs text-teal-700">{appt.department?.name || 'General'}</p>
                      </td>

                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5 text-xs text-slate-800 font-medium">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          {new Date(appt.appointmentDate).toLocaleDateString()}
                        </div>
                        <div className="flex items-center gap-1 text-[11px] text-slate-500 mt-0.5">
                          <Clock className="w-3 h-3 text-slate-400" />
                          {appt.appointmentTime}
                        </div>
                      </td>

                      <td className="py-3 px-4 text-xs text-slate-600 max-w-xs truncate">
                        {appt.reason || 'General Health Consultation'}
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
                          className="text-xs"
                        >
                          {appt.status}
                        </Badge>
                      </td>

                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {appt.status !== 'Confirmed' && appt.status !== 'Completed' && (
                            <Button
                              size="sm"
                              onClick={() => handleStatusUpdate(appt._id, 'Confirmed')}
                              className="text-xs bg-teal-600 hover:bg-teal-700 py-1 px-2.5 h-8"
                            >
                              Confirm
                            </Button>
                          )}

                          {appt.status === 'Confirmed' && (
                            <Button
                              size="sm"
                              onClick={() => handleStatusUpdate(appt._id, 'Completed')}
                              className="text-xs bg-emerald-600 hover:bg-emerald-700 py-1 px-2.5 h-8"
                            >
                              Complete
                            </Button>
                          )}

                          {appt.status !== 'Cancelled' && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleStatusUpdate(appt._id, 'Cancelled')}
                              className="text-xs text-rose-600 hover:bg-rose-50 border-rose-200 py-1 px-2.5 h-8"
                            >
                              Cancel
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
