/* ============================================================
 * WEBZONEBW ER STUDIO — PREMIUM LICENSE MANAGER
 * ------------------------------------------------------------
 * Real $5.99 USD purchase → PayPal checkout →
 * server-side capture + verification → license activation →
 * persistent re-verification on every session.
 *
 * Also supports a manual "Order via Email" flow that hands the
 * buyer straight to the WebZoneBW order mailbox (fetched from the
 * server via /api/order-email — never hardcoded here) — the license
 * is still issued server-side only after a real, verified payment.
 *
 * NO fake payments: if the payment server is not configured,
 * checkout fails with an explicit error and nothing unlocks.
 * ============================================================ */

// Utility function for making JSON API requests
function fetchJSON(url, options) {
  return fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    ...options
  })
  .then(function(response) {
    if (!response.ok) {
      return response.json().then(function(errorData) {
        var error = new Error(errorData.error || 'HTTP ' + response.status);
        error.status = response.status;
        error.data = errorData;
        throw error;
      });
    }
    return response.json();
  });
}

(function () {
  "use strict";

  var STORAGE_KEY = "wzb_er_license_v1";
  var WZB_API_BASE = "https://webzonebw.onrender.com";
  var API_BASE = (function () {
    try {
      var meta = document.querySelector('meta[name="wzb-api-base"]');
      if (meta && meta.content) return meta.content.replace(/\/+$/, "");
    } catch (e) {}
    return window.location.origin || WZB_API_BASE;
  })();
  var listeners = [];
  var runtimeAPIBase = null;
  var orderEmailCache = null;

  function resolveAPIBase() {
    if (runtimeAPIBase) return Promise.resolve(runtimeAPIBase);
    return fetchJSON(window.location.origin + "/api/health")
      .then(function () {
        runtimeAPIBase = window.location.origin;
        return runtimeAPIBase;
      })
      .catch(function () {
        return fetchJSON(WZB_API_BASE + "/api/health")
          .then(function () {
            runtimeAPIBase = WZB_API_BASE;
            API_BASE = WZB_API_BASE;
            return runtimeAPIBase;
          })
          .catch(function () {
            return Promise.reject(new Error("API unreachable"));
          });
      });
  }

  var state = {
    licenseKey: null,
    email: null,
    status: "none",
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
        localStorage.setItem(STORAGE_KEY, JSON.stringify({
          licenseKey: state.licenseKey,
          email: state.email,
        }));
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

    return resolveAPIBase().then(function () {
      return fetchJSON(API_BASE + "/api/license/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          licenseKey: stored.licenseKey,
          promoKey: state.promoKey
        })
      })
        .then(function (data) {
          state.verifying = false;

          if (data && data.success && data.valid) {
            if (data.hasPromoAccess) {
              state.status = "promo_access";
              state.plan = "halloween-promo";
              state.email = undefined;
              setPromoAccess(data.promoAccess ? data.promoAccess.promoKey : null, 
                           data.promoAccess ? data.promoAccess.features : null,
                           data.promoAccess ? data.promoAccess.expires : null);
            } else if (data.hasPaidLicense) {
              state.status = "active";
              state.email = data.email || state.email;
              state.plan = data.plan;
              clearPromoAccess();
            } else {
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
          state.status = "unreachable";
          clearPromoAccess();
          emit();
          return false;
        });
    });
  }

  function activateLicense(orderId, email, procMsg, showError, close) {
    return fetchJSON(API_BASE + "/api/license/activate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId: orderId, email: email }),
    })
      .then(function (data) {
        if (!data || !data.success || !data.licenseKey) {
          throw new Error(
            data && data.error
              ? data.error
              : "License activation failed — the payment could not be verified server-side. Premium stays locked."
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
            "💎 Premium unlocked — Pose, VR & Halloween effects active!"
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
            "License activation failed — premium stays locked. No fake unlock."
        );
        return false;
      });
  }

  function getOrderEmail() {
    if (orderEmailCache) return Promise.resolve(orderEmailCache);
    return resolveAPIBase().then(function () {
      return fetchJSON(API_BASE + "/api/order-email")
        .then(function (data) {
          if (data && data.success && data.email) {
            orderEmailCache = data.email;
            return orderEmailCache;
          }
          throw new Error("ORDER_EMAIL_UNAVAILABLE");
        });
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

  function openCheckout() {
    // Show the checkout modal immediately (collection of details),
    // but nothing unlocks until the server verifies a REAL payment.
    var existing = document.getElementById("erLicenseCheckout");
    if (existing) existing.remove();

    var modal = document.createElement("div");
    modal.id = "erLicenseCheckout";
    modal.className = "er-modal-backdrop";

    modal.innerHTML =
      '<div class="er-modal-card premium-checkout">' +
      '<div class="er-modal-header">' +
      "<div>" +
      '<span class="er-badge-category">💎 PREMIUM UPGRADE</span>' +
      "<h3>WebZoneBW ER Studio Premium</h3>" +
      "</div>" +
      '<button class="er-modal-close" id="licCloseBtn">&times;</button>' +
      "</div>" +
      
      '<div class="er-modal-body">' +
      
      // Product Summary Section
      '<div class="product-summary">' +
      '<div class="product-header">' +
      '<div class="product-icon">🎃</div>' +
      '<div class="product-info">' +
      '<h4>ER Studio Premium License</h4>' +
      '<p class="product-subtitle">Unlock All Halloween & Creative Effects</p>' +
      '</div>' +
      '</div>' +
      
      '<div class="product-features">' +
      '<div class="feature-item">' +
      '<span class="feature-icon">🦴</span>' +
      '<span class="feature-text">Premium Pose Effects & VR Environments</span>' +
      '</div>' +
      '<div class="feature-item">' +
      '<span class="feature-icon">👻</span>' +
      '<span class="feature-text">Exclusive Halloween Transformations</span>' +
      '</div>' +
      '<div class="feature-item">' +
      '<span class="feature-icon">🎬</span>' +
      '<span class="feature-text">Advanced Cinematic Effects</span>' +
      '</div>' +
      '<div class="feature-item">' +
      '<span class="feature-icon">📹</span>' +
      '<span class="feature-text">Video Recording & Export</span>' +
      '</div>' +
      '</div>' +
      '</div>' +
      
      // Pricing Section
      '<div class="pricing-section">' +
      '<div class="price-info">' +
      '<div class="price-main">₹499</div>' +
      '<div class="price-sub">One-time purchase</div>' +
      '<div class="price-usd">≈ $5.99 USD</div>' +
      '</div>' +
      '<div class="price-security">' +
      '<span class="security-badge">🔒 Secure Payment</span>' +
      '<span class="security-badge">✅ Instant Delivery</span>' +
      '</div>' +
      '</div>' +
      
      // Email Input Section
      '<div class="email-section">' +
      '<label for="licEmail" class="email-label">Email Address for License</label>' +
      '<input type="email" id="licEmail" class="email-input" placeholder="you@example.com" autocomplete="email" required>' +
      '<p class="email-help">Your license will be permanently bound to this email address</p>' +
      '</div>' +
      
      // Processing States
      '<div id="licProcessing" class="processing-state" style="display:none;">' +
      '<div class="processing-content">' +
      '<div class="er-spinner large"></div>' +
      '<div class="processing-text">Processing your request...</div>' +
      '<div class="processing-subtext">Connecting to secure payment gateway</div>' +
      '</div>' +
      '</div>' +
      
      '<div id="licSuccess" class="success-state" style="display:none;">' +
      '<div class="success-content">' +
      '<div class="success-icon">✅</div>' +
      '<div class="success-text">Payment Successful!</div>' +
      '<div class="success-subtext">Your premium license is being activated...</div>' +
      '</div>' +
      '</div>' +
      
      '<div id="licError" class="error-state" style="display:none;">' +
      '<div class="error-content">' +
      '<div class="error-icon">❌</div>' +
      '<div class="error-text">Payment Failed</div>' +
      '<div class="error-subtext" id="errorDetails">Please try again or use alternative payment</div>' +
      '</div>' +
      '</div>' +
      
      '</div>' +
      
      // Action Buttons
      '<div class="modal-actions">' +
      '<div id="paypalButtons" class="payment-section"></div>' +
      
      '<div class="alternative-payment">' +
      '<button class="btn btn-secondary" id="licMailBtn">' +
      '<span class="btn-icon">✉️</span>' +
      '<span class="btn-text">Order via Email</span>' +
      '</button>' +
      '</div>' +
      
      '<div class="trust-badges">' +
      '<span class="trust-badge">PayPal</span>' +
      '<span class="trust-badge">Secure</span>' +
      '<span class="trust-badge">Instant</span>' +
      '</div>' +
      
      '</div>' +
      
      '<div class="modal-footer">' +
      '<p class="license-terms">' +
      'By completing this purchase, you agree to our <a href="../terms.html">Terms of Service</a> and <a href="../privacy.html">Privacy Policy</a>. ' +
      'Your license is non-refundable and grants lifetime access to premium features.' +
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
    var mailBtn = modal.querySelector("#licMailBtn");
    var proc = modal.querySelector("#licProcessing");

    function showError(msg) {
      errBox.style.display = "block";
      proc.style.display = "none";
      errBox.querySelector("#errorDetails").textContent = msg;
    }

    // Manual order: hand the buyer straight to the order mailbox.
    mailBtn.addEventListener("click", function () {
      var email = (modal.querySelector("#licEmail").value || "").trim();
      getOrderEmail().then(function (orderEmail) {
        var subject = "WebZoneBW ER Studio Premium — Order Request (₹499)";
        var body =
          "Hello WebZoneBW,\n\n" +
          "I want to purchase the WebZoneBW ER Studio Premium license (₹499, one-time).\n\n" +
          "Name: \n" +
          "Email (license will be bound to this): " + email + "\n" +
          "Phone: \n\n" +
          "Please send me the payment link / UPI details and activate my license after payment.\n\n" +
          "Thank you.";
        
        window.location.href = "mailto:" + orderEmail + "?subject=" + encodeURIComponent(subject) + "&body=" + encodeURIComponent(body);
      }).catch(function () {
        showError("Could not reach the order server to get the order email address. Please try again later.");
      });
    });

    // STEP 1: ask our server to create a real PayPal order.
    var email = (modal.querySelector("#licEmail").value || "").trim();

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      showError("Please enter a valid email address first (your license is bound to it).");
      return;
    }

    // Show processing state
    showProcessingState("Preparing secure PayPal checkout...");

    resolveAPIBase().then(function () {
      return fetchJSON(API_BASE + "/api/paypal/create-order", {
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
        .catch(function (error) {
          console.error('PayPal order creation failed:', error);
          showError("Payment service unavailable. Please try again later.");
          return { ok: false, data: { error: "PAYMENT_SERVICE_UNAVAILABLE" } };
        })
        .then(function (result) {
          if (!result.ok || !result.data || !result.data.success) {
            var reason =
              result.data && result.data.error
                ? result.data.error
                : "PAYMENT_SERVER_ERROR";

            if (reason === "PAYMENT_NOT_CONFIGURED") {
              throw new Error(
                "The payment server is not configured yet (PayPal API keys missing). " +
                  "No payment was taken and nothing was unlocked. Use 'Order via Email instead' below."
              );
            }

            throw new Error("Could not start checkout: " + reason);
          }

          // STEP 2: render real PayPal Buttons against the created order.
          return loadPayPalSdk(result.data.clientId).then(function () {
            hideProcessingState();
            showPaymentState();
            var orderId = result.data.orderId;

            window.paypal
              .Buttons({
                style: { layout: "vertical", color: "gold", shape: "pill" },
                createOrder: function () {
                  return orderId;
                },
                onApprove: function (data) {
                  showProcessingState("Payment approved! Activating your license...");

                  // STEP 3: our server CAPTURES the payment via PayPal API
                  // (source of truth) and only then issues a license key.
                  return fetchJSON(API_BASE + "/api/paypal/capture", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      orderId: orderId,
                      email: email,
                    }),
                  })
                    .then(function (cap) {
                      if (!cap || !cap.success || cap.status !== "COMPLETED") {
                        throw new Error(
                          cap && cap.error
                            ? cap.error
                            : "Payment capture is not complete — premium stays locked."
                        );
                      }

                      showProcessingState("License activation complete!");
                      setTimeout(function() {
                        activateLicense(
                          orderId,
                          email,
                          null,
                          showError,
                          close,
                        );
                      }, 1500);
                    })
                    .catch(function (err) {
                      showError(
                        err.message ||
                          "Capture/verification failed — premium stays locked."
                      );
                    });
                },
                onCancel: function () {
                  hideProcessingState();
                  showPaymentState();
                  showError(
                    "Payment was cancelled. No charges were made."
                  );
                },
                onError: function (err) {
                  hideProcessingState();
                  showPaymentState();
                  showError(
                    "Payment error: " + (err.message || "Please try again")
                  );
                },
              })
              .render("#paypalButtons");
          });
        })
        .catch(function (err) {
          hideProcessingState();
          showError(err.message || "Checkout failed. Please try again.");
        });
    });

    // Helper functions for state management
    function showProcessingState(message) {
      var processing = document.getElementById("licProcessing");
      var payment = document.getElementById("paypalButtons");
      var error = document.getElementById("licError");
      var success = document.getElementById("licSuccess");
      
      if (processing) {
        processing.style.display = "block";
        processing.querySelector(".processing-text").textContent = message;
      }
      if (payment) payment.style.display = "none";
      if (error) error.style.display = "none";
      if (success) success.style.display = "none";
    }

    function hideProcessingState() {
      var processing = document.getElementById("licProcessing");
      if (processing) processing.style.display = "none";
    }

    function showPaymentState() {
      var processing = document.getElementById("licProcessing");
      var payment = document.getElementById("paypalButtons");
      var error = document.getElementById("licError");
      var success = document.getElementById("licSuccess");
      
      if (processing) processing.style.display = "none";
      if (payment) payment.style.display = "block";
      if (error) error.style.display = "none";
      if (success) success.style.display = "none";
    }
  }

  function logout() {
    state.licenseKey = null;
    state.email = null;
    state.status = "none";
    persist();
    emit();
  }

  function activatePromo(promoKey) {
    return resolveAPIBase().then(function () {
      return fetchJSON(API_BASE + "/api/halloween/validate-promo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ promoKey: promoKey })
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
    });
  }

  function getHalloweenStatus() {
    return resolveAPIBase()
      .then(function () {
        return fetchJSON(API_BASE + "/api/halloween/status");
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
    activatePromo: activatePromo,
    getHalloweenStatus: getHalloweenStatus,
    logout: logout,
    onStateChange: function (fn) {
      if (typeof fn === "function") listeners.push(fn);
    },
    verify: verifyStoredLicense,
  };

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