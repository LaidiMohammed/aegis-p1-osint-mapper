function hashStr(s: string): number { let h = 0; for (let i = 0; i < s.length; i++) h = ((h << 5) - h + s.charCodeAt(i)) | 0; return Math.abs(h); }
const CANDIDATES = ["config.php","config/config.php","wp-config.php","settings.py","secrets.yml",".env","config.yml","credentials.yml",".env.local"];
export function runOsint(project: string) {
  const seed = hashStr(project); let r = seed;
  const rand = () => { r = (r * 1103515245 + 12345) % 2147483648; return r / 2147483648; };
  const dns = Array.from({ length: 3 + (seed % 5) }, (_, i) => project + ".example" + (i + 1) + ".com");
  const github = CANDIDATES.filter((_, i) => (seed + i) % 3 === 0).slice(0, 3).map(f => ({ file: f, repo: project, hits: ["config/" + f], source: "github", maturity: "public" }));
  const dorks = [
    "site:" + project + " filetype:pdf password",
    "site:" + project + " intitle:'index of' confidential",
  ].map(q => ({ query: q, url: "https://duckduckgo.com/html/?q=" + encodeURIComponent(q), source: "dork_sim" }));
  return {
    project: "P1", target: project, results: { dns_subdomains: dns, github_file_search: github, dorks },
    summary: { dns_count: dns.length, github_count: github.length, dork_count: dorks.length },
    method: "Analyse locale déterministe — pas d'appel API externe",
  };
}