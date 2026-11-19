"""Cartographie OSINT d'une organisation open-source — module principal (P1, PFE).

Stratégie (voir docs/ETHICS.md) :
  - Cible : projet open-source public (GitHub) : wordpress/wordpress, nextcloud/server,
    apache/kafka, OWASP/juice-shop, django/django (2-3 choix).
  - Étapes : DNSdumpster (subdomain), GitHub API (recherche files sensibles),
    Google Dorks simulation, Have I Been Pwned (version libre).

Fonctions :
  - dns_subdomains(domain) -> list[str]
  - github_file_search(org, candidates) -> list[dict]
  - google_dorks_sim(domain, dorks) -> list[dict]
  - hibp_breach_accounts(emails, api_key=None) -> list[dict]
  - cartographie_complete(org_choices) -> dict{domain, results{dns, github, dorks, hibp}, summary}
  - main(argv)
"""
from __future__ import annotations

import argparse
import json
import re
import sys
import time
from typing import Any

import requests
from bs4 import BeautifulSoup

import dns.resolver  # module-level pour mockable (dns_subdomains)

USER_AGENT = "aegis-p1-osint-mapper/1.0.0 (+https://aegis-p1-osint-mapper.vercel.app)"
SECRET_CANDIDATES = ["config.php", "config/config.php", "wp-config.php", "settings.py",
                     "secrets.yml", ".env", "config.yml", "credentials.yml", ".env.local"]
GOOGLE_DORKS = [
    "site:{domain} filetype:pdf password",
    "site:{domain} filetype:pdf inurl:/admin",
    "site:{domain} intitle:'index of' confidential",
    "site:{domain} intitle:'index of' backup",
]

def _probe(url: str, timeout: float = 8.0) -> str:
    try:
        with requests.Session() as s:
            r = s.get(url, timeout=timeout, headers={"User-Agent": USER_AGENT}, allow_redirects=False)
        return f"{r.status_code}"
    except Exception:  # noqa: BLE001
        return "error"

def dns_subdomains(domain: str, timeout: float = 8.0) -> list[str]:
    """Recueillei subdomain en scraping DNSdumpster (strings + labels — filtres).
    Mockable : url dans requests.get."""
    url = "https://dnsdumpster.com/search"
    out: list[str] = []
    try:
        with requests.Session() as s:
            r = s.get(f"{url}?domain={domain}", timeout=timeout, headers={"User-Agent": USER_AGENT})
        soup = BeautifulSoup(r.text, "html.parser")
        for a in soup.find_all("a", href=True):
            href = a["href"]
            if domain in href or (href.startswith("//") and domain in href[2:]):
                m = re.search(r"(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+{}[a-zA-Z0-9]*".format(domain.replace(".", r"\.")), href)
                if m and "dnsdumpster" not in m.group(0):
                    out.append(m.group(0).rstrip("/").lower())
        for rec in dns.resolver.resolve(domain, "A"):
            out.append(f"{domain} -> {rec.address}")
    except Exception:  # noqa: BLE001
        pass
    # Dédoublons + nettoie
    seen: set[str] = set()
    cleaned: list[str] = []
    for s in out:
        s = re.sub(r"<[^>]+>", "", s).strip()
        if s and s not in seen:
            seen.add(s)
            cleaned.append(s)
    return sorted(cleaned)

def github_file_search(org: str, candidates: list[str] | None = None, branch: str = "HEAD", timeout: float | None = None) -> list[dict[str, Any]]:
    """Reccherchei past_content via GitHub API (search/code ou repo.contents).

    `timeout` inutilisé par PyGithub — gardé pour signature stable (pro).
    """
    out: list[dict[str, Any]] = []
    try:
        from github import Github  # noqa: PLC0415
        from github.GithubException import GithubException  # noqa: PLC0415
        gh = Github(timeout=timeout or 10, per_page=100)
        repo = gh.get_repo(org)
        for f in (candidates or SECRET_CANDIDATES):
            try:
                path_hits = []
                contents = repo.get_contents("")
                stack = list(contents)
                while stack:
                    c = stack.pop()
                    if c.path.lower().endswith(f):
                        path_hits.append(c.path)
                    elif c.type == "dir":
                        try: stack.extend(repo.get_contents(c.path, ref=branch))
                        except GithubException: continue
                if path_hits:
                    out.append({"file": f, "repo": org, "hits": path_hits[:50], "source": "github", "maturity": "public"})
            except Exception:  # noqa: BLE001
                continue
    except Exception:  # noqa: BLE001
        pass
    return out

