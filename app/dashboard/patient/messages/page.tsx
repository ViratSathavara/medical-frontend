'use client';

import React, { useEffect, useState } from 'react';
import { DashboardLayout } from '../../../../components/layout/DashboardLayout';
import { Card, CardHeader, CardContent } from '../../../../components/ui/Card';
import { Button } from '../../../../components/ui/Button';
import { Input } from '../../../../components/ui/Input';
import api from '../../../../services/api';
import { Send, MessageSquare, User, Stethoscope } from 'lucide-react';

export default function PatientMessages() {
  const [messages, setMessages] = useState<any[]>([]);
  const [doctors, setDoctors] = useState<any[]>([]);
  const [selectedDoctorId, setSelectedDoctorId] = useState('');
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    // Load hospital doctors to message
    api.get('/doctors?limit=20').then((res) => {
      const docs = res.data.data || [];
      setDoctors(docs);
      if (docs.length > 0) {
        setSelectedDoctorId(docs[0].user?._id || docs[0]._id);
      }
    });
  }, []);

  const fetchThread = () => {
    if (!selectedDoctorId) return;
    api.get(`/communication/messages?userId=${selectedDoctorId}`)
      .then((res) => setMessages(res.data.data || []))
      .catch((err) => console.error(err));
  };

  useEffect(() => {
    fetchThread();
  }, [selectedDoctorId]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedDoctorId) return;

    setSending(true);
    try {
      await api.post('/communication/messages', {
        recipientId: selectedDoctorId,
        content: newMessage
      });
      setNewMessage('');
      fetchThread();
    } catch (err) {
      console.error(err);
    } finally {
      setSending(false);
    }
  };

  return (
    <DashboardLayout allowedRoles={['PATIENT']}>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Secure Clinical Messaging</h1>
          <p className="text-xs text-slate-500 mt-1">Direct, confidential messaging with your hospital care providers</p>
        </div>

        <Card className="h-[620px] flex flex-col md:flex-row overflow-hidden">
          {/* Doctor list sidebar */}
          <div className="w-full md:w-80 border-b md:border-b-0 md:border-r border-slate-200 bg-slate-50/50 flex flex-col shrink-0">
            <div className="p-4 border-b border-slate-200/80">
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Hospital Clinicians</h3>
            </div>
            <div className="flex-1 overflow-y-auto p-2 space-y-1">
              {doctors.map((doc) => {
                const targetId = doc.user?._id || doc._id;
                const isSelected = selectedDoctorId === targetId;

                return (
                  <button
                    key={doc._id}
                    onClick={() => setSelectedDoctorId(targetId)}
                    className={`w-full p-3 rounded-xl text-left text-xs transition-colors flex items-center gap-3 ${
                      isSelected
                        ? 'bg-white border border-slate-200 shadow-sm font-bold text-slate-900'
                        : 'text-slate-600 hover:bg-white/60'
                    }`}
                  >
                    <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center shrink-0">
                      <Stethoscope className="w-4 h-4" />
                    </div>
                    <div className="truncate">
                      <p className="font-semibold text-slate-900 truncate">Dr. {doc.firstName} {doc.lastName}</p>
                      <p className="text-[11px] text-slate-400 truncate">{doc.specialization}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Chat thread */}
          <div className="flex-1 flex flex-col justify-between bg-white">
            {/* Messages box */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center text-slate-400">
                  <MessageSquare className="w-10 h-10 mb-2 opacity-50" />
                  <p className="text-xs">No previous conversation. Send a message to start.</p>
                </div>
              ) : (
                messages.map((msg) => {
                  const isMe = msg.sender?.role === 'PATIENT';
                  return (
                    <div key={msg._id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                      <div
                        className={`max-w-md rounded-2xl px-4 py-2.5 text-xs shadow-sm ${
                          isMe
                            ? 'bg-primary-600 text-white rounded-br-none'
                            : 'bg-slate-100 text-slate-800 rounded-bl-none'
                        }`}
                      >
                        <p>{msg.content}</p>
                        <span
                          className={`block text-[10px] mt-1 text-right ${
                            isMe ? 'text-primary-200' : 'text-slate-400'
                          }`}
                        >
                          {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Input bar */}
            <form onSubmit={handleSend} className="p-4 border-t border-slate-100 flex items-center gap-3">
              <Input
                placeholder="Type your medical query or question..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                className="flex-1"
                required
              />
              <Button type="submit" size="md" variant="primary" isLoading={sending} rightIcon={<Send className="w-4 h-4" />}>
                Send
              </Button>
            </form>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}
