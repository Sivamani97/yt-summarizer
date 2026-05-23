import React from 'react';
import { Link } from 'react-router-dom';
import { Zap, Brain, BookOpen, HelpCircle, ArrowRight, Youtube, Sparkles } from 'lucide-react';

const features = [
  { icon: Brain,      title: 'AI Summary',    desc: 'Get concise, accurate summaries in seconds using Claude AI.',                color: 'var(--amber)'   },
  { icon: BookOpen,   title: 'Key Concepts',  desc: 'Automatically extracted terms and definitions from the video.',              color: 'var(--cyan)'    },
  { icon: Zap,        title: 'Bullet Points', desc: 'Structured key takeaways so you can scan at a glance.',                     color: '#a78bfa'        },
  { icon: HelpCircle, title: 'MCQ Quiz',      desc: 'Auto-generated multiple choice questions to test your understanding.',       color: 'var(--emerald)' },
];

export default function LandingPage() {
  return (
    <div style={{ minHeight: '100dvh', background: 'var(--bg-void)', overflowX: 'hidden' }}>

      {/* ── Ambient glow ── */}
      <div style={{
        position: 'fixed', top: '-20%', left: '50%', transform: 'translateX(-50%)',
        width: 'clamp(280px,60vw,800px)', height: '60vh',
        background: 'radial-gradient(ellipse, rgba(245,158,11,0.07) 0%, transparent 70%)',
        pointerEvents: 'none', zIndex: 0,
      }} />

      {/* ── Header ── */}
      <header className="landing-header">
        <div className="landing-header-logo">
          <div style={{
            width: 'clamp(30px,4vw,38px)', height: 'clamp(30px,4vw,38px)',
            background: 'linear-gradient(135deg,var(--amber),#d97706)',
            borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
          }}>
            <Zap size={18} color="#0a0a12" fill="#0a0a12" />
          </div>
          <span style={{
            fontFamily: 'var(--font-display)', fontWeight: 800,
            fontSize: 'clamp(17px,2.5vw,22px)', letterSpacing: '-0.02em',
          }}>
            Vid<span style={{ color: 'var(--amber)' }}>Brain</span>
          </span>
        </div>

        <div className="landing-header-actions">
          <Link to="/login" className="btn btn-secondary btn-sm landing-sign-in-btn">
            Sign In
          </Link>
          <Link to="/register" className="btn btn-primary btn-sm">
            Get Started
          </Link>
        </div>
      </header>

      {/* ── Hero ── */}
      <section className="hero-section">
        <div style={{ marginBottom: 18 }}>
          <span className="badge badge-amber" style={{ fontSize: 12, padding: '5px 14px' }}>
            <Sparkles size={11} /> Powered by CodeAscend
          </span>
        </div>

        <h1 className="hero-title">
          Turn Any YouTube<br />
          <span style={{ color: 'var(--amber)' }}>Video Into Intelligence</span>
        </h1>

        <p className="hero-subtitle">
          Paste a YouTube URL and get AI-powered summaries, key concepts,
          bullet points, and quiz questions — instantly.
        </p>

        <div className="hero-actions">
          <Link to="/register" className="btn btn-primary btn-lg" style={{ gap: 10 }}>
            Start Analyzing Free <ArrowRight size={18} />
          </Link>
          <Link to="/login" className="btn btn-secondary btn-lg">
            <Youtube size={18} /> Sign In
          </Link>
        </div>
      </section>

      {/* ── URL Preview Card ── */}
      <section style={{
        maxWidth: 640, margin: '0 auto clamp(48px,7vw,80px)',
        padding: '0 var(--page-px)', position: 'relative', zIndex: 1,
      }}>
        <div style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-default)',
          borderRadius: 'var(--radius-xl)',
          padding: 'clamp(16px,3vw,24px)',
          boxShadow: 'var(--shadow-lg)',
        }}>
          {/* Input row */}
          <div className="url-preview-row">
            <div style={{
              flex: 1, background: 'var(--bg-elevated)',
              borderRadius: 'var(--radius-md)',
              padding: '12px 16px',
              display: 'flex', alignItems: 'center', gap: 10,
              border: '1px solid var(--border-default)',
              minWidth: 0,
            }}>
              <Youtube size={16} color="var(--rose)" style={{ flexShrink: 0 }} />
              <span style={{
                fontSize: 13, color: 'var(--text-muted)',
                fontFamily: 'var(--font-mono)',
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              }}>
                https://youtube.com/watch?v=…
              </span>
            </div>
            <div
              className="btn btn-primary"
              style={{ cursor: 'default', flexShrink: 0, gap: 6, whiteSpace: 'nowrap' }}
            >
              <Zap size={15} /> Analyze
            </div>
          </div>

          {/* Output feature grid — 2 cols at all sizes */}
          <div className="landing-feature-grid">
            {['Summary', 'Bullet Points', 'Key Concepts', 'MCQ Quiz'].map(label => (
              <div key={label} style={{
                background: 'var(--bg-elevated)',
                borderRadius: 'var(--radius-md)',
                padding: 'clamp(8px,1.5vw,12px) clamp(10px,2vw,14px)',
                display: 'flex', alignItems: 'center', gap: 8,
              }}>
                <div style={{
                  width: 8, height: 8, borderRadius: '50%',
                  background: 'var(--amber)', flexShrink: 0,
                }} />
                <span style={{
                  fontSize: 'clamp(12px,1.5vw,13px)',
                  color: 'var(--text-secondary)',
                  fontFamily: 'var(--font-display)', fontWeight: 600,
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                }}>{label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section style={{
        maxWidth: 1000, margin: '0 auto clamp(56px,8vw,100px)',
        padding: '0 var(--page-px)', position: 'relative', zIndex: 1,
      }}>
        <h2 style={{
          textAlign: 'center', fontFamily: 'var(--font-display)', fontWeight: 800,
          fontSize: 'clamp(24px,4vw,36px)', marginBottom: 12,
        }}>
          Everything you need
        </h2>
        <p style={{
          textAlign: 'center', color: 'var(--text-secondary)',
          marginBottom: 'clamp(28px,4vw,48px)',
          fontSize: 'clamp(14px,1.8vw,17px)',
        }}>
          From raw transcript to structured knowledge in seconds
        </p>

        <div className="grid-features">
          {features.map(({ icon: Icon, title, desc, color }) => (
            <div key={title} className="card" style={{ textAlign: 'left' }}>
              <div style={{
                width: 44, height: 44, borderRadius: 'var(--radius-md)',
                background: `${color}1a`, border: `1px solid ${color}40`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                marginBottom: 16, flexShrink: 0,
              }}>
                <Icon size={22} color={color} />
              </div>
              <h3 style={{
                fontFamily: 'var(--font-display)', fontSize: 'clamp(15px,1.8vw,17px)',
                fontWeight: 700, marginBottom: 8,
              }}>{title}</h3>
              <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.65 }}>{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA Banner ── */}
      <section style={{
        textAlign: 'center',
        padding: 'clamp(48px,7vw,80px) var(--page-px)',
        background: 'var(--bg-surface)',
        borderTop: '1px solid var(--border-subtle)',
        position: 'relative', zIndex: 1,
      }}>
        <h2 style={{
          fontFamily: 'var(--font-display)', fontWeight: 800,
          fontSize: 'clamp(22px,4vw,36px)', marginBottom: 14,
        }}>
          Ready to learn smarter?
        </h2>
        <p style={{
          color: 'var(--text-secondary)', marginBottom: 32,
          fontSize: 'clamp(14px,1.8vw,17px)',
          maxWidth: 480, margin: '0 auto 32px',
        }}>
          Join thousands of learners using VidBrain every day.
        </p>
        <Link to="/register" className="btn btn-primary btn-lg">
          Create Free Account <ArrowRight size={18} />
        </Link>
      </section>

      {/* ── Footer ── */}
      <footer style={{
        textAlign: 'center',
        padding: `clamp(14px,2vw,22px) max(var(--page-px), env(safe-area-inset-left))`,
        color: 'var(--text-muted)', fontSize: 13,
        borderTop: '1px solid var(--border-subtle)',
      }}>
        © 2025 VidBrain — AI YouTube Intelligence
      </footer>
    </div>
  );
}
