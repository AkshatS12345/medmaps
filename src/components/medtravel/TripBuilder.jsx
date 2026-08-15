import React, { useEffect, useState } from "react";
import {
  ArrowLeft,
  Check,
  Plane,
  BedDouble,
  ShieldCheck,
  Hospital,
} from "lucide-react";
import { money, percent } from "@/lib/format";
import { api } from "@/lib/api";

const ALL_STEPS = [
  { key: "hospital", label: "Facility", icon: Hospital },
  { key: "flight", label: "Flight", icon: Plane },
  { key: "hotel", label: "Hotel", icon: BedDouble },
  { key: "coverage", label: "Coverage", icon: ShieldCheck },
];

function StepBar({ steps, current, onJump }) {
  const idx = steps.findIndex((s) => s.key === current);
  return (
    <div className="flex items-center gap-1">
      {steps.map((s, i) => {
        const done = i < idx;
        const active = i === idx;
        const Icon = s.icon;
        return (
          <React.Fragment key={s.key}>
            <button
              type="button"
              onClick={() => onJump(s.key)}
              className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium transition-colors ${
                active
                  ? "bg-teal-500/20 text-teal-200 border border-teal-400/40"
                  : done
                  ? "text-emerald-300 hover:text-emerald-200"
                  : "text-slate-500"
              }`}
            >
              {done ? <Check className="w-3 h-3" /> : <Icon className="w-3 h-3" />}
              {s.label}
            </button>
            {i < steps.length - 1 && (
              <span className="h-px w-2.5 bg-white/15 flex-shrink-0" />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

function Line({ label, sub, amount, pending }) {
  return (
    <div className="flex items-start justify-between gap-3 rounded-lg bg-slate-800/50 border border-white/10 px-3 py-2">
      <div className="min-w-0">
        <p className={`text-sm truncate ${pending ? "text-slate-500" : "text-white"}`}>
          {label}
        </p>
        {sub && <p className="text-[10px] text-slate-500">{sub}</p>}
      </div>
      <span
        className={`text-sm font-semibold flex-shrink-0 ${
          pending ? "text-slate-500" : "text-white"
        }`}
      >
        {money(amount)}
      </span>
    </div>
  );
}

function Choice({ selected, onClick, title, meta, price, note }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full text-left rounded-xl px-3 py-2.5 border transition-colors ${
        selected
          ? "bg-teal-500/15 border-teal-400/50"
          : "bg-slate-800/40 border-white/10 hover:border-white/30"
      }`}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm text-white truncate">{title}</p>
          <p className="text-[11px] text-slate-400">{meta}</p>
        </div>
        <div className="text-right flex-shrink-0">
          <p className="text-sm font-semibold text-white">{money(price)}</p>
          {note && <p className="text-[10px] text-teal-300">{note}</p>}
        </div>
      </div>
    </button>
  );
}

export default function TripBuilder({ option, intake, onBack, onBook, onAddToCart }) {
  const isIntl = !!option.country;
  // A hospital in the patient's own state means no flight and no hotel at all.
  const homeState = intake?.state || null;
  const sameState = !isIntl && homeState && option.state === homeState;
  const steps = ALL_STEPS.filter(
    (s) => isIntl || (s.key !== "flight" && s.key !== "hotel")
  );

  const [step, setStep] = useState("hospital");
  const [flights, setFlights] = useState(null);
  const [flight, setFlight] = useState(null);
  const [hotels, setHotels] = useState(null);
  const [hotel, setHotel] = useState(null);

  useEffect(() => {
    if (!isIntl || !option.hospital_id) return;
    let dead = false;
    api
      .flights(option.hospital_id)
      .then((r) => !dead && setFlights(r?.options || []))
      .catch(() => !dead && setFlights([]));
    api
      .hotels(option.hospital_id)
      .then((r) => !dead && setHotels(r?.hotels || []))
      .catch(() => !dead && setHotels([]));
    return () => {
      dead = true;
    };
  }, [isIntl, option.hospital_id]);

  // Chosen legs replace the bundled estimates in the running total.
  const flightCost = flight ? Number(flight.price) : Number(option.flight_cost) || 0;
  const lodgingCost = hotel ? Number(hotel.total) : Number(option.lodging_cost) || 0;
  const total = isIntl
    ? Number(option.base_cost) +
      flightCost +
      lodgingCost +
      (Number(option.warranty_cost) || 0)
    : Number(option.expected_cost);

  const goNext = () => {
    const i = steps.findIndex((s) => s.key === step);
    setStep(steps[Math.min(i + 1, steps.length - 1)].key);
  };

  const NextButton = ({ label }) => (
    <button
      onClick={goNext}
      className="w-full h-11 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white font-semibold text-sm transition-colors"
    >
      {label}
    </button>
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-xs text-slate-300 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          All hospitals
        </button>
        <StepBar steps={steps} current={step} onJump={setStep} />
      </div>

      {/* Running package — always visible, updates as each leg is chosen. */}
      <div className="rounded-2xl border border-teal-400/30 bg-teal-500/5 p-3 space-y-2">
        <p className="text-[10px] uppercase tracking-wide text-teal-200/80">
          Your package
        </p>
        <Line
          label={option.name}
          sub={
            isIntl
              ? `${option.city}, ${option.country}`
              : `${option.city ? option.city + ", " : ""}${option.state} · ${percent(
                  option.complication_rate
                )} complication rate`
          }
          amount={option.base_cost}
        />
        {!isIntl && (
          <>
            <Line
              label="Flight"
              sub={
                sameState
                  ? `Care in ${option.state}, your home state — none required`
                  : "Domestic care — no air travel modelled"
              }
              amount={0}
            />
            <Line
              label="Recovery stay"
              sub={
                sameState
                  ? "Recover at home — no lodging cost"
                  : "Domestic care — no lodging modelled"
              }
              amount={0}
            />
            <Line
              label="Complication coverage"
              sub="Covered by your existing US plan"
              amount={0}
            />
          </>
        )}
        {isIntl && (
          <>
            <Line
              label={flight ? `${flight.carrier} — ${flight.duration}` : "Flight not chosen"}
              sub={
                flight
                  ? `${flight.origin}→${flight.destination}, ${
                      flight.stops === 0 ? "non-stop" : `${flight.stops} stop`
                    }`
                  : "bundled estimate"
              }
              amount={flightCost}
              pending={!flight}
            />
            <Line
              label={hotel ? hotel.name : "Hotel not chosen"}
              sub={
                hotel
                  ? `${hotel.nights} nights · ${hotel.distance_miles} mi from hospital`
                  : "bundled estimate"
              }
              amount={lodgingCost}
              pending={!hotel}
            />
            <Line
              label="180-day complication coverage"
              sub={`priced at ${percent(option.complication_rate)} complication risk`}
              amount={option.warranty_cost}
            />
          </>
        )}
        <div className="flex items-center justify-between border-t border-white/10 pt-2">
          <span className="text-xs text-slate-300">Total</span>
          <span className="font-heading text-xl font-bold text-white">
            {money(total)}
          </span>
        </div>
      </div>

      {/* STEP 1 — facility */}
      {step === "hospital" && (
        <div className="space-y-3">
          {option.reasoning && (
            <p className="text-sm text-slate-200 bg-slate-800/40 rounded-lg p-3 border border-white/5">
              {option.reasoning}
            </p>
          )}
          {!isIntl && (
            <p className="text-sm text-emerald-200/90 bg-emerald-500/10 rounded-lg p-3 border border-emerald-400/25">
              {sameState
                ? `${option.city ? option.city + ", " : ""}${option.state} is in your home state — no flight, no hotel, no complication policy. The only cost is the procedure itself.`
                : `Domestic care — no international flight or recovery stay. The only cost is the procedure itself.`}
            </p>
          )}
          <NextButton
            label={isIntl ? "Continue — choose your flight" : "Continue — coverage"}
          />
        </div>
      )}

      {/* STEP 2 — flight */}
      {step === "flight" && (
        <div className="space-y-3">
          <p className="text-xs text-slate-400">
            Round trip from JFK to {option.city}. Carriers and distance are real;
            fares are modelled from distance and schedules are not live.
          </p>
          {flights === null && (
            <p className="text-xs text-slate-500">Loading flights…</p>
          )}
          <div className="space-y-1.5">
            {(flights || []).map((f) => (
              <Choice
                key={f.flight_id}
                selected={flight?.flight_id === f.flight_id}
                onClick={() => setFlight(f)}
                title={f.carrier}
                meta={`${f.stops === 0 ? "Non-stop" : `${f.stops} stop`} · ${f.duration} · ${Number(
                  f.distance_miles
                ).toLocaleString()} mi`}
                price={f.price}
                note={f.tier === "cheapest" ? "Lowest fare" : f.tier === "fastest" ? "Fastest" : null}
              />
            ))}
          </div>
          <NextButton
            label={flight ? "Continue — choose your hotel" : "Skip — use bundled estimate"}
          />
        </div>
      )}

      {/* STEP 3 — hotel */}
      {step === "hotel" && (
        <div className="space-y-3">
          <p className="text-xs text-slate-400">
            Recovery hotels nearest {option.name}. Names and distances from
            OpenStreetMap; nightly rate is the destination average.
          </p>
          {hotels === null && <p className="text-xs text-slate-500">Loading hotels…</p>}
          {hotels && hotels.length === 0 && (
            <p className="text-xs text-slate-500">
              No mapped hotels near this hospital — lodging stays bundled.
            </p>
          )}
          <div className="space-y-1.5">
            {(hotels || []).map((h) => (
              <Choice
                key={h.name}
                selected={hotel?.name === h.name}
                onClick={() => setHotel(h)}
                title={h.name}
                meta={`${h.distance_miles} mi from hospital · ${h.nights} nights · ${money(
                  h.nightly_rate
                )}/night`}
                price={h.total}
              />
            ))}
          </div>
          <NextButton
            label={hotel ? "Continue — review coverage" : "Skip — use bundled estimate"}
          />
        </div>
      )}

      {/* STEP 4 — coverage + book */}
      {step === "coverage" && (
        <div className="space-y-3">
          {isIntl && option.distribution ? (
            <div className="rounded-xl border border-white/10 bg-slate-800/40 p-3 space-y-2">
              <p className="text-xs text-slate-300">
                A complication abroad is both a medical bill and a missed flight
                home. This policy covers both.
              </p>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="rounded-lg bg-red-500/10 border border-red-400/25 p-2">
                  <p className="text-[10px] text-red-200/80">Worst case uncovered</p>
                  <p className="text-base font-bold text-red-300">
                    {money(option.distribution.p99_uncovered)}
                  </p>
                </div>
                <div className="rounded-lg bg-emerald-500/10 border border-emerald-400/25 p-2">
                  <p className="text-[10px] text-emerald-200/80">Worst case covered</p>
                  <p className="text-base font-bold text-emerald-300">
                    {money(option.distribution.p99)}
                  </p>
                </div>
              </div>
              <p className="text-[11px] text-slate-400">
                The premium removes{" "}
                <span className="text-white font-semibold">
                  {money(option.distribution.tail_protection)}
                </span>{" "}
                of downside and costs{" "}
                <span className="text-white font-semibold">
                  {money(option.distribution.cost_of_certainty)}
                </span>{" "}
                in expectation.
              </p>
            </div>
          ) : (
            <p className="text-sm text-slate-400">
              Domestic care is billed through your existing plan — complication
              coverage applies to international travel only.
            </p>
          )}
          <button
            onClick={() => {
              onAddToCart?.({ ...option, flight, hotel });
              onBook(option, hotel?.name, flight?.flight_id);
            }}
            className="w-full h-11 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white font-semibold text-sm transition-colors"
          >
            Review &amp; book — {money(total)}
          </button>
        </div>
      )}
    </div>
  );
}
