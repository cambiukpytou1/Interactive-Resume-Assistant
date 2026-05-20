const navItems = [
  { href: '#experience', label: 'Experience' },
  { href: '#projects', label: 'Projects' },
  { href: '#skills', label: 'Skills' },
  { href: '#chat', label: 'AI Chat' }
];

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/90 backdrop-blur">
      <div className="container-shell flex h-16 items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold tracking-wide text-slate-900">I.Y.</p>
          <p className="text-xs text-slate-500">Enterprise AI &amp; Analytics Leader</p>
        </div>
        <nav className="hidden items-center gap-2 md:flex">
          {navItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="rounded-full px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
            >
              {item.label}
            </a>
          ))}
        </nav>
      </div>
    </header>
  );
}
