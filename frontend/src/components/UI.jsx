import React from 'react';

// ── Button ──────────────────────────────────────────────
export const Btn = ({ children, variant='primary', size='md', onClick, disabled, loading, style, type='button', className='' }) => {
  const base = { display:'inline-flex', alignItems:'center', justifyContent:'center', gap:'6px', fontFamily:'var(--font)', fontWeight:700, cursor: disabled||loading ? 'not-allowed' : 'pointer', border:'none', transition:'all 0.2s', whiteSpace:'nowrap', opacity: disabled||loading ? 0.6 : 1 };
  const sizes = { sm:{ padding:'7px 14px', fontSize:'12px', borderRadius:'6px' }, md:{ padding:'10px 20px', fontSize:'13px', borderRadius:'8px' }, lg:{ padding:'14px 28px', fontSize:'14px', borderRadius:'50px' }, full:{ padding:'13px', fontSize:'14px', borderRadius:'50px', width:'100%' } };
  const variants = {
    primary: { background:'var(--green)', color:'white', boxShadow:'none' },
    danger:  { background:'var(--red)', color:'white' },
    outline: { background:'white', color:'var(--text)', border:'1.5px solid var(--border)' },
    ghost:   { background:'transparent', color:'var(--text-2)', padding:'6px 10px' },
    'red-outline': { background:'white', color:'var(--red)', border:'1.5px solid #fca5a5' },
  };
  const hoverMap = { primary:'var(--green-dark)', danger:'#dc2626' };
  return (
    <button type={type} onClick={onClick} disabled={disabled||loading} className={className}
      style={{ ...base, ...sizes[size||'md'], ...variants[variant||'primary'], ...style }}
      onMouseEnter={e => { if (hoverMap[variant]) e.currentTarget.style.background=hoverMap[variant]; if(variant==='outline') e.currentTarget.style.borderColor='var(--text)'; }}
      onMouseLeave={e => { if (hoverMap[variant]) e.currentTarget.style.background=variants[variant]?.background; if(variant==='outline') e.currentTarget.style.borderColor='var(--border)'; }}>
      {loading ? <span className="animate-spin" style={{width:14,height:14,border:'2px solid rgba(255,255,255,0.3)',borderTopColor:'white',borderRadius:'50%',display:'inline-block'}}/> : children}
    </button>
  );
};

// ── Input ───────────────────────────────────────────────
export const Input = ({ label, error, helper, ...props }) => (
  <div style={{ marginBottom: 16 }}>
    {label && <label style={{ display:'block', fontSize:12, fontWeight:600, color:'var(--text-2)', marginBottom:6 }}>{label}</label>}
    <input {...props} style={{ width:'100%', padding:'11px 14px', border:`1.5px solid ${error?'var(--red)':'var(--border)'}`, borderRadius:'var(--radius-sm)', fontFamily:'var(--font)', fontSize:14, color:'var(--text)', outline:'none', background:'white', transition:'border-color 0.2s', ...props.style }}
      onFocus={e => e.target.style.borderColor=error?'var(--red)':'var(--green)'}
      onBlur={e  => e.target.style.borderColor=error?'var(--red)':'var(--border)'} />
    {error  && <p style={{fontSize:12,color:'var(--red)',marginTop:4}}>{error}</p>}
    {helper && <p style={{fontSize:12,color:'var(--text-3)',marginTop:4}}>{helper}</p>}
  </div>
);

// ── Card ────────────────────────────────────────────────
export const Card = ({ children, style, onClick }) => (
  <div onClick={onClick} style={{ background:'white', border:'1px solid var(--border)', borderRadius:'var(--radius)', boxShadow:'var(--shadow-sm)', ...style }}>
    {children}
  </div>
);

export const CardHeader = ({ title, subtitle, action, style }) => (
  <div style={{ padding:'14px 20px', borderBottom:'1px solid var(--border)', display:'flex', alignItems:'center', justifyContent:'space-between', ...style }}>
    <div><div style={{fontSize:15,fontWeight:700}}>{title}</div>{subtitle&&<div style={{fontSize:12,color:'var(--text-3)',marginTop:2}}>{subtitle}</div>}</div>
    {action}
  </div>
);

