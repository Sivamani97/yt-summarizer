import React from 'react';
import { Link } from 'react-router-dom';
import { Zap, Brain, BookOpen, HelpCircle, ArrowRight, Youtube, Sparkles } from 'lucide-react';

const features = [
  { icon: Brain, title: 'AI Summary', desc: 'Get concise, accurate summaries in seconds using Claude AI.', color: 'var(--amber)' },
  { icon: BookOpen, title: 'Key Concepts', desc: 'Automatically extracted terms and definitions from the video.', color: 'var(--cyan)' },
  { icon: Zap, title: 'Bullet Points', desc: 'Structured key takeaways so you can scan at a glance.', color: '#a78bfa' },
  { icon: HelpCircle, title: 'MCQ Quiz', desc: 'Auto-generated multiple choice questions to test your understanding.', color: 'var(--emerald)' },
];

export default function LandingPage() {
  return (
    <div style={{ minHeight:'100vh', background:'var(--bg-void)', overflow:'hidden' }}>
      {/* Ambient glow */}
      <div style={{
        position:'fixed', top:'-20%', left:'50%', transform:'translateX(-50%)',
        width:'60vw', height:'60vh',
        background:'radial-gradient(ellipse, rgba(245,158,11,0.08) 0%, transparent 70%)',
        pointerEvents:'none', zIndex:0,
      }} />

      {/* Header */}
      <header style={{
        display:'flex', alignItems:'center', justifyContent:'space-between',
        padding:'20px 48px',
        borderBottom:'1px solid var(--border-subtle)',
        position:'relative', zIndex:1,
      }}>
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          <div style={{
            width:36, height:36,
            background:'linear-gradient(135deg,var(--amber),#d97706)',
            borderRadius:9, display:'flex', alignItems:'center', justifyContent:'center',
          }}>
            <Zap size={20} color="#0a0a12" fill="#0a0a12" />
          </div>
          <span style={{ fontFamily:'var(--font-display)', fontWeight:800, fontSize:22, letterSpacing:'-0.02em' }}>
            Vid<span style={{ color:'var(--amber)' }}>Brain</span>
          </span>
        </div>
        <div style={{ display:'flex', gap:12 }}>
          <Link to="/login" className="btn btn-secondary">Sign In</Link>
          <Link to="/register" className="btn btn-primary">Get Started</Link>
        </div>
      </header>

      {/* Hero */}
      <section style={{ textAlign:'center', padding:'100px 24px 80px', position:'relative', zIndex:1 }}>
        <div style={{ marginBottom:20 }}>
          <span className="badge badge-amber" style={{ fontSize:12, padding:'5px 14px' }}>
            <Sparkles size={11} /> Powered by CodeAscend
          </span>
        </div>
        <h1 style={{
          fontFamily:'var(--font-display)', fontWeight:800,
          fontSize:'clamp(42px,7vw,82px)',
          lineHeight:1.05, letterSpacing:'-0.03em',
          maxWidth:800, margin:'0 auto 24px',
        }}>
          Turn Any YouTube<br />
          <span style={{ color:'var(--amber)' }}>Video Into Intelligence</span>
        </h1>
        <p style={{
          fontSize:'clamp(16px,2vw,19px)', color:'var(--text-secondary)',
          maxWidth:560, margin:'0 auto 44px', lineHeight:1.7,
        }}>
          Paste a YouTube URL and get AI-powered summaries, key concepts, bullet points, and quiz questions — instantly.
        </p>
        <div style={{ display:'flex', gap:14, justifyContent:'center', flexWrap:'wrap' }}>
          <Link to="/register" className="btn btn-primary btn-lg" style={{ gap:10 }}>
            Start Analyzing Free <ArrowRight size={18} />
          </Link>
          <Link to="/login" className="btn btn-secondary btn-lg">
            <Youtube size={18} /> Sign In
          </Link>
        </div>
      </section>

      {/* URL preview */}
      <section style={{ maxWidth:640, margin:'0 auto 80px', padding:'0 24px', position:'relative', zIndex:1 }}>
        <div style={{
          background:'var(--bg-surface)',
          border:'1px solid var(--border-default)',
          borderRadius:'var(--radius-xl)',
          padding:24,
          boxShadow:'var(--shadow-lg)',
        }}>
          <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:16 }}>
            <div style={{
              flex:1, background:'var(--bg-elevated)', borderRadius:'var(--radius-md)',
              padding:'12px 16px', display:'flex', alignItems:'center', gap:10,
              border:'1px solid var(--border-default)',
            }}>
              <Youtube size={16} color="var(--rose)" />
              <span style={{ fontSize:13, color:'var(--text-muted)', fontFamily:'var(--font-mono)' }}>
                https://youtube.com/watch?v=...
              </span>
            </div>
            <div className="btn btn-primary" style={{ cursor:'default', flexShrink:0 }}>
              <Zap size={15} /> Analyze
            </div>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
            {['Summary', 'Bullet Points', 'Key Concepts', 'MCQ Quiz'].map(label => (
              <div key={label} style={{
                background:'var(--bg-elevated)', borderRadius:'var(--radius-md)',
                padding:'10px 14px', display:'flex', alignItems:'center', gap:8,
              }}>
                <div style={{ width:8, height:8, borderRadius:'50%', background:'var(--amber)', flexShrink:0 }} />
                <span style={{ fontSize:13, color:'var(--text-secondary)', fontFamily:'var(--font-display)', fontWeight:600 }}>{label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section style={{ maxWidth:960, margin:'0 auto 100px', padding:'0 24px', position:'relative', zIndex:1 }}>
        <h2 style={{ textAlign:'center', fontFamily:'var(--font-display)', fontWeight:800, fontSize:36, marginBottom:12 }}>
          Everything you need
        </h2>
        <p style={{ textAlign:'center', color:'var(--text-secondary)', marginBottom:48, fontSize:17 }}>
          From raw transcript to structured knowledge in seconds
        </p>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(210px,1fr))', gap:20 }}>
          {features.map(({ icon: Icon, title, desc, color }) => (
            <div key={title} className="card" style={{ textAlign:'left' }}>
              <div style={{
                width:44, height:44, borderRadius:'var(--radius-md)',
                background:`${color}1a`, border:`1px solid ${color}40`,
                display:'flex', alignItems:'center', justifyContent:'center', marginBottom:16,
              }}>
                <Icon size={22} color={color} />
              </div>
              <h3 style={{ fontFamily:'var(--font-display)', fontSize:17, fontWeight:700, marginBottom:8 }}>{title}</h3>
              <p style={{ fontSize:14, color:'var(--text-secondary)', lineHeight:1.65 }}>{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section style={{
        textAlign:'center', padding:'80px 24px',
        background:'var(--bg-surface)',
        borderTop:'1px solid var(--border-subtle)',
        position:'relative', zIndex:1,
      }}>
        <h2 style={{ fontFamily:'var(--font-display)', fontWeight:800, fontSize:36, marginBottom:16 }}>
          Ready to learn smarter?
        </h2>
        <p style={{ color:'var(--text-secondary)', marginBottom:32, fontSize:17 }}>
          Join thousands of learners using VidBrain every day.
        </p>
        <Link to="/register" className="btn btn-primary btn-lg">
          Create Free Account <ArrowRight size={18} />
        </Link>
      </section>

      <footer style={{
        textAlign:'center', padding:'24px',
        color:'var(--text-muted)', fontSize:13,
        borderTop:'1px solid var(--border-subtle)',
      }}>
        © 2025 VidBrain — AI YouTube Intelligence
      </footer>
    </div>
  );
}
