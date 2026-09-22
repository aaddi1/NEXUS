(function(){
  const API='http://localhost:5000/api';
  const token=()=>localStorage.getItem('nexus_token')||'';
  async function req(path){
    const r=await fetch(API+path,{headers:token()?{Authorization:'Bearer '+token()}: {}});
    const d=await r.json().catch(()=>({}));
    if(!r.ok) throw new Error(d.message||'Dashboard API request failed');
    return d;
  }
  const arr=d=>Array.isArray(d)?d:(d?.data||d?.customers||d?.products||d?.orders||d?.invoices||d?.deals||[]);
  const money=n=>'₹'+Number(n||0).toLocaleString('en-IN',{maximumFractionDigits:0});
  const esc=v=>String(v??'').replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
  const statusClass=v=>{const x=String(v||'').toLowerCase();return x==='delivered'||x==='paid'||x==='closed_won'?'ok':x==='cancelled'||x==='failed'||x==='overdue'?'danger':x==='processing'||x==='shipped'?'info':'warn'};
  function renderKPIsLive(revenue,orders,customers,inventoryValue,lowStock,outstanding){
    const el=document.getElementById('dash-kpis'); if(!el)return;
    el.innerHTML=[
      ['Revenue',money(revenue),'Live from orders',ICO.dollar],
      ['Orders',orders.length.toLocaleString('en-IN'),'All recorded orders',ICO.cart],
      ['Active customers',customers.length.toLocaleString('en-IN'),'Customers in database',ICO.users],
      ['Inventory value',money(inventoryValue),lowStock+' low-stock alert'+(lowStock===1?'':'s'),ICO.layers]
    ].map(k=>`<div class="kpi-card"><div class="kpi-top"><span class="kpi-label">${k[0]}</span><span class="kpi-icon">${k[3]}</span></div><div class="kpi-value">${k[1]}</div><div class="kpi-delta up">● <span class="ctx">${k[2]}</span></div></div>`).join('');
    const sub=document.querySelector('#screen-dashboard .page-head p');
    if(sub)sub.textContent='Live business snapshot from your NEXUS database.';
  }
  function renderRecent(orders){
    const el=document.getElementById('dash-orders-table'); if(!el)return;
    const rows=orders.slice().sort((a,b)=>new Date(b.created_at||0)-new Date(a.created_at||0)).slice(0,5);
    el.innerHTML=`<table class="data-table"><thead><tr><th>Order</th><th>Customer</th><th>Total</th><th>Status</th><th>Date</th></tr></thead><tbody>${rows.map(o=>{
      const id=o.id??o.order_id??''; const cust=o.customer_name||o.customer||'—'; const st=o.status||'pending';
      const date=o.created_at?new Date(o.created_at).toLocaleDateString('en-IN',{day:'2-digit',month:'short'}):'—';
      return `<tr><td><span class="cell-title">#NX-${esc(id)}</span></td><td>${esc(cust)}</td><td>${money(o.total)}</td><td><span class="pill ${statusClass(st)}">${esc(String(st).replace(/_/g,' '))}</span></td><td style="color:var(--text-mid);">${date}</td></tr>`;
    }).join('')||'<tr><td colspan="5" style="text-align:center;color:var(--text-low);padding:28px">No orders yet.</td></tr>'}</tbody></table>`;
  }
  function renderTopProducts(products,inventory){
    const stockMap={}; inventory.forEach(x=>{stockMap[x.product_id]=(stockMap[x.product_id]||0)+Number(x.quantity||0)});
    const ranked=products.map(p=>({p,stock:stockMap[p.id]||0,value:Number(p.price||0)*(stockMap[p.id]||0)})).sort((a,b)=>b.value-a.value).slice(0,5);
    const max=Math.max(...ranked.map(x=>x.value),1); const el=document.getElementById('dash-top-products'); if(!el)return;
    el.innerHTML=ranked.map((x,i)=>`<div class="top-product-row"><div class="rank">${i+1}</div><div style="flex:1;min-width:0"><div class="tp-name">${esc(x.p.name)}</div><div class="tp-meta">${x.stock.toLocaleString('en-IN')} units on hand</div><div class="tp-bar"><div class="tp-fill" style="width:${Math.max(4,Math.round(x.value/max*100))}%"></div></div></div><div class="tp-val">${money(x.value)}</div></div>`).join('')||'<div style="padding:20px;color:var(--text-low)">No products yet.</div>';
  }
  function renderActivity(orders,invoices,deals,inventory){
    const events=[];
    orders.slice().sort((a,b)=>new Date(b.created_at||0)-new Date(a.created_at||0)).slice(0,3).forEach(o=>events.push({time:new Date(o.created_at||Date.now()),text:`Order <b>#NX-${esc(o.id)}</b> was created for ${esc(o.customer_name||'customer')}`}));
    invoices.slice().sort((a,b)=>new Date(b.created_at||0)-new Date(a.created_at||0)).slice(0,1).forEach(v=>events.push({time:new Date(v.created_at||Date.now()),text:`Invoice <b>${esc(v.invoice_number||('INV-'+v.id))}</b> was created`}));
    deals.slice().sort((a,b)=>new Date(b.created_at||0)-new Date(a.created_at||0)).slice(0,1).forEach(d=>events.push({time:new Date(d.created_at||Date.now()),text:`Deal <b>${esc(d.name)}</b> entered the pipeline`}));
    const el=document.getElementById('dash-activity'); if(!el)return;
    events.sort((a,b)=>b.time-a.time); el.innerHTML=events.slice(0,5).map(a=>`<div class="activity-row"><div class="activity-dot"></div><div><div class="activity-text">${a.text}</div><div class="activity-time">${a.time.toLocaleDateString('en-IN',{day:'2-digit',month:'short'})}</div></div></div>`).join('')||'<div style="padding:20px;color:var(--text-low)">No recent activity.</div>';
  }
  function renderTrend(orders){
    const buckets=Array.from({length:12},(_,i)=>{const d=new Date();d.setMonth(d.getMonth()-11+i);return {key:`${d.getFullYear()}-${d.getMonth()}`,value:0,label:d.toLocaleDateString('en-IN',{month:'short'})}});
    orders.forEach(o=>{const d=new Date(o.created_at||0);if(isNaN(d))return;const b=buckets.find(x=>x.key===`${d.getFullYear()}-${d.getMonth()}`);if(b)b.value+=Number(o.total||0)});
    const vals=buckets.map(b=>b.value); const el=document.getElementById('revenue-chart'); if(!el)return;
    if(typeof svgLineChart==='function'){svgLineChart('revenue-chart',vals.length?vals:[0,0,0,0,0,0,0,0,0,0,0,0]);}
    const sub=document.querySelector('#screen-dashboard .panel .sub'); if(sub)sub.textContent='Recorded order revenue · last 12 months';
  }
  async function load(){
    try{
      const [cr,pr,ir,or,ivr,dr]=await Promise.all([req('/customers'),req('/products'),req('/inventory'),req('/orders'),req('/invoices'),req('/deals')]);
      const customers=arr(cr),products=arr(pr),inventory=arr(ir),orders=arr(or),invoices=arr(ivr),deals=arr(dr);
      const revenue=orders.reduce((s,o)=>s+Number(o.total||0),0);
      const inventoryValue=inventory.reduce((s,x)=>{const p=products.find(p=>Number(p.id)===Number(x.product_id));return s+Number(x.quantity||0)*Number(p?.price||0)},0);
      const lowStock=inventory.filter(x=>Number(x.quantity||0)<50).length;
      const outstanding=invoices.filter(x=>!['paid','cancelled'].includes(String(x.status||'').toLowerCase())).reduce((s,x)=>s+Number(x.total||0),0);
      renderKPIsLive(revenue,orders,customers,inventoryValue,lowStock,outstanding);
      renderRecent(orders); renderTopProducts(products,inventory); renderActivity(orders,invoices,deals,inventory); renderTrend(orders);
      window.__NEXUS_DASHBOARD={customers,products,inventory,orders,invoices,deals,revenue,inventoryValue,outstanding};
      console.log('NEXUS dashboard live data loaded');
    }catch(e){console.error('NEXUS dashboard live load failed:',e)}
  }
  window.NexusDashboard={load};
  document.addEventListener('DOMContentLoaded',()=>setTimeout(load,350));
  document.addEventListener('click',e=>{const nav=e.target.closest('.nav-item[data-screen="dashboard"]');if(nav)setTimeout(load,100)});
})();
