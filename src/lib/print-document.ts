/**
 * Open a clean print window (Save as PDF from the browser print dialog).
 */
export function printHtmlDocument(title: string, bodyHtml: string) {
  const w = window.open("", "_blank", "noopener,noreferrer,width=900,height=700");
  if (!w) {
    throw new Error("Pop-up blocked. Allow pop-ups to print.");
  }
  w.document.write(`<!DOCTYPE html>
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
    @media print {
      body { margin: 12mm; }
      .no-print { display: none !important; }
    }
  </style>
</head>
<body>
${bodyHtml}
<script>
  window.onload = function () {
    setTimeout(function () { window.print(); }, 250);
  };
</script>
</body>
</html>`);
  w.document.close();
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
