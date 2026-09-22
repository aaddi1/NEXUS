const express = require('express');
const PDFDocument = require('pdfkit');
const QRCode = require('qrcode');
const SVGtoPDF = require('svg-to-pdfkit');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const router = express.Router();
const pool = require('../db/database');

const BUSINESS = {
  name: 'NEXUS',
  subtitle: 'Business Management',
  address: '221 Linking Road, Bandra West',
  city: 'Mumbai, Maharashtra',
  phone: '+91 98765 43210',
  gstin: '27ABCDE1234F1Z5'
};

function money(value) {
  return '₹' + Number(value || 0).toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}

function formatDate(value) {
  if (!value) return '-';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return String(value);

  return d.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
}

// GET ALL INVOICES
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        i.id,
        i.invoice_number,
        i.status,
        i.issue_date,
        i.due_date,
        i.total,
        i.tax_rate,
        i.discount,
        c.name AS customer
      FROM invoices i
      LEFT JOIN customers c ON c.id = i.customer_id
      ORDER BY i.id DESC
    `);

    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch invoices'
    });
  }
});

// ============================================================
// NEXUS PROFESSIONAL INVOICE PDF
// ============================================================

// Public authenticity URL.
// IMPORTANT: set PUBLIC_BASE_URL in production.
// Example:
// PUBLIC_BASE_URL=https://your-domain.com
function invoiceSignature(invoiceNumber) {
  const secret = process.env.JWT_SECRET || 'nexus-local-development-secret-change-later';

  return crypto
    .createHmac('sha256', secret)
    .update(String(invoiceNumber))
    .digest('hex')
    .slice(0, 40);
}

function formatInvoiceDate(value) {
  if (!value) return '—';

  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return String(value);

  return d.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
}

const INVOICE_UNICODE_FONT = path.join(
  __dirname,
  '../../assets/fonts/InvoiceUnicode.ttf'
);

function invoiceMoney(value) {
  return '₹' + Number(value || 0).toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}

function invoiceCurrencyFont(doc) {
  doc.font(INVOICE_UNICODE_FONT);
  return doc;
}

async function buildInvoicePdf(invoice, items, req) {

  const doc = new PDFDocument({
    size: 'A4',
    margin: 0,
    autoFirstPage: true
  });

  doc.registerFont('InvoiceUnicode', INVOICE_UNICODE_FONT);


  const chunks = [];

  doc.on('data', chunk => chunks.push(chunk));

  const finished = new Promise((resolve, reject) => {
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);
  });

  const W = doc.page.width;
  const H = doc.page.height;

  const green = '#1f8f55';
  const greenDark = '#12623a';
  const greenLight = '#eaf7ef';
  const charcoal = '#17211c';
  const text = '#26322c';
  const muted = '#6b766f';
  const line = '#dfe6e1';
  const white = '#ffffff';
  const red = '#b83b3b';

  const left = 42;
  const right = W - 42;
  const width = right - left;

  const paymentMethod = invoice.payment_method
    ? String(invoice.payment_method)
        .replace(/_/g, ' ')
        .replace(/\b\w/g, c => c.toUpperCase())
    : 'Not specified';

  const subtotal = items.reduce(
    (sum, item) =>
      sum + Number(item.quantity || 0) * Number(item.unit_price || 0),
    0
  );

  const discount = Number(invoice.discount || 0);
  const taxRate = Number(invoice.tax_rate || 0);
  const taxable = Math.max(0, subtotal - discount);
  const taxAmount = taxable * taxRate / 100;
  const total = Number(invoice.total || (taxable + taxAmount));

  const status = String(invoice.status || 'draft').toLowerCase();

  const statusLabel = {
    draft: 'DRAFT',
    paid: 'PAID',
    overdue: 'OVERDUE',
    sent: 'SENT',
    due: 'DUE'
  }[status] || status.toUpperCase();

  const statusColor =
    status === 'paid' ? green :
    status === 'overdue' ? red :
    charcoal;

  // ------------------------------------------------------------
  // BACKGROUND
  // ------------------------------------------------------------

  doc.rect(0, 0, W, H).fill(white);

  // Subtle NEXUS watermark
  doc.save();
  doc
    .opacity(0.035)
    .fillColor(greenDark)
    .font('Helvetica-Bold')
    .fontSize(92)
    .rotate(-28, { origin: [W / 2, H / 2] })
    .text('NEXUS', 100, H / 2 - 45, {
      width: W - 200,
      align: 'center'
    });
  doc.restore();

  // ------------------------------------------------------------
  // TOP BRAND HEADER
  // ------------------------------------------------------------

  doc.rect(0, 0, W, 116).fill(charcoal);

  doc
    .fillColor(green)
    .moveTo(W - 185, 0)
    .lineTo(W, 0)
    .lineTo(W, 116)
    .lineTo(W - 72, 116)
    .closePath()
    .fill();

  // Logo
  const logoPath = path.resolve(__dirname, '../../frontend/favicon.svg');

  try {
    if (fs.existsSync(logoPath)) {
      const svg = fs.readFileSync(logoPath, 'utf8');

      SVGtoPDF(doc, svg, left, 25, {
        width: 52,
        height: 52
      });
    }
  } catch (logoError) {
    console.error('NEXUS logo render warning:', logoError.message);
  }

  // TOAD logo is the primary brand mark.
  // Do not render a second NEXUS wordmark here.

  doc
    .fillColor('#aab8b0')
    .font('Helvetica')
    .fontSize(8)
    .text(
      'BUSINESS MANAGEMENT & OPERATIONS',
      left,
      82
    );

  doc
    .fillColor(white)
    .font('Helvetica-Bold')
    .fontSize(25)
    .text('INVOICE', W - 190, 28, {
      width: 145,
      align: 'right'
    });

  doc
    .fillColor('#d4e6dc')
    .font('Helvetica')
    .fontSize(8)
    .text(
      'TAX INVOICE',
      W - 190,
      62,
      {
        width: 145,
        align: 'right'
      }
    );

  // ------------------------------------------------------------
  // BUSINESS DETAILS
  // ------------------------------------------------------------

  let y = 140;

  doc
    .fillColor(charcoal)
    .font('Helvetica-Bold')
    .fontSize(11)
    .text('NEXUS Business Solutions', left, y);

  doc
    .fillColor(muted)
    .font('Helvetica')
    .fontSize(8.5)
    .text(
      '221 Linking Road, Bandra West, Mumbai, Maharashtra',
      left,
      y + 17
    )
    .text(
      '+91 98765 43210  ·  GSTIN: 27ABCDE1234F1Z5',
      left,
      y + 30
    );

  // Invoice metadata block
  const metaX = W - 255;
  const metaW = 213;

  doc
    .fillColor(greenLight)
    .roundedRect(metaX, 135, metaW, 78, 7)
    .fill();

  doc
    .fillColor(muted)
    .font('Helvetica')
    .fontSize(7.5)
    .text('INVOICE NUMBER', metaX + 13, 147);

  doc
    .fillColor(charcoal)
    .font('Helvetica-Bold')
    .fontSize(10)
    .text(
      String(invoice.invoice_number || 'NEXUS-INVOICE'),
      metaX + 13,
      159
    );

  doc
    .fillColor(muted)
    .font('Helvetica')
    .fontSize(7.5)
    .text('ISSUE DATE', metaX + 13, 181);

  doc
    .fillColor(charcoal)
    .font('Helvetica-Bold')
    .fontSize(8.5)
    .text(
      formatInvoiceDate(invoice.issue_date),
      metaX + 13,
      192
    );

  doc
    .fillColor(muted)
    .font('Helvetica')
    .fontSize(7.5)
    .text('DUE DATE', metaX + 105, 181);

  doc
    .fillColor(charcoal)
    .font('Helvetica-Bold')
    .fontSize(8.5)
    .text(
      invoice.due_date ? formatInvoiceDate(invoice.due_date) : '—',
      metaX + 105,
      192
    );

  // ------------------------------------------------------------
  // CUSTOMER BLOCK
  // ------------------------------------------------------------

  y = 245;

  doc
    .fillColor(muted)
    .font('Helvetica-Bold')
    .fontSize(8)
    .text('BILL TO', left, y);

  doc
    .strokeColor(line)
    .moveTo(left, y + 14)
    .lineTo(right, y + 14)
    .stroke();

  doc
    .fillColor(charcoal)
    .font('Helvetica-Bold')
    .fontSize(12)
    .text(
      invoice.customer || 'Customer',
      left,
      y + 27
    );

  let customerLine = '';

  if (invoice.customer_company) {
    customerLine += invoice.customer_company;
  }

  if (invoice.customer_city) {
    customerLine += customerLine ? ' · ' : '';
    customerLine += invoice.customer_city;
  }

  if (customerLine) {
    doc
      .fillColor(muted)
      .font('Helvetica')
      .fontSize(8.5)
      .text(customerLine, left, y + 45);
  }

  if (invoice.customer_email || invoice.customer_phone) {
    doc
      .fillColor(muted)
      .font('Helvetica')
      .fontSize(8)
      .text(
        [invoice.customer_email, invoice.customer_phone]
          .filter(Boolean)
          .join('  ·  '),
        left,
        y + 59
      );
  }

  // Status badge
  doc
    .fillColor(statusColor)
    .roundedRect(right - 90, y + 27, 90, 27, 5)
    .fill();

  doc
    .fillColor(white)
    .font('Helvetica-Bold')
    .fontSize(8)
    .text(statusLabel, right - 90, y + 36, {
      width: 90,
      align: 'center'
    });

  // ------------------------------------------------------------
  // ITEMS TABLE
  // ------------------------------------------------------------

  const tableY = 335;
  const headerH = 28;

  const col = {
    no: left,
    product: left + 31,
    qty: right - 190,
    rate: right - 125,
    amount: right - 62
  };

  doc
    .roundedRect(left, tableY, width, headerH, 4)
    .fill(charcoal);

  doc
    .fillColor(white)
    .font('Helvetica-Bold')
    .fontSize(7.5)
    .text('#', col.no + 9, tableY + 10);

  doc.text('PRODUCT / DESCRIPTION', col.product, tableY + 10);

  doc.text('QTY', col.qty, tableY + 10, {
    width: 35,
    align: 'right'
  });

  doc.text('RATE', col.rate, tableY + 10, {
    width: 55,
    align: 'right'
  });

  doc.text('AMOUNT', col.amount, tableY + 10, {
    width: 53,
    align: 'right'
  });

  let iy = tableY + headerH + 1;

  items.forEach((item, index) => {
    const rowH = 38;

    if (index % 2 === 0) {
      doc
        .fillColor('#f7faf8')
        .rect(left, iy, width, rowH)
        .fill();
    }

    const amount =
      Number(item.quantity || 0) *
      Number(item.unit_price || 0);

    doc
      .fillColor(muted)
      .font('Helvetica')
      .fontSize(8)
      .text(String(index + 1), col.no + 9, iy + 13);

    doc
      .fillColor(text)
      .font('Helvetica-Bold')
      .fontSize(8.5)
      .text(
        String(item.product || item.description || 'Item'),
        col.product,
        iy + 9,
        { width: 230, ellipsis: true }
      );

    if (item.description) {
      doc
        .fillColor(muted)
        .font('Helvetica')
        .fontSize(6.8)
        .text(
          String(item.description),
          col.product,
          iy + 22,
          { width: 220, ellipsis: true }
        );
    }

    doc
      .fillColor(text)
      .font('Helvetica')
      .fontSize(8)
      .text(String(item.quantity || 0), col.qty, iy + 13, {
        width: 35,
        align: 'right'
      });

    doc
      .font('InvoiceUnicode')
      .fontSize(8)
      .fillColor(text)
      .text(
        invoiceMoney(item.unit_price),
        col.rate,
        iy + 13,
        {
          width: 55,
          align: 'right'
        }
      );

    doc
      .font('InvoiceUnicode')
      .fontSize(8)
      .fillColor(text)
      .text(
        invoiceMoney(amount),
        col.amount,
        iy + 13,
        {
          width: 53,
          align: 'right'
        }
      );

    doc
      .strokeColor(line)
      .moveTo(left, iy + rowH)
      .lineTo(right, iy + rowH)
      .stroke();

    iy += rowH;
  });

  if (!items.length) {
    doc
      .fillColor(muted)
      .font('Helvetica')
      .fontSize(9)
      .text('No invoice items.', left + 12, iy + 15);

    iy += 38;
  }

  // ------------------------------------------------------------
  // TOTALS
  // ------------------------------------------------------------

  const totalsY = Math.max(iy + 18, 530);
  const totalsX = right - 235;

  doc
    .fillColor(muted)
    .font('Helvetica')
    .fontSize(8.5)
    .text('Subtotal', totalsX, totalsY);

  doc
    .fillColor(text)
    .font('InvoiceUnicode')
    .fontSize(8.5)
    .text(
      invoiceMoney(subtotal),
      totalsX + 115,
      totalsY,
      { width: 120, align: 'right' }
    );

  doc
    .fillColor(muted)
    .text('Discount', totalsX, totalsY + 19);

  doc
    .fillColor(text)
    .font('InvoiceUnicode')
    .fontSize(8.5)
    .text(
      '- ' + invoiceMoney(discount),
      totalsX + 115,
      totalsY + 19,
      { width: 120, align: 'right' }
    );

  doc
    .fillColor(muted)
    .text(`GST (${taxRate}%)`, totalsX, totalsY + 38);

  doc
    .fillColor(text)
    .font('InvoiceUnicode')
    .fontSize(8.5)
    .text(
      invoiceMoney(taxAmount),
      totalsX + 115,
      totalsY + 38,
      { width: 120, align: 'right' }
    );

  doc
    .fillColor(green)
    .roundedRect(totalsX, totalsY + 62, 235, 40, 5)
    .fill();

  doc
    .fillColor(white)
    .font('Helvetica-Bold')
    .fontSize(9)
    .text('TOTAL', totalsX + 12, totalsY + 76);

  doc
    .font('InvoiceUnicode')
    .fontSize(14)
    .fillColor(white)
    .text(
      invoiceMoney(total),
      totalsX + 90,
      totalsY + 72,
      {
        width: 130,
        align: 'right'
      }
    );

  // ------------------------------------------------------------
  // QR AUTHENTICITY
  // ------------------------------------------------------------

  const baseUrl =
    process.env.PUBLIC_BASE_URL ||
    `${req.protocol}://${req.get('host')}`;

  const signature = invoiceSignature(invoice.invoice_number);

  const verifyUrl =
    `${baseUrl}/api/invoices/public/` +
    `${encodeURIComponent(invoice.invoice_number)}/` +
    `${signature}.pdf`;

  const qrData = await QRCode.toDataURL(verifyUrl, {
    errorCorrectionLevel: 'H',
    margin: 1,
    width: 150
  });

  const qrBuffer = Buffer.from(
    qrData.split(',')[1],
    'base64'
  );

  const qrX = left;
  const qrY = totalsY + 12;

  doc
    .fillColor(charcoal)
    .font('Helvetica-Bold')
    .fontSize(9)
    .text('DIGITAL AUTHENTICITY', qrX, qrY);

  doc
    .fillColor(muted)
    .font('Helvetica')
    .fontSize(7.5)
    .text(
      'Scan to securely view the original NEXUS invoice PDF.',
      qrX,
      qrY + 15,
      { width: 190 }
    );

  doc.image(qrBuffer, qrX, qrY + 32, {
    width: 86,
    height: 86
  });

  doc
    .fillColor('#7a858d')
    .font('Helvetica')
    .fontSize(6.5)
    .text(
      'PDF ONLY · Digitally verified by NEXUS',
      qrX,
      qrY + 121
    );

  // ------------------------------------------------------------
  // SIGNATURE + PAYMENT DETAILS
  // ------------------------------------------------------------

  const bottomY = 690;

  // Authorized signature — LEFT SIDE
  const sigX = left;

  doc
    .strokeColor('#d7dfda')
    .lineWidth(1)
    .moveTo(sigX, bottomY)
    .lineTo(sigX + 190, bottomY)
    .stroke();

  doc
    .fillColor(text)
    .font('Helvetica-Bold')
    .fontSize(7.5)
    .text(
      'Authorized Signature',
      sigX,
      bottomY + 7,
      { width: 190 }
    );

  doc
    .fillColor(text)
    .font('Helvetica')
    .fontSize(7)
    .text(
      'Digitally signed by Aryan Sharma',
      sigX,
      bottomY + 22,
      { width: 190 }
    );

  doc
    .fillColor(muted)
    .fontSize(6.5)
    .text(
      'Owner · NEXUS Business Solutions',
      sigX,
      bottomY + 35,
      { width: 190 }
    );


  // Payment details — RIGHT SIDE
  const paymentX = right - 190;

  doc
    .strokeColor('#d7dfda')
    .lineWidth(1)
    .moveTo(paymentX, bottomY)
    .lineTo(right, bottomY)
    .stroke();

  doc
    .fillColor(muted)
    .font('Helvetica-Bold')
    .fontSize(7)
    .text(
      'PAYMENT DETAILS',
      paymentX,
      bottomY + 7,
      { width: 190, align: 'right' }
    );

  doc
    .fillColor(text)
    .font('Helvetica')
    .fontSize(7)
    .text(
      `Status: ${statusLabel}`,
      paymentX,
      bottomY + 22,
      { width: 190, align: 'right' }
    );

  doc
    .fontSize(7)
    .text(
      `Method: ${paymentMethod}`,
      paymentX,
      bottomY + 35,
      { width: 190, align: 'right' }
    );


  // FOOTER
  // ------------------------------------------------------------

  const footerY = H - 68;

  doc
    .strokeColor(line)
    .moveTo(left, footerY - 14)
    .lineTo(right, footerY - 14)
    .stroke();

  doc
    .fillColor(charcoal)
    .font('Helvetica-Bold')
    .fontSize(7)
    .text(
      'NEXUS Business Solutions',
      left,
      footerY,
      {
        width: width,
        align: 'center'
      }
    );

  doc
    .fillColor(muted)
    .font('Helvetica')
    .fontSize(6.5)
    .text(
      '221 Linking Road, Bandra West, Mumbai, Maharashtra  ·  +91 98765 43210  ·  GSTIN: 27ABCDE1234F1Z5',
      left,
      footerY + 13,
      {
        width: width,
        align: 'center'
      }
    );

  doc
    .fontSize(6.2)
    .text(
      'Digitally generated invoice · QR code provides access to this invoice PDF only.',
      left,
      footerY + 25,
      {
        width: width,
        align: 'center'
      }
    );

  doc.end();

  return finished;
}


