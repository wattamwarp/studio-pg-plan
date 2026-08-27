/* app.js — renders the site plan, the four options, and the comparison. */
(function () {
  'use strict';

  var P = window.PGPlans;
  var $ = function (s) { return document.querySelector(s); };
  var f1 = function (n) { return n.toLocaleString('en-IN', { minimumFractionDigits: 1, maximumFractionDigits: 1 }); };
  var f0 = function (n) { return Math.round(n).toLocaleString('en-IN'); };

  var OPTS = P.OPTIONS;
  var ST = OPTS.map(P.stats);

  $('#hero-stats').innerHTML = [
    ['Plot', f0(P.PLOT.area) + ' sq ft', f1(P.PLOT.area / 9) + ' sq yd'],
    ['Buildable', f0(P.PLOT.buildable) + ' sq ft', 'front to the line, 1′-0″ elsewhere'],
    ['Sides with a window', '3 of 4', 'garden, road and Sikandar'],
    ['Options drawn', OPTS.length, OPTS.map(function (o) { return o.headline.split(' ')[0]; }).join(' / ') + ' rooms'],
    ['Best bedroom', f0(Math.max.apply(null, ST.map(function (s) { return s.maxBed; }))) + ' sq ft', 'Option C'],
    ['Most rooms', Math.max.apply(null, ST.map(function (s) { return s.units; })), 'Option B']
  ].map(function (s) {
    return '<div class="stat"><dt>' + s[0] + '</dt><dd>' + s[1] + '<small>' + s[2] + '</small></dd></div>';
  }).join('');

  $('#draw-site').innerHTML = P.renderSite();

  var LEGEND = [
    ['#e8f1fb', 'Room'], ['#dff0ec', 'Washroom'], ['#eef6e2', 'Balcony'],
    ['#f6f2e6', 'Corridor / stair'], ['#e9e6f0', 'Lift'], ['#fff6d9', 'Light well'],
    ['#414c5b', 'Wall (6″)']
  ].map(function (l) { return '<span><i style="background:' + l[0] + '"></i> ' + l[1] + '</span>'; }).join('');

  $('#options').innerHTML = OPTS.map(function (o, i) {
    var s = ST[i];
    return '<section class="sheet" id="' + o.id + '">' +
      '<div class="sheet__head"><h3>' + o.name + ' — ' + o.headline + '</h3>' +
      '<span class="tag">' + o.badge + '</span></div>' +
      '<p class="sheet__lead">' + o.note + '</p>' +
      (o.note2 ? '<p class="sheet__lead">' + o.note2 + '</p>' : '') +
      (o.note3 ? '<p class="sheet__lead">' + o.note3 + '</p>' : '') +
      '<div class="frame">' +
      '<div class="frame__bar"><span><strong>' + o.code + '</strong> &nbsp;' + o.headline + '</span>' +
      '<span>1 : 50 @ A3</span></div>' +
      '<div class="frame__body">' + P.renderOption(o) + '</div>' +
      '<div class="legend">' + LEGEND + '</div></div>' +
      '<dl class="stats">' +
      '<div class="stat"><dt>Rooms</dt><dd>' + s.units + '<small>per floor</small></dd></div>' +
      '<div class="stat"><dt>Bedroom</dt><dd>' + f0(s.minBed) + '–' + f0(s.maxBed) + '<small>sq ft carpet</small></dd></div>' +
      '<div class="stat"><dt>Average bedroom</dt><dd>' + f0(s.avgBed) + '<small>sq ft</small></dd></div>' +
      '<div class="stat"><dt>Module</dt><dd>' + f0(s.minMod) + '–' + f0(s.maxMod) + '<small>sq ft built-up</small></dd></div>' +
      '<div class="stat"><dt>Rooms over G+3</dt><dd>' + (s.units * 4) + '<small>' + (s.units * 8) + ' beds</small></dd></div>' +
      '</dl>' +
      '<div class="tablewrap" style="margin-top:6px">' + verifyTable(o) + '</div>' +
      '</section>';
  }).join('');

  function verifyTable(o) {
    var v = P.verify(o), fails = v.filter(function (c) { return !c.ok; }).length;
    return '<table><thead><tr><th>Verification — ' + o.name + '</th><th>Result</th>' +
      '<th class="num">' + (fails ? fails + ' issue' + (fails > 1 ? 's' : '') : 'all pass') + '</th></tr></thead><tbody>' +
      v.map(function (c) {
        return '<tr><td>' + c.n + '</td><td style="color:#64748b">' + c.v + '</td>' +
          '<td class="num"><span class="pill pill--' + (c.ok ? 'ok' : 'warn') + '">' +
          (c.ok ? 'pass' : 'check') + '</span></td></tr>';
      }).join('') + '</tbody></table>';
  }

  function row(label, fn) {
    return '<tr><td>' + label + '</td>' + ST.map(function (s, i) {
      return '<td class="num">' + fn(s, OPTS[i]) + '</td>';
    }).join('') + '</tr>';
  }

  $('#compare-table').innerHTML =
    '<table><thead><tr><th>Per typical floor</th>' +
    OPTS.map(function (o) { return '<th class="num">' + o.name.replace('Option ', '') + ' · ' + o.headline + '</th>'; }).join('') +
    '</tr></thead><tbody>' +
    row('Rooms', function (s) { return s.units; }) +
    row('Garden-side rooms', function (s, o) { return o.cfg.nWest; }) +
    row('Sikandar-side rooms', function (s, o) { return o.cfg.east.length; }) +
    row('Garden band depth', function (s, o) { return o.cfg.bandW + '\u2032'; }) +
    row('Smallest bedroom', function (s) { return f0(s.minBed) + ' sq ft'; }) +
    row('Average bedroom', function (s) { return f0(s.avgBed) + ' sq ft'; }) +
    row('Largest bedroom', function (s) { return f0(s.maxBed) + ' sq ft'; }) +
    row('Module built-up', function (s) { return f0(s.minMod) + '–' + f0(s.maxMod); }) +
    row('Carpet efficiency', function (s) { return f1(s.efficiency) + ' %'; }) +
    row('Rooms over G+3', function (s) { return s.units * 4; }) +
    row('Beds over G+3', function (s) { return s.units * 8; }) +
    '</tbody></table>';

  /* schedule with a tab per option */
  function drawSched(i) {
    var rows = P.schedule(OPTS[i]);
    var TYPE = { bed: 'Room', wc: 'Washroom', bal: 'Balcony', circ: 'Circulation', svc: 'Lift', slot: 'Light' };
    var total = rows.reduce(function (t, r) { return t + r.area; }, 0);
    $('#sched-table').innerHTML =
      '<table><thead><tr><th>Space</th><th>Room</th><th>Type</th><th class="num">Carpet</th>' +
      '<th class="num">Module</th></tr></thead><tbody>' +
      rows.map(function (r) {
        return '<tr><td><b>' + r.name + '</b></td><td style="color:#64748b">' + r.tag + '</td>' +
          '<td><span class="pill pill--' + r.t + '">' + (TYPE[r.cat] || r.cat) + '</span></td>' +
          '<td class="num"><b>' + f1(r.area) + '</b></td>' +
          '<td class="num">' + (r.module ? f0(r.module) : '—') + '</td></tr>';
      }).join('') +
      '</tbody><tfoot><tr><td colspan="3">Total carpet</td><td class="num">' + f1(total) +
      '</td><td class="num">' + f0(P.FOOT_AREA) + '</td></tr></tfoot></table>';
  }
  $('#sched-tabs').innerHTML = OPTS.map(function (o, i) {
    return '<button class="btn' + (i === 0 ? ' is-active' : '') + '" data-i="' + i + '">' +
      o.name.replace('Option ', '') + ' · ' + o.headline + '</button>';
  }).join('');
  $('#sched-tabs').addEventListener('click', function (e) {
    var b = e.target.closest('[data-i]'); if (!b) return;
    Array.prototype.forEach.call(this.children, function (x) { x.classList.remove('is-active'); });
    b.classList.add('is-active'); drawSched(+b.dataset.i);
  });
  drawSched(0);

  var links = Array.prototype.slice.call(document.querySelectorAll('#nav a'));
  var targets = links.map(function (a) { return document.querySelector(a.getAttribute('href')); });
  new IntersectionObserver(function (es) {
    es.forEach(function (en) {
      if (!en.isIntersecting) return;
      var i = targets.indexOf(en.target); if (i < 0) return;
      links.forEach(function (l) { l.classList.remove('is-active'); });
      links[i].classList.add('is-active');
    });
  }, { rootMargin: '-15% 0px -70% 0px' }).observe && targets.forEach(function (t) {
    if (t) new IntersectionObserver(function (es) {
      es.forEach(function (en) {
        if (!en.isIntersecting) return;
        var i = targets.indexOf(en.target); if (i < 0) return;
        links.forEach(function (l) { l.classList.remove('is-active'); });
        links[i].classList.add('is-active');
      });
    }, { rootMargin: '-15% 0px -70% 0px' }).observe(t);
  });
})();
