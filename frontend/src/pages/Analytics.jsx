import React, { useEffect, useState } from 'react';
import { Line, Doughnut } from 'react-chartjs-2';
import { Chart, CategoryScale, LinearScale, PointElement, LineElement, ArcElement, Filler, Tooltip, Legend } from 'chart.js';
import toast from 'react-hot-toast';
import { analyticsAPI } from '../api';
import { Card, CardHeader, CardBody, Badge, Avatar, SectionHeader, Btn, Spinner, Empty, Skeleton } from '../components/UI';

Chart.register(CategoryScale, LinearScale, PointElement, LineElement, ArcElement, Filler, Tooltip, Legend);

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

export default function Analytics() {
  const [data,    setData]    = useState(null);
  const [impact,  setImpact]  = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([analyticsAPI.dashboard(), analyticsAPI.impact()])
      .then(([a, i]) => { setData(a.data.data); setImpact(i.data.data); })
      .catch(() => toast.error('Failed to load analytics'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:300 }}>
      <Spinner size={40} />
    </div>
  );

  const monthly = data?.monthlyTrend || [];
  const lineData = {
    labels: monthly.map(t => MONTHS[(t._id || 1) - 1]),
    datasets: [
      { label:'Received',      data:monthly.map(t => t.received),     borderColor:'#18C23A', backgroundColor:'rgba(24,194,58,0.08)', fill:true, tension:0.4, pointRadius:4 },
      { label:'Redistributed', data:monthly.map(t => t.redistributed),borderColor:'#38bdf8', backgroundColor:'rgba(56,189,248,0.06)',fill:true, tension:0.4, pointRadius:4 },
    ]
  };

  const catColors = ['#18C23A','#38bdf8','#EF4444','#F59E0B','#8B5CF6','#06B6D4'];
  const catData = {
    labels: (data?.byCategory || []).map(c => c._id),
    datasets: [{
      data: (data?.byCategory || []).map(c => c.count),
      backgroundColor: catColors,
      borderWidth: 0,
      hoverOffset: 4
    }]
  };

  return (
    <div className="animate-fadeUp">
      <SectionHeader
        title="Analytics & Impact"
        action={<Btn variant="outline" size="sm">Export Report</Btn>}
      />

      {/* Impact summary stats */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:16, marginBottom:24 }}>
        {[
          ['📦', 'Total Items Shared',    impact?.totalItems?.toLocaleString(),  '#ecfdf5'],
          ['👨‍👩‍👧‍👦','Families Helped',       impact?.familiesHelped?.toLocaleString(),'#eff6ff'],
          ['₹',  'Total Funds Raised', `₹${(impact?.totalFunds || 0).toLocaleString()}`, '#fff7ed'],
        ].map(([icon, label, val, bg]) => (
          <Card key={label}>
            <CardBody>
              <div style={{ width:40, height:40, borderRadius:10, background:bg, display:'flex', alignItems:'center', justifyContent:'center', fontSize:20, marginBottom:12 }}>{icon}</div>
              <div style={{ fontSize:12, color:'var(--text-3)', marginBottom:6 }}>{label}</div>
              <div style={{ fontSize:28, fontWeight:800 }}>{val || '—'}</div>
            </CardBody>
          </Card>
        ))}
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 320px', gap:20 }}>
        {/* Left: charts */}
        <div style={{ display:'flex', flexDirection:'column', gap:20 }}>
          {/* Line chart */}
          <Card>
            <CardHeader title="Donations Received vs Redistributed" subtitle="Monthly breakdown for current year" />
            <CardBody>
              {monthly.length > 0
                ? <Line data={lineData} options={{ responsive:true, plugins:{ legend:{ position:'bottom', labels:{ font:{ size:11 } } } }, scales:{ y:{ beginAtZero:false, grid:{ color:'#f3f4f6' } }, x:{ grid:{ display:false } } } }} />
                : <Empty icon="📊" title="Not enough data yet" subtitle="Come back when more donations are processed." />
              }
              <div style={{ display:'flex', justifyContent:'space-between', fontSize:12, color:'var(--text-3)', marginTop:12 }}>
                <span>ℹ Data synchronized from database</span>
                <span style={{ color:'var(--green)', cursor:'pointer', fontWeight:600 }}>View Detailed Logs</span>
              </div>
            </CardBody>
          </Card>

          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:20 }}>
            {/* Donut */}
            <Card>
              <CardHeader title="By Category" subtitle="Volume distribution by item type" />
              <CardBody>
                {(data?.byCategory || []).length > 0
                  ? <>
                      <Doughnut data={catData} options={{ responsive:true, cutout:'65%', plugins:{ legend:{ display:false } } }} />
                      <div style={{ display:'flex', flexWrap:'wrap', gap:8, marginTop:12 }}>
                        {(data?.byCategory || []).map((c, i) => (
                          <span key={c._id} style={{ fontSize:11, display:'flex', alignItems:'center', gap:4 }}>
                            <span style={{ width:8, height:8, borderRadius:'50%', background:catColors[i % catColors.length], display:'inline-block' }}/>
                            {c._id}
                          </span>
                        ))}
                      </div>
                    </>
                  : <Empty icon="🍩" title="No data" />
                }
              </CardBody>
            </Card>

            {/* Top donors */}
            <Card>
              <CardHeader title="Top Donors" />
              <CardBody>
                {(impact?.topDonors || []).length > 0
                  ? impact.topDonors.slice(0, 6).map((d, i) => (
                      <div key={d._id} style={{ display:'flex', alignItems:'center', gap:10, padding:'8px 0', borderBottom:'1px solid var(--border)' }}>
                        <span style={{ fontSize:12, fontWeight:700, color:'var(--text-3)', width:18 }}>#{i+1}</span>
                        <Avatar name={d.name} size={28} />
                        <div style={{ flex:1 }}>
                          <div style={{ fontSize:13, fontWeight:600 }}>{d.name}</div>
                          <div style={{ fontSize:11, color:'var(--text-3)' }}>{d.stats.itemsDonated} items</div>
                        </div>
                        <Badge color="green">{d.stats.impactLevel}</Badge>
                      </div>
                    ))
                  : <Empty icon="👑" title="No donors yet" />
                }
              </CardBody>
            </Card>
          </div>
        </div>

        {/* Right: Insights */}
        <div>
          <div style={{ fontSize:15, fontWeight:800, marginBottom:14 }}>Operational Insights</div>
          {[
            { icon:'⚠️', bg:'#fff7ed', title:'Category Bottleneck', level:'Medium', levelColor:'amber', desc:'Bedding items are spending 2.4 days longer in processing than other categories in Zone D.' },
            { icon:'📈', bg:'#eff6ff', title:'Distribution Efficiency', level:'Improving', levelColor:'blue', desc:'Route optimization in North Sector improved redistribution speed by 14% this week.' },
          ].map(ins => (
            <Card key={ins.title} style={{ marginBottom:12 }}>
              <CardBody style={{ display:'flex', gap:12 }}>
                <div style={{ width:32, height:32, borderRadius:8, background:ins.bg, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, fontSize:16 }}>{ins.icon}</div>
                <div>
                  <div style={{ fontSize:13, fontWeight:700, display:'flex', alignItems:'center', gap:8 }}>
                    {ins.title}
                    <Badge color={ins.levelColor}>{ins.level}</Badge>
                  </div>
                  <div style={{ fontSize:12, color:'var(--text-2)', marginTop:4, lineHeight:1.5 }}>{ins.desc}</div>
                </div>
              </CardBody>
            </Card>
          ))}

          <div style={{ color:'var(--green)', fontSize:13, fontWeight:600, cursor:'pointer', marginBottom:20 }}>
            View All Recommendations ›
          </div>

          {/* Status breakdown */}
          {data?.byStatus && (
            <Card style={{ marginBottom:16 }}>
              <CardHeader title="Status Breakdown" />
              <CardBody>
                {Object.entries(data.byStatus).map(([status, count]) => (
                  <div key={status} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'8px 0', borderBottom:'1px solid var(--border)' }}>
                    <span style={{ fontSize:13, color:'var(--text-2)', textTransform:'capitalize' }}>{status}</span>
                    <span style={{ fontSize:14, fontWeight:700 }}>{count}</span>
                  </div>
                ))}
              </CardBody>
            </Card>
          )}

          <Card>
            <CardBody style={{ textAlign:'center' }}>
              <div style={{ fontSize:32, marginBottom:8 }}>👥</div>
              <div style={{ fontSize:14, fontWeight:700, marginBottom:8 }}>Want deeper demographics?</div>
              <div style={{ fontSize:13, color:'var(--text-2)', marginBottom:14, lineHeight:1.5 }}>
                Connect census data to see social impact breakdowns by age and region.
              </div>
              <Btn variant="outline" size="sm" style={{ width:'100%', justifyContent:'center' }}>Integrate Data Source</Btn>
            </CardBody>
          </Card>
        </div>
      </div>

      <div style={{ textAlign:'center', padding:'20px 0', fontSize:12, color:'var(--text-3)' }}>
        © 2024 DonateEase. Empowering NGOs for sustainable impact. &nbsp;·&nbsp;
        <a href="#" style={{ color:'var(--text-3)' }}>Privacy Policy</a> &nbsp;·&nbsp;
        <span style={{ color:'var(--green)' }}>● System Online</span>
      </div>
    </div>
  );
}
