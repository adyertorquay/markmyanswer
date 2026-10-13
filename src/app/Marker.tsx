"use client";

import { useMemo, useRef, useState } from "react";
import type { Feedback } from "@/lib/marker";
import type { PracticeQuestion } from "@/lib/questions";
import { LIMITS, QUESTION_TYPES, type QuestionType } from "@/lib/spec";

type Mode = "practice" | "own";

interface Attempt {
  answer: string;
  feedback: Feedback;
}

const AO_LABELS: Record<string, string> = {
  AO1: "Knowledge",
  AO2: "Application",
  AO3a: "Analysis",
  AO3b: "Evaluation",
};

const RATING_LABELS: Record<string, string> = {
  strong: "Strong",
  partial: "Partly there",
  missing: "Missing",
};

function wordCount(text: string) {
  return text.trim() ? text.trim().split(/\s+/).length : 0;
}

export default function Marker({ questions }: { questions: PracticeQuestion[] }) {
  const [mode, setMode] = useState<Mode>("practice");
  const [practiceId, setPracticeId] = useState(questions[0]?.id ?? "");
  const [ownType, setOwnType] = useState<QuestionType>("explain");
  const [ownMarks, setOwnMarks] = useState(3);
  const [ownQuestion, setOwnQuestion] = useState("");
  const [ownContext, setOwnContext] = useState("");
  const [answer, setAnswer] = useState("");
  const [attempts, setAttempts] = useState<Attempt[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [remaining, setRemaining] = useState<number | null>(null);
  const resultRef = useRef<HTMLDivElement>(null);

  const practice = questions.find((q) => q.id === practiceId);
  const ownTypeInfo = QUESTION_TYPES.find((t) => t.type === ownType)!;

  const current = useMemo(() => {
    if (mode === "practice" && practice) {
      return { type: practice.type, marks: practice.marks, question: practice.question, context: practice.context ?? "" };
    }
    return { type: ownType, marks: ownMarks, question: ownQuestion, context: ownTypeInfo.usesContext ? ownContext : "" };
  }, [mode, practice, ownType, ownMarks, ownQuestion, ownContext, ownTypeInfo]);

  const latest = attempts.at(-1);

  function resetAttempts() {
    setAttempts([]);
    setError(null);
  }

  async function submit() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/mark", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...current,
          answer,
          previousAnswer: latest?.answer,
          previousMark: latest?.feedback.mark,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Something went wrong. Please try again.");
        return;
      }
      setAttempts((a) => [...a, { answer, feedback: data.feedback }]);
      setRemaining(data.remainingToday ?? null);
      requestAnimationFrame(() => resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }));
    } catch {
      setError("Couldn't reach MarkMyAnswer. Check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }

  const canSubmit = !loading && answer.trim().length > 0 && current.question.trim().length >= 5;
  const themes = [1, 2] as const;

  return (
    <div className="marker">
      <section className="card">
        <div className="tabs" role="tablist">
          <button role="tab" aria-selected={mode === "practice"} className={mode === "practice" ? "tab active" : "tab"} onClick={() => { setMode("practice"); resetAttempts(); }}>
            Practice questions
          </button>
          <button role="tab" aria-selected={mode === "own"} className={mode === "own" ? "tab active" : "tab"} onClick={() => { setMode("own"); resetAttempts(); }}>
            My own question
          </button>
        </div>

        {mode === "practice" && practice && (
          <>
            <label className="field">
              <span>Choose a question</span>
              <select value={practiceId} onChange={(e) => { setPracticeId(e.target.value); resetAttempts(); setAnswer(""); }}>
                {themes.map((theme) => (
                  <optgroup key={theme} label={theme === 1 ? "Theme 1: Investigating small business" : "Theme 2: Building a business"}>
                    {questions.filter((q) => q.theme === theme).map((q) => (
                      <option key={q.id} value={q.id}>
                        ({q.marks}) {q.question.split("\n")[0].slice(0, 80)}
                        {q.question.length > 80 ? "…" : ""}
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </label>
            {practice.context && (
              <details className="case-study">
                <summary>Read the case study</summary>
                {practice.context.split("\n\n").map((p, i) => <p key={i}>{p}</p>)}
              </details>
            )}
            <div className="question">
              <p>{practice.question.split("\n").map((line, i) => <span key={i}>{line}<br /></span>)}</p>
              <span className="marks-badge">({practice.marks} {practice.marks === 1 ? "mark" : "marks"})</span>
            </div>
          </>
        )}

        {mode === "own" && (
          <>
            <div className="row">
              <label className="field">
                <span>Question type</span>
                <select value={ownType} onChange={(e) => {
                  const t = QUESTION_TYPES.find((q) => q.type === e.target.value)!;
                  setOwnType(t.type);
                  setOwnMarks(t.marks[0]);
                  resetAttempts();
                }}>
                  {QUESTION_TYPES.map((t) => <option key={t.type} value={t.type}>{t.label}</option>)}
                </select>
              </label>
              <label className="field narrow">
                <span>Marks</span>
                <select value={ownMarks} onChange={(e) => { setOwnMarks(Number(e.target.value)); resetAttempts(); }}>
                  {ownTypeInfo.marks.map((m) => <option key={m} value={m}>{m}</option>)}
                </select>
              </label>
            </div>
            <label className="field">
              <span>Question</span>
              <textarea rows={3} maxLength={LIMITS.question} value={ownQuestion} onChange={(e) => setOwnQuestion(e.target.value)} placeholder="Paste the exam question here" />
            </label>
            {ownTypeInfo.usesContext && (
              <label className="field">
                <span>Case study <em>(paste the relevant extract)</em></span>
                <textarea rows={5} maxLength={LIMITS.context} value={ownContext} onChange={(e) => setOwnContext(e.target.value)} placeholder="Paste the case study information the question is based on" />
              </label>
            )}
          </>
        )}

        <label className="field">
          <span>{latest ? "Your redraft" : "Your answer"}</span>
          <textarea className="answer" rows={10} maxLength={LIMITS.answer} value={answer} onChange={(e) => setAnswer(e.target.value)} placeholder="Write your answer as you would in the exam" />
          <span className="hint">{wordCount(answer)} words</span>
        </label>

        {error && <p className="error" role="alert">{error}</p>}

        <button className="primary" disabled={!canSubmit} onClick={submit}>
          {loading ? "Marking your answer…" : latest ? "Re-mark my redraft" : "Mark my answer"}
        </button>
        {remaining !== null && <p className="hint center">{remaining} free marks left today</p>}
      </section>

      {latest && (
        <div ref={resultRef}>
          <Result attempts={attempts} />
        </div>
      )}
    </div>
  );
}

function Result({ attempts }: { attempts: Attempt[] }) {
  const { feedback: f } = attempts.at(-1)!;
  const pct = f.max_mark ? f.mark / f.max_mark : 0;
  const [copied, setCopied] = useState(false);

  function copy() {
    const text = [
      `Mark: ${f.mark}/${f.max_mark}${f.level ? ` (Level ${f.level} of ${f.levels_total})` : ""}`,
      f.summary,
      "",
      "What earned marks:",
      ...f.what_earned_marks.map((s) => `- ${s}`),
      "",
      "How to improve:",
      ...f.how_to_improve.map((s) => `- ${s}`),
      ...(f.model_upgrade ? ["", `Upgrade: "${f.model_upgrade.original}" → "${f.model_upgrade.improved}"`] : []),
      "",
      `Examiner tip: ${f.examiner_tip}`,
      "",
      "Marked by MarkMyAnswer.co.uk",
    ].join("\n");
    navigator.clipboard?.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <section className="card result" aria-live="polite">
      <div className="score">
        <div className="score-ring" style={{ ["--pct" as string]: pct }}>
          <strong>{f.mark}</strong>
          <span>/ {f.max_mark}</span>
        </div>
        <div>
          {f.level ? <p className="level">Level {f.level} of {f.levels_total}</p> : null}
          {attempts.length > 1 && (
            <p className="progress">
              Attempts: {attempts.map((a) => a.feedback.mark).join(" → ")}
            </p>
          )}
          <p>{f.summary}</p>
        </div>
      </div>

      {!f.is_genuine_attempt && (
        <p className="warning">This doesn&apos;t look like a genuine answer to the question, so it hasn&apos;t been given credit.</p>
      )}

      <div className="aos">
        {f.ao_breakdown.filter((a) => a.rating !== "not_assessed").map((a) => (
          <div key={a.ao} className={`ao ao-${a.rating}`}>
            <div className="ao-head">
              <span>{a.ao} · {AO_LABELS[a.ao]}</span>
              <span className="ao-rating">{RATING_LABELS[a.rating]}</span>
            </div>
            <p>{a.comment}</p>
          </div>
        ))}
      </div>

      {f.what_earned_marks.length > 0 && (
        <>
          <h3>What earned you marks</h3>
          <ul className="good">{f.what_earned_marks.map((s, i) => <li key={i}>{s}</li>)}</ul>
        </>
      )}

      {f.how_to_improve.length > 0 && (
        <>
          <h3>How to get more marks</h3>
          <ol className="improve">{f.how_to_improve.map((s, i) => <li key={i}>{s}</li>)}</ol>
        </>
      )}

      {f.model_upgrade && (
        <>
          <h3>Upgrade one sentence</h3>
          <div className="upgrade">
            <div><span className="tag">You wrote</span><p>&ldquo;{f.model_upgrade.original}&rdquo;</p></div>
            <div><span className="tag better">Try this</span><p>&ldquo;{f.model_upgrade.improved}&rdquo;</p></div>
            <p className="why">{f.model_upgrade.why}</p>
          </div>
        </>
      )}

      <p className="tip"><strong>Examiner tip:</strong> {f.examiner_tip}</p>

      <div className="actions">
        <button className="secondary" onClick={copy}>{copied ? "Copied" : "Copy feedback"}</button>
        <p className="hint">Edit your answer above and press <strong>Re-mark my redraft</strong> to see if you&apos;ve improved.</p>
      </div>
    </section>
  );
}
