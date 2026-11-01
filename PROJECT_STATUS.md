# Current handoff

## Verified baseline

- Editorial, bilingual portfolio with Social and Commercial galleries. Both galleries have lime hover/focus frames and independent role dropdowns (Social excludes assisting; Commercial excludes shooting); Social uses natural-ratio grid masonry. Show more/less changes the number of complete cards instead of clipping their height. Portrait, custom pointer and Portfolio / 2026 label are removed from the displayed page.
- About uses the approved concise editor-first bio; both roles remain credited. Career repository stores the same Website bio variants.
- Public availability reads the separate Sites feed; the footer Admin login links to the management entry page. ChatGPT sign-in remains the chosen working authentication. The proposed Supabase/password migration was dropped; do not resume it without a new request.
- Available = lime, Pencilled = amber, Booked = red, Unavailable = purple with shading. On phones only, Unavailable becomes Away (Fuera in Spanish). Desktop and accessible names retain the full status.
- Public window: next 56 days; editor: next 365 days. Future dates appear as the window advances. Backend data is live, not a checked-in fixture.

- Public CV links use the Nacho-Santana-CV-EN/ES.pdf filenames; original Ignacio filenames remain identical compatibility copies.

## Validation limits and next work

- Source checks, browser checks and exact-commit deployment checks are separate evidence. Record the actual outcome when working; this file is not a promise that all future changes pass.
- No outstanding feature request. For the next requested change, read AGENTS.md, inspect actual code/status and run the focused release procedure.
- The checks/guidance added in this task do not change the portfolio UI, credentials, calendar data or hosting.

- GitHub Actions source checks are configured for pushes and pull requests. Local cross-repository checks remain separate from CI; no credentials or private repositories are supplied to CI.
