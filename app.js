// ===== EDIT ME =====
const CLUB_NAME = "Neuroscience Club";
// ===================

document.head.insertAdjacentHTML("beforeend", '<link rel="preconnect" href="https://fonts.googleapis.com"><link href="https://fonts.googleapis.com/css2?family=Inter:wght@200;300;400&display=swap" rel="stylesheet">');
const PAGES = [["/", "Gallery"], ["/submit.html", "Submit"], ["/officers.html", "Officers"], ["/admin.html", "Admin"]];
const here = location.pathname.replace(/index\.html$/, "");
document.body.insertAdjacentHTML("afterbegin",
  `<canvas id="net"></canvas><nav class="glass"><a class="brand" href="/"><i></i>${CLUB_NAME}</a>` +
  PAGES.map(([h, t]) => `<a class="l${here === h || here === h.replace(".html", "") ? " on" : ""}" href="${h}">${t}</a>`).join("") + `</nav>`);

const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const still = matchMedia("(prefers-reduced-motion:reduce)").matches;

// Background: faint drifting neuron network
(() => {
  const c = document.getElementById("net"), x = c.getContext("2d");
  let w, h, n = [];
  const rs = () => { w = c.width = innerWidth; h = c.height = innerHeight; n = Array.from({ length: Math.min(60, w * h / 26000 | 0) }, () => ({ x: Math.random() * w, y: Math.random() * h, vx: (Math.random() - .5) * .2, vy: (Math.random() - .5) * .2 })); };
  rs(); addEventListener("resize", rs);
  (function f() {
    x.clearRect(0, 0, w, h);
    for (const p of n) { if (!still) { p.x = (p.x + p.vx + w) % w; p.y = (p.y + p.vy + h) % h; } x.fillStyle = "rgba(95,170,255,.5)"; x.beginPath(); x.arc(p.x, p.y, 1.2, 0, 7); x.fill(); }
    for (let i = 0; i < n.length; i++) for (let j = i + 1; j < n.length; j++) {
      const d = Math.hypot(n[i].x - n[j].x, n[i].y - n[j].y);
      if (d < 150) { x.strokeStyle = `rgba(47,139,255,${.2 * (1 - d / 150)})`; x.beginPath(); x.moveTo(n[i].x, n[i].y); x.lineTo(n[j].x, n[j].y); x.stroke(); }
    }
    if (!still) requestAnimationFrame(f);
  })();
})();

// Hero: brain silhouette built from a neural mesh with travelling signals
function brain(canvas) {
  const x = canvas.getContext("2d"), dpr = devicePixelRatio || 1;
  let W, H;
  const fit = () => { W = canvas.clientWidth; H = canvas.clientHeight; canvas.width = W * dpr; canvas.height = H * dpr; x.setTransform(dpr, 0, 0, dpr, 0, 0); };
  fit(); addEventListener("resize", fit);
  // side-view brain: cerebrum + cerebellum + stem (coords roughly -1..1)
  const inside = (a, b) => {
    const cer = ((a + .02) / .95) ** 2 + ((b + .08) / .6) ** 2 < 1 && !(b > .3 && a > .05 && a < .5 && ((a - .3) / .25) ** 2 + ((b - .5) / .22) ** 2 < 1);
    const cb = ((a - .45) / .32) ** 2 + ((b - .48) / .17) ** 2 < 1;
    const st = a > .05 && a < .2 && b > .3 && b < .85 - (a - .05) * 0.5;
    return cer || cb || st;
  };
  let seed = 7; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  const pts = [];
  while (pts.length < 230) { const a = rnd() * 2.1 - 1.05, b = rnd() * 1.6 - .8; if (inside(a, b) && pts.every(p => Math.hypot(p.a - a, p.b - b) > .05)) pts.push({ a, b, ph: rnd() * 6.28 }); }
  const edges = [];
  pts.forEach((p, i) => pts.forEach((q, j) => { if (j > i && Math.hypot(p.a - q.a, p.b - q.b) < .17) edges.push([i, j]); }));
  const sig = Array.from({ length: 14 }, () => ({ e: rnd() * edges.length | 0, t: rnd() }));
  const P = p => [W / 2 + p.a * W * .46, H / 2 + p.b * W * .46];
  let t0 = 0;
  (function f(t) {
    x.clearRect(0, 0, W, H);
    x.lineWidth = .6;
    for (const [i, j] of edges) { const [ax, ay] = P(pts[i]), [bx, by] = P(pts[j]); x.strokeStyle = "rgba(60,140,255,.32)"; x.beginPath(); x.moveTo(ax, ay); x.lineTo(bx, by); x.stroke(); }
    for (const p of pts) { const [px, py] = P(p), g = .5 + .5 * Math.sin(t / 900 + p.ph); x.fillStyle = `rgba(120,200,255,${.35 + .5 * g})`; x.beginPath(); x.arc(px, py, 1.2 + g * .9, 0, 7); x.fill(); }
    for (const s of sig) {
      if (!still) s.t += .02; if (s.t >= 1) { s.t = 0; s.e = rnd() * edges.length | 0; }
      const [i, j] = edges[s.e], [ax, ay] = P(pts[i]), [bx, by] = P(pts[j]), px = ax + (bx - ax) * s.t, py = ay + (by - ay) * s.t;
      x.shadowColor = "#4db2ff"; x.shadowBlur = 12; x.fillStyle = "#cfeaff"; x.beginPath(); x.arc(px, py, 1.8, 0, 7); x.fill(); x.shadowBlur = 0;
    }
    if (!still) requestAnimationFrame(f);
  })(0);
}
