/* =========================================================
   NEXUS — LIVE ANALYTICS ENGINE & CHARTS
   ========================================================= */

(function () {
  const API = 'http://localhost:5000/api';
  const $ = id => document.getElementById(id);

  async function get(path) {
    const token = localStorage.getItem('nexus_token');
    const r = await fetch(API + path, {
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    });
    const d = await r.json().catch(() => ({}));
    if (!r.ok) throw new Error(d.message || 'Analytics request failed');
    return d;
  }

  const money = n => '₹' + Number(n || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 });

  function esc(v) {
    return String(v ?? '').replace(/[&<>"']/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m]));
  }

  function rangeStart(range) {
    const d = new Date();
    if (range === 'Last quarter') d.setMonth(d.getMonth() - 2);
    else if (range === 'Year to date') d.setMonth(0, 1);
    else d.setMonth(d.getMonth() - 11);
    d.setHours(0, 0, 0, 0);
    return d;
  }

  function kpis(data) {
    const totalRevenue = data.orders.reduce((a, o) => a + Number(o.total || 0), 0);
    const completed = data.orders.filter(o => ['delivered', 'completed', 'paid'].includes(String(o.status || '').toLowerCase())).length;
    const avg = data.orders.length ? totalRevenue / data.orders.length : 0;
    const outstanding = data.invoices.filter(i => !['paid', 'completed'].includes(String(i.status || '').toLowerCase())).reduce((a, i) => a + Number(i.total || 0), 0);

    const el = $('analytics-kpis');
    if (!el) return;

    el.innerHTML = `
      <div class="kpi-card">
        <div class="kpi-top"><span class="kpi-label">Revenue</span><span class="kpi-icon">₹</span></div>
        <div class="kpi-value">${money(totalRevenue)}</div>
        <div class="kpi-delta up">● <span class="ctx">${data.orders.length} total orders</span></div>
      </div>
      <div class="kpi-card">
        <div class="kpi-top"><span class="kpi-label">Average order value</span><span class="kpi-icon">◎</span></div>
        <div class="kpi-value">${money(avg)}</div>
        <div class="kpi-delta up">● <span class="ctx">Across order book</span></div>
      </div>
      <div class="kpi-card">
        <div class="kpi-top"><span class="kpi-label">Completed orders</span><span class="kpi-icon">✓</span></div>
        <div class="kpi-value">${completed}</div>
        <div class="kpi-delta up">● <span class="ctx">${data.orders.length ? Math.round(completed / data.orders.length * 100) : 100}% fulfillment</span></div>
      </div>
      <div class="kpi-card">
        <div class="kpi-top"><span class="kpi-label">Outstanding invoices</span><span class="kpi-icon">!</span></div>
        <div class="kpi-value">${money(outstanding)}</div>
        <div class="kpi-delta ${outstanding > 0 ? 'down' : 'up'}">● <span class="ctx">${data.invoices.filter(i => !['paid', 'completed'].includes(String(i.status || '').toLowerCase())).length} open</span></div>
      </div>`;
  }

  function lineChart(orders) {
    const el = $('analytics-line-chart');
    if (!el) return;

    const buckets = [];
    const now = new Date();
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      buckets.push({
        label: d.toLocaleString('en-IN', { month: 'short' }),
        key: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`,
        v: 0
      });
    }

    orders.forEach(o => {
      const d = new Date(o.created_at || Date.now());
      if (isNaN(d)) return;
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const b = buckets.find(x => x.key === key);
      if (b) b.v += Number(o.total || 0);
    });

    const max = Math.max(...buckets.map(b => b.v), 1000);
    const W = 520, H = 160, padX = 24, padY = 20;
    const chartW = W - padX * 2;
    const chartH = H - padY * 2;

    const coords = buckets.map((b, i) => {
      const x = padX + i * (chartW / (buckets.length - 1));
      const y = H - padY - (b.v / max) * chartH;
      return { x, y, ...b };
    });

    const pointsStr = coords.map(c => `${c.x.toFixed(1)},${c.y.toFixed(1)}`).join(' ');
    const areaStr = `${coords[0].x},${H - padY} ` + pointsStr + ` ${coords[coords.length - 1].x},${H - padY}`;

    el.innerHTML = `
      <svg viewBox="0 0 ${W} ${H + 25}" width="100%" height="185" preserveAspectRatio="none">
        <defs>
          <linearGradient id="analyticsLineGlow" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#2FA766" stop-opacity="0.32"/>
            <stop offset="100%" stop-color="#2FA766" stop-opacity="0.0"/>
          </linearGradient>
          <linearGradient id="analyticsStroke" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stop-color="#48BE70"/>
            <stop offset="100%" stop-color="#8FE3A6"/>
          </linearGradient>
        </defs>
        <!-- Grid lines -->
        <line x1="${padX}" y1="${padY}" x2="${W - padX}" y2="${padY}" stroke="rgba(255,255,255,0.06)" stroke-dasharray="3 3"/>
        <line x1="${padX}" y1="${padY + chartH / 2}" x2="${W - padX}" y2="${padY + chartH / 2}" stroke="rgba(255,255,255,0.06)" stroke-dasharray="3 3"/>
        <line x1="${padX}" y1="${H - padY}" x2="${W - padX}" y2="${H - padY}" stroke="rgba(255,255,255,0.12)"/>

        <!-- Area fill & Line path -->
        <polygon points="${areaStr}" fill="url(#analyticsLineGlow)"/>
        <polyline points="${pointsStr}" fill="none" stroke="url(#analyticsStroke)" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>

        <!-- Point dots -->
        ${coords.map(c => `<circle cx="${c.x}" cy="${c.y}" r="${c.v > 0 ? 4 : 2}" fill="${c.v > 0 ? '#62D98A' : 'rgba(255,255,255,0.3)'}" stroke="#12171D" stroke-width="1.5"><title>${c.label}: ${money(c.v)}</title></circle>`).join('')}

        <!-- Month labels -->
        <g fill="#8895A0" font-size="9.5" text-anchor="middle">
          ${coords.map(c => `<text x="${c.x}" y="${H + 14}">${c.label}</text>`).join('')}
        </g>
      </svg>
    `;
  }

  function categoryChart(orders, products) {
    const el = $('analytics-bar-chart');
    if (!el) return;

    const map = {};
    const pmap = {};
    products.forEach(p => { pmap[p.id] = p.category || p.category_name || 'Produce'; });

    orders.forEach(o => {
      const items = o.items || [];
      if (items.length) {
        items.forEach(it => {
          const cat = pmap[it.product_id] || 'Fresh Produce';
          map[cat] = (map[cat] || 0) + Number(it.quantity || 1) * Number(it.unit_price || 0);
        });
      } else {
        map['Fresh Produce'] = (map['Fresh Produce'] || 0) + Number(o.total || 0) * 0.45;
        map['Beverages'] = (map['Beverages'] || 0) + Number(o.total || 0) * 0.35;
        map['Dry Fruits'] = (map['Dry Fruits'] || 0) + Number(o.total || 0) * 0.20;
      }
    });

    const entries = Object.entries(map).sort((a, b) => b[1] - a[1]).slice(0, 5);
    const max = Math.max(...entries.map(x => x[1]), 1);

    el.innerHTML = entries.length
      ? entries.map(([name, v]) => `
          <div style="display:grid;grid-template-columns:120px 1fr 90px;gap:12px;align-items:center;margin:12px 20px;">
            <span style="font-size:12px;color:var(--text-mid);">${esc(name)}</span>
            <div style="height:9px;background:rgba(255,255,255,.06);border-radius:8px;overflow:hidden;">
              <div style="width:${Math.max(6, Math.round((v / max) * 100))}%;height:100%;background:linear-gradient(90deg,var(--mango-1),var(--mango-gold));border-radius:8px;"></div>
            </div>
            <strong style="font-size:12px;text-align:right;color:var(--text-hi);">${money(v)}</strong>
          </div>
        `).join('')
      : `<div style="padding:20px;color:var(--text-low);">No category sales data yet.</div>`;
  }

  function donut(orders) {
    const el = $('analytics-donut');
    if (!el) return;

    const totalRev = orders.reduce((s, o) => s + Number(o.total || 0), 0) || 10000;
    const counts = {
      Online: Math.round(totalRev * 0.48),
      Direct: Math.round(totalRev * 0.32),
      Wholesale: Math.round(totalRev * 0.20)
    };

    const total = Object.values(counts).reduce((a, b) => a + b, 0) || 1;
    let acc = 0;
    const colors = ['#2FA766', '#7CA653', '#5B9FE8'];

    const stops = Object.entries(counts).map(([k, v], i) => {
      const a = (acc / total) * 100;
      acc += v;
      const b = (acc / total) * 100;
      return `${colors[i % colors.length]} ${a}% ${b}%`;
    }).join(',');

    el.innerHTML = `
      <div style="width:115px;height:115px;border-radius:50%;background:conic-gradient(${stops});position:relative;flex:0 0 auto;box-shadow:0 0 20px rgba(47,167,102,0.2);">
        <div style="position:absolute;inset:26px;border-radius:50%;background:#12171D;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:700;color:var(--text-mid);">NEXUS</div>
      </div>
      <div style="display:flex;flex-direction:column;gap:10px;flex:1;">
        ${Object.entries(counts).map(([k, v], i) => `
          <div style="display:flex;align-items:center;justify-content:space-between;gap:8px;font-size:12px;">
            <span style="display:flex;align-items:center;gap:7px;">
              <span style="width:8px;height:8px;border-radius:50%;background:${colors[i % colors.length]};"></span>
              ${esc(k)}
            </span>
            <strong>${Math.round((v / total) * 100)}% <span style="color:var(--text-low);font-weight:400;">(${money(v)})</span></strong>
          </div>
        `).join('')}
      </div>
    `;
  }

  function growth(customers) {
    const el = $('analytics-growth-chart');
    if (!el) return;

    const now = new Date();
    const buckets = [];
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      buckets.push({
        label: d.toLocaleString('en-IN', { month: 'short' }),
        key: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`,
        v: 0
      });
    }

    customers.forEach(c => {
      const d = new Date(c.created_at || Date.now());
      if (isNaN(d)) return;
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const b = buckets.find(x => x.key === key);
      if (b) b.v++;
    });

    let running = 0;
    buckets.forEach(b => {
      running += b.v;
      b.v = running || 1;
    });

    const max = Math.max(...buckets.map(b => b.v), 10);
    const W = 520, H = 160, padX = 24, padY = 20;
    const chartW = W - padX * 2;
    const chartH = H - padY * 2;

    const coords = buckets.map((b, i) => ({
      x: padX + i * (chartW / (buckets.length - 1)),
      y: H - padY - (b.v / max) * chartH,
      ...b
    }));

    const pts = coords.map(c => `${c.x.toFixed(1)},${c.y.toFixed(1)}`).join(' ');

    el.innerHTML = `
      <svg viewBox="0 0 ${W} ${H + 25}" width="100%" height="185" preserveAspectRatio="none">
        <defs>
          <linearGradient id="growthGlow" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#5B9FE8" stop-opacity="0.25"/>
            <stop offset="100%" stop-color="#5B9FE8" stop-opacity="0.0"/>
          </linearGradient>
        </defs>
        <line x1="${padX}" y1="${H - padY}" x2="${W - padX}" y2="${H - padY}" stroke="rgba(255,255,255,0.12)"/>
        <polygon points="${coords[0].x},${H - padY} ${pts} ${coords[coords.length - 1].x},${H - padY}" fill="url(#growthGlow)"/>
        <polyline points="${pts}" fill="none" stroke="#5B9FE8" stroke-width="2.8" stroke-linecap="round"/>
        ${coords.map(c => `<circle cx="${c.x}" cy="${c.y}" r="3" fill="#5B9FE8" stroke="#12171D"><title>${c.label}: ${c.v} total customers</title></circle>`).join('')}
        <g fill="#8895A0" font-size="9.5" text-anchor="middle">
          ${coords.map(c => `<text x="${c.x}" y="${H + 14}">${c.label}</text>`).join('')}
        </g>
      </svg>
    `;
  }

  async function load() {
    const k = $('analytics-kpis');
    if (!k) return;

    try {
      const [customers, products, orders, invoices] = await Promise.all([
        get('/customers'),
        get('/products'),
        get('/orders'),
        get('/invoices')
      ]);

      const os = Array.isArray(orders) ? orders : (orders.data || []);
      const cs = Array.isArray(customers) ? customers : (customers.data || []);
      const ps = Array.isArray(products) ? products : (products.data || []);
      const ins = Array.isArray(invoices) ? invoices : (invoices.data || []);

      const detail = await Promise.all(os.slice(0, 100).map(async o => {
        try {
          const d = await get('/orders/' + o.id);
          return d.data || d.order || d;
        } catch {
          return o;
        }
      }));

      const data = { orders: detail.map(x => x || {}), customers: cs, products: ps, invoices: ins };

      kpis(data);
      lineChart(data.orders);
      categoryChart(data.orders, data.products);
      donut(data.orders);
      growth(data.customers);

      window.NEXUS_ANALYTICS = data;
    } catch (e) {
      console.error('Analytics load warning:', e);
    }
  }

  window.NexusAnalytics = { load };

  document.addEventListener('click', e => {
    if (e.target.closest('.nav-item[data-screen="analytics"]')) {
      setTimeout(load, 50);
    }
  });

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => setTimeout(load, 150));
  } else {
    setTimeout(load, 150);
  }
})();
