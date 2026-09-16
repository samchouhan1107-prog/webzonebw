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

  var API_BASE = "https://webzonebw.onrender.com";
  var listeners = [];

  function resolveAPIBase() {
    if (window.location.origin) {
      return fetchJSON(window.location.origin + "/api/health")
        .then(function () {
          return window.location.origin;
        })
        .catch(function () {
          return fetchJSON(API_BASE + "/api/health")
            .then(function () {
              return API_BASE;
            })
            .catch(function () {
              return Promise.reject(new Error("API unreachable"));
            });
        });
    }
    return Promise.resolve(API_BASE);
  }

  function getHalloweenStatus() {
    return resolveAPIBase()
      .then(function () {
        return fetchJSON(API_BASE + "/api/halloween/status");
      })
      .then(function (data) {
        return data;
      })
      .catch(function (error) {
        console.error("[WEBZONEBW ER] Halloween status error:", error);
        return null;
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

  function setStatus(status) {
    state.status = status;
    emit();
  }

  function emit() {
    listeners.forEach(function (fn) {
      try {
        fn();
      } catch (e) {}
    });
  }

  function verifyStoredLicense() {
    return resolveAPIBase().then(function () {
      return fetchJSON(API_BASE + "/api/license/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          licenseKey: state.licenseKey,
          promoKey: state.promoKey
        })
      })
        .then(function (data) {
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
          state.status = "unreachable";
          clearPromoAccess();
          emit();
          return false;
        });
    });
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

  function logout() {
    state.licenseKey = null;
    state.email = null;
    state.status = "none";
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
    openCheckout: function() {
      console.log("Checkout functionality would be implemented here");
    },
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