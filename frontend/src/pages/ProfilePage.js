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

  const initials = user?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'U';

  return (
    <main className="main-content">
      <div className="container" style={{ maxWidth:700 }}>
        <h1 style={{
          fontFamily:'var(--font-display)', fontWeight:800,
          fontSize:'clamp(22px,3.5vw,36px)',
          marginBottom:'clamp(20px,3vw,32px)',
        }}>
          Profile Settings
        </h1>

        {/* Avatar + info — uses .profile-avatar-card */}
        <div className="card" style={{ marginBottom:24 }}>
          <div className="profile-avatar-card">
            <div style={{
              width:'clamp(56px,8vw,72px)', height:'clamp(56px,8vw,72px)',
              borderRadius:'50%',
              background:'linear-gradient(135deg,var(--amber),#d97706)',
              display:'flex', alignItems:'center', justifyContent:'center',
              fontFamily:'var(--font-display)', fontWeight:800,
              fontSize:'clamp(20px,3vw,26px)', color:'#0a0a12',
              flexShrink:0,
            }}>
              {initials}
            </div>

            <div className="profile-avatar-info">
              <div style={{ fontFamily:'var(--font-display)', fontWeight:800, fontSize:'clamp(16px,2.5vw,22px)', marginBottom:4 }}>
                {user?.name}
              </div>
              <div style={{ color:'var(--text-muted)', fontSize:14, display:'flex', alignItems:'center', gap:6 }}>
                <Mail size={13}/> {user?.email}
              </div>
            </div>

            <div className="profile-avatar-meta">
              <span className="badge badge-amber">
                <Zap size={11}/> {user?.totalVideosAnalyzed || 0} Videos
              </span>
              <span style={{ fontSize:12, color:'var(--text-muted)', display:'flex', alignItems:'center', gap:4, whiteSpace:'nowrap' }}>
                <Calendar size={11}/> Joined {new Date(user?.createdAt).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>

        {/* Update name */}
        <div className="card" style={{ marginBottom:20 }}>
          <h2 style={{
            fontFamily:'var(--font-display)', fontWeight:700, fontSize:18,
            marginBottom:20, display:'flex', alignItems:'center', gap:8,
          }}>
            <User size={17} color="var(--amber)"/> Update Profile
          </h2>
          <form onSubmit={handleProfileSave} style={{ display:'flex', flexDirection:'column', gap:16 }}>
            <div className="input-group">
              <label className="input-label" htmlFor="profile-name">Full Name</label>
              <input
                id="profile-name"
                type="text"
                className="input"
                value={profileForm.name}
                onChange={e => setProfileForm(f => ({...f, name:e.target.value}))}
                placeholder="Your full name"
                autoComplete="name"
              />
            </div>
            <div className="input-group">
              <label className="input-label" htmlFor="profile-email">Email</label>
              <input
                id="profile-email"
                type="email"
                className="input"
                value={user?.email}
                disabled
                style={{ opacity:0.5, cursor:'not-allowed' }}
              />
              <span style={{ fontSize:11, color:'var(--text-muted)' }}>Email cannot be changed</span>
            </div>
            <div style={{ display:'flex', justifyContent:'flex-end' }}>
              <button type="submit" className="btn btn-primary" disabled={savingProfile} style={{ gap:7 }}>
                {savingProfile
                  ? <><div className="spinner" style={{ width:16, height:16 }}/> Saving...</>
                  : <><Save size={15}/> Save Profile</>
                }
              </button>
            </div>
          </form>
        </div>

        {/* Change password */}
        <div className="card" style={{ marginBottom:20 }}>
          <h2 style={{
            fontFamily:'var(--font-display)', fontWeight:700, fontSize:18,
            marginBottom:20, display:'flex', alignItems:'center', gap:8,
          }}>
            <Lock size={17} color="var(--amber)"/> Change Password
          </h2>
          <form onSubmit={handlePassChange} style={{ display:'flex', flexDirection:'column', gap:16 }}>
            {[
              { key:'currentPassword', label:'Current Password', id:'pass-current', placeholder:'Enter current password', ac:'current-password' },
              { key:'newPassword',     label:'New Password',     id:'pass-new',     placeholder:'At least 6 characters',  ac:'new-password' },
              { key:'confirmPassword', label:'Confirm Password', id:'pass-confirm',  placeholder:'Repeat new password',    ac:'new-password' },
            ].map(({ key, label, id, placeholder, ac }) => (
              <div key={key} className="input-group">
                <label className="input-label" htmlFor={id}>{label}</label>
                <input
                  id={id}
                  type="password"
                  className={`input ${passErrors[key] ? 'input-error' : ''}`}
                  placeholder={placeholder}
                  value={passForm[key]}
                  autoComplete={ac}
                  onChange={e => { setPassForm(f => ({...f, [key]:e.target.value})); setPassErrors(er => ({...er, [key]:''})); }}
                />
                {passErrors[key] && <span className="error-msg">{passErrors[key]}</span>}
              </div>
            ))}
            <div style={{ display:'flex', justifyContent:'flex-end' }}>
              <button type="submit" className="btn btn-primary" disabled={savingPass} style={{ gap:7 }}>
                {savingPass
                  ? <><div className="spinner" style={{ width:16, height:16 }}/> Updating...</>
                  : <><Shield size={15}/> Change Password</>
                }
              </button>
            </div>
          </form>
        </div>

        {/* Danger zone */}
        <div className="card" style={{ borderColor:'rgba(244,63,94,0.2)', background:'rgba(244,63,94,0.03)' }}>
          <h2 style={{
            fontFamily:'var(--font-display)', fontWeight:700, fontSize:18,
            marginBottom:8, color:'var(--rose)',
          }}>
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
