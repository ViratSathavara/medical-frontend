'use client';

import React, { useEffect, useState } from 'react';
import { DashboardLayout } from '../../../../components/layout/DashboardLayout';
import { Card, CardHeader, CardContent } from '../../../../components/ui/Card';
import { Button } from '../../../../components/ui/Button';
import { Badge } from '../../../../components/ui/Badge';
import { Input } from '../../../../components/ui/Input';
import { Select } from '../../../../components/ui/Select';
import { Skeleton } from '../../../../components/ui/Skeleton';
import { EmptyState } from '../../../../components/ui/EmptyState';
import api from '../../../../services/api';
import {
  FileText,
  Search,
  Filter,
  ShieldCheck,
  Clock,
  User,
  Activity,
  Globe
} from 'lucide-react';

export default function AdminAuditLogsPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionSearch, setActionSearch] = useState('');
  const [moduleFilter, setModuleFilter] = useState('All');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    fetchLogs();
  }, [page, moduleFilter, actionSearch]);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/audit-logs', {
        params: {
          page,
          limit: 15,
          module: moduleFilter !== 'All' ? moduleFilter : undefined,
          action: actionSearch || undefined
        }
      });
      setLogs(res.data.data || []);
      setTotalPages(res.data.pagination?.totalPages || 1);
      setTotalCount(res.data.pagination?.total || 0);
    } catch (err) {
      console.error('Failed to load audit logs:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout allowedRoles={['ADMIN']}>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <ShieldCheck className="w-6 h-6 text-teal-600" /> System Security & Audit Trail
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Immutable forensic logging of user actions, clinical record modifications & access attempts
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold px-3 py-1.5 rounded-full bg-slate-100 text-slate-700">
              {totalCount} Total Audit Events
            </span>
          </div>
        </div>

        {/* HIPAA Compliance Info Card */}
        <div className="p-4 rounded-xl bg-teal-50/60 border border-teal-200/80 flex items-start gap-3">
          <ShieldCheck className="w-5 h-5 text-teal-700 shrink-0 mt-0.5" />
          <div className="text-xs text-teal-900 leading-relaxed">
            <span className="font-bold">HIPAA & GDPR Technical Safeguards Active:</span> All medical
            record access, patient discharge operations, medication prescriptions, and authentication
            attempts are cryptographically bound to authenticated user sessions and audited in real time.
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="relative w-full sm:max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <Input
              value={actionSearch}
              onChange={(e) => {
                setActionSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Search by action (e.g. LOGIN, CREATED, DISPENSED)..."
              className="pl-9 bg-white"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Filter className="w-4 h-4 text-slate-400" />
            <Select
              value={moduleFilter}
              onChange={(e) => {
                setModuleFilter(e.target.value);
                setPage(1);
              }}
              options={[
                { value: 'All', label: 'All Modules' },
                { value: 'AUTH', label: 'AUTH / Access' },
                { value: 'PATIENTS', label: 'PATIENTS' },
                { value: 'DOCTORS', label: 'DOCTORS' },
                { value: 'APPOINTMENTS', label: 'APPOINTMENTS' },
                { value: 'EMR', label: 'EMR / Medical Records' },
                { value: 'PRESCRIPTIONS', label: 'PRESCRIPTIONS' },
                { value: 'PHARMACY', label: 'PHARMACY' },
                { value: 'LABORATORY', label: 'LABORATORY' },
                { value: 'BILLING', label: 'BILLING' },
                { value: 'INPATIENT', label: 'INPATIENT' },
                { value: 'EMERGENCY', label: 'EMERGENCY' }
              ]}
              className="w-52 bg-white"
            />
          </div>
        </div>

        {/* Logs Table */}
        <Card>
          <CardContent className="p-0 overflow-x-auto">
            {loading ? (
              <div className="p-6 space-y-3">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <Skeleton key={i} className="h-12 w-full rounded-lg" />
                ))}
              </div>
            ) : logs.length === 0 ? (
              <EmptyState
                icon={FileText}
                title="No Audit Logs Recorded"
                description={
                  actionSearch || moduleFilter !== 'All'
                    ? 'No log entries match the search filters.'
                    : 'System audit log is clear.'
                }
              />
            ) : (
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 text-xs uppercase font-semibold">
                  <tr>
                    <th className="py-3 px-4">Timestamp</th>
                    <th className="py-3 px-4">Authorized User</th>
                    <th className="py-3 px-4">Module</th>
                    <th className="py-3 px-4">Action Event</th>
                    <th className="py-3 px-4">Resource Identifier</th>
                    <th className="py-3 px-4 text-right">IP Address</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {logs.map((log) => (
                    <tr key={log._id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-4 text-xs text-slate-500 font-mono">
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>
                            {new Date(log.timestamp || log.createdAt).toLocaleDateString()}{' '}
                            {new Date(log.timestamp || log.createdAt).toLocaleTimeString()}
                          </span>
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <p className="font-semibold text-slate-900 text-xs">{log.userEmail || 'System Process'}</p>
                        <span className="text-[10px] text-slate-400 font-mono uppercase">
                          Role: {log.userRole || 'SYSTEM'}
                        </span>
                      </td>

                      <td className="py-3 px-4">
                        <span className="text-xs font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded font-mono">
                          {log.module}
                        </span>
                      </td>

                      <td className="py-3 px-4">
                        <Badge
                          variant={
                            log.action?.includes('DELETE') || log.action?.includes('REJECT')
                              ? 'danger'
                              : log.action?.includes('CREATE') || log.action?.includes('ADMIT')
                              ? 'success'
                              : 'primary'
                          }
                          className="font-mono text-[11px]"
                        >
                          {log.action}
                        </Badge>
                      </td>

                      <td className="py-3 px-4 text-xs font-mono text-slate-500 max-w-xs truncate">
                        {log.resourceId || 'N/A'}
                      </td>

                      <td className="py-3 px-4 text-right font-mono text-xs text-slate-400">
                        {log.ipAddress || '127.0.0.1'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="p-4 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs text-slate-500">
                  Page {page} of {totalPages}
                </span>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={page <= 1}
                    onClick={() => setPage(page - 1)}
                  >
                    Previous
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={page >= totalPages}
                    onClick={() => setPage(page + 1)}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
