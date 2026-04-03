import React, { useEffect, useState } from 'react';
import { Outlet, useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuthStore, useNotifStore } from '../context/authStore';
import { notifAPI } from '../api';
import { Avatar, Badge } from '../components/UI';

const NAV = [
  { path:'dashboard',    icon:'⊞', label:'Dashboard',   roles:['donor','volunteer','ngo_staff','admin'] },
  { path:'donations',    icon:'♥', label:'Donations',    roles:['donor','volunteer','ngo_staff','admin'] },
  { path:'donate',       icon:'+', label:'Donate Item',  roles:['donor'] },
  { path:'routes',       icon:'⊙', label:'Pickup Zones', roles:['ngo_staff','admin'] },
  { path:'scheduling',   icon:'▦', label:'Scheduling',   roles:['ngo_staff','admin'] },
  { path:'marketplace',  icon:'⌂', label:'NGO Requests', roles:['ngo_staff','admin'] },
  { path:'analytics',    icon:'≡', label:'Analytics',    roles:['ngo_staff','admin'] },
  { path:'notifications',icon:'🔔',label:'Notifications', roles:['donor','volunteer','ngo_staff','admin'] },
  { path:'profile',      icon:'⊙', label:'Profile',      roles:['donor','volunteer','ngo_staff','admin'] },
];

