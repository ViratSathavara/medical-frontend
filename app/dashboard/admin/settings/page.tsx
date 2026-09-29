'use client';

import React, { useEffect, useState } from 'react';
import { DashboardLayout } from '../../../../components/layout/DashboardLayout';
import { Card, CardHeader, CardContent } from '../../../../components/ui/Card';
import { Button } from '../../../../components/ui/Button';
import { Input } from '../../../../components/ui/Input';
import { Textarea } from '../../../../components/ui/Textarea';
import { Skeleton } from '../../../../components/ui/Skeleton';
import api from '../../../../services/api';
import {
  Settings,
  Building,
  Phone,
  Mail,
  MapPin,
  Clock,
  Save,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  Globe
} from 'lucide-react';

export default function AdminSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [form, setForm] = useState({
    name: 'MedPulse General & Super Speciality Hospital',
    tagline: 'Excellence in Healthcare, Compassion in Healing',
    phone: '+1 (555) 234-5678',
    email: 'contact@medpulsehospital.com',
    emergencyNumber: '+1 (555) 911-0000',
    website: 'https://medpulse.hospital.org',
    workingHours: '24/7 Emergency & Inpatient • Outpatient: Mon - Sat 08:00 - 20:00',
    about:
      'MedPulse is a premier tertiary care healthcare network offering advanced clinical diagnostics, robotic surgery, round-the-clock emergency triage, and specialized inpatient facilities.',
    address: {
      street: '742 Evergreen Medical Park',
      city: 'New York',
      state: 'NY',
      postalCode: '10001',
      country: 'USA'
    }
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const res = await api.get('/hospital');
      if (res.data.data) {
        const d = res.data.data;
        setForm({
          name: d.name || form.name,
          tagline: d.tagline || form.tagline,
          phone: d.phone || form.phone,
          email: d.email || form.email,
          emergencyNumber: d.emergencyNumber || form.emergencyNumber,
          website: d.website || form.website,
          workingHours: d.workingHours || form.workingHours,
          about: d.about || form.about,
          address: {
            street: d.address?.street || form.address.street,
            city: d.address?.city || form.address.city,
            state: d.address?.state || form.address.state,
            postalCode: d.address?.postalCode || form.address.postalCode,
            country: d.address?.country || form.address.country
          }
        });
      }
    } catch (err) {
      console.error('Failed to load hospital settings:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      await api.put('/hospital', form);
      setMessage({ type: 'success', text: 'Hospital settings & branding updated successfully!' });
      setTimeout(() => setMessage(null), 4000);
    } catch (err: any) {
      console.error(err);
      setMessage({
        type: 'error',
        text: err.response?.data?.message || 'Failed to update hospital settings.'
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <DashboardLayout allowedRoles={['ADMIN']}>
      <div className="space-y-6 max-w-5xl">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <Settings className="w-6 h-6 text-teal-600" /> Hospital Configuration & Branding
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Global institution identity, contact points, emergency hotlines & operational hours
            </p>
          </div>

          <Button
            onClick={handleSave}
            disabled={saving || loading}
            className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 font-semibold"
          >
            <Save className="w-4 h-4" /> {saving ? 'Saving Changes...' : 'Save Settings'}
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

        {loading ? (
          <div className="space-y-4">
            <Skeleton className="h-64 w-full rounded-xl" />
            <Skeleton className="h-64 w-full rounded-xl" />
          </div>
        ) : (
          <form onSubmit={handleSave} className="space-y-6">
            {/* Identity & Branding */}
            <Card>
              <CardHeader className="border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <Building className="w-5 h-5 text-teal-600" />
                  <h3 className="font-bold text-slate-900">Hospital Institutional Identity</h3>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Displayed on patient PDFs, header navigation, appointment slips & invoices
                </p>
              </CardHeader>

              <CardContent className="p-6 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">
                      Hospital Official Name
                    </label>
                    <Input
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      required
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">
                      Motto / Clinical Tagline
                    </label>
                    <Input
                      value={form.tagline}
                      onChange={(e) => setForm({ ...form, tagline: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    About / Executive Mission Statement
                  </label>
                  <Textarea
                    rows={3}
                    value={form.about}
                    onChange={(e) => setForm({ ...form, about: e.target.value })}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Communications & Emergency Hotlines */}
            <Card>
              <CardHeader className="border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <Phone className="w-5 h-5 text-teal-600" />
                  <h3 className="font-bold text-slate-900">Contact & Emergency Telephony</h3>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Published on emergency portal and public website pages
                </p>
              </CardHeader>

              <CardContent className="p-6 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">
                      General Hospital Phone
                    </label>
                    <Input
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      required
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-rose-700 block mb-1">
                      Emergency Trauma Hotline (24/7)
                    </label>
                    <Input
                      value={form.emergencyNumber}
                      onChange={(e) => setForm({ ...form, emergencyNumber: e.target.value })}
                      required
                      className="border-rose-200 bg-rose-50/30 text-rose-900 font-semibold"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">
                      Official Contact Email
                    </label>
                    <Input
                      type="email"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">
                      Public Web Portal URL
                    </label>
                    <Input
                      value={form.website}
                      onChange={(e) => setForm({ ...form, website: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">
                      Operating Hours Schedule
                    </label>
                    <Input
                      value={form.workingHours}
                      onChange={(e) => setForm({ ...form, workingHours: e.target.value })}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Physical Facility Location */}
            <Card>
              <CardHeader className="border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-teal-600" />
                  <h3 className="font-bold text-slate-900">Hospital Medical Campus Address</h3>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">Physical campus location for patient navigation</p>
              </CardHeader>

              <CardContent className="p-6 space-y-4">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Street Address</label>
                  <Input
                    value={form.address.street}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        address: { ...form.address, street: e.target.value }
                      })
                    }
                    required
                  />
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">City</label>
                    <Input
                      value={form.address.city}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          address: { ...form.address, city: e.target.value }
                        })
                      }
                      required
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">State / Prov</label>
                    <Input
                      value={form.address.state}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          address: { ...form.address, state: e.target.value }
                        })
                      }
                      required
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">Postal Code</label>
                    <Input
                      value={form.address.postalCode}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          address: { ...form.address, postalCode: e.target.value }
                        })
                      }
                      required
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">Country</label>
                    <Input
                      value={form.address.country}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          address: { ...form.address, country: e.target.value }
                        })
                      }
                      required
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end pt-2">
              <Button
                type="submit"
                disabled={saving}
                className="bg-teal-600 hover:bg-teal-700 font-semibold flex items-center gap-2"
              >
                <Save className="w-4 h-4" /> {saving ? 'Saving...' : 'Save Hospital Configuration'}
              </Button>
            </div>
          </form>
        )}
      </div>
    </DashboardLayout>
  );
}
