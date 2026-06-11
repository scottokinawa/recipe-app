'use client';

import { useState, useEffect } from 'react';

// ── Serving scaler helpers ─────────────────────────────────────

const FRACS = { 0.125:'⅛', 0.25:'¼', 0.333:'⅓', 0.5:'½', 0.625:'⅝', 0.667:'⅔', 0.75:'¾', 0.875:'⅞' };

function parseAmount(str) {
  const m = str?.trim().match(/^(\d+(?:\.\d+)?)\s*(.*)$/);
  if (!m) return { value: null, unit: str ?? '' };
  return { value: parseFloat(m[1]), unit: m[2].trim() };
}

function formatValue(v) {
  const whole = Math.floor(v);
  const dec = Math.round((v - whole) * 8) / 8;
  const frac = FRACS[dec];
  if (whole === 0) return frac ?? (dec > 0 ? dec.toFixed(2) : '0');
  return frac ? `${whole} ${frac}` : String(whole);
}

function scaleAmount(amountStr, base, current) {
  const { value, unit } = parseAmount(amountStr);
  if (value === null) return amountStr;
  const scaled = (value / base) * current;
  return unit ? `${formatValue(scaled)} ${unit}` : formatValue(scaled);
}

// ── Timer helpers ──────────────────────────────────────────────

function extractTimers(text, stepIdx) {
  const pattern = /(\d+)(?:[-–](\d+))?\s*(minutes?|mins?|seconds?|secs?)/gi;
  const results = [];
  const seen = new Set();
  let m;
  while ((m = pattern.exec(text)) !== null) {
    if (seen.has(m[0])) continue;
    seen.add(m[0]);
    const max = m[2] ? parseInt(m[2]) : parseInt(m[1]);
    const isSeconds = /^s/i.test(m[3]);
    results.push({
      id: `${stepIdx}-${m[0]}`,
      label: m[0],
      seconds: isSeconds ? max : max * 60,
    });
  }
  return results;
}

function formatTime(s) {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return m > 0 ? `${m}:${String(sec).padStart(2, '0')}` : `${s}s`;
}

// ── Timer Button ───────────────────────────────────────────────

