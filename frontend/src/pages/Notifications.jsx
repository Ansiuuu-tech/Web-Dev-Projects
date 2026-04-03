import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { notifAPI } from '../api';
import { useNotifStore } from '../context/authStore';
import { Card, CardBody, Badge, SectionHeader, Btn, Skeleton, Empty } from '../components/UI';

export default function Notifications() {
  const { notifications, unread, setNotifications, markRead, markAllRead } = useNotifStore();
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('all');

  useEffect(() => {
    notifAPI.getAll()
      .then(({ data }) => setNotifications(data.data.notifications, data.data.unread))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleMarkRead = async (id) => {
    await notifAPI.markRead(id).catch(() => {});
    markRead(id);
  };

  const handleMarkAll = async () => {
    await notifAPI.markAllRead().catch(() => {});
    markAllRead();
    toast.success('All marked as read');
  };

  const typeColors = { system:'#eff6ff', pickup:'#ecfdf5', marketplace:'#f5f3ff', payment:'#fff7ed', general:'var(--bg)' };
  const typeIcons  = { system:'⚙️', pickup:'🚛', marketplace:'🏛️', payment:'💳', general:'ℹ️' };
  const filtered   = tab === 'all' ? notifications : notifications.filter(n => n.type === tab);

  return (
    <div className="animate-fadeUp">
      <SectionHeader
        title="Notification Center"
        subtitle="System Alerts — Manage operational updates and marketplace activity."
        action={
          <div style={{ display:'flex', gap:8 }}>
            <Btn variant="outline" size="sm">Filter Rules</Btn>
            <Btn size="sm">⚙ Settings</Btn>
          </div>
        }
      />

      {/* Stats */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:16, marginBottom:24 }}>
        {[
          ['Unread Alerts', unread, 'var(--red)'],
          ['Active Delays', 1, 'var(--amber)'],
          ['New Needs', 4, 'var(--blue)'],
          ['Daily Uptime', '99.9%', 'var(--text)'],
        ].map(([label, val, color]) => (
          <Card key={label}>
            <CardBody>
              <div style={{ fontSize:28, fontWeight:800, color }}>{val}</div>
              <div style={{ fontSize:12, color:'var(--text-3)', marginTop:4 }}>{label}</div>
            </CardBody>
          </Card>
        ))}
      </div>

      {/* Tabs */}
      <div style={{ display:'flex', alignItems:'center', borderBottom:'1px solid var(--border)', marginBottom:20 }}>
        {['all','system','pickup','marketplace','payment'].map(t => (
          <button key={t} onClick={() => setTab(t)} style={{
            padding:'10px 20px', fontSize:14, fontWeight:600,
            color: tab===t ? 'var(--green)' : 'var(--text-2)',
            borderBottom: `2px solid ${tab===t ? 'var(--green)' : 'transparent'}`,
            cursor:'pointer', border:'none', background:'none',
            fontFamily:'var(--font)', transition:'all 0.15s', textTransform:'capitalize'
          }}>
            {t}{t==='all' && unread > 0 && (
              <span style={{ background:'var(--green)', color:'white', fontSize:10, padding:'1px 6px', borderRadius:10, marginLeft:4 }}>{unread}</span>
            )}
          </button>
        ))}
        <div style={{ marginLeft:'auto', display:'flex', gap:14 }}>
          <button onClick={handleMarkAll} style={{ fontSize:13, color:'var(--green)', cursor:'pointer', background:'none', border:'none', fontFamily:'var(--font)', fontWeight:600 }}>
            Mark all as read
          </button>
          <button style={{ fontSize:13, color:'var(--text-2)', cursor:'pointer', background:'none', border:'none', fontFamily:'var(--font)' }}>
            Clear all
          </button>
        </div>
      </div>

      {/* List */}
      {loading ? (
        <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
          {[1,2,3].map(i => <Skeleton key={i} height={90} />)}
        </div>
      ) : filtered.length === 0 ? (
        <Empty icon="🔔" title="No notifications" subtitle="You're all caught up!" />
      ) : (
        <>
          <div style={{ fontSize:11, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.08em', color:'var(--text-3)', marginBottom:10 }}>Today</div>
          {filtered.map(n => (
            <div key={n._id}
              onClick={() => !n.isRead && handleMarkRead(n._id)}
              style={{
                display:'flex', gap:14, padding:18,
                background:'white', border:'1px solid var(--border)',
                borderLeft:`4px solid ${n.isRead ? 'transparent' : n.isUrgent ? 'var(--red)' : 'var(--green)'}`,
                borderRadius:'var(--radius)', marginBottom:10,
                cursor: n.isRead ? 'default' : 'pointer', transition:'all 0.15s'
              }}
              onMouseEnter={e => { if (!n.isRead) e.currentTarget.style.boxShadow='var(--shadow-sm)'; }}
              onMouseLeave={e => { e.currentTarget.style.boxShadow='none'; }}
            >
              <div style={{ width:36, height:36, borderRadius:10, background:typeColors[n.type]||'var(--bg)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:18, flexShrink:0 }}>
                {typeIcons[n.type]||'ℹ️'}
              </div>
              <div style={{ flex:1 }}>
                <div style={{ fontSize:14, fontWeight:700, display:'flex', alignItems:'center', gap:8 }}>
                  {n.title}
                  {!n.isRead && <span style={{ width:8, height:8, borderRadius:'50%', background: n.isUrgent ? 'var(--red)' : 'var(--green)', display:'inline-block' }} />}
                  <Badge color={n.type==='pickup'?'green':n.type==='system'?'blue':n.type==='payment'?'amber':'gray'}>{n.type}</Badge>
                </div>
                <div style={{ fontSize:13, color:'var(--text-2)', marginTop:4, lineHeight:1.5 }}>{n.message}</div>
                <div style={{ display:'flex', gap:8, marginTop:10 }}>
                  {!n.isRead && (
                    <button onClick={e => { e.stopPropagation(); handleMarkRead(n._id); }} style={{ padding:'5px 12px', borderRadius:6, background:'var(--green)', color:'white', border:'none', fontSize:12, fontWeight:600, cursor:'pointer', fontFamily:'var(--font)' }}>
                      Mark as read
                    </button>
                  )}
                </div>
              </div>
              <div style={{ fontSize:11, color:'var(--text-3)', whiteSpace:'nowrap' }}>
                {new Date(n.createdAt).toLocaleTimeString([], { hour:'2-digit', minute:'2-digit' })}
              </div>
            </div>
          ))}
        </>
      )}
    </div>
  );
}
