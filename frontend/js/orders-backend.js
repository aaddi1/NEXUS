(function(){
  const API='http://localhost:5000/api';
  async function req(path,options={}){
    const token=localStorage.getItem('nexus_token');
    const r=await fetch(API+path,{...options,headers:{'Content-Type':'application/json',...(token?{Authorization:`Bearer ${token}`}:{})}});
    const d=await r.json().catch(()=>({}));
    if(!r.ok) throw new Error(d.message||'API request failed');
    return d;
  }
  const moneyFmt=n=>'₹'+Number(n||0).toLocaleString('en-IN',{maximumFractionDigits:0});
  const escHtml=v=>String(v??'').replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
  function statusClass(v){const x=String(v||'').toLowerCase();return x==='delivered'||x==='paid'?'ok':x==='failed'||x==='cancelled'?'danger':x==='processing'||x==='shipped'?'info':'warn'}
  function render(rows){
    const el=document.getElementById('orders-table'); if(!el)return;
    el.innerHTML=`<table class="data-table"><thead><tr><th>Order</th><th>Customer</th><th>Items</th><th>Total</th><th>Payment</th><th>Fulfillment</th><th>Date</th></tr></thead><tbody>${rows.map(o=>{
      const id=o.id??o.order_id??''; const cust=o.customer_name||o.customer||o.cust||'—'; const items=o.item_count??o.items_count??o.items??0; const pay=o.payment_status||o.payment||'pending'; const st=o.status||o.fulfill||'pending'; const date=o.created_at?new Date(o.created_at).toLocaleDateString('en-IN',{day:'2-digit',month:'short',year:'numeric'}):o.date||'—';
      return `<tr data-order-id="${escHtml(id)}"><td><div class="cell-title">#NX-${escHtml(id)}</div></td><td>${escHtml(cust)}</td><td>${escHtml(items)}</td><td>${moneyFmt(o.total)}</td><td><span class="pill ${statusClass(pay)}">${escHtml(String(pay).replace(/_/g,' '))}</span></td><td><span class="pill ${statusClass(st)}">${escHtml(String(st).replace(/_/g,' '))}</span></td><td style="color:var(--text-mid)">${escHtml(date)}</td></tr>`;
    }).join('')}</tbody></table>`;
  }
  async function load(filter='all'){
    try{
      const d=await req('/orders');
      const rows=d.data||d.orders||[];
      render(filter==='all'?rows:rows.filter(o=>String(o.status||o.fulfill||'pending').toLowerCase()===filter));
      window.__NEXUS_ORDERS_ROWS=rows;
      return rows;
    }catch(err){console.error('NEXUS orders load failed:',err);return []}
  }
  window.NexusOrders={load};
  document.addEventListener('DOMContentLoaded',()=>load());
  document.addEventListener('click',e=>{
    const tab=e.target.closest('#orders-chip-tabs .chip-tab');
    if(tab)load(tab.dataset.f||'all');
    const nav=e.target.closest('.nav-item[data-screen="orders"]');
    if(nav)setTimeout(()=>load(),50);
  });
})();
