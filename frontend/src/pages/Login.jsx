import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuthStore } from '../context/authStore';
import { Btn, Input } from '../components/UI';

export default function Login() {
  const navigate = useNavigate();
  const { login, register, sendOTP, verifyOTP, loading } = useAuthStore();
  const [tab,    setTab]    = useState('login');   // login | signup
  const [method, setMethod] = useState('email');   // email | phone
  const [step,   setStep]   = useState(1);         // 1=form, 2=otp
  const [devOtp, setDevOtp] = useState('');

  const [form, setForm] = useState({ name:'', email:'', phone:'', password:'', otp:'', role:'donor' });
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) return toast.error('All fields required');
    const res = await login(form.email, form.password);
    if (res.success) { toast.success('Welcome back!'); navigate('/app/dashboard'); }
    else toast.error(res.message);
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password) return toast.error('All fields required');
    if (form.password.length < 6) return toast.error('Password must be 6+ characters');
    const res = await register(form.name, form.email, form.password, form.role);
    if (res.success) { toast.success('Account created!'); navigate('/app/dashboard'); }
    else toast.error(res.message);
  };

  const handleSendOTP = async (e) => {
    e.preventDefault();
    if (!form.phone || form.phone.length < 10) return toast.error('Enter valid phone number');
    const res = await sendOTP(form.phone);
    if (res.success) {
      setStep(2);
      if (res.devOtp) { setDevOtp(res.devOtp); toast.success(`Dev OTP: ${res.devOtp}`, { duration:10000 }); }
      else toast.success('OTP sent!');
    } else toast.error(res.message);
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    if (!form.otp || form.otp.length !== 6) return toast.error('Enter 6-digit OTP');
    const res = await verifyOTP(form.phone, form.otp);
    if (res.success) { toast.success('Logged in!'); navigate('/app/dashboard'); }
    else toast.error(res.message);
  };

  return (
    <div style={{ minHeight:'100vh', background:'var(--bg)', display:'flex', flexDirection:'column' }}>
      {/* Header */}
      <div style={{ background:'white', borderBottom:'1px solid var(--border)', padding:'14px 40px' }}>
        <Link to="/" style={{ display:'inline-flex', alignItems:'center', gap:8, fontSize:16, fontWeight:800, textDecoration:'none', color:'var(--text)' }}>
          <div style={{ width:28, height:28, background:'var(--green-light)', borderRadius:8, display:'flex', alignItems:'center', justifyContent:'center' }}>🌱</div>
          DonateEase
        </Link>
      </div>

      {/* Body */}
      <div style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'40px 20px' }}>
        <div style={{ width:52, height:52, background:'var(--green-light)', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', marginBottom:20, fontSize:22 }}>🌿</div>

        <div style={{ background:'white', border:'1px solid var(--border)', borderRadius:20, padding:36, width:'100%', maxWidth:460, boxShadow:'var(--shadow)' }} className="animate-fadeUp">
          <h2 style={{ fontSize:22, fontWeight:800, textAlign:'center', marginBottom:6 }}>Welcome Back</h2>
          <p style={{ fontSize:14, color:'var(--text-2)', textAlign:'center', marginBottom:24, lineHeight:1.5 }}>Access your NGO dashboard or donor profile to manage contributions.</p>

          {/* Login / Signup tabs */}
          <div style={{ display:'flex', background:'var(--bg)', borderRadius:50, padding:4, marginBottom:24 }}>
            {['login','signup'].map(t => (
              <button key={t} onClick={() => setTab(t)} style={{ flex:1, padding:9, borderRadius:50, background: tab===t ? 'white' : 'transparent', color: tab===t ? 'var(--green)' : 'var(--text-2)', fontSize:14, fontWeight:600, cursor:'pointer', border:'none', transition:'all 0.2s', boxShadow: tab===t ? 'var(--shadow-sm)' : 'none', fontFamily:'var(--font)', textTransform:'capitalize' }}>
                {t}
              </button>
            ))}
          </div>

          {tab === 'login' && (
            <>
              {/* Phone / Email toggle */}
              <div style={{ display:'flex', gap:8, marginBottom:20 }}>
                {['email','phone'].map(m => (
                  <button key={m} onClick={() => { setMethod(m); setStep(1); }} style={{ flex:1, padding:'9px', borderRadius:8, background: method===m ? 'var(--text)' : 'white', color: method===m ? 'white' : 'var(--text-2)', fontSize:13, fontWeight:600, cursor:'pointer', border:'1.5px solid', borderColor: method===m ? 'var(--text)' : 'var(--border)', transition:'all 0.2s', fontFamily:'var(--font)' }}>
                    {m === 'email' ? '✉️ Email' : '📞 Phone'}
                  </button>
                ))}
              </div>

              {method === 'email' ? (
                <form onSubmit={handleEmailLogin}>
                  <Input label="Email Address" type="email" placeholder="name@example.com" value={form.email} onChange={e=>set('email',e.target.value)} required />
                  <div style={{ position:'relative' }}>
                    <Input label="Password" type="password" placeholder="••••••••" value={form.password} onChange={e=>set('password',e.target.value)} required />
                    <Link to="#" style={{ position:'absolute', top:0, right:0, fontSize:12, color:'var(--green)', fontWeight:600 }}>Forgot password?</Link>
                  </div>
                  <label style={{ display:'flex', alignItems:'center', gap:8, fontSize:13, color:'var(--text-2)', cursor:'pointer', marginBottom:16 }}>
                    <input type="checkbox" style={{ accentColor:'var(--green)' }} /> Remember me for 30 days
                  </label>
                  <Btn type="submit" size="full" loading={loading}>Login to Dashboard</Btn>
                  <div style={{ display:'flex', alignItems:'center', gap:12, margin:'16px 0' }}>
                    <div style={{ flex:1, height:1, background:'var(--border)' }}/><span style={{ fontSize:12, color:'var(--text-3)', fontWeight:600 }}>OR CONTINUE WITH</span><div style={{ flex:1, height:1, background:'var(--border)' }}/>
                  </div>
                  <button type="button" style={{ width:'100%', padding:11, background:'white', border:'1.5px solid var(--border)', borderRadius:50, fontFamily:'var(--font)', fontSize:14, fontWeight:600, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:8 }}>
                    <svg width="16" height="16" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
                    Google
                  </button>
                </form>
              ) : step === 1 ? (
                <form onSubmit={handleSendOTP}>
                  <div style={{ marginBottom:16 }}>
                    <label style={{ display:'block', fontSize:12, fontWeight:600, color:'var(--text-2)', marginBottom:6 }}>Phone Number</label>
                    <div style={{ display:'flex', gap:8 }}>
                      <div style={{ display:'flex', alignItems:'center', gap:6, background:'white', border:'1.5px solid var(--border)', borderRadius:'var(--radius-sm)', padding:'11px 12px', fontSize:14, fontWeight:600, flexShrink:0 }}>🇮🇳 +91</div>
                      <input type="tel" placeholder="Enter phone number" value={form.phone} onChange={e=>set('phone',e.target.value)} style={{ flex:1, padding:'11px 14px', border:'1.5px solid var(--border)', borderRadius:'var(--radius-sm)', fontFamily:'var(--font)', fontSize:14, outline:'none' }} />
                    </div>
                  </div>
                  <Btn type="submit" size="full" loading={loading}>Get OTP →</Btn>
                </form>
              ) : (
                <form onSubmit={handleVerifyOTP}>
                  <div style={{ background:'var(--green-light)', borderRadius:'var(--radius-sm)', padding:12, marginBottom:16, fontSize:13, color:'var(--text-2)' }}>
                    OTP sent to +91{form.phone}. {devOtp && `(Dev: ${devOtp})`}
                  </div>
                  <Input label="Enter OTP" type="number" placeholder="6-digit OTP" maxLength={6} value={form.otp} onChange={e=>set('otp',e.target.value)} style={{ fontSize:24, textAlign:'center', letterSpacing:'0.3em' }} />
                  <Btn type="submit" size="full" loading={loading}>Verify OTP →</Btn>
                  <div style={{ textAlign:'center', marginTop:12 }}>
                    <button type="button" onClick={() => setStep(1)} style={{ fontSize:13, color:'var(--green)', fontWeight:600, cursor:'pointer', background:'none', border:'none', fontFamily:'var(--font)' }}>← Change number</button>
                  </div>
                </form>
              )}
            </>
          )}

          {tab === 'signup' && (
            <form onSubmit={handleRegister}>
              <Input label="Full Name" placeholder="Your full name" value={form.name} onChange={e=>set('name',e.target.value)} required />
              <Input label="Email Address" type="email" placeholder="name@example.com" value={form.email} onChange={e=>set('email',e.target.value)} required />
              <Input label="Password" type="password" placeholder="Min 6 characters" value={form.password} onChange={e=>set('password',e.target.value)} required />
              <div style={{ marginBottom:16 }}>
                <label style={{ display:'block', fontSize:12, fontWeight:600, color:'var(--text-2)', marginBottom:6 }}>Account Type</label>
                <select value={form.role} onChange={e=>set('role',e.target.value)} style={{ width:'100%', padding:'11px 14px', border:'1.5px solid var(--border)', borderRadius:'var(--radius-sm)', fontFamily:'var(--font)', fontSize:14, outline:'none', background:'white', cursor:'pointer' }}>
                  <option value="donor">Donor</option>
                  <option value="volunteer">Volunteer</option>
                  <option value="ngo_staff">NGO Staff</option>
                </select>
              </div>
              <Btn type="submit" size="full" loading={loading}>Create Account →</Btn>
            </form>
          )}

          <p style={{ fontSize:12, color:'var(--text-3)', textAlign:'center', marginTop:20, lineHeight:1.6 }}>
            By continuing, you agree to DonateEase's <a href="#" style={{ color:'var(--green)' }}>Terms of Service</a> and <a href="#" style={{ color:'var(--green)' }}>Privacy Policy</a>.
          </p>
        </div>

        <div style={{ display:'flex', gap:24, marginTop:24 }}>
          {['Help Center','System Status','Contact Support'].map(t => (
            <a key={t} href="#" style={{ fontSize:13, color:'var(--text-2)', textDecoration:'none' }}>{t}</a>
          ))}
        </div>
      </div>
    </div>
  );
}
