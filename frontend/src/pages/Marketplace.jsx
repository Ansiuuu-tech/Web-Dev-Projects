import React, { useEffect, useState } from 'react';
import { ngoAPI } from '../api';
import { Card, CardBody, Badge, SectionHeader, Btn, Spinner, Empty, ProgressBar } from '../components/UI';
import toast from 'react-hot-toast';

const MOCK_REQUESTS = [
  { _id:'1', ngo:'HopeShelter', urgency:'High', title:'Winter Blankets', desc:'Heavy-duty fleece or wool blankets for the upcoming winter season for homeless', fulfilled:58, total:250, deadline:'Oct 15, 2024', icon:'🧣', cat:'Clothing' },
  { _id:'2', ngo:'EduGrowth', urgency:'Medium', title:"Children's Books", desc:'Bilingual picture books and early readers for our community outreach library program', fulfilled:82, total:500, deadline:'Nov 01, 2024', icon:'📚', cat:'Education' },
  { _id:'3', ngo:'WarmHands', urgency:'High', title:'Winter Coats', desc:'Insulated waterproof coats for children and adults to survive the harsh regional winters.', fulfilled:28, total:300, deadline:'Oct 30, 2024', icon:'🧥', cat:'Clothing' },
  { _id:'4', ngo:'FreshStart', urgency:'Medium', title:'Hygiene Kits', desc:'Basic personal care items including soap, toothbrush, toothpaste, and sanitary items.', fulfilled:80, total:200, deadline:'Sep 20, 2024', icon:'🧴', cat:'Healthcare' },
];

