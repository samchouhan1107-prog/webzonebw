/* ==========================================================
   WEBZONEBW-ER STUDIO — ENHANCED FILTER ENVIRONMENT SYSTEM
   Upgrading the existing filter engine with comprehensive
   environment support while preserving UI exactly.
   
   Architecture: Filter → Environment → Background → Atmosphere → Frame → Animation
   ========================================================== */

"use strict";

// Enhanced Filter Configuration with Environment Support
const ENHANCED_FILTER_CONFIGS = [
  // 👤 FACE AR LENSES with complete environments
  {
    id: "sunglasses",
    name: "Designer Aviators",
    icon: "🕶️",
    category: "face",
    target: "face",
    desc: "Ray-Ban aviator sunglasses with reflective lens shimmer",
    environment: {
      background: "studio",
      atmosphere: { fog: 0, particles: "none", lighting: "warm-top" },
      frame: "soft",
      animation: "subtle-glow"
    },
    strength: 1.0
  },

  {
    id: "halo",
    name: "Angel Halo",
    icon: "👑",
    isPremium: true,
    category: "face",
    target: "face",
    desc: "Floating neon gold angelic halo with sacred geometry",
    environment: {
      background: "fantasy",
      atmosphere: { fog: 0.15, particles: "sparkles", lighting: "bloom" },
      frame: "soft",
      animation: "floating-halo"
    },
    strength: 1.0
  },

  {
    id: "goldenhour",
    name: "Golden Hour",
    icon: "🌟",
    category: "face",
    target: "face",
    desc: "Warm California sunset rim light and golden skin glow",
    environment: {
      background: "portrait",
      atmosphere: { fog: 0.08, particles: "dust", lighting: "golden" },
      frame: "soft",
      animation: "warm-glow"
    },
    strength: 1.0
  },

  {
    id: "cartoon",
    name: "Anime Cel",
    icon: "🎨",
    category: "face",
    target: "face",
    desc: "High-contrast comic outline with vibrant cel shading",
    environment: {
      background: "studio",
      atmosphere: { fog: 0, particles: "none", lighting: "studio" },
      frame: "cel",
      animation: "cel-shimmer"
    },
    strength: 1.0
  },

  // 🌍 SCENE & ATMOSPHERIC SHADERS with complete environments
  {
    id: "noir",
    name: "Leica Noir",
    icon: "🖤",
    category: "scene",
    target: "scene",
    desc: "High-contrast silver gelatin black-and-white 35mm film",
    environment: {
      background: "cinema",
      atmosphere: { fog: 0.05, particles: "grain", lighting: "noir" },
      frame: "letterbox",
      animation: "film-grain"
    },
    strength: 1.0
  },

  {
    id: "vintage90s",
    name: "Retro 90s",
    icon: "🎞️",
    category: "scene",
    target: "scene",
    desc: "Warm Kodak Portra analog grain with soft vignette",
    environment: {
      background: "vintage",
      atmosphere: { fog: 0.12, particles: "vintage-dust", lighting: "warm" },
      frame: "soft-vignette",
      animation: "vintage-flicker"
    },
    strength: 1.0
  },

  {
    id: "cinematic",
    name: "35mm Film",
    icon: "🎬",
    category: "scene",
    target: "scene",
    desc: "Anamorphic widescreen teal & orange color grade",
    environment: {
      background: "cinema",
      atmosphere: { fog: 0.08, particles: "film-dust", lighting: "anamorphic" },
      frame: "letterbox",
      animation: "cinematic-breath"
    },
    strength: 1.0
  },

  {
    id: "glitch",
    name: "Digital Glitch FX",
    icon: "⚡",
    category: "scene",
    target: "scene",
    desc: "RGB channel chromatic aberration and scanline shifts",
    environment: {
      background: "digital",
      atmosphere: { fog: 0.15, particles: "digital-noise", lighting: "strobe" },
      frame: "tech",
      animation: "glitch-distortion"
    },
    strength: 1.0
  },

  {
    id: "space",
    name: "Deep Space Explorer",
    icon: "🚀",
    category: "scene",
    target: "scene",
    desc: "Starlight nebula cosmic aura with drifting stardust",
    environment: {
      background: "nebula",
      atmosphere: { fog: 0.25, particles: "stardust", lighting: "starfield" },
      frame: "tech",
      animation: "cosmic-drift"
    },
    strength: 1.0
  },

  {
    id: "cyberpunk",
    name: "Neon Cyberpunk",
    icon: "💡",
    category: "scene",
    target: "scene",
    desc: "Neon-lit cyberpunk city with rain and holograms",
    environment: {
      background: "cyber",
      atmosphere: { fog: 0.20, particles: "neon-rain", lighting: "neon-scan" },
      frame: "tech",
      animation: "cyber-grid"
    },
    strength: 1.0
  },

  // 🦴 POSE EFFECTS with complete environments
  {
    id: "ghost-pose",
    name: "Ghost Aura",
    icon: "👻",
    category: "pose",
    target: "pose",
    desc: "Spectral aura that flares with your real-time body movement",
    environment: {
      background: "spectral",
      atmosphere: { fog: 0.40, particles: "ectoplasm", lighting: "cold-bloom" },
      frame: "soft",
      animation: "spectral-flare"
    },
    strength: 1.0
  },

  {
    id: "pose-frame",
    name: "Pose Align",
    icon: "🧭",
    category: "pose",
    target: "pose",
    desc: "Live pose/frame alignment guides with face anchor and level meter",
    environment: {
      background: "studio",
      atmosphere: { fog: 0, particles: "guidelines", lighting: "studio" },
      frame: "guides",
      animation: "pulse-guides"
    },
    strength: 1.0
  },

  {
    id: "pumpkin-pose",
    name: "Pumpkin Pose",
    icon: "🎃",
    category: "pose",
    target: "pose",
    desc: "Halloween jack-o-lantern energy that bursts on body movement",
    environment: {
      background: "patch",
      atmosphere: { fog: 0.15, particles: "pumpkin-sparks", lighting: "lantern" },
      frame: "ember",
      animation: "pumpkin-burst"
    },
    strength: 1.0
  },

  {
    id: "witch-ritual",
    name: "Witch Ritual",
    icon: "🪄",
    isPremium: true,
    category: "pose",
    target: "pose",
    desc: "Halloween magic circle that charges with your pose energy",
    environment: {
      background: "witch",
      atmosphere: { fog: 0.32, particles: "magic-dust", lighting: "magic-glow" },
      frame: "magic-circle",
      animation: "ritual-charging"
    },
    strength: 1.0
  },

  // 🌌 VR EFFECTS with complete environments
  {
    id: "vr-nebula",
    name: "VR Nebula",
    icon: "🪐",
    category: "vr",
    target: "scene",
    desc: "Immersive VR nebula environment with parallax starfield",
    environment: {
      background: "nebula",
      atmosphere: { fog: 0.10, particles: "parallax-stars", lighting: "starfield" },
      frame: "vr-hud",
      animation: "vr-parallax"
    },
    strength: 1.0
  },

  {
    id: "haunted-forest",
    name: "Haunted Forest",
    icon: "🌲",
    isPremium: true,
    category: "vr",
    target: "scene",
    desc: "Immersive foggy Halloween forest environment with floating spirits",
    environment: {
      background: "forest",
      atmosphere: { fog: 0.35, particles: "floating-spirits", lighting: "moon-top" },
      frame: "organic",
      animation: "forest-wispers"
    },
    strength: 1.0
  },

  {
    id: "vr-cyberdeck",
    name: "VR Cyberdeck",
    icon: "🖥️",
    isPremium: true,
    category: "vr",
    target: "scene",
    desc: "Full VR headset HUD environment with live telemetry grid",
    environment: {
      background: "cyber",
      atmosphere: { fog: 0.06, particles: "data-streams", lighting: "holo-grid" },
      frame: "vr-hud",
      animation: "cyber-stream"
    },
    strength: 1.0
  },

  {
    id: "vr-mansion",
    name: "VR Haunted Manor",
    icon: "🏚️",
    isPremium: true,
    category: "vr",
    target: "scene",
    desc: "Halloween VR haunted manor environment with drifting phantoms",
    environment: {
      background: "manor",
      atmosphere: { fog: 0.35, particles: "drifting-phantoms", lighting: "storm-light" },
      frame: "organic",
      animation: "phantom-drift"
    },
    strength: 1.0
  },

  // 👻 GHOST EFFECTS with complete environments
  {
    id: "ghost-aura",
    name: "Ghost Aura",
    icon: "👻",
    category: "ghost",
    target: "face",
    desc: "Translucent spectral aura with ethereal glow",
    environment: {
      background: "spectral",
      atmosphere: { fog: 0.40, particles: "ectoplasm", lighting: "cold-bloom" },
      frame: "soft",
      animation: "spectral-pulse"
    },
    strength: 1.0
  },

  {
    id: "spirit-possess",
    name: "Spirit Possession",
    icon: "👻",
    category: "ghost",
    target: "face",
    desc: "Possessed ghost face with glowing eyes",
    environment: {
      background: "spectral",
      atmosphere: { fog: 0.45, particles: "possession-energy", lighting: "hellfire" },
      frame: "dark",
      animation: "possession-flare"
    },
    strength: 1.0
  },

  {
    id: "phantom-veil",
    name: "Phantom Veil",
    icon: "👻",
    category: "ghost",
    target: "face",
    desc: "Mysterious phantom mist around face",
    environment: {
      background: "spectral",
      atmosphere: { fog: 0.50, particles: "phantom-mist", lighting: "cold-bloom" },
      frame: "soft",
      animation: "veil-flow"
    },
    strength: 1.0
  },

  // 🧟 ZOMBIE EFFECTS with complete environments
  {
    id: "zombie-virus",
    name: "Zombie Virus",
    icon: "🧟",
    category: "zombie",
    target: "face",
    desc: "Zombie virus infection with rotting skin",
    environment: {
      background: "cemetery",
      atmosphere: { fog: 0.45, particles: "decay-dust", lighting: "cold-dim" },
      frame: "decaying",
      animation: "infection-spread"
    },
    strength: 1.0
  },

  {
    id: "undead-plague",
    name: "Undead Plague",
    icon: "🧟",
    category: "zombie",
    target: "face",
    desc: "Undead plague victim with decaying features",
    environment: {
      background: "cemetery",
      atmosphere: { fog: 0.50, particles: "plague-mist", lighting: "death" },
      frame: "decaying",
      animation: "plague-pulse"
    },
    strength: 1.0
  },

  {
    id: "walking-dead",
    name: "Walking Dead",
    icon: "🧟",
    category: "zombie",
    target: "face",
    desc: "Zombie apocalypse survivor look",
    environment: {
      background: "ruins",
      atmosphere: { fog: 0.40, particles: "apocalypse-dust", lighting: "strong-shadow" },
      frame: "decaying",
      animation: "survival-mode"
    },
    strength: 1.0
  },

  // 🔮 WITCH EFFECTS with complete environments
  {
    id: "witch-curse",
    name: "Witch Curse",
    icon: "🔮",
    category: "witch",
    target: "face",
    desc: "Dark witch curse with glowing eyes",
    environment: {
      background: "moonlight",
      atmosphere: { fog: 0.30, particles: "curse-energy", lighting: "hellfire" },
      frame: "magic",
      animation: "curse-chant"
    },
    strength: 1.0
  },

  {
    id: "spell-caster",
    name: "Spell Caster",
    icon: "🔮",
    category: "witch",
    target: "face",
    desc: "Powerful witch casting dark magic",
    environment: {
      background: "witch",
      atmosphere: { fog: 0.35, particles: "spell-energy", lighting: "magic-glow" },
      frame: "magic-circle",
      animation: "spell-weave"
    },
    strength: 1.0
  },

  {
    id: "potion-master",
    name: "Potion Master",
    icon: "🔮",
    category: "witch",
    target: "face",
    desc: "Witch brewing mysterious potions",
    environment: {
      background: "witch",
      atmosphere: { fog: 0.25, particles: "potion-vapor", lighting: "cauldron-glow" },
      frame: "organic",
      animation: "potion-bubble"
    },
    strength: 1.0
  },

  // 🎃 PUMPKIN EFFECTS with complete environments
  {
    id: "pumpkin-face",
    name: "Pumpkin Face",
    icon: "🎃",
    category: "pumpkin",
    target: "face",
    desc: "Classic jack-o-lantern pumpkin face",
    environment: {
      background: "patch",
      atmosphere: { fog: 0.15, particles: "pumpkin-sparks", lighting: "lantern" },
      frame: "pumpkin",
      animation: "jack-flicker"
    },
    strength: 1.0
  },

  {
    id: "carved-pumpkin",
    name: "Carved Pumpkin",
    icon: "🎃",
    category: "pumpkin",
    target: "face",
    desc: "Intricately carved pumpkin features",
    environment: {
      background: "patch",
      atmosphere: { fog: 0.20, particles: "carving-dust", lighting: "lantern" },
      frame: "carved",
      animation: "intricate-detail"
    },
    strength: 1.0
  },

  {
    id: "pumpkin-king",
    name: "Pumpkin King",
    icon: "🎃",
    category: "pumpkin",
    target: "face",
    desc: "Regal pumpkin king with crown",
    environment: {
      background: "patch",
      atmosphere: { fog: 0.18, particles: "royal-energy", lighting: "crown-glow" },
      frame: "royal",
      animation: "majestic-presence"
    },
    strength: 1.0
  },

  // 💀 SKULL EFFECTS with complete environments
  {
    id: "skull-face",
    name: "Skull Face",
    icon: "💀",
    category: "skull",
    target: "face",
    desc: "Human skull transformation",
    environment: {
      background: "cemetery",
      atmosphere: { fog: 0.35, particles: "bone-dust", lighting: "cold-dim" },
      frame: "skull",
      animation: "bone-rattle"
    },
    strength: 1.0
  },

  {
    id: "death-mask",
    name: "Death Mask",
    icon: "💀",
    category: "skull",
    target: "face",
    desc: "Ancient death mask with bone details",
    environment: {
      background: "cemetery",
      atmosphere: { fog: 0.40, particles: "ancient-dust", lighting: "cold-dim" },
      frame: "ancient",
      animation: "time-erosion"
    },
    strength: 1.0
  },

  {
    id: "reaper-essence",
    name: "Reaper Essence",
    icon: "💀",
    category: "skull",
    target: "face",
    desc: "Grim reaper spectral essence",
    environment: {
      background: "spectral",
      atmosphere: { fog: 0.45, particles: "reaper-scythe", lighting: "death" },
      frame: "reaper",
      animation: "essence-flow"
    },
    strength: 1.0
  },

  // 😈 DEVIL EFFECTS with complete environments
  {
    id: "devil-horns",
    name: "Devil Horns",
    icon: "😈",
    category: "devil",
    target: "face",
    desc: "Sharp devil horns and red eyes",
    environment: {
      background: "hellfire",
      atmosphere: { fog: 0.25, particles: "hellfire", lighting: "hellfire" },
      frame: "horns",
      animation: "devil-flame"
    },
    strength: 1.0
  },

  {
    id: "demon-possession",
    name: "Demon Possession",
    icon: "😈",
    category: "devil",
    target: "face",
    desc: "Full demon possession transformation",
    environment: {
      background: "hellfire",
      atmosphere: { fog: 0.35, particles: "demon-energy", lighting: "hellfire" },
      frame: "demonic",
      animation: "possession-rage"
    },
    strength: 1.0
  },

  {
    id: "hellfire-eyes",
    name: "Hellfire Eyes",
    icon: "😈",
    category: "devil",
    target: "face",
    desc: "Burning hellfire eyes and dark aura",
    environment: {
      background: "hellfire",
      atmosphere: { fog: 0.30, particles: "fire-blast", lighting: "hellfire" },
      frame: "intense",
      animation: "hellfire-pulse"
    },
    strength: 1.0
  },

  // 🎬 CINEMA EFFECTS with complete environments
  {
    id: "horror-movie",
    name: "Horror Movie",
    icon: "🎬",
    category: "cinema",
    target: "scene",
    desc: "Classic horror movie color grading",
    environment: {
      background: "cinema",
      atmosphere: { fog: 0.12, particles: "horror-dust", lighting: "horror" },
      frame: "letterbox",
      animation: "horror-tension"
    },
    strength: 1.0
  },

  {
    id: "slasher-flick",
    name: "Slasher Flick",
    icon: "🎬",
    category: "cinema",
    target: "scene",
    desc: "80s slasher film visual style",
    environment: {
      background: "cinema",
      atmosphere: { fog: 0.15, particles: "blood-mist", lighting: "strobe" },
      frame: "vintage",
      animation: "slasher-flash"
    },
    strength: 1.0
  },

  {
    id: "psychological-horror",
    name: "Psychological Horror",
    icon: "🎬",
    category: "cinema",
    target: "scene",
    desc: "Dark psychological thriller atmosphere",
    environment: {
      background: "manor",
      atmosphere: { fog: 0.40, particles: "mind-warp", lighting: "storm-light" },
      frame: "organic",
      animation: "psychosis-drift"
    },
    strength: 1.0
  },

  // ⚡ EXPERIMENTAL EFFECTS with complete environments
  {
    id: "quantum-horror",
    name: "Quantum Horror",
    icon: "⚡",
    category: "experimental",
    target: "scene",
    desc: "Reality-bending quantum horror effects",
    environment: {
      background: "void",
      atmosphere: { fog: 0.25, particles: "quantum-flux", lighting: "quantum" },
      frame: "tech",
      animation: "reality-bend"
    },
    strength: 1.0
  },

  {
    id: "dimensional-rip",
    name: "Dimensional Rip",
    icon: "⚡",
    category: "experimental",
    target: "scene",
    desc: "Tear in reality with visual distortion",
    environment: {
      background: "void",
      atmosphere: { fog: 0.30, particles: "dimensional-energy", lighting: "quantum" },
      frame: "dimensional",
      animation: "space-rip"
    },
    strength: 1.0
  },

  {
    id: "void-exposure",
    name: "Void Exposure",
    icon: "⚡",
    category: "experimental",
    target: "scene",
    desc: "Cosmic void exposure with energy bursts",
    environment: {
      background: "void",
      atmosphere: { fog: 0.35, particles: "void-energy", lighting: "quantum" },
      frame: "void",
      animation: "void-explosion"
    },
    strength: 1.0
  }
];

