import React, { useState, useEffect, useRef } from 'react';
import { Send, ArrowRight, Settings, X, Cpu, CheckCircle2, Sparkles, Bot, User } from 'lucide-react';
import { getLifeRecommendation, DEFAULT_ADAPTION_KEY, DEFAULT_ADAPTION_MODEL } from '../services/aiService';
import { BRANDING } from '../config/branding';

export default function AICoach({ user, onNavigate, onCompleteMission }) {
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      sender: 'ai',
      text: `Hello ${user.name}! I am your LiFE+ sustainability advisor for ${user.locality ? `${user.locality}, ` : ''}${user.city || 'Gujarat'}.

Your household consumes approx ${user.monthlyElectricityUnits} units/month (${user.monthlyFootprintKg} kg CO₂e). How can I help you reduce your bill or optimize energy consumption today?`,
      timestamp: 'Just now'
    }
  ]);

  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showConfigModal, setShowConfigModal] = useState(false);

  // Initialize with key pre-baked
  const [apiKey, setApiKey] = useState(() => {
    const saved = localStorage.getItem('adaption_api_key');
    if (!saved) {
      localStorage.setItem('adaption_api_key', DEFAULT_ADAPTION_KEY);
      return DEFAULT_ADAPTION_KEY;
    }
    return saved;
  });

  const [selectedModel, setSelectedModel] = useState(() => {
    return localStorage.getItem('adaption_model') || DEFAULT_ADAPTION_MODEL;
  });

  const [modalFeedback, setModalFeedback] = useState(null);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const presetQuestions = [
    "How to cut my electricity bill in Gujarat?",
    "Is rooftop solar suitable for my roof?",
    "How does Time-of-Day (ToD) off-peak tariff work?",
    "What mission should I do today?"
  ];

  const handleSaveConfig = () => {
    if (apiKey.trim()) {
      localStorage.setItem('adaption_api_key', apiKey.trim());
      localStorage.setItem('adaption_model', selectedModel);
      setModalFeedback("Key saved! Adaptation AI active.");
      setTimeout(() => {
        setShowConfigModal(false);
        setModalFeedback(null);
      }, 1000);
    } else {
      localStorage.removeItem('adaption_api_key');
      setModalFeedback("Switched to GEDA local rule engine.");
    }
  };

  const handleSendMessage = async (customText = null) => {
    const textToSend = customText || inputText;
    if (!textToSend.trim()) return;

    const userMsg = {
      id: `user_${Date.now()}`,
      sender: 'user',
      text: textToSend,
      timestamp: 'Just now'
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setIsTyping(true);

    try {
      const rec = await getLifeRecommendation(user, {
        question: textToSend
      });

      setIsTyping(false);
      setMessages((prev) => [
        ...prev,
        {
          id: `ai_${Date.now()}`,
          sender: 'ai',
          text: rec.text,
          provider: rec.provider || 'LiFE+ Intelligence',
          actionTitle: rec.actionTitle,
          actionTab: rec.actionTab,
          timestamp: 'Just now'
        }
      ]);
    } catch (err) {
      setIsTyping(false);
      setMessages((prev) => [
        ...prev,
        {
          id: `ai_err_${Date.now()}`,
          sender: 'ai',
          text: "Action plan: Adjust AC to 26°C and check rooftop solar feasibility on GEDA portal.",
          timestamp: 'Just now'
        }
      ]);
    }
  };

  return (
    <div className="space-y-5 max-w-4xl mx-auto">
      {/* Title & Connection Header */}
      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-3 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
              LiFE+ AI Companion
            </span>
            <span className="text-xs text-slate-500 font-medium">Adaptation Platform & Local Intelligence</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-1.5">
            Personal Sustainability Advisor
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">
            Context-aware residential recommendations tailored to your Gujarat consumption baseline.
          </p>
        </div>

        {/* Model status */}
        <button
          onClick={() => setShowConfigModal(true)}
          className="px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-2 border bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800 hover:border-emerald-300 transition-all cursor-pointer shadow-xs self-start sm:self-auto"
        >
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>{selectedModel}</span>
          <Settings className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 ml-1" />
        </button>
      </div>

      {/* Suggested Questions */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        {presetQuestions.map((q, idx) => (
          <button
            key={idx}
            onClick={() => handleSendMessage(q)}
            className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-medium whitespace-nowrap cursor-pointer transition-colors shadow-xs"
          >
            {q}
          </button>
        ))}
      </div>

      {/* Chat Container */}
      <div className="human-card p-5 sm:p-6 flex flex-col justify-between min-h-[460px] max-h-[580px]">
        {/* Messages List */}
        <div className="space-y-4 overflow-y-auto pr-1 max-h-[440px]">
          {messages.map((m) => {
            const isUser = m.sender === 'user';
            return (
              <div
                key={m.id}
                className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                {!isUser && (
                  <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center flex-shrink-0 text-xs font-bold shadow-xs">
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-xs sm:text-sm leading-relaxed shadow-xs ${
                  isUser
                    ? 'bg-emerald-600 text-white font-medium'
                    : 'bg-slate-100/90 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200/60 dark:border-slate-700'
                }`}>
                  <p className="whitespace-pre-line">{m.text}</p>

                  {/* Contextual Action Button */}
                  {m.actionTitle && (
                    <div className="mt-3.5 pt-3 border-t border-slate-200/80 dark:border-slate-700 flex items-center justify-between">
                      <button
                        onClick={() => {
                          if (m.actionTab) {
                            onNavigate(m.actionTab);
                          }
                        }}
                        className="text-xs font-bold text-emerald-700 dark:text-emerald-400 hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <span>{m.actionTitle}</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}

                  <div className={`flex items-center justify-between mt-2 text-[10px] ${isUser ? 'text-emerald-100' : 'text-slate-400'}`}>
                    <span>{m.provider || 'LiFE+ Companion'}</span>
                    <span>{m.timestamp}</span>
                  </div>
                </div>

                {isUser && (
                  <div className="w-8 h-8 rounded-full bg-slate-800 text-white flex items-center justify-center flex-shrink-0 text-xs font-bold shadow-xs">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            );
          })}

          {isTyping && (
            <div className="flex gap-3 justify-start">
              <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center flex-shrink-0 text-xs font-bold">
                <Bot className="w-4 h-4" />
              </div>
              <div className="bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-4 py-2.5 rounded-2xl text-xs text-slate-500 font-medium flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                <span>LiFE+ model analyzing domestic consumption...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 mt-3">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Ask anything about saving power, ToD tariffs, or solar in Gujarat..."
              className="flex-1 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 text-xs sm:text-sm px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
            />
            <button
              type="submit"
              disabled={!inputText.trim()}
              className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white font-semibold text-xs sm:text-sm flex items-center gap-1.5 cursor-pointer shadow-xs transition-all"
            >
              <span>Send</span>
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      </div>

      {/* Adaptation Platform Config Modal */}
      {showConfigModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Cpu className="w-5 h-5 text-emerald-600" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  AI Model Configuration
                </h3>
              </div>
              <button 
                onClick={() => setShowConfigModal(false)}
                className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/40 text-xs text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>Connected to Adaptation Platform ({selectedModel}).</span>
            </div>

            <div className="space-y-3 pt-1">
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Adaptation Platform API Key
                </label>
                <input
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="Paste your ADAPTION_API_KEY..."
                  className="w-full bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 font-mono focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Active Model
                </label>
                <select
                  value={selectedModel}
                  onChange={(e) => setSelectedModel(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-emerald-500 cursor-pointer"
                >
                  <option value="deepseek-v4-flash">deepseek-v4-flash (Fast & Accurate)</option>
                  <option value="qwen3.8-27b">qwen3.8-27b</option>
                  <option value="gemma-4-31b-it">gemma-4-31b-it</option>
                </select>
              </div>
            </div>

            {modalFeedback && (
              <p className="text-xs text-emerald-600 font-semibold">
                {modalFeedback}
              </p>
            )}

            <div className="pt-3 flex justify-end gap-2 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setShowConfigModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-500 hover:text-slate-700"
              >
                Close
              </button>
              <button
                type="button"
                onClick={handleSaveConfig}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <span>Save Settings</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
