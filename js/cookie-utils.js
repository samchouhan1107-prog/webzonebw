/* ==========================================================
   WEBZONEBW � Cookie Utility Service v1.0
   ----------------------------------------------------------
   Shared, namespaced cookie API for all components.
   Namespace convention:
     Global prefs  ? webzonebw_global_<key>
     Component     ? webzonebw_<component>_<key>
   ========================================================== */

(function () {
    "use strict";

    var PREFIX = "webzonebw_";
    var DEFAULT_DAYS = 365;
    var SAFE_NAME_RE = /^[a-zA-Z0-9_\-]+$/;

    /* ----------------------------------------------------------
       INTERNAL HELPERS
       ---------------------------------------------------------- */

    function rawGet(name) {
        if (!name) return null;
        var match = document.cookie.match(
            new RegExp("(^| )" + name + "=([^;]*)")
        );
        return match ? decodeURIComponent(match[2]) : null;
    }

    function rawSet(name, value, days, path, sameSite) {
        if (!name || !SAFE_NAME_RE.test(name)) return;
        var d = new Date();
        d.setTime(d.getTime() + (days || DEFAULT_DAYS) * 864e5);
        document.cookie =
            name + "=" + encodeURIComponent(value || "") +
            ";expires=" + d.toUTCString() +
            ";path=" + (path || "/") +
            ";SameSite=" + (sameSite || "Lax");
    }

    function rawRemove(name) {
        if (!name) return;
        document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/";
    }

    /* ----------------------------------------------------------
       PUBLIC API
       ---------------------------------------------------------- */

    window.WebZoneCookie = {

        /**
         * Build a namespaced cookie key.
         * @param {string} component - e.g. "theme", "consent", "player"
         * @param {string} key        - e.g. "mode", "status"
         * @returns {string} e.g. "webzonebw_theme_mode"
         */
        namespace: function (component, key) {
            var c = String(component || "").replace(/[^a-zA-Z0-9_-]/g, "");
            var k = String(key || "").replace(/[^a-zA-Z0-9_-]/g, "");
            if (!c) return null;
            return k ? PREFIX + c + "_" + k : PREFIX + c;
        },

        /** Build a global-pref cookie key. */
        globalKey: function (key) {
            return this.namespace("global", key);
        },

        /** Read a cookie by exact name. */
        get: function (name) {
            return rawGet(name);
        },

        /** Read a namespaced cookie. */
        getNS: function (component, key) {
            return rawGet(this.namespace(component, key));
        },

        /** Read a global-pref cookie. */
        getGlobal: function (key) {
            return rawGet(this.globalKey(key));
        },

        /**
         * Set a cookie.
         * @param {string} name
         * @param {string} value
         * @param {object} [opts] - { days, path, sameSite }
         */
        set: function (name, value, opts) {
            var o = opts || {};
            rawSet(name, value, o.days, o.path, o.sameSite);
        },

        /** Set a namespaced cookie. */
        setNS: function (component, key, value, opts) {
            var name = this.namespace(component, key);
            if (name) this.set(name, value, opts);
        },

        /** Set a global-pref cookie. */
        setGlobal: function (key, value, opts) {
            this.set(this.globalKey(key), value, opts);
        },

        /** Remove a cookie by name. */
        remove: function (name) {
            rawRemove(name);
        },

        /** Remove a namespaced cookie. */
        removeNS: function (component, key) {
            var name = this.namespace(component, key);
            if (name) rawRemove(name);
        },

        /** Check if a cookie exists. */
        has: function (name) {
            return rawGet(name) !== null;
        },

        /** Check if a namespaced cookie exists. */
        hasNS: function (component, key) {
            return this.has(this.namespace(component, key));
        },

        /** Get all webzonebw cookies as an object. */
        getAll: function () {
            var result = {};
            var pairs = document.cookie.split(";");
            for (var i = 0; i < pairs.length; i++) {
                var parts = pairs[i].trim().split("=");
                if (parts[0] && parts[0].indexOf(PREFIX) === 0) {
                    try {
                        result[parts[0]] = decodeURIComponent(parts.slice(1).join("="));
                    } catch (e) { /* skip malformed */ }
                }
            }
            return result;
        },

        /** Remove all webzonebw cookies. */
        removeAll: function () {
            var all = this.getAll();
            for (var name in all) {
                if (all.hasOwnProperty(name)) {
                    rawRemove(name);
                }
            }
        },

        /** Remove expired webzonebw cookies (cleanup). */
        cleanup: function () {
            var all = this.getAll();
            var now = Date.now();
            for (var name in all) {
                if (!all.hasOwnProperty(name)) continue;
                /* If value looks like a timestamp and is past, remove it. */
                /* For standard cookies, the browser handles expiry automatically. */
                /* This method is a no-op placeholder for future use. */
            }
        }
    };
})();
