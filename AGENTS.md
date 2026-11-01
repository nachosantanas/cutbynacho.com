# cutbynacho.com — working agreements

Read PROJECT_STATUS.md when continuing work. README.md describes setup; `.agents/skills/publish-portfolio/SKILL.md` covers release checks. Keep these short and current when their facts change; Git history holds completed changes.

## Source and publishing

- This dedicated checkout is the production source, not older preview or Downloads copies.
- Buildless HTML/CSS/JavaScript: index.html, assets/, availability-admin.html. No npm build is needed.
- origin is nachosantanas/cutbynacho.com; GitHub Pages publishes the repository root from main to https://cutbynacho.com. Preserve CNAME, both root CV PDF filenames and original project URLs.
- Requested website changes are authorised for validation, commit, push to main and deployment verification unless Nacho requests a preview or no publication. This does not authorise unrelated changes, private data publication or hosting/domain migration.
- Check status and pull --ff-only before editing. Preserve concurrent and unrelated changes; stage intended paths only. Never reset or force-push.

## Content and design

- Canonical profession: Video editor & Edit assistant; Spanish: Montador de vídeo y ayudante de montaje. Keep the actual role on each project; assisting is not sole editor credit.
- Dark charcoal, electric lime, Space Grotesk and the current editorial hero. Floating hero cards, portrait and custom pointer were deliberately removed; do not restore them from old instructions or unused assets. Keep existing media files unless asked to remove them.
- Use plain factual copy, no invented credits, outcomes, awards, clients or availability. Preserve EN/ES switching. Current About copy is the approved concise editor-first bio.
- First gallery is Social, second Commercial. Work navigation targets the gallery; its visible category changes with scroll. Keep spacious headings and gallery separation (44px desktop, 30px mobile); the mobile category strip wraps.
- LinkedIn: https://www.linkedin.com/in/nachosantanas/. AF Films links the full company name to https://frankariza.com/ with no Madrid suffix. Toni & Guy is a Broadley Studios client. Do not reintroduce the removed SubShift listing or Selected editing outcomes section.
- Keep muted loops, offscreen/hidden-page pausing, reduced-motion support, Pause motion and production GoatCounter. Local previews must not generate analytics visits.

## Shared content and calendar boundary

- Public CV links use Nacho-Santana-CV-EN.pdf and Nacho-Santana-CV-ES.pdf. Retain the original CV-Ignacio-Santana-Soria filenames as byte-identical compatibility copies; update both naming pairs when exporting.
- The private career repository owns editable CV sources and stored bio variants. Website bio updates must be reflected in its matching Website bio sections; do not replace LinkedIn copy or rebuild CVs merely because a website bio changed.
- The public Finder Tools catalogue contains descriptions and icons only. Never publish toolkit sources, facility settings, personal configuration or credentials.
- The availability backend is a separate Sites project. Follow tools/availability.md and its private source workflow for backend changes; this repository does not deploy it.
- Check both public and editor behaviour for shared calendar changes. Public view is anonymous; writes require the authorised owner. Keep runtime secrets out of source.
- Unknown dates are Enquire. Available, Pencilled, Booked and Unavailable have distinct labels/colours. Holidays show only Unavailable, not private reasons. Mobile says Away / Fuera; full accessible date descriptions remain. Never enter real availability without supplied dates.
- Public/editor shared CSS or status changes require coordinated releases. Version changed CSS/module URLs in public HTML when browser caching would otherwise retain old behaviour. Do not treat the legacy assets/availability.json as the live feed.

## Validation and completion

- Run python3 tools/check_site.py and node tools/check_availability.mjs. For backend/shared calendar changes also run python3 tools/check_site.py --backend /path/to/backend; for bio/CV changes run the career checker with --website /path/to/this/checkout.
- Reuse an existing preview server; otherwise python3 -m http.server 8769 --directory . on an available port. Check affected desktop and phone layouts and EN/ES; do not claim browser QA when unavailable.
- Follow the publish skill: confirm exact pushed-commit Pages success, then fetch the public changed files and verify the affected UI. A push or a working editor alone is not proof of a public fix.
- Update PROJECT_STATUS.md only when verified state, a blocker or the next action changes. Keep private research, logs, account details and local machine configuration out of public guidance.
