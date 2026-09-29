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
  Receipt,
  Plus,
  Search,
  Filter,
  Download,
  CreditCard,
  DollarSign,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Trash2
} from 'lucide-react';

export default function AdminBillingPage() {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [patients, setPatients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Create Invoice Modal State
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [submittingInvoice, setSubmittingInvoice] = useState(false);
  const [patientId, setPatientId] = useState('');
  const [invoiceItems, setInvoiceItems] = useState<{ description: string; quantity: number; unitPrice: number }[]>([
    { description: 'Specialist Clinical Consultation', quantity: 1, unitPrice: 120 }
  ]);
  const [discount, setDiscount] = useState<number>(0);
  const [tax, setTax] = useState<number>(10);
  const [notes, setNotes] = useState('Payment due within 14 days of invoice issue.');

  // Record Payment Modal State
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedInvoiceForPay, setSelectedInvoiceForPay] = useState<any | null>(null);
  const [payAmount, setPayAmount] = useState<number>(0);
  const [payMethod, setPayMethod] = useState('CARD');
  const [submittingPayment, setSubmittingPayment] = useState(false);

  useEffect(() => {
    fetchInvoices();
    fetchPatients();
  }, [statusFilter]);

  const fetchInvoices = async () => {
    setLoading(true);
    try {
      const res = await api.get('/billing/invoices', {
        params: {
          limit: 100,
          status: statusFilter !== 'All' ? statusFilter : undefined
        }
      });
      setInvoices(res.data.data || []);
    } catch (err) {
      console.error('Failed to load invoices:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchPatients = async () => {
    try {
      const res = await api.get('/patients?limit=100');
      const pats = res.data.data || [];
      setPatients(pats);
      if (pats.length > 0) setPatientId(pats[0]._id);
    } catch (err) {
      console.error('Failed to load patients for invoice dropdown:', err);
    }
  };

  const addItemRow = () => {
    setInvoiceItems([...invoiceItems, { description: '', quantity: 1, unitPrice: 50 }]);
  };

  const removeItemRow = (idx: number) => {
    setInvoiceItems(invoiceItems.filter((_, i) => i !== idx));
  };

  const updateItemRow = (idx: number, field: string, val: any) => {
    const updated = [...invoiceItems];
    updated[idx] = { ...updated[idx], [field]: val };
    setInvoiceItems(updated);
  };

  const subtotal = invoiceItems.reduce((acc, it) => acc + (it.quantity || 1) * (it.unitPrice || 0), 0);
  const totalDue = Math.max(0, subtotal - discount + tax);

  const handleCreateInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientId) {
      setMessage({ type: 'error', text: 'Please select a patient.' });
      return;
    }

    setSubmittingInvoice(true);
    try {
      await api.post('/billing/invoices', {
        patientId,
        items: invoiceItems,
        discount,
        tax,
        notes
      });
      setMessage({ type: 'success', text: 'Hospital billing invoice generated with verified PDF!' });
      setIsInvoiceModalOpen(false);
      setTimeout(() => setMessage(null), 3000);
      fetchInvoices();
    } catch (err: any) {
      setMessage({
        type: 'error',
        text: err.response?.data?.message || 'Failed to create invoice.'
      });
    } finally {
      setSubmittingInvoice(false);
    }
  };

  const openPaymentModal = (inv: any) => {
    setSelectedInvoiceForPay(inv);
    const balance = Math.max(0, inv.totalAmount - (inv.amountPaid || 0));
    setPayAmount(balance);
    setIsPaymentModalOpen(true);
  };

  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInvoiceForPay?._id) return;

    setSubmittingPayment(true);
    try {
      await api.post('/billing/payments', {
        invoiceId: selectedInvoiceForPay._id,
        amount: payAmount,
        paymentMethod: payMethod
      });
      setMessage({ type: 'success', text: `Payment of $${payAmount} successfully processed!` });
      setIsPaymentModalOpen(false);
      setTimeout(() => setMessage(null), 3000);
      fetchInvoices();
    } catch (err: any) {
      setMessage({
        type: 'error',
        text: err.response?.data?.message || 'Payment processing failed.'
      });
    } finally {
      setSubmittingPayment(false);
    }
  };

  const filteredInvoices = invoices.filter((inv) => {
    const q = search.toLowerCase();
    const invNum = (inv.invoiceNumber || '').toLowerCase();
    const patName = `${inv.patient?.firstName || ''} ${inv.patient?.lastName || ''}`.toLowerCase();
    const pid = (inv.patient?.patientId || '').toLowerCase();
    return invNum.includes(q) || patName.includes(q) || pid.includes(q);
  });

  return (
    <DashboardLayout allowedRoles={['ADMIN']}>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Hospital Billing & Invoices</h1>
            <p className="text-sm text-slate-500 mt-1">
              Patient accounts, clinical service fee schedules, multi-line invoices & payment reconciliation
            </p>
          </div>

          <Button
            onClick={() => setIsInvoiceModalOpen(true)}
            className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700"
          >
            <Plus className="w-4 h-4" /> Issue New Invoice
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

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="relative w-full sm:max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by invoice number (INV-...), patient..."
              className="pl-9 bg-white"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Filter className="w-4 h-4 text-slate-400" />
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              options={[
                { value: 'All', label: 'All Invoices' },
                { value: 'Pending', label: 'Unpaid / Pending' },
                { value: 'Partially-Paid', label: 'Partially Paid' },
                { value: 'Paid', label: 'Paid in Full' }
              ]}
              className="w-48 bg-white"
            />
          </div>
        </div>

        {/* Invoices Table */}
        <Card>
          <CardContent className="p-0 overflow-x-auto">
            {loading ? (
              <div className="p-6 space-y-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Skeleton key={i} className="h-14 w-full rounded-lg" />
                ))}
              </div>
            ) : filteredInvoices.length === 0 ? (
              <EmptyState
                icon={Receipt}
                title="No Invoices Found"
                description={
                  search || statusFilter !== 'All'
                    ? 'No invoices match the specified query.'
                    : 'No hospital invoices recorded yet.'
                }
                actionLabel="Issue New Invoice"
                onAction={() => setIsInvoiceModalOpen(true)}
              />
            ) : (
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 text-xs uppercase font-semibold">
                  <tr>
                    <th className="py-3 px-4">Invoice #</th>
                    <th className="py-3 px-4">Patient Profile</th>
                    <th className="py-3 px-4">Date Issued</th>
                    <th className="py-3 px-4">Total Amount</th>
                    <th className="py-3 px-4">Amount Paid</th>
                    <th className="py-3 px-4">Payment Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredInvoices.map((inv) => {
                    const isPaid = inv.paymentStatus === 'Paid';
                    const isPartial = inv.paymentStatus === 'Partially-Paid';

                    return (
                      <tr key={inv._id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3 px-4">
                          <span className="font-mono text-xs font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded">
                            {inv.invoiceNumber}
                          </span>
                        </td>

                        <td className="py-3 px-4">
                          <p className="font-semibold text-slate-900">
                            {inv.patient?.firstName} {inv.patient?.lastName}
                          </p>
                          <span className="text-[11px] font-mono text-slate-400">
                            {inv.patient?.patientId}
                          </span>
                        </td>

                        <td className="py-3 px-4 text-xs text-slate-500">
                          {new Date(inv.createdAt).toLocaleDateString()}
                        </td>

                        <td className="py-3 px-4 font-mono font-bold text-slate-900 text-xs">
                          ${inv.totalAmount?.toFixed(2)}
                        </td>

                        <td className="py-3 px-4 font-mono text-xs text-slate-700">
                          ${inv.amountPaid?.toFixed(2) || '0.00'}
                        </td>

                        <td className="py-3 px-4">
                          <Badge
                            variant={isPaid ? 'success' : isPartial ? 'warning' : 'danger'}
                            className="text-xs"
                          >
                            {inv.paymentStatus}
                          </Badge>
                        </td>

                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {!isPaid && (
                              <Button
                                size="sm"
                                onClick={() => openPaymentModal(inv)}
                                className="text-xs bg-emerald-600 hover:bg-emerald-700"
                              >
                                Record Payment
                              </Button>
                            )}

                            {inv.pdfUrl && (
                              <a
                                href={inv.pdfUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex"
                              >
                                <Button size="sm" variant="outline" className="text-xs flex items-center gap-1.5">
                                  <Download className="w-3.5 h-3.5" /> PDF Receipt
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

        {/* Create Invoice Modal */}
        <Modal
          isOpen={isInvoiceModalOpen}
          onClose={() => setIsInvoiceModalOpen(false)}
          title="Create Hospital Clinical Invoice"
        >
          <form onSubmit={handleCreateInvoice} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Select Patient
              </label>
              <Select
                value={patientId}
                onChange={(e) => setPatientId(e.target.value)}
                options={patients.map((p) => ({
                  value: p._id,
                  label: `${p.firstName} ${p.lastName} (${p.patientId})`
                }))}
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Billable Line Items
                </label>
                <button
                  type="button"
                  onClick={addItemRow}
                  className="text-xs text-teal-700 font-semibold hover:underline flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Item
                </button>
              </div>

              {invoiceItems.map((item, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <Input
                    placeholder="Description (e.g. ECG Test)"
                    value={item.description}
                    onChange={(e) => updateItemRow(idx, 'description', e.target.value)}
                    required
                    className="flex-1 text-xs"
                  />
                  <Input
                    type="number"
                    min={1}
                    placeholder="Qty"
                    value={item.quantity}
                    onChange={(e) =>
                      updateItemRow(idx, 'quantity', parseInt(e.target.value, 10) || 1)
                    }
                    className="w-16 text-xs text-center"
                  />
                  <Input
                    type="number"
                    min={0}
                    placeholder="Rate"
                    value={item.unitPrice}
                    onChange={(e) =>
                      updateItemRow(idx, 'unitPrice', parseFloat(e.target.value) || 0)
                    }
                    className="w-20 text-xs text-right"
                  />
                  {invoiceItems.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeItemRow(idx)}
                      className="p-1.5 text-rose-500 hover:bg-rose-50 rounded"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Discount ($)</label>
                <Input
                  type="number"
                  min={0}
                  value={discount}
                  onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Tax / Fees ($)</label>
                <Input
                  type="number"
                  min={0}
                  value={tax}
                  onChange={(e) => setTax(parseFloat(e.target.value) || 0)}
                />
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between font-mono text-sm">
              <span className="text-slate-600 font-sans text-xs font-semibold">Total Calculated:</span>
              <span className="font-bold text-slate-900 text-base">${totalDue.toFixed(2)}</span>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Invoice Notes</label>
              <Input
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Payment instructions or terms"
              />
            </div>

            <div className="pt-4 flex justify-end gap-2 border-t border-slate-100">
              <Button type="button" variant="outline" onClick={() => setIsInvoiceModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={submittingInvoice} className="bg-teal-600 hover:bg-teal-700">
                {submittingInvoice ? 'Generating...' : 'Issue Invoice & Generate PDF'}
              </Button>
            </div>
          </form>
        </Modal>

        {/* Record Payment Modal */}
        <Modal
          isOpen={isPaymentModalOpen}
          onClose={() => setIsPaymentModalOpen(false)}
          title={`Record Payment for ${selectedInvoiceForPay?.invoiceNumber || ''}`}
        >
          {selectedInvoiceForPay && (
            <form onSubmit={handleRecordPayment} className="space-y-4">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-500">Invoice Total:</span>
                  <span className="font-mono font-bold text-slate-800">
                    ${selectedInvoiceForPay.totalAmount?.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Already Paid:</span>
                  <span className="font-mono text-emerald-700 font-semibold">
                    ${selectedInvoiceForPay.amountPaid?.toFixed(2) || '0.00'}
                  </span>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Payment Amount ($ USD)
                </label>
                <Input
                  type="number"
                  step="0.01"
                  min={0.01}
                  max={selectedInvoiceForPay.totalAmount - (selectedInvoiceForPay.amountPaid || 0)}
                  value={payAmount}
                  onChange={(e) => setPayAmount(parseFloat(e.target.value) || 0)}
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Payment Method</label>
                <Select
                  value={payMethod}
                  onChange={(e) => setPayMethod(e.target.value)}
                  options={[
                    { value: 'CARD', label: 'Credit / Debit Card' },
                    { value: 'CASH', label: 'Cash at Billing Desk' },
                    { value: 'INSURANCE', label: 'Health Insurance Direct' },
                    { value: 'ONLINE', label: 'Online Payment Gateway' }
                  ]}
                />
              </div>

              <div className="pt-4 flex justify-end gap-2 border-t border-slate-100">
                <Button type="button" variant="outline" onClick={() => setIsPaymentModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={submittingPayment} className="bg-emerald-600 hover:bg-emerald-700">
                  {submittingPayment ? 'Processing...' : 'Confirm Payment Receipt'}
                </Button>
              </div>
            </form>
          )}
        </Modal>
      </div>
    </DashboardLayout>
  );
}
