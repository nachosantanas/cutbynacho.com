---
name: publish-portfolio
description: Validate and release changes to cutbynacho.com, including its public calendar and CV exports. Use for portfolio changes or deployment verification; not for installing Finder apps or changing unrelated hosting.
---

# Publish the portfolio

Use AGENTS.md for standing scope and source rules. Preserve dirty/unrelated files and record the pre-push remote tip for comparing the intended change.

1. Run `python3 tools/check_site.py` and `node tools/check_availability.mjs`. If calendar CSS or statuses changed, compare the separate backend with `--backend /path/to/backend` and validate its own build. If bio/CV facts changed, compare the private career sources with its checker; do not expose private paths or data in this public repository.
2. Reuse the local server and inspect the affected public interaction at desktop and phone sizes. Verify EN/ES when copy or labels changed. Admin-only evidence does not verify the public calendar. Use only permitted browser tools; report unavailable QA plainly.
3. Review the final diff, update guidance or status only where facts changed, stage the intended paths, commit and push main within standing publication authorisation.
4. Find the GitHub Pages run whose headSha equals the pushed commit. Watch that run to terminal success; inspect failed logs and repair the actual cause. Do not call a queued run or successful push a successful deployment.
5. Fetch the public HTML/assets and verify the changed content. For a visual or interactive change also inspect the public UI, including cache/version behaviour. Backend publication is a separate release, not triggered by the portfolio push.

Report the live URL, what changed, what was verified and any remaining limit. Do not publish a private calendar draft or run a real availability update for testing.
