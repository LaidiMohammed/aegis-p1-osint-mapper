# AEGIS — P1 — Cartographie OSINT d'une organisation open-source

[![Vercel](https://img.shields.io/badge/Vercel-aegis-p1--osint-mapper--blue?logo=vercel)](https://aegis-p1-osint-mapper.vercel.app)

P1 — **Cartographie OSINT d'une organisation open-source** (PFE P13 style, style AEGIS).

## Objectif

Créer un outil d'**OSINT automate** qui découvre, via des sources publics, les **fuites d'information** (subdomain via DNSdumpster, files sensibles via GitHub, Google Dorks, Have I Been Pwned), production de résultats exploitables.

## Architecture

```
AEGIS P1 (osint-mapper)
├── src/
│   ├── osint_mapper_main.py    # CLI — dns_subdomains / github_file_search / google_dorks_sim / hibp_breach_accounts / cartographie_complete
│   └── generate_report.py      # PDF via reportlab
└── tests/
    └── test_osint_mapper.py    # 9 unit tests mocks — pass
```

## Fonctions exécutables — démo à la prof

```bash
python -m src.osint_mapper_main --project wordpress --save-json outputs/results.json
python -m src.generate_report --json outputs/results.json --pdf outputs/report.pdf
```

- **DNS** : subdomain DNSdumpster (scraping + dnspython) — mockable (`patch m.dns.resolver`)
- **GitHub** : PyGithub — files `.env`/`config.php`/`secrets.yml` — mock (`patch github.Github`)
- **Dorks** : DuckDuckGo — simulation (mock `patch m.requests.get`)
- **HIBP** : Have I Been Pwned — breached accounts (mock `patch m.requests.get`)
- **Rapport** : `generate_report.py` → PDF (reportlab)

## Install

```bash
python -m venv .venv && .venv/bin/pip install -r requirements.txt
```

## Test & Deploy

```bash
.venv/bin/pytest -q
```

## Sites

- **GitHub** : https://github.com/LaidiMohammed/aegis-p1-osint-mapper
- **Vercel** : https://aegis-p1-osint-mapper.vercel.app

## Éthique

- Labo local, GPU refused, anti-cloud, données locales.
- Smoke CLI + application — 404 simulateur.
- L'ANPDP notifiée en cas de fuite détectée.

Voir `docs/SPEC.md`, `docs/ETHICS.md`.
