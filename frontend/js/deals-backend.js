(function(){
  const API='http://localhost:5000/api';
  const stageLabel={lead:'Discovery',proposal:'Proposal',negotiation:'Negotiation',closed_won:'Closed won',closed:'Closed won'};
  const stageKey={Discovery:'lead',Proposal:'proposal',Negotiation:'negotiation','Closed won':'closed_won'};
  function token(){return localStorage.getItem('nexus_token')||''}
  async function request(path,opts={}){
    const r=await fetch(API+path,{...opts,headers:{'Content-Type':'application/json',...(token()?{Authorization:'Bearer '+token()}:{}),...(opts.headers||{})}});
    const d=await r.json().catch(()=>({}));
    if(!r.ok)throw new Error(d.message||'Deals API request failed');
    return d;
  }
  function rows(data){
    const arr=data?.data||data?.deals||data||[];
    return Array.isArray(arr)?arr:[];
  }
  async function load(){
    try{
      const data=await request('/deals');
      const arr=rows(data);
      if(!Array.isArray(window.dealsData))return;
      window.dealsData.length=0;
      arr.forEach(d=>window.dealsData.push({
        id:d.id,
        name:d.name||'Untitled deal',
        acct:d.customer_name||d.company||d.customer?.name||'—',
        stage:stageLabel[String(d.stage||'').toLowerCase()]||d.stage||'Discovery',
        value:Number(d.value)||0,
        owner:d.owner_name||d.owner||'Aryan Sharma',
        close:d.close_date||d.close||d.created_at?.slice(0,10)||'—',
        probability:Number(d.probability)||0
      }));
      if(typeof window.renderSalesTable==='function')window.renderSalesTable();
      else if(typeof renderSalesTable==='function')renderSalesTable();
      const pipe=document.getElementById('sales-table');
      if(pipe) pipe.dataset.backend='1';
      return arr;
    }catch(err){console.error('NEXUS deals load failed:',err)}
  }
  async function create(payload){return request('/deals',{method:'POST',body:JSON.stringify(payload)})}
  async function update(id,payload){return request('/deals/'+encodeURIComponent(id),{method:'PUT',body:JSON.stringify(payload)})}
  async function remove(id){return request('/deals/'+encodeURIComponent(id),{method:'DELETE'})}
  window.NexusDeals={load,create,update,remove,stageKey};
  document.addEventListener('DOMContentLoaded',()=>setTimeout(load,250));
  document.addEventListener('click',e=>{
    const nav=e.target.closest('[data-screen],.nav-item,.side-nav-item');
    if(nav && /deal|sales/i.test((nav.textContent||'')+' '+(nav.dataset.screen||'')))setTimeout(load,100);
  });
})();
