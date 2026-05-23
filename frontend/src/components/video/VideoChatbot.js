import React, { useState, useRef, useEffect, useCallback } from 'react';
import { videoAPI } from '../../services/api';
import {
  MessageCircle, X, Send, Bot, User, Sparkles,
  ChevronDown, Maximize2, Minimize2, ArrowLeft,
} from 'lucide-react';

const QUICK_QUESTIONS = [
  '📌 What is this video about?',
  '🔑 Key takeaways?',
  '🤔 Explain the hardest concept',
  '💡 Tips from this video?',
  '📚 What to learn next?',
];

/* Typing indicator dots */
const TypingDots = () => (
  <div style={{ display: 'flex', gap: 5, alignItems: 'center', padding: '4px 0' }}>
    {[0, 1, 2].map(i => (
      <span
        key={i}
        style={{
          width: 7, height: 7, borderRadius: '50%',
          background: 'var(--violet)',
          animation: `chatDot 1.2s ease-in-out ${i * 0.2}s infinite`,
          display: 'inline-block',
        }}
      />
    ))}
  </div>
);

/* Hook: detect if viewport width ≤ 640 (chat goes full-screen sheet) */
function useIsMobile() {
  const [isMobile, setIsMobile] = useState(() => window.innerWidth <= 640);
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 640px)');
    const handler = (e) => setIsMobile(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);
  return isMobile;
}

