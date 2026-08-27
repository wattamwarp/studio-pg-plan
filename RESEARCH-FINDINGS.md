# Research Findings — Codes, Ergonomics and Area-Stretching

Four parallel research streams, 27 Aug 2026. Everything below is sourced. Byelaws are
**city-specific** — the city was never specified, so where numbers diverge the source is
named. Confirm against your own ULB before anything is drawn for sanction.

---

## A. The five findings that change the design

### A1. Bathrooms may be internal. Bedrooms may not.

This is the single most useful thing found, and it reorganises the whole plan.

- **Habitable rooms** must physically abut open space. Model Building Bye-Laws 4.25.2 and
  Karnataka 5.2.7.2: *"Every room intended for human habitation **shall abut** on an interior
  or exterior open space."* Mechanical ventilation does **not** cure this.
- **Bathrooms and WCs may not.** MBBL 4.25.4 / Karnataka 5.2.7.3: *"In case **kitchen and
  toilets** do not abut either interior or exterior open spaces, mechanical ventilation would
  be accepted."* The omission of habitable rooms from that sentence is deliberate.
- A bathroom-only ventilation shaft at G+3 (≤12 m) needs just **2.8 m² with a 1.2 m minimum
  side** (NBC Part 3, 8.2.5(b)).

**Consequence: put every bathroom on the blind east side and give the entire garden and road
frontage to bedrooms.** That is worth far more than any FAR trick.

### A2. Rooms can only be ~11′-10″ deep from their window

BRE limiting depth: `L ≤ 2.5 × (window head − 0.85 m working plane)`. At a 7′-6″ head that is
**3.60 m ≈ 11′-10″** of genuinely daylit depth. NBC Part 3, 20.1.2 Note 2 sets a hard legal
ceiling of **7.5 m**, beyond which floor area is *deemed unlit*.

So a room module can be 16–17 ft deep overall only if the back 5–6 ft is the bathroom.

### A3. Only 1,086 of the 1,515 sq ft can hold a daylit room

Taking a 16 ft band off each good edge and unioning them:

```
Front band  36.78 × 16, less slant cut          =   562 sq ft
West band   49.13 × 16                          =   786 sq ft
Less south-west corner double-counted           = − 262 sq ft
                                                  ─────────
DAYLIT L-BAND                                     1,086 sq ft  (71.7 %)
BLIND NORTH-EAST ZONE                               429 sq ft  (28.3 %)
```

Servant space needed: stair 124 + lift 34 + corridor ~168 = **326 sq ft**.

```
1,086 ÷ 7 rooms = 155 sq ft each   ✓ comfortable, inside the brief
1,086 ÷ 8 rooms = 136 sq ft each   ✗ legal, but a 74 sq ft bedroom
```

**There is no eighth 155 sq ft room hiding on this site.** The 8th room has to be bought
either by shrinking every module, or by cutting a light court into the blind corner.

### A4. Staircase and lift are free of FAR. Corridors are not.

BBMP 9.10.3(b) exempts parking, **staircase rooms, lift rooms**, ramps, machine rooms, **open
balconies**, ducts and water tanks. But 9.10.3(e) claws back: *"Lobbies, **corridors** provided
in the plan shall be considered for F.A.R."*

**Consequence: never shave the stair to save area — it is free. Shave the corridor, which is
not.** Our 3′-0″ corridor at 138–168 sq ft is ~11 % of the plate and is the only servant space
that costs FAR.

### A5. Cantilevered cupboards are exempt from covered area

UDCPR 9.6.1 allows a wardrobe cantilever projecting **0.60 m** into the setback on all floors
above ground, one wall per room. MoHUA allows **0.75 m**, capped at 2.0 m of length per
habitable room, *"exempted from covered area calculations in case of residential buildings
only."*

**Consequence: push the 4′-0″ wardrobe out of the room as a cantilevered niche.** ~8 sq ft of
floor recovered per room, free, and it solves the wardrobe-clearance problem at the same time.

---

## B. Hard numbers to design to

### Statutory

