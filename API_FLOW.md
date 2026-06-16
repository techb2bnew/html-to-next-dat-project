# B2B Dispatcher Academy — App & API Flow

One Next.js app, five independent features (routes), one shared backend. This doc maps **which component drives each feature, which hook holds its state/logic, and which backend endpoints it calls** — so you can trace any feature end-to-end without reading every file.

## Backend base URL

Every backend call goes through `getApiBase()`:

```
window.__APP_CONFIG__.apiUrl   (injected in app/layout.js from NEXT_PUBLIC_BACKEND_URL)
  → falls back to → https://b2b-bck.onrender.com
```

That's the **only** backend. Three features also talk to outside, non-project services directly from the browser (called out below) — those never touch `b2b-bck.onrender.com`.

---

## 1. Academy Hub — `/`

```
AcademyApp.tsx
 ├─ useChallenges()        lib/hooks/useChallenges.ts   → lib/api/challenges.ts
 └─ usePracticeCall()      lib/hooks/usePracticeCall.ts → lib/api/practice.ts   (only when "Practice Mode" phone panel is open)
```

**useChallenges** — challenge catalogue, daily challenge, leaderboard, the AI call "Cockpit" (CockpitHUD), debrief report:

| Endpoint | Used for |
|---|---|
| `GET /api/challenges?email=` | Load the challenge catalogue (dashboard grid) |
| `POST /api/challenges/start` | Begin a challenge → opens Cockpit HUD |
| `POST /api/challenges/answer` | Send each turn's response (text or recorded audio) during the call |
| `POST /api/challenges/complete` | End the call → triggers the debrief/score modal |
| `GET /api/student/profile?email=&name=` | Load XP, streak, badges, recent activity |
| `GET /api/student/leaderboard` | Weekly/global leaderboard |
| `GET /api/student/analytics?email=` | Skill heatmap data |
| `GET /api/challenges/daily` | Today's featured challenge banner |
| `POST /api/challenges/daily/generate` | "Regenerate" button on the daily banner |

Speech in the Cockpit (`speakAI` in the hook) does **not** call the backend at all:
- Default voice (`GoogleTranslateCloud_*` in `localStorage`) → fetches audio directly from **Google Translate's public TTS endpoint** (`translate.google.com/translate_tts`), no API key, browser-only.
- Any other selected voice → uses the browser's native `window.speechSynthesis` (Web Speech API) — zero network call.

**usePracticeCall** — the standalone phone-call simulator (`PracticeCallPanel`), a simpler/older sibling of the Cockpit flow:

| Endpoint | Used for |
|---|---|
| `POST /start` | Begin a freeform practice call |
| `POST /answer` | Submit each turn (multipart, optional audio) |
| `POST /api/sim/calls/negotiate` | Broker negotiation turn (shared with DAT Simulator, see below) |
| `GET /active_batches` | (defined, not currently called from UI) |

---

## 2. DAT Load Board Simulator — `/dat-simulator`

```
DatSimulatorApp.tsx → useDatSim()  lib/hooks/useDatSim.ts → lib/api/dat.ts
```

| Endpoint | Used for |
|---|---|
| `POST /api/sim/auth/login` / `/api/sim/auth/logout` | Student login on this simulator |
| `GET /api/sim/dashboard` | Dashboard stats (booked loads, revenue, trucks) |
| `POST /api/sim/dat/search` | Load board search results |
| `POST /api/sim/dat/national_loads` | National load feed (by equipment type) |
| `GET`/`POST /api/sim/dat/recommended_loads` | AI-recommended loads (load + regenerate) |
| `POST /api/sim/dat/trucks/post` / `GET /api/sim/dat/trucks/posted` | Posting & listing trucks |
| `POST /api/sim/calls/negotiate` | AI broker call negotiation (the booking call modal) |
| `POST /api/sim/driver/chat` | Driver chat modal |
| `POST /api/sim/documents/generate` | Rate confirmation PDF/HTML generation |

Non-backend call: `apiCitySuggestions` hits **Open-Meteo's free geocoding API** (`geocoding-api.open-meteo.com`) directly for the city autocomplete — not your backend, no key needed.

