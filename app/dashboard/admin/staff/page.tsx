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
  ShieldCheck,
  UserPlus,
  Search,
  Filter,
  CheckCircle2,
  AlertCircle,
  Trash2,
  Edit2,
  Mail,
  Phone,
  Briefcase
} from 'lucide-react';

export default function AdminStaffPage() {
  const [staffList, setStaffList] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [newStaff, setNewStaff] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: 'Password123!',
    role: 'Nurse',
    departmentId: '',
    phone: '',
    shift: 'Morning'
  });

  useEffect(() => {
    fetchStaff();
    fetchDepartments();
  }, []);

  const fetchStaff = async () => {
    setLoading(true);
    try {
      const res = await api.get('/staff');
      setStaffList(res.data.data || []);
    } catch (err) {
      console.error('Failed to load staff:', err);
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

  const handleCreateStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/staff', {
        firstName: newStaff.firstName,
        lastName: newStaff.lastName,
        email: newStaff.email,
        password: newStaff.password,
        role: newStaff.role,
        department: newStaff.departmentId || undefined,
        phone: newStaff.phone,
        shift: newStaff.shift
      });
      setMessage({ type: 'success', text: 'New hospital staff member added successfully!' });
      setIsAddModalOpen(false);
      setNewStaff({
        firstName: '',
        lastName: '',
        email: '',
        password: 'Password123!',
        role: 'Nurse',
        departmentId: '',
        phone: '',
        shift: 'Morning'
      });
      setTimeout(() => setMessage(null), 3000);
      fetchStaff();
    } catch (err: any) {
      setMessage({
        type: 'error',
        text: err.response?.data?.message || 'Failed to create staff member.'
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteStaff = async (staffId: string) => {
    if (!confirm('Are you sure you want to remove this staff member?')) return;
    try {
      await api.delete(`/staff/${staffId}`);
      setMessage({ type: 'success', text: 'Staff member removed from active directory.' });
      setTimeout(() => setMessage(null), 3000);
      fetchStaff();
    } catch (err: any) {
      setMessage({
        type: 'error',
        text: err.response?.data?.message || 'Failed to delete staff member.'
      });
    }
  };

  const filteredStaff = staffList.filter((s) => {
    const q = search.toLowerCase();
    const fullName = `${s.firstName || ''} ${s.lastName || ''}`.toLowerCase();
    const sid = (s.staffId || '').toLowerCase();
    const email = (s.user?.email || '').toLowerCase();
    const matchesSearch = fullName.includes(q) || sid.includes(q) || email.includes(q);
    const matchesRole = roleFilter === 'All' || s.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  return (
    <DashboardLayout allowedRoles={['ADMIN']}>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Staff Management Directory</h1>
            <p className="text-sm text-slate-500 mt-1">
              Supervise clinical nursing teams, pharmacy dispensers, laboratory staff & facility operators
            </p>
          </div>

          <Button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700"
          >
            <UserPlus className="w-4 h-4" /> Add Staff Member
          </Button>
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

        {/* Filter Bar */}
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="relative w-full sm:max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by staff name, ID (STF-...), or email..."
              className="pl-9 bg-white"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Filter className="w-4 h-4 text-slate-400" />
            <Select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              options={[
                { value: 'All', label: 'All Staff Roles' },
                { value: 'Nurse', label: 'Registered Nurses' },
                { value: 'Pharmacist', label: 'Pharmacists' },
                { value: 'LabTechnician', label: 'Lab Technicians' },
                { value: 'Receptionist', label: 'Receptionists' },
                { value: 'Accountant', label: 'Accountants' }
              ]}
              className="w-48 bg-white"
            />
          </div>
        </div>

        {/* Staff Table */}
        <Card>
          <CardContent className="p-0 overflow-x-auto">
            {loading ? (
              <div className="p-6 space-y-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Skeleton key={i} className="h-14 w-full rounded-lg" />
                ))}
              </div>
            ) : filteredStaff.length === 0 ? (
              <EmptyState
                icon={ShieldCheck}
                title="No Staff Members Found"
                description={
                  search || roleFilter !== 'All'
                    ? 'No staff members match the selected criteria.'
                    : 'No staff profiles recorded in the database.'
                }
                actionLabel="Add Staff Member"
                onAction={() => setIsAddModalOpen(true)}
              />
            ) : (
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 text-xs uppercase font-semibold">
                  <tr>
                    <th className="py-3 px-4">Staff Member</th>
                    <th className="py-3 px-4">Clinical / Admin Role</th>
                    <th className="py-3 px-4">Department & Shift</th>
                    <th className="py-3 px-4">Contact Phone</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredStaff.map((s) => (
                    <tr key={s._id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-700 font-bold text-sm flex items-center justify-center border border-slate-200">
                            {s.firstName?.[0]}
                            {s.lastName?.[0]}
                          </div>
                          <div>
                            <p className="font-semibold text-slate-900">
                              {s.firstName} {s.lastName}
                            </p>
                            <span className="text-[11px] font-mono text-slate-400">{s.staffId}</span>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <Badge variant="outline" className="font-semibold text-xs">
                          {s.role}
                        </Badge>
                      </td>

                      <td className="py-3 px-4">
                        <p className="text-xs text-slate-800 font-medium">
                          {s.department?.name || 'General Support'}
                        </p>
                        <span className="text-[10px] text-teal-700 font-semibold bg-teal-50 px-1.5 py-0.5 rounded">
                          {s.shift || 'General'} Shift
                        </span>
                      </td>

                      <td className="py-3 px-4 text-xs text-slate-600">
                        {s.phone || 'N/A'}
                      </td>

                      <td className="py-3 px-4">
                        <Badge
                          variant={s.status === 'Active' ? 'success' : 'secondary'}
                          className="text-[11px]"
                        >
                          {s.status}
                        </Badge>
                      </td>

                      <td className="py-3 px-4 text-right">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDeleteStaff(s._id)}
                          className="text-xs text-rose-600 hover:bg-rose-50 p-2 border-rose-200"
                          title="Remove Staff"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </CardContent>
        </Card>

        {/* Add Staff Modal */}
        <Modal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          title="Onboard New Hospital Staff Member"
        >
          <form onSubmit={handleCreateStaff} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">First Name</label>
                <Input
                  value={newStaff.firstName}
                  onChange={(e) => setNewStaff({ ...newStaff, firstName: e.target.value })}
                  placeholder="e.g. Sarah"
                  required
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Last Name</label>
                <Input
                  value={newStaff.lastName}
                  onChange={(e) => setNewStaff({ ...newStaff, lastName: e.target.value })}
                  placeholder="e.g. Jenkins"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Email Address</label>
                <Input
                  type="email"
                  value={newStaff.email}
                  onChange={(e) => setNewStaff({ ...newStaff, email: e.target.value })}
                  placeholder="staff@hospital.com"
                  required
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Contact Phone</label>
                <Input
                  value={newStaff.phone}
                  onChange={(e) => setNewStaff({ ...newStaff, phone: e.target.value })}
                  placeholder="+1 555 0192"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Hospital Role</label>
                <Select
                  value={newStaff.role}
                  onChange={(e) => setNewStaff({ ...newStaff, role: e.target.value })}
                  options={[
                    { value: 'Nurse', label: 'Nurse' },
                    { value: 'Pharmacist', label: 'Pharmacist' },
                    { value: 'LabTechnician', label: 'Lab Technician' },
                    { value: 'Receptionist', label: 'Receptionist' },
                    { value: 'Accountant', label: 'Accountant' }
                  ]}
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Shift</label>
                <Select
                  value={newStaff.shift}
                  onChange={(e) => setNewStaff({ ...newStaff, shift: e.target.value })}
                  options={[
                    { value: 'Morning', label: 'Morning (07:00 - 15:00)' },
                    { value: 'Evening', label: 'Evening (15:00 - 23:00)' },
                    { value: 'Night', label: 'Night (23:00 - 07:00)' },
                    { value: 'Rotational', label: 'Rotational' }
                  ]}
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Department</label>
              <Select
                value={newStaff.departmentId}
                onChange={(e) => setNewStaff({ ...newStaff, departmentId: e.target.value })}
                options={[
                  { value: '', label: 'Select Assigned Department' },
                  ...departments.map((d) => ({ value: d._id, label: d.name }))
                ]}
              />
            </div>

            <div className="pt-4 flex justify-end gap-2 border-t border-slate-100">
              <Button type="button" variant="outline" onClick={() => setIsAddModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={submitting} className="bg-teal-600 hover:bg-teal-700">
                {submitting ? 'Creating Profile...' : 'Save Staff Member'}
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </DashboardLayout>
  );
}
