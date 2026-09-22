/* =========================================================
   DATA
========================================================= */
const money = n => '₹' + n.toLocaleString('en-IN', {maximumFractionDigits:0});
const initials = name => name.split(' ').map(w=>w[0]).slice(0,2).join('').toUpperCase();
const avatarColors = ['#2FA766','#7CA653','#5B9FE8','#E8A93B','#E5584A','#B27CE8'];
const colorFor = seed => avatarColors[seed % avatarColors.length];

const products = [
  {name:'Alphonso Mango Crate', sku:'PRD-1042', cat:'Produce', price:3192, stock:212, status:'ok'},
  {name:'Filter Coffee Concentrate', sku:'PRD-2231', cat:'Beverages', price:2016, stock:34, status:'warn'},
  {name:'Multigrain Atta Bread', sku:'PRD-0087', cat:'Bakery', price:546.0, stock:0, status:'danger'},
  {name:'Organic Honey Jar 500g', sku:'PRD-3390', cat:'Packaged goods', price:1083.6, stock:388, status:'ok'},
  {name:'Nimbu Soda Bottle', sku:'PRD-2245', cat:'Beverages', price:268.8, stock:940, status:'ok'},
  {name:'Kaju Badam Mix', sku:'PRD-4110', cat:'Packaged goods', price:819.0, stock:58, status:'warn'},
  {name:'Desi Tamatar Box', sku:'PRD-1077', cat:'Produce', price:1218.0, stock:126, status:'ok'},
  {name:'Dark Chocolate Bar 70%', sku:'PRD-5502', cat:'Packaged goods', price:453.6, stock:0, status:'danger'},
];
const statusMeta = {ok:['In stock','ok'], warn:['Low stock','warn'], danger:['Out of stock','danger']};

const customersData = [
  {name:'Riya Mehta', email:'riya@aaravorganics.in', seg:'VIP', orders:58, ltv:4048800, last:'Sep 7'},
  {name:'Arjun Verma', email:'arjun@bharatbrew.in', seg:'Standard', orders:14, ltv:766080, last:'Sep 5'},
  {name:'Priya Nair', email:'priya@chaijunction.in', seg:'VIP', orders:71, ltv:5334000, last:'Sep 9'},
  {name:'Vivek Malhotra', email:'vivek@masalaandmore.in', seg:'New', orders:2, ltv:53760, last:'Sep 8'},
  {name:'Kavya Singh', email:'kavya@shreebakers.in', seg:'Standard', orders:22, ltv:1293600, last:'Sep 2'},
  {name:'Rahul Kapoor', email:'rahul@desigoods.in', seg:'Standard', orders:9, ltv:428400, last:'Aug 30'},
  {name:'Neha Sharma', email:'neha@suryfoods.in', seg:'New', orders:1, ltv:18480, last:'Sep 9'},
];
const segMeta = {VIP:'warn', Standard:'info', New:'ok'};

const ordersData = [
  {id:'#NX-8841', cust:'Riya Mehta', items:4, total:51408, pay:'ok', fulfill:'delivered', date:'Sep 9'},
  {id:'#NX-8840', cust:'Priya Nair', items:2, total:23856, pay:'ok', fulfill:'shipped', date:'Sep 9'},
  {id:'#NX-8839', cust:'Vivek Malhotra', items:1, total:5376, pay:'warn', fulfill:'pending', date:'Sep 8'},
  {id:'#NX-8838', cust:'Rahul Kapoor', items:6, total:79632, pay:'ok', fulfill:'processing', date:'Sep 8'},
  {id:'#NX-8837', cust:'Kavya Singh', items:3, total:34440, pay:'ok', fulfill:'delivered', date:'Sep 7'},
  {id:'#NX-8836', cust:'Neha Sharma', items:1, total:3192, pay:'danger', fulfill:'pending', date:'Sep 7'},
  {id:'#NX-8835', cust:'Arjun Verma', items:5, total:60648, pay:'ok', fulfill:'shipped', date:'Sep 6'},
];
const fulfillMeta = {delivered:'ok', shipped:'info', processing:'warn', pending:'neutral', cancelled:'danger'};
const payMeta = {ok:['Paid','ok'], warn:['Pending','warn'], danger:['Failed','danger']};

const invoicesData = [
  {num:'INV-3021', cust:'Riya Mehta', issue:'Aug 12', due:'Sep 11', amount:404880, status:'ok'},
  {num:'INV-3022', cust:'Priya Nair', issue:'Aug 20', due:'Sep 19', amount:108360, status:'ok'},
  {num:'INV-3018', cust:'Rahul Kapoor', issue:'Jul 30', due:'Aug 29', amount:221760, status:'danger'},
  {num:'INV-3025', cust:'Kavya Singh', issue:'Sep 1', due:'Oct 1', amount:78120, status:'warn'},
  {num:'INV-3026', cust:'Arjun Verma', issue:'Sep 5', due:'Oct 5', amount:261240, status:'neutral'},
  {num:'INV-3019', cust:'Vivek Malhotra', issue:'Aug 2', due:'Sep 1', amount:34440, status:'danger'},
];
const invStatusMeta = {ok:'Paid', warn:'Due soon', danger:'Overdue', neutral:'Draft'};

const dealsData = [
  {name:'Q4 restock — Aarav', acct:'Aarav Organics', stage:'Negotiation', value:1528800, owner:'Riya M.', close:'Sep 22'},
  {name:'Annual supply — Bharat Brew', acct:'Bharat Brew Co.', stage:'Proposal', value:789600, owner:'Ben W.', close:'Sep 28'},
  {name:'New account — Masala & More', acct:'Masala & More', stage:'Discovery', value:436800, owner:'Priya R.', close:'Oct 4'},
  {name:'Renewal — Chai Junction', acct:'Chai Junction', stage:'Closed won', value:1915200, owner:'David O.', close:'Sep 3'},
  {name:'Expansion — Shree Bakers', acct:'Shree Bakers', stage:'Negotiation', value:1184400, owner:'Kavya S.', close:'Sep 25'},
];
const stageMeta = {'Discovery':'neutral','Proposal':'info','Negotiation':'warn','Closed won':'ok'};

const inventoryData = [
  {name:'Alphonso Mango Crate', loc:'Mumbai — WH1', onhand:212, reserved:40, avail:172, reorder:80, pct:82},
  {name:'Filter Coffee Concentrate', loc:'Delhi — WH2', onhand:34, reserved:12, avail:22, reorder:50, pct:24},
  {name:'Nimbu Soda Bottle', loc:'Mumbai — WH1', onhand:940, reserved:120, avail:820, reorder:200, pct:94},
  {name:'Organic Honey Jar 500g', loc:'Bengaluru — WH3', onhand:388, reserved:30, avail:358, reorder:100, pct:88},
  {name:'Kaju Badam Mix', loc:'Delhi — WH2', onhand:58, reserved:8, avail:50, reorder:70, pct:31},
  {name:'Desi Tamatar Box', loc:'Mumbai — WH1', onhand:126, reserved:20, avail:106, reorder:60, pct:64},
];

const teamData = [
  {name:'Aryan Sharma', email:'aryan@nexus.com', role:'Owner'},
  {name:'Riya Mehta', email:'riya@nexus.com', role:'Sales Lead'},
  {name:'Rahul Kapoor', email:'rahul@nexus.com', role:'Inventory Manager'},
  {name:'Arjun Verma', email:'arjun@nexus.com', role:'Finance Lead'},
  {name:'Priya Nair', email:'priya@nexus.com', role:'Sales'},
];

/* =========================================================
   RENDER HELPERS
========================================================= */
function pillHtml(text, type){ return `<span class="pill pill--${type}">${text}</span>`; }
function avatarHtml(name, size){
  const c = colorFor(name.charCodeAt(0)+name.length);
  const cls = size==='sm' ? 'avatar-sm' : 'avatar-sm';
  return `<div class="${cls}" style="background:${c};color:#160B04;">${initials(name)}</div>`;
}

function renderKPIs(containerId, items){
  document.getElementById(containerId).innerHTML = items.map(k => `
    <div class="kpi-card">
      <div class="kpi-top"><span class="kpi-label">${k.label}</span><span class="kpi-icon">${k.icon}</span></div>
      <div class="kpi-value">${k.value}</div>
      <div class="kpi-delta ${k.dir}">${k.dir==='up'?'▲':'▼'} ${k.delta}<span class="ctx">${k.ctx}</span></div>
    </div>`).join('');
}
const ICO = {
  dollar:'<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 2v20M17 6.5c0-2-2.2-3-5-3s-5 1.2-5 3.2S9.2 10 12 10s5 1 5 3.3-2.2 3.2-5 3.2-5-1-5-3"/></svg>',
  cart:'<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="9" cy="20" r="1.4"/><circle cx="18" cy="20" r="1.4"/><path d="M2.5 3h2l2.8 12.6A2 2 0 009.2 17h8.9a2 2 0 002-1.6L21.5 8H6"/></svg>',
  users:'<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="9" cy="8" r="3.2"/><path d="M2.5 20c0-4 3-6.5 6.5-6.5s6.5 2.5 6.5 6.5"/><circle cx="18" cy="8.5" r="2.4"/><path d="M15.6 13.6c2.9.3 5.4 2.6 5.4 6.4"/></svg>',
  box:'<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M21 8l-9-5-9 5 9 5 9-5z"/><path d="M3 8v8l9 5 9-5V8M12 13v8"/></svg>',
  layers:'<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="3" width="18" height="6" rx="1.2"/><rect x="3" y="10.5" width="18" height="6" rx="1.2"/><rect x="3" y="18" width="18" height="3" rx="1"/></svg>',
  alert:'<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 3l10 18H2z"/><path d="M12 10v4M12 17.5h.01"/></svg>',
  file:'<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M7 3h8l4 4v14a1 1 0 01-1 1H7a1 1 0 01-1-1V4a1 1 0 011-1z"/></svg>',
  clock:'<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3.5 2"/></svg>',
  target:'<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="3.4"/></svg>',
};

renderKPIs('dash-kpis', [
  {label:'Revenue', value:money(482900), dir:'up', delta:'12.4%', ctx:'vs last month', icon:ICO.dollar},
  {label:'Orders', value:'3,214', dir:'up', delta:'4.1%', ctx:'vs last month', icon:ICO.cart},
  {label:'Active customers', value:'1,082', dir:'up', delta:'2.8%', ctx:'vs last month', icon:ICO.users},
  {label:'Inventory value', value:money(1240000), dir:'down', delta:'1.6%', ctx:'vs last month', icon:ICO.layers},
]);
renderKPIs('sales-kpis', [
  {label:'Total sales', value:money(184200), dir:'up', delta:'9.2%', ctx:'this quarter', icon:ICO.dollar},
  {label:'Avg order value', value:money(11900), dir:'up', delta:'3.4%', ctx:'this quarter', icon:ICO.target},
  {label:'Conversion rate', value:'4.8%', dir:'down', delta:'0.6%', ctx:'this quarter', icon:ICO.cart},
  {label:'New deals', value:'32', dir:'up', delta:'6', ctx:'this quarter', icon:ICO.users},
]);
renderKPIs('inventory-kpis', [
  {label:'Total SKUs', value:'48', dir:'up', delta:'3', ctx:'this month', icon:ICO.box},
  {label:'Warehouses', value:'4', dir:'up', delta:'0', ctx:'no change', icon:ICO.layers},
  {label:'Low-stock alerts', value:'6', dir:'up', delta:'2', ctx:'this week', icon:ICO.alert},
  {label:'Stock value', value:money(1240000), dir:'down', delta:'1.6%', ctx:'this month', icon:ICO.dollar},
]);
renderKPIs('invoice-kpis', [
  {label:'Outstanding', value:money(24800), dir:'up', delta:'5.1%', ctx:'this month', icon:ICO.file},
  {label:'Overdue', value:money(3050), dir:'up', delta:'2', ctx:'invoices', icon:ICO.alert},
  {label:'Paid this month', value:money(61200), dir:'up', delta:'14%', ctx:'vs last month', icon:ICO.dollar},
  {label:'Drafts', value:'5', dir:'up', delta:'1', ctx:'this week', icon:ICO.clock},
]);
renderKPIs('analytics-kpis', [
  {label:'Revenue', value:money(482900), dir:'up', delta:'12.4%', ctx:'vs last month', icon:ICO.dollar},
  {label:'Gross margin', value:'38.6%', dir:'up', delta:'1.1%', ctx:'vs last month', icon:ICO.target},
  {label:'Repeat purchase rate', value:'61%', dir:'up', delta:'3.2%', ctx:'vs last month', icon:ICO.users},
  {label:'Churned accounts', value:'9', dir:'down', delta:'2', ctx:'vs last month', icon:ICO.alert},
]);

/* dashboard tables */
document.getElementById('dash-orders-table').innerHTML = `
<table class="data-table"><thead><tr><th>Order</th><th>Customer</th><th>Total</th><th>Status</th><th>Date</th></tr></thead><tbody>
${ordersData.slice(0,5).map(o=>`<tr><td><span class="cell-title">${o.id}</span></td><td>${o.cust}</td><td>${money(o.total)}</td><td>${pillHtml(o.fulfill[0].toUpperCase()+o.fulfill.slice(1), fulfillMeta[o.fulfill])}</td><td style="color:var(--text-mid);">${o.date}</td></tr>`).join('')}
</tbody></table>`;

const topProducts = [
  {name:'Alphonso Mango Crate', units:1240, rev:47200, pct:92},
  {name:'Nimbu Soda Bottle', units:3040, rev:9700, pct:71},
  {name:'Organic Honey Jar 500g', units:980, rev:12600, pct:64},
  {name:'Desi Tamatar Box', units:610, rev:8800, pct:48},
  {name:'Filter Coffee Concentrate', units:410, rev:9800, pct:38},
];
document.getElementById('dash-top-products').innerHTML = topProducts.map((p,i)=>`
  <div class="top-product-row">
    <div class="rank">${i+1}</div>
    <div style="flex:1;min-width:0;">
      <div class="tp-name">${p.name}</div>
      <div class="tp-meta">${p.units.toLocaleString()} units sold</div>
      <div class="tp-bar"><div class="tp-fill" style="width:${p.pct}%;"></div></div>
    </div>
    <div class="tp-val">${money(p.rev)}</div>
  </div>`).join('');

