import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { userAPI, reportAPI } from '../api';
import { useAuthStore } from '../context/authStore';
import { Card, CardHeader, CardBody, Badge, SectionHeader, Btn, Input, Select, TextArea, Modal, Avatar } from '../components/UI';

export default function Profile() {
  const { user, updateUser, logout } = useAuthStore();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    address: {
      line1:  user?.address?.line1  || '',
      city:   user?.address?.city   || '',
      state:  user?.address?.state  || '',
      pin:    user?.address?.pin    || '',
    }
  });
  const [saving,       setSaving]       = useState(false);
  const [reportModal,  setReportModal]  = useState(false);
  const [report,       setReport]       = useState({ category:'Pickup Issue', description:'' });
  const [submitting,   setSubmitting]   = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      const { data } = await userAPI.updateProfile(form);
      updateUser(data.data.user);
      toast.success('Profile updated!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    } finally { setSaving(false); }
  };

  const handleReport = async () => {
    if (!report.description.trim()) return toast.error('Please describe the issue');
    setSubmitting(true);
    try {
      await reportAPI.create(report);
      toast.success('Report submitted! We\'ll respond within 24–48 hours.');
      setReportModal(false);
      setReport({ category:'Pickup Issue', description:'' });
    } catch {
      toast.error('Failed to submit report');
    } finally { setSubmitting(false); }
  };

  const stats = user?.stats || {};

  return (
    <div className="animate-fadeUp" style={{ maxWidth:700, margin:'0 auto' }}>
      <SectionHeader title="My Profile" />

      {/* Profile header */}
      <Card style={{ marginBottom:20 }}>
        <CardBody style={{ display:'flex', alignItems:'center', gap:20 }}>
          <Avatar name={user?.name || ''} size={64} />
          <div style={{ flex:1 }}>
            <div style={{ fontSize:20, fontWeight:800 }}>{user?.name}</div>
            <div style={{ fontSize:13, color:'var(--text-3)', marginTop:3 }}>
              📍 {[user?.address?.city, user?.address?.state].filter(Boolean).join(', ') || 'Location not set'}
            </div>
            <div style={{ display:'flex', alignItems:'center', gap:8, marginTop:8 }}>
              {stats.impactLevel && <Badge color="green">Impact Level: {stats.impactLevel}</Badge>}
              <span style={{ fontSize:12, color:'var(--text-3)', textTransform:'capitalize' }}>{user?.role?.replace('_', ' ')}</span>
            </div>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:10, textAlign:'center' }}>
            {[
              ['📦', stats.itemsDonated || 0, 'Items'],
              ['👥', stats.familiesHelped || 0, 'Families'],
              ['₹',  stats.totalDonated  || 0, 'Donated'],
            ].map(([icon, val, label]) => (
              <div key={label} style={{ background:'var(--green-light)', borderRadius:10, padding:'12px 8px' }}>
                <div style={{ fontSize:18, fontWeight:800 }}>
                  {icon === '₹' ? `₹${(val || 0).toLocaleString()}` : (val || 0)}
                </div>
                <div style={{ fontSize:10, fontWeight:600, textTransform:'uppercase', color:'var(--text-3)', marginTop:2 }}>{label}</div>
              </div>
            ))}
          </div>
        </CardBody>
      </Card>

      {/* Edit form */}
      <Card style={{ marginBottom:20 }}>
        <CardHeader title="Edit Profile" />
        <CardBody>
          <Input label="Full Name" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
          <Input label="Email" value={form.email} disabled style={{ background:'var(--bg)', cursor:'not-allowed' }} helper="Email cannot be changed" />
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
            <Input label="City" value={form.address.city} onChange={e => setForm(f => ({ ...f, address: { ...f.address, city: e.target.value } }))} />
            <Input label="State" value={form.address.state} onChange={e => setForm(f => ({ ...f, address: { ...f.address, state: e.target.value } }))} />
          </div>
          <Input label="Address Line" placeholder="Flat/House No., Street, Area" value={form.address.line1} onChange={e => setForm(f => ({ ...f, address: { ...f.address, line1: e.target.value } }))} />
          <Input label="PIN Code" value={form.address.pin} onChange={e => setForm(f => ({ ...f, address: { ...f.address, pin: e.target.value } }))} type="number" />
          <Btn size="sm" onClick={handleSave} loading={saving}>Save Changes</Btn>
        </CardBody>
      </Card>

      {/* Quick Actions */}
      <Card style={{ marginBottom:20 }}>
        <CardHeader title="Quick Actions" />
        <CardBody>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
            {[
              { icon:'🚛', title:'Schedule Pickup',  sub:'Request home collection', onClick:() => navigate('/app/donate') },
              { icon:'📦', title:'My Donations',     sub:'View all your donations',  onClick:() => navigate('/app/donations') },
              { icon:'🌱', title:'Impact Details',   sub:"See how you've helped",    onClick:() => navigate('/app/analytics') },
              { icon:'🆘', title:'Get Support',      sub:'Report an issue or bug',   onClick:() => setReportModal(true) },
            ].map(a => (
              <div key={a.title} onClick={a.onClick}
                style={{ display:'flex', alignItems:'center', gap:12, background:'var(--bg)', border:'1px solid var(--border)', borderRadius:10, padding:16, cursor:'pointer', transition:'all 0.15s' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor='var(--green-mid)'; e.currentTarget.style.background='var(--green-light)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor='var(--border)'; e.currentTarget.style.background='var(--bg)'; }}>
                <div style={{ width:36, height:36, background:'white', borderRadius:10, display:'flex', alignItems:'center', justifyContent:'center', fontSize:18 }}>{a.icon}</div>
                <div>
                  <div style={{ fontSize:13, fontWeight:700 }}>{a.title}</div>
                  <div style={{ fontSize:11, color:'var(--text-3)', marginTop:2 }}>{a.sub}</div>
                </div>
              </div>
            ))}
          </div>
        </CardBody>
      </Card>

      {/* Settings */}
      <Card>
        <CardBody>
          {[['🔒 Account Privacy','›'],['🔔 Notifications','›']].map(([label, r]) => (
            <div key={label} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'14px 0', borderBottom:'1px solid var(--border)', cursor:'pointer', fontSize:14 }}>
              <span>{label}</span>
              <span style={{ color:'var(--text-3)' }}>{r}</span>
            </div>
          ))}
          <div
            style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'14px 0', cursor:'pointer', fontSize:14, color:'var(--red)' }}
            onClick={() => { logout(); navigate('/'); }}>
            <span>🚪 Logout</span>
          </div>
          <div style={{ textAlign:'center', marginTop:12, fontSize:11, color:'var(--text-3)' }}>DonateEase v2.4.0</div>
        </CardBody>
      </Card>

      {/* Report Issue Modal */}
      <Modal open={reportModal} onClose={() => setReportModal(false)} title="🆘 Report an Issue">
        <p style={{ fontSize:13, color:'var(--text-2)', marginBottom:20, lineHeight:1.5 }}>
          Having trouble with a pickup or the app? Tell us what happened and we'll resolve it within 24 hours.
        </p>
        <Select
          label="Issue Category"
          value={report.category}
          onChange={e => setReport(r => ({ ...r, category: e.target.value }))}
          options={['Pickup Issue','App Bug','Payment Issue','Volunteer Issue','Other'].map(c => ({ value:c, label:c }))}
        />
        <TextArea
          label="Describe the Issue"
          placeholder="Please provide details like date, time, or specific error messages…"
          value={report.description}
          onChange={e => setReport(r => ({ ...r, description: e.target.value }))}
          rows={4}
        />
        <Btn size="full" onClick={handleReport} loading={submitting}>Submit Report</Btn>
        <div style={{ textAlign:'center', marginTop:12 }}>
          <button onClick={() => setReportModal(false)} style={{ fontSize:13, color:'var(--text-3)', background:'none', border:'none', cursor:'pointer', fontFamily:'var(--font)' }}>Cancel</button>
        </div>
      </Modal>
    </div>
  );
}
