(function(){
  const API='http://localhost:5000/api';

  async function req(path, options={}){
    const token=localStorage.getItem('nexus_token');

    const r=await fetch(API+path,{
      ...options,
      headers:{
        'Content-Type':'application/json',
        ...(token ? {Authorization:`Bearer ${token}`} : {}),
        ...(options.headers || {})
      }
    });

    const d=await r.json().catch(()=>({}));

    if(!r.ok){
      throw new Error(d.message || 'API request failed');
    }

    return d;
  }

  const money=n =>
    '₹'+Number(n||0).toLocaleString('en-IN',{
      maximumFractionDigits:0
    });

  const esc=v =>
    String(v??'').replace(/[&<>"']/g,c=>({
      '&':'&amp;',
      '<':'&lt;',
      '>':'&gt;',
      '"':'&quot;',
      "'":'&#39;'
    }[c]));

  function cls(status){
    const x=String(status||'draft').toLowerCase();

    if(x==='paid'||x==='cleared') return 'ok';
    if(x==='overdue'||x==='dismissed') return 'danger';
    if(x==='due') return 'info';

    return 'warn';
  }

  function label(status){
    return String(status||'draft')
      .replace(/_/g,' ')
      .replace(/\b\w/g,m=>m.toUpperCase());
  }

  async function getPdf(invoiceId){
    const token=localStorage.getItem('nexus_token');

    const r=await fetch(
      `${API}/invoices/${encodeURIComponent(invoiceId)}/pdf`,
      {
        headers: token
          ? {Authorization:`Bearer ${token}`}
          : {}
      }
    );

    if(!r.ok){
      throw new Error('Could not generate invoice PDF');
    }

    return await r.blob();
  }

  async function downloadPdf(invoiceId, invoiceNumber){
    try{
      const blob=await getPdf(invoiceId);
      const url=URL.createObjectURL(blob);

      const a=document.createElement('a');
      a.href=url;
      a.download=`${invoiceNumber || 'NEXUS-Invoice'}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();

      setTimeout(()=>URL.revokeObjectURL(url),60000);

      if(typeof toast==='function'){
        toast('Invoice downloaded',`${invoiceNumber} PDF saved.`);
      }

    }catch(err){
      console.error(err);

      if(typeof toast==='function'){
        toast('Download failed',err.message);
      }
    }
  }

  async function sharePdf(invoiceId, invoiceNumber){
    try{
      const blob=await getPdf(invoiceId);

      const file=new File(
        [blob],
        `${invoiceNumber || 'NEXUS-Invoice'}.pdf`,
        {type:'application/pdf'}
      );

      if(navigator.share && navigator.canShare?.({files:[file]})){
        await navigator.share({
          title:`NEXUS Invoice ${invoiceNumber || ''}`,
          text:'NEXUS invoice PDF',
          files:[file]
        });

        return;
      }

      const url=URL.createObjectURL(blob);

      if(navigator.clipboard){
        await navigator.clipboard.writeText(
          `${location.origin}/invoice/${encodeURIComponent(invoiceNumber || invoiceId)}`
        );

        if(typeof toast==='function'){
          toast('Share link copied','PDF sharing is available from the copied link.');
        }
      }else{
        window.open(url,'_blank');
      }

      setTimeout(()=>URL.revokeObjectURL(url),60000);

    }catch(err){
      if(err.name==='AbortError') return;

      console.error(err);

      if(typeof toast==='function'){
        toast('Share failed',err.message);
      }
    }
  }

  async function changeStatus(id,status){
    try{
      await req(`/invoices/${encodeURIComponent(id)}/status`,{
        method:'PATCH',
        body:JSON.stringify({status})
      });

      await load();

      if(typeof toast==='function'){
        toast(
          'Invoice status updated',
          `Invoice is now ${label(status)}.`
        );
      }

    }catch(err){
      console.error(err);

      if(typeof toast==='function'){
        toast('Status update failed',err.message);
      }

      await load();
    }
  }

  function render(rows){
    const el=document.getElementById('invoices-table');
    if(!el)return;

    el.innerHTML=`
      <table class="data-table">
        <thead>
          <tr>
            <th>Invoice</th>
            <th>Customer</th>
            <th>Issued</th>
            <th>Due</th>
            <th>Amount</th>
            <th>Status</th>
            <th style="text-align:right;">Actions</th>
          </tr>
        </thead>

        <tbody>

          ${
            rows.map(v=>{

              const id=v.id;

              const num=
                v.invoice_number ||
                v.invoiceNumber ||
                v.num ||
                `INV-${id||''}`;

              const cust=
                v.customer_name ||
                v.customer ||
                v.cust ||
                '—';

              const issue=
                v.issue_date ||
                v.issue ||
                '—';

              const status=
                String(v.status||'draft').toLowerCase();

              const due=
                (status==='paid' ||
                 status==='cleared' ||
                 status==='dismissed' ||
                 status==='draft')
                  ? '—'
                  : (v.due_date || v.due || '—');

              return `
                <tr>

                  <td>
                    <span class="cell-title">
                      ${esc(num)}
                    </span>
                  </td>

                  <td>
                    ${esc(cust)}
                  </td>

                  <td style="color:var(--text-mid);">
                    ${esc(issue)}
                  </td>

                  <td style="color:var(--text-mid);">
                    ${esc(due)}
                  </td>

                  <td>
                    ${money(v.total||v.amount)}
                  </td>

                  <td>
                    <span class="pill ${cls(status)}">
                      ${esc(label(status))}
                    </span>
                  </td>

                  <td style="text-align:right;white-space:nowrap;">

                    <button
                      class="btn btn-ghost btn-sm nx-invoice-pdf"
                      type="button"
                      data-invoice-id="${esc(id)}"
                      title="View PDF"
                      aria-label="View invoice PDF"
                    >
                      PDF
                    </button>

                    <button
                      class="btn btn-ghost btn-sm nx-invoice-download"
                      type="button"
                      data-invoice-id="${esc(id)}"
                      data-invoice-number="${esc(num)}"
                      title="Download PDF"
                    >
                      ↓
                    </button>

                    <button
                      class="btn btn-ghost btn-sm nx-invoice-share"
                      type="button"
                      data-invoice-id="${esc(id)}"
                      data-invoice-number="${esc(num)}"
                      title="Share PDF"
                    >
                      ↗
                    </button>

                    <select
                      class="nx-invoice-status"
                      data-invoice-id="${esc(id)}"
                      aria-label="Change invoice status"
                      style="
                        margin-left:6px;
                        height:36px;
                        border:1px solid var(--border);
                        border-radius:8px;
                        padding:0 8px;
                        background:var(--surface-2);
                        color:var(--text);
                      "
                    >
                      ${
                        [
                          ['draft','Draft'],
                          ['due','Due'],
                          ['overdue','Overdue'],
                          ['paid','Paid'],
                          ['dismissed','Dismissed']
                        ].map(([value,text])=>
                          `<option value="${value}" ${status===value?'selected':''}>
                            ${text}
                          </option>`
                        ).join('')
                      }
                    </select>

                  </td>

                </tr>
              `;

            }).join('')

          ||

            `<tr>
              <td colspan="7"
                style="
                  text-align:center;
                  color:var(--text-low);
                  padding:30px;
                ">
                No invoices found.
              </td>
            </tr>`
          }

        </tbody>
      </table>
    `;
  }

  async function load(){
    try{
      const d=await req('/invoices');

      const rows=
        d.data ||
        d.invoices ||
        [];

      window.__NEXUS_INVOICES_ROWS=rows;

      render(rows);

      return rows;

    }catch(e){
      console.error(
        'NEXUS invoices load failed:',
        e
      );

      return [];
    }
  }

  window.NexusInvoices={
    load
  };

  document.addEventListener(
    'DOMContentLoaded',
    ()=>load()
  );

  document.addEventListener('click',e=>{

    const nav=e.target.closest(
      '.nav-item[data-screen="invoices"]'
    );

    if(nav){
      setTimeout(load,50);
    }

    const download=e.target.closest(
      '.nx-invoice-download'
    );

    if(download){
      e.preventDefault();

      downloadPdf(
        download.dataset.invoiceId,
        download.dataset.invoiceNumber
      );
    }

    const share=e.target.closest(
      '.nx-invoice-share'
    );

    if(share){
      e.preventDefault();

      sharePdf(
        share.dataset.invoiceId,
        share.dataset.invoiceNumber
      );
    }

  });

  document.addEventListener('change',e=>{

    const select=e.target.closest(
      '.nx-invoice-status'
    );

    if(!select)return;

    changeStatus(
      select.dataset.invoiceId,
      select.value
    );

  });

})();
