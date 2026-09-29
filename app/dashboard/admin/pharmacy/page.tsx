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
  Pill,
  Search,
  Plus,
  AlertTriangle,
  ArrowUpDown,
  CheckCircle2,
  AlertCircle,
  Calendar,
  Layers,
  DollarSign
} from 'lucide-react';

export default function AdminPharmacyPage() {
  const [medicines, setMedicines] = useState<any[]>([]);
  const [alerts, setAlerts] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Add Medicine Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [submittingAdd, setSubmittingAdd] = useState(false);
  const [medForm, setMedForm] = useState({
    name: '',
    genericName: '',
    category: 'Antibiotics',
    dosageForm: 'Tablet',
    strength: '500mg',
    manufacturer: 'Pfizer',
    price: 15,
    quantity: 100,
    minStockAlert: 20,
    batchNumber: 'BATCH-2026-01',
    expiryDate: '2027-12-31'
  });

  // Adjust Stock Modal State
  const [isAdjustModalOpen, setIsAdjustModalOpen] = useState(false);
  const [selectedMedForAdjust, setSelectedMedForAdjust] = useState<any | null>(null);
  const [adjustForm, setAdjustForm] = useState({
    type: 'IN',
    quantity: 50,
    reason: 'Restocking shipment received'
  });
  const [submittingAdjust, setSubmittingAdjust] = useState(false);

  useEffect(() => {
    fetchMedicines();
    fetchAlerts();
  }, [categoryFilter]);

  const fetchMedicines = async () => {
    setLoading(true);
    try {
      const res = await api.get('/pharmacy/medicines', {
        params: {
          limit: 100,
          category: categoryFilter !== 'All' ? categoryFilter : undefined
        }
      });
      setMedicines(res.data.data || []);
    } catch (err) {
      console.error('Failed to load medicines:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAlerts = async () => {
    try {
      const res = await api.get('/pharmacy/alerts');
      setAlerts(res.data.data);
    } catch (err) {
      console.error('Failed to load pharmacy alerts:', err);
    }
  };

  const handleAddMedicine = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingAdd(true);
    try {
      await api.post('/pharmacy/medicines', medForm);
      setMessage({ type: 'success', text: 'New medicine registered to pharmacy inventory!' });
      setIsAddModalOpen(false);
      setTimeout(() => setMessage(null), 3000);
      fetchMedicines();
      fetchAlerts();
    } catch (err: any) {
      setMessage({
        type: 'error',
        text: err.response?.data?.message || 'Failed to add medicine.'
      });
    } finally {
      setSubmittingAdd(false);
    }
  };

  const openAdjustModal = (med: any) => {
    setSelectedMedForAdjust(med);
    setAdjustForm({
      type: 'IN',
      quantity: 20,
      reason: 'Standard stock adjustment'
    });
    setIsAdjustModalOpen(true);
  };

  const handleAdjustStock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMedForAdjust?._id) return;

    setSubmittingAdjust(true);
    try {
      await api.post(`/pharmacy/medicines/${selectedMedForAdjust._id}/adjust-stock`, adjustForm);
      setMessage({
        type: 'success',
        text: `Stock for ${selectedMedForAdjust.name} adjusted successfully.`
      });
      setIsAdjustModalOpen(false);
      setTimeout(() => setMessage(null), 3000);
      fetchMedicines();
      fetchAlerts();
    } catch (err: any) {
      setMessage({
        type: 'error',
        text: err.response?.data?.message || 'Failed to adjust stock.'
      });
    } finally {
      setSubmittingAdjust(false);
    }
  };

  const filteredMedicines = medicines.filter((m) => {
    const q = search.toLowerCase();
    const name = (m.name || '').toLowerCase();
    const gen = (m.genericName || '').toLowerCase();
    const batch = (m.batchNumber || '').toLowerCase();
    return name.includes(q) || gen.includes(q) || batch.includes(q);
  });

  return (
    <DashboardLayout allowedRoles={['ADMIN']}>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Pharmacy & Medication Inventory</h1>
            <p className="text-sm text-slate-500 mt-1">
              Pharmaceutical catalog, batch expiration monitoring, real-time stock levels & dispensing
            </p>
          </div>

          <Button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700"
          >
            <Plus className="w-4 h-4" /> Add Medication
          </Button>
        </div>

        {/* Low Stock Warning Banner if applicable */}
        {alerts && alerts.lowStockCount > 0 && (
          <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
              <div>
                <h4 className="text-sm font-bold text-amber-900">
                  {alerts.lowStockCount} Medications Below Reorder Threshold
                </h4>
                <p className="text-xs text-amber-700 mt-0.5">
                  Action required: replenish critical medications to avoid dispensing shortages.
                </p>
              </div>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setCategoryFilter('All');
                setSearch('');
              }}
              className="border-amber-300 text-amber-900 hover:bg-amber-100"
            >
              View All Low Stock
            </Button>
          </div>
        )}

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

        {/* Filter controls */}
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="relative w-full sm:max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by drug name, generic formula, or batch..."
              className="pl-9 bg-white"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              options={[
                { value: 'All', label: 'All Categories' },
                { value: 'Antibiotics', label: 'Antibiotics' },
                { value: 'Analgesics', label: 'Analgesics / Pain Relief' },
                { value: 'Cardiovascular', label: 'Cardiovascular' },
                { value: 'Antidiabetic', label: 'Antidiabetic' },
                { value: 'Respiratory', label: 'Respiratory' },
                { value: 'Vitamins', label: 'Vitamins & Supplements' }
              ]}
              className="w-52 bg-white"
            />
          </div>
        </div>

        {/* Medicines Table */}
        <Card>
          <CardContent className="p-0 overflow-x-auto">
            {loading ? (
              <div className="p-6 space-y-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Skeleton key={i} className="h-14 w-full rounded-lg" />
                ))}
              </div>
            ) : filteredMedicines.length === 0 ? (
              <EmptyState
                icon={Pill}
                title="No Medicines Found"
                description={
                  search || categoryFilter !== 'All'
                    ? 'No medications match the specified filter parameters.'
                    : 'Pharmacy catalog is currently empty.'
                }
                actionLabel="Add Medication"
                onAction={() => setIsAddModalOpen(true)}
              />
            ) : (
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 text-xs uppercase font-semibold">
                  <tr>
                    <th className="py-3 px-4">Medication Name</th>
                    <th className="py-3 px-4">Category & Form</th>
                    <th className="py-3 px-4">Unit Price</th>
                    <th className="py-3 px-4">Current Stock</th>
                    <th className="py-3 px-4">Expiry Date</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredMedicines.map((m) => {
                    const isLow = m.quantity <= (m.minStockAlert || 10);

                    return (
                      <tr key={m._id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center shrink-0">
                              <Pill className="w-4 h-4" />
                            </div>
                            <div>
                              <p className="font-semibold text-slate-900">{m.name}</p>
                              <p className="text-[11px] text-slate-400">
                                {m.genericName} • {m.strength || 'Standard'}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="py-3 px-4">
                          <span className="text-xs text-slate-700 font-medium block">{m.category}</span>
                          <span className="text-[11px] text-slate-400 capitalize">{m.dosageForm}</span>
                        </td>

                        <td className="py-3 px-4 font-mono font-medium text-slate-800 text-xs">
                          ${m.price?.toFixed(2) || '0.00'}
                        </td>

                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <span
                              className={`font-bold font-mono text-xs ${
                                isLow ? 'text-rose-600' : 'text-slate-900'
                              }`}
                            >
                              {m.quantity} Units
                            </span>
                            {isLow && (
                              <Badge variant="danger" className="text-[10px] py-0 px-1.5">
                                Low Stock
                              </Badge>
                            )}
                          </div>
                          <span className="text-[10px] text-slate-400">
                            Min: {m.minStockAlert || 10}
                          </span>
                        </td>

                        <td className="py-3 px-4 text-xs text-slate-500">
                          {m.expiryDate ? new Date(m.expiryDate).toLocaleDateString() : 'N/A'}
                        </td>

                        <td className="py-3 px-4 text-right">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => openAdjustModal(m)}
                            className="text-xs flex items-center gap-1.5 ml-auto"
                          >
                            <ArrowUpDown className="w-3.5 h-3.5" /> Adjust Stock
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </CardContent>
        </Card>

        {/* Add Medicine Modal */}
        <Modal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          title="Register New Medication to Pharmacy"
        >
          <form onSubmit={handleAddMedicine} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Brand Name</label>
                <Input
                  value={medForm.name}
                  onChange={(e) => setMedForm({ ...medForm, name: e.target.value })}
                  placeholder="e.g. Amoxicillin"
                  required
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Generic Name</label>
                <Input
                  value={medForm.genericName}
                  onChange={(e) => setMedForm({ ...medForm, genericName: e.target.value })}
                  placeholder="e.g. Amoxicillin Trihydrate"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Category</label>
                <Select
                  value={medForm.category}
                  onChange={(e) => setMedForm({ ...medForm, category: e.target.value })}
                  options={[
                    { value: 'Antibiotics', label: 'Antibiotics' },
                    { value: 'Analgesics', label: 'Analgesics' },
                    { value: 'Cardiovascular', label: 'Cardiovascular' },
                    { value: 'Antidiabetic', label: 'Antidiabetic' },
                    { value: 'Respiratory', label: 'Respiratory' },
                    { value: 'Vitamins', label: 'Vitamins & Supplements' }
                  ]}
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Dosage Form</label>
                <Select
                  value={medForm.dosageForm}
                  onChange={(e) => setMedForm({ ...medForm, dosageForm: e.target.value })}
                  options={[
                    { value: 'Tablet', label: 'Tablet' },
                    { value: 'Capsule', label: 'Capsule' },
                    { value: 'Syrup', label: 'Syrup' },
                    { value: 'Injection', label: 'Injection' },
                    { value: 'Ointment', label: 'Ointment' }
                  ]}
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Strength</label>
                <Input
                  value={medForm.strength}
                  onChange={(e) => setMedForm({ ...medForm, strength: e.target.value })}
                  placeholder="500mg"
                  required
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Price ($)</label>
                <Input
                  type="number"
                  step="0.01"
                  min={0}
                  value={medForm.price}
                  onChange={(e) => setMedForm({ ...medForm, price: parseFloat(e.target.value) || 0 })}
                  required
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Initial Qty</label>
                <Input
                  type="number"
                  min={0}
                  value={medForm.quantity}
                  onChange={(e) => setMedForm({ ...medForm, quantity: parseInt(e.target.value, 10) || 0 })}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Reorder Level Alert
                </label>
                <Input
                  type="number"
                  min={1}
                  value={medForm.minStockAlert}
                  onChange={(e) =>
                    setMedForm({ ...medForm, minStockAlert: parseInt(e.target.value, 10) || 10 })
                  }
                  required
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Batch Number</label>
                <Input
                  value={medForm.batchNumber}
                  onChange={(e) => setMedForm({ ...medForm, batchNumber: e.target.value })}
                  placeholder="BATCH-2026-01"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Expiration Date</label>
              <Input
                type="date"
                value={medForm.expiryDate}
                onChange={(e) => setMedForm({ ...medForm, expiryDate: e.target.value })}
                required
              />
            </div>

            <div className="pt-4 flex justify-end gap-2 border-t border-slate-100">
              <Button type="button" variant="outline" onClick={() => setIsAddModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={submittingAdd} className="bg-teal-600 hover:bg-teal-700">
                {submittingAdd ? 'Saving...' : 'Register Medication'}
              </Button>
            </div>
          </form>
        </Modal>

        {/* Adjust Stock Modal */}
        <Modal
          isOpen={isAdjustModalOpen}
          onClose={() => setIsAdjustModalOpen(false)}
          title={`Adjust Stock: ${selectedMedForAdjust?.name || ''}`}
        >
          {selectedMedForAdjust && (
            <form onSubmit={handleAdjustStock} className="space-y-4">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 text-xs">
                <span className="text-slate-500">Current In-Stock Quantity:</span>{' '}
                <span className="font-bold text-slate-900 text-sm font-mono">
                  {selectedMedForAdjust.quantity} units
                </span>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Adjustment Type</label>
                <Select
                  value={adjustForm.type}
                  onChange={(e) => setAdjustForm({ ...adjustForm, type: e.target.value })}
                  options={[
                    { value: 'IN', label: 'Stock In (Purchase / Restock)' },
                    { value: 'OUT', label: 'Stock Out (Dispensed / Wastage)' },
                    { value: 'ADJUSTMENT', label: 'Override Quantity (Physical Audit)' }
                  ]}
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Quantity ({adjustForm.type === 'ADJUSTMENT' ? 'New Total' : 'Units to Apply'})
                </label>
                <Input
                  type="number"
                  min={1}
                  value={adjustForm.quantity}
                  onChange={(e) =>
                    setAdjustForm({ ...adjustForm, quantity: parseInt(e.target.value, 10) || 1 })
                  }
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Audit Reason</label>
                <Input
                  value={adjustForm.reason}
                  onChange={(e) => setAdjustForm({ ...adjustForm, reason: e.target.value })}
                  placeholder="e.g. Shipment received PO-8492"
                  required
                />
              </div>

              <div className="pt-4 flex justify-end gap-2 border-t border-slate-100">
                <Button type="button" variant="outline" onClick={() => setIsAdjustModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={submittingAdjust} className="bg-teal-600 hover:bg-teal-700">
                  {submittingAdjust ? 'Updating...' : 'Confirm Stock Adjustment'}
                </Button>
              </div>
            </form>
          )}
        </Modal>
      </div>
    </DashboardLayout>
  );
}