export default function VideoChatbot({ videoId, videoTitle }) {
  const [open, setOpen]         = useState(false);
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: `Hey there! 👋 I'm **VidBot** — your AI buddy for this video!\n\nAsk me anything about *"${videoTitle}"* and I'll help you out! 🚀`,
      id: 0,
    },
  ]);
  const [input, setInput]           = useState('');
  const [loading, setLoading]       = useState(false);
  const [showScroll, setShowScroll] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);

  const messagesEndRef  = useRef(null);
  const messagesBodyRef = useRef(null);
  const inputRef        = useRef(null);

  const isMobile = useIsMobile();

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    if (open) {
      scrollToBottom();
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [open, scrollToBottom]);

  useEffect(() => {
    if (open) scrollToBottom();
  }, [messages, open, scrollToBottom]);

  /* Close on Escape */
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape' && open) setOpen(false); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open]);

  /* Lock body scroll when mobile panel is open */
  useEffect(() => {
    if (isMobile && open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isMobile, open]);

  const handleScroll = () => {
    const el = messagesBodyRef.current;
    if (!el) return;
    setShowScroll(el.scrollHeight - el.scrollTop - el.clientHeight > 80);
  };

  const formatText = (text) =>
    text
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.+?)\*/g, '<em>$1</em>')
      .replace(/\n/g, '<br/>');

  const sendMessage = async (msgText) => {
    const trimmed = (msgText || input).trim();
    if (!trimmed || loading) return;

    const userMsg = { role: 'user', content: trimmed, id: Date.now() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    const history = messages
      .slice(1)
      .map(m => ({ role: m.role, content: m.content }));

    try {
      const { data } = await videoAPI.chatVideo(videoId, trimmed, history);
      const botMsg = { role: 'assistant', content: data.reply, id: Date.now() + 1 };
      setMessages(prev => [...prev, botMsg]);
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Oops! Something went wrong. Try again? 😅';
      setMessages(prev => [...prev, { role: 'assistant', content: errMsg, id: Date.now() + 1 }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  /* Auto-grow textarea */
  const handleInput = (e) => {
    e.target.style.height = 'auto';
    e.target.style.height = Math.min(e.target.scrollHeight, 160) + 'px';
  };

  /* ── Panel sizing logic ── */
  // On mobile: always full bottom sheet, no maximize
  // On desktop: floating panel, with optional maximize
  const panelClass = isMobile
    ? 'chat-panel chat-panel--mobile'
    : `chat-panel chat-panel--desktop${isMaximized ? ' chat-panel--maximized' : ''}`;

  const maximizedStyle = !isMobile && isMaximized
    ? {
        width: 'min(700px, calc(100vw - 48px))',
        maxHeight: 'calc(100svh - 120px)',
        right: 'max(24px, env(safe-area-inset-right, 24px))',
        bottom: 'max(96px, calc(env(safe-area-inset-bottom, 0px) + 96px))',
        borderRadius: 20,
      }
    : {};

  const panelVisible = {
    opacity: open ? 1 : 0,
    pointerEvents: open ? 'all' : 'none',
    transform: open ? 'translateY(0) scale(1)' : 'translateY(24px) scale(0.97)',
  };

  return (
    <>
      {/* ── Floating toggle button ── */}
      <button
        id="vidbot-toggle"
        className="chat-float-btn"
        onClick={() => setOpen(o => !o)}
        title="Chat about this video"
        aria-label={open ? 'Close VidBot chat' : 'Open VidBot chat'}
        aria-expanded={open}
        style={{
          transform: open ? 'scale(0.88) rotate(10deg)' : undefined,
        }}
      >
        {open ? <X size={22} color="#fff" /> : <MessageCircle size={24} color="#fff" />}
        {/* Pulse ring */}
        {!open && (
          <span style={{
            position: 'absolute', inset: -5, borderRadius: '50%',
            border: '2px solid rgba(124,58,237,0.4)',
            animation: 'vidbotPulse 2s ease-out infinite',
            pointerEvents: 'none',
          }} />
        )}
      </button>

      {/* ── Mobile backdrop ── */}
      {isMobile && open && (
        <div
          onClick={() => setOpen(false)}
          style={{
            position: 'fixed', inset: 0, zIndex: 9997,
            background: 'rgba(0,0,0,0.55)',
            backdropFilter: 'blur(4px)',
            WebkitBackdropFilter: 'blur(4px)',
            animation: 'fadeIn 0.25s ease',
          }}
          aria-hidden="true"
        />
      )}

      {/* ── Chat panel ── */}
      <div
        className={panelClass}
        style={{ ...panelVisible, ...maximizedStyle }}
        role="complementary"
        aria-label="VidBot AI Chat"
      >
        {/* Header */}
        <div style={{
          padding: '14px 16px',
          background: 'linear-gradient(135deg, rgba(124,58,237,0.3), rgba(245,158,11,0.15))',
          borderBottom: '1px solid rgba(124,58,237,0.2)',
          display: 'flex', alignItems: 'center', gap: 10,
          flexShrink: 0,
        }}>
          {/* Back/close */}
          <button
            onClick={() => setOpen(false)}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              padding: 6, borderRadius: 8, transition: 'background 0.2s',
              color: 'rgba(255,255,255,0.55)', minWidth: 36, minHeight: 36,
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
            onMouseLeave={e => e.currentTarget.style.background = 'none'}
            title="Minimize Chat"
            aria-label="Close chat"
          >
            <ArrowLeft size={18} />
          </button>

          <div style={{
            width: 34, height: 34, borderRadius: 10,
            background: 'linear-gradient(135deg, #7c3aed, #a78bfa)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
          }}>
            <Bot size={18} color="#fff" />
          </div>

          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{
              fontFamily: 'var(--font-display)', fontWeight: 800,
              fontSize: 15, color: '#fff', letterSpacing: '0.01em',
              display: 'flex', alignItems: 'center', gap: 5,
            }}>
              VidBot <Sparkles size={12} color="#f59e0b" />
            </div>
            {/* Truncated video title */}
            <div style={{
              fontSize: 11, color: 'rgba(255,255,255,0.4)',
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              maxWidth: 'clamp(120px, 30vw, 220px)',
            }}>
              {videoTitle}
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {/* Maximize toggle — desktop only */}
            {!isMobile && (
              <button
                onClick={() => setIsMaximized(!isMaximized)}
                style={{
                  background: 'rgba(255,255,255,0.05)', border: 'none',
                  cursor: 'pointer', display: 'flex', alignItems: 'center',
                  justifyContent: 'center', padding: 7, borderRadius: 8,
                  transition: 'all 0.2s', color: 'rgba(255,255,255,0.6)',
                  minWidth: 34, minHeight: 34,
                }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.12)'; e.currentTarget.style.color = '#fff'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = 'rgba(255,255,255,0.6)'; }}
                title={isMaximized ? 'Exit Fullscreen' : 'Fullscreen'}
                aria-label={isMaximized ? 'Minimize panel' : 'Expand panel'}
              >
                {isMaximized ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
              </button>
            )}

            {/* Online dot */}
            <div style={{
              width: 8, height: 8, borderRadius: '50%',
              background: '#10b981', boxShadow: '0 0 8px #10b981',
              animation: 'vidbotDotBlink 2s ease-in-out infinite',
            }} />
          </div>
        </div>

        {/* Messages body */}
        <div
          ref={messagesBodyRef}
          onScroll={handleScroll}
          style={{
            flex: 1, overflowY: 'auto',
            padding: 'clamp(12px,2vw,16px)',
            display: 'flex', flexDirection: 'column', gap: 12,
            minHeight: 0,
          }}
        >
          {messages.map((msg) => (
            <div
              key={msg.id}
              style={{
                display: 'flex',
                flexDirection: msg.role === 'user' ? 'row-reverse' : 'row',
                gap: 8, alignItems: 'flex-end',
                animation: 'chatMsgIn 0.25s ease both',
              }}
            >
              {/* Avatar */}
              <div style={{
                width: 28, height: 28, borderRadius: 8, flexShrink: 0,
                background: msg.role === 'user'
                  ? 'linear-gradient(135deg,#f59e0b,#d97706)'
                  : 'linear-gradient(135deg,#7c3aed,#a78bfa)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                {msg.role === 'user'
                  ? <User size={13} color="#0a0a12" />
                  : <Bot size={13} color="#fff" />
                }
              </div>
              {/* Bubble */}
              <div
                style={{
                  maxWidth: '80%',
                  padding: '9px 13px',
                  borderRadius: msg.role === 'user'
                    ? '16px 4px 16px 16px'
                    : '4px 16px 16px 16px',
                  background: msg.role === 'user'
                    ? 'linear-gradient(135deg,rgba(245,158,11,0.25),rgba(245,158,11,0.12))'
                    : 'rgba(255,255,255,0.05)',
                  border: msg.role === 'user'
                    ? '1px solid rgba(245,158,11,0.3)'
                    : '1px solid rgba(255,255,255,0.08)',
                  fontSize: 'clamp(13px,1.5vw,13.5px)',
                  lineHeight: 1.65,
                  color: msg.role === 'user' ? '#fbbf24' : 'rgba(240,240,248,0.9)',
                  wordBreak: 'break-word',
                  overflowWrap: 'break-word',
                }}
                dangerouslySetInnerHTML={{ __html: formatText(msg.content) }}
              />
            </div>
          ))}

          {/* Typing indicator */}
          {loading && (
            <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end', animation: 'chatMsgIn 0.25s ease both' }}>
              <div style={{
                width: 28, height: 28, borderRadius: 8, flexShrink: 0,
                background: 'linear-gradient(135deg,#7c3aed,#a78bfa)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Bot size={13} color="#fff" />
              </div>
              <div style={{
                padding: '10px 16px', borderRadius: '4px 16px 16px 16px',
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.08)',
              }}>
                <TypingDots />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Scroll-to-bottom button */}
        {showScroll && (
          <button
            onClick={scrollToBottom}
            style={{
              position: 'absolute', bottom: 88, right: 14,
              width: 30, height: 30, borderRadius: '50%',
              background: 'rgba(124,58,237,0.9)',
              border: 'none', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 2px 8px rgba(0,0,0,0.4)',
              transition: 'opacity 0.2s',
              zIndex: 1,
            }}
            aria-label="Scroll to latest message"
          >
            <ChevronDown size={15} color="#fff" />
          </button>
        )}

        {/* Quick questions — horizontal scrollable pills */}
        {messages.length <= 2 && !loading && (
          <div className="chat-quick-questions">
            {QUICK_QUESTIONS.map(q => (
              <button
                key={q}
                onClick={() => sendMessage(q)}
                style={{
                  fontSize: 11, padding: '5px 10px', borderRadius: 999,
                  background: 'rgba(124,58,237,0.15)',
                  border: '1px solid rgba(124,58,237,0.3)',
                  color: '#a78bfa', cursor: 'pointer',
                  fontFamily: 'var(--font-body)',
                  transition: 'all 0.2s',
                  whiteSpace: 'nowrap',
                  flexShrink: 0,
                  minHeight: 30,
                }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(124,58,237,0.3)'; e.currentTarget.style.color = '#c4b5fd'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(124,58,237,0.15)'; e.currentTarget.style.color = '#a78bfa'; }}
              >
                {q}
              </button>
            ))}
          </div>
        )}

        {/* Input bar */}
        <div className="chat-input-bar">
          <textarea
            ref={inputRef}
            id="vidbot-input"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKey}
            onInput={handleInput}
            placeholder="Ask anything about the video…"
            rows={1}
            disabled={loading}
            aria-label="Message VidBot"
            style={{
              flex: 1, resize: 'none', overflow: 'hidden',
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(124,58,237,0.3)',
              borderRadius: 12, padding: '9px 14px',
              color: 'rgba(240,240,248,0.9)',
              fontFamily: 'var(--font-body)',
              fontSize: 16, /* prevents iOS zoom */
              lineHeight: 1.5,
              outline: 'none',
              transition: 'border-color 0.2s, box-shadow 0.2s',
              maxHeight: 160,
              minHeight: 42,
            }}
            onFocus={e => { e.target.style.borderColor = '#7c3aed'; e.target.style.boxShadow = '0 0 0 3px rgba(124,58,237,0.15)'; }}
            onBlur={e => { e.target.style.borderColor = 'rgba(124,58,237,0.3)'; e.target.style.boxShadow = 'none'; }}
          />
          <button
            id="vidbot-send"
            onClick={() => sendMessage()}
            disabled={!input.trim() || loading}
            aria-label="Send message"
            style={{
              width: 42, height: 42, borderRadius: 12, flexShrink: 0,
              background: input.trim() && !loading
                ? 'linear-gradient(135deg,#7c3aed,#a78bfa)'
                : 'rgba(255,255,255,0.08)',
              border: 'none',
              cursor: input.trim() && !loading ? 'pointer' : 'not-allowed',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'all 0.2s',
              opacity: input.trim() && !loading ? 1 : 0.5,
              minWidth: 42,
            }}
          >
            <Send size={16} color={input.trim() && !loading ? '#fff' : 'rgba(255,255,255,0.5)'} />
          </button>
        </div>
      </div>

      {/* ── Inline keyframes ── */}
      <style>{`
        @keyframes vidbotPulse {
          0%   { transform: scale(1); opacity: 0.8; }
          100% { transform: scale(1.65); opacity: 0; }
        }
        @keyframes chatDot {
          0%, 80%, 100% { transform: scale(0.7); opacity: 0.4; }
          40%            { transform: scale(1);   opacity: 1;   }
        }
        @keyframes chatMsgIn {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0);   }
        }
        @keyframes vidbotDotBlink {
          0%,100% { opacity: 1;   }
          50%     { opacity: 0.4; }
        }
      `}</style>
    </>
  );
}
