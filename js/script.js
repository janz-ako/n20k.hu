(() => {
  const canvas = document.getElementById("fx");
  const ctx = canvas.getContext("2d", { alpha: true });

  const yearEl = document.getElementById("year");
  yearEl.textContent = String(new Date().getFullYear());

  const root = document.documentElement;
  const toggleBtn = document.getElementById("toggleMotion");

  const prefersReduced = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let reduceMotion = prefersReduced;

  function applyReduceMotion() {
    root.dataset.reduceMotion = reduceMotion ? "1" : "0";
    toggleBtn.textContent = reduceMotion ? "Enable motion" : "Reduce motion";
  }
  applyReduceMotion();

  toggleBtn.addEventListener("click", () => {
    reduceMotion = !reduceMotion;
    applyReduceMotion();
  });

  // Palette (match CSS)
  const P1 = [0x21, 0x91, 0x69];
  const P3 = [0x4b, 0x60, 0x7a];

  const DPR = Math.min(window.devicePixelRatio || 1, 2);
  let w = 0, h = 0;

  function resize() {
    w = Math.floor(window.innerWidth);
    h = Math.floor(window.innerHeight);
    canvas.width = Math.floor(w * DPR);
    canvas.height = Math.floor(h * DPR);
    canvas.style.width = w + "px";
    canvas.style.height = h + "px";
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  }
  window.addEventListener("resize", resize, { passive: true });
  resize();

  // Particles (subtle, premium, "Halo"-ish)
  const N = 90;
  const particles = [];
  const mouse = { x: w * 0.6, y: h * 0.35, vx: 0, vy: 0 };

  function rand(a, b) { return a + Math.random() * (b - a); }

  function mix(a, b, t) { return a + (b - a) * t; }

  function rgb(arr, a = 1) {
    return `rgba(${arr[0]},${arr[1]},${arr[2]},${a})`;
  }

  function spawn() {
    const t = Math.random();
    const col = t < 0.55 ? P1 : P3;
    return {
      x: rand(0, w),
      y: rand(0, h),
      r: rand(0.8, 2.2),
      vx: rand(-0.25, 0.25),
      vy: rand(-0.22, 0.22),
      col,
      a: rand(0.22, 0.55),
      p: rand(0.3, 1.0)
    };
  }

  for (let i = 0; i < N; i++) particles.push(spawn());

  window.addEventListener("pointermove", (e) => {
    const nx = e.clientX;
    const ny = e.clientY;
    mouse.vx = nx - mouse.x;
    mouse.vy = ny - mouse.y;
    mouse.x = nx;
    mouse.y = ny;
  }, { passive: true });

  function drawBgGlow(time) {
    const t = time * 0.0002;
    const gx = mix(w * 0.35, w * 0.65, (Math.sin(t) + 1) / 2);
    const gy = mix(h * 0.28, h * 0.55, (Math.cos(t * 1.2) + 1) / 2);

    const g = ctx.createRadialGradient(gx, gy, 0, gx, gy, Math.max(w, h) * 0.7);
    g.addColorStop(0, rgb(P1, 0.12));
    g.addColorStop(0.35, rgb(P3, 0.10));
    g.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
  }

  function tick(time) {
    // Clear with slight trail for "premium" motion
    ctx.fillStyle = reduceMotion ? "rgba(7,10,14,0.55)" : "rgba(7,10,14,0.18)";
    ctx.fillRect(0, 0, w, h);

    drawBgGlow(time);

    // Particle motion
    const pull = reduceMotion ? 0.0006 : 0.0014;

    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];

      // Soft drift + wrap
      p.x += p.vx;
      p.y += p.vy;

      // Gentle attraction to mouse (very subtle)
      const dx = mouse.x - p.x;
      const dy = mouse.y - p.y;
      p.vx += dx * pull * p.p;
      p.vy += dy * pull * p.p;

      // Damp velocity
      p.vx *= 0.985;
      p.vy *= 0.985;

      // Wrap
      if (p.x < -20) p.x = w + 20;
      if (p.x > w + 20) p.x = -20;
      if (p.y < -20) p.y = h + 20;
      if (p.y > h + 20) p.y = -20;

      // Draw particle
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = rgb(p.col, p.a);
      ctx.fill();
    }

    // Connect nearby particles (thin lines)
    if (!reduceMotion) {
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const a = particles[i], b = particles[j];
          const dx = a.x - b.x, dy = a.y - b.y;
          const d2 = dx * dx + dy * dy;
          if (d2 < 140 * 140) {
            const alpha = 0.10 * (1 - d2 / (140 * 140));
            ctx.strokeStyle = `rgba(234,242,255,${alpha})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }
    }

    requestAnimationFrame(tick);
  }

  requestAnimationFrame(tick);
})();