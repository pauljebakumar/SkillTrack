import React, { useState } from 'react';
import api from '../services/api';
import {
  Bot,
  Sparkles,
  Send,
  Trash2,
  Code2,
  BookOpen,
  Calculator,
  UserCheck,
  CalendarCheck,
  LineChart,
  Copy,
  Check
} from 'lucide-react';

export default function AIPositionCoach() {
  const [mode, setMode] = useState('study_assistant');
  const [inputPrompt, setInputPrompt] = useState('');
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: 'Hello! I am your AI Placement Coach. Select any coaching mode above, or type a concept, coding question, or interview topic to get started.'
    }
  ]);
  const [loading, setLoading] = useState(false);
  const [conversationId, setConversationId] = useState(null);
  const [copiedIdx, setCopiedIdx] = useState(null);

  const coachModes = [
    { id: 'study_assistant', label: 'Study Assistant', icon: BookOpen, prompt: 'Explain OOP Polymorphism in C++ & Java with real-world examples.' },
    { id: 'coding_assistant', label: 'Coding Assistant', icon: Code2, prompt: 'Explain how Sliding Window reduces Time Complexity from O(N^2) to O(N).' },
    { id: 'aptitude_coach', label: 'Aptitude Coach', icon: Calculator, prompt: 'Teach me the LCM shortcut method for Pipes and Cisterns.' },
    { id: 'interview_coach', label: 'Interview Coach', icon: UserCheck, prompt: 'Act as a Google Interviewer and evaluate my answer to "Tell me about yourself".' },
    { id: 'learning_planner', label: 'Learning Planner', icon: CalendarCheck, prompt: 'Create a 4-week placement study schedule targeting Tier-1 software roles.' },
    { id: 'skill_analysis', label: 'Skill Analysis Assistant', icon: LineChart, prompt: 'How can I eliminate off-by-one errors and improve DSA accuracy?' }
  ];

  const handleSend = async (customText = null) => {
    const textToSend = customText || inputPrompt;
    if (!textToSend.trim() || loading) return;

    const userMsg = { role: 'user', content: textToSend };
    setMessages(prev => [...prev, userMsg]);
    setInputPrompt('');
    setLoading(true);

    try {
      const res = await api.post('/ai/chat', {
        mode,
        prompt: textToSend,
        conversationId
      });

      if (res.data?.success) {
        const assistantMsg = {
          role: 'assistant',
          content: res.data.text,
          model: res.data.modelUsed
        };
        setMessages(prev => [...prev, assistantMsg]);
        if (res.data.conversationId) setConversationId(res.data.conversationId);
      }
    } catch (err) {
      console.error('Chat error:', err);
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: '⚠️ Unable to reach AI service. Please ensure server is running and try again.'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleClearChat = () => {
    setMessages([
      {
        role: 'assistant',
        content: `Switched to ${coachModes.find(m => m.id === mode)?.label}. How can I assist your placement preparation today?`
      }
    ]);
    setConversationId(null);
  };

  const handleCopy = (text, idx) => {
    navigator.clipboard.writeText(text);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-4 pb-16 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5">
            <Bot className="w-6 h-6 text-indigo-500" />
            <span>AI Placement Coach</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Personalized mentoring across 6 specialized modes: concept tutoring, code diagnosis, interview simulation, and learning roadmaps.
          </p>
        </div>

        <button
          onClick={handleClearChat}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Clear Conversation</span>
        </button>
      </div>

      {/* Mode Selector Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto text-xs pb-1">
        {coachModes.map((item) => {
          const Icon = item.icon;
          const isSelected = mode === item.id;
          return (
            <button
              key={item.id}
              onClick={() => {
                setMode(item.id);
                setMessages([
                  {
                    role: 'assistant',
                    content: `Switched to **${item.label}** mode. Ask any question or click a suggested prompt below!`
                  }
                ]);
              }}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-2xl font-semibold whitespace-nowrap transition-all ${
                isSelected
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/25'
                  : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-indigo-400'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>

      {/* Suggested Prompts Pill */}
      <div className="flex items-center gap-2 overflow-x-auto py-1">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider whitespace-nowrap">Suggested:</span>
        {coachModes.map((m) => (
          <button
            key={m.id}
            onClick={() => handleSend(m.prompt)}
            className="px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800/80 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 border border-slate-200 dark:border-slate-700/60 text-[11px] whitespace-nowrap transition-colors"
          >
            {m.prompt}
          </button>
        ))}
      </div>

      {/* Chat Messages Container */}
      <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm flex flex-col h-[520px] overflow-hidden">
        {/* Message Log */}
        <div className="flex-1 p-5 overflow-y-auto space-y-4 text-xs sm:text-sm">
          {messages.map((msg, idx) => {
            const isUser = msg.role === 'user';
            return (
              <div
                key={idx}
                className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                {!isUser && (
                  <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-indigo-600 to-cyan-400 flex items-center justify-center text-white flex-shrink-0 mt-0.5 shadow-sm">
                    <Sparkles className="w-3.5 h-3.5" />
                  </div>
                )}

                <div
                  className={`group relative max-w-[85%] rounded-2xl p-4 leading-relaxed ${
                    isUser
                      ? 'bg-indigo-600 text-white rounded-br-none shadow-md shadow-indigo-500/20'
                      : 'bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/60 text-slate-800 dark:text-slate-200 rounded-bl-none'
                  }`}
                >
                  <div className="whitespace-pre-line font-sans">
                    {msg.content}
                  </div>

                  {!isUser && (
                    <button
                      onClick={() => handleCopy(msg.content, idx)}
                      className="absolute right-2 top-2 p-1 rounded-md opacity-0 group-hover:opacity-100 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-400 transition-all"
                      title="Copy message"
                    >
                      {copiedIdx === idx ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  )}
                </div>

                {isUser && (
                  <div className="w-7 h-7 rounded-xl bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-slate-700 dark:text-slate-200 font-bold text-xs flex-shrink-0 mt-0.5">
                    You
                  </div>
                )}
              </div>
            );
          })}

          {loading && (
            <div className="flex gap-3 justify-start items-center text-slate-400 text-xs">
              <div className="w-7 h-7 rounded-xl bg-indigo-600 flex items-center justify-center text-white">
                <Sparkles className="w-3.5 h-3.5 animate-spin" />
              </div>
              <span className="italic">AI Coach is thinking...</span>
            </div>
          )}
        </div>

        {/* Chat Input Bar */}
        <div className="p-3 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-800 flex items-center gap-2">
          <input
            type="text"
            value={inputPrompt}
            onChange={(e) => setInputPrompt(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder={`Ask ${coachModes.find(m => m.id === mode)?.label} anything...`}
            className="flex-1 px-4 py-2.5 text-xs rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
          />

          <button
            onClick={() => handleSend()}
            disabled={loading || !inputPrompt.trim()}
            className="p-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-500/20 transition-all disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
