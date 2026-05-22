import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import { LayoutDashboard, Youtube, History, LogOut, Menu, X, Zap, User } from 'lucide-react';

const navLinks = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/analyze',   label: 'Analyze',   icon: Youtube },
  { to: '/history',   label: 'History',   icon: History },
];

export default function Navbar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  // Close drawer on route change
  useEffect(() => { setOpen(false); }, [location.pathname]);

  // Close drawer on Escape key
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') setOpen(false); };
    if (open) document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  const handleLogout = async () => {
    setOpen(false);
    await logout();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  const initials = user?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'U';

  return (
    <>
      <nav style={{
        background: 'rgba(10,10,18,0.88)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: '1px solid var(--border-subtle)',
        position: 'sticky',
        top: 0,
        zIndex: 100,
      }}>
        <div className="container" style={{ display:'flex', alignItems:'center', justifyContent:'space-between', height: 'clamp(56px, 8vw, 64px)' }}>

          {/* Logo */}
          <Link to="/dashboard" style={{ display:'flex', alignItems:'center', gap:10, textDecoration:'none', flexShrink:0 }}>
            <div style={{
              width:32, height:32,
              background:'linear-gradient(135deg,var(--amber),#d97706)',
              borderRadius:8,
              display:'flex', alignItems:'center', justifyContent:'center',
              flexShrink: 0,
            }}>
              <Zap size={18} color="#0a0a12" fill="#0a0a12" />
            </div>
            <span style={{
              fontFamily:'var(--font-display)', fontWeight:800,
              fontSize: 'clamp(17px, 2.5vw, 20px)',
              color:'var(--text-primary)', letterSpacing:'-0.02em',
            }}>
              Vid<span style={{ color:'var(--amber)' }}>Brain</span>
            </span>
          </Link>

          {/* Desktop navigation links */}
          <div className="nav-desktop-links">
            {navLinks.map(({ to, label, icon: Icon }) => {
              const active = location.pathname === to;
              return (
                <Link key={to} to={to} style={{
                  display:'flex', alignItems:'center', gap:7,
                  padding:'8px 14px',
                  borderRadius:'var(--radius-md)',
                  fontSize:14, fontWeight: active ? 600 : 500,
                  fontFamily:'var(--font-display)',
                  color: active ? 'var(--amber)' : 'var(--text-secondary)',
                  background: active ? 'var(--amber-glow)' : 'transparent',
                  border: `1px solid ${active ? 'var(--amber-border)' : 'transparent'}`,
                  textDecoration:'none',
                  transition:'all var(--transition-fast)',
                  minHeight: 40,
                }}>
                  <Icon size={16} />
                  {label}
                </Link>
              );
            })}
          </div>

          {/* Right: User + hamburger */}
          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
            {/* Profile pill — always visible */}
            <Link to="/profile" style={{
              display:'flex', alignItems:'center', gap:8,
              padding:'5px 12px 5px 5px',
              borderRadius:'var(--radius-full)',
              background:'var(--bg-elevated)',
              border:'1px solid var(--border-default)',
              textDecoration:'none',
              transition:'all var(--transition-fast)',
              flexShrink: 0,
            }}>
              <div style={{
                width:28, height:28, borderRadius:'50%',
                background:'linear-gradient(135deg,var(--amber),#d97706)',
                display:'flex', alignItems:'center', justifyContent:'center',
                fontSize:11, fontWeight:700, color:'#0a0a12',
                fontFamily:'var(--font-display)', flexShrink:0,
              }}>{initials}</div>
              <span className="nav-user-label" style={{ fontSize:13, color:'var(--text-secondary)', fontWeight:500 }}>
                {user?.name?.split(' ')[0]}
              </span>
            </Link>

            {/* Logout — desktop only */}
            <button
              onClick={handleLogout}
              className="btn btn-ghost btn-sm nav-desktop-links"
              style={{ gap:6, padding:'8px 12px' }}
              aria-label="Logout"
            >
              <LogOut size={15} />
              <span>Logout</span>
            </button>

            {/* Hamburger — mobile only */}
            <button
              onClick={() => setOpen(!open)}
              className="nav-hamburger btn btn-ghost btn-sm"
              style={{ padding:'10px', borderRadius:'var(--radius-md)' }}
              aria-label={open ? 'Close menu' : 'Open menu'}
              aria-expanded={open}
            >
              {open ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile drawer */}
        {open && (
          <div className="nav-mobile-drawer">
            {navLinks.map(({ to, label, icon: Icon }) => (
              <Link
                key={to}
                to={to}
                onClick={() => setOpen(false)}
                className={`nav-mobile-link${location.pathname === to ? ' active' : ''}`}
              >
                <Icon size={18} />
                {label}
              </Link>
            ))}

            {/* Mobile logout row */}
            <button
              onClick={handleLogout}
              style={{
                display:'flex', alignItems:'center', gap:12,
                padding:'13px 4px', width:'100%',
                background:'none', border:'none',
                color:'var(--rose)',
                fontFamily:'var(--font-display)', fontWeight:600, fontSize:15,
                cursor:'pointer', marginTop:4,
                minHeight:50,
              }}
            >
              <LogOut size={18} />
              Sign Out
            </button>
          </div>
        )}
      </nav>

      {/* Backdrop */}
      {open && (
        <div
          className="nav-backdrop"
          onClick={() => setOpen(false)}
          aria-hidden="true"
        />
      )}
    </>
  );
}
