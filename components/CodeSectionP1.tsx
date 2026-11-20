"use client";
import { useState, type ReactNode } from "react";

const FILES = [
  {
    name: "cartographie_complete",
    code: `def cartographie_complete(org: str, timeout: float = 8.0) -> dict[str, Any]:
    """Cartographie complète — scores + findings."""
    domain = extract_domain(org) or org.strip().lower()
    results = {"target": domain,
               "run_at": time.strftime("%Y-%m-%dT%H:%M:%S"),
               "results": {}}
    results["results"]["dns_subdomains"] = dns_subdomains(domain, timeout=timeout)
    results["results"]["github_file_search"] = github_file_search(
        org.split("/")[0].strip(), timeout=timeout)
    results["results"]["dorks"] = google_dorks_sim(domain, timeout=timeout)
    results["summary"] = {
        "dns_count": len(results["results"]["dns_subdomains"]),
        "github_count": len(results["results"]["github_file_search"]),
        "dork_count": len(results["results"]["dorks"]),
    }
    return results`,
  },
  {
    name: "dns_subdomains",
    code: `def dns_subdomains(domain: str, timeout: float = 8.0) -> list[str]:
    """Subdomains via DNSdumpster (strings + labels — filtres)."""
    url = "https://dnsdumpster.com/search"
    out: list[str] = []
    try:
        with requests.Session() as s:
            r = s.get(f"{url}?domain={domain}", timeout=timeout,
                      headers={"User-Agent": USER_AGENT})
        soup = BeautifulSoup(r.text, "html.parser")
        for a in soup.find_all("a", href=True):
            href = a["href"]
            if domain in href or (href.startswith("//") and domain in href[2:]):
                m = re.search(r"(?:[a-zA-Z0-9-]+\\.)+" +
                              re.escape(domain), href)
                if m and "dnsdumpster" not in m.group(0):
                    out.append(m.group(0).rstrip("/").lower())
        for rec in dns.resolver.resolve(domain, "A"):
            out.append(f"{domain} -> {rec.address}")
    except Exception:
        pass
    return sorted(set(out))`,
  },
  {
    name: "hibp_breach_accounts",
    code: `def hibp_breach_accounts(emails: list[str],
                          api_key: str | None = None) -> list[dict[str, Any]]:
    """Have I Been Pwned v3 — comptes compromis."""
    out: list[dict[str, Any]] = []
    for e in emails:
        try:
            headers = {"User-Agent": USER_AGENT}
            if api_key:
                headers["HIBP-Api-Key"] = api_key
            r = requests.get(
                f"https://haveibeenpwned.com/api/v3/breachedaccount/{e}",
                headers=headers, timeout=8.0)
            if r.status_code == 404:
                continue
            if r.status_code == 200:
                out.append({"email": e,
                            "breaches": [b["Name"] for b in r.json()],
                            "source": "hibp"})
        except Exception:
            out.append({"email": e, "error": "http_error", "source": "hibp"})
    return out`,
  },
];

const KEYWORDS = new Set(["def", "return", "for", "if", "elif", "else", "in", "import", "from", "and", "or", "not", "try", "except", "with", "as", "list", "dict", "str", "Any"]);

function colorize(line: string): ReactNode {
  const t = line.trimStart();
  if (t.startsWith("#") || t.startsWith('"""')) return <span className="text-ink/35">{line}</span>;
  const parts = line.split(/("[^"]*"|'[^']*'|\b\w+\b|\s+|[^\w\s])/g).filter(Boolean);
  return <>{parts.map((p, i) => {
    if (/^["']/.test(p)) return <span key={i} className="text-sea">{p}</span>;
    if (KEYWORDS.has(p)) return <span key={i} className="text-coral">{p}</span>;
    if (/^\d/.test(p)) return <span key={i} className="text-sea">{p}</span>;
    return <span key={i} className="text-ink/80">{p}</span>;
  })}</>;
}

export default function CodeSectionP1() {
  const [active, setActive] = useState(0);
  const f = FILES[active];
  return (
    <div className="border border-ink/20 bg-white/50">
      <div className="flex flex-wrap gap-px border-b border-ink/15 bg-ink/[.04]">
        {FILES.map((x, i) => (
          <button key={x.name} onClick={() => setActive(i)}
            className={`px-4 py-2.5 font-mono text-[11px] transition ${i === active ? "bg-ink text-paper" : "text-ink/50 hover:text-ink"}`}>
            {x.name}
          </button>
        ))}
      </div>
      <pre className="overflow-x-auto p-5 font-mono text-[12px] leading-[1.7] sm:text-[13px]">
        <code>{f.code.split("\n").map((line, i) => (
          <div key={i} className="flex">
            <span className="mr-5 w-6 shrink-0 select-none text-right text-ink/25">{i + 1}</span>
            <span className="whitespace-pre">{colorize(line)}</span>
          </div>
        ))}</code>
      </pre>
      <div className="border-t border-ink/15 px-5 py-2.5 font-mono text-[11px] text-ink/45">
        extras réels de src/osint_mapper_main.py · mockable (patch dns.resolver / github.Github / requests.get)
      </div>
    </div>
  );
}
