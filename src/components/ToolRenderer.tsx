'use client';

import { useMemo, useState } from 'react';
import type { Tool } from '@/src/lib/tools';
import TicTacToe from '@/src/components/tools/TicTacToe';

function num(v: string): number | null {
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

export default function ToolRenderer({ tool }: { tool: Tool }) {
  // generic input state
  const [state, setState] = useState<Record<string, any>>({});

  const set = (k: string, v: any) => setState((s) => ({ ...s, [k]: v }));

  const output = useMemo(() => compute(tool, state), [tool, state]);

  // Special engines with custom UI (games)
  if (tool.engineId === 'game.tictactoe') return <TicTacToe />;
  if (tool.engineId === 'party.truthDare') return <TruthDare />;
  if (tool.engineId === 'party.wyr') return <WouldYouRather />;
  if (tool.engineId === 'game.reaction') return <ReactionTest />;

  // Build a simple form from inputsSchema
  const inputs = (tool.inputsSchema ?? {}) as Record<string, string>;
  const keys = Object.keys(inputs);

  return (
    <div style={{ border: '1px solid #eee', borderRadius: 14, padding: 14 }}>
      {keys.length > 0 && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: 12,
          }}
        >
          {keys.map((k) => {
            const type = inputs[k];
            if (type === 'boolean') {
              return (
                <label
                  key={k}
                  style={{ display: 'flex', gap: 10, alignItems: 'center' }}
                >
                  <input
                    type="checkbox"
                    checked={!!state[k]}
                    onChange={(e) => set(k, e.target.checked)}
                  />
                  <span>{k}</span>
                </label>
              );
            }
            if (type === 'string' && k === 'names') {
              return (
                <label key={k} style={{ display: 'grid', gap: 6 }}>
                  <span>{k}</span>
                  <textarea
                    value={state[k] ?? ''}
                    onChange={(e) => set(k, e.target.value)}
                    placeholder={'one name per line'}
                    style={{
                      minHeight: 120,
                      padding: 10,
                      border: '1px solid #ddd',
                      borderRadius: 10,
                    }}
                  />
                </label>
              );
            }
            if (type === 'string' && k === 'json') {
              return (
                <label key={k} style={{ display: 'grid', gap: 6 }}>
                  <span>{k}</span>
                  <textarea
                    value={state[k] ?? ''}
                    onChange={(e) => set(k, e.target.value)}
                    placeholder={'{"a":1}'}
                    style={{
                      minHeight: 140,
                      padding: 10,
                      border: '1px solid #ddd',
                      borderRadius: 10,
                    }}
                  />
                </label>
              );
            }
            if (type === 'string' && (k === 'date1' || k === 'date2')) {
              return (
                <label key={k} style={{ display: 'grid', gap: 6 }}>
                  <span>{k}</span>
                  <input
                    type="date"
                    value={state[k] ?? ''}
                    onChange={(e) => set(k, e.target.value)}
                    style={{
                      padding: 10,
                      border: '1px solid #ddd',
                      borderRadius: 10,
                    }}
                  />
                </label>
              );
            }
            // default number input
            return (
              <label key={k} style={{ display: 'grid', gap: 6 }}>
                <span>{k}</span>
                <input
                  type="number"
                  value={state[k] ?? ''}
                  onChange={(e) => set(k, e.target.value)}
                  style={{
                    padding: 10,
                    border: '1px solid #ddd',
                    borderRadius: 10,
                  }}
                />
              </label>
            );
          })}
        </div>
      )}

