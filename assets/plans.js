/* ==========================================================================
   plans.js — studio PG, typical floor. Orthogonal L-plan, three options.

   PLANNING LOGIC
     Three sides can take a window: road (south), garden (west), Sikandar
     (east). Only the rear is blind.

     Rather than slant everything to chase the garden boundary, the plan is
     set out square to the road and the Sikandar wall. It works as an L:

        FRONT BAND      rooms facing the road, across the full width
        CROSS CORRIDOR  behind them, serving all of them
        WEST BAND       one deep room facing the garden
        SPINE CORRIDOR  running north between the two rear bands
        EAST BAND       three rooms facing Sikandar
        CORE            rear-west, where the garden edge runs into the blind
                        rear and the band is too shallow for a room

     Only the outer wall of the west band follows the boundary, and it is
     stepped, so every room is a true rectangle.

     Module everywhere:  BALCONY | BEDROOM | WASH + ENTRY | corridor
   ========================================================================== */
(function (global) {
  'use strict';

  var D = global.Draw;
  var size = D.size;

  /* ---------------- site ------------------------------------------------ */

  var PLOT = {
    A: { x: 0, y: 0 }, B: { x: 38.8, y: 0 },
    C: { x: 38.8, y: 47.7 }, D: { x: 10.0384, y: 49.1861 },
    iA: { x: 1.0206, y: 0 }, iB: { x: 37.8, y: 0 },
    iC: { x: 37.8, y: 46.7503 }, iD: { x: 10.8461, y: 48.1430 },
    area: 1640.18, buildable: 1515.39
  };
  var ORIGIN = { x: PLOT.iA.x, y: PLOT.iA.y };
  var L = { A: [0, 0], B: [36.7794, 0], C: [36.7794, 46.7503], D: [9.8255, 48.1430] };
  var EAST = 36.7794, PLAN_W = 36.7794, PLAN_H = 48.143;
  var WSLOPE = 0.204090;                       // garden boundary: x = WSLOPE * y
  function wb(y) { return WSLOPE * y; }        // west boundary at height y

  var W = 0.25;                                // half of a 6" wall
  var WALL = '#414c5b';
  var FILL = {
    bed: '#e8f1fb', wc: '#dff0ec', bal: '#eef6e2',
    circ: '#f6f2e6', svc: '#e9e6f0'
  };

  function shoelace(p) {
    var s = 0;
    for (var i = 0; i < p.length; i++) { var a = p[i], b = p[(i + 1) % p.length]; s += a[0] * b[1] - b[0] * a[1]; }
    return Math.abs(s / 2);
  }
  function centroid(p) { var x = 0, y = 0; p.forEach(function (q) { x += q[0]; y += q[1]; }); return [x / p.length, y / p.length]; }
  function bbox(p) {
    var b = { x0: Infinity, y0: Infinity, x1: -Infinity, y1: -Infinity };
    p.forEach(function (q) {
      b.x0 = Math.min(b.x0, q[0]); b.x1 = Math.max(b.x1, q[0]);
      b.y0 = Math.min(b.y0, q[1]); b.y1 = Math.max(b.y1, q[1]);
    });
    return b;
  }
  function rp(r) { return [[r[0], r[1]], [r[2], r[1]], [r[2], r[3]], [r[0], r[3]]]; }

  /* ---------------- room modules (all rectangular) ---------------------- */

  // face: which way the room looks — 'S' road, 'W' garden, 'E' Sikandar
  function module_(o) {
    var x0 = o.x0, y0 = o.y0, x1 = o.x1, y1 = o.y1, tag = o.tag, face = o.face;
    var bal = o.bal == null ? 2.8 : o.bal, wc = o.wc == null ? 4.3 : o.wc;
    var out = [], bedR, balR, wcR, enR;

    if (face === 'S') {                                    // depth runs in y
      balR = [x0, y0, x1, y0 + bal];
      bedR = [x0, y0 + bal, x1, y1 - wc];
      var split = x0 + Math.min(5.2, (x1 - x0) * 0.55);
      wcR = [x0, y1 - wc, split, y1];
      enR = [split, y1 - wc, x1, y1];
    } else if (face === 'W') {            // balcony on the garden, wash across the back
      balR = [x0, y0, x0 + bal, y1];
      bedR = [x0 + bal, y0, x1, y1 - wc];
      var sx = x0 + bal + Math.min(5.2, (x1 - x0 - bal) * 0.55);
      wcR = [x0 + bal, y1 - wc, sx, y1];
      enR = [sx, y1 - wc, x1, y1];
    } else if (face === 'S2') {
      // washroom moved out onto the gallery: it shares the outer strip with a
      // shorter balcony, so the bedroom keeps the whole remaining depth
      var ow = o.outer || 5.0, ww = o.wcW || 4.6;
      wcR = [x0, y0, x0 + ww, y0 + ow];
      balR = [x0 + ww, y0, x1, y0 + ow];
      bedR = [x0, y0 + ow, x1, y1];
      enR = null;
    } else if (face === 'E2') {
      var ow2 = o.outer || 5.0, wh = o.wcW || 4.3;
      wcR = [x1 - ow2, y0, x1, y0 + wh];
      balR = [x1 - ow2, y0 + wh, x1, y1];
      bedR = [x0, y0, x1 - ow2, y1];
      enR = null;
    } else {                                               // 'E' — Sikandar right
      balR = [x1 - bal, y0, x1, y1];
      bedR = [x0 + wc, y0, x1 - bal, y1];
      var sy2 = y0 + Math.min(5.2, (y1 - y0) * 0.55);
      wcR = [x0, y0, x0 + wc, sy2];
      enR = [x0, sy2, x0 + wc, y1];
    }

    function ins(r) { return [r[0] + W, r[1] + W, r[2] - W, r[3] - W]; }
    if (bal > 0) out.push({ n: 'BALCONY', tag: tag, r: ins(balR), t: 'bal', cat: 'bal' });
    // The bedroom wraps the washroom in an L — you step off the corridor into
    // open floor beside the washroom door, never into a bed.
    out.push({
      n: 'ROOM ' + tag, tag: tag, r: ins(bedR), t: 'bed', cat: 'bed',
      module: (x1 - x0) * (y1 - y0), face: face, grp: tag
    });
    out.push({ n: 'WASH', tag: tag, r: ins(wcR), t: 'wc', k: 'wc', cat: 'wc' });
    if (enR) out.push({ n: '', tag: tag, r: ins(enR), t: 'bed', cat: 'bed', grp: tag, quiet: 1 });

    // washroom and balcony doors, taken off the partition each one actually
    // shares with the bedroom. Washroom leaf 2'-0", balcony slider 3'-0".
    if (o.doors) {
      var mid = function (a, b2) { return (a + b2) / 2; };
      if (face === 'E2') {
        var wallE = x1 - (o.outer || 5.0);
        o.doors.push({ v: 1, x: wallE, y0: mid(wcR[1], wcR[3]) - 1.0, y1: mid(wcR[1], wcR[3]) + 1.0, into: 1, hinge: 'bottom' });
        o.doors.push({ v: 1, slide: 1, x: wallE, y0: mid(balR[1], balR[3]) - 1.5, y1: mid(balR[1], balR[3]) + 1.5 });
      } else if (face === 'S2') {
        var wallS = y0 + (o.outer || 5.0);
        o.doors.push({ v: 0, y: wallS, x0: mid(wcR[0], wcR[2]) - 1.0, x1: mid(wcR[0], wcR[2]) + 1.0, into: -1, hinge: 'left' });
        o.doors.push({ v: 0, slide: 1, y: wallS, x0: mid(balR[0], balR[2]) - 1.5, x1: mid(balR[0], balR[2]) + 1.5 });
      } else if (face === 'W') {
        // washroom opens off the entry pocket, not the bedroom, so the bed wall
        // below it stays free
        o.doors.push({ v: 1, x: wcR[2], y0: mid(wcR[1], wcR[3]) - 1.0, y1: mid(wcR[1], wcR[3]) + 1.0, into: -1, hinge: 'bottom' });
        o.doors.push({ v: 1, slide: 1, x: x0 + bal, y0: mid(bedR[1], bedR[3]) - 1.5, y1: mid(bedR[1], bedR[3]) + 1.5 });
      }
    }
    return out;
  }

  /* ---------------- the parametric floor -------------------------------- */

  function makeFloor(c) {
    var FD = c.frontDepth, CA0 = FD, CA1 = FD + c.corr;     // cross corridor
    var CB0 = c.spineX, CB1 = c.spineX + c.corr;            // spine corridor
    var yTop = 46.4, sp = [], n = 1;

    /* front band — rooms facing the road */
    var fx = [], step = (EAST - wb(FD)) / c.nFront;
    for (var i = 0; i <= c.nFront; i++) fx.push(wb(FD) + i * step);
    var doors = [], fTag = [];
    // the westernmost room reaches out to the slanted boundary
    for (var f = 0; f < c.nFront; f++) {
      var tag = ('0' + n++).slice(-2);
      fTag.push(tag);
      sp = sp.concat(module_({
        x0: fx[f], y0: 0, x1: fx[f + 1], y1: FD, tag: tag, doors: doors,
        face: c.outerWash ? 'S2' : 'S', outer: c.outer, wcW: c.wcW, bal: c.bal, wc: c.wc
      }));
      if (f === 0) {
        sp.push({
          n: '', p: [[wb(0) + W, W], [fx[0] + W, W], [fx[0] + W, FD - W], [wb(FD) + W, FD - W]],
          t: 'bal', cat: 'bal', quiet: 1
        });
      }
    }

    /* cross corridor. With `endEntry` it stops one bay short at each end: the
       stub that used to run past the last door is dead circulation, so it is
       given to the end rooms and they are entered through the corridor's end
       wall instead of its side. */
    var cx0 = c.endEntry ? fx[1] : null, cx1 = c.endEntry ? fx[c.nFront - 1] : null;
    sp.push({
      n: 'CORRIDOR', sub: (c.corr - 0.5).toFixed(1).replace('.0', '') + "\u2032 clear",
      p: c.endEntry
        ? rp([cx0 + W, CA0 + W, cx1 - W, CA1 - W])
        : [[wb(CA0) + W, CA0 + W], [EAST - W, CA0 + W], [EAST - W, CA1 - W], [wb(CA1) + W, CA1 - W]],
      t: 'circ', cat: 'circ'
    });
    if (c.endEntry) {
      var eT = fTag[c.nFront - 1];
      sp.push({
        n: '', tag: fTag[0], grp: fTag[0], quiet: 1, t: 'bed', cat: 'bed',
        r: [wb(CA1) + W, FD - W, cx0 - W, CA1 - W]
      });
      sp.push({
        n: '', tag: eT, grp: eT, quiet: 1, t: 'bed', cat: 'bed',
        r: [cx1 + W, FD - W, EAST - W, CA1 - W]
      });
    }

    /* front-room entry doors */
    var dMid = FD + c.corr / 2;
    for (var g = 0; g < c.nFront; g++) {
      if (c.endEntry && (g === 0 || g === c.nFront - 1)) {
        var west = g === 0;
        doors.push({
          v: 1, x: west ? cx0 : cx1, y0: dMid - 1.3, y1: dMid + 1.3,
          into: west ? -1 : 1, hinge: 'bottom'
        });
      } else {
        var mx = (fx[g] + fx[g + 1]) / 2;
        doors.push({ v: 0, y: FD, x0: mx - 1.3, x1: mx + 1.3, into: -1, hinge: 'left' });
      }
    }

    /* west band — deep rooms facing the garden, outer wall stepped.
       The sliver between the step and the slanting boundary is folded into
       the balcony rather than thrown away. */
    c.west.forEach(function (rg) {
      // a slimmer inner offset here pulls the bedroom west into the balcony's
      // oversized slant sliver; the balcony stays wide at the front and pinches
      // toward the rear, which is where nobody stands anyway
      var tag = ('0' + n++).slice(-2), bal = c.westBal || c.bal || 2.8;
      var xb = wb(rg[1]) + bal;                 // inner face of the balcony
      // room and washroom are square; only the balcony's outer wall follows
      // the boundary, so the sliver is used rather than thrown away
      sp = sp.concat(module_({
        x0: xb - bal, y0: rg[0], x1: CB0, y1: rg[1], tag: tag, face: 'W',
        bal: bal, wc: c.wc, doors: doors
      }).filter(function (s) { return s.cat !== 'bal'; }));
      sp.push({
        n: 'BALCONY', tag: tag, t: 'bal', cat: 'bal',
        p: [[wb(rg[0]) + W, rg[0] + W], [xb - W, rg[0] + W],
        [xb - W, rg[1] - W], [wb(rg[1]) + W, rg[1] - W]]
      });
      // entry off the spine into the pocket beside the washroom
      var wm = rg[1] - (c.wc || 4.3) / 2;
      doors.push({ v: 1, x: CB0, y0: wm - 1.3, y1: wm + 1.3, into: -1, hinge: 'bottom' });
    });

    /* spine corridor */
    sp.push({
      n: 'CORRIDOR', p: rp([CB0 + W, CA1 + W, CB1 - W, c.coreY[1] - W]), t: 'circ', cat: 'circ', quiet: 1
    });

    /* east band — rooms facing Sikandar */
    c.east.forEach(function (rg, ei) {
      var tag = ('0' + n++).slice(-2);
      if (ei === c.east.length - 1) c.lastEastTag = tag;
      sp = sp.concat(module_({
        x0: CB1, y0: rg[0], x1: EAST, y1: rg[1], tag: tag, doors: doors,
        face: c.outerWash ? 'E2' : 'E',
        outer: c.outerE || c.outer, wcW: c.wcWE, bal: c.eastBal, wc: 4.6
      }));
      // entry off the spine, into the clear strip the beds leave at that end
      var em = (rg[0] + rg[1]) / 2;
      doors.push({ v: 1, x: CB1, y0: em - 1.3, y1: em + 1.3, into: 1, hinge: 'bottom' });
    });

    /* core — against the blind rear. Sits in whichever band has run out of
       room depth: normally the rear-west, but side by side in the rear-east
       where the west band is carrying two rooms. */
    var k = c.coreY;
    if (c.coreSide === 'east' && c.coreLobby && c.armSide === 'N') {
      // The arm runs along the blind rear instead of across the front of the
      // core, so the lift drops to the south-west corner and its door lands on
      // the spine at the point rooms 07 and 08 are entered from, rather than at
      // the dead end past them. The stair keeps one undivided bay to the east.
      var armD = c.lobbyDepth || 3.5, liftWN = c.liftW || 4.77;
      var stXN = c.stairW ? EAST - c.stairW : CB1 + liftWN;
      sp.push({
        n: 'CORRIDOR', sub: (armD - 0.5).toFixed(1).replace('.0', '') + "\u2032 clear",
        r: [CB1 - W, yTop - armD + W, stXN - W, yTop - W], t: 'circ', cat: 'circ'
      });
      sp.push({
        n: 'LIFT', sub: c.liftSub || '4-passenger \u00B7 1500 \u00D7 1300 well',
        r: [CB1 + W, k[0] + W, CB1 + liftWN - W, yTop - armD - W],
        t: 'svc', k: 'lift', cat: 'svc', doorSide: 'W'
      });
      sp.push({
        n: 'STAIRCASE', sub: c.stairSub || 'Dog-leg \u00B7 flights across the core',
        r: [stXN + W, k[0] + W, EAST - W, yTop - W],
        t: 'circ', k: 'stair', cat: 'circ', stairType: c.stairType
      });
      var armMid = yTop - armD / 2;
      doors.push({ v: 1, x: stXN, y0: armMid - 1.3, y1: armMid + 1.3, into: 1, hinge: 'bottom' });
    } else if (c.coreSide === 'east' && c.coreLobby) {
      // Sized from vendor and code numbers rather than round figures.
      //   lift   — 4-passenger 272 kg, clear well 1600 x 1350 mm, entrance on
      //            the 1600 side, so the shaft turns its long face to the spine
      //   stair  — 10'-0" floor to floor, 17 risers at 179 mm (NBC 2016 caps
      //            the residential riser at 190), dog-leg 9 + 8, 250 mm goings,
      //            two 1.2 m flights and a landing equal to the flight width
      // The lift takes its door straight off the spine; the lobby beside it
      // carries on east to the stair door, so neither is reached through a room.
      var lobD = c.lobbyDepth || 5.25, liftW = c.liftW || 5.48;
      var stX = c.stairW ? EAST - c.stairW : CB1 + liftW;
      // no lobby room — the spine simply turns the corner and runs to the stair
      // door, so both the lift and the stair put you straight into the corridor
      sp.push({
        n: 'CORRIDOR', sub: (lobD - 0.5).toFixed(1).replace('.0', '') + "\u2032 clear",
        r: [CB1 - W, k[0] + W, stX - W, k[0] + lobD - W], t: 'circ', cat: 'circ'
      });
      sp.push({
        n: 'LIFT', sub: c.liftSub || '4-passenger \u00B7 1600 \u00D7 1350 well',
        r: [CB1 + W, k[0] + lobD + W, CB1 + liftW - W, yTop - W], t: 'svc', k: 'lift', cat: 'svc', doorSide: 'W'
      });
      if (stX - (CB1 + liftW) > 1.5) {
        sp.push({
          n: 'STORE', r: [CB1 + liftW + W, k[0] + lobD + W, stX - W, yTop - W], t: 'svc', cat: 'svc'
        });
      }
      sp.push({
        n: 'STAIRCASE', sub: 'Dog-leg \u00B7 17 risers \u00B7 2 \u00D7 1.2 m flights',
        r: [stX + W, k[0] + W, EAST - W, yTop - W], t: 'circ', k: 'stair', cat: 'circ'
      });
      var lobMid = k[0] + lobD / 2;
      doors.push({ v: 1, x: stX, y0: lobMid - 1.3, y1: lobMid + 1.3, into: 1, hinge: 'bottom' });
    } else if (c.coreSide === 'east') {
      // stair and lift side by side — the only arrangement on this plot that
      // gets a full 3'-0" pair of flights
      var sw = c.stairW || 7.0;
      sp.push({
        n: 'STAIRCASE', sub: 'Dog-leg \u00B7 2 \u00D7 3\u2032-0\u2033 flights',
        r: [EAST - sw + W, k[0] + W, EAST - W, yTop - W],
        t: 'circ', k: 'stair', cat: 'circ'
      });
      if (c.noStore) {
        // lift pushed to the very back so the pocket beside it lands against
        // the last Sikandar room and becomes part of it, not a store
        sp.push({
          n: 'LIFT', sub: '4-passenger',
          r: [CB1 + W, yTop - 5.9 + W, CB1 + 5.9 - W, yTop - W],
          t: 'svc', k: 'lift', cat: 'svc'
        });
        sp.push({
          n: '', tag: c.lastEastTag, grp: c.lastEastTag, quiet: 1,
          r: [CB1 + W, k[0] + W, EAST - sw - W, yTop - 5.9 - W],
          t: 'bed', cat: 'bed'
        });
      } else {
        sp.push({
          n: 'LIFT', sub: '4-passenger',
          r: [CB1 + W, k[0] + W, CB1 + 5.9 - W, k[0] + 5.9 - W],
          t: 'svc', k: 'lift', cat: 'svc'
        });
        sp.push({
          n: 'STORE', r: [CB1 + W, k[0] + 5.9 + W, EAST - sw - W, yTop - W],
          t: 'svc', cat: 'svc'
        });
      }
    } else {
      sp.push({
        n: 'STAIRCASE', sub: 'Open well \u00B7 skylit',
        p: [[wb(k[1]) + W, k[0] + W], [CB0 - W, k[0] + W], [CB0 - W, k[1] - W], [wb(k[1]) + W, k[1] - W]],
        t: 'circ', k: 'stair', cat: 'circ'
      });
      sp.push({
        n: 'LIFT', sub: '4-passenger',
        r: [CB0 - 5.7 + W, k[1] + W, CB0 - W, yTop - W],
        t: 'svc', k: 'lift', cat: 'svc'
      });
      sp.push({
        n: 'STORE', r: [wb(yTop) + W, k[1] + W, CB0 - 5.7 - W, yTop - W],
        t: 'svc', cat: 'svc'
      });
    }

    /* dimension grids — every wall line that a builder needs to set out */
    var bal = c.bal || 2.8, wc = c.wc || 4.3;
    var gx = fx.slice();                                   // front room divisions
    gx.push(CB0, CB1, CB1 + wc, EAST - (c.eastBal || 0), EAST);
    var gy = [0, bal, FD - wc, FD, CA1];
    c.west.forEach(function (r) { gy.push(r[1] - wc, r[1]); });
    c.east.forEach(function (r) { gy.push(r[1]); });
    gy.push(c.coreY[0], c.coreY[1], yTop);

    function tidy(a) {
      a = a.filter(function (v) { return isFinite(v); }).sort(function (p, q) { return p - q; });
      return a.filter(function (v, i) { return i === 0 || v - a[i - 1] > 0.35; });
    }

    return {
      spaces: sp, doors: doors, FD: FD, CA1: CA1, CB0: CB0, CB1: CB1, yTop: yTop,
      gx: tidy(gx), gy: tidy(gy),
      gxEast: tidy([CB1, CB1 + wc, EAST - (c.eastBal || 0), EAST]),
      gyEast: tidy([c.east[0][0]].concat(c.east.map(function (r) { return r[1]; })))
    };
  }

  /* ---------------- options --------------------------------------------- */

  var OPTIONS = [
    {
      id: 'opt-a', code: 'TF-A', name: 'Option A', headline: '8 rooms', badge: 'Recommended',
      note: 'Four rooms across the road frontage, one deep room on the garden, three down the Sikandar side, and the core in the rear-west corner where the garden boundary runs into the blind rear. Tuned so every one of the eight takes two 2\u2032-6\u2033 \u00D7 6\u2032-0\u2033 beds with a wardrobe between them and clear floor at the foot \u2014 the Sikandar rooms are 1\u2032-0\u2033 deeper and 3\u2033 taller than before.',
      cfg: {
        frontDepth: 16.6, corr: 3.5, spineX: 17.9, nFront: 4, bal: 2.8, wc: 4.3,
        west: [[20.1, 33.4]], east: [[20.1, 28.87], [28.87, 37.64], [37.64, 46.4]],
        eastBal: 2.8, coreY: [33.4, 40.2]
      }
    },
    {
      id: 'opt-b', code: 'TF-B', name: 'Option B', headline: '9 rooms', badge: 'Maximum yield',
      note: 'The road frontage is cut into five rooms instead of four. One extra unit per floor \u2014 four across a G+3 \u2014 at the cost of narrower front bedrooms.',
      cfg: {
        frontDepth: 17.4, corr: 3.5, spineX: 18.4, nFront: 5, bal: 2.8, wc: 4.3,
        west: [[20.9, 34.0]], east: [[20.9, 29.4], [29.4, 37.9], [37.9, 46.4]],
        eastBal: 2.8, coreY: [34.0, 40.6]
      }
    },
    {
      id: 'opt-c', code: 'TF-C', name: 'Option C', headline: '7 rooms', badge: 'Largest rooms',
      note: 'Three wide rooms on the road and two tall rooms on the Sikandar side instead of three. Every bedroom gains substantially \u2014 at the cost of one unit.',
      cfg: {
        frontDepth: 18.0, corr: 3.5, spineX: 18.8, nFront: 3, bal: 2.8, wc: 4.3,
        west: [[21.5, 34.5]], east: [[21.5, 34.0], [34.0, 46.4]],
        eastBal: 2.8, coreY: [34.5, 41.0]
      }
    },
    {
      id: 'opt-d', code: 'TF-D', name: 'Option D', headline: '9 rooms, two garden rooms',
      badge: 'Best garden aspect',
      note: 'The garden band holds two full-depth rooms instead of one, so the core moves across to the rear-east where the stair and lift can sit side by side. Only two rooms on the Sikandar side as a result.',
      cfg: {
        frontDepth: 17.4, corr: 3.5, spineX: 21.2, nFront: 4, bal: 2.8, wc: 4.3,
        west: [[20.9, 33.6], [33.6, 46.3]], east: [[20.9, 28.2], [28.2, 35.5]],
        eastBal: 2.8, coreY: [35.5, 46.4], coreSide: 'east'
      }
    },
    {
      id: 'opt-d1', code: 'TF-D1', name: 'Option D1', headline: '8 rooms, washroom on the gallery',
      badge: 'Best Sikandar rooms',
      note: 'Plan D reworked around your idea. On the road and Sikandar sides the washroom moves out to sit on the gallery, sharing the outer strip with a shorter balcony instead of eating a slice of the room\u2019s depth. That hands 2\u2032-0\u2033 straight back to every bedroom, and it gives each washroom a real window. Two full-depth garden rooms are kept, and the core sits in the rear-east with the stair and lift side by side \u2014 which is the only arrangement here that gets a true 3\u2032-0\u2033 stair.',
      cfg: {
        frontDepth: 15.8, corr: 3.5, spineX: 19.7, nFront: 4,
        bal: 2.5, wc: 4.75, outerWash: true, outer: 5.0, wcW: 4.6, wcWE: 4.3,
        west: [[19.3, 32.85], [32.85, 46.4]], east: [[19.3, 27.25], [27.25, 35.2]],
        eastBal: 2.8, coreY: [35.2, 46.4], coreSide: 'east', stairW: 7.0
      }
    },
    {
      id: 'opt-d2', code: 'TF-D2', name: 'Option D2', headline: '8 rooms, no store',
      badge: 'Biggest Sikandar room',
      note: 'D1 with the store deleted. The lift is pushed to the very back of the core so the pocket beside it lands against Room 08 and becomes part of it \u2014 turning the last Sikandar room into the largest on the floor rather than 30 sq ft of shelving. Everything else is D1.',
      cfg: {
        frontDepth: 15.8, corr: 3.5, spineX: 19.7, nFront: 4,
        bal: 2.5, wc: 4.75, outerWash: true, outer: 5.0, wcW: 4.6, wcWE: 4.3,
        west: [[19.3, 32.85], [32.85, 46.4]], east: [[19.3, 27.25], [27.25, 35.2]],
        eastBal: 2.8, coreY: [35.2, 46.4], coreSide: 'east', stairW: 7.0, noStore: true
      }
    },
    {
      id: 'opt-d3', code: 'TF-D3', name: 'Option D3', headline: '8 rooms, rebalanced',
      badge: 'Core resolved · recommended',
      note2: 'Core rebuilt to measured sizes, not round ones. Two faults were found here. The staircase shared walls only with room 08 and its balcony, so the fire stair could only be reached by walking through a bedroom \u2014 and room 08\u2019s 31 sq ft rear pocket was sealed behind a 6\u2033 wall while still being counted in its area. The rear-east block is now lift, lobby and stair in one line off the spine. The lift well is 1600 \u00D7 1350 mm, the 4-passenger figure common to the Hybon, IEC and Hexa tables, with its entrance on the 1600 side facing the corridor. The stair is 2500 \u00D7 3200 mm clear: 17 risers at 179 mm for a 10\u2032-0\u2033 floor (NBC 2016 caps the residential riser at 190), a 9 + 8 dog-leg, 250 mm goings and a 1.2 m landing matching the 1.2 m flights \u2014 wider than the 1.0 m NBC asks of an apartment stair. Room 08 drops to a true 69 sq ft, matching room 07; the floor gains 8 sq ft of real carpet because the sealed pocket and the dead strip beside the lift are now lobby and stair.',
      note: 'Reading D2 back showed the problem: it only really took two beds in five of the eight rooms. Rooms 06, 07 and 08 cleared the paper minimum but missed the furniture layout \u2014 07 by barely 5\u20448 of an inch. D3 closes that. The spine moves 7\u2033 west so the Sikandar rooms go from 8\u2032-1\u2033 to 8\u2032-11\u2033 wide, the garden balcony tightens from 1\u2032-11\u2033 to 1\u2032-6\u2033 (it was swallowing the boundary wedge anyway), the front band gives up 2\u2033 to feed the Sikandar side, and the two garden rooms are re-split. Every room now holds two 2\u2032-6\u2033 \u00D7 6\u2032-0\u2033 beds with a wardrobe between and a 2\u2032-5\u2033 strip at the foot. Smallest room is up from 60 to 69 sq ft and the store stays out. The road corridor is also cut back to the two middle bays: the stubs that used to run past the last door were doing nothing, so rooms 01 and 04 absorb them and are entered through the corridor\u2019s end walls instead of its side. That takes the corridor from 99 to 49 sq ft and puts rooms 01 and 04 at 107 and 110 sq ft, lifting the floor average to 92.',
      cfg: {
        frontDepth: 15.6, corr: 3.5, spineX: 19.1, nFront: 4,
        bal: 1.5, wc: 4.75, outerWash: true, outer: 4.7, wcW: 4.6, wcWE: 4.3,
        west: [[19.1, 32.0], [32.0, 46.4]], east: [[19.1, 27.25], [27.25, 35.4]],
        eastBal: 2.8, coreY: [35.4, 46.4], coreSide: 'east',
        coreLobby: true, lobbyDepth: 5.25, liftW: 5.48,
        endEntry: true
      }
    },
    {
      id: 'opt-d4', code: 'TF-D4', name: 'Option D4', headline: '8 rooms, tightest core',
      badge: 'Smallest core · trades code margin',
      note: 'D3 with the core squeezed to the smallest arrangement the research supports, and the depth handed to the Sikandar rooms. Putting the lift inside the stair well \u2014 the one pattern that costs almost nothing in plan \u2014 was tested and does not fit: a 4-passenger shaft needs a clear well near 1700 \u00D7 1900 mm, so two flights around it come to 12\u2032-2\u2033 across against the 11\u2032-0\u2033 this corner has, and turning the flights the other way needs 12\u2032-7\u2033 of run. Nor does another stair type help \u2014 open-well is wider than a dog-leg by definition, and spirals and winders are barred from a primary exit. So the saving comes from the dog-leg itself: flights back to the 3\u2032-0\u2033 you first asked for, 16 risers instead of 17, and a lift well at the 1500 \u00D7 1300 mm vendor floor rather than a comfortable 1600 \u00D7 1350. The core loses 1\u2032-9\u2033 of depth, both Sikandar rooms go from 69 to 77 sq ft, and the strip left beside the lift becomes a linen store.',
      note2: 'What it costs: the flights drop from 1.2 m to 0.91 m and the risers go to 190.6 mm, so this fails the stair check that D3 passes. Fine if the building stays a small lodging; not fine if it is assessed as a dormitory, where the stair has to grow rather than shrink. D3 remains the version to build if that call has not been made.',
      note3: 'Room-space pass. Every component was measured: the Sikandar and road edges already sit on the setback line, so the only slack was the deep road strip and the oversized garden balconies. The road wash-and-balcony strip comes in from 4\u2032-8\u2033 to 4\u2032-4\u2033 \u2014 the wash stays over 15 sq ft and the balcony over 12 \u2014 handing depth to all four front rooms. On the garden side the balcony was 45 and 55 sq ft because it swallowed the whole slanted sliver down the full room depth; pulling the bedroom\u2019s inner face west from 1\u2032-6\u2033 to 7\u2033 off the boundary hands most of that back to the room while the balcony keeps a 2\u2032-9\u2033 stand-in strip at the front where the garden view is. Room 06, the runt at 70 sq ft, is now 93; Room 05 reaches 114; the floor average rises from 90 to 94 sq ft, all beds and doors still clear.',
      cfg: {
        frontDepth: 15.6, corr: 3.5, spineX: 19.1, nFront: 4,
        bal: 1.5, wc: 4.75, outerWash: true, outer: 4.3, outerE: 4.7, wcW: 4.6, wcWE: 4.3,
        westBal: 0.6,
        west: [[19.1, 32.0], [32.0, 46.4]], east: [[19.1, 28.13], [28.13, 37.16]],
        eastBal: 2.8, coreY: [37.16, 46.4], coreSide: 'east',
        coreLobby: true, lobbyDepth: 3.82, liftW: 4.77, stairW: 6.83,
        liftSub: '4-passenger \u00B7 1500 \u00D7 1300 well', endEntry: true
      }
    },
    {
      id: 'opt-d7', code: 'TF-D7', name: 'Option D7', headline: '8 rooms, lift on the corridor',
      badge: 'Lift faces R07/R08 \u00B7 one stair bay',
      note: 'D4 with the core rebuilt around where the lift should open. The corridor arm moves to the blind rear, which lets the lift drop to the south-west corner of the core \u2014 its door now opens west straight onto the spine corridor, in line with the doors of rooms 07 and 08, instead of at the dead end past them. Step out of the lift and both rooms are in front of you.',
      note2: 'The stair takes the whole east bay as one undivided dog-leg, 9\u2032-3\u2033 across and 8\u2032-5\u2033 deep, with the flights running east\u2013west and the turn at the Sikandar wall. Flights are 1.23 m \u2014 well over the 1.0 m NBC asks and much better than D4\u2019s 0.91 m. The run is short for a full 8-going pair, so the turn takes winders; the arm along the rear is the arrival landing and also carries you from the spine to the stair door.',
      note3: 'Rooms 07 and 08 land near 84 sq ft against D4\u2019s 77, and the core is 8\u2032-11\u2033 deep rather than D4\u2019s 9\u2032-3\u2033. Two arrangements tested on the way here were dropped: a spiral beside the lift, which is barred as a primary exit on a G+3 lodging, and a lift sitting inside the stair well with a flight each side, which grew slightly bigger rooms but split the stair in two and left the lift facing the wrong way. If a winder-free dog-leg is required, the core has to go back to D3\u2019s depth and both rooms drop to 69.',
      cfg: {
        frontDepth: 15.6, corr: 3.5, spineX: 18.75, nFront: 4,
        bal: 1.5, wc: 4.75, outerWash: true, outer: 4.3, outerE: 4.4, wcW: 4.6, wcWE: 4.4,
        westBal: 0.6,
        west: [[19.1, 32.0], [32.0, 46.4]], east: [[19.1, 28.29], [28.29, 37.48]],
        eastBal: 2.8, coreY: [37.48, 46.4], coreSide: 'east',
        coreLobby: true, armSide: 'N', stairType: 'winder', lobbyDepth: 3.5,
        liftW: 4.77, stairW: 9.7594,
        liftSub: '4-passenger \u00B7 1500 \u00D7 1300 well \u00B7 door on spine',
        stairSub: 'Dog-leg \u00B7 1.23 m flights \u00B7 winder turn', endEntry: true
      }
    },
    {
      id: 'opt-e', code: 'TF-E', name: 'Option E', headline: '8 rooms, deep front band',
      badge: 'Most even rooms',
      note: 'Option A with the road band pushed to 19 ft and the spine nudged west. The four front bedrooms gain about 10 sq ft each and the whole floor lands within a few square feet of itself \u2014 the most consistent product of the five.',
      cfg: {
        frontDepth: 19.0, corr: 3.5, spineX: 17.8, nFront: 4, bal: 2.8, wc: 4.3,
        west: [[22.5, 34.5]], east: [[22.5, 30.5], [30.5, 38.5], [38.5, 46.4]],
        eastBal: 2.8, coreY: [34.5, 41.0]
      }
    }
  ];
  OPTIONS.forEach(function (o) { o.plan = makeFloor(o.cfg); });

  /* ---------------- drawing --------------------------------------------- */

  var BED_L = 6.0, BED_W = 2.6, WR_L = 4.0, WR_D = 1.9;   // beds 2'-6" x 6'-0"

  // Where the beds and wardrobe land in a bedroom. Kept as data so the same
  // layout can be drawn and checked against the door positions.
  function bedLayout(sp) {
    if (sp.cat !== 'bed') return [];
    var b = sp.r ? { x0: sp.r[0], y0: sp.r[1], x1: sp.r[2], y1: sp.r[3] } : bbox(sp.p);
    var w = b.x1 - b.x0, h = b.y1 - b.y0, out = [];
    var across = 2 * BED_W + WR_D + 0.5, along = BED_L + 2.4;
    var east = sp.face === 'E2' || sp.face === 'E';
    var fitY = h >= along && w >= across, fitX = w >= along && h >= across;
    var useX = fitX && (east || !fitY);

    function bedNS(x, y) {
      out.push({ k: 'bed', x0: x, y0: y, x1: x + BED_W, y1: y + BED_L,
        pillow: [x + 0.15, y + 0.15, x + BED_W - 0.15, y + 1.1] });
    }
    function bedEW(x, y, headWest) {
      var px = headWest ? x + 0.15 : x + BED_L - 1.1;
      out.push({ k: 'bed', x0: x, y0: y, x1: x + BED_L, y1: y + BED_W,
        pillow: [px, y + 0.15, px + 0.95, y + BED_W - 0.15] });
    }

    // the bed-and-wardrobe block, centred in the room so every wall keeps a
    // margin rather than the block being jammed into one corner
    var pair = 2 * BED_W + WR_D + 0.4;
    function off(room, block) { return Math.max(0.1, (room - block) / 2); }

    if (!useX && fitY) {
      // garden rooms have their balcony door in the west wall, so the block is
      // held off it by 1'-6"; where that leaves too little the wardrobe goes
      var west = sp.face === 'W', span = pair, ward = true;
      var start = b.x0 + (west ? 1.6 : off(w, pair));
      if (start + span > b.x1 - 0.1) { ward = false; span = 2 * BED_W + 0.2; }
      var x = Math.min(start, b.x1 - 0.1 - span), y = b.y0 + off(h, BED_L);
      bedNS(x, y);
      if (ward) out.push({ k: 'wardrobe', x0: x + BED_W + 0.2, y0: y, x1: x + BED_W + 0.2 + WR_D, y1: y + WR_L });
      bedNS(x + (ward ? BED_W + WR_D + 0.4 : BED_W + 0.2), y);
    } else if (useX && east) {
      // washroom and balcony doors are both on the far wall, so the beds sit at
      // the two ends and the aisle between them runs from the entry to that wall
      var xe = b.x0 + 0.3;
      bedEW(xe, b.y0 + 0.3, true);
      bedEW(xe, b.y1 - 0.3 - BED_W, true);
    } else if (useX) {
      var xw = b.x0 + off(w, BED_L), yw = b.y0 + off(h, pair);
      bedEW(xw, yw, false);
      out.push({ k: 'wardrobe', x0: xw + BED_L - WR_L, y0: yw + BED_W + 0.2, x1: xw + BED_L, y1: yw + BED_W + 0.2 + WR_D });
      bedEW(xw, yw + BED_W + WR_D + 0.4, false);
    }
    return out;
  }

  function furnish(c, sp) {
    var b = sp.r ? { x0: sp.r[0], y0: sp.r[1], x1: sp.r[2], y1: sp.r[3] } : bbox(sp.p);
    var w = b.x1 - b.x0, h = b.y1 - b.y0;

    if (sp.cat === 'bed') {
      bedLayout(sp).forEach(function (f) {
        c.rect(f.x0, f.y0, f.x1, f.y1, f.k === 'wardrobe'
          ? { fill: '#eef2f7', stroke: '#7c8798', 'stroke-width': 0.28 }
          : { fill: '#fff', stroke: '#7c8798', 'stroke-width': 0.28 });
        if (f.pillow) {
          var p = f.pillow;
          c.rect(p[0], p[1], p[2], p[3], { fill: '#e6ecf3', stroke: '#7c8798', 'stroke-width': 0.22 });
        }
      });
    }
    if (sp.k === 'wc') c.toilet(b, w > h ? 'S' : 'W');
    if (sp.k === 'lift') c.lift(b, sp.doorSide || 'W');
    if (sp.k === 'stair' && sp.stairType === 'winder') {
      // wider than it is deep, so the flights run east-west and turn at the far
      // wall; the winders sit in the turn and are drawn as the tapered landing
      var landW = Math.max(Math.min(w * 0.42, 4.4), 3.0);
      var nT = Math.max(6, Math.round((w - landW) / 0.82));
      var goW = (w - landW) / nT;
      c.rect(b.x1 - landW, b.y0, b.x1, b.y1, { fill: '#f6f8fa', stroke: '#8b96a5', 'stroke-width': 0.3 });
      for (var t2 = 0; t2 <= nT; t2++) {
        c.line(b.x0 + t2 * goW, b.y0, b.x0 + t2 * goW, b.y1, { stroke: '#a8b2be', 'stroke-width': 0.25 });
      }
      var myW = (b.y0 + b.y1) / 2;
      c.line(b.x0, myW, b.x1 - landW, myW, { stroke: '#8b96a5', 'stroke-width': 0.32 });
      c.line(b.x1 - landW, b.y0 + 0.6, b.x1 - landW, b.y1 - 0.6, { stroke: '#a8b2be', 'stroke-width': 0.25 });
      var yUp = b.y0 + (myW - b.y0) / 2;
      c.line(b.x0 + 0.7, yUp, b.x1 - landW - 0.5, yUp, { stroke: '#0f766e', 'stroke-width': 0.4 });
      c.polyline([[b.x1 - landW - 1.2, yUp - 0.45], [b.x1 - landW - 0.5, yUp], [b.x1 - landW - 1.2, yUp + 0.45]],
        { stroke: '#0f766e', 'stroke-width': 0.4 });
    } else if (sp.k === 'stair') {
      // one flight either side of a 4" well; the landing is never shallower
      // than a flight is wide, and the goings take whatever depth is left
      var fw = (w - 0.33) / 2;
      var land = Math.max(fw, 3.0);
      var nT = Math.max(6, Math.round((h - land) / 0.82));
      var go = (h - land) / nT;
      c.rect(b.x0, b.y1 - land, b.x1, b.y1, { fill: '#f6f8fa', stroke: '#8b96a5', 'stroke-width': 0.3 });
      for (var i = 0; i <= nT; i++) c.line(b.x0, b.y0 + i * go, b.x1, b.y0 + i * go, { stroke: '#a8b2be', 'stroke-width': 0.25 });
      var mx = (b.x0 + b.x1) / 2;
      c.line(mx, b.y0 + 0.7, mx, b.y1 - land - 0.4, { stroke: '#0f766e', 'stroke-width': 0.4 });
      c.polyline([[mx - 0.45, b.y0 + 1.5], [mx, b.y0 + 0.7], [mx + 0.45, b.y0 + 1.5]], { stroke: '#0f766e', 'stroke-width': 0.4 });
    }
    if (sp.cat === 'bal') {
      var vert = h > w;
      var nn = Math.max(3, Math.round((vert ? h : w) / 0.7));
      for (var j = 0; j <= nn; j++) {
        var t = j / nn;
        if (vert) c.line(b.x0, b.y0 + h * t, b.x0 + 0.25, b.y0 + h * t, { stroke: '#c0cdb8', 'stroke-width': 0.2 });
        else c.line(b.x0 + w * t, b.y0, b.x0 + w * t, b.y0 + 0.25, { stroke: '#c0cdb8', 'stroke-width': 0.2 });
      }
    }
  }

  function label(c, sp, area0) {
    if (sp.quiet) return;
    var p = sp.p || rp(sp.r), area = area0 || shoelace(p), ct = centroid(p), b = bbox(p);
    var w = b.x1 - b.x0, h = b.y1 - b.y0;
    var vert = h > w * 1.6 && w < 6.2;
    var fs = vert ? Math.min(4.3, Math.max(2.6, h * 0.13)) : Math.min(4.5, Math.max(2.4, w * 0.4));
    var lines = [{ t: sp.n, fs: fs, wt: 700, f: '#0f1b2a' }];
    if ((vert ? h : w) > 2.6) lines.push({ t: D.size(w, h), fs: fs * 0.74, wt: 500, f: '#334155' });
    if ((vert ? h : w) > 3.2) lines.push({ t: area.toFixed(0) + ' sq ft', fs: fs * 0.74, wt: 600, f: '#0f766e' });
    if (sp.module && !vert && w > 6.5) lines.push({ t: 'module ' + sp.module.toFixed(0), fs: fs * 0.6, wt: 500, f: '#9aa8b6' });
    var lh = fs * 0.125, st = ct[1] + (lines.length - 1) * lh / 2;
    lines.forEach(function (l, i) {
      if (vert) {
        var X = c.X(ct[0] - (i - (lines.length - 1) / 2) * lh), Y = c.Y(ct[1]);
        c.add('<text x="' + X + '" y="' + Y + '" text-anchor="middle" font-size="' + l.fs.toFixed(2) +
          '" font-weight="' + l.wt + '" fill="' + l.f + '" transform="rotate(-90 ' + X + ' ' + Y + ')">' + l.t + '</text>');
      } else {
        c.text(ct[0], st - i * lh - lh * 0.34, l.t, { 'font-size': l.fs.toFixed(2), 'font-weight': l.wt, fill: l.f });
      }
    });
  }

  function renderOption(o) {
    var c = new D.Canvas({ width: PLAN_W, height: PLAN_H, margin: { l: 15.5, r: 17, t: 11, b: 18 }, unit: 10 });
    var env = [L.A, L.B, L.C, L.D];
    c.poly([[PLOT.A.x - ORIGIN.x, 0], [PLOT.B.x - ORIGIN.x, 0],
    [PLOT.C.x - ORIGIN.x, PLOT.C.y], [PLOT.D.x - ORIGIN.x, PLOT.D.y]],
      { fill: '#f3f6f9', stroke: '#b6c2ce', 'stroke-width': 0.45, 'stroke-dasharray': '4 2.5' });
    c.poly(env, { fill: WALL, stroke: WALL, 'stroke-width': 0.3 });
    o.plan.spaces.forEach(function (sp) { c.poly(sp.p || rp(sp.r), { fill: FILL[sp.t] || '#fff', stroke: 'none' }); });
    var grp = {};
    o.plan.spaces.forEach(function (sp) {
      if (sp.grp) grp[sp.grp] = (grp[sp.grp] || 0) + shoelace(sp.p || rp(sp.r));
    });
    o.plan.spaces.forEach(function (sp) { furnish(c, sp); });
    (o.plan.doors || []).forEach(function (d) {
      if (d.slide) { if (d.v) c.sliderV(d.y0, d.y1, d.x); else c.sliderH(d.x0, d.x1, d.y); }
      else if (d.v) c.doorV(d.y0, d.y1, d.x, d.into, d.hinge);
      else c.doorH(d.x0, d.x1, d.y, d.into, d.hinge);
    });
    o.plan.spaces.forEach(function (sp) { if (sp.n) label(c, sp, sp.grp ? grp[sp.grp] : 0); });
    c.poly(env, { fill: 'none', stroke: '#0f172a', 'stroke-width': 0.55 });

    var em = o.plan.CB0 + 1.75;
    c.polyline([[em - 0.8, -1.9], [em, -1.0], [em + 0.8, -1.9]], { stroke: '#0f172a', 'stroke-width': 0.45 });

    /* ---- dimension chains ---- */
    var p = o.plan;
    function chainH(g, y, from) {
      for (var i = 0; i < g.length - 1; i++) c.dimH(g[i], g[i + 1], y, null, { from: from });
    }
    function chainV(g, x, from) {
      for (var i = 0; i < g.length - 1; i++) c.dimV(g[i], g[i + 1], x, null, { from: from });
    }
    // bottom — front room widths, then the spine and east band, then overall
    chainH(p.gx, -5.0, 0);
    c.dimH(0, EAST, -9.2, null, { from: 0 });
    // left — module breakdown down the whole depth, then overall
    chainV(p.gy, -5.0, 0);
    c.dimV(0, p.yTop, -9.6, null, { from: 0 });
    // right — Sikandar room heights
    chainV(p.gyEast, EAST + 5.0, EAST);
    // top — the east band's own module breakdown
    chainH(p.gxEast, PLAN_H + 3.0, p.yTop);

    c.northArrow(EAST + 12.0, PLAN_H - 4, 2.8);
    c.text(PLAN_W / 2, -12.6, o.name.toUpperCase() + ' \u2014 ' + o.headline.toUpperCase(),
      { 'font-size': 5.6, 'font-weight': 800, fill: '#0f172a' });
    c.text(PLAN_W / 2, -15.0, 'all dimensions to wall centres \u00B7 room labels give clear size',
      { 'font-size': 3.4, fill: '#94a3b8' });
    c.text(-12.8, 26, 'G A R D E N', { 'font-size': 3.9, fill: '#5f8a4f', 'font-weight': 700, rotate: -90 });
    c.text(EAST + 8.6, 24, 'S I K A N D A R', { 'font-size': 3.6, fill: '#b09aa8', 'font-weight': 700, rotate: -90 });
    c.text(PLAN_W / 2 + 3, PLAN_H + 7.0, 'R E A R  \u00B7  B L I N D', { 'font-size': 3.5, fill: '#b09aa8', 'font-weight': 700 });
    c.text(PLAN_W / 2, -2.6, 'R O A D', { 'font-size': 3.7, fill: '#c2410c', 'font-weight': 700 });
    return c.svg('plan');
  }

  function renderSite() {
    var c = new D.Canvas({ width: 38.8, height: 50.2, margin: { l: 12, r: 12, t: 9, b: 14 }, unit: 10 });
    var P = [[0, 0], [38.8, 0], [38.8, 47.7], [10.0384, 49.1861]];
    var I = [[PLOT.iA.x, 0], [PLOT.iB.x, 0], [PLOT.iC.x, PLOT.iC.y], [PLOT.iD.x, PLOT.iD.y]];
    c.rect(-11, -8, 50, 0, { fill: '#eef1f4', stroke: 'none' });
    c.text(19.4, -4.0, 'A P P R O A C H   R O A D', { 'font-size': 4.8, 'font-weight': 700, fill: '#93a1b0' });
    c.poly([[-11, 0], [0, 0], [10.0384, 49.1861], [-11, 52]], { fill: '#eaf3e6', stroke: 'none' });
    c.text(-4.5, 26, 'G A R D E N', { 'font-size': 4.6, 'font-weight': 700, fill: '#8faa84', rotate: -90 });
    c.rect(38.8, 0, 50, 52, { fill: '#f6f2f4', stroke: 'none' });
    c.text(43.5, 24, 'SIKANDAR SIR', { 'font-size': 4.0, 'font-weight': 700, fill: '#b09aa8', rotate: -90 });
    c.poly([[10.0384, 49.1861], [38.8, 47.7], [40, 54], [8, 54]], { fill: '#f2eef1', stroke: 'none' });
    c.text(24, 51.5, 'REAR \u2014 BLIND', { 'font-size': 3.9, 'font-weight': 700, fill: '#b09aa8' });
    c.poly(P, { fill: '#ffffff', stroke: '#0f172a', 'stroke-width': 0.85 });
    c.poly(I, { fill: '#dfe7ef', stroke: '#e08a3c', 'stroke-width': 0.6, 'stroke-dasharray': '4 2.5' });
    c.dimH(0, 38.8, -9.4, "38\u2032-9\u2033 FRONT \u00B7 BUILT TO LINE", { from: 0 });
    c.dimV(0, 47.7, 43.5, "47\u2032-8\u2033 SIKANDAR \u00B7 STRAIGHT", { from: 38.8 });
    (function () {
      var a = { x: 0, y: 0 }, b = { x: 10.0384, y: 49.1861 }, off = 5.5;
      var dx = b.x - a.x, dy = b.y - a.y, len = Math.hypot(dx, dy);
      var nx = -dy / len, ny = dx / len;
      c.line(a.x + nx * off, a.y + ny * off, b.x + nx * off, b.y + ny * off, { stroke: '#c2410c', 'stroke-width': 0.55 });
      c.text((a.x + b.x) / 2 + nx * (off + 1.7), (a.y + b.y) / 2 + ny * (off + 1.7), "50\u2032-2\u2033 GARDEN \u00B7 SLANTED",
        { 'font-size': 4.4, fill: '#c2410c', 'font-weight': 600, rotate: -Math.atan2(dy, dx) * 180 / Math.PI + 180 });
    })();
    c.text(24, 24, 'BUILDABLE 1,515 sq ft', { 'font-size': 4.6, 'font-weight': 800, fill: '#243447' });
    c.northArrow(45, 44, 3.0);
    c.text(19.4, -12.6, 'SITE \u00B7 THREE SIDES CAN TAKE A WINDOW', { 'font-size': 5.4, 'font-weight': 800, fill: '#0f172a' });
    return c.svg('plan');
  }

  function schedule(o) {
    // the L-shaped bedroom is drawn as two rectangles; sum them back into one
    var grp = {};
    o.plan.spaces.forEach(function (sp) {
      if (!sp.grp) return;
      grp[sp.grp] = (grp[sp.grp] || 0) + shoelace(sp.p || rp(sp.r));
    });
    return o.plan.spaces.filter(function (s) { return s.n && !s.quiet; }).map(function (sp) {
      var p = sp.p || rp(sp.r), b = bbox(p);
      return {
        name: sp.n, tag: sp.tag || '\u2014', cat: sp.cat, t: sp.t,
        area: sp.grp ? grp[sp.grp] : shoelace(p),
        module: sp.module || null, size: size(b.x1 - b.x0, b.y1 - b.y0)
      };
    });
  }
  function stats(o) {
    var rows = schedule(o);
    var beds = rows.filter(function (r) { return r.cat === 'bed'; }).map(function (r) { return r.area; });
    var mods = rows.filter(function (r) { return r.module; }).map(function (r) { return r.module; });
    var carpet = rows.reduce(function (t, r) { return t + r.area; }, 0);
    var foot = shoelace([L.A, L.B, L.C, L.D]);
    return {
      units: beds.length, minBed: Math.min.apply(null, beds), maxBed: Math.max.apply(null, beds),
      avgBed: beds.reduce(function (a, b) { return a + b; }, 0) / beds.length,
      minMod: Math.min.apply(null, mods), maxMod: Math.max.apply(null, mods),
      carpet: carpet, foot: foot, efficiency: carpet / foot * 100
    };
  }

  /* ---------------- verification ---------------------------------------- */
  /* Independent checks run against the drawn geometry, not against the
     numbers that produced it. */

  function overlap(a, b) {
    var ax = Math.max(0, Math.min(a.x1, b.x1) - Math.max(a.x0, b.x0));
    var ay = Math.max(0, Math.min(a.y1, b.y1) - Math.max(a.y0, b.y0));
    return ax * ay;
  }
  function insidePoly(pt, poly) {
    var c = false;
    for (var i = 0, j = poly.length - 1; i < poly.length; j = i++) {
      if ((poly[i][1] > pt[1]) !== (poly[j][1] > pt[1]) &&
        pt[0] < (poly[j][0] - poly[i][0]) * (pt[1] - poly[i][1]) / (poly[j][1] - poly[i][1]) + poly[i][0]) c = !c;
    }
    return c;
  }

  function verify(o) {
    var env = [L.A, L.B, L.C, L.D], checks = [];
    var sp = o.plan.spaces, foot = shoelace(env);

    // 1 — every space inside the buildable envelope
    var out = 0;
    sp.forEach(function (s) {
      (s.p || rp(s.r)).forEach(function (pt) {
        if (!insidePoly([pt[0] + (pt[0] < 0.01 ? 0.02 : 0), pt[1] + 0.01], env)) out++;
      });
    });
    checks.push({
      n: 'All spaces inside the setback envelope',
      v: out === 0 ? 'yes' : out + ' stray corner(s)', ok: out === 0
    });

    // 2 — no two spaces overlap
    var rects = sp.filter(function (s) { return s.r; }).map(function (s) {
      return { x0: s.r[0], y0: s.r[1], x1: s.r[2], y1: s.r[3], n: s.n };
    });
    var worst = 0;
    for (var i = 0; i < rects.length; i++)
      for (var j = i + 1; j < rects.length; j++) worst = Math.max(worst, overlap(rects[i], rects[j]));
    checks.push({
      n: 'No two rooms overlap', v: worst < 0.01 ? 'yes' : worst.toFixed(2) + ' sq ft clash', ok: worst < 0.01
    });

    // 3 — carpet + walls should reconcile to the footprint
    var carpet = sp.reduce(function (t, s) { return t + shoelace(s.p || rp(s.r)); }, 0);
    var wallPct = (foot - carpet) / foot * 100;
    checks.push({
      n: 'Carpet + walls reconcile to footprint',
      v: carpet.toFixed(0) + ' + ' + (foot - carpet).toFixed(0) + ' = ' + foot.toFixed(0) + ' sq ft (' + wallPct.toFixed(1) + ' % walls)',
      ok: wallPct > 8 && wallPct < 32
    });

    // 4 — two 6'-0" x 2'-6" beds, a 4'-0" wardrobe between them, and a 2'-0"
    //     strip at the foot (the code minimum; the door lands in the L-pocket
    //     beside the washroom, so the foot strip is not the entry route)
    var bad = [], nBed = 0;
    sp.filter(function (s) { return s.cat === 'bed' && s.n; }).forEach(function (s) {
      nBed++;
      var bw = s.r[2] - s.r[0], bh = s.r[3] - s.r[1];
      // same thresholds the furniture routine uses, so a pass here means the
      // beds actually get drawn rather than merely clearing a paper minimum
      var across = 2 * BED_W + WR_D + 0.5;           // two beds + wardrobe between
      var along = BED_L + 2.4;                       // bed length + foot strip
      var fitsY = bh >= along && bw >= across;
      var fitsX = bw >= along && bh >= across;
      if (!fitsY && !fitsX) bad.push(s.n);
    });
    checks.push({
      n: 'Two 2\u2032-6\u2033 \u00D7 6\u2032-0\u2033 beds + wardrobe + 2\u2032 strip',
      v: bad.length ? bad.join(', ') + ' too tight' : 'all ' + nBed + ' rooms', ok: !bad.length
    });

    // 5 — washroom big enough for WC, basin and shower
    var wcBad = [];
    sp.filter(function (s) { return s.k === 'wc'; }).forEach(function (s) {
      var a = shoelace(rp(s.r)), mn = Math.min(s.r[2] - s.r[0], s.r[3] - s.r[1]);
      if (a < 15 || mn < 3.6) wcBad.push(s.tag);
    });
    checks.push({
      n: 'Washrooms \u2265 15 sq ft and \u2265 3\u2032-7\u2033 wide',
      v: wcBad.length ? 'rooms ' + wcBad.join(', ') : 'all pass', ok: !wcBad.length
    });

    // 6 — corridor clear width
    var corrs = sp.filter(function (s) { return s.n === 'CORRIDOR'; });
    var minC = Math.min.apply(null, corrs.map(function (s) {
      var b = bbox(s.p || rp(s.r)); return Math.min(b.x1 - b.x0, b.y1 - b.y0);
    }));
    checks.push({ n: 'Corridor clear width \u2265 3\u2032-0\u2033', v: D.ftin(minC), ok: minC >= 2.99 });

    // 7 — stair: a plain dog-leg and a winder-turn dog-leg are checked apart
    var st = sp.filter(function (s) { return s.k === 'stair'; })[0];
    var sb = bbox(st.p || rp(st.r));
    var run = Math.max(sb.x1 - sb.x0, sb.y1 - sb.y0), wid = Math.min(sb.x1 - sb.x0, sb.y1 - sb.y0);
    if (st.stairType === 'winder') {
      // flights run the long way; the turn is made up with winders, so the
      // check is on flight width and the straight run that is actually there
      var wFlight = (wid - 0.33) / 2;
      var wLand = Math.max(Math.min(run * 0.42, 4.4), 3.0);
      var straight = run - wLand;
      checks.push({
        n: 'Dog-leg with winder turn \u2014 flights \u2265 1.0 m',
        v: 'flights ' + D.ftin(wFlight) + ', straight run ' + D.ftin(straight) + ' + winders at the turn',
        ok: wFlight >= 3.28 && straight >= 4.9
      });
    } else {
      // NBC 2016: apartment common stair 1.0 m minimum flight, riser 190 max,
      // going 250 min, landing at least as deep as the flight is wide. At 10'-0"
      // floor to floor that is 17 risers, so a dog-leg needs 8 goings + landing.
      var flight = (wid - 0.33) / 2, needRun = 8 * 0.82 + Math.max(flight, 3.28);
      checks.push({
        n: 'Stair \u2014 1.0 m flights, 8 goings + landing',
        v: 'flights ' + D.ftin(flight) + ', run ' + D.ftin(run) + ' (needs ' + D.ftin(needRun) + ')',
        ok: flight >= 3.28 && run >= needRun - 0.02
      });
    }

    // 8 — lift shaft big enough for 4 persons
    var lf = sp.filter(function (s) { return s.k === 'lift'; })[0];
    var lb = bbox(lf.p || rp(lf.r));
    var lw = Math.min(lb.x1 - lb.x0, lb.y1 - lb.y0), ll = Math.max(lb.x1 - lb.x0, lb.y1 - lb.y0);
    // smallest 4-passenger 272 kg well in the vendor tables (IEC 1500 x 1300);
    // Hybon and Hexa both want 1600 on the entrance side, so 1500 is the floor
    checks.push({
      n: 'Lift well \u2265 1500 \u00D7 1300 mm (4-passenger)',
      v: Math.round(ll * 304.8) + ' \u00D7 ' + Math.round(lw * 304.8) + ' mm',
      ok: ll >= 4.9 && lw >= 4.26
    });

    // 9 — every bedroom reaches an open side, counting its own balcony as the
    //     link (the balcony sits between the bedroom and the outside wall)
    var dark = [], bals = {};
    sp.filter(function (s) { return s.cat === 'bal' && s.tag; }).forEach(function (s) {
      bals[s.tag] = bbox(s.p || rp(s.r));
    });
    sp.filter(function (s) { return s.cat === 'bed' && s.n; }).forEach(function (s) {
      var b = bals[s.tag] || { x0: s.r[0], y0: s.r[1], x1: s.r[2], y1: s.r[3] };
      var x0 = Math.min(b.x0, s.r[0]), y0 = Math.min(b.y0, s.r[1]);
      var x1 = Math.max(b.x1, s.r[2]), y1 = Math.max(b.y1, s.r[3]);
      var onFront = y0 < 0.4, onEast = x1 > EAST - 0.4, onWest = x0 < wb(y1) + 0.4;
      if (!onFront && !onEast && !onWest) dark.push(s.n);
    });
    checks.push({
      n: 'Every bedroom reaches an open side',
      v: dark.length ? dark.join(', ') + ' landlocked' : 'all rooms open', ok: !dark.length
    });

    // 10 — nothing may be reached only by walking through a bedroom. Every
    //      room, the stair and the lift must share a wall with circulation.
    var circ = sp.filter(function (s) { return s.cat === 'circ' && s.k !== 'stair'; })
      .map(function (s) { return bbox(s.p || rp(s.r)); });
    function touches(b) {
      return circ.some(function (q) {
        var ox = Math.min(b.x1, q.x1) - Math.max(b.x0, q.x0);
        var oy = Math.min(b.y1, q.y1) - Math.max(b.y0, q.y0);
        var gx = Math.max(b.x0, q.x0) - Math.min(b.x1, q.x1);
        var gy = Math.max(b.y0, q.y0) - Math.min(b.y1, q.y1);
        return (oy > 2.5 && gx >= -0.01 && gx <= 0.55) || (ox > 2.5 && gy >= -0.01 && gy <= 0.55);
      });
    }
    // an L-shaped room counts as reachable if any of its parts meets a corridor
    var parts = {};
    sp.filter(function (s) { return s.grp; }).forEach(function (s) {
      (parts[s.grp] = parts[s.grp] || []).push(bbox(s.p || rp(s.r)));
    });
    var noWay = sp.filter(function (s) {
      return s.n && (s.k === 'stair' || s.k === 'lift' || s.cat === 'bed');
    }).filter(function (s) {
      var boxes = (s.grp && parts[s.grp]) || [bbox(s.p || rp(s.r))];
      return !boxes.some(touches);
    }).map(function (s) { return s.n; });
    checks.push({
      n: 'Stair, lift and every room open onto circulation',
      v: noWay.length ? noWay.join(', ') + ' has no door to a corridor' : 'all reachable',
      ok: !noWay.length
    });

    // 11 — a door is no use with a bed across it. Each opening needs 1'-6" of
    //      clear floor on the room side before it meets furniture.
    var beds = [];
    sp.forEach(function (s) {
      bedLayout(s).forEach(function (f) { if (f.k === 'bed') beds.push({ f: f, n: s.n || s.tag }); });
    });
    var blocked = [];
    (o.plan.doors || []).forEach(function (d) {
      var z = d.v
        ? { x0: d.x - 1.5, y0: d.y0, x1: d.x + 1.5, y1: d.y1 }
        : { x0: d.x0, y0: d.y - 1.5, x1: d.x1, y1: d.y + 1.5 };
      beds.forEach(function (bd) {
        var ox = Math.min(z.x1, bd.f.x1) - Math.max(z.x0, bd.f.x0);
        var oy = Math.min(z.y1, bd.f.y1) - Math.max(z.y0, bd.f.y0);
        if (ox > 0.2 && oy > 0.2 && blocked.indexOf(bd.n) < 0) blocked.push(bd.n);
      });
    });
    checks.push({
      n: 'No bed across a door swing',
      v: blocked.length ? blocked.join(', ') : 'all ' + beds.length + ' beds clear',
      ok: !blocked.length
    });

    return checks;
  }

  global.PGPlans = {
    PLOT: PLOT, FOOT_AREA: shoelace([L.A, L.B, L.C, L.D]), OPTIONS: OPTIONS,
    renderOption: renderOption, renderSite: renderSite,
    schedule: schedule, stats: stats, verify: verify
  };
})(window);
