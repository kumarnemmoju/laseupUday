const express = require("express");
const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(cors());

// Generate Invoice API
app.post("/generate-invoice", (req, res) => {
    try {
        const data = req.body;
        if (!data || !data.orderedProducts) {
            return res.status(400).json({ message: "Invalid order details" });
        }

        const doc = new PDFDocument({ size: "A4", margin: 50 });

        // Set response headers
        res.setHeader("Content-Disposition", "attachment; filename=invoice.pdf");
        res.setHeader("Content-Type", "application/pdf");

        // Pipe PDF to response
        doc.pipe(res);

        // Theme Color
        const themeColor = "#1e3c72";

        // Add logo
        const logoPath = path.join(__dirname, "logo.jpg");
        if (fs.existsSync(logoPath)) {
            doc.image(logoPath, 50, 30, { width: 100 });
        }

        // INVOICE Title
        doc.fillColor(themeColor).fontSize(20).text("INVOICE", { align: "center" });
        doc.moveDown(2);

        // Order Details & Delivery Address
        doc.fontSize(12).fillColor("black").font("Helvetica-Bold").text("Order Details:", 50, 110);
        doc.font("Helvetica").text(`Order ID: ${data.orderId}`);
        doc.text(`Order Placed On: ${data.orderPlacedOn}`);
        doc.text(`Return Policy: ${data.returnPolicy === "yes" ? "Applicable" : "Not Applicable"}`);

        doc.fontSize(12).fillColor("black").font("Helvetica-Bold").text("Delivery Address:", 350, 110);
        doc.font("Helvetica").text(`${data.deliveredAddress.street}, ${data.deliveredAddress.suite}`);
        doc.text(`${data.deliveredAddress.city}, ${data.deliveredAddress.state}, ${data.deliveredAddress.country}`);

        doc.moveDown(2);

        // Table Header
        doc.fontSize(14).fillColor(themeColor).text("Ordered Products", 50, doc.y, { underline: true });
        doc.moveDown();

        const startX = 50;
        let y = doc.y;
        const cellHeight = 35;

        // Table Headers
        doc.fillColor(themeColor).rect(startX, y, 500, 25).fill(themeColor).stroke();
        doc.fillColor("white").font("Helvetica-Bold");
        doc.text("Product", startX + 5, y + 5, { width: 110 });
        doc.text("Qty", startX + 120, y + 5);
        doc.text("Discount", startX + 180, y + 5);
        doc.text("Price", startX + 270, y + 5);
        doc.text("GST", startX + 370, y + 5);
        doc.text("Delivery", startX + 440, y + 5);
        y += 30;

        // Table Rows
        doc.font("Helvetica").fillColor("black");
        data.orderedProducts.forEach((product) => {
            doc.rect(startX, y, 500, cellHeight).stroke();
            doc.text(`${product.brand} ${product.series}`, startX + 5, y + 5, { width: 110 });
            doc.text(`${product.quantity}`, startX + 120, y + 5);
            doc.text(`${product.offerPercentage}%`, startX + 180, y + 5);
            doc.text(`$${product.currentPrice}`, startX + 270, y + 5);
            doc.text(`$${product.gst}`, startX + 370, y + 5);
            doc.text(`$${product.deliveryCharges}`, startX + 440, y + 5);
            y += cellHeight + 5;
        });

        y += 10;

        // Grand Total & GST
        doc.fillColor(themeColor).font("Helvetica-Bold");
        doc.text(`Total GST Applied: $${data.totalGSTApplied}`, startX, y, { bold: true });
        doc.text(`Grand Total: $${data.grandTotal}`, startX + 300, y, { bold: true });

        y += 50;

        // Website, Email, and Signature
        doc.fillColor("black").fontSize(10).text("Website: laseup.com", 50, y);
        doc.text("Email: support@laseup.com", 50, y + 15);

        const signaturePath = path.join(__dirname, "signature.png");
        if (fs.existsSync(signaturePath)) {
            doc.image(signaturePath, 400, y - 10, { width: 100 });
        }

        doc.end();
    } catch (error) {
        console.error("Error generating PDF:", error);
        res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
});

// Start Server
app.listen(3000, () => {
    console.log("Server running on port 3000");
});