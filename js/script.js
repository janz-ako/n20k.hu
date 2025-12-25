console.log("n20k vanta init v20251225-4");

(function () {
  // Update footer year (safe if missing)
  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  const el = document.getElementById("bg");
  if (!el) {
    console.error("Vanta target #bg not found. Add <div id='bg'></div> inside <body>.");
    return;
  }

  // Ensure libraries are present
  if (!window.VANTA || !window.VANTA.FOG) {
    console.error("VANTA.FOG not available. Check that three.min.js and vanta.fog.min.js are loaded before script.js");
    return;
  }

  // n20k palette
  // #219169 (green), #1D8263 (deep green), #4B607A (blue), #364151 (slate)
  // Vanta expects hex ints like 0xRRGGBB
  const vanta = window.VANTA.FOG({
    el,
    mouseControls: false,
    touchControls: false,
    gyroControls: false,
    highlightColor: 0x219169,
    midtoneColor: 0x4B607A,
    lowlightColor: 0x364151,
    baseColor: 0x0A0F16,
    blurFactor: 0.60,
    speed: 0.80,
    zoom: 0.75
  });

  // Clean up on page unload (important for hot reload / navigation)
  window.addEventListener("beforeunload", () => {
    try { vanta && vanta.destroy && vanta.destroy(); } catch (e) {}
  });
})();