// Enhanced Environment System
const ENHANCED_ENVIRONMENTS = {
  // Studio Environments
  studio: {
    label: "Studio Portrait",
    background: "solid",
    palette: ["246,182,215", "253,224,71", "255,255,255"],
    fog: 0,
    glow: "rgba(251,191,36,0.10)",
    frame: "soft",
    light: "warm-top",
    particles: "none",
    animation: "subtle-glow"
  },

  portrait: {
    label: "Cinematic Portrait",
    background: "gradient",
    palette: ["251,146,60", "56,189,248"],
    fog: 0.05,
    glow: "rgba(147,51,234,0.10)",
    frame: "soft",
    light: "three-point",
    particles: "dust",
    animation: "warm-glow"
  },

  // Fantasy Environments
  fantasy: {
    label: "Magical Glow",
    background: "ethereal",
    palette: ["244,114,182", "250,204,21", "255,255,255"],
    fog: 0.12,
    glow: "rgba(244,114,182,0.12)",
    frame: "soft",
    light: "bloom",
    particles: "sparkles",
    animation: "magical-pulse"
  },

  witch: {
    label: "Witch Moonlight",
    background: "mystical",
    palette: ["192,132,252", "74,222,128", "226,232,240"],
    fog: 0.32,
    glow: "rgba(147,51,234,0.16)",
    frame: "organic",
    light: "magic-glow",
    particles: "magic-dust",
    animation: "witch-aura"
  },

  // Horror Environments
  cemetery: {
    label: "Ruined Cemetery",
    background: "decaying",
    palette: ["148,163,184", "107,114,128"],
    fog: 0.45,
    glow: "rgba(15,23,42,0.28)",
    frame: "organic",
    light: "cold-dim",
    particles: "bone-dust",
    animation: "death-drift"
  },

  haunted: {
    label: "Haunted Manor",
    background: "shadowy",
    palette: ["67,56,81", "148,163,184"],
    fog: 0.35,
    glow: "rgba(30,27,75,0.30)",
    frame: "organic",
    light: "storm-light",
    particles: "drifting-phantoms",
    animation: "haunt-wisper"
  },

  hellfire: {
    label: "Hellfire Depths",
    background: "infernal",
    palette: ["239,68,68", "251,146,60"],
    fog: 0.22,
    glow: "rgba(239,68,68,0.16)",
    frame: "ember",
    light: "ember-under",
    particles: "hellfire",
    animation: "hellfire-flame"
  },

  // Cyber Environments
  cyber: {
    label: "Neon Cyber City",
    background: "digital",
    palette: ["34,211,238", "236,72,153"],
    fog: 0.18,
    glow: "rgba(6,182,212,0.14)",
    frame: "neon",
    light: "neon-scan",
    particles: "neon-rain",
    animation: "cyber-grid"
  },

  nebula: {
    label: "Deep Nebula",
    background: "cosmic",
    palette: ["147,51,234", "59,130,246", "226,232,240"],
    fog: 0.10,
    glow: "rgba(147,51,234,0.16)",
    frame: "tech",
    light: "starfield",
    particles: "stardust",
    animation: "cosmic-drift"
  },

  void: {
    label: "Surreal Void",
    background: "dimensional",
    palette: ["168,85,247", "6,182,212"],
    fog: 0.20,
    glow: "rgba(88,28,135,0.22)",
    frame: "tech",
    light: "quantum",
    particles: "void-energy",
    animation: "void-pulse"
  },

  // Nature Environments
  forest: {
    label: "Haunted Forest",
    background: "organic",
    palette: ["163,230,53", "226,232,240"],
    fog: 0.35,
    glow: "rgba(34,197,94,0.10)",
    frame: "organic",
    light: "moon-top",
    particles: "floating-spirits",
    animation: "forest-wisper"
  },

  moonlight: {
    label: "Moonlit Woods",
    background: "nocturnal",
    palette: ["226,232,240", "196,181,253"],
    fog: 0.30,
    glow: "rgba(196,181,253,0.14)",
    frame: "organic",
    light: "moon-top",
    particles: "moonbeams",
    animation: "moon-glow"
  },

  // Special Environments
  spectral: {
    label: "Spectral Night",
    background: "ethereal",
    palette: ["224,242,254", "165,180,252"],
    fog: 0.40,
    glow: "rgba(199,210,254,0.16)",
    frame: "soft",
    light: "cold-bloom",
    particles: "ectoplasm",
    animation: "spectral-flow"
  },

  patch: {
    label: "Pumpkin Patch",
    background: "autumn",
    palette: ["249,115,22", "250,204,21"],
    fog: 0.15,
    glow: "rgba(249,115,22,0.14)",
    frame: "ember",
    light: "lantern",
    particles: "pumpkin-sparks",
    animation: "pumpkin-flicker"
  },

  // Cinema Environments
  cinema: {
    label: "35mm Location",
    background: "film",
    palette: ["15,118,110", "249,115,22"],
    fog: 0.08,
    glow: "rgba(15,23,42,0.22)",
    frame: "letterbox",
    light: "anamorphic",
    particles: "film-dust",
    animation: "film-grain"
  },

  vintage: {
    label: "Vintage Retro",
    background: "nostalgic",
    palette: ["255,206,84", "255,154,0"],
    fog: 0.12,
    glow: "rgba(255,206,84,0.12)",
    frame: "soft-vignette",
    light: "warm",
    particles: "vintage-dust",
    animation: "vintage-flicker"
  },

  // Digital Environments
  digital: {
    label: "Digital Wasteland",
    background: "glitch",
    palette: ["239,68,68", "6,182,212"],
    fog: 0.10,
    glow: "rgba(6,182,212,0.12)",
    frame: "tech",
    light: "strobe",
    particles: "digital-noise",
    animation: "glitch-distortion"
  },

  // VR Environments
  vr: {
    label: "VR Immersive",
    background: "immersive",
    palette: ["0,0,0", "255,255,255"],
    fog: 0.05,
    glow: "rgba(0,255,255,0.20)",
    frame: "vr-hud",
    light: "holo-grid",
    particles: "data-streams",
    animation: "vr-parallax"
  }
};

