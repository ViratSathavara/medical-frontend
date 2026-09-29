'use client';

import React, { useEffect, useState } from 'react';
import { DashboardLayout } from '../../../../components/layout/DashboardLayout';
import { Card, CardHeader, CardContent } from '../../../../components/ui/Card';
import { Button } from '../../../../components/ui/Button';
import { Input } from '../../../../components/ui/Input';
import { Select } from '../../../../components/ui/Select';
import { Badge } from '../../../../components/ui/Badge';
import api from '../../../../services/api';
import { Patient } from '../../../../types';
import { User, Shield, AlertCircle, CheckCircle2, Phone, Heart } from 'lucide-react';

export default function PatientProfile() {
  const [patient, setPatient] = useState<Patient | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Form fields
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [bloodGroup, setBloodGroup] = useState('O+');
  const [emergencyName, setEmergencyName] = useState('');
  const [emergencyPhone, setEmergencyPhone] = useState('');
  const [emergencyRelation, setEmergencyRelation] = useState('');
  const [allergies, setAllergies] = useState('');
  const [existingConditions, setExistingConditions] = useState('');

  useEffect(() => {
    api.get('/patients/me')
      .then((res) => {
        const p: Patient = res.data.data;
        setPatient(p);
        setFirstName(p.firstName);
        setLastName(p.lastName);
        setPhone(p.phone);
        setBloodGroup(p.bloodGroup || 'O+');
        setEmergencyName(p.emergencyContact?.name || '');
        setEmergencyPhone(p.emergencyContact?.phone || '');
        setEmergencyRelation(p.emergencyContact?.relation || '');
        setAllergies((p.allergies || []).join(', '));
        setExistingConditions((p.existingConditions || []).join(', '));
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!patient) return;

    setSaving(true);
    setSuccessMsg('');
    setErrorMsg('');

    try {
      await api.put(`/patients/${patient._id}`, {
        firstName,
        lastName,
        phone,
        bloodGroup,
        emergencyContact: {
          name: emergencyName,
          phone: emergencyPhone,
          relation: emergencyRelation
        },
        allergies: allergies.split(',').map((s) => s.trim()).filter(Boolean),
        existingConditions: existingConditions.split(',').map((s) => s.trim()).filter(Boolean)
      });

      setSuccessMsg('Patient profile updated successfully.');
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <DashboardLayout allowedRoles={['PATIENT']}>
      <div className="max-w-4xl space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Patient Profile & Medical History</h1>
          <p className="text-xs text-slate-500 mt-1">Manage demographic information, emergency contacts, and vital medical conditions</p>
        </div>

        <Card>
          <CardHeader
            title="Personal Demographics"
            subtitle={`Patient ID: ${patient?.patientId || 'PAT-1001'}`}
          />
          <CardContent>
            {successMsg && (
              <div className="p-3.5 mb-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-500" />
                <span>{successMsg}</span>
              </div>
            )}

            {errorMsg && (
              <div className="p-3.5 mb-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSave} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="First Name"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                />
                <Input
                  label="Last Name"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Phone Number"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                />
                <Select
                  label="Blood Group"
                  value={bloodGroup}
                  onChange={(e) => setBloodGroup(e.target.value)}
                  options={[
                    { label: 'A Positive (A+)', value: 'A+' },
                    { label: 'A Negative (A-)', value: 'A-' },
                    { label: 'B Positive (B+)', value: 'B+' },
                    { label: 'B Negative (B-)', value: 'B-' },
                    { label: 'AB Positive (AB+)', value: 'AB+' },
                    { label: 'AB Negative (AB-)', value: 'AB-' },
                    { label: 'O Positive (O+)', value: 'O+' },
                    { label: 'O Negative (O-)', value: 'O-' },
                  ]}
                />
              </div>

              {/* Emergency Contact */}
              <div className="pt-4 border-t border-slate-100 space-y-4">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                  <Phone className="w-4 h-4 text-primary-600" /> Emergency Contact Person
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <Input
                    label="Contact Name"
                    placeholder="e.g. James Watson"
                    value={emergencyName}
                    onChange={(e) => setEmergencyName(e.target.value)}
                  />
                  <Input
                    label="Relation"
                    placeholder="e.g. Spouse, Parent, Sibling"
                    value={emergencyRelation}
                    onChange={(e) => setEmergencyRelation(e.target.value)}
                  />
                  <Input
                    label="Emergency Phone"
                    placeholder="e.g. +1 (555) 888-7777"
                    value={emergencyPhone}
                    onChange={(e) => setEmergencyPhone(e.target.value)}
                  />
                </div>
              </div>

              {/* Allergies and Conditions */}
              <div className="pt-4 border-t border-slate-100 space-y-4">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                  <Heart className="w-4 h-4 text-rose-500" /> Known Allergies & Pre-existing Conditions
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Known Drug / Food Allergies (Comma separated)"
                    placeholder="e.g. Penicillin, Peanuts, Sulfa drugs"
                    value={allergies}
                    onChange={(e) => setAllergies(e.target.value)}
                  />
                  <Input
                    label="Existing Medical Conditions (Comma separated)"
                    placeholder="e.g. Asthma, Hypertension, Diabetes"
                    value={existingConditions}
                    onChange={(e) => setExistingConditions(e.target.value)}
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end">
                <Button type="submit" size="md" variant="primary" isLoading={saving}>
                  Save Profile Changes
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