export default function Marketplace() {
  const [ngos, setNgos] = useState([]);
  const [selected, setSelected] = useState(MOCK_REQUESTS[0]);
  const [filter, setFilter] = useState('All');

  useEffect(() => { ngoAPI.getAll().then(({ data }) => setNgos(data.data.ngos)).catch(() => {}); }, []);

  const filters = ['All','Healthcare','Education','Clothing','Food'];
  const items = filter === 'All' ? MOCK_REQUESTS : MOCK_REQUESTS.filter(r => r.cat === filter);

  return (
    <div className="animate-fadeUp">
      <SectionHeader title="NGO Marketplace" subtitle="Active Requests — Identify and fulfill critical needs from NGO partners." />
      <div style={{ display:'flex', gap:10, marginBottom:20, alignItems:'center', flexWrap:'wrap' }}>
        <input placeholder="🔍 Search by NGO name, item category, or urgency…" style={{ flex:1, maxWidth:360, padding:'9px 14px', border:'1.5px solid var(--border)', borderRadius:50, fontFamily:'var(--font)', fontSize:13, outline:'none' }} />
        {filters.map(f => <button key={f} onClick={() => setFilter(f)} style={{ padding:'6px 14px', borderRadius:50, border:'1.5px solid', borderColor: filter===f?'var(--green)':'var(--border)', background: filter===f?'var(--green)':'white', color: filter===f?'white':'var(--text-2)', fontSize:12, fontWeight:600, cursor:'pointer', fontFamily:'var(--font)', transition:'all 0.15s' }}>{f}</button>)}
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 360px', gap:20 }}>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, alignContent:'start' }}>
          {items.map(item => (
            <div key={item._id} onClick={() => setSelected(item)} style={{ background:'white', border:`1.5px solid ${selected?._id===item._id?'var(--green)':'var(--border)'}`, borderRadius:'var(--radius)', padding:20, cursor:'pointer', transition:'all 0.2s' }}
              onMouseEnter={e=>{if(selected?._id!==item._id)e.currentTarget.style.borderColor='var(--green-mid)'}} onMouseLeave={e=>{if(selected?._id!==item._id)e.currentTarget.style.borderColor='var(--border)'}}>
              <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:10 }}>
                <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                  <div style={{ width:34, height:34, borderRadius:'50%', background:'var(--green-light)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:16 }}>{item.icon}</div>
                  <span style={{fontSize:13,fontWeight:700}}>{item.ngo}</span>
                </div>
                <Badge color={item.urgency==='High'?'red':'amber'}>{item.urgency} Urgency</Badge>
              </div>
              <div style={{ fontSize:15, fontWeight:700, marginBottom:8 }}>{item.title}</div>
              <div style={{ fontSize:13, color:'var(--text-2)', lineHeight:1.5, marginBottom:12 }}>{item.desc.slice(0,80)}…</div>
              <div style={{ display:'flex', justifyContent:'space-between', fontSize:12, color:'var(--text-3)', marginBottom:6 }}>
                <span>{item.fulfilled}% Fulfilled</span><span style={{fontWeight:700,color:'var(--text)'}}>{Math.round(item.total*item.fulfilled/100)} / {item.total} Units</span>
              </div>
              <ProgressBar value={item.fulfilled} color={item.fulfilled>70?'var(--green)':'var(--amber)'} />
              <div style={{ fontSize:11, color:'var(--text-3)', marginTop:8, display:'flex', alignItems:'center', gap:4 }}>🕐 Deadline: {item.deadline}</div>
              <div style={{ display:'flex', gap:8, marginTop:14 }}>
                <Btn size="sm" style={{flex:1,justifyContent:'center'}}>Contact NGO</Btn>
                <Btn variant="outline" size="sm" style={{flex:1,justifyContent:'center'}}>Details</Btn>
              </div>
            </div>
          ))}
        </div>

        {/* Detail panel */}
        {selected && (
          <Card style={{ position:'sticky', top:0, height:'fit-content', maxHeight:'calc(100vh - 120px)', overflowY:'auto' }}>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'14px 16px', borderBottom:'1px solid var(--border)' }}>
              <div style={{ fontSize:15, fontWeight:800 }}>Request Details</div>
              <button onClick={() => setSelected(null)} style={{ width:32, height:32, background:'var(--bg)', border:'1px solid var(--border)', borderRadius:8, cursor:'pointer', fontSize:16 }}>×</button>
            </div>
            <div style={{ height:180, background:'linear-gradient(135deg,#1f2937,#374151)', display:'flex', alignItems:'flex-end', padding:16, position:'relative', overflow:'hidden' }}>
              <div style={{ position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center', fontSize:80, opacity:0.3 }}>{selected.icon}</div>
              <div style={{ position:'relative', zIndex:1 }}>
                <Badge color="red">Emergency</Badge>
                <div style={{ fontFamily:'var(--font)', fontSize:22, fontWeight:800, color:'white', marginTop:6 }}>{selected.title}</div>
              </div>
            </div>
            <div style={{ padding:20 }}>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:20 }}>
                {[['Urgency',selected.urgency+' Priority'],['Deadline',selected.deadline]].map(([k,v])=>(
                  <div key={k} style={{ background:'var(--bg)', border:'1px solid var(--border)', borderRadius:8, padding:12 }}>
                    <div style={{fontSize:10,fontWeight:600,textTransform:'uppercase',letterSpacing:'0.08em',color:'var(--text-3)'}}>{k}</div>
                    <div style={{fontSize:13,fontWeight:700,marginTop:4}}>{v}</div>
                  </div>
                ))}
              </div>
              <div style={{ fontSize:11, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.08em', color:'var(--text-3)', marginBottom:10 }}>NGO Partner</div>
              <div style={{ display:'flex', alignItems:'center', gap:10, background:'var(--bg)', border:'1px solid var(--border)', borderRadius:10, padding:'12px 14px', marginBottom:18, cursor:'pointer' }}>
                <div style={{width:40,height:40,background:'var(--green-light)',borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',fontSize:18}}>{selected.icon}</div>
                <div style={{flex:1}}><div style={{fontSize:14,fontWeight:700}}>{selected.ngo}</div><div style={{fontSize:12,color:'var(--text-3)'}}>2.4 miles from Central Hub</div></div>
                <span style={{color:'var(--text-3)'}}>›</span>
              </div>
              <div style={{ fontSize:11, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.08em', color:'var(--text-3)', marginBottom:10 }}>Item Requirements</div>
              {['New or gently used','Clean/Washed','Minimum size: Twin'].map(r=>(
                <div key={r} style={{ display:'flex', alignItems:'center', gap:8, fontSize:13, color:'var(--text-2)', marginBottom:8 }}>
                  <div style={{ width:18, height:18, borderRadius:'50%', background:'var(--green-light)', border:'1px solid var(--green-mid)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:10, color:'var(--green)', flexShrink:0 }}>✓</div>
                  {r}
                </div>
              ))}
              <div style={{ borderLeft:'3px solid var(--green)', padding:'12px 16px', background:'var(--green-light)', borderRadius:'0 8px 8px 0', fontSize:13, color:'var(--text-2)', fontStyle:'italic', lineHeight:1.6, marginTop:14, marginBottom:16 }}>
                "{selected.desc}"
              </div>
              <Btn size="full">Contact NGO</Btn>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
