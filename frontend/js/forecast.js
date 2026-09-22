(function(){
  async function loadNexusForecast(){
    try{
      const token = localStorage.getItem('nexus_token');
      if(!token) return;

      const r = await fetch('http://localhost:8000/analytics/forecast',{
        headers:{Authorization:'Bearer '+token}
      });

      if(!r.ok) return;

      const data = await r.json();
      if(!data.success) return;

      window.NEXUS_FORECAST = data;

      document.querySelectorAll('[data-forecast-daily]').forEach(el=>{
        el.textContent = '₹' + Number(data.forecast_daily_revenue)
          .toLocaleString('en-IN',{maximumFractionDigits:0});
      });

      document.querySelectorAll('[data-forecast-month]').forEach(el=>{
        el.textContent = '₹' + Number(data.forecast_30_day_revenue)
          .toLocaleString('en-IN',{maximumFractionDigits:0});
      });

      document.querySelectorAll('[data-forecast-trend]').forEach(el=>{
        el.textContent = data.trend;
      });

      document.querySelectorAll('[data-forecast-confidence]').forEach(el=>{
        el.textContent = data.confidence;
      });

      console.log('NEXUS forecast loaded:',data);
    }catch(err){
      console.error('Forecast error:',err);
    }
  }

  window.loadNexusForecast = loadNexusForecast;

  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded',loadNexusForecast);
  }else{
    loadNexusForecast();
  }
})();

(function(){

  function renderForecastUI(data){
    const analytics=document.getElementById('screen-analytics');
    if(!analytics || document.getElementById('nexus-forecast-card')) return;

    const card=document.createElement('div');
    card.id='nexus-forecast-card';
    card.className='nx-forecast-card';

    const history=(data.history||[]).slice(-14);
    const max=Math.max(...history.map(x=>Number(x.revenue)||0),1);

    card.innerHTML=`
      <div class="panel-head" style="padding:0;border:0;">
        <div>
          <h3>AI Revenue Forecast</h3>
          <div class="sub">Python Intelligence Engine · based on historical sales</div>
        </div>
        <span class="pill">LIVE</span>
      </div>

      <div class="nx-forecast-grid">
        <div class="nx-forecast-stat">
          <span>Forecast / day</span>
          <strong data-forecast-daily>₹0</strong>
        </div>

        <div class="nx-forecast-stat">
          <span>Forecast / 30 days</span>
          <strong data-forecast-month>₹0</strong>
        </div>

        <div class="nx-forecast-stat">
          <span>Trend</span>
          <strong data-forecast-trend>—</strong>
        </div>

        <div class="nx-forecast-stat">
          <span>Confidence</span>
          <strong data-forecast-confidence>—</strong>
        </div>
      </div>

      <div class="nx-forecast-chart">
        ${history.map(x=>{
          const value=Number(x.revenue)||0;
          const height=Math.max(4,(value/max)*100);
          return `<div class="nx-forecast-bar"
            style="height:${height}%"
            title="${x.date} · ₹${value.toLocaleString('en-IN')}"></div>`;
        }).join('')}
      </div>
    `;

    analytics.appendChild(card);

    if(window.NEXUS_FORECAST){
      const d=window.NEXUS_FORECAST;

      const daily=card.querySelector('[data-forecast-daily]');
      const month=card.querySelector('[data-forecast-month]');
      const trend=card.querySelector('[data-forecast-trend]');
      const confidence=card.querySelector('[data-forecast-confidence]');

      daily.textContent='₹'+Number(d.forecast_daily_revenue||0)
        .toLocaleString('en-IN',{maximumFractionDigits:0});

      month.textContent='₹'+Number(d.forecast_30_day_revenue||0)
        .toLocaleString('en-IN',{maximumFractionDigits:0});

      trend.textContent=d.trend||'stable';
      confidence.textContent=d.confidence||'low';
    }
  }

  const originalLoad=window.loadNexusForecast;

  window.loadNexusForecast=async function(){
    if(originalLoad) await originalLoad();

    if(window.NEXUS_FORECAST){
      renderForecastUI(window.NEXUS_FORECAST);
    }
  };

  document.addEventListener('click',function(e){
    const nav=e.target.closest('[data-screen],.nav-item');
    if(!nav) return;

    setTimeout(()=>{
      if(window.NEXUS_FORECAST){
        renderForecastUI(window.NEXUS_FORECAST);
      }
    },100);
  });

  setTimeout(()=>{
    if(window.NEXUS_FORECAST){
      renderForecastUI(window.NEXUS_FORECAST);
    }
  },1200);

})();
