import Marker from "./Marker";
import { PRACTICE_QUESTIONS } from "@/lib/questions";

export default function Home() {
  return (
    <main className="page">
      <header className="hero">
        <h1>MarkMyAnswer</h1>
        <p className="tagline">
          Instant, examiner-style marking for <strong>Edexcel GCSE Business</strong>. Free for every student, no sign-up.
        </p>
        <ul className="pills">
          <li>Marks and levels like the real mark scheme</li>
          <li>Feedback on every assessment objective</li>
          <li>Redraft and re-mark</li>
        </ul>
      </header>

      <Marker questions={PRACTICE_QUESTIONS} />

      <footer className="footer">
        <p>
          MarkMyAnswer uses AI to estimate the mark an examiner might give. It can make mistakes, so use it to practise,
          and check with your teacher if you&apos;re unsure. Not affiliated with or endorsed by Pearson Edexcel.
        </p>
        <p>Please don&apos;t include your name or any personal details in your answers.</p>
      </footer>
    </main>
  );
}
