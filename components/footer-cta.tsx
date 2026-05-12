export function FooterCta() {
  return (
    <section className="panel overflow-hidden bg-slate-950 text-white">
      <div className="grid gap-6 px-6 py-8 sm:px-8 lg:grid-cols-[1.2fr_0.8fr] lg:px-10">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-200">Get in touch</p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight">Interested in connecting?</h2>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-300 sm:text-base">
            This interactive resume is grounded in verified, public-safe career knowledge. If you would like to discuss
            a role or engagement, please reach out directly through LinkedIn or send a message via email.
            Contact details are available upon request to protect privacy.
          </p>
        </div>
        <div className="grid gap-3 self-start">
          <a
            href="https://www.linkedin.com/in/[your-linkedin-handle]"
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-2xl bg-white px-4 py-3 text-center text-sm font-semibold text-slate-950 transition hover:bg-slate-100"
          >
            Connect on LinkedIn
          </a>
          <a
            href="#chat"
            className="rounded-2xl border border-white/20 px-4 py-3 text-center text-sm font-semibold text-white transition hover:bg-white/10"
          >
            Ask the AI assistant
          </a>
        </div>
      </div>
    </section>
  );
}
