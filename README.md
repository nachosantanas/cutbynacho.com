# Nacho Santana — portfolio

Live: https://cutbynacho.com · Source: https://github.com/nachosantanas/cutbynacho.com

This portfolio is buildless HTML, CSS and JavaScript, published from main by GitHub Pages. No npm install or build step is needed.

## Work locally

```sh
python3 tools/check_site.py
node tools/check_availability.mjs
python3 -m http.server 8769 --directory .
```

Reuse a server already listening on 8769. Browser QA must cover the affected interaction on desktop and phones; the scripts do not establish visual correctness.

## Where things live

- index.html: bilingual portfolio content, styling and navigation.
- assets/: media, favicon, public tools catalogue and calendar code/styles.
- availability-admin.html: entry link to the separately hosted editor.
- tools/availability.md: calendar operation and backend boundary.
- CV-Ignacio-Santana-Soria-EN.pdf and CV-Ignacio-Santana-Soria-ES.pdf: public exports. Editable sources are in the private career repository; editing this HTML does not rebuild PDFs.

The calendar is a rolling eight-week public view with a year of date management. Its backend persists owner-supplied statuses separately; no project names or holiday reasons are published.

## Continue or release work

Read AGENTS.md for standing agreements, PROJECT_STATUS.md for the current handoff and `.agents/skills/publish-portfolio/SKILL.md` for release verification. These files are repository guidance, not an automated agent loop.

Optional local cross-repository check:

```sh
python3 tools/check_site.py --backend /path/to/nacho-availability-backend
```

The private career checker can compare its stored website bios and exported PDFs with this checkout. Cross-repository paths and credentials are not required by CI and must not be committed here.

GitHub Actions runs the repository-local source checks on pushes and pull requests. Private cross-repository comparisons and browser/PDF/app verification stay local; CI does not fetch other repositories, install apps or publish content.
