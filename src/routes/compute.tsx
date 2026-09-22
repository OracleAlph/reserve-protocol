import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Field, Stat } from "@/components/section";
import {
  fitRateConstant,
  gainLossRatio,
  governingMinimum,
} from "@/lib/protocol/compute";

export const Route = createFileRoute("/compute")({ component: ComputePage });

function parsePairs(raw: string): Array<{ tYears: number; x: number }> {
  return raw
    .split(/[\n;]+/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const parts = line.split(/[,\s]+/).map(Number);
      return { tYears: parts[0] ?? NaN, x: parts[1] ?? NaN };
    })
    .filter((p) => Number.isFinite(p.tYears) && Number.isFinite(p.x) && p.x > 0);
}

function ComputePage() {
  const [series, setSeries] = useState("0, 1.18\n0.18, 1.12\n0.34, 1.01\n0.50, 0.90");
  const [kGain, setKGain] = useState("0.08");
  const [kLoss, setKLoss] = useState("0.12");
  const [domains, setDomains] = useState(
    "heart rate, 1.4\nlactate, 0.7\ngrip recovery, 0.9",
  );

  const points = useMemo(() => parsePairs(series), [series]);
  const fit = useMemo(() => fitRateConstant(points), [points]);
  const kg = Number(kGain);
  const kl = Number(kLoss);
  const ratio = gainLossRatio(
    Number.isFinite(kg) ? kg : null,
    Number.isFinite(kl) ? kl : null,
  );
  const gmin = useMemo(() => {
    const parsed = domains
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => {
        const idx = line.lastIndexOf(",");
        if (idx === -1) return { domain: line, rho: null as number | null };
        const domain = line.slice(0, idx).trim();
        const rho = Number(line.slice(idx + 1));
        return { domain, rho: Number.isFinite(rho) ? rho : null };
      });
    return governingMinimum(parsed);
  }, [domains]);

  return (
    <div className="grid gap-8">
      <header>
        <p className="text-[0.65rem] font-medium uppercase tracking-[0.18em] text-ink-subtle">
          Rule 7 · keep the clocks apart
        </p>
        <h1 className="mt-2 font-display text-4xl font-medium leading-tight">
          The two rate ratios
        </h1>
        <p className="mt-4 max-w-2xl text-ink-muted">
          These are the quantities the program contributes and neither is computable from a
          standard clinical dataset. They look alike and are not. One is adaptation across weeks,
          the other recovery within minutes. An implementation that reports either in the other’s
          vocabulary has not implemented this specification.
        </p>
      </header>

      <section className="rounded-xl bg-surface p-5 shadow-[var(--shadow-border)] sm:p-6">
        <h2 className="font-display text-xl font-medium">Rate constant from a series</h2>
        <p className="mt-2 text-sm text-ink-muted">
          Fit x = A e<sup>kt</sup>. A slope depends on where the person started; a rate constant
          does not. Need three or more positive points. t in years from the first visit, x the
          level. One pair per line: <span className="tabular-nums">t, x</span>.
        </p>
        <div className="mt-4 grid gap-4 lg:grid-cols-[1fr_1fr]">
          <Field label="Points">
            <Textarea
              className="min-h-40 font-mono text-sm"
              value={series}
              onChange={(e) => setSeries(e.target.value)}
            />
          </Field>
          <div className="grid content-start gap-4 rounded-lg bg-bg-elevated p-4">
            <Stat
              label="n"
              value={String(points.length)}
              hint={points.length < 3 ? "Two yield a slope contaminated by error." : "Exponential fit licensed."}
            />
            <Stat
              label="k"
              value={fit ? `${fit.k.toFixed(4)} yr⁻¹` : "—"}
              tone={fit && fit.k < 0 ? "rust" : "teal"}
            />
            <Stat label="A" value={fit ? fit.a.toFixed(3) : "—"} hint="Level at t = 0 under the fit." />
            <p className="text-xs text-ink-subtle">
              Secondary analysis in existing cohorts is the one licensed exception to this rule:
              there, fit an OLS slope on calendar time and name it a slope. Do not pool it with
              these constants.
            </p>
          </div>
        </div>
      </section>

      <section className="rounded-xl bg-surface p-5 shadow-[var(--shadow-border)] sm:p-6">
        <h2 className="font-display text-xl font-medium">
          Weeks-scale ratio · R = k<sub>g</sub> / k<sub>l</sub>
        </h2>
        <p className="mt-2 text-sm text-ink-muted">
          One capacity. A train-then-detrain design. Fit mono-exponentials to the training limb
          and the detraining limb separately. The decay fit begins after any early rebound, not at
          cessation. A single kinetic phase only. Where no measurable decay occurs, k<sub>l</sub>{" "}
          cannot be estimated and R is undefined — this is a scope condition, and reporting it as
          undefined is the correct result, not a failed analysis.
        </p>
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          <Field label="k_g (training)">
            <Input
              inputMode="decimal"
              className="tabular-nums"
              value={kGain}
              onChange={(e) => setKGain(e.target.value)}
            />
          </Field>
          <Field label="k_l (detraining)">
            <Input
              inputMode="decimal"
              className="tabular-nums"
              value={kLoss}
              onChange={(e) => setKLoss(e.target.value)}
            />
          </Field>
          <div className="rounded-lg bg-bg-elevated p-4">
            <Stat
              label="R"
              value={ratio.r != null ? ratio.r.toFixed(3) : "undefined"}
              hint={ratio.undefinedReason ?? "Weeks-scale. Not an acute recovery ratio."}
              tone={ratio.r == null ? "amber" : "teal"}
            />
          </div>
        </div>
      </section>

      <section className="rounded-xl bg-surface p-5 shadow-[var(--shadow-border)] sm:p-6">
        <h2 className="font-display text-xl font-medium">
          Acute ratio · ρ = r<sub>g</sub> / r<sub>l</sub>, then the governing minimum
        </h2>
        <p className="mt-2 text-sm text-ink-muted">
          Per domain, under a single challenge, over seconds to minutes. Compute ρ for each domain
          measured. The reserve estimate is the minimum across domains, not the mean. Averaging
          the slowest against the fastest hides exactly the thing that will fail them.
        </p>
        <div className="mt-4 grid gap-4 lg:grid-cols-[1fr_1fr]">
          <Field label="Domains" hint="One per line: name, ρ">
            <Textarea
              className="min-h-36 font-mono text-sm"
              value={domains}
              onChange={(e) => setDomains(e.target.value)}
            />
          </Field>
          <div className="rounded-lg bg-bg-elevated p-4">
            <Stat
              label="Governing minimum"
              value={
                gmin.minRho != null
                  ? `${gmin.minDomain} · ${gmin.minRho.toFixed(2)}`
                  : "—"
              }
              hint={gmin.note}
              tone="rust"
            />
            <p className="mt-4 text-xs text-ink-subtle">
              Years-scale reserve depletion along the five determinants is the Life construct. Do
              not quote a seconds-scale ratio as if it were a years-scale slope.
            </p>
          </div>
        </div>
      </section>

      <section className="rounded-xl border border-line bg-bg-elevated p-5 text-sm">
        <h2 className="font-display text-lg font-medium">The slope test (cohorts)</h2>
        <p className="mt-2 text-ink-muted">
          In any cohort with serial gait speed and a later functional outcome — disability,
          institutionalization, death, loss of stair use — the trajectory claim dies if the slope
          adds nothing once level is in the model. Pre-register that the slope must improve model
          fit beyond level; if its coefficient is indistinguishable from zero at the study’s
          planned alpha, the trajectory claim has failed in that sample. No composite score may be
          built to rescue a failed slope.
        </p>
      </section>
    </div>
  );
}
