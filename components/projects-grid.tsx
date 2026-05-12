import { Project } from '@/lib/types';

export function ProjectsGrid({ projects }: { projects: Project[] }) {
  return (
    <section id="projects" className="space-y-6">
      <div>
        <h2 className="section-title">Selected project knowledge</h2>
        <p className="section-subtitle">Project cards used both for UI display and later retrieval chunking.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {projects.map((project) => (
          <article key={project.id} className="panel p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <span className="badge">{project.category}</span>
                <h3 className="mt-3 text-lg font-semibold text-slate-900">{project.name}</h3>
              </div>
              <span className="text-xs font-medium uppercase tracking-wide text-slate-400">{project.confidence}</span>
            </div>
            <p className="mt-3 text-sm leading-6 text-slate-700">{project.summary}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {project.tools.map((tool) => (
                <span key={tool} className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                  {tool}
                </span>
              ))}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
