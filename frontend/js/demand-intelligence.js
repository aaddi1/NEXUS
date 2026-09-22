(function(){
  let demandProducts = [];
  let activeRisk = "all";

  function inr(n){
    return '₹' + Number(n || 0).toLocaleString('en-IN',{maximumFractionDigits:0});
  }

  function riskLabel(r){
    return r === "critical" ? "Critical" :
           r === "high" ? "High" :
           r === "medium" ? "Medium" : "Low";
  }

  function renderDemand(){
    const host = document.getElementById("screen-analytics");
    if(!host) return;

    let wrap = document.getElementById("nx-demand-intelligence");

    if(!wrap){
      wrap = document.createElement("div");
      wrap.id = "nx-demand-intelligence";
      wrap.className = "nx-demand-wrap";

      host.appendChild(wrap);
    }

    const filtered = activeRisk === "all"
      ? demandProducts
      : demandProducts.filter(p => p.risk === activeRisk);

    const critical = demandProducts.filter(p => p.risk === "critical").length;
    const high = demandProducts.filter(p => p.risk === "high").length;

    wrap.innerHTML = `
      <div class="nx-alert-box">
        <div class="nx-alert-title">Inventory Intelligence</div>
        <div>
          ${critical ? critical + " critical stock alert(s)" : "No critical stock alerts"}
          ${high ? " · " + high + " high-risk product(s)" : ""}
        </div>
      </div>

      <div class="nx-demand-head">
        <h3>Demand Intelligence</h3>
        <div class="nx-demand-filters">
          ${["all","critical","high","medium","low"].map(r => `
            <button class="nx-demand-filter ${activeRisk===r?'active':''}" data-risk="${r}">
              ${r === "all" ? "All" : riskLabel(r)}
            </button>
          `).join("")}
        </div>
      </div>

      <div style="overflow:auto">
        <table class="nx-demand-table">
          <thead>
            <tr>
              <th>Product</th>
              <th>SKU</th>
              <th>Sold</th>
              <th>Stock</th>
              <th>Daily Demand</th>
              <th>Days Remaining</th>
              <th>Risk</th>
            </tr>
          </thead>
          <tbody>
            ${filtered.length ? filtered.map(p => `
              <tr>
                <td><strong>${p.name}</strong></td>
                <td>${p.sku}</td>
                <td>${p.units_sold}</td>
                <td>${p.stock}</td>
                <td>${p.daily_demand}</td>
                <td>${p.days_remaining === null ? "—" : p.days_remaining}</td>
                <td>
                  <span class="nx-risk nx-risk-${p.risk}">
                    ${riskLabel(p.risk)}
                  </span>
                </td>
              </tr>
            `).join("") : `
              <tr><td colspan="7" class="nx-demand-empty">No products in this risk category.</td></tr>
            `}
          </tbody>
        </table>
      </div>
    `;

    wrap.querySelectorAll(".nx-demand-filter").forEach(btn => {
      btn.onclick = () => {
        activeRisk = btn.dataset.risk;
        renderDemand();
      };
    });
  }

  async function loadProductDemand(){
    try{
      const res = await fetch("http://localhost:8000/analytics/product-demand");
      const data = await res.json();

      if(data.success){
        demandProducts = data.products || [];
        renderDemand();
        window.NEXUS_DEMAND = data;
      }
    }catch(err){
      console.error("NEXUS demand intelligence:", err);
    }
  }

  window.NEXUS_DEMAND = null;
  window.loadNexusDemand = loadProductDemand;

  if(document.readyState === "loading"){
    document.addEventListener("DOMContentLoaded", loadProductDemand);
  }else{
    loadProductDemand();
  }

  document.addEventListener("click", e => {
    const analyticsBtn = e.target.closest('[data-screen="analytics"], [data-view="analytics"]');
    if(analyticsBtn) setTimeout(loadProductDemand, 100);
  });
})();
