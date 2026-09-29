'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useDispatch } from 'react-redux';
import { setCredentials } from '../../store/slices/authSlice';
import { Navbar } from '../../components/layout/Navbar';
import { Footer } from '../../components/layout/Footer';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import api from '../../services/api';
import { HeartPulse, Mail, Lock, Phone, User, Stethoscope, AlertCircle } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const dispatch = useDispatch();

  const [role, setRole] = useState<'PATIENT' | 'DOCTOR'>('PATIENT');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [gender, setGender] = useState('Male');
  const [dob, setDob] = useState('1995-01-01');

  // Doctor specific fields
  const [specialization, setSpecialization] = useState('Cardiology');
  const [consultationFee, setConsultationFee] = useState(60);

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      const payload: any = {
        email,
        password,
        role,
        firstName,
        lastName,
        phone,
        dateOfBirth: dob,
        gender
      };

      if (role === 'DOCTOR') {
        payload.specialization = specialization;
        payload.consultationFee = Number(consultationFee);
      }

      const res = await api.post('/auth/register', payload);
      const { user, accessToken } = res.data.data;
      dispatch(setCredentials({ user, accessToken }));

      if (user.role === 'DOCTOR') {
        router.push('/dashboard/doctor');
      } else {
        router.push('/dashboard/patient');
      }
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Registration failed. Please verify your details.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />

      <div className="flex-1 flex items-center justify-center py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-xl w-full space-y-6">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-primary-600 to-sky-400 flex items-center justify-center text-white mx-auto shadow-md">
              <HeartPulse className="w-7 h-7" />
            </div>
            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Create MedPulse Account</h2>
            <p className="text-xs text-slate-500">Register as a patient or apply as hospital medical faculty</p>
          </div>

          {/* Role selector tab */}
          <div className="p-1 rounded-2xl bg-slate-200/80 grid grid-cols-2 gap-1 text-xs font-bold">
            <button
              type="button"
              onClick={() => setRole('PATIENT')}
              className={`py-2.5 rounded-xl transition-all flex items-center justify-center gap-2 ${
                role === 'PATIENT' ? 'bg-white text-primary-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <User className="w-4 h-4" />
              Patient Registration
            </button>
            <button
              type="button"
              onClick={() => setRole('DOCTOR')}
              className={`py-2.5 rounded-xl transition-all flex items-center justify-center gap-2 ${
                role === 'DOCTOR' ? 'bg-white text-primary-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Stethoscope className="w-4 h-4" />
              Doctor Application
            </button>
          </div>

          <Card>
            <CardContent className="p-6 sm:p-8">
              <form onSubmit={handleRegister} className="space-y-4">
                {errorMsg && (
                  <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="First Name"
                    placeholder="e.g. Emily"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required
                  />
                  <Input
                    label="Last Name"
                    placeholder="e.g. Watson"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    required
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Email Address"
                    type="email"
                    placeholder="e.g. emily@hospital.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    leftIcon={<Mail className="w-4 h-4" />}
                    required
                  />
                  <Input
                    label="Phone Number"
                    placeholder="e.g. +1 (555) 019-2834"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    leftIcon={<Phone className="w-4 h-4" />}
                    required
                  />
                </div>

                <Input
                  label="Password"
                  type="password"
                  placeholder="At least 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  leftIcon={<Lock className="w-4 h-4" />}
                  required
                />

                {role === 'PATIENT' ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input
                      label="Date of Birth"
                      type="date"
                      value={dob}
                      onChange={(e) => setDob(e.target.value)}
                      required
                    />
                    <Select
                      label="Biological Gender"
                      value={gender}
                      onChange={(e) => setGender(e.target.value)}
                      options={[
                        { label: 'Male', value: 'Male' },
                        { label: 'Female', value: 'Female' },
                        { label: 'Other', value: 'Other' }
                      ]}
                    />
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input
                      label="Specialization / Title"
                      placeholder="e.g. Cardiologist, Neurologist"
                      value={specialization}
                      onChange={(e) => setSpecialization(e.target.value)}
                      required
                    />
                    <Input
                      label="Consultation Fee ($)"
                      type="number"
                      min={10}
                      value={consultationFee}
                      onChange={(e) => setConsultationFee(Number(e.target.value))}
                      required
                    />
                  </div>
                )}

                <div className="pt-3">
                  <Button type="submit" size="md" variant="primary" className="w-full" isLoading={loading}>
                    Complete {role === 'DOCTOR' ? 'Doctor' : 'Patient'} Registration
                  </Button>
                </div>
              </form>

              <div className="mt-6 pt-4 border-t border-slate-100 text-center text-xs text-slate-500">
                Already registered?{' '}
                <Link href="/login" className="font-bold text-primary-600 hover:underline">
                  Sign in here &rarr;
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Footer />
    </div>
  );
}
