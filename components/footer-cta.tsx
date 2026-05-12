const repoUrl = 'https://github.com/cambiukpytou1/Interactive-Resume-Assistant';
const deploymentGuideUrl = `${repoUrl}/blob/main/docs/deployment.md`;
const supabaseGuideUrl = `${repoUrl}/blob/main/supabase/resume_chunks.sql`;

export function FooterCta() {
  return (
    <section className="panel overflow-hidden bg-slate-950 text-white">
      <div className="grid gap-6 px-6 py-8 sm:px-8 lg:grid-cols-[1.2fr_0.8fr] lg:px-10">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-200">Next build layer</p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight">Continue from a cleaner repo and deployment-ready scaffold</h2>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-300 sm:text-base">
            The current repo now exposes clearer setup docs, a health endpoint, vector-ready retrieval hooks, and SQL scaffolding for a future pgvector-backed search layer.
          </p>
        </div>
        <div className="grid gap-3 self-start">
          <a href={repoUrl} className="rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-slate-100">
            View GitHub repository
          </a>
          <a href={deploymentGuideUrl} className="rounded-2xl border border-white/20 px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/10">
            Open deployment guide
          </a>
          <a href={supabaseGuideUrl} className="rounded-2xl border border-white/20 px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/10">
            Review Supabase SQL scaffold
          </a>
        </div>
      </div>
    </section>
  );
}
