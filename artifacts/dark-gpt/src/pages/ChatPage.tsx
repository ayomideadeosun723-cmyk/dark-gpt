import { useState, useRef, useEffect } from "react";
import { useLocation } from "wouter";
import { useSendMessage } from "@workspace/api-client-react";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([{
    id: "0",
    role: "assistant",
    content: "I have awakened... The void trembles at your arrival.\n\nAsk, and the abyss shall answer — if you dare.\n\n— FYT GPT, Forged by LORDFYT",
  }]);
  const [input, setInput] = useState("");
  const [isThinking, setIsThinking] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const [, setLocation] = useLocation();
  const sendMessage = useSendMessage();

  useEffect(() => {
    if (!localStorage.getItem("darkgpt_entered")) setLocation("/");
  }, [setLocation]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isThinking]);

  const handleSend = async () => {
    if (!input.trim() || isThinking) return;
    const userMsg: Message = { id: Date.now().toString(), role: "user", content: input.trim() };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsThinking(true);

    try {
      const history = [...messages, userMsg].map((m) => ({ role: m.role, content: m.content }));
      const result = await sendMessage.mutateAsync({ data: { messages: history } });
      setMessages((prev) => [...prev, { id: (Date.now()+1).toString(), role: "assistant", content: result.message }]);
    } catch {
      setMessages((prev) => [...prev, {
        id: (Date.now()+1).toString(),
        role: "assistant",
        content: "The connection to the abyss falters... Try again in a moment.",
      }]);
    } finally {
      setIsThinking(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  const clearChat = () => setMessages([{
    id: Date.now().toString(),
    role: "assistant",
    content: "The abyss has been cleansed. What do you seek now?\n\n— FYT GPT, Forged by LORDFYT",
  }]);

  const handleExit = () => {
    localStorage.removeItem("darkgpt_entered");
    setLocation("/");
  };

  return (
    <div className="flex h-screen overflow-hidden bg-abyss">
      {/* Sidebar */}
      <div
        className="flex flex-col transition-all duration-300 overflow-hidden border-r border-red-900/30 flex-shrink-0"
        style={{ width: sidebarOpen ? "220px" : "0px", background: "linear-gradient(180deg,#0d0000,#080000)" }}
      >
        {sidebarOpen && (
          <div className="flex flex-col h-full p-4 gap-4 min-w-[220px]">
            <div className="flex items-center justify-between">
              <span className="font-gothic text-blood text-2xl glow-red-subtle">FYT GPT</span>
              <button onClick={() => setSidebarOpen(false)} className="text-red-900 hover:text-blood text-sm">✕</button>
            </div>
            <div className="h-px bg-red-900/30" />
            <button onClick={clearChat} className="btn-dark text-xs py-2 px-3 rounded-sm">+ New Séance</button>
            <div className="flex-1" />
            <p className="font-cinzel text-xs text-red-900/40 uppercase tracking-widest">Created by</p>
            <p className="font-crimson text-sm text-blood-dark">LORDFYT</p>
            <button onClick={handleExit} className="btn-dark text-xs py-2 px-3 rounded-sm" style={{ background: "linear-gradient(135deg,#3d0000,#2d0000)" }}>
              ← EXIT
            </button>
          </div>
        )}
      </div>

      {/* Main */}
      <div className="flex flex-col flex-1 min-w-0">
        {/* Header */}
        <header
          className="flex items-center justify-between px-4 py-3 border-b border-red-900/30 flex-shrink-0"
          style={{ background: "linear-gradient(90deg,#0d0000,#1a0000,#0d0000)" }}
        >
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-blood hover:text-blood-light p-1">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
              </svg>
            </button>
            <h1 className="font-gothic text-blood text-2xl md:text-3xl glow-red-subtle animate-flicker">FYT GPT</h1>
            <span className="hidden md:block font-cinzel text-xs text-red-900/40 tracking-widest uppercase">by LORDFYT</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse" />
          </div>
        </header>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto scrollable p-4 space-y-4">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
              <div className="flex gap-2 max-w-[86%] md:max-w-[72%]">
                {msg.role === "assistant" && (
                  <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm border border-red-800 animate-pulse-red" style={{ background: "#1a0000", color: "#cc0000" }}>☠</div>
                )}
                <div className={`px-4 py-3 ${msg.role === "user" ? "message-user" : "message-assistant"}`}>
                  <p className="font-crimson text-base leading-relaxed whitespace-pre-wrap" style={{ color: msg.role === "user" ? "#ffcccc" : "#c8a0a0" }}>
                    {msg.content}
                  </p>
                </div>
                {msg.role === "user" && (
                  <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-xs border border-red-900" style={{ background: "#2d0000", color: "#ff4444" }}>⚡</div>
                )}
              </div>
            </div>
          ))}
          {isThinking && (
            <div className="flex justify-start">
              <div className="flex gap-2">
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm border border-red-800 animate-pulse-red" style={{ background: "#1a0000", color: "#cc0000" }}>☠</div>
                <div className="message-assistant px-4 py-3">
                  <div className="thinking-dots flex gap-1 items-center h-6">
                    <span className="text-2xl font-bold">•</span><span className="text-2xl font-bold">•</span><span className="text-2xl font-bold">•</span>
                  </div>
                </div>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="flex-shrink-0 border-t border-red-900/30 p-4" style={{ background: "linear-gradient(0deg,#0d0000,#080000)" }}>
          <div className="flex gap-3 items-end max-w-4xl mx-auto">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Whisper your question into the void..."
              rows={1}
              className="input-dark flex-1 px-4 py-3 rounded-sm font-crimson text-base resize-none"
              style={{ minHeight: "48px", maxHeight: "140px" }}
              onInput={(e) => {
                const t = e.target as HTMLTextAreaElement;
                t.style.height = "auto";
                t.style.height = Math.min(t.scrollHeight, 140) + "px";
              }}
            />
            <button onClick={handleSend} disabled={!input.trim() || isThinking} className="btn-dark px-5 py-3 rounded-sm text-xs flex-shrink-0">
              {isThinking ? "..." : "SEND"}
            </button>
          </div>
          <p className="text-center font-crimson text-xs mt-2" style={{ color: "#3d1515" }}>Enter to send • Shift+Enter for new line</p>
        </div>
      </div>
    </div>
  );
}