<div style={{ marginTop: 16, paddingTop: 16, borderTop: "1px solid #eee" }}>
  <div style={{ fontWeight: 900, marginBottom: 10, fontSize: 14, letterSpacing: 0.2 }}>
    Results
  </div>

  {(() => {
    const isObj = output && typeof output === "object";
    const outObj = (isObj ? (output as any) : null) as Record<string, any> | null;

    const toLabel = (k: string) =>
      k
        .replace(/_/g, " ")
        .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
        .replace(/\b\w/g, (c) => c.toUpperCase());

    const fmt = (v: any) => {
      if (typeof v === "number") return v.toLocaleString("en-IN");
      if (typeof v === "boolean") return v ? "Yes" : "No";
      if (v === null || v === undefined) return "—";
      return String(v);
    };

    // 1) string output (like JSON prettify result)
    if (typeof output === "string") {
      return (
        <pre
          style={{
            margin: 0,
            whiteSpace: "pre-wrap",
            background: "#fafafa",
            border: "1px solid #eee",
            wordBreak: "break-word",
            overflowWrap: "anywhere",
            borderRadius: 12,
            padding: 12,
            fontSize: 13,
            lineHeight: 1.5,
          }}
        >
          {output}
        </pre>
      );
    }

    // 2) error
    if (outObj && outObj.error) {
      return (
        <div
          style={{
            background: "#fff5f5",
            border: "1px solid #ffd6d6",
            borderRadius: 12,
            padding: 12,
            color: "#8a1f1f",
            fontWeight: 700,
          }}
        >
          {String(outObj.error)}
        </div>
      );
    }

    // 3) object output (most tools)
    if (outObj) {
      const entries = Object.entries(outObj).filter(([k]) => k !== "error");

      // Choose a "primary" key if present
      const preferred = ["emi", "monthlyTakeHome", "tax", "result", "resultDate", "newSalary", "bmi", "newValue", "oldMinusNew", "totalInterest", "totalPayment", "years", "totalDays"];
      let primaryKey: string | null = null;
      for (const k of preferred) {
        if (k in outObj) {
          primaryKey = k;
          break;
        }
      }
      if (!primaryKey && entries.length === 1) primaryKey = entries[0][0];

      const primaryVal = primaryKey ? outObj[primaryKey] : null;
      const secondary = entries.filter(([k]) => k !== primaryKey);

      return (
        <div
          style={{
            border: "1px solid #eee",
            borderRadius: 14,
            padding: 14,
            background: "white",
          }}
        >
          {primaryKey ? (
            <div style={{ marginBottom: secondary.length ? 12 : 0 }}>
              <div style={{ fontSize: 12, color: "#666", fontWeight: 800, marginBottom: 6 }}>
                {toLabel(primaryKey)}
              </div>
              <div style={{ fontSize: 28, fontWeight: 900, letterSpacing: -0.2 }}>
                {fmt(primaryVal)}
              </div>
            </div>
          ) : null}

          {secondary.length ? (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr",
                gap: 10,
              }}
            >
              {secondary.map(([k, v]) => (
                <div
                  key={k}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    gap: 12,
                    padding: "10px 12px",
                    background: "#fafafa",
                    border: "1px solid #eee",
                    borderRadius: 12,
                  }}
                >
                  <div style={{ fontWeight: 800, color: "#333" }}>{toLabel(k)}</div>
                  <div
                      style={{
                        fontWeight: 900,
                        wordBreak: "break-word",
                        overflowWrap: "anywhere",
                      }}
                    >
                      {fmt(v)}
                    </div>
                </div>
              ))}
            </div>
          ) : null}
        </div>
      );
    }

    // 4) fallback
    return (
      <pre style={{ margin: 0, whiteSpace: "pre-wrap" }}>
        {JSON.stringify(output, null, 2)}
      </pre>
    );
  })()}

  {/* Keep your tool-specific action buttons exactly as they are */}
  {tool.engineId === "util.json" && (
    <div style={{ display: "flex", gap: 10, marginTop: 10, flexWrap: "wrap" }}>
      <button onClick={() => set("mode", "prettify")} style={btn}>
        Prettify
      </button>
      <button onClick={() => set("mode", "minify")} style={btn}>
        Minify
      </button>
    </div>
  )}
  {tool.engineId === "util.password" && (
    <div style={{ display: "flex", gap: 10, marginTop: 10, flexWrap: "wrap" }}>
      <button onClick={() => set("_regen", Math.random())} style={btn}>
        Generate
      </button>
    </div>
  )}
  {tool.engineId === "util.uuid" && (
    <div style={{ display: "flex", gap: 10, marginTop: 10, flexWrap: "wrap" }}>
      <button onClick={() => set("_regen", Math.random())} style={btn}>
        Generate
      </button>
    </div>
  )}
  {tool.engineId === "util.randomNumber" && (
    <div style={{ display: "flex", gap: 10, marginTop: 10, flexWrap: "wrap" }}>
      <button onClick={() => set("_regen", Math.random())} style={btn}>
        Generate
      </button>
    </div>
  )}
  {tool.engineId === "util.teamSplit" && (
    <div style={{ display: "flex", gap: 10, marginTop: 10, flexWrap: "wrap" }}>
      <button onClick={() => set("_regen", Math.random())} style={btn}>
        Split
      </button>
    </div>
  )}
</div>

    </div>
  );
}

