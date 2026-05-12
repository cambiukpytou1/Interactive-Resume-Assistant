type DashboardStatusProps = {
  roleCount: number;
  projectCount: number;
  hasRetrievalLayer: boolean;
  retrievalModeLabel: string;
  vectorReady: boolean;
  nextLayer: string;
};

export function DashboardStatus({
  roleCount,
  projectCount,
  hasRetrievalLayer,
  retrievalModeLabel,
  vectorReady,
  nextLayer
}: DashboardStatusProps) {
  return (
    <section className="grid gap-4 lg:grid-cols-[1fr_1fr]">
      <article className="panel p-5">
        <p className="text-sm font-medium text-slate-500">MVP status</p>
        <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">Dashboard is testable and repo-ready</h2>
        <p className="mt-3 text-sm leading-7 text-slate-700">
          The current build includes a recruiter-facing dashboard, a working chat API, generated retrieval artifacts, public-safe guardrails,
          and deployment scaffolding for a future vector layer.
        </p>
      </article>
      <article className="panel p-5">
        <div className="grid gap-3 sm:grid-cols-4">
          <div>
            <p className="text-sm font-medium text-slate-500">Roles</p>
            <p className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">{roleCount}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Projects</p>
            <p className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">{projectCount}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Retrieval</p>
            <p className="mt-2 text-sm font-semibold uppercase tracking-wide text-blue-700">{hasRetrievalLayer ? 'Enabled' : 'Pending'}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Mode</p>
            <p className="mt-2 text-sm font-semibold uppercase tracking-wide text-slate-700">{retrievalModeLabel}</p>
          </div>
        </div>
        <p className="mt-4 text-sm leading-7 text-slate-700">
          {vectorReady
            ? 'Optional vector retrieval is configured. The API will try semantic retrieval first and fall back safely when needed.'
            : 'The app currently runs in rule-based mode and is ready to adopt vector retrieval later through environment configuration.'}
        </p>
        <p className="mt-3 text-sm leading-7 text-slate-700">Next layer: {nextLayer}</p>
      </article>
    </section>
  );
}
