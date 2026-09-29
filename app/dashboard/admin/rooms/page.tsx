'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
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
  BedDouble,
  Plus,
  Search,
  Filter,
  Layers,
  CheckCircle2,
  AlertCircle,
  Wrench,
  User,
  ArrowRight
} from 'lucide-react';

export default function AdminRoomsPage() {
  const [rooms, setRooms] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Add Room Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [submittingRoom, setSubmittingRoom] = useState(false);
  const [roomForm, setRoomForm] = useState({
    roomNumber: '',
    floor: 'Floor 3',
    roomType: 'General',
    totalBeds: 2,
    dailyRate: 150,
    departmentId: '',
    description: 'Clean medical inpatient ward with monitoring telemetry'
  });

  useEffect(() => {
    fetchRooms();
    fetchDepartments();
  }, []);

  const fetchRooms = async () => {
    setLoading(true);
    try {
      const res = await api.get('/facilities/rooms');
      setRooms(res.data.data || []);
    } catch (err) {
      console.error('Failed to load rooms:', err);
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

  const handleCreateRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingRoom(true);
    try {
      await api.post('/facilities/rooms', roomForm);
      setMessage({
        type: 'success',
        text: `Room ${roomForm.roomNumber} created with ${roomForm.totalBeds} auto-generated beds!`
      });
      setIsAddModalOpen(false);
      setTimeout(() => setMessage(null), 3000);
      fetchRooms();
    } catch (err: any) {
      setMessage({
        type: 'error',
        text: err.response?.data?.message || 'Failed to create room.'
      });
    } finally {
      setSubmittingRoom(false);
    }
  };

  const handleToggleBedMaintenance = async (bedId: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'Maintenance' ? 'Available' : 'Maintenance';
    try {
      await api.patch(`/facilities/beds/${bedId}/status`, { status: nextStatus });
      setMessage({ type: 'success', text: `Bed status changed to ${nextStatus}.` });
      setTimeout(() => setMessage(null), 3000);
      fetchRooms();
    } catch (err: any) {
      setMessage({
        type: 'error',
        text: err.response?.data?.message || 'Failed to update bed status.'
      });
    }
  };

  // Metrics calculation
  let totalBedsCount = 0;
  let totalAvailableCount = 0;
  let totalOccupiedCount = 0;

  rooms.forEach((r) => {
    totalBedsCount += r.beds?.length || 0;
    totalAvailableCount += r.availableBeds || 0;
    totalOccupiedCount += r.occupiedBeds || 0;
  });

  const filteredRooms = rooms.filter((r) => {
    const q = search.toLowerCase();
    const num = (r.roomNumber || '').toLowerCase();
    const floor = (r.floor || '').toLowerCase();
    const dept = (r.department?.name || '').toLowerCase();
    const matchesSearch = num.includes(q) || floor.includes(q) || dept.includes(q);
    const matchesType = typeFilter === 'All' || r.roomType === typeFilter;
    return matchesSearch && matchesType;
  });

  return (
    <DashboardLayout allowedRoles={['ADMIN']}>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Rooms & Bed Allocation</h1>
            <p className="text-sm text-slate-500 mt-1">
              Real-time inpatient facility occupancy, ward assignments & bed maintenance status
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link href="/dashboard/admin/inpatient">
              <Button variant="outline" className="flex items-center gap-1.5">
                Inpatient Admissions <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
            <Button
              onClick={() => setIsAddModalOpen(true)}
              className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700"
            >
              <Plus className="w-4 h-4" /> Add Room & Beds
            </Button>
          </div>
        </div>

        {/* 4 Summary Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
              Total Inpatient Beds
            </span>
            <p className="text-2xl font-bold text-slate-900 mt-1">{totalBedsCount}</p>
          </div>

          <div className="p-4 rounded-xl bg-white border border-emerald-200/80 bg-emerald-50/20 shadow-xs">
            <span className="text-xs font-semibold text-emerald-700 uppercase tracking-wider block">
              Available For Admission
            </span>
            <p className="text-2xl font-bold text-emerald-800 mt-1">{totalAvailableCount}</p>
          </div>

          <div className="p-4 rounded-xl bg-white border border-rose-200/80 bg-rose-50/20 shadow-xs">
            <span className="text-xs font-semibold text-rose-700 uppercase tracking-wider block">
              Currently Occupied
            </span>
            <p className="text-2xl font-bold text-rose-800 mt-1">{totalOccupiedCount}</p>
          </div>

          <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
              Occupancy Rate
            </span>
            <p className="text-2xl font-bold text-slate-900 mt-1">
              {totalBedsCount > 0 ? Math.round((totalOccupiedCount / totalBedsCount) * 100) : 0}%
            </p>
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
              placeholder="Search by room number, floor, department..."
              className="pl-9 bg-white"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Filter className="w-4 h-4 text-slate-400" />
            <Select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              options={[
                { value: 'All', label: 'All Room Types' },
                { value: 'ICU', label: 'Intensive Care Unit (ICU)' },
                { value: 'General', label: 'General Ward' },
                { value: 'Private', label: 'Private Room' },
                { value: 'Semi-Private', label: 'Semi-Private Room' },
                { value: 'OT', label: 'Operation Theater' },
                { value: 'Emergency', label: 'Emergency Room' }
              ]}
              className="w-52 bg-white"
            />
          </div>
        </div>

        {/* Rooms Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Skeleton key={i} className="h-64 rounded-xl" />
            ))}
          </div>
        ) : filteredRooms.length === 0 ? (
          <EmptyState
            icon={BedDouble}
            title="No Rooms Found"
            description="No hospital rooms match your search or filter criteria."
            actionLabel="Add Room"
            onAction={() => setIsAddModalOpen(true)}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRooms.map((room) => (
              <Card key={room._id} className="hover:shadow-md transition-shadow">
                <CardHeader className="border-b border-slate-100 pb-3 flex flex-row items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-slate-900 text-base">Room {room.roomNumber}</h3>
                      <Badge variant="outline" className="text-xs">
                        {room.roomType}
                      </Badge>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {room.floor} • {room.department?.name || 'General Clinic'}
                    </p>
                  </div>
                  <span className="font-mono text-xs font-bold text-slate-700 bg-slate-100 px-2 py-1 rounded">
                    ${room.dailyRate}/day
                  </span>
                </CardHeader>

                <CardContent className="p-4 space-y-3">
                  <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
                    <span>Assigned Beds ({room.beds?.length || 0})</span>
                    <span className="text-teal-700 font-bold">
                      {room.availableBeds} Available
                    </span>
                  </div>

                  <div className="space-y-2">
                    {(room.beds || []).map((bed: any) => {
                      const isOccupied = bed.status === 'Occupied';
                      const isMaintenance = bed.status === 'Maintenance';

                      return (
                        <div
                          key={bed._id}
                          className={`p-2.5 rounded-lg border text-xs flex items-center justify-between transition-colors ${
                            isOccupied
                              ? 'bg-rose-50/60 border-rose-200'
                              : isMaintenance
                              ? 'bg-slate-100/70 border-slate-200'
                              : 'bg-emerald-50/50 border-emerald-200'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-slate-800">
                              Bed {bed.bedNumber}
                            </span>
                            {isOccupied && bed.currentPatient && (
                              <span className="text-[11px] text-rose-800 font-medium flex items-center gap-1">
                                <User className="w-3 h-3" />
                                {bed.currentPatient.firstName} {bed.currentPatient.lastName} (
                                {bed.currentPatient.patientId})
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-1.5">
                            <Badge
                              variant={isOccupied ? 'danger' : isMaintenance ? 'secondary' : 'success'}
                              className="text-[10px] py-0 px-1.5"
                            >
                              {bed.status}
                            </Badge>

                            {!isOccupied && (
                              <button
                                type="button"
                                onClick={() => handleToggleBedMaintenance(bed._id, bed.status)}
                                className="p-1 text-slate-400 hover:text-slate-700 rounded transition-colors"
                                title={isMaintenance ? 'Mark Available' : 'Mark for Maintenance'}
                              >
                                <Wrench className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Add Room Modal */}
        <Modal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          title="Add New Hospital Room & Beds"
        >
          <form onSubmit={handleCreateRoom} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Room Number</label>
                <Input
                  value={roomForm.roomNumber}
                  onChange={(e) => setRoomForm({ ...roomForm, roomNumber: e.target.value })}
                  placeholder="e.g. 402"
                  required
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Floor / Wing</label>
                <Input
                  value={roomForm.floor}
                  onChange={(e) => setRoomForm({ ...roomForm, floor: e.target.value })}
                  placeholder="Floor 4, Wing B"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Room Type</label>
                <Select
                  value={roomForm.roomType}
                  onChange={(e) => setRoomForm({ ...roomForm, roomType: e.target.value })}
                  options={[
                    { value: 'General', label: 'General Ward' },
                    { value: 'ICU', label: 'Intensive Care Unit (ICU)' },
                    { value: 'Private', label: 'Private Room' },
                    { value: 'Semi-Private', label: 'Semi-Private' },
                    { value: 'OT', label: 'Operation Theater' },
                    { value: 'Emergency', label: 'Emergency Trauma' }
                  ]}
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Department</label>
                <Select
                  value={roomForm.departmentId}
                  onChange={(e) => setRoomForm({ ...roomForm, departmentId: e.target.value })}
                  options={[
                    { value: '', label: 'Select Department' },
                    ...departments.map((d) => ({ value: d._id, label: d.name }))
                  ]}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Bed Capacity (Auto-creates)
                </label>
                <Input
                  type="number"
                  min={1}
                  max={12}
                  value={roomForm.totalBeds}
                  onChange={(e) =>
                    setRoomForm({ ...roomForm, totalBeds: parseInt(e.target.value, 10) || 1 })
                  }
                  required
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Daily Rate ($ USD)
                </label>
                <Input
                  type="number"
                  min={0}
                  value={roomForm.dailyRate}
                  onChange={(e) =>
                    setRoomForm({ ...roomForm, dailyRate: parseFloat(e.target.value) || 0 })
                  }
                  required
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Description</label>
              <Input
                value={roomForm.description}
                onChange={(e) => setRoomForm({ ...roomForm, description: e.target.value })}
                placeholder="Inpatient room notes or equipment"
              />
            </div>

            <div className="pt-4 flex justify-end gap-2 border-t border-slate-100">
              <Button type="button" variant="outline" onClick={() => setIsAddModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={submittingRoom} className="bg-teal-600 hover:bg-teal-700">
                {submittingRoom ? 'Generating Room...' : 'Create Room & Auto-Beds'}
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </DashboardLayout>
  );
}