// Environment Manager Class
class EnvironmentManager {
  constructor() {
    this.currentEnvironment = null;
    this.activeEffects = new Set();
    this.particleSystems = new Map();
    this.animationFrame = null;
  }

  // Initialize the environment system
  initialize() {
    console.log('[EnvironmentManager] Enhanced filter environment system initialized');
  }

  // Load environment for a specific filter
  loadEnvironment(filterId) {
    const filterConfig = ENHANCED_FILTER_CONFIGS.find(f => f.id === filterId);
    if (!filterConfig) {
      console.warn(`[EnvironmentManager] No environment config found for filter: ${filterId}`);
      return null;
    }

    const environment = ENHANCED_ENVIRONMENTS[filterConfig.environment.background];
    if (!environment) {
      console.warn(`[EnvironmentManager] Environment not found: ${filterConfig.environment.background}`);
      return null;
    }

    // Clean up previous environment
    this.teardownEnvironment();

    // Set new environment
    this.currentEnvironment = {
      id: filterConfig.environment.background,
      config: environment,
      filter: filterConfig,
      strength: filterConfig.strength
    };

    // Initialize environment components
    this.initializeEnvironmentComponents(filterConfig.environment);

    console.log(`[EnvironmentManager] Loaded environment: ${environment.label} for filter: ${filterId}`);
    return this.currentEnvironment;
  }

