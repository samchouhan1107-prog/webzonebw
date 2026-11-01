/* ============================================================
 * WEBZONEBW - PAYPAL ROUTES MODULE
 * ------------------------------------------------------------
 * Extracted from server.js: all PayPal order/capture/webhook
 * and license endpoints, wired in via an Express Router.
 *
 * Dependencies (licenseStore, session lookup, PayPal config)
 * are injected by server.js to avoid circular requires.
 * ============================================================ */

"use strict";

const express = require("express");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const {
    createErrorResponse,
    validateInput,
    SECURITY_CONFIG
} = require("./validate");

/* ============================================================
 * ROUTER FACTORY
 * ctx = {
 *   licenseStore,        // shared in-memory license store
 *   loadLicenseStore,    // () => void  (reads licenses.json)
 *   saveLicenseStore,    // () => void  (writes licenses.json)
 *   getUserSession,      // (req) => session | null
 *   isHalloweenPromoActive, // () => boolean
 *   HALLOWEEN_PROMO_CONFIG // { promoStart, promoEnd, promoKeys }
 * }
 * ============================================================ */

function createPayPalRouter(ctx) {
    const {
        licenseStore,
        loadLicenseStore,
        saveLicenseStore,
        getUserSession,
        validatePromoKey,
        isHalloweenPromoActive,
        HALLOWEEN_PROMO_CONFIG
    } = ctx;

    /* ---------------- Config ---------------- */

    // --- PayPal API Configuration (PayPal ONLY - no other gateway) ---
    const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID;
    const PAYPAL_CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET;
    const PAYPAL_MODE = (process.env.PAYPAL_MODE || "sandbox").trim().toLowerCase();
    const IS_PAYPAL_LIVE = PAYPAL_MODE === "production" || PAYPAL_MODE === "live";
    const PAYPAL_BASE_URL = IS_PAYPAL_LIVE
        ? "https://api-m.paypal.com"
        : "https://api-m.sandbox.paypal.com";
    const PAYPAL_CURRENCY = process.env.PAYPAL_CURRENCY || "USD";
    const PAYPAL_WEBHOOK_ID = process.env.PAYPAL_WEBHOOK_ID;
    /* PayPal settlement in USD; $5.99 is the standard price. */
    const ER_PREMIUM_AMOUNT_USD = 5.99;

    /* Direct / manual order channel - buyers without PayPal can email us. */
    const ORDER_EMAIL = process.env.ORDER_EMAIL || null;

    // --- ER Studio Premium License Configuration ---
    const ER_PREMIUM_PLAN = "er-studio-premium";
    const ER_PREMIUM_AMOUNT = ER_PREMIUM_AMOUNT_USD; // $5.99 USD - one-time ER Studio license

    // --- FaceFilter 24-Hour Offer Configuration ---
    const FACEFILTER_CONFIG = {
        offers: {
            'halo': { name: 'Angel Halo', price: 1.99, currency: 'USD', duration: 24 },
            'witch-ritual': { name: 'Witch Ritual', price: 2.99, currency: 'USD', duration: 24 },
            'haunted-forest': { name: 'Haunted Forest', price: 3.99, currency: 'USD', duration: 24 },
            'vr-cyberdeck': { name: 'VR Cyberdeck', price: 4.99, currency: 'USD', duration: 24 },
            'vr-mansion': { name: 'VR Haunted Manor', price: 5.99, currency: 'USD', duration: 24 },
            'pumpkin-pose': { name: 'Pumpkin Pose', price: 1.99, currency: 'USD', duration: 24 }
        }
    };

    function getFaceFilterOffer(filterId) {
        return FACEFILTER_CONFIG.offers[filterId];
    }

    function generateEntitlementId() {
        const block = () => crypto.randomBytes(2).toString("hex").toUpperCase();
        return `FF-ENT-${block()}-${block()}-${block()}`;
    }

    function generateLicenseKey() {
        const block = () => crypto.randomBytes(2).toString("hex").toUpperCase();
        return `WZB-ER-${block()}-${block()}-${block()}`;
    }

    function requireUserSession(req, res) {
        const session = getUserSession(req);
        if (!session) {
            res.status(401).json({
                success: false,
                error: "UNAUTHORIZED",
                message: "Valid session required."
            });
            return null;
        }
        return session;
    }

    /* ---------------- PayPal helpers ---------------- */

    async function getPayPalToken() {
        if (!PAYPAL_CLIENT_ID || !PAYPAL_CLIENT_SECRET) return null;
        try {
            const response = await fetch(`${PAYPAL_BASE_URL}/v1/oauth2/token`, {
                method: "POST",
                headers: {
                    "Authorization": "Basic " + Buffer.from(`${PAYPAL_CLIENT_ID}:${PAYPAL_CLIENT_SECRET}`).toString("base64"),
                    "Content-Type": "application/x-www-form-urlencoded"
                },
                body: "grant_type=client_credentials"
            });
            if (!response.ok) return null;
            const data = await response.json();
            return data.access_token || null;
        } catch (e) {
            console.error("[WEBZONEBW PAYPAL] Token error:", e.message);
            return null;
        }
    }

    async function paypalRequest(accessToken, method, resourcePath, body) {
        const response = await fetch(`${PAYPAL_BASE_URL}${resourcePath}`, {
            method,
            headers: {
                "Authorization": `Bearer ${accessToken}`,
                "Content-Type": "application/json"
            },
            body: body ? JSON.stringify(body) : undefined
        });
        const data = await response.json().catch(() => ({}));
        return { ok: response.ok, status: response.status, data };
    }

    /*
     * PayPal Webhook Verification - Security critical function
     */
    async function verifyPayPalWebhook(webhookData, headers) {
        if (!PAYPAL_WEBHOOK_ID) {
            console.error("[WEBZONEBW] PayPal webhook ID not configured");
            return false;
        }

        try {
            const verificationResponse = await fetch(`${PAYPAL_BASE_URL}/v1/notifications/verify-webhook-signature`, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${await getPayPalToken()}`,
                    "Content-Type": "application/json",
                    "PayPal-Auth-Algo": headers["paypal-auth-algo"],
                    "PayPal-Transmission-Id": headers["paypal-transmission-id"],
                    "PayPal-Cert-Id": headers["paypal-cert-id"],
                    "PayPal-Transmission-Sig": headers["paypal-transmission-sig"],
                    "PayPal-Transmission-Time": headers["paypal-transmission-time"]
                },
                body: JSON.stringify({
                    webhook_id: PAYPAL_WEBHOOK_ID,
                    webhook_event: webhookData
                })
            });

            if (!verificationResponse.ok) {
                console.error("[WEBZONEBW] Webhook verification failed:", verificationResponse.status);
                return false;
            }

            const verificationResult = await verificationResponse.json();
            return verificationResult.verification_status === "SUCCESS";
        } catch (error) {
            console.error("[WEBZONEBW] Webhook verification error:", error);
            return false;
        }
    }

    /*
     * Check if a license is valid and not expired
     */
    function isLicenseValid(license) {
        if (!license || license.status !== "ACTIVE") {
            return false;
        }

        if (license.expiresAt) {
            const now = new Date();
            const expiresAt = new Date(license.expiresAt);
            return now < expiresAt;
        }

        return true;
    }

    function issueLicenseForOrder(storedOrder) {
        if (storedOrder.licenseKey) return storedOrder.licenseKey;

        const licenseKey = generateLicenseKey();

        licenseStore.licenses.set(licenseKey, {
            licenseKey: licenseKey,
            email: storedOrder.email,
            orderId: storedOrder.orderId,
            plan: ER_PREMIUM_PLAN,
            amount: storedOrder.amount,
            status: "ACTIVE",
            issuedAt: new Date().toISOString(),
            lastVerifiedAt: null
        });

        storedOrder.licenseKey = licenseKey;
        console.log(`[WEBZONEBW] License ${licenseKey} issued for ${storedOrder.email} (order ${storedOrder.orderId})`);
        saveLicenseStore();
        return licenseKey;
    }

    /* ============================================================
     * ROUTER
     * ============================================================ */

    const router = express.Router();

    /*
     * Client-facing order creation - matches the er-license-premium.js flow:
     * returns the PayPal order id + the public client id so the PayPal
     * JS SDK Buttons can be rendered. No secrets are exposed here.
     */
    router.post("/api/paypal/create-order", async (req, res) => {
        try {
            const { planId, customerEmail } = req.body || {};

            // Enhanced validation
            if (planId && planId !== ER_PREMIUM_PLAN) {
                return createErrorResponse(res, 400, 'UNKNOWN_PLAN',
                    'Invalid plan ID specified');
            }

            if (!PAYPAL_CLIENT_ID || !PAYPAL_CLIENT_SECRET) {
                return createErrorResponse(res, 503, 'PAYMENT_NOT_CONFIGURED',
                    'Payment system is not configured');
            }

            const email = String(customerEmail || "").trim();
            if (!email) {
                return createErrorResponse(res, 400, 'MISSING_CUSTOMER_EMAIL',
                    'Customer email is required');
            }

            try {
                validateInput(email, 'string', {
                    type: 'email',
                    maxLength: SECURITY_CONFIG.validation.maxEmailLength
                });
            } catch (validationError) {
                return createErrorResponse(res, 400, 'INVALID_CUSTOMER_EMAIL',
                    validationError.message);
            }

            const accessToken = await getPayPalToken();
            if (!accessToken) {
                return createErrorResponse(res, 502, 'GATEWAY_AUTH_FAILED',
                    'Payment gateway authentication failed');
            }

            const { ok, status, data } = await paypalRequest(accessToken, "POST", "/v2/checkout/orders", {
                intent: "CAPTURE",
                purchase_units: [{
                    description: "WebZoneBW ER Studio Premium License",
                    custom_id: email,
                    amount: {
                        currency_code: PAYPAL_CURRENCY,
                        value: ER_PREMIUM_AMOUNT_USD.toFixed(2)
                    }
                }]
            });

            if (!ok || !data.id) {
                console.error("[WEBZONEBW] PayPal order creation failed:", status, data);
                return createErrorResponse(res, 502, 'GATEWAY_ORDER_FAILED',
                    'Failed to create PayPal order', { paypalStatus: status, paypalData: data });
            }

            licenseStore.orders.set(data.id, {
                orderId: data.id,
                email: email,
                plan: ER_PREMIUM_PLAN,
                amount: ER_PREMIUM_AMOUNT,
                amountUsd: ER_PREMIUM_AMOUNT_USD,
                currency: PAYPAL_CURRENCY,
                status: "CREATED",
                createdAt: new Date().toISOString()
            });
            saveLicenseStore();

            res.json({
                success: true,
                orderId: data.id,
                clientId: PAYPAL_CLIENT_ID,
                amount: ER_PREMIUM_AMOUNT,
                amountUsd: ER_PREMIUM_AMOUNT_USD,
                currency: PAYPAL_CURRENCY,
                mode: PAYPAL_MODE,
                timestamp: new Date().toISOString()
            });
        } catch (error) {
            createErrorResponse(res, 500, 'PAYMENT_INIT_FAILED',
                'Payment initialization failed', { error: error.message });
        }
    });

    /* Public client id for the PayPal JS SDK (safe to expose) */
    router.get("/api/paypal/client-id", (req, res) => {
        if (!PAYPAL_CLIENT_ID || !PAYPAL_CLIENT_SECRET) {
            return res.status(503).json({ success: false, error: "PAYMENT_NOT_CONFIGURED" });
        }
        res.json({
            success: true,
            clientId: PAYPAL_CLIENT_ID,
            mode: PAYPAL_MODE,
            currency: PAYPAL_CURRENCY,
            amount: ER_PREMIUM_AMOUNT_USD
        });
    });

    /* Public contact channel for manual orders (no secrets exposed) */
    router.get("/api/order-email", (req, res) => {
        if (!ORDER_EMAIL) {
            return res.status(503).json({ success: false, error: "ORDER_EMAIL_NOT_CONFIGURED" });
        }
        res.json({ success: true, email: ORDER_EMAIL, plan: ER_PREMIUM_PLAN, amount: ER_PREMIUM_AMOUNT });
    });

    router.post("/api/create-order", async (req, res) => {
        try {
            const { planId, customerEmail } = req.body || {};

            if (planId && planId !== ER_PREMIUM_PLAN) {
                return res.status(400).json({ success: false, error: "UNKNOWN_PLAN" });
            }

            if (!PAYPAL_CLIENT_ID || !PAYPAL_CLIENT_SECRET) {
                /*
                 * NO fake payments: without PayPal credentials we refuse
                 * to start checkout and the client keeps premium locked.
                 */
                return res.status(503).json({
                    success: false,
                    error: "PAYMENT_NOT_CONFIGURED"
                });
            }

            const email = String(customerEmail || "").trim();
            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
                return res.status(400).json({ success: false, error: "INVALID_CUSTOMER_DETAILS" });
            }

            const accessToken = await getPayPalToken();
            if (!accessToken) {
                return res.status(502).json({ success: false, error: "GATEWAY_AUTH_FAILED" });
            }

            const { ok, status, data } = await paypalRequest(accessToken, "POST", "/v2/checkout/orders", {
                intent: "CAPTURE",
                purchase_units: [{
                    description: "WebZoneBW ER Studio Premium License",
                    custom_id: email,
                    amount: {
                        currency_code: PAYPAL_CURRENCY,
                        value: ER_PREMIUM_AMOUNT_USD.toFixed(2)
                    }
                }]
            });

            if (!ok || !data.id) {
                console.error("[WEBZONEBW] PayPal order creation failed:", status, data);
                return res.status(502).json({ success: false, error: "GATEWAY_ORDER_FAILED" });
            }

            licenseStore.orders.set(data.id, {
                orderId: data.id,
                email: email,
                plan: ER_PREMIUM_PLAN,
                amount: ER_PREMIUM_AMOUNT,
                amountUsd: ER_PREMIUM_AMOUNT_USD,
                currency: PAYPAL_CURRENCY,
                status: "CREATED",
                createdAt: new Date().toISOString()
            });
            saveLicenseStore();

            res.json({
                success: true,
                order_id: data.id,
                amount: ER_PREMIUM_AMOUNT,
                amountUsd: ER_PREMIUM_AMOUNT_USD,
                currency: PAYPAL_CURRENCY,
                mode: PAYPAL_MODE
            });
        } catch (error) {
            console.error("[WEBZONEBW] Payment init failed:", error);
            res.status(500).json({ success: false, error: "Payment init failed" });
        }
    });

    /*
     * Enhanced PayPal Webhook Handler: Secure server-side payment verification
     */
    router.post("/api/paypal/webhook", async (req, res) => {
        try {
            const webhookData = req.body;
            const webhookId = PAYPAL_WEBHOOK_ID;

            if (!webhookId) {
                return createErrorResponse(res, 503, 'WEBHOOK_NOT_CONFIGURED',
                    'PayPal webhook is not configured');
            }

            // Verify webhook signature (security critical)
            const isValidWebhook = await verifyPayPalWebhook(webhookData, req.headers);
            if (!isValidWebhook) {
                console.error("[WEBZONEBW] Invalid PayPal webhook signature");
                return createErrorResponse(res, 403, 'INVALID_WEBHOOK_SIGNATURE',
                    'Invalid PayPal webhook signature');
            }

            if (webhookData.event_type === "PAYMENT.CAPTURE.COMPLETED") {
                const capture = webhookData.resource;
                const paypalOrderId = capture.custom_id || capture.supplementary_data?.related_ids?.[0];

                if (!paypalOrderId) {
                    console.error("[WEBZONEBW] PayPal webhook missing custom_id");
                    return createErrorResponse(res, 400, 'MISSING_CUSTOM_ID',
                        'PayPal webhook missing custom identifier');
                }

                if (!capture || !capture.amount || !capture.status) {
                    return createErrorResponse(res, 400, 'INVALID_WEBHOOK_DATA',
                        'Invalid webhook data structure');
                }

                const storedOrder = licenseStore.orders.get(paypalOrderId);
                if (!storedOrder) {
                    console.error("[WEBZONEBW] Order not found for webhook:", paypalOrderId);
                    return createErrorResponse(res, 404, 'ORDER_NOT_FOUND',
                        `Order not found: ${paypalOrderId}`);
                }

                const capturedAmount = capture.amount?.value;
                const expectedAmount = storedOrder.amountUsd?.toString() || "5.99";

                if (capturedAmount !== expectedAmount) {
                    console.error("[WEBZONEBW] Amount mismatch - expected:", expectedAmount, "got:", capturedAmount);
                    return createErrorResponse(res, 400, 'AMOUNT_MISMATCH',
                        'Payment amount mismatch', {
                        expected: expectedAmount,
                        received: capturedAmount
                    });
                }

                if (capture.status !== "COMPLETED") {
                    console.error("[WEBZONEBW] Payment not completed - status:", capture.status);
                    return createErrorResponse(res, 400, 'PAYMENT_NOT_COMPLETED',
                        'Payment is not completed', {
                        paymentStatus: capture.status
                    });
                }

                if (storedOrder.licenseKey) {
                    console.log(`[WEBZONEBW] License already exists for order ${paypalOrderId}`);
                    return res.json({
                        success: true,
                        message: "License already issued for this order",
                        licenseKey: storedOrder.licenseKey,
                        timestamp: new Date().toISOString()
                    });
                }

                const licenseKey = generateLicenseKey();
                const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(); // 24 hours from now

                licenseStore.licenses.set(licenseKey, {
                    licenseKey: licenseKey,
                    email: storedOrder.email,
                    orderId: paypalOrderId,
                    plan: storedOrder.plan,
                    amount: storedOrder.amount,
                    status: "ACTIVE",
                    issuedAt: new Date().toISOString(),
                    expiresAt: expiresAt,
                    lastVerifiedAt: new Date().toISOString(),
                    paymentReference: capture.id,
                    paymentStatus: capture.status,
                    currency: capture.amount?.currency_code
                });

                storedOrder.status = "COMPLETED";
                storedOrder.licenseKey = licenseKey;
                storedOrder.completedAt = new Date().toISOString();
                licenseStore.orders.set(paypalOrderId, storedOrder);

                saveLicenseStore();

                console.log(`[WEBZONEBW] License ${licenseKey} created for ${storedOrder.email} (24-hour access)`);

                return res.json({
                    success: true,
                    licenseKey: licenseKey,
                    message: "License created successfully",
                    expiresAt: expiresAt,
                    timestamp: new Date().toISOString()
                });
            }

            return res.json({
                success: true,
                message: "Webhook processed successfully",
                timestamp: new Date().toISOString()
            });
        } catch (error) {
            createErrorResponse(res, 500, 'WEBHOOK_PROCESSING_FAILED',
                'Webhook processing failed', { error: error.message });
        }
    });

    /*
     * Server-side CAPTURE: called by the client after PayPal approval.
     */
    router.post("/api/paypal/capture", async (req, res) => {
        try {
            const { orderId, email } = req.body || {};

            if (!orderId) {
                return createErrorResponse(res, 400, 'ORDER_ID_REQUIRED',
                    'Order ID is required');
            }

            if (!PAYPAL_CLIENT_ID || !PAYPAL_CLIENT_SECRET) {
                return createErrorResponse(res, 503, 'PAYMENT_NOT_CONFIGURED',
                    'Payment system is not configured');
            }

            const accessToken = await getPayPalToken();
            if (!accessToken) {
                return createErrorResponse(res, 502, 'GATEWAY_AUTH_FAILED',
                    'Payment gateway authentication failed');
            }

            const { ok, data } = await paypalRequest(
                accessToken, "POST",
                `/v2/checkout/orders/${encodeURIComponent(String(orderId))}/capture`,
                {}
            );

            const captureStatus = data && data.status;
            const storedOrder = licenseStore.orders.get(String(orderId));

            if (!ok || captureStatus !== "COMPLETED" || !storedOrder) {
                console.warn("[WEBZONEBW] PayPal capture not completed:", captureStatus, data && data.message);
                return res.status(402).json({
                    success: false,
                    error: "PAYMENT_NOT_VERIFIED - PayPal has not confirmed this payment. Premium stays locked."
                });
            }

            if (email && storedOrder.email && String(email).toLowerCase() !== storedOrder.email.toLowerCase()) {
                return res.status(403).json({ success: false, error: "EMAIL_MISMATCH" });
            }

            storedOrder.status = "PAID";
            storedOrder.paidAt = new Date().toISOString();
            const licenseKey = issueLicenseForOrder(storedOrder);

            res.json({
                success: true,
                licenseKey: licenseKey,
                status: "ACTIVE",
                plan: ER_PREMIUM_PLAN,
                email: storedOrder.email
            });
        } catch (error) {
            console.error("[WEBZONEBW] PayPal capture failed:", error);
            res.status(500).json({ success: false, error: "CAPTURE_FAILED" });
        }
    });

    /* ------------------------------------------------------------ */

    router.post("/api/license/manual-activate", (req, res) => {
        const adminKey = req.headers["x-admin-key"];

        if (!process.env.ADMIN_KEY || adminKey !== process.env.ADMIN_KEY) {
            return res.status(401).json({ success: false, error: "UNAUTHORIZED" });
        }

        const { email, orderId } = req.body || {};

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email || ""))) {
            return res.status(400).json({ success: false, error: "INVALID_EMAIL" });
        }

        const id = String(orderId || `WZB-MANUAL-${Date.now()}-${crypto.randomBytes(3).toString("hex").toUpperCase()}`);

        const storedOrder = licenseStore.orders.get(id) || {
            orderId: id,
            email: String(email).trim(),
            plan: ER_PREMIUM_PLAN,
            amount: ER_PREMIUM_AMOUNT,
            status: "PAID",
            manual: true,
            createdAt: new Date().toISOString()
        };

        storedOrder.status = "PAID";
        storedOrder.paidAt = storedOrder.paidAt || new Date().toISOString();
        licenseStore.orders.set(id, storedOrder);

        const licenseKey = issueLicenseForOrder(storedOrder);

        res.json({ success: true, licenseKey: licenseKey, email: storedOrder.email, orderId: id });
    });

    /* ------------------------------------------------------------ */

    router.post("/api/license/activate", (req, res) => {
        try {
            const { orderId, email, promoKey } = req.body || {};

            // First check for promotional access (Halloween promotion takes priority)
            if (promoKey) {
                const promoValidation = validatePromoKey(promoKey);
                if (promoValidation.valid) {
                    return res.json({
                        success: true,
                        licenseKey: null,
                        status: "PROMO_ACCESS",
                        plan: "halloween-promo",
                        email: undefined,
                        hasPromoAccess: true,
                        promoFeatures: promoValidation.promo.allowedFeatures,
                        promoExpires: promoValidation.expires.toISOString()
                    });
                }
            }

            if (!orderId) {
                return res.status(400).json({ success: false, error: "ORDER_ID_REQUIRED" });
            }

            const storedOrder = licenseStore.orders.get(String(orderId));

            if (!storedOrder) {
                return res.status(404).json({ success: false, error: "ORDER_NOT_FOUND" });
            }

            if (email && storedOrder.email && String(email).toLowerCase() !== storedOrder.email.toLowerCase()) {
                return res.status(403).json({ success: false, error: "EMAIL_MISMATCH" });
            }

            /* Fail-closed: unpaid orders NEVER get a license. */
            if (storedOrder.status !== "PAID" || !storedOrder.licenseKey) {
                return res.status(402).json({
                    success: false,
                    error: "PAYMENT_NOT_VERIFIED - PayPal has not confirmed this payment. Premium stays locked."
                });
            }

            const license = licenseStore.licenses.get(storedOrder.licenseKey);

            res.json({
                success: true,
                licenseKey: storedOrder.licenseKey,
                status: license ? license.status : "ACTIVE",
                plan: ER_PREMIUM_PLAN,
                email: storedOrder.email,
                hasPromoAccess: false,
                promoActive: isHalloweenPromoActive()
            });
        } catch (error) {
            console.error("[WEBZONEBW] License activation failed:", error);
            res.status(500).json({ success: false, error: "ACTIVATION_FAILED" });
        }
    });

    /* ------------------------------------------------------------ */

    router.post("/api/license/verify", (req, res) => {
        const { licenseKey, promoKey } = req.body || {};

        let license = null;
        let validLicense = false;

        if (licenseKey) {
            license = licenseStore.licenses.get(String(licenseKey).trim().toUpperCase());
            if (license && license.status === "ACTIVE" && isLicenseValid(license)) {
                validLicense = true;
            }
        }

        let promoAccess = null;
        let validPromo = false;

        if (!validLicense && promoKey) {
            const promoValidation = validatePromoKey(promoKey);
            if (promoValidation.valid) {
                validPromo = true;
                promoAccess = {
                    promoKey: promoKey,
                    features: promoValidation.promo.allowedFeatures,
                    expires: promoValidation.expires.toISOString()
                };
            }
        }

        if (!validLicense && !validPromo) {
            return res.json({
                success: true,
                valid: false,
                status: "NOT_FOUND",
                hasPromoAccess: false,
                promoActive: isHalloweenPromoActive()
            });
        }

        if (validLicense && license) {
            license.lastVerifiedAt = new Date().toISOString();
            saveLicenseStore();
        }

        res.json({
            success: true,
            valid: validLicense || validPromo,
            status: validLicense ? license.status : "PROMO_ACCESS",
            plan: validLicense ? license.plan : "halloween-promo",
            email: validLicense ? license.email : undefined,
            licenseKey: validLicense ? license.licenseKey : undefined,
            expiresAt: validLicense ? license.expiresAt : undefined,
            hasPaidLicense: validLicense,
            hasPromoAccess: validPromo,
            promoAccess: promoAccess,
            promoActive: isHalloweenPromoActive()
        });
    });

    /* ------------------------------------------------------------ */

    router.post("/api/facefilter/webhook", async (req, res) => {
        if (!PAYPAL_WEBHOOK_ID) {
            console.warn("[WEBZONEBW FACEFILTER] Webhook rejected: PAYPAL_WEBHOOK_ID not configured");
            return res.status(503).send("WEBHOOK_NOT_CONFIGURED");
        }

        try {
            const accessToken = await getPayPalToken();
            if (!accessToken) return res.status(503).send("WEBHOOK_NOT_CONFIGURED");

            const { ok, data } = await paypalRequest(accessToken, "POST", "/v1/notifications/verify-webhook-signature", {
                auth_algo: req.headers["paypal-auth-algo"],
                cert_url: req.headers["paypal-cert-url"],
                transmission_id: req.headers["paypal-transmission-id"],
                transmission_sig: req.headers["paypal-transmission-sig"],
                transmission_time: req.headers["paypal-transmission-time"],
                webhook_id: PAYPAL_WEBHOOK_ID,
                webhook_event: req.body
            });

            if (!ok || !data || data.verification_status !== "SUCCESS") {
                console.warn("[WEBZONEBW FACEFILTER] PayPal webhook verification failed");
                return res.status(401).send("INVALID_SIGNATURE");
            }

            const event = req.body || {};
            if (event.event_type === "CHECKOUT.ORDER.COMPLETED" || event.event_type === "PAYMENT.CAPTURE.COMPLETED") {
                const resource = event.resource || {};
                const paypalOrderId = resource.id;
                const paypalCaptureId = resource.purchase_units && resource.purchase_units[0] && resource.purchase_units[0].payments && resource.purchase_units[0].captures && resource.purchase_units[0].captures[0] ? resource.purchase_units[0].captures[0].id : null;

                const paypalAmount = resource.purchase_units && resource.purchase_units[0] && resource.purchase_units[0].amount ? resource.purchase_units[0].amount.value : null;
                const paypalCurrency = resource.purchase_units && resource.purchase_units[0] && resource.purchase_units[0].amount ? resource.purchase_units[0].amount.currency_code : null;

                let storedOrder = null;
                for (const [orderId, order] of licenseStore.orders) {
                    if (order.status !== "PAID" && (order.purchaseId?.startsWith("FF-PURCHASE-") || order.custom_id === paypalOrderId)) {
                        storedOrder = order;
                        break;
                    }
                }

                if (storedOrder && storedOrder.filterId) {
                    const offer = getFaceFilterOffer(storedOrder.filterId);
                    if (offer && paypalAmount && paypalCurrency) {
                        const expectedAmount = offer.price.toFixed(2);

                        if (paypalAmount !== expectedAmount || paypalCurrency !== offer.currency) {
                            console.warn(`[WEBZONEBW FACEFILTER] Amount verification failed: expected ${offer.currency}${expectedAmount}, got ${paypalCurrency}${paypalAmount}`);
                            return res.status(400).send("AMOUNT_VERIFICATION_FAILED");
                        }
                    }

                    if (storedOrder.status === "PAID") {
                        console.log(`[WEBZONEBW FACEFILTER] Order already processed: ${storedOrder.purchaseId}`);
                        return res.status(200).send("OK");
                    }

                    const entitlementId = generateEntitlementId();
                    const purchasedAt = new Date().toISOString();
                    const expiresAt = new Date(Date.now() + (offer.duration * 60 * 60 * 1000)).toISOString();

                    const entitlement = {
                        entitlementId: entitlementId,
                        userId: storedOrder.userId || "anonymous",
                        userEmail: storedOrder.userEmail,
                        filterId: storedOrder.filterId,
                        orderId: storedOrder.purchaseId,
                        paypalOrderId: paypalOrderId,
                        paypalCaptureId: paypalCaptureId,
                        purchasedAt: purchasedAt,
                        expiresAt: expiresAt,
                        status: "ACTIVE",
                        offerName: offer.name,
                        price: offer.price,
                        currency: offer.currency
                    };

                    licenseStore.faceFilterEntitlements.set(entitlementId, entitlement);

                    storedOrder.status = "PAID";
                    storedOrder.paidAt = purchasedAt;
                    storedOrder.paypalOrderId = paypalOrderId;
                    storedOrder.paypalCaptureId = paypalCaptureId;
                    licenseStore.orders.set(storedOrder.purchaseId, storedOrder);

                    saveLicenseStore();

                    console.log(`[WEBZONEBW FACEFILTER] 24-hour entitlement created: ${entitlementId} for ${storedOrder.filterId} (${storedOrder.userEmail})`);
                }
            }

            res.status(200).send("OK");
        } catch (error) {
            console.error("[WEBZONEBW FACEFILTER] Webhook error:", error.message);
            res.status(500).send("WEBHOOK_ERROR");
        }
    });

    /* ------------------------------------------------------------ */

    router.post("/api/facefilter/refresh", (req, res) => {
        try {
            const session = requireUserSession(req, res);
            if (!session) {
                return;
            }

            const now = new Date().toISOString();
            const userEntitlements = [];

            for (const [entitlementId, entitlement] of licenseStore.faceFilterEntitlements) {
                if (entitlement.status === "ACTIVE" &&
                    now < entitlement.expiresAt &&
                    ((entitlement.userId && entitlement.userId === session.userId) ||
                        (entitlement.userEmail && entitlement.userEmail === session.userEmail))) {

                    let status = "ACTIVE";
                    if (now >= entitlement.expiresAt) {
                        status = "EXPIRED";
                        entitlement.status = "EXPIRED";
                        saveLicenseStore();
                    }

                    userEntitlements.push({
                        entitlementId: entitlementId,
                        filterId: entitlement.filterId,
                        status: status,
                        purchasedAt: entitlement.purchasedAt,
                        expiresAt: entitlement.expiresAt,
                        isActive: status === "ACTIVE",
                        timeRemaining: status === "ACTIVE" ?
                            Math.max(0, new Date(entitlement.expiresAt) - new Date(now)) : 0
                    });
                }
            }

            res.json({
                success: true,
                entitlements: userEntitlements,
                totalActive: userEntitlements.filter(e => e.isActive).length,
                timestamp: now
            });
        } catch (error) {
            console.error("[WEBZONEBW FACEFILTER] Refresh error:", error);
            res.status(500).json({ success: false, error: "REFRESH_FAILED" });
        }
    });

    /* ------------------------------------------------------------ */

    router.post("/api/facefilter/verify", (req, res) => {
        try {
            const { filterId } = req.body || {};

            if (!filterId) {
                return res.status(400).json({
                    success: false,
                    error: "FILTER_ID_REQUIRED",
                    message: "filterId is required for access verification."
                });
            }

            const session = requireUserSession(req, res);
            if (!session) {
                return;
            }

            const now = new Date().toISOString();
            let activeEntitlement = null;

            for (const [entitlementId, entitlement] of licenseStore.faceFilterEntitlements) {
                if (entitlement.filterId === filterId &&
                    entitlement.status === "ACTIVE" &&
                    now < entitlement.expiresAt &&
                ((entitlement.userId && entitlement.userId === session.userId) ||
                    (entitlement.userEmail && entitlement.userEmail === session.userEmail))) {
                    activeEntitlement = {
                        entitlementId: entitlementId,
                        filterId: entitlement.filterId,
                        status: entitlement.status,
                        purchasedAt: entitlement.purchasedAt,
                        expiresAt: entitlement.expiresAt,
                        offerName: entitlement.offerName,
                        timeRemaining: Math.max(0, new Date(entitlement.expiresAt) - new Date(now))
                    };
                    break;
                }
            }

            const freeFilters = ['mother_care'];
            if (freeFilters.includes(filterId)) {
                return res.json({
                    success: true,
                    filterId: filterId,
                    hasAccess: true,
                    entitlement: {
                        filterId: filterId,
                        status: "FREE",
                        offerName: "Mother Care",
                        message: "This filter is always free to use."
                    },
                    accessStatus: "FREE",
                    message: "This filter is always free to use."
                });
            }

            res.json({
                success: true,
                filterId: filterId,
                hasAccess: !!activeEntitlement,
                entitlement: activeEntitlement,
                accessStatus: activeEntitlement ? "ACTIVE" : "LOCKED",
                message: activeEntitlement ?
                    `Access to ${activeEntitlement.offerName} is active until ${new Date(activeEntitlement.expiresAt).toLocaleString()}` :
                    "This filter requires purchase for access."
            });
        } catch (error) {
            console.error("[WEBZONEBW FACEFILTER] Access verification error:", error);
            res.status(500).json({ success: false, error: "ACCESS_VERIFICATION_FAILED" });
        }
    });

    /* ------------------------------------------------------------ */

    router.get("/api/facefilter/:filterId/offer", (req, res) => {
        try {
            const { filterId } = req.params;
            const offer = getFaceFilterOffer(filterId);

            if (!offer) {
                return res.status(404).json({
                    success: false,
                    error: "FILTER_NOT_FOUND",
                    message: "The requested FaceFilter is not available for purchase."
                });
            }

            res.json({
                success: true,
                filterId: filterId,
                offer: {
                    name: offer.name,
                    price: offer.price,
                    currency: offer.currency,
                    duration: offer.duration,
                    description: `24-hour access to ${offer.name}. Once purchased and activated, this offer is non-refundable, subject to applicable law.`
                },
                refundPolicy: "24-hour promotional access. Once purchased and activated, this offer is non-refundable, subject to applicable law and mandatory consumer protections."
            });
        } catch (error) {
            console.error("[WEBZONEBW FACEFILTER] Offer retrieval error:", error);
            res.status(500).json({ success: false, error: "OFFER_RETRIEVAL_FAILED" });
        }
    });

    router.post("/api/facefilter/:filterId/purchase", async (req, res) => {
        try {
            const { filterId } = req.params;
            const { userEmail } = req.body || {};

            if (!filterId || !userEmail) {
                return res.status(400).json({
                    success: false,
                    error: "MISSING_REQUIRED_FIELDS",
                    message: "filterId and userEmail are required."
                });
            }

            const session = getUserSession(req);
            if (!session) {
                return res.status(401).json({
                    success: false,
                    error: "UNAUTHORIZED",
                    message: "Valid session required for purchase."
                });
            }

            const offer = getFaceFilterOffer(filterId);
            if (!offer) {
                return res.status(404).json({
                    success: false,
                    error: "FILTER_NOT_FOUND",
                    message: "The requested FaceFilter is not available for purchase."
                });
            }

            const existingEntitlement = Array.from(licenseStore.faceFilterEntitlements.values())
                .find(e => e.filterId === filterId &&
                           e.userId === session.userId &&
                           e.status === "ACTIVE" &&
                           new Date(e.expiresAt) > new Date());

            if (existingEntitlement) {
                return res.status(409).json({
                    success: false,
                    error: "ACTIVE_ENTITLEMENT_EXISTS",
                    message: "You already have active access to this filter."
                });
            }

            const purchaseId = `FF-PURCHASE-${Date.now()}-${crypto.randomBytes(3).toString("hex").toUpperCase()}`;

            if (!PAYPAL_CLIENT_ID || !PAYPAL_CLIENT_SECRET) {
                return res.status(503).json({
                    success: false,
                    error: "PAYMENT_NOT_CONFIGURED",
                    message: "PayPal payment is not configured."
                });
            }

            const accessToken = await getPayPalToken();
            if (!accessToken) {
                return res.status(502).json({ success: false, error: "GATEWAY_AUTH_FAILED" });
            }

            const { ok, status, data } = await paypalRequest(accessToken, "POST", "/v2/checkout/orders", {
                intent: "CAPTURE",
                purchase_units: [{
                    description: `24-hour access to ${offer.name}`,
                    custom_id: purchaseId,
                    amount: {
                        currency_code: offer.currency,
                        value: offer.price.toString()
                    }
                }]
            });

            if (!ok || !data.id) {
                console.error("[WEBZONEBW] PayPal order creation failed:", status, data);
                return res.status(502).json({ success: false, error: "GATEWAY_ORDER_FAILED" });
            }

            const purchase = {
                purchaseId: purchaseId,
                filterId: filterId,
                userId: session.userId,
                userEmail: session.userEmail,
                offerName: offer.name,
                price: offer.price,
                currency: offer.currency,
                status: "CREATED",
                createdAt: new Date().toISOString(),
                filterPurchasedAt: null,
                filterExpiresAt: null,
                paypalOrderId: data.id,
                paypalCaptureId: null,
                custom_id: purchaseId
            };

            licenseStore.orders.set(purchaseId, purchase);
            saveLicenseStore();

            console.log(`[WEBZONEBW] FaceFilter purchase created: ${purchaseId} with PayPal order ${data.id}`);

            res.json({
                success: true,
                purchaseId: purchaseId,
                paypalOrderId: data.id,
                filterId: filterId,
                offer: {
                    name: offer.name,
                    price: offer.price,
                    currency: offer.currency,
                    duration: offer.duration,
                    refundPolicy: "24-hour promotional access. Once purchased and activated, this offer is non-refundable, subject to applicable law and mandatory consumer protections."
                },
                nextSteps: "Complete payment to activate 24-hour access"
            });
        } catch (error) {
            console.error("[WEBZONEBW FACEFILTER] Purchase creation error:", error);
            res.status(500).json({ success: false, error: "PURCHASE_CREATION_FAILED" });
        }
    });

    router.get("/api/facefilter/entitlements", (req, res) => {
        try {
            const session = requireUserSession(req, res);
            if (!session) {
                return;
            }

            const userEntitlements = [];
            const now = new Date().toISOString();

            for (const [entitlementId, entitlement] of licenseStore.faceFilterEntitlements) {
                if ((entitlement.userId && entitlement.userId === session.userId) ||
                    (entitlement.userEmail && entitlement.userEmail === session.userEmail)) {
                    const isActive = entitlement.status === "ACTIVE" && now < entitlement.expiresAt;
                    userEntitlements.push({
                        entitlementId: entitlementId,
                        filterId: entitlement.filterId,
                        status: entitlement.status,
                        purchasedAt: entitlement.purchasedAt,
                        expiresAt: entitlement.expiresAt,
                        isActive: isActive,
                        timeRemaining: isActive ?
                            Math.max(0, new Date(entitlement.expiresAt) - new Date(now)) : 0
                    });
                }
            }

            res.json({
                success: true,
                entitlements: userEntitlements,
                totalActive: userEntitlements.filter(e => e.isActive).length
            });
        } catch (error) {
            console.error("[WEBZONEBW FACEFILTER] Entitlements retrieval error:", error);
            res.status(500).json({ success: false, error: "ENTITLEMENTS_RETRIEVAL_FAILED" });
        }
    });

    return {
        router,
        helpers: {
            getPayPalToken,
            paypalRequest,
            verifyPayPalWebhook,
            isLicenseValid
        },
        config: {
            PAYPAL_CLIENT_ID,
            PAYPAL_CLIENT_SECRET,
            PAYPAL_MODE,
            PAYPAL_CURRENCY,
            ER_PREMIUM_PLAN,
            ER_PREMIUM_AMOUNT,
            ER_PREMIUM_AMOUNT_USD,
            ORDER_EMAIL
        }
    };
}

module.exports = { createPayPalRouter };
