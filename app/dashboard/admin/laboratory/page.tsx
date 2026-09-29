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
  FlaskConical,
  Plus,
  Search,
  FileCheck2,
  Download,
  AlertCircle,
  CheckCircle2,
  Clock,
  Activity,
  Layers
} from 'lucide-react';

export default function AdminLaboratoryPage() {
  const [activeTab, setActiveTab] = useState<'requests' | 'catalog'>('requests');
  const [requests, setRequests] = useState<any[]>([]);
  const [catalog, setCatalog] = useState<any[]>([]);
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Add Test to Catalog Modal
  const [isCatalogModalOpen, setIsCatalogModalOpen] = useState(false);
  const [submittingTest, setSubmittingTest] = useState(false);
  const [testForm, setTestForm] = useState({
    name: '',
    code: '',
    category: 'Hematology',
    sampleType: 'Blood',
    price: 45,
    turnaroundHours: 24,
    description: ''
  });

  // Enter Results Modal
  const [isResultModalOpen, setIsResultModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<any | null>(null);
  const [resultValues, setResultValues] = useState<{ [testId: string]: { value: string; isAbnormal: boolean } }>({});
  const [technicianNotes, setTechnicianNotes] = useState('Specimen processed according to standard protocols.');
  const [submittingResults, setSubmittingResults] = useState(false);

  useEffect(() => {
    fetchRequests();
    fetchCatalog();
    fetchReports();
  }, []);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const res = await api.get('/laboratory/requests?limit=50');
      setRequests(res.data.data || []);
    } catch (err) {
      console.error('Failed to load lab requests:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCatalog = async () => {
    try {
      const res = await api.get('/laboratory/tests');
      setCatalog(res.data.data || []);
    } catch (err) {
      console.error('Failed to load lab catalog:', err);
    }
  };

  const fetchReports = async () => {
    try {
      const res = await api.get('/laboratory/reports?limit=50');
      setReports(res.data.data || []);
    } catch (err) {
      console.error('Failed to load lab reports:', err);
    }
  };

  const handleAddCatalogTest = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingTest(true);
    try {
      await api.post('/laboratory/tests', testForm);
      setMessage({ type: 'success', text: 'New diagnostic test added to catalog!' });
      setIsCatalogModalOpen(false);
      setTimeout(() => setMessage(null), 3000);
      fetchCatalog();
    } catch (err: any) {
      setMessage({
        type: 'error',
        text: err.response?.data?.message || 'Failed to add test.'
      });
    } finally {
      setSubmittingTest(false);
    }
  };

  const openResultModal = (req: any) => {
    setSelectedRequest(req);
    const initial: any = {};
    (req.tests || []).forEach((t: any) => {
      initial[t._id] = { value: 'Normal', isAbnormal: false };
    });
    setResultValues(initial);
    setIsResultModalOpen(true);
  };

  const handleSaveResults = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRequest?._id) return;

    setSubmittingResults(true);
    try {
      const formattedResults = (selectedRequest.tests || []).map((t: any) => ({
        testName: t.name,
        value: resultValues[t._id]?.value || '12.5',
        unit: 'mg/dL',
        referenceRange: 'Normal',
        isAbnormal: resultValues[t._id]?.isAbnormal || false
      }));

      await api.post(`/laboratory/requests/${selectedRequest._id}/results`, {
        results: formattedResults,
        technicianNotes
      });

      setMessage({ type: 'success', text: 'Lab diagnostic results entered and PDF report generated!' });
      setIsResultModalOpen(false);
      setTimeout(() => setMessage(null), 3000);
      fetchRequests();
      fetchReports();
    } catch (err: any) {
      setMessage({
        type: 'error',
        text: err.response?.data?.message || 'Failed to submit test results.'
      });
    } finally {
      setSubmittingResults(false);
    }
  };

  const findReportForRequest = (reqId: string) => {
    return reports.find((rep) => rep.request?._id === reqId || rep.request === reqId);
  };

  return (
    <DashboardLayout allowedRoles={['ADMIN']}>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Diagnostic Laboratory Center</h1>
            <p className="text-sm text-slate-500 mt-1">
              Test catalog management, diagnostic order routing, specimen analysis & PDF reports
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              onClick={() => setIsCatalogModalOpen(true)}
              className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700"
            >
              <Plus className="w-4 h-4" /> Add Catalog Test
            </Button>
          </div>
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

        {/* Tab Switcher */}
        <div className="flex items-center border-b border-slate-200 gap-6">
          <button
            onClick={() => setActiveTab('requests')}
            className={`pb-3 text-sm font-semibold transition-all relative ${
              activeTab === 'requests'
                ? 'text-teal-700 border-b-2 border-teal-600'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            Diagnostic Requests ({requests.length})
          </button>
          <button
            onClick={() => setActiveTab('catalog')}
            className={`pb-3 text-sm font-semibold transition-all relative ${
              activeTab === 'catalog'
                ? 'text-teal-700 border-b-2 border-teal-600'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            Test Catalog ({catalog.length})
          </button>
        </div>

        {/* TAB 1: Diagnostic Requests */}
        {activeTab === 'requests' && (
          <Card>
            <CardContent className="p-0 overflow-x-auto">
              {loading ? (
                <div className="p-6 space-y-3">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Skeleton key={i} className="h-14 w-full rounded-lg" />
                  ))}
                </div>
              ) : requests.length === 0 ? (
                <EmptyState
                  icon={FlaskConical}
                  title="No Lab Requests"
                  description="No diagnostic requests currently ordered."
                />
              ) : (
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 text-xs uppercase font-semibold">
                    <tr>
                      <th className="py-3 px-4">Request ID</th>
                      <th className="py-3 px-4">Patient Profile</th>
                      <th className="py-3 px-4">Ordered Tests</th>
                      <th className="py-3 px-4">Requesting Doctor</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {requests.map((r) => {
                      const rep = findReportForRequest(r._id);
                      const isCompleted = r.status === 'Completed';

                      return (
                        <tr key={r._id} className="hover:bg-slate-50/70 transition-colors">
                          <td className="py-3 px-4 font-mono text-xs font-bold text-teal-800">
                            {r.requestNumber || r._id.slice(-6).toUpperCase()}
                          </td>

                          <td className="py-3 px-4">
                            <p className="font-semibold text-slate-900">
                              {r.patient?.firstName} {r.patient?.lastName}
                            </p>
                            <span className="text-[11px] font-mono text-slate-400">
                              {r.patient?.patientId}
                            </span>
                          </td>

                          <td className="py-3 px-4">
                            <div className="flex flex-wrap gap-1">
                              {(r.tests || []).map((t: any) => (
                                <span
                                  key={t._id}
                                  className="text-[11px] font-medium px-2 py-0.5 rounded bg-slate-100 text-slate-700"
                                >
                                  {t.name}
                                </span>
                              ))}
                            </div>
                          </td>

                          <td className="py-3 px-4 text-xs text-slate-700">
                            Dr. {r.doctor?.firstName} {r.doctor?.lastName}
                          </td>

                          <td className="py-3 px-4">
                            <Badge
                              variant={
                                isCompleted
                                  ? 'success'
                                  : r.status === 'In-Progress'
                                  ? 'primary'
                                  : 'warning'
                              }
                              className="text-xs"
                            >
                              {r.status}
                            </Badge>
                          </td>

                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              {!isCompleted && (
                                <Button
                                  size="sm"
                                  onClick={() => openResultModal(r)}
                                  className="text-xs bg-teal-600 hover:bg-teal-700"
                                >
                                  Enter Results
                                </Button>
                              )}

                              {isCompleted && rep?.pdfUrl && (
                                <a
                                  href={rep.pdfUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex"
                                >
                                  <Button size="sm" variant="outline" className="text-xs flex items-center gap-1.5">
                                    <Download className="w-3.5 h-3.5" /> PDF Report
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
        )}

        {/* TAB 2: Test Catalog */}
        {activeTab === 'catalog' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {catalog.map((t) => (
              <Card key={t._id} className="hover:shadow-md transition-shadow">
                <CardHeader className="border-b border-slate-100 pb-3 flex flex-row items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center font-bold text-xs">
                      {t.code?.slice(0, 3) || 'LAB'}
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">{t.name}</h4>
                      <span className="text-[10px] font-mono text-slate-400 font-bold">{t.code}</span>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded">
                    ${t.price}
                  </span>
                </CardHeader>
                <CardContent className="p-4 space-y-2 text-xs text-slate-600">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Category:</span>
                    <span className="font-medium text-slate-800">{t.category}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Sample Specimen:</span>
                    <span className="font-medium text-slate-800">{t.sampleType || 'Blood'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Turnaround Time:</span>
                    <span className="font-medium text-slate-800">{t.turnaroundHours || 24} Hours</span>
                  </div>
                  {t.description && (
                    <p className="text-[11px] text-slate-500 pt-2 border-t border-slate-100 mt-2 line-clamp-2">
                      {t.description}
                    </p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Enter Test Results Modal */}
        <Modal
          isOpen={isResultModalOpen}
          onClose={() => setIsResultModalOpen(false)}
          title={`Enter Diagnostic Results: ${selectedRequest?.requestNumber || ''}`}
        >
          {selectedRequest && (
            <form onSubmit={handleSaveResults} className="space-y-4">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs">
                <span className="text-slate-500">Patient:</span>{' '}
                <span className="font-bold text-slate-900">
                  {selectedRequest.patient?.firstName} {selectedRequest.patient?.lastName} (
                  {selectedRequest.patient?.patientId})
                </span>
              </div>

              <div className="space-y-3">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500 block">
                  Individual Test Results
                </label>
                {(selectedRequest.tests || []).map((t: any) => (
                  <div key={t._id} className="p-3 rounded-lg border border-slate-200 bg-white space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-800">{t.name}</span>
                      <span className="text-[11px] text-slate-400">{t.sampleType || 'Blood'}</span>
                    </div>

                    <div className="grid grid-cols-2 gap-3 items-center">
                      <div>
                        <Input
                          placeholder="Measured Result Value (e.g. 14.2 g/dL)"
                          value={resultValues[t._id]?.value || ''}
                          onChange={(e) =>
                            setResultValues({
                              ...resultValues,
                              [t._id]: {
                                ...resultValues[t._id],
                                value: e.target.value
                              }
                            })
                          }
                          required
                          className="text-xs"
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <label className="flex items-center gap-1.5 text-xs font-semibold text-rose-600 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={resultValues[t._id]?.isAbnormal || false}
                            onChange={(e) =>
                              setResultValues({
                                ...resultValues,
                                [t._id]: {
                                  ...resultValues[t._id],
                                  isAbnormal: e.target.checked
                                }
                              })
                            }
                            className="rounded border-slate-300 text-rose-600 focus:ring-rose-500"
                          />
                          Abnormal Flag
                        </label>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Technician Clinical Notes
                </label>
                <Input
                  value={technicianNotes}
                  onChange={(e) => setTechnicianNotes(e.target.value)}
                  placeholder="Clinical remarks or specimen notes"
                />
              </div>

              <div className="pt-4 flex justify-end gap-2 border-t border-slate-100">
                <Button type="button" variant="outline" onClick={() => setIsResultModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={submittingResults} className="bg-teal-600 hover:bg-teal-700">
                  {submittingResults ? 'Generating Report...' : 'Publish Official PDF Report'}
                </Button>
              </div>
            </form>
          )}
        </Modal>

        {/* Add Test to Catalog Modal */}
        <Modal
          isOpen={isCatalogModalOpen}
          onClose={() => setIsCatalogModalOpen(false)}
          title="Add New Diagnostic Test to Catalog"
        >
          <form onSubmit={handleAddCatalogTest} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Test Name</label>
                <Input
                  value={testForm.name}
                  onChange={(e) => setTestForm({ ...testForm, name: e.target.value })}
                  placeholder="e.g. Lipid Profile"
                  required
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Test Code</label>
                <Input
                  value={testForm.code}
                  onChange={(e) => setTestForm({ ...testForm, code: e.target.value.toUpperCase() })}
                  placeholder="e.g. LIPID-01"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Category</label>
                <Select
                  value={testForm.category}
                  onChange={(e) => setTestForm({ ...testForm, category: e.target.value })}
                  options={[
                    { value: 'Hematology', label: 'Hematology' },
                    { value: 'Biochemistry', label: 'Biochemistry' },
                    { value: 'Microbiology', label: 'Microbiology' },
                    { value: 'Pathology', label: 'Pathology' },
                    { value: 'Radiology', label: 'Radiology / Imaging' }
                  ]}
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Sample Specimen</label>
                <Select
                  value={testForm.sampleType}
                  onChange={(e) => setTestForm({ ...testForm, sampleType: e.target.value })}
                  options={[
                    { value: 'Blood', label: 'Blood' },
                    { value: 'Urine', label: 'Urine' },
                    { value: 'Serum', label: 'Serum' },
                    { value: 'Swab', label: 'Swab' },
                    { value: 'Biopsy', label: 'Tissue Biopsy' }
                  ]}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Fee ($ USD)</label>
                <Input
                  type="number"
                  min={0}
                  value={testForm.price}
                  onChange={(e) => setTestForm({ ...testForm, price: parseFloat(e.target.value) || 0 })}
                  required
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Turnaround (Hours)</label>
                <Input
                  type="number"
                  min={1}
                  value={testForm.turnaroundHours}
                  onChange={(e) =>
                    setTestForm({ ...testForm, turnaroundHours: parseInt(e.target.value, 10) || 24 })
                  }
                  required
                />
              </div>
            </div>

            <div className="pt-4 flex justify-end gap-2 border-t border-slate-100">
              <Button type="button" variant="outline" onClick={() => setIsCatalogModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={submittingTest} className="bg-teal-600 hover:bg-teal-700">
                {submittingTest ? 'Saving...' : 'Add to Catalog'}
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </DashboardLayout>
  );
}
