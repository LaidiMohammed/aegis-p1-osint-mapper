"""Tests unitaires — P1 OSINT Mapper (mocks — no shell).

- extract_domain : cas
- dns_subdomains : MockResolver + requests.get → findings
- github_file_search : MockGithub → hits
- google_dorks_sim : MockDork → patterns
- hibp_breach_accounts : MockHIBP → breaches/errors
- cartographie_complete : structure du résumé
- generate_report : PDF généré vérifié
"""
from __future__ import annotations

import sys
from pathlib import Path
from types import SimpleNamespace
from unittest.mock import MagicMock, patch

import pytest

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from src import osint_mapper_main as m
from src import generate_report as rep


def test_extract_domain():
    assert m.extract_domain("wordpress.com") == "wordpress.com"
    assert m.extract_domain("https://www.wordpress.org") == "wordpress.org"
    assert m.extract_domain("nonsense") is None


def test_extract_domain_with_path():
    assert m.extract_domain("https://github.com/nextcloud/server") == "github.com"


def test_dns_subdomains_mock():
    html = '<html><a href="https://api.wordpress.org/x">a</a><a href="https://wordpress.org">b</a></html>'
    fake_a = SimpleNamespace(address="203.0.113.10")
    with patch.object(m.requests, "get") as rg, patch.object(m.dns.resolver, "resolve") as rr:
        rg.return_value.text = html
        rr.return_value = [fake_a]
        out = m.dns_subdomains("wordpress.org")
    assert isinstance(out, list) and out  # au moins les records DNS + noms scraping
    assert any("203.0.113.10" in o for o in out)


def test_github_file_search_mock():
    cf1, cf2 = SimpleNamespace(path="config.php", type="file"), SimpleNamespace(path="wp-config.php", type="file")
    cf3 = SimpleNamespace(path="waf/settings.py", type="file")
    with patch("github.Github") as mg:
        repo = mg.return_value.get_repo.return_value
        repo.get_contents.return_value = [cf1, cf2, cf3]
        hits = m.github_file_search("wordpress", ["wp-config.php", "config.php"])
    assert any(h["hits"] and h["repo"] == "wordpress" for h in hits)
    assert any("wp-config.php" in h["hits"] or "config.php" in h["hits"] for h in hits)


def test_google_dorks_sim_mock():
    class FakeResp:
        def __init__(self, html):
            self.text = html
    with patch.object(m.requests, "get") as rg:
        rg.return_value = FakeResp('<html><a href="https://x.com/res1">r</a><a href="https://y.com/r2">r</a></html>')
        out = m.google_dorks_sim("wordpress.com", ["site:{domain} filetype:pdf password"])
    assert isinstance(out, list) and len(out) > 0 and out[0]["source"] == "dork_sim"


def test_hibp_breach_accounts_mock():
    class FakeResp:
        def __init__(self, code):
            self.status_code = code
            self._body = [] if code == 404 else []
    with patch.object(m.requests, "get") as rg:
        rg.return_value = FakeResp(200)
        rg.return_value.json = lambda: [{"Name": "Adobe"}, {"Name": "Canva"}]
        out = m.hibp_breach_accounts(["a@b.com"], api_key="FAKE_KEY")
    assert out[0]["breaches"] == ["Adobe", "Canva"]
    # 404 → la liste skippée (404 Ignore — présence nécessaire)
    with patch.object(m.requests, "get") as rg:
        rg.return_value = FakeResp(404)
        assert m.hibp_breach_accounts(["a@b.com"]) == []


def test_cartographie_complete_structure():
    out = m.cartographie_complete("wordpress")
    assert "target" in out and "summary" in out and "results" in out
    assert set(out["results"].keys()) == {"dns_subdomains", "github_file_search", "dorks"}


def test_main_smoke():
    rc = m.main(["--project", "wordpress", "--json"])
    assert rc == 0


def test_generate_report_produces_files(tmp_path):
    data = {"target": "wordpress.com", "run_at": "2026-11-21T10:00:00",
            "summary": {"dns_count": 2, "github_count": 1, "dork_count": 1},
            "results": {"dns_subdomains": ["a.wordpress.com"],
                        "github_file_search": [{"file": ".env", "repo": "org", "hits": ["wp-config.php"], "source": "github"}],
                        "dorks": [{"query": "site:wordpress.com filetype:pdf", "url": "https://x.com"}]}}
    md = rep.build_markdown(data)
    assert "a.wordpress.com" in md and ".env" in md
    out = tmp_path / "r.pdf"
    rep.build_pdf(md, out)
    assert out.exists() and out.stat().st_size > 500


if __name__ == "__main__":
    pytest.main([__file__, "-q"])
