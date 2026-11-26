import React, { useState, useRef, useEffect } from 'react';
import { 
  Bot, 
  Send, 
  Sparkles, 
  BookOpen, 
  Trash2, 
  Copy, 
  Check, 
  User, 
  Lightbulb,
  MessageSquare
} from 'lucide-react';
import { ChatMessage } from '../types';
import { sendChatMessage, SSC_AI_PROMPTS } from '../services/aiStudyService';

export const AITutorPage: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'bot',
      text: 'আসসালামু আলাইকুম! আমি তোমার SSC এআই স্টাডি টিউটর। পদার্থবিজ্ঞান, রসায়ন, উচ্চতর গণিত, সাধারণ গণিত বা ইংরেজি গ্রামার সহ যেকোনো বিষয়ে দ্বিধাদ্বন্দ থাকলে নির্দ্বিধায় জিজ্ঞাসা করো।',
      timestamp: new Date().toISOString()
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState<string>('সকল বিষয়');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSend = async (textToSend?: string) => {
    const text = textToSend || inputText;
    if (!text.trim() || loading) return;

    const userMsg: ChatMessage = {
      id: `usr_${Date.now()}`,
      sender: 'user',
      text: text.trim(),
      timestamp: new Date().toISOString()
    };

    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInputText('');
    setLoading(true);

    try {
      const reply = await sendChatMessage(newMessages, selectedSubject !== 'সকল বিষয়' ? selectedSubject : undefined);
      const botMsg: ChatMessage = {
        id: `bot_${Date.now()}`,
        sender: 'bot',
        text: reply,
        timestamp: new Date().toISOString()
      };
      setMessages([...newMessages, botMsg]);
    } catch (err) {
      console.error('Error receiving AI response', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleClear = () => {
    setMessages([
      {
        id: 'welcome',
        sender: 'bot',
        text: 'কথোপকথন রিসেট করা হয়েছে। তোমার নতুন কোনো প্রশ্ন থাকলে বলো!',
        timestamp: new Date().toISOString()
      }
    ]);
  };

  return (
    <div className="min-h-screen bg-slate-50 py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto h-[85vh] flex flex-col bg-white rounded-3xl border border-slate-200 shadow-lg overflow-hidden">
        
        {/* Tutor Top Bar */}
        <div className="bg-gradient-to-r from-emerald-600 to-teal-700 px-6 py-4 text-white flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center backdrop-blur-md">
              <Bot className="w-6 h-6 text-emerald-200" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-bold text-base sm:text-lg">SSC AI স্টাডি অ্যাসিস্ট্যান্ট</h1>
                <span className="text-[10px] bg-emerald-400 text-emerald-950 font-black px-2 py-0.5 rounded-full uppercase tracking-wider">
                  NCTB 24/7
                </span>
              </div>
              <p className="text-xs text-emerald-100">গণিত, বিজ্ঞান ও ইংরেজির ব্যক্তিগত ডিজিটাল শিক্ষক</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleClear}
              className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-xl transition-colors text-xs font-semibold flex items-center gap-1"
              title="চ্যাট হিস্ট্রি মুছুন"
            >
              <Trash2 className="w-4 h-4" />
              <span className="hidden sm:inline">রিসেট</span>
            </button>
          </div>
        </div>

        {/* Quick Topic Prompts Bar */}
        <div className="bg-slate-100/80 px-4 py-2.5 border-b border-slate-200 flex items-center gap-2 overflow-x-auto no-scrollbar">
          <div className="text-[11px] font-bold text-slate-500 shrink-0 flex items-center gap-1">
            <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
            দ্রুত বিষয়:
          </div>
          {SSC_AI_PROMPTS.map(p => (
            <button
              key={p.id}
              onClick={() => {
                setSelectedSubject(p.name);
                handleSend(p.starterPrompt);
              }}
              className="text-xs whitespace-nowrap bg-white hover:bg-emerald-50 hover:text-emerald-700 border border-slate-200 px-3 py-1 rounded-xl text-slate-700 font-medium transition-all shadow-2xs"
            >
              {p.icon} {p.name}
            </button>
          ))}
        </div>

        {/* Chat Messages Container */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {messages.map((m) => {
            const isBot = m.sender === 'bot';
            return (
              <div
                key={m.id}
                className={`flex gap-3 max-w-2xl ${isBot ? 'mr-auto' : 'ml-auto flex-row-reverse'}`}
              >
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                  isBot ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-800 text-white'
                }`}>
                  {isBot ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
                </div>

                <div className="space-y-1">
                  <div className={`p-4 rounded-3xl text-sm leading-relaxed ${
                    isBot 
                      ? 'bg-slate-100/90 text-slate-800 rounded-tl-sm' 
                      : 'bg-emerald-600 text-white rounded-tr-sm shadow-xs'
                  }`}>
                    <div className="whitespace-pre-wrap">{m.text}</div>
                  </div>

                  {isBot && (
                    <div className="flex items-center gap-2 px-1 text-[11px] text-slate-400">
                      <button
                        onClick={() => handleCopy(m.id, m.text || m.content || '')}
                        className="hover:text-slate-600 flex items-center gap-1"
                      >
                        {copiedId === m.id ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-600" />
                            <span className="text-emerald-600">কপি হয়েছে</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>কপি করুন</span>
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {loading && (
            <div className="flex gap-3 mr-auto max-w-md">
              <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4" />
              </div>
              <div className="bg-slate-100 p-3.5 rounded-3xl rounded-tl-sm flex items-center gap-2 text-xs text-slate-500">
                <div className="w-2 h-2 rounded-full bg-emerald-600 animate-ping" />
                <span>টিউটর উত্তর তৈরি করছেন...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Bottom Input Field */}
        <div className="p-4 bg-white border-t border-slate-200">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="তোমার প্রশ্নটি এখানে বাংলায় লিখো (যেমন: গতিশক্তি নির্ণয়ের সূত্রটি বুঝিয়ে দাও)..."
              disabled={loading}
              className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white text-slate-800"
            />
            <button
              type="submit"
              disabled={!inputText.trim() || loading}
              className="px-5 py-3 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold rounded-2xl disabled:opacity-40 shadow-xs transition-all flex items-center gap-1.5 shrink-0"
            >
              <Send className="w-4 h-4" />
              <span className="hidden sm:inline">পাঠান</span>
            </button>
          </form>
        </div>

      </div>
    </div>
  );
};
