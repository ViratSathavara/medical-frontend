'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { DashboardLayout } from '../../../../components/layout/DashboardLayout';
import { Card, CardHeader, CardContent } from '../../../../components/ui/Card';
import { Button } from '../../../../components/ui/Button';
import { Input } from '../../../../components/ui/Input';
import { Select } from '../../../../components/ui/Select';
import { Textarea } from '../../../../components/ui/Textarea';
import { Badge } from '../../../../components/ui/Badge';
import api from '../../../../services/api';
import { Patient, LabTest, MedicineItem } from '../../../../types';
import {
  FileText,
  HeartPulse,
  Pill,
  FlaskConical,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Download,
  Stethoscope
} from 'lucide-react';

function ConsultationContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const appointmentId = searchParams.get('appointmentId') || '';
  const patientIdFromQuery = searchParams.get('patientId') || '';

  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedPatientId, setSelectedPatientId] = useState(patientIdFromQuery);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);

  // Vitals
  const [bpSystolic, setBpSystolic] = useState<number>(120);
  const [bpDiastolic, setBpDiastolic] = useState<number>(80);
  const [heartRate, setHeartRate] = useState<number>(72);
  const [temperature, setTemperature] = useState<number>(98.6);
  const [oxygenSaturation, setOxygenSaturation] = useState<number>(99);
  const [weight, setWeight] = useState<number>(65);
  const [height, setHeight] = useState<number>(170);

  // EMR Details
  const [symptoms, setSymptoms] = useState('');
  const [diagnosis, setDiagnosis] = useState('');
  const [treatment, setTreatment] = useState('');
  const [clinicalNotes, setClinicalNotes] = useState('');

  // Prescription Medicines Builder
  const [medicines, setMedicines] = useState<MedicineItem[]>([
    { name: '', dosage: '500mg', frequency: '1-0-1 (Twice daily)', duration: '5 days', instructions: 'Take with water after meals' }
  ]);

  // Lab Tests Catalog & selection
  const [labTests, setLabTests] = useState<LabTest[]>([]);
  const [selectedLabTestIds, setSelectedLabTestIds] = useState<string[]>([]);

  const [submitting, setSubmitting] = useState(false);
  const [successResult, setSuccessResult] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState('');

  // Load patients and lab catalog
  useEffect(() => {
    api.get('/patients?limit=50').then((res) => {
      setPatients(res.data.data || []);
    });
    api.get('/laboratory/tests').then((res) => {
      setLabTests(res.data.data || []);
    });
  }, []);

  // Fetch patient profile details when selected
  useEffect(() => {
    if (!selectedPatientId) {
      setSelectedPatient(null);
      return;
    }

    api.get(`/patients/${selectedPatientId}`)
      .then((res) => setSelectedPatient(res.data.data))
      .catch((err) => console.error(err));
  }, [selectedPatientId]);

  // Add / Remove medicine row
  const addMedicineRow = () => {
    setMedicines([
      ...medicines,
      { name: '', dosage: '10mg', frequency: 'Once daily', duration: '7 days', instructions: 'After meals' }
    ]);
  };

  const removeMedicineRow = (index: number) => {
    setMedicines(medicines.filter((_, idx) => idx !== index));
  };

  const updateMedicine = (index: number, field: keyof MedicineItem, val: string) => {
    const updated = [...medicines];
    updated[index] = { ...updated[index], [field]: val };
    setMedicines(updated);
  };

  // Auto calculate BMI
  const bmi = weight && height ? (weight / Math.pow(height / 100, 2)).toFixed(1) : '22.5';

  const handleSaveConsultation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatientId) {
      setErrorMsg('Please select a patient.');
      return;
    }
    if (!diagnosis.trim()) {
      setErrorMsg('Clinical diagnosis is required.');
      return;
    }
    if (!treatment.trim()) {
      setErrorMsg('Treatment regimen plan is required.');
      return;
    }

    setSubmitting(true);
    setErrorMsg('');

    try {
      // 1. Create Medical Record
      const recordPayload = {
        patientId: selectedPatientId,
        appointmentId: appointmentId || undefined,
        visitDate: new Date().toISOString(),
        symptoms: symptoms ? symptoms.split(',').map((s) => s.trim()) : [],
        diagnosis,
        treatment,
        clinicalNotes,
        vitalSigns: {
          bpSystolic,
          bpDiastolic,
          heartRate,
          temperature,
          oxygenSaturation,
          weight,
          height,
          bmi: parseFloat(bmi)
        }
      };

      const recordRes = await api.post('/medical-records', recordPayload);

      // 2. Issue Prescription if medicines entered
      const validMeds = medicines.filter((m) => m.name.trim().length > 0);
      let rxRes = null;
      if (validMeds.length > 0) {
        rxRes = await api.post('/prescriptions', {
          patientId: selectedPatientId,
          appointmentId: appointmentId || undefined,
          diagnosis,
          medicines: validMeds,
          notes: clinicalNotes
        });
      }

      // 3. Request Lab tests if any selected
      if (selectedLabTestIds.length > 0) {
        await api.post('/laboratory/requests', {
          patientId: selectedPatientId,
          testIds: selectedLabTestIds,
          appointmentId: appointmentId || undefined,
          priority: 'Routine',
          clinicalNotes: `Diagnostic review for ${diagnosis}`
        });
      }

      setSuccessResult({
        record: recordRes.data.data,
        prescription: rxRes?.data?.data
      });
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Failed to submit clinical record.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <DashboardLayout allowedRoles={['DOCTOR']}>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Clinical Consultation Hub</h1>
          <p className="text-xs text-slate-500 mt-1">Record vital signs, document EMR diagnosis, generate prescriptions, and order diagnostic labs</p>
        </div>

        {successResult ? (
          <Card className="text-center p-8 sm:p-12 space-y-6">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-md">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-slate-900">Consultation Completed Successfully!</h2>
              <p className="text-sm text-slate-500 max-w-md mx-auto">
                Electronic Health Record <span className="font-bold text-slate-800">{successResult.record?.recordNumber}</span> has been logged.
              </p>
            </div>

            {successResult.prescription?.pdfUrl && (
              <div className="p-4 rounded-2xl bg-sky-50 border border-sky-100 max-w-md mx-auto flex items-center justify-between">
                <div className="text-left">
                  <p className="text-xs font-bold text-sky-950">Prescription PDF Generated</p>
                  <p className="text-[11px] text-sky-700">Digital signature & hospital branding verified</p>
                </div>
                <a href={successResult.prescription.pdfUrl} target="_blank" rel="noreferrer" download>
                  <Button size="sm" variant="primary" leftIcon={<Download className="w-3.5 h-3.5" />}>
                    Download Rx
                  </Button>
                </a>
              </div>
            )}

            <div className="flex items-center justify-center gap-4 pt-4">
              <Button size="md" variant="primary" onClick={() => router.push('/dashboard/doctor')}>
                Return to Dashboard
              </Button>
              <Button size="md" variant="outline" onClick={() => setSuccessResult(null)}>
                Start Next Consultation
              </Button>
            </div>
          </Card>
        ) : (
          <form onSubmit={handleSaveConsultation} className="space-y-6">
            {errorMsg && (
              <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* 1. Patient Selector & Medical Alert Summary */}
            <Card>
              <CardHeader title="1. Select Patient" subtitle="Review existing allergies and health background" />
              <CardContent className="space-y-4">
                <Select
                  label="Patient Record"
                  value={selectedPatientId}
                  onChange={(e) => setSelectedPatientId(e.target.value)}
                  options={[
                    { label: 'Select Patient from Registry...', value: '' },
                    ...patients.map((p) => ({
                      label: `${p.firstName} ${p.lastName} (${p.patientId}) - Blood: ${p.bloodGroup || 'N/A'}`,
                      value: p._id
                    }))
                  ]}
                />

                {selectedPatient && (
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                    <div>
                      <span className="text-slate-400 font-semibold uppercase text-[10px]">Patient Name</span>
                      <p className="font-bold text-slate-800 text-sm mt-0.5">{selectedPatient.firstName} {selectedPatient.lastName}</p>
                      <p className="text-slate-500">{selectedPatient.gender} &bull; Blood: {selectedPatient.bloodGroup}</p>
                    </div>

                    <div>
                      <span className="text-slate-400 font-semibold uppercase text-[10px]">Known Allergies</span>
                      <p className="font-semibold text-rose-600 mt-0.5">
                        {selectedPatient.allergies?.length ? selectedPatient.allergies.join(', ') : 'No drug allergies reported'}
                      </p>
                    </div>

                    <div>
                      <span className="text-slate-400 font-semibold uppercase text-[10px]">Pre-existing Conditions</span>
                      <p className="font-semibold text-slate-700 mt-0.5">
                        {selectedPatient.existingConditions?.length ? selectedPatient.existingConditions.join(', ') : 'None documented'}
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* 2. Vital Signs Input */}
            <Card>
              <CardHeader title="2. Vital Signs Monitoring" subtitle="Record current patient hemodynamics" />
              <CardContent>
                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-4">
                  <Input
                    label="BP Systolic (mmHg)"
                    type="number"
                    value={bpSystolic}
                    onChange={(e) => setBpSystolic(Number(e.target.value))}
                  />
                  <Input
                    label="BP Diastolic (mmHg)"
                    type="number"
                    value={bpDiastolic}
                    onChange={(e) => setBpDiastolic(Number(e.target.value))}
                  />
                  <Input
                    label="Heart Rate (BPM)"
                    type="number"
                    value={heartRate}
                    onChange={(e) => setHeartRate(Number(e.target.value))}
                  />
                  <Input
                    label="Temp (°F)"
                    type="number"
                    step="0.1"
                    value={temperature}
                    onChange={(e) => setTemperature(Number(e.target.value))}
                  />
                  <Input
                    label="SpO2 (%)"
                    type="number"
                    value={oxygenSaturation}
                    onChange={(e) => setOxygenSaturation(Number(e.target.value))}
                  />
                  <Input
                    label="Weight (kg)"
                    type="number"
                    value={weight}
                    onChange={(e) => setWeight(Number(e.target.value))}
                  />
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-center flex flex-col justify-center">
                    <span className="text-[10px] text-slate-400 font-semibold uppercase">Computed BMI</span>
                    <span className="text-base font-extrabold text-primary-600">{bmi}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 3. Clinical Assessment & Diagnosis */}
            <Card>
              <CardHeader title="3. Clinical Assessment & Notes" subtitle="Document patient symptoms and formal diagnosis" />
              <CardContent className="space-y-4">
                <Input
                  label="Observed Symptoms (Comma separated)"
                  placeholder="e.g. Chest tightness, fatigue, palpitations"
                  value={symptoms}
                  onChange={(e) => setSymptoms(e.target.value)}
                />

                <Input
                  label="Primary Clinical Diagnosis"
                  placeholder="e.g. Essential Hypertension (Stage 1), Sinus Tachycardia"
                  value={diagnosis}
                  onChange={(e) => setDiagnosis(e.target.value)}
                  required
                />

                <Textarea
                  label="Treatment Regimen & Clinical Recommendations"
                  placeholder="Detail treatment regimen, diet modifications, and monitoring protocols..."
                  value={treatment}
                  onChange={(e) => setTreatment(e.target.value)}
                  rows={3}
                  required
                />

                <Textarea
                  label="Confidential Doctor Clinical Notes"
                  placeholder="Additional observations, differential diagnoses, or follow-up notes..."
                  value={clinicalNotes}
                  onChange={(e) => setClinicalNotes(e.target.value)}
                  rows={2}
                />
              </CardContent>
            </Card>

            {/* 4. Multi-Medicine Prescription Builder */}
            <Card>
              <CardHeader
                title="4. E-Prescription Medications"
                subtitle="Build medication schedule with automated PDF prescription generation"
                action={
                  <Button type="button" size="sm" variant="outline" leftIcon={<Plus className="w-3.5 h-3.5" />} onClick={addMedicineRow}>
                    Add Medication
                  </Button>
                }
              />
              <CardContent className="space-y-3">
                {medicines.map((med, idx) => (
                  <div key={idx} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
                    <div className="sm:col-span-3">
                      <Input
                        placeholder="Medicine name (e.g. Amlodipine)"
                        value={med.name}
                        onChange={(e) => updateMedicine(idx, 'name', e.target.value)}
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <Input
                        placeholder="Dosage (5mg)"
                        value={med.dosage}
                        onChange={(e) => updateMedicine(idx, 'dosage', e.target.value)}
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <Input
                        placeholder="Frequency (1-0-1)"
                        value={med.frequency}
                        onChange={(e) => updateMedicine(idx, 'frequency', e.target.value)}
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <Input
                        placeholder="Duration (15 days)"
                        value={med.duration}
                        onChange={(e) => updateMedicine(idx, 'duration', e.target.value)}
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <Input
                        placeholder="Instructions (After meals)"
                        value={med.instructions}
                        onChange={(e) => updateMedicine(idx, 'instructions', e.target.value)}
                      />
                    </div>
                    <div className="sm:col-span-1 text-center">
                      <button
                        type="button"
                        onClick={() => removeMedicineRow(idx)}
                        disabled={medicines.length === 1}
                        className="p-2 text-rose-500 hover:text-rose-700 disabled:opacity-30 transition-colors"
                      >
                        <Trash2 className="w-4 h-4 mx-auto" />
                      </button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* 5. Diagnostic Laboratory Order */}
            <Card>
              <CardHeader title="5. Order Diagnostic Lab Tests (Optional)" subtitle="Select lab investigations to be conducted by pathology team" />
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {labTests.map((t) => {
                    const isChecked = selectedLabTestIds.includes(t._id);
                    return (
                      <label
                        key={t._id}
                        className={`p-3 rounded-xl border text-xs cursor-pointer flex items-center justify-between transition-colors ${
                          isChecked ? 'bg-primary-50 border-primary-400 text-primary-900 font-semibold' : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <div>
                          <p className="font-bold">{t.name}</p>
                          <p className="text-[11px] text-slate-400">${t.price} &bull; {t.category}</p>
                        </div>
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) => {
                            if (e.target.checked) setSelectedLabTestIds([...selectedLabTestIds, t._id]);
                            else setSelectedLabTestIds(selectedLabTestIds.filter((id) => id !== t._id));
                          }}
                          className="rounded text-primary-600 focus:ring-primary-500"
                        />
                      </label>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Action Bar */}
            <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-soft flex items-center justify-between">
              <p className="text-xs text-slate-500">
                Submitting will record the EMR, generate the verified prescription PDF, and complete the visit.
              </p>
              <Button type="submit" size="lg" variant="primary" isLoading={submitting}>
                Save Consultation & Generate Rx PDF
              </Button>
            </div>
          </form>
        )}
      </div>
    </DashboardLayout>
  );
}

export default function DoctorConsultationPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50 flex items-center justify-center">Loading...</div>}>
      <ConsultationContent />
    </Suspense>
  );
}
