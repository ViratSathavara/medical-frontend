'use client';

import React, { useEffect, useState } from 'react';
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
  Stethoscope,
  Search,
  CheckCircle,
  XCircle,
  Edit2,
  DollarSign,
  Building,
  GraduationCap,
  Calendar,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

export default function AdminDoctorsPage() {
  const [doctors, setDoctors] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Edit Doctor Modal State
  const [editingDoctor, setEditingDoctor] = useState<any | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [savingEdit, setSavingEdit] = useState(false);

  useEffect(() => {
    fetchDoctors();
    fetchDepartments();
  }, [statusFilter]);

  const fetchDoctors = async () => {
    setLoading(true);
    try {
      const res = await api.get('/doctors', {
        params: {
          limit: 50,
          status: statusFilter !== 'All' ? statusFilter : undefined
        }
      });
      setDoctors(res.data.data || []);
    } catch (err) {
      console.error('Failed to load doctors:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchDepartments = async () => {
    try {
      const res = await api.get('/departments');
      setDepartments(res.data.data || []);
    } catch (err) {
      console.error('Failed to load departments:', err);
    }
  };

  const handleStatusChange = async (doctorId: string, newStatus: 'Approved' | 'Rejected') => {
    try {
      await api.patch(`/doctors/${doctorId}/approve`, { status: newStatus });
      setMessage({ type: 'success', text: `Doctor status updated to ${newStatus}.` });
      setTimeout(() => setMessage(null), 3000);
      fetchDoctors();
    } catch (err: any) {
      setMessage({
        type: 'error',
        text: err.response?.data?.message || 'Failed to update status.'
      });
      setTimeout(() => setMessage(null), 4000);
    }
  };

  const openEditModal = (doctor: any) => {
    setEditingDoctor({
      ...doctor,
      departmentId: doctor.department?._id || doctor.department || '',
      consultationFee: doctor.consultationFee || 100,
      roomNumber: doctor.roomNumber || ''
    });
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDoctor?._id) return;

    setSavingEdit(true);
    try {
      await api.put(`/doctors/${editingDoctor._id}`, {
        department: editingDoctor.departmentId,
        consultationFee: editingDoctor.consultationFee,
        roomNumber: editingDoctor.roomNumber,
        specialization: editingDoctor.specialization
      });
      setMessage({ type: 'success', text: 'Doctor details updated successfully.' });
      setIsEditModalOpen(false);
      setTimeout(() => setMessage(null), 3000);
      fetchDoctors();
    } catch (err: any) {
      setMessage({
        type: 'error',
        text: err.response?.data?.message || 'Failed to update doctor.'
      });
    } finally {
      setSavingEdit(false);
    }
  };

  const filteredDoctors = doctors.filter((doc) => {
    const q = search.toLowerCase();
    const fullName = `${doc.firstName || ''} ${doc.lastName || ''}`.toLowerCase();
    const spec = (doc.specialization || '').toLowerCase();
    const docId = (doc.doctorId || '').toLowerCase();
    return fullName.includes(q) || spec.includes(q) || docId.includes(q);
  });

  return (
    <DashboardLayout allowedRoles={['ADMIN']}>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Doctor Management & Approvals</h1>
            <p className="text-sm text-slate-500 mt-1">
              Verify credentials, review clinical status, assign hospital departments & fees
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold px-3 py-1.5 rounded-full bg-slate-100 text-slate-700">
              {filteredDoctors.length} Practitioners Listed
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

        {/* Filter Controls */}
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="relative w-full sm:max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by doctor name, specialization, or DOC ID..."
              className="pl-9 bg-white"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              options={[
                { value: 'All', label: 'All Statuses' },
                { value: 'Approved', label: 'Approved' },
                { value: 'Pending', label: 'Pending Approval' },
                { value: 'Rejected', label: 'Rejected' }
              ]}
              className="w-48 bg-white"
            />
          </div>
        </div>

        {/* Doctors Table */}
        <Card>
          <CardContent className="p-0 overflow-x-auto">
            {loading ? (
              <div className="p-6 space-y-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Skeleton key={i} className="h-14 w-full rounded-lg" />
                ))}
              </div>
            ) : filteredDoctors.length === 0 ? (
              <EmptyState
                icon={Stethoscope}
                title="No Doctors Found"
                description={
                  search || statusFilter !== 'All'
                    ? 'No doctors match the selected search or status criteria.'
                    : 'No doctors are currently in the system.'
                }
              />
            ) : (
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 text-xs uppercase font-semibold">
                  <tr>
                    <th className="py-3 px-4">Doctor</th>
                    <th className="py-3 px-4">Department & Room</th>
                    <th className="py-3 px-4">Experience & Fee</th>
                    <th className="py-3 px-4">Approval Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredDoctors.map((doc) => {
                    const isApproved = doc.status === 'Approved';
                    const isPending = doc.status === 'Pending';

                    return (
                      <tr key={doc._id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-teal-600/10 text-teal-700 font-bold text-sm flex items-center justify-center border border-teal-200">
                              {doc.firstName?.[0]}
                              {doc.lastName?.[0]}
                            </div>
                            <div>
                              <p className="font-semibold text-slate-900">
                                Dr. {doc.firstName} {doc.lastName}
                              </p>
                              <div className="flex items-center gap-2 mt-0.5">
                                <span className="text-[11px] font-mono text-slate-500">{doc.doctorId}</span>
                                <span className="text-[11px] text-teal-700 font-medium">
                                  {doc.specialization}
                                </span>
                              </div>
                            </div>
                          </div>
                        </td>

                        <td className="py-3 px-4">
                          <p className="text-slate-800 font-medium text-xs">
                            {doc.department?.name || 'General Clinic'}
                          </p>
                          <p className="text-[11px] text-slate-400 mt-0.5">{doc.roomNumber || 'Room N/A'}</p>
                        </td>

                        <td className="py-3 px-4">
                          <p className="text-xs text-slate-700 font-medium">{doc.experienceYears || 5} Years Exp</p>
                          <p className="text-xs font-semibold text-slate-900 mt-0.5">
                            ${doc.consultationFee || 100} / visit
                          </p>
                        </td>

                        <td className="py-3 px-4">
                          <Badge
                            variant={isApproved ? 'success' : isPending ? 'warning' : 'danger'}
                            className="text-xs"
                          >
                            {doc.status}
                          </Badge>
                        </td>

                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => openEditModal(doc)}
                              className="text-xs p-2"
                              title="Edit details"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </Button>

                            {!isApproved && (
                              <Button
                                size="sm"
                                onClick={() => handleStatusChange(doc._id, 'Approved')}
                                className="text-xs bg-emerald-600 hover:bg-emerald-700 p-2"
                                title="Approve Doctor"
                              >
                                <CheckCircle className="w-3.5 h-3.5" />
                              </Button>
                            )}

                            {doc.status !== 'Rejected' && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleStatusChange(doc._id, 'Rejected')}
                                className="text-xs text-rose-600 hover:bg-rose-50 p-2 border-rose-200"
                                title="Reject Doctor"
                              >
                                <XCircle className="w-3.5 h-3.5" />
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </CardContent>
        </Card>

        {/* Edit Doctor Details Modal */}
        <Modal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          title={`Edit Dr. ${editingDoctor?.firstName || ''} ${editingDoctor?.lastName || ''}`}
        >
          {editingDoctor && (
            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Specialization</label>
                <Input
                  value={editingDoctor.specialization || ''}
                  onChange={(e) =>
                    setEditingDoctor({ ...editingDoctor, specialization: e.target.value })
                  }
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Department Assignment
                </label>
                <Select
                  value={editingDoctor.departmentId}
                  onChange={(e) =>
                    setEditingDoctor({ ...editingDoctor, departmentId: e.target.value })
                  }
                  options={[
                    { value: '', label: 'Select Department' },
                    ...departments.map((d) => ({ value: d._id, label: d.name }))
                  ]}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Consultation Fee ($)
                  </label>
                  <Input
                    type="number"
                    min={0}
                    value={editingDoctor.consultationFee}
                    onChange={(e) =>
                      setEditingDoctor({
                        ...editingDoctor,
                        consultationFee: parseFloat(e.target.value) || 0
                      })
                    }
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Clinic Room</label>
                  <Input
                    value={editingDoctor.roomNumber || ''}
                    onChange={(e) =>
                      setEditingDoctor({ ...editingDoctor, roomNumber: e.target.value })
                    }
                    placeholder="e.g. Room 302"
                  />
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-2 border-t border-slate-100">
                <Button type="button" variant="outline" onClick={() => setIsEditModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={savingEdit} className="bg-teal-600 hover:bg-teal-700">
                  {savingEdit ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </form>
          )}
        </Modal>
      </div>
    </DashboardLayout>
  );
}
