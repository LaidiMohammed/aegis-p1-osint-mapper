"use client";

import { useState } from "react";

type Phase = "idle" | "scanning" | "done";

const SOURCES = [
  { id: "dns", label: "DNSdumpster", fn: "dns_subdomains", x: 120, y: 90, color: "#2f6f7e", detail: "subdomains + A records" },
  { id: "github", label: "GitHub API", fn: "github_file_search", x: 480, y: 90, color: "#e0603a", detail: ".env / config.php / secrets.yml" },
  { id: "dorks", label: "DuckDuckGo", fn: "google_dorks_sim", x: 120, y: 290, color: "#2f6f7e", detail: "filetype:pdf / index of" },
  { id: "hibp", label: "HIBP v3", fn: "hibp_breach_accounts", x: 480, y: 290, color: "#8a8f98", detail: "breached accounts (optionnel)" },
];

export default function AtlasMap() {
  const [phase, setPhase] = useState<Phase>("idle");
  const [active, setActive] = useState(0);

  const cx = 300, cy = 190;

  function run() {
    setPhase("scanning");
    setActive(0);
    SOURCES.forEach((_, i) => {
      window.setTimeout(() => setActive(i + 1), 480 * (i + 1));
    });
    window.setTimeout(() => setPhase("done"), 480 * SOURCES.length + 300);
  }

  return (
    <div className="border border-ink/20 bg-paper/70">
      {/* header */}
      <div className="flex items-center justify-between border-b border-ink/15 px-5 py-3">
        <div className="flex items-center gap-3">
          <span className="h-2 w-2 rounded-full bg-coral pulse" />
          <span className="coord text-ink/70">carte · sources publiques</span>
        </div>
        <span className="coord text-ink/40">target: wordpress</span>
      </div>

      {/* map */}
      <div className="relative">
        <svg viewBox="0 0 600 380" className="w-full" role="img" aria-label="Cartographie des sources OSINT">
          {/* graticule */}
          {[60, 130, 200, 270, 340].map((y) => (
            <line key={`h${y}`} x1="0" y1={y} x2="600" y2={y} stroke="rgba(22,35,61,.09)" strokeWidth="1" />
          ))}
          {[75, 150, 225, 300, 375, 450, 525].map((x) => (
            <line key={`v${x}`} x1={x} y1="0" x2={x} y2="380" stroke="rgba(22,35,61,.09)" strokeWidth="1" />
          ))}

          {/* routes from center to sources */}
          {SOURCES.map((s, i) => (
            <line
              key={`r${s.id}`}
              x1={cx} y1={cy} x2={s.x} y2={s.y}
              stroke={s.color}
              strokeWidth={active > i ? 1.8 : 1}
              className={active > i ? "route" : ""}
              opacity={active > i ? 0.8 : 0.18}
            />
          ))}

          {/* center target */}
          <circle cx={cx} cy={cy} r="30" fill="none" stroke="#16233d" strokeWidth="1" opacity=".3" />
          <circle cx={cx} cy={cy} r="44" fill="none" stroke="#16233d" strokeWidth="1" opacity=".12" />
          <circle cx={cx} cy={cy} r="7" fill="#16233d" />
          <text x={cx} y={cy + 62} textAnchor="middle" fill="#16233d" fontSize="12" fontFamily="IBM Plex Mono">CIBLE</text>

          {/* source nodes */}
          {SOURCES.map((s, i) => {
            const on = active > i;
            return (
              <g key={s.id} opacity={on ? 1 : 0.42}>
                <circle cx={s.x} cy={s.y} r="22" fill={s.color} opacity={on ? 0.12 : 0.05} />
                <circle cx={s.x} cy={s.y} r="6" fill={s.color} />
                <text x={s.x} y={s.y - 30} textAnchor="middle" fill="#16233d" fontSize="12" fontFamily="IBM Plex Mono">{s.label}</text>
                <text x={s.x} y={s.y + 38} textAnchor="middle" fill="#16233d" opacity=".6" fontSize="10" fontFamily="IBM Plex Mono">{s.fn}</text>
              </g>
            );
          })}

          {/* coordinate ticks */}
          <text x="14" y="20" fill="#16233d" opacity=".35" fontSize="9" fontFamily="IBM Plex Mono">48° 51′ N</text>
          <text x="470" y="370" fill="#16233d" opacity=".35" fontSize="9" fontFamily="IBM Plex Mono">2° 21′ E</text>
        </svg>
      </div>

      {/* readout */}
      <div className="border-t border-ink/15 px-5 py-3 font-mono text-xs">
        {phase === "idle" && <span className="text-ink/50">En attente de cartographie<span className="ml-1 animate-pulse">_</span></span>}
        {phase === "scanning" && <span className="text-sea">Requête {active + 1}/4 en cours…</span>}
        {phase === "done" && (
          <div className="space-y-1 text-ink">
            <div className="font-semibold">[SUMMARY] DNS=12 GITHUB=3 DORKS=8</div>
            <div className="text-ink/60">4 sources interrogées · 0 GPU · données publiques uniquement</div>
            <div className="text-ink/40">outputs/results.json → generate_report.py → PDF</div>
          </div>
        )}
      </div>

      <div className="border-t border-ink/15 px-5 py-3">
        {phase !== "done" ? (
          <button
            onClick={run}
            disabled={phase === "scanning"}
            className="border-2 border-ink bg-ink px-5 py-2.5 font-mono text-xs font-bold uppercase tracking-widest text-paper transition hover:bg-coral hover:border-coral disabled:opacity-50"
          >
            {phase === "scanning" ? "Cartographie..." : "◆ Lancer la cartographie"}
          </button>
        ) : (
          <button onClick={() => { setPhase("idle"); setActive(0); }} className="border-2 border-ink px-5 py-2.5 font-mono text-xs font-bold uppercase tracking-widest text-ink transition hover:bg-ink hover:text-paper">
            ↺ Recommencer
          </button>
        )}
      </div>
    </div>
  );
}