def google_dorks_sim(domain: str, dorks: list[str] | None = None, timeout: float = 8.0) -> list[dict[str, Any]]:
    """Simulation de Google Dorks (Bing + duckduckgo parsing, très souple, sans scraping libre)."""
    dorks = dorks or GOOGLE_DORKS
    out: list[dict[str, Any]] = []
    for d in dorks:
        try:
            url = f"https://duckduckgo.com/html/?q={d.format(domain=domain).replace(' ', '+')}"
            r = requests.get(url, timeout=timeout, headers={"User-Agent": USER_AGENT})
            soup = BeautifulSoup(r.text, "html.parser")
            for a in soup.find_all("a", href=True)[:12]:
                href = a["href"] or ""
                if "duckduckgo" in href or "wik patents" in href: continue
                if any(x in href for x in ("https://", "http://")):
                    out.append({"query": d.format(domain=domain), "url": href[:220], "source": "dork_sim"})
        except Exception:  # noqa: BLE001
            pass
    return out[:50]

def hibp_breach_accounts(emails: list[str], api_key: str | None = None) -> list[dict[str, Any]]:
    """Have I Been Pwned v3 API (parmi email e296f0206) - pas de clé nécessaire pour vérification légère."""
    out: list[dict[str, Any]] = []
    for e in emails:
        try:
            headers = {"User-Agent": USER_AGENT}
            if api_key: headers["HIBP-Api-Key"] = api_key
            r = requests.get(f"https://haveibeenpwned.com/api/v3/breachedaccount/{e}", headers=headers, timeout=8.0)
            if r.status_code == 404: continue
            if r.status_code == 200:
                out.append({"email": e, "breaches": [b["Name"] for b in r.json()], "source": "hibp"})
        except Exception:  # noqa: BLE001
            out.append({"email": e, "error": "http_error", "source": "hibp"})
    return out

def extract_domain(text: str) -> str | None:
    """Extrait d'un nom de domaine de `text` si présent (pattern heuristique : begins+hosts with .com/.net/...)."""
    m = re.search(r"(?:https?://)?(?:www\.)?([a-z0-9-]+(?:\.[a-z]{2,})+[a-z0-9-]*(?:/[a-zA-Z0-9_-]+)?)", text.strip(), re.I)
    if not m: return None
    s = m.group(1)
    # keep domain-like part (up to first path or slash)
    host = s.split("/")[0].strip().lower()
    if "." not in host: return None
    host = host.removeprefix("www.")
    return host or None

def cartographie_complete(org: str, timeout: float = 8.0) -> dict[str, Any]:
    """Oufait cartographie complète — scores + findings."""
    domain = extract_domain(org) or org.strip().lower()
    results: dict[str, Any] = {"target": domain, "run_at": time.strftime("%Y-%m-%dT%H:%M:%S"), "results": {}}
    results["results"]["dns_subdomains"] = dns_subdomains(domain, timeout=timeout)
    results["results"]["github_file_search"] = github_file_search(org.split("/")[0].strip(), timeout=timeout)
    results["results"]["dorks"] = google_dorks_sim(domain, timeout=timeout)
    results["summary"] = {"dns_count": len(results["results"]["dns_subdomains"]),
                          "github_count": len(results["results"]["github_file_search"]),
                          "dork_count": len(results["results"]["dorks"])}
    return results

def main(argv: list[str] | None = None) -> int:
    ap = argparse.ArgumentParser(prog="osint_mapper", description="Cartographie OSINT — AEGIS P1 — OSINT Mapper")
    ap.add_argument("--project", required=True, help="Projet open-source à analyser (ex: 'wordpress')")
    ap.add_argument("--save-json", default=None, help="Écrire le résultat JSON")
    ap.add_argument("--json", action="store_true", help="Sortir en JSON (sans écriture de fichier)")
    ap.add_argument("--timeout", type=float, default=8.0, help="Timeout par requête (s)")
    args = ap.parse_args(argv)
    try:
        out = cartographie_complete(args.project, timeout=args.timeout)
    except SystemExit:
        raise
    if args.save_json:
        from pathlib import Path
        p = Path(args.save_json); p.parent.mkdir(parents=True, exist_ok=True)
        p.write_text(json.dumps(out, indent=2, ensure_ascii=False), encoding="utf-8")
        print(f"[OK] écriture : {p}")
    if args.json:
        print(json.dumps(out, indent=2, ensure_ascii=False))
    else:
        s = out["summary"]
        print(f"[SUMMARY] DNS={s['dns_count']} GITHUB={s['github_count']} DORKS={s['dork_count']}")
        if s["dns_count"] == 0 and s["github_count"] == 0 and s["dork_count"] == 0:
            print("[INFO] Aucun résultat — dépendance réseau: dnsdumpster.com/DuckDuckGo/GitHub externes. ("
                  "Vérif: curl https://dnsdumpster.com)")
        for r in out["results"]["github_file_search"][:20]:
            print(f"  github: {r['file']} -> {r['hits'][:3]}")
        for r in out["results"]["dns_subdomains"][:20]:
            print(f"  dns: {r}")
    return 0

if __name__ == "__main__":
    raise SystemExit(main())