const activity = [
  {t:'Order <b>#NX-8841</b> was delivered to Riya Mehta', when:'12 min ago'},
  {t:'Stock for <b>Filter Coffee Concentrate</b> fell below reorder point', when:'48 min ago'},
  {t:'Invoice <b>INV-3022</b> was paid by Priya Nair', when:'1h ago'},
  {t:'New customer <b>Neha Sharma</b> placed a first order', when:'3h ago'},
  {t:'Deal <b>Renewal — Chai Junction</b> marked closed won', when:'5h ago'},
];
document.getElementById('dash-activity').innerHTML = activity.map(a=>`
  <div class="activity-row"><div class="activity-dot"></div><div><div class="activity-text">${a.t}</div><div class="activity-time">${a.when}</div></div></div>`).join('');

/* sales table */
document.getElementById('sales-table').innerHTML = `
<table class="data-table"><thead><tr><th>Deal</th><th>Account</th><th>Stage</th><th>Value</th><th>Owner</th><th>Close date</th></tr></thead><tbody>
${dealsData.map(d=>`<tr><td><span class="cell-title">${d.name}</span></td><td>${d.acct}</td><td>${pillHtml(d.stage, stageMeta[d.stage])}</td><td>${money(d.value)}</td><td>${d.owner}</td><td style="color:var(--text-mid);">${d.close}</td></tr>`).join('')}
</tbody></table>`;

document.getElementById('pipeline-stage').innerHTML = ['Discovery','Proposal','Negotiation','Closed won'].map(s=>{
  const items = dealsData.filter(d=>d.stage===s);
  const total = items.reduce((a,d)=>a+d.value,0);
  const pct = Math.round(total/70000*100);
  return `<div class="top-product-row"><div style="flex:1;"><div class="tp-name">${s}</div><div class="tp-meta">${items.length} deals</div><div class="tp-bar"><div class="tp-fill" style="width:${Math.min(pct,100)}%;"></div></div></div><div class="tp-val">${money(total)}</div></div>`;
}).join('');

const NX_PHOTOS={"Aryan Sharma":"https://i.pravatar.cc/160?img=12","Riya Mehta":"https://i.pravatar.cc/160?img=47","Arjun Verma":"https://i.pravatar.cc/160?img=11","Priya Nair":"https://i.pravatar.cc/160?img=44","Vivek Malhotra":"https://i.pravatar.cc/160?img=68","Kavya Singh":"https://i.pravatar.cc/160?img=32","Rahul Kapoor":"https://i.pravatar.cc/160?img=53","Neha Sharma":"https://i.pravatar.cc/160?img=49","Alphonso Mango Crate":"https://images.unsplash.com/photo-1605027990121-cbae9e0642df?w=160&q=80","Filter Coffee Concentrate":"https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=160&q=80","Multigrain Atta Bread":"https://images.unsplash.com/photo-1509440159596-0249088772ff?w=160&q=80","Organic Honey Jar 500g":"https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=160&q=80","Nimbu Soda Bottle":"https://images.unsplash.com/photo-1554866585-cd94860890b7?w=160&q=80","Kaju Badam Mix":"https://images.unsplash.com/photo-1599599810769-bcde5a160d32?w=160&q=80","Desi Tamatar Box":"https://images.unsplash.com/photo-1546094096-0df4bcaaa337?w=160&q=80","Dark Chocolate Bar 70%":"https://images.unsplash.com/photo-1575377427642-087cf684f04b?w=160&q=80"};
const nxPhoto=(name)=>NX_PHOTOS[String(name).trim()]||`https://i.pravatar.cc/160?u=${encodeURIComponent(name)}`;

/* products table */
document.getElementById('products-table').innerHTML = `
<table class="data-table"><thead><tr><th>Product</th><th>Category</th><th>Price</th><th>Stock</th><th>Status</th><th>Updated</th></tr></thead><tbody>
${products.map((p,i)=>{
  const [label,type]=statusMeta[p.status];
  return `<tr><td><div class="cell-main"><img class="nx-product-thumb" src="${nxPhoto(p.name)}" alt=""><div><div class="cell-title">${p.name}</div><div class="cell-sub">${p.sku}</div></div></div></td><td>${p.cat}</td><td>${money(p.price)}</td><td>${p.stock}</td><td>${pillHtml(label,type)}</td><td style="color:var(--text-mid);">Sep ${2+i}</td></tr>`;
}).join('')}
</tbody></table>`;

/* inventory table */
document.getElementById('inventory-table').innerHTML = `
<table class="data-table"><thead><tr><th>Product</th><th>Location</th><th>On hand</th><th>Reserved</th><th>Available</th><th>Reorder pt.</th><th>Stock level</th></tr></thead><tbody>
${inventoryData.map(i=>`<tr><td><span class="cell-title">${i.name}</span></td><td>${i.loc}</td><td>${i.onhand}</td><td>${i.reserved}</td><td>${i.avail}</td><td style="color:var(--text-mid);">${i.reorder}</td><td><div class="progress-track"><div class="progress-fill" style="width:${i.pct}%;background:${i.pct<35?'linear-gradient(90deg,#E5584A,#E8A93B)':'linear-gradient(90deg,var(--mango-1),var(--mango-gold))'};"></div></div></td></tr>`).join('')}
</tbody></table>`;

/* customers table */
document.getElementById('customers-table').innerHTML = `
<div style="padding:32px;text-align:center;color:var(--text-mid);">
  Loading customers from PostgreSQL…
</div>`;

/* orders table (filterable) */
function renderOrders(filter){
  const rows = ordersData.filter(o=>filter==='all' || o.fulfill===filter);
  const [payLabel] = [null];
  document.getElementById('orders-table').innerHTML = `
  <table class="data-table"><thead><tr><th>Order</th><th>Customer</th><th>Items</th><th>Total</th><th>Payment</th><th>Fulfillment</th><th>Date</th></tr></thead><tbody>
  ${rows.map(o=>{const p=payMeta[o.pay];return `<tr><td><span class="cell-title">${o.id}</span></td><td>${o.cust}</td><td>${o.items}</td><td>${money(o.total)}</td><td>${pillHtml(p[0],p[1])}</td><td>${pillHtml(o.fulfill[0].toUpperCase()+o.fulfill.slice(1), fulfillMeta[o.fulfill])}</td><td style="color:var(--text-mid);">${o.date}</td></tr>`;}).join('') || '<tr><td colspan="7" style="text-align:center;color:var(--text-low);padding:30px;">No orders match this filter.</td></tr>'}
  </tbody></table>`;
}
renderOrders('all');
document.querySelectorAll('#orders-chip-tabs .chip-tab').forEach(tab=>{
  tab.addEventListener('click', ()=>{
    document.querySelectorAll('#orders-chip-tabs .chip-tab').forEach(t=>t.classList.remove('active'));
    tab.classList.add('active');
    renderOrders(tab.dataset.f);
  });
});

/* invoices table */
document.getElementById('invoices-table').innerHTML = `
<table class="data-table"><thead><tr><th>Invoice</th><th>Customer</th><th>Issued</th><th>Due</th><th>Amount</th><th>Status</th></tr></thead><tbody>
${invoicesData.map(v=>`<tr><td><span class="cell-title">${v.num}</span></td><td>${v.cust}</td><td style="color:var(--text-mid);">${v.issue}</td><td style="color:var(--text-mid);">${v.due}</td><td>${money(v.amount)}</td><td>${pillHtml(invStatusMeta[v.status], v.status)}</td></tr>`).join('')}
</tbody></table>`;

/* team table */
document.getElementById('team-table').innerHTML = `
<table class="data-table"><thead><tr><th>Member</th><th>Role</th><th></th></tr></thead><tbody>
${teamData.map(t=>`<tr><td><div class="cell-main">${avatarHtml(t.name)}<div><div class="cell-title">${t.name}</div><div class="cell-sub">${t.email}</div></div></div></td><td><select class="select-filter" style="padding:6px 10px;"><option ${t.role==='Owner'?'selected':''}>Owner</option><option ${t.role!=='Owner'?'selected':''}>${t.role}</option><option>Member</option></select></td><td><button class="btn btn-ghost btn-sm">Remove</button></td></tr>`).join('')}
</tbody></table>`;

/* =========================================================
   SVG CHARTS
========================================================= */
function svgLineChart(containerId, values, opts={}){
  const w=560,h=150,pad=8;
  const max=Math.max(...values), min=Math.min(...values);
  const range=(max-min)||1;
  const step=(w-pad*2)/(values.length-1);
  const pts = values.map((v,i)=>[pad+i*step, h-pad-((v-min)/range)*(h-pad*2)]);
  const path = pts.map((p,i)=>(i===0?'M':'L')+p[0].toFixed(1)+','+p[1].toFixed(1)).join(' ');
  const area = path + ` L${pts[pts.length-1][0].toFixed(1)},${h-pad} L${pts[0][0].toFixed(1)},${h-pad} Z`;
  const gid = 'g'+containerId;
  document.getElementById(containerId).innerHTML = `
  <svg viewBox="0 0 ${w} ${h}" class="mini-chart" style="height:170px;overflow:visible;">
    <defs><linearGradient id="${gid}" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#2FA766" stop-opacity="0.35"/>
      <stop offset="100%" stop-color="#2FA766" stop-opacity="0"/>
    </linearGradient></defs>
    <path d="${area}" fill="url(#${gid})"/>
    <path d="${path}" fill="none" stroke="#2FA766" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>
    ${pts.map((p,i)=> i===pts.length-1 ? `<circle cx="${p[0]}" cy="${p[1]}" r="4" fill="#2FA766" stroke="#12171D" stroke-width="2"/>` : '').join('')}
  </svg>`;
}
svgLineChart('revenue-chart', [312,338,301,355,362,340,378,395,371,410,428,441]);
svgLineChart('analytics-line-chart', [312,338,301,355,362,340,378,395,371,410,428,441]);

function barChart(containerId, labels, values, max){
  max = max || Math.max(...values)*1.15;
  document.getElementById(containerId).innerHTML = labels.map((l,i)=>`
    <div class="bar-col"><div class="bar-shape" style="height:${Math.max(6,(values[i]/max)*150)}px;"></div><div class="bar-tick">${l}</div></div>`).join('');
}
barChart('sales-bar-chart', ['Apr','May','Jun','Jul','Aug','Sep'], [128,142,131,158,171,184]);
barChart('analytics-bar-chart', ['Produce','Bev.','Bakery','Packaged'], [182,124,64,210]);

function growthChart(containerId){
  const w=520,h=150,pad=8;
  const nw=[8,10,14,12,17,20,22,19,24,27,25,29], rt=[20,22,21,25,27,26,30,32,31,35,37,39];
  function toPath(vals,maxv){const step=(w-pad*2)/(vals.length-1);return vals.map((v,i)=>[pad+i*step,h-pad-(v/maxv)*(h-pad*2)]).map((p,i)=>(i===0?'M':'L')+p[0].toFixed(1)+','+p[1].toFixed(1)).join(' ');}
  const maxv = Math.max(...rt)*1.15;
  document.getElementById(containerId).innerHTML = `
  <svg viewBox="0 0 ${w} ${h}" style="width:100%;height:170px;overflow:visible;">
    <path d="${toPath(rt,maxv)}" fill="none" stroke="#7CA653" stroke-width="2.2" stroke-linecap="round"/>
    <path d="${toPath(nw,maxv)}" fill="none" stroke="#2FA766" stroke-width="2.2" stroke-linecap="round"/>
  </svg>
  <div class="chart-legend"><div class="legend-item"><span class="legend-dot" style="background:#2FA766;"></span>New customers</div><div class="legend-item"><span class="legend-dot" style="background:#7CA653;"></span>Returning customers</div></div>`;
}
growthChart('analytics-growth-chart');

function donutChart(containerId, segments){
  const size=140, r=52, cx=70, cy=70, circumference=2*Math.PI*r;
  let offset=0;
  const total = segments.reduce((a,s)=>a+s.value,0);
  const arcs = segments.map(s=>{
    const frac = s.value/total;
    const len = frac*circumference;
    const dash = `${len} ${circumference-len}`;
    const el = `<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${s.color}" stroke-width="16" stroke-dasharray="${dash}" stroke-dashoffset="${-offset}" transform="rotate(-90 ${cx} ${cy})"/>`;
    offset += len;
    return el;
  }).join('');
  document.getElementById(containerId).innerHTML = `
  <svg width="${size}" height="${size}" viewBox="0 0 140 140">${arcs}<circle cx="70" cy="70" r="34" fill="#12171D"/></svg>
  <div class="chart-legend" style="flex-direction:column;gap:10px;">${segments.map(s=>`<div class="legend-item"><span class="legend-dot" style="background:${s.color};"></span>${s.label} — ${Math.round(s.value/total*100)}%</div>`).join('')}</div>`;
}
donutChart('analytics-donut', [
  {label:'Online store', value:3696, color:'#2FA766'},
  {label:'Wholesale', value:2604, color:'#8FE3A6'},
  {label:'Retail partners', value:1344, color:'#7CA653'},
  {label:'Marketplace', value:756, color:'#5B9FE8'},
]);

/* =========================================================
   NAVIGATION / ROUTER
========================================================= */
document.querySelectorAll('.nav-item[data-screen]').forEach(item=>{
  item.addEventListener('click', ()=>goto(item.dataset.screen));
});
document.querySelectorAll('[data-goto]').forEach(el=>{
  el.addEventListener('click', e=>{e.preventDefault();goto(el.dataset.goto);});
});
const titleMap = {dashboard:'Dashboard',sales:'Sales',products:'Products',inventory:'Inventory',customers:'Customers',orders:'Orders',invoices:'Invoices',analytics:'Analytics',settings:'Settings'};
function goto(name){
  document.querySelectorAll('.screen').forEach(s=>s.classList.remove('active'));
  document.getElementById('screen-'+name).classList.add('active');
  document.querySelectorAll('.nav-item[data-screen]').forEach(n=>n.classList.toggle('active', n.dataset.screen===name));
  document.getElementById('topbar-title').textContent = titleMap[name];
  document.querySelector('.main-col').parentElement.scrollTop = 0;
  window.scrollTo(0,0);
  document.getElementById('sidebar').classList.remove('mobile-open');
}

document.getElementById('collapse-btn').addEventListener('click', ()=>{
  document.getElementById('sidebar').classList.toggle('collapsed');
  window.dispatchEvent(new Event('resize'));
});

document.getElementById('logout-btn').addEventListener('click', ()=>{
  if(window.NexusAuth){
    NexusAuth.logout();
  }else{
    localStorage.removeItem('nexus_token');
    localStorage.removeItem('nexus_user');
    window.location.reload();
  }
});



