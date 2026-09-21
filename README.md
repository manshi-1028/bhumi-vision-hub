# Land Governance Platform

Build a production-quality, responsive web app for SIH26019: a National Digital Platform 
for Research, Policy Innovation, and Evidence-Based Land Governance in India.

AUDIENCE & TONE
Policymakers, researchers, government officials, and hackathon judges. Serious, 
trustworthy, institutional. No marketing fluff, no clever taglines, no slogans in the 
"it's not X, it's Y" format. Write in plain, factual English.

DESIGN SYSTEM (STRICT)
- Colors: deep forest green (#1B4332 family) as primary, warm off-white (#FAF9F6) as 
  the page background. Dark charcoal text. One amber accent used sparingly for warnings 
  and highlights. NO purple, NO neon, NO pastel color schemes, NO rainbow palettes, 
  NO gradients of any kind (especially purple-to-black or blue-to-purple).
- Typography: use a serif for headings (e.g., "Source Serif 4" or "Fraunces") and a 
  neutral sans for body (e.g., "Public Sans" or "IBM Plex Sans"). Do NOT use Inter, 
  Geist, or Space Grotesk.
- Surfaces: cards and panels use a subtle 1px solid border (dark green at 15% opacity) 
  on a slightly lighter off-white than the page. NO drop shadows, NO glassmorphism, 
  NO blur effects.
- Corners: sharp (0px radius) or at most 2px. NO soft/rounded corner radius.
- Icons: inline SVG only, thin 1.5px strokes, monochrome (currentColor). NO icon 
  libraries like Lucide, NO sparkle/star icons, NO decorative icons.
- Layout: NO bento grids, NO 3-equal-cards-in-a-row feature sections, NO colored left 
  stripe on cards, NO radial gradient orbs, NO dot-grid backgrounds, NO animated 
  arrows, NO hover animations on cards or buttons (at most a simple underline on 
  nav links and an instant color fill on buttons).
- Bullets: standard disc bullets only. NO checkmark bullet lists.
- Content: NO emojis anywhere. NO em dashes; use commas or periods instead.
- Do NOT include testimonials, pricing tiers, or marketing sections.
- Do NOT include a Terms of Service or Privacy Policy page.
- It must look good on a phone (test at 375px width): single-column stacking, 
  horizontally scrollable chart containers, sticky compact header.

PAGES & ROUTES
1. / Dashboard:
   - Year selector (2019 to 2026, default 2025).
   - KPI cards (vertical list on mobile, 3x2 grid on desktop): records digitized (%), 
     pending land disputes, average dispute resolution days, women-owned land (%), 
     climate vulnerability index, research outputs count.
   - Line chart: records digitized over time (2015-2025).
   - Line chart: built-up land % over time.
   - Bar chart: pending disputes by state (top 10 states).
   - Bar chart: research outputs by topic.
   - Progress bar list: project progress by component.
   - "Download report (CSV)" button that exports the currently visible KPIs and chart 
     data as a real CSV file.
   - Empty reserved section labeled "National map, integration pending" as a bordered 
     placeholder box. No map yet.
2. /library: Research Repository. Search box, filters (type, topic, state, year as 
   native select dropdowns), result list (single-column list layout, NOT cards in a 
   grid), pagination, and an empty state ("No results match your filters") when 
   applicable.
3. /library/:id: detail page with title, type/topic/state/year badges, tag list, 
   abstract/summary, and a "Recommended" list (same topic or state, excluding current 
   item).
4. /simulator: Policy Simulator. Select a state (dropdown), select a policy lever 
   (land records digitization, dispute resolution fast-track, women's land title 
   drive, climate-resilient zoning), set intensity via a native range slider (0 to 
   100), and show projected effects as a simple table and one line chart (before vs 
   after projection). Clearly label: "Projections use a simplified model on sample 
   data."
5. /submit: form to submit a research item (title, type, topic, state, year, summary, 
   tags). Logged-in users only; redirect others to /login.
6. /review: table of submitted items with Approve/Reject actions. Role "official" only.
7. /login: email and password form with clear error messages.
8. /about: three sections of plain prose: Vision, What Is Built, Roadmap.

AUTH & ACCESS
- Not logged in: can see /, /library, /library/:id, /about, /login only.
- Roles "researcher" and "institution": additionally /simulator and /submit.
- Role "official": everything, including /review.
- Keep auth simple (mock login with hardcoded demo accounts; clearly documented in 
  code comments).

DATA
- ALL data access goes through src/lib/api.ts. Components never touch storage directly.
- All data is MOCK/demo data defined in src/lib/api.ts or a local data file: 
  12 states, 40+ research items, 10 years of time series, realistic but invented 
  numbers. Clearly label the source as sample data.
- Login: accept any email with password "demo123", assign role based on email prefix 
  (official@, researcher@, institution@), default researcher.

STATES
Every page must implement all three states, styled plainly:
- Loading: a simple centered spinner (CSS only) with the text "Loading...". 
  NO skeleton loaders or shimmer placeholders.
- Empty: a bordered box with one line of explanation and, where useful, a link or 
  button to clear filters / go back.
- Error: a bordered box with the error message and a "Try again" button that 
  re-fetches.

HEADER & FOOTER
- Header: platform name "BhoomiSetu" (or suggest 2 alternatives), nav links, auth 
  state (Login / user email + role + Logout), and a small bordered "Sample data" 
  badge, always visible on every page.
- Footer: one line with platform name, SIH26019, and the current year. Nothing else.

TECH
- Next.js (App Router) + TypeScript + Tailwind CSS.
- Charts: Recharts or a lightweight custom SVG chart component. Keep charts 
  flat, monochrome-plus-one-accent, with visible axis labels and gridlines.
- Use native HTML form controls (select, input, button) styled minimally rather 
  than heavy custom component libraries.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://bhumi-vision-hub.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/43410dbd-4ee1-4df0-b776-2889fe7e554f).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
