// Reasoning: PDF utility to generate invoice PDFs using PDFKit in a streaming-safe manner
const fs = require("fs");
const path = require("path");
const PDFDocument = require("pdfkit");
const config = require("../config");

function generateInvoice({ order, items }) {
  const invoicesDir = path.join(process.cwd(), config.INVOICE_DIR);
  if (!fs.existsSync(invoicesDir)) {
    fs.mkdirSync(invoicesDir, { recursive: true });
  }

  const filename = `invoice-${order.id}.pdf`;
  const filepath = path.join(invoicesDir, filename);
  const doc = new PDFDocument({ size: "A4", margin: 50 });
  const stream = fs.createWriteStream(filepath);
  doc.pipe(stream);

  // Header
  doc.fontSize(20).text("Invoice", { align: "right" }).moveDown();

  // Seller info
  doc.fontSize(12).text("Shop Inc.");
  doc.text("no-reply@example.com");
  doc.text("123 Market Street");
  doc.text("City, Country");
  doc.moveDown();

  // Order info
  doc.fontSize(12).text(`Order ID: ${order.id}`);
  doc.text(
    `Date: ${new Date(order.created_at || Date.now()).toLocaleString()}`,
  );
  doc.text(`Status: ${order.status}`);
  doc.moveDown();

  // Shipping address
  doc.fontSize(12).text("Ship To:");
  doc.text(order.shipping_name);
  doc.text(order.shipping_address_line1);
  if (order.shipping_address_line2) doc.text(order.shipping_address_line2);
  doc.text(
    `${order.shipping_city}, ${order.shipping_state} ${order.shipping_postal_code}`,
  );
  doc.text(order.shipping_country);
  doc.moveDown();

  // Items table header
  doc.font("Helvetica-Bold");
  doc.text("Product", 50, doc.y, { continued: true });
  doc.text("Qty", 300, doc.y, { continued: true });
  doc.text("Unit", 350, doc.y, { continued: true });
  doc.text("Total", 420);
  doc.moveDown();
  doc.font("Helvetica");

  items.forEach((it) => {
    doc.text(it.product_name, 50, doc.y, { continued: true });
    doc.text(String(it.quantity), 300, doc.y, { continued: true });
    doc.text(
      (it.unit_price_cents / 100).toFixed(2) + " " + order.currency,
      350,
      doc.y,
      { continued: true },
    );
    doc.text(
      (it.line_total_cents / 100).toFixed(2) + " " + order.currency,
      420,
    );
  });

  doc.moveDown();
  doc.text(
    `Subtotal: ${(order.subtotal_cents / 100).toFixed(2)} ${order.currency}`,
    { align: "right" },
  );
  doc.text(
    `Shipping: ${(order.shipping_cents / 100).toFixed(2)} ${order.currency}`,
    { align: "right" },
  );
  doc.font("Helvetica-Bold");
  doc.text(`Total: ${(order.total_cents / 100).toFixed(2)} ${order.currency}`, {
    align: "right",
  });

  doc.end();

  return new Promise((resolve, reject) => {
    stream.on("finish", () => resolve({ filename, filepath }));
    stream.on("error", reject);
  });
}

module.exports = { generateInvoice };