// ------------------------------------------------------------
// AUTHENTICATED PDF
// ------------------------------------------------------------

router.get('/:id/pdf', async (req, res) => {
  try {
    const invoiceResult = await pool.query(`
      SELECT
        i.id,
        i.invoice_number,
        i.customer_id,
        i.status,
        i.issue_date,
        i.due_date,
        i.total,
        i.tax_rate,
        i.discount,
        i.payment_method,
        i.created_at,
        c.name AS customer,
        c.email AS customer_email,
        c.phone AS customer_phone,
        c.company AS customer_company,
        c.city AS customer_city
      FROM invoices i
      LEFT JOIN customers c ON c.id = i.customer_id
      WHERE i.id = $1
    `, [req.params.id]);

    if (!invoiceResult.rows.length) {
      return res.status(404).json({
        success: false,
        message: 'Invoice not found'
      });
    }

    const invoice = invoiceResult.rows[0];

    const itemsResult = await pool.query(`
      SELECT
        ii.id,
        ii.product_id,
        p.name AS product,
        p.sku,
        ii.description,
        ii.quantity,
        ii.unit_price
      FROM invoice_items ii
      LEFT JOIN products p ON p.id = ii.product_id
      WHERE ii.invoice_id = $1
      ORDER BY ii.id
    `, [req.params.id]);

    const pdf = await buildInvoicePdf(
      invoice,
      itemsResult.rows,
      req
    );

    const filename =
      `${invoice.invoice_number || 'invoice'}.pdf`
        .replace(/[^a-zA-Z0-9._-]/g, '_');

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    res.setHeader('Content-Length', pdf.length);
    res.setHeader(
      'Content-Disposition',
      `inline; filename="${filename}"`
    );

    res.end(pdf);

  } catch (error) {
    console.error('Invoice PDF error:', error);

    if (!res.headersSent) {
      res.status(500).json({
        success: false,
        message: 'Failed to generate invoice PDF',
        error: error.message
      });
    }
  }
});


