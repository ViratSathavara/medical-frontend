'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { DashboardLayout } from '../../../../components/layout/DashboardLayout';
import { Card, CardHeader, CardContent } from '../../../../components/ui/Card';
import { Button } from '../../../../components/ui/Button';
import { Badge } from '../../../../components/ui/Badge';
import { Modal } from '../../../../components/ui/Modal';
import { EmptyState } from '../../../../components/ui/EmptyState';
import { Skeleton } from '../../../../components/ui/Skeleton';
import api from '../../../../services/api';
import { Appointment } from '../../../../types';
import { Calendar, Clock, MapPin, XCircle, Stethoscope, AlertCircle } from 'lucide-react';

export default function PatientAppointments() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [statusFilter, setStatusFilter] = useState('All');
  const [loading, setLoading] = useState(true);

  // Cancellation modal state
  const [selectedApt, setSelectedApt] = useState<Appointment | null>(null);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelling, setCancelling] = useState(false);

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

  const handleCancel = async () => {
    if (!selectedApt) return;
    setCancelling(true);
    try {
      await api.patch(`/appointments/${selectedApt._id}/status`, {
        status: 'Cancelled',
        cancellationReason: cancelReason || 'Patient request'
      });
      setSelectedApt(null);
      setCancelReason('');
      fetchAppointments();
    } catch (err) {
      console.error(err);
    } finally {
      setCancelling(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Confirmed':
        return <Badge variant="primary">Confirmed</Badge>;
      case 'Completed':
        return <Badge variant="success">Completed</Badge>;
      case 'Cancelled':
        return <Badge variant="danger">Cancelled</Badge>;
      case 'Rejected':
        return <Badge variant="danger">Rejected</Badge>;
      case 'Pending':
        return <Badge variant="warning">Pending Review</Badge>;
      default:
        return <Badge variant="neutral">{status}</Badge>;
    }
  };

  return (
    <DashboardLayout allowedRoles={['PATIENT']}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">My Appointments</h1>
            <p className="text-xs text-slate-500 mt-1">Review upcoming consultations, history, and status updates</p>
          </div>

          <Link href="/appointments">
            <Button size="sm" variant="primary" leftIcon={<Calendar className="w-4 h-4" />}>
              Schedule New Visit
            </Button>
          </Link>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          {['All', 'Confirmed', 'Pending', 'Completed', 'Cancelled'].map((st) => (
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

        {/* Appointment Cards */}
        {loading ? (
          <div className="space-y-4">
            <Skeleton className="h-28 w-full" />
            <Skeleton className="h-28 w-full" />
          </div>
        ) : appointments.length === 0 ? (
          <EmptyState
            title="No Appointments Found"
            description="You don't have any appointments matching the selected filter."
            actionText="Book New Appointment"
            onAction={() => window.location.href = '/appointments'}
          />
        ) : (
          <div className="space-y-4">
            {appointments.map((apt) => (
              <Card key={apt._id} hoverEffect className="p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-primary-50 text-primary-600 flex items-center justify-center shrink-0">
                    <Stethoscope className="w-6 h-6" />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-slate-900">
                        Dr. {apt.doctor?.firstName} {apt.doctor?.lastName}
                      </span>
                      {getStatusBadge(apt.status)}
                    </div>

                    <p className="text-xs text-primary-600 font-semibold">
                      {apt.doctor?.specialization} &bull; {(apt.department as any)?.name || 'General Clinic'}
                    </p>

                    <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-1">
                      <span className="flex items-center gap-1.5 font-medium text-slate-700">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        {new Date(apt.appointmentDate).toDateString()}
                      </span>
                      <span className="flex items-center gap-1.5 font-medium text-slate-700">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        {apt.appointmentTime}
                      </span>
                      <span className="flex items-center gap-1.5 text-slate-400">
                        ID: {apt.appointmentNumber}
                      </span>
                    </div>

                    <p className="text-xs text-slate-500 italic mt-1">
                      Reason: "{apt.reason}"
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto justify-end pt-3 md:pt-0 border-t md:border-t-0 border-slate-100">
                  {['Confirmed', 'Pending'].includes(apt.status) && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-rose-600 hover:bg-rose-50 border-rose-200"
                      onClick={() => setSelectedApt(apt)}
                    >
                      Cancel Visit
                    </Button>
                  )}
                  <span className="text-xs font-bold text-slate-900">
                    ${apt.consultationFee}
                  </span>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Cancellation Modal */}
      {selectedApt && (
        <Modal
          isOpen={!!selectedApt}
          onClose={() => setSelectedApt(null)}
          title="Cancel Scheduled Appointment"
          subtitle={`Appointment ID: ${selectedApt.appointmentNumber}`}
        >
          <div className="space-y-4">
            <p className="text-xs text-slate-600">
              Are you sure you want to cancel your consultation with <span className="font-bold">Dr. {selectedApt.doctor?.firstName} {selectedApt.doctor?.lastName}</span> on <span className="font-bold">{new Date(selectedApt.appointmentDate).toDateString()}</span>?
            </p>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Reason for Cancellation
              </label>
              <textarea
                rows={3}
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="e.g. Schedule conflict, feeling better..."
                className="w-full rounded-xl border border-slate-300 p-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <Button size="sm" variant="ghost" onClick={() => setSelectedApt(null)}>
                Keep Appointment
              </Button>
              <Button size="sm" variant="danger" isLoading={cancelling} onClick={handleCancel}>
                Confirm Cancellation
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </DashboardLayout>
  );
}
