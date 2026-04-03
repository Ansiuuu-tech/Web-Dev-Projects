// ── DonateItem ─────────────────────────────────────────────
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { donationAPI, ngoAPI } from '../api';
import { useAuthStore } from '../context/authStore';
import { Card, CardHeader, CardBody, Btn, Input, Select, TextArea, SectionHeader } from '../components/UI';

export function DonateItem() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [step,  setStep]  = useState(1);
  const [ngos,  setNgos]  = useState([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    category: 'Clothes', description: '', quantity: 1, condition: 'Good',
    ngo: '', pickupLine1: user?.address?.line1||'', pickupCity: user?.address?.city||'',
    pickupState: user?.address?.state||'', pickupPin: user?.address?.pin||'',
    preferredDay: 'Sun', scheduledDate: '', timeSlot: '10:00 AM - 12:00 PM', zone: 'Zone A', notes: ''
  });
  const set = (k,v) => setForm(f=>({...f,[k]:v}));

  useEffect(() => { ngoAPI.getAll().then(({ data }) => setNgos(data.data.ngos)).catch(() => {}); }, []);

  const handleSubmit = async () => {
    if (!form.description) return toast.error('Please describe your donation');
    setLoading(true);
    try {
      await donationAPI.create({
        item:   { category:form.category, description:form.description, quantity:Number(form.quantity), condition:form.condition, photos:[] },
        pickup: { address:{ line1:form.pickupLine1, city:form.pickupCity, state:form.pickupState, pin:form.pickupPin }, scheduledDate:form.scheduledDate||new Date(Date.now()+2*86400000).toISOString(), timeSlot:form.timeSlot, preferredDay:form.preferredDay, zone:form.zone },
        ngo:    form.ngo || undefined,
        notes:  form.notes
      });
      toast.success('Donation scheduled! 🎉');
      navigate('/app/donations');
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to submit'); }
    finally { setLoading(false); }
  };

  const cats = ['Clothes','Books','Electronics','Toys','Furniture','Kitchenware','Bedding','Appliances','Other'];
  const catIcons = { Clothes:'👕', Books:'📚', Electronics:'💻', Toys:'🎮', Furniture:'🪑', Kitchenware:'🍳', Bedding:'🛏️', Appliances:'📺', Other:'📦' };

  return (
    <div className="animate-fadeUp" style={{ maxWidth:640, margin:'0 auto' }}>
      <SectionHeader title="Donate an Item" subtitle="Schedule a doorstep pickup for your unused items" action={<Btn variant="outline" size="sm" onClick={() => navigate(-1)}>← Back</Btn>} />

      {/* Step indicator */}
      <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:24 }}>
        {['Item Details','Pickup Info','Confirm'].map((s,i) => (
          <React.Fragment key={s}>
            <div style={{ display:'flex', alignItems:'center', gap:6 }}>
              <div style={{ width:24, height:24, borderRadius:'50%', background: step>i ? 'var(--green)' : step===i+1 ? 'var(--green)' : 'var(--border)', color: step>=i+1 ? 'white' : 'var(--text-3)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:11, fontWeight:700 }}>{step>i+1?'✓':i+1}</div>
              <span style={{ fontSize:13, fontWeight: step===i+1 ? 700 : 400, color: step===i+1 ? 'var(--text)' : 'var(--text-3)' }}>{s}</span>
            </div>
            {i<2 && <div style={{ flex:1, height:2, background: step>i+1 ? 'var(--green)' : 'var(--border)' }}/>}
          </React.Fragment>
        ))}
      </div>

      {step === 1 && (
        <Card>
          <CardBody>
            {/* Category */}
            <div style={{ marginBottom:20 }}>
              <div style={{ fontSize:12, fontWeight:600, color:'var(--text-2)', marginBottom:10 }}>Category <span style={{color:'var(--red)'}}>*</span></div>
              <div style={{ display:'flex', gap:10, flexWrap:'wrap' }}>
                {cats.map(c => (
                  <div key={c} onClick={() => set('category',c)} style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:6, cursor:'pointer', width:64 }}>
                    <div style={{ width:52, height:52, borderRadius:14, border:`2px solid`, borderColor: form.category===c ? 'var(--green)' : 'var(--border)', background: form.category===c ? 'var(--green)' : 'white', display:'flex', alignItems:'center', justifyContent:'center', fontSize:22, transition:'all 0.15s' }}>{catIcons[c]}</div>
                    <span style={{ fontSize:10, color: form.category===c ? 'var(--green)' : 'var(--text-3)', fontWeight: form.category===c ? 700 : 400, textAlign:'center' }}>{c}</span>
                  </div>
                ))}
              </div>
            </div>
            <TextArea label="Description *" placeholder="e.g. 5 cotton shirts, size M, slightly used but clean" value={form.description} onChange={e=>set('description',e.target.value)} rows={3} />
            <div style={{ display:'flex', gap:16 }}>
              <div style={{ flex:1 }}>
                <div style={{ fontSize:12, fontWeight:600, color:'var(--text-2)', marginBottom:8 }}>Quantity</div>
                <div style={{ display:'flex', alignItems:'center', gap:16 }}>
                  <button onClick={() => set('quantity',Math.max(1,form.quantity-1))} style={{ width:32, height:32, borderRadius:'50%', border:'1.5px solid var(--border)', background:'white', fontSize:18, cursor:'pointer' }}>−</button>
                  <span style={{ fontSize:20, fontWeight:700, minWidth:24, textAlign:'center' }}>{form.quantity}</span>
                  <button onClick={() => set('quantity',form.quantity+1)} style={{ width:32, height:32, borderRadius:'50%', border:'1.5px solid var(--border)', background:'white', fontSize:18, cursor:'pointer' }}>+</button>
                </div>
              </div>
              <div style={{ flex:1 }}>
                <div style={{ fontSize:12, fontWeight:600, color:'var(--text-2)', marginBottom:8 }}>Condition</div>
                <div style={{ display:'flex', gap:8 }}>
                  {['Like New','Good','Gently Used'].map(c => (
                    <button key={c} onClick={() => set('condition',c)} style={{ padding:'7px 12px', borderRadius:50, border:'1.5px solid', borderColor: form.condition===c ? 'var(--green)' : 'var(--border)', background: form.condition===c ? 'var(--green-light)' : 'white', color: form.condition===c ? 'var(--green)' : 'var(--text-2)', fontSize:12, fontWeight:600, cursor:'pointer', fontFamily:'var(--font)', transition:'all 0.15s' }}>{c}</button>
                  ))}
                </div>
              </div>
            </div>
            {ngos.length > 0 && (
              <Select label="Preferred NGO (Optional)" value={form.ngo} onChange={e=>set('ngo',e.target.value)}
                options={[{value:'',label:'Let DonateEase decide'}, ...ngos.map(n=>({value:n._id,label:n.name}))]} />
            )}
            <Btn size="full" onClick={() => { if(!form.description) return toast.error('Add description'); setStep(2); }}>Continue →</Btn>
          </CardBody>
        </Card>
      )}

      {step === 2 && (
        <Card>
          <CardBody>
            <Input label="Pickup Address" placeholder="House/Flat number, Street" value={form.pickupLine1} onChange={e=>set('pickupLine1',e.target.value)} />
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
              <Input label="City" value={form.pickupCity} onChange={e=>set('pickupCity',e.target.value)} />
              <Input label="PIN Code" value={form.pickupPin} onChange={e=>set('pickupPin',e.target.value)} type="number" />
            </div>
            <div style={{ marginBottom:16 }}>
              <div style={{ fontSize:12, fontWeight:600, color:'var(--text-2)', marginBottom:8 }}>Preferred Day</div>
              <div style={{ display:'flex', gap:8 }}>
                {['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map(d => (
                  <button key={d} onClick={() => set('preferredDay',d)} style={{ padding:'8px 12px', borderRadius:8, border:'1.5px solid', borderColor: form.preferredDay===d ? 'var(--text)' : 'var(--border)', background: form.preferredDay===d ? 'var(--text)' : 'white', color: form.preferredDay===d ? 'white' : 'var(--text-2)', fontSize:12, fontWeight:600, cursor:'pointer', fontFamily:'var(--font)', transition:'all 0.15s' }}>{d}</button>
                ))}
              </div>
            </div>
            <Select label="Preferred Time Slot" value={form.timeSlot} onChange={e=>set('timeSlot',e.target.value)}
              options={['08:00 AM - 10:00 AM','10:00 AM - 12:00 PM','12:00 PM - 02:00 PM','02:00 PM - 04:00 PM','04:00 PM - 06:00 PM'].map(t=>({value:t,label:t}))} />
            <TextArea label="Notes (Optional)" placeholder="Any special instructions…" value={form.notes} onChange={e=>set('notes',e.target.value)} rows={2} />
            <div style={{ display:'flex', gap:10 }}>
              <Btn variant="outline" size="md" onClick={() => setStep(1)}>← Back</Btn>
              <Btn size="full" onClick={() => setStep(3)}>Review →</Btn>
            </div>
          </CardBody>
        </Card>
      )}

      {step === 3 && (
        <Card>
          <CardBody>
            <div style={{ textAlign:'center', padding:'12px 0 20px' }}>
              <div style={{ fontSize:48, marginBottom:8 }}>{catIcons[form.category]}</div>
              <div style={{ fontSize:18, fontWeight:800 }}>Review Your Donation</div>
              <div style={{ fontSize:13, color:'var(--text-2)', marginTop:4 }}>Please confirm the details below</div>
            </div>
            {[['Category',form.category],['Description',form.description],['Quantity',form.quantity+' items'],['Condition',form.condition],['Pickup Address',[form.pickupLine1,form.pickupCity].filter(Boolean).join(', ')],['Preferred Day',form.preferredDay],['Time Slot',form.timeSlot]].map(([k,v]) => (
              <div key={k} style={{ display:'flex', justifyContent:'space-between', padding:'10px 0', borderBottom:'1px solid var(--border)', fontSize:14 }}>
                <span style={{ color:'var(--text-2)', fontWeight:500 }}>{k}</span>
                <span style={{ fontWeight:600 }}>{v}</span>
              </div>
            ))}
            <div style={{ background:'var(--green-light)', border:'1px solid var(--green-mid)', borderRadius:10, padding:14, marginTop:16, fontSize:13, color:'var(--text-2)' }}>
              🔒 Secure pickup. 100% of collected items go to verified NGOs.
            </div>
            <div style={{ display:'flex', gap:10, marginTop:16 }}>
              <Btn variant="outline" size="md" onClick={() => setStep(2)}>← Back</Btn>
              <Btn size="full" onClick={handleSubmit} loading={loading}>Confirm & Schedule Pickup ✓</Btn>
            </div>
          </CardBody>
        </Card>
      )}
    </div>
  );
}

export default DonateItem;
