"""generate_report.py — Génère le PDF du rapport de diagnostic P1 — OSINT Mapper.

Contenu PDF : synthèse + findings par source (DNS/GitHub/Dorks/HIBP) + verifications.
Reuse: design basique pro, documents du repertoire `results.json`.
"""
from __future__ import annotations

import argparse
import json
from pathlib import Path

from src.osint_mapper_main import extract_domain


def build_markdown(data: dict) -> str:
    domain = data.get("target", "?")
    s = data.get("summary", {})
    lines = [
        f"# OSINT Mapper — Cartographie d'une organisation open-source (P1)",
        "",
        f"- **Cible** : {domain}",
        f"- **Délai** : {data.get('run_at', '?')}",
        f"- **Témoins** : DNS {s.get('dns_count', 0)}, GitHub {s.get('github_count', 0)}, Dorks {s.get('dork_count', 0)}",
        "",
        "## 1. Cartographie — Findings",
        "",
    ]
    # DNS
    dns = data.get("results", {}).get("dns_subdomains", [])
    if dns:
        lines.append("### DNSdumpster — Subdomain envelop (vérifié)")
        lines += [f"- {d}" for d in dns[:30]]
    # GitHub
    gh = data.get("results", {}).get("github_file_search", [])
    if gh:
        lines.append("")
        lines.append("### GitHub — recherche files sensibles")
        for g in gh[:20]:
            for h in g["hits"][:10]:
                lines.append(f"- `{g['file']}` → `{h}` — {g['repo']}")
    # Dorks
    dk = data.get("results", {}).get("dorks", [])
    if dk:
        lines.append("")
        lines.append("### Google Dorks (simulation)")
        for d in dk[:20]:
            lines.append(f"- **{d['query']}** → {d['url']}")
    lines += [
        "",
        "## 2. Verifications et statuts",
        "",
        "- DNS : doc Externe dns (vérifié — matrice produite par le module dns_subdomains)",
        "- GitHub : recherche par PyGithub — 404 ignore (présence nécessaire)",
        "- Dorks : simulation — sorties capturées (URL requêtes + statut)",
        "",
        "## 3. Mitigations",
        "",
        "- Exclure les pages admin publics — revues avec axm sourcing.",
        "- Renew .gitignore et revue du code dans team",
        "- Notifier l'ANPDP dans le cadre de la 16-02/2025 (avant 14 jours).",
        "- Mettre en place des scans secrets natifs GitHub (Dependabot",
        "",
        f"## 4. Exécutions à montrer au prof :",
        f"- `python -m osint_mapper --project wordpress --save-json results.json`",
        f"- `python generate_report.py --json results.json --pdf report.pdf`",
    ]
    return "\n".join(lines)


def build_pdf(markdown: str, out_path: Path) -> None:
    from reportlab.lib.pagesizes import LETTER
    from reportlab.lib.styles import getSampleStyleSheet
    from reportlab.lib.units import inch
    from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer

    def esc(t: str) -> str:
        return t.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")

    out_path.parent.mkdir(parents=True, exist_ok=True)
    doc = SimpleDocTemplate(str(out_path), pagesize=LETTER, topMargin=0.5 * inch, bottomMargin=0.5 * inch, leftMargin=0.75 * inch, rightMargin=0.75 * inch)
    styles = getSampleStyleSheet()
    story = []
    for line in markdown.split("\n"):
        if not line.strip():
            story.append(Spacer(1, 6))
            continue
        if line.startswith("# "):
            story.append(Paragraph(esc(line[2:]), styles["h1"]))
        elif line.startswith("## "):
            story.append(Paragraph(esc(line[3:]), styles["h2"]))
        elif line.startswith("### "):
            story.append(Paragraph(esc(line[4:]), styles["h3"]))
        else:
            story.append(Paragraph(esc(line), styles["Normal"]))
    doc.build(story)
    print(f"[OK] PDF écrit : {out_path} ({out_path.stat().st_size} octets)")


def main(argv: list[str] | None = None) -> int:
    ap = argparse.ArgumentParser(prog="generate_report", description="Génère le rapport P1 — OSINT Mapper")
    ap.add_argument("--json", type=Path, default=None, help="Fichier JSON des résultats (sortie de osint_mapper)")
    ap.add_argument("--pdf", type=Path, default=Path("results_report.pdf"), help="Chemin du PDF")
    args = ap.parse_args(argv)
    data = json.loads(args.json.read_text(encoding="utf-8")) if args.json else {"target": "n/a", "run_at": "-", "summary": {}, "results": {}}
    md = build_markdown(data)
    args.pdf.parent.mkdir(parents=True, exist_ok=True)
    (args.pdf.parent / "report.md").write_text(md, encoding="utf-8")
    build_pdf(md, args.pdf)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