export default function AppLayout() {
  const { user, logout } = useAuthStore();
  const { notifications, unread, setNotifications } = useNotifStore();
  const navigate  = useNavigate();
  const location  = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const currentPath = location.pathname.split('/app/')[1]?.split('/')[0] || 'dashboard';

  useEffect(() => {
    notifAPI.getAll().then(({ data }) => {
      setNotifications(data.data.notifications, data.data.unread);
    }).catch(() => {});
  }, []);

  // Real-time notifications via socket
  useEffect(() => {
    const { socket } = useAuthStore.getState();
    if (!socket) return;
    socket.on('donation:tracking', (payload) => {
      useNotifStore.getState().addNotification({ _id: Date.now(), type:'pickup', title:'Tracking Update', message: payload.message, isRead:false, createdAt: new Date() });
    });
  }, []);

  const visibleNav = NAV.filter(n => !n.roles || n.roles.includes(user?.role));

  const navItemStyle = (path) => ({
    display:'flex', alignItems:'center', gap:10, padding:'10px 12px', borderRadius:10,
    fontSize:14, fontWeight:500, color: currentPath===path ? 'var(--green)' : 'var(--text-2)',
    background: currentPath===path ? 'var(--green-light)' : 'transparent',
    fontWeight: currentPath===path ? 700 : 500,
    cursor:'pointer', transition:'all 0.15s', width:'100%', border:'none',
    textDecoration:'none'
  });

  const Sidebar = () => (
    <aside style={{ width:'var(--sidebar-w)', background:'white', borderRight:'1px solid var(--border)', display:'flex', flexDirection:'column', flexShrink:0, height:'100vh', overflowY:'auto' }}>
      <div style={{ padding:'20px 20px 14px', display:'flex', alignItems:'center', gap:10, borderBottom:'1px solid var(--border)' }}>
        <div style={{ width:28, height:28, background:'var(--green-light)', borderRadius:8, display:'flex', alignItems:'center', justifyContent:'center', fontSize:14 }}>🌱</div>
        <div style={{ fontSize:16, fontWeight:800 }}>DonateEase</div>
      </div>

      <nav style={{ flex:1, padding:'12px 10px' }}>
        {visibleNav.map(n => (
          <Link key={n.path} to={`/app/${n.path}`} style={navItemStyle(n.path)} onClick={() => setMobileOpen(false)}>
            <span style={{ fontSize:16, width:20, textAlign:'center' }}>{n.icon}</span>
            {n.label}
            {n.path==='notifications' && unread > 0 && (
              <span style={{ marginLeft:'auto', background:'var(--red)', color:'white', borderRadius:99, fontSize:10, fontWeight:700, padding:'1px 6px' }}>{unread}</span>
            )}
          </Link>
        ))}
      </nav>

      <div style={{ padding:'12px 10px', borderTop:'1px solid var(--border)' }}>
        <div style={{ display:'flex', alignItems:'center', gap:10, padding:'10px 12px', marginBottom:4 }}>
          <div style={{ width:32, height:32, background:'var(--green)', borderRadius:8, display:'flex', alignItems:'center', justifyContent:'center', color:'white', fontSize:12, fontWeight:800 }}>
            {(user?.name||'U').split(' ').map(w=>w[0]).join('').slice(0,2).toUpperCase()}
          </div>
          <div><div style={{fontSize:13,fontWeight:700}}>{user?.name}</div><div style={{fontSize:11,color:'var(--text-3)',textTransform:'capitalize'}}>{user?.role?.replace('_',' ')}</div></div>
        </div>
        <button onClick={() => { logout(); navigate('/'); }} style={{ display:'flex', alignItems:'center', gap:8, padding:'9px 12px', borderRadius:8, fontSize:13, color:'var(--text-2)', cursor:'pointer', width:'100%', border:'none', background:'none', fontFamily:'var(--font)', transition:'all 0.15s' }}
          onMouseEnter={e=>{e.currentTarget.style.background='var(--bg)';e.currentTarget.style.color='var(--red)'}} onMouseLeave={e=>{e.currentTarget.style.background='none';e.currentTarget.style.color='var(--text-2)'}}>
          ↪ Logout
        </button>
      </div>
    </aside>
  );

  return (
    <div style={{ display:'flex', height:'100vh', overflow:'hidden' }}>
      {/* Desktop sidebar */}
      <div style={{ display:'none', '@media (min-width: 768px)': { display:'block' } }} className="sidebar-desktop">
        <Sidebar />
      </div>
      <Sidebar />

      {/* Main */}
      <div style={{ flex:1, display:'flex', flexDirection:'column', overflow:'hidden' }}>
        {/* Topbar */}
        <div style={{ height:60, background:'white', borderBottom:'1px solid var(--border)', display:'flex', alignItems:'center', justifyContent:'space-between', padding:'0 24px', flexShrink:0 }}>
          <div style={{ fontSize:18, fontWeight:800, textTransform:'capitalize' }}>
            {currentPath.replace(/-/g,' ') || 'Dashboard'}
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:14 }}>
            <div style={{ display:'flex', alignItems:'center', gap:8, background:'var(--bg)', border:'1px solid var(--border)', borderRadius:50, padding:'8px 14px', width:220 }}>
              <span style={{fontSize:12,color:'var(--text-3)'}}>🔍</span>
              <input placeholder="Search…" style={{ border:'none', background:'transparent', fontFamily:'var(--font)', fontSize:13, outline:'none', flex:1, color:'var(--text)' }}/>
            </div>
            <Link to="/app/notifications" style={{ position:'relative', width:36, height:36, background:'var(--bg)', border:'1px solid var(--border)', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer' }}>
              🔔
              {unread > 0 && <span style={{ position:'absolute', top:-2, right:-2, width:16, height:16, background:'var(--red)', borderRadius:'50%', fontSize:9, fontWeight:700, color:'white', display:'flex', alignItems:'center', justifyContent:'center', border:'2px solid white' }}>{unread>9?'9+':unread}</span>}
            </Link>
            <Link to="/app/profile" style={{ display:'flex', alignItems:'center', gap:8, cursor:'pointer' }}>
              <Avatar name={user?.name||''} size={32} />
              <div style={{ lineHeight:1.2 }}>
                <div style={{fontSize:13,fontWeight:700}}>{user?.name}</div>
                <div style={{fontSize:11,color:'var(--text-3)',textTransform:'capitalize'}}>{user?.role?.replace('_',' ')}</div>
              </div>
            </Link>
          </div>
        </div>

        {/* Page content */}
        <div style={{ flex:1, overflowY:'auto', padding:24 }} className="animate-fadeIn">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
