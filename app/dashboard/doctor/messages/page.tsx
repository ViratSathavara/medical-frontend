'use client';

import React, { useEffect, useState } from 'react';
import { DashboardLayout } from '../../../../components/layout/DashboardLayout';
import { Card, CardHeader, CardContent } from '../../../../components/ui/Card';
import { Button } from '../../../../components/ui/Button';
import { Input } from '../../../../components/ui/Input';
import api from '../../../../services/api';
import { Send, MessageSquare, User, Users, Clock, ShieldCheck } from 'lucide-react';

export default function DoctorMessagesPage() {
  const [messages, setMessages] = useState<any[]>([]);
  const [patients, setPatients] = useState<any[]>([]);
  const [selectedPatientUserId, setSelectedPatientUserId] = useState('');
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [loadingList, setLoadingList] = useState(true);

  useEffect(() => {
    // Load doctor's patients
    api
      .get('/doctors/patients')
      .then((res) => {
        const pats = res.data.data || [];
        setPatients(pats);
        if (pats.length > 0) {
          const firstUserId = pats[0].user?._id || pats[0].user;
          if (firstUserId) {
            setSelectedPatientUserId(firstUserId);
          }
        }
      })
      .catch((err) => console.error('Failed to load patients for messaging:', err))
      .finally(() => setLoadingList(false));
  }, []);

  const fetchThread = () => {
    if (!selectedPatientUserId) return;
    api
      .get(`/communication/messages?userId=${selectedPatientUserId}`)
      .then((res) => setMessages(res.data.data || []))
      .catch((err) => console.error('Failed to load messages thread:', err));
  };

  useEffect(() => {
    fetchThread();
  }, [selectedPatientUserId]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedPatientUserId) return;

    setSending(true);
    try {
      await api.post('/communication/messages', {
        recipientId: selectedPatientUserId,
        content: newMessage
      });
      setNewMessage('');
      fetchThread();
    } catch (err) {
      console.error('Failed to send message:', err);
    } finally {
      setSending(false);
    }
  };

  const selectedPatientObj = patients.find(
    (p) => (p.user?._id || p.user) === selectedPatientUserId
  );

  return (
    <DashboardLayout allowedRoles={['DOCTOR']}>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Doctor Clinical Messaging</h1>
          <p className="text-xs text-slate-500 mt-1">
            HIPAA-compliant, confidential direct communication channel with your active patients
          </p>
        </div>

        <Card className="h-[640px] flex flex-col md:flex-row overflow-hidden border-slate-200">
          {/* Patient list sidebar */}
          <div className="w-full md:w-80 border-b md:border-b-0 md:border-r border-slate-200 bg-slate-50/50 flex flex-col shrink-0">
            <div className="p-4 border-b border-slate-200/80 flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-teal-600" /> Active Patient Chats
              </h3>
              <span className="text-[11px] font-semibold text-slate-400 font-mono">
                {patients.length}
              </span>
            </div>

            <div className="flex-1 overflow-y-auto p-2 space-y-1">
              {loadingList ? (
                <div className="p-4 text-xs text-slate-400 text-center">Loading patient list...</div>
              ) : patients.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-400">
                  No patients found in your clinical directory.
                </div>
              ) : (
                patients.map((pat) => {
                  const targetUserId = pat.user?._id || pat.user;
                  const isSelected = selectedPatientUserId === targetUserId;

                  return (
                    <button
                      key={pat._id}
                      onClick={() => setSelectedPatientUserId(targetUserId)}
                      className={`w-full text-left p-3 rounded-xl transition-all flex items-center gap-3 ${
                        isSelected
                          ? 'bg-teal-600 text-white shadow-sm'
                          : 'bg-white hover:bg-slate-100 text-slate-800 border border-slate-100'
                      }`}
                    >
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                          isSelected ? 'bg-white/20 text-white' : 'bg-teal-50 text-teal-700'
                        }`}
                      >
                        {pat.firstName?.[0]}
                        {pat.lastName?.[0]}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className={`text-sm font-semibold truncate ${isSelected ? 'text-white' : 'text-slate-900'}`}>
                          {pat.firstName} {pat.lastName}
                        </p>
                        <p className={`text-[11px] truncate font-mono ${isSelected ? 'text-teal-100' : 'text-slate-400'}`}>
                          {pat.patientId} • {pat.bloodGroup || 'Blood N/A'}
                        </p>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* Chat thread conversation */}
          <div className="flex-1 flex flex-col bg-white">
            {selectedPatientObj ? (
              <>
                {/* Active chat header */}
                <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-teal-600 text-white font-bold text-xs flex items-center justify-center">
                      {selectedPatientObj.firstName?.[0]}
                      {selectedPatientObj.lastName?.[0]}
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">
                        {selectedPatientObj.firstName} {selectedPatientObj.lastName}
                      </h4>
                      <p className="text-[11px] text-slate-500 font-mono">
                        Patient ID: {selectedPatientObj.patientId} | Phone: {selectedPatientObj.phone || 'N/A'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-emerald-700 font-medium bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                    <ShieldCheck className="w-3.5 h-3.5" /> Direct Clinical Thread
                  </div>
                </div>

                {/* Messages feed */}
                <div className="flex-1 p-4 overflow-y-auto space-y-3">
                  {messages.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-slate-400">
                      <MessageSquare className="w-8 h-8 stroke-1 mb-2 text-slate-300" />
                      <p className="text-sm font-medium">No messages yet with this patient.</p>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Type an update or instruction below to start the thread.
                      </p>
                    </div>
                  ) : (
                    messages.map((m) => {
                      const isMe = m.sender !== selectedPatientUserId && m.sender?._id !== selectedPatientUserId;

                      return (
                        <div
                          key={m._id}
                          className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                        >
                          <div
                            className={`max-w-md px-4 py-2.5 rounded-2xl text-sm ${
                              isMe
                                ? 'bg-teal-600 text-white rounded-br-xs'
                                : 'bg-slate-100 text-slate-800 rounded-bl-xs border border-slate-200/60'
                            }`}
                          >
                            <p className="leading-relaxed">{m.content}</p>
                          </div>
                          <span className="text-[10px] text-slate-400 mt-1 px-1">
                            {new Date(m.createdAt).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Send Input */}
                <form onSubmit={handleSend} className="p-3 border-t border-slate-200 flex items-center gap-2">
                  <Input
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type clinical advice or follow-up note to patient..."
                    className="flex-1 bg-slate-50 border-slate-200"
                  />
                  <Button
                    type="submit"
                    disabled={sending || !newMessage.trim()}
                    className="shrink-0 bg-teal-600 hover:bg-teal-700"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </form>
              </>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-slate-400">
                <MessageSquare className="w-10 h-10 stroke-1 mb-2 text-slate-300" />
                <p className="text-sm font-medium">Select a patient on the left to view messages</p>
              </div>
            )}
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}
