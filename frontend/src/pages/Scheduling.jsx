import React, { useEffect, useState } from 'react';
import { vehicleAPI } from '../api';
import { Card, CardHeader, CardBody, Badge, SectionHeader, Btn, Spinner, ProgressBar } from '../components/UI';
import toast from 'react-hot-toast';

export default function Scheduling() {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    vehicleAPI.getAll().then(({ data }) => setVehicles(data.data.vehicles)).catch(() => toast.error('Failed to load vehicles')).finally(() => setLoading(false));
  }, []);

  const days = [17,18,19,20,21];
  const times = ['08:00','09:00','10:00','11:00','12:00+'];
  const scheduleData = [
    { vehicleId:'V-12', driver:'Alex Ruiz', slot:{ name:'Downtown Zone A', time:'08:00 - 11:30', stops:8, color:'var(--green-light)', border:'var(--green-mid)' } },
    { vehicleId:'V-07', driver:'S. Patel',  slot:{ name:'North Hills Express', time:'09:00 - 12:00', stops:12, color:'var(--blue-light)', border:'#bfdbfe', offset:1 } },
    { vehicleId:'V-03', driver:'M. Chen',   slot:{ name:'Central Market Hub', time:'10:30 - 14:30', stops:15, color:'var(--green-light)', border:'var(--green-mid)', offset:2 } },
    { vehicleId:'V-15', driver:'John Doe',  slot:{ name:'Morning Quick-run', time:'08:30 - 10:30', stops:5, color:'var(--green-light)', border:'var(--green-mid)' } },
    { vehicleId:'V-09', driver:'Elena G.',  slot:{ name:'West Industrial Park', time:'09:00 - 13:00', stops:11, color:'var(--blue-light)', border:'#bfdbfe', offset:1 } },
  ];

  if (loading) return <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:300 }}><Spinner size={40} /></div>;

  return (
    <div className="animate-fadeUp">
      {/* Header bar */}
      <div style={{ background:'white', border:'1px solid var(--border)', borderRadius:'var(--radius)', padding:'16px 20px', display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:20 }}>
        <div>
          <div style={{ fontSize:18, fontWeight:800, display:'flex', alignItems:'center', gap:10 }}>📅 Wednesday, June 19, 2024</div>
          <div style={{ fontSize:12, color:'var(--text-3)', marginTop:4, display:'flex', alignItems:'center', gap:6 }}>
            <span style={{width:8,height:8,borderRadius:'50%',background:'var(--green)',display:'inline-block'}}/>Scheduling finalized for today
          </div>
        </div>
        <div style={{ display:'flex', gap:24 }}>
          <div><div style={{fontSize:24,fontWeight:800}}>78</div><div style={{fontSize:11,color:'var(--text-3)',textTransform:'uppercase',letterSpacing:'0.06em'}}>Pickups</div></div>
          <div><div style={{fontSize:24,fontWeight:800,color:'var(--green)'}}>68%</div><div style={{fontSize:11,color:'var(--text-3)',textTransform:'uppercase',letterSpacing:'0.06em'}}>Fleet Util.</div></div>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:6 }}>
          <button style={{width:30,height:30,border:'1px solid var(--border)',borderRadius:6,display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',background:'white',fontSize:14}}>‹</button>
          {days.map(d => <button key={d} style={{padding:'5px 12px',borderRadius:50,fontSize:13,fontWeight:600,cursor:'pointer',border:'none',background: d===19?'var(--green)':'transparent',color: d===19?'white':'var(--text-2)',fontFamily:'var(--font)'}}>{d}</button>)}
          <button style={{width:30,height:30,border:'1px solid var(--border)',borderRadius:6,display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',background:'white',fontSize:14}}>›</button>
          <Btn size="sm" style={{marginLeft:8}}>+ New Schedule</Btn>
        </div>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 300px', gap:20 }}>
        {/* Timeline */}
        <Card style={{ overflow:'hidden' }}>
          <div style={{ display:'grid', gridTemplateColumns:'140px repeat(5,1fr)', borderBottom:'1px solid var(--border)' }}>
            <div style={{ padding:'10px 14px', fontSize:11, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.06em', color:'var(--text-3)', background:'var(--bg)', borderRight:'1px solid var(--border)' }}>Vehicle</div>
            {times.map(t => <div key={t} style={{ padding:'10px 14px', fontSize:11, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.06em', color:'var(--text-3)', background:'var(--bg)', borderRight:'1px solid var(--border)' }}>{t}</div>)}
          </div>
          {scheduleData.map(row => (
            <div key={row.vehicleId} style={{ display:'grid', gridTemplateColumns:'140px repeat(5,1fr)', borderBottom:'1px solid var(--border)', minHeight:64 }}>
              <div style={{ display:'flex', alignItems:'center', gap:8, padding:'12px 14px', borderRight:'1px solid var(--border)' }}>
                <div style={{ width:28, height:28, borderRadius:'50%', background:'var(--green-light)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:11, fontWeight:700, flexShrink:0 }}>{row.driver.split(' ').map(w=>w[0]).join('')}</div>
                <div><div style={{fontSize:13,fontWeight:700}}>{row.vehicleId}</div><div style={{fontSize:11,color:'var(--text-3)'}}>{row.driver}</div></div>
              </div>
              {Array.from({length:5}).map((_, ci) => (
                <div key={ci} style={{ borderRight:'1px solid var(--border)', padding:6 }}>
                  {ci === (row.slot.offset||0) && (
                    <div style={{ background:row.slot.color, border:`1px solid ${row.slot.border}`, borderRadius:8, padding:'8px 10px', height:'100%' }}>
                      <div style={{ fontSize:12, fontWeight:700 }}>{row.slot.name}</div>
                      <div style={{ fontSize:11, color:'var(--text-2)', display:'flex', alignItems:'center', gap:4, marginTop:2 }}>🕐 {row.slot.time} · {row.slot.stops} stops</div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ))}
        </Card>

        {/* Vehicle Pool */}
        <Card style={{ overflow:'hidden' }}>
          <CardHeader title="Vehicle Pool" action={<Badge color="green">{vehicles.length} Active</Badge>} />
          <div style={{ overflowY:'auto', maxHeight:500 }}>
            {(vehicles.length > 0 ? vehicles : scheduleData.map((s,i) => ({ _id:i, vehicleId:s.vehicleId, driverName:s.driver, loaded:Math.floor(Math.random()*20), capacity:20 }))).map(v => (
              <div key={v._id} style={{ padding:16, borderBottom:'1px solid var(--border)' }}>
                <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:10 }}>
                  <div style={{ width:28, height:28, borderRadius:'50%', background:'var(--green-light)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:11, fontWeight:700 }}>{(v.driverName||'').split(' ').map(w=>w[0]).join('')}</div>
                  <div style={{flex:1,fontSize:14,fontWeight:700}}>{v.vehicleId}</div>
                  <span style={{color:'var(--text-3)',cursor:'pointer'}}>⋯</span>
                </div>
                <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:8 }}>
                  <span style={{fontSize:12,color:'var(--text-3)'}}>Utilization</span>
                  <span style={{fontSize:12,fontWeight:700,marginLeft:'auto',color: (v.loaded/v.capacity)>0.8?'var(--red)':(v.loaded/v.capacity)>0.5?'var(--amber)':'var(--green)'}}>{Math.round((v.loaded/v.capacity)*100)||70}%</span>
                </div>
                <ProgressBar value={(v.loaded/v.capacity)*100||70} color={(v.loaded/v.capacity)>0.8?'var(--red)':(v.loaded/v.capacity)>0.5?'var(--amber)':'var(--green)'} />
                <div style={{ fontSize:11, color:'var(--text-3)', margin:'6px 0 10px' }}>{v.loaded||14} items loaded · Max {v.capacity||20}</div>
                <div style={{ display:'flex', gap:8 }}>
                  <Btn variant="outline" size="sm" style={{flex:1,justifyContent:'center'}}>Assign Stop</Btn>
                  <Btn variant="ghost"   size="sm" style={{flex:1,justifyContent:'center'}}>View Route</Btn>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
