import { ChatPanel } from '@/components/chat-panel';
import { DashboardStatus } from '@/components/dashboard-status';
import { ExperienceTimeline } from '@/components/experience-timeline';
import { FitGrid } from '@/components/fit-grid';
import { FooterCta } from '@/components/footer-cta';
import { Header } from '@/components/header';
import { Hero } from '@/components/hero';
import { ProjectsGrid } from '@/components/projects-grid';
import { RecruiterPrompts } from '@/components/recruiter-prompts';
import { SkillsGrid } from '@/components/skills-grid';
import { StatsStrip } from '@/components/stats-strip';
import { ensureRetrievalArtifacts, loadResumeData } from '@/lib/data';

export default async function HomePage() {
  const data = await loadResumeData();
  const chunks = await ensureRetrievalArtifacts();

  return (
    <>
      <Header />
      <main className="pb-16">
        <div className="container-shell space-y-12 py-8 sm:py-10">
          <Hero profile={data.profile} />
          <StatsStrip profile={data.profile} />
          <DashboardStatus
            roleCount={data.roles.length}
            projectCount={data.projects.length}
            hasRetrievalLayer={chunks.length > 0}
            nextLayer="Replace rule-based retrieval with embeddings and Supabase pgvector while preserving the same guardrail rules."
          />

          <section className="grid gap-4 lg:grid-cols-3">
            <article className="panel p-5">
              <p className="text-sm font-medium text-slate-500">Core identity</p>
              <ul className="mt-3 space-y-3 text-sm leading-6 text-slate-700">
                {data.profile.core_identity.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </article>
            <article className="panel p-5">
              <p className="text-sm font-medium text-slate-500">Current positioning</p>
              <ul className="mt-3 space-y-3 text-sm leading-6 text-slate-700">
                {data.profile.current_positioning.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </article>
            <article className="panel p-5">
              <p className="text-sm font-medium text-slate-500">Guardrail boundaries</p>
              <ul className="mt-3 space-y-3 text-sm leading-6 text-slate-700">
                {data.profile.explicit_boundaries.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </article>
          </section>

          <FitGrid profile={data.profile} guardrails={data.guardrails} />
          <ExperienceTimeline roles={data.roles} />
          <ProjectsGrid projects={data.projects.slice(0, 9)} />
          <SkillsGrid skills={data.skills} />
          <RecruiterPrompts />
          <ChatPanel />
          <FooterCta />
        </div>
      </main>
    </>
  );
}
