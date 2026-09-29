'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store';
import { logout } from '../../store/slices/authSlice';
import api from '../../services/api';
import {
  HeartPulse,
  LayoutDashboard,
  Calendar,
  Users,
  FileText,
  Pill,
  FlaskConical,
  Receipt,
  BedDouble,
  Building,
  ShieldCheck,
  Bell,
  MessageSquare,
  LogOut,
  User,
  Settings,
  Menu,
  X,
  Stethoscope,
  Activity,
  AlertTriangle,
  History,
  UserCheck
} from 'lucide-react';
import { Badge } from '../ui/Badge';

interface DashboardLayoutProps {
  children: React.ReactNode;
  allowedRoles: ('ADMIN' | 'DOCTOR' | 'PATIENT' | 'STAFF')[];
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  children,
  allowedRoles
}) => {
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useDispatch();
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [unreadNotifications, setUnreadNotifications] = useState(0);

  // Authentication & RBAC protection
  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    if (user && !allowedRoles.includes(user.role)) {
      // Redirect to proper role dashboard
      if (user.role === 'ADMIN') router.push('/dashboard/admin');
      else if (user.role === 'DOCTOR') router.push('/dashboard/doctor');
      else router.push('/dashboard/patient');
    }
  }, [isAuthenticated, user, allowedRoles, router]);

  // Fetch unread notifications
  useEffect(() => {
    if (isAuthenticated) {
      api.get('/communication/notifications')
        .then((res) => {
          setUnreadNotifications(res.data.data?.unreadCount || 0);
        })
        .catch(() => {});
    }
  }, [isAuthenticated]);

  // Patient Navigation Links
  const patientNav = [
    { label: 'Overview', href: '/dashboard/patient', icon: LayoutDashboard },
    { label: 'My Appointments', href: '/dashboard/patient/appointments', icon: Calendar },
    { label: 'Hospital Doctors', href: '/doctors', icon: Stethoscope },
    { label: 'Medical History & EMR', href: '/dashboard/patient/medical-records', icon: FileText },
    { label: 'Prescriptions', href: '/dashboard/patient/prescriptions', icon: Pill },
    { label: 'Lab Reports', href: '/dashboard/patient/lab-reports', icon: FlaskConical },
    { label: 'Invoices & Billing', href: '/dashboard/patient/invoices', icon: Receipt },
    { label: 'Secure Messages', href: '/dashboard/patient/messages', icon: MessageSquare },
    { label: 'Patient Profile', href: '/dashboard/patient/profile', icon: User },
  ];

  // Doctor Navigation Links
  const doctorNav = [
    { label: 'Doctor Hub', href: '/dashboard/doctor', icon: LayoutDashboard },
    { label: 'Appointments', href: '/dashboard/doctor/appointments', icon: Calendar },
    { label: 'Patient Directory', href: '/dashboard/doctor/patients', icon: Users },
    { label: 'Consultation & EMR', href: '/dashboard/doctor/consultation', icon: FileText },
    { label: 'Prescriptions', href: '/dashboard/doctor/prescriptions', icon: Pill },
    { label: 'Schedule & Slots', href: '/dashboard/doctor/schedule', icon: Activity },
    { label: 'Messages', href: '/dashboard/doctor/messages', icon: MessageSquare },
  ];

  // Admin Navigation Links
  const adminNav = [
    { label: 'Analytics Dashboard', href: '/dashboard/admin', icon: LayoutDashboard },
    { label: 'User Accounts', href: '/dashboard/admin/users', icon: UserCheck },
    { label: 'Doctor Approvals', href: '/dashboard/admin/doctors', icon: Stethoscope },
    { label: 'Patient Registry', href: '/dashboard/admin/patients', icon: Users },
    { label: 'Staff Directory', href: '/dashboard/admin/staff', icon: ShieldCheck },
    { label: 'Departments', href: '/dashboard/admin/departments', icon: Building },
    { label: 'Appointments', href: '/dashboard/admin/appointments', icon: Calendar },
    { label: 'Pharmacy & Stock', href: '/dashboard/admin/pharmacy', icon: Pill },
    { label: 'Laboratory Center', href: '/dashboard/admin/laboratory', icon: FlaskConical },
    { label: 'Billing & Invoices', href: '/dashboard/admin/billing', icon: Receipt },
    { label: 'Rooms & Beds', href: '/dashboard/admin/rooms', icon: BedDouble },
    { label: 'Inpatient Admissions', href: '/dashboard/admin/inpatient', icon: History },
    { label: 'Emergency Trauma', href: '/dashboard/admin/emergency', icon: AlertTriangle },
    { label: 'System Audit Logs', href: '/dashboard/admin/audit-logs', icon: FileText },
    { label: 'Hospital Settings', href: '/dashboard/admin/settings', icon: Settings },
  ];

  const currentNav =
    user?.role === 'ADMIN' ? adminNav : user?.role === 'DOCTOR' ? doctorNav : patientNav;

  const handleLogout = () => {
    dispatch(logout());
    router.push('/login');
  };

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <HeartPulse className="w-10 h-10 text-primary-600 animate-pulse" />
          <p className="text-sm font-medium text-slate-500">Authenticating secure session...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar Desktop */}
      <aside className="hidden lg:flex flex-col w-72 bg-white border-r border-slate-200/80 fixed inset-y-0 z-30 shadow-sm">
        {/* Brand */}
        <div className="h-20 px-6 border-b border-slate-100 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-primary-600 to-sky-400 flex items-center justify-center text-white shadow-md shadow-primary-500/20">
              <HeartPulse className="w-6 h-6" />
            </div>
            <div>
              <span className="text-lg font-bold text-slate-900 tracking-tight">
                Med<span className="text-primary-600">Pulse</span>
              </span>
              <span className="text-[10px] block font-semibold text-slate-400 uppercase tracking-widest">
                HMS Portal
              </span>
            </div>
          </Link>
        </div>

        {/* Role & User Badge */}
        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Signed in as
            </span>
            <Badge
              variant={
                user.role === 'ADMIN' ? 'danger' : user.role === 'DOCTOR' ? 'info' : 'success'
              }
              size="sm"
            >
              {user.role}
            </Badge>
          </div>
          <p className="text-sm font-semibold text-slate-800 truncate mt-1">
            {user.firstName ? `${user.firstName} ${user.lastName || ''}` : user.email}
          </p>
          <p className="text-xs text-slate-400 truncate">{user.email}</p>
        </div>

        {/* Navigation items */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-1">
          {currentNav.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-primary-600 text-white shadow-sm shadow-primary-500/30'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span className="truncate">{item.label}</span>
              </Link>
            );
          })}
        </div>

        {/* Bottom logout */}
        <div className="p-4 border-t border-slate-100">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-3.5 py-2.5 rounded-xl text-sm font-medium text-rose-600 hover:bg-rose-50 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 lg:pl-72 flex flex-col min-w-0">
        {/* Top Navbar */}
        <header className="h-16 bg-white border-b border-slate-200/80 sticky top-0 z-20 px-4 sm:px-8 flex items-center justify-between shadow-soft">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100"
            >
              <Menu className="w-5 h-5" />
            </button>
            <h1 className="text-base font-semibold text-slate-800 capitalize hidden sm:block">
              {user.role.toLowerCase()} Management Portal
            </h1>
          </div>

          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="hidden sm:inline-flex text-xs font-semibold text-slate-500 hover:text-primary-600 transition-colors"
            >
              Public Website &rarr;
            </Link>

            {/* Notification Bell */}
            <div className="relative">
              <button
                title="Notifications"
                className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors relative"
              >
                <Bell className="w-5 h-5" />
                {unreadNotifications > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white"></span>
                )}
              </button>
            </div>

            {/* Profile Avatar */}
            <div className="flex items-center gap-2.5 pl-3 border-l border-slate-200">
              <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-700 font-bold flex items-center justify-center text-xs border border-primary-200">
                {user.firstName ? user.firstName[0].toUpperCase() : 'U'}
              </div>
              <div className="hidden md:block text-left">
                <p className="text-xs font-semibold text-slate-800 leading-tight">
                  {user.firstName ? `${user.firstName} ${user.lastName || ''}` : 'User'}
                </p>
                <p className="text-[10px] text-slate-400 leading-tight capitalize">{user.role}</p>
              </div>
            </div>
          </div>
        </header>

        {/* Dashboard Child View */}
        <main className="flex-1 p-4 sm:p-8 max-w-7xl w-full mx-auto">{children}</main>
      </div>

      {/* Mobile Sidebar Drawer */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
          />
          <div className="fixed inset-y-0 left-0 w-72 bg-white shadow-2xl flex flex-col z-50">
            <div className="h-16 px-6 border-b border-slate-100 flex items-center justify-between">
              <span className="font-bold text-slate-900">Navigation Menu</span>
              <button onClick={() => setSidebarOpen(false)} className="p-2 text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-1">
              {currentNav.map((item) => {
                const isActive = pathname === item.href;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setSidebarOpen(false)}
                    className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium ${
                      isActive ? 'bg-primary-600 text-white' : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>

            <div className="p-4 border-t border-slate-100">
              <button
                onClick={handleLogout}
                className="flex items-center gap-3 w-full px-3.5 py-2.5 rounded-xl text-sm font-medium text-rose-600 hover:bg-rose-50"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
