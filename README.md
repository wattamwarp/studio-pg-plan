# Studio P.G. Building — Typical Floor Plan

A self-contained website presenting the typical floor plan for a studio paying-guest
building, in three variations. Open `index.html` in any browser — no build step, no
dependencies.

```bash
open index.html
# or serve it:  python3 -m http.server 8777
```

## The plot

| Side | Given | Drawn as | Setback |
| --- | --- | --- | --- |
| Front (road, south) | 38.8 ft | 38′-9⅜″ | **0 — built to the line** |
| Left (garden, west) | 50.2 ft | 50′-2″ | 1′-0″ |
| Rear (north) | 28.8 ft | 28′-9⅜″ | 1′-0″ |
| Right (neighbour, east) | 47.7 ft | 47′-8⅜″ | 1′-0″ |

Four side lengths do **not** define a unique quadrilateral. The corner between the front
and the left boundary is assumed to be 90°, the usual condition for a road-facing plot.

- Plot area **1,621.0 sq ft** (180.1 sq yd / 150.6 sq m)
- Buildable with the front setback removed: **1,496.3 sq ft**
- Footprint: **1,343.2 sq ft** (82.9 % ground coverage)

The plot loses about 10 ft of width from front to back, all of it on the eastern boundary.
The footprint therefore **steps** — 32′-7″ wide, then 30′-2″, then 24′-6″ at the core — so
every room stays a clean rectangle.

## The brief, and what was delivered

| Requirement | Delivered |
| --- | --- |
| Minimum 8 rooms | Variation A = 8, Variation B = 9 |
| Room ≤ 150–160 sq ft built-up | A: 131–135 · B: 112–134 · C: 143–153 |
| 2 beds @ 6′-0″ × 2′-6″ | in every room |
| Wardrobe 4′-0″ × 1′-11″ | in every room |
| Room door 3′-0″ | off the corridor |
| Balcony door 3′-0″ | bedroom to balcony |
| Washroom door 2′-0″ | off the bedroom |
| Extended washroom | 18–30 sq ft carpet |
| Short balcony | 4′-6″ of length × 4′-6″ deep, ~18 sq ft |
| 6″ walls | throughout, internal and external |
| Corridor 3′-0″ | 3′-0″ clear (3′-6″ structural) |
| Stair 3′-0″, space-saving | dog-leg, two 3′-0″ flights back to back, no open well |
| Lift for 4 persons | 272 kg MRL, 6′-0″ × 5′-0″ clear shaft |
| No front setback | built to the road line |
| No lobby / shaft / extras | corridor, stair and lift only |

## The variations

| | Rooms | Module (built-up) | Bedroom (carpet) |
| --- | --- | --- | --- |
| **A** — recommended | 8 | 131–135 sq ft | 70–79 sq ft |
| **B** — maximum yield | 9 | 112–134 sq ft | 65–77 sq ft |
| **C** — largest rooms | 7 | 143–153 sq ft | 84–88 sq ft |

Room count and room size pull against each other. A 150–160 sq ft module needs roughly
13 ft of depth and 12 ft of frontage; eight of those plus the corridor, stair and lift come
to about 1,430 sq ft against the 1,343 available. Variation C shows what 150-ish modules
actually deliver — seven rooms. Variation A keeps the eight-room minimum by holding modules
at 131–135, still under the 160 ceiling.

## The studio module

```
outer wall ─┬─ BALCONY   4'-6" of length, 4'-6" deep
            └─ WASHROOM  takes the rest of the length
               BEDROOM   2 beds + wardrobe, 3'-0" door to corridor
```

Balcony and washroom share the outer wall so the washroom gets a window onto the balcony
and ventilates naturally — which is why the floor needs no shaft. Washrooms on either side
of a party wall sit back to back, so every drain lands in one line.

## Files

```
index.html            page structure and written content
assets/style.css      styling
assets/draw.js        SVG drafting engine (walls, doors, dimensions, furniture)
assets/plans.js       plot geometry, studio module generator, the three variations
assets/app.js         rendering and the data tables
assets/geom-check.js  Node script that derives and verifies the plot geometry
renders/              exported PNGs
```

Verify the plot maths independently:

```bash
node assets/geom-check.js
```

It re-derives the plot corners from the four side lengths, offsets each edge by its own
setback, and checks that every footprint corner falls inside the resulting line.

## How the drawings are produced

Nothing is hand-drawn. Each plan is a list of rectangles in feet; the renderer fills the
footprint solid, then punches each room's *clear* rectangle out of it, so the walls you see
are the actual leftover 6″ masonry. Room labels, the schedule and the compliance checks all
read from the same numbers, so a drawing and its area can never disagree.

## Status

Concept design / spatial feasibility study. **Not a sanction drawing and not for
construction.** Building to the road line with 82.9 % ground coverage exceeds what most
municipal byelaws permit, and a single 3′-0″ staircase may not satisfy escape requirements
above three storeys. See section 09 of the page for the full list of assumptions.
