'use client';

import React, { useEffect, useState } from 'react';
import { DashboardLayout } from '../../../../components/layout/DashboardLayout';
import { Card, CardHeader, CardContent } from '../../../../components/ui/Card';
import { Button } from '../../../../components/ui/Button';
import { Badge } from '../../../../components/ui/Badge';
import { Input } from '../../../../components/ui/Input';
import { Skeleton } from '../../../../components/ui/Skeleton';
import api from '../../../../services/api';
import { Calendar, Clock, DollarSign, Plus, Trash2, CheckCircle2, AlertCircle, Save, Sparkles } from 'lucide-react';

const ALL_DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export default function DoctorSchedulePage() {
  const [doctor, setDoctor] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [availableDays, setAvailableDays] = useState<string[]>([]);
  const [timeSlots, setTimeSlots] = useState<{ startTime: string; endTime: string; maxPatients: number }[]>([]);
  const [consultationFee, setConsultationFee] = useState<number>(100);
  const [roomNumber, setRoomNumber] = useState<string>('');

  useEffect(() => {
    fetchDoctorProfile();
  }, []);

  const fetchDoctorProfile = async () => {
    setLoading(true);
    try {
      const res = await api.get('/doctors/me');
      const doc = res.data.data;
      if (doc) {
        setDoctor(doc);
        setAvailableDays(doc.availableDays || ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']);
        setTimeSlots(
          doc.availableTimeSlots && doc.availableTimeSlots.length > 0
            ? doc.availableTimeSlots
            : [
                { startTime: '09:00', endTime: '09:30', maxPatients: 1 },
                { startTime: '09:30', endTime: '10:00', maxPatients: 1 },
                { startTime: '10:00', endTime: '10:30', maxPatients: 1 },
                { startTime: '10:30', endTime: '11:00', maxPatients: 1 },
                { startTime: '14:00', endTime: '14:30', maxPatients: 1 },
                { startTime: '14:30', endTime: '15:00', maxPatients: 1 }
              ]
        );
        setConsultationFee(doc.consultationFee || 100);
        setRoomNumber(doc.roomNumber || 'Room 301');
      }
    } catch (err) {
      console.error('Failed to load doctor schedule:', err);
    } finally {
      setLoading(false);
    }
  };

  const toggleDay = (day: string) => {
    if (availableDays.includes(day)) {
      setAvailableDays(availableDays.filter((d) => d !== day));
    } else {
      setAvailableDays([...availableDays, day]);
    }
  };

  const addTimeSlot = () => {
    setTimeSlots([...timeSlots, { startTime: '09:00', endTime: '09:30', maxPatients: 1 }]);
  };

  const removeTimeSlot = (index: number) => {
    setTimeSlots(timeSlots.filter((_, idx) => idx !== index));
  };

  const updateTimeSlot = (index: number, field: string, value: any) => {
    const updated = [...timeSlots];
    updated[index] = { ...updated[index], [field]: value };
    setTimeSlots(updated);
  };

  const applyPresetSlots = (session: 'morning' | 'afternoon' | 'fullDay') => {
    let newSlots = [];
    if (session === 'morning' || session === 'fullDay') {
      newSlots.push(
        { startTime: '09:00', endTime: '09:30', maxPatients: 1 },
        { startTime: '09:30', endTime: '10:00', maxPatients: 1 },
        { startTime: '10:00', endTime: '10:30', maxPatients: 1 },
        { startTime: '10:30', endTime: '11:00', maxPatients: 1 },
        { startTime: '11:00', endTime: '11:30', maxPatients: 1 },
        { startTime: '11:30', endTime: '12:00', maxPatients: 1 }
      );
    }
    if (session === 'afternoon' || session === 'fullDay') {
      newSlots.push(
        { startTime: '14:00', endTime: '14:30', maxPatients: 1 },
        { startTime: '14:30', endTime: '15:00', maxPatients: 1 },
        { startTime: '15:00', endTime: '15:30', maxPatients: 1 },
        { startTime: '15:30', endTime: '16:00', maxPatients: 1 },
        { startTime: '16:00', endTime: '16:30', maxPatients: 1 },
        { startTime: '16:30', endTime: '17:00', maxPatients: 1 }
      );
    }
    setTimeSlots(newSlots);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!doctor?._id) return;

    if (availableDays.length === 0) {
      setMessage({ type: 'error', text: 'Please select at least one practicing clinic day.' });
      return;
    }

    if (timeSlots.length === 0) {
      setMessage({ type: 'error', text: 'Please configure at least one time slot for consultations.' });
      return;
    }

    setSaving(true);
    setMessage(null);

    try {
      await api.put(`/doctors/${doctor._id}`, {
        availableDays,
        availableTimeSlots: timeSlots,
        consultationFee,
        roomNumber
      });
      setMessage({ type: 'success', text: 'Schedule & clinic consultation settings updated successfully!' });
      setTimeout(() => setMessage(null), 4000);
    } catch (err: any) {
      console.error(err);
      setMessage({
        type: 'error',
        text: err.response?.data?.message || 'Failed to update schedule. Please try again.'
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <DashboardLayout allowedRoles={['DOCTOR']}>
      <div className="space-y-6 max-w-5xl">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Practice Schedule & Availability</h1>
            <p className="text-sm text-slate-500 mt-1">
              Configure clinic operating days, time slot durations, and consultation room fees
            </p>
          </div>
          <Button
            onClick={handleSave}
            disabled={saving || loading}
            className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700"
          >
            <Save className="w-4 h-4" /> {saving ? 'Saving Changes...' : 'Save Schedule Settings'}
          </Button>
        </div>

        {message && (
          <div
            className={`p-4 rounded-xl flex items-center gap-3 border ${
              message.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                : 'bg-rose-50 text-rose-800 border-rose-200'
            }`}
          >
            {message.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
            )}
            <p className="text-sm font-medium">{message.text}</p>
          </div>
        )}

        {loading ? (
          <div className="space-y-4">
            <Skeleton className="h-44 w-full rounded-xl" />
            <Skeleton className="h-80 w-full rounded-xl" />
          </div>
        ) : (
          <form onSubmit={handleSave} className="space-y-6">
            {/* Days of Week Selection */}
            <Card>
              <CardHeader className="border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-teal-600" />
                  <h3 className="font-bold text-slate-900">Clinic Working Days</h3>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Patients will only be able to book consultations on days checked below
                </p>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-3">
                  {ALL_DAYS.map((day) => {
                    const isChecked = availableDays.includes(day);
                    return (
                      <button
                        type="button"
                        key={day}
                        onClick={() => toggleDay(day)}
                        className={`p-3.5 rounded-xl border text-center font-medium text-xs sm:text-sm transition-all flex flex-col items-center justify-center gap-1.5 ${
                          isChecked
                            ? 'bg-teal-600 text-white border-teal-600 shadow-sm font-semibold'
                            : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                        }`}
                      >
                        <span>{day.slice(0, 3)}</span>
                        <span className="text-[11px] opacity-80">{isChecked ? 'Active' : 'Off'}</span>
                      </button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Room & Fee Settings */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader className="border-b border-slate-100 pb-3">
                  <h3 className="font-bold text-slate-900 text-sm">Consultation Fee ($ USD)</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Applied to outpatient bookings & invoices</p>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="relative">
                    <DollarSign className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <Input
                      type="number"
                      min={0}
                      value={consultationFee}
                      onChange={(e) => setConsultationFee(parseFloat(e.target.value) || 0)}
                      className="pl-9 font-semibold"
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="border-b border-slate-100 pb-3">
                  <h3 className="font-bold text-slate-900 text-sm">Designated Clinic Room</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Room number shown on patient appointment slips</p>
                </CardHeader>
                <CardContent className="p-6">
                  <Input
                    type="text"
                    value={roomNumber}
                    onChange={(e) => setRoomNumber(e.target.value)}
                    placeholder="e.g. Clinic Room 304, 3rd Floor"
                  />
                </CardContent>
              </Card>
            </div>

            {/* Consultation Slots Config */}
            <Card>
              <CardHeader className="border-b border-slate-100 pb-3">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-teal-600" />
                    <div>
                      <h3 className="font-bold text-slate-900">Consultation Time Slots</h3>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Defines appointment times available for patients on your active clinic days
                      </p>
                    </div>
                  </div>

                  {/* Preset Buttons */}
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => applyPresetSlots('morning')}
                      className="text-xs px-2.5 py-1 rounded bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors font-medium flex items-center gap-1"
                    >
                      <Sparkles className="w-3 h-3 text-teal-600" /> Morning Preset (9-12)
                    </button>
                    <button
                      type="button"
                      onClick={() => applyPresetSlots('afternoon')}
                      className="text-xs px-2.5 py-1 rounded bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors font-medium flex items-center gap-1"
                    >
                      <Sparkles className="w-3 h-3 text-teal-600" /> Afternoon Preset (2-5)
                    </button>
                    <button
                      type="button"
                      onClick={() => applyPresetSlots('fullDay')}
                      className="text-xs px-2.5 py-1 rounded bg-teal-50 text-teal-700 hover:bg-teal-100 transition-colors font-medium flex items-center gap-1"
                    >
                      <Sparkles className="w-3 h-3 text-teal-600" /> Full Day Preset
                    </button>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="p-6 space-y-4">
                <div className="space-y-3">
                  {timeSlots.map((slot, index) => (
                    <div
                      key={index}
                      className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
                    >
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-teal-100 text-teal-800 text-xs font-bold flex items-center justify-center shrink-0">
                          {index + 1}
                        </span>
                        <div className="flex items-center gap-2">
                          <Input
                            type="time"
                            value={slot.startTime}
                            onChange={(e) => updateTimeSlot(index, 'startTime', e.target.value)}
                            className="w-32 bg-white"
                          />
                          <span className="text-slate-400 font-medium text-xs">to</span>
                          <Input
                            type="time"
                            value={slot.endTime}
                            onChange={(e) => updateTimeSlot(index, 'endTime', e.target.value)}
                            className="w-32 bg-white"
                          />
                        </div>
                      </div>

                      <div className="flex items-center justify-between sm:justify-end gap-4">
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-slate-500 font-medium">Max Patients:</span>
                          <Input
                            type="number"
                            min={1}
                            max={10}
                            value={slot.maxPatients}
                            onChange={(e) =>
                              updateTimeSlot(index, 'maxPatients', parseInt(e.target.value, 10) || 1)
                            }
                            className="w-16 bg-white text-center"
                          />
                        </div>

                        <button
                          type="button"
                          onClick={() => removeTimeSlot(index)}
                          className="p-2 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors"
                          title="Remove slot"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={addTimeSlot}
                    className="flex items-center gap-2 border-dashed border-slate-300 hover:border-slate-400 w-full justify-center"
                  >
                    <Plus className="w-4 h-4" /> Add Custom Time Slot
                  </Button>
                </div>
              </CardContent>
            </Card>
          </form>
        )}
      </div>
    </DashboardLayout>
  );
}
