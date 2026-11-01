#!/usr/bin/env python3
"""Read-only static checks. Optional backend comparison never reads runtime secrets."""
import argparse
import ast
import json
import hashlib
from html.parser import HTMLParser
from pathlib import Path
import re
import subprocess
import tempfile
from urllib.parse import unquote, urlsplit

ROOT = Path(__file__).resolve().parents[1]


class Page(HTMLParser):
    def __init__(self):
        super().__init__()
        self.ids = []
        self.files = []

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if attrs.get('id'):
            self.ids.append(attrs['id'])
        for name in ('src', 'poster', 'data-src', 'href'):
            value = attrs.get(name, '')
            url = urlsplit(value)
            if value and not url.scheme and not url.netloc and url.path and not url.path.endswith('/'):
                self.files.append(unquote(url.path).lstrip('/'))


def statuses(path):
    match = re.search(r'export const STATUSES\s*=\s*(\[[^;]+\]);', path.read_text())
    assert match, 'Missing calendar status definition'
    return set(ast.literal_eval(match.group(1)))


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--backend', type=Path, help='Optional separate availability backend checkout')
    args = parser.parse_args()
    source = (ROOT / 'index.html').read_text()
    page = Page()
    page.feed(source)
    assert (ROOT / 'CNAME').read_text().strip() == 'cutbynacho.com', 'Unexpected production domain'
    for name in ('nacho.jpg', 'CV-Ignacio-Santana-Soria-EN.pdf', 'CV-Ignacio-Santana-Soria-ES.pdf',
                 'AGENTS.md', 'README.md', 'PROJECT_STATUS.md', '.agents/skills/publish-portfolio/SKILL.md'):
        assert (ROOT / name).is_file(), f'Missing {name}'
    for language in ('EN', 'ES'):
        public = ROOT / f'Nacho-Santana-CV-{language}.pdf'
        legacy = ROOT / f'CV-Ignacio-Santana-Soria-{language}.pdf'
        assert public.is_file(), f'Missing named CV: {public.name}'
        assert hashlib.sha256(public.read_bytes()).digest() == hashlib.sha256(legacy.read_bytes()).digest(), f'Named and legacy CV differ: {language}'
    for name in page.files:
        assert (ROOT / name).is_file(), f'Missing local reference: {name}'
    assert len(page.ids) == len(set(page.ids)), 'Duplicate HTML id'
    for name in ('work', 'commercial', 'about', 'tools', 'contact', 'availability'):
        assert name in page.ids, f'Missing section {name}'
    catalogue = json.loads((ROOT / 'assets/builds/catalogue.json').read_text())
    slugs = [item['slug'] for item in catalogue]
    assert len(slugs) == len(set(slugs)), 'Duplicate tool catalogue slug'
    for item in catalogue:
        slug = item['slug']
        assert (ROOT / f'assets/builds/{slug}.png').is_file(), f'Missing catalogue icon: {slug}'
        assert f'build-{slug}' in page.ids, f'Missing catalogue card: {slug}'
        assert item['name'] and item['description'] and item['description_es'], f'Incomplete tool: {slug}'
    with tempfile.TemporaryDirectory(prefix='nacho-site-check-') as tmp:
        for i, (attrs, script) in enumerate(re.findall(r'<script\b([^>]*)>(.*?)</script>', source, re.S)):
            if not script.strip() or 'application/ld+json' in attrs:
                continue
            path = Path(tmp) / f'script-{i}.js'
            path.write_text(script)
            subprocess.run(['node', '--check', str(path)], check=True)
        for path in (ROOT / 'assets/availability.js', ROOT / 'assets/projects.js', ROOT / 'tools/check_availability.mjs', ROOT / 'tools/check_projects.mjs'):
            subprocess.run(['node', '--check', str(path)], check=True)
    if args.backend:
        backend = args.backend.resolve()
        assert (ROOT / 'assets/availability.css').read_bytes() == (backend / 'ui/availability.css').read_bytes(), 'Public/editor calendar CSS differs'
        expected = statuses(ROOT / 'assets/availability.js')
        assert expected == statuses(backend / 'ui/availability.js'), 'Public/editor calendar statuses differ'
        match = re.search(r'!\s*(\[[^\]]+\])\.includes\(r\.status\)', (backend / 'worker/server.mjs').read_text())
        assert match and set(ast.literal_eval(match.group(1))) == expected, 'Server status validation differs from public calendar'
        print('Passed: public/editor calendar CSS and status contract. Backend runtime/auth and browser behaviour remain separate checks.')
    else:
        print('Skipped: private backend comparison (supply --backend for shared calendar changes).')
    print('Passed: script syntax, local asset references, section IDs, catalogue and domain. Browser QA and deployment are separate.')


if __name__ == '__main__':
    main()
