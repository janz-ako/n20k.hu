// =========================================================
// n20k — ambient canvas (autonomous drift, Safari-friendly)
// No header, no buttons, no mouse-follow.
// =========================================================
(() => {
  const canvas = document.getElementById("fx");
  const ctx = canvas.getContext("2d", { alpha: true });

  const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);

  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  // Palette
  const P1 = [0x21, 0x91, 0x69]; // teal
  const P3 = [0x4b, 0x60, 0x7a]; // steel blue

  const DPR = Math.min(window.devicePixelRatio || 1, 2);
  let w = 0, h = 0;

  function resize() {
    w = Math.floor(window.innerWidth);
    h = Math.floor(window.innerHeight);
    canvas.width = Math.ceil(w * DPR);
    canvas.height = Math.ceil(h * DPR);
    canvas.style.width = w + "px";
    canvas.style.height = h + "px";
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  }
  window.addEventListener("resize", resize, { passive: true });
  resize();

  function rand(a, b) { return a + Math.random() * (b - a); }
  function rgb(arr, a = 1) { return `rgba(${arr[0]},${arr[1]},${arr[2]},${a})`; }

  // Particles (kept moderate; Safari-friendly)
  const N = 80;
  const particles = [];

  function spawn() {
    const col = Math.random() < 0.6 ? P1 : P3;
    return {
      x: rand(0, w),
      y: rand(0, h),
      r: rand(0.8, 2.0),
      vx: rand(-0.18, 0.18),
      vy: rand(-0.16, 0.16),
      col,
      a: rand(0.18, 0.42),
      p: rand(0.35, 1.0)
    };
  }

  for (let i = 0; i < N; i++) particles.push(spawn());

  // Autonomous attractor (replaces mouse)
  const attractor = { x: w * 0.5, y: h * 0.45 };

  function drawBgGlow(time) {
    const t = time * 0.00018;
    const gx = w * (0.50 + 0.20 * Math.sin(t));
    const gy = h * (0.40 + 0.16 * Math.cos(t * 1.07));

    const g = ctx.createRadialGradient(gx, gy, 0, gx, gy, Math.max(w, h) * 0.75);
    g.addColorStop(0, rgb(P1, 0.10));
    g.addColorStop(0.35, rgb(P3, 0.09));
    g.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
  }

  function tick(time) {
    // SAFARI: hard clear first to avoid seam artifacts
    ctx.clearRect(0, 0, w, h);

    // Soft trail (still clean in Safari)
  ctx.fillStyle = isSafari
  ? "rgba(7,10,14,1)"   // no trails, clean redraw
  : "rgba(7,10,14,0.22)";
    ctx.fillRect(0, 0, w, h);

    // Autonomous drift target
    const tt = time * 0.00018;
    attractor.x = w * (0.50 + 0.18 * Math.sin(tt));
    attractor.y = h * (0.42 + 0.14 * Math.cos(tt * 1.10));

    drawBgGlow(time);

    // Particle motion
    const pull = 0.00055;

    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];

      // Base drift
      p.x += p.vx;
      p.y += p.vy;

      // Gentle attraction (subtle)
      const dx = attractor.x - p.x;
      const dy = attractor.y - p.y;
      p.vx += dx * pull * p.p;
      p.vy += dy * pull * p.p;

      // Damp velocity
      p.vx *= 0.986;
      p.vy *= 0.986;

      // Wrap edges
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

    // Connect nearby particles (very restrained)
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const a = particles[i], b = particles[j];
        const dx = a.x - b.x, dy = a.y - b.y;
        const d2 = dx * dx + dy * dy;

        const maxD = 140;
        if (d2 < maxD * maxD) {
          const alpha = 0.055 * (1 - d2 / (maxD * maxD));
          ctx.strokeStyle = `rgba(234,242,255,${alpha})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }
    }

    requestAnimationFrame(tick);
  }

  requestAnimationFrame(tick);
})();