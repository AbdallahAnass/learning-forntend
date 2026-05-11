import { useEffect, useRef, useState } from "react";
import { Loader2, Send, Heart } from "lucide-react";
import StudentLayout from "@/components/StudentLayout";
import { getWellnessAdvice, sendWellnessMessage } from "@/api/wellness";

function MessageBubble({ msg }) {
  const isUser = msg.role === "user";
  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      {!isUser && (
        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mr-2 mt-0.5">
          <Heart className="w-4 h-4 text-primary" />
        </div>
      )}
      <div
        className={`max-w-[70%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
          isUser
            ? "bg-primary text-primary-foreground rounded-br-sm"
            : "bg-white border border-border text-foreground rounded-bl-sm shadow-sm"
        }`}
      >
        {msg.content}
      </div>
    </div>
  );
}

function TypingIndicator() {
  return (
    <div className="flex items-start">
      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mr-2 mt-0.5">
        <Heart className="w-4 h-4 text-primary" />
      </div>
      <div className="bg-white border border-border rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm">
        <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
      </div>
    </div>
  );
}

export default function WellnessChat() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    const el = inputRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = el.scrollHeight + "px";
  }, [input]);

  useEffect(() => {
    setSending(true);
    getWellnessAdvice()
      .then((data) => setMessages([{ role: "assistant", content: data.advice }]))
      .catch(() => setMessages([{ role: "assistant", content: "Hi! I'm your wellness companion. How are you feeling today?" }]))
      .finally(() => setSending(false));
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, sending]);

  async function handleSend() {
    const text = input.trim();
    if (!text || sending) return;

    const userMsg = { role: "user", content: text };
    const history = messages.map((m) => ({ role: m.role, content: m.content }));

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setSending(true);

    try {
      const data = await sendWellnessMessage(text, history);
      setMessages((prev) => [...prev, { role: "assistant", content: data.reply }]);
    } catch {
      setMessages((prev) => [...prev, { role: "assistant", content: "Sorry, something went wrong. Please try again." }]);
    } finally {
      setSending(false);
    }
  }

  function handleKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  return (
    <StudentLayout>
      <div className="max-w-2xl mx-auto px-6 py-8 flex flex-col" style={{ height: "calc(100vh - 4rem)" }}>
        {/* Header */}
        <div className="mb-6 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Heart className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">Wellness Companion</h1>
              <p className="text-sm text-muted-foreground">Here to support your learning journey</p>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto space-y-4 pb-4 min-h-0">
          {messages.length === 0 && sending && <TypingIndicator />}
          {messages.map((msg, i) => (
            <MessageBubble key={i} msg={msg} />
          ))}
          {messages.length > 0 && sending && <TypingIndicator />}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="shrink-0 pt-4 border-t border-border flex items-end gap-3">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Share how you're feeling or ask anything…"
            rows={1}
            className="flex-1 resize-none rounded-xl border border-border px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 overflow-hidden"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || sending}
            className="w-11 h-11 rounded-xl bg-primary text-primary-foreground flex items-center justify-center hover:bg-primary/90 disabled:opacity-50 transition-colors shrink-0"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </StudentLayout>
  );
}
