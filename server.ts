import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import crypto from "crypto";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // --- DANA API Configuration ---
  const DANA_BASE_URL = "https://api.sandbox.dana.id";
  const clientId = process.env.DANA_CLIENT_ID;
  const clientSecret = process.env.DANA_CLIENT_SECRET;
  
  // API Routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // Proxy route for DANA API (e.g., QRIS Generation / Payment)
  app.post("/api/dana/pay", async (req, res) => {
    try {
      const { amount, invoiceNumber } = req.body;
      
      if (!amount || !invoiceNumber) {
        return res.status(400).json({ error: "Amount and invoiceNumber are required." });
      }

      // Check if credentials exist (informational)
      if (!clientId || !clientSecret) {
        console.warn("DANA API credentials missing. Using mock response for sandbox simulation.");
        // Simulate a successful QRIS payment creation since actual DANA API needs valid signatures
        return res.json({
          success: true,
          data: {
            qrCodeUrl: "https://api.sandbox.dana.id/mock-qr/" + invoiceNumber,
            invoiceNumber,
            amount,
            status: "CREATED",
            message: "Mock DANA Sandbox connection successful. Provide real keys for actual integration."
          }
        });
      }

      // Actual integration placeholder (if credentials provided)
      // Note: Real DANA OpenAPI requires SNAP BI signature generation.
      // This is a simplified forwarder assuming the endpoint handles basic auth or custom headers.
      const response = await fetch(`${DANA_BASE_URL}/v3/acquiring/order/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Client-Id": clientId,
          // "X-Signature": generateSignature(...) // In a real app, generate RSA signature here
        },
        body: JSON.stringify({
          order: {
            orderTitle: `Invoice ${invoiceNumber}`,
            orderAmount: {
              currency: "IDR",
              value: amount.toString()
            }
          },
          merchantId: process.env.DANA_MERCHANT_ID
        })
      });

      const responseData = await response.json();
      res.json({ success: true, data: responseData });
    } catch (error: any) {
      console.error("DANA API Error:", error);
      res.status(500).json({ success: false, error: error.message || "Failed to connect to DANA API" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
