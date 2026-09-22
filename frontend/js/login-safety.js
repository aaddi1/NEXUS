(function(){
  function ready(fn){if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',fn);else fn()}
  ready(function(){
    const form=document.getElementById('login-form');
    if(!form || form.dataset.nexusLoginSafety) return;
    form.dataset.nexusLoginSafety='1';
    form.addEventListener('submit',async function(e){
      if(window.__NEXUS_PRIMARY_LOGIN_HANDLED){return;}
      e.preventDefault();
      const email=(document.getElementById('li-email')?.value||'').trim();
      const password=document.getElementById('li-pass')?.value||'';
      if(!email||!password){alert('Email and password are required.');return;}
      try{
        const r=await fetch('http://localhost:5000/api/auth/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email,password})});
        const data=await r.json();
        if(!r.ok||!data.success) throw new Error(data.message||'Invalid email or password.');
        localStorage.setItem('nexus_token',data.token);
        localStorage.setItem('nexus_user',JSON.stringify(data.user));
        const login=document.getElementById('view-login'), app=document.getElementById('view-app');
        if(login) login.style.display='none';
        if(app) app.classList.add('active');
        if(typeof window.refreshAllNexusData==='function') window.refreshAllNexusData();
        if(typeof window.goto==='function') window.goto('dashboard');
      }catch(err){alert('Sign in failed: '+err.message)}
    });
  });
})();
