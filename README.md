# MedMaps

**An e-commerce cost planner for New Yorkers facing surgery they can't afford.**

The same spinal fusion costs **$26,193 to $165,554** across 487 American hospitals. If you're uninsured or on a high-deductible plan, you're exposed to all of it.

MedMaps ranks every US hospital by what the surgery will *actually* cost you — price weighted by that hospital's own federally-published complication rate — then widens the search to 37 accredited hospitals across 20 countries and bundles the procedure, flight, recovery hotel and complication insurance into a single checkout.

| | |
|---|---|
| **Live API** | https://medmap-api-kn44.onrender.com |
| **Interactive API docs** | https://medmap-api-kn44.onrender.com/docs |
| **Backend source** | [`backend/`](backend) in this repo |
| **Frontend** | this repo — React, built on Base44 |

Built at the NYC Hackathon, August 2026 · E-commerce track.

---

## The finding

Everyone ranks hospitals by price. Nobody weights price by risk — because the price and the complication rate live in two different federal databases and nobody joins them.

```
Christus Central Louisiana    $31,443 + 4.7% × $78,000 = $35,109
Kansas City Orthopaedic       $31,604 + 2.0% × $78,000 = $33,164
```

The hospital that's **$161 cheaper costs $1,945 more** once you weight in how often it goes wrong.

That join — CMS pricing to CMS complication rates, on CMS Certification Number — is the product.

---

## Real data, and where every number comes from

| Source | What we take | Volume |
|---|---|---|
| [CMS Medicare Inpatient Hospitals](https://data.cms.gov/provider-summary-by-type-of-service/medicare-inpatient-hospitals) | Charges + payments per hospital, per DRG | 1,173 hospitals · 8 procedures |
| [CMS Complications and Deaths](https://data.cms.gov/provider-data/dataset/ynj2-r877) | `COMP_HIP_KNEE` rate + confidence interval | 4,790 hospitals |
| [CMS Marketplace Plan Attributes PUF](https://data.healthcare.gov/) | Real deductibles, out-of-pocket maxes, coinsurance | 3,734 plans · 30 states |
| [OpenStreetMap](https://www.openstreetmap.org/) (Nominatim + Overpass) | Hotels near each hospital, ranked by distance | 136 hotels · 28 hospitals |

**Billed vs negotiated.** CMS publishes both the chargemaster charge and what Medicare actually paid. Hospitals bill a median of **$83,338** for a hip replacement and accept **$40,769**. We price at ~2.5× the hospital's own Medicare payment — the commercial ratio from RAND's hospital price studies — and show the billed charge alongside it.

---

## The model

**Expected cost** — the ranking key, not sticker price:

```
expected_cost = out_of_pocket + P(complication | this hospital) × revision_cost
```

**Insurance priced the way an insurer prices it** — expected loss plus a 30% load, where covered loss is the medical revision *plus* the trip disruption a complication abroad causes:

```
premium = P(complication) × [revision + 14 extra hotel nights + flight rebooking] × 1.30
```

**Monte Carlo, 10,000 draws per option.** Insurance is negative expected value by construction — the load guarantees it. What the premium buys is the tail:

```
Worst case without coverage    $121,679
Worst case with coverage        $20,563
Downside removed               $101,117
Cost of that certainty           $1,618
```

---

## How the app works

1. **Intake** — one plain-English sentence. Procedure, insurance, deductible, dates, location.
2. **Domestic** — US hospitals ranked by expected cost, with the price spread and the rank inversion.
3. **International** — 37 hospitals across 20 countries, bundled and compared against the best US option.
4. **Build the trip** — pick a hospital, then a flight, then a hotel near that hospital. Total updates at each step.
5. **Coverage** — see the worst case with and without the policy.
6. **Checkout** — one payment split across hospital, airline, hotel and underwriter.

---

## API

Nine endpoints, FastAPI on Render. No auth, CORS open.

```
GET  /                        service summary + live data counts
GET  /health                  liveness
GET  /procedures              8 procedures with hospital counts
GET  /plans?state=&q=         real ACA plan search
POST /intake                  free text → procedure, coverage, conditions, constraints
POST /quote/domestic          US hospitals ranked by expected cost
POST /quote/international     bundled international options + risk distribution
GET  /flights?hospital_id=    3 round-trip options from JFK
GET  /hotels?hospital_id=     5 real hotels nearest that hospital
POST /explain                 pre-computed facts + strict prompt for the LLM layer
POST /checkout                escrow split
```

**Design notes**
- The API never returns a 5xx. Any internal failure degrades to cached data with `"degraded": true`, so the UI never needs an error state.
- The LLM narrates, it never calculates. `/explain` hands it pre-computed facts and a prompt forbidding any number not present in them.
- Full chain — intake → domestic → international → explain — runs in **under 500ms**.

---

## Run it

**Backend**

```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

Open `http://localhost:8000/docs` — the entire flow is drivable from Swagger. Datasets are committed, so nothing needs re-pulling. To refresh them:

```bash
python fetch_cms.py        # hospital prices + complication rates
python fetch_more_drgs.py  # additional procedures
python fetch_plans.py      # ACA marketplace plans
python fetch_hotels.py     # hotels near each hospital
```

**Frontend**

```bash
npm install
npm run dev
```

The app points at the hosted API by default. Backend setup is below.

---

## Tests

The backend ships a 41-check suite — **41 passed, 0 failed**. Data integrity, model behaviour, Monte Carlo stability, and endpoint robustness against garbage input.

Two real bugs it caught during the build:
- `float("inf")` in the uninsured out-of-pocket cap made `/quote/domestic` return a 500 for **every uninsured user** — the primary persona.
- The Monte Carlo's lognormal draw had mean 1.163×, so simulated losses ran 16% above what the premium was priced against. Fixed with `mu = -σ²/2`.

---