export const CardBody = ({ children, style }) => (
  <div style={{ padding: 20, ...style }}>{children}</div>
);

// ── Badge ───────────────────────────────────────────────
export const Badge = ({ children, color='green' }) => {
  const colors = { green:{bg:'var(--green-light)',text:'var(--green-dark)'}, amber:{bg:'var(--amber-light)',text:'#92400e'}, red:{bg:'var(--red-light)',text:'var(--red)'}, blue:{bg:'var(--blue-light)',text:'#1d4ed8'}, gray:{bg:'var(--bg)',text:'var(--text-2)',border:'1px solid var(--border)'} };
  const c = colors[color]||colors.green;
  return <span style={{ display:'inline-flex', alignItems:'center', gap:4, padding:'3px 10px', borderRadius:20, fontSize:11, fontWeight:700, background:c.bg, color:c.text, border:c.border||'none' }}>{children}</span>;
};

// ── StatusBadge ─────────────────────────────────────────
export const StatusBadge = ({ status }) => {
  const map = { Requested:{c:'amber',l:'Requested'}, Scheduled:{c:'blue',l:'Scheduled'}, Collected:{c:'green',l:'Collected'}, InTransit:{c:'amber',l:'In Transit'}, Delivered:{c:'green',l:'Delivered'}, Cancelled:{c:'gray',l:'Cancelled'}, Pending:{c:'amber',l:'Pending'} };
  const m = map[status]||{c:'gray',l:status};
  return <Badge color={m.c}>{m.l}</Badge>;
};

