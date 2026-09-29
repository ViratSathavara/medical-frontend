'use client';

import React, { useEffect, useState } from 'react';
import { DashboardLayout } from '../../../../components/layout/DashboardLayout';
import { Card, CardHeader, CardContent } from '../../../../components/ui/Card';
import { Button } from '../../../../components/ui/Button';
import { Badge } from '../../../../components/ui/Badge';
import { EmptyState } from '../../../../components/ui/EmptyState';
import { Skeleton } from '../../../../components/ui/Skeleton';
import api from '../../../../services/api';
import { LabReport } from '../../../../types';
import { FlaskConical, Download, Calendar, CheckCircle2, AlertTriangle } from 'lucide-react';

export default function PatientLabReports() {
  const [reports, setReports] = useState<LabReport[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/laboratory/reports?limit=50')
      .then((res) => setReports(res.data.data || []))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <DashboardLayout allowedRoles={['PATIENT']}>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Diagnostic Pathology & Lab Reports</h1>
          <p className="text-xs text-slate-500 mt-1">Verified diagnostic investigation results with biological reference intervals</p>
        </div>

        {loading ? (
          <div className="space-y-4">
            <Skeleton className="h-44 w-full" />
            <Skeleton className="h-44 w-full" />
          </div>
        ) : reports.length === 0 ? (
          <EmptyState
            title="No Lab Reports"
            description="Your diagnostic laboratory results will be published here upon pathologist approval."
          />
        ) : (
          <div className="space-y-6">
            {reports.map((rep) => (
              <Card key={rep._id} className="p-6 space-y-5">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center font-bold">
                      <FlaskConical className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-bold text-slate-900">{rep.reportNumber}</h3>
                        <Badge variant="success" size="sm">Pathologist Verified</Badge>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Referring Doctor: Dr. {rep.doctor?.firstName} {rep.doctor?.lastName} ({rep.doctor?.specialization})
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-xs text-slate-500 flex items-center gap-1 font-medium">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      {new Date(rep.completedAt).toLocaleDateString()}
                    </span>
                    {rep.pdfUrl && (
                      <a href={rep.pdfUrl} target="_blank" rel="noreferrer" download>
                        <Button size="sm" variant="primary" leftIcon={<Download className="w-4 h-4" />}>
                          Download Report PDF
                        </Button>
                      </a>
                    )}
                  </div>
                </div>

                {/* Results Table */}
                <div className="overflow-x-auto rounded-xl border border-slate-200/80">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200">
                      <tr>
                        <th className="py-2.5 px-4">Investigation Parameter</th>
                        <th className="py-2.5 px-4">Observed Result</th>
                        <th className="py-2.5 px-4">Biological Reference Range</th>
                        <th className="py-2.5 px-4">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700">
                      {rep.results?.map((res, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/50">
                          <td className="py-2.5 px-4 font-bold text-slate-900">{res.testName}</td>
                          <td className="py-2.5 px-4 font-semibold text-slate-800">{res.result} {res.units}</td>
                          <td className="py-2.5 px-4 text-slate-500">{res.normalRange || 'Standard'}</td>
                          <td className="py-2.5 px-4">
                            {res.flag === 'Abnormal' || res.flag === 'Critical' ? (
                              <Badge variant="danger" size="sm">{res.flag}</Badge>
                            ) : (
                              <Badge variant="success" size="sm">Normal</Badge>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
