'use client';

import React, { useEffect, useState } from 'react';
import { DashboardLayout } from '../../../../components/layout/DashboardLayout';
import { Card, CardHeader, CardContent } from '../../../../components/ui/Card';
import { Button } from '../../../../components/ui/Button';
import { Badge } from '../../../../components/ui/Badge';
import { Modal } from '../../../../components/ui/Modal';
import { Input } from '../../../../components/ui/Input';
import { Select } from '../../../../components/ui/Select';
import { EmptyState } from '../../../../components/ui/EmptyState';
import { Skeleton } from '../../../../components/ui/Skeleton';
import api from '../../../../services/api';
import { Invoice } from '../../../../types';
import { Receipt, Download, CreditCard, CheckCircle2, DollarSign, Calendar } from 'lucide-react';

export default function PatientInvoices() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);

  // Payment Modal State
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'Card' | 'UPI' | 'Online payment'>('Card');
  const [cardNumber, setCardNumber] = useState('4242 •••• •••• 4242');
  const [paying, setPaying] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  const fetchInvoices = () => {
    setLoading(true);
    api.get('/billing/invoices?limit=50')
      .then((res) => setInvoices(res.data.data || []))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  const handlePay = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInvoice) return;

    setPaying(true);
    try {
      const remainingAmount = selectedInvoice.totalAmount - selectedInvoice.amountPaid;
      await api.post('/billing/payments', {
        invoiceId: selectedInvoice._id,
        amount: remainingAmount,
        paymentMethod: paymentMethod === 'Card' ? 'Card' : 'UPI',
        transactionId: `TXN-PAY-${Date.now().toString().slice(-6)}`
      });

      setPaymentSuccess(true);
      setTimeout(() => {
        setPaymentSuccess(false);
        setSelectedInvoice(null);
        fetchInvoices();
      }, 1500);
    } catch (err) {
      console.error(err);
    } finally {
      setPaying(false);
    }
  };

  return (
    <DashboardLayout allowedRoles={['PATIENT']}>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Invoices & Billing History</h1>
          <p className="text-xs text-slate-500 mt-1">
            Review detailed medical expense statements, receipts, and make secure payments
          </p>
        </div>

        {loading ? (
          <div className="space-y-4">
            <Skeleton className="h-44 w-full" />
            <Skeleton className="h-44 w-full" />
          </div>
        ) : invoices.length === 0 ? (
          <EmptyState
            title="No Invoices Found"
            description="You do not have any pending or past invoices on record."
          />
        ) : (
          <div className="space-y-6">
            {invoices.map((inv) => {
              const dueAmount = inv.totalAmount - inv.amountPaid;
              const isPaid = inv.paymentStatus === 'Paid';

              return (
                <Card key={inv._id} className="p-6 space-y-5">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center font-bold">
                        <Receipt className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-base font-bold text-slate-900">{inv.invoiceNumber}</h3>
                          <Badge variant={isPaid ? 'success' : 'warning'} size="sm">
                            {inv.paymentStatus}
                          </Badge>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">
                          Issued on: {new Date(inv.createdAt).toLocaleDateString()} &bull; Due Date: {new Date(inv.dueDate).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      {!isPaid && (
                        <Button
                          size="sm"
                          variant="emerald"
                          leftIcon={<CreditCard className="w-3.5 h-3.5" />}
                          onClick={() => setSelectedInvoice(inv)}
                        >
                          Pay ${dueAmount.toFixed(2)}
                        </Button>
                      )}
                      {inv.pdfUrl && (
                        <a href={inv.pdfUrl} target="_blank" rel="noreferrer" download>
                          <Button size="sm" variant="outline" leftIcon={<Download className="w-3.5 h-3.5" />}>
                            Invoice PDF
                          </Button>
                        </a>
                      )}
                    </div>
                  </div>

                  {/* Line items table */}
                  <div className="overflow-x-auto rounded-xl border border-slate-200/80">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200">
                        <tr>
                          <th className="py-2.5 px-4">Service Description</th>
                          <th className="py-2.5 px-4">Category</th>
                          <th className="py-2.5 px-4 text-center">Qty</th>
                          <th className="py-2.5 px-4 text-right">Unit Price</th>
                          <th className="py-2.5 px-4 text-right">Total</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-slate-700">
                        {inv.items?.map((item, idx) => (
                          <tr key={idx} className="hover:bg-slate-50/50">
                            <td className="py-2.5 px-4 font-semibold text-slate-800">{item.description}</td>
                            <td className="py-2.5 px-4 text-slate-500">{item.category}</td>
                            <td className="py-2.5 px-4 text-center">{item.quantity}</td>
                            <td className="py-2.5 px-4 text-right">${item.unitPrice.toFixed(2)}</td>
                            <td className="py-2.5 px-4 text-right font-bold text-slate-900">${item.amount.toFixed(2)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Totals Summary */}
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center text-xs text-slate-600 pt-2 gap-2">
                    <div>
                      <span>Subtotal: ${inv.subtotal.toFixed(2)}</span>
                      <span className="mx-2">&bull;</span>
                      <span>Discount: -${inv.discount.toFixed(2)}</span>
                      <span className="mx-2">&bull;</span>
                      <span>Tax (5%): ${inv.tax.toFixed(2)}</span>
                    </div>

                    <div className="text-right">
                      <span className="text-slate-400 mr-2">Grand Total:</span>
                      <span className="text-base font-extrabold text-slate-900">${inv.totalAmount.toFixed(2)}</span>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Mock Payment Gateway Modal */}
      {selectedInvoice && (
        <Modal
          isOpen={!!selectedInvoice}
          onClose={() => setSelectedInvoice(null)}
          title="Complete Hospital Payment"
          subtitle={`Invoice: ${selectedInvoice.invoiceNumber} • Total Due: $${(selectedInvoice.totalAmount - selectedInvoice.amountPaid).toFixed(2)}`}
        >
          {paymentSuccess ? (
            <div className="text-center py-8 space-y-3">
              <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Payment Processed Successfully!</h3>
              <p className="text-xs text-slate-500">Your hospital invoice is now marked as Paid.</p>
            </div>
          ) : (
            <form onSubmit={handlePay} className="space-y-4">
              <Select
                label="Payment Method"
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as any)}
                options={[
                  { label: 'Credit / Debit Card (Visa, MasterCard, Amex)', value: 'Card' },
                  { label: 'UPI / Direct NetBanking', value: 'UPI' },
                  { label: 'Online Gateway Mock', value: 'Online payment' }
                ]}
              />

              <Input
                label="Card Number / UPI Virtual ID"
                placeholder="4242 4242 4242 4242"
                value={cardNumber}
                onChange={(e) => setCardNumber(e.target.value)}
                leftIcon={<CreditCard className="w-4 h-4" />}
                required
              />

              <div className="grid grid-cols-2 gap-4">
                <Input label="Expiry Date" placeholder="MM/YY" defaultValue="12/28" />
                <Input label="Security CVC" placeholder="•••" defaultValue="123" />
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex justify-between text-xs font-semibold">
                <span className="text-slate-600">Amount to Charge:</span>
                <span className="font-extrabold text-slate-900">
                  ${(selectedInvoice.totalAmount - selectedInvoice.amountPaid).toFixed(2)}
                </span>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <Button size="sm" variant="ghost" onClick={() => setSelectedInvoice(null)}>
                  Cancel
                </Button>
                <Button type="submit" size="sm" variant="emerald" isLoading={paying}>
                  Pay Now
                </Button>
              </div>
            </form>
          )}
        </Modal>
      )}
    </DashboardLayout>
  );
}
