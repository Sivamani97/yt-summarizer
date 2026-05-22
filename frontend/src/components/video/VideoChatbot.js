import React, { useState, useRef, useEffect, useCallback } from 'react';
import { videoAPI } from '../../services/api';
import { MessageCircle, X, Send, Bot, User, Sparkles, ChevronDown, Maximize2, Minimize2, ArrowLeft } from 'lucide-react';

const QUICK_QUESTIONS = [
  '📌 What is this video about?',
  '🔑 What are the key takeaways?',
  '🤔 Explain the hardest concept',
  '💡 Any tips from the video?',
  '📚 What should I learn next?',
];

const TypingDots = () => (
  <div style={{ display: 'flex', gap: 5, alignItems: 'center', padding: '4px 0' }}>
    {[0, 1, 2].map(i => (
      <span key={i} style={{
        width: 7, height: 7, borderRadius: '50%',
        background: 'var(--violet)',
        animation: `chatDot 1.2s ease-in-out ${i * 0.2}s infinite`,
        display: 'inline-block',
      }} />
    ))}
  </div>
);

export default function VideoChatbot({ videoId, videoTitle }) {
  const [open, setOpen]         = useState(false);
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: `Hey there! 👋 I'm **VidBot** — your AI buddy for this video!\n\nAsk me anything about *"${videoTitle}"* and I'll do my best to help you out! 🚀`,
      id: 0,
    },
  ]);
  const [input, setInput]       = useState('');
  const [loading, setLoading]   = useState(false);
  const [showScroll, setShowScroll] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);

  const messagesEndRef  = useRef(null);
  const messagesBodyRef = useRef(null);
  const inputRef        = useRef(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => { if (open) { scrollToBottom(); setTimeout(() => inputRef.current?.focus(), 100); } }, [open, scrollToBottom]);
  useEffect(() => { if (open) scrollToBottom(); }, [messages, open, scrollToBottom]);

  const handleScroll = () => {
    const el = messagesBodyRef.current;
    if (!el) return;
    setShowScroll(el.scrollHeight - el.scrollTop - el.clientHeight > 80);
  };

  const formatText = (text) => {
    // Bold, italic, line breaks
    return text
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.+?)\*/g, '<em>$1</em>')
      .replace(/\n/g, '<br/>');
  };

  const sendMessage = async (msgText) => {
    const trimmed = (msgText || input).trim();
    if (!trimmed || loading) return;

    const userMsg = { role: 'user', content: trimmed, id: Date.now() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    // Build history from existing messages (skip the initial greeting)
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

  return (
    <>
      {/* ── Floating button ── */}
      <button
        id="vidbot-toggle"
        onClick={() => setOpen(o => !o)}
        title="Chat about this video"
        style={{
          position: 'fixed', bottom: 28, right: 28, zIndex: 9999,
          width: 58, height: 58, borderRadius: '50%',
          background: 'linear-gradient(135deg, #7c3aed, #f59e0b)',
          border: 'none', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 4px 24px rgba(124,58,237,0.5)',
          transition: 'all 0.3s cubic-bezier(0.175,0.885,0.32,1.275)',
          transform: open ? 'scale(0.9) rotate(10deg)' : 'scale(1)',
        }}
        onMouseEnter={e => { if (!open) e.currentTarget.style.transform = 'scale(1.1)'; }}
        onMouseLeave={e => { if (!open) e.currentTarget.style.transform = 'scale(1)'; }}
      >
        {open
          ? <X size={22} color="#fff" />
          : <MessageCircle size={24} color="#fff" />
        }
        {/* Pulse ring */}
        {!open && (
          <span style={{
            position: 'absolute', inset: -4, borderRadius: '50%',
            border: '2px solid rgba(124,58,237,0.4)',
            animation: 'vidbotPulse 2s ease-out infinite',
            pointerEvents: 'none',
          }} />
        )}
      </button>

      {/* ── Chat panel ── */}
      <div style={{
        position: 'fixed', zIndex: 9998,
        width: isMaximized ? 'calc(100vw - 40px)' : 'min(400px, calc(100vw - 56px))',
        height: isMaximized ? 'calc(100vh - 120px)' : 'auto',
        maxHeight: isMaximized ? 'none' : 580,
        display: 'flex', flexDirection: 'column',
        background: 'rgba(17,17,32,0.92)',
        backdropFilter: 'blur(24px)',
        border: '1px solid rgba(124,58,237,0.35)',
        borderRadius: isMaximized ? 24 : 20,
        boxShadow: '0 8px 48px rgba(0,0,0,0.6), 0 0 0 1px rgba(124,58,237,0.15), inset 0 1px 0 rgba(255,255,255,0.06)',
        overflow: 'hidden',
        transform: open ? 'translateY(0) scale(1)' : 'translateY(20px) scale(0.97)',
        opacity: open ? 1 : 0,
        pointerEvents: open ? 'all' : 'none',
        transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.1)',
        transformOrigin: 'bottom right',
        right: isMaximized ? 20 : 28,
        bottom: isMaximized ? 100 : 100,
      }}>

        {/* Header */}
        <div style={{
          padding: '16px 20px',
          background: 'linear-gradient(135deg, rgba(124,58,237,0.3), rgba(245,158,11,0.15))',
          borderBottom: '1px solid rgba(124,58,237,0.2)',
          display: 'flex', alignItems: 'center', gap: 12,
          flexShrink: 0,
        }}>
          {/* Go Back / Close internal button */}
          <button
            onClick={() => setOpen(false)}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              padding: 4, borderRadius: 6, transition: 'background 0.2s',
              color: 'rgba(255,255,255,0.5)',
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
            onMouseLeave={e => e.currentTarget.style.background = 'none'}
            title="Minimize Chat"
          >
            <ArrowLeft size={18} />
          </button>

          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: 'linear-gradient(135deg, #7c3aed, #a78bfa)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
          }}>
            <Bot size={20} color="#fff" />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{
              fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 15,
              color: '#fff', letterSpacing: '0.01em',
              display: 'flex', alignItems: 'center', gap: 6,
            }}>
              VidBot <Sparkles size={13} color="#f59e0b" />
            </div>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {/* Fullscreen Toggle */}
            <button
              onClick={() => setIsMaximized(!isMaximized)}
              style={{
                background: 'rgba(255,255,255,0.05)', border: 'none', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                padding: 6, borderRadius: 8, transition: 'all 0.2s',
                color: 'rgba(255,255,255,0.7)',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = '#fff'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = 'rgba(255,255,255,0.7)'; }}
              title={isMaximized ? "Exit Fullscreen" : "Fullscreen"}
            >
              {isMaximized ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
            </button>

            <div style={{
              width: 8, height: 8, borderRadius: '50%',
              background: '#10b981',
              boxShadow: '0 0 8px #10b981',
              animation: 'vidbotDotBlink 2s ease-in-out infinite',
            }} />
          </div>
        </div>

        {/* Messages body */}
        <div
          ref={messagesBodyRef}
          onScroll={handleScroll}
          style={{
            flex: 1, overflowY: 'auto', padding: '16px 16px 8px',
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
                gap: 10, alignItems: 'flex-end',
                animation: 'chatMsgIn 0.25s ease both',
              }}
            >
              {/* Avatar */}
              <div style={{
                width: 28, height: 28, borderRadius: 8, flexShrink: 0,
                background: msg.role === 'user'
                  ? 'linear-gradient(135deg, #f59e0b, #d97706)'
                  : 'linear-gradient(135deg, #7c3aed, #a78bfa)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                {msg.role === 'user'
                  ? <User size={14} color="#0a0a12" />
                  : <Bot size={14} color="#fff" />
                }
              </div>

              {/* Bubble */}
              <div style={{
                maxWidth: '78%',
                padding: '10px 14px',
                borderRadius: msg.role === 'user'
                  ? '16px 4px 16px 16px'
                  : '4px 16px 16px 16px',
                background: msg.role === 'user'
                  ? 'linear-gradient(135deg, rgba(245,158,11,0.25), rgba(245,158,11,0.12))'
                  : 'rgba(255,255,255,0.05)',
                border: msg.role === 'user'
                  ? '1px solid rgba(245,158,11,0.3)'
                  : '1px solid rgba(255,255,255,0.08)',
                fontSize: 13.5,
                lineHeight: 1.65,
                color: msg.role === 'user' ? '#fbbf24' : 'rgba(240,240,248,0.9)',
                wordBreak: 'break-word',
              }}
                dangerouslySetInnerHTML={{ __html: formatText(msg.content) }}
              />
            </div>
          ))}

          {/* Typing indicator */}
          {loading && (
            <div style={{ display: 'flex', gap: 10, alignItems: 'flex-end', animation: 'chatMsgIn 0.25s ease both' }}>
              <div style={{
                width: 28, height: 28, borderRadius: 8, flexShrink: 0,
                background: 'linear-gradient(135deg, #7c3aed, #a78bfa)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Bot size={14} color="#fff" />
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
              position: 'absolute', bottom: 96, right: 16,
              width: 28, height: 28, borderRadius: '50%',
              background: 'rgba(124,58,237,0.9)',
              border: 'none', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 2px 8px rgba(0,0,0,0.4)',
              transition: 'opacity 0.2s',
            }}
          >
            <ChevronDown size={15} color="#fff" />
          </button>
        )}

        {/* Quick questions */}
        {messages.length <= 2 && !loading && (
          <div style={{
            padding: '4px 16px 8px',
            display: 'flex', flexWrap: 'wrap', gap: 6,
            flexShrink: 0,
          }}>
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
        <div style={{
          padding: '12px 16px', flexShrink: 0,
          borderTop: '1px solid rgba(255,255,255,0.06)',
          background: 'rgba(0,0,0,0.2)',
          display: 'flex', gap: 8, alignItems: 'flex-end',
        }}>
          <textarea
            ref={inputRef}
            id="vidbot-input"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKey}
            placeholder="Ask anything about the video…"
            rows={1}
            disabled={loading}
            style={{
              flex: 1, resize: 'none', overflow: 'hidden',
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(124,58,237,0.3)',
              borderRadius: 12, padding: '9px 14px',
              color: 'rgba(240,240,248,0.9)',
              fontFamily: 'var(--font-body)', fontSize: 13,
              lineHeight: 1.5,
              outline: 'none',
              transition: 'border-color 0.2s, box-shadow 0.2s',
              maxHeight: 200,
            }}
            onFocus={e => { e.target.style.borderColor = '#7c3aed'; e.target.style.boxShadow = '0 0 0 3px rgba(124,58,237,0.15)'; }}
            onBlur={e => { e.target.style.borderColor = 'rgba(124,58,237,0.3)'; e.target.style.boxShadow = 'none'; }}
            onInput={e => { e.target.style.height = 'auto'; e.target.style.height = e.target.scrollHeight + 'px'; }}
          />
          <button
            id="vidbot-send"
            onClick={() => sendMessage()}
            disabled={!input.trim() || loading}
            style={{
              width: 38, height: 38, borderRadius: 10, flexShrink: 0,
              background: input.trim() && !loading
                ? 'linear-gradient(135deg, #7c3aed, #a78bfa)'
                : 'rgba(255,255,255,0.08)',
              border: 'none', cursor: input.trim() && !loading ? 'pointer' : 'not-allowed',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'all 0.2s',
              transform: input.trim() && !loading ? 'scale(1)' : 'scale(0.95)',
            }}
          >
            <Send size={16} color={input.trim() && !loading ? '#fff' : 'rgba(255,255,255,0.3)'} />
          </button>
        </div>
      </div>

      {/* Inline keyframes via style tag */}
      <style>{`
        @keyframes vidbotPulse {
          0% { transform: scale(1); opacity: 0.8; }
          100% { transform: scale(1.6); opacity: 0; }
        }
        @keyframes chatDot {
          0%, 80%, 100% { transform: scale(0.7); opacity: 0.4; }
          40% { transform: scale(1); opacity: 1; }
        }
        @keyframes chatMsgIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes vidbotDotBlink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
      `}</style>
    </>
  );
}
