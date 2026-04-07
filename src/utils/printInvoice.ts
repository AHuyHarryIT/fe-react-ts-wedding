import type { Booking } from '@types';
import { formatMoneyVND } from './money';

export function printInvoice(booking: Booking): void {
  const customer = booking.customer;
  const customerName =
    `${customer?.lastName || ''} ${customer?.firstName || ''}`.trim() || 'N/A';
  const customerEmail = customer?.email || '-';
  const customerPhone = customer?.phoneNumber || '-';
  const eventDate = new Date(booking.eventDate).toLocaleString('vi-VN');
  const createdAt = new Date(booking.createdAt).toLocaleDateString('vi-VN');
  const invoiceDate = new Date().toLocaleDateString('vi-VN');
  const invoiceTime = new Date().toLocaleTimeString('vi-VN');
  const statusLabel = booking.status.replace(/_/g, ' ');

  // Build line items for packages
  const packageRows = (booking.packages || [])
    .map(
      (p) => `
    <tr>
      <td>📦 ${p.package?.name || 'Package'}</td>
      <td>${p.quantity || 1}</td>
      <td>${formatMoneyVND(p.price || 0)}</td>
      <td class="text-right">${formatMoneyVND((p.price || 0) * (p.quantity || 1))}</td>
    </tr>`
    )
    .join('');

  // Build line items for services
  const serviceRows = (booking.services || [])
    .map(
      (s) => `
    <tr>
      <td>🎯 ${s.service?.name || 'Service'}</td>
      <td>${s.quantity || 1}</td>
      <td>${formatMoneyVND(s.price || 0)}</td>
      <td class="text-right">${formatMoneyVND((s.price || 0) * (s.quantity || 1))}</td>
    </tr>`
    )
    .join('');

  const hasNotes = booking.notes && booking.notes.trim().length > 0;
  const notesRow = hasNotes
    ? `
  <div class="notes-section">
    <div class="notes-label">Notes</div>
    <div class="notes-text">${booking.notes!.replace(/\n/g, '<br>')}</div>
  </div>`
    : '';

  const subtotal = booking.totalPrice || 0;

  const html = `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <title>Invoice - Studio HaMy</title>
  <style>
    @page {
      size: A4;
      margin: 20mm;
    }

    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      color: #1a1a2e;
      line-height: 1.6;
      padding: 20px;
    }

    .invoice-container {
      max-width: 700px;
      margin: 0 auto;
    }

    /* Header */
    .header {
      text-align: center;
      padding-bottom: 20px;
      border-bottom: 3px solid #1890ff;
      margin-bottom: 24px;
    }

    .logo-title {
      font-size: 28px;
      font-weight: 700;
      color: #1890ff;
      letter-spacing: 2px;
    }

    .logo-subtitle {
      font-size: 12px;
      color: #666;
      margin-top: 2px;
      letter-spacing: 1px;
    }

    .header-right {
      float: right;
      text-align: right;
      margin-top: 8px;
    }

    .header-right .label {
      font-size: 10px;
      text-transform: uppercase;
      color: #999;
      letter-spacing: 1px;
    }

    .header-right .value {
      font-size: 13px;
      color: #333;
      font-weight: 600;
    }

    .clearfix::after {
      content: '';
      display: table;
      clear: both;
    }

    /* Invoice Title */
    .invoice-title {
      text-align: center;
      margin-bottom: 20px;
    }

    .invoice-title h1 {
      font-size: 22px;
      color: #1a1a2e;
      font-weight: 300;
      text-transform: uppercase;
      letter-spacing: 3px;
    }

    .status-badge {
      display: inline-block;
      padding: 3px 12px;
      border-radius: 12px;
      font-size: 11px;
      font-weight: 600;
      text-transform: uppercase;
      margin-top: 6px;
    }

    .status-PENDING { background: #fff7e6; color: #d48806; border: 1px solid #ffd591; }
    .status-DEPOSIT_PAID { background: #f9f0ff; color: #722ed1; border: 1px solid #d3adf7; }
    .status-CONFIRMED { background: #e6f7ff; color: #096dd9; border: 1px solid #91d5ff; }
    .status-COMPLETED { background: #f6ffed; color: #389e0d; border: 1px solid #b7eb8f; }
    .status-CANCELLED { background: #fff1f0; color: #cf1322; border: 1px solid #ffa39e; }
    .status-RESCHEDULED { background: #f9f0ff; color: #722ed1; border: 1px solid #d3adf7; }

    /* Customer Info */
    .info-section {
      display: flex;
      gap: 20px;
      margin-bottom: 20px;
    }

    .info-box {
      flex: 1;
      padding: 12px 16px;
      background: #fafafa;
      border-radius: 8px;
      border: 1px solid #eee;
    }

    .info-box h3 {
      font-size: 10px;
      text-transform: uppercase;
      color: #999;
      letter-spacing: 1px;
      margin-bottom: 8px;
    }

    .info-box .detail {
      font-size: 13px;
      color: #333;
      margin-bottom: 3px;
    }

    .info-box .detail strong {
      font-weight: 600;
    }

    /* Items Table */
    .items-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 16px;
    }

    .items-table th {
      background: #1890ff;
      color: #fff;
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 1px;
      padding: 10px 12px;
      text-align: left;
      font-weight: 600;
    }

    .items-table th:last-child,
    .items-table td:last-child {
      text-align: right;
    }

    .items-table th:nth-child(2),
    .items-table th:nth-child(3) {
      width: 70px;
      text-align: center;
    }

    .items-table td {
      padding: 10px 12px;
      font-size: 13px;
      border-bottom: 1px solid #f0f0f0;
    }

    .items-table td:nth-child(2),
    .items-table td:nth-child(3) {
      text-align: center;
    }

    .items-table tbody tr:hover {
      background: #fafafa;
    }

    /* Totals */
    .totals {
      text-align: right;
      margin: 16px 0;
    }

    .totals .row {
      display: flex;
      justify-content: flex-end;
      padding: 6px 0;
      font-size: 13px;
    }

    .totals .row .label {
      width: 160px;
      color: #666;
    }

    .totals .row .value {
      width: 160px;
      font-weight: 600;
    }

    .totals .grand-total {
      border-top: 2px solid #1890ff;
      padding-top: 10px;
      margin-top: 6px;
    }

    .totals .grand-total .label {
      font-weight: 700;
      color: #1a1a2e;
    }

    .totals .grand-total .value {
      font-size: 18px;
      color: #1890ff;
      font-weight: 700;
    }

    /* Notes */
    .notes-section {
      margin: 16px 0;
      padding: 12px 16px;
      background: #fafafa;
      border-radius: 8px;
      border-left: 4px solid #1890ff;
    }

    .notes-label {
      font-size: 10px;
      text-transform: uppercase;
      color: #999;
      letter-spacing: 1px;
      margin-bottom: 6px;
    }

    .notes-text {
      font-size: 13px;
      color: #333;
      white-space: normal;
      word-break: break-word;
    }

    /* Footer */
    .footer {
      margin-top: 30px;
      padding-top: 16px;
      border-top: 1px solid #eee;
      text-align: center;
      font-size: 11px;
      color: #999;
    }

    .footer .brand {
      font-weight: 600;
      color: #1890ff;
      font-size: 13px;
      margin-bottom: 4px;
    }

    .footer a {
      color: #666;
      text-decoration: none;
    }

    /* Print specific */
    @media print {
      body {
        padding: 0;
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }

      .header {
        border-bottom-color: #1890ff !important;
      }

      .items-table th {
        background: #1890ff !important;
        color: #fff !important;
      }

      .no-print {
        display: none !important;
      }
    }

    @media screen {
      body {
        background: #f5f5f5;
      }

      .invoice-container {
        background: #fff;
        padding: 32px;
        border-radius: 12px;
        box-shadow: 0 2px 12px rgba(0,0,0,0.08);
        margin-top: 20px;
        margin-bottom: 20px;
      }

      .print-btn {
        display: block;
        margin: 16px auto;
        padding: 10px 32px;
        background: #1890ff;
        color: #fff;
        border: none;
        border-radius: 6px;
        font-size: 14px;
        font-weight: 600;
        cursor: pointer;
      }

      .print-btn:hover {
        background: #096dd9;
      }
    }

    @media print {
      .print-btn {
        display: none !important;
      }
    }
  </style>
</head>
<body>
  <div class="invoice-container">
    ${/* Header */ ''}
    <div class="header clearfix">
      <div class="logo-title">Studio HaMy</div>
      <div class="logo-subtitle">Wedding Photography & Videography</div>
    </div>

    ${/* Invoice title + Booking ID */ ''}
    <div class="invoice-title">
      <h1>Invoice</h1>
      <span class="status-badge status-${booking.status}">${statusLabel}</span>
      <div class="header-right">
        <div class="label">Invoice ID</div>
        <div class="value">#${booking.id}</div>
      </div>
    </div>

    ${/* Customer & Event Info */ ''}
    <div class="info-section">
      <div class="info-box">
        <h3>Customer</h3>
        <div class="detail"><strong>${customerName}</strong></div>
        <div class="detail">📧 ${customerEmail}</div>
        <div class="detail">📞 ${customerPhone}</div>
      </div>
      <div class="info-box">
        <h3>Event Details</h3>
        <div class="detail"><strong>Event:</strong> ${eventDate}</div>
        <div class="detail"><strong>Booked:</strong> ${createdAt}</div>
        <div class="detail"><strong>Invoice:</strong> ${invoiceDate} ${invoiceTime}</div>
      </div>
    </div>

    ${/* Items Table */ ''}
    <table class="items-table">
      <thead>
        <tr>
          <th>Item</th>
          <th>Qty</th>
          <th>Unit Price</th>
          <th>Amount</th>
        </tr>
      </thead>
      <tbody>
        ${packageRows}${serviceRows}
      </tbody>
    </table>

    ${/* Totals */ ''}
    <div class="totals">
      <div class="row">
        <div class="label">Subtotal</div>
        <div class="value">${formatMoneyVND(subtotal)}</div>
      </div>
      <div class="row grand-total">
        <div class="label">TOTAL</div>
        <div class="value">${formatMoneyVND(subtotal)}</div>
      </div>
    </div>

    ${notesRow}

    ${/* Footer */ ''}
    <div class="footer">
      <div class="brand">Studio HaMy</div>
      <div>Wedding Photography & Videography Services</div>
      <div>Thank you for choosing Studio HaMy!</div>
    </div>

    ${/* Print button */ ''}
    <button class="print-btn" onclick="window.print()">🖨️ Print Invoice</button>
  </div>
</body>
</html>`;

  const printWindow = window.open(
    '',
    '_blank',
    'width=800,height=900,scrollbars=yes'
  );
  if (!printWindow) {
    window.alert(
      'Unable to open print window. Please disable popup blocker and try again.'
    );
    return;
  }

  printWindow.document.write(html);
  printWindow.document.close();

  // Wait for content to render, then trigger print
  printWindow.onload = () => {
    printWindow.print();
  };
}