| Item | Value | Source |
| --- | --- | --- |
| Habitable room min | 9.5 m² (102 sq ft), min width **2.4 m** | NBC Part 3, 12.2.2 |
| Combined bath + WC min | **2.8 m²**, min width 1.2 m | NBC Part 3, 12.4.2 |
| Bathroom vent shaft, ≤12 m | **2.8 m²**, min side 1.2 m | NBC Part 3, 8.2.5(b) |
| Interior court for a habitable room | **3.0 m × 3.0 m** min, and ≥ (H/5)² | NBC Part 3, 8.2.5(a) |
| Max room depth from window | **7.5 m** legal / 3.6 m good practice | NBC 20.1.2 Note 2; BRE |
| Window opening area | 1/6 (Karnataka) to 1/10 (MBBL) of floor area | see conflict below |
| Habitable room height | 2.75 m floor to soffit | NBC 12.2.1 |
| Corridor, hostel | **1.25 m** | Karnataka 5.2.4.5(b) |
| Stair, hostel (A-3) | **1.25 m** wide, 300 mm tread, 150 mm riser, 12 risers/flight | NBC 12.18 |
| Stair, private dwelling (A-2, **≤20 beds**) | **1.0 m** wide, 250 mm tread, 190 mm riser | NBC 12.18 |
| High-rise threshold | **15 m** — stay under it | NBC Part 4, 2.38 |
| Second staircase | Not required for a non-high-rise residential G+3, if travel distance ≤30 m | NBC Part 4, 1.2 |
| Bengaluru PG licence | **70 sq ft per head** — so 140 sq ft per twin room | BBMP order, 7 Aug 2024 |

### The 20-bed cliff — the highest-leverage decision on the project

NBC A-2 (private dwelling) covers *"not more than 20 persons"* sleeping, at *"not more than
three persons per room."* Above 20 beds the building becomes **A-3 Dormitory**.

| | ≤ 20 beds (A-2) | > 20 beds (A-3) |
| --- | --- | --- |
| Stair width | 1.00 m (3′-3″) | **1.25 m (4′-1″)** |
| Tread | 250 mm | **300 mm** |
| Riser | 190 mm | **150 mm** |
| Corridor | 1.0 m | **1.25 m** |

At 150 mm risers a 10 ft floor needs **20 risers instead of 16** — the stair gets materially
longer exactly when the plot can least afford it. **Your 3′-0″ stair and 3′-0″ corridor are
only defensible under A-2, i.e. at 20 beds or fewer — that is 10 twin rooms in the whole
building, not per floor.** At 8 rooms × 4 floors = 64 beds you are firmly in A-3 and the stair
must be 4′-1″ wide with a 1.25 m corridor.

### Ergonomic clearances

| Clearance | Minimum | Comfortable |
| --- | --- | --- |
| Gap between two parallel beds | **600 mm (2′-0″)** | 750–900 mm (2′-6″–3′-0″) |
| Foot of bed **as a route** | **900 mm (3′-0″)** | 900–1000 mm |
| Foot of bed, dead end | 550–700 mm | 750 mm |
| Clear floor inside the room door | **900 × 1800 mm**, entirely outside the door swing | — |
| In front of a hinged wardrobe | 750–900 mm | 900–1100 mm |
| In front of a **sliding** wardrobe | 600 mm | 700–900 mm |
| In front of WC | 500 mm | 600–700 mm |
| In front of basin | 550 mm | 600–700 mm |
| Shower footprint | 760 × 760 mm | 900 × 900 mm |

Sources: JGJ 36-2016 (China dormitory code) cl. 4.2.2; 2010 ADA Standards Table 404.2.4.1;
Neufert; Panero & Zelnik.

**Your 2′-6″ bed is narrow.** Every published single-bed standard is 900 mm — UK/EU single,
Neufert, and the Indian market 36″ × 75″. Going to 3′-0″ costs only 12″ of total room width
across both beds and materially improves lettability.

### Bathroom sizes

| Size | What it gives |
| --- | --- |
| 4′ × 6′ | Absolute minimum WC + basin + corner shower. Sliding door mandatory. |
| 5′ × 6′ | Published minimum for all three fixtures |
| **5′ × 7′** | **Real wet/dry split with a 900 × 900 shower behind glass** |
| 6′ × 8′ | Where an Indian bathroom starts reading as *"extended"* |

Three rules that make a small bathroom work: overlap the clearances rather than shrinking the
fixtures; shower at the far end from the door, basin nearest it; and **never swing the
bathroom door inward onto a fixture — specify a sliding or pocket door.**

### Room area benchmarks

