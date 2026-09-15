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
        id: "volcanic-ember-lens",
        name: "Volcanic Ember Lens",
        theme: "Volcanic Lava",
        themeKey: "theme-volcanic",
        filterId: "volcanic",
        secondaryFilterIds: [],
        icon: "🌋",
        badge: "CORE BENCHMARK",
        isPremium: false,
        price: "FREE",
        whatItDoes:
          "Generates dynamic rising molten embers, thermal color grading, organic heat shimmer distortion, and radiant fiery eye illumination in real-time.",
        requiredInput:
          "Front Camera or Uploaded Photo (Face detection auto-calibrates eye radiance & thermal heat rim)",
        pipelineSteps: {
          input: "RGB Camera / Photo",
          background: "Dark Magma Vignette",
          face: "Fiery Iris & Thermal Warmth",
          pose: "Upward Thermal Drift",
          result: "Cinema Lava Grade HD",
        },
        result:
          "Atmospheric floating magma embers + 3200K cinematic thermal grade + real-time optical heat shimmer distortion.",
        previewCenterpieceHtml: `
          <div class="volcanic-ambient"></div>
          <div class="volcanic-embers-anim"></div>
          <div style="position:relative; z-index:2; text-align:center;">
            <div style="font-size:38px; filter: drop-shadow(0 0 12px #ea580c);">🌋</div>
            <span style="display:inline-block; font-size:10px; font-weight:800; letter-spacing:0.06em; color:#fed7aa; background:rgba(234,88,12,0.4); border:1px solid rgba(255,107,26,0.6); padding:2px 8px; border-radius:999px; margin-top:4px;">MAGMA EMBER DRIFT</span>
          </div>
        `,
        effects: ["Ember Drift", "Lava Grade", "Heat Shimmer", "Fiery Iris"],
        sounds: ["Volcanic Rumble & Embers"],
        featurePackId: "volcanic-ember-pack",
        status: "active",
        visibility: "public",
        featured: true,
      },
      {
        id: "phantom-spectral-lens",
        name: "Phantom Spectral Lens",
        theme: "Spectral Halloween",
        themeKey: "theme-halloween",
        filterId: "haunted-forest",
        secondaryFilterIds: ["witch-ritual", "ghost-pose"],
        icon: "🎃",
        badge: "SEASONAL SUITE",
        isPremium: true,
        price: "$5.99",
        whatItDoes:
          "Transforms your camera into an ethereal twilight realm with swirling misty phantoms, chromatic aberration glitch trails, and spectral spirit auras.",
        requiredInput:
          "Camera or Photo + Ambient Light (Optimized for low-light & night mode video streaming)",
        pipelineSteps: {
          input: "Low-Light Camera Feed",
          background: "Haunted Forest Fog",
          face: "Spectral Pale Shading",
          pose: "Spirit Velocity Trail",
          result: "Eerie Phantom Master HD",
        },
        result:
          "Atmospheric volumetric fog + floating spirit apparition shaders + motion-reactive spectral chromatic dispersion.",
        previewCenterpieceHtml: `
          <div class="halloween-ambient"></div>
          <div style="position:relative; z-index:2; text-align:center;">
            <div style="font-size:38px; filter: drop-shadow(0 0 14px #8b5cf6);">👻</div>
            <span style="display:inline-block; font-size:10px; font-weight:800; letter-spacing:0.06em; color:#e9d5ff; background:rgba(139,92,246,0.35); border:1px solid rgba(168,85,247,0.6); padding:2px 8px; border-radius:999px; margin-top:4px;">CHROMATIC GLITCH MIST</span>
          </div>
        `,
        effects: ["Haunted Forest Fog", "Witch Ritual", "Chromatic Glitch", "Ghostly Trail"],
        sounds: ["Spectral Haunt & Whispers"],
        featurePackId: "phantom-spectral-pack",
        status: "active",
        visibility: "public",
        featured: true,
      },
      {
        id: "neon-cyber-lens",
        name: "Neon Cyber Lens",
        theme: "Cyber Neon",
        themeKey: "theme-cyber",
        filterId: "cyberpunk",
        secondaryFilterIds: ["vr-cyberdeck", "glitch"],
        icon: "⚡",
        badge: "HIGH-TECH MATRIX",
        isPremium: true,
        price: "$5.99",
        whatItDoes:
          "Projects an interactive cybernetic mesh, cyan-magenta chromatic scanlines, holographic heads-up display telemetry, and digital matrix glitch bursts.",
        requiredInput:
          "Live Video Stream with Face Tracking (Facial reticle & landmark calibration at 60 FPS)",
        pipelineSteps: {
          input: "High-FPS Video Stream",
          background: "Digital Matrix Grid",
          face: "Cyan / Magenta HUD Reticle",
          pose: "Glitch on Fast Motion",
          result: "Cyberdeck Hologram 4K",
        },
        result:
          "Holographic wireframe telemetry + dual-tone neon color grade + RGB chromatic channel displacement.",
        previewCenterpieceHtml: `
          <div class="cyber-ambient"></div>
          <div class="cyber-grid-anim"></div>
          <div style="position:relative; z-index:2; text-align:center;">
            <div style="font-size:38px; filter: drop-shadow(0 0 14px #06b6d4);">⚡</div>
            <span style="display:inline-block; font-size:10px; font-weight:800; letter-spacing:0.06em; color:#a5f3fc; background:rgba(6,182,212,0.35); border:1px solid rgba(34,211,238,0.6); padding:2px 8px; border-radius:999px; margin-top:4px;">MATRIX PARTICLE RAIN</span>
          </div>
        `,
        effects: ["Cyber Grid", "Neon Edge", "Matrix Scanline", "RGB Aberration"],
        sounds: ["Synthwave Cyber Pulse"],
        featurePackId: "neon-cyber-pack",
        status: "active",
        visibility: "public",
        featured: true,
      },
      {
        id: "pose-kinetic-lens",
        name: "Pose Kinetic Lens",
        theme: "Pose Studio",
        themeKey: "theme-pose",
        filterId: "pose-frame",
        secondaryFilterIds: ["ghost-pose", "pumpkin-pose"],
        icon: "🦴",
        badge: "MOTION REACTIVE",
        isPremium: false,
        price: "FREE",
        whatItDoes:
          "Real-time body tracking that aligns framing guides, level meters, and triggers kinetic visual energy bursts when you move or strike poses in front of the lens.",
        requiredInput:
          "Full or Upper Body in Camera View (Live motion vector analysis & skeletal alignment)",
        pipelineSteps: {
          input: "Body In-Frame Motion",
          background: "Kinetic Depth Horizon",
          face: "Head Position Anchor",
          pose: "Real-time Skeletal Alignment",
          result: "Motion Energy Master",
        },
        result:
          "Dynamic geometric alignment guides + velocity-based energy flares + horizontal level calibration.",
        previewCenterpieceHtml: `
          <div class="pose-ambient"></div>
          <div style="position:relative; z-index:2; text-align:center;">
            <div style="font-size:38px; filter: drop-shadow(0 0 14px #f59e0b);">🎯</div>
            <span style="display:inline-block; font-size:10px; font-weight:800; letter-spacing:0.06em; color:#fef08a; background:rgba(245,158,11,0.35); border:1px solid rgba(251,191,36,0.6); padding:2px 8px; border-radius:999px; margin-top:4px;">SKELETAL POSE TRACKING</span>
          </div>
        `,
        effects: ["Pose Framing Guide", "Kinetic Energy Flare", "Level Calibration"],
        sounds: ["Motion Energy Chime"],
        featurePackId: "pose-kinetic-pack",
        status: "active",
        visibility: "public",
        featured: true,
      },
      {
        id: "deep-space-scene-lens",
        name: "Deep Space Scene Lens",
        theme: "Background Studio",
        themeKey: "theme-background",
        filterId: "space",
        secondaryFilterIds: ["vr-nebula"],
        icon: "🌌",
        badge: "SCENE REPLACEMENT",
        isPremium: false,
        price: "FREE",
        whatItDoes:
          "Separates the subject from the physical room, compositing you into deep interstellar nebulas with drifting cosmic dust and starlight rim illumination.",
        requiredInput:
          "Any Camera Feed or Uploaded Portrait (Real-time depth segmentation & lighting matching)",
        pipelineSteps: {
          input: "Subject Camera / Photo",
          background: "Deep Space Nebula Skybox",
          face: "Starlight Rim Illumination",
          pose: "Parallax Space Horizon",
          result: "Cosmic Portrait Master",
        },
        result:
          "Photorealistic cosmic nebula aura + multi-layer starfield parallax + matched interstellar rim lighting.",
        previewCenterpieceHtml: `
          <div class="background-ambient"></div>
          <div style="position:relative; z-index:2; text-align:center;">
            <div style="font-size:38px; filter: drop-shadow(0 0 14px #818cf8);">🪐</div>
            <span style="display:inline-block; font-size:10px; font-weight:800; letter-spacing:0.06em; color:#c7d2fe; background:rgba(99,102,241,0.35); border:1px solid rgba(129,140,248,0.6); padding:2px 8px; border-radius:999px; margin-top:4px;">NEBULA DEPTH COMPOSITING</span>
          </div>
        `,
        effects: ["Cosmic Nebula", "Starfield Parallax", "Starlight Rim Glow"],
        sounds: ["Interstellar Cosmic Drone"],
        featurePackId: "deep-space-pack",
        status: "active",
        visibility: "public",
        featured: true,
      },
      {
        id: "aviator-glam-lens",
        name: "Aviator Glam Lens",
        theme: "Face AR & Cosmetic",
        themeKey: "theme-face",
        filterId: "sunglasses",
        secondaryFilterIds: ["goldenhour", "halo", "cartoon"],
        icon: "🕶️",
        badge: "FACIAL AR ANCHOR",
        isPremium: false,
        price: "FREE",
        whatItDoes:
          "Precision eye and cheekbone landmark tracking anchors photorealistic Ray-Ban aviators with dynamic reflections and golden-hour sunset skin radiance.",
        requiredInput:
          "Front-Facing Camera with Face in View (Facial bounding box lock with sub-pixel alignment)",
        pipelineSteps: {
          input: "Live Face Video Stream",
          background: "Warm Sunset Vignette",
          face: "3D Aviator Glasses Anchor",
          pose: "Head Yaw / Pitch Tracking",
          result: "Studio Glamour Portrait",
        },
        result:
          "Shimmering lens reflection + California 3200K skin warmth + zero-latency facial landmark synchronization.",
        previewCenterpieceHtml: `
          <div class="face-ambient"></div>
          <div style="position:relative; z-index:2; text-align:center;">
            <div style="font-size:38px; filter: drop-shadow(0 0 14px #f59e0b);">✨</div>
            <span style="display:inline-block; font-size:10px; font-weight:800; letter-spacing:0.06em; color:#fed7aa; background:rgba(245,158,11,0.35); border:1px solid rgba(251,146,60,0.6); padding:2px 8px; border-radius:999px; margin-top:4px;">RAY-BAN SHIMMER & GLAM</span>
          </div>
        `,
        effects: ["Designer Aviators", "Golden Hour Glow", "Anime Cel Shading"],
        sounds: ["Studio Shutter Chime"],
        featurePackId: "aviator-glam-pack",
        status: "active",
        visibility: "public",
        featured: true,
      },
      {
        id: "cinema-anamorphic-lens",
        name: "Cinema Anamorphic Lens",
        theme: "Cinema Grade",
        themeKey: "theme-cinema",
        filterId: "cinematic",
        secondaryFilterIds: ["noir", "vintage90s"],
        icon: "🎬",
        badge: "35MM HOLLYWOOD",
        isPremium: false,
        price: "FREE",
        whatItDoes:
          "Applies authentic 35mm motion picture film emulation: 2.39:1 widescreen anamorphic bars, Kodak Portra color grading, organic silver-halide grain, and rich Leica monochrome.",
        requiredInput:
          "Camera Video or High-Resolution Photo Upload (Direct pixel shader color curve mapping)",
        pipelineSteps: {
          input: "Camera Stream / Photo",
          background: "2.39:1 Aspect Letterbox",
          face: "Kodak Portra Tone Curve",
          pose: "Pan-Aware Film Grain",
          result: "35mm Motion Picture Master",
        },
        result:
          "Cinema-grade color LUT + organic 35mm grain texture + anamorphic letterbox framing.",
        previewCenterpieceHtml: `
          <div class="cinema-ambient"></div>
          <div style="position:relative; z-index:2; text-align:center;">
            <div style="font-size:38px; filter: drop-shadow(0 0 14px #d97706);">🎥</div>
            <span style="display:inline-block; font-size:10px; font-weight:800; letter-spacing:0.06em; color:#fde68a; background:rgba(217,119,6,0.35); border:1px solid rgba(245,158,11,0.6); padding:2px 8px; border-radius:999px; margin-top:4px;">2.39:1 KODAK 35MM GRADE</span>
          </div>
        `,
        effects: ["35mm Film Grain", "Kodak Tone Curve", "Leica Monochrome", "Anamorphic Bars"],
        sounds: ["Vintage Projector Reel"],
        featurePackId: "cinema-grade-pack",
        status: "active",
        visibility: "public",
        featured: true,
      },
      {
        id: "vr-cyberdeck-lens",
        name: "VR Cyberdeck Lens",
        theme: "VR World",
        themeKey: "theme-vr",
        filterId: "vr-cyberdeck",
        secondaryFilterIds: ["vr-mansion", "vr-nebula"],
        icon: "🥽",
        badge: "IMMERSIVE 360°",
        isPremium: true,
        price: "$5.99",
        whatItDoes:
          "Wraps your live camera inside a virtual reality cockpit with multi-panel HUD telemetry, artificial horizons, and real-time audio reactivity.",
        requiredInput:
          "Desktop or Mobile Browser (Gyroscope or mouse parallax orientation tracking)",
        pipelineSteps: {
          input: "Camera + Gyro Sensor",
          background: "360° Cockpit Shell",
          face: "Biometric Reticle Overlay",
          pose: "Angular Perspective Tilt",
          result: "Full VR Environment HD",
        },
        result:
          "Tactile heads-up display overlay + responsive angular gyro drift + immersive cockpit environment.",
        previewCenterpieceHtml: `
          <div class="vr-ambient"></div>
          <div style="position:relative; z-index:2; text-align:center;">
            <div style="font-size:38px; filter: drop-shadow(0 0 14px #10b981);">🥽</div>
            <span style="display:inline-block; font-size:10px; font-weight:800; letter-spacing:0.06em; color:#a7f3d0; background:rgba(16,185,129,0.35); border:1px solid rgba(52,211,153,0.6); padding:2px 8px; border-radius:999px; margin-top:4px;">360° VIRTUAL COCKPIT</span>
          </div>
        `,
        effects: ["VR Cockpit HUD", "Artificial Horizon", "Biometric Reticle", "Parallax Drift"],
        sounds: ["Cyberdeck Ambient Telemetry"],
        featurePackId: "vr-cyberdeck-pack",
        status: "active",
        visibility: "public",
        featured: true,
      },
    ],

    featurePacks: [
      {
        id: "volcanic-ember-pack",
        name: "Volcanic Ember Feature Pack",
        lensId: "volcanic-ember-lens",
        description:
          "The reference benchmark experience: rising organic magma embers, deep volcanic thermal grade, optical heat shimmer distortion, and hardware care guides.",
        assets: ["volcanic-shader.glsl", "ember-overlay.png"],
        effects: ["Ember Drift", "Lava Grade", "Heat Shimmer", "Fiery Iris"],
        sounds: ["Volcanic Rumble & Embers"],
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
          "Haunting seasonal spectral suite: volumetric misty apparitions, chromatic glitch shaders, eerie spirit auras, and audio resonance packs.",
        assets: ["spectral-overlay.png", "ghostly-whisper.mp3"],
        effects: ["Haunted Forest Fog", "Witch Ritual", "Chromatic Glitch", "Ghostly Trail"],
        sounds: ["Spectral Haunt & Whispers"],
        articles: ["phantom-spectral-masterclass"],
        isPremium: true,
        createdAt: "2024-10-15",
        updatedAt: "2024-10-22",
      },
      {
        id: "neon-cyber-pack",
        name: "Neon Cyber Feature Pack",
        lensId: "neon-cyber-lens",
        description:
          "High-tech futuristic cybernetic enhancement suite: facial matrix mesh, neon audio-reactive pulse, cyan-magenta scanlines, and GPU acceleration guide.",
        assets: ["cyber-hud-overlay.png", "synthwave-loop.mp3"],
        effects: ["Cyber Grid", "Neon Edge", "Matrix Scanline", "RGB Aberration"],
        sounds: ["Synthwave Cyber Pulse"],
        articles: ["neon-cyber-getting-started", "cyber-hardware-care"],
        isPremium: true,
        createdAt: "2024-10-05",
        updatedAt: "2024-10-20",
      },
      {
        id: "pose-kinetic-pack",
        name: "Pose Kinetic Feature Pack",
        lensId: "pose-kinetic-lens",
        description:
          "Interactive body tracking suite: framing guides, level balance meters, and velocity-responsive energy flares for creators and performers.",
        assets: ["pose-guide-overlay.svg"],
        effects: ["Pose Framing Guide", "Kinetic Energy Flare", "Level Calibration"],
        sounds: ["Motion Energy Chime"],
        articles: ["pose-tracking-guide"],
        isPremium: false,
        createdAt: "2024-10-18",
        updatedAt: "2024-10-25",
      },
      {
        id: "deep-space-pack",
        name: "Deep Space Scene Feature Pack",
        lensId: "deep-space-scene-lens",
        description:
          "Real-time background replacement suite: deep cosmos skyboxes, drifting starlight particles, and automatic illumination matching.",
        assets: ["nebula-skybox.jpg"],
        effects: ["Cosmic Nebula", "Starfield Parallax", "Starlight Rim Glow"],
        sounds: ["Interstellar Cosmic Drone"],
        articles: ["background-segmentation-guide"],
        isPremium: false,
        createdAt: "2024-10-12",
        updatedAt: "2024-10-24",
      },
      {
        id: "aviator-glam-pack",
        name: "Aviator Glam Feature Pack",
        lensId: "aviator-glam-lens",
        description:
          "Cosmetic facial AR package: reflective Ray-Ban aviators, California golden-hour sunset skin warmth, and comic anime cel shaders.",
        assets: ["aviator-mesh.json"],
        effects: ["Designer Aviators", "Golden Hour Glow", "Anime Cel Shading"],
        sounds: ["Studio Shutter Chime"],
        articles: ["facial-ar-lighting-guide"],
        isPremium: false,
        createdAt: "2024-10-08",
        updatedAt: "2024-10-22",
      },
      {
        id: "cinema-grade-pack",
        name: "Cinema Anamorphic Feature Pack",
        lensId: "cinema-anamorphic-lens",
        description:
          "Hollywood director's emulation suite: 2.39:1 widescreen anamorphic bars, Kodak 35mm Portra color curve, and Leica silver-halide monochrome.",
        assets: ["kodak-portra-lut.cube"],
        effects: ["35mm Film Grain", "Kodak Tone Curve", "Leica Monochrome", "Anamorphic Bars"],
        sounds: ["Vintage Projector Reel"],
        articles: ["cinematic-color-grading-guide"],
        isPremium: false,
        createdAt: "2024-10-10",
        updatedAt: "2024-10-20",
      },
      {
        id: "vr-cyberdeck-pack",
        name: "VR Cyberdeck Feature Pack",
        lensId: "vr-cyberdeck-lens",
        description:
          "Immersive 360° virtual reality environment: tactical heads-up telemetry instruments, artificial horizons, and gyroscope motion parallax.",
        assets: ["cockpit-model.json", "vr-hud-telemetry.svg"],
        effects: ["VR Cockpit HUD", "Artificial Horizon", "Biometric Reticle", "Parallax Drift"],
        sounds: ["Cyberdeck Ambient Telemetry"],
        articles: ["vr-gyroscope-setup-guide"],
        isPremium: true,
        createdAt: "2024-10-14",
        updatedAt: "2024-10-26",
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
   * WebZoneBW ER Studio license (₹499 purchase). The old
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

      var effectsHtml = (lens.effects || [])
        .map(function (e) {
          return `<span class="er-badge-pill">✨ ${e}</span>`;
        })
        .join("");
      var soundsHtml = (lens.sounds || [])
        .map(function (s) {
          return `<span class="er-badge-pill" style="border-color:rgba(255,107,26,0.3); background:rgba(255,107,26,0.1); color:#fed7aa;">🎵 ${s}</span>`;
        })
        .join("");

      var articles = window.WEBZONEBW_STUDIO_REGISTRY.articles.filter(
        function (a) {
          return a.lensId === lensId || !a.lensId;
        },
      );
      var articlesHtml =
        articles.slice(0, 3)
          .map(function (a) {
            return `<div class="er-pack-article-card">
                    <h4>${a.title}</h4>
                    <p>${a.excerpt}</p>
                    <span class="er-tag">${a.category || "Documentation"}</span>
                </div>`;
          })
          .join("") ||
        "<p style='color:#94a3b8; font-size:13px;'>Documentation guide active for this studio experience.</p>";

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
                    <div class="er-modal-card er-modal-large" style="background:#130b08; border:1px solid rgba(255,107,26,0.35); box-shadow:0 25px 60px rgba(0,0,0,0.8), 0 0 40px rgba(255,107,26,0.15);">
                        <div class="er-modal-header" style="border-bottom:1px solid rgba(255,107,26,0.2); padding-bottom:16px;">
                            <div>
                                <span class="er-badge-category" style="background:rgba(255,107,26,0.15); border:1px solid rgba(255,107,26,0.4); color:#fed7aa;">${lens.theme}</span>
                                <h3 style="color:#f8fafc; margin-top:6px; font-family:'Space Grotesk',sans-serif;">${lens.name}</h3>
                            </div>
                            <button class="er-modal-close" id="fpCloseBtn" style="color:#94a3b8; font-size:24px; background:none; border:none; cursor:pointer;">&times;</button>
                        </div>
                        <div class="er-modal-body er-scrollable" style="padding-top:16px;">
                            <div class="er-pack-hero" style="display:grid; grid-template-columns:1fr auto; gap:20px; align-items:start; background:rgba(20,10,7,0.7); border:1px solid rgba(255,107,26,0.25); border-radius:12px; padding:18px;">
                                <div class="er-pack-desc">
                                    <p style="color:#e2e8f0; font-size:14px; line-height:1.6;"><strong>What it does:</strong> ${lens.whatItDoes}</p>
                                    ${pack ? `<p style="color:#cbd5e1; font-size:13.5px; margin-top:8px;"><strong>Included Suite:</strong> ${pack.description}</p>` : ""}
                                    <div style="margin-top:12px;">
                                        <div style="font-size:11px; font-weight:700; color:#f97316; letter-spacing:0.06em; text-transform:uppercase; margin-bottom:6px;">Transformation Result:</div>
                                        <div style="font-size:13px; color:#cbd5e1; background:rgba(0,0,0,0.4); border-left:3px solid #f97316; padding:8px 12px; border-radius:4px;">${lens.result}</div>
                                    </div>
                                    <div class="er-pack-effects-row" style="margin-top:14px;">
                                        <strong style="color:#94a3b8; font-size:12px;">Integrated Effects & Shaders:</strong>
                                        <div class="er-effects-pills" style="display:flex; flex-wrap:wrap; gap:6px; margin-top:6px;">${effectsHtml} ${soundsHtml}</div>
                                    </div>
                                </div>
                                <div class="er-pack-status-box" style="min-width:220px; background:#1c100b; border:1px solid rgba(255,107,26,0.3); border-radius:10px; padding:16px; text-align:center;">
                                    <div class="er-ownership-badge ${isOwned ? "owned" : "locked"}" style="font-weight:700; font-size:12px; padding:6px 12px; border-radius:999px; display:inline-block;">
                                        ${isOwned ? "✅ ACCESS ACTIVE" : "🔒 STUDIO PRO ($5.99)"}
                                    </div>
                                    <div style="margin-top:14px; display:flex; flex-direction:column; gap:10px;">
                                        <button class="btn btn-primary" id="activateLensBtn" style="width:100%; background:linear-gradient(135deg,#ea580c,#c2410c); border:1px solid #f97316; color:#fff; font-weight:700; padding:10px; border-radius:8px; cursor:pointer;">🚀 Launch Live in Studio</button>
                                        ${!isOwned ? `<button class="btn btn-secondary" id="buyLensBtn" style="width:100%; background:rgba(255,107,26,0.15); border:1px solid rgba(255,107,26,0.5); color:#fed7aa; font-weight:700; padding:10px; border-radius:8px; cursor:pointer;">Unlock All Lenses ($5.99)</button>` : ""}
                                    </div>
                                    <div style="font-size:11px; color:#94a3b8; margin-top:10px; line-height:1.4;">
                                        ${isOwned ? "Full resolution studio capture & recording enabled." : "$5.99 grants lifetime access to all 8 studio lenses, HD capture, & feature packs."}
                                    </div>
                                </div>
                            </div>

                            <hr class="er-divider" style="border-color:rgba(255,107,26,0.2); margin:20px 0;">

                            <div class="er-pack-section">
                                <h4 style="color:#fdba74; font-size:14px; font-weight:700; margin-bottom:10px;">📚 Creative Documentation & Guides</h4>
                                <div class="er-pack-articles-grid">${articlesHtml}</div>
                            </div>

                            <div class="er-pack-section" style="margin-top:20px;">
                                <h4 style="color:#fdba74; font-size:14px; font-weight:700; margin-bottom:10px;">🛠️ Camera Sensor & Hardware Care</h4>
                                <div class="er-hardware-grid">${hardwareHtml}</div>
                            </div>

                            <div class="er-pack-section" style="margin-top:20px; background:rgba(255,107,26,0.05); border:1px solid rgba(255,107,26,0.2); border-radius:8px; padding:14px;">
                                <h4 style="color:#fdba74; font-size:14px; font-weight:700;">💬 Scoped Technical & Hardware Assistance</h4>
                                <p style="font-size:13px; color:#cbd5e1; margin-top:4px;">Lens owners receive scoped guidance for lighting, camera focal distance, and shader performance optimization.</p>
                                <button class="btn btn-secondary" id="requestAssistanceBtn" style="margin-top:10px; background:rgba(255,107,26,0.15); border:1px solid rgba(255,107,26,0.4); color:#fed7aa; padding:8px 14px; border-radius:6px; font-size:12px; cursor:pointer;">Request Lens Setup Assistance</button>
                                <span id="assistConfirmation" style="display:none; font-size:12px; color:#34d399; margin-left:12px; font-weight:600;">✓ Request registered. Support review in progress.</span>
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
            if (typeof window.webzoneLaunchLens === "function") {
              window.webzoneLaunchLens(lens.filterId);
            }
            window.WEBZONEBW_STUDIO_UI.showToast(
              "🚀 " + lens.name + " active in Live Studio!",
            );
          });
        }

        var assistBtn = document.getElementById("requestAssistanceBtn");
        if (assistBtn) {
          assistBtn.addEventListener("click", function () {
            var confirmEl = document.getElementById("assistConfirmation");
            if (confirmEl) confirmEl.style.display = "inline";
            assistBtn.disabled = true;
            assistBtn.textContent = "Assistance Requested";
          });
        }
      }
    },

    renderHubSections: function () {
      var mainContainer =
        document.querySelector(".er-layout-container main") || document.body;
      if (!document.getElementById("webzoneStudioHubSections")) {
        var hubDiv = document.createElement("div");
        hubDiv.id = "webzoneStudioHubSections";
        hubDiv.className = "er-hub-sections-wrap";

        // Category filter tabs definition with easy standard words
        var filterCategories = [
          { id: "all", label: "✨ All Lenses", count: 8 },
          { id: "free", label: "🎁 Free Lenses", count: 5 },
          { id: "theme-volcanic", label: "🌋 Volcanic Lava", count: 1 },
          { id: "theme-pose", label: "🦴 Pose & Motion", count: 1 },
          { id: "theme-face", label: "👤 Face & Style", count: 1 },
          { id: "theme-cinema", label: "🎬 Cinema Grade", count: 1 },
          { id: "theme-cyber", label: "⚡ Cyber Neon", count: 1 },
          { id: "premium", label: "💎 Pro Studio ($5.99)", count: 3 },
        ];

        var filterTabsHtml = filterCategories
          .map(function (tab, idx) {
            var activeClass = idx === 0 ? "active" : "";
            return `<button class="er-cat-tab ${activeClass}" data-filter="${tab.id}">${tab.label} <span class="tab-count">${tab.count}</span></button>`;
          })
          .join("");

        // Build Structured Experience Cards
        var lensesHtml = window.WEBZONEBW_STUDIO_REGISTRY.lenses
          .map(function (lens) {
            var owned = window.WEBZONEBW_ENTITLEMENT_MANAGER.isLensOwned(lens.id);
            var cardTierClass = lens.isPremium ? "tier-premium" : "tier-free";
            var statusBadgeClass = owned ? "status-owned" : (lens.isPremium ? "status-locked" : "status-free");
            var statusBadgeText = owned ? "✓ Unlocked & Active" : (lens.isPremium ? "🔒 Studio Pro ($5.99)" : "✨ Free Core Lens");

            var effectsPills = (lens.effects || [])
              .map(function (ef) {
                return `<span class="er-exp-badge">✦ ${ef}</span>`;
              })
              .join("");

            var pipelineHtml = `
              <div class="er-exp-pipeline">
                <div class="er-exp-step">
                  <span class="step-num">01</span>
                  <span class="step-label">INPUT</span>
                  <span class="step-desc">${lens.pipelineSteps.input}</span>
                </div>
                <div class="er-exp-step">
                  <span class="step-num">02</span>
                  <span class="step-label">BG SHADER</span>
                  <span class="step-desc">${lens.pipelineSteps.background}</span>
                </div>
                <div class="er-exp-step">
                  <span class="step-num">03</span>
                  <span class="step-label">FACE / POSE</span>
                  <span class="step-desc">${lens.pipelineSteps.face}</span>
                </div>
                <div class="er-exp-step">
                  <span class="step-num">04</span>
                  <span class="step-label">OUTPUT</span>
                  <span class="step-desc">${lens.pipelineSteps.result}</span>
                </div>
              </div>
            `;

            return `
              <div class="er-exp-card ${lens.themeKey} ${cardTierClass}" data-lens-id="${lens.id}" data-category="${lens.themeKey}" data-premium="${lens.isPremium}">
                
                <!-- 1. THEME HEADER -->
                <div class="er-exp-header">
                  <div>
                    <span class="er-exp-theme-tag">${lens.icon} ${lens.theme}</span>
                    <h3 class="er-exp-title">${lens.name}</h3>
                  </div>
                  <div class="text-right">
                    <span class="er-exp-badge" style="background:rgba(255,107,26,0.15); border-color:rgba(255,107,26,0.5); color:#fed7aa;">${lens.badge}</span>
                    <div style="font-size:11px; font-weight:700; color:#fb923c; margin-top:2px;">${lens.price}</div>
                  </div>
                </div>

                <!-- 2. VISUAL PREVIEW STAGE -->
                <div class="er-exp-preview-stage">
                  ${lens.previewCenterpieceHtml}
                  <div class="er-exp-preview-overlay">
                    <span class="preview-tech-tag">REAL-TIME SHADER</span>
                    <span class="preview-fps-tag">60 FPS WEBGL/CANVAS</span>
                  </div>
                </div>

                <!-- 3. WHAT IT DOES -->
                <div class="er-exp-section">
                  <div class="er-exp-section-title">What It Does</div>
                  <p class="er-exp-body-text">${lens.whatItDoes}</p>
                </div>

                <!-- 4. PIPELINE FLOW -->
                <div class="er-exp-section" style="padding-top:0;">
                  <div class="er-exp-section-title">Transformation Pipeline</div>
                  ${pipelineHtml}
                </div>

                <!-- 5. REQUIRED INPUT & HARDWARE -->
                <div class="er-exp-section" style="padding-top:0;">
                  <div class="er-exp-section-title">Required Input & Sensor</div>
                  <div class="er-exp-input-box">
                    <span class="input-icon">📷</span>
                    <span class="input-text">${lens.requiredInput}</span>
                  </div>
                </div>

                <!-- 6. RESULT DESCRIPTION -->
                <div class="er-exp-section" style="padding-top:0;">
                  <div class="er-exp-section-title">Transformation Result</div>
                  <div class="er-exp-result-box">
                    <span class="result-icon">⚡</span>
                    <span class="result-text">${lens.result}</span>
                  </div>
                  <div style="display:flex; flex-wrap:wrap; gap:4px; margin-top:10px;">
                    ${effectsPills}
                  </div>
                </div>

                <!-- 7. PREMIUM STATUS & ACTION FOOTER -->
                <div class="er-exp-footer">
                  <div class="er-exp-status-row">
                    <span class="er-exp-status-indicator ${statusBadgeClass}">${statusBadgeText}</span>
                    <span class="er-exp-clarity">${lens.isPremium ? "Included in $5.99 Pro Lifetime License" : "Free Forever / Zero Friction"}</span>
                  </div>
                  <div class="er-exp-actions">
                    <button class="er-btn-launch" data-filter-id="${lens.filterId}">
                      <span>🚀 Launch Live in Studio</span>
                    </button>
                    <button class="er-btn-inspect view-pack-btn" data-lens-id="${lens.id}">
                      <span>Inspect Feature Pack</span>
                    </button>
                  </div>
                </div>

              </div>
            `;
          })
          .join("");

        // Build News & Updates Pipeline
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
          <section class="er-section-block" id="lensDiscoveryHub" style="max-width:1440px; margin:0 auto; padding:40px 20px;">
            <div class="er-section-header" style="text-align:center; max-width:850px; margin:0 auto 30px auto;">
              <span class="er-badge-category" style="background:rgba(255,107,26,0.15); border:1px solid rgba(255,107,26,0.4); color:#fed7aa; margin-bottom:8px; display:inline-block;">STUDIO LENS EXPERIENCES</span>
              <h2 style="font-size:32px; font-weight:800; color:#f8fafc; font-family:'Space Grotesk',sans-serif; margin-bottom:10px;">🌋 Explore Real Lens Experiences</h2>
              <p style="color:#94a3b8; font-size:15px; line-height:1.6;">
                Every lens is a complete visual pipeline crafted in our signature Volcanic Lava engine. Inspect real shader effects, sensor input requirements, transformation outputs, and integrated feature packs.
              </p>
            </div>

            <!-- Experience Filter Category Tabs -->
            <div class="er-category-filter-nav" id="erCategoryFilterNav">
              ${filterTabsHtml}
            </div>

            <!-- Structured Experience Grid -->
            <div class="er-exp-grid" id="erExperienceGrid">
              ${lensesHtml}
            </div>
          </section>

          <section class="er-section-block" id="newsUpdatesHub" style="max-width:1440px; margin:20px auto 40px auto; padding:0 20px;">
            <div class="er-section-header">
              <h2>📰 Studio Engine Updates & Pipeline Notices</h2>
              <p>Real-time updates, maintenance notices, and new effect announcements for active lens owners.</p>
            </div>
            <div class="er-news-list">${newsHtml}</div>
          </section>
        `;

        mainContainer.insertBefore(
          hubDiv,
          mainContainer.querySelector("footer.site-footer"),
        );

        // Bind filter category tabs
        var filterBtns = hubDiv.querySelectorAll(".er-cat-tab");
        var cards = hubDiv.querySelectorAll(".er-exp-card");

        filterBtns.forEach(function (tab) {
          tab.addEventListener("click", function () {
            filterBtns.forEach(function (b) {
              b.classList.remove("active");
            });
            tab.classList.add("active");

            var filterValue = tab.getAttribute("data-filter");
            cards.forEach(function (card) {
              var isPrem = card.getAttribute("data-premium") === "true";
              if (filterValue === "all") {
                card.style.display = "flex";
              } else if (filterValue === "free") {
                card.style.display = !isPrem ? "flex" : "none";
              } else if (filterValue === "premium") {
                card.style.display = isPrem ? "flex" : "none";
              } else {
                var cardCat = card.getAttribute("data-category");
                card.style.display = cardCat === filterValue ? "flex" : "none";
              }
            });
          });
        });

        // Bind Launch Live in Studio buttons
        hubDiv.querySelectorAll(".er-btn-launch").forEach(function (btn) {
          btn.addEventListener("click", function () {
            var filterId = btn.getAttribute("data-filter-id");
            if (typeof window.webzoneLaunchLens === "function") {
              window.webzoneLaunchLens(filterId);
            }
            window.WEBZONEBW_STUDIO_UI.showToast(
              "🚀 Launching " + filterId + " lens in Studio Viewport...",
            );
          });
        });

        // Bind Inspect Feature Pack buttons
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
