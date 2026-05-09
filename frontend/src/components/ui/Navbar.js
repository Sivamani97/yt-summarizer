import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import { LayoutDashboard, Youtube, History, LogOut, Menu, X, Zap } from 'lucide-react';

const navLinks = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/analyze', label: 'Analyze', icon: Youtube },
  { to: '/history', label: 'History', icon: History },
];

export default function Navbar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  const initials = user?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'U';

  return (
    <nav style={{
      background: 'rgba(10,10,18,0.85)',
      backdropFilter: 'blur(20px)',
      borderBottom: '1px solid var(--border-subtle)',
      position: 'sticky',
      top: 0,
      zIndex: 100,
    }}>
      <div className="container" style={{ display:'flex', alignItems:'center', justifyContent:'space-between', height:64 }}>
        {/* Logo */}
        <Link to="/dashboard" style={{ display:'flex', alignItems:'center', gap:10, textDecoration:'none' }}>
          <div style={{
            width:32, height:32,
            background: 'linear-gradient(135deg, var(--amber), #d97706)',
            borderRadius:8,
            display:'flex', alignItems:'center', justifyContent:'center',
          }}>
            <Zap size={18} color="#0a0a12" fill="#0a0a12" />
          </div>
          <span style={{ fontFamily:'var(--font-display)', fontWeight:800, fontSize:20, color:'var(--text-primary)', letterSpacing:'-0.02em' }}>
            Vid<span style={{ color:'var(--amber)' }}>Brain</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <div style={{ display:'flex', alignItems:'center', gap:4 }} className="desktop-nav">
          {navLinks.map(({ to, label, icon: Icon }) => {
            const active = location.pathname === to;
            return (
              <Link key={to} to={to} style={{
                display:'flex', alignItems:'center', gap:7,
                padding:'8px 14px',
                borderRadius: 'var(--radius-md)',
                fontSize:14,
                fontWeight: active ? 600 : 500,
                fontFamily: 'var(--font-display)',
                color: active ? 'var(--amber)' : 'var(--text-secondary)',
                background: active ? 'var(--amber-glow)' : 'transparent',
                border: `1px solid ${active ? 'var(--amber-border)' : 'transparent'}`,
                textDecoration:'none',
                transition:'all var(--transition-fast)',
              }}>
                <Icon size={16} />
                {label}
              </Link>
            );
          })}
        </div>

        {/* User area */}
        <div style={{ display:'flex', alignItems:'center', gap:12 }}>
          <Link to="/profile" style={{
            display:'flex', alignItems:'center', gap:10,
            padding:'6px 12px 6px 6px',
            borderRadius: 'var(--radius-full)',
            background: 'var(--bg-elevated)',
            border: '1px solid var(--border-default)',
            textDecoration:'none',
            transition:'all var(--transition-fast)',
          }}>
            <div style={{
              width:28, height:28,
              borderRadius:'50%',
              background:'linear-gradient(135deg,var(--amber),#d97706)',
              display:'flex', alignItems:'center', justifyContent:'center',
              fontSize:11, fontWeight:700, color:'#0a0a12',
              fontFamily:'var(--font-display)',
            }}>{initials}</div>
            <span style={{ fontSize:13, color:'var(--text-secondary)', fontWeight:500 }}>{user?.name?.split(' ')[0]}</span>
          </Link>
          <button onClick={handleLogout} className="btn btn-ghost btn-sm" style={{ gap:6 }}>
            <LogOut size={15} />
            <span className="desktop-nav">Logout</span>
          </button>
          <button onClick={() => setOpen(!open)} className="btn btn-ghost btn-sm mobile-only" style={{ padding:'8px' }}>
            {open ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div style={{
          background:'var(--bg-surface)',
          borderTop:'1px solid var(--border-subtle)',
          padding:'12px 24px 16px',
        }}>
          {navLinks.map(({ to, label, icon: Icon }) => (
            <Link key={to} to={to} onClick={() => setOpen(false)} style={{
              display:'flex', alignItems:'center', gap:10,
              padding:'10px 0',
              color: location.pathname === to ? 'var(--amber)' : 'var(--text-secondary)',
              fontFamily:'var(--font-display)', fontWeight:600, fontSize:15,
              textDecoration:'none', borderBottom:'1px solid var(--border-subtle)',
            }}>
              <Icon size={17} /> {label}
            </Link>
          ))}
        </div>
      )}

      <style>{`
        @media(max-width:640px){ .desktop-nav{ display:none!important; } }
        @media(min-width:641px){ .mobile-only{ display:none!important; } }
      `}</style>
    </nav>
  );
}