/* settings tabs */
document.querySelectorAll('#settings-tabs .tab-btn').forEach(btn=>{
  btn.addEventListener('click', ()=>{
    document.querySelectorAll('#settings-tabs .tab-btn').forEach(b=>b.classList.remove('active'));
    btn.classList.add('active');
    document.querySelectorAll('.settings-tab-panel').forEach(p=>{
      p.style.display = p.dataset.tabpanel===btn.dataset.tab ? 'block' : 'none';
    });
  });
});
document.querySelectorAll('.switch[data-toggle]').forEach(sw=>{
  sw.addEventListener('click', ()=>sw.classList.toggle('on'));
});

/* =========================================================
   NEXUS — FRONTEND COMPLETION / INTERACTION LAYER
   Pure frontend state for now; ready to be replaced by API calls later.
========================================================= */
(function(){
  const $ = s => document.querySelector(s);
  const $$ = s => [...document.querySelectorAll(s)];
  const esc = s => String(s ?? '').replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));

  /* Login credentials requested for the frontend demo. Backend auth will replace this later. */
  const DEMO_EMAIL='admin123@nexus.com', DEMO_PASS='admin123';
  /* Real profile/company images for team/customer/product avatars. */const emailInput=$('#li-email'), passInput=$('#li-pass');
  if(emailInput) emailInput.value=DEMO_EMAIL;
  if(passInput) passInput.value=DEMO_PASS;

  document.body.insertAdjacentHTML('beforeend', `
    <div class="modal-backdrop" id="nx-modal-backdrop">
      <div class="nx-modal" id="nx-modal">
        <div class="nx-modal-head"><div><h3 id="nx-modal-title">NEXUS</h3><p id="nx-modal-subtitle"></p></div><button class="nx-close" id="nx-close">×</button></div>
        <div class="nx-modal-body" id="nx-modal-body"></div>
        <div class="nx-modal-foot" id="nx-modal-foot"></div>
      </div>
    </div>
    <div class="context-menu" id="nx-context-menu"></div>
    <div class="toast-stack" id="nx-toast-stack"></div>
  `);

  const backdrop=$('#nx-modal-backdrop'), modal=$('#nx-modal'), mtitle=$('#nx-modal-title'), msub=$('#nx-modal-subtitle'), mbody=$('#nx-modal-body'), mfoot=$('#nx-modal-foot'), menu=$('#nx-context-menu');
  function closeModal(){backdrop.classList.remove('open');}
  $('#nx-close').onclick=closeModal;
  backdrop.addEventListener('click',e=>{if(e.target===backdrop)closeModal()});
  document.addEventListener('keydown',e=>{if(e.key==='Escape'){closeModal();menu.classList.remove('open')}});
  function toast(title,msg){const el=document.createElement('div');el.className='nx-toast';el.innerHTML=`<b>${esc(title)}</b><span>${esc(msg)}</span>`;$('#nx-toast-stack').appendChild(el);setTimeout(()=>el.remove(),3200)}
  function openModal(title,subtitle,body,foot='',wide=false){mtitle.textContent=title;msub.textContent=subtitle||'';mbody.innerHTML=body;mfoot.innerHTML=foot;modal.classList.toggle('wide',!!wide);backdrop.classList.add('open');}
  const primary=(label,action='submit')=>`<button class="btn btn-primary btn-sm" type="${action}" ${action==='submit'?'form="nx-active-form"':''}>${label}</button>`;
  const ghost=(label)=>`<button class="btn btn-ghost btn-sm" type="button" data-close-modal>${label}</button>`;
  document.addEventListener('click',e=>{if(e.target.closest('[data-close-modal]'))closeModal()});

  function formShell(fields){return `<form id="nx-active-form"><div class="nx-form-grid">${fields}</div></form>`}
  const field=(label,name,value='',type='text',extra='')=>`<div class="nx-field"><label>${label}</label><input name="${name}" type="${type}" value="${esc(value)}" ${extra}></div>`;
  const select=(label,name,opts)=>`<div class="nx-field"><label>${label}</label><select name="${name}">${opts.map(o=>`<option>${esc(o)}</option>`).join('')}</select></div>`;

  function createOrder(){
    const API='http://localhost:5000/api';
    const token=localStorage.getItem('nexus_token');
    const headers={'Content-Type':'application/json', ...(token?{Authorization:`Bearer ${token}`}:{})};
    let customers=[], productList=[], rows=[];

    const api=async(path,options={})=>{
      const r=await fetch(API+path,{...options,headers:{...headers,...(options.headers||{})}});
      const d=await r.json().catch(()=>({}));
      if(!r.ok) throw new Error(d.message||'API request failed');
      return d;
    };

    async function openOrderForm(){
      try{
        const [cr,pr]=await Promise.all([api('/customers'),api('/products')]);
        customers=cr.data||cr.customers||[];
        productList=pr.data||pr.products||[];
        if(!customers.length||!productList.length){toast('Order unavailable','Customers and products are required before creating an order.');return;}
        rows=[{productId:productList[0].id,qty:1,price:Number(productList[0].price)||0}];
        render();
      }catch(err){toast('Could not open order',err.message)}
    }

    let selectedCustomerId = null;

    function render(){
      openModal('Create new order','Create a real order in PostgreSQL.',formShell([
        `<div class="nx-field full">
          <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:6px;">
            <label style="margin-bottom:0;">Customer / User</label>
            <button type="button" class="btn btn-ghost btn-sm" id="nx-order-quick-add-cust" style="padding:2px 8px;font-size:11.5px;color:var(--mango-1);border-color:rgba(47,167,102,0.3);background:rgba(47,167,102,0.08);">+ Add New Customer</button>
          </div>
          <select name="customer" id="nx-order-customer-select">
            ${customers.map(c=>`<option value="${c.id}" ${Number(c.id)===Number(selectedCustomerId || customers[0]?.id)?'selected':''}>${esc(c.name)}${c.company ? ` (${esc(c.company)})` : ''}</option>`).join('')}
            <option value="__new__">+ Add New Customer...</option>
          </select>
        </div>`,
        select('Payment status','payment',['Paid','Pending','Failed']),
        `<div class="nx-field full"><label>Order items</label><div class="nx-order-items" id="nx-order-items">${rows.map((r,i)=>{const p=productList.find(x=>Number(x.id)===Number(r.productId));return `<div class="nx-order-row"><select data-row-product="${i}">${productList.map(x=>`<option value="${x.id}" ${Number(x.id)===Number(r.productId)?'selected':''}>${esc(x.name)}</option>`).join('')}</select><input data-row-qty="${i}" type="number" min="1" value="${r.qty}"><span>${money(r.price*r.qty)}</span><button type="button" class="nx-remove" data-remove-row="${i}">×</button></div>`}).join('')}</div><button type="button" class="btn btn-ghost btn-sm nx-add-row" id="nx-add-order-item">+ Add product</button></div>`,
        field('Notes','notes','','text','placeholder="Optional order notes"')
      ]),`<button class="btn btn-ghost btn-sm" type="button" data-close-modal>Cancel</button>${primary('Create order')}`,true);

      const f=$('#nx-active-form');

      function promptQuickCustomer(){
        const name = prompt('Enter new customer / user name:');
        if(!name || !name.trim()) return;
        const email = prompt('Enter customer email (e.g. client@company.com):') || `${name.toLowerCase().replace(/\s+/g, '')}@example.com`;
        const phone = prompt('Enter mobile phone (+91 format):') || '+91 98765 00000';

        (async()=>{
          try {
            const res = await api('/customers', {
              method: 'POST',
              body: JSON.stringify({ name: name.trim(), email: email.trim(), phone: phone.trim(), city: 'Mumbai' })
            });
            if(res.success && res.data){
              customers.unshift(res.data);
              selectedCustomerId = res.data.id;
              toast('Customer created', `${res.data.name} added and selected.`);
              render();
            }
          } catch(err){
            toast('Failed to add customer', err.message);
          }
        })();
      }

      const quickAddBtn = $('#nx-order-quick-add-cust');
      if(quickAddBtn) quickAddBtn.onclick = (e) => { e.preventDefault(); promptQuickCustomer(); };

      const custSelect = $('#nx-order-customer-select');
      if(custSelect) custSelect.onchange = (e) => {
        if(e.target.value === '__new__'){
          promptQuickCustomer();
        } else {
          selectedCustomerId = Number(e.target.value);
        }
      };

      f.addEventListener('change',e=>{
        const pi=e.target.dataset.rowProduct;
        if(pi!==undefined){
          rows[pi].productId=Number(e.target.value);
          rows[pi].price=Number(productList.find(x=>Number(x.id)===Number(e.target.value))?.price)||0;
          render();
          return;
        }
        const qi=e.target.dataset.rowQty;
        if(qi!==undefined){rows[qi].qty=Math.max(1,Number(e.target.value)||1);render()}
      });
      $$('#nx-active-form [data-remove-row]').forEach(b=>b.onclick=()=>{rows.splice(Number(b.dataset.removeRow),1);if(!rows.length)rows.push({productId:productList[0].id,qty:1,price:Number(productList[0].price)||0});render()});
      $('#nx-add-order-item').onclick=()=>{rows.push({productId:productList[0].id,qty:1,price:Number(productList[0].price)||0});render()};
      f.onsubmit=async e=>{
        e.preventDefault();
        const d=new FormData(f);
        const custVal = d.get('customer');
        const customer=customers.find(c=>Number(c.id)===Number(custVal) || c.name===custVal);
        if(!customer || custVal==='__new__'){toast('Order failed','Select a valid customer.');return}
        try{
          const result=await api('/orders',{method:'POST',body:JSON.stringify({customer_id:Number(customer.id),payment_status:String(d.get('payment')).toLowerCase(),items:rows.map(r=>({product_id:Number(r.productId),quantity:Number(r.qty)}))})});
          closeModal();
          if(typeof window.refreshAllNexusData==='function') window.refreshAllNexusData();
          await window.NexusOrders?.load?.();
          const total=result.data?.total ?? result.order?.total ?? result.total ?? rows.reduce((a,r)=>a+r.price*r.qty,0);
          toast('Order created',`${customer.name} · ${money(total)}`);
        }catch(err){toast('Order failed',err.message)}
      };
    }
    openOrderForm();
  }

  async function openInvoicePdf(invoiceId, existingWindow=null){
    if(!invoiceId){
      toast('PDF unavailable','Invoice ID is missing.');
      return;
    }

    const token = localStorage.getItem('nexus_token');

    const pdfWindow = existingWindow || window.open('about:blank', '_blank');

    if(!pdfWindow){
      toast('PDF blocked','Allow pop-ups for NEXUS to view the invoice.');
      return;
    }

    pdfWindow.document.title = 'NEXUS Invoice';
    pdfWindow.document.body.innerHTML =
      '<div style="font-family:Arial,sans-serif;padding:40px;color:#555">Opening invoice…</div>';

    try{
      const response = await fetch(
        `http://localhost:5000/api/invoices/${encodeURIComponent(invoiceId)}/pdf`,
        {
          headers:{
            ...(token ? {Authorization:`Bearer ${token}`} : {})
          }
        }
      );

      if(!response.ok){
        const data = await response.json().catch(() => ({}));
        throw new Error(data.message || 'Could not open invoice PDF');
      }

      const blob = await response.blob();
      const pdfUrl = URL.createObjectURL(blob);

      pdfWindow.location.href = pdfUrl;

      setTimeout(() => URL.revokeObjectURL(pdfUrl), 60000);

    }catch(err){
      console.error('Invoice PDF error:',err);

      try{
        pdfWindow.close();
      }catch(_){}

      toast('PDF failed',err.message);
    }
  }

  function createInvoice(){

  const customerList =
    Array.isArray(customersData)
      ? customersData
      : [];

  let productList=[];
  let rows=[];

  const today=new Date();
  const issueDate=
    today.toISOString().slice(0,10);

  openModal(
    'Create invoice',
    'Create a professional invoice from products and customer data.',
    `
      <div class="nx-form-grid">

        <div class="nx-field full">
          <label>Customer</label>
          <select id="nx-invoice-customer" required>
            <option value="">Select customer</option>
            ${
              customerList.map(c=>
                `<option value="${esc(c.id)}">
                  ${esc(c.name)}
                </option>`
              ).join('')
            }
          </select>
        </div>

        <div class="nx-field">
          <label>Invoice date</label>
          <input
            id="nx-invoice-date"
            type="date"
            value="${issueDate}"
            required
          >
        </div>

        <div class="nx-field">
          <label>Status</label>
          <select id="nx-invoice-status" required>
            <option value="draft">Draft</option>
            <option value="due">Due</option>
            <option value="paid">Paid</option>
          </select>
        </div>

        <div
          class="nx-field"
          id="nx-invoice-payment-wrap"
        >
          <label>Payment Method</label>
          <select id="nx-invoice-payment">
            <option value="">Select payment method</option>
            <option value="upi">UPI</option>
            <option value="netbanking">Net Banking</option>
            <option value="debit_card">Debit Card</option>
            <option value="credit_card">Credit Card</option>
            <option value="cash">Cash</option>
            <option value="bank_transfer">Bank Transfer</option>
          </select>
        </div>

        <div
          class="nx-field full"
          id="nx-invoice-due-wrap"
          style="display:none;"
        >
          <label>Due date</label>
          <input
            id="nx-invoice-due"
            type="date"
          >
        </div>

        <div class="nx-field">
          <label>Discount (%)</label>
          <input
            id="nx-invoice-discount"
            type="number"
            min="0"
            max="100"
            step="0.01"
            value="0"
          >
        </div>

        <div class="nx-field">
          <label>GST (%)</label>
          <select id="nx-invoice-tax">
            <option value="0">0%</option>
            <option value="5">5%</option>
            <option value="12">12%</option>
            <option value="18">18%</option>
            <option value="28">28%</option>
          </select>
        </div>

        <div class="nx-field full">
          <label>Invoice items</label>

          <div
            id="nx-invoice-items"
            style="display:flex;flex-direction:column;gap:10px;"
          ></div>

          <button
            id="nx-add-invoice-item"
            type="button"
            class="btn btn-ghost btn-sm"
            style="margin-top:10px;"
          >
            + Add Item
          </button>
        </div>

        <div
          id="nx-invoice-total-preview"
          class="nx-field full"
          style="
            text-align:right;
            font-size:16px;
            font-weight:700;
          "
        >
          Total: ₹0
        </div>

      </div>
    `,
    `
      <button
        class="btn btn-ghost btn-sm"
        type="button"
        data-close-modal
      >
        Cancel
      </button>

      <button
        class="btn btn-primary btn-sm"
        id="nx-save-invoice"
        type="button"
      >
        Create Invoice
      </button>
    `
  );

  const customerEl=$('#nx-invoice-customer');
  const statusEl=$('#nx-invoice-status');
  const dueWrap=$('#nx-invoice-due-wrap');
  const dueEl=$('#nx-invoice-due');
  const paymentEl=$('#nx-invoice-payment');
  const itemsEl=$('#nx-invoice-items');
  const discountEl=$('#nx-invoice-discount');
  const taxEl=$('#nx-invoice-tax');
  const totalEl=$('#nx-invoice-total-preview');

  function updateDueVisibility(){

    const status=statusEl.value;

    const needsDue =
      status==='due';

    dueWrap.style.display=
      needsDue ? '' : 'none';

    dueEl.required=needsDue;

    const isPaid = status === 'paid';

    paymentEl.required = isPaid;

    if(!isPaid){
      paymentEl.value = '';
    }

    if(!needsDue){
      dueEl.value='';
    }
  }

  statusEl.addEventListener(
    'change',
    updateDueVisibility
  );

  function calculate(){

    let subtotal=0;

    rows.forEach(row=>{
      subtotal +=
        Number(row.qty||0) *
        Number(row.price||0);
    });

    const discountRate=
      Math.min(
        100,
        Math.max(
          0,
          Number(discountEl.value)||0
        )
      );

    const discountAmount=
      subtotal * discountRate / 100;

    const taxable=
      Math.max(
        0,
        subtotal-discountAmount
      );

    const taxRate=
      Number(taxEl.value)||0;

    const taxAmount=
      taxable*taxRate/100;

    const total=
      taxable+taxAmount;

    totalEl.textContent=
      `Total: ${money(total)}`;

    return {
      subtotal,
      discountRate,
      discountAmount,
      taxable,
      taxRate,
      taxAmount,
      total
    };
  }

  function renderRows(){

    itemsEl.innerHTML='';

    rows.forEach(row=>{

      const wrap=
        document.createElement('div');

      wrap.style.cssText=
        'display:grid;grid-template-columns:1fr 90px 110px 42px;gap:8px;align-items:center;';

      wrap.innerHTML=`
        <select
          class="nx-row-product"
          data-row="${row.id}"
        >
          <option value="">Select product</option>
          ${
            productList.map(p=>
              `<option
                value="${esc(p.id)}"
                ${String(p.id)===String(row.productId)?'selected':''}
              >
                ${esc(p.name)}
              </option>`
            ).join('')
          }
        </select>

        <input
          class="nx-row-qty"
          data-row="${row.id}"
          type="number"
          min="1"
          step="1"
          value="${row.qty}"
        >

        <input
          type="text"
          value="${row.price ? money(row.price) : '₹0'}"
          readonly
          style="opacity:.8;"
        >

        <button
          type="button"
          class="btn btn-ghost btn-sm nx-remove-invoice-row"
          data-row="${row.id}"
          title="Remove item"
        >
          ×
        </button>
      `;

      itemsEl.appendChild(wrap);
    });

    itemsEl
      .querySelectorAll('.nx-row-product')
      .forEach(select=>{

        select.addEventListener(
          'change',
          ()=>{

            const row=
              rows.find(
                r=>String(r.id)===String(select.dataset.row)
              );

            const product=
              productList.find(
                p=>String(p.id)===String(select.value)
              );

            if(row){
              row.productId=
                product?.id || '';

              row.price=
                Number(product?.price)||0;
            }

            renderRows();
            calculate();
          }
        );

      });

    itemsEl
      .querySelectorAll('.nx-row-qty')
      .forEach(input=>{

        input.addEventListener(
          'input',
          ()=>{

            const row=
              rows.find(
                r=>String(r.id)===String(input.dataset.row)
              );

            if(row){
              row.qty=
                Math.max(
                  1,
                  Number(input.value)||1
                );
            }

            calculate();
          }
        );

      });

    itemsEl
      .querySelectorAll('.nx-remove-invoice-row')
      .forEach(button=>{

        button.addEventListener(
          'click',
          ()=>{

            rows=
              rows.filter(
                r=>String(r.id)!==
                   String(button.dataset.row)
              );

            if(!rows.length){
              addRow();
            }else{
              renderRows();
              calculate();
            }

          }
        );

      });
  }

  function addRow(){

    rows.push({
      id:Date.now()+Math.random(),
      productId:'',
      qty:1,
      price:0
    });

    renderRows();
    calculate();
  }

  $('#nx-add-invoice-item')
    .addEventListener(
      'click',
      addRow
    );

  discountEl.addEventListener(
    'input',
    calculate
  );

  taxEl.addEventListener(
    'change',
    calculate
  );

  async function loadProducts(){

    try{

      if(window.NexusAPI?.products){

        const result=
          await window.NexusAPI.products();

        productList=
          Array.isArray(result?.data)
            ? result.data
            : Array.isArray(result)
              ? result
              : [];
      }

    }catch(_){}

    if(!productList.length){

      try{

        const token=
          localStorage.getItem('nexus_token');

        const r=
          await fetch(
            'http://localhost:5000/api/products',
            {
              headers:
                token
                  ? {
                      Authorization:
                        `Bearer ${token}`
                    }
                  : {}
            }
          );

        const d=
          await r.json();

        productList=
          Array.isArray(d?.data)
            ? d.data
            : [];

      }catch(err){

        console.error(
          'Invoice products load failed',
          err
        );

      }

    }

    renderRows();
    calculate();
  }

  $('#nx-save-invoice')
    .addEventListener(
      'click',
      async ()=>{

        const customerId=
          Number(customerEl.value);

        if(!customerId){
          toast(
            'Invoice failed',
            'Select a customer.'
          );
          return;
        }

        const status=
          statusEl.value;

        const issueDate=
          $('#nx-invoice-date').value;

        const dueDate=
          dueEl.value || null;

        if(status==='due' && !dueDate){

          toast(
            'Invoice failed',
            'Due date is required for a Due invoice.'
          );

          return;
        }

        if(
          status==='due' &&
          dueDate < issueDate
        ){

          toast(
            'Invoice failed',
            'Due date cannot be before invoice date.'
          );

          return;
        }

        const validRows=
          rows.filter(
            r=>r.productId
          );

        if(!validRows.length){

          toast(
            'Invoice failed',
            'Add at least one product.'
          );

          return;
        }

        const paymentMethod =
          paymentEl
            ? paymentEl.value
            : '';

        if(status === 'paid' && !paymentMethod){

          toast(
            'Invoice failed',
            'Payment method is required for a Paid invoice.'
          );

          return;
        }

        const calc=
          calculate();

        const items=
          validRows.map(row=>({

            product_id:
              Number(row.productId),

            quantity:
              Math.max(
                1,
                Number(row.qty)||1
              ),

            unit_price:
              Number(row.price)||0
          }));

        try{

          const token=
            localStorage.getItem(
              'nexus_token'
            );

          const r=
            await fetch(
              'http://localhost:5000/api/invoices',
              {
                method:'POST',

                headers:{
                  'Content-Type':
                    'application/json',

                  ...(token
                    ? {
                        Authorization:
                          `Bearer ${token}`
                      }
                    : {})
                },

                body:JSON.stringify({

                  customer_id:
                    customerId,

                  issue_date:
                    issueDate,

                  due_date:
                    dueDate,

                  status:
                    status,

                  tax_rate:
                    calc.taxRate,

                  discount:
                    calc.discountRate,

                  payment_method:
                    paymentMethod,

                  items:
                    items
                })
              }
            );

          const data=
            await r.json()
              .catch(()=>({}));

          if(!r.ok){

            throw new Error(
              data.message ||
              'Invoice API request failed'
            );
          }

          closeModal();

          if(window.NexusInvoices?.load){
            await window.NexusInvoices.load();
          }

          const invoice=
            data.data ||
            data.invoice ||
            {};

          const invoiceNumber=
            invoice.invoice_number ||
            `INV-${invoice.id || ''}`;

          toast(
            'Invoice created',
            `${invoiceNumber} · ${money(invoice.total || calc.total)}`
          );


        }catch(err){

          console.error(
            'Invoice creation failed',
            err
          );

          toast(
            'Invoice failed',
            err.message
          );
        }

      }
    );

  updateDueVisibility();

  addRow();

  loadProducts();
}
  // SINGLE PDF OPENER — prevents duplicate tabs
  if (!window.__NEXUS_PDF_HANDLER_INSTALLED) {
    window.__NEXUS_PDF_HANDLER_INSTALLED = true;

    document.addEventListener('click', e => {
      const btn = e.target.closest('.nx-invoice-pdf');
      if (!btn) return;

      e.preventDefault();
      e.stopImmediatePropagation();

      // Global lock: even duplicate script execution cannot open 2 tabs.
      if (window.__NEXUS_PDF_OPENING) return;
      window.__NEXUS_PDF_OPENING = true;

      const invoiceId = btn.dataset.invoiceId;

      const pdfWindow = window.open('about:blank', '_blank');

      if (!pdfWindow) {
        window.__NEXUS_PDF_OPENING = false;
        toast('PDF blocked', 'Allow pop-ups for NEXUS to view the invoice.');
        return;
      }

      openInvoicePdf(invoiceId, pdfWindow)
        .catch(err => {
          console.error('Invoice PDF error:', err);
        })
        .finally(() => {
          setTimeout(() => {
            window.__NEXUS_PDF_OPENING = false;
          }, 1000);
        });
    });
  }

  function renderInvoiceTable(){ $('#invoices-table').innerHTML=`<table class="data-table"><thead><tr><th>Invoice</th><th>Customer</th><th>Issued</th><th>Due</th><th>Amount</th><th>Status</th><th></th></tr></thead><tbody>${invoicesData.map(v=>`<tr><td><span class="cell-title">${v.num}</span></td><td>${v.cust}</td><td style="color:var(--text-mid);">${v.issue}</td><td style="color:var(--text-mid);">${v.due}</td><td>${money(v.amount)}</td><td>${pillHtml(invStatusMeta[v.status],v.status)}</td><td style="text-align:right;">
  <button
    class="btn btn-ghost btn-sm nx-invoice-pdf"
    type="button"
    data-invoice-id="${esc(v.id)}"
    title="View invoice PDF"
    aria-label="View invoice PDF"
    style="width:38px;height:38px;padding:0;display:inline-flex;align-items:center;justify-content:center;"
  >
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
      <path d="M14 2v6h6"/>
      <path d="M8 13h8"/>
      <path d="M8 17h6"/>
    </svg>
  </button>
</td></tr>`).join('')}</tbody></table>` }

  async function newDeal(){
    openModal('New deal','Add an opportunity to the sales pipeline.',formShell([
      field('Deal name','name','','text','required placeholder="e.g. Annual supply contract"'),
      field('Account','acct','','text','required placeholder="Customer / company"'),
      field('Value','value','0','number','min="0" step="1"'),
      select('Stage','stage',['Discovery','Proposal','Negotiation','Closed won']),
      field('Owner','owner','Aryan Sharma'),
      field('Close date','close','2026-09-30','date')
    ]), `<button class="btn btn-ghost btn-sm" type="button" data-close-modal>Cancel</button>${primary('Create deal')}`);
    $('#nx-active-form').onsubmit=async e=>{
      e.preventDefault();
      const d=new FormData(e.target);
      const name=String(d.get('name')||'').trim(), acct=String(d.get('acct')||'').trim();
      if(!name||!acct){toast('Deal failed','Deal name and account are required.');return}
      try{
        const customers=window.NexusAPI?.customers ? await NexusAPI.customers() : null;
        const list=customers?.data||customers?.customers||customers||[];
        const customer=list.find(c=>String(c.name||'').toLowerCase()===acct.toLowerCase()||String(c.company||'').toLowerCase()===acct.toLowerCase());
        if(!customer){toast('Deal failed','Select an existing customer/company name.');return}
        const stageMap={Discovery:'lead',Proposal:'proposal',Negotiation:'negotiation','Closed won':'closed_won'};
        const token=localStorage.getItem('nexus_token');
        const r=await fetch('http://localhost:5000/api/deals',{method:'POST',headers:{'Content-Type':'application/json',...(token?{Authorization:`Bearer ${token}`}:{})},body:JSON.stringify({customer_id:Number(customer.id),name,value:Number(d.get('value'))||0,stage:stageMap[d.get('stage')]||'lead',probability:d.get('stage')==='Closed won'?100:d.get('stage')==='Negotiation'?75:d.get('stage')==='Proposal'?50:25})});
        const data=await r.json().catch(()=>({}));
        if(!r.ok)throw new Error(data.message||'Deal API request failed');
        closeModal();
        if(window.NexusDeals?.load) await window.NexusDeals.load();
        toast('Deal created',`${name} added to the pipeline.`);
      }catch(err){toast('Deal failed',err.message)}
    };
  }
  function renderSalesTable(){ $('#sales-table').innerHTML=`<table class="data-table"><thead><tr><th>Deal</th><th>Account</th><th>Stage</th><th>Value</th><th>Owner</th><th>Close date</th><th></th></tr></thead><tbody>${dealsData.map(d=>`<tr><td><span class="cell-title">${esc(d.name)}</span></td><td>${esc(d.acct)}</td><td>${pillHtml(d.stage,stageMeta[d.stage])}</td><td>${money(d.value)}</td><td>${esc(d.owner)}</td><td style="color:var(--text-mid);">${esc(d.close)}</td><td><button class="btn btn-ghost btn-sm nx-more" data-type="deal" data-id="${esc(d.name)}">•••</button></td></tr>`).join('')}</tbody></table>` }

  const NEXUS_PRODUCT_CATEGORIES = {
    'Produce': 1,
    'Fresh Produce': 1,
    'Beverages': 2,
    'Bakery': 3,
    'Dry Fruits': 4,
    'Snacks': 5,
    'Packaged goods': 5
  };

  function productCategoryId(name){
    return NEXUS_PRODUCT_CATEGORIES[name] || 5;
  }

  function productCategoryLabel(name){
    if(name === 'Fresh Produce') return 'Produce';
    if(name === 'Dry Fruits' || name === 'Snacks') return 'Packaged goods';
    return name || 'Packaged goods';
  }

  async function refreshProductsFromBackend(){
    if(
      !window.NexusAPI ||
      typeof NexusAPI.products !== 'function' ||
      typeof NexusAPI.inventory !== 'function'
    ) return;

    try{
      const [productResult, inventoryResult] = await Promise.all([
        NexusAPI.products(),
        NexusAPI.inventory()
      ]);

      if(!productResult.success || !Array.isArray(productResult.data)){
        throw new Error(
          productResult.message || 'Unable to load products.'
        );
      }

      const inventoryRows =
        inventoryResult.success && Array.isArray(inventoryResult.data)
          ? inventoryResult.data
          : [];

      const stockByProduct = {};
      const updatedByProduct = {};

      inventoryRows.forEach(i=>{
        const id = Number(i.product_id);

        stockByProduct[id] =
          (stockByProduct[id] || 0) + Number(i.quantity || 0);

        if(i.updated_at){
          const current = updatedByProduct[id];
          if(!current || new Date(i.updated_at) > new Date(current)){
            updatedByProduct[id] = i.updated_at;
          }
        }
      });

      const incoming = productResult.data.map(p=>{
        const stock = stockByProduct[Number(p.id)] || 0;

        return {
          id:p.id,
          name:p.name || '',
          sku:p.sku || '',
          cat:productCategoryLabel(p.category_name || p.category || p.cat),
          category_id:p.category_id ?? null,
          price:Number(p.price)||0,
          stock,
          status:
            stock === 0
              ? 'danger'
              : stock < 50
                ? 'warn'
                : 'ok',
          updated:
            updatedByProduct[Number(p.id)] ||
            p.updated_at ||
            p.created_at ||
            ''
        };
      });

      products.splice(
        0,
        products.length,
        ...incoming
      );

      window.NEXUS_LIVE_PRODUCTS = [...products];

      renderProductsTable();

      console.log(
        `NEXUS: ${incoming.length} products refreshed from PostgreSQL`
      );
    }catch(error){
      console.error('NEXUS product load failed:',error);
      toast(
        'Products unavailable',
        error.message || 'Could not load products from PostgreSQL.'
      );
    }
  }

  function productForm(existing=null){
    const categories=['Produce','Beverages','Bakery','Packaged goods'];
    return formShell([
      field('Product name','name',existing?.name || '','text','required placeholder="e.g. Alphonso Mango Crate"'),
      field('SKU','sku',existing?.sku || 'PRD-'+Math.floor(1000+Math.random()*8999),'text','required placeholder="e.g. PRD-1042"'),
      select('Category','cat',categories),
      field('Price','price',existing?.price ?? 0,'number','min="0" step="0.01" required'),
      existing
        ? `<div class="nx-field full"><label>Stock</label><input value="${esc(existing.stock ?? 0)}" disabled><small style="display:block;margin-top:5px;color:var(--text-low)">Stock is managed from Inventory so product edits cannot accidentally overwrite warehouse quantities.</small></div>`
        : field('Opening stock','stock','0','number','min="0" step="1"'),
      field('Reorder point','reorder','50','number','min="0" step="1"'),
      existing ? '' : `<div class="nx-field full"><label>Product image</label><input name="image" type="file" accept="image/png,image/jpeg"></div>`
    ]);
  }

  function setProductCategoryField(existing){
    const cat=$('#nx-active-form')?.querySelector('[name="cat"]');
    if(cat) cat.value=existing?.cat || 'Packaged goods';
  }

  function editProduct(existing){
    openModal(
      'Edit product',
      'Update catalog details. Inventory quantities are managed separately.',
      productForm(existing),
      `<button class="btn btn-ghost btn-sm" type="button" data-close-modal>Cancel</button>${primary('Save product')}`
    );
    setProductCategoryField(existing);

    $('#nx-active-form').onsubmit=async e=>{
      e.preventDefault();
      const d=new FormData(e.target);
      const name=String(d.get('name')||'').trim();
      const sku=String(d.get('sku')||'').trim();
      const price=Number(d.get('price'))||0;
      const category_id=productCategoryId(String(d.get('cat')||''));

      if(!name || !sku){
        toast('Product validation','Product name and SKU are required.');
        return;
      }

      try{
        if(!window.NexusAPI || typeof NexusAPI.updateProduct!=='function'){
          throw new Error('Product update API is not available.');
        }

        const result=await NexusAPI.updateProduct(existing.id,{name,sku,category_id,price});
        if(!result.success) throw new Error(result.message || 'Product update failed.');

        await refreshProductsFromBackend();
        closeModal();
        toast('Product updated',`${name} is saved to PostgreSQL.`);
      }catch(error){
        console.error('NEXUS product update failed:',error);
        toast('Product update failed',error.message || 'Unable to update product.');
      }
    };
  }

  function addProduct(){
    openModal(
      'Add product',
      'Create a catalog item in PostgreSQL. Opening stock can be added from Inventory after creation.',
      productForm(),
      `<button class="btn btn-ghost btn-sm" type="button" data-close-modal>Cancel</button>${primary('Add product')}`
    );
    setProductCategoryField();

    $('#nx-active-form').onsubmit=async e=>{
      e.preventDefault();
      const d=new FormData(e.target);
      const name=String(d.get('name')||'').trim();
      const sku=String(d.get('sku')||'').trim();
      const price=Number(d.get('price'))||0;
      const openingStock=Math.max(0,Number(d.get('stock'))||0);
      const category_id=productCategoryId(String(d.get('cat')||''));

      if(!name || !sku){
        toast('Product validation','Product name and SKU are required.');
        return;
      }

      try{
        if(!window.NexusAPI || typeof NexusAPI.createProduct!=='function'){
          throw new Error('Product creation API is not available.');
        }

        const result=await NexusAPI.createProduct({name,sku,category_id,price});
        if(!result.success) throw new Error(result.message || 'Product creation failed.');

        await refreshProductsFromBackend();
        closeModal();

        if(openingStock>0){
          toast('Product created',`${name} is saved. Add ${openingStock} opening units from Inventory.`);
        }else{
          toast('Product created',`${name} is now saved in PostgreSQL.`);
        }
      }catch(error){
        console.error('NEXUS product creation failed:',error);
        toast('Product creation failed',error.message || 'Unable to create product.');
      }
    };
  }

  function renderProductsTable(){
    $('#products-table').dataset.patched='1';
    $('#products-table').innerHTML=`<table class="data-table">
      <thead><tr><th>Product</th><th>Category</th><th>Price</th><th>Stock</th><th>Status</th><th>Updated</th><th></th></tr></thead>
      <tbody>${products.map(p=>{
        const [label,type]=statusMeta[p.status]||['In stock','ok'];
        const updated=p.updated ? new Date(p.updated).toLocaleDateString('en-IN',{day:'2-digit',month:'short',year:'numeric'}) : '—';
        return `<tr>
          <td><div class="cell-main"><img class="nx-product-thumb" src="${nxPhoto(p.name)}" alt=""><div><div class="cell-title">${esc(p.name)}</div><div class="cell-sub">${esc(p.sku)}</div></div></div></td>
          <td>${esc(p.cat)}</td><td>${money(p.price)}</td><td>${Number(p.stock)||0}</td>
          <td>${pillHtml(label,type)}</td><td style="color:var(--text-mid);">${esc(updated)}</td>
          <td><button class="btn btn-ghost btn-sm nx-more" data-type="product" data-id="${esc(p.sku)}">•••</button></td>
        </tr>`;
      }).join('')}</tbody></table>`;
  }

  async function adjustStock(){
    const inventoryRows = Array.isArray(window.NEXUS_LIVE_INVENTORY)
      ? window.NEXUS_LIVE_INVENTORY
      : [];

    if(!inventoryRows.length){
      toast('No inventory', 'No PostgreSQL inventory records are available.');
      return;
    }

    openModal(
      'Adjust stock',
      'Increase or decrease stock for a specific SKU.',
      formShell([
        select('Product','product',[...new Set(inventoryRows.map(i=>i.name))]),
        select('Adjustment','mode',['Add stock','Remove stock']),
        field('Quantity','qty','1','number','min="1"'),
        field('Reason','reason','','text','required placeholder="e.g. Damaged, purchase receipt, count correction"'),
        select('Location','location',[...new Set(inventoryRows.map(i=>i.loc))])
      ]),
      `<button class="btn btn-ghost btn-sm" type="button" data-close-modal>Cancel</button>${primary('Adjust stock')}`
    );

    $('#nx-active-form').onsubmit = async e => {
      e.preventDefault();

      const d = new FormData(e.target);
      const productName = String(d.get('product') || '');
      const mode = String(d.get('mode') || '');
      const location = String(d.get('location') || '');
      const qty = Number(d.get('qty') || 0);

      if(!productName || !location || !Number.isFinite(qty) || qty <= 0){
        toast('Invalid adjustment','Enter a valid product, location and quantity.');
        return;
      }

      const row = inventoryRows.find(
        i => i.name === productName && i.loc === location
      );

      if(!row){
        toast('Inventory not found','That product/location record does not exist.');
        return;
      }

      const current = Number(row.onhand) || 0;
      const next = mode === 'Add stock'
        ? current + qty
        : current - qty;

      if(next < 0){
        toast('Adjustment blocked','Stock cannot become negative.');
        return;
      }

      try{
        const result = await NexusAPI.adjustInventory(row.id, next);

        if(!result.success){
          throw new Error(result.message || 'Stock adjustment failed.');
        }

        closeModal();
        toast(
          'Stock adjusted',
          `${productName}: ${next} units now on hand.`
        );

        const refreshed = await NexusAPI.inventory();

        if(refreshed.success && Array.isArray(refreshed.data)){
          window.NEXUS_LIVE_INVENTORY = refreshed.data.map(i => ({
            id: i.id,
            product_id: i.product_id,
            name: i.product || '',
            sku: i.sku || '',
            loc: i.warehouse || '',
            onhand: Number(i.quantity) || 0,
            reserved: 0,
            avail: Number(i.quantity) || 0,
            reorder: 0,
            pct: 100,
            updated: i.updated_at || null
          }));

          inventoryData.splice(
            0,
            inventoryData.length,
            ...window.NEXUS_LIVE_INVENTORY
          );

          renderProductsTable();
        }
      }catch(error){
        console.error('NEXUS stock adjustment failed:', error);
        toast(
          'Stock adjustment failed',
          error.message || 'Unable to update inventory.'
        );
      }
    };
  }

  async function transferStock(){
    const inventoryRows = Array.isArray(window.NEXUS_LIVE_INVENTORY)
      ? window.NEXUS_LIVE_INVENTORY
      : [];

    if(!inventoryRows.length){
      toast('No inventory', 'No PostgreSQL inventory records are available.');
      return;
    }

    const productsByName = {};

    inventoryRows.forEach(i => {
      productsByName[i.name] = i.product_id;
    });

    const warehouses = [...new Set(inventoryRows.map(i => i.loc))];

    openModal(
      'Transfer stock',
      'Move available inventory between warehouse locations.',
      formShell([
        select('Product','product',Object.keys(productsByName)),
        select('From','from',warehouses),
        select('To','to',warehouses),
        field('Quantity','qty','1','number','min="1"'),
        field('Reference','ref','','text','placeholder="Optional transfer reference"')
      ]),
      `<button class="btn btn-ghost btn-sm" type="button" data-close-modal>Cancel</button>${primary('Transfer stock')}`
    );

    $('#nx-active-form').onsubmit = async e => {
      e.preventDefault();

      const d = new FormData(e.target);
      const productName = String(d.get('product') || '');
      const from = String(d.get('from') || '');
      const to = String(d.get('to') || '');
      const qty = Number(d.get('qty') || 0);

      if(from === to){
        toast('Transfer blocked','Source and destination must be different.');
        return;
      }

      if(!Number.isFinite(qty) || qty <= 0){
        toast('Invalid quantity','Enter a valid transfer quantity.');
        return;
      }

      const productId = productsByName[productName];

      try{
        const result = await NexusAPI.transferInventory(
          productId,
          from,
          to,
          qty
        );

        if(!result.success){
          throw new Error(result.message || 'Stock transfer failed.');
        }

        closeModal();
        toast(
          'Transfer completed',
          `${qty} units of ${productName} moved successfully.`
        );

        const refreshed = await NexusAPI.inventory();

        if(refreshed.success && Array.isArray(refreshed.data)){
          window.NEXUS_LIVE_INVENTORY = refreshed.data.map(i => ({
            id: i.id,
            product_id: i.product_id,
            name: i.product || '',
            sku: i.sku || '',
            loc: i.warehouse || '',
            onhand: Number(i.quantity) || 0,
            reserved: 0,
            avail: Number(i.quantity) || 0,
            reorder: 0,
            pct: 100,
            updated: i.updated_at || null
          }));

          inventoryData.splice(
            0,
            inventoryData.length,
            ...window.NEXUS_LIVE_INVENTORY
          );

          renderProductsTable();
        }
      }catch(error){
        console.error('NEXUS stock transfer failed:', error);
        toast(
          'Stock transfer failed',
          error.message || 'Unable to transfer inventory.'
        );
      }
    };
  }

  function addCustomer(existing=null){
    openModal(
      existing ? 'Edit customer' : 'Add customer',
      existing ? 'Update customer information.' : 'Create a customer account.',
      formShell([
        field('Full name','name',existing?.name||'','','required'),
        field('Email','email',existing?.email||'','email','required'),
        field(
          'Phone',
          'phone',
          existing?.phone||'',
          'tel',
          'required pattern="^\\+91\\s?[6-9][0-9]{9}$" placeholder="+91 98765 43210" inputmode="tel"'
        ),
        select('Segment','seg',['VIP','Standard','New']),
        field('Company','company',existing?.company||''),
        field('City','city',existing?.city||'Mumbai'),
        `<div class="nx-field full">
          <label>Notes</label>
          <textarea name="notes">${esc(existing?.notes||'')}</textarea>
        </div>`
      ]),
      `<button class="btn btn-ghost btn-sm" type="button" data-close-modal>Cancel</button>${primary(existing?'Save customer':'Add customer')}`
    );

    const form = $('#nx-active-form');

    /* Use NEXUS validation UI instead of browser-native constraint popups. */
    if(form) form.setAttribute('novalidate','');

    const phone = form?.querySelector('[name="phone"]');

    function showFieldError(input, message){
      if(!input) return;

      input.classList.add('nx-input-error');

      let error = input.parentElement.querySelector('.nx-field-error');

      if(!error){
        error = document.createElement('div');
        error.className = 'nx-field-error';
        input.parentElement.insertBefore(error, input);
      }

      error.textContent = message;
    }

    function clearFieldError(input){
      if(!input) return;

      input.classList.remove('nx-input-error');

      const error = input.parentElement.querySelector('.nx-field-error');

      if(error) error.remove();
    }

    if(phone){
      phone.addEventListener('input',()=>{
        clearFieldError(phone);

        if(phone.value && !/^\+91\s?[6-9]\d{9}$/.test(phone.value.trim())){
          showFieldError(
            phone,
            'Enter a valid Indian mobile number: +91 followed by 10 digits.'
          );
        }
      });
    }

    form?.addEventListener('submit', async e=>{
      e.preventDefault();

      const d = new FormData(form);

      const name = String(d.get('name')||'').trim();
      const email = String(d.get('email')||'').trim();
      const phoneValue = String(d.get('phone')||'').trim();

      clearFieldError(form.querySelector('[name="name"]'));
      clearFieldError(form.querySelector('[name="email"]'));
      clearFieldError(phone);

      let valid = true;

      if(!name){
        showFieldError(
          form.querySelector('[name="name"]'),
          'Full name is required.'
        );
        valid = false;
      }

      if(!email){
        showFieldError(
          form.querySelector('[name="email"]'),
          'Email address is required.'
        );
        valid = false;
      }

      if(!/^\+91\s?[6-9]\d{9}$/.test(phoneValue)){
        showFieldError(
          phone,
          'Enter a valid Indian mobile number: +91 followed by 10 digits.'
        );
        valid = false;
      }

      if(!valid) return;

      const customer = {
        name,
        email,
        phone: phoneValue,
        company: String(d.get('company')||'').trim(),
        city: String(d.get('city')||'').trim()
      };

      const submitButton = form.parentElement.parentElement.querySelector(
        '.nx-modal-foot .btn-primary'
      );

      if(submitButton){
        submitButton.disabled = true;
        submitButton.textContent = existing ? 'Saving...' : 'Adding...';
      }

      try {
        if(!window.NexusAPI){
          throw new Error('NEXUS API is not available.');
        }

        if(existing && existing.id){
          const result = await NexusAPI.updateCustomer(existing.id, customer);

          if(!result.success){
            throw new Error(result.message || 'Customer update failed.');
          }

          Object.assign(existing,{
            id: result.data.id,
            name: result.data.name,
            email: result.data.email || '',
            phone: result.data.phone || '',
            company: result.data.company || '',
            city: result.data.city || '',
            seg: d.get('seg') || existing.seg || 'Standard',
            notes: d.get('notes') || ''
          });

          renderCustomersTable();
          closeModal();
          toast('Customer updated', `${name} is saved.`);

        }else{
          const result = await NexusAPI.createCustomer(customer);

          if(!result.success){
            throw new Error(result.message || 'Customer creation failed.');
          }

          const c = result.data;

          const freshCustomers = await NexusAPI.customers();

          if(!freshCustomers.success || !Array.isArray(freshCustomers.data)){
            throw new Error(
              'Customer was created, but the customer list could not be refreshed.'
            );
          }

          customersData.splice(
            0,
            customersData.length,
            ...freshCustomers.data.map(customer => ({
              id: customer.id,
              name: customer.name || '',
              email: customer.email || '',
              phone: customer.phone || '',
              company: customer.company || '',
              city: customer.city || '',
              seg: customer.seg || 'New',
              orders: Number(customer.orders || 0),
              ltv: Number(customer.ltv || 0),
              last: customer.last_order
                ? new Date(customer.last_order).toLocaleDateString('en-IN')
                : '—',
              notes: customer.notes || ''
            }))
          );

          window.NEXUS_LIVE_CUSTOMERS = [...customersData];

          renderCustomersTable();
          closeModal();
          toast('Customer added', `${name} is now saved in PostgreSQL.`);
        }

      }catch(error){
        console.error('NEXUS customer save failed:',error);

        if(submitButton){
          submitButton.disabled = false;
          submitButton.textContent = existing ? 'Save customer' : 'Add customer';
        }

        toast(
          'Customer save failed',
          error.message || 'Unable to save customer.'
        );
      }
    });
  }

  function renderCustomersTable(){ $('#customers-table').dataset.patched='1'; $('#customers-table').innerHTML=`<table class="data-table"><thead><tr><th>Customer</th><th>Segment</th><th>Orders</th><th>Lifetime value</th><th>Last order</th><th></th></tr></thead><tbody>${customersData.map(c=>`<tr><td><div class="cell-main"><img class="nx-photo-avatar" src="${nxPhoto(c.name)}" alt=""><div><div class="cell-title">${esc(c.name)}</div><div class="cell-sub">${esc(c.email)}</div></div></div></td><td>${pillHtml(c.seg,segMeta[c.seg])}</td><td>${c.orders}</td><td>${money(c.ltv)}</td><td style="color:var(--text-mid);">${esc(c.last)}</td><td><button class="btn btn-ghost btn-sm nx-more" data-type="customer" data-id="${esc(c.email)}">•••</button></td></tr>`).join('')}</tbody></table>` }

  function downloadCsv(filename, rows){
    if(!rows || !rows.length){
      toast('Export unavailable','There is no data to export.');
      return;
    }

    const headers=Object.keys(rows[0]);

    const csv=[
      headers.map(v=>`"${String(v).replace(/"/g,'""')}"`).join(','),
      ...rows.map(row=>headers.map(h=>{
        const value=row[h] ?? '';
        return `"${String(value).replace(/"/g,'""')}"`;
      }).join(','))
    ].join('\\n');

    const blob=new Blob([csv],{type:'text/csv;charset=utf-8;'});
    const url=URL.createObjectURL(blob);
    const a=document.createElement('a');
    a.href=url;
    a.download=filename;
    document.body.appendChild(a);
    a.click();
    a.remove();

    setTimeout(()=>URL.revokeObjectURL(url),1000);
  }

  function downloadCsv(filename, rows){
    if(!rows || !rows.length){
      toast('Nothing to export','There is no data available for this report.');
      return;
    }

    const headers = Object.keys(rows[0]);

    const csv = [
      headers.map(h => `"${String(h).replace(/"/g,'""')}"`).join(','),
      ...rows.map(row =>
        headers.map(h => {
          const value = row[h] == null ? '' : row[h];
          return `"${String(value).replace(/"/g,'""')}"`;
        }).join(',')
      )
    ].join('\r\n');

    const blob = new Blob(['\ufeff' + csv], {
      type:'text/csv;charset=utf-8;'
    });

    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');

    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();

    setTimeout(() => URL.revokeObjectURL(url),1000);
  }

  function exportReport(kind='Business report'){
    openModal(
      'Export report',
      'Choose the report scope and file format.',
      formShell([
        select('Report','report',[
          kind,
          'Sales report',
          'Orders report',
          'Inventory report',
          'Customer report',
          'Invoice report'
        ]),
        select('Period','period',[
          'Today',
          'This week',
          'This month',
          'This quarter',
          'Year to date'
        ]),
        select('Format','format',[
          'CSV',
          'PDF',
          'Excel (XLSX)'
        ])
      ]),
      `<button class="btn btn-ghost btn-sm" type="button" data-close-modal>Cancel</button>${primary('Export report')}`
    );

    const form = $('#nx-active-form');

    if(!form) return;

    form.onsubmit = async e => {
      e.preventDefault();

      const d = new FormData(form);
      const report = String(d.get('report') || kind);
      const format = String(d.get('format') || 'CSV');
      const period = String(d.get('period') || 'Today');

      let rows = [];

      if(report === 'Customer report'){
        rows = (window.customersData || window.customers || []).map(c => ({
          Customer: c.name || '',
          Email: c.email || '',
          Phone: c.phone || '',
          Segment: c.seg || '',
          Orders: c.orders ?? 0,
          'Lifetime value': c.ltv ?? 0,
          'Last order': c.last || ''
        }));
      }
      else if(report === 'Orders report'){
        rows = (window.ordersData || window.orders || []).map(o => ({
          Order: o.id || o.order || '',
          Customer: o.customer || o.customer_name || '',
          Total: o.total ?? o.amount ?? 0,
          Status: o.status || '',
          Date: o.date || o.created_at || ''
        }));
      }
      else if(report === 'Inventory report'){
        rows = (window.productsData || window.products || []).map(p => ({
          Product: p.name || '',
          SKU: p.sku || '',
          Category: p.category || '',
          Price: p.price ?? 0,
          Stock: p.stock ?? 0,
          Status: p.status || ''
        }));
      }
      else if(report === 'Invoice report'){
        rows = (window.invoicesData || window.invoices || []).map(i => ({
          Invoice: i.invoice_number || i.number || i.id || '',
          Customer: i.customer_name || i.customer || '',
          Amount: i.total ?? i.amount ?? 0,
          Status: i.status || '',
          Issued: i.issue_date || i.issued || i.created_at || '',
          Due: i.due_date || i.due || ''
        }));
      }
      else if(report === 'Sales report'){
        rows = (window.dealsData || window.deals || []).map(x => ({
          Deal: x.name || x.title || '',
          Value: x.value ?? 0,
          Stage: x.stage || '',
          Owner: x.owner || ''
        }));
      }
      else{
        rows = [{
          Customers: (window.customersData || window.customers || []).length,
          Products: (window.productsData || window.products || []).length,
          Orders: (window.ordersData || window.orders || []).length,
          Invoices: (window.invoicesData || window.invoices || []).length,
          Deals: (window.dealsData || window.deals || []).length
        }];
      }

      const safeReport = report.replace(/[^a-z0-9]+/gi,'_');
      const safePeriod = period.replace(/[^a-z0-9]+/gi,'_');

      if(format === 'CSV'){
        downloadCsv(
          `NEXUS_${safeReport}_${safePeriod}.csv`,
          rows
        );

        closeModal();
        toast('Export complete',`${report} · CSV downloaded.`);
        return;
      }

      if(format === 'Excel (XLSX)'){
        if(typeof XLSX === 'undefined'){
          toast(
            'Excel export unavailable',
            'The Excel library has not loaded yet. Refresh the page and try again.'
          );
          return;
        }

        const ws = XLSX.utils.json_to_sheet(rows);
        const wb = XLSX.utils.book_new();

        XLSX.utils.book_append_sheet(
          wb,
          ws,
          'NEXUS Report'
        );

        XLSX.writeFile(
          wb,
          `NEXUS_${safeReport}_${safePeriod}.xlsx`
        );

        closeModal();
        toast('Export complete',`${report} · Excel downloaded.`);
        return;
      }

      if(format === 'PDF'){
        const win = window.open('', '_blank');

        if(!win){
          toast(
            'PDF export blocked',
            'Allow pop-ups for NEXUS and try again.'
          );
          return;
        }

        const headers = Object.keys(rows[0] || {});

        win.document.write(`
          <!doctype html>
          <html>
          <head>
            <title>NEXUS — ${esc(report)}</title>
            <style>
              body{
                font-family:Arial,sans-serif;
                padding:32px;
                color:#111;
              }
              h1{
                margin:0 0 6px;
              }
              p{
                color:#666;
                margin:0 0 24px;
              }
              table{
                width:100%;
                border-collapse:collapse;
              }
              th,td{
                border:1px solid #ddd;
                padding:8px;
                text-align:left;
                font-size:12px;
              }
              th{
                background:#f3f5f4;
              }
            </style>
          </head>
          <body>
            <h1>NEXUS — ${esc(report)}</h1>
            <p>Period: ${esc(period)}</p>
            <table>
              <thead>
                <tr>
                  ${headers.map(h => `<th>${esc(h)}</th>`).join('')}
                </tr>
              </thead>
              <tbody>
                ${rows.map(row => `
                  <tr>
                    ${headers.map(h =>
                      `<td>${esc(row[h] == null ? '' : String(row[h]))}</td>`
                    ).join('')}
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </body>
          </html>
        `);

        win.document.close();
        win.focus();

        setTimeout(() => win.print(),350);

        closeModal();
        toast(
          'PDF ready',
          'Use Save as PDF in the print dialog.'
        );
      }
    };
  }

  function globalSearch(q){
    const query=q.trim().toLowerCase();
    if(!query){openModal('Search NEXUS','Search orders, customers, products and invoices.',`<div class="nx-field"><input id="nx-search-input" placeholder="Type to search…" autofocus></div><div class="search-results" id="nx-search-results"><div style="color:var(--text-low);font-size:13px;padding:15px 0">Start typing to search your workspace.</div></div>`,ghost('Close'));wireSearch();return}
    const hits=[];
    ordersData.filter(x=>(x.id+' '+x.cust).toLowerCase().includes(query)).slice(0,5).forEach(x=>hits.push(['Order',x.id,`${x.cust} · ${money(x.total)}`,'orders']));
    customersData.filter(x=>(x.name+' '+x.email).toLowerCase().includes(query)).slice(0,5).forEach(x=>hits.push(['Customer',x.name,x.email,'customers']));
    products.filter(x=>(x.name+' '+x.sku).toLowerCase().includes(query)).slice(0,5).forEach(x=>hits.push(['Product',x.name,`${x.sku} · ${money(x.price)}`,'products']));
    invoicesData.filter(x=>(x.num+' '+x.cust).toLowerCase().includes(query)).slice(0,5).forEach(x=>hits.push(['Invoice',x.num,`${x.cust} · ${money(x.amount)}`,'invoices']));
    const html=hits.length?hits.map(h=>`<div class="search-result" data-search-goto="${h[3]}"><strong>${esc(h[0])} · ${esc(h[1])}</strong><span>${esc(h[2])}</span></div>`).join(''):`<div style="color:var(--text-low);padding:18px 0">No results for “${esc(q)}”.</div>`;
    openModal('Search results',`Results for “${q}”`,`<div class="nx-field" style="margin-bottom:12px"><input id="nx-search-input" value="${esc(q)}" placeholder="Search…"></div><div class="search-results" id="nx-search-results">${html}</div>`,ghost('Close'));wireSearch();
  }
  function wireSearch(){const i=$('#nx-search-input');if(i){i.oninput=()=>globalSearch(i.value);i.focus();}$$('[data-search-goto]').forEach(r=>r.onclick=()=>{closeModal();goto(r.dataset.searchGoto)});}

  function threeDots(type,id,x,y){
    menu.innerHTML='';const items={order:['View order','Edit order','Duplicate order','Cancel order'],invoice:['View invoice','Edit invoice','Download invoice','Mark as paid'],deal:['View deal','Edit deal','Move stage','Delete deal'],product:['View product','Edit product','Adjust stock','Delete product'],customer:['View customer','Edit customer','Create order','Export customer','Delete customer']}[type]||['View','Edit'];
    items.forEach((label,i)=>{const b=document.createElement('button');b.textContent=label;b.className=(label==='Delete deal'||label==='Cancel order'||label==='Delete product')?'danger':'';b.onclick=()=>{menu.classList.remove('open');handleContext(type,label,id)};menu.appendChild(b)});
    menu.style.left=Math.min(x,window.innerWidth-190)+'px';menu.style.top=Math.min(y,window.innerHeight-180)+'px';menu.classList.add('open');
  }
  function handleContext(type,label,id){
    if(label==='View customer'){
      const c=customersData.find(x=>x.email===id);
      if(!c){toast('Customer not found','Unable to load customer details.');return}
      openModal(
        c.name,
        c.company ? `${c.company} · ${c.city||'—'}` : (c.city||'Customer details'),
        `<div class="nx-customer-detail">
          <div class="nx-field"><label>Email</label><div>${esc(c.email||'—')}</div></div>
          <div class="nx-field"><label>Phone</label><div>${esc(c.phone||'—')}</div></div>
          <div class="nx-field"><label>Segment</label><div>${pillHtml(c.seg,segMeta[c.seg])}</div></div>
          <div class="nx-field"><label>Orders</label><div>${Number(c.orders)||0}</div></div>
          <div class="nx-field"><label>Lifetime value</label><div>${money(c.ltv||0)}</div></div>
          <div class="nx-field"><label>Last order</label><div>${esc(c.last||'—')}</div></div>
          ${c.notes ? `<div class="nx-field full"><label>Notes</label><div>${esc(c.notes)}</div></div>` : ''}
        </div>`,
        ghost('Close')
      );
      return;
    }
    if(label==='Edit customer'){const c=customersData.find(x=>x.email===id);if(c)addCustomer(c);return}
    if(label==='Create order'){createOrder();return}
    if(label==='Adjust stock'){adjustStock();return}
    if(label==='Edit product'){const p=products.find(x=>x.sku===id);if(p)editProduct(p);return}
    if(label==='Export customer'){exportReport('Customer report');return}
    if(label==='Delete product'){
      const p=products.find(x=>x.sku===id);
      if(!p){toast('Delete failed','Product could not be found.');return}
      if(!confirm(`Delete ${p.name}? This will permanently remove the product.`)) return;
      if(!window.NexusAPI || typeof NexusAPI.deleteProduct!=='function'){
        toast('Delete failed','Product delete API is not available.');
        return;
      }
      (async()=>{
        try{
          const result=await NexusAPI.deleteProduct(p.id);
          if(!result.success) throw new Error(result.message||'Product deletion failed.');
          await refreshProductsFromBackend();
          toast('Product deleted',`${p.name} was removed from PostgreSQL.`);
        }catch(error){
          console.error('NEXUS product delete failed:',error);
          toast('Product delete failed',error.message||'Unable to delete product.');
        }
      })();
      return;
    }
    if(label==='Delete customer'){
      const c=customersData.find(x=>x.email===id);
      if(!c){toast('Delete failed','Customer could not be found.');return}
      if(!confirm(`Delete ${c.name}? This will permanently remove the customer.`)) return;
      if(!window.NexusAPI || typeof NexusAPI.deleteCustomer!=='function'){
        toast('Delete failed','Customer delete API is not available.');
        return;
      }
      (async()=>{
        try{
          const result=await NexusAPI.deleteCustomer(c.id);
          if(!result.success) throw new Error(result.message||'Customer deletion failed.');
          const i=customersData.findIndex(x=>x.id===c.id);
          if(i>=0) customersData.splice(i,1);
          renderCustomersTable();
          toast('Customer deleted',`${c.name} was removed from PostgreSQL.`);
        }catch(error){
          console.error('NEXUS customer delete failed:',error);
          toast('Customer delete failed',error.message||'Unable to delete customer.');
        }
      })();
      return;
    }
    if(label==='Download invoice'){toast('Invoice download','PDF generation will be connected in the billing phase.');return}
    if(label==='Mark as paid'){toast('Invoice updated','Invoice marked as paid in the frontend state.');return}
    if(label==='Delete deal'){const i=dealsData.findIndex(x=>x.name===id);if(i>=0){dealsData.splice(i,1);renderSalesTable();toast('Deal deleted','The deal was removed from the current frontend state.')}return}
    if(label==='Cancel order'){const o=ordersData.find(x=>x.id===id);if(o){o.fulfill='cancelled';renderOrders('all');toast('Order cancelled',id+' has been cancelled.')}return}
    toast(label,`${id} · frontend action ready.`)
  }

  /* Customers top actions */
  document.addEventListener('click',e=>{
    const add=e.target.closest('#nx-add-customer');
    if(add){
      e.preventDefault();
      addCustomer();
      return;
    }

    const exp=e.target.closest('#nx-customers-export');
    if(exp){
      e.preventDefault();
      exportReport('Customer report');
    }
  });

  /* Fix existing login demo to validate the requested credentials. */
  window.__NEXUS_PRIMARY_LOGIN_HANDLED=true; $('#login-form').addEventListener('submit',async e=>{
    e.preventDefault();

    const email=$('#li-email').value.trim();
    const password=$('#li-pass').value;

    if(!email||!password){
      toast('Sign in failed','Email and password are required.');
      return;
    }

    try{
      const result=await NexusAPI.login(email,password);

      if(!result.success){
        toast('Sign in failed',result.message||'Invalid email or password.');
        return;
      }

      localStorage.setItem('nexus_token',result.token);
      localStorage.setItem('nexus_user',JSON.stringify(result.user));

      $('#view-login').style.display='none';
      $('#view-app').classList.add('active');
      if(typeof window.refreshAllNexusData==='function') window.refreshAllNexusData();
      goto('dashboard');

      toast('Welcome to NEXUS',`Signed in as ${result.user.name}.`);
    }catch(error){
      toast('Sign in failed',error.message||'Unable to connect to NEXUS server.');
    }
  });
  const forgot=$('#login-form .link-muted');if(forgot){forgot.addEventListener('click',e=>{e.preventDefault();openModal('Reset password','Enter your work email to request a reset link.',formShell([field('Work email','email',DEMO_EMAIL,'email','required')]),`<button class="btn btn-ghost btn-sm" type="button" data-close-modal>Cancel</button>${primary('Send reset link')}`);$('#nx-active-form').onsubmit=e=>{e.preventDefault();closeModal();toast('Reset requested','If the account exists, a reset link would be sent.')}})}

  /* Apply photos to visible team/profile DP slots. */
  Object.entries(NX_PHOTOS).forEach(([name,url])=>{
    document.querySelectorAll('.avatar,.user-mini,.topbar-avatar,.big-av').forEach(el=>{
      const txt=(el.textContent||'').trim();
      if(txt===name || txt.includes(name)) { el.style.backgroundImage=`url("${url}")`; el.textContent=''; }
    });
  });

  /* Topbar search + notifications + avatar */
  function notificationPage(){
    let notifScreen = document.getElementById('screen-notifications');
    if(!notifScreen){
      notifScreen = document.createElement('div');
      notifScreen.id = 'screen-notifications';
      notifScreen.className = 'screen';
      notifScreen.innerHTML = `
        <div class="page-head">
          <div>
            <h1>Notifications</h1>
            <p>Real-time operational updates, stock alerts, and billing notifications.</p>
          </div>
        </div>
        <div class="panel">
          <div class="nx-notify-list"></div>
        </div>
      `;
      const mainCol = document.querySelector('.main-col');
      if(mainCol) mainCol.appendChild(notifScreen);
    }

    const list = notifScreen.querySelector('.nx-notify-list');
    if(!list) return;

    if(window.NEXUS_LIVE_NOTIFICATIONS && window.NEXUS_LIVE_NOTIFICATIONS.length){
      list.innerHTML = window.NEXUS_LIVE_NOTIFICATIONS.map(n => `
        <div class="nx-notify ${n.unread ? 'unread' : ''}" data-goto-screen="${n.screen || 'dashboard'}">
          <div class="nx-notify-dot"></div>
          <div>
            <p><strong>${esc(n.title)}</strong> — ${esc(n.message)}</p>
            <small>${esc(n.time)}</small>
          </div>
        </div>
      `).join('');
    } else {
      list.innerHTML = `
        <div class="nx-notify" data-goto-screen="inventory">
          <div class="nx-notify-dot"></div>
          <div>
            <p><strong>System initialized</strong> — All NEXUS services connected to PostgreSQL database.</p>
            <small>Active</small>
          </div>
        </div>
      `;
    }

    list.querySelectorAll('[data-goto-screen]').forEach(el => {
      el.onclick = () => goto(el.dataset.gotoScreen);
    });

    if(window.NexusAPI?.notifications){
      NexusAPI.notifications().then(res => {
        if(res.success && Array.isArray(res.data) && res.data.length){
          window.NEXUS_LIVE_NOTIFICATIONS = res.data;
          list.innerHTML = res.data.map(n => `
            <div class="nx-notify ${n.unread ? 'unread' : ''}" data-goto-screen="${n.screen || 'dashboard'}">
              <div class="nx-notify-dot"></div>
              <div>
                <p><strong>${esc(n.title)}</strong> — ${esc(n.message)}</p>
                <small>${esc(n.time)}</small>
              </div>
            </div>
          `).join('');
          list.querySelectorAll('[data-goto-screen]').forEach(el => {
            el.onclick = () => goto(el.dataset.gotoScreen);
          });
        }
      }).catch(()=>{});
    }
  }

  const topSearch=$('.topbar .search-wrap input');if(topSearch){topSearch.addEventListener('focus',()=>globalSearch(topSearch.value));topSearch.addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();globalSearch(topSearch.value)}})}
  const topIcons=$$('.topbar .icon-btn');if(topIcons[0])topIcons[0].onclick=()=>{document.querySelectorAll('.screen').forEach(s=>s.classList.remove('active'));notificationPage();$('#screen-notifications').classList.add('active');$('#topbar-title').textContent='Notifications';window.scrollTo(0,0)};
  const calculatorBtn=$('#nexus-calculator-btn');
  if(calculatorBtn) calculatorBtn.onclick=()=>openCalculator();

  if(topIcons[1])topIcons[1].onclick=()=>openCalculator();
  const avatar=$('.topbar-avatar');if(avatar)avatar.onclick=()=>goto('settings');


  /* Standalone business calculator. Available from the topbar and usable anywhere in NEXUS. */
  function openCalculator(){
    let expr='';
    let display='0';
    let justEvaluated=false;
    const history=[];

    const renderCalc=()=>{
      const v=$('#nx-calc-value');
      const ex=$('#nx-calc-expression');
      if(v) v.value=display;
      if(ex) ex.textContent=expr || 'Ready';
    };

    const formatNumber=(n)=>{
      if(!Number.isFinite(n)) return 'Error';
      const rounded=Math.abs(n)<1e-12 ? 0 : Number(n.toFixed(10));
      return rounded.toLocaleString('en-IN',{maximumFractionDigits:10});
    };

    const evaluate=()=>{
      let clean=expr.replace(/,/g,'').replace(/×/g,'*').replace(/÷/g,'/');
      clean=clean.replace(/(\d+(?:\.\d+)?)%/g,'($1/100)');
      if(!clean || !/^[0-9+\-*/().%\s]+$/.test(clean)) throw new Error('Invalid calculation');
      // Evaluate only a restricted arithmetic expression generated by the calculator buttons.
      const result=Function('"use strict";return ('+clean+')')();
      if(!Number.isFinite(result)) throw new Error('Invalid calculation');
      return result;
    };

    const pushHistory=(expression,result)=>{
      history.unshift({expression,result});
      if(history.length>8) history.pop();
      const h=$('#nx-calc-history');
      if(!h)return;
      h.innerHTML=history.map((x,i)=>
        `<div class="nx-calc-history-item" data-calc-history="${i}">${esc(x.expression)} = <b>${esc(formatNumber(x.result))}</b></div>`
      ).join('');
    };

    const press=(key)=>{
      if(key==='AC'){
        expr=''; display='0'; justEvaluated=false; renderCalc(); return;
      }
      if(key==='⌫'){
        if(justEvaluated){expr='';display='0';justEvaluated=false;}
        else{expr=expr.slice(0,-1);display=expr||'0';}
        renderCalc(); return;
      }
      if(key==='='){
        try{
          if(!expr)return;
          const original=expr;
          const result=evaluate();
          display=formatNumber(result);
          expr=String(result);
          justEvaluated=true;
          pushHistory(original,result);
          renderCalc();
        }catch{
          display='Error';
          justEvaluated=true;
          renderCalc();
        }
        return;
      }
      if(key==='%'){
        if(justEvaluated){expr=display.replace(/,/g,'');justEvaluated=false;}
        expr += '%';
        display=expr;
        renderCalc(); return;
      }

      const isDigit=/^\d$/.test(key);
      const isDot=key==='.';
      const isOp=['+','−','×','÷','(',')'].includes(key);

      if(justEvaluated && (isDigit||isDot)){
        expr=''; display='0'; justEvaluated=false;
      }else if(justEvaluated && isOp){
        expr=expr.replace(/,/g,''); justEvaluated=false;
      }

      if(isDigit||isDot||isOp){
        const last=expr.slice(-1);
        if(isOp && ['+','−','×','÷'].includes(key) && ['+','−','×','÷'].includes(last)){
          expr=expr.slice(0,-1);
        }
        expr += key;
        display=expr || '0';
        renderCalc();
      }
    };

    window.__NEXUS_CALC_PRESS=press;
    openModal(
      'Calculator',
      'Quick business calculations without leaving NEXUS.',
      `<div class="nx-calc-layout">
        <div class="nx-calc">
          <div class="nx-calc-display">
            <div class="nx-calc-expression" id="nx-calc-expression">Ready</div>
            <input class="nx-calc-value nx-calc-input" id="nx-calc-value" value="0" aria-label="Calculator input" autocomplete="off" spellcheck="false">
          </div>
          <div class="nx-calc-grid">
            <button class="danger" data-calc="AC">AC</button>
            <button data-calc="(">(</button>
            <button data-calc=")">)</button>
            <button class="op" data-calc="÷">÷</button>
            <button data-calc="7">7</button><button data-calc="8">8</button><button data-calc="9">9</button><button class="op" data-calc="×">×</button>
            <button data-calc="4">4</button><button data-calc="5">5</button><button data-calc="6">6</button><button class="op" data-calc="−">−</button>
            <button data-calc="1">1</button><button data-calc="2">2</button><button data-calc="3">3</button><button class="op" data-calc="+">+</button>
            <button data-calc="0">0</button><button data-calc=".">.</button><button data-calc="%">%</button><button class="equals" data-calc="=">=</button>
            <button data-calc="⌫">⌫</button>
          </div>
          <div class="nx-calc-history" id="nx-calc-history">
            <div class="nx-calc-history-title">History</div>
          </div>
          <div class="nx-calc-foot">
            <button class="btn btn-ghost btn-sm" type="button" id="nx-calc-history-toggle">History</button>
          </div>
        </div>

        <div class="nx-converter-panel">
          <div class="nx-calc-converter-head">
            <div class="nx-calc-converter-title">Business Converter</div>
            <div class="nx-calc-converter-sub">Convert common business values instantly</div>
          </div>

          <div class="nx-converter-field">
            <label>Conversion type</label>
            <select id="nx-convert-type">
              <option value="currency">Currency</option>
              <option value="weight">Weight</option>
              <option value="length">Length</option>
              <option value="volume">Volume</option>
              <option value="temperature">Temperature</option>
            </select>
          </div>

          <div class="nx-converter-field">
            <label>Amount</label>
            <input id="nx-convert-value" type="number" step="any" value="1" inputmode="decimal" placeholder="Enter amount">
          </div>

          <div class="nx-converter-field">
            <label>From</label>
            <select id="nx-convert-from"></select>
          </div>

          <button type="button" class="nx-converter-swap" id="nx-convert-swap" title="Swap From and To">⇄ Swap</button>

          <div class="nx-converter-field">
            <label>To</label>
            <select id="nx-convert-to"></select>
          </div>

          <div class="nx-converter-result" id="nx-convert-result">Enter an amount to convert.</div>
          <div class="nx-converter-rate" id="nx-converter-rate"></div>
        </div>
      </div>`,
      `<button class="btn btn-ghost btn-sm" type="button" data-close-modal>Close</button>`,
      true
    );


    const converterUnits={
      currency:[
        ['INR','₹ Indian Rupee'],['USD','$ US Dollar'],['EUR','€ Euro'],['GBP','£ British Pound'],
        ['AED','د.إ UAE Dirham'],['SGD','S$ Singapore Dollar'],['AUD','A$ Australian Dollar'],['CAD','C$ Canadian Dollar']
      ],
      weight:[['kg','Kilogram'],['g','Gram'],['lb','Pound'],['tonne','Metric Tonne']],
      length:[['m','Metre'],['cm','Centimetre'],['km','Kilometre'],['ft','Foot'],['in','Inch']],
      volume:[['L','Litre'],['mL','Millilitre'],['gal','US Gallon']],
      temperature:[['C','Celsius'],['F','Fahrenheit'],['K','Kelvin']]
    };

    // Indicative offline rates relative to INR. The calculator remains usable without an internet connection.
    const converterRates={
      INR:1,USD:0.01125,EUR:0.00965,GBP:0.00835,AED:0.0413,SGD:0.0145,AUD:0.0170,CAD:0.0152,
      kg:1,g:1000,lb:2.20462262185,tonne:0.001,
      m:1,cm:100,km:0.001,ft:3.280839895,in:39.37007874,
      L:1,mL:1000,gal:0.264172052
    };

    const populateConverter=()=>{
      const type=$('#nx-convert-type'),from=$('#nx-convert-from'),to=$('#nx-convert-to');
      if(!type||!from||!to)return;
      const units=converterUnits[type.value];
      from.innerHTML=units.map(([code,name])=>`<option value="${code}">${name}</option>`).join('');
      to.innerHTML=units.map(([code,name])=>`<option value="${code}">${name}</option>`).join('');

      if(type.value==='currency'){
        from.value='INR';
        to.value='USD';
      }else{
        from.value=units[0][0];
        to.value=units[1] ? units[1][0] : units[0][0];
      }
      convertNow();
    };

    const convertNow=()=>{
      const type=$('#nx-convert-type')?.value;
      const amount=Number($('#nx-convert-value')?.value);
      const from=$('#nx-convert-from')?.value;
      const to=$('#nx-convert-to')?.value;
      const resultEl=$('#nx-convert-result');
      const rateEl=$('#nx-converter-rate');

      if(!resultEl)return;
      if(!Number.isFinite(amount)){
        resultEl.innerHTML='Enter an amount to convert.';
        if(rateEl)rateEl.textContent='';
        return;
      }

      let result=0;
      let rateText='';

      if(type==='temperature'){
        const c=from==='C' ? amount : from==='F' ? (amount-32)*5/9 : amount-273.15;
        result=to==='C' ? c : to==='F' ? c*9/5+32 : c+273.15;
      }else{
        result=amount*(converterRates[to]/converterRates[from]);
        const oneUnit=converterRates[to]/converterRates[from];
        rateText=`1 ${from} ≈ ${Number(oneUnit.toFixed(8)).toLocaleString('en-IN',{maximumFractionDigits:8})} ${to}`;
      }

      const pretty=Number(result.toFixed(8)).toLocaleString('en-IN',{maximumFractionDigits:8});
      const targetName=(converterUnits[type].find(x=>x[0]===to)||['',to])[1];

      resultEl.innerHTML=`<b>${esc(pretty)}</b>${esc(targetName)}`;
      if(rateEl)rateEl.textContent=rateText;
    };

    $('#nx-convert-type')?.addEventListener('change',populateConverter);
    $('#nx-convert-value')?.addEventListener('input',convertNow);
    $('#nx-convert-from')?.addEventListener('change',convertNow);
    $('#nx-convert-to')?.addEventListener('change',convertNow);
    $('#nx-convert-swap')?.addEventListener('click',()=>{
      const from=$('#nx-convert-from'),to=$('#nx-convert-to');
      if(from&&to){const old=from.value;from.value=to.value;to.value=old;convertNow();}
    });
    populateConverter();


    const calcInput=$('#nx-calc-value');
    if(calcInput){
      calcInput.addEventListener('input',()=>{
        const raw=calcInput.value;
        if(/^[0-9+\-*/().%×÷−\s,]*$/.test(raw)){
          expr=raw.replace(/,/g,'');
          display=raw||'0';
          justEvaluated=false;
          const ex=$('#nx-calc-expression');
          if(ex)ex.textContent=expr||'Ready';
        }else{
          calcInput.value=display;
        }
      });
      calcInput.addEventListener('keydown',e=>{
        if(e.key==='Enter'){
          e.preventDefault();
          press('=');
        }
        if(e.key==='Escape'){
          e.preventDefault();
          closeModal();
        }
      });
      setTimeout(()=>calcInput.focus(),50);
      calcInput.select();
    }

    // Use event delegation so calculator keys remain reliable even if the modal DOM is rebuilt.
    const calcRoot=$('#nx-modal');
    if(calcRoot){
      calcRoot.addEventListener('click',e=>{
        const btn=e.target.closest('[data-calc]');
        if(!btn)return;
        e.preventDefault();
        e.stopPropagation();
        press(btn.dataset.calc);
      });
    }
    $$('#nx-modal [data-calc]').forEach(btn=>{
      btn.onclick=e=>{
        e.preventDefault();
        e.stopPropagation();
        press(btn.dataset.calc);
      };
    });

    const toggle=$('#nx-calc-history-toggle');
    if(toggle) toggle.onclick=()=>{
      const h=$('#nx-calc-history');
      if(h) h.classList.toggle('open');
    };

    const h=$('#nx-calc-history');
    if(h) h.addEventListener('click',e=>{
      const item=e.target.closest('[data-calc-history]');
      if(!item)return;
      const x=history[+item.dataset.calcHistory];
      if(!x)return;
      expr=String(x.result);
      display=formatNumber(x.result);
      justEvaluated=true;
      renderCalc();
    });

    const keyHandler=e=>{
      if(!$('#nx-modal-backdrop')?.classList.contains('open')) return;
      if(!$('#nx-calc-value')) return;
      const map={
        '*':'×','/':'÷','-':'−','+':'+','(':'(',')':')','%':'%',
        'Enter':'=','=':'=','Backspace':'⌫','Escape':null
      };
      if(/^\d$/.test(e.key)||e.key==='.'||map[e.key]){
        if(e.key==='Escape')return;
        const active=e.target;
        const isFormField=active && (active.matches('input, textarea, select') || active.isContentEditable);
        const calcField=active && active.id==='nx-calc-value';
        if(isFormField && !calcField)return;
        e.preventDefault();
        press(/^\d$/.test(e.key)||e.key==='.'?e.key:map[e.key]);
      }
    };
    document.addEventListener('keydown',keyHandler,{once:false});

    // Remove the handler when the modal is closed.
    const observer=new MutationObserver(()=>{
      if(!$('#nx-modal-backdrop')?.classList.contains('open')){
        document.removeEventListener('keydown',keyHandler);
        if(window.__NEXUS_CALC_PRESS===press) delete window.__NEXUS_CALC_PRESS;
        observer.disconnect();
      }
    });
    observer.observe($('#nx-modal-backdrop'),{attributes:true,attributeFilter:['class']});
  }

  /* Make requested action buttons live by their visible labels. */
  document.addEventListener('click',e=>{
    const b=e.target.closest('button');
    if(!b)return;

    /* Do not let modal buttons trigger global page actions. */
    if(b.closest('#nx-modal'))return;

    const t=b.textContent.trim().toLowerCase();
    if(t==='new order'||t==='create order'){createOrder();return}
    if(t==='create invoice'){createInvoice();return}
    if(t==='new deal'){newDeal();return}
    if(t==='add product'){addProduct();return}
    if(t==='adjust stock'){adjustStock();return}
    if(t==='transfer stock'){transferStock();return}
    if(t==='add customer'){addCustomer();return}
    if(t==='export report'||t==='export'){exportReport();return}
    function applyProfilePhoto(src){
      if(!src)return;
      $$('.big-av,.topbar-avatar,.user-mini').forEach(el=>{
        el.style.backgroundImage=`url("${src}")`;
        el.style.backgroundSize='cover';
        el.style.backgroundPosition='center';
        el.style.backgroundRepeat='no-repeat';
        el.textContent='';
      });
    }
    function loadSavedProfilePhoto(){
      try{
        const src=localStorage.getItem('nexus_profile_photo');
        if(src)applyProfilePhoto(src);
      }catch(err){}
    }
    loadSavedProfilePhoto();

    if(t==='upload photo'){
      openModal('Upload profile photo','Choose a JPG or PNG image up to 4MB.',`<div class="nx-field"><label>Photo</label><input id="nx-photo" type="file" accept="image/png,image/jpeg"><div style="margin-top:12px;display:flex;align-items:center;gap:12px"><img id="nx-photo-preview" class="photo-preview"><span style="color:var(--text-low);font-size:12px">Preview appears here.</span></div></div>`,ghost('Cancel')+`<button class="btn btn-primary btn-sm" type="button" id="nx-save-photo">Save photo</button>`);
      const input=$('#nx-photo'), preview=$('#nx-photo-preview'), save=$('#nx-save-photo');
      input.onchange=ev=>{
        const f=ev.target.files[0];
        if(!f)return;
        if(f.size>4*1024*1024){toast('Photo too large','Maximum size is 4MB.');input.value='';return}
        const reader=new FileReader();
        reader.onload=()=>{preview.src=reader.result;preview.style.display='block'};
        reader.readAsDataURL(f);
      };
      save.onclick=()=>{
        const f=input.files[0];
        if(!f){toast('Choose a photo','Select a JPG or PNG first.');return}
        const reader=new FileReader();
        reader.onerror=()=>toast('Photo save failed','The image could not be read.');
        reader.onload=()=>{
          const img=new Image();
          img.onload=()=>{
            try{
              const max=512, scale=Math.min(1,max/Math.max(img.width,img.height));
              const canvas=document.createElement('canvas');
              canvas.width=Math.max(1,Math.round(img.width*scale));
              canvas.height=Math.max(1,Math.round(img.height*scale));
              const ctx=canvas.getContext('2d');
              ctx.drawImage(img,0,0,canvas.width,canvas.height);
              const data=canvas.toDataURL('image/jpeg',0.82);
              localStorage.setItem('nexus_profile_photo',data);
              applyProfilePhoto(data);
              closeModal();
              toast('Profile photo saved','Your photo will stay after refresh.');
            }catch(err){toast('Photo save failed','Browser storage is full or unavailable.');}
          };
          img.onerror=()=>toast('Photo save failed','The selected image is invalid.');
          img.src=reader.result;
        };
        reader.readAsDataURL(f);
      };
      return;
    }
    if(t==='save changes'){toast('Changes saved','Your settings are updated in the current frontend session.');return}
  });

  /* Add three-dot action buttons to existing dynamic tables. */
  function patchOrders(){const table=$('#orders-table table');if(!table||table.dataset.patched)return;table.dataset.patched='1';const th=document.createElement('th');th.textContent='';table.tHead.rows[0].appendChild(th);table.querySelectorAll('tbody tr').forEach((tr,i)=>{const o=ordersData[i];const td=document.createElement('td');td.innerHTML=`<button class="btn btn-ghost btn-sm nx-more" data-type="order" data-id="${esc(o?.id||'')}">•••</button>`;tr.appendChild(td)})}
  const originalRenderOrders=window.renderOrders;
  /* Existing renderOrders is lexical, so use a small observer to patch after filter changes. */
  new MutationObserver(()=>patchOrders()).observe($('#orders-table'),{childList:true,subtree:true});
  new MutationObserver(()=>{
    const p=$('#products-table');if(p&&!p.dataset.patched)renderProductsTable();
    const c=$('#customers-table');if(c&&!c.dataset.patched&&window.NEXUS_LIVE_CUSTOMERS)renderCustomersTable();
  }).observe($('#view-app'),{childList:true,subtree:true});

  document.addEventListener('click',e=>{const more=e.target.closest('.nx-more');if(more){e.stopPropagation();const r=more.getBoundingClientRect();threeDots(more.dataset.type,more.dataset.id,r.left,r.bottom)}});
  document.addEventListener('click',e=>{if(!e.target.closest('.context-menu')&&!e.target.closest('.nx-more'))menu.classList.remove('open')});

  /* Existing nav title map gets notification support. */
  const oldGoto=window.goto;
  if(typeof oldGoto==='function'){
    window.goto=function(name){if(name==='notifications'){$('#topbar-title').textContent='Notifications';document.querySelectorAll('.screen').forEach(s=>s.classList.remove('active'));notificationPage();$('#screen-notifications').classList.add('active');document.querySelectorAll('.nav-item[data-screen]').forEach(n=>n.classList.remove('active'));window.scrollTo(0,0);return}oldGoto(name)};
  }
  /* Expose actions for future modules. */
  window.NEXUS_UI={createOrder,createInvoice,newDeal,addProduct,adjustStock,transferStock,addCustomer,exportReport,globalSearch,toast};
  // Calculator fallback: handles keys at document level without depending on individual button bindings.
  document.addEventListener('click',e=>{
    const btn=e.target.closest('#nx-modal [data-calc]');
    if(!btn)return;
    if(typeof window.__NEXUS_CALC_PRESS==='function') window.__NEXUS_CALC_PRESS(btn.dataset.calc);
  });
})();
