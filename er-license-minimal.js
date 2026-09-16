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

  // Test the function
  getHalloweenStatus().then(function(data) {
    console.log("Halloween status:", data);
  });

})();