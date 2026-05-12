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
  nextLayer: _nextLayer
}: DashboardStatusProps) {
  return (
    <section className="grid gap-4 lg:grid-cols-[1fr_1fr]">
      <article className="panel p-5">
        <p className="text-sm font-medium text-slate-500">About this assistant</p>
        <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">Grounded in approved resume knowledge</h2>
        <p className="mt-3 text-sm leading-7 text-slate-700">
          This dashboard presents verified, public-safe career information. The AI chat answers recruiter-style questions
          using only the approved knowledge base — it will not invent claims or disclose restricted details.
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
            <p className="mt-2 text-sm font-semibold uppercase tracking-wide text-blue-700">{hasRetrievalLayer ? 'Active' : 'Pending'}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Mode</p>
            <p className="mt-2 text-sm font-semibold uppercase tracking-wide text-slate-700">{retrievalModeLabel}</p>
          </div>
        </div>
        <p className="mt-4 text-sm leading-7 text-slate-700">
          {vectorReady
            ? 'Semantic retrieval is active. Questions are matched against the knowledge base using vector similarity.'
            : 'Answers are matched using rule-based retrieval across roles, projects, skills, and Q&A.'}
        </p>
      </article>
    </section>
  );
}