// ------------------------------------------------------------
// PUBLIC QR PDF — PDF ONLY
// ------------------------------------------------------------

router.get(
  '/public/:invoiceNumber/:signature.pdf',
  async (req, res) => {
    try {
      const invoiceNumber = req.params.invoiceNumber;
      const signature = req.params.signature;

      const expected = invoiceSignature(invoiceNumber);

      const sigBuf = Buffer.from(signature || '');
      const expBuf = Buffer.from(expected || '');

      if (
        !signature ||
        sigBuf.length !== expBuf.length ||
        !crypto.timingSafeEqual(sigBuf, expBuf)
      ) {
        return res.status(404).send('Invoice not found');
      }

      console.log('PUBLIC PDF LOOKUP:', JSON.stringify({
        invoiceNumber,
        signature,
        expected
      }));

      const invoiceResult = await pool.query(`
        SELECT
          i.id,
          i.invoice_number,
          i.customer_id,
          i.status,
          i.issue_date,
          i.due_date,
          i.total,
          i.tax_rate,
          i.discount,
          i.payment_method,
          i.created_at,
          c.name AS customer,
          c.email AS customer_email,
          c.phone AS customer_phone,
          c.company AS customer_company,
          c.city AS customer_city
        FROM invoices i
        LEFT JOIN customers c ON c.id = i.customer_id
        WHERE i.invoice_number = $1
      `, [invoiceNumber]);

      console.log('PUBLIC PDF DB ROWS:', invoiceResult.rows.length);

      if (!invoiceResult.rows.length) {
        return res.status(404).send('Invoice not found');
      }

      const invoice = invoiceResult.rows[0];

      const itemsResult = await pool.query(`
        SELECT
          ii.id,
          ii.product_id,
          p.name AS product,
          p.sku,
          ii.description,
          ii.quantity,
          ii.unit_price
        FROM invoice_items ii
        LEFT JOIN products p ON p.id = ii.product_id
        WHERE ii.invoice_id = $1
        ORDER BY ii.id
      `, [invoice.id]);

      const pdf = await buildInvoicePdf(
        invoice,
        itemsResult.rows,
        req
      );

      const filename =
        `${invoice.invoice_number || 'invoice'}.pdf`
          .replace(/[^a-zA-Z0-9._-]/g, '_');

      res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
      res.setHeader('Content-Length', pdf.length);
      res.setHeader(
        'Content-Disposition',
        `inline; filename="${filename}"`
      );

      res.end(pdf);

    } catch (error) {
      console.error('Public invoice PDF error:', error);
      res.status(404).send('Invoice not found');
    }
  }
);

