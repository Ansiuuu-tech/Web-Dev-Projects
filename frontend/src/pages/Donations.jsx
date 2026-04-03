// ── Donations List ─────────────────────────────────────────
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { donationAPI, ngoAPI } from '../api';
import { useAuthStore } from '../context/authStore';
import { Card, CardHeader, CardBody, Badge, StatusBadge, Avatar, SectionHeader, Btn, Input, Select, TextArea, Modal, Spinner, Empty, Skeleton, ProgressBar } from '../components/UI';

export function Donations() {
  const { user }   = useAuthStore();
  const navigate   = useNavigate();
  const isAdmin    = ['ngo_staff','admin'].includes(user?.role);
  const [donations, setDonations] = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [filter,    setFilter]    = useState('');
  const [page,      setPage]      = useState(1);
  const [total,     setTotal]     = useState(0);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const fn = isAdmin ? donationAPI.getAllAdmin : donationAPI.getAll;
        const params = { page, limit:15, ...(filter ? { status:filter } : {}) };
        const { data } = await fn(params);
        setDonations(data.data.donations);
        setTotal(data.data.total);
      } catch { toast.error('Failed to load donations'); }
      finally  { setLoading(false); }
    };
    load();
  }, [filter, page]);

  const statuses = ['','Requested','Scheduled','Collected','InTransit','Delivered','Cancelled'];

  return (
    <div className="animate-fadeUp">
      <SectionHeader title="All Donations" subtitle={`${total} total records`}
        action={<Btn size="sm" onClick={() => navigate('/app/donate')}>+ New Donation</Btn>} />

      <div style={{ display:'flex', gap:8, marginBottom:16, flexWrap:'wrap' }}>
        {statuses.map(s => (
          <button key={s} onClick={() => setFilter(s)} style={{ padding:'6px 14px', borderRadius:50, border:'1.5px solid', borderColor: filter===s ? 'var(--green)' : 'var(--border)', background: filter===s ? 'var(--green)' : 'white', color: filter===s ? 'white' : 'var(--text-2)', fontSize:12, fontWeight:600, cursor:'pointer', fontFamily:'var(--font)', transition:'all 0.15s' }}>
            {s || 'All'}
          </button>
        ))}
      </div>

      <Card>
        {loading ? (
          <CardBody><div style={{ display:'flex', flexDirection:'column', gap:12 }}>{[1,2,3,4,5].map(i=><Skeleton key={i} height={48} />)}</div></CardBody>
        ) : donations.length === 0 ? (
          <Empty icon="📭" title="No donations found" subtitle="Try a different filter." />
        ) : (
          <table style={{ width:'100%', borderCollapse:'collapse' }}>
            <thead><tr>
              {['Donor','Category','Items','Zone','Date','Status',''].map(h=>(
                <th key={h} style={{ padding:'10px 16px', textAlign:'left', fontSize:11, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.06em', color:'var(--text-3)', background:'var(--bg)', borderBottom:'1px solid var(--border)' }}>{h}</th>
              ))}
            </tr></thead>
            <tbody>
              {donations.map(d => (
                <tr key={d._id} onClick={() => navigate(`/app/donations/${d._id}`)} style={{ cursor:'pointer' }}
                  onMouseEnter={e=>e.currentTarget.querySelectorAll('td').forEach(td=>td.style.background='var(--bg)')}
                  onMouseLeave={e=>e.currentTarget.querySelectorAll('td').forEach(td=>td.style.background='')}>
                  <td style={{ padding:'13px 16px', borderBottom:'1px solid var(--border)' }}>
                    <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                      <Avatar name={(d.donor?.name || d.trackingId)||''} size={28} />
                      <div><div style={{fontSize:13,fontWeight:600}}>{d.donor?.name || 'Unknown'}</div><div style={{fontSize:11,color:'var(--text-3)'}}>{d.trackingId}</div></div>
                    </div>
                  </td>
                  <td style={{ padding:'13px 16px', fontSize:13, borderBottom:'1px solid var(--border)' }}>{d.item.category}</td>
                  <td style={{ padding:'13px 16px', fontSize:13, borderBottom:'1px solid var(--border)' }}>{d.item.quantity}</td>
                  <td style={{ padding:'13px 16px', fontSize:12, color:'var(--text-2)', borderBottom:'1px solid var(--border)' }}>{d.pickup?.zone || '—'}</td>
                  <td style={{ padding:'13px 16px', fontSize:12, color:'var(--text-2)', borderBottom:'1px solid var(--border)' }}>{new Date(d.createdAt).toLocaleDateString()}</td>
                  <td style={{ padding:'13px 16px', borderBottom:'1px solid var(--border)' }}><StatusBadge status={d.status} /></td>
                  <td style={{ padding:'13px 16px', borderBottom:'1px solid var(--border)' }}><div style={{ width:28, height:28, background:'var(--bg)', border:'1px solid var(--border)', borderRadius:6, display:'flex', alignItems:'center', justifyContent:'center', fontSize:12 }}>›</div></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {/* Pagination */}
        {total > 15 && (
          <div style={{ padding:'14px 20px', borderTop:'1px solid var(--border)', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
            <span style={{ fontSize:13, color:'var(--text-3)' }}>Showing {Math.min(page*15,total)} of {total}</span>
            <div style={{ display:'flex', gap:8 }}>
              <Btn variant="outline" size="sm" disabled={page===1} onClick={() => setPage(p=>p-1)}>← Prev</Btn>
              <Btn variant="outline" size="sm" disabled={page*15>=total} onClick={() => setPage(p=>p+1)}>Next →</Btn>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}

export default Donations;

// ── Donation Detail ────────────────────────────────────────
export function DonationDetail() {
  const { id }    = useParams();
  const navigate  = useNavigate();
  const { user }  = useAuthStore();
  const isAdmin   = ['ngo_staff','admin','volunteer'].includes(user?.role);
  const [donation, setDonation] = useState(null);
  const [loading,  setLoading]  = useState(true);
  const [updating, setUpdating] = useState(false);
  const [statusModal, setStatusModal] = useState(false);
  const [newStatus,   setNewStatus]   = useState('');
  const [statusMsg,   setStatusMsg]   = useState('');

  useEffect(() => {
    donationAPI.getOne(id).then(({ data }) => { setDonation(data.data.donation); setLoading(false); }).catch(() => { toast.error('Not found'); navigate('/app/donations'); });
  }, [id]);

  const handleUpdateStatus = async () => {
    if (!newStatus || !statusMsg) return toast.error('Fill all fields');
    setUpdating(true);
    try {
      await donationAPI.updateStatus(id, { status: newStatus, message: statusMsg });
      toast.success('Status updated');
      const { data } = await donationAPI.getOne(id);
      setDonation(data.data.donation);
      setStatusModal(false);
    } catch (err) { toast.error(err.response?.data?.message || 'Update failed'); }
    finally { setUpdating(false); }
  };

  if (loading) return <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:300 }}><Spinner size={40} /></div>;
  if (!donation) return null;

  const d = donation;
  const timelineColors = { Requested:'var(--amber)', Scheduled:'var(--blue)', Collected:'var(--green)', InTransit:'var(--amber)', Delivered:'var(--green)', Cancelled:'var(--red)' };

  return (
    <div className="animate-fadeUp">
      {/* Header */}
      <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:24 }}>
        <Btn variant="outline" size="sm" onClick={() => navigate(-1)}>← Back</Btn>
        <div style={{ flex:1 }}>
          <div style={{ display:'flex', alignItems:'center', gap:12 }}>
            <Avatar name={d.donor?.name||''} size={44} />
            <div>
              <div style={{ fontSize:20, fontWeight:800, display:'flex', alignItems:'center', gap:10 }}>{d.donor?.name} <StatusBadge status={d.status} /></div>
              <div style={{ fontSize:13, color:'var(--text-2)', marginTop:3 }}>
                📅 {new Date(d.createdAt).toLocaleString()} &nbsp;|&nbsp; 🏠 {d.item.category} &nbsp;|&nbsp; <strong>{d.trackingId}</strong>
              </div>
            </div>
          </div>
        </div>
        {isAdmin && <Btn size="sm" onClick={() => setStatusModal(true)}>Update Status</Btn>}
        <Btn variant="red-outline" size="sm">Reject</Btn>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 300px', gap:20 }}>
        <div style={{ display:'flex', flexDirection:'column', gap:20 }}>
          {/* Contact */}
          <Card>
            <CardHeader title="👤 Contact Information" />
            <CardBody style={{ display:'flex', gap:12 }}>
              <div style={{ flex:1, background:'var(--bg)', border:'1px solid var(--border)', borderRadius:10, padding:'12px 14px' }}>
                <div style={{ fontSize:11, fontWeight:600, color:'var(--text-3)', textTransform:'uppercase', marginBottom:4 }}>Phone</div>
                <div style={{ fontSize:14, fontWeight:600 }}>{d.donor?.phone || '—'}</div>
              </div>
              <div style={{ flex:1, background:'var(--bg)', border:'1px solid var(--border)', borderRadius:10, padding:'12px 14px' }}>
                <div style={{ fontSize:11, fontWeight:600, color:'var(--text-3)', textTransform:'uppercase', marginBottom:4 }}>Email</div>
                <div style={{ fontSize:14, fontWeight:600 }}>{d.donor?.email || '—'}</div>
              </div>
            </CardBody>
          </Card>

          {/* Item Details */}
          <Card>
            <CardHeader title="🎁 Donation Inventory" action={<Badge color="gray">{d.item.quantity} Items Total</Badge>} />
            <CardBody>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
                {[['Category',d.item.category],['Condition',d.item.condition],['Quantity',d.item.quantity+' items'],['Description',d.item.description]].map(([k,v]) => (
                  <div key={k} style={{ background:'var(--bg)', border:'1px solid var(--border)', borderRadius:10, padding:'12px 14px' }}>
                    <div style={{ fontSize:11, fontWeight:600, color:'var(--text-3)', textTransform:'uppercase', marginBottom:4 }}>{k}</div>
                    <div style={{ fontSize:14, fontWeight:500 }}>{v}</div>
                  </div>
                ))}
              </div>
            </CardBody>
          </Card>

          {/* Tracking Timeline */}
          <Card>
            <CardHeader title="📦 Tracking History" />
            <CardBody>
              {d.trackingLog.map((log, i) => (
                <div key={i} style={{ display:'flex', gap:14, position:'relative', paddingBottom: i<d.trackingLog.length-1 ? 20 : 0 }}>
                  {i < d.trackingLog.length-1 && <div style={{ position:'absolute', left:17, top:34, bottom:0, width:2, background:'var(--border)' }}/>}
                  <div style={{ width:34, height:34, borderRadius:'50%', background: timelineColors[log.status]||'var(--border)', display:'flex', alignItems:'center', justifyContent:'center', color:'white', fontSize:14, flexShrink:0 }}>✓</div>
                  <div>
                    <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                      <span style={{ fontSize:14, fontWeight:700 }}>{log.status}</span>
                      <span style={{ fontSize:11, color:'var(--text-3)' }}>{new Date(log.timestamp).toLocaleString()}</span>
                    </div>
                    <div style={{ fontSize:13, color:'var(--text-2)', marginTop:3 }}>{log.message}</div>
                  </div>
                </div>
              ))}
            </CardBody>
          </Card>
        </div>

        {/* Right panel */}
        <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
          {/* Pickup Info */}
          <Card>
            <CardHeader title="📍 Pickup Details" />
            <CardBody style={{ display:'flex', flexDirection:'column', gap:12 }}>
              <div style={{ background:'var(--bg)', border:'1px solid var(--border)', borderRadius:10, padding:14 }}>
                <div style={{ fontSize:11, fontWeight:600, color:'var(--text-3)', textTransform:'uppercase', marginBottom:4 }}>Address</div>
                <div style={{ fontSize:13 }}>{[d.pickup?.address?.line1, d.pickup?.address?.city, d.pickup?.address?.state].filter(Boolean).join(', ') || 'Not specified'}</div>
              </div>
              {d.pickup?.scheduledDate && (
                <div style={{ background:'var(--bg)', border:'1px solid var(--border)', borderRadius:10, padding:14 }}>
                  <div style={{ fontSize:11, fontWeight:600, color:'var(--text-3)', textTransform:'uppercase', marginBottom:4 }}>Scheduled</div>
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
          {isAdmin && (
            <Card>
              <CardHeader title="Admin Actions" />
              <CardBody style={{ display:'flex', flexDirection:'column', gap:8 }}>
                {[['📅 Schedule Pickup','primary'],['👤 Assign Driver','outline'],['✅ Mark Collected','outline'],['💬 Message Donor','outline']].map(([label, variant]) => (
                  <Btn key={label} variant={variant} size="sm" style={{ width:'100%', justifyContent:'flex-start' }}>{label}</Btn>
                ))}
              </CardBody>
            </Card>
          )}

          {/* NGO Info */}
          {d.ngo && (
            <Card>
              <CardHeader title="🏛️ Assigned NGO" />
              <CardBody>
                <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                  <div style={{ width:40, height:40, background:'var(--green-light)', borderRadius:10, display:'flex', alignItems:'center', justifyContent:'center', fontSize:20 }}>🌱</div>
                  <div><div style={{fontSize:14,fontWeight:700}}>{d.ngo.name}</div><div style={{fontSize:12,color:'var(--text-3)'}}>{d.ngo.address?.city || ''}</div></div>
                </div>
              </CardBody>
            </Card>
          )}
        </div>
      </div>

      {/* Update Status Modal */}
      <Modal open={statusModal} onClose={() => setStatusModal(false)} title="Update Donation Status">
        <Select label="New Status" value={newStatus} onChange={e=>setNewStatus(e.target.value)} options={[
          {value:'',label:'Select status…'},
          ...['Requested','Scheduled','Collected','InTransit','Delivered','Cancelled'].map(s=>({value:s,label:s}))
        ]} />
        <TextArea label="Status Message" placeholder="Describe what happened…" value={statusMsg} onChange={e=>setStatusMsg(e.target.value)} rows={3} />
        <Btn size="full" onClick={handleUpdateStatus} loading={updating}>Update Status</Btn>
      </Modal>
    </div>
  );
}
