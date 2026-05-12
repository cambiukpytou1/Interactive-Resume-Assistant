const starterBundleUrl = 'https://www.genspark.ai/api/files/s/mKtyQ86a';
const appBundleUrl = 'https://www.genspark.ai/api/files/s/SBXpWCi7';
const screenshotUrl = 'https://www.genspark.ai/api/files/s/1ZJiRbnv';

export function FooterCta() {
  return (
    <section className="panel overflow-hidden bg-slate-950 text-white">
      <div className="grid gap-6 px-6 py-8 sm:px-8 lg:grid-cols-[1.2fr_0.8fr] lg:px-10">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-200">Developer handoff</p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight">Continue building from the current MVP scaffold</h2>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-300 sm:text-base">
            This starter app includes canonical resume data, staging templates for future seed updates, the initial UI shell, and a lightweight chat endpoint ready to be upgraded to embeddings plus pgvector.
          </p>
        </div>
        <div className="grid gap-3 self-start">
          <a href={appBundleUrl} className="rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-slate-100">
            Download latest app scaffold
          </a>
          <a href={starterBundleUrl} className="rounded-2xl border border-white/20 px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/10">
            Download source bundle
          </a>
          <a href={screenshotUrl} className="rounded-2xl border border-white/20 px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/10">
            View RSM source screenshot
          </a>
        </div>
      </div>
    </section>
  );
}
