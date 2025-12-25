(() => {
  const canvas = document.getElementById("fx");
  const ctx = canvas.getContext("2d", { alpha: true });

  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  const P1 = [0x21, 0x91, 0x69];
  const P3 = [0x4b, 0x60, 0x7a];

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
  function rgba(rgb, a) { return `rgba(${rgb[0]},${rgb[1]},${rgb[2]},${a})`; }

  // Fewer particles => calmer + Safari-friendly
  const N = 60;
  const particles = Array.from({ length: N }, () => ({
    x: rand(0, w),
    y: rand(0, h),
    r: rand(0.8, 2.0),
    vx: rand(-0.16, 0.16),
    vy: rand(-0.14, 0.14),
    col: Math.random() < 0.6 ? P1 : P3,
    a: rand(0.18, 0.38),
    p: rand(0.5, 1.0)
  }));

  const attractor = { x: w * 0.5, y: h * 0.45 };

  function drawGlow(time) {
    const t = time * 0.00018;
    const gx = w * (0.50 + 0.18 * Math.sin(t));
    const gy = h * (0.42 + 0.14 * Math.cos(t * 1.08));

    const g = ctx.createRadialGradient(gx, gy, 0, gx, gy, Math.max(w, h) * 0.78);
    g.addColorStop(0, rgba(P1, 0.10));
    g.addColorStop(0.35, rgba(P3, 0.09));
    g.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
  }

  function tick(time) {
    // Clean redraw every frame (no trails) => Safari stable
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = "rgba(7,10,14,1)";
    ctx.fillRect(0, 0, w, h);

    const tt = time * 0.00018;
    attractor.x = w * (0.50 + 0.18 * Math.sin(tt));
    attractor.y = h * (0.42 + 0.14 * Math.cos(tt * 1.10));

    drawGlow(time);

    const pull = 0.00050;

    for (const p of particles) {
      p.x += p.vx;
      p.y += p.vy;

      const dx = attractor.x - p.x;
      const dy = attractor.y - p.y;
      p.vx += dx * pull * p.p;
      p.vy += dy * pull * p.p;

      p.vx *= 0.985;
      p.vy *= 0.985;

      if (p.x < -20) p.x = w + 20;
      if (p.x > w + 20) p.x = -20;
      if (p.y < -20) p.y = h + 20;
      if (p.y > h + 20) p.y = -20;

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = rgba(p.col, p.a);
      ctx.fill();
    }

    // Very subtle links
    const maxD = 130;
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const a = particles[i], b = particles[j];
        const dx = a.x - b.x, dy = a.y - b.y;
        const d2 = dx * dx + dy * dy;
        if (d2 < maxD * maxD) {
          const alpha = 0.045 * (1 - d2 / (maxD * maxD));
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