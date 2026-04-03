import React, { useEffect, useState } from 'react';
import { vehicleAPI, donationAPI } from '../api';
import { Card, CardBody, Badge, Avatar, SectionHeader, Btn, Spinner } from '../components/UI';
import toast from 'react-hot-toast';

export default function RoutePlanner() {
  const [vehicles, setVehicles] = useState([]);
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([vehicleAPI.getAll(), donationAPI.getAllAdmin({ status:'Scheduled', limit:20 })])
      .then(([v, d]) => { setVehicles(v.data.data.vehicles); setDonations(d.data.data.donations); })
      .catch(() => toast.error('Failed to load route data'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:300 }}><Spinner size={40} /></div>;

  return (
    <div className="animate-fadeUp">
      <SectionHeader title="Route Planner" subtitle="Optimize pickup routes across zones"
        action={<div style={{display:'flex',gap:8}}><Btn variant="outline" size="sm">Export CSV</Btn><Btn size="sm">⟳ Optimize Route</Btn></div>} />

      <div style={{ display:'grid', gridTemplateColumns:'1fr 340px', gap:20, height:'calc(100vh - 180px)' }}>
        {/* Map placeholder */}
        <Card style={{ overflow:'hidden', position:'relative' }}>
          <div style={{ position:'absolute', top:12, left:12, zIndex:10, display:'flex', gap:8 }}>
            <select style={{ padding:'7px 14px', borderRadius:50, border:'1px solid var(--border)', fontFamily:'var(--font)', fontSize:13, fontWeight:600, background:'white', cursor:'pointer' }}>
              {vehicles.map(v => <option key={v._id}>{v.vehicleId} - {v.driverName}</option>)}
            </select>
          </div>
          {/* SVG Map */}
          <svg viewBox="0 0 700 600" style={{width:'100%',height:'100%'}} xmlns="http://www.w3.org/2000/svg">
            <rect width="700" height="600" fill="#e8f5e9"/>
            <line x1="0" y1="150" x2="700" y2="150" stroke="#c8e6c9" strokeWidth="8"/>
            <line x1="0" y1="300" x2="700" y2="300" stroke="#a5d6a7" strokeWidth="12"/>
            <line x1="0" y1="450" x2="700" y2="450" stroke="#c8e6c9" strokeWidth="8"/>
            <line x1="150" y1="0" x2="150" y2="600" stroke="#c8e6c9" strokeWidth="8"/>
            <line x1="350" y1="0" x2="350" y2="600" stroke="#a5d6a7" strokeWidth="12"/>
            <line x1="550" y1="0" x2="550" y2="600" stroke="#c8e6c9" strokeWidth="8"/>
            <rect x="400" y="160" width="140" height="130" rx="8" fill="#c8e6c9" opacity="0.7"/>
            <rect x="50" y="310" width="90" height="130" rx="8" fill="#c8e6c9" opacity="0.6"/>
            <polyline points="180,200 300,260 420,340 520,280 450,420" stroke="#18C23A" strokeWidth="3" strokeDasharray="8,4" fill="none" strokeLinecap="round"/>
            {donations.slice(0,5).map((d,i) => {
              const positions = [[180,200],[300,260],[420,340],[520,280],[450,420]];
              const [cx,cy] = positions[i]||[300,300];
              return <g key={d._id}>
                <circle cx={cx} cy={cy} r="12" fill="white" stroke={i===0?"#EF4444":"#18C23A"} strokeWidth="2"/>
                <text x={cx} y={cy+4} textAnchor="middle" fontSize="10" fontWeight="bold" fill={i===0?"#EF4444":"#18C23A"}>{i+1}</text>
                <rect x={cx-45} y={cy-30} width="90" height="20" rx="4" fill="white" stroke="#e5e7eb"/>
                <text x={cx} y={cy-17} textAnchor="middle" fontSize="9" fontFamily="sans-serif" fill="#111">{d.donor?.name?.split(' ')[0]||'Donor'}</text>
              </g>;
            })}
          </svg>
        </Card>

        {/* Route panel */}
        <Card style={{ display:'flex', flexDirection:'column', overflow:'hidden' }}>
          <div style={{ padding:16, borderBottom:'1px solid var(--border)' }}>
            <div style={{ fontSize:16, fontWeight:800, marginBottom:8 }}>Route Management</div>
            <div style={{ display:'flex', alignItems:'center', gap:6, fontSize:12, color:'var(--green)', fontWeight:600, marginBottom:12 }}>
              <span style={{ width:8, height:8, borderRadius:'50%', background:'var(--green)', display:'inline-block', animation:'pulse 1.5s ease infinite' }}/>
              Live Sync
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:8, textAlign:'center' }}>
              {[['Stops',donations.length],['Dist.','18.4km'],['Time','2h 15m']].map(([l,v])=>(
                <div key={l}><div style={{fontSize:18,fontWeight:800}}>{v}</div><div style={{fontSize:10,color:'var(--text-3)',textTransform:'uppercase',letterSpacing:'0.06em'}}>{l}</div></div>
              ))}
            </div>
          </div>
          <div style={{ flex:1, overflowY:'auto', padding:12 }}>
            {donations.slice(0,8).map((d,i) => (
              <div key={d._id} style={{ display:'flex', alignItems:'center', gap:10, padding:12, borderRadius:10, marginBottom:4, cursor:'pointer', transition:'all 0.15s' }}
                onMouseEnter={e=>e.currentTarget.style.background='var(--bg)'} onMouseLeave={e=>e.currentTarget.style.background=''}>
                <span style={{ color:'var(--text-3)', fontSize:14 }}>⋮⋮</span>
                <div style={{ width:24, height:24, borderRadius:6, background:'var(--bg)', border:'1px solid var(--border)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:11, fontWeight:700, flexShrink:0 }}>{i+1}</div>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:13, fontWeight:700 }}>{d.donor?.name || 'Unknown'}</div>
                  <div style={{ fontSize:11, color:'var(--text-3)' }}>{d.pickup?.address?.city || 'Address pending'}</div>
                  <div style={{ fontSize:11, color:'var(--text-3)', display:'flex', alignItems:'center', gap:4 }}>📦 {d.item.quantity} {d.item.category}</div>
                </div>
                {i < 2 && <Badge color="red">High</Badge>}
                <Avatar name={d.donor?.name||''} size={28} />
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