// GET ONE INVOICE WITH ITEMS
router.get('/:id', async (req, res) => {
  try {
    const invoice = await pool.query(`
      SELECT
        i.id,
        i.invoice_number,
        i.customer_id,
        c.name AS customer,
        c.email AS customer_email,
        c.phone AS customer_phone,
        c.company AS customer_company,
        c.city AS customer_city,
        i.status,
        i.issue_date,
        i.due_date,
        i.total,
        i.tax_rate,
        i.discount,
        i.created_at
      FROM invoices i
      LEFT JOIN customers c ON c.id = i.customer_id
      WHERE i.id = $1
    `, [req.params.id]);

    if (invoice.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Invoice not found'
      });
    }

    const items = await pool.query(`
      SELECT
        ii.id,
        ii.product_id,
        p.name AS product,
        p.sku,
        ii.description,
        ii.quantity,
        ii.unit_price,
        ii.quantity * ii.unit_price AS subtotal
      FROM invoice_items ii
      LEFT JOIN products p ON p.id = ii.product_id
      WHERE ii.invoice_id = $1
      ORDER BY ii.id
    `, [req.params.id]);

    res.json({
      success: true,
      data: {
        ...invoice.rows[0],
        items: items.rows
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch invoice'
    });
  }
});

// CREATE INVOICE
router.post('/', async (req, res) => {
  const client = await pool.connect();

  try {
    const {
      customer_id,
      status = 'draft',
      issue_date,
      due_date,
      items,
      tax_rate = 0,
      discount = 0,
      payment_method = null
    } = req.body;

    if (
      !customer_id ||
      !Array.isArray(items) ||
      items.length === 0
    ) {
      return res.status(400).json({
        success: false,
        message: 'Customer and at least one item are required'
      });
    }

    const normalizedStatus = String(status || 'draft').toLowerCase().trim();

    const normalizedPaymentMethod = payment_method
      ? String(payment_method).toLowerCase().trim()
      : null;

    const allowedStatuses = [
      'draft',
      'due',
      'overdue',
      'paid',
      'dismissed'
    ];

    const allowedPaymentMethods = [
      'upi',
      'netbanking',
      'debit_card',
      'credit_card',
      'cash',
      'bank_transfer'
    ];

    if (!allowedStatuses.includes(normalizedStatus)) {
      return res.status(400).json({
        success: false,
        message: `Invalid invoice status. Allowed: ${allowedStatuses.join(', ')}`
      });
    }

    if (
      normalizedPaymentMethod &&
      !allowedPaymentMethods.includes(normalizedPaymentMethod)
    ) {
      return res.status(400).json({
        success: false,
        message: 'Invalid payment method'
      });
    }

    if (
      normalizedStatus === 'paid' &&
      !normalizedPaymentMethod
    ) {
      return res.status(400).json({
        success: false,
        message: 'Payment method is required for paid invoices'
      });
    }

    const taxRate = Number(tax_rate);
    const discountPercent = Number(discount);

    if (!Number.isFinite(taxRate) || taxRate < 0 || taxRate > 100) {
      return res.status(400).json({
        success: false,
        message: 'Tax rate must be between 0 and 100'
      });
    }

    if (
      !Number.isFinite(discountPercent) ||
      discountPercent < 0 ||
      discountPercent > 100
    ) {
      return res.status(400).json({
        success: false,
        message: 'Discount must be between 0 and 100 percent'
      });
    }

    await client.query('BEGIN');

    const customer = await client.query(
      'SELECT id FROM customers WHERE id = $1',
      [customer_id]
    );

    if (customer.rows.length === 0) {
      await client.query('ROLLBACK');

      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }

    let subtotal = 0;
    const resolvedItems = [];

    for (const item of items) {
      const productId = Number(item.product_id);
      const quantity = Number(item.quantity);

      if (
        !Number.isInteger(productId) ||
        productId <= 0 ||
        !Number.isFinite(quantity) ||
        quantity <= 0
      ) {
        await client.query('ROLLBACK');

        return res.status(400).json({
          success: false,
          message: 'Each item needs a valid product and quantity'
        });
      }

      const product = await client.query(
        `SELECT id, name, sku, price
         FROM products
         WHERE id = $1`,
        [productId]
      );

      if (product.rows.length === 0) {
        await client.query('ROLLBACK');

        return res.status(404).json({
          success: false,
          message: `Product ${productId} not found`
        });
      }

      const unitPrice = Number(product.rows[0].price);
      const lineTotal = unitPrice * quantity;

      subtotal += lineTotal;

      resolvedItems.push({
        product_id: productId,
        description: item.description || product.rows[0].name,
        quantity,
        unit_price: unitPrice
      });
    }

    const safeDiscountPercent = Math.min(100, Math.max(0, discountPercent));
    const safeDiscount = subtotal * (safeDiscountPercent / 100);
    const taxableAmount = Math.max(0, subtotal - safeDiscount);
    const taxAmount = taxableAmount * (taxRate / 100);
    const total = taxableAmount + taxAmount;

    const sequence = await client.query(
      `SELECT nextval('nexus_invoice_seq') AS number`
    );

    const invoiceNumber =
      `NEXUS-INV-${new Date().getFullYear()}-${String(sequence.rows[0].number).padStart(5, '0')}`;

    const invoice = await client.query(
      `INSERT INTO invoices
       (
         customer_id,
         invoice_number,
         status,
         issue_date,
         due_date,
         total,
         tax_rate,
         discount,
         payment_method
       )
       VALUES
       (
         $1,
         $2,
         $3,
         COALESCE($4, CURRENT_DATE),
         $5,
         $6,
         $7,
         $8,
         $9
       )
       RETURNING *`,
      [
        customer_id,
        invoiceNumber,
        normalizedStatus,
        issue_date || null,
        (
          normalizedStatus === 'due' ||
          normalizedStatus === 'overdue'
        ) ? (due_date || null) : null,
        total.toFixed(2),
        taxRate,
        safeDiscount.toFixed(2),
        normalizedPaymentMethod
      ]
    );

    const invoiceId = invoice.rows[0].id;

    for (const item of resolvedItems) {
      await client.query(
        `INSERT INTO invoice_items
         (
           invoice_id,
           product_id,
           description,
           quantity,
           unit_price
         )
         VALUES ($1, $2, $3, $4, $5)`,
        [
          invoiceId,
          item.product_id,
          item.description,
          item.quantity,
          item.unit_price
        ]
      );
    }

    await client.query('COMMIT');

    res.status(201).json({
      success: true,
      message: 'Invoice created successfully',
      data: {
        ...invoice.rows[0],
        subtotal: Number(subtotal.toFixed(2)),
        discount: Number(safeDiscount.toFixed(2)),
        tax_amount: Number(taxAmount.toFixed(2)),
        total: Number(total.toFixed(2)),
        items: resolvedItems
      }
    });

  } catch (error) {
    await client.query('ROLLBACK');

    console.error(error);

    res.status(500).json({
      success: false,
      message: 'Failed to create invoice'
    });
  } finally {
    client.release();
  }
});

