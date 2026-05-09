import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { Zap, Mail, Lock, User, Eye, EyeOff, ArrowRight, CheckCircle } from 'lucide-react';

const checks = [
  { id:'len', label:'At least 6 characters', test: p => p.length >= 6 },
  { id:'upper', label:'One uppercase letter', test: p => /[A-Z]/.test(p) },
  { id:'num', label:'One number', test: p => /\d/.test(p) },
];

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name:'', email:'', password:'' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const validate = () => {
    const e = {};
    if (!form.name || form.name.trim().length < 2) e.name = 'Name must be at least 2 characters';
    if (!form.email || !/\S+@\S+\.\S+/.test(form.email)) e.email = 'Valid email required';
    if (!form.password || form.password.length < 6) e.password = 'Password must be at least 6 characters';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await register(form.name, form.email, form.password);
      toast.success('Account created! Welcome to VidBrain 🎉');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center',
      background:'var(--bg-void)', padding:24, position:'relative',
    }}>
      <div style={{
        position:'fixed', top:'30%', left:'50%', transform:'translate(-50%,-50%)',
        width:'50vw', height:'40vh',
        background:'radial-gradient(ellipse,rgba(245,158,11,0.06) 0%,transparent 70%)',
        pointerEvents:'none',
      }} />

      <div style={{ width:'100%', maxWidth:420, position:'relative', zIndex:1 }}>
        <div style={{ textAlign:'center', marginBottom:36 }}>
          <Link to="/" style={{ display:'inline-flex', alignItems:'center', gap:10, textDecoration:'none' }}>
            <div style={{
              width:40, height:40, borderRadius:10,
              background:'linear-gradient(135deg,var(--amber),#d97706)',
              display:'flex', alignItems:'center', justifyContent:'center',
            }}>
              <Zap size={22} color="#0a0a12" fill="#0a0a12" />
            </div>
            <span style={{ fontFamily:'var(--font-display)', fontWeight:800, fontSize:24, letterSpacing:'-0.02em' }}>
              Vid<span style={{ color:'var(--amber)' }}>Brain</span>
            </span>
          </Link>
        </div>

        <div className="card" style={{ padding:36 }}>
          <h1 style={{ fontFamily:'var(--font-display)', fontWeight:800, fontSize:26, marginBottom:6 }}>Create account</h1>
          <p style={{ color:'var(--text-secondary)', fontSize:14, marginBottom:28 }}>Start analyzing YouTube videos with AI</p>

          <form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap:18 }}>
            <div className="input-group">
              <label className="input-label">Full Name</label>
              <div style={{ position:'relative' }}>
                <User size={15} style={{ position:'absolute', left:14, top:'50%', transform:'translateY(-50%)', color:'var(--text-muted)' }} />
                <input type="text" className={`input ${errors.name?'input-error':''}`} style={{ paddingLeft:40 }}
                  placeholder="Your name" value={form.name}
                  onChange={e=>{ setForm(f=>({...f,name:e.target.value})); setErrors(er=>({...er,name:''})); }} />
              </div>
              {errors.name && <span className="error-msg">{errors.name}</span>}
            </div>

            <div className="input-group">
              <label className="input-label">Email</label>
              <div style={{ position:'relative' }}>
                <Mail size={15} style={{ position:'absolute', left:14, top:'50%', transform:'translateY(-50%)', color:'var(--text-muted)' }} />
                <input type="email" className={`input ${errors.email?'input-error':''}`} style={{ paddingLeft:40 }}
                  placeholder="you@example.com" value={form.email}
                  onChange={e=>{ setForm(f=>({...f,email:e.target.value})); setErrors(er=>({...er,email:''})); }} />
              </div>
              {errors.email && <span className="error-msg">{errors.email}</span>}
            </div>

            <div className="input-group">
              <label className="input-label">Password</label>
              <div style={{ position:'relative' }}>
                <Lock size={15} style={{ position:'absolute', left:14, top:'50%', transform:'translateY(-50%)', color:'var(--text-muted)' }} />
                <input type={showPass?'text':'password'} className={`input ${errors.password?'input-error':''}`} style={{ paddingLeft:40, paddingRight:44 }}
                  placeholder="••••••••" value={form.password}
                  onChange={e=>{ setForm(f=>({...f,password:e.target.value})); setErrors(er=>({...er,password:''})); }} />
                <button type="button" onClick={()=>setShowPass(!showPass)} style={{
                  position:'absolute', right:14, top:'50%', transform:'translateY(-50%)',
                  background:'none', border:'none', cursor:'pointer', color:'var(--text-muted)', padding:0,
                }}>
                  {showPass ? <EyeOff size={15}/> : <Eye size={15}/>}
                </button>
              </div>
              {errors.password && <span className="error-msg">{errors.password}</span>}
              {/* Password strength */}
              {form.password && (
                <div style={{ display:'flex', flexDirection:'column', gap:4, marginTop:8 }}>
                  {checks.map(c => (
                    <div key={c.id} style={{ display:'flex', alignItems:'center', gap:6, fontSize:12 }}>
                      <CheckCircle size={12} color={c.test(form.password)?'var(--emerald)':'var(--text-muted)'} />
                      <span style={{ color:c.test(form.password)?'var(--emerald)':'var(--text-muted)' }}>{c.label}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <button type="submit" className="btn btn-primary btn-lg" disabled={loading} style={{ marginTop:6 }}>
              {loading ? <><div className="spinner" style={{width:18,height:18}}/> Creating account...</> : <>Create Account <ArrowRight size={17}/></>}
            </button>
          </form>
        </div>

        <p style={{ textAlign:'center', color:'var(--text-muted)', fontSize:14, marginTop:20 }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color:'var(--amber)', fontWeight:600 }}>Sign in</Link>
        </p>
      </div>
    </div>
  );
}
