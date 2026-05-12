const prompts = [
  "What kind of AI work has I.Y. actually done?",
  "How should I.Y. be positioned for enterprise AI transformation roles?",
  "What is I.Y.'s governance background?",
  "What tools has I.Y. used recently?",
  "Has I.Y. deployed production AI externally?",
  "Why is I.Y. a fit for workflow orchestration roles?"
];

export function RecruiterPrompts() {
  return (
    <section className="panel p-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="section-title text-xl">Suggested recruiter questions</h2>
          <p className="section-subtitle max-w-none">These are the kinds of interview-style prompts the chat assistant is tuned for.</p>
        </div>
      </div>
      <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {prompts.map((prompt) => (
          <div key={prompt} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm text-slate-700">
            {prompt}
          </div>
        ))}
      </div>
    </section>
  );
}
