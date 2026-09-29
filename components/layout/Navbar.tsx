'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store';
import { logout } from '../../store/slices/authSlice';
import {
  HeartPulse,
  PhoneCall,
  Calendar,
  Menu,
  X,
  LayoutDashboard,
  LogOut,
  ShieldAlert,
  UserCheck
} from 'lucide-react';
import { Button } from '../ui/Button';

export const Navbar: React.FC = () => {
  const pathname = usePathname();
  const dispatch = useDispatch();
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { label: 'Home', href: '/' },
    { label: 'About Us', href: '/about' },
    { label: 'Departments', href: '/departments' },
    { label: 'Doctors', href: '/doctors' },
    { label: 'Services', href: '/services' },
    { label: 'Facilities', href: '/facilities' },
    { label: 'Emergency', href: '/emergency' },
    { label: 'Contact', href: '/contact' },
  ];

  const getDashboardHref = () => {
    if (!user) return '/login';
    if (user.role === 'ADMIN') return '/dashboard/admin';
    if (user.role === 'DOCTOR') return '/dashboard/doctor';
    return '/dashboard/patient';
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 transition-all">
      {/* Top emergency & information banner */}
      <div className="bg-slate-900 text-slate-300 text-xs py-2 px-4 border-b border-slate-800">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 font-medium text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
              24/7 Level 1 Trauma Care Active
            </span>
            <span className="hidden sm:inline-block text-slate-500">|</span>
            <span className="hidden sm:inline-block text-slate-300">
              OPD Hours: Mon - Sat 08:00 AM - 08:00 PM
            </span>
          </div>
          <div className="flex items-center gap-4">
            <a
              href="tel:+15559110000"
              className="flex items-center gap-1.5 text-rose-400 hover:text-rose-300 font-semibold"
            >
              <PhoneCall className="w-3.5 h-3.5" />
              Emergency: +1 (555) 911-0000
            </a>
          </div>
        </div>
      </div>

      {/* Main navigation bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-primary-600 to-sky-400 flex items-center justify-center text-white shadow-md shadow-primary-500/20 group-hover:scale-105 transition-transform">
              <HeartPulse className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xl font-extrabold tracking-tight text-slate-900 flex items-center gap-1">
                Med<span className="text-primary-600">Pulse</span>
              </span>
              <span className="text-[10px] block uppercase tracking-widest text-slate-600 font-semibold">
                Tertiary Care Hospital
              </span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`text-sm font-medium px-3 py-2 rounded-xl transition-colors ${
                    isActive
                      ? 'text-primary-600 bg-primary-50/80 font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/60'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Right Action buttons */}
          <div className="hidden md:flex items-center gap-3">
            <Link href="/appointments">
              <Button size="sm" variant="outline" leftIcon={<Calendar className="w-4 h-4 text-primary-600" />}>
                Book Visit
              </Button>
            </Link>

            {isAuthenticated && user ? (
              <div className="flex items-center gap-2">
                <Link href={getDashboardHref()}>
                  <Button size="sm" variant="primary" leftIcon={<LayoutDashboard className="w-4 h-4" />}>
                    {user.role} Portal
                  </Button>
                </Link>
                <button
                  onClick={() => dispatch(logout())}
                  title="Logout"
                  className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link href="/login">
                  <Button size="sm" variant="ghost">
                    Sign In
                  </Button>
                </Link>
                <Link href="/register">
                  <Button size="sm" variant="primary">
                    Register
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile hamburger button */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-slate-600 hover:bg-slate-100"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-6 space-y-2 shadow-xl">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileMenuOpen(false)}
              className="block text-sm font-medium px-3 py-2 rounded-xl text-slate-700 hover:bg-slate-100"
            >
              {link.label}
            </Link>
          ))}
          <div className="pt-4 border-t border-slate-100 space-y-2">
            <Link href="/appointments" onClick={() => setMobileMenuOpen(false)} className="block w-full">
              <Button size="sm" variant="outline" className="w-full">
                Book Appointment
              </Button>
            </Link>
            {isAuthenticated ? (
              <Link href={getDashboardHref()} onClick={() => setMobileMenuOpen(false)} className="block w-full">
                <Button size="sm" variant="primary" className="w-full">
                  Go to {user?.role} Dashboard
                </Button>
              </Link>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                  <Button size="sm" variant="ghost" className="w-full">
                    Sign In
                  </Button>
                </Link>
                <Link href="/register" onClick={() => setMobileMenuOpen(false)}>
                  <Button size="sm" variant="primary" className="w-full">
                    Register
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
