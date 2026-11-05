import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage } from '../types';
import { Brain, Send, Bot, User, Sparkles, AlertCircle, RefreshCw } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface AssistantViewProps {
  chatHistory: ChatMessage[];
  onSendMessage: (text: string) => Promise<void>;
  isThinking: boolean;
}

export default function AssistantView({ chatHistory, onSendMessage, isThinking }: AssistantViewProps) {
  const [input, setInput] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Suggested prompt presets for easy testing
  const suggestions = [
    'Kluster mana yang akan kehabisan penyimpanan terlebih dahulu?',
    'Jelaskan anomali status Ceph HEALTH_WARN di kluster Proxmox.',
    'Berikan ringkasan kesehatan seluruh kluster virtualisasi saat ini.',
    'Bagaimana rekomendasi penyeimbangan beban kerja di kluster Nutanix?'
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isThinking) return;
    
    onSendMessage(input.trim());
    setInput('');
  };

  const handlePresetClick = (presetText: string) => {
    if (isThinking) return;
    onSendMessage(presetText);
  };

  // Auto scroll to latest message
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory, isThinking]);

  return (
    <div className="flex flex-col h-[calc(100vh-140px)]">
      {/* Header */}
      <div className="mb-4">
        <h2 className="text-2xl font-bold tracking-tight text-slate-100 font-sans">
          Asisten AI Infra Health Intel
        </h2>
        <p className="text-slate-400 text-sm mt-1">
          Konsol percakapan alami berbasis Gemini AI untuk menginvestigasi anomali, performa, dan perencanaan kapasitas.
        </p>
      </div>

      {/* Main Chat Container */}
      <div className="flex-1 bg-slate-900 border border-slate-800 rounded-2xl flex flex-col overflow-hidden shadow-2xl">
        
        {/* Banner */}
        <div className="bg-slate-950 border-b border-slate-800 px-5 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="bg-indigo-500/10 p-1.5 rounded-lg text-indigo-400">
              <Bot className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <span className="text-xs font-bold text-slate-100 font-sans block">Gemini 3.5 Flash Advisor</span>
              <span className="text-[10px] font-mono text-emerald-400 block mt-0.5">● Online & Bermuatan Metrik Real-time</span>
            </div>
          </div>
          <Sparkles className="w-4 h-4 text-amber-400" />
        </div>

        {/* Message Area */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {chatHistory.length === 0 ? (
            /* Empty Chat Welcomer with Suggestions */
            <div className="h-full flex flex-col items-center justify-center text-center max-w-xl mx-auto space-y-6 py-6">
              <div className="bg-indigo-600/10 p-5 rounded-full border border-indigo-500/15 text-indigo-400 relative">
                <Brain className="w-10 h-10 animate-bounce" />
                <Sparkles className="w-4 h-4 text-amber-400 absolute top-2 right-2" />
              </div>

              <div className="space-y-2">
                <h3 className="text-sm font-bold text-slate-100 font-sans">Selamat Datang di AI Advisor Console</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Asisten AI ini terhubung langsung ke telemetri kluster **Proxmox**, **Nutanix**, dan **OpenStack**. Anda dapat menanyakan pertanyaan teknis tentang kapasitas penyimpanan, anomali beban kerja, atau solusi degradasi hardware.
                </p>
              </div>

              {/* Suggestions Grid */}
              <div className="w-full space-y-2 pt-2">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-3 font-sans">Rekomendasi Pertanyaan Cepat:</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-left">
                  {suggestions.map((s, idx) => (
                    <button
                      key={idx}
                      onClick={() => handlePresetClick(s)}
                      className="bg-slate-950 hover:bg-slate-800/80 border border-slate-800 text-slate-300 text-2xs p-3.5 rounded-xl transition-all hover:border-slate-700 leading-relaxed font-sans font-medium"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            /* Render Chat History */
            <div className="space-y-4">
              {chatHistory.map((msg) => {
                const isAssistant = msg.sender === 'assistant';
                return (
                  <div
                    key={msg.id}
                    className={`flex gap-3.5 max-w-3xl ${isAssistant ? 'mr-auto' : 'ml-auto flex-row-reverse'}`}
                  >
                    {/* Avatar */}
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-white ${
                      isAssistant 
                        ? 'bg-gradient-to-tr from-indigo-600 to-blue-500' 
                        : 'bg-slate-800 text-slate-300'
                    }`}>
                      {isAssistant ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
                    </div>

                    {/* Chat Bubble */}
                    <div className={`rounded-2xl px-4 py-3 shadow-sm ${
                      isAssistant
                        ? 'bg-slate-950 border border-slate-800/60 text-slate-100'
                        : 'bg-indigo-600 text-white'
                    }`}>
                      {isAssistant ? (
                        <div className="markdown-body">
                          <ReactMarkdown>{msg.text}</ReactMarkdown>
                        </div>
                      ) : (
                        <p className="text-xs font-medium font-sans whitespace-pre-wrap leading-relaxed">
                          {msg.text}
                        </p>
                      )}
                      <span className={`text-[9px] block mt-1.5 font-mono ${
                        isAssistant ? 'text-slate-500' : 'text-indigo-200 text-right'
                      }`}>
                        {msg.timestamp}
                      </span>
                    </div>
                  </div>
                );
              })}

              {/* Typing state */}
              {isThinking && (
                <div className="flex gap-3.5 mr-auto max-w-xl">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-600 to-blue-500 flex items-center justify-center shrink-0 text-white">
                    <Bot className="w-4 h-4 animate-spin" />
                  </div>
                  <div className="bg-slate-950 border border-slate-800/60 rounded-2xl px-4 py-3 flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce [animation-delay:-0.3s]" />
                    <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce [animation-delay:-0.15s]" />
                    <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce" />
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>
          )}
        </div>

        {/* Input Area (Snapshot 7) */}
        <div className="p-4 bg-slate-950 border-t border-slate-800">
          <form onSubmit={handleSubmit} className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder='Ask: "Which cluster runs out of storage first?"'
              className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-sans"
              disabled={isThinking}
            />
            <button
              type="submit"
              disabled={isThinking || !input.trim()}
              className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-800 text-white disabled:text-slate-500 p-3 rounded-xl transition-all shadow-lg shadow-indigo-600/10 shrink-0"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
          
          <div className="flex items-center gap-1.5 text-[10px] text-slate-500 mt-2 font-mono">
            <AlertCircle className="w-3.5 h-3.5" />
            <span>Asisten memproses konteks CPU, RAM, OSD Ceph, dan Anomali kluster aktif secara otomatis.</span>
          </div>
        </div>
      </div>
    </div>
  );
}
