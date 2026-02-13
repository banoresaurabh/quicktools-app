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

  // Special engines with custom UI (games)
  if (tool.engineId === 'game.tictactoe') return <TicTacToe />;
  if (tool.engineId === 'party.truthDare') return <TruthDare />;
  if (tool.engineId === 'party.wyr') return <WouldYouRather />;
  if (tool.engineId === 'game.reaction') return <ReactionTest />;

  const output = useMemo(() => compute(tool, state), [tool, state]);

  // Build a simple form from inputsSchema
  const inputs = tool.inputsSchema || {};
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

      <div
        style={{ marginTop: 14, paddingTop: 14, borderTop: '1px solid #eee' }}
      >
        <div style={{ fontWeight: 800, marginBottom: 6 }}>Output</div>
        <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>
          {typeof output === 'string'
            ? output
            : JSON.stringify(output, null, 2)}
        </pre>

        {tool.engineId === 'util.json' && (
          <div
            style={{
              display: 'flex',
              gap: 10,
              marginTop: 10,
              flexWrap: 'wrap',
            }}
          >
            <button onClick={() => set('mode', 'prettify')} style={btn}>
              Prettify
            </button>
            <button onClick={() => set('mode', 'minify')} style={btn}>
              Minify
            </button>
          </div>
        )}
        {tool.engineId === 'util.password' && (
          <div
            style={{
              display: 'flex',
              gap: 10,
              marginTop: 10,
              flexWrap: 'wrap',
            }}
          >
            <button onClick={() => set('_regen', Math.random())} style={btn}>
              Generate
            </button>
          </div>
        )}
        {tool.engineId === 'util.uuid' && (
          <div
            style={{
              display: 'flex',
              gap: 10,
              marginTop: 10,
              flexWrap: 'wrap',
            }}
          >
            <button onClick={() => set('_regen', Math.random())} style={btn}>
              Generate
            </button>
          </div>
        )}
        {tool.engineId === 'util.randomNumber' && (
          <div
            style={{
              display: 'flex',
              gap: 10,
              marginTop: 10,
              flexWrap: 'wrap',
            }}
          >
            <button onClick={() => set('_regen', Math.random())} style={btn}>
              Generate
            </button>
          </div>
        )}
        {tool.engineId === 'util.teamSplit' && (
          <div
            style={{
              display: 'flex',
              gap: 10,
              marginTop: 10,
              flexWrap: 'wrap',
            }}
          >
            <button onClick={() => set('_regen', Math.random())} style={btn}>
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
