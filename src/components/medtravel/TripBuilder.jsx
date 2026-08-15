import React, { useEffect, useState } from "react";
import { ArrowLeft, Check, Plane, BedDouble, ShieldCheck, Hospital } from "lucide-react";
import { money, percent } from "@/lib/format";
import { api } from "@/lib/api";

const STEPS = [
  { key: "hospital", label: "Facility", icon: Hospital },
  { key: "travel", label: "Travel & stay", icon: Plane },
  { key: "coverage", label: "Coverage", icon: ShieldCheck },
];

function StepBar({ current, onJump }) {
  return (
    <div className="flex items-center gap-1.5">
      {STEPS.map((s, i) => {
        const done = STEPS.findIndex((x) => x.key === current) > i;
        const active = s.key === current;
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
            {i < STEPS.length - 1 && (
              <span className="h-px w-3 bg-white/15 flex-shrink-0" />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

function Line({ label, sub, amount, muted }) {
  return (
    <div className="flex items-start justify-between gap-3 rounded-lg bg-slate-800/50 border border-white/10 px-3 py-2">
      <div className="min-w-0">
        <p className={`text-sm ${muted ? "text-slate-400" : "text-white"} truncate`}>
          {label}
        </p>
        {sub && <p className="text-[10px] text-slate-500">{sub}</p>}
      </div>
      <span className="text-sm font-semibold text-white flex-shrink-0">
        {money(amount)}
      </span>
    </div>
  );
}

export default function TripBuilder({ option, intake, onBack, onBook }) {
  const [step, setStep] = useState("hospital");
  const [hotels, setHotels] = useState(null);
  const [hotel, setHotel] = useState(null);

  const isIntl = !!option.country;

  useEffect(() => {
    if (!isIntl || !option.hospital_id) return;
    let cancelled = false;
    api
      .hotels(option.hospital_id)
      .then((r) => !cancelled && setHotels(r?.hotels || []))
      .catch(() => !cancelled && setHotels([]));
    return () => {
      cancelled = true;
    };
  }, [isIntl, option.hospital_id]);

  // Swapping the bundled lodging for a specific hotel changes the total.
  const bundledLodging = Number(option.lodging_cost) || 0;
  const lodging = hotel ? Number(hotel.total) : bundledLodging;
  const total = isIntl
    ? Number(option.base_cost) +
      Number(option.flight_cost || 0) +
      lodging +
      Number(option.warranty_cost || 0)
    : Number(option.expected_cost);

  const next = () =>
    setStep((s) => (s === "hospital" ? "travel" : s === "travel" ? "coverage" : s));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-xs text-slate-300 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          All options
        </button>
        <StepBar current={step} onJump={setStep} />
      </div>

      {/* Always-visible running package */}
      <div className="rounded-2xl border border-teal-400/30 bg-teal-500/5 p-3 space-y-2">
        <p className="text-[10px] uppercase tracking-wide text-teal-200/80">
          Your package
        </p>
        <Line
          label={option.name}
          sub={
            isIntl
              ? `${option.city}, ${option.country} · ${option.flight_hours}h flight`
              : `${option.city ? option.city + ", " : ""}${option.state} · ${percent(
                  option.complication_rate
                )} complication rate`
          }
          amount={option.base_cost}
        />
        {isIntl && (
          <>
            <Line
              label="Round-trip flight from JFK"
              sub={option.travel_source?.flights}
              amount={option.flight_cost}
              muted={step === "hospital"}
            />
            <Line
              label={hotel ? hotel.name : "Recovery stay (bundled estimate)"}
              sub={
                hotel
                  ? `${hotel.nights} nights · ${hotel.distance_miles} mi from hospital`
                  : "choose a specific hotel in the next step"
              }
              amount={lodging}
              muted={step === "hospital"}
            />
            <Line
              label="180-day complication coverage"
              sub={`priced at ${percent(option.complication_rate)} complication risk`}
              amount={option.warranty_cost}
              muted={step !== "coverage"}
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

      {/* Step body */}
      {step === "hospital" && (
        <div className="space-y-3">
          {option.reasoning && (
            <p className="text-sm text-slate-200 bg-slate-800/40 rounded-lg p-3 border border-white/5">
              {option.reasoning}
            </p>
          )}
          {!isIntl && option.source_url && (
            <p className="text-[10px] text-slate-500">
              Price and complication rate from CMS.
            </p>
          )}
          <button
            onClick={next}
            className="w-full h-11 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white font-semibold text-sm transition-colors"
          >
            {isIntl ? "Continue to travel & stay" : "Continue to coverage"}
          </button>
        </div>
      )}

      {step === "travel" && (
        <div className="space-y-3">
          {!isIntl && (
            <p className="text-sm text-slate-400">
              No travel needed — this facility is domestic.
            </p>
          )}
          {isIntl && (
            <>
              <p className="text-xs text-slate-400">
                Recovery hotels nearest {option.name}. Names and distances from
                OpenStreetMap; nightly rate is the destination average.
              </p>
              {hotels === null && (
                <p className="text-xs text-slate-500">Loading hotels…</p>
              )}
              {hotels && hotels.length === 0 && (
                <p className="text-xs text-slate-500">
                  No mapped hotels near this hospital — lodging stays bundled.
                </p>
              )}
              <div className="space-y-1.5">
                {(hotels || []).map((h) => {
                  const sel = hotel?.name === h.name;
                  return (
                    <button
                      key={h.name}
                      onClick={() => setHotel(sel ? null : h)}
                      className={`w-full text-left rounded-lg px-3 py-2 border transition-colors ${
                        sel
                          ? "bg-teal-500/15 border-teal-400/40"
                          : "bg-slate-800/40 border-white/10 hover:border-white/25"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-sm text-white truncate flex items-center gap-1.5">
                          <BedDouble className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                          {h.name}
                        </span>
                        <span className="text-xs text-slate-300 flex-shrink-0">
                          {h.distance_miles} mi · {money(h.total)}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </>
          )}
          <button
            onClick={next}
            className="w-full h-11 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white font-semibold text-sm transition-colors"
          >
            Continue to coverage
          </button>
        </div>
      )}

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
                  <p className="text-[10px] text-red-200/80">
                    Worst case uncovered
                  </p>
                  <p className="text-base font-bold text-red-300">
                    {money(option.distribution.p99_uncovered)}
                  </p>
                </div>
                <div className="rounded-lg bg-emerald-500/10 border border-emerald-400/25 p-2">
                  <p className="text-[10px] text-emerald-200/80">
                    Worst case covered
                  </p>
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
            onClick={() => onBook(option, hotel?.name)}
            className="w-full h-11 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white font-semibold text-sm transition-colors"
          >
            Review & book — {money(total)}
          </button>
        </div>
      )}
    </div>
  );
}
