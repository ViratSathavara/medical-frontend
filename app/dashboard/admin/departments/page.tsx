'use client';

import React, { useEffect, useState } from 'react';
import { DashboardLayout } from '../../../../components/layout/DashboardLayout';
import { Card, CardHeader, CardContent } from '../../../../components/ui/Card';
import { Button } from '../../../../components/ui/Button';
import { Badge } from '../../../../components/ui/Badge';
import { Input } from '../../../../components/ui/Input';
import { Modal } from '../../../../components/ui/Modal';
import { Skeleton } from '../../../../components/ui/Skeleton';
import { EmptyState } from '../../../../components/ui/EmptyState';
import api from '../../../../services/api';
import {
  Building,
  Plus,
  Search,
  CheckCircle2,
  AlertCircle,
  Edit2,
  Trash2,
  MapPin,
  Phone,
  Mail,
  Users
} from 'lucide-react';

export default function AdminDepartmentsPage() {
  const [departments, setDepartments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Add / Edit Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [deptForm, setDeptForm] = useState({
    name: '',
    code: '',
    description: '',
    floor: '',
    phone: '',
    email: '',
    headDoctorName: ''
  });

  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    setLoading(true);
    try {
      const res = await api.get('/departments');
      setDepartments(res.data.data || []);
    } catch (err) {
      console.error('Failed to load departments:', err);
    } finally {
      setLoading(false);
    }
  };

  const openAddModal = () => {
    setEditingId(null);
    setDeptForm({
      name: '',
      code: '',
      description: '',
      floor: 'Floor 2, Wing A',
      phone: '+1 555-0100',
      email: 'clinic@hospital.com',
      headDoctorName: ''
    });
    setIsModalOpen(true);
  };

  const openEditModal = (dept: any) => {
    setEditingId(dept._id);
    setDeptForm({
      name: dept.name,
      code: dept.code,
      description: dept.description || '',
      floor: dept.floor || '',
      phone: dept.phone || '',
      email: dept.email || '',
      headDoctorName: dept.headOfDepartment?.name || ''
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editingId) {
        await api.put(`/departments/${editingId}`, deptForm);
        setMessage({ type: 'success', text: 'Department updated successfully.' });
      } else {
        await api.post('/departments', deptForm);
        setMessage({ type: 'success', text: 'New clinical department created!' });
      }
      setIsModalOpen(false);
      setTimeout(() => setMessage(null), 3000);
      fetchDepartments();
    } catch (err: any) {
      setMessage({
        type: 'error',
        text: err.response?.data?.message || 'Failed to save department.'
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (deptId: string) => {
    if (!confirm('Are you sure you want to deactivate or remove this department?')) return;
    try {
      await api.delete(`/departments/${deptId}`);
      setMessage({ type: 'success', text: 'Department successfully removed.' });
      setTimeout(() => setMessage(null), 3000);
      fetchDepartments();
    } catch (err: any) {
      setMessage({
        type: 'error',
        text: err.response?.data?.message || 'Failed to delete department.'
      });
    }
  };

  const filteredDepts = departments.filter((d) => {
    const q = search.toLowerCase();
    return (
      (d.name || '').toLowerCase().includes(q) ||
      (d.code || '').toLowerCase().includes(q) ||
      (d.description || '').toLowerCase().includes(q)
    );
  });

  return (
    <DashboardLayout allowedRoles={['ADMIN']}>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Clinical Departments & Specialties</h1>
            <p className="text-sm text-slate-500 mt-1">
              Manage hospital divisions, consultation clinics, floor allocations & clinical leadership
            </p>
          </div>

          <Button
            onClick={openAddModal}
            className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700"
          >
            <Plus className="w-4 h-4" /> Add Department
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

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search departments by name or code (e.g. CARD, NEUR)..."
            className="pl-9 bg-white"
          />
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Skeleton key={i} className="h-56 rounded-xl" />
            ))}
          </div>
        ) : filteredDepts.length === 0 ? (
          <EmptyState
            icon={Building}
            title="No Departments Found"
            description="No clinical departments matched your search query."
            actionLabel="Add Department"
            onAction={openAddModal}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDepts.map((d) => (
              <Card key={d._id} className="hover:shadow-md transition-shadow">
                <CardHeader className="border-b border-slate-100 pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 font-bold text-sm flex items-center justify-center border border-teal-200">
                        {d.code?.slice(0, 3) || 'DEP'}
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900 text-base">{d.name}</h3>
                        <span className="text-[11px] font-mono text-slate-400 font-bold">{d.code}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => openEditModal(d)}
                        className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                        title="Edit Department"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(d._id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                        title="Delete Department"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="p-5 space-y-4">
                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                    {d.description || 'Specialized clinical care and patient consultation services.'}
                  </p>

                  <div className="pt-2 border-t border-slate-100 space-y-2 text-xs text-slate-500">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{d.floor || 'Floor 1, Main Pavilion'}</span>
                    </div>
                    {d.phone && (
                      <div className="flex items-center gap-2">
                        <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{d.phone}</span>
                      </div>
                    )}
                    {d.email && (
                      <div className="flex items-center gap-2">
                        <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">{d.email}</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Create / Edit Department Modal */}
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={editingId ? 'Edit Clinical Department' : 'Create Clinical Department'}
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Department Name
                </label>
                <Input
                  value={deptForm.name}
                  onChange={(e) => setDeptForm({ ...deptForm, name: e.target.value })}
                  placeholder="e.g. Cardiology"
                  required
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Department Code
                </label>
                <Input
                  value={deptForm.code}
                  onChange={(e) => setDeptForm({ ...deptForm, code: e.target.value.toUpperCase() })}
                  placeholder="e.g. CARD"
                  required
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Description</label>
              <Input
                value={deptForm.description}
                onChange={(e) => setDeptForm({ ...deptForm, description: e.target.value })}
                placeholder="Comprehensive cardiovascular care & surgery"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Location / Floor</label>
                <Input
                  value={deptForm.floor}
                  onChange={(e) => setDeptForm({ ...deptForm, floor: e.target.value })}
                  placeholder="Building B, 3rd Floor"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Direct Phone</label>
                <Input
                  value={deptForm.phone}
                  onChange={(e) => setDeptForm({ ...deptForm, phone: e.target.value })}
                  placeholder="+1 555-0145"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Clinic Contact Email</label>
              <Input
                type="email"
                value={deptForm.email}
                onChange={(e) => setDeptForm({ ...deptForm, email: e.target.value })}
                placeholder="cardiology@hospital.com"
              />
            </div>

            <div className="pt-4 flex justify-end gap-2 border-t border-slate-100">
              <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={submitting} className="bg-teal-600 hover:bg-teal-700">
                {submitting ? 'Saving...' : editingId ? 'Update Department' : 'Create Department'}
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </DashboardLayout>
  );
}
