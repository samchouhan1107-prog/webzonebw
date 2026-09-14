/* ============================================================
 * WEBZONEBW STUDIO+ PRODUCTION ENGINE — FINAL
 * ============================================================ */

import crypto from "crypto";
import pg from "pg"; // Example: Using 'pg' for PostgreSQL
import nodemailer from "nodemailer";

// 1. DATABASE CONFIGURATION
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });

// 2. EMAIL CONFIGURATION
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: 587,
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
});

// 3. SECURE WEBHOOK HANDLER
app.post("/api/cashfree/webhook", async (req, res) => {
    // Signature validation
    const signature = req.headers["x-webhook-signature"];
    const timestamp = req.headers["x-webhook-timestamp"];
    const data = timestamp + JSON.stringify(req.body);
    const expected = crypto.createHmac("sha256", process.env.CASHFREE_CLIENT_SECRET).update(data).digest("base64");

    if (signature !== expected) return res.status(401).send("Unauthorized");

    const { order, payment } = req.body.data;
    if (payment.payment_status === "SUCCESS") {
        const client = await pool.connect();
        try {
            await client.query("BEGIN");
            // Activate Entitlement
            await client.query("UPDATE users SET studio_plus = TRUE WHERE user_id=$1", [order.customer_details.customer_id]);
            // Add Lens
            await client.query("INSERT INTO purchased_lenses (user_id, lens_id, order_id) VALUES ($1, $2, $3)", 
                [order.customer_details.customer_id, "studio_plus_premium_01", order.order_id]);
            await client.query("COMMIT");
            
            // Email Notification
            await transporter.sendMail({
                from: '"WEBZONEBW Studio" <noreply@webzonebw.in>',
                to: order.customer_details.customer_email,
                subject: "Studio+ Activation Successful",
                text: "Your Studio+ lens is now available in your Library."
            });
        } catch (e) {
            await client.query("ROLLBACK");
            throw e;
        } finally {
            client.release();
        }
    }
    res.status(200).send("OK");
});

// 4. LENS LIBRARY API
app.get("/api/lenses", async (req, res) => {
    if (!req.session.userId) return res.status(401).send("Unauthorized");
    const result = await pool.query("SELECT lens_id, purchase_date FROM purchased_lenses WHERE user_id=$1", [req.session.userId]);
    res.json({ success: true, lenses: result.rows });
});

// 5. EMAIL PREFERENCES
app.post("/api/user/email-prefs", async (req, res) => {
    if (!req.session.userId) return res.status(401).send("Unauthorized");
    const { marketing } = req.body;
    await pool.query("UPDATE user_settings SET marketing_emails=$1 WHERE user_id=$2", [!!marketing, req.session.userId]);
    res.json({ success: true });
});
