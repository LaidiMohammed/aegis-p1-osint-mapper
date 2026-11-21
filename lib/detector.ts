/**
 * P1 — Cartographie OSINT RÉELLE : DNS (node:dns) + GitHub/Dorks documentés.
 * La résolution DNS est réelle ; GitHub/Dorks restent des simulations locales.
 */
import dns from "node:dns/promises";

export interface DnsAnswer { type: string; value: string; }

export async function dnsLookup(domain: string, recordType = "A"): Promise<DnsAnswer[]> {
  try {
    const rows = await (dns as any).resolve(domain, recordType);
    if (recordType === "MX" && Array.isArray(rows)) {
      return rows.map((r: any) => ({ type: "MX", value: r.exchange + " (prio " + r.priority + ")" }));
    }
    if (Array.isArray(rows)) return rows.map((v: any) => ({ type: recordType, value: String(v) }));
    return [{ type: recordType, value: String(rows) }];
  } catch {
    return [];
  }
}

const CANDIDATES = ["config.php", "wp-config.php", "settings.py", "secrets.yml", ".env", "config.yml", "credentials.yml", ".env.local"];

export async function runOsint(project: string) {
  const domain = project.includes(".") ? project : project + ".com";
  const [a, mx, ns] = await Promise.all([dnsLookup(domain, "A"), dnsLookup(domain, "MX"), dnsLookup(domain, "NS")]);
  const github = CANDIDATES.slice(0, 4).map((f) => ({ file: f, repo: project, hits: ["config/" + f], source: "github", maturity: "public" }));
  const dorks = [
    { query: "site:" + domain + " filetype:pdf password", url: "https://duckduckgo.com/html/?q=" + encodeURIComponent("site:" + domain + " filetype:pdf password"), source: "dork_sim" },
    { query: "site:" + domain + " intitle:'index of' confidential", url: "https://duckduckgo.com/html/?q=" + encodeURIComponent("site:" + domain + " intitle:'index of' confidential"), source: "dork_sim" },
  ];
  return {
    project: "P1",
    target: project,
    domain,
    results: { dns_subdomains: a, dns_mx: mx, dns_ns: ns, github_file_search: github, dorks },
    summary: { dns_count: a.length, github_count: github.length, dork_count: dorks.length },
    method: "DNS RÉEL (node:dns) + GitHub/Dorks locaux — pas d'appel API externe",
  };
}
