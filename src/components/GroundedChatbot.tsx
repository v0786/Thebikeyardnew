import { CustomerTerms, readCustomerAcceptance } from './CustomerTerms';
import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, Send, X, Bot, User, CheckCircle2 } from 'lucide-react';
import { dealershipStore } from '../services/dealershipStore';

interface Message {
  id: string;
  sender: 'bot' | 'user';
  text: string;
  timestamp: string;
}

interface GroundedChatbotProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GroundedChatbot: React.FC<GroundedChatbotProps> = ({ isOpen, onClose }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'm-0',
      sender: 'bot',
      text: 'Namaste! I am The Bike Yard Assistant in Khopat, Thane. I can give you exact On-Road MH-04 prices, live floor stock, test ride slots, and 45-minute finance approvals. How can I help your ride today?',
      timestamp: 'Just now',
    },
  ]);
  const [input, setInput] = useState<string>('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSend = (textToSend?: string) => {
    const query = textToSend || input;
    if (!query.trim()) return;

    const userMsg: Message = {
      id: `u-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: 'Just now',
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInput('');

    setTimeout(() => {
      const response = dealershipStore.queryChatbot(query);
      const botMsg: Message = {
        id: `b-${Date.now()}`,
        sender: 'bot',
        text: response,
        timestamp: 'Just now',
      };
      setMessages((prev) => [...prev, botMsg]);
    }, 250);
  };

  const sampleQuestions = [
    'On-Road price of Hunter 350 in Thane?',
    'What bikes are ready in stock today?',
    'Showroom timings & Khopat address?',
    'How does two-wheeler finance work?',
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-x-2 bottom-[calc(4rem+env(safe-area-inset-bottom))] z-50 h-[520px] max-h-[calc(100dvh-5rem-env(safe-area-inset-bottom))] sm:left-auto sm:right-6 sm:w-[400px] md:bottom-6 rounded-2xl border border-slate-700 bg-slate-900 shadow-2xl flex flex-col overflow-hidden backdrop-blur-xl animate-in fade-in slide-in-from-bottom-4 duration-300">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 bg-slate-950 px-4 py-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-white">Dealership AI Assistant</span>
              <span className="rounded bg-emerald-500/20 px-1.5 py-0.2 text-[9px] font-bold text-emerald-400">
                Grounded
              </span>
            </div>
            <div className="text-[10px] text-slate-400">Khopat Showroom Real-Time Data</div>
          </div>
        </div>
        <button
          onClick={onClose}
          className="rounded-lg p-1 text-slate-400 hover:bg-slate-800 hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Message List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 text-xs">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex items-start gap-2.5 ${m.sender === 'user' ? 'flex-row-reverse' : ''}`}
          >
            <div
              className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${
                m.sender === 'user' ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-slate-300'
              }`}
            >
              {m.sender === 'user' ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
            </div>
            <div
              className={`max-w-[80%] [overflow-wrap:anywhere] rounded-2xl p-3 leading-relaxed ${
                m.sender === 'user'
                  ? 'bg-amber-500 text-slate-950 font-medium'
                  : 'bg-slate-950 border border-slate-800 text-slate-200'
              }`}
            >
              {m.text}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Suggested prompts strip */}
      <div className="px-3 py-2 border-t border-slate-800/80 bg-slate-950/50 flex overflow-x-auto gap-1.5 scrollbar-none">
        {sampleQuestions.map((q, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(q)}
            className="whitespace-nowrap rounded-lg border border-slate-800 bg-slate-900 px-2 py-1 text-[10px] font-medium text-slate-300 hover:border-amber-500/50 hover:text-white"
          >
            {q}
          </button>
        ))}
      </div>

      {/* Input row */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (!readCustomerAcceptance(e.currentTarget)) return;
          handleSend();
        }}
        className="space-y-2 border-t border-slate-800 bg-slate-950 p-2.5"
      >
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask for prices, waiting periods, RTO..."
            className="min-w-0 flex-1 rounded-xl border border-slate-800 bg-slate-900 px-3 py-2 text-xs text-white placeholder-slate-500 focus:border-amber-500 focus:outline-none"
          />
          <button
            type="submit"
            className="rounded-xl bg-amber-500 p-2 text-slate-950 hover:bg-amber-400 active:scale-95 transition-all"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
        <CustomerTerms purpose="answer your showroom question. Keep personal information out of chat" />
      </form>
    </div>
  );
};
