import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Line } from 'react-chartjs-2';
import { Chart, CategoryScale, LinearScale, PointElement, LineElement, Filler, Tooltip } from 'chart.js';
import { analyticsAPI, donationAPI } from '../api';
import { useAuthStore } from '../context/authStore';
import { Card, CardHeader, CardBody, StatCard, Badge, StatusBadge, Avatar, ProgressBar, SectionHeader, Skeleton, Empty, Btn } from '../components/UI';
import toast from 'react-hot-toast';

Chart.register(CategoryScale, LinearScale, PointElement, LineElement, Filler, Tooltip);

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

export default function Dashboard() {
  const { user } = useAuthStore();
  const navigate  = useNavigate();
  const isDonor   = user?.role === 'donor';
  const isAdmin   = ['ngo_staff','admin'].includes(user?.role);

  const [stats,     setStats]     = useState(null);
  const [donations, setDonations] = useState([]);
  const [impact,    setImpact]    = useState(null);
  const [loading,   setLoading]   = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        if (isAdmin) {
          const [a, d] = await Promise.all([
            analyticsAPI.dashboard(),
            donationAPI.getAllAdmin({ limit:8 })
          ]);
          setStats(a.data.data);
          setDonations(d.data.data.donations);
        } else {
          const [d, i] = await Promise.all([
            donationAPI.getAll({ limit:5 }),
            donationAPI.communityImpact()
          ]);
          setDonations(d.data.data.donations);
          setImpact(i.data.data);
        }
      } catch { toast.error('Failed to load dashboard'); }
      finally  { setLoading(false); }
    };
    load();
  }, []);

  const trendData = stats?.monthlyTrend || [];
  const chartData = {
    labels:   trendData.map(t => MONTHS[t._id - 1]),
    datasets: [
      { label:'Received',     data: trendData.map(t=>t.received),     borderColor:'#18C23A', backgroundColor:'rgba(24,194,58,0.08)', fill:true, tension:0.4, pointRadius:3 },
      { label:'Redistributed',data: trendData.map(t=>t.redistributed),borderColor:'#38bdf8', backgroundColor:'rgba(56,189,248,0.06)',fill:true, tension:0.4, pointRadius:3 },
    ]
  };

  return (
    <div className="animate-fadeUp">
      {/* Greeting */}
      <div style={{ marginBottom:24 }}>
        <h1 style={{ fontSize:22, fontWeight:800 }}>Hi, {user?.name?.split(' ')[0]} 👋</h1>
        <p style={{ color:'var(--text-2)', fontSize:14, marginTop:4 }}>
          {isAdmin ? 'Here\'s your operational overview for today.' : 'Ready to make someone\'s day today?'}
        </p>
      </div>

      {/* Admin Stats */}
      {isAdmin && (
        <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:16, marginBottom:24 }} className="stagger">
          <StatCard icon="♥" iconBg="#ecfdf5" label="Total Donations" value={loading ? '—' : stats?.stats.totalDonations?.toLocaleString()} change="12.5%" loading={loading} />
          <StatCard icon="📦" iconBg="#eff6ff" label="Items This Week"  value={loading ? '—' : stats?.stats.itemsThisWeek?.toLocaleString()} change="8.2%" loading={loading} />
          <StatCard icon="👥" iconBg="#f5f3ff" label="Active Donors"    value={loading ? '—' : stats?.stats.activeDonors?.toLocaleString()} change="4.1%" loading={loading} />
          <StatCard icon="🏛️" iconBg="#fff7ed" label="NGO Partners"     value={loading ? '—' : stats?.stats.ngoPartners?.toLocaleString()} change="2.4%" loading={loading} />
        </div>
      )}

      {/* Donor impact banner */}
      {isDonor && impact && (
        <div style={{ background:'linear-gradient(135deg,#e8fbed,#c8f0d5)', border:'1.5px solid #a8e4b4', borderRadius:'var(--radius)', padding:20, marginBottom:24 }}>
          <div style={{ fontSize:10, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.1em', color:'var(--green-dark)', marginBottom:8 }}>Community Impact</div>
          <div style={{ fontSize:17, fontWeight:800, marginBottom:12 }}>Together we're making a difference</div>
          <div style={{ display:'flex', gap:24 }}>
            {[['itemsShared','Items Shared'],['familiesHelped','Families Helped'],['ngoPartners','NGO Partners']].map(([k,l]) => (
              <div key={k}><div style={{fontSize:20,fontWeight:800}}>{(impact[k]||0).toLocaleString()}+</div><div style={{fontSize:11,fontWeight:600,textTransform:'uppercase',color:'var(--text-3)'}}>{l}</div></div>
            ))}
          </div>
          <div style={{ marginTop:12 }}>
            <Link to="/app/analytics" style={{ fontSize:13, color:'var(--green)', fontWeight:600 }}>View Detailed Report →</Link>
          </div>
        </div>
      )}

      {/* Donor quick actions */}
      {isDonor && (
        <div style={{ display:'grid', gridTemplateColumns:'repeat(2,1fr)', gap:12, marginBottom:24 }}>
          {[
            { icon:'🎁', label:'Donate Item', sub:'Schedule a doorstep pickup', path:'/app/donate', bg:'#ecfdf5' },
            { icon:'🏛️', label:'Find NGOs',   sub:'Support verified NGOs',      path:'/app/marketplace', bg:'#eff6ff' },
            { icon:'📦', label:'Track Donations', sub:'Check status of donations', path:'/app/donations', bg:'#fff7ed' },
            { icon:'🌱', label:'My Impact',   sub:'See how you\'ve helped',      path:'/app/analytics', bg:'#f5f3ff' },
          ].map(a => (
            <Card key={a.path} onClick={() => navigate(a.path)} style={{ cursor:'pointer', transition:'all 0.2s' }}
              onMouseEnter={e=>e.currentTarget.style.boxShadow='var(--shadow)'} onMouseLeave={e=>e.currentTarget.style.boxShadow='var(--shadow-sm)'}>
              <CardBody>
                <div style={{ width:40, height:40, borderRadius:12, background:a.bg, display:'flex', alignItems:'center', justifyContent:'center', fontSize:20, marginBottom:10 }}>{a.icon}</div>
                <div style={{ fontSize:14, fontWeight:700 }}>{a.label}</div>
                <div style={{ fontSize:12, color:'var(--text-3)', marginTop:3 }}>{a.sub}</div>
              </CardBody>
            </Card>
          ))}
        </div>
      )}

      {/* Main grid */}
      <div style={{ display:'grid', gridTemplateColumns: isAdmin ? '1fr 340px' : '1fr', gap:20 }}>
        {/* Donations table */}
        <Card>
          <CardHeader
            title={isAdmin ? 'Donation Requests' : 'My Recent Donations'}
            subtitle={isAdmin ? 'Manage incoming household pickup requests' : 'Track your donation history'}
            action={
              <div style={{ display:'flex', gap:8 }}>
                {isAdmin && <Btn variant="outline" size="sm">Export</Btn>}
                <Link to="/app/donations"><Btn variant="outline" size="sm">View All</Btn></Link>
              </div>
            }
          />
          {loading ? (
            <CardBody><div style={{display:'flex',flexDirection:'column',gap:12}}>{[1,2,3,4].map(i=><Skeleton key={i} height={40}/>)}</div></CardBody>
          ) : donations.length === 0 ? (
            <Empty icon="📭" title="No donations yet" subtitle={isDonor ? 'Start your first donation!' : 'No requests received yet.'} />
          ) : (
            <table style={{ width:'100%', borderCollapse:'collapse' }}>
              <thead>
                <tr>{[isAdmin?'Donor':'Item','Category','Zone/Date','Status',''].map(h=>(
                  <th key={h} style={{ padding:'10px 16px', textAlign:'left', fontSize:11, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.06em', color:'var(--text-3)', background:'var(--bg)', borderBottom:'1px solid var(--border)' }}>{h}</th>
                ))}</tr>
              </thead>
              <tbody>
                {donations.map(d => (
                  <tr key={d._id} onClick={() => navigate(`/app/donations/${d._id}`)} style={{ cursor:'pointer' }}
                    onMouseEnter={e=>e.currentTarget.querySelectorAll('td').forEach(td=>td.style.background='var(--bg)')}
                    onMouseLeave={e=>e.currentTarget.querySelectorAll('td').forEach(td=>td.style.background='')}>
                    <td style={{ padding:'13px 16px', borderBottom:'1px solid var(--border)' }}>
                      {isAdmin ? (
                        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                          <Avatar name={d.donor?.name||''} size={30} />
                          <div><div style={{fontSize:13,fontWeight:600}}>{d.donor?.name}</div><div style={{fontSize:11,color:'var(--text-3)'}}>{d.trackingId}</div></div>
                        </div>
                      ) : (
                        <div><div style={{fontSize:13,fontWeight:600}}>{d.item.description.slice(0,40)}…</div><div style={{fontSize:11,color:'var(--text-3)'}}>{d.trackingId}</div></div>
                      )}
                    </td>
                    <td style={{ padding:'13px 16px', fontSize:13, borderBottom:'1px solid var(--border)' }}>{d.item.category}<br/><span style={{fontSize:11,color:'var(--text-3)'}}>{d.item.quantity} items</span></td>
                    <td style={{ padding:'13px 16px', fontSize:13, borderBottom:'1px solid var(--border)', color:'var(--text-2)' }}>{d.pickup?.zone || new Date(d.createdAt).toLocaleDateString()}</td>
                    <td style={{ padding:'13px 16px', borderBottom:'1px solid var(--border)' }}><StatusBadge status={d.status} /></td>
                    <td style={{ padding:'13px 16px', borderBottom:'1px solid var(--border)' }}>
                      <div style={{ width:28, height:28, background:'var(--bg)', border:'1px solid var(--border)', borderRadius:6, display:'flex', alignItems:'center', justifyContent:'center', fontSize:12 }}>›</div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Card>

        {/* Admin right panel */}
        {isAdmin && (
          <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
            {/* Monthly trend mini chart */}
            {trendData.length > 0 && (
              <Card>
                <CardHeader title="Monthly Trend" subtitle="Donations received vs redistributed" />
                <CardBody>
                  <Line data={chartData} options={{ responsive:true, plugins:{ legend:{ display:false } }, scales:{ x:{ grid:{ display:false } }, y:{ beginAtZero:false, grid:{ color:'#f3f4f6' } } } }} />
                </CardBody>
              </Card>
            )}

            {/* Status breakdown */}
            {stats?.byStatus && (
              <Card>
                <CardHeader title="Status Overview" />
                <CardBody>
                  {Object.entries(stats.byStatus).map(([status, count]) => (
                    <div key={status} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'8px 0', borderBottom:'1px solid var(--border)' }}>
                      <StatusBadge status={status} />
                      <span style={{ fontSize:14, fontWeight:700 }}>{count}</span>
                    </div>
                  ))}
                </CardBody>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