| Benchmark | Per person | Twin room |
| --- | --- | --- |
| UGC hostel norms, double seater | 7.5–8.0 m² | 15–16 m² (161–172 sq ft) |
| Indian hostel bye-law (MP Reg. 4.3.8) | 8.0 m² | 16 m² (172 sq ft) |
| JGJ 36-2016 (China) 2-person | 8.0 m² usable, excl. bath and balcony | 16 m² |
| UK NDSS twin | 5.75 m² | 11.5 m² (124 sq ft) |
| MIT / SUNY double | — | **180 sq ft** |
| Illinois dormitory floor | 4.65 m² (50 sq ft) | 100 sq ft |
| BBMP PG licence | **6.5 m² (70 sq ft)** | **140 sq ft** |

Our 79 sq ft bedroom is **3.7 m² per person** — below every published norm on a bedroom-only
basis. Counting the bathroom and balcony, the 135 sq ft module is 6.3 m²/person, which clears
Illinois and approaches BBMP's 70 sq ft/head but stays well under UGC's 7.5–8 m².

---

## C. Area-stretching devices, ranked for this plot

| # | Device | Gain | The catch |
| --- | --- | --- | --- |
| 1 | **Bathrooms internal, on the blind side** | Frees the entire 86 ft of good frontage for bedrooms | Needs a 2.8 m² shaft or mechanical extract per stack |
| 2 | **Stair + lift are FAR-free** | ~158 sq ft/floor off the FAR count | Corridors are *not* — minimise those instead |
| 3 | **Cantilevered wardrobe niche, 0.6–0.75 m** | ~8 sq ft/room, exempt from covered area | Only above ground floor, one wall per room |
| 4 | **Open balconies free of FAR** | Delhi 1.5 m free; BBMP "open balconies" exempt | **Blocked here** — a 1′-0″ setback leaves nowhere to cantilever without crossing the boundary |
| 5 | **Basement for services** | Up to 1,230 sq ft, FAR-free | Parking/storage/services only. No bedrooms. Expensive on a tight plot. |
| 6 | **Stilt + 4 instead of G+3** | A whole extra habitable floor | Delhi: stilt mandatory 100–1,000 m², excluded from FAR; Telangana excludes it from *height* too |
| 7 | Terrace toilet ≤4 m², mumty ≤3 m | Free of FAR **and** height | Small, but makes the roof usable |
| 8 | Loft over bath/corridor | 100 % of the room area below | Storage only — becomes a mezzanine (and counts) if occupiable |

**Explicitly rejected: mezzanine.** UDCPR 9.7.1 — *"Mezzanine floor area shall be counted
towards FSI."*

---

## D. Where the sources genuinely conflict

| Issue | NBC 2016 | MBBL 2016 | Karnataka 2017 |
| --- | --- | --- | --- |
| Window opening fraction | 1/6 warm-humid, 1/8 temperate, 1/10 hot-dry | flat **1/10** | flat **1/6** |
| Risers per flight | 12 | **15** | 12 |
| Riser height (hostel) | 150 mm | 190 mm | 190 mm |
| Interior court area | (H/5)² | 3 m flat to 15 m | 3 m flat to 15 m |

Karnataka is ~67 % stricter than MBBL on window area. Design to the stricter unless your ULB
has adopted a specific text.

⚠️ **A widely repeated online claim that NBC requires "1/10 glazed plus 1/20 openable" is not
in the code.** NBC 20.1.2 gives a single aggregate figure varying by climate zone.

---

## E. Two risks that could invalidate the whole scheme

**E1 — Hostel land-use minimum plot size.** MBBL 3.5.2 sets Guest House / Boarding House /
Hostel land use at **minimum plot 500 m², 20 m road width**. Madhya Pradesh Reg. 4.3.8 requires
**>500 m² with a 12 m road** in large cities. **This plot is 152 m².** If the authority
processes the building as a *hostel land use* rather than as a residential building let
room-wise, the plot is disqualified outright on size — no amount of planning fixes it.
**Establish which door you are going through before drawing anything for sanction.**

**E2 — Ground coverage.** Our footprint is ~82 % of the plot. Delhi's cap for 100–250 m² is
**75 %**, BBMP's is **65 %**, NBC recommends 65 %. Only Delhi's sub-100 m² bracket allows 90 %.
On the Delhi cap the legal footprint is ~1,230 sq ft — about 120 sq ft *less* per floor than
currently drawn.

Related: Delhi caps 100–250 m² plots at **4 dwelling units**. PG rooms are not separate DUs so
long as they have no independent cooking — but a "studio" with a kitchenette arguably becomes
one, and Gurugram's enforcement treats exactly that configuration as illegal subdivision.