---

## 3. Voice Call Simulator — `/voice-simulator`

```
VoiceSimulatorApp.tsx  (no separate hook — state lives in the component) → lib/api/voice.ts
```

| Endpoint | Used for |
|---|---|
| `POST /api/sim/calls/init` | Start a simulated call (broker/customer mode) |
| `POST /api/sim/calls/initiate` | Direct call launch (when arriving from a DAT-simulator "call broker" action) |
| `POST /api/sim/calls/chat` | Each conversation turn with the AI |
| `POST /api/sim/calls/score` | End-of-call scoring/evaluation |

Speech here is **a different mechanism than the Academy's `speakAI`**: `VoiceSimulatorApp.tsx` calls `POST /api/tts` (your own backend) to get a real audio file, and only falls back to the browser's `speechSynthesis` if that request fails. Worth remembering — two features, two different TTS strategies.

---

## 4. Gmail Negotiation Simulator — `/gmail-simulator`

```
GmailSimulatorApp.tsx  (no separate hook) → lib/api/gmail.ts
```

| Endpoint | Used for |
|---|---|
| `POST /api/sim/ai/email/evaluate` | AI broker reply to a student's negotiation email |
| `POST /api/sim/documents/generate` | Rate-confirmation document (same endpoint the DAT simulator uses) |

---

## 5. Admin Portal — `/admin`

```
AdminApp.tsx  (no separate hook) → lib/api/admin.ts
```

| Endpoint | Used for |
|---|---|
| `POST /admin/login` | Admin auth |
| `GET /admin/submissions` / `GET /admin/submission/:id` | Submissions list & detail (Submissions tab) |
| `GET /admin/ai_summary/:id` | AI overall assessment for a submission |
| `POST /admin/grade` | Save a manual per-question score |
| `POST /admin/send_results` | Email final score + feedback to student |
| `DELETE /admin/delete/:id` / `DELETE /admin/clear_all` | Delete one / all sessions |
| `GET /admin/session/report/:id` | Opens the PDF performance report (link, not fetched) |
| `GET /api/challenges` / `DELETE /api/challenges/delete/:id` / `POST /api/challenges/custom` | Challenge Manager tab |
| `GET /api/admin/analytics` | Aggregated Analytics tab |
| `GET /api/sim/admin/activity` | Live Simulator Activity tab (polls every 15s) |
| `GET /api/sim/admin/student/:email` / `POST .../review` | Student drill-down modal + "Generate AI Review" |
| `GET /api/sim/admin/dat/results` | DAT Simulator results/leaderboard tab |
| `GET`/`POST /api/sim/admin/config` | DAT Simulator difficulty/market settings |

---

## 6. Meeting Scheduler — `/meeting` (standalone module)

```
meeting/                                        ← framework-agnostic domain module (SOLID)
  types.ts                                      ← TimeSlot, BookingRecord, ICalendarProvider, IBookingRepository
  config.ts                                     ← business hours / timezone / slot length (env-driven)
  countryCodes.ts                                ← phone country-code list + search
  calendar/GoogleCalendarProvider.ts             ← implements ICalendarProvider via googleapis
  storage/JsonBookingRepository.ts               ← implements IBookingRepository, reads/appends meeting/demo.json
  services/BookingService.ts                    ← orchestrator — depends only on the two interfaces above
  composition.ts                                ← the one place that wires concrete classes together
  demo.json                                      ← booking records (gitignored — contains real PII)

app/meeting/page.tsx                             ← UI: date → slots → name/phone → confirm
app/api/meeting/availability/route.ts            ← GET ?date=YYYY-MM-DD
app/api/meeting/book/route.ts                    ← POST { name, phone, slot }
```

Flow: pick a date → `BookingService.getAvailableSlots()` builds every business-hour slot for that day, then removes anything that overlaps either Google Calendar's real free/busy data **or** an existing row in `demo.json` → user picks a free slot, submits name + phone (country-code searchable) → `createBooking()` re-checks the slot is still free (race-condition guard), creates a real event on the configured Google Calendar, then appends the booking to `demo.json`.