// ── Modal ───────────────────────────────────────────────
export const Modal = ({ open, onClose, title, children, width=520 }) => {
  if (!open) return null;
  return (
    <div onClick={e => e.target===e.currentTarget&&onClose()} style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.45)', zIndex:1000, display:'flex', alignItems:'center', justifyContent:'center', padding:20 }} className="animate-fadeIn">
      <div className="animate-fadeUp" style={{ background:'white', borderRadius:20, width:'100%', maxWidth:width, maxHeight:'90vh', overflowY:'auto', position:'relative' }}>
        <div style={{ padding:'20px 24px', borderBottom:'1px solid var(--border)', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <div style={{fontSize:17,fontWeight:800}}>{title}</div>
          <button onClick={onClose} style={{ width:32,height:32,background:'var(--bg)',border:'1px solid var(--border)',borderRadius:8,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',fontSize:16 }}>×</button>
        </div>
        <div style={{ padding: 24 }}>{children}</div>
      </div>
    </div>
  );
};

// ── Spinner ─────────────────────────────────────────────
export const Spinner = ({ size=24, color='var(--green)' }) => (
  <div className="animate-spin" style={{ width:size, height:size, border:`2px solid ${color}30`, borderTopColor:color, borderRadius:'50%', flexShrink:0 }}/>
);

// ── Progress Bar ────────────────────────────────────────
export const ProgressBar = ({ value, color='var(--green)', height=6 }) => (
  <div style={{ background:'var(--border)', borderRadius:99, height, overflow:'hidden' }}>
    <div style={{ width:`${Math.min(100,value||0)}%`, height:'100%', background:color, borderRadius:99, transition:'width 0.6s ease' }}/>
  </div>
);

// ── Empty State ─────────────────────────────────────────
export const Empty = ({ icon='📭', title='No data', subtitle='' }) => (
  <div style={{ textAlign:'center', padding:'48px 20px' }}>
    <div style={{ fontSize:48, marginBottom:12 }}>{icon}</div>
    <div style={{ fontSize:16, fontWeight:700, marginBottom:6 }}>{title}</div>
    {subtitle && <div style={{ fontSize:13, color:'var(--text-3)' }}>{subtitle}</div>}
  </div>
);

// ── Skeleton ────────────────────────────────────────────
export const Skeleton = ({ height=16, width='100%', style }) => (
  <div className="skeleton" style={{ height, width, ...style }} />
);

// ── Avatar ──────────────────────────────────────────────
export const Avatar = ({ name='', src, size=36, style }) => {
  const initials = name.split(' ').map(w=>w[0]).join('').slice(0,2).toUpperCase();
  const colors = ['#18C23A','#3B82F6','#8B5CF6','#F59E0B','#EF4444','#06B6D4'];
  const color  = colors[name.charCodeAt(0) % colors.length];
  return src
    ? <img src={src} alt={name} style={{ width:size, height:size, borderRadius:'50%', objectFit:'cover', ...style }}/>
    : <div style={{ width:size, height:size, borderRadius:'50%', background:color, display:'flex', alignItems:'center', justifyContent:'center', color:'white', fontSize:size*0.35, fontWeight:700, flexShrink:0, ...style }}>{initials||'?'}</div>;
};

// ── Select ──────────────────────────────────────────────
export const Select = ({ label, error, options=[], ...props }) => (
  <div style={{ marginBottom:16 }}>
    {label && <label style={{ display:'block', fontSize:12, fontWeight:600, color:'var(--text-2)', marginBottom:6 }}>{label}</label>}
    <select {...props} style={{ width:'100%', padding:'11px 14px', border:`1.5px solid ${error?'var(--red)':'var(--border)'}`, borderRadius:'var(--radius-sm)', fontFamily:'var(--font)', fontSize:14, color:'var(--text)', outline:'none', background:'white', cursor:'pointer', ...props.style }}>
      {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
    {error && <p style={{fontSize:12,color:'var(--red)',marginTop:4}}>{error}</p>}
  </div>
);

// ── TextArea ────────────────────────────────────────────
export const TextArea = ({ label, error, rows=4, ...props }) => (
  <div style={{ marginBottom:16 }}>
    {label && <label style={{ display:'block', fontSize:12, fontWeight:600, color:'var(--text-2)', marginBottom:6 }}>{label}</label>}
    <textarea {...props} rows={rows} style={{ width:'100%', padding:'11px 14px', border:`1.5px solid ${error?'var(--red)':'var(--border)'}`, borderRadius:'var(--radius-sm)', fontFamily:'var(--font)', fontSize:14, color:'var(--text)', outline:'none', background:'white', resize:'none', transition:'border-color 0.2s', ...props.style }}
      onFocus={e=>e.target.style.borderColor='var(--green)'} onBlur={e=>e.target.style.borderColor='var(--border)'} />
    {error && <p style={{fontSize:12,color:'var(--red)',marginTop:4}}>{error}</p>}
  </div>
);

// ── Info Row ────────────────────────────────────────────
export const InfoRow = ({ icon, label, value }) => (
  <div style={{ display:'flex', alignItems:'flex-start', gap:10, background:'var(--bg)', border:'1px solid var(--border)', borderRadius:10, padding:'12px 14px' }}>
    {icon && <span style={{fontSize:18,flexShrink:0}}>{icon}</span>}
    <div><div style={{fontSize:11,fontWeight:600,textTransform:'uppercase',letterSpacing:'0.06em',color:'var(--text-3)',marginBottom:3}}>{label}</div><div style={{fontSize:14,fontWeight:600}}>{value}</div></div>
  </div>
);

// ── Section Header ──────────────────────────────────────
export const SectionHeader = ({ title, subtitle, action }) => (
  <div style={{ display:'flex', alignItems:'flex-end', justifyContent:'space-between', marginBottom:16 }}>
    <div><div style={{fontSize:16,fontWeight:800}}>{title}</div>{subtitle&&<div style={{fontSize:12,color:'var(--text-3)',marginTop:2}}>{subtitle}</div>}</div>
    {action}
  </div>
);

// ── Stat Card ───────────────────────────────────────────
export const StatCard = ({ icon, iconBg, label, value, change, changeDir='up', loading }) => (
  <Card>
    <CardBody>
      <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:12 }}>
        <div style={{ width:40, height:40, borderRadius:10, background:iconBg||'var(--green-light)', display:'flex', alignItems:'center', justifyContent:'center' }}>{icon}</div>
      </div>
      <div style={{ fontSize:12, color:'var(--text-3)', marginBottom:6 }}>{label}</div>
      {loading ? <Skeleton height={32} width={100} style={{marginBottom:8}}/> : <div style={{ fontSize:28, fontWeight:800, lineHeight:1, marginBottom:8 }}>{value}</div>}
      {change && <Badge color={changeDir==='up'?'green':'red'}>{changeDir==='up'?'↑':'↓'} {change}</Badge>}
    </CardBody>
  </Card>
);