---

## F. What this means for the plan

1. **Reorganise the section through the module** to `window → BEDROOM → BATHROOM → corridor`.
   Bathrooms go on the blind east and inboard; bedrooms take all 86 ft of good frontage.
2. **Bedroom depth ≤ 11′-10″** from its window. Anything deeper is not daylit.
3. **Accept 7 comfortable rooms, or buy the 8th with a 3.0 × 3.0 m light court** in the blind
   north-east. Do not simply shrink all eight.
4. **Cantilever the wardrobe** out of the room as a 2′-0″ niche.
5. **Split the beds by 2′-6″**, keep a 3′-0″ route at the foot, and hold a 3′-0″ × 6′-0″ clear
   rectangle inside the door.
6. **Sliding doors** to bathroom and wardrobe throughout.
7. **Decide the bed count against the 20-bed cliff** before fixing the stair.

---

## Sources

Primary: [NBC 2016 Vol. 1 full text](https://archive.org/stream/nationalbuilding01/in.gov.nbc.2016.vol1.digital_djvu.txt) ·
[Model Building Bye-Laws 2016](https://mddaonline.in/wp-content/uploads/2026/03/MODEL_BUILDING_BYE_LAWS-2016.pdf) ·
[MoHUA Chapter 4](https://mohua.gov.in/upload/uploadfiles/files/Chap-4.pdf) ·
[Karnataka Model Building Bye-Laws 2017](https://bpas.bbmpgov.in/BPAMSClient4/Downloads/Bye%20laws%20and%20Zoning%20Regulations/Model%20Building%20Byelaws%20Notification%20No.%20UDD%2014%20TTP%202017%20(P-4)%20Bengaluru,%20Dated%2028-10-2017%20.pdf) ·
[UDCPR 2020 Maharashtra](https://www.grihaindia.org/sites/default/files/pdf/Griha-incentives/udcpr-sanctioned.pdf) ·
[MCD EODB — MPD-2021 setback table](https://eodb.mcd.gov.in/mpd_provision) ·
[Telangana GO Ms 168](https://tg-bn-website-assets.flowwlabs.tech/GOs-and-ACTs/1_GOMsNo_168_MA_UD_dt_07042012.pdf)

Standards and guidance: [2010 ADA Standards, ch. 4](https://www.access-board.gov/aba/chapter/ch04/) ·
[JGJ 36-2016 dormitory code](https://codeofchina.com/standard/JGJ36-2016.html) ·
[UK Nationally Described Space Standard](https://www.gov.uk/government/publications/technical-housing-standards-nationally-described-space-standard/technical-housing-standards-nationally-described-space-standard) ·
[MIT Residences design standards](https://web.mit.edu/Facilities/maps/DesignStandards/T15%20-%20Residences%202022.pdf) ·
[DASNY residence hall guidelines](https://www.dasny.org/sites/default/files/inline-files/DASNY_College_and_University_Residence_Hall_Design_Guidelines.pdf) ·
[Victoria Better Apartments light-well standard](https://docs.bess.net.au/tool-notes/bess9/ieq/) ·
[BRE limiting-depth rule](https://tradecalculator.co.uk/general/natural-light-calculator/)

Precedent: [Double B Hostel, Bangkok — VMA Design Studio](https://www.designboom.com/architecture/handcrafted-wooden-facade-vma-design-studio-hostel-bangkok-double-b-10-05-2023/)
(same condition — light only from the street and the roof; solved with an internal court,
mirrored upper walls and per-room "pocket lightboxes").

Enforcement context: [BBMP PG licence conditions, Aug 2024](https://indianexpress.com/article/cities/bangalore/bengaluru-pg-murder-bbmp-issuance-trade-licenses-9505328/) ·
[BBMP sealed 187 PGs](https://bangaloremirror.indiatimes.com/bangalore/others/bbmp-seals-187-pgs-in-bengaluru-over-violations/articleshow/120528008.cms) ·
[Madras HC: hostels are residential for tax](https://www.outlookmoney.com/invest/big-relief-for-hostel-residents-owners-madras-hc-rules-hostels-are-residential-not-commercial)

⚠️ Two sites that rank highly on these searches — `studiomatrx.org` and `infralens.in` —
contain fabricated legal citations. Nothing numeric above is sourced from them.