function TimerButton({ timer, state, onToggle }) {
  const timeLeft = state?.timeLeft ?? timer.seconds;
  const running = state?.running ?? false;
  const done = state?.done ?? false;

  return (
    <button
      onClick={onToggle}
      className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all active:scale-95 ${
        done
          ? 'bg-emerald-100 text-emerald-700'
          : running
          ? 'bg-rose-600 text-white shadow-sm'
          : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
      }`}
    >
      <span className="text-base leading-none">{done ? '✓' : running ? '⏸' : '⏱'}</span>
      {done ? 'Done!' : running ? formatTime(timeLeft) : `${formatTime(timer.seconds)} — Start`}
    </button>
  );
}

// ── Icons ──────────────────────────────────────────────────────

function ChevronLeft() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
    </svg>
  );
}

function ChevronRight() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
    </svg>
  );
}

// ── Main Component ─────────────────────────────────────────────

export default function RecipeDetail({ recipe }) {
  const baseServings = recipe.servings ?? 2;
  const [servings, setServings] = useState(baseServings);
  const [cookingMode, setCookingMode] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [timerStates, setTimerStates] = useState({});

  // Single interval drives all active timers
  useEffect(() => {
    const id = setInterval(() => {
      setTimerStates(prev => {
        if (!Object.values(prev).some(t => t.running && t.timeLeft > 0)) return prev;
        const next = { ...prev };
        for (const k in next) {
          if (!next[k].running || next[k].timeLeft <= 0) continue;
          const left = next[k].timeLeft - 1;
          next[k] = { ...next[k], timeLeft: left, running: left > 0, done: left === 0 };
        }
        return next;
      });
    }, 1000);
    return () => clearInterval(id);
  }, []);

  function toggleTimer(id, seconds) {
    setTimerStates(prev => {
      const cur = prev[id];
      if (!cur || cur.done) return { ...prev, [id]: { running: true, timeLeft: seconds, done: false } };
      return { ...prev, [id]: { ...cur, running: !cur.running } };
    });
  }

  const steps = recipe.steps ?? [];
  const totalSteps = steps.length;

  // ── Cooking mode overlay ───────────────────────────────────

  if (cookingMode) {
    const step = steps[currentStep];
    const timers = extractTimers(step, currentStep);
    const progress = ((currentStep + 1) / totalSteps) * 100;
    const isLast = currentStep === totalSteps - 1;

    return (
      <div className="fixed inset-0 z-50 bg-[#f9f7f4] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 bg-white border-b border-stone-200">
          <button
            onClick={() => { setCookingMode(false); setCurrentStep(0); }}
            className="flex items-center gap-1 text-sm text-stone-500 hover:text-stone-900 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            Exit
          </button>
          <span className="text-sm font-semibold text-stone-700">
            Step {currentStep + 1} <span className="font-normal text-stone-400">of {totalSteps}</span>
          </span>
          <span className="text-xs text-stone-400 max-w-[90px] truncate text-right">{recipe.title}</span>
        </div>

        {/* Progress bar */}
        <div className="h-1 bg-stone-100">
          <div className="h-full bg-rose-500 transition-all duration-500" style={{ width: `${progress}%` }} />
        </div>

        {/* Step content */}
        <div className="flex-1 overflow-y-auto px-6 pt-10 pb-6 flex flex-col gap-6">
          <div>
            <p className="text-xs font-semibold tracking-widest text-rose-400 uppercase mb-3">
              Step {currentStep + 1}
            </p>
            <p className="text-xl font-medium text-stone-900 leading-relaxed">{step}</p>
          </div>

          {timers.length > 0 && (
            <div className="flex flex-wrap gap-3">
              {timers.map(timer => (
                <TimerButton
                  key={timer.id}
                  timer={timer}
                  state={timerStates[timer.id]}
                  onToggle={() => toggleTimer(timer.id, timer.seconds)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="px-5 py-5 bg-white border-t border-stone-200 flex items-center justify-between gap-4">
          <button
            onClick={() => setCurrentStep(s => Math.max(0, s - 1))}
            disabled={currentStep === 0}
            className="flex items-center gap-2 text-sm font-medium text-stone-600 disabled:opacity-25 px-4 py-2.5 rounded-full hover:bg-stone-100 transition"
          >
            <ChevronLeft /> Previous
          </button>

          {isLast ? (
            <button
              onClick={() => { setCookingMode(false); setCurrentStep(0); }}
              className="flex items-center gap-2 text-sm font-semibold bg-emerald-600 text-white px-6 py-2.5 rounded-full hover:bg-emerald-700 transition"
            >
              Finished! 🎉
            </button>
          ) : (
            <button
              onClick={() => setCurrentStep(s => s + 1)}
              className="flex items-center gap-2 text-sm font-semibold bg-rose-600 text-white px-6 py-2.5 rounded-full hover:bg-rose-700 transition"
            >
              Next Step <ChevronRight />
            </button>
          )}
        </div>
      </div>
    );
  }

  // ── Normal view ────────────────────────────────────────────

  return (
    <>
      {/* Ingredients + serving scaler */}
      {recipe.ingredients?.length > 0 && (
        <section className="mt-8">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-semibold text-stone-900">Ingredients</h2>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setServings(s => Math.max(1, s - 1))}
                className="w-8 h-8 rounded-full bg-stone-100 text-stone-700 hover:bg-stone-200 flex items-center justify-center text-xl leading-none transition active:scale-95"
              >
                −
              </button>
              <span className="text-sm text-stone-700 w-20 text-center">
                Serves <span className="font-semibold">{servings}</span>
              </span>
              <button
                onClick={() => setServings(s => Math.min(20, s + 1))}
                className="w-8 h-8 rounded-full bg-stone-100 text-stone-700 hover:bg-stone-200 flex items-center justify-center text-xl leading-none transition active:scale-95"
              >
                +
              </button>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-stone-100 shadow-sm divide-y divide-stone-50">
            {recipe.ingredients.map((ing, i) => (
              <div key={i} className="flex items-baseline justify-between px-4 py-3">
                <span className="text-sm text-stone-800">{ing.item}</span>
                <span className="text-sm font-medium text-stone-500 ml-4 shrink-0">
                  {scaleAmount(ing.amount, baseServings, servings)}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Instructions */}
      {steps.length > 0 && (
        <section className="mt-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-stone-900">Instructions</h2>
            <button
              onClick={() => { setCookingMode(true); setCurrentStep(0); }}
              className="flex items-center gap-1.5 text-xs font-semibold bg-rose-600 text-white px-4 py-2 rounded-full hover:bg-rose-700 transition active:scale-95"
            >
              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
              Start Cooking
            </button>
          </div>

          <div className="space-y-5">
            {steps.map((step, i) => {
              const timers = extractTimers(step, i);
              return (
                <div key={i} className="flex gap-4">
                  <div className="shrink-0 w-7 h-7 rounded-full bg-rose-600 text-white text-xs font-bold flex items-center justify-center mt-0.5">
                    {i + 1}
                  </div>
                  <div className="flex-1 pt-0.5">
                    <p className="text-sm text-stone-700 leading-relaxed">{step}</p>
                    {timers.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {timers.map(timer => (
                          <TimerButton
                            key={timer.id}
                            timer={timer}
                            state={timerStates[timer.id]}
                            onToggle={() => toggleTimer(timer.id, timer.seconds)}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Notes */}
      {recipe.notes?.length > 0 && (
        <section className="mt-8">
          <h2 className="text-base font-semibold text-stone-900 mb-3">Notes</h2>
          <div className="space-y-3">
            {recipe.notes.map((note, i) => (
              <div key={i} className="flex gap-3 bg-amber-50 rounded-xl px-4 py-3 border border-amber-100">
                <span className="text-base shrink-0">💡</span>
                <p className="text-sm text-stone-700 leading-relaxed">{note}</p>
              </div>
            ))}
          </div>
        </section>
      )}
    </>
  );
}
