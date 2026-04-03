import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { donationAPI } from '../api';
import { useAuthStore } from '../context/authStore';
import { Card, CardHeader, CardBody, Badge, StatusBadge, Avatar, Btn, Modal, Select, TextArea, Spinner, InfoRow } from '../components/UI';

export default function DonationDetail() {
  const { id }   = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const isStaff  = ['ngo_staff','admin','volunteer'].includes(user?.role);

  const [donation,     setDonation]     = useState(null);
  const [loading,      setLoading]      = useState(true);
  const [statusModal,  setStatusModal]  = useState(false);
  const [updating,     setUpdating]     = useState(false);
  const [newStatus,    setNewStatus]    = useState('');
  const [statusMsg,    setStatusMsg]    = useState('');

  useEffect(() => {
    donationAPI.getOne(id)
      .then(({ data }) => setDonation(data.data.donation))
      .catch(() => { toast.error('Donation not found'); navigate('/app/donations'); })
      .finally(() => setLoading(false));
  }, [id]);

  const handleUpdateStatus = async () => {
    if (!newStatus || !statusMsg.trim()) return toast.error('Please fill all fields');
    setUpdating(true);
    try {
      await donationAPI.updateStatus(id, { status: newStatus, message: statusMsg });
      toast.success('Status updated successfully');
      const { data } = await donationAPI.getOne(id);
      setDonation(data.data.donation);
      setStatusModal(false);
      setNewStatus(''); setStatusMsg('');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    } finally { setUpdating(false); }
  };

  if (loading) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:300 }}>
      <Spinner size={40} />
    </div>
  );
  if (!donation) return null;

  const d = donation;
  const timelineColor = (status) => ({ Requested:'var(--amber)', Scheduled:'var(--blue)', Collected:'var(--green)', InTransit:'var(--amber)', Delivered:'var(--green)', Cancelled:'var(--red)' }[status] || 'var(--border)');
  const catIcon = (cat) => ({ Clothes:'👕', Books:'📚', Electronics:'💻', Toys:'🎮', Furniture:'🪑', Kitchenware:'🍳', Bedding:'🛏️', Appliances:'📺', Other:'📦' }[cat] || '📦');

  return (
    <div className="animate-fadeUp">
      {/* Page header */}
      <div style={{ display:'flex', alignItems:'center', gap:14, marginBottom:24, flexWrap:'wrap' }}>
        <Btn variant="outline" size="sm" onClick={() => navigate(-1)}>← Back</Btn>
        <div style={{ flex:1, display:'flex', alignItems:'center', gap:14 }}>
          <Avatar name={d.donor?.name || ''} size={48} />
          <div>
            <div style={{ display:'flex', alignItems:'center', gap:10 }}>
              <span style={{ fontSize:20, fontWeight:800 }}>{d.donor?.name}</span>
              <StatusBadge status={d.status} />
            </div>
            <div style={{ fontSize:13, color:'var(--text-2)', marginTop:3 }}>
              📅 {new Date(d.createdAt).toLocaleString()} &nbsp;|&nbsp;
              🏠 {d.item.category} &nbsp;|&nbsp;
              <strong style={{ color:'var(--green)' }}>{d.trackingId}</strong>
            </div>
          </div>
        </div>
        <div style={{ display:'flex', gap:8 }}>
          {isStaff && (
            <Btn size="sm" onClick={() => setStatusModal(true)}>Update Status</Btn>
          )}
          <Btn variant="red-outline" size="sm">Reject</Btn>
        </div>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 300px', gap:20 }}>
        {/* Left column */}
        <div style={{ display:'flex', flexDirection:'column', gap:20 }}>
          {/* Contact Info */}
          <Card>
            <CardHeader title="👤 Contact Information" />
            <CardBody style={{ display:'flex', gap:12, flexWrap:'wrap' }}>
              <div style={{ flex:1, minWidth:200, background:'var(--bg)', border:'1px solid var(--border)', borderRadius:10, padding:'12px 14px' }}>
                <div style={{ fontSize:11, fontWeight:600, color:'var(--text-3)', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:4 }}>Phone Number</div>
                <div style={{ fontSize:14, fontWeight:600 }}>{d.donor?.phone || '—'}</div>
              </div>
              <div style={{ flex:1, minWidth:200, background:'var(--bg)', border:'1px solid var(--border)', borderRadius:10, padding:'12px 14px' }}>
                <div style={{ fontSize:11, fontWeight:600, color:'var(--text-3)', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:4 }}>Email Address</div>
                <div style={{ fontSize:14, fontWeight:600 }}>{d.donor?.email || '—'}</div>
              </div>
            </CardBody>
          </Card>

          {/* Item Inventory */}
          <Card>
            <CardHeader title="🎁 Donation Inventory" action={<Badge color="gray">{d.item.quantity} Items Total</Badge>} />
            <CardBody>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
                <div style={{ border:'1px solid var(--border)', borderRadius:10, overflow:'hidden' }}>
                  <div style={{ height:100, background:'var(--bg)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:48, position:'relative' }}>
                    {catIcon(d.item.category)}
                    <Badge color="gray" style={{ position:'absolute', top:8, left:8, fontSize:10 }}>{d.item.condition}</Badge>
                  </div>
                  <div style={{ padding:'10px 12px' }}>
                    <div style={{ fontSize:10, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.08em', color:'var(--green)', marginBottom:3 }}>{d.item.category}</div>
                    <div style={{ fontSize:13, fontWeight:700 }}>{d.item.description.slice(0, 60)}</div>
                    <div style={{ fontSize:12, color:'var(--text-2)', marginTop:3 }}>Qty: {d.item.quantity}</div>
                  </div>
                </div>
                <div style={{ border:'2px dashed var(--border)', borderRadius:10, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:8, padding:24, cursor:'pointer', transition:'all 0.15s' }}
                  onMouseEnter={e=>e.currentTarget.style.background='var(--green-light)'}
                  onMouseLeave={e=>e.currentTarget.style.background=''}>
                  <span style={{ fontSize:28 }}>📷</span>
                  <span style={{ fontSize:13, color:'var(--text-3)' }}>Add Manual Item Entry</span>
                </div>
              </div>
            </CardBody>
          </Card>

          {/* Tracking Timeline */}
          <Card>
            <CardHeader title="📦 Tracking History" />
            <CardBody>
              {(d.trackingLog || []).map((log, i) => (
                <div key={i} style={{ display:'flex', gap:14, position:'relative', paddingBottom: i < d.trackingLog.length - 1 ? 20 : 0 }}>
                  {i < d.trackingLog.length - 1 && (
                    <div style={{ position:'absolute', left:17, top:34, bottom:0, width:2, background:'var(--border)' }} />
                  )}
                  <div style={{ width:34, height:34, borderRadius:'50%', background:timelineColor(log.status), display:'flex', alignItems:'center', justifyContent:'center', color:'white', fontSize:14, flexShrink:0 }}>✓</div>
                  <div>
                    <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                      <span style={{ fontSize:14, fontWeight:700 }}>{log.status}</span>
                      <span style={{ fontSize:11, color:'var(--text-3)' }}>{new Date(log.timestamp).toLocaleString()}</span>
                    </div>
                    <div style={{ fontSize:13, color:'var(--text-2)', marginTop:3 }}>{log.message}</div>
                  </div>
                </div>
              ))}
              {(d.trackingLog || []).length === 0 && (
                <div style={{ textAlign:'center', padding:20, color:'var(--text-3)' }}>No tracking events yet</div>
              )}
            </CardBody>
          </Card>
        </div>

        {/* Right column */}
        <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
          {/* Logistics suggestion */}
          <div style={{ background:'var(--green)', color:'white', borderRadius:'var(--radius)', padding:20 }}>
            <div style={{ fontSize:14, fontWeight:700, marginBottom:8, display:'flex', alignItems:'center', gap:8 }}>🎯 Logistics Suggestion</div>
            <div style={{ fontSize:10, opacity:0.8, textTransform:'uppercase', letterSpacing:'0.08em' }}>Recommended Action</div>
            <div style={{ fontSize:15, fontWeight:800, margin:'4px 0 14px' }}>Priority Pickup: Morning Window</div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:12 }}>
              {[['Suggested Zone','Zone B-14'],['Nearest Hub','Brooklyn Cent.']].map(([k,v]) => (
                <div key={k} style={{ background:'rgba(255,255,255,0.15)', borderRadius:8, padding:'10px 12px' }}>
                  <div style={{ fontSize:10, opacity:0.75, textTransform:'uppercase', letterSpacing:'0.08em' }}>{k}</div>
                  <div style={{ fontSize:13, fontWeight:700, marginTop:2 }}>{v}</div>
                </div>
              ))}
            </div>
            <div style={{ display:'flex', alignItems:'center', gap:6, background:'rgba(255,255,255,0.15)', borderRadius:8, padding:'10px 12px', fontSize:13, fontWeight:600 }}>
              🕐 Estimated Pickup Time: 25 mins
            </div>
          </div>

          {/* Pickup details */}
          <Card>
            <CardHeader title="📍 Pickup Details" />
            <CardBody style={{ display:'flex', flexDirection:'column', gap:10 }}>
              <div style={{ background:'var(--bg)', border:'1px solid var(--border)', borderRadius:10, padding:14 }}>
                <div style={{ fontSize:11, fontWeight:600, color:'var(--text-3)', textTransform:'uppercase', marginBottom:4 }}>Pickup Address</div>
                <div style={{ fontSize:13 }}>
                  {[d.pickup?.address?.line1, d.pickup?.address?.city, d.pickup?.address?.state, d.pickup?.address?.pin].filter(Boolean).join(', ') || 'Not specified'}
                </div>
              </div>
              {d.pickup?.scheduledDate && (
                <div style={{ background:'var(--bg)', border:'1px solid var(--border)', borderRadius:10, padding:14 }}>
                  <div style={{ fontSize:11, fontWeight:600, color:'var(--text-3)', textTransform:'uppercase', marginBottom:4 }}>Scheduled Date</div>
                  <div style={{ fontSize:13 }}>{new Date(d.pickup.scheduledDate).toDateString()} · {d.pickup.timeSlot || ''}</div>
                </div>
              )}
              {d.pickup?.zone && (
                <div style={{ background:'var(--green-light)', border:'1px solid var(--green-mid)', borderRadius:10, padding:14 }}>
                  <div style={{ fontSize:11, fontWeight:600, color:'var(--green-dark)', textTransform:'uppercase', marginBottom:4 }}>Zone</div>
                  <div style={{ fontSize:14, fontWeight:700, color:'var(--green)' }}>{d.pickup.zone}</div>
                </div>
              )}
            </CardBody>
          </Card>

          {/* Admin actions */}
          {isStaff && (
            <Card>
              <CardHeader title="Administrative Actions" />
              <CardBody style={{ display:'flex', flexDirection:'column', gap:8 }}>
                {[
                  ['📅 Schedule Pickup', 'primary', () => setStatusModal(true)],
                  ['👤 Assign Driver / Vehicle', 'outline', null],
                  ['✅ Mark as Collected', 'outline', null],
                  ['💬 Message Donor', 'outline', null],
                ].map(([label, variant, onClick]) => (
                  <Btn key={label} variant={variant} size="sm" onClick={onClick} style={{ width:'100%', justifyContent:'flex-start' }}>
                    {label}
                  </Btn>
                ))}
                <div style={{ fontSize:12, color:'var(--text-3)', marginTop:4, lineHeight:1.5 }}>
                  ℹ Scheduling a pickup will automatically notify the donor via email.
                </div>
              </CardBody>
            </Card>
          )}

          {/* NGO info */}
          {d.ngo && (
            <Card>
              <CardHeader title="🏛️ Assigned NGO" />
              <CardBody>
                <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                  <div style={{ width:40, height:40, background:'var(--green-light)', borderRadius:10, display:'flex', alignItems:'center', justifyContent:'center', fontSize:20 }}>🌱</div>
                  <div>
                    <div style={{ fontSize:14, fontWeight:700 }}>{d.ngo.name}</div>
                    <div style={{ fontSize:12, color:'var(--text-3)' }}>{d.ngo.address?.city || ''}</div>
                    {d.ngo.isVerified && <Badge color="green">✓ Verified</Badge>}
                  </div>
                </div>
              </CardBody>
            </Card>
          )}
        </div>
      </div>

      {/* Update Status Modal */}
      <Modal open={statusModal} onClose={() => setStatusModal(false)} title="Update Donation Status">
        <Select
          label="New Status"
          value={newStatus}
          onChange={e => setNewStatus(e.target.value)}
          options={[
            { value:'', label:'Select new status…' },
            ...['Requested','Scheduled','Collected','InTransit','Delivered','Cancelled'].map(s => ({ value:s, label:s }))
          ]}
        />
        <TextArea
          label="Status Message"
          placeholder="Describe what happened or what action was taken…"
          value={statusMsg}
          onChange={e => setStatusMsg(e.target.value)}
          rows={3}
        />
        <Btn size="full" onClick={handleUpdateStatus} loading={updating}>
          Update Status
        </Btn>
      </Modal>
    </div>
  );
}
