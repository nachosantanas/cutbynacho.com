# Managing availability

Open https://cutbynacho.com/availability-admin.html (also linked from the footer).

1. Select a start and end date and choose Available, Pencilled, Booked or Enquire.
2. Apply to draft. Repeat for other date ranges. The most recently added range wins where dates overlap.
3. Copy update, then open the GitHub editor from the page.
4. Replace the entire `assets/availability.json` contents with the copied JSON and commit to `main` using your GitHub account.
5. Check the Pages deployment and the public calendar after publishing.

The editor does not authenticate users or write directly to GitHub. Anyone may create a local draft; only someone with repository write access can commit it. No token or password is stored in the site. A draft is not live and is lost when its tab is closed or reloaded.

Only publish availability states, never client names, project details or private appointments. Dates use Europe/London. Clients can view the next 56 days and select dates for a prefilled email enquiry; this does not reserve a booking or send an email automatically. Booked dates cannot be selected. Unmarked dates stay as Enquire. The editor allows the next 365 days.

`updated_at` changes when the draft is edited. The public calendar displays it. Initial `null` means no availability has been published. If loading fails, the public calendar falls back to enquiries; the management page refuses to publish.

The site remains buildless and hosted on GitHub Pages. Run `python3 tools/check_site.py` and `node tools/check_availability.mjs` before publishing source changes.
