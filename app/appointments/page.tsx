'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { Navbar } from '../../components/layout/Navbar';
import { Footer } from '../../components/layout/Footer';
import { Card, CardHeader, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Textarea } from '../../components/ui/Textarea';
import { Badge } from '../../components/ui/Badge';
import api from '../../services/api';
import { Doctor, Department } from '../../types';
import { Calendar, Clock, Stethoscope, CheckCircle2, AlertCircle, ArrowRight } from 'lucide-react';

function AppointmentsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedDoctorId = searchParams.get('doctorId') || '';

  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);

  const [departments, setDepartments] = useState<Department[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [selectedDeptId, setSelectedDeptId] = useState('');
  const [selectedDoctorId, setSelectedDoctorId] = useState(preselectedDoctorId);
  const [selectedDate, setSelectedDate] = useState(() => {
    const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000);
    return tomorrow.toISOString().split('T')[0];
  });
  const [selectedTimeSlot, setSelectedTimeSlot] = useState('');
  const [availableSlots, setAvailableSlots] = useState<{ time: string; isAvailable: boolean }[]>([]);
  const [appointmentType, setAppointmentType] = useState('In-person');
  const [reason, setReason] = useState('');
  const [symptoms, setSymptoms] = useState('');

  const [loadingSlots, setLoadingSlots] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [bookingSuccess, setBookingSuccess] = useState<any>(null);

  // Fetch departments & doctors
  useEffect(() => {
    api.get('/departments').then((res) => setDepartments(res.data.data || []));
    api.get('/doctors?limit=50').then((res) => {
      const allDoctors: Doctor[] = res.data.data || [];
      setDoctors(allDoctors);

      if (preselectedDoctorId) {
        const found = allDoctors.find((d) => d._id === preselectedDoctorId);
        if (found && found.department) {
          setSelectedDeptId((found.department as any)._id || (found.department as any));
        }
      }
    });
  }, [preselectedDoctorId]);

  // Filter doctors when department changes
  const filteredDoctors = selectedDeptId
    ? doctors.filter((d) => (d.department as any)?._id === selectedDeptId || (d.department as any) === selectedDeptId)
    : doctors;

  // Fetch available slots when doctor or date changes
  useEffect(() => {
    if (!selectedDoctorId || !selectedDate) {
      setAvailableSlots([]);
      return;
    }

    setLoadingSlots(true);
    setErrorMsg('');
    api.get(`/appointments/doctor-slots/${selectedDoctorId}?date=${selectedDate}`)
      .then((res) => {
        setAvailableSlots(res.data.data?.slots || []);
        if (res.data.data?.slots?.length > 0) {
          const firstFree = res.data.data.slots.find((s: any) => s.isAvailable);
          if (firstFree) setSelectedTimeSlot(firstFree.time);
        }
      })
      .catch((err) => {
        console.error(err);
        setAvailableSlots([]);
      })
      .finally(() => setLoadingSlots(false));
  }, [selectedDoctorId, selectedDate]);

  const handleBook = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!isAuthenticated) {
      router.push(`/login?redirect=/appointments?doctorId=${selectedDoctorId}`);
      return;
    }

    if (!selectedDoctorId) {
      setErrorMsg('Please select a doctor.');
      return;
    }

    if (!selectedTimeSlot) {
      setErrorMsg('Please select an available time slot.');
      return;
    }

    if (!reason.trim()) {
      setErrorMsg('Please provide a reason for the consultation.');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        doctorId: selectedDoctorId,
        departmentId: selectedDeptId || (filteredDoctors[0]?.department as any)?._id || (filteredDoctors[0]?.department as any),
        appointmentDate: selectedDate,
        appointmentTime: selectedTimeSlot,
        type: appointmentType,
        reason,
        symptoms: symptoms ? symptoms.split(',').map((s) => s.trim()) : []
      };

      const res = await api.post('/appointments', payload);
      setBookingSuccess(res.data.data);
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Failed to book appointment. Please try another slot.');
    } finally {
      setSubmitting(false);
    }
  };

  const selectedDoctorObj = doctors.find((d) => d._id === selectedDoctorId);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />

      <div className="bg-slate-900 text-white py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-3">
          <span className="text-xs font-bold uppercase tracking-widest text-primary-400">Online Scheduling</span>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight">Schedule Your Doctor Appointment</h1>
          <p className="max-w-2xl mx-auto text-sm text-slate-300">
            Real-time appointment slot generation with instant double-booking prevention.
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex-1 w-full">
        {bookingSuccess ? (
          <Card className="text-center p-8 sm:p-12 space-y-6">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-md">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-slate-900">Appointment Confirmed!</h2>
              <p className="text-sm text-slate-500 max-w-md mx-auto">
                Your consultation has been reserved. A confirmation email and in-app notification have been sent.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-left max-w-md mx-auto space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-500">Appointment ID:</span>
                <span className="font-bold text-slate-900">{bookingSuccess.appointmentNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Date:</span>
                <span className="font-semibold text-slate-800">{new Date(bookingSuccess.appointmentDate).toDateString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Time:</span>
                <span className="font-semibold text-slate-800">{bookingSuccess.appointmentTime}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Consultation Fee:</span>
                <span className="font-bold text-primary-600">${bookingSuccess.consultationFee}</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Link href="/dashboard/patient/appointments">
                <Button size="md" variant="primary" rightIcon={<ArrowRight className="w-4 h-4" />}>
                  View in Patient Portal
                </Button>
              </Link>
              <Button size="md" variant="outline" onClick={() => setBookingSuccess(null)}>
                Book Another Appointment
              </Button>
            </div>
          </Card>
        ) : (
          <Card>
            <CardHeader
              title="Appointment Booking Details"
              subtitle="Fill in patient requirements to generate verified consultation slot"
            />
            <CardContent>
              <form onSubmit={handleBook} className="space-y-6">
                {errorMsg && (
                  <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-center gap-3">
                    <AlertCircle className="w-5 h-5 shrink-0 text-rose-500" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Department */}
                  <Select
                    label="1. Medical Speciality / Department"
                    value={selectedDeptId}
                    onChange={(e) => {
                      setSelectedDeptId(e.target.value);
                      setSelectedDoctorId('');
                    }}
                    options={[
                      { label: 'Select Department...', value: '' },
                      ...departments.map((d) => ({ label: d.name, value: d._id }))
                    ]}
                  />

                  {/* Doctor */}
                  <Select
                    label="2. Attending Specialist / Doctor"
                    value={selectedDoctorId}
                    onChange={(e) => setSelectedDoctorId(e.target.value)}
                    options={[
                      { label: 'Select Doctor...', value: '' },
                      ...filteredDoctors.map((doc) => ({
                        label: `Dr. ${doc.firstName} ${doc.lastName} (${doc.specialization}) - $${doc.consultationFee}`,
                        value: doc._id
                      }))
                    ]}
                  />
                </div>

                {selectedDoctorObj && (
                  <div className="p-4 rounded-2xl bg-sky-50 border border-sky-100 flex items-center justify-between text-xs">
                    <div>
                      <p className="font-bold text-sky-950">Dr. {selectedDoctorObj.firstName} {selectedDoctorObj.lastName}</p>
                      <p className="text-sky-700 mt-0.5">{selectedDoctorObj.specialization} &bull; Room: {selectedDoctorObj.roomNumber || 'Consultation Suite'}</p>
                    </div>
                    <Badge variant="primary" size="md">${selectedDoctorObj.consultationFee} Fee</Badge>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Date */}
                  <Input
                    label="3. Preferred Date"
                    type="date"
                    min={new Date().toISOString().split('T')[0]}
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                  />

                  {/* Consultation Type */}
                  <Select
                    label="4. Consultation Type"
                    value={appointmentType}
                    onChange={(e) => setAppointmentType(e.target.value)}
                    options={[
                      { label: 'In-person Clinic Visit', value: 'In-person' },
                      { label: 'Online Tele-Consultation', value: 'Online consultation' },
                      { label: 'Follow-up Consultation', value: 'Follow-up' },
                      { label: 'Emergency Priority Walk-In', value: 'Emergency' }
                    ]}
                  />
                </div>

                {/* Slot Selector */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                    5. Select Available Time Slot
                  </label>
                  {loadingSlots ? (
                    <div className="text-xs text-slate-400 py-4 flex items-center gap-2">
                      <Clock className="w-4 h-4 animate-spin text-primary-600" />
                      Checking real-time doctor availability...
                    </div>
                  ) : availableSlots.length === 0 ? (
                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-500">
                      No open slots on this date. Doctor may not practice on this day. Please pick another date.
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
                      {availableSlots.map((slot) => (
                        <button
                          key={slot.time}
                          type="button"
                          disabled={!slot.isAvailable}
                          onClick={() => setSelectedTimeSlot(slot.time)}
                          className={`p-2.5 rounded-xl text-xs font-semibold border transition-all text-center ${
                            !slot.isAvailable
                              ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed line-through'
                              : selectedTimeSlot === slot.time
                              ? 'bg-primary-600 text-white border-primary-600 shadow-sm'
                              : 'bg-white text-slate-700 border-slate-200 hover:border-primary-400'
                          }`}
                        >
                          {slot.time}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Reason & Symptoms */}
                <div className="space-y-4">
                  <Input
                    label="Reason for Visit / Chief Complaint"
                    placeholder="e.g. Routine blood pressure review, chest discomfort, joint pain..."
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    required
                  />

                  <Textarea
                    label="Symptoms Experienced (Optional - comma separated)"
                    placeholder="e.g. Shortness of breath, headache, fever..."
                    value={symptoms}
                    onChange={(e) => setSymptoms(e.target.value)}
                    rows={2}
                  />
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                  <p className="text-xs text-slate-500">
                    {isAuthenticated ? `Booking as ${user?.email}` : 'You will be prompted to sign in to confirm.'}
                  </p>
                  <Button type="submit" size="md" variant="primary" isLoading={submitting}>
                    {isAuthenticated ? 'Confirm Appointment' : 'Sign In & Book'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}
      </div>

      <Footer />
    </div>
  );
}

export default function AppointmentsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50 flex items-center justify-center">Loading...</div>}>
      <AppointmentsContent />
    </Suspense>
  );
}
