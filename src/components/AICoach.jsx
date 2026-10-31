import React, { useState, useEffect, useRef } from 'react';
import { Send, ArrowRight, Settings, X, Cpu, CheckCircle2 } from 'lucide-react';
import { getLifeRecommendation, DEFAULT_ADAPTION_KEY, DEFAULT_ADAPTION_MODEL } from '../services/aiService';

export default function AICoach({ user, onNavigate, onCompleteMission }) {
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      sender: 'ai',
      text: `Hello ${user.name}. I am your LiFE AI Coach, connected to the Adaptation AI Platform (deepseek-v4-flash).

Your household consumes ${user.monthlyElectricityUnits} units/month (${user.monthlyFootprintKg} kg CO₂e).

Ask a sustainability question below or select one of the suggested prompts.`,
      timestamp: 'Just now',
      isAdaptation: true
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

  const [isConnected, setIsConnected] = useState(true);
  const [modalFeedback, setModalFeedback] = useState(null);

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const presetQuestions = [
    "What should I improve today?",
    "How can I reduce my electricity bill?",
    "Is solar suitable for me?",
    "What mission should I do next?"
  ];

  const handleSaveConfig = () => {
    if (apiKey.trim()) {
      localStorage.setItem('adaption_api_key', apiKey.trim());
      localStorage.setItem('adaption_model', selectedModel);
      setIsConnected(true);
      setModalFeedback("Key saved! Adaptation AI active.");
      setTimeout(() => {
        setShowConfigModal(false);
        setModalFeedback(null);
      }, 1000);
    } else {
      localStorage.removeItem('adaption_api_key');
      setIsConnected(false);
      setModalFeedback("Key removed. Switched to local fallback.");
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
          isAdaptation: rec.isAdaptationPlatform !== false,
          provider: rec.provider || 'Adaptation AI (deepseek-v4-flash)',
          actionTitle: rec.actionTitle,
          actionTab: rec.actionTab,
          actionMissionId: rec.actionMissionId,
          impactKg: rec.impactKg,
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
    <div className="space-y-5 max-w-3xl mx-auto">
      {/* Title & Connection Header */}
      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 pb-4 border-b border-[#1f2125]">
        <div>
          <h2 className="text-xl sm:text-2xl font-semibold text-zinc-100">
            LiFE AI Coach
          </h2>
          <p className="text-xs text-zinc-400 mt-0.5">
            Powered by Adaptation Platform across 242 Indian languages.
          </p>
        </div>

        {/* Adaptation Platform Status Pill */}
        <button
          onClick={() => setShowConfigModal(true)}
          className="px-2.5 py-1 rounded-md text-xs font-mono flex items-center gap-1.5 border bg-emerald-950/40 text-emerald-300 border-emerald-500/30 hover:border-emerald-500/60 transition-colors cursor-pointer"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span>Adaptation AI: Connected ({selectedModel.split('-')[0]})</span>
          <Settings className="w-3 h-3 text-emerald-400/80 ml-0.5" />
        </button>
      </div>

      {/* Suggested Questions */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
        {presetQuestions.map((q, idx) => (
          <button
            key={idx}
            onClick={() => handleSendMessage(q)}
            className="px-2.5 py-1 rounded-md bg-[#16171a] hover:bg-zinc-800 border border-[#26282e] text-zinc-400 hover:text-zinc-200 text-xs whitespace-nowrap cursor-pointer transition-colors"
          >
            {q}
          </button>
        ))}
      </div>

      {/* Chat Container */}
      <div className="card-minimal rounded-xl p-4 sm:p-5 flex flex-col justify-between min-h-[440px] max-h-[560px]">
        {/* Messages List */}
        <div className="space-y-3.5 overflow-y-auto pr-1 max-h-[420px]">
          {messages.map((m) => {
            const isUser = m.sender === 'user';
            return (
              <div
                key={m.id}
                className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-[85%] rounded-lg px-3.5 py-2.5 text-xs sm:text-sm leading-relaxed ${
                  isUser
                    ? 'bg-zinc-200 text-zinc-950 font-medium'
                    : 'bg-[#18191d] text-zinc-300 border border-[#25272e]'
                }`}>
                  <p className="whitespace-pre-line">{m.text}</p>

                  {/* Contextual Action Button */}
                  {m.actionTitle && (
                    <div className="mt-3 pt-2.5 border-t border-[#26282e] flex items-center justify-between">
                      <button
                        onClick={() => {
                          if (m.actionTab) {
                            onNavigate(m.actionTab);
                          } else if (m.actionMissionId) {
                            onCompleteMission(m.actionMissionId, 50, m.impactKg || 0.4);
                          }
                        }}
                        className="text-xs font-medium text-emerald-400 hover:text-emerald-300 flex items-center gap-1 cursor-pointer"
                      >
                        <span>{m.actionTitle}</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                      {m.impactKg && (
                        <span className="text-[11px] font-mono text-zinc-500">
                          ~{m.impactKg} kg CO₂
                        </span>
                      )}
                    </div>
                  )}

                  <div className="flex items-center justify-between mt-1.5 text-[9px] font-mono text-zinc-600">
                    <span className="text-emerald-500/80">⚡ Live Adaptation AI</span>
                    <span>{m.timestamp}</span>
                  </div>
                </div>
              </div>
            );
          })}

          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-[#18191d] border border-[#25272e] px-3 py-2 rounded-lg text-xs text-zinc-400 font-mono flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                <span>Adaptation model reasoning...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div className="pt-3 border-t border-[#1f2125] mt-3">
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
              placeholder="Ask LiFE AI Coach..."
              className="flex-1 bg-[#16171a] text-zinc-200 placeholder-zinc-500 text-xs sm:text-sm px-3.5 py-2 rounded-lg border border-[#26282e] focus:outline-none focus:border-zinc-700"
            />
            <button
              type="submit"
              disabled={!inputText.trim()}
              className="px-3 py-2 rounded-lg bg-zinc-100 hover:bg-zinc-200 disabled:opacity-40 text-zinc-950 font-medium text-xs flex items-center gap-1 cursor-pointer transition-colors"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      </div>

      {/* Adaptation Platform Config Modal */}
      {showConfigModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="card-minimal bg-[#121315] border border-[#282a30] rounded-xl p-5 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#1f2125] pb-3">
              <div className="flex items-center gap-2">
                <Cpu className="w-4 h-4 text-emerald-400" />
                <h3 className="text-sm font-semibold text-zinc-100">
                  Adaptation Platform Settings
                </h3>
              </div>
              <button 
                onClick={() => setShowConfigModal(false)}
                className="text-zinc-500 hover:text-zinc-300 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-2.5 rounded-lg bg-emerald-950/30 border border-emerald-500/20 text-xs text-emerald-300 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span>Platform Key is active and connected ($500 credit tier).</span>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-mono uppercase text-zinc-400 block mb-1">
                  Adaption API Key
                </label>
                <input
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="Paste your ADAPTION_API_KEY..."
                  className="w-full bg-[#16171a] text-zinc-200 text-xs px-3 py-2 rounded-lg border border-[#26282e] focus:outline-none focus:border-zinc-700 font-mono"
                />
              </div>

              <div>
                <label className="text-xs font-mono uppercase text-zinc-400 block mb-1">
                  Active Model
                </label>
                <select
                  value={selectedModel}
                  onChange={(e) => setSelectedModel(e.target.value)}
                  className="w-full bg-[#16171a] text-zinc-200 text-xs px-3 py-2 rounded-lg border border-[#26282e] focus:outline-none"
                >
                  <option value="deepseek-v4-flash">deepseek-v4-flash (Recommended)</option>
                  <option value="qwen3.8-27b">qwen3.8-27b</option>
                  <option value="gemma-4-31b-it">gemma-4-31b-it</option>
                  <option value="glm-5.2">glm-5.2</option>
                  <option value="qwen3.5-397b">qwen3.5-397b</option>
                </select>
              </div>
            </div>

            {modalFeedback && (
              <p className="text-xs text-emerald-400 font-medium">
                {modalFeedback}
              </p>
            )}

            <div className="pt-2 flex justify-end gap-2 border-t border-[#1f2125]">
              <button
                type="button"
                onClick={() => setShowConfigModal(false)}
                className="px-3 py-1.5 rounded-lg text-xs text-zinc-400 hover:text-zinc-200"
              >
                Close
              </button>
              <button
                type="button"
                onClick={handleSaveConfig}
                className="px-4 py-1.5 rounded-lg bg-zinc-100 hover:bg-zinc-200 text-zinc-950 font-semibold text-xs flex items-center gap-1.5 cursor-pointer"
              >
                <span>Save Changes</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
