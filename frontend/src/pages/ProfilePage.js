import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../services/api';
import toast from 'react-hot-toast';
import { User, Mail, Lock, Save, Shield, Zap, Calendar } from 'lucide-react';

export default function ProfilePage() {
  const { user, updateUser, logout } = useAuth();
  const [profileForm, setProfileForm] = useState({ name: user?.name || '' });
  const [passForm, setPassForm] = useState({ currentPassword:'', newPassword:'', confirmPassword:'' });
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPass, setSavingPass] = useState(false);
  const [passErrors, setPassErrors] = useState({});

  const handleProfileSave = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      const { data } = await authAPI.updateProfile({ name: profileForm.name });
      updateUser(data.user);
      toast.success('Profile updated!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile');
    } finally { setSavingProfile(false); }
  };

  const handlePassChange = async (e) => {
    e.preventDefault();
    const errs = {};
    if (!passForm.currentPassword) errs.currentPassword = 'Required';
    if (!passForm.newPassword || passForm.newPassword.length < 6) errs.newPassword = 'Min 6 characters';
    if (passForm.newPassword !== passForm.confirmPassword) errs.confirmPassword = 'Passwords do not match';
    setPassErrors(errs);
    if (Object.keys(errs).length) return;

    setSavingPass(true);
    try {
      await authAPI.changePassword({ currentPassword: passForm.currentPassword, newPassword: passForm.newPassword });
      toast.success('Password changed!');
      setPassForm({ currentPassword:'', newPassword:'', confirmPassword:'' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to change password');
    } finally { setSavingPass(false); }
  };

  const initials = user?.name?.split(' ').map(n=>n[0]).join('').toUpperCase().slice(0,2) || 'U';

  return (
    <main className="main-content">
      <div className="container" style={{ maxWidth:680 }}>
        <h1 style={{ fontFamily:'var(--font-display)', fontWeight:800, fontSize:'clamp(24px,3.5vw,36px)', marginBottom:32 }}>
          Profile Settings
        </h1>

        {/* Avatar + info */}
        <div className="card" style={{ display:'flex', alignItems:'center', gap:24, marginBottom:24, flexWrap:'wrap' }}>
          <div style={{
            width:72, height:72, borderRadius:'50%',
            background:'linear-gradient(135deg,var(--amber),#d97706)',
            display:'flex', alignItems:'center', justifyContent:'center',
            fontFamily:'var(--font-display)', fontWeight:800, fontSize:26, color:'#0a0a12',
            flexShrink:0,
          }}>{initials}</div>
          <div style={{ flex:1 }}>
            <div style={{ fontFamily:'var(--font-display)', fontWeight:800, fontSize:22, marginBottom:4 }}>{user?.name}</div>
            <div style={{ color:'var(--text-muted)', fontSize:14, display:'flex', alignItems:'center', gap:6 }}>
              <Mail size={13}/> {user?.email}
            </div>
          </div>
          <div style={{ display:'flex', flexDirection:'column', gap:8, alignItems:'flex-end' }}>
            <span className="badge badge-amber">
              <Zap size={11}/> {user?.totalVideosAnalyzed || 0} Videos
            </span>
            <span style={{ fontSize:12, color:'var(--text-muted)', display:'flex', alignItems:'center', gap:4 }}>
              <Calendar size={11}/> Joined {new Date(user?.createdAt).toLocaleDateString()}
            </span>
          </div>
        </div>

        {/* Update name */}
        <div className="card" style={{ marginBottom:20 }}>
          <h2 style={{ fontFamily:'var(--font-display)', fontWeight:700, fontSize:18, marginBottom:20, display:'flex', alignItems:'center', gap:8 }}>
            <User size={17} color="var(--amber)"/> Update Profile
          </h2>
          <form onSubmit={handleProfileSave} style={{ display:'flex', flexDirection:'column', gap:16 }}>
            <div className="input-group">
              <label className="input-label">Full Name</label>
              <input type="text" className="input"
                value={profileForm.name}
                onChange={e => setProfileForm(f=>({...f,name:e.target.value}))}
                placeholder="Your full name"
              />
            </div>
            <div className="input-group">
              <label className="input-label">Email</label>
              <input type="email" className="input" value={user?.email} disabled style={{ opacity:0.5, cursor:'not-allowed' }} />
              <span style={{ fontSize:11, color:'var(--text-muted)' }}>Email cannot be changed</span>
            </div>
            <div style={{ display:'flex', justifyContent:'flex-end' }}>
              <button type="submit" className="btn btn-primary" disabled={savingProfile} style={{ gap:7 }}>
                {savingProfile ? <><div className="spinner" style={{width:16,height:16}}/> Saving...</> : <><Save size={15}/> Save Profile</>}
              </button>
            </div>
          </form>
        </div>

        {/* Change password */}
        <div className="card" style={{ marginBottom:20 }}>
          <h2 style={{ fontFamily:'var(--font-display)', fontWeight:700, fontSize:18, marginBottom:20, display:'flex', alignItems:'center', gap:8 }}>
            <Lock size={17} color="var(--amber)"/> Change Password
          </h2>
          <form onSubmit={handlePassChange} style={{ display:'flex', flexDirection:'column', gap:16 }}>
            {[
              { key:'currentPassword', label:'Current Password', placeholder:'Enter current password' },
              { key:'newPassword', label:'New Password', placeholder:'At least 6 characters' },
              { key:'confirmPassword', label:'Confirm New Password', placeholder:'Repeat new password' },
            ].map(({ key, label, placeholder }) => (
              <div key={key} className="input-group">
                <label className="input-label">{label}</label>
                <input type="password" className={`input ${passErrors[key]?'input-error':''}`}
                  placeholder={placeholder} value={passForm[key]}
                  onChange={e => { setPassForm(f=>({...f,[key]:e.target.value})); setPassErrors(er=>({...er,[key]:''})); }}
                />
                {passErrors[key] && <span className="error-msg">{passErrors[key]}</span>}
              </div>
            ))}
            <div style={{ display:'flex', justifyContent:'flex-end' }}>
              <button type="submit" className="btn btn-primary" disabled={savingPass} style={{ gap:7 }}>
                {savingPass ? <><div className="spinner" style={{width:16,height:16}}/> Updating...</> : <><Shield size={15}/> Change Password</>}
              </button>
            </div>
          </form>
        </div>

        {/* Danger zone */}
        <div className="card" style={{ borderColor:'rgba(244,63,94,0.2)', background:'rgba(244,63,94,0.03)' }}>
          <h2 style={{ fontFamily:'var(--font-display)', fontWeight:700, fontSize:18, marginBottom:8, color:'var(--rose)' }}>
            Danger Zone
          </h2>
          <p style={{ fontSize:14, color:'var(--text-secondary)', marginBottom:16 }}>
            Sign out of your account on this device.
          </p>
          <button onClick={logout} className="btn btn-danger" style={{ gap:7 }}>
            Sign Out
          </button>
        </div>
      </div>
    </main>
  );
}