// UPDATE INVOICE STATUS
router.patch('/:id/status', async (req, res) => {
  try {
    const allowed = [
      'draft',
      'due',
      'overdue',
      'paid',
      'dismissed'
    ];

    const status = String(req.body?.status || '').toLowerCase().trim();

    if (!allowed.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid invoice status. Allowed: ${allowed.join(', ')}`
      });
    }

    const result = await pool.query(`
      UPDATE invoices
      SET
        status = $1,
        due_date = CASE
          WHEN $1 IN ('paid', 'dismissed', 'draft')
            THEN NULL
          ELSE due_date
        END
      WHERE id = $2
      RETURNING *
    `, [status, req.params.id]);

    if (!result.rows.length) {
      return res.status(404).json({
        success: false,
        message: 'Invoice not found'
      });
    }

    // Automatically synchronize payments ledger on paid status
    if (status === 'paid') {
      try {
        await pool.query(
          `INSERT INTO payments (invoice_id, amount, payment_method, payment_status)
           VALUES ($1, $2, COALESCE($3, 'upi'), 'completed')`,
          [req.params.id, result.rows[0].total, result.rows[0].payment_method || 'upi']
        );
      } catch (payErr) {
        console.warn('Payment sync notice:', payErr.message);
      }
    }

    res.json({
      success: true,
      message: 'Invoice status updated',
      data: result.rows[0]
    });

  } catch (error) {
    console.error('Invoice status update error:', error);

    res.status(500).json({
      success: false,
      message: 'Failed to update invoice status',
      error: error.message
    });
  }
});

module.exports = router;
