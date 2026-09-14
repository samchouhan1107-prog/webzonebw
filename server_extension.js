
/* ============================================================
 * STUDIO+ ENTITLEMENT & LENS LIBRARY MANAGEMENT
 * ============================================================ */

// Database-backed storage for entitlements and purchases
// In production, move to a formal DB (e.g., PostgreSQL or MongoDB)
const entitlements = new Map(); // userID -> { status: "ACTIVE", plan: "STUDIO_PLUS" }
const purchasedLenses = new Map(); // userID -> [ { lensId, purchaseDate, orderId } ]

/**
 * REST API to fetch User's Purchased Lens Library
 * GET /api/lenses
 */
app.get("/api/lenses", (req, res) => {
    // 1. Authenticate user from session/JWT
    const userId = "demo_user_123"; 

    // 2. Verify entitlement status
    const ent = entitlements.get(userId);
    if (!ent || ent.status !== "ACTIVE") {
        return res.status(403).json({ success: false, error: "No active Studio+ subscription" });
    }

    // 3. Return purchased lenses
    const lenses = purchasedLenses.get(userId) || [];
    res.json({ success: true, lenses: lenses });
});

/**
 * TRANSACTIONAL EMAIL HANDLER
 * (Stub for integration with Nodemailer/SendGrid/SES)
 */
async function sendTransactionalEmail(email, type, data) {
    console.log(`[EMAIL] Sending ${type} to ${email}...`);
    // Example: Implementation with Nodemailer
    // await transporter.sendMail({ ... });
}

// Update webhook to trigger library addition and notification
app.post("/api/cashfree/webhook", async (req, res) => {
    const { order, payment } = req.body.data;
    const userId = order.customer_details.customer_id;
    
    if (payment.payment_status === "SUCCESS") {
        // 1. Grant Entitlement
        entitlements.set(userId, { status: "ACTIVE", verifiedAt: new Date().toISOString() });
        
        // 2. Add default Studio+ Lens to Library
        const newLens = { lensId: "studio_plus_premium_01", purchaseDate: new Date().toISOString(), orderId: order.order_id };
        const userLenses = purchasedLenses.get(userId) || [];
        userLenses.push(newLens);
        purchasedLenses.set(userId, userLenses);
        
        // 3. Trigger Confirmation Email
        await sendTransactionalEmail(order.customer_details.customer_email, "PURCHASE_CONFIRMATION", { lens: newLens });
        
        console.log(`[WEBZONEBW] Entitlement & Lens granted for: ${userId}`);
    }
    
    res.status(200).send("OK");
});
