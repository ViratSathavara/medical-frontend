'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useDispatch } from 'react-redux';
import { setCredentials } from '../../store/slices/authSlice';
import { Navbar } from '../../components/layout/Navbar';
import { Footer } from '../../components/layout/Footer';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import api from '../../services/api';
import { HeartPulse, Lock, Mail, AlertCircle, ArrowRight, ShieldCheck, Stethoscope, User } from 'lucide-react';

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectParam = searchParams.get('redirect');

  const dispatch = useDispatch();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleLogin = async (e?: React.FormEvent, customEmail?: string, customPass?: string) => {
    if (e) e.preventDefault();
    setErrorMsg('');

    const targetEmail = customEmail || email;
    const targetPassword = customPass || password;

    if (!targetEmail || !targetPassword) {
      setErrorMsg('Please enter your email and password');
      return;
    }

    setLoading(true);
    try {
      const res = await api.post('/auth/login', {
        email: targetEmail,
        password: targetPassword
      });

      const { user, accessToken } = res.data.data;
      dispatch(setCredentials({ user, accessToken }));

      // Redirect based on role or URL param
      if (redirectParam) {
        router.push(redirectParam);
      } else if (user.role === 'ADMIN') {
        router.push('/dashboard/admin');
      } else if (user.role === 'DOCTOR') {
        router.push('/dashboard/doctor');
      } else {
        router.push('/dashboard/patient');
      }
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Invalid email or password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // 1-Click Quick Demo Login Helper
  const loginAsDemo = (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword('Password123!');
    handleLogin(undefined, demoEmail, 'Password123!');
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />

      <div className="flex-1 flex items-center justify-center py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          {/* Header */}
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-primary-600 to-sky-400 flex items-center justify-center text-white mx-auto shadow-md shadow-primary-500/20">
              <HeartPulse className="w-7 h-7" />
            </div>
            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Sign In to MedPulse</h2>
            <p className="text-xs text-slate-500">Access your hospital portal, medical records & appointments</p>
          </div>

          {/* Quick Demo Access Box */}
          <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-soft space-y-3">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block text-center">
              1-Click Demo Quick Login
            </span>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => loginAsDemo('admin@hospital.com')}
                className="p-2.5 rounded-xl border border-rose-100 bg-rose-50/70 hover:bg-rose-100 text-rose-800 text-xs font-bold flex flex-col items-center gap-1 transition-colors"
              >
                <ShieldCheck className="w-4 h-4 text-rose-600" />
                <span>Admin</span>
              </button>

              <button
                type="button"
                onClick={() => loginAsDemo('doctor@hospital.com')}
                className="p-2.5 rounded-xl border border-sky-100 bg-sky-50/70 hover:bg-sky-100 text-sky-800 text-xs font-bold flex flex-col items-center gap-1 transition-colors"
              >
                <Stethoscope className="w-4 h-4 text-sky-600" />
                <span>Doctor</span>
              </button>

              <button
                type="button"
                onClick={() => loginAsDemo('patient@hospital.com')}
                className="p-2.5 rounded-xl border border-emerald-100 bg-emerald-50/70 hover:bg-emerald-100 text-emerald-800 text-xs font-bold flex flex-col items-center gap-1 transition-colors"
              >
                <User className="w-4 h-4 text-emerald-600" />
                <span>Patient</span>
              </button>
            </div>
          </div>

          {/* Login Form */}
          <Card>
            <CardContent className="p-6 sm:p-8">
              <form onSubmit={handleLogin} className="space-y-4">
                {errorMsg && (
                  <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                <Input
                  label="Email Address"
                  type="email"
                  placeholder="your.email@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  leftIcon={<Mail className="w-4 h-4" />}
                  required
                />

                <Input
                  label="Password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  leftIcon={<Lock className="w-4 h-4" />}
                  required
                />

                <div className="flex items-center justify-between text-xs pt-1">
                  <label className="flex items-center gap-2 text-slate-600 cursor-pointer">
                    <input type="checkbox" className="rounded border-slate-300 text-primary-600 focus:ring-primary-500" />
                    <span>Remember me</span>
                  </label>
                  <Link href="/forgot-password" className="text-primary-600 hover:underline font-semibold">
                    Forgot Password?
                  </Link>
                </div>

                <div className="pt-2">
                  <Button type="submit" size="md" variant="primary" className="w-full" isLoading={loading}>
                    Sign In
                  </Button>
                </div>
              </form>

              <div className="mt-6 pt-5 border-t border-slate-100 text-center text-xs text-slate-500">
                Don't have an account yet?{' '}
                <Link href="/register" className="font-bold text-primary-600 hover:underline">
                  Create New Account &rarr;
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

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50 flex items-center justify-center">Loading...</div>}>
      <LoginContent />
    </Suspense>
  );
}