  // Initialize environment components based on filter configuration
  initializeEnvironmentComponents(environmentConfig) {
    // Clear existing effects
    this.activeEffects.clear();

    // Add background effect
    if (environmentConfig.background) {
      this.activeEffects.add('background');
    }

    // Add atmospheric effects
    if (environmentConfig.atmosphere) {
      const { fog, particles, lighting } = environmentConfig.atmosphere;
      
      if (fog > 0) {
        this.activeEffects.add('fog');
      }
      
      if (particles && particles !== 'none') {
        this.activeEffects.add('particles');
      }
      
      if (lighting) {
        this.activeEffects.add('lighting');
      }
    }

    // Add frame effect
    if (environmentConfig.frame) {
      this.activeEffects.add('frame');
    }

    // Add animation
    if (environmentConfig.animation) {
      this.activeEffects.add('animation');
    }
  }

  // Clean up current environment
  teardownEnvironment() {
    this.activeEffects.clear();
    this.particleSystems.clear();
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
      this.animationFrame = null;
    }
    this.currentEnvironment = null;
  }

  // Get current environment configuration
  getCurrentEnvironment() {
    return this.currentEnvironment;
  }

  // Apply environment effects to canvas context
  applyEnvironmentEffects(ctx, w, h, time, strength = 1.0) {
    if (!this.currentEnvironment) return;

    const environment = this.currentEnvironment;
    const config = environment.config;

    // Apply background
    if (this.activeEffects.has('background')) {
      this.drawBackground(ctx, w, h, config);
    }

    // Apply atmospheric effects
    if (this.activeEffects.has('fog')) {
      this.drawFog(ctx, w, h, config, strength);
    }

    if (this.activeEffects.has('particles')) {
      this.drawParticles(ctx, w, h, config, time, strength);
    }

    if (this.activeEffects.has('lighting')) {
      this.drawLighting(ctx, w, h, config, strength);
    }

    // Apply frame
    if (this.activeEffects.has('frame')) {
      this.drawFrame(ctx, w, h, config);
    }

    // Apply animation
    if (this.activeEffects.has('animation')) {
      this.drawAnimation(ctx, w, h, config, time, strength);
    }
  }

  // Draw background based on environment type
  drawBackground(ctx, w, h, config) {
    switch (config.background) {
      case 'solid':
        ctx.fillStyle = `rgba(${config.palette[0]}, 1)`;
        ctx.fillRect(0, 0, w, h);
        break;
      
      case 'gradient':
        const gradient = ctx.createLinearGradient(0, 0, w, h);
        gradient.addColorStop(0, `rgba(${config.palette[0]}, 0.8)`);
        gradient.addColorStop(1, `rgba(${config.palette[1]}, 0.8)`);
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, w, h);
        break;
      
      case 'ethereal':
        const etherealGrad = ctx.createRadialGradient(w/2, h/2, 0, w/2, h/2, Math.max(w, h)/2);
        etherealGrad.addColorStop(0, `rgba(${config.palette[0]}, 0.3)`);
        etherealGrad.addColorStop(0.5, `rgba(${config.palette[1]}, 0.2)`);
        etherealGrad.addColorStop(1, `rgba(${config.palette[2]}, 0.1)`);
        ctx.fillStyle = etherealGrad;
        ctx.fillRect(0, 0, w, h);
        break;
      
      case 'cosmic':
        const cosmicGrad = ctx.createRadialGradient(w/2, h/2, 0, w/2, h/2, Math.max(w, h));
        config.palette.forEach((color, index) => {
          cosmicGrad.addColorStop(index / (config.palette.length - 1), `rgba(${color}, 0.4)`);
        });
        ctx.fillStyle = cosmicGrad;
        ctx.fillRect(0, 0, w, h);
        break;
      
      default:
        // Default gradient background
        const defaultGrad = ctx.createLinearGradient(0, 0, w, h);
        defaultGrad.addColorStop(0, `rgba(${config.palette[0]}, 0.6)`);
        defaultGrad.addColorStop(1, `rgba(${config.palette[1]}, 0.6)`);
        ctx.fillStyle = defaultGrad;
        ctx.fillRect(0, 0, w, h);
    }
  }

  // Draw fog effect
  drawFog(ctx, w, h, config, strength) {
    const fogIntensity = config.fog * strength;
    if (fogIntensity <= 0) return;

    const fogGradient = ctx.createRadialGradient(w/2, h/2, 0, w/2, h/2, Math.max(w, h)/2);
    fogGradient.addColorStop(0, `rgba(200, 200, 200, ${fogIntensity * 0.3})`);
    fogGradient.addColorStop(1, `rgba(150, 150, 150, ${fogIntensity * 0.6})`);
    
    ctx.fillStyle = fogGradient;
    ctx.fillRect(0, 0, w, h);
  }

  // Draw particle effects
  drawParticles(ctx, w, h, config, time, strength) {
    // This is a simplified particle system - can be enhanced with more sophisticated effects
    const particleCount = Math.floor(50 * strength);
    
    for (let i = 0; i < particleCount; i++) {
      const x = (Math.sin(time * 0.001 + i) * 0.5 + 0.5) * w;
      const y = (Math.cos(time * 0.001 + i * 1.3) * 0.5 + 0.5) * h;
      const size = Math.sin(time * 0.002 + i) * 2 + 3;
      const alpha = Math.sin(time * 0.003 + i) * 0.5 + 0.5;
      
      ctx.fillStyle = `rgba(${config.palette[0]}, ${alpha * 0.3})`;
      ctx.beginPath();
      ctx.arc(x, y, size, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Draw lighting effects
  drawLighting(ctx, w, h, config, strength) {
    // Apply glow effect
    if (config.glow) {
      ctx.shadowColor = config.glow;
      ctx.shadowBlur = 20 * strength;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 0;
    }
  }

  // Draw frame overlay
  drawFrame(ctx, w, h, config) {
    ctx.save();
    
    switch (config.frame) {
      case 'letterbox':
        // Film letterbox bars
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(0, 0, w, h * 0.15);
        ctx.fillRect(0, h * 0.85, w, h * 0.15);
        break;
      
      case 'soft':
        // Soft vignette frame
        const vignette = ctx.createRadialGradient(w/2, h/2, 0, w/2, h/2, Math.max(w, h)/2);
        vignette.addColorStop(0, 'rgba(0, 0, 0, 0)');
        vignette.addColorStop(0.7, 'rgba(0, 0, 0, 0.2)');
        vignette.addColorStop(1, 'rgba(0, 0, 0, 0.8)');
        ctx.fillStyle = vignette;
        ctx.fillRect(0, 0, w, h);
        break;
      
      case 'tech':
        // Tech-style frame
        ctx.strokeStyle = 'rgba(0, 255, 255, 0.5)';
        ctx.lineWidth = 2;
        ctx.strokeRect(10, 10, w - 20, h - 20);
        break;
      
      case 'organic':
        // Organic frame
        ctx.strokeStyle = 'rgba(100, 150, 100, 0.3)';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(20, 20);
        ctx.quadraticCurveTo(w * 0.3, 10, w * 0.5, 20);
        ctx.quadraticCurveTo(w * 0.7, 30, w - 20, 20);
        ctx.lineTo(w - 20, h - 20);
        ctx.quadraticCurveTo(w * 0.7, h - 10, w * 0.5, h - 20);
        ctx.quadraticCurveTo(w * 0.3, h - 30, 20, h - 20);
        ctx.closePath();
        ctx.stroke();
        break;
    }
    
    ctx.restore();
  }

  // Draw animation effects
  drawAnimation(ctx, w, h, config, time, strength) {
    // Animation effects can be customized based on environment type
    switch (config.animation) {
      case 'subtle-glow':
        // Subtle pulsing glow
        const glowIntensity = Math.sin(time * 0.002) * 0.1 + 0.1;
        ctx.shadowColor = `rgba(${config.palette[0]}, ${glowIntensity})`;
        ctx.shadowBlur = 10 * strength;
        break;
      
      case 'cosmic-drift':
        // Cosmic drift animation
        const driftOffset = Math.sin(time * 0.001) * 5;
        ctx.translate(driftOffset, 0);
        break;
      
      default:
        // Default subtle animation
        break;
    }
  }
}

// Global environment manager instance
const environmentManager = new EnvironmentManager();

// Initialize enhanced environments when the script loads
if (typeof window !== 'undefined') {
  window.WebZoneBW = window.WebZoneBW || {};
  window.WebZoneBW.EnvironmentManager = EnvironmentManager;
  window.WebZoneBW.EnhancedFilterConfigs = ENHANCED_FILTER_CONFIGS;
  window.WebZoneBW.EnhancedEnvironments = ENHANCED_ENVIRONMENTS;
  window.WebZoneBW.environmentManager = environmentManager;
}

// For CommonJS compatibility
module.exports = {
  ENHANCED_FILTER_CONFIGS,
  ENHANCED_ENVIRONMENTS,
  EnvironmentManager,
  environmentManager
};