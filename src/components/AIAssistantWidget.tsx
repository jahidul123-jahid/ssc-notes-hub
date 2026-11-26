import React, { useState } from 'react';
import { Bot, X, Send, Sparkles } from 'lucide-react';
import { ChatMessage } from '../types';
import { sendChatMessage } from '../services/aiStudyService';

export const AIAssistantWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'greet',
      sender: 'bot',
      text: 'হ্যালো! কোনো প্রশ্ন বা জটিল অংক বুঝতে সমস্যা হলে আমাকে বলো!',
      timestamp: new Date().toISOString()
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMsg: ChatMessage = {
      id: `usr_${Date.now()}`,
      sender: 'user',
      text: input.trim(),
      timestamp: new Date().toISOString()
    };

    const newMsgs = [...messages, userMsg];
    setMessages(newMsgs);
    setInput('');
    setLoading(true);

    try {
      const reply = await sendChatMessage(newMsgs);
      setMessages([...newMsgs, {
        id: `bot_${Date.now()}`,
        sender: 'bot',
        text: reply,
        timestamp: new Date().toISOString()
      }]);
    } catch {
      // Handled
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-40">
      {/* Floating Toggle Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="group relative flex items-center gap-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-4 py-3 rounded-full shadow-xl hover:shadow-2xl hover:scale-105 active:scale-95 transition-all"
        >
          <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
            <Bot className="w-5 h-5 text-emerald-100 group-hover:rotate-12 transition-transform" />
          </div>
          <span className="text-xs sm:text-sm font-bold pr-1">AI টিউটর</span>
          <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-amber-400 rounded-full border-2 border-white animate-pulse" />
        </button>
      )}

      {/* Floating Chat Modal */}
      {isOpen && (
        <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-80 sm:w-96 h-[480px] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
          
          {/* Header */}
          <div className="bg-gradient-to-r from-emerald-600 to-teal-700 px-4 py-3.5 text-white flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-emerald-200" />
              </div>
              <div>
                <h3 className="font-bold text-sm">SSC AI হেল্পার</h3>
                <span className="text-[10px] text-emerald-200 font-medium">লাইভ স্টাডি অ্যাসিস্ট্যান্ট</span>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 hover:bg-white/20 rounded-lg transition-colors text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-3 space-y-3">
            {messages.map(m => (
              <div
                key={m.id}
                className={`flex gap-2 ${m.sender === 'bot' ? 'mr-4' : 'ml-4 flex-row-reverse'}`}
              >
                <div className={`p-3 rounded-2xl text-xs leading-relaxed ${
                  m.sender === 'bot'
                    ? 'bg-slate-100 text-slate-800 rounded-tl-xs'
                    : 'bg-emerald-600 text-white rounded-tr-xs'
                }`}>
                  <p className="whitespace-pre-wrap">{m.text}</p>
                </div>
              </div>
            ))}
            {loading && (
              <div className="text-[11px] text-slate-400 p-2 italic flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                উত্তর খোঁজা হচ্ছে...
              </div>
            )}
          </div>

          {/* Quick Input */}
          <div className="p-2.5 bg-slate-50 border-t border-slate-100 flex items-center gap-1.5">
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSend()}
              placeholder="প্রশ্ন লিখুন..."
              className="flex-1 text-xs px-3 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || loading}
              className="p-2.5 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 disabled:opacity-40"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>

        </div>
      )}
    </div>
  );
};
