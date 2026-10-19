# clubos-demo-ballantyne

ClubOS Promote demo, built on a copy of the Ballantyne court display.
**Demo only — not the live TV.** The live repo (`clubos-display-ballantyne`) is untouched.

## Pages
| Page | What it is |
|---|---|
| `demo.html` | Link hub for the meeting — start here |
| `index.html` | Club screen. `?mode=evening`, `?mode=preopen`, `?mode=day`, add `&demo=1` for on-screen view buttons. Keys D / E / P / A also switch. No `mode` = follows the clock |
| `rsvp.html` | Member phone page. `?e=<event id>` to RSVP, `&checkin=1` for the door check-in |
| `admin.html` | Post an event: staff type the details, see the generated graphic, publish to the screen. Edit or remove posted events |
| `staff.html` | Staff view: RSVPs, early sign-ups, check-ins, live activity, printable door QRs |
| `events.js` | Sample FAC events (Pickleball Social, clinic, mixer). Staff-added events come from `admin.html` |
| `promote.js` | Shared live-sync runtime |

## Data and safety
- Court grid is seeded demo data. No booking-system call, no member names.
- Live RSVPs travel over a Supabase Realtime **broadcast** channel — pub/sub only. Nothing is written to any table.
- Events posted from `admin.html` are kept in that browser and sent live to screens that are open. A posted event rides inside its QR link, so any phone can open it. For the meeting, open the screen and `admin.html` in the same browser.
- Counts are kept in each browser. "Reset demo" on the staff view clears them.

## Deploy (GitHub web + Vercel)
1. GitHub → New repository → `clubos-demo-ballantyne` (public).
2. "uploading an existing file" → drag in `vercel.json`, `README.md` and the `public` folder → Commit.
3. Vercel → Add New → Project → import `clubos-demo-ballantyne` → Deploy. No settings to change.
4. Open `<your-url>/demo.html`.

## Before the meeting
- Reset the demo from the staff view.
- Test one RSVP from your phone against the TV page on a different device.

📁 Save to: 01 — Displays
