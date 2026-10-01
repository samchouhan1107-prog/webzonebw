/* ==========================================================================
   WEBZONEBW-ER STUDIO — 10/10 CATEGORIES & VOLCANIC LAVA SHADER ENGINE
   Complete 5 Categories × 10 Items (50 Total Effects) + Volcanic Lava FX
   ========================================================================== */

(function () {
  "use strict";

  // 5 Categories with exactly 10/10 items each
  const ER_CATEGORIES = [
    {
      id: "halloween",
      name: "Halloween",
      icon: "🎃",
      items: [
        {
          id: "zombie",
          name: "Zombie",
          tag: "Spooky · Animated",
          thumb: "/assets/images/portrait_halloween_zombie_1790869434119.jpg",
          color: "#dc2626",
          type: "halloween",
          shader: "zombie"
        },
        {
          id: "vampire",
          name: "Vampire",
          tag: "Classic · Blood Glow",
          thumb: "/assets/images/portrait_halloween_zombie_1790869434119.jpg",
          color: "#991b1b",
          type: "halloween",
          shader: "vampire"
        },
        {
          id: "witch",
          name: "Witch",
          tag: "Magic Glow · Runes",
          thumb: "/assets/images/portrait_fantasy_neon_1790869462964.jpg",
          color: "#9333ea",
          type: "halloween",
          shader: "witch"
        },
        {
          id: "pumpkin-head",
          name: "Pumpkin Head",
          tag: "Fun · Jack-o'-Lantern",
          thumb: "/assets/images/portrait_volcanic_lava_1790869447484.jpg",
          color: "#ea580c",
          type: "halloween",
          shader: "pumpkin"
        },
        {
          id: "skull-demon",
          name: "Skull Demon",
          tag: "Spooky · Bone Mask",
          thumb: "/assets/images/portrait_halloween_zombie_1790869434119.jpg",
          color: "#e2e8f0",
          type: "halloween",
          shader: "skull"
        },
        {
          id: "phantom-ghost",
          name: "Ghost Phantom",
          tag: "Ethereal · Spectral",
          thumb: "/assets/images/portrait_fantasy_neon_1790869462964.jpg",
          color: "#38bdf8",
          type: "halloween",
          shader: "ghost"
        },
        {
          id: "werewolf",
          name: "Werewolf",
          tag: "Feral · Midnight Wolf",
          thumb: "/assets/images/portrait_animal_cute_1790869479667.jpg",
          color: "#78350f",
          type: "halloween",
          shader: "werewolf"
        },
        {
          id: "mummy",
          name: "Mummy Cursed",
          tag: "Ancient · Gold Relic",
          thumb: "/assets/images/portrait_halloween_zombie_1790869434119.jpg",
          color: "#d97706",
          type: "halloween",
          shader: "mummy"
        },
        {
          id: "frankenstein",
          name: "Frankenstein",
          tag: "Monster · Volt Spark",
          thumb: "/assets/images/portrait_volcanic_lava_1790869447484.jpg",
          color: "#16a34a",
          type: "halloween",
          shader: "frankenstein"
        },
        {
          id: "gothic-reaper",
          name: "Gothic Reaper",
          tag: "Dark · Shadow Cloak",
          thumb: "/assets/images/portrait_halloween_zombie_1790869434119.jpg",
          color: "#475569",
          type: "halloween",
          shader: "reaper"
        }
      ]
    },
    {
      id: "animals",
      name: "Animals",
      icon: "🐾",
      items: [
        {
          id: "dog",
          name: "Dog",
          tag: "Cute · Puppy Ears & Nose",
          thumb: "/assets/images/portrait_animal_cute_1790869479667.jpg",
          color: "#f59e0b",
          type: "animal",
          shader: "dog"
        },
        {
          id: "cat",
          name: "Cat",
          tag: "Cute · Whiskers & Blush",
          thumb: "/assets/images/portrait_animal_cute_1790869479667.jpg",
          color: "#ec4899",
          type: "animal",
          shader: "cat"
        },
        {
          id: "panda",
          name: "Panda",
          tag: "Cute · Bamboo Mask",
          thumb: "/assets/images/portrait_animal_cute_1790869479667.jpg",
          color: "#f8fafc",
          type: "animal",
          shader: "panda"
        },
        {
          id: "fox",
          name: "Fox",
          tag: "Cute · Fluffy Fur",
          thumb: "/assets/images/portrait_animal_cute_1790869479667.jpg",
          color: "#f97316",
          type: "animal",
          shader: "fox"
        },
        {
          id: "lion",
          name: "Lion",
          tag: "Wild · Golden Mane",
          thumb: "/assets/images/portrait_animal_cute_1790869479667.jpg",
          color: "#eab308",
          type: "animal",
          shader: "lion"
        },
        {
          id: "bunny",
          name: "Bunny",
          tag: "Adorable · Twitch Nose",
          thumb: "/assets/images/portrait_animal_cute_1790869479667.jpg",
          color: "#f472b6",
          type: "animal",
          shader: "bunny"
        },
        {
          id: "tiger",
          name: "Tiger",
          tag: "Fierce · Jungle Stripes",
          thumb: "/assets/images/portrait_animal_cute_1790869479667.jpg",
          color: "#ea580c",
          type: "animal",
          shader: "tiger"
        },
        {
          id: "bear",
          name: "Bear",
          tag: "Cozy · Fuzzy Ears",
          thumb: "/assets/images/portrait_animal_cute_1790869479667.jpg",
          color: "#b45309",
          type: "animal",
          shader: "bear"
        },
        {
          id: "deer",
          name: "Deer",
          tag: "Nature · Forest Antlers",
          thumb: "/assets/images/portrait_animal_cute_1790869479667.jpg",
          color: "#10b981",
          type: "animal",
          shader: "deer"
        },
        {
          id: "owl",
          name: "Owl",
          tag: "Mystic · Golden Eyes",
          thumb: "/assets/images/portrait_animal_cute_1790869479667.jpg",
          color: "#6366f1",
          type: "animal",
          shader: "owl"
        }
      ]
    },
    {
      id: "fantasy",
      name: "Fantasy",
      icon: "✨",
      items: [
        {
          id: "neon",
          name: "Neon",
          tag: "Glow · Cyber Shades",
          thumb: "/assets/images/portrait_fantasy_neon_1790869462964.jpg",
          color: "#06b6d4",
          type: "fantasy",
          shader: "neon"
        },
        {
          id: "galaxy",
          name: "Galaxy",
          tag: "Cosmic · Nebula Stars",
          thumb: "/assets/images/portrait_fantasy_neon_1790869462964.jpg",
          color: "#8b5cf6",
          type: "fantasy",
          shader: "galaxy"
        },
        {
          id: "robot",
          name: "Robot",
          tag: "Sci-Fi · Cyborg Visor",
          thumb: "/assets/images/portrait_fantasy_neon_1790869462964.jpg",
          color: "#64748b",
          type: "fantasy",
          shader: "robot"
        },
        {
          id: "elf",
          name: "Elf",
          tag: "Fantasy · Star Shimmer",
          thumb: "/assets/images/portrait_fantasy_neon_1790869462964.jpg",
          color: "#f59e0b",
          type: "fantasy",
          shader: "elf"
        },
        {
          id: "dragon-lord",
          name: "Dragon Lord",
          tag: "Mythic · Fire Scales",
          thumb: "/assets/images/portrait_volcanic_lava_1790869447484.jpg",
          color: "#dc2626",
          type: "fantasy",
          shader: "dragon"
        },
        {
          id: "angel-halo",
          name: "Angel Halo",
          tag: "Divine · Light Rays",
          thumb: "/assets/images/portrait_fantasy_neon_1790869462964.jpg",
          color: "#fbbf24",
          type: "fantasy",
          shader: "angel"
        },
        {
          id: "cyberpunk-matrix",
          name: "Cyber Matrix",
          tag: "Hacker · Digital Rain",
          thumb: "/assets/images/portrait_fantasy_neon_1790869462964.jpg",
          color: "#10b981",
          type: "fantasy",
          shader: "matrix"
        },
        {
          id: "fairy-pixie",
          name: "Fairy Pixie",
          tag: "Enchanted · Glitter Wings",
          thumb: "/assets/images/portrait_fantasy_neon_1790869462964.jpg",
          color: "#a855f7",
          type: "fantasy",
          shader: "fairy"
        },
        {
          id: "frost-king",
          name: "Frost King",
          tag: "Elemental · Ice Crystals",
          thumb: "/assets/images/portrait_fantasy_neon_1790869462964.jpg",
          color: "#38bdf8",
          type: "fantasy",
          shader: "frost"
        },
        {
          id: "phoenix-fire",
          name: "Phoenix Fire",
          tag: "Rebirth · Flame Wings",
          thumb: "/assets/images/portrait_volcanic_lava_1790869447484.jpg",
          color: "#f97316",
          type: "fantasy",
          shader: "phoenix"
        }
      ]
    },
    {
      id: "funny",
      name: "Funny",
      icon: "😄",
      items: [
        {
          id: "big-smile",
          name: "Big Smile",
          tag: "Cartoon · Mega Grin",
          thumb: "/assets/images/portrait_animal_cute_1790869479667.jpg",
          color: "#eab308",
          type: "funny",
          shader: "big-smile"
        },
        {
          id: "giggle-eyes",
          name: "Giggle Eyes",
          tag: "Goofy · Bulging Eyes",
          thumb: "/assets/images/portrait_fantasy_neon_1790869462964.jpg",
          color: "#06b6d4",
          type: "funny",
          shader: "giggle-eyes"
        },
        {
          id: "clown",
          name: "Clown",
          tag: "Party · Red Nose & Wig",
          thumb: "/assets/images/portrait_halloween_zombie_1790869434119.jpg",
          color: "#ef4444",
          type: "funny",
          shader: "clown"
        },
        {
          id: "alien-head",
          name: "Alien Head",
          tag: "Space · Big Green Eyes",
          thumb: "/assets/images/portrait_fantasy_neon_1790869462964.jpg",
          color: "#84cc16",
          type: "funny",
          shader: "alien"
        },
        {
          id: "mustachio",
          name: "Mustachio",
          tag: "Vintage · Monocle",
          thumb: "/assets/images/portrait_halloween_zombie_1790869434119.jpg",
          color: "#d97706",
          type: "funny",
          shader: "mustachio"
        },
        {
          id: "duck-face",
          name: "Duck Face",
          tag: "Meme · Quack Beak",
          thumb: "/assets/images/portrait_animal_cute_1790869479667.jpg",
          color: "#f59e0b",
          type: "funny",
          shader: "duck"
        },
        {
          id: "chubby-cheeks",
          name: "Chubby Cheeks",
          tag: "Cute · Puffed Acorn",
          thumb: "/assets/images/portrait_animal_cute_1790869479667.jpg",
          color: "#ec4899",
          type: "funny",
          shader: "chubby"
        },
        {
          id: "crying-river",
          name: "Drama Tears",
          tag: "Drama · Water Fountains",
          thumb: "/assets/images/portrait_fantasy_neon_1790869462964.jpg",
          color: "#0284c7",
          type: "funny",
          shader: "tears"
        },
        {
          id: "dizzy-stars",
          name: "Dizzy Stars",
          tag: "Drunk · Orbiting Stars",
          thumb: "/assets/images/portrait_fantasy_neon_1790869462964.jpg",
          color: "#eab308",
          type: "funny",
          shader: "dizzy"
        },
        {
          id: "pixel-8bit",
          name: "Pixel 8-Bit",
          tag: "Retro · Arcade Face",
          thumb: "/assets/images/portrait_fantasy_neon_1790869462964.jpg",
          color: "#10b981",
          type: "funny",
          shader: "pixel"
        }
      ]
    },
    {
      id: "volcanic-lava",
      name: "Volcanic Lava",
      icon: "🌋",
      items: [
        {
          id: "molten-core",
          name: "Molten Core",
          tag: "Volcanic · Magma Fissures",
          thumb: "/assets/images/portrait_volcanic_lava_1790869447484.jpg",
          color: "#ff4500",
          type: "volcanic",
          shader: "volcanic"
        },
        {
          id: "lava-eruption",
          name: "Lava Eruption",
          tag: "Animated · Fire Eruption",
          thumb: "/assets/images/portrait_volcanic_lava_1790869447484.jpg",
          color: "#dc2626",
          type: "volcanic",
          shader: "eruption"
        },
        {
          id: "obsidian-golem",
          name: "Obsidian Golem",
          tag: "Stone · Magma Veins",
          thumb: "/assets/images/portrait_volcanic_lava_1790869447484.jpg",
          color: "#451a03",
          type: "volcanic",
          shader: "obsidian"
        },
        {
          id: "magma-flow",
          name: "Magma Flow",
          tag: "Fluid · Cascading Lava",
          thumb: "/assets/images/portrait_volcanic_lava_1790869447484.jpg",
          color: "#f97316",
          type: "volcanic",
          shader: "magma"
        },
        {
          id: "ash-cloud",
          name: "Ash Cloud",
          tag: "Atmospheric · Fire Storm",
          thumb: "/assets/images/portrait_volcanic_lava_1790869447484.jpg",
          color: "#78350f",
          type: "volcanic",
          shader: "ash"
        },
        {
          id: "inferno-crown",
          name: "Inferno Crown",
          tag: "Fire · Magma Horns",
          thumb: "/assets/images/portrait_volcanic_lava_1790869447484.jpg",
          color: "#ea580c",
          type: "volcanic",
          shader: "inferno"
        },
        {
          id: "lava-geyser",
          name: "Lava Geyser",
          tag: "Burst · Thermal Jets",
          thumb: "/assets/images/portrait_volcanic_lava_1790869447484.jpg",
          color: "#f59e0b",
          type: "volcanic",
          shader: "geyser"
        },
        {
          id: "basalt-titan",
          name: "Basalt Titan",
          tag: "Armored · Volcanic Rock",
          thumb: "/assets/images/portrait_volcanic_lava_1790869447484.jpg",
          color: "#1e293b",
          type: "volcanic",
          shader: "basalt"
        },
        {
          id: "fire-elemental",
          name: "Fire Elemental",
          tag: "Elemental · Pure Flame",
          thumb: "/assets/images/portrait_volcanic_lava_1790869447484.jpg",
          color: "#ef4444",
          type: "volcanic",
          shader: "elemental"
        },
        {
          id: "hellfire-mask",
          name: "Hellfire Mask",
          tag: "Demonic · Burning Eyes",
          thumb: "/assets/images/portrait_volcanic_lava_1790869447484.jpg",
          color: "#b91c1c",
          type: "volcanic",
          shader: "hellfire"
        }
      ]
    }
  ];

  // Studio State
  const StudioState = {
    activeCategory: "all",
    activeMode: "effects",
    activeFilterId: "zombie",
    activeFilter: ER_CATEGORIES[0].items[0],
    isFaceFilterActive: true,
    isAnimationActive: true,
    filterStrength: 0.8,
    isCameraRunning: false,
    zoomLevel: 1.0,
    mediaStream: null,
    embers: [],
    frameIndex: 0
  };

  // Pre-generate Volcanic Embers particles
  for (let i = 0; i < 40; i++) {
    StudioState.embers.push({
      x: Math.random(),
      y: Math.random(),
      size: 1.5 + Math.random() * 3.5,
      speedY: 0.002 + Math.random() * 0.005,
      speedX: (Math.random() - 0.5) * 0.002,
      opacity: 0.3 + Math.random() * 0.7,
      glow: 4 + Math.random() * 8,
      hue: 15 + Math.random() * 30 // orange/red
    });
  }

  // Pre-load showcase image elements
  const imageCache = new Map();
  function getImage(src) {
    if (!imageCache.has(src)) {
      const img = new Image();
      img.src = src;
      imageCache.set(src, img);
    }
    return imageCache.get(src);
  }

  // Preload primary portraits
  getImage("/assets/images/portrait_halloween_zombie_1790869434119.jpg");
  getImage("/assets/images/portrait_volcanic_lava_1790869447484.jpg");
  getImage("/assets/images/portrait_fantasy_neon_1790869462964.jpg");
  getImage("/assets/images/portrait_animal_cute_1790869479667.jpg");

  // DOM Elements
  let videoEl, canvasEl, ctx;

  function initStudio() {
    videoEl = document.getElementById("cameraVideo");
    canvasEl = document.getElementById("cameraCanvas");
    if (!canvasEl) return;
    ctx = canvasEl.getContext("2d", { willReadFrequently: true });

    renderCategoriesAndCards();
    bindStudioControls();
    startCanvasLoop();
  }

  // Render the category pills & 10/10 cards
  function renderCategoriesAndCards() {
    const pillsContainer = document.getElementById("studioCategoryPills");
    const sectionsContainer = document.getElementById("studioSectionsContainer");
    if (!pillsContainer || !sectionsContainer) return;

    // 1. Render Category Filter Pills
    let pillsHtml = `
      <button type="button" class="studio-cat-pill ${StudioState.activeCategory === 'all' ? 'active' : ''}" data-cat-id="all">
        All
      </button>
    `;
    ER_CATEGORIES.forEach(cat => {
      pillsHtml += `
        <button type="button" class="studio-cat-pill ${StudioState.activeCategory === cat.id ? 'active' : ''}" data-cat-id="${cat.id}">
          <span class="cat-pill-icon">${cat.icon}</span>
          <span>${cat.name}</span>
        </button>
      `;
    });
    pillsContainer.innerHTML = pillsHtml;

    // Attach pill click events
    pillsContainer.querySelectorAll(".studio-cat-pill").forEach(btn => {
      btn.addEventListener("click", () => {
        StudioState.activeCategory = btn.getAttribute("data-cat-id");
        renderCategoriesAndCards();
      });
    });

    // 2. Render Categories Sections & Cards
    let sectionsHtml = "";
    ER_CATEGORIES.forEach(cat => {
      if (StudioState.activeCategory !== "all" && StudioState.activeCategory !== cat.id) {
        return;
      }

      sectionsHtml += `
        <div class="studio-category-block" data-category="${cat.id}">
          <div class="studio-category-header">
            <div class="studio-category-title">
              <span class="cat-header-icon">${cat.icon}</span>
              <h3>${cat.name}</h3>
              <span class="cat-item-count">10/10</span>
            </div>
            <button type="button" class="studio-see-all-btn" data-cat-id="${cat.id}">
              See All →
            </button>
          </div>

          <div class="studio-cards-grid">
            ${cat.items.map(item => {
              const isActive = StudioState.activeFilterId === item.id;
              return `
                <div class="studio-effect-card ${isActive ? 'active' : ''}" data-filter-id="${item.id}" data-category="${cat.id}">
                  <div class="card-thumb-wrap">
                    <img src="${item.thumb}" alt="${item.name}" class="card-thumb-img" onerror="this.src='/assets/logo.png'">
                    ${isActive ? '<div class="card-active-check" aria-hidden="true">✓</div>' : ''}
                    <div class="card-color-stripe" style="background:${item.color};"></div>
                  </div>
                  <div class="card-info">
                    <h4 class="card-title">${item.name}</h4>
                    <span class="card-tag">${item.tag}</span>
                  </div>
                </div>
              `;
            }).join("")}
          </div>
        </div>
      `;
    });

    sectionsContainer.innerHTML = sectionsHtml;

    // Attach See All button clicks
    sectionsContainer.querySelectorAll(".studio-see-all-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        StudioState.activeCategory = btn.getAttribute("data-cat-id");
        renderCategoriesAndCards();
      });
    });

    // Attach Card Selection clicks
    sectionsContainer.querySelectorAll(".studio-effect-card").forEach(card => {
      card.addEventListener("click", () => {
        const filterId = card.getAttribute("data-filter-id");
        selectFilter(filterId);
      });
    });
  }

  // Select a filter
  function selectFilter(filterId) {
    let found = null;
    for (const cat of ER_CATEGORIES) {
      const match = cat.items.find(i => i.id === filterId);
      if (match) {
        found = match;
        break;
      }
    }
    if (!found) return;

    StudioState.activeFilterId = found.id;
    StudioState.activeFilter = found;

    // Update active badges in DOM
    document.querySelectorAll(".studio-effect-card").forEach(c => {
      const isCur = c.getAttribute("data-filter-id") === found.id;
      c.classList.toggle("active", isCur);
      const check = c.querySelector(".card-active-check");
      if (isCur && !check) {
        const checkDiv = document.createElement("div");
        checkDiv.className = "card-active-check";
        checkDiv.textContent = "✓";
        c.querySelector(".card-thumb-wrap").appendChild(checkDiv);
      } else if (!isCur && check) {
        check.remove();
      }
    });

    // Update viewport indicators
    const overlayCatPill = document.getElementById("viewportCategoryPill");
    if (overlayCatPill) {
      if (found.type === "volcanic") {
        overlayCatPill.innerHTML = `<span>🌋 Volcanic Lava</span> <span class="live-pulse-badge">LIVE 🟢</span>`;
      } else if (found.type === "halloween") {
        overlayCatPill.innerHTML = `<span>🎃 Halloween</span> <span class="live-pulse-badge">LIVE 🟢</span>`;
      } else if (found.type === "animal") {
        overlayCatPill.innerHTML = `<span>🐾 Animals</span> <span class="live-pulse-badge">LIVE 🟢</span>`;
      } else if (found.type === "fantasy") {
        overlayCatPill.innerHTML = `<span>✨ Fantasy</span> <span class="live-pulse-badge">LIVE 🟢</span>`;
      } else {
        overlayCatPill.innerHTML = `<span>😄 Funny</span> <span class="live-pulse-badge">LIVE 🟢</span>`;
      }
    }

    const overlayStatusPill = document.getElementById("viewportStatusPill");
    if (overlayStatusPill) {
      overlayStatusPill.innerHTML = `<span class="status-dot-active">🟢</span> Face Filter · ${found.name}`;
    }

    const statusTickerText = document.getElementById("statusTickerText");
    if (statusTickerText) {
      statusTickerText.innerHTML = `✨ <strong>${found.name}</strong> animation is active! <span class="live-dot">🟢</span>`;
    }
  }

  // Bind controls (switches, sliders, capture, reset)
  function bindStudioControls() {
    // 1. Studio Mode Sidebar Switcher (Effects, Filters, Background, Animations, Settings)
    document.querySelectorAll(".studio-mode-rail-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        document.querySelectorAll(".studio-mode-rail-btn").forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        StudioState.activeMode = btn.getAttribute("data-mode");

        // Sync with top mode tabs in right panel
        document.querySelectorAll(".studio-mode-tab-btn").forEach(t => {
          t.classList.toggle("active", t.getAttribute("data-mode") === StudioState.activeMode);
        });

        // If clicking Volcanic or Background or Animations, adjust filter accordingly
        if (StudioState.activeMode === "background") {
          selectFilter("magma-flow");
        } else if (StudioState.activeMode === "animations") {
          selectFilter("lava-eruption");
        }
      });
    });

    // Top panel mode tabs
    document.querySelectorAll(".studio-mode-tab-btn").forEach(tab => {
      tab.addEventListener("click", () => {
        document.querySelectorAll(".studio-mode-tab-btn").forEach(t => t.classList.remove("active"));
        tab.classList.add("active");
        StudioState.activeMode = tab.getAttribute("data-mode");

        // Sync with left sidebar rail
        document.querySelectorAll(".studio-mode-rail-btn").forEach(b => {
          b.classList.toggle("active", b.getAttribute("data-mode") === StudioState.activeMode);
        });
      });
    });

    // 2. Face Filter Toggle Switch
    const faceFilterToggle = document.getElementById("toggleFaceFilterSwitch");
    if (faceFilterToggle) {
      faceFilterToggle.addEventListener("change", (e) => {
        StudioState.isFaceFilterActive = e.target.checked;
      });
    }

    // 3. Animation Toggle Switch
    const animationToggle = document.getElementById("toggleAnimationSwitch");
    if (animationToggle) {
      animationToggle.addEventListener("change", (e) => {
        StudioState.isAnimationActive = e.target.checked;
      });
    }

    // 4. Strength Slider
    const strengthSlider = document.getElementById("studioStrengthSlider");
    const strengthValText = document.getElementById("studioStrengthVal");
    if (strengthSlider) {
      strengthSlider.addEventListener("input", (e) => {
        const val = parseInt(e.target.value, 10);
        StudioState.filterStrength = val / 100;
        if (strengthValText) strengthValText.textContent = `${val}%`;
      });
    }

    // 5. Capture Snapshot Button
    const captureBtn = document.getElementById("studioCaptureBtn");
    if (captureBtn) {
      captureBtn.addEventListener("click", takeSnapshot);
    }

    // 6. Reset Button
    const resetBtn = document.getElementById("studioResetBtn");
    if (resetBtn) {
      resetBtn.addEventListener("click", () => {
        selectFilter("zombie");
        StudioState.filterStrength = 0.8;
        if (strengthSlider) strengthSlider.value = 80;
        if (strengthValText) strengthValText.textContent = "80%";
        if (faceFilterToggle) faceFilterToggle.checked = true;
        if (animationToggle) animationToggle.checked = true;
        StudioState.isFaceFilterActive = true;
        StudioState.isAnimationActive = true;
      });
    }

    // 7. Start / Stop Camera button on viewport
    const startCamBtn = document.getElementById("startCameraToggleBtn");
    if (startCamBtn) {
      startCamBtn.addEventListener("click", toggleCameraStream);
    }

    // 8. Zoom level toggle
    const zoomBtn = document.getElementById("studioZoomBtn");
    if (zoomBtn) {
      zoomBtn.addEventListener("click", () => {
        const levels = [1.0, 1.5, 2.0];
        const nextIdx = (levels.indexOf(StudioState.zoomLevel) + 1) % levels.length;
        StudioState.zoomLevel = levels[nextIdx];
        zoomBtn.querySelector("span").textContent = `${StudioState.zoomLevel.toFixed(1)}x`;
      });
    }

    // 9. Floating action buttons on viewport
    const reticleBtn = document.getElementById("studioReticleBtn");
    if (reticleBtn) {
      reticleBtn.addEventListener("click", () => reticleBtn.classList.toggle("active"));
    }
    const magicGlowBtn = document.getElementById("studioMagicGlowBtn");
    if (magicGlowBtn) {
      magicGlowBtn.addEventListener("click", () => magicGlowBtn.classList.toggle("active"));
    }
    const wandBtn = document.getElementById("studioWandBtn");
    if (wandBtn) {
      wandBtn.addEventListener("click", () => wandBtn.classList.toggle("active"));
    }
    const meshBtn = document.getElementById("studioMeshBtn");
    if (meshBtn) {
      meshBtn.addEventListener("click", () => meshBtn.classList.toggle("active"));
    }
  }

  // Toggle Camera
  async function toggleCameraStream() {
    if (StudioState.isCameraRunning) {
      if (StudioState.mediaStream) {
        StudioState.mediaStream.getTracks().forEach(t => t.stop());
        StudioState.mediaStream = null;
      }
      StudioState.isCameraRunning = false;
      const btn = document.getElementById("startCameraToggleBtn");
      if (btn) btn.innerHTML = `<span>📷 Start Camera</span>`;
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: "user" },
          audio: false
        });
        StudioState.mediaStream = stream;
        videoEl.srcObject = stream;
        await videoEl.play();
        StudioState.isCameraRunning = true;
        const btn = document.getElementById("startCameraToggleBtn");
        if (btn) btn.innerHTML = `<span>⏹ Stop Camera</span>`;
      } catch (err) {
        console.warn("Camera access denied or unavailable, using high-resolution interactive demo stage:", err);
      }
    }
  }

  // Snapshot flash & modal
  function takeSnapshot() {
    // Flash effect
    const flash = document.createElement("div");
    flash.className = "camera-shutter-flash";
    document.body.appendChild(flash);
    setTimeout(() => flash.remove(), 400);

    // Save image from canvas
    const dataUrl = canvasEl.toDataURL("image/png");
    const modal = document.getElementById("snapshotModal");
    const modalImg = document.getElementById("snapshotImg");
    const downloadBtn = document.getElementById("downloadSnapshotBtn");

    if (modal && modalImg) {
      modalImg.src = dataUrl;
      if (downloadBtn) downloadBtn.href = dataUrl;
      modal.style.display = "flex";
    }
  }

  // Canvas Render Loop: Real-time Volcanic Lava & Character Shaders
  function startCanvasLoop() {
    function loop() {
      StudioState.frameIndex++;
      renderFrame();
      requestAnimationFrame(loop);
    }
    requestAnimationFrame(loop);
  }

  function renderFrame() {
    if (!canvasEl || !ctx) return;

    const w = canvasEl.width = 960;
    const h = canvasEl.height = 720;
    const time = StudioState.frameIndex * 0.03;
    const strength = StudioState.filterStrength;

    // 1. Draw Base Source: Real webcam or HD portrait demo image
    ctx.save();
    if (StudioState.zoomLevel > 1.0) {
      const zoom = StudioState.zoomLevel;
      ctx.translate(w / 2, h / 2);
      ctx.scale(zoom, zoom);
      ctx.translate(-w / 2, -h / 2);
    }

    if (StudioState.isCameraRunning && videoEl && videoEl.readyState >= 2) {
      // Mirror front camera
      ctx.translate(w, 0);
      ctx.scale(-1, 1);
      ctx.drawImage(videoEl, 0, 0, w, h);
    } else {
      // Draw Demo Portrait matching the active category
      let demoImg;
      if (StudioState.activeFilter.type === "volcanic" || StudioState.activeFilter.shader === "volcanic") {
        demoImg = getImage("/assets/images/portrait_volcanic_lava_1790869447484.jpg");
      } else if (StudioState.activeFilter.type === "fantasy") {
        demoImg = getImage("/assets/images/portrait_fantasy_neon_1790869462964.jpg");
      } else if (StudioState.activeFilter.type === "animal") {
        demoImg = getImage("/assets/images/portrait_animal_cute_1790869479667.jpg");
      } else {
        demoImg = getImage("/assets/images/portrait_halloween_zombie_1790869434119.jpg");
      }

      if (demoImg && demoImg.complete && demoImg.naturalWidth > 0) {
        // Draw centered and cover
        ctx.drawImage(demoImg, 0, 0, w, h);
      } else {
        // Aesthetic fallback studio canvas
        ctx.fillStyle = "#090d16";
        ctx.fillRect(0, 0, w, h);
      }
    }
    ctx.restore();

    // 2. Render Real-time Shaders & Volcanic Lava Effects
    const filter = StudioState.activeFilter;

    // VOLCANIC LAVA EFFECT
    if (filter.type === "volcanic" || filter.id.includes("lava") || filter.id.includes("volcanic") || filter.id === "molten-core") {
      renderVolcanicLavaShader(w, h, time, strength);
    } else if (filter.type === "halloween") {
      renderHalloweenShader(w, h, time, strength, filter.shader);
    } else if (filter.type === "animal") {
      renderAnimalShader(w, h, time, strength, filter.shader);
    } else if (filter.type === "fantasy") {
      renderFantasyShader(w, h, time, strength, filter.shader);
    } else if (filter.type === "funny") {
      renderFunnyShader(w, h, time, strength, filter.shader);
    }

    // 3. Floating Embers (if Animation toggle is ON or Volcanic active)
    if (StudioState.isAnimationActive) {
      renderFloatingEmbers(w, h, time);
    }
  }

  // --- Volcanic Lava Shader Effect ---
  function renderVolcanicLavaShader(w, h, time, strength) {
    ctx.save();

    // Heat haze & ambient magma glow
    const magmaGlow = ctx.createRadialGradient(w * 0.5, h * 0.7, 50, w * 0.5, h * 0.7, w * 0.6);
    magmaGlow.addColorStop(0, `rgba(255, 69, 0, ${0.35 * strength})`);
    magmaGlow.addColorStop(0.5, `rgba(220, 38, 38, ${0.2 * strength})`);
    magmaGlow.addColorStop(1, "transparent");
    ctx.fillStyle = magmaGlow;
    ctx.fillRect(0, 0, w, h);

    if (StudioState.isFaceFilterActive) {
      // Molten magma fissures & face cracks
      ctx.lineWidth = 3.5;
      ctx.strokeStyle = `rgba(255, 140, 0, ${0.85 * strength})`;
      ctx.shadowColor = "#ff4500";
      ctx.shadowBlur = 15;

      const centerX = w * 0.5;
      const centerY = h * 0.42;

      // Draw branching fissures radiating from cheek/forehead
      ctx.beginPath();
      // Right cheek fissure
      ctx.moveTo(centerX + 60, centerY + 30);
      ctx.lineTo(centerX + 110 + Math.sin(time * 2) * 4, centerY + 60);
      ctx.lineTo(centerX + 140, centerY + 110);
      ctx.lineTo(centerX + 170, centerY + 140);
      // Left cheek fissure
      ctx.moveTo(centerX - 60, centerY + 30);
      ctx.lineTo(centerX - 100 - Math.cos(time * 2) * 4, centerY + 65);
      ctx.lineTo(centerX - 135, centerY + 115);
      ctx.lineTo(centerX - 165, centerY + 150);
      // Forehead magma crack
      ctx.moveTo(centerX - 20, centerY - 80);
      ctx.lineTo(centerX - 35, centerY - 120);
      ctx.lineTo(centerX - 15, centerY - 160);
      ctx.stroke();

      // Golden inner molten core of the cracks
      ctx.lineWidth = 1.5;
      ctx.strokeStyle = `rgba(255, 230, 100, ${0.95 * strength})`;
      ctx.shadowBlur = 8;
      ctx.stroke();

      // Glowing Magma Eyes
      const eyeGlowRadius = 14 + Math.sin(time * 3) * 2;
      const leftEyeX = centerX - 55;
      const rightEyeX = centerX + 55;
      const eyeY = centerY - 10;

      [leftEyeX, rightEyeX].forEach(eyeX => {
        const eyeGrad = ctx.createRadialGradient(eyeX, eyeY, 2, eyeX, eyeY, eyeGlowRadius);
        eyeGrad.addColorStop(0, `rgba(255, 240, 120, ${0.9 * strength})`);
        eyeGrad.addColorStop(0.4, `rgba(255, 69, 0, ${0.75 * strength})`);
        eyeGrad.addColorStop(1, "transparent");
        ctx.fillStyle = eyeGrad;
        ctx.beginPath();
        ctx.arc(eyeX, eyeY, eyeGlowRadius, 0, Math.PI * 2);
        ctx.fill();
      });
    }

    // Dripping molten magma streams
    if (StudioState.isAnimationActive) {
      ctx.fillStyle = `rgba(255, 69, 0, ${0.7 * strength})`;
      for (let i = 0; i < 5; i++) {
        const dripX = (w * 0.3) + (i * (w * 0.1));
        const dripY = (h * 0.6) + ((time * 60 + i * 40) % (h * 0.4));
        ctx.beginPath();
        ctx.arc(dripX, dripY, 3 + (i % 3), 0, Math.PI * 2);
        ctx.fill();
      }
    }

    ctx.restore();
  }

  // --- Halloween Spooky Shader ---
  function renderHalloweenShader(w, h, time, strength, shaderType) {
    ctx.save();
    const centerX = w * 0.5;
    const centerY = h * 0.42;

    // Dark gothic vignette
    const vignette = ctx.createRadialGradient(centerX, centerY, w * 0.2, centerX, centerY, w * 0.65);
    vignette.addColorStop(0, "transparent");
    vignette.addColorStop(0.7, `rgba(10, 4, 18, ${0.45 * strength})`);
    vignette.addColorStop(1, `rgba(3, 1, 8, ${0.85 * strength})`);
    ctx.fillStyle = vignette;
    ctx.fillRect(0, 0, w, h);

    if (StudioState.isFaceFilterActive) {
      // Infected glowing red or green eyes
      const eyeColor = shaderType === "witch" ? "rgba(168, 85, 247," : "rgba(239, 68, 68,";
      const leftEyeX = centerX - 55;
      const rightEyeX = centerX + 55;
      const eyeY = centerY - 10;

      [leftEyeX, rightEyeX].forEach(eyeX => {
        const rad = 12 + Math.sin(time * 4) * 2;
        const grad = ctx.createRadialGradient(eyeX, eyeY, 2, eyeX, eyeY, rad);
        grad.addColorStop(0, `${eyeColor} ${0.95 * strength})`);
        grad.addColorStop(0.6, `${eyeColor} ${0.4 * strength})`);
        grad.addColorStop(1, "transparent");
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(eyeX, eyeY, rad, 0, Math.PI * 2);
        ctx.fill();
      });

      // Blood scratches / scars
      ctx.strokeStyle = `rgba(153, 27, 27, ${0.8 * strength})`;
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(centerX - 80, centerY + 20);
      ctx.lineTo(centerX - 110, centerY + 45);
      ctx.moveTo(centerX - 75, centerY + 25);
      ctx.lineTo(centerX - 105, centerY + 50);
      ctx.moveTo(centerX + 70, centerY - 50);
      ctx.lineTo(centerX + 90, centerY - 25);
      ctx.stroke();
    }

    // Flying bats animation
    if (StudioState.isAnimationActive) {
      ctx.fillStyle = `rgba(15, 23, 42, ${0.85 * strength})`;
      for (let i = 0; i < 3; i++) {
        const batX = (w * 0.15) + ((time * 80 + i * 180) % (w * 0.8));
        const batY = (h * 0.18) + Math.sin(time * 3 + i) * 30;
        const wing = Math.sin(time * 15 + i) * 8;

        ctx.beginPath();
        ctx.moveTo(batX, batY);
        ctx.lineTo(batX - 12, batY - 6 - wing);
        ctx.lineTo(batX - 6, batY + 4);
        ctx.lineTo(batX, batY);
        ctx.lineTo(batX + 6, batY + 4);
        ctx.lineTo(batX + 12, batY - 6 - wing);
        ctx.closePath();
        ctx.fill();
      }
    }
    ctx.restore();
  }

  // --- Animal Cute Shader ---
  function renderAnimalShader(w, h, time, strength, shaderType) {
    if (!StudioState.isFaceFilterActive) return;
    ctx.save();
    const centerX = w * 0.5;
    const centerY = h * 0.42;

    // Puppy / Cat Ears
    const earY = centerY - 140;
    const earBounce = Math.sin(time * 4) * 4;

    ctx.fillStyle = shaderType === "cat" ? "#f472b6" : "#f59e0b";
    ctx.strokeStyle = "rgba(0,0,0,0.2)";
    ctx.lineWidth = 3;

    // Left Ear
    ctx.beginPath();
    ctx.ellipse(centerX - 120, earY + earBounce, 30, 60, -0.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Right Ear
    ctx.beginPath();
    ctx.ellipse(centerX + 120, earY + earBounce, 30, 60, 0.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Cute Nose & Whiskers
    ctx.fillStyle = "#1e293b";
    ctx.beginPath();
    ctx.ellipse(centerX, centerY + 50, 14, 10, 0, 0, Math.PI * 2);
    ctx.fill();

    // Whiskers
    ctx.strokeStyle = "rgba(255,255,255,0.7)";
    ctx.lineWidth = 2;
    [-1, 1].forEach(dir => {
      ctx.beginPath();
      ctx.moveTo(centerX + (dir * 25), centerY + 48);
      ctx.lineTo(centerX + (dir * 75), centerY + 42);
      ctx.moveTo(centerX + (dir * 25), centerY + 54);
      ctx.lineTo(centerX + (dir * 80), centerY + 56);
      ctx.stroke();
    });

    // Cute pink blush on cheeks
    const blushGradL = ctx.createRadialGradient(centerX - 80, centerY + 55, 5, centerX - 80, centerY + 55, 30);
    blushGradL.addColorStop(0, `rgba(244, 114, 182, ${0.6 * strength})`);
    blushGradL.addColorStop(1, "transparent");
    ctx.fillStyle = blushGradL;
    ctx.beginPath();
    ctx.arc(centerX - 80, centerY + 55, 30, 0, Math.PI * 2);
    ctx.fill();

    const blushGradR = ctx.createRadialGradient(centerX + 80, centerY + 55, 5, centerX + 80, centerY + 55, 30);
    blushGradR.addColorStop(0, `rgba(244, 114, 182, ${0.6 * strength})`);
    blushGradR.addColorStop(1, "transparent");
    ctx.fillStyle = blushGradR;
    ctx.beginPath();
    ctx.arc(centerX + 80, centerY + 55, 30, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  // --- Fantasy & Cyber Shader ---
  function renderFantasyShader(w, h, time, strength, shaderType) {
    ctx.save();
    const centerX = w * 0.5;
    const centerY = h * 0.42;

    if (StudioState.isFaceFilterActive) {
      // Cyber Neon Visor / Glasses
      ctx.lineWidth = 4;
      ctx.strokeStyle = `rgba(6, 182, 212, ${0.9 * strength})`;
      ctx.shadowColor = "#06b6d4";
      ctx.shadowBlur = 16;

      ctx.beginPath();
      ctx.roundRect(centerX - 100, centerY - 25, 200, 40, 10);
      ctx.stroke();

      const visorGrad = ctx.createLinearGradient(centerX - 100, centerY - 25, centerX + 100, centerY + 15);
      visorGrad.addColorStop(0, `rgba(6, 182, 212, ${0.4 * strength})`);
      visorGrad.addColorStop(0.5, `rgba(168, 85, 247, ${0.45 * strength})`);
      visorGrad.addColorStop(1, `rgba(6, 182, 212, ${0.4 * strength})`);
      ctx.fillStyle = visorGrad;
      ctx.fill();
    }

    // Cosmic starlight particles
    if (StudioState.isAnimationActive) {
      for (let i = 0; i < 15; i++) {
        const starX = (w * 0.1) + ((i * 123 + time * 40) % (w * 0.8));
        const starY = (h * 0.1) + ((i * 87) % (h * 0.6));
        const starSize = 2 + Math.sin(time * 5 + i) * 1.5;

        ctx.fillStyle = `rgba(168, 85, 247, ${0.8 * strength})`;
        ctx.shadowColor = "#c084fc";
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.arc(starX, starY, Math.max(1, starSize), 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.restore();
  }

  // --- Funny Cartoon Shader ---
  function renderFunnyShader(w, h, time, strength) {
    if (!StudioState.isFaceFilterActive) return;
    ctx.save();
    const centerX = w * 0.5;
    const centerY = h * 0.42;

    // Red clown / goofy nose
    ctx.fillStyle = `rgba(239, 68, 68, ${0.95 * strength})`;
    ctx.shadowColor = "#dc2626";
    ctx.shadowBlur = 10;
    ctx.beginPath();
    ctx.arc(centerX, centerY + 45, 22, 0, Math.PI * 2);
    ctx.fill();

    // Monocle or funny glasses
    ctx.strokeStyle = `rgba(245, 158, 11, ${0.9 * strength})`;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(centerX - 55, centerY - 10, 32, 0, Math.PI * 2);
    ctx.stroke();

    // Curly Mustache
    ctx.fillStyle = `rgba(30, 41, 59, ${0.9 * strength})`;
    ctx.beginPath();
    ctx.ellipse(centerX - 35, centerY + 80, 40, 14, -0.2, 0, Math.PI * 2);
    ctx.ellipse(centerX + 35, centerY + 80, 40, 14, 0.2, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  // Floating embers physics loop
  function renderFloatingEmbers(w, h, time) {
    ctx.save();
    StudioState.embers.forEach(p => {
      p.y -= p.speedY;
      p.x += p.speedX;
      if (p.y < 0) {
        p.y = 1;
        p.x = Math.random();
      }
      if (p.x < 0) p.x = 1;
      if (p.x > 1) p.x = 0;

      const px = p.x * w;
      const py = p.y * h;
      const opacity = p.opacity * (0.6 + Math.sin(time * 3 + p.x * 10) * 0.4);

      ctx.fillStyle = `hsla(${p.hue}, 100%, 60%, ${opacity})`;
      ctx.shadowColor = `hsla(${p.hue}, 100%, 50%, 0.8)`;
      ctx.shadowBlur = p.glow;
      ctx.beginPath();
      ctx.arc(px, py, p.size, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.restore();
  }

  // Initialize once DOM is ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initStudio);
  } else {
    initStudio();
  }

  // Expose to window for testing
  window.WebZoneERStudio = {
    state: StudioState,
    categories: ER_CATEGORIES,
    selectFilter: selectFilter
  };
})();
