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
  BedDouble,
  Plus,
  Search,
  Download,
  LogOut,
  Calendar,
  User,
  Stethoscope,
  CheckCircle2,
  AlertCircle,
  FileText
} from 'lucide-react';

export default function AdminInpatientPage() {
  const [admissions, setAdmissions] = useState<any[]>([]);
  const [patients, setPatients] = useState<any[]>([]);
  const [doctors, setDoctors] = useState<any[]>([]);
  const [rooms, setRooms] = useState<any[]>([]);
  const [availableBeds, setAvailableBeds] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Admit Modal State
  const [isAdmitModalOpen, setIsAdmitModalOpen] = useState(false);
  const [submittingAdmit, setSubmittingAdmit] = useState(false);
  const [admitForm, setAdmitForm] = useState({
    patientId: '',
    doctorId: '',
    departmentId: '',
    roomId: '',
    bedId: '',
    admissionReason: 'Severe respiratory distress and observation',
    initialDiagnosis: 'Acute Bronchitis',
    notes: 'Admitted via Emergency Ward.'
  });

  // Discharge Modal State
  const [isDischargeModalOpen, setIsDischargeModalOpen] = useState(false);
  const [selectedAdmissionForDischarge, setSelectedAdmissionForDischarge] = useState<any | null>(null);
  const [submittingDischarge, setSubmittingDischarge] = useState(false);
  const [dischargeForm, setDischargeForm] = useState({
    finalDiagnosis: 'Resolved Acute Bronchitis',
    treatmentSummary: '5-day course of nebulization and supportive IV therapy.',
    dischargeInstructions: 'Rest for 7 days. Continue oral medications as prescribed.',
    prescribedMedicines: [
      { medicineName: 'Amoxicillin', dosage: '500mg', frequency: 'Three times daily', duration: '5 days' }
    ],
    followUpDate: '2026-10-10',
    doctorNotes: 'Patient vitals stable and oxygen saturation at 99%.'
  });

  useEffect(() => {
    fetchAdmissions();
    fetchSupportData();
  }, [statusFilter]);

  const fetchAdmissions = async () => {
    setLoading(true);
    try {
      const res = await api.get('/inpatient/admissions', {
        params: { status: statusFilter !== 'All' ? statusFilter : undefined }
      });
      setAdmissions(res.data.data || []);
    } catch (err) {
      console.error('Failed to load admissions:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchSupportData = async () => {
    try {
      const [patsRes, docsRes, roomsRes, bedsRes] = await Promise.all([
        api.get('/patients?limit=100'),
        api.get('/doctors?limit=50'),
        api.get('/facilities/rooms'),
        api.get('/facilities/beds?status=Available')
      ]);

      const pats = patsRes.data.data || [];
      const docs = docsRes.data.data || [];
      const rms = roomsRes.data.data || [];
      const bds = bedsRes.data.data || [];

      setPatients(pats);
      setDoctors(docs);
      setRooms(rms);
      setAvailableBeds(bds);

      if (pats.length > 0 && docs.length > 0 && bds.length > 0) {
        setAdmitForm((prev) => ({
          ...prev,
          patientId: pats[0]._id,
          doctorId: docs[0]._id,
          departmentId: docs[0].department?._id || docs[0].department || '',
          bedId: bds[0]._id,
          roomId: bds[0].room?._id || bds[0].room || ''
        }));
      }
    } catch (err) {
      console.error('Failed to load support data:', err);
    }
  };

  const handleBedSelection = (bedId: string) => {
    const selectedBed = availableBeds.find((b) => b._id === bedId);
    setAdmitForm((prev) => ({
      ...prev,
      bedId,
      roomId: selectedBed?.room?._id || selectedBed?.room || ''
    }));
  };

  const handleAdmitPatient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!admitForm.patientId || !admitForm.bedId || !admitForm.doctorId) {
      setMessage({ type: 'error', text: 'Patient, Doctor, and Bed are required for admission.' });
      return;
    }

    setSubmittingAdmit(true);
    try {
      await api.post('/inpatient/admit', admitForm);
      setMessage({ type: 'success', text: 'Patient successfully admitted into hospital bed!' });
      setIsAdmitModalOpen(false);
      setTimeout(() => setMessage(null), 3000);
      fetchAdmissions();
      fetchSupportData();
    } catch (err: any) {
      setMessage({
        type: 'error',
        text: err.response?.data?.message || 'Admission failed.'
      });
    } finally {
      setSubmittingAdmit(false);
    }
  };

  const openDischargeModal = (adm: any) => {
    setSelectedAdmissionForDischarge(adm);
    setDischargeForm({
      finalDiagnosis: adm.initialDiagnosis || 'Clinical Recovery',
      treatmentSummary: `Inpatient therapy under Dr. ${adm.doctor?.firstName} ${adm.doctor?.lastName}.`,
      dischargeInstructions: 'Maintain prescribed hydration and avoid strenuous exertion.',
      prescribedMedicines: [
        { medicineName: 'Paracetamol', dosage: '500mg', frequency: 'PRN', duration: '3 days' }
      ],
      followUpDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      doctorNotes: 'Discharged in stable clinical state.'
    });
    setIsDischargeModalOpen(true);
  };

  const handleDischargePatient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAdmissionForDischarge?._id) return;

    setSubmittingDischarge(true);
    try {
      await api.post(`/inpatient/admissions/${selectedAdmissionForDischarge._id}/discharge`, dischargeForm);
      setMessage({
        type: 'success',
        text: 'Patient successfully discharged! Discharge summary PDF published.'
      });
      setIsDischargeModalOpen(false);
      setTimeout(() => setMessage(null), 3000);
      fetchAdmissions();
      fetchSupportData();
    } catch (err: any) {
      setMessage({
        type: 'error',
        text: err.response?.data?.message || 'Discharge process failed.'
      });
    } finally {
      setSubmittingDischarge(false);
    }
  };

  const filtered = admissions.filter((adm) => {
    const q = search.toLowerCase();
    const admNum = (adm.admissionNumber || '').toLowerCase();
    const patName = `${adm.patient?.firstName || ''} ${adm.patient?.lastName || ''}`.toLowerCase();
    const pid = (adm.patient?.patientId || '').toLowerCase();
    return admNum.includes(q) || patName.includes(q) || pid.includes(q);
  });

  return (
    <DashboardLayout allowedRoles={['ADMIN']}>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Inpatient Admissions & Discharges</h1>
            <p className="text-sm text-slate-500 mt-1">
              Live ward telemetry, bed occupancies, attending clinical physicians & discharge summaries
            </p>
          </div>

          <Button
            onClick={() => setIsAdmitModalOpen(true)}
            className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700"
          >
            <Plus className="w-4 h-4" /> Admit Inpatient
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

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="relative w-full sm:max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by admission number (ADM-...), patient..."
              className="pl-9 bg-white"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              options={[
                { value: 'All', label: 'All Inpatients' },
                { value: 'Admitted', label: 'Currently Admitted' },
                { value: 'Discharged', label: 'Discharged Patients' }
              ]}
              className="w-48 bg-white"
            />
          </div>
        </div>

        {/* Admissions Table */}
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
                icon={BedDouble}
                title="No Inpatient Records"
                description={
                  search || statusFilter !== 'All'
                    ? 'No inpatient admissions match the selected criteria.'
                    : 'No patients are currently admitted in the hospital.'
                }
                actionLabel="Admit Patient"
                onAction={() => setIsAdmitModalOpen(true)}
              />
            ) : (
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 text-xs uppercase font-semibold">
                  <tr>
                    <th className="py-3 px-4">Admission #</th>
                    <th className="py-3 px-4">Patient Profile</th>
                    <th className="py-3 px-4">Ward & Bed</th>
                    <th className="py-3 px-4">Attending Doctor</th>
                    <th className="py-3 px-4">Admission Date</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filtered.map((adm) => {
                    const isAdmitted = adm.status === 'Admitted';
                    const summaryPdf = adm.dischargeSummary?.pdfUrl;

                    return (
                      <tr key={adm._id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3 px-4">
                          <span className="font-mono text-xs font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded">
                            {adm.admissionNumber}
                          </span>
                        </td>

                        <td className="py-3 px-4">
                          <p className="font-semibold text-slate-900">
                            {adm.patient?.firstName} {adm.patient?.lastName}
                          </p>
                          <span className="text-[11px] font-mono text-slate-400">
                            {adm.patient?.patientId}
                          </span>
                        </td>

                        <td className="py-3 px-4">
                          <p className="font-medium text-slate-900 text-xs">
                            Room {adm.room?.roomNumber || 'Ward'}
                          </p>
                          <span className="text-[11px] font-mono text-teal-700 font-bold">
                            Bed {adm.bed?.bedNumber || 'N/A'}
                          </span>
                        </td>

                        <td className="py-3 px-4 text-xs text-slate-700">
                          Dr. {adm.doctor?.firstName} {adm.doctor?.lastName}
                        </td>

                        <td className="py-3 px-4 text-xs text-slate-500">
                          {new Date(adm.admissionDate).toLocaleDateString()}
                        </td>

                        <td className="py-3 px-4">
                          <Badge variant={isAdmitted ? 'danger' : 'success'} className="text-xs">
                            {adm.status}
                          </Badge>
                        </td>

                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {isAdmitted && (
                              <Button
                                size="sm"
                                onClick={() => openDischargeModal(adm)}
                                className="text-xs bg-teal-600 hover:bg-teal-700 flex items-center gap-1"
                              >
                                <LogOut className="w-3.5 h-3.5" /> Discharge
                              </Button>
                            )}

                            {!isAdmitted && summaryPdf && (
                              <a
                                href={summaryPdf}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex"
                              >
                                <Button size="sm" variant="outline" className="text-xs flex items-center gap-1.5">
                                  <Download className="w-3.5 h-3.5" /> Discharge PDF
                                </Button>
                              </a>
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

        {/* Admit Patient Modal */}
        <Modal
          isOpen={isAdmitModalOpen}
          onClose={() => setIsAdmitModalOpen(false)}
          title="Hospital Inpatient Bed Admission"
        >
          <form onSubmit={handleAdmitPatient} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Select Patient</label>
              <Select
                value={admitForm.patientId}
                onChange={(e) => setAdmitForm({ ...admitForm, patientId: e.target.value })}
                options={patients.map((p) => ({
                  value: p._id,
                  label: `${p.firstName} ${p.lastName} (${p.patientId}) - Blood: ${p.bloodGroup || 'N/A'}`
                }))}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Attending Doctor
                </label>
                <Select
                  value={admitForm.doctorId}
                  onChange={(e) => {
                    const doc = doctors.find((d) => d._id === e.target.value);
                    setAdmitForm({
                      ...admitForm,
                      doctorId: e.target.value,
                      departmentId: doc?.department?._id || doc?.department || ''
                    });
                  }}
                  options={doctors.map((d) => ({
                    value: d._id,
                    label: `Dr. ${d.firstName} ${d.lastName} (${d.specialization})`
                  }))}
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Assign Inpatient Bed
                </label>
                <Select
                  value={admitForm.bedId}
                  onChange={(e) => handleBedSelection(e.target.value)}
                  options={availableBeds.map((b) => ({
                    value: b._id,
                    label: `Bed ${b.bedNumber} (Room ${b.room?.roomNumber || ''} - $${b.dailyRate}/day)`
                  }))}
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Reason for Hospitalization
              </label>
              <Input
                value={admitForm.admissionReason}
                onChange={(e) => setAdmitForm({ ...admitForm, admissionReason: e.target.value })}
                required
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Initial Working Diagnosis
              </label>
              <Input
                value={admitForm.initialDiagnosis}
                onChange={(e) => setAdmitForm({ ...admitForm, initialDiagnosis: e.target.value })}
                required
              />
            </div>

            <div className="pt-4 flex justify-end gap-2 border-t border-slate-100">
              <Button type="button" variant="outline" onClick={() => setIsAdmitModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={submittingAdmit} className="bg-teal-600 hover:bg-teal-700">
                {submittingAdmit ? 'Admitting...' : 'Confirm Inpatient Admission'}
              </Button>
            </div>
          </form>
        </Modal>

        {/* Discharge Patient Modal */}
        <Modal
          isOpen={isDischargeModalOpen}
          onClose={() => setIsDischargeModalOpen(false)}
          title={`Discharge Patient: ${selectedAdmissionForDischarge?.admissionNumber || ''}`}
        >
          {selectedAdmissionForDischarge && (
            <form onSubmit={handleDischargePatient} className="space-y-4">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs">
                <span className="text-slate-500">Patient:</span>{' '}
                <span className="font-bold text-slate-900">
                  {selectedAdmissionForDischarge.patient?.firstName}{' '}
                  {selectedAdmissionForDischarge.patient?.lastName} (
                  {selectedAdmissionForDischarge.patient?.patientId})
                </span>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Final Clinical Diagnosis
                </label>
                <Input
                  value={dischargeForm.finalDiagnosis}
                  onChange={(e) => setDischargeForm({ ...dischargeForm, finalDiagnosis: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Hospital Course & Treatment Summary
                </label>
                <Input
                  value={dischargeForm.treatmentSummary}
                  onChange={(e) =>
                    setDischargeForm({ ...dischargeForm, treatmentSummary: e.target.value })
                  }
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Patient Discharge Instructions
                </label>
                <Input
                  value={dischargeForm.dischargeInstructions}
                  onChange={(e) =>
                    setDischargeForm({ ...dischargeForm, dischargeInstructions: e.target.value })
                  }
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Follow-up Clinical Visit Date
                </label>
                <Input
                  type="date"
                  value={dischargeForm.followUpDate}
                  onChange={(e) => setDischargeForm({ ...dischargeForm, followUpDate: e.target.value })}
                />
              </div>

              <div className="pt-4 flex justify-end gap-2 border-t border-slate-100">
                <Button type="button" variant="outline" onClick={() => setIsDischargeModalOpen(false)}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={submittingDischarge}
                  className="bg-emerald-600 hover:bg-emerald-700"
                >
                  {submittingDischarge ? 'Discharging...' : 'Discharge & Publish Official Summary PDF'}
                </Button>
              </div>
            </form>
          )}
        </Modal>
      </div>
    </DashboardLayout>
  );
}
