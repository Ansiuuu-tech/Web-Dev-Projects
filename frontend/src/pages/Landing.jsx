import React from 'react';
import { Link } from 'react-router-dom';

export default function Landing() {
  return (
    <div style={{ fontFamily:'var(--font)' }}>
      {/* Nav */}
      <nav style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'16px 48px', background:'white', borderBottom:'1px solid var(--border)', position:'sticky', top:0, zIndex:100 }}>
        <div style={{ display:'flex', alignItems:'center', gap:8, fontSize:18, fontWeight:800 }}>
          <div style={{ width:32, height:32, background:'var(--green-light)', borderRadius:10, display:'flex', alignItems:'center', justifyContent:'center' }}>🌱</div>
          DonateEase
        </div>
        <div style={{ display:'flex', gap:28 }}>
          {['How it works','For NGOs','For Donors'].map(l => (
            <a key={l} href="#" style={{ color:'var(--text-2)', fontSize:14, fontWeight:500, textDecoration:'none' }}>{l}</a>
          ))}
        </div>
        <Link to="/login" style={{ padding:'10px 22px', background:'var(--green)', color:'white', borderRadius:50, fontSize:13, fontWeight:700, textDecoration:'none' }}>
          NGO's Login
        </Link>
      </nav>

      {/* Hero */}
      <section style={{ minHeight:'calc(100vh - 65px)', background:'linear-gradient(160deg,#f0fdf4,#ecfdf5,#f9fafb)', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', textAlign:'center', padding:'80px 24px' }}>
        <div style={{ width:56, height:56, background:'var(--green-light)', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', marginBottom:24, fontSize:24 }}>❤️</div>
        <h1 style={{ fontSize:'clamp(36px,5vw,56px)', fontWeight:800, lineHeight:1.15, maxWidth:640, marginBottom:20, color:'var(--text)' }}>
          Ready to Multiply Your Impact?
        </h1>
        <p style={{ fontSize:17, color:'var(--text-2)', maxWidth:520, lineHeight:1.7, marginBottom:36 }}>
          Join thousands of NGOs and individual donors already making the world a greener, more compassionate place.
        </p>
        <div style={{ display:'flex', gap:14, flexWrap:'wrap', justifyContent:'center' }}>
          <Link to="/login" style={{ padding:'14px 28px', background:'var(--green)', color:'white', borderRadius:50, fontSize:14, fontWeight:700, textDecoration:'none', boxShadow:'0 4px 20px rgba(24,194,58,0.3)' }}>
            Register Your NGO
          </Link>
          <Link to="/login" style={{ padding:'14px 28px', background:'white', color:'var(--text)', border:'1.5px solid var(--border)', borderRadius:50, fontSize:14, fontWeight:600, textDecoration:'none' }}>
            Start Donating
          </Link>
        </div>
      </section>

      {/* Stats Strip */}
      <div style={{ display:'flex', gap:48, justifyContent:'center', flexWrap:'wrap', padding:'40px 24px', background:'white', borderTop:'1px solid var(--border)', borderBottom:'1px solid var(--border)' }}>
        {[['8,742','Total Donations'],['1,256','Items This Week'],['3,402','Active Donors'],['124','NGO Partners']].map(([v, l]) => (
          <div key={l} style={{ textAlign:'center' }}>
            <div style={{ fontSize:28, fontWeight:800 }}>{v}</div>
            <div style={{ fontSize:13, color:'var(--text-3)', marginTop:2 }}>{l}</div>
          </div>
        ))}
      </div>

      {/* How it works */}
      <section style={{ padding:'80px 48px', maxWidth:1100, margin:'0 auto' }}>
        <div style={{ fontSize:11, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.12em', color:'var(--green)', marginBottom:10 }}>How It Works</div>
        <div style={{ fontSize:32, fontWeight:800, marginBottom:48 }}>Simple, transparent, impactful</div>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(220px,1fr))', gap:24 }}>
          {[
            ['Register Your NGO','Create a verified profile to list your needs and receive donations.'],
            ['List Your Needs','Post specific requests with urgency levels and deadlines.'],
            ['Match with Donors','Our platform connects needs with verified donors.'],
            ['Schedule Pickup','Coordinate pickups with our real-time logistics network.'],
          ].map(([t, d], i) => (
            <div key={t} style={{ background:'white', border:'1px solid var(--border)', borderRadius:16, padding:24, transition:'all 0.2s', cursor:'default' }}
              onMouseEnter={e=>{e.currentTarget.style.transform='translateY(-3px)';e.currentTarget.style.boxShadow='var(--shadow)'}}
              onMouseLeave={e=>{e.currentTarget.style.transform='';e.currentTarget.style.boxShadow=''}}>
              <div style={{ width:36, height:36, background:'var(--green-light)', borderRadius:10, display:'flex', alignItems:'center', justifyContent:'center', fontWeight:800, fontSize:15, color:'var(--green)', marginBottom:14 }}>{i+1}</div>
              <h3 style={{ fontSize:15, fontWeight:700, marginBottom:6 }}>{t}</h3>
              <p style={{ fontSize:13, color:'var(--text-2)', lineHeight:1.6 }}>{d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* For NGOs & Donors */}
      <section style={{ padding:'0 48px 80px', maxWidth:1100, margin:'0 auto', display:'grid', gridTemplateColumns:'1fr 1fr', gap:24 }}>
        {[
          { icon:'🏛️', title:'For NGOs', color:'#ecfdf5', border:'#a8e4b4', points:['Register and get verified','Post item requests with deadlines','Real-time pickup coordination','Analytics dashboard'], cta:'Register NGO' },
          { icon:'❤️', title:'For Donors', color:'#eff6ff', border:'#bfdbfe', points:['Schedule doorstep pickup','Track donations in real time','See your community impact','Support verified NGOs'], cta:'Start Donating' },
        ].map(s => (
          <div key={s.title} style={{ background:s.color, border:`1px solid ${s.border}`, borderRadius:20, padding:32 }}>
            <div style={{ fontSize:32, marginBottom:14 }}>{s.icon}</div>
            <div style={{ fontSize:22, fontWeight:800, marginBottom:14 }}>{s.title}</div>
            <ul style={{ listStyle:'none', display:'flex', flexDirection:'column', gap:10, marginBottom:24 }}>
              {s.points.map(p => (
                <li key={p} style={{ display:'flex', alignItems:'center', gap:10, fontSize:14, color:'var(--text-2)' }}>
                  <span style={{ color:'var(--green)', fontWeight:700 }}>✓</span> {p}
                </li>
              ))}
            </ul>
            <Link to="/login" style={{ padding:'12px 24px', background:'var(--green)', color:'white', borderRadius:50, fontSize:13, fontWeight:700, textDecoration:'none', display:'inline-block' }}>
              {s.cta} →
            </Link>
          </div>
        ))}
      </section>

      {/* CTA */}
      <section style={{ background:'var(--green-light)', borderTop:'1px solid var(--green-mid)', padding:'80px 24px', textAlign:'center' }}>
        <div style={{ width:52, height:52, background:'white', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 20px', fontSize:22 }}>❤️</div>
        <h2 style={{ fontSize:36, fontWeight:800, marginBottom:14 }}>Ready to Multiply Your Impact?</h2>
        <p style={{ fontSize:16, color:'var(--text-2)', maxWidth:500, margin:'0 auto 32px', lineHeight:1.6 }}>
          Join thousands of NGOs and individual donors already making the world a greener place.
        </p>
        <div style={{ display:'flex', gap:14, justifyContent:'center' }}>
          <Link to="/login" style={{ padding:'14px 28px', background:'var(--green)', color:'white', borderRadius:50, fontSize:14, fontWeight:700, textDecoration:'none' }}>Register Your NGO</Link>
          <Link to="/login" style={{ padding:'14px 28px', background:'white', color:'var(--text)', border:'1.5px solid var(--border)', borderRadius:50, fontSize:14, fontWeight:600, textDecoration:'none' }}>Start Donating</Link>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ background:'white', borderTop:'1px solid var(--border)', padding:'48px' }}>
        <div style={{ maxWidth:1100, margin:'0 auto', display:'grid', gridTemplateColumns:'2fr 1fr 1fr 1fr', gap:40 }}>
          <div>
            <div style={{ display:'flex', alignItems:'center', gap:8, fontSize:16, fontWeight:800, color:'var(--green)', marginBottom:12 }}>
              🌱 DonateEase
            </div>
            <p style={{ fontSize:13, color:'var(--text-2)', lineHeight:1.6, maxWidth:240 }}>
              Streamlining household donations and connecting NGOs with donors for a more sustainable future.
            </p>
            <div style={{ display:'flex', gap:10, marginTop:16 }}>
              {['f','t','ig','in'].map(s => (
                <a key={s} href="#" style={{ width:32, height:32, background:'var(--bg)', borderRadius:8, display:'flex', alignItems:'center', justifyContent:'center', color:'var(--text-2)', textDecoration:'none', fontSize:13 }}>{s}</a>
              ))}
            </div>
          </div>
          {[
            ['Platform', ['How it works','For NGOs','For Donors','Marketplace']],
            ['Company',  ['About Us','Our Impact','Contact']],
            ['Contact',  ['support@donateease.org','+1 (555) 000-GREEN','123 Eco Way, City']],
          ].map(([title, items]) => (
            <div key={title}>
              <h4 style={{ fontSize:13, fontWeight:700, marginBottom:14 }}>{title}</h4>
              <ul style={{ listStyle:'none', display:'flex', flexDirection:'column', gap:10 }}>
                {items.map(item => (
                  <li key={item}><a href="#" style={{ fontSize:13, color:'var(--text-2)', textDecoration:'none' }}>{item}</a></li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </footer>
      <div style={{ background:'white', borderTop:'1px solid var(--border)', padding:'14px 48px', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
        <span style={{ fontSize:12, color:'var(--text-3)' }}>© 2026 DonateEase. All rights reserved.</span>
        <div style={{ display:'flex', gap:20 }}>
          {['Privacy Policy','Terms of Service','Cookie Policy'].map(t => (
            <a key={t} href="#" style={{ fontSize:12, color:'var(--text-3)', textDecoration:'none' }}>{t}</a>
          ))}
        </div>
      </div>
    </div>
  );
}
