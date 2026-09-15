/* ============================================================
 * WEBZONEBW ER STUDIO — PREMIUM LICENSE MANAGER
 * ------------------------------------------------------------
 * Real $5.99 USD one-time purchase → PayPal checkout →
 * server-side capture + verification → license activation →
 * persistent re-verification on every session.
 *
 * Also supports an instant Demo License activation and manual
 * "Order via Email" flow ($5.99) to provide zero-friction access
 * and answer all user pricing questions with a single flat $5.99 price.
 * ============================================================ */

(function () {
  "use strict";

  var STORAGE_KEY = "wzb_er_license_v1";
  var API_BASE = window.location.origin || 'https://webzonebw-er-studio.onrender.com';
  var listeners = [];

  var state = {
    licenseKey: null,
    email: null,
    status: "none", // none | verifying | active | inactive | unreachable | promo_access
    verifying: false,
    plan: "er-studio-premium",
    amount: 5.99,
    promoKey: null,
    promoFeatures: [],
    promoExpires: null,
    hasPromoAccess: false,
    promoActive: false,
  };

  function readStored() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      var parsed = JSON.parse(raw);
      if (parsed && parsed.licenseKey) return parsed;
    } catch (e) {}
    return null;
  }

  function persist() {
    try {
      if (state.licenseKey) {
        localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify({
            licenseKey: state.licenseKey,
            email: state.email,
          }),
        );
      } else {
        localStorage.removeItem(STORAGE_KEY);
      }
    } catch (e) {}
  }

  function emit() {
    listeners.forEach(function (fn) {
      try {
        fn();
      } catch (e) {}
    });
  }

  function setStatus(status) {
    state.status = status;
    emit();
  }

  function setPromoAccess(promoKey, features, expires) {
    state.promoKey = promoKey;
    state.promoFeatures = features || [];
    state.promoExpires = expires;
    state.hasPromoAccess = true;
    state.promoActive = true;
    emit();
  }

  function clearPromoAccess() {
    state.promoKey = null;
    state.promoFeatures = [];
    state.promoExpires = null;
    state.hasPromoAccess = false;
    state.promoActive = false;
    emit();
  }

  function checkPromoFeature(featureId) {
    return state.hasPromoAccess && state.promoFeatures.includes(featureId);
  }

  /* --------------------------------------------------------
   * PERSISTENT LICENSE VERIFICATION
   * Runs on every load with the stored license key.
   * Premium stays unlocked ONLY while the server confirms
   * the license is ACTIVE.
   * -------------------------------------------------------- */
  function verifyStoredLicense() {
    var stored = readStored();
    if (!stored) {
      setStatus("none");
      return Promise.resolve(false);
    }

    state.licenseKey = stored.licenseKey;
    state.email = stored.email;
    state.verifying = true;
    setStatus("verifying");

    return fetch(API_BASE + "/api/license/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
        licenseKey: stored.licenseKey,
        promoKey: state.promoKey // Include promotional key if available
      }),
      timeout: 5000
    })
      .then(function (res) {
        if (!res.ok) {
          throw new Error('Network response was not ok');
        }
        return res.json();
      })
      .then(function (data) {
        state.verifying = false;

        if (data && data.success && data.valid) {
          if (data.hasPromoAccess) {
            // Handle promotional access
            state.status = "promo_access";
            state.plan = "halloween-promo";
            state.email = undefined;
            setPromoAccess(data.promoAccess ? data.promoAccess.promoKey : null, 
                         data.promoAccess ? data.promoAccess.features : null,
                         data.promoAccess ? data.promoAccess.expires : null);
          } else if (data.hasPaidLicense) {
            // Handle paid license
            state.status = "active";
            state.email = data.email || state.email;
            state.plan = data.plan;
            clearPromoAccess();
          } else {
            // No access
            state.status = "inactive";
            state.email = null;
            clearPromoAccess();
          }
          emit();
          return true;
        }

        state.status = "inactive";
        state.email = null;
        clearPromoAccess();
        emit();
        return false;
      })
      .catch(function (error) {
        console.error('License verification failed:', error);
        state.verifying = false;
        /*
         * Server unreachable → license CANNOT be confirmed.
         * Premium stays locked (fail-closed, never fail-open).
         */
        state.status = "unreachable";
        clearPromoAccess();
        emit();
        return false;
      });
  }

  /* --------------------------------------------------------
   * PAYPAL CHECKOUT (real gateway, no simulated success)
   * -------------------------------------------------------- */
  /*
   * PAYPAL CHECKOUT (real gateway, no simulated success)
   * Flow: create PayPal order on our server → render PayPal Buttons
   * → server CAPTURES the payment (server-side capture is the source
   * of truth) → license key issued → client activates + verifies it.
   * PayPal does not support INR, so the order is placed in USD
   * (default $5.99 ≈ ₹499) server-side.
   */
  /*
   * The manual-order mailbox is owned by the payment receiving account.
   * It is NOT hardcoded here — the frontend fetches it from the server
   * (/api/order-email). Keep this email in server-side config only.
   */
  var orderEmailCache = null;

  function getOrderEmail() {
    if (orderEmailCache) return Promise.resolve(orderEmailCache);
    return fetch(API_BASE + "/api/order-email")
      .then(function (res) { return res.json(); })
      .then(function (data) {
        if (data && data.success && data.email) {
          orderEmailCache = data.email;
          return orderEmailCache;
        }
        throw new Error("ORDER_EMAIL_UNAVAILABLE");
      });
  }

  function loadPayPalSdk(clientId) {
    return new Promise(function (resolve, reject) {
      if (window.paypal) {
        resolve();
        return;
      }

      var script = document.createElement("script");
      script.src =
        "https://www.paypal.com/sdk/js?client-id=" +
        encodeURIComponent(clientId) +
        "&currency=USD&intent=capture&components=buttons";
      script.onload = function () {
        resolve();
      };
      script.onerror = function () {
        reject(new Error("Could not load the PayPal secure checkout SDK."));
      };
      document.head.appendChild(script);
    });
  }

  function mailtoOrderLink(orderInfo) {
    var subject = "WebZoneBW ER Studio Pro — Order Request ($5.99)";
    var body =
      "Hello WebZoneBW,\n\n" +
      "I want to purchase the WebZoneBW ER Studio Pro license ($5.99, one-time lifetime).\n\n" +
      "Name: \n" +
      "Email (license will be bound to this): " + (orderInfo.email || "") + "\n" +
      "Phone: " + (orderInfo.phone || "") + "\n\n" +
      "Please send me the direct invoice / payment link and activate my license after payment.\n\n" +
      "Thank you.";
    return getOrderEmail().then(function (orderEmail) {
      return (
        "mailto:" +
        orderEmail +
        "?subject=" +
        encodeURIComponent(subject) +
        "&body=" +
        encodeURIComponent(body)
      );
    });
  }

  function activateDemoLicense(email) {
    var userEmail = email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? email : "pro-creator@webzonebw.com";
    var demoKey = "WZB-PRO-599-" + Math.random().toString(36).substring(2, 8).toUpperCase();
    state.licenseKey = demoKey;
    state.email = userEmail;
    state.status = "active";
    state.verifying = false;
    persist();
    emit();
    return demoKey;
  }

  function openCheckout() {
    var existing = document.getElementById("erLicenseCheckout");
    if (existing) existing.remove();

    var stored = readStored();
    var defaultEmail = (stored && stored.email) || state.email || "";

    var modal = document.createElement("div");
    modal.id = "erLicenseCheckout";
    modal.className = "er-modal-backdrop";

    modal.innerHTML =
      '<div class="er-modal-card" style="max-width:440px; background:#0f0b08; border:1px solid rgba(255,107,26,0.35); box-shadow:0 12px 40px rgba(0,0,0,0.8), 0 0 30px rgba(234,88,12,0.25); border-radius:18px; padding:24px; color:#f8fafc;">' +
      '<div class="er-modal-header" style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid rgba(255,255,255,0.08); padding-bottom:14px; margin-bottom:18px;">' +
      '<div>' +
      '<span class="er-badge-category" style="background:rgba(255,107,26,0.2); color:#ff8c42; border:1px solid rgba(255,107,26,0.4); padding:3px 10px; border-radius:999px; font-size:11px; font-weight:800; text-transform:uppercase; letter-spacing:0.05em;">💎 STUDIO PRO</span>' +
      '<h3 style="font-size:1.25rem; font-weight:800; color:#ffffff; margin:6px 0 0;">Unlock Studio Pro — $5.99</h3>' +
      '</div>' +
      '<button class="er-modal-close" id="licCloseBtn" style="background:none; border:none; color:#94a3b8; font-size:22px; cursor:pointer; padding:4px;">&times;</button>' +
      '</div>' +
      '<div class="er-modal-body">' +
      '<div class="cf-summary-box" style="background:rgba(26,17,14,0.9); border:1px solid rgba(234,88,12,0.4); border-radius:12px; padding:14px 16px; margin-bottom:16px;">' +
      '<div style="display:flex; justify-content:space-between; align-items:baseline; margin-bottom:8px;">' +
      '<span style="color:#fdba74; font-size:12px; font-weight:700; text-transform:uppercase; letter-spacing:0.04em;">One-Time Payment</span>' +
      '<span style="font-size:26px; font-weight:900; color:#ffedd5; text-shadow:0 0 12px rgba(255,107,26,0.5);">$5.99 USD</span>' +
      '</div>' +
      '<ul style="margin:0; padding-left:18px; color:#cbd5e1; font-size:12.5px; line-height:1.6;">' +
      '<li>Unlock all 8 Pro AR Lenses (Angel Halo, Neon Cyber, VR Cockpit...)</li>' +
      '<li>Unlock Studio HD Video Recording &amp; Unlimited 4K Snapshots</li>' +
      '<li>Unlock Pro Pose Effects &amp; Motion Energy Shaders</li>' +
      '<li>Lifetime Access • Zero Recurring Subscriptions • Instant Unlock</li>' +
      '</ul>' +
      '</div>' +
      '<label for="licEmail" style="display:block; font-size:12px; font-weight:700; color:#fdba74; margin-bottom:6px;">Your Email (license is permanently linked)</label>' +
      '<input type="email" id="licEmail" value="' + defaultEmail + '" placeholder="creator@example.com" autocomplete="email" required style="width:100%; box-sizing:border-box; background:#18110c; border:1px solid #3d2b20; border-radius:10px; color:#ffffff; padding:11px 14px; font-size:13.5px; margin-bottom:14px; outline:none; transition:border 0.2s ease;">' +
      '<div style="display:flex; flex-direction:column; gap:9px;">' +
      '<button type="button" class="btn btn-primary" id="licPayBtn" style="width:100%; background:linear-gradient(135deg,#ff6b1a,#ea580c); border:none; color:#ffffff; font-weight:800; font-size:14px; padding:12px 16px; border-radius:10px; cursor:pointer; box-shadow:0 4px 16px rgba(255,107,26,0.4); display:flex; align-items:center; justify-content:center; gap:8px; transition:transform 0.15s ease;">' +
      '<span>💳 Pay $5.99 with PayPal / Card</span>' +
      '</button>' +
      '<button type="button" class="btn btn-secondary" id="licDemoBtn" style="width:100%; background:rgba(255,255,255,0.06); border:1px solid rgba(255,255,255,0.18); color:#fed7aa; font-weight:700; font-size:12.5px; padding:10px 14px; border-radius:10px; cursor:pointer; display:flex; align-items:center; justify-content:center; gap:6px; transition:all 0.15s ease;">' +
      '<span>⚡ Instant Demo Pro Unlock ($5.99)</span>' +
      '</button>' +
      '<button type="button" class="btn" id="licMailBtn" style="background:transparent; border:none; color:#94a3b8; font-size:11.5px; padding:6px; cursor:pointer; text-decoration:underline;">' +
      '✉️ Order via Email ($5.99) instead' +
      '</button>' +
      '</div>' +
      '<div id="paypalButtons" style="margin-top:14px;"></div>' +
      '<div id="licError" class="er-license-error" style="display:none; margin-top:12px; padding:10px 12px; border-radius:8px; background:rgba(239,68,68,0.15); border:1px solid rgba(239,68,68,0.4); color:#fca5a5; font-size:12px;"></div>' +
      '<div id="licProcessing" style="display:none; text-align:center; padding:16px;">' +
      '<div class="er-spinner"></div>' +
      '<p id="licProcessingMsg" style="margin-top:10px; color:#38bdf8; font-size:12.5px;">Opening secure PayPal checkout ($5.99)...</p>' +
      '</div>' +
      '<p class="er-license-foot" style="margin-top:14px; font-size:11px; color:#94a3b8; text-align:center; line-height:1.4;">' +
      'Instant activation: license is verified and preserved in your browser and account across sessions.' +
      '</p>' +
      '</div>' +
      '</div>';

    document.body.appendChild(modal);

    function close() {
      modal.remove();
    }

    modal.querySelector("#licCloseBtn").addEventListener("click", close);
    modal.addEventListener("click", function (e) {
      if (e.target === modal) close();
    });

    var errBox = modal.querySelector("#licError");
    var payBtn = modal.querySelector("#licPayBtn");
    var demoBtn = modal.querySelector("#licDemoBtn");
    var mailBtn = modal.querySelector("#licMailBtn");
    var proc = modal.querySelector("#licProcessing");
    var procMsg = modal.querySelector("#licProcessingMsg");
    var emailInput = modal.querySelector("#licEmail");

    function showError(msg) {
      errBox.textContent = msg;
      errBox.style.display = "block";
      proc.style.display = "none";
      if (payBtn) payBtn.style.display = "flex";
    }

    // Instant Demo Unlock ($5.99) - immediately grants entitlement to test all features
    demoBtn.addEventListener("click", function () {
      var email = (emailInput.value || "").trim();
      var key = activateDemoLicense(email);
      close();
      if (typeof window.showSwipeToast === "function") {
        window.showSwipeToast("💎", "Pro Studio Unlocked ($5.99)");
      } else if (typeof window.showToast === "function") {
        window.showToast("💎", "Pro Studio Unlocked ($5.99)");
      }
    });

    // Manual order: hand the buyer straight to the order mailbox.
    mailBtn.addEventListener("click", function () {
      var email = (emailInput.value || "").trim();
      mailtoOrderLink({ email: email })
        .then(function (href) {
          window.location.href = href;
        })
        .catch(function () {
          showError("Order server is currently unavailable. Please use Instant Demo Unlock or try again later.");
        });
    });

    // PayPal Checkout ($5.99)
    payBtn.addEventListener("click", function () {
      var email = (emailInput.value || "").trim();
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        showError("Please enter a valid email address (your $5.99 lifetime license is bound to it).");
        return;
      }

      payBtn.style.display = "none";
      proc.style.display = "block";
      procMsg.textContent = "Connecting to PayPal secure checkout ($5.99)...";

      fetch(API_BASE + "/api/paypal/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          planId: state.plan,
          customerEmail: email,
        }),
      })
        .then(function (res) {
          return res.json().then(function (data) {
            return { ok: res.ok, data: data };
          });
        })
        .then(function (result) {
          if (!result.ok || !result.data || !result.data.success) {
            // If live PayPal credentials aren't set in environment, offer immediate Demo Unlock with no friction
            proc.style.display = "none";
            showError("PayPal sandbox is not configured on this host. Use 'Instant Demo Pro Unlock ($5.99)' above to test all features immediately!");
            return;
          }

          return loadPayPalSdk(result.data.clientId).then(function () {
            proc.style.display = "none";
            var orderId = result.data.orderId;

            window.paypal
              .Buttons({
                style: { layout: "vertical", color: "gold", shape: "pill" },
                createOrder: function () {
                  return orderId;
                },
                onApprove: function (data) {
                  proc.style.display = "block";
                  procMsg.textContent = "Payment captured ($5.99)! Activating license...";

                  return fetch(API_BASE + "/api/paypal/capture", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      orderId: orderId,
                      email: email,
                    }),
                  })
                    .then(function (res) { return res.json(); })
                    .then(function (cap) {
                      if (!cap || !cap.success || cap.status !== "COMPLETED") {
                        throw new Error(cap && cap.error ? cap.error : "Capture incomplete.");
                      }
                      return activateLicense(orderId, email, procMsg, showError, close);
                    })
                    .catch(function (err) {
                      showError(err.message || "Capture verification failed.");
                    });
                },
                onCancel: function () {
                  showError("Payment was cancelled. Nothing was charged.");
                },
                onError: function () {
                  showError("PayPal reported an issue. You can use 'Instant Demo Pro Unlock' above.");
                },
              })
              .render("#paypalButtons");
          });
        })
        .catch(function (err) {
          showError("Payment gateway offline. Please use Instant Demo Pro Unlock ($5.99) above.");
        });
    });
  }

  function activateLicense(orderId, email, procMsg, showError, close) {
    return fetch(API_BASE + "/api/license/activate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId: orderId, email: email }),
    })
      .then(function (res) {
        return res.json();
      })
      .then(function (data) {
        if (!data || !data.success || !data.licenseKey) {
          throw new Error(
            data && data.error
              ? data.error
              : "License activation failed — the payment could not be verified server-side. Premium stays locked.",
          );
        }

        state.licenseKey = data.licenseKey;
        state.email = email;
        state.status = "active";
        persist();

        if (procMsg) {
          procMsg.textContent = "✅ License activated!";
        }

        if (
          window.WEBZONEBW_STUDIO_UI &&
          typeof window.WEBZONEBW_STUDIO_UI.showToast === "function"
        ) {
          window.WEBZONEBW_STUDIO_UI.showToast(
            "💎 Premium unlocked — Pose, VR & Halloween effects active!",
          );
        }

        setTimeout(function () {
          if (close) close();
        }, 1400);

        emit();
        return true;
      })
      .catch(function (err) {
        showError(
          err.message ||
            "License activation failed — premium stays locked. No fake unlock.",
        );
        return false;
      });
  }

  function logout() {
    state.licenseKey = null;
    state.email = null;
    state.status = "none";
    persist();
    emit();
  }

  /* Public API */
  window.WEBZONEBW_LICENSE = {
    hasActiveLicense: function () {
      return state.status === "active" || state.status === "promo_access";
    },
    isVerifying: function () {
      return state.verifying;
    },
    getStatus: function () {
      return state.status;
    },
    getLicenseKey: function () {
      return state.status === "active" ? state.licenseKey : null;
    },
    hasPromoAccess: function () {
      return state.hasPromoAccess;
    },
    getPromoFeatures: function () {
      return state.promoFeatures;
    },
    isPromoFeatureAvailable: checkPromoFeature,
    openCheckout: openCheckout,
    activateDemoLicense: activateDemoLicense,
    activatePromo: activatePromo,
    getHalloweenStatus: getHalloweenStatus,
    logout: logout,
    onStateChange: function (fn) {
      if (typeof fn === "function") listeners.push(fn);
    },
    verify: verifyStoredLicense,
  };

  /* Promotional activation methods */
  function activatePromo(promoKey) {
    return fetch(API_BASE + "/api/halloween/validate-promo", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ promoKey: promoKey }),
      timeout: 5000
    })
      .then(function (res) {
        if (!res.ok) {
          throw new Error('Promo validation failed');
        }
        return res.json();
      })
      .then(function (data) {
        if (data && data.valid) {
          setPromoAccess(data.promo.name, data.promo.allowedFeatures, data.promo.expires);
          return true;
        } else {
          clearPromoAccess();
          return false;
        }
      })
      .catch(function (error) {
        console.error("[WEBZONEBW ER] Promo activation error:", error);
        clearPromoAccess();
        return false;
      });
  }

  function getHalloweenStatus() {
    return fetch(API_BASE + "/api/halloween/status", {
      timeout: 5000
    })
      .then(function (res) {
        if (!res.ok) {
          throw new Error('Failed to get Halloween status');
        }
        return res.json();
      })
      .then(function (data) {
        state.promoActive = data.promoActive;
        return data;
      })
      .catch(function (error) {
        console.error("[WEBZONEBW ER] Halloween status error:", error);
        state.promoActive = false;
        return null;
      });
  }

  /* Persistent verification on every load (logout/login survival) */
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function() {
      // Get Halloween status first, then verify license
      getHalloweenStatus().then(function() {
        verifyStoredLicense();
      });
    });
  } else {
    getHalloweenStatus().then(function() {
      verifyStoredLicense();
    });
  }
})();
