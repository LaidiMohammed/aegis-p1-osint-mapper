# ETHICS — P1 — Cartographie OSINT d'une organisation open-source (AEGIS)

Engagements éthiques du projet — stand-alone, labo local, GPU refused, anti-cloud.

- **Cible** : [AEGIS Cartographie OSINT d'une organisation open-source](https://github.com/LaidiMohammed/aegis-p1-osint-mapper)
- **Périmètre** : [AEGIS Cartographie OSINT d'une organisation open-source](https://aegis-p1-osint-mapper.vercel.app) — smoke + fonctions CLI.
- **GPU refused** : implementation uniquement CPU/pure Python.
- **Données locales** : sources acceptées : labo local (localhost, Juice Shop, DVWA, etc.).
- **Smoke au prof** : cmds à exécuter — voir README/scripts/run_smoke.sh.
- **Smoke clé de validation** : voir `smoke()` dans `src/osint-mapper_main.py` — doit retourner `{"ok": true, ...}`.
- **Site statique Vercel** : disponible pour la démo statique (smoke uniquement).

See SPEC.md (avec use cases + tableaux attendus).
