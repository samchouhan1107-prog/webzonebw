/* =====================================================
   WEBZONEBW-ER STUDIO EXTENDED DATA & PIPELINE
   Feature Packs, Lenses, Articles, News, Sounds,
   Hardware Care, Remote Assistance & PayPal checkout flow.
   ===================================================== */

(function () {
  "use strict";

  window.WEBZONEBW_STUDIO_REGISTRY = {
    lenses: [
      {
        id: "neon-cyber-lens",
        name: "Neon Cyber Lens",
        thumbnail: "../assets/logo.png",
        category: "Premium",
        isPremium: true,
        status: "active",
        visibility: "public",
        createdAt: "2024-10-01",
        releasedAt: "2024-10-05",
        featured: true,
        description:
          "Futuristic neon particle grid, cybernetic facial matrix shaders, and glowing neon audio-reactive overlays.",
        featurePackId: "neon-cyber-pack",
        effects: ["Cyber Grid", "Neon Edge", "Matrix Particle Rain"],
      },
      {
        id: "volcanic-ember-lens",
        name: "Volcanic Ember Lens",
        thumbnail: "../assets/logo.png",
        category: "Featured",
        isPremium: false,
        status: "active",
        visibility: "public",
        createdAt: "2024-10-01",
        releasedAt: "2024-10-02",
        featured: true,
        description:
          "Atmospheric volcanic embers, warm lava color grading, and organic heat shimmer shaders.",
        featurePackId: "volcanic-ember-pack",
        effects: ["Ember Drift", "Lava Grade", "Heat Shimmer"],
      },
      {
        id: "phantom-spectral-lens",
        name: "Phantom Spectral Lens",
        thumbnail: "../assets/logo.png",
        category: "New",
        isPremium: true,
        status: "active",
        visibility: "public",
        createdAt: "2024-10-10",
        releasedAt: "2024-10-15",
        featured: true,
        description:
          "Ethereal ghost haunting shaders, chromatic aberration glitch trails, and spooky spectral glows.",
        featurePackId: "phantom-spectral-pack",
        effects: ["Spectral Glow", "Chromatic Glitch", "Ghostly Trail"],
      },
      {
        id: "pumpkin-patch-lens",
        name: "Pumpkin Patch Lens",
        thumbnail: "../assets/logo.png",
        category: "Free",
        isPremium: false,
        status: "active",
        visibility: "public",
        createdAt: "2024-09-15",
        releasedAt: "2024-09-20",
        featured: false,
        description:
          "Classic Halloween jack-o-lantern glowing highlights, autumn leaf particles, and cozy warmth.",
        featurePackId: "pumpkin-patch-pack",
        effects: ["Pumpkin Glow", "Autumn Leaves"],
      },
    ],

    featurePacks: [
      {
        id: "neon-cyber-pack",
        name: "Neon Cyber Feature Pack",
        lensId: "neon-cyber-lens",
        description:
          "Complete cybernetic enhancement suite including the Neon Cyber Lens, custom synthwave audio-reactive tunes, cyberpunk HUD overlays, and exclusive maintenance guides.",
        assets: ["cyber-hud-overlay.png", "synthwave-loop.mp3"],
        effects: ["Cyber Grid", "Neon Edge", "Matrix Particle Rain"],
        sounds: ["synthwave-loop.mp3", "cyber-chime.wav"],
        articles: ["neon-cyber-getting-started", "cyber-hardware-care"],
        isPremium: true,
        createdAt: "2024-10-05",
        updatedAt: "2024-10-20",
      },
      {
        id: "volcanic-ember-pack",
        name: "Volcanic Ember Feature Pack",
        lensId: "volcanic-ember-lens",
        description:
          "Volcanic atmospheric bundle featuring ember shaders, warm tone grading, and thermal camera setup tips.",
        assets: ["ember-overlay.png"],
        effects: ["Ember Drift", "Lava Grade"],
        sounds: ["volcanic-ambient.mp3"],
        articles: ["volcanic-lens-guide"],
        isPremium: false,
        createdAt: "2024-10-02",
        updatedAt: "2024-10-10",
      },
      {
        id: "phantom-spectral-pack",
        name: "Phantom Spectral Feature Pack",
        lensId: "phantom-spectral-lens",
        description:
          "Spooky spectral package with haunting ghost shaders, chromatic glitch filters, and audio resonance packs.",
        assets: ["spectral-overlay.png"],
        effects: ["Spectral Glow", "Chromatic Glitch"],
        sounds: ["ghostly-whisper.mp3"],
        articles: ["phantom-spectral-masterclass"],
        isPremium: true,
        createdAt: "2024-10-15",
        updatedAt: "2024-10-22",
      },
      {
        id: "pumpkin-patch-pack",
        name: "Pumpkin Patch Feature Pack",
        lensId: "pumpkin-patch-lens",
        description:
          "Seasonal autumn patch essentials for family-friendly Halloween photos and recordings.",
        assets: ["pumpkin-badge.png"],
        effects: ["Pumpkin Glow", "Autumn Leaves"],
        sounds: [],
        articles: [],
        isPremium: false,
        createdAt: "2024-09-20",
        updatedAt: "2024-09-20",
      },
    ],

    articles: [
      {
        id: "webzonebw-studio-overview",
        title:
          "WebZoneBW Studio: Lenses, Feature Packs, Updates & the Creative Experience",
        slug: "webzonebw-studio-lenses-creative-experience",
        excerpt:
          "The complete guide to WebZoneBW Studio — lenses, Feature Packs, updates, mobile and desktop experience, hardware care and ownership benefits.",
        url: "https://webzonebw.in/articles/webzonebw-studio-lenses-creative-experience/",
        thumbnail: "../assets/logo.png",
        category: "Studio Guide",
        contentType: "ARTICLE",
        lensId: null,
        featurePackId: null,
        publishedAt: "2026-10-27",
        updatedAt: "2026-10-27",
        status: "published",
        visibility: "public",
        isPremium: false,
        isOwnedContent: false,
        featured: true,
        /* Future topic pipeline — each topic connects to the relevant
           Lens / Feature Pack through existing metadata. */
        futureTopics: [
          { id: "whats-new-studio", title: "What's New in WebZoneBW Studio", lensId: null, featurePackId: null },
          { id: "feature-packs-explained", title: "How WebZoneBW Lens Feature Packs Work", lensId: null, featurePackId: null },
          { id: "behind-a-lens", title: "Behind the Creation of a WebZoneBW Lens", lensId: "neon-cyber-lens", featurePackId: "neon-cyber-pack" },
          { id: "new-premium-effects", title: "New Premium Effects & Creative Updates", lensId: "phantom-spectral-lens", featurePackId: "phantom-spectral-pack" },
          { id: "best-camera-filters", title: "Best Ways to Use WebZoneBW Camera Filters", lensId: "volcanic-ember-lens", featurePackId: "volcanic-ember-pack" },
          { id: "halloween-studio-releases", title: "Halloween Studio: New Experiences & Releases", lensId: "pumpkin-patch-lens", featurePackId: "pumpkin-patch-pack" },
          { id: "sounds-tunes-effects", title: "WebZoneBW Sounds, Tunes & Visual Effects", lensId: "neon-cyber-lens", featurePackId: "neon-cyber-pack" },
          { id: "lens-setup-hardware-care", title: "Lens Setup, Camera Tips & Hardware Care", lensId: null, featurePackId: null },
          { id: "studio-troubleshooting", title: "WebZoneBW Studio Troubleshooting Guide", lensId: null, featurePackId: null },
          { id: "upcoming-lenses", title: "Upcoming Lenses, Features & Experiments", lensId: null, featurePackId: null },
        ],
      },
      {
        id: "neon-cyber-getting-started",
        title: "Getting Started with Neon Cyber Lens",
        slug: "getting-started-neon-cyber-lens",
        excerpt:
          "Learn how to configure your camera lighting and calibrate facial mesh tracking for optimal cyberpunk shader performance.",
        content:
          "Welcome to the Neon Cyber Feature Pack! To achieve the most vibrant neon particle and grid response, ensure your face is evenly lit with balanced ambient lighting. Utilize the WebZoneBW Studio camera tilt controls to precisely position the cybernetic HUD overlays. Calibrate your facial mesh tracking in a well-lit environment to maximize shader responsiveness.",
        thumbnail: "../assets/logo.png",
        category: "Tutorial",
        contentType: "ARTICLE",
        lensId: "neon-cyber-lens",
        featurePackId: "neon-cyber-pack",
        publishedAt: "2024-10-06",
        updatedAt: "2024-10-18",
        status: "published",
        visibility: "owned",
        isPremium: true,
        isOwnedContent: true,
        featured: true,
      },
      {
        id: "volcanic-lens-guide",
        title: "Mastering Volcanic Ember Shaders",
        slug: "mastering-volcanic-ember-shaders",
        excerpt:
          "Discover tips and tricks for creating cinematic fiery portraits using the Volcanic Ember Lens.",
        content:
          "Volcanic embers react in real-time to your camera motion. For best results, try gentle, fluid panning to watch the particle drift synchronize perfectly with your frame rate and facial expressions. This effect is optimized for high-contrast environments.",
        thumbnail: "../assets/logo.png",
        category: "Getting Started",
        contentType: "TUTORIAL",
        lensId: "volcanic-ember-lens",
        featurePackId: "volcanic-ember-pack",
        publishedAt: "2024-10-03",
        updatedAt: "2024-10-03",
        status: "published",
        visibility: "public",
        isPremium: false,
        isOwnedContent: false,
        featured: false,
      },
      {
        id: "phantom-spectral-masterclass",
        title: "Phantom Spectral Glitch Masterclass",
        slug: "phantom-spectral-glitch-masterclass",
        excerpt:
          "Advanced guide to chromatic aberration and ghostly veil shaders in WebZoneBW-ER Studio.",
        content:
          "Unlock eerie spectral dimensions with these high-performance chromatic glitch filters. Perfect for atmospheric Halloween storytelling, cinematic reels, and immersive digital photography. Follow our guide to fine-tune your tracking settings for the best glitch synchronization.",
        thumbnail: "../assets/logo.png",
        category: "Studio Updates",
        contentType: "ARTICLE",
        lensId: "phantom-spectral-lens",
        featurePackId: "phantom-spectral-pack",
        publishedAt: "2024-10-16",
        updatedAt: "2024-10-22",
        status: "published",
        visibility: "owned",
        isPremium: true,
        isOwnedContent: true,
        featured: true,
      },
    ],

    news: [
      {
        id: "news-104",
        title: "New Guide: Lenses, Feature Packs & the Creative Experience",
        excerpt:
          "A complete WebZoneBW Studio overview — how lenses, Feature Packs, updates and ownership benefits fit together.",
        category: "NEW",
        url: "https://webzonebw.in/articles/webzonebw-studio-lenses-creative-experience/",
        lensId: null,
        featurePackId: null,
        status: "NEW",
        date: "2026-10-27",
      },
      {
        id: "news-101",
        title: "Neon Cyber Lens v1.2 Update Released",
        excerpt:
          "Enhanced neon particle shader efficiency and new audio reactivity controls.",
        category: "LENS_UPDATE",
        lensId: "neon-cyber-lens",
        featurePackId: "neon-cyber-pack",
        status: "UPDATED",
        date: "2024-10-20",
      },
      {
        id: "news-102",
        title: "WebZoneBW-ER Studio Halloween Maintenance Notice",
        excerpt:
          "Scheduled routine server-side entitlement verification and CDN optimization.",
        category: "MAINTENANCE",
        lensId: null,
        featurePackId: null,
        status: "MAINTENANCE",
        date: "2024-10-25",
      },
      {
        id: "news-103",
        title: "Phantom Spectral Lens Now Available in Feature Packs",
        excerpt:
          "New ghostly shaders and chromatic aberration tools added for all Pro Studio members.",
        category: "NEW",
        lensId: "phantom-spectral-lens",
        featurePackId: "phantom-spectral-pack",
        status: "NEW",
        date: "2024-10-15",
      },
    ],

    hardwareCare: [
      {
        id: "hc-camera-care",
        title: "Webcam & Mobile Camera Lens Care Guide",
        excerpt:
          "Safely clean your camera glass and maintain optimal autofocus and clarity for ER tracking.",
        content:
          "Use a microfiber cloth with electronics-safe optical cleaning solution. Avoid abrasive paper towels or harsh chemical sprays which can strip anti-reflective coatings on mobile and laptop camera lenses.",
        category: "Camera Care",
        lensId: null,
        featurePackId: null,
      },
      {
        id: "hc-cyber-setup",
        title: "Cyber Lens Sensor & Lighting Setup",
        excerpt:
          "Optimal hardware placement and lighting guidelines for high-framerate AR tracking.",
        content:
          "Ensure stable desk mounts or tripod stands when running intensive GPU shaders. Maintain ambient lighting above 300 lux to eliminate sensor noise and frame jitter.",
        category: "Hardware Setup",
        lensId: "neon-cyber-lens",
        featurePackId: "neon-cyber-pack",
      },
    ],

    sounds: [
      {
        id: "sound-synth",
        name: "Synthwave Cyber Pulse",
        type: "tune",
        category: "Ambient",
        duration: "0:45",
        isPremium: true,
        lensId: "neon-cyber-lens",
        featurePackId: "neon-cyber-pack",
      },
      {
        id: "sound-volcanic",
        name: "Volcanic Rumle & Embers",
        type: "sound",
        category: "Effects",
        duration: "0:30",
        isPremium: false,
        lensId: "volcanic-ember-lens",
        featurePackId: "volcanic-ember-pack",
      },
    ],
  };

  /* Server-Side Entitlement & Ownership Authority
   *
   * Premium ownership is granted ONLY through a verified
   * WebZoneBW ER Studio license ($5.99 USD purchase). The old
   * localStorage "owned lenses" path could unlock premium
   * content without payment and is now license-gated.
   */
  window.WEBZONEBW_ENTITLEMENT_MANAGER = {
    isLensOwned: function (lensId) {
      var lens = window.WEBZONEBW_STUDIO_REGISTRY.lenses.find(function (l) {
        return l.id === lensId;
      });
      if (lens && !lens.isPremium) return true;

      // Premium lenses require an active verified license
      if (
        window.WEBZONEBW_LICENSE &&
        typeof window.WEBZONEBW_LICENSE.hasActiveLicense === "function"
      ) {
        return window.WEBZONEBW_LICENSE.hasActiveLicense();
      }

      return false;
    },
  };

  /* Real PayPal Secure Payment Flow & Verification
   *
   * The previous implementation simulated a payment with a
   * setTimeout and granted ownership locally — that was a fake
   * payment and has been removed. All purchases now go through
   * WEBZONEBW_LICENSE (real PayPal checkout + server-side
   * payment verification + license activation).
   */
  window.WEBZONEBW_PAYMENT_GATEWAY = {
    initiatePayPalCheckout: function (
      lensId,
      featurePackId,
      onSuccess,
      onError,
    ) {
      if (
        window.WEBZONEBW_LICENSE &&
        typeof window.WEBZONEBW_LICENSE.openCheckout === "function"
      ) {
        window.WEBZONEBW_LICENSE.openCheckout();

        if (typeof onSuccess === "function") {
          if (
            window.WEBZONEBW_LICENSE &&
            typeof window.WEBZONEBW_LICENSE.onStateChange === "function"
          ) {
            var handler = function () {
              if (window.WEBZONEBW_LICENSE.hasActiveLicense()) {
                onSuccess({ lensId: lensId, featurePackId: featurePackId, status: "LICENSE_ACTIVE" });
              }
            };
            window.WEBZONEBW_LICENSE.onStateChange(handler);
          }
        }
      } else if (typeof onError === "function") {
        onError("LICENSE_MODULE_UNAVAILABLE");
      }
    },
  };

  /* Comprehensive Studio UI Controller */
  window.WEBZONEBW_STUDIO_UI = {
    showToast: function (msg) {
      var toast = document.getElementById("canvasSwipeToast");
      if (toast) {
        var textEl = document.getElementById("canvasSwipeText");
        if (textEl) textEl.textContent = msg;
        toast.style.display = "flex";
        setTimeout(function () {
          toast.style.display = "none";
        }, 3500);
      }
    },

    refresh: function () {
      // Re-render UI components if mounted
      console.log("[WEBZONEBW ER] Studio UI refreshed with entitlement state.");
    },

    openFeaturePackModal: function (lensId) {
      var lens = window.WEBZONEBW_STUDIO_REGISTRY.lenses.find(function (l) {
        return l.id === lensId;
      });
      var pack = window.WEBZONEBW_STUDIO_REGISTRY.featurePacks.find(
        function (p) {
          return p.lensId === lensId;
        },
      );
      if (!lens) return;

      var isOwned = window.WEBZONEBW_ENTITLEMENT_MANAGER.isLensOwned(lensId);

      var effectsHtml = lens.effects
        .map(function (e) {
          return `<span class="er-badge-pill">✨ ${e}</span>`;
        })
        .join("");
      var articles = window.WEBZONEBW_STUDIO_REGISTRY.articles.filter(
        function (a) {
          return a.lensId === lensId;
        },
      );
      var articlesHtml =
        articles
          .map(function (a) {
            return `<div class="er-pack-article-card">
                    <h4>${a.title}</h4>
                    <p>${a.excerpt}</p>
                    <span class="er-tag">${a.category}</span>
                </div>`;
          })
          .join("") ||
        "<p style='color:#94a3b8; font-size:13px;'>No specific articles yet. Content pipeline active.</p>";

      var hardwareCareItems =
        window.WEBZONEBW_STUDIO_REGISTRY.hardwareCare.filter(function (h) {
          return !h.lensId || h.lensId === lensId;
        });
      var hardwareHtml = hardwareCareItems
        .map(function (h) {
          return `<div class="er-hardware-card">
                    <h5>🛠️ ${h.title}</h5>
                    <p>${h.excerpt}</p>
                </div>`;
        })
        .join("");

      var modalHtml = `
                <div class="er-modal-backdrop" id="featurePackModal">
                    <div class="er-modal-card er-modal-large">
                        <div class="er-modal-header">
                            <div>
                                <span class="er-badge-category">${lens.category}</span>
                                <h3>${lens.name} & Feature Pack</h3>
                            </div>
                            <button class="er-modal-close" id="fpCloseBtn">&times;</button>
                        </div>
                        <div class="er-modal-body er-scrollable">
                            <div class="er-pack-hero">
                                <div class="er-pack-desc">
                                    <p><strong>Description:</strong> ${lens.description}</p>
                                    ${pack ? `<p><strong>Feature Pack Suite:</strong> ${pack.description}</p>` : ""}
                                    <div class="er-pack-effects-row">
                                        <strong>Included Effects:</strong>
                                        <div class="er-effects-pills">${effectsHtml}</div>
                                    </div>
                                </div>
                                <div class="er-pack-status-box">
                                    <div class="er-ownership-badge ${isOwned ? "owned" : "locked"}">
                                        ${isOwned ? "✅ OWNED & ACTIVE" : "🔒 LOCKED PREMIUM"}
                                    </div>
                                    ${!isOwned ? `<button class="btn btn-primary" id="buyLensBtn" style="width:100%; margin-top:15px;">Purchase Lens ($5.99)</button>` : `<button class="btn btn-secondary" id="activateLensBtn" style="width:100%; margin-top:15px;">Launch in Live Studio</button>`}
                                </div>
                            </div>

                            <hr class="er-divider">

                            <div class="er-pack-section">
                                <h4>📚 Content Pipeline & Articles</h4>
                                <div class="er-pack-articles-grid">${articlesHtml}</div>
                            </div>

                            <div class="er-pack-section" style="margin-top:20px;">
                                <h4>🛠️ Hardware Care & Setup Guidance</h4>
                                <div class="er-hardware-grid">${hardwareHtml}</div>
                            </div>

                            <div class="er-pack-section" style="margin-top:20px;">
                                <h4>💬 Remote Assistance & Support</h4>
                                <p style="font-size:13px; color:#94a3b8;">Eligible owners have access to scoped technical setup guidance and hardware care support.</p>
                                <button class="btn btn-secondary" id="requestAssistanceBtn" style="margin-top:10px;">Request Lens Setup Assistance</button>
                            </div>
                        </div>
                    </div>
                </div>
            `;

      var container = document.getElementById("erStudioOverlayContainer");
      if (container) {
        container.innerHTML = modalHtml;
        container.style.display = "block";

        document
          .getElementById("fpCloseBtn")
          .addEventListener("click", function () {
            container.style.display = "none";
            container.innerHTML = "";
          });

        var buyBtn = document.getElementById("buyLensBtn");
        if (buyBtn) {
          buyBtn.addEventListener("click", function () {
            container.style.display = "none";
            window.WEBZONEBW_PAYMENT_GATEWAY.initiatePayPalCheckout(
              lensId,
              pack ? pack.id : null,
              function () {
                window.WEBZONEBW_STUDIO_UI.openFeaturePackModal(lensId);
              },
            );
          });
        }

        var activateBtn = document.getElementById("activateLensBtn");
        if (activateBtn) {
          activateBtn.addEventListener("click", function () {
            container.style.display = "none";
            window.WEBZONEBW_STUDIO_UI.showToast(
              "🚀 " + lens.name + " active in Live Studio!",
            );
          });
        }

        var assistBtn = document.getElementById("requestAssistanceBtn");
        if (assistBtn) {
          assistBtn.addEventListener("click", function () {
            alert(
              "Support Request Submitted!\n\nOur WebZoneBW support specialist will review your hardware and lens setup configuration.",
            );
          });
        }
      }
    },

    renderHubSections: function () {
      // Inject dynamic hubs into er/index.html if placeholders exist, or append to main content
      var mainContainer =
        document.querySelector(".er-layout-container main") || document.body;
      if (!document.getElementById("webzoneStudioHubSections")) {
        var hubDiv = document.createElement("div");
        hubDiv.id = "webzoneStudioHubSections";
        hubDiv.className = "er-hub-sections-wrap";

        // Build Lenses Discovery & Marketplace Slabs
        var lensesHtml = window.WEBZONEBW_STUDIO_REGISTRY.lenses
          .map(function (lens) {
            var owned = window.WEBZONEBW_ENTITLEMENT_MANAGER.isLensOwned(
              lens.id,
            );
            return `
                        <div class="er-hub-card ${lens.isPremium ? "premium-card" : ""}" data-lens-id="${lens.id}">
                            <div class="er-hub-badge">${lens.category} ${lens.isPremium ? "💎" : "✨"}</div>
                            <h4>${lens.name}</h4>
                            <p>${lens.description}</p>
                            <div class="er-hub-card-footer">
                                <span class="er-owner-status ${owned ? "text-success" : "text-warning"}">${owned ? "✅ Owned" : "🔒 Locked ($5.99)"}</span>
                                <button class="btn btn-sm btn-primary view-pack-btn" data-lens-id="${lens.id}">View Feature Pack</button>
                            </div>
                        </div>
                    `;
          })
          .join("");

        // Build News & Updates
        var newsHtml = window.WEBZONEBW_STUDIO_REGISTRY.news
          .map(function (n) {
            var titleHtml = n.url
              ? `<a href="${n.url}" target="_blank" rel="noopener"><h5>${n.title}</h5></a>`
              : `<h5>${n.title}</h5>`;
            return `
                        <div class="er-news-item">
                            <span class="er-badge-pill ${n.status.toLowerCase()}">${n.status}</span>
                            <div>
                                ${titleHtml}
                                <p>${n.excerpt}</p>
                                <small>${n.date}</small>
                            </div>
                        </div>
                    `;
          })
          .join("");

        hubDiv.innerHTML = `
                    <section class="er-section-block" id="lensDiscoveryHub">
                        <div class="er-section-header">
                            <h2>🔮 Lens Discovery & Feature Packs</h2>
                            <p>Explore free, premium, and upcoming AR lenses with fully integrated feature packs.</p>
                        </div>
                        <div class="er-hub-grid">${lensesHtml}</div>
                    </section>

                    <section class="er-section-block" id="newsUpdatesHub">
                        <div class="er-section-header">
                            <h2>📰 Lens News & Updates Pipeline</h2>
                            <p>Real-time updates, maintenance notices, and new effect announcements for active lens owners.</p>
                        </div>
                        <div class="er-news-list">${newsHtml}</div>
                    </section>
                `;

        mainContainer.insertBefore(hubDiv, mainContainer.querySelector("footer.site-footer"));

        // Bind click events
        hubDiv.querySelectorAll(".view-pack-btn").forEach(function (btn) {
          btn.addEventListener("click", function () {
            var lid = btn.getAttribute("data-lens-id");
            window.WEBZONEBW_STUDIO_UI.openFeaturePackModal(lid);
          });
        });
      }
    },
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function () {
      window.WEBZONEBW_STUDIO_UI.renderHubSections();
    });
  } else {
    window.WEBZONEBW_STUDIO_UI.renderHubSections();
  }
})();
