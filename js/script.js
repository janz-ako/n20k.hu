  console.log("n20k script loaded v20251225-3");
  
(() => {
  const canvas = document.getElementById("fx");
  const ctx = canvas.getContext("2d", { alpha: true });


  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

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

  // Brand-ish tones
  const c1 = [0x21, 0x91, 0x69]; // green
  const c2 = [0x4b, 0x60, 0x7a]; // blue
  const c3 = [0x0a, 0x0f, 0x16]; // deep bg

  function rgba([r,g,b], a){ return `rgba(${r},${g},${b},${a})`; }

  // Simple hash noise (fast, no libs)
  function hash(n){
    n = (n << 13) ^ n;
    return 1.0 - ((n * (n * n * 15731 + 789221) + 1376312589) & 0x7fffffff) / 1073741824.0;
  }

  function grain(time){
    // very subtle film grain
    const step = 90; // bigger = cheaper
    ctx.globalAlpha = 0.035;
    for (let y = 0; y < h; y += step){
      for (let x = 0; x < w; x += step){
        const n = hash((x + y * 131) + (time|0));
        const a = (n * 0.5 + 0.5);
        ctx.fillStyle = `rgba(255,255,255,${a})`;
        ctx.fillRect(x, y, 1, 1);
      }
    }
    ctx.globalAlpha = 1;
  }

  function auroraBlob(x, y, r, col, a){
    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, rgba(col, a));
    g.addColorStop(0.55, rgba(col, a * 0.35));
    g.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
  }

  function tick(t){
    // Clean redraw (Safari stable)
    ctx.clearRect(0, 0, w, h);

    // Base
    ctx.fillStyle = rgba(c3, 1);
    ctx.fillRect(0, 0, w, h);

    // Slow drifting aurora (no pointer)
    const time = t * 0.00012;

    const x1 = w * (0.32 + 0.12 * Math.sin(time * 1.1));
    const y1 = h * (0.38 + 0.10 * Math.cos(time * 1.3));
    const r1 = Math.max(w, h) * (0.75 + 0.08 * Math.sin(time * 0.9));

    const x2 = w * (0.70 + 0.10 * Math.cos(time * 1.0));
    const y2 = h * (0.45 + 0.10 * Math.sin(time * 1.2));
    const r2 = Math.max(w, h) * (0.70 + 0.06 * Math.cos(time * 1.1));

    const x3 = w * (0.55 + 0.08 * Math.sin(time * 0.8));
    const y3 = h * (0.80 + 0.07 * Math.cos(time * 0.95));
    const r3 = Math.max(w, h) * (0.65 + 0.05 * Math.sin(time * 0.7));

    // Paint blobs
    auroraBlob(x1, y1, r1, c1, 0.18);
    auroraBlob(x2, y2, r2, c2, 0.20);
    auroraBlob(x3, y3, r3, c1, 0.10);

    // Vignette
    const vg = ctx.createRadialGradient(w*0.5, h*0.55, 0, w*0.5, h*0.55, Math.max(w,h)*0.9);
    vg.addColorStop(0, "rgba(0,0,0,0)");
    vg.addColorStop(1, "rgba(0,0,0,0.55)");
    ctx.fillStyle = vg;
    ctx.fillRect(0,0,w,h);

    grain(t);

    requestAnimationFrame(tick);
  }

  requestAnimationFrame(tick);
})();