**Auth: OAuth2 as the real calendar owner** (not a service account). A service account without Domain-Wide Delegation gets blocked by Google on two things personal Gmail calendars need: creating a Google Meet link (`Invalid conference type value`) and inviting attendees (`403`). Authenticating as the real account removes both restrictions.

**One-time setup to make it live** (until done, the API returns a 503 with a clear message instead of crashing):
1. Google Cloud Console → same project → enable the **Google Calendar API** (if not already).
2. **APIs & Services → OAuth consent screen**: User type **External** → fill in app name/support email → under **Test users**, add the Gmail account that owns the calendar.
3. **APIs & Services → Credentials → Create Credentials → OAuth client ID** → type **Web application** → Authorized redirect URI: `http://localhost:3000/api/meeting/oauth/callback` (add your production URL too once deployed) → copy the **Client ID** + **Client Secret**.
4. Add to `.env.local` (never `.env` — these are secrets):
   ```
   GOOGLE_CALENDAR_ID=the-calendar-owner@gmail.com
   GOOGLE_OAUTH_CLIENT_ID=xxxx.apps.googleusercontent.com
   GOOGLE_OAUTH_CLIENT_SECRET=xxxx
   GOOGLE_OAUTH_REDIRECT_URI=http://localhost:3000/api/meeting/oauth/callback
   ```
5. Restart the dev server, then visit **`/api/meeting/oauth/start`** in a browser, log in as the calendar owner, click Allow. The callback page shows a refresh token — copy it into `.env.local` as `GOOGLE_OAUTH_REFRESH_TOKEN`, restart again. Done permanently (the refresh token doesn't expire until revoked).
6. Optional overrides (sensible defaults already in `meeting/config.ts`): `MEETING_TIMEZONE`, `MEETING_DAY_START`, `MEETING_DAY_END`, `MEETING_SLOT_MINUTES`.

To swap Google Calendar for Calendly later: write a `CalendlyProvider implements ICalendarProvider` and change one line in `meeting/composition.ts` — nothing in `BookingService`, the API routes, or the UI needs to change.

**Email confirmations + Google Meet**: every booking creates a Google Meet-enabled calendar event with the booker added as an attendee (`meeting/calendar/GoogleCalendarProvider.ts`, `conferenceData` + `attendees` + `sendUpdates: 'all'` — so Google also sends its own native calendar invite), and separately sends a custom-branded confirmation email with the meeting time + Meet link (`meeting/email/NodemailerEmailSender.ts`, Gmail SMTP). The booker therefore gets two emails: Google's native invite (with .ics attachment) and the app's own confirmation — this is intentional, not a bug.

To enable email sending, add to `.env.local`:
```
GMAIL_USER=your-gmail-account@gmail.com
GMAIL_APP_PASSWORD=xxxxxxxxxxxxxxxx   # Google Account → Security → 2-Step Verification → App Passwords
```
Until set, bookings still succeed (calendar event + Meet link + demo.json record all work) — the email send is wrapped in a try/catch and only logs a server-side error, it never fails the booking.

---

## Things worth knowing

- **Two practice-call systems exist**: `useChallenges` (Cockpit HUD, current/primary) and `usePracticeCall` (PracticeCallPanel, simpler phone UI). They hit different endpoint sets (`/api/challenges/*` vs `/start`+`/answer`) but both can call `/api/sim/calls/negotiate`.
- **Two TTS systems exist**: Academy (`speakAI`) uses Google Translate directly or the browser voice; Voice Simulator uses your backend's `/api/tts`. If you ever centralize speech, these are the two places to merge.
- **`/api/sim/documents/generate`** is shared by both the DAT Simulator and the Gmail Simulator for rate-confirmation docs — one backend feature, two frontends.
- Only **Academy, DAT Simulator** have dedicated hooks (`useChallenges`, `useDatSim`, `usePracticeCall`). Voice Simulator, Gmail Simulator, and Admin keep all state/API calls directly inside their top-level page component — no extracted hook for those three.
