// Derives and verifies the plot geometry. Run with: node assets/geom-check.js
//
// CORRECTED ORIENTATION (client, 27 Aug):
//   · LEFT / garden boundary (50.2) is the SLANTED one
//   · RIGHT / Sikandar boundary (47.7) is essentially STRAIGHT
// So the right angle is taken at the FRONT-RIGHT corner, and the plot narrows
// from the west as you go back.
//
// Setbacks: FRONT 0 (built to the road line), left / right / rear 1 ft.

const F = 38.8, L = 50.2, B = 28.8, R = 47.7;
const SB = { front: 0, right: 1, rear: 1, left: 1 };

const A = { x: 0, y: 0 };            // front-left
const Bp = { x: F, y: 0 };           // front-right
const C = { x: F, y: R };            // rear-right  (right boundary straight & square)

// Solve D from |D-C| = B (rear) and |D-A| = L (left)
// (x-F)^2 + (y-R)^2 = B^2 ;  x^2 + y^2 = L^2
//  ->  -2Fx - 2Ry + F^2 + R^2 = B^2 - L^2
const k = (B * B - L * L) - (F * F + R * R);
// -2Fx - 2Ry = k   ->   y = (-k - 2Fx) / (2R)
const my = -F / R, cy = -k / (2 * R);
const qa = 1 + my * my, qb = 2 * my * cy, qc = cy * cy - L * L;
const disc = qb * qb - 4 * qa * qc;
const xa = (-qb - Math.sqrt(disc)) / (2 * qa);
const xb = (-qb + Math.sqrt(disc)) / (2 * qa);
const x = Math.abs(xa) < Math.abs(xb) ? xa : xb;      // the one near the left edge
const D = { x, y: my * x + cy };

const dist = (p, q) => Math.hypot(p.x - q.x, p.y - q.y);
const shoelace = (pts) => {
  let s = 0;
  for (let i = 0; i < pts.length; i++) {
    const p = pts[i], q = pts[(i + 1) % pts.length];
    s += p.x * q.y - q.x * p.y;
  }
  return s / 2;
};

console.log('corners  A', A, '\n         B', Bp, '\n         C', C, '\n         D', D);
console.log('sides — front', dist(A, Bp).toFixed(3), '| right', dist(Bp, C).toFixed(3),
  '| rear', dist(C, D).toFixed(3), '| left', dist(D, A).toFixed(3));

const plot = [A, Bp, C, D];
const area = shoelace(plot);
console.log('plot area sqft', area.toFixed(2), '| sq yd', (area / 9).toFixed(1),
  '| sqm', (area * 0.09290304).toFixed(1));

function offsetPerEdge(pts, dists) {
  const n = pts.length, lines = [];
  for (let i = 0; i < n; i++) {
    const p = pts[i], q = pts[(i + 1) % n];
    const dx = q.x - p.x, dy = q.y - p.y, len = Math.hypot(dx, dy);
    const ux = dx / len, uy = dy / len;
    lines.push({ px: p.x - uy * dists[i], py: p.y + ux * dists[i], ux, uy });
  }
  const out = [];
  for (let i = 0; i < n; i++) {
    const a = lines[(i - 1 + n) % n], b = lines[i];
    const det = a.ux * -b.uy - a.uy * -b.ux;
    const rx = b.px - a.px, ry = b.py - a.py;
    const t = (rx * -b.uy - ry * -b.ux) / det;
    out.push({ x: a.px + a.ux * t, y: a.py + a.uy * t });
  }
  return out;
}

// edge order: AB front, BC right, CD rear, DA left
const inner = offsetPerEdge(plot, [SB.front, SB.right, SB.rear, SB.left]);
console.log('\nsetback polygon:', inner.map(p => `(${p.x.toFixed(4)}, ${p.y.toFixed(4)})`).join(' '));
console.log('buildable area sqft', shoelace(inner).toFixed(2));

const O = inner[0];
console.log(`\nlocal origin = global (${O.x.toFixed(4)}, ${O.y.toFixed(4)})`);
const loc = inner.map(p => ({ x: +(p.x - O.x).toFixed(4), y: +(p.y - O.y).toFixed(4) }));
console.log('local setback polygon:', loc.map(p => `(${p.x}, ${p.y})`).join(' '));
console.log(`  east wall (straight):  x = ${loc[1].x}   for y = 0 .. ${loc[2].y}`);
const wSlope = (loc[3].x - loc[0].x) / (loc[3].y - loc[0].y);
console.log(`  west wall (slanted):   x = ${loc[0].x} + ${wSlope.toFixed(6)} * y`);
const rSlope = (loc[2].y - loc[3].y) / (loc[2].x - loc[3].x);
console.log(`  rear wall:             y = ${loc[3].y} + ${rSlope.toFixed(6)} * (x - ${loc[3].x})`);
console.log(`  usable width at y=0    ${(loc[1].x - loc[0].x).toFixed(2)} ft`);
console.log(`  usable width at y=46.75 ${(loc[1].x - (loc[0].x + wSlope * 46.75)).toFixed(2)} ft`);

module.exports = { plot, inner, O, loc };
