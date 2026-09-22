/* =========================================================
   NEXUS FAILSAFE UI LAYER
   This layer is deliberately independent of the main IIFE.
   It keeps navigation, seeded team data, charts and primary
   actions alive even if an optional visual dependency fails.
========================================================= */
(function(){
  const q = s => document.querySelector(s);
  const qa = s => Array.from(document.querySelectorAll(s));
  const money = n => '₹' + Number(n || 0).toLocaleString('en-IN', {maximumFractionDigits:0});

  const team = [
    ['Aryan Sharma','aryan@nexus.com','Owner'],
    ['Riya Mehta','riya@nexus.com','Sales Lead'],
    ['Rahul Kapoor','rahul@nexus.com','Inventory Manager'],
    ['Arjun Verma','arjun@nexus.com','Finance Lead'],
    ['Priya Nair','priya@nexus.com','Sales']
  ];

  function esc(v){
    return String(v ?? '').replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
  }

  function ensureTeam(){
    const box=q('#team-table');
    if(!box) return;
    if(box.innerHTML.trim()) return;
    box.innerHTML = `<table class="data-table"><thead><tr><th>Member</th><th>Role</th><th>Status</th></tr></thead><tbody>${
      team.map((m,i)=>`<tr>
        <td><div class="cell-main"><div class="avatar-sm">${m[0].split(' ').map(x=>x[0]).join('')}</div><div><div class="cell-title">${m[0]}</div><div class="cell-sub">${m[1]}</div></div></div></td>
        <td>${m[2]}</td><td><span class="pill pill--ok">Active</span></td>
      </tr>`).join('')
    }</tbody></table>`;
  }

  function ensureChart(id, type){
    const el=q('#'+id);
    if(!el || el.innerHTML.trim()) return;
    if(type==='line'){
      const vals=[312,338,301,355,362,340,378,395,371,410,428,441];
      const max=Math.max(...vals), min=Math.min(...vals), range=max-min||1;
      const pts=vals.map((v,i)=>`${8+i*(544/11)},${142-((v-min)/range)*118}`).join(' ');
      el.innerHTML=`<svg viewBox="0 0 560 150" width="100%" height="150" preserveAspectRatio="none">
        <polyline points="${pts}" fill="none" stroke="var(--green)" stroke-width="3"/>
        <line x1="8" y1="142" x2="552" y2="142" stroke="var(--border)" stroke-width="1"/>
      </svg>`;
    } else if(type==='bar'){
      const vals=[182,124,64,210], labels=['Produce','Bev.','Bakery','Packaged'], max=210;
      el.innerHTML=`<div style="display:flex;align-items:flex-end;gap:20px;height:170px;padding:10px 20px 0">${
        vals.map((v,i)=>`<div style="flex:1;text-align:center"><div style="height:${Math.max(8,v/max*135)}px;background:var(--green);border-radius:6px 6px 2px 2px"></div><div style="font-size:11px;color:var(--text-mid);margin-top:8px">${labels[i]}</div></div>`).join('')
      }</div>`;
    } else if(type==='growth'){
      const a=[8,10,14,12,17,20,22,19,24,27,25,29];
      const b=[20,22,21,25,27,26,30,32,31,35,37,39];
      const path = arr => arr.map((v,i)=>`${8+i*(504/11)},${140-v*3.1}`).join(' ');
      el.innerHTML=`<svg viewBox="0 0 520 150" width="100%" height="150" preserveAspectRatio="none">
        <polyline points="${path(a)}" fill="none" stroke="var(--green)" stroke-width="2.5"/>
        <polyline points="${path(b)}" fill="none" stroke="var(--green-2)" stroke-width="2.5"/>
        <line x1="8" y1="140" x2="512" y2="140" stroke="var(--border)" stroke-width="1"/>
      </svg>`;
    } else if(type==='donut'){
      el.innerHTML=`<div style="width:120px;height:120px;border-radius:50%;background:conic-gradient(var(--green) 0 44%,var(--green-2) 44% 75%,#527d61 75% 91%,#314c3b 91% 100%);position:relative">
        <div style="position:absolute;inset:27px;border-radius:50%;background:var(--panel);"></div>
      </div>`;
    }
  }

  function modal(title, body, buttons=''){
    let bd=q('#nx-modal-backdrop');
    if(!bd){
      document.body.insertAdjacentHTML('beforeend',`<div class="modal-backdrop" id="nx-modal-backdrop"><div class="nx-modal"><div class="nx-modal-head"><div><h3 id="nx-modal-title"></h3><p id="nx-modal-subtitle"></p></div><button class="nx-close" id="nx-modal-close">×</button></div><div class="nx-modal-body" id="nx-modal-body"></div><div class="nx-modal-foot" id="nx-modal-foot"></div></div></div>`);
      bd=q('#nx-modal-backdrop');
      q('#nx-modal-close').onclick=()=>bd.classList.remove('open');
      bd.onclick=e=>{if(e.target===bd)bd.classList.remove('open')};
    }
    q('#nx-modal-title').textContent=title;
    q('#nx-modal-subtitle').textContent='';
    q('#nx-modal-body').innerHTML=body;
    q('#nx-modal-foot').innerHTML=buttons || `<button class="btn btn-primary btn-sm" type="button" id="nx-ok">Done</button>`;
    const ok=q('#nx-ok'); if(ok) ok.onclick=()=>bd.classList.remove('open');
    bd.classList.add('open');
  }

  function apiAction(name){
    const api=window.NEXUS_UI||{};
    if(typeof api[name]==='function'){ api[name](); return true; }
    return false;
  }

  function actionFallback(name){
    const configs={
      'new order':['Create new order','Select a customer and add products to create an order.'],
      'create order':['Create new order','Select a customer and add products to create an order.'],
      'create invoice':['Create invoice','Create a draft invoice for a customer.'],
      'new deal':['New deal','Create a sales opportunity and assign its stage.'],
      'add product':['Add product','Add a new product to the catalog.'],
      'adjust stock':['Adjust stock','Increase or decrease stock for a product.'],
      'transfer stock':['Transfer stock','Move stock between Mumbai, Delhi and Bengaluru warehouses.'],
      'add customer':['Add customer','Add a new customer to the workspace.'],
      'export report':['Export report','The current report is ready to export.']
    };
    const c=configs[name];
    if(c) modal(c[0],`<p style="color:var(--text-mid);margin:0">${c[1]}</p>`);
  }

  function bind(){
    ensureTeam();
    ensureChart('revenue-chart','line');
    ensureChart('analytics-line-chart','line');
    ensureChart('sales-bar-chart','bar');
    ensureChart('analytics-bar-chart','bar');
    ensureChart('analytics-growth-chart','growth');
    ensureChart('analytics-donut','donut');

    document.addEventListener('click',function(e){
      const nav=e.target.closest('.nav-item[data-screen]');
      if(nav){
        e.preventDefault();
        qa('.nav-item[data-screen]').forEach(x=>x.classList.remove('active'));
        nav.classList.add('active');
        qa('.screen').forEach(x=>x.classList.remove('active'));
        const target=q('#screen-'+nav.dataset.screen);
        if(target) target.classList.add('active');
        const title=q('#topbar-title');
        if(title) title.textContent=(nav.dataset.screen||'').replace(/-/g,' ').replace(/\b\w/g,c=>c.toUpperCase());
        window.scrollTo(0,0);
        return;
      }

      const b=e.target.closest('button');
      if(!b) return;
      const t=(b.textContent||'').trim().toLowerCase();

      /* Modal buttons belong to the active modal/form. Never let the global page-action dispatcher intercept them. */
      if(b.closest('#nx-modal')) return;

      const names=['new order','create order','create invoice','new deal','add product','adjust stock','transfer stock','add customer','export report'];
      if(names.includes(t)){
        e.preventDefault();
        e.stopImmediatePropagation();

        const actionName = t
          .replaceAll(' ','')
          .replace('neworder','newOrder')
          .replace('createorder','createOrder')
          .replace('createinvoice','createInvoice')
          .replace('newdeal','newDeal')
          .replace('addproduct','addProduct')
          .replace('adjuststock','adjustStock')
          .replace('transferstock','transferStock')
          .replace('addcustomer','addCustomer')
          .replace('exportreport','exportReport');

        if(actionName === 'addCustomer'){
          if(typeof window.NEXUS_UI?.addCustomer === 'function'){
            window.NEXUS_UI.addCustomer();
          }
          return;
        }

        if(!apiAction(actionName)){
          actionFallback(t);
        }
      }
    }, true);
  }

  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',bind);
  else bind();
})();
