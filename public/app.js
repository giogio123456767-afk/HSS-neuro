// ===== EDIT ME =====
const CLUB_NAME = "Neuroscience Club";
// ===================

document.head.insertAdjacentHTML("beforeend", '<link rel="preconnect" href="https://fonts.googleapis.com"><link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400&family=Instrument+Serif:ital@0;1&family=IBM+Plex+Mono:wght@400&display=swap" rel="stylesheet">');
const PAGES = [["/", "Gallery"], ["/submit.html", "Submit"], ["/officers.html", "Officers"], ["/admin.html", "Admin"]];
const here = location.pathname.replace(/index\.html$/, "");
document.body.insertAdjacentHTML("afterbegin",
  `<nav><a class="brand" href="/">${CLUB_NAME}</a>` +
  PAGES.map(([h, t], i) => `<a class="l${here === h || here === h.replace(".html", "") ? " on" : ""}" href="${h}"><sup>0${i + 1}</sup>${t}</a>`).join("") + `</nav>`);

const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const still = matchMedia("(prefers-reduced-motion:reduce)").matches;

// Hero figure: brain silhouette built from a neural mesh with travelling signals
function brain(canvas) {
  const x = canvas.getContext("2d"), dpr = devicePixelRatio || 1;
  let W, H;
  const fit = () => { W = canvas.clientWidth; H = canvas.clientHeight; canvas.width = W * dpr; canvas.height = H * dpr; x.setTransform(dpr, 0, 0, dpr, 0, 0); };
  fit(); addEventListener("resize", fit);
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
  const sig = Array.from({ length: 12 }, () => ({ e: rnd() * edges.length | 0, t: rnd() }));
  const P = p => [W / 2 + p.a * W * .46, H / 2 + p.b * W * .46];
  (function f(t) {
    x.clearRect(0, 0, W, H);
    x.lineWidth = .5; x.strokeStyle = "rgba(233,235,240,.22)";
    for (const [i, j] of edges) { const [ax, ay] = P(pts[i]), [bx, by] = P(pts[j]); x.beginPath(); x.moveTo(ax, ay); x.lineTo(bx, by); x.stroke(); }
    for (const p of pts) { const [px, py] = P(p), g = .5 + .5 * Math.sin(t / 1100 + p.ph); x.fillStyle = `rgba(233,235,240,${.35 + .4 * g})`; x.beginPath(); x.arc(px, py, 1 + g * .6, 0, 7); x.fill(); }
    x.fillStyle = "#5b86ff";
    for (const s of sig) {
      if (!still) s.t += .018; if (s.t >= 1) { s.t = 0; s.e = rnd() * edges.length | 0; }
      const [i, j] = edges[s.e], [ax, ay] = P(pts[i]), [bx, by] = P(pts[j]);
      x.beginPath(); x.arc(ax + (bx - ax) * s.t, ay + (by - ay) * s.t, 2.2, 0, 7); x.fill();
    }
    if (!still) requestAnimationFrame(f);
  })(0);
}
