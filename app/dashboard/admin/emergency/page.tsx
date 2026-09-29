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
  AlertTriangle,
  Plus,
  Search,
  Activity,
  User,
  HeartPulse,
  Phone,
  CheckCircle2,
  AlertCircle,
  Clock,
  Stethoscope
} from 'lucide-react';

export default function AdminEmergencyPage() {
  const [cases, setCases] = useState<any[]>([]);
  const [doctors, setDoctors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // New Case Intake Modal
  const [isNewCaseModalOpen, setIsNewCaseModalOpen] = useState(false);
  const [submittingCase, setSubmittingCase] = useState(false);
  const [caseForm, setCaseForm] = useState({
    patientName: '',
    age: 38,
    gender: 'Male',
    contactPhone: '',
    priority: 'Critical',
    symptoms: 'Sudden onset chest pain radiating to left arm with diaphoresis',
    initialDiagnosis: 'Suspected Acute Coronary Syndrome',
    triageNotes: 'Immediate ECG and cardiac enzymes ordered upon arrival.',
    attendingDoctorId: ''
  });

  useEffect(() => {
    fetchCases();
    fetchDoctors();
  }, [statusFilter]);

  const fetchCases = async () => {
    setLoading(true);
    try {
      const res = await api.get('/emergency', {
        params: { status: statusFilter !== 'All' ? statusFilter : undefined }
      });
      setCases(res.data.data || []);
    } catch (err) {
      console.error('Failed to load emergency cases:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchDoctors = async () => {
    try {
      const res = await api.get('/doctors?limit=50');
      const docs = res.data.data || [];
      setDoctors(docs);
      if (docs.length > 0) {
        setCaseForm((prev) => ({ ...prev, attendingDoctorId: docs[0]._id }));
      }
    } catch (err) {
      console.error('Failed to load doctors:', err);
    }
  };

  const handleCreateCase = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingCase(true);
    try {
      await api.post('/emergency', {
        patientName: caseForm.patientName,
        age: caseForm.age,
        gender: caseForm.gender,
        contactPhone: caseForm.contactPhone,
        priority: caseForm.priority,
        symptoms: caseForm.symptoms,
        initialDiagnosis: caseForm.initialDiagnosis,
        triageNotes: caseForm.triageNotes,
        attendingDoctor: caseForm.attendingDoctorId || undefined,
        status: 'Triaged'
      });
      setMessage({ type: 'success', text: 'Emergency trauma case logged in live queue!' });
      setIsNewCaseModalOpen(false);
      setTimeout(() => setMessage(null), 3000);
      fetchCases();
    } catch (err: any) {
      setMessage({
        type: 'error',
        text: err.response?.data?.message || 'Failed to log emergency case.'
      });
    } finally {
      setSubmittingCase(false);
    }
  };

  const handleUpdateStatus = async (caseId: string, nextStatus: string) => {
    try {
      await api.patch(`/emergency/${caseId}/status`, { status: nextStatus });
      setMessage({ type: 'success', text: `Emergency case status updated to ${nextStatus}.` });
      setTimeout(() => setMessage(null), 3000);
      fetchCases();
    } catch (err: any) {
      setMessage({
        type: 'error',
        text: err.response?.data?.message || 'Failed to update case status.'
      });
    }
  };

  const filteredCases = cases.filter((c) => {
    const q = search.toLowerCase();
    const cNum = (c.caseNumber || '').toLowerCase();
    const name = (c.patientName || '').toLowerCase();
    const sym = (c.symptoms || '').toLowerCase();
    return cNum.includes(q) || name.includes(q) || sym.includes(q);
  });

  return (
    <DashboardLayout allowedRoles={['ADMIN']}>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <span className="p-1 rounded-lg bg-rose-600 text-white">
                <AlertTriangle className="w-5 h-5" />
              </span>{' '}
              Emergency Trauma & Triage Center
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Rapid clinical intake, ESI acuity stratification, resuscitation bay allocation & telemetry
            </p>
          </div>

          <Button
            onClick={() => setIsNewCaseModalOpen(true)}
            className="flex items-center gap-2 bg-rose-600 hover:bg-rose-700 font-semibold"
          >
            <Plus className="w-4 h-4" /> New Emergency Intake
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
              placeholder="Search by case # (EMG-...), patient name, symptoms..."
              className="pl-9 bg-white"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              options={[
                { value: 'All', label: 'All Active Cases' },
                { value: 'Triaged', label: 'Triaged & Waiting' },
                { value: 'Under Treatment', label: 'Under Treatment' },
                { value: 'Admitted', label: 'Transferred to Inpatient' },
                { value: 'Discharged', label: 'Discharged' }
              ]}
              className="w-48 bg-white"
            />
          </div>
        </div>

        {/* Emergency Cases Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Skeleton key={i} className="h-64 rounded-xl" />
            ))}
          </div>
        ) : filteredCases.length === 0 ? (
          <EmptyState
            icon={AlertTriangle}
            title="Emergency Queue Clear"
            description="No active emergency trauma cases in queue."
            actionLabel="New Emergency Intake"
            onAction={() => setIsNewCaseModalOpen(true)}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCases.map((c) => {
              const isCritical = c.priority === 'Critical';
              const isHigh = c.priority === 'High';
              const isMedium = c.priority === 'Medium';

              const priorityBadge = isCritical
                ? 'bg-rose-600 text-white'
                : isHigh
                ? 'bg-amber-500 text-white'
                : isMedium
                ? 'bg-yellow-100 text-yellow-800'
                : 'bg-emerald-100 text-emerald-800';

              return (
                <Card
                  key={c._id}
                  className={`border-l-4 transition-all hover:shadow-md ${
                    isCritical
                      ? 'border-l-rose-600'
                      : isHigh
                      ? 'border-l-amber-500'
                      : 'border-l-teal-500'
                  }`}
                >
                  <CardHeader className="border-b border-slate-100 pb-3 flex flex-row items-center justify-between">
                    <div>
                      <span className="font-mono text-xs font-bold text-slate-800">
                        {c.caseNumber}
                      </span>
                      <h4 className="font-bold text-slate-900 text-base mt-0.5">{c.patientName}</h4>
                      <p className="text-xs text-slate-500">
                        {c.age ? `${c.age} yrs` : 'Age N/A'} • {c.gender || 'Unknown'}
                      </p>
                    </div>

                    <div className="text-right">
                      <span
                        className={`text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${priorityBadge}`}
                      >
                        {c.priority}
                      </span>
                      <p className="text-[10px] text-slate-400 mt-1.5 flex items-center justify-end gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(c.arrivalTime).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </CardHeader>

                  <CardContent className="p-4 space-y-3 text-xs">
                    <div>
                      <span className="text-slate-400 uppercase font-semibold text-[10px] block">
                        Presenting Symptoms
                      </span>
                      <p className="text-slate-800 font-medium mt-0.5 leading-relaxed">
                        {c.symptoms}
                      </p>
                    </div>

                    {c.initialDiagnosis && (
                      <div className="p-2 bg-slate-50 rounded border border-slate-100">
                        <span className="text-slate-400 uppercase font-semibold text-[10px] block">
                          Triage Diagnosis
                        </span>
                        <p className="font-semibold text-slate-900 mt-0.5">{c.initialDiagnosis}</p>
                      </div>
                    )}

                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-slate-500 flex items-center gap-1">
                        <Stethoscope className="w-3.5 h-3.5 text-teal-600" />
                        {c.attendingDoctor
                          ? `Dr. ${c.attendingDoctor.firstName} ${c.attendingDoctor.lastName}`
                          : 'Doctor Unassigned'}
                      </span>

                      <Badge variant="outline" className="text-[11px]">
                        {c.status}
                      </Badge>
                    </div>

                    {/* Action Bar */}
                    <div className="pt-2 flex items-center justify-end gap-1.5">
                      {c.status === 'Triaged' && (
                        <Button
                          size="sm"
                          onClick={() => handleUpdateStatus(c._id, 'Under Treatment')}
                          className="text-xs bg-amber-600 hover:bg-amber-700 h-7 px-2"
                        >
                          Begin Treatment
                        </Button>
                      )}

                      {c.status === 'Under Treatment' && (
                        <Button
                          size="sm"
                          onClick={() => handleUpdateStatus(c._id, 'Discharged')}
                          className="text-xs bg-emerald-600 hover:bg-emerald-700 h-7 px-2"
                        >
                          Discharge
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* New Emergency Intake Modal */}
        <Modal
          isOpen={isNewCaseModalOpen}
          onClose={() => setIsNewCaseModalOpen(false)}
          title="Emergency Trauma Patient Intake"
        >
          <form onSubmit={handleCreateCase} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Patient Full Name
                </label>
                <Input
                  value={caseForm.patientName}
                  onChange={(e) => setCaseForm({ ...caseForm, patientName: e.target.value })}
                  placeholder="e.g. John Doe / Unidentified Male"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Age</label>
                  <Input
                    type="number"
                    min={0}
                    value={caseForm.age}
                    onChange={(e) =>
                      setCaseForm({ ...caseForm, age: parseInt(e.target.value, 10) || 0 })
                    }
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Gender</label>
                  <Select
                    value={caseForm.gender}
                    onChange={(e) => setCaseForm({ ...caseForm, gender: e.target.value })}
                    options={[
                      { value: 'Male', label: 'Male' },
                      { value: 'Female', label: 'Female' },
                      { value: 'Other', label: 'Other' }
                    ]}
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Triage Priority Level
                </label>
                <Select
                  value={caseForm.priority}
                  onChange={(e) => setCaseForm({ ...caseForm, priority: e.target.value })}
                  options={[
                    { value: 'Critical', label: 'Level 1: Critical (Resuscitation)' },
                    { value: 'High', label: 'Level 2: High Emergent' },
                    { value: 'Medium', label: 'Level 3: Urgent' },
                    { value: 'Low', label: 'Level 4: Non-Urgent' }
                  ]}
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Assign Emergency Clinician
                </label>
                <Select
                  value={caseForm.attendingDoctorId}
                  onChange={(e) => setCaseForm({ ...caseForm, attendingDoctorId: e.target.value })}
                  options={doctors.map((d) => ({
                    value: d._id,
                    label: `Dr. ${d.firstName} ${d.lastName} (${d.specialization})`
                  }))}
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Chief Presenting Symptoms
              </label>
              <Input
                value={caseForm.symptoms}
                onChange={(e) => setCaseForm({ ...caseForm, symptoms: e.target.value })}
                placeholder="e.g. Acute trauma from road collision, head lacerations"
                required
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Working Diagnosis
              </label>
              <Input
                value={caseForm.initialDiagnosis}
                onChange={(e) => setCaseForm({ ...caseForm, initialDiagnosis: e.target.value })}
                placeholder="Suspected concussion and fractures"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Triage Notes</label>
              <Input
                value={caseForm.triageNotes}
                onChange={(e) => setCaseForm({ ...caseForm, triageNotes: e.target.value })}
                placeholder="IV access secured, vitals monitoring initiated"
              />
            </div>

            <div className="pt-4 flex justify-end gap-2 border-t border-slate-100">
              <Button type="button" variant="outline" onClick={() => setIsNewCaseModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={submittingCase} className="bg-rose-600 hover:bg-rose-700">
                {submittingCase ? 'Logging Intake...' : 'Admit to Emergency Bay'}
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </DashboardLayout>
  );
}
