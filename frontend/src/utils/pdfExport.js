/**
 * pdfExport.js
 * Generates a pixel-perfect A4 PDF from the live resume preview.
 * Uses jsPDF + html2canvas (no server required, runs entirely in browser).
 *
 * Install: npm install jspdf html2canvas
 */

import jsPDF from "jspdf";
import html2canvas from "html2canvas";

/* ── A4 dimensions in mm ─────────────────────────────────────── */
const A4 = { w: 210, h: 297 };

/**
 * exportToPDF
 *
 * @param {string}   elementId - ID of the DOM element to capture
 * @param {string}   fileName  - Output filename (without .pdf)
 * @param {object}   options
 * @param {number}   options.scale      - Canvas scale (2 = retina, default)
 * @param {number}   options.marginMm   - Page margin in mm (default 10)
 * @param {function} options.onStart    - Called before export begins
 * @param {function} options.onProgress - Called with progress 0–100
 * @param {function} options.onSuccess  - Called on successful export
 * @param {function} options.onError    - Called with error message
 * @returns {Promise<boolean>}
 */
export async function exportToPDF(
  elementId = "resume-print-area",
  fileName  = "resume",
  {
    scale      = 2,
    marginMm   = 10,
    onStart    = () => {},
    onProgress = () => {},
    onSuccess  = () => {},
    onError    = () => {},
  } = {}
) {
  try {
    onStart();
    onProgress(10);

    const el = document.getElementById(elementId);
    if (!el) throw new Error(`Element #${elementId} not found in DOM.`);

    // 1. Render to canvas
    onProgress(25);
    const canvas = await html2canvas(el, {
      scale,
      useCORS:         true,
      allowTaint:      false,
      backgroundColor: null,
      logging:         false,
      imageTimeout:    15000,
      onclone: (clonedDoc) => {
        // Make fonts visible in clone
        const clonedEl = clonedDoc.getElementById(elementId);
        if (clonedEl) {
          clonedEl.style.transform = "none";
          clonedEl.style.borderRadius = "0";
        }
      },
    });

    onProgress(65);

    // 2. Calculate dimensions
    const imgW  = canvas.width;
    const imgH  = canvas.height;
    const ratio = imgH / imgW;

    // Printable area inside margins
    const printW = A4.w - marginMm * 2;
    const printH = printW * ratio;

    // Decide orientation
    const orientation = printH > A4.h - marginMm * 2 ? "portrait" : "portrait";

    // 3. Create PDF
    const pdf = new jsPDF({
      orientation,
      unit:   "mm",
      format: "a4",
      compress: true,
    });

    onProgress(80);

    const imgData = canvas.toDataURL("image/jpeg", 0.97);

    // Multi-page support: if content is taller than one page, split it
    const pageHeight = A4.h - marginMm * 2;
    const totalPages = Math.ceil(printH / pageHeight);

    for (let page = 0; page < totalPages; page++) {
      if (page > 0) pdf.addPage();

      // Crop source canvas for this page slice
      const srcY      = (page * pageHeight * (imgW / printW)) * scale;
      const srcHeight = Math.min(
        pageHeight * (imgW / printW) * scale,
        imgH - srcY
      );

      // Draw sliced canvas onto a temp canvas
      const tempCanvas = document.createElement("canvas");
      tempCanvas.width  = canvas.width;
      tempCanvas.height = srcHeight;
      const ctx = tempCanvas.getContext("2d");
      ctx.drawImage(canvas, 0, -srcY);

      const pageImgData = tempCanvas.toDataURL("image/jpeg", 0.97);
      const pageImgH    = (srcHeight / (imgW * scale)) * printW;

      pdf.addImage(
        pageImgData,
        "JPEG",
        marginMm,           // x
        marginMm,           // y
        printW,             // width in mm
        pageImgH,           // height in mm
        undefined,
        "FAST"
      );
    }

    onProgress(95);

    // 4. Save
    pdf.save(`${fileName}.pdf`);

    onProgress(100);
    onSuccess();
    return true;

  } catch (err) {
    console.error("[PDF Export Error]", err);
    onError(err.message || "PDF export failed");
    return false;
  }
}

/**
 * printResume
 * Opens the browser print dialog with only the resume visible.
 *
 * @param {string} elementId - ID of the resume element
 */
export function printResume(elementId = "resume-print-area") {
  const el = document.getElementById(elementId);
  if (!el) return;

  // Build a hidden iframe with just the resume HTML
  const iframe = document.createElement("iframe");
  iframe.style.cssText = "position:fixed;left:-9999px;width:210mm;height:297mm;border:none;";
  document.body.appendChild(iframe);

  const doc = iframe.contentWindow.document;
  doc.open();
  doc.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8" />
        <title>Print Resume</title>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link href="https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@400;500;600&display=swap" rel="stylesheet" />
        <style>
          * { box-sizing: border-box; margin: 0; padding: 0; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          body { background: white; font-family: 'DM Sans', sans-serif; }
          @page { size: A4; margin: 0; }
        </style>
      </head>
      <body>${el.outerHTML}</body>
    </html>
  `);
  doc.close();

  // Wait for fonts to load, then print
  iframe.contentWindow.onload = () => {
    iframe.contentWindow.focus();
    iframe.contentWindow.print();
    setTimeout(() => document.body.removeChild(iframe), 2000);
  };
}

/**
 * generateThumbnail
 * Captures a small PNG preview of the resume for dashboard cards.
 *
 * @param {string} elementId
 * @param {number} width  - Output width in px (default 400)
 * @returns {Promise<string|null>} - Base64 PNG data URL, or null on failure
 */
export async function generateThumbnail(elementId = "resume-print-area", width = 400) {
  try {
    const el = document.getElementById(elementId);
    if (!el) return null;

    const canvas = await html2canvas(el, {
      scale:           1,
      useCORS:         true,
      backgroundColor: null,
      logging:         false,
    });

    // Resize to target width
    const ratio  = canvas.height / canvas.width;
    const out    = document.createElement("canvas");
    out.width    = width;
    out.height   = Math.round(width * ratio);
    const ctx    = out.getContext("2d");
    ctx.drawImage(canvas, 0, 0, out.width, out.height);

    return out.toDataURL("image/png");
  } catch (err) {
    console.error("[Thumbnail Error]", err);
    return null;
  }
}
