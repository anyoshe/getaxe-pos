/**
 * Print HTML without relying on pop-ups (uses a hidden iframe).
 * User can choose "Save as PDF" in the browser print dialog.
 */
export function printHtmlDocument(title: string, bodyHtml: string) {
  if (typeof document === "undefined") {
    throw new Error("Print is only available in the browser.");
  }

  const existing = document.getElementById("getaxe-print-frame");
  if (existing) existing.remove();

  const iframe = document.createElement("iframe");
  iframe.id = "getaxe-print-frame";
  iframe.setAttribute("title", title);
  iframe.style.position = "fixed";
  iframe.style.right = "0";
  iframe.style.bottom = "0";
  iframe.style.width = "0";
  iframe.style.height = "0";
  iframe.style.border = "none";
  iframe.style.opacity = "0";
  iframe.style.pointerEvents = "none";
  document.body.appendChild(iframe);

  const doc = iframe.contentDocument || iframe.contentWindow?.document;
  if (!doc) {
    iframe.remove();
    throw new Error("Could not create print frame.");
  }

  doc.open();
  doc.write(`<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>${escapeHtml(title)}</title>
  <style>
    * { box-sizing: border-box; }
    body {
      font-family: system-ui, -apple-system, Segoe UI, Roboto, sans-serif;
      color: #111;
      margin: 24px;
      font-size: 13px;
      line-height: 1.4;
      position: relative;
    }
    h1 { font-size: 20px; margin: 0 0 4px; }
    h2 { font-size: 16px; margin: 0 0 12px; }
    .muted { color: #555; }
    .row { display: flex; justify-content: space-between; gap: 24px; margin-bottom: 20px; }
    .box { flex: 1; }
    table { width: 100%; border-collapse: collapse; margin-top: 12px; }
    th, td { border: 1px solid #ccc; padding: 8px; text-align: left; }
    th { background: #f3f4f6; font-weight: 600; }
    td.num, th.num { text-align: right; }
    .totals { margin-top: 12px; text-align: right; }
    .totals strong { font-size: 15px; }
    .logo { max-height: 56px; max-width: 160px; object-fit: contain; }
    .footer { margin-top: 28px; font-size: 11px; color: #666; border-top: 1px solid #ddd; padding-top: 10px; }
    .doc-status {
      display: inline-block;
      margin-top: 6px;
      padding: 2px 8px;
      border-radius: 999px;
      font-size: 11px;
      font-weight: 600;
      letter-spacing: 0.04em;
    }
    .doc-status-draft { background: #fef3c7; color: #92400e; border: 1px solid #f59e0b; }
    .doc-status-approved { background: #d1fae5; color: #065f46; border: 1px solid #10b981; }
    .doc-status-other { background: #e5e7eb; color: #374151; border: 1px solid #9ca3af; }
    .watermark-draft {
      position: fixed;
      top: 40%;
      left: 50%;
      transform: translate(-50%, -50%) rotate(-28deg);
      font-size: 72px;
      font-weight: 800;
      color: rgba(185, 28, 28, 0.12);
      letter-spacing: 0.2em;
      pointer-events: none;
      z-index: 0;
      white-space: nowrap;
    }
    .print-content { position: relative; z-index: 1; }
    @media print {
      body { margin: 12mm; }
      .no-print { display: none !important; }
      .watermark-draft {
        color: rgba(185, 28, 28, 0.15) !important;
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }
    }
  </style>
</head>
<body>
${bodyHtml}
</body>
</html>`);
  doc.close();

  const win = iframe.contentWindow;
  if (!win) {
    iframe.remove();
    throw new Error("Could not access print frame.");
  }

  const cleanup = () => {
    setTimeout(() => {
      try {
        iframe.remove();
      } catch {
        /* ignore */
      }
    }, 1000);
  };

  const doPrint = () => {
    try {
      win.focus();
      win.print();
    } finally {
      cleanup();
    }
  };

  // Wait for images/styles
  setTimeout(doPrint, 300);
}

function escapeHtml(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function escapeHtmlText(s: string) {
  return escapeHtml(s);
}
