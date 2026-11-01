# Availability management

Open https://cutbynacho.com/availability-admin.html (the footer link is labelled Admin login) and choose Open private editor. Sign in using the authorised ChatGPT account, choose date ranges, apply them to the draft, then press Save availability. No GitHub commit is needed for schedule updates.

Public feed: https://nacho-availability.nuttypony18.chatgpt.site/api/availability
Private editor: https://nacho-availability.nuttypony18.chatgpt.site/

The portfolio stays on GitHub Pages. The editor and feed run on Sites with persistent R2 storage. Server-side account authorisation, same-origin write checks and conditional writes protect updates. OWNER_EMAIL is a secret runtime setting, never a client credential. Unknown dates show Enquire; no availability has been assumed.

The editor supports the next 365 days; clients see the next 56 days in Europe/London. Newer date ranges override older overlaps. Save checks the stored revision to prevent overwriting another tab’s update. Unsaved changes trigger a navigation warning. Only statuses and dates are stored, not client names or appointments.

The backend source is maintained separately in /Users/nachosantana/Documents/Codex/nacho-availability-backend and its private Sites source repository. It is not published in the portfolio repository. assets/availability.json is the original empty legacy file and is no longer the live data source.

Checks: python3 tools/check_site.py; node tools/check_availability.mjs. Backend checks: node scripts/assemble.mjs; node scripts/check.mjs; bash scripts/build.sh; node scripts/validate-artifact.mjs.

Use Unavailable for holidays or other time off. Visitors see only Unavailable, not the reason. Booked and Unavailable dates cannot be selected for an enquiry.
