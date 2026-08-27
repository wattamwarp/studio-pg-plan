/* ==========================================================================
   draw.js — a tiny 2D architectural drafting engine that emits SVG.

   All input coordinates are in FEET. The engine converts to SVG user units
   and flips the Y axis so that north is up, matching drafting convention.
   ========================================================================== */
(function (global) {
  'use strict';

  /* ---------- units & formatting ---------------------------------------- */

  var FRACTIONS = { 0: '', 1: '\u00BC', 2: '\u00BD', 3: '\u00BE' };

  // 12.354 -> 12'-4¼"
  function ftin(value) {
    if (value == null || isNaN(value)) return '';
    var neg = value < 0;
    var v = Math.abs(value);
    var ft = Math.floor(v);
    var quarters = Math.round((v - ft) * 48); // quarter-inches
    var inches = Math.floor(quarters / 4);
    var frac = quarters % 4;
    if (inches >= 12) { ft += 1; inches -= 12; }
    return (neg ? '-' : '') + ft + "'-" + inches + FRACTIONS[frac] + '"';
  }

  // "14'-11¼" × 11'-1½""
  function size(w, d) { return ftin(w) + ' \u00D7 ' + ftin(d); }

  function sqft(n) { return n.toFixed(1) + ' sq ft'; }

  function esc(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  function attrs(o) {
    var out = '';
    for (var k in o) {
      if (!Object.prototype.hasOwnProperty.call(o, k)) continue;
      if (o[k] === null || o[k] === undefined) continue;
      out += ' ' + k + '="' + o[k] + '"';
    }
    return out;
  }

  /* ---------- wall thickness lookup ------------------------------------- */
  // All walls are 6" in this scheme, so every code except 'O' insets by 3".
  // E external, I internal, P balcony parapet, O open (no wall).
  var HALF = { E: 0.25, I: 0.25, P: 0.25, O: 0 };

  function clearRect(r, edges) {
    var e = edges || 'IIII'; // order: West, East, South, North
    return {
      x0: r[0] + HALF[e[0]],
      x1: r[2] - HALF[e[1]],
      y0: r[1] + HALF[e[2]],
      y1: r[3] - HALF[e[3]]
    };
  }

  function rectW(c) { return c.x1 - c.x0; }
  function rectH(c) { return c.y1 - c.y0; }
  function rectArea(c) { return rectW(c) * rectH(c); }

  /* ---------- canvas ---------------------------------------------------- */

  /**
   * @param {object} opt
   *   width,height  extents of the drawing in feet
   *   margin        {l,r,t,b} in feet
   *   unit          svg user units per foot (default 10)
   */
  function Canvas(opt) {
    this.u = opt.unit || 10;
    this.m = Object.assign({ l: 10, r: 10, t: 10, b: 10 }, opt.margin || {});
    this.w = opt.width;
    this.h = opt.height;
    this.parts = [];
    this.defs = [];
  }

  Canvas.prototype.X = function (x) { return +(((x + this.m.l) * this.u).toFixed(3)); };
  Canvas.prototype.Y = function (y) { return +(((this.h + this.m.t - y) * this.u).toFixed(3)); };
  Canvas.prototype.L = function (v) { return +((v * this.u).toFixed(3)); };
  Canvas.prototype.add = function (s) { this.parts.push(s); return this; };

  Canvas.prototype.line = function (x1, y1, x2, y2, a) {
    return this.add('<line' + attrs(Object.assign({
      x1: this.X(x1), y1: this.Y(y1), x2: this.X(x2), y2: this.Y(y2)
    }, a)) + '/>');
  };

  Canvas.prototype.rect = function (x0, y0, x1, y1, a) {
    return this.add('<rect' + attrs(Object.assign({
      x: this.X(Math.min(x0, x1)), y: this.Y(Math.max(y0, y1)),
      width: this.L(Math.abs(x1 - x0)), height: this.L(Math.abs(y1 - y0))
    }, a)) + '/>');
  };

  Canvas.prototype.circle = function (cx, cy, r, a) {
    return this.add('<circle' + attrs(Object.assign({
      cx: this.X(cx), cy: this.Y(cy), r: this.L(r)
    }, a)) + '/>');
  };

  Canvas.prototype.poly = function (pts, a) {
    var self = this;
    var s = pts.map(function (p) { return self.X(p[0]) + ',' + self.Y(p[1]); }).join(' ');
    return this.add('<polygon' + attrs(Object.assign({ points: s }, a)) + '/>');
  };

  Canvas.prototype.polyline = function (pts, a) {
    var self = this;
    var s = pts.map(function (p) { return self.X(p[0]) + ',' + self.Y(p[1]); }).join(' ');
    return this.add('<polyline' + attrs(Object.assign({ points: s, fill: 'none' }, a)) + '/>');
  };

  Canvas.prototype.path = function (d, a) {
    return this.add('<path' + attrs(Object.assign({ d: d }, a)) + '/>');
  };

  Canvas.prototype.text = function (x, y, str, a) {
    var o = Object.assign({
      x: this.X(x), y: this.Y(y),
      'text-anchor': 'middle',
      'font-size': 5.4,
      fill: '#1a2430'
    }, a);
    if (o.rotate) {
      o.transform = 'rotate(' + o.rotate + ' ' + o.x + ' ' + o.y + ')';
      delete o.rotate;
    }
    return this.add('<text' + attrs(o) + '>' + esc(str) + '</text>');
  };

  /* ---------- dimension strings ----------------------------------------- */

  var DIM = { stroke: '#c2410c', 'stroke-width': 0.55, fill: 'none' };

  Canvas.prototype.dimH = function (x0, x1, y, label, opt) {
    opt = opt || {};
    var ext = opt.ext == null ? 1.1 : opt.ext;   // witness line reach, ft
    var from = opt.from == null ? y : opt.from;  // where witness lines start
    var t = 0.45;                                 // tick half-length, ft
    var txt = label != null ? label : ftin(Math.abs(x1 - x0));
    this.line(x0, from, x0, y + (y > from ? ext * 0.35 : -ext * 0.35), { stroke: '#c2410c', 'stroke-width': 0.35, 'stroke-dasharray': '2 2' });
    this.line(x1, from, x1, y + (y > from ? ext * 0.35 : -ext * 0.35), { stroke: '#c2410c', 'stroke-width': 0.35, 'stroke-dasharray': '2 2' });
    this.line(x0, y, x1, y, DIM);
    this.line(x0 - t * 0.7, y - t, x0 + t * 0.7, y + t, DIM);
    this.line(x1 - t * 0.7, y - t, x1 + t * 0.7, y + t, DIM);
    this.text((x0 + x1) / 2, y + 0.55, txt, { 'font-size': 5.2, fill: '#c2410c', 'font-weight': 600 });
    return this;
  };

  Canvas.prototype.dimV = function (y0, y1, x, label, opt) {
    opt = opt || {};
    var ext = opt.ext == null ? 1.1 : opt.ext;
    var from = opt.from == null ? x : opt.from;
    var t = 0.45;
    var txt = label != null ? label : ftin(Math.abs(y1 - y0));
    this.line(from, y0, x + (x > from ? ext * 0.35 : -ext * 0.35), y0, { stroke: '#c2410c', 'stroke-width': 0.35, 'stroke-dasharray': '2 2' });
    this.line(from, y1, x + (x > from ? ext * 0.35 : -ext * 0.35), y1, { stroke: '#c2410c', 'stroke-width': 0.35, 'stroke-dasharray': '2 2' });
    this.line(x, y0, x, y1, DIM);
    this.line(x - t, y0 - t * 0.7, x + t, y0 + t * 0.7, DIM);
    this.line(x - t, y1 - t * 0.7, x + t, y1 + t * 0.7, DIM);
    var cx = this.X(x), cy = this.Y((y0 + y1) / 2);
    this.add('<text' + attrs({
      x: cx, y: cy, 'text-anchor': 'middle', 'font-size': 5.2,
      fill: '#c2410c', 'font-weight': 600,
      transform: 'rotate(-90 ' + cx + ' ' + cy + ') translate(0 -2.2)'
    }) + '>' + esc(txt) + '</text>');
    return this;
  };

  /* ---------- openings --------------------------------------------------- */

  // Door in a horizontal wall (runs along x). `into` = +1 swings north.
  Canvas.prototype.doorH = function (x0, x1, y, into, hinge, t) {
    t = t || 0.1875;
    var w = x1 - x0;
    this.rect(x0, y - t, x1, y + t, { fill: '#ffffff', stroke: 'none' });
    var hx = hinge === 'right' ? x1 : x0;
    var dir = hinge === 'right' ? -1 : 1;
    this.line(hx, y, hx, y + into * w, { stroke: '#334155', 'stroke-width': 0.5 });
    this.path('M ' + this.X(hx + dir * w) + ' ' + this.Y(y) +
      ' A ' + this.L(w) + ' ' + this.L(w) + ' 0 0 ' + ((into * dir > 0) ? 0 : 1) + ' ' +
      this.X(hx) + ' ' + this.Y(y + into * w),
      { fill: 'none', stroke: '#94a3b8', 'stroke-width': 0.32 });
    this.line(x0, y, x1, y, { stroke: '#cbd5e1', 'stroke-width': 0.25 });
    return this;
  };

  // Door in a vertical wall (runs along y). `into` = +1 swings east.
  Canvas.prototype.doorV = function (y0, y1, x, into, hinge, t) {
    t = t || 0.1875;
    var w = y1 - y0;
    this.rect(x - t, y0, x + t, y1, { fill: '#ffffff', stroke: 'none' });
    var hy = hinge === 'top' ? y1 : y0;
    var dir = hinge === 'top' ? -1 : 1;
    this.line(x, hy, x + into * w, hy, { stroke: '#334155', 'stroke-width': 0.5 });
    this.path('M ' + this.X(x) + ' ' + this.Y(hy + dir * w) +
      ' A ' + this.L(w) + ' ' + this.L(w) + ' 0 0 ' + ((into * dir > 0) ? 1 : 0) + ' ' +
      this.X(x + into * w) + ' ' + this.Y(hy),
      { fill: 'none', stroke: '#94a3b8', 'stroke-width': 0.32 });
    this.line(x, y0, x, y1, { stroke: '#cbd5e1', 'stroke-width': 0.25 });
    return this;
  };

  // Sliding / french door opening onto a balcony.
  Canvas.prototype.sliderH = function (x0, x1, y, t) {
    t = t || 0.1875;
    this.rect(x0, y - t, x1, y + t, { fill: '#ffffff', stroke: 'none' });
    var mid = (x0 + x1) / 2;
    this.rect(x0, y - t * 0.5, mid + 0.25, y - t * 0.1, { fill: '#64748b', stroke: 'none' });
    this.rect(mid - 0.25, y + t * 0.1, x1, y + t * 0.5, { fill: '#94a3b8', stroke: 'none' });
    this.line(x0, y - t, x0, y + t, { stroke: '#475569', 'stroke-width': 0.3 });
    this.line(x1, y - t, x1, y + t, { stroke: '#475569', 'stroke-width': 0.3 });
    return this;
  };

  Canvas.prototype.sliderV = function (y0, y1, x, t) {
    t = t || 0.1875;
    this.rect(x - t, y0, x + t, y1, { fill: '#ffffff', stroke: 'none' });
    var mid = (y0 + y1) / 2;
    this.rect(x - t * 0.5, y0, x - t * 0.1, mid + 0.25, { fill: '#64748b', stroke: 'none' });
    this.rect(x + t * 0.1, mid - 0.25, x + t * 0.5, y1, { fill: '#94a3b8', stroke: 'none' });
    this.line(x - t, y0, x + t, y0, { stroke: '#475569', 'stroke-width': 0.3 });
    this.line(x - t, y1, x + t, y1, { stroke: '#475569', 'stroke-width': 0.3 });
    return this;
  };

  // Window symbol in a wall segment.
  Canvas.prototype.winH = function (x0, x1, y, t) {
    t = t || 0.375;
    this.rect(x0, y - t, x1, y + t, { fill: '#ffffff', stroke: 'none' });
    this.line(x0, y - t, x1, y - t, { stroke: '#334155', 'stroke-width': 0.35 });
    this.line(x0, y + t, x1, y + t, { stroke: '#334155', 'stroke-width': 0.35 });
    this.line(x0, y, x1, y, { stroke: '#2563eb', 'stroke-width': 0.4 });
    this.line(x0, y - t, x0, y + t, { stroke: '#334155', 'stroke-width': 0.35 });
    this.line(x1, y - t, x1, y + t, { stroke: '#334155', 'stroke-width': 0.35 });
    return this;
  };

  Canvas.prototype.winV = function (y0, y1, x, t) {
    t = t || 0.375;
    this.rect(x - t, y0, x + t, y1, { fill: '#ffffff', stroke: 'none' });
    this.line(x - t, y0, x - t, y1, { stroke: '#334155', 'stroke-width': 0.35 });
    this.line(x + t, y0, x + t, y1, { stroke: '#334155', 'stroke-width': 0.35 });
    this.line(x, y0, x, y1, { stroke: '#2563eb', 'stroke-width': 0.4 });
    this.line(x - t, y0, x + t, y0, { stroke: '#334155', 'stroke-width': 0.35 });
    this.line(x - t, y1, x + t, y1, { stroke: '#334155', 'stroke-width': 0.35 });
    return this;
  };

  /* ---------- furniture -------------------------------------------------- */

  var FURN = { stroke: '#7c8798', 'stroke-width': 0.28, fill: '#ffffff' };

  // head: 'W','E','N','S' — the side the headboard sits against
  Canvas.prototype.bed = function (x0, y0, x1, y1, head) {
    this.rect(x0, y0, x1, y1, Object.assign({ rx: 1 }, FURN));
    var p = 0.55;
    if (head === 'W') {
      this.rect(x0 + 0.15, y0 + 0.28, x0 + 0.15 + p, y1 - 0.28, Object.assign({}, FURN, { fill: '#e6ecf3', rx: 1 }));
      this.line(x0 + 1.9, y0, x0 + 1.9, y1, FURN);
    } else if (head === 'E') {
      this.rect(x1 - 0.15 - p, y0 + 0.28, x1 - 0.15, y1 - 0.28, Object.assign({}, FURN, { fill: '#e6ecf3', rx: 1 }));
      this.line(x1 - 1.9, y0, x1 - 1.9, y1, FURN);
    } else if (head === 'N') {
      this.rect(x0 + 0.28, y1 - 0.15 - p, x1 - 0.28, y1 - 0.15, Object.assign({}, FURN, { fill: '#e6ecf3', rx: 1 }));
      this.line(x0, y1 - 1.9, x1, y1 - 1.9, FURN);
    } else {
      this.rect(x0 + 0.28, y0 + 0.15, x1 - 0.28, y0 + 0.15 + p, Object.assign({}, FURN, { fill: '#e6ecf3', rx: 1 }));
      this.line(x0, y0 + 1.9, x1, y0 + 1.9, FURN);
    }
    return this;
  };

  Canvas.prototype.wardrobe = function (x0, y0, x1, y1, open) {
    this.rect(x0, y0, x1, y1, Object.assign({}, FURN, { fill: '#eef2f7' }));
    var horiz = (x1 - x0) > (y1 - y0);
    var n = Math.max(2, Math.round((horiz ? x1 - x0 : y1 - y0) / 1.6));
    for (var i = 1; i < n; i++) {
      var f = i / n;
      if (horiz) this.line(x0 + (x1 - x0) * f, y0, x0 + (x1 - x0) * f, y1, FURN);
      else this.line(x0, y0 + (y1 - y0) * f, x1, y0 + (y1 - y0) * f, FURN);
    }
    return this;
  };

  Canvas.prototype.desk = function (x0, y0, x1, y1) {
    this.rect(x0, y0, x1, y1, Object.assign({}, FURN, { fill: '#f4f7fa' }));
    var cx = (x0 + x1) / 2, cy = (y0 + y1) / 2;
    var horiz = (x1 - x0) > (y1 - y0);
    if (horiz) this.circle(cx, y0 - 0.95, 0.62, FURN);
    else this.circle(x0 - 0.95, cy, 0.62, FURN);
    return this;
  };

  // Compact 3-piece toilet fitted against one wall.
  // side: which wall the fittings line up against ('W','E','N','S')
  Canvas.prototype.toilet = function (c, side) {
    var w = c.x1 - c.x0, h = c.y1 - c.y0;
    var vertical = (side === 'W' || side === 'E');
    var run = vertical ? h : w;
    var ax = side === 'W' ? c.x0 : c.x1;
    var ay = side === 'S' ? c.y0 : c.y1;
    var s = 0.12;
    var self = this;

    function place(t0, t1, kind) {
      // t0..t1 measured along the wall from the low end
      if (vertical) {
        var yy0 = c.y0 + t0, yy1 = c.y0 + t1;
        var d = kind === 'shower' ? Math.min(3.0, w - 0.2) : (kind === 'wc' ? 2.15 : 1.35);
        var xa = side === 'W' ? ax + s : ax - s - d;
        var xb = side === 'W' ? ax + s + d : ax - s;
        draw(xa, yy0, xb, yy1, kind, vertical);
      } else {
        var xx0 = c.x0 + t0, xx1 = c.x0 + t1;
        var dd = kind === 'shower' ? Math.min(3.0, h - 0.2) : (kind === 'wc' ? 2.15 : 1.35);
        var ya = side === 'S' ? ay + s : ay - s - dd;
        var yb = side === 'S' ? ay + s + dd : ay - s;
        draw(xx0, ya, xx1, yb, kind, vertical);
      }
    }
    function draw(x0, y0, x1, y1, kind) {
      if (kind === 'wc') {
        self.rect(x0, y0, x1, y1, Object.assign({}, FURN, { rx: 0.8 }));
        self.circle((x0 + x1) / 2, (y0 + y1) / 2, Math.min(x1 - x0, y1 - y0) * 0.31, FURN);
      } else if (kind === 'basin') {
        self.rect(x0, y0, x1, y1, Object.assign({}, FURN, { rx: 0.5 }));
        self.circle((x0 + x1) / 2, (y0 + y1) / 2, Math.min(x1 - x0, y1 - y0) * 0.3, FURN);
      } else {
        self.rect(x0, y0, x1, y1, Object.assign({}, FURN, { fill: '#eaf1f8', 'stroke-dasharray': '1.6 1.2' }));
        self.circle((x0 + x1) / 2, (y0 + y1) / 2, 0.32, FURN);
        self.line(x0, y0, x1, y1, { stroke: '#c3cfdc', 'stroke-width': 0.22 });
        self.line(x0, y1, x1, y0, { stroke: '#c3cfdc', 'stroke-width': 0.22 });
      }
    }

    place(0.18, 0.18 + Math.min(1.5, run * 0.28), 'basin');
    place(run * 0.36, run * 0.36 + Math.min(1.55, run * 0.3), 'wc');
    place(run - 0.18 - Math.min(3.0, run * 0.33), run - 0.18, 'shower');
    return this;
  };

  // Dog-leg staircase. dir 'N' = flights ascend toward north.
  // landingAt: 'S' or 'N' — where the half-space landing sits.
  Canvas.prototype.dogleg = function (c, opts) {
    opts = opts || {};
    var risers = opts.risers || 10;       // per flight
    var landing = opts.landing || 4.0;
    var landingAt = opts.landingAt || 'S';
    var gap = opts.gap == null ? 0.4 : opts.gap;   // open well between flights
    var w = c.x1 - c.x0, h = c.y1 - c.y0;
    var flightW = (w - gap) / 2;
    var runTop = landingAt === 'S' ? c.y1 : c.y0 - 0;
    var y0 = landingAt === 'S' ? c.y0 + landing : c.y0;
    var y1 = landingAt === 'S' ? c.y1 : c.y1 - landing;
    var run = y1 - y0;
    var treads = risers - 1;
    var t = run / treads;

    // half-space landing
    if (landingAt === 'S') this.rect(c.x0, c.y0, c.x1, c.y0 + landing, { fill: '#f6f8fa', stroke: '#8b96a5', 'stroke-width': 0.3 });
    else this.rect(c.x0, c.y1 - landing, c.x1, c.y1, { fill: '#f6f8fa', stroke: '#8b96a5', 'stroke-width': 0.3 });

    var A = { x0: c.x0, x1: c.x0 + flightW };
    var B = { x0: c.x1 - flightW, x1: c.x1 };
    [A, B].forEach(function (f) {
      this.rect(f.x0, y0, f.x1, y1, { fill: '#fbfcfd', stroke: '#8b96a5', 'stroke-width': 0.3 });
      for (var i = 1; i < treads; i++) {
        this.line(f.x0, y0 + i * t, f.x1, y0 + i * t, { stroke: '#a8b2be', 'stroke-width': 0.25 });
      }
    }, this);

    // central stringer / handrail well
    this.rect(A.x1, y0, B.x0, y1, { fill: '#e7ebf0', stroke: '#8b96a5', 'stroke-width': 0.28 });

    // up arrow on the ascending flight (left), down on the right
    var mid = (A.x0 + A.x1) / 2;
    this.line(mid, y0 + 0.6, mid, y1 - 0.6, { stroke: '#0f766e', 'stroke-width': 0.4 });
    this.polyline([[mid - 0.45, y1 - 1.3], [mid, y1 - 0.55], [mid + 0.45, y1 - 1.3]], { stroke: '#0f766e', 'stroke-width': 0.4 });
    this.text(mid, y0 + 1.0, 'UP', { 'font-size': 3.6, fill: '#0f766e', 'font-weight': 700 });

    var mid2 = (B.x0 + B.x1) / 2;
    this.line(mid2, y0 + 0.6, mid2, y1 - 0.6, { stroke: '#9a3412', 'stroke-width': 0.4 });
    this.polyline([[mid2 - 0.45, y0 + 1.3], [mid2, y0 + 0.55], [mid2 + 0.45, y0 + 1.3]], { stroke: '#9a3412', 'stroke-width': 0.4 });
    this.text(mid2, y1 - 1.4, 'DN', { 'font-size': 3.6, fill: '#9a3412', 'font-weight': 700 });
    return this;
  };

  // Lift car inside a shaft rect. doorSide: 'S','N','E','W'
  Canvas.prototype.lift = function (c, doorSide) {
    var inset = 0.35;
    this.rect(c.x0 + inset, c.y0 + inset, c.x1 - inset, c.y1 - inset,
      { fill: '#f2f5f8', stroke: '#7c8798', 'stroke-width': 0.32 });
    this.line(c.x0 + inset, c.y0 + inset, c.x1 - inset, c.y1 - inset, { stroke: '#c3cfdc', 'stroke-width': 0.25 });
    this.line(c.x0 + inset, c.y1 - inset, c.x1 - inset, c.y0 + inset, { stroke: '#c3cfdc', 'stroke-width': 0.25 });
    var m = 0.55;
    if (doorSide === 'S' || doorSide === 'N') {
      var yy = doorSide === 'S' ? c.y0 : c.y1;
      var cx = (c.x0 + c.x1) / 2;
      this.line(cx - 1.4, yy, cx - 0.12, yy, { stroke: '#0f172a', 'stroke-width': 0.75 });
      this.line(cx + 0.12, yy, cx + 1.4, yy, { stroke: '#0f172a', 'stroke-width': 0.75 });
    } else {
      var xx = doorSide === 'W' ? c.x0 : c.x1;
      var cy = (c.y0 + c.y1) / 2;
      this.line(xx, cy - 1.4, xx, cy - 0.12, { stroke: '#0f172a', 'stroke-width': 0.75 });
      this.line(xx, cy + 0.12, xx, cy + 1.4, { stroke: '#0f172a', 'stroke-width': 0.75 });
    }
    return this;
  };

  // Balcony railing hatch along the open edge(s).
  Canvas.prototype.railing = function (c, sides) {
    var self = this;
    sides.split('').forEach(function (s) {
      var pts;
      if (s === 'S') pts = [[c.x0, c.y0], [c.x1, c.y0]];
      else if (s === 'N') pts = [[c.x0, c.y1], [c.x1, c.y1]];
      else if (s === 'W') pts = [[c.x0, c.y0], [c.x0, c.y1]];
      else pts = [[c.x1, c.y0], [c.x1, c.y1]];
      self.line(pts[0][0], pts[0][1], pts[1][0], pts[1][1], { stroke: '#94a3b8', 'stroke-width': 0.3 });
      var len = Math.hypot(pts[1][0] - pts[0][0], pts[1][1] - pts[0][1]);
      var n = Math.max(3, Math.round(len / 0.55));
      for (var i = 0; i <= n; i++) {
        var f = i / n;
        var x = pts[0][0] + (pts[1][0] - pts[0][0]) * f;
        var y = pts[0][1] + (pts[1][1] - pts[0][1]) * f;
        var dx = (s === 'S' || s === 'N') ? 0 : 0.28;
        var dy = (s === 'S' || s === 'N') ? 0.28 : 0;
        self.line(x - dx, y - dy, x + dx, y + dy, { stroke: '#b8c2ce', 'stroke-width': 0.18 });
      }
    });
    return this;
  };

  Canvas.prototype.counter = function (x0, y0, x1, y1, label) {
    this.rect(x0, y0, x1, y1, Object.assign({}, FURN, { fill: '#e9eff5' }));
    if (label) this.text((x0 + x1) / 2, (y0 + y1) / 2 - 0.2, label, { 'font-size': 3.2, fill: '#64748b' });
    return this;
  };

  Canvas.prototype.table = function (x0, y0, x1, y1, seats) {
    this.rect(x0, y0, x1, y1, Object.assign({}, FURN, { rx: 0.4, fill: '#f4f7fa' }));
    var n = seats || 6;
    var perSide = Math.ceil(n / 2);
    for (var i = 0; i < perSide; i++) {
      var f = (i + 0.5) / perSide;
      var x = x0 + (x1 - x0) * f;
      this.circle(x, y0 - 0.85, 0.55, FURN);
      this.circle(x, y1 + 0.85, 0.55, FURN);
    }
    return this;
  };

  Canvas.prototype.northArrow = function (x, y, r) {
    r = r || 3.2;
    this.circle(x, y, r, { fill: '#ffffff', stroke: '#334155', 'stroke-width': 0.4 });
    this.poly([[x, y + r * 0.86], [x - r * 0.38, y - r * 0.5], [x, y - r * 0.18], [x + r * 0.38, y - r * 0.5]],
      { fill: '#0f172a', stroke: 'none' });
    this.text(x, y - r - 0.9, 'N', { 'font-size': 5.2, 'font-weight': 700, fill: '#0f172a' });
    return this;
  };

  Canvas.prototype.scaleBar = function (x, y, feet) {
    feet = feet || 10;
    var seg = feet / 5;
    for (var i = 0; i < 5; i++) {
      this.rect(x + i * seg, y, x + (i + 1) * seg, y + 0.55,
        { fill: i % 2 ? '#ffffff' : '#0f172a', stroke: '#0f172a', 'stroke-width': 0.22 });
    }
    this.text(x, y - 1.35, '0', { 'font-size': 4, fill: '#334155' });
    this.text(x + feet, y - 1.35, feet + " ft", { 'font-size': 4, fill: '#334155' });
    return this;
  };

  Canvas.prototype.svg = function (cls) {
    var W = (this.w + this.m.l + this.m.r) * this.u;
    var H = (this.h + this.m.t + this.m.b) * this.u;
    return '<svg xmlns="http://www.w3.org/2000/svg" class="' + (cls || 'plan') + '" ' +
      'viewBox="0 0 ' + W.toFixed(1) + ' ' + H.toFixed(1) + '" ' +
      'preserveAspectRatio="xMidYMid meet" role="img">' +
      '<rect x="0" y="0" width="' + W.toFixed(1) + '" height="' + H.toFixed(1) + '" fill="#ffffff"/>' +
      this.parts.join('') + '</svg>';
  };

  global.Draw = {
    Canvas: Canvas,
    ftin: ftin,
    size: size,
    sqft: sqft,
    clearRect: clearRect,
    rectW: rectW,
    rectH: rectH,
    rectArea: rectArea,
    HALF: HALF
  };
})(window);
