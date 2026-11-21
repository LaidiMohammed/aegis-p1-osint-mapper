import Console from "@/components/Console";
import CodeSectionP1 from "@/components/CodeSectionP1";
import CopyCommandP1 from "@/components/CopyCommandP1";
import Reveal from "@/components/Reveal";

const SOURCES = [
  { n: "01", t: "DNSdumpster", d: "Sous-domaines et enregistrements A via scraping + dnspython. Mockable.", tag: "dns_subdomains" },
  { n: "02", t: "GitHub API", d: "Recherche de fichiers sensibles : .env, config.php, secrets.yml, credentials.yml.", tag: "github_file_search" },
  { n: "03", t: "Google Dorks", d: "Simulation via DuckDuckGo : filetype:pdf, intitle:'index of', backup.", tag: "google_dorks_sim" },
  { n: "04", t: "Have I Been Pwned", d: "Comptes compromis via l'API v3 (optionnel, emails fournis).", tag: "hibp_breach_accounts" },
];

const COMMANDS = [
  "python -m src.osint_mapper_main --project wordpress --save-json outputs/results.json",
  "python -m src.generate_report --json outputs/results.json --pdf outputs/report.pdf",
  ".venv/bin/pytest -q    # 9 tests mocks",
];

export default function Page() {
  return (
    <main className="atlas-bg grain min-h-screen">
      {/* NAV */}
      <nav className="sticky top-0 z-40 border-b border-ink/15 bg-paper/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4">
          <a href="#top" className="flex items-center gap-3">
            <span className="grid h-9 w-9 place-items-center border-2 border-ink font-mono text-xs font-bold">P1</span>
            <span className="coord text-ink/70">OSINT ATLAS · CARTOGRAPHIE</span>
          </a>
          <div className="hidden gap-7 md:flex">
            {[["#sources","Sources"],["#carte","Carte"],["#code","Code"],["#demo","Démo"],["#ethique","Éthique"]].map(([h,l]) => (
              <a key={h} href={h} className="coord text-ink/55 transition hover:text-coral">{l}</a>
            ))}
          </div>
          <a href="https://github.com/LaidiMohammed/aegis-p1-osint-mapper" target="_blank" rel="noreferrer" className="border border-ink/40 px-3 py-1.5 font-mono text-[11px] transition hover:bg-ink hover:text-paper">GitHub ↗</a>
        </div>
      </nav>

      {/* MARQUEE */}
      <div className="overflow-hidden border-b border-ink/15 bg-ink text-paper py-2">
        <div className="marquee-track coord">
          {Array.from({ length: 2 }).map((_, k) => (
            <span key={k} className="flex shrink-0 gap-10 px-5">
              <span>DNS · GITHUB · DORKS · HIBP</span><span>✦</span>
              <span>SOURCES PUBLIQUES</span><span>✦</span>
              <span>9 TESTS MOCKS</span><span>✦</span>
              <span>0 GPU · 0 CLOUD</span><span>✦</span>
              <span>M1 PFE · 2026</span><span>✦</span>
            </span>
          ))}
        </div>
      </div>

      {/* HERO */}
      <section id="top" className="mx-auto grid max-w-7xl gap-12 px-5 py-16 lg:grid-cols-[1fr_1.05fr] lg:items-center lg:py-20">
        <div>
          <Reveal>
            <div className="mb-5 flex items-center gap-3">
              <span className="h-px w-12 bg-coral" />
              <span className="coord text-coral">Fiche technique · P1</span>
            </div>
          </Reveal>
          <Reveal delay={70}>
            <h1 className="font-display text-6xl font-bold leading-[0.95] tracking-tight sm:text-7xl">
              Cartographie<br /><span className="text-coral italic">OSINT</span>
            </h1>
          </Reveal>
          <Reveal delay={140}>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-ink/75">
              Un outil d'<b className="text-ink">OSINT automatisé</b> qui découvre, via des sources publiques,
              les fuites d'information d'une organisation open-source — et produit des résultats exploitables.
            </p>
          </Reveal>
          <Reveal delay={210}>
            <div className="mt-8 flex flex-wrap gap-3">
              <a href="#carte" className="bg-ink px-6 py-3 font-mono text-xs font-bold uppercase tracking-widest text-paper transition hover:bg-coral">Voir la carte ↓</a>
              <a href="#sources" className="border border-ink/50 px-6 py-3 font-mono text-xs uppercase tracking-widest text-ink transition hover:border-coral hover:text-coral">Les 4 sources</a>
            </div>
          </Reveal>
          <Reveal delay={280}>
            <div className="mt-10 grid grid-cols-4 gap-4 border-t-2 border-ink pt-6">
              {[["04","sources"],["09","tests mocks"],["1","rapport PDF"],["00","GPU"]].map(([n,l]) => (
                <div key={l}><div className="font-display text-2xl font-bold">{n}</div><div className="coord text-ink/45">{l}</div></div>
              ))}
            </div>
          </Reveal>
        </div>
        <Reveal delay={120}><Console /></Reveal>
      </section>

      {/* SOURCES */}
      <section id="sources" className="mx-auto max-w-7xl px-5 py-14">
        <Reveal>
          <span className="coord text-coral">01 / Sources</span>
          <h2 className="mt-2 font-display text-4xl font-bold sm:text-5xl">Quatre angles d'observation</h2>
          <p className="mt-3 max-w-2xl text-ink/65">Chaque source est isolée, mockable et testable indépendamment.</p>
        </Reveal>
        <div className="mt-10 grid gap-x-10 gap-y-8 md:grid-cols-2">
          {SOURCES.map((s, i) => (
            <Reveal key={s.n} delay={i * 80}>
              <div className="note h-full">
                <div className="flex items-baseline justify-between">
                  <span className="font-display text-3xl font-bold text-ink/25">{s.n}</span>
                  <span className="coord text-coral">{s.tag}</span>
                </div>
                <h3 className="mt-2 font-display text-2xl font-semibold">{s.t}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink/70">{s.d}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* CARTE / ARCHITECTURE */}
      <section id="carte" className="mx-auto max-w-7xl px-5 py-14">
        <Reveal>
          <span className="coord text-coral">02 / Architecture</span>
          <h2 className="mt-2 font-display text-4xl font-bold sm:text-5xl">Du signal au rapport</h2>
        </Reveal>
        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <Reveal>
            <div className="crosshair border border-ink/20 bg-white/50 p-7">
              <span className="coord text-sea">Pipeline</span>
              <pre className="mt-4 whitespace-pre font-mono text-xs leading-loose text-ink/80">
{`AEGIS P1 (osint-mapper)
├── src/
│   ├── osint_mapper_main.py
│   │     · dns_subdomains
│   │     · github_file_search
│   │     · google_dorks_sim
│   │     · hibp_breach_accounts
│   │     · cartographie_complete
│   └── generate_report.py   (PDF)
└── tests/  (9 tests mocks)`}
              </pre>
            </div>
          </Reveal>
          <Reveal delay={100}>
            <div className="border-l-2 border-coral pl-6">
              <span className="coord text-coral">Sortie structurée</span>
              <p className="mt-3 font-mono text-sm leading-relaxed text-ink/75">
                &#123; target, run_at, results: &#123; dns_subdomains, github_file_search, dorks &#125;, summary: &#123; dns_count, github_count, dork_count &#125; &#125;
              </p>
              <div className="rule my-6 h-px bg-ink/20" />
              <p className="text-sm leading-relaxed text-ink/70">
                Les appels réseau sont enveloppés dans des <b>try/except</b> et exposés au niveau module
                pour être <b>mockés en tests</b> — aucun accès externe n'est nécessaire pour valider le code.
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* CODE */}
      <section id="code" className="mx-auto max-w-7xl px-5 py-14">
        <Reveal>
          <span className="coord text-coral">03 / Code source</span>
          <h2 className="mt-2 font-display text-4xl font-bold sm:text-5xl">Extraits réels</h2>
          <p className="mt-3 text-ink/65">Le cœur de la cartographie, tel qu'exécuté dans le dépôt.</p>
        </Reveal>
        <div className="mt-8"><Reveal delay={80}><CodeSectionP1 /></Reveal></div>
      </section>

      {/* DEMO */}
      <section id="demo" className="mx-auto max-w-7xl px-5 py-14">
        <Reveal>
          <span className="coord text-coral">04 / Démonstration</span>
          <h2 className="mt-2 font-display text-4xl font-bold sm:text-5xl">À exécuter devant le prof</h2>
        </Reveal>
        <div className="mt-8 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <Reveal><div className="space-y-3">{COMMANDS.map((c, i) => <CopyCommandP1 key={c} command={c} />)}</div></Reveal>
          <Reveal delay={100}>
            <div className="note h-full">
              <span className="coord text-coral">Résultat attendu</span>
              <ul className="mt-4 space-y-2 text-sm text-ink/75">
                <li>▸ [SUMMARY] DNS=… GITHUB=… DORKS=…</li>
                <li>▸ outputs/results.json (JSON structuré)</li>
                <li>▸ outputs/report.pdf (ReportLab)</li>
                <li>▸ 9/9 tests mocks réussis</li>
              </ul>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ETHIQUE */}
      <section id="ethique" className="mx-auto max-w-7xl px-5 py-14">
        <Reveal>
          <span className="coord text-coral">05 / Éthique</span>
          <h2 className="mt-2 font-display text-4xl font-bold sm:text-5xl">Labo local, sources publiques</h2>
        </Reveal>
        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {[
            ["Cible publique", "Projets open-source (wordpress, nextcloud, kafka, juice-shop, django)."],
            ["0 GPU · 0 cloud", "Traitement local, dépendances légères, aucune infrastructure distante."],
            ["Notification", "L'ANPDP notifiée en cas de fuite détectée — données locales."],
          ].map(([t,d],i) => (
            <Reveal key={t} delay={i*80}><div className="note h-full"><h3 className="font-display text-xl font-semibold">{t}</h3><p className="mt-2 text-sm leading-relaxed text-ink/70">{d}</p></div></Reveal>
          ))}
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t-2 border-ink bg-ink text-paper">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-6 px-5 py-10">
          <div>
            <div className="font-display text-2xl font-bold">P1 <span className="text-coral italic">/ OSINT ATLAS</span></div>
            <div className="coord mt-1 text-paper/50">Master 1 PFE · Laidi Mohammed · 2026</div>
          </div>
          <div className="flex gap-5 font-mono text-xs text-paper/70">
            <a href="https://github.com/LaidiMohammed/aegis-p1-osint-mapper" target="_blank" rel="noreferrer" className="hover:text-coral">GitHub ↗</a>
            <a href="https://aegis-p1-osint-mapper.vercel.app" className="hover:text-coral">Vercel ↗</a>
          </div>
        </div>
      </footer>
    </main>
  );
}
