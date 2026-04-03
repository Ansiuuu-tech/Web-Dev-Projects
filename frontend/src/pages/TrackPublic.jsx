import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { trackingAPI } from '../api';
import { Spinner, Card, CardBody, StatusBadge } from '../components/UI';

const STEPS = ['Requested','Scheduled','Collected','InTransit','Delivered'];

export default function TrackPublic() {
  const { trackingId } = useParams();
  const [donation, setDonation] = useState(null);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState('');

  useEffect(() => {
    if (!trackingId) return;
    trackingAPI.getByTrackingId(trackingId)
      .then(({ data }) => setDonation(data.data.donation))
      .catch(() => setError('Tracking ID not found'))
      .finally(() => setLoading(false));
  }, [trackingId]);

  const stepIdx = donation ? STEPS.indexOf(donation.status) : -1;

  if (loading) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100vh' }}>
      <Spinner size={48} />
    </div>
  );

  return (
    <div style={{ minHeight:'100vh', background:'var(--bg)', padding:'40px 20px', fontFamily:'var(--font)' }}>
      <div style={{ maxWidth:600, margin:'0 auto' }}>
        {/* Header */}
        <div style={{ textAlign:'center', marginBottom:32 }}>
          <Link to="/" style={{ display:'inline-flex', alignItems:'center', gap:8, textDecoration:'none', color:'var(--text)' }}>
            <div style={{ width:32, height:32, background:'var(--green-light)', borderRadius:8, display:'flex', alignItems:'center', justifyContent:'center' }}>🌱</div>
            <span style={{ fontSize:24, fontWeight:800 }}>DonateEase</span>
          </Link>
          <div style={{ fontSize:16, color:'var(--text-2)', marginTop:6 }}>Donation Tracking</div>
        </div>

        {error ? (
          <Card>
            <CardBody style={{ textAlign:'center', padding:48 }}>
              <div style={{ fontSize:56, marginBottom:16 }}>🔍</div>
              <div style={{ fontSize:20, fontWeight:700, marginBottom:8 }}>{error}</div>
              <div style={{ fontSize:14, color:'var(--text-2)', marginBottom:24 }}>
                Check your tracking ID and try again.
              </div>
              <Link to="/" style={{ padding:'12px 24px', background:'var(--green)', color:'white', borderRadius:50, textDecoration:'none', fontSize:14, fontWeight:700 }}>
                Back to Home
              </Link>
            </CardBody>
          </Card>
        ) : donation ? (
          <>
            {/* Status card */}
            <Card style={{ marginBottom:20 }}>
              <CardBody>
                <div style={{ textAlign:'center', marginBottom:24 }}>
                  <div style={{ fontSize:13, color:'var(--text-3)', marginBottom:4 }}>Tracking ID</div>
                  <div style={{ fontSize:22, fontWeight:800, color:'var(--green)' }}>{donation.trackingId}</div>
                  <div style={{ marginTop:10 }}><StatusBadge status={donation.status} /></div>
                </div>

                {/* Stepper */}
                <div style={{ display:'flex', alignItems:'flex-start', marginBottom:24 }}>
                  {STEPS.map((s, i) => (
                    <React.Fragment key={s}>
                      <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:5, minWidth:60 }}>
                        <div style={{
                          width:30, height:30, borderRadius:'50%',
                          background: i <= stepIdx ? 'var(--green)' : 'var(--border)',
                          color: i <= stepIdx ? 'white' : 'var(--text-3)',
                          display:'flex', alignItems:'center', justifyContent:'center',
                          fontSize:12, fontWeight:700
                        }}>
                          {i < stepIdx ? '✓' : i + 1}
                        </div>
                        <span style={{ fontSize:9, fontWeight:600, color: i <= stepIdx ? 'var(--green)' : 'var(--text-3)', textAlign:'center', whiteSpace:'nowrap' }}>
                          {s === 'InTransit' ? 'In Transit' : s}
                        </span>
                      </div>
                      {i < STEPS.length - 1 && (
                        <div style={{ flex:1, height:2, background: i < stepIdx ? 'var(--green)' : 'var(--border)', marginTop:14, marginBottom:20 }} />
                      )}
                    </React.Fragment>
                  ))}
                </div>

                {/* Details */}
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
                  {[
                    ['Category', donation.item?.category],
                    ['Quantity',  `${donation.item?.quantity} items`],
                    ['Pickup Zone', donation.pickup?.zone || '—'],
                    ['ETA', donation.eta ? `${donation.eta} mins` : 'Pending'],
                  ].map(([k, v]) => (
                    <div key={k} style={{ background:'var(--bg)', border:'1px solid var(--border)', borderRadius:10, padding:14 }}>
                      <div style={{ fontSize:11, fontWeight:600, color:'var(--text-3)', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:4 }}>{k}</div>
                      <div style={{ fontSize:14, fontWeight:600 }}>{v || '—'}</div>
                    </div>
                  ))}
                </div>

                {donation.volunteer && (
                  <div style={{ marginTop:16, background:'var(--green-light)', border:'1px solid var(--green-mid)', borderRadius:10, padding:14, display:'flex', alignItems:'center', gap:12 }}>
                    <div style={{ width:40, height:40, borderRadius:'50%', background:'var(--green)', display:'flex', alignItems:'center', justifyContent:'center', color:'white', fontWeight:700 }}>
                      {(donation.volunteer.name||'V').charAt(0)}
                    </div>
                    <div>
                      <div style={{ fontSize:11, fontWeight:600, color:'var(--green-dark)', textTransform:'uppercase', letterSpacing:'0.06em' }}>Assigned Volunteer</div>
                      <div style={{ fontSize:14, fontWeight:700 }}>{donation.volunteer.name}</div>
                    </div>
                  </div>
                )}
              </CardBody>
            </Card>

            {/* Timeline */}
            <Card>
              <div style={{ padding:'14px 20px', borderBottom:'1px solid var(--border)', fontSize:15, fontWeight:700 }}>Tracking History</div>
              <CardBody>
                {(donation.trackingLog || []).map((log, i) => (
                  <div key={i} style={{ display:'flex', gap:14, paddingBottom: i < donation.trackingLog.length - 1 ? 20 : 0, position:'relative' }}>
                    {i < donation.trackingLog.length - 1 && (
                      <div style={{ position:'absolute', left:17, top:34, bottom:0, width:2, background:'var(--border)' }} />
                    )}
                    <div style={{ width:34, height:34, borderRadius:'50%', background:'var(--green)', display:'flex', alignItems:'center', justifyContent:'center', color:'white', fontSize:14, flexShrink:0 }}>✓</div>
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

            <div style={{ textAlign:'center', marginTop:20 }}>
              <Link to="/" style={{ fontSize:13, color:'var(--green)', fontWeight:600, textDecoration:'none' }}>← Back to DonateEase</Link>
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}