const btn: React.CSSProperties = {
  padding: '8px 12px',
  borderRadius: 10,
  border: '1px solid #ddd',
  background: 'white',
  cursor: 'pointer',
};

function compute(tool: any, s: Record<string, any>) {
  const engineId = tool.engineId;
  const cfg = tool.computeConfig || {};
  switch (engineId) {
    case 'fitness.oneRepMax': {
      const w = num(s.weightKg ?? '');
      const r = num(s.reps ?? '');
      if (w == null || r == null || r <= 0)
        return { error: 'Enter weightKg and reps (>0).' };
      const epley = w * (1 + r / 30);
      const brzycki = w * (36 / (37 - r));
      return { epley_1rm_kg: round(epley), brzycki_1rm_kg: round(brzycki) };
    }
    case 'convert.linear': {
      const v = num(s.value ?? '');
      if (v == null) return { error: 'Enter value.' };

      const multiplier = Number(cfg.multiplier);
      const outputKey = String(cfg.outputKey || 'result');
      const decimals = Number.isFinite(cfg.decimals) ? Number(cfg.decimals) : 4;

      if (!Number.isFinite(multiplier))
        return { error: 'Invalid converter config.' };

      const out = v * multiplier;
      return { [outputKey]: round(out, decimals) };
    }
    case 'convert.affine': {
      const v = num(s.value ?? '');
      if (v == null) return { error: 'Enter value.' };

      const multiplier = Number(cfg.multiplier);
      const offset = Number(cfg.offset ?? 0);
      const outputKey = String(cfg.outputKey || 'result');
      const decimals = Number.isFinite(cfg.decimals) ? Number(cfg.decimals) : 4;

      if (!Number.isFinite(multiplier) || !Number.isFinite(offset)) {
        return { error: 'Invalid converter config.' };
      }

      const out = v * multiplier + offset;
      return { [outputKey]: round(out, decimals) };
    }
    case 'finance.emi': {
      const P = num(s.principal ?? '');
      const annual = num(s.annualRatePercent ?? '');
      const n = num(s.tenureMonths ?? '');
      if (P == null || annual == null || n == null || P <= 0 || n <= 0)
        return {
          error: 'Enter principal>0, annualRatePercent, tenureMonths>0.',
        };
      const r = annual / 100 / 12;
      const emi =
        r === 0
          ? P / n
          : (P * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
      const total = emi * n;
      const interest = total - P;
      return {
        emi: round(emi),
        totalPaid: round(total),
        totalInterest: round(interest),
      };
    }
    case 'health.bmi': {
      const w = num(s.weightKg ?? '');
      const hcm = num(s.heightCm ?? '');
      if (w == null || hcm == null || w <= 0 || hcm <= 0)
        return { error: 'Enter weightKg>0 and heightCm>0.' };
      const h = hcm / 100;
      const bmi = w / (h * h);
      const cat =
        bmi < 18.5
          ? 'Underweight'
          : bmi < 25
          ? 'Normal'
          : bmi < 30
          ? 'Overweight'
          : 'Obese';
      return { bmi: round(bmi, 2), category: cat };
    }
    case 'finance.compound': {
      const P = num(s.principal ?? '');
      const annual = num(s.annualRatePercent ?? '');
      const years = num(s.years ?? '');
      if (P == null || annual == null || years == null || P < 0 || years < 0)
        return { error: 'Enter principal, annualRatePercent, years.' };
      const r = annual / 100;
      const n = 12;
      const fv = P * Math.pow(1 + r / n, n * years);
      return { futureValue: round(fv) };
    }
    case 'finance.simple': {
      const P = num(s.principal ?? '');
      const annual = num(s.annualRatePercent ?? '');
      const years = num(s.years ?? '');
      if (P == null || annual == null || years == null)
        return { error: 'Enter principal, annualRatePercent, years.' };
      const interest = P * (annual / 100) * years;
      return { interest: round(interest), total: round(P + interest) };
    }
    case 'finance.cagr': {
      const start = num(s.start ?? '');
      const end = num(s.end ?? '');
      const years = num(s.years ?? '');
      if (
        start == null ||
        end == null ||
        years == null ||
        start <= 0 ||
        years <= 0
      )
        return { error: 'Enter start>0, end, years>0.' };
      const cagr = (Math.pow(end / start, 1 / years) - 1) * 100;
      return { cagrPercent: round(cagr, 2) };
    }
    case 'math.percentIncrease': {
      const o = num(s.oldValue ?? '');
      const n = num(s.newValue ?? '');
      if (o == null || n == null)
        return { error: 'Enter oldValue and newValue.' };
      if (o === 0) return { error: 'oldValue cannot be 0.' };
      const delta = n - o;
      const pct = (delta / o) * 100;
      return { delta: round(delta, 2), percent: round(pct, 2) };
    }
    case 'math.percentDecrease': {
      const o = num(s.oldValue ?? '');
      const n = num(s.newValue ?? '');
      if (o == null || n == null)
        return { error: 'Enter oldValue and newValue.' };
      if (o === 0) return { error: 'oldValue cannot be 0.' };
      const delta = o - n;
      const pct = (delta / o) * 100;
      return { delta: round(delta, 2), percent: round(pct, 2) };
    }
    case 'math.discount': {
      const price = num(s.price ?? '');
      const d = num(s.discountPercent ?? '');
      if (price == null || d == null)
        return { error: 'Enter price and discountPercent.' };
      const saved = price * (d / 100);
      return { finalPrice: round(price - saved), saved: round(saved) };
    }
    case 'convert.mToFt': {
      const v = num(s.value ?? '');
      if (v == null) return { error: 'Enter value.' };
      return { feet: round(v * 3.28084, 4) };
    }
    case 'convert.ftToM': {
      const v = num(s.value ?? '');
      if (v == null) return { error: 'Enter value.' };
      return { meters: round(v / 3.28084, 4) };
    }
    case 'convert.kgToLb': {
      const v = num(s.value ?? '');
      if (v == null) return { error: 'Enter value.' };
      return { lb: round(v * 2.20462, 4) };
    }
    case 'convert.lbToKg': {
      const v = num(s.value ?? '');
      if (v == null) return { error: 'Enter value.' };
      return { kg: round(v / 2.20462, 4) };
    }
    case 'convert.cToF': {
      const v = num(s.value ?? '');
      if (v == null) return { error: 'Enter value.' };
      return { fahrenheit: round((v * 9) / 5 + 32, 2) };
    }
    case 'convert.fToC': {
      const v = num(s.value ?? '');
      if (v == null) return { error: 'Enter value.' };
      return { celsius: round(((v - 32) * 5) / 9, 2) };
    }
    case 'convert.mbToGb': {
      const v = num(s.value ?? '');
      if (v == null) return { error: 'Enter value.' };
      return { gb: round(v / 1024, 6) };
    }
    case 'convert.gbToMb': {
      const v = num(s.value ?? '');
      if (v == null) return { error: 'Enter value.' };
      return { mb: round(v * 1024, 3) };
    }
    case 'util.uuid': {
      // regen button toggles _regen in state
      const _ = s._regen;
      try {
        const id =
          globalThis.crypto && 'randomUUID' in globalThis.crypto
            ? globalThis.crypto.randomUUID()
            : fallbackUUID();
        return { uuid: id };
      } catch {
        return { uuid: fallbackUUID() };
      }
    }
    case 'util.password': {
      const _ = s._regen;
      const length = num(s.length ?? '') ?? 16;
      const includeSymbols = !!s.includeSymbols;
      return {
        password: genPassword(
          Math.max(6, Math.min(64, length)),
          includeSymbols
        ),
      };
    }
    case 'util.json': {
      const txt = (s.json ?? '') as string;
      const mode = (s.mode ?? 'prettify') as string;
      if (!txt.trim()) return { output: '' };
      try {
        const obj = JSON.parse(txt);
        return {
          output:
            mode === 'minify'
              ? JSON.stringify(obj)
              : JSON.stringify(obj, null, 2),
        };
      } catch (e: any) {
        return { error: 'Invalid JSON.' };
      }
    }
    case 'date.diff': {
      const d1 = (s.date1 ?? '') as string;
      const d2 = (s.date2 ?? '') as string;
      if (!d1 || !d2) return { error: 'Select date1 and date2.' };
      const t1 = new Date(d1).getTime();
      const t2 = new Date(d2).getTime();
      const days = Math.round((t2 - t1) / (1000 * 60 * 60 * 24));
      return { daysDifference: days, absoluteDays: Math.abs(days) };
    }
    case 'util.randomNumber': {
      const _ = s._regen;
      const minv = num(s.min ?? '') ?? 0;
      const maxv = num(s.max ?? '') ?? 100;
      if (maxv < minv) return { error: 'max must be >= min.' };
      const val = Math.floor(Math.random() * (maxv - minv + 1)) + minv;
      return { value: val };
    }
    case 'util.teamSplit': {
      const _ = s._regen;
      const names = ((s.names ?? '') as string)
        .split('\n')
        .map((x) => x.trim())
        .filter(Boolean);
      if (names.length < 2)
        return { error: 'Add at least 2 names (one per line).' };
      // shuffle
      for (let i = names.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [names[i], names[j]] = [names[j], names[i]];
      }
      const mid = Math.ceil(names.length / 2);
      return { teamA: names.slice(0, mid), teamB: names.slice(mid) };
    }
    case 'finance.sip': {
      const monthly = num(s.monthlyInvestment ?? '');
      const annual = num(s.annualRatePercent ?? '');
      const years = num(s.years ?? '');
      if (monthly == null || annual == null || years == null) {
        return { error: 'Enter monthlyInvestment, annualRatePercent, years.' };
      }

      const r = annual / 100 / 12;
      const n = years * 12;

      const fv = monthly * ((Math.pow(1 + r, n) - 1) / r) * (1 + r);

      return {
        totalInvested: round(monthly * n),
        futureValue: round(fv),
        wealthGained: round(fv - monthly * n),
      };
    }
    case "tax.india.newRegime": {
      const income = Number(s.annualIncome);
      if (!Number.isFinite(income)) return { error: "Enter valid income" };
    
      let tax = 0;
    
      if (income <= 300000) tax = 0;
      else if (income <= 600000) tax = (income - 300000) * 0.05;
      else if (income <= 900000) tax = 15000 + (income - 600000) * 0.10;
      else if (income <= 1200000) tax = 45000 + (income - 900000) * 0.15;
      else if (income <= 1500000) tax = 90000 + (income - 1200000) * 0.20;
      else tax = 150000 + (income - 1500000) * 0.30;
    
      return { tax: Math.round(tax) };
    }
    case "tax.india.oldRegime": {
      const income = Number(s.taxableIncome);
      if (!Number.isFinite(income)) return { error: "Enter valid income" };
    
      let tax = 0;
    
      if (income <= 250000) tax = 0;
      else if (income <= 500000) tax = (income - 250000) * 0.05;
      else if (income <= 1000000)
        tax = 12500 + (income - 500000) * 0.20;
      else
        tax = 112500 + (income - 1000000) * 0.30;
    
      return { tax: Math.round(tax) };
    }
    case "date.age": {
      const d1 = String(s.date1 || "");
      const d2 = String(s.date2 || "");
      if (!d1 || !d2) return { error: "Pick both dates." };
    
      const a = new Date(d1 + "T00:00:00");
      const b = new Date(d2 + "T00:00:00");
      if (isNaN(a.getTime()) || isNaN(b.getTime())) return { error: "Invalid dates." };
    
      // Ensure start <= end
      let start = a, end = b;
      if (start > end) [start, end] = [end, start];
    
      const y1 = start.getFullYear(), m1 = start.getMonth(), day1 = start.getDate();
      const y2 = end.getFullYear(), m2 = end.getMonth(), day2 = end.getDate();
    
      let years = y2 - y1;
      let months = m2 - m1;
      let days = day2 - day1;
    
      // Borrow days from previous month if needed
      if (days < 0) {
        const prevMonth = new Date(y2, m2, 0); // last day of previous month
        days += prevMonth.getDate();
        months -= 1;
      }
      if (months < 0) {
        months += 12;
        years -= 1;
      }
    
      const msPerDay = 24 * 60 * 60 * 1000;
      const totalDays = Math.round((end.getTime() - start.getTime()) / msPerDay);
    
      const totalWeeks = Math.floor(totalDays / 7);
      const remDays = totalDays % 7;
    
      return {
        years,
        months,
        days,
        totalDays,
        totalWeeks,
        remainingDays: remDays
      };
    }
    case "date.addDays": {
      const dateStr = String(s.date || "");
      const days = Number(s.days);
    
      if (!dateStr) return { error: "Pick a date." };
      if (!Number.isFinite(days)) return { error: "Enter valid days." };
    
      const d = new Date(dateStr + "T00:00:00");
      if (isNaN(d.getTime())) return { error: "Invalid date." };
    
      d.setDate(d.getDate() + Math.trunc(days));
    
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, "0");
      const dd = String(d.getDate()).padStart(2, "0");
    
      return { resultDate: `${yyyy}-${mm}-${dd}` };
    }
    case "date.workdays": {
      const d1 = String(s.date1 || "");
      const d2 = String(s.date2 || "");
      if (!d1 || !d2) return { error: "Pick both dates." };
    
      const a = new Date(d1 + "T00:00:00");
      const b = new Date(d2 + "T00:00:00");
      if (isNaN(a.getTime()) || isNaN(b.getTime())) return { error: "Invalid dates." };
    
      let start = a, end = b;
      if (start > end) [start, end] = [end, start];
    
      let count = 0;
      const cur = new Date(start);
      while (cur <= end) {
        const day = cur.getDay(); // 0 Sun .. 6 Sat
        if (day !== 0 && day !== 6) count++;
        cur.setDate(cur.getDate() + 1);
      }
      return { workdays: count };
    }
    case "date.nextBirthday": {
      const dobStr = String(s.dob || "");
      const asOfStr = String(s.asOf || "");
      if (!dobStr || !asOfStr) return { error: "Pick both dates." };
    
      const dob = new Date(dobStr + "T00:00:00");
      const asOf = new Date(asOfStr + "T00:00:00");
      if (isNaN(dob.getTime()) || isNaN(asOf.getTime())) return { error: "Invalid dates." };
    
      const thisYear = asOf.getFullYear();
      let next = new Date(thisYear, dob.getMonth(), dob.getDate());
      if (next < asOf) next = new Date(thisYear + 1, dob.getMonth(), dob.getDate());
    
      const msPerDay = 24 * 60 * 60 * 1000;
      const daysUntil = Math.round((next.getTime() - asOf.getTime()) / msPerDay);
    
      return {
        nextBirthday: `${next.getFullYear()}-${String(next.getMonth() + 1).padStart(2, "0")}-${String(next.getDate()).padStart(2, "0")}`,
        daysUntil
      };
    }
    case "date.isoWeek": {
      const dateStr = String(s.date || "");
      if (!dateStr) return { error: "Pick a date." };
      const d = new Date(dateStr + "T00:00:00");
      if (isNaN(d.getTime())) return { error: "Invalid date." };
    
      // ISO week algorithm
      const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
      const dayNum = date.getUTCDay() || 7; // Mon=1..Sun=7
      date.setUTCDate(date.getUTCDate() + 4 - dayNum);
      const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
      const weekNo = Math.ceil((((date.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
    
      return { isoWeek: weekNo, isoYear: date.getUTCFullYear() };
    }
    case "finance.loanInterest": {
      const principal = Number(s.principal);
      const annualRate = Number(s.annualRatePercent) / 100;
      const years = Number(s.years);
    
      if (!principal || !annualRate || !years)
        return { error: "Enter valid inputs." };
    
      const totalInterest = principal * annualRate * years;
      const totalPayment = principal + totalInterest;
    
      return {
        totalInterest: Math.round(totalInterest),
        totalPayment: Math.round(totalPayment)
      };
    }    
    case "math.formula": {
      const cfg = (tool.computeConfig || {}) as any;
    
      // New mode (recommended): formulaKey -> safe built-in formulas
      const key = String(cfg.formulaKey || "");
      if (key) {
        const parseNumList = (v: any) =>
          String(v ?? "")
            .split(/[\s,]+/)
            .filter(Boolean)
            .map((x) => {
              const n = Number(x);
              if (!Number.isFinite(n)) throw new Error("Invalid number in list");
              return n;
            });
    
        const F: Record<string, (s: Record<string, any>) => any> = {
          log10: (s) => {
            const x = Number(s.x);
            if (!Number.isFinite(x) || x <= 0) throw new Error("x must be > 0");
            return Math.log10 ? Math.log10(x) : Math.log(x) / Math.LN10;
          },
          log2: (s) => {
            const x = Number(s.x);
            if (!Number.isFinite(x) || x <= 0) throw new Error("x must be > 0");
            return Math.log2 ? Math.log2(x) : Math.log(x) / Math.LN2;
          },
          ln: (s) => {
            const x = Number(s.x);
            if (!Number.isFinite(x) || x <= 0) throw new Error("x must be > 0");
            return Math.log(x);
          },
          antilog10: (s) => {
            const x = Number(s.x);
            if (!Number.isFinite(x)) throw new Error("x is required");
            return Math.pow(10, x);
          },
          pow: (s) => {
            const x = Number(s.x);
            const y = Number(s.y);
            if (!Number.isFinite(x) || !Number.isFinite(y)) throw new Error("x and y required");
            return Math.pow(x, y);
          },
          sqrt: (s) => {
            const x = Number(s.x);
            if (!Number.isFinite(x) || x < 0) throw new Error("x must be >= 0");
            return Math.sqrt(x);
          },
    
          sma: (s) => {
            const arr = parseNumList(s.prices);
            if (arr.length === 0) throw new Error("Enter prices");
            return arr.reduce((a, b) => a + b, 0) / arr.length;
          },
          ema: (s) => {
            const arr = parseNumList(s.prices);
            const period = Math.floor(Number(s.period));
            if (arr.length === 0) throw new Error("Enter prices");
            if (!Number.isFinite(period) || period <= 0) throw new Error("period must be >= 1");
            const k = 2 / (period + 1);
            let ema = arr[0];
            for (let i = 1; i < arr.length; i++) ema = arr[i] * k + ema * (1 - k);
            return ema;
          },
          macd: (s) => {
            const arr = parseNumList(s.prices);
            if (arr.length < 2) throw new Error("Enter more prices");
            const k12 = 2 / 13, k26 = 2 / 27, k9 = 2 / 10;
            let e12 = arr[0], e26 = arr[0];
            const macdSeries: number[] = [];
            for (let i = 1; i < arr.length; i++) {
              e12 = arr[i] * k12 + e12 * (1 - k12);
              e26 = arr[i] * k26 + e26 * (1 - k26);
              macdSeries.push(e12 - e26);
            }
            const macd = macdSeries[macdSeries.length - 1];
            let signal = macdSeries[0] ?? macd;
            for (let i = 1; i < macdSeries.length; i++) {
              signal = macdSeries[i] * k9 + signal * (1 - k9);
            }
            return { macd, signal, histogram: macd - signal };
          },
    
          pnl: (s) => {
            const buy = Number(s.buy), sell = Number(s.sell), qty = Number(s.qty);
            if (!Number.isFinite(buy) || !Number.isFinite(sell) || !Number.isFinite(qty))
              throw new Error("buy, sell, qty required");
            const profit = (sell - buy) * qty;
            const profitPercent = buy === 0 ? null : ((sell - buy) / buy) * 100;
            return { profit, profitPercent };
          },
          breakeven: (s) => {
            const buy = Number(s.buy), feePercent = Number(s.feePercent);
            if (!Number.isFinite(buy) || !Number.isFinite(feePercent) || buy <= 0)
              throw new Error("buy>0 and feePercent required");
            const f = feePercent / 100;
            if (f >= 1) throw new Error("feePercent too large");
            return buy * (1 + f) / (1 - f);
          },
          riskReward: (s) => {
            const entry = Number(s.entry), stop = Number(s.stop), target = Number(s.target);
            if (!Number.isFinite(entry) || !Number.isFinite(stop) || !Number.isFinite(target))
              throw new Error("entry, stop, target required");
            const risk = Math.abs(entry - stop);
            const reward = Math.abs(target - entry);
            if (risk === 0) throw new Error("Entry and stop cannot be same");
            return { risk, reward, rr: reward / risk };
          },
        };
    
        const fn = F[key];
        if (!fn) return { error: "Invalid formula." };
    
        try {
          const out = fn(s as any);
          // normalize single number -> {result: <number>}
          if (typeof out === "number") return { result: out };
          return out;
        } catch (e: any) {
          return { error: e?.message || "Computation failed." };
        }
      }
    
      // Backward compatibility (your old eval-based formula)
      // Keep existing tools working, but don't create NEW tools using this path.
      const formula = String(cfg.formula || "");
      const outputKey = String(cfg.outputKey || "result");
      const decimals = Number.isFinite(cfg.decimals) ? Number(cfg.decimals) : 2;
    
      const inputs = (tool.inputsSchema ?? {}) as Record<string, string>;
      const scope: Record<string, number> = {};
    
      for (const k of Object.keys(inputs)) {
        const raw = (s as any)[k];
        const n = typeof raw === "number" ? raw : Number(raw);
        if (!Number.isFinite(n)) return { error: `Enter valid ${k}.` };
        scope[k] = n;
      }
    
      if (!/^[0-9+\-*/().\s_a-zA-Z]+$/.test(formula)) return { error: "Invalid formula." };
    
      const expr = formula.replace(/[a-zA-Z_]\w*/g, (name) => {
        if (!(name in scope)) return "NaN";
        return String(scope[name]);
      });
    
      // eslint-disable-next-line no-new-func
      const out = Function(`"use strict"; return (${expr});`)();
      if (!Number.isFinite(out)) return { error: "Computation failed." };
    
      const roundLocal = (x: number, d: number) => {
        const p = Math.pow(10, d);
        return Math.round(x * p) / p;
      };
    
      return { [outputKey]: roundLocal(out, decimals) };
    }
    
    default:
      return { note: `Engine not implemented: ${engineId}` };
  }
}

function round(n: number, digits: number = 2) {
  const p = Math.pow(10, digits);
  return Math.round(n * p) / p;
}

function genPassword(length: number, symbols: boolean) {
  const letters =
    'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  const sym = '!@#$%^&*()_+-=[]{};:,.<>?';
  const chars = letters + (symbols ? sym : '');
  let out = '';
  for (let i = 0; i < length; i++)
    out += chars[Math.floor(Math.random() * chars.length)];
  return out;
}

function fallbackUUID() {
  // not perfect but ok for MVP
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/** party + reaction components inline for MVP simplicity */
function TruthDare() {
  const truths = [
    'What’s the most embarrassing thing you’ve done recently?',
    'What’s a secret talent you have?',
    'What’s the biggest lie you’ve told this year?',
  ];
  const dares = [
    'Do 15 jumping jacks.',
    'Speak in a fake accent for 1 minute.',
    'Send a funny emoji to a friend (optional).',
  ];
  const [text, setText] = useState<string>('Tap Truth or Dare');
  return (
    <div style={{ border: '1px solid #eee', borderRadius: 14, padding: 14 }}>
      <div style={{ fontWeight: 800, marginBottom: 10 }}>Prompt</div>
      <div style={{ fontSize: 18, marginBottom: 12 }}>{text}</div>
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        <button
          style={btn}
          onClick={() =>
            setText(truths[Math.floor(Math.random() * truths.length)])
          }
        >
          Truth
        </button>
        <button
          style={btn}
          onClick={() =>
            setText(dares[Math.floor(Math.random() * dares.length)])
          }
        >
          Dare
        </button>
      </div>
    </div>
  );
}

function WouldYouRather() {
  const qs = [
    'Would you rather be always 10 minutes late or always 20 minutes early?',
    'Would you rather have the ability to fly or be invisible?',
    'Would you rather lose your phone or lose your wallet?',
  ];
  const [q, setQ] = useState(qs[0]);
  return (
    <div style={{ border: '1px solid #eee', borderRadius: 14, padding: 14 }}>
      <div style={{ fontWeight: 800, marginBottom: 10 }}>Question</div>
      <div style={{ fontSize: 18, marginBottom: 12 }}>{q}</div>
      <button
        style={btn}
        onClick={() => setQ(qs[Math.floor(Math.random() * qs.length)])}
      >
        Next
      </button>
    </div>
  );
}

function ReactionTest() {
  const [status, setStatus] = useState<'idle' | 'waiting' | 'go' | 'done'>(
    'idle'
  );
  const [start, setStart] = useState<number>(0);
  const [ms, setMs] = useState<number | null>(null);
  const [timer, setTimer] = useState<any>(null);

  const startTest = () => {
    if (timer) clearTimeout(timer);
    setMs(null);
    setStatus('waiting');
    const delay = 800 + Math.random() * 2200;
    const t = setTimeout(() => {
      setStatus('go');
      setStart(performance.now());
    }, delay);
    setTimer(t);
  };

  const click = () => {
    if (status === 'go') {
      const end = performance.now();
      setMs(Math.round(end - start));
      setStatus('done');
    } else if (status === 'waiting') {
      setMs(null);
      setStatus('idle');
    }
  };

  const boxStyle: React.CSSProperties = {
    height: 140,
    borderRadius: 14,
    display: 'grid',
    placeItems: 'center',
    cursor: 'pointer',
    border: '1px solid #eee',
    background: status === 'go' ? '#b6ffb6' : '#f6f6f6',
    userSelect: 'none',
  };

  return (
    <div style={{ border: '1px solid #eee', borderRadius: 14, padding: 14 }}>
      <div
        style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 10 }}
      >
        <button style={btn} onClick={startTest}>
          Start
        </button>
        <span style={{ color: '#666' }}>
          {ms != null ? `Reaction: ${ms} ms` : 'Click when it turns green.'}
        </span>
      </div>
      <div style={boxStyle} onClick={click}>
        {status === 'idle' && 'Press Start'}
        {status === 'waiting' && 'Wait… (don’t click yet)'}
        {status === 'go' && 'CLICK!'}
        {status === 'done' && 'Nice — press Start again'}
      </div>
    </div>
  );
}
