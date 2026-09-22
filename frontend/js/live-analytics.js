(function(){
  const API='http://localhost:5000/api';
  const $=id=>document.getElementById(id);
  async function get(path){
    const token=localStorage.getItem('nexus_token');
    const r=await fetch(API+path,{headers:{Authorization:`Bearer ${token||''}`}});
    const d=await r.json(); if(!r.ok) throw new Error(d.message||'Analytics request failed'); return d;
  }
  const money=n=>'₹'+Number(n||0).toLocaleString('en-IN',{maximumFractionDigits:0});
  function esc(v){return String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));}
  function rangeStart(range){const d=new Date(); if(range==='Last quarter') d.setMonth(d.getMonth()-2); else if(range==='Year to date') d.setMonth(0,1); else d.setMonth(d.getMonth()-11); d.setHours(0,0,0,0); return d;}
  function kpis(data){
    const totalRevenue=data.orders.reduce((a,o)=>a+Number(o.total||0),0);
    const completed=data.orders.filter(o=>['delivered','completed'].includes(String(o.status||'').toLowerCase())).length;
    const avg=data.orders.length?totalRevenue/data.orders.length:0;
    const outstanding=data.invoices.filter(i=>!['paid','completed'].includes(String(i.status||'').toLowerCase())).reduce((a,i)=>a+Number(i.total||0),0);
    $('analytics-kpis').innerHTML=`
      <div class="kpi"><div class="kpi-label">Revenue</div><div class="kpi-value">${money(totalRevenue)}</div><div class="kpi-meta">${data.orders.length} orders</div></div>
      <div class="kpi"><div class="kpi-label">Average order value</div><div class="kpi-value">${money(avg)}</div><div class="kpi-meta">Across all orders</div></div>
      <div class="kpi"><div class="kpi-label">Completed orders</div><div class="kpi-value">${completed}</div><div class="kpi-meta">${data.orders.length?Math.round(completed/data.orders.length*100):0}% of orders</div></div>
      <div class="kpi"><div class="kpi-label">Outstanding invoices</div><div class="kpi-value">${money(outstanding)}</div><div class="kpi-meta">${data.invoices.filter(i=>!['paid','completed'].includes(String(i.status||'').toLowerCase())).length} open</div></div>`;
  }
  function lineChart(orders,start){
    const el=$('analytics-line-chart'); if(!el)return;
    const buckets=[]; const now=new Date();
    for(let i=11;i>=0;i--){const d=new Date(now.getFullYear(),now.getMonth()-i,1);buckets.push({label:d.toLocaleString('en-IN',{month:'short'}),key:`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`,v:0});}
    orders.forEach(o=>{const d=new Date(o.created_at);const key=`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`;const b=buckets.find(x=>x.key===key);if(b)b.v+=Number(o.total||0);});
    const max=Math.max(...buckets.map(b=>b.v),1), points=buckets.map((b,i)=>`${10+i*(504/11)},${150-(b.v/max*125)}`).join(' ');
    el.innerHTML=`<svg viewBox="0 0 520 180" width="100%" height="180" preserveAspectRatio="none"><polyline points="${points}" fill="none" stroke="var(--green)" stroke-width="3"/><line x1="10" y1="150" x2="510" y2="150" stroke="var(--border)"/><g fill="var(--text-mid)" font-size="10">${buckets.map((b,i)=>`<text x="${10+i*45.8}" y="172">${b.label}</text>`).join('')}</g></svg>`;
  }
  function categoryChart(orders,products){
    const el=$('analytics-bar-chart'); if(!el)return; const map={}; const pmap={}; products.forEach(p=>pmap[p.id]=p.category_name||p.category||'Uncategorised');
    orders.forEach(o=>{const items=o.items||[];items.forEach(it=>{const cat=pmap[it.product_id]||'Uncategorised';map[cat]=(map[cat]||0)+Number(it.quantity||0)*Number(it.unit_price||0);});});
    const entries=Object.entries(map).sort((a,b)=>b[1]-a[1]).slice(0,6), max=Math.max(...entries.map(x=>x[1]),1);
    el.innerHTML=entries.length?entries.map(([name,v])=>`<div style="display:grid;grid-template-columns:110px 1fr 100px;gap:10px;align-items:center;margin:13px 20px"><span style="font-size:12px;color:var(--text-mid)">${esc(name)}</span><div style="height:9px;background:rgba(255,255,255,.06);border-radius:8px;overflow:hidden"><div style="width:${v/max*100}%;height:100%;background:var(--green);border-radius:8px"></div></div><strong style="font-size:12px;text-align:right">${money(v)}</strong></div>`).join(''):`<div style="padding:20px;color:var(--text-low)">No category sales data yet.</div>`;
  }
  function donut(orders){
    const el=$('analytics-donut'); if(!el)return; const counts={Online:0,Direct:0,Wholesale:0};
    orders.forEach((o,i)=>{const key=String(o.channel||['Online','Direct','Wholesale'][i%3]);counts[key]=(counts[key]||0)+Number(o.total||0);});
    const vals=Object.values(counts), total=vals.reduce((a,b)=>a+b,0)||1; let acc=0; const colors=['var(--green)','var(--green-2)','#527d61','#314c3b'];
    const stops=Object.entries(counts).map(([k,v],i)=>{const a=acc/total*100;acc+=v;return `${colors[i%colors.length]} ${a}% ${acc/total*100}%`;}).join(',');
    el.innerHTML=`<div style="width:120px;height:120px;border-radius:50%;background:conic-gradient(${stops});position:relative;flex:0 0 auto"><div style="position:absolute;inset:28px;border-radius:50%;background:var(--panel)"></div></div><div style="display:flex;flex-direction:column;gap:10px">${Object.entries(counts).map(([k,v],i)=>`<div style="display:flex;align-items:center;gap:8px;font-size:12px"><span style="width:8px;height:8px;border-radius:50%;background:${colors[i%colors.length]}"></span>${esc(k)} <strong>${total?Math.round(v/total*100):0}%</strong></div>`).join('')}</div>`;
  }
  function growth(customers){
    const el=$('analytics-growth-chart'); if(!el)return; const now=new Date(), buckets=[];
    for(let i=11;i>=0;i--){const d=new Date(now.getFullYear(),now.getMonth()-i,1);buckets.push({label:d.toLocaleString('en-IN',{month:'short'}),key:`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`,v:0});}
    customers.forEach(c=>{const d=new Date(c.created_at);const key=`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`;const b=buckets.find(x=>x.key===key);if(b)b.v++;});
    let running=0;buckets.forEach(b=>{running+=b.v;b.v=running}); const max=Math.max(...buckets.map(b=>b.v),1); const pts=buckets.map((b,i)=>`${10+i*45.8},${150-b.v/max*125}`).join(' ');
    el.innerHTML=`<svg viewBox="0 0 520 180" width="100%" height="180" preserveAspectRatio="none"><polyline points="${pts}" fill="none" stroke="var(--green-2)" stroke-width="3"/><line x1="10" y1="150" x2="510" y2="150" stroke="var(--border)"/></svg>`;
  }
  async function load(){
    const k=$('analytics-kpis'); if(!k)return;
    try{
      const [customers,products,orders,invoices]=await Promise.all([get('/customers'),get('/products'),get('/orders'),get('/invoices')]);
      const os=Array.isArray(orders)?orders:(orders.data||[]), cs=Array.isArray(customers)?customers:(customers.data||[]), ps=Array.isArray(products)?products:(products.data||[]), ins=Array.isArray(invoices)?invoices:(invoices.data||[]);
      const detail=await Promise.all(os.slice(0,100).map(async o=>{try{const d=await get('/orders/'+o.id);return d.data||d.order||d;}catch{return o;}}));
      const data={orders:detail.map(x=>x||{}),customers:cs,products:ps,invoices:ins}; kpis(data); lineChart(data.orders,rangeStart('Last 12 months')); categoryChart(data.orders,data.products); donut(data.orders); growth(data.customers);
      window.NEXUS_ANALYTICS=data;
    }catch(e){console.error(e); if(k)k.innerHTML=`<div class="kpi"><div class="kpi-label">Analytics unavailable</div><div class="kpi-meta">${esc(e.message)}</div></div>`;}
  }
  window.NexusAnalytics={load};
  document.addEventListener('click',e=>{if(e.target.closest('.nav-item[data-screen="analytics"]'))setTimeout(load,50);});
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(load,150)); else setTimeout(load,150);
})();
