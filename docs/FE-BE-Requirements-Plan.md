# FE & BE Requirements Plan — USM GOV UI

A clear split of what the **Frontend (FE)** and **Backend (BE)** must provide for the government/citizen engagement app (mobile-first, Angular).

---

## Design principle: mobile friendly

**Make sure the app is mobile friendly.** All UI, layouts, touch targets, and performance must work well on phones and small screens first. Use responsive design, touch-friendly controls, and avoid desktop-only patterns. Test on real devices and narrow viewports.

---

## Product requirements (source of truth)

These are the things required. FE and BE sections below implement them.

### Roles

| Role | Description |
|------|-------------|
| **Voters / Citizens** | End users; see their constituency only; submit complaints; view MPs, projects, announcements. |
| **Member of Parliament (MP)** | Parliamentarian; profile, vote history, projects proposed, achievements, contact. |
| **Constituency admin / officer** | Manages one constituency; sees complaints, projects, announcements for that area. |
| **Central government admin** | For PMX only; broader access. |
| **Developer** | Technical role (e.g. for support or integrations). |

### Login & registration

- **Login page:** IC number input, two-factor authentication (2FA).
- **Registration:** Age eligibility (e.g. 18+), IC scanning support.
- **After successful login:** IC number input step, then 2FA step.
- **Database:** Store roles, user info, announcements, and all web-related data.
- **Audit trail:** Log who did what and when.
- **Backups:** Regular backups of data.

### Sections & subsections

| Section | Subsection / content |
|---------|----------------------|
| **Dashboard** | Content relevant to user’s constituency only. Map showing only their area (no access to other areas). Their area’s parliamentarians. Recent announcements. Summary of local projects. Status of their submitted complaints. |
| **Your complaint page** | Submit complaints; support image upload. |
| **Parliamentarian’s info page** | History; vote history; projects proposed history; achievements; contact information (email, social media links). |
| **Project details page** | Project timeline (milestones, construction started, estimated completion date). Budget & funding (allocated budget). Contractor information (company running the project). Updates section (project status). |
| **My account (profile)** | Settings: theme / appearance; profile details. |
| **Footer** | Optional: app’s official social media links. |

### Launch format & behaviour

- **Mobile friendly:** The app must be mobile friendly (responsive, touch-friendly, performant on phones). Design and build for small screens first.
- **Mobile app first:** Prioritise mobile experience; support PWA or native wrapper (e.g. Capacitor).
- **Push notifications:**
  - **Users:** New announcements; status of submitted complaints; new projects in their area.
  - **Admins:** Notify when new complaint submitted; when project deadline is approaching.
- **Localisation:** Multilanguage support — Chinese, Malay, English.
- **User feedback & ratings:** In-app feedback mechanism.
- **Geolocation:** Automatic location tagging; app can tag photo location automatically.
- **Permissions:** App may request permissions to use certain device functions (camera, location, notifications, etc.).

---

## Recommended stack: free & no licence issues (Angular + Node)

All components below are **free to use** and use **permissive or copyleft open-source licences** so you avoid proprietary lock-in and licence fees.

| Layer | Choice | Licence | Notes |
|-------|--------|---------|--------|
| **Frontend** | Angular | MIT | You already use it; fully free, commercial use OK. |
| **Mobile wrapper** | Capacitor | MIT | Wrap Angular as iOS/Android app; no store fees from Capacitor. |
| **Backend** | Node.js + Express or NestJS | MIT | Node & Express: MIT. NestJS: MIT. Use NestJS if you want structure similar to Angular. |
| **Database** | PostgreSQL | PostgreSQL License (BSD-like) | No GPL-style obligations; use in any project. Free. |
| **Auth** | Custom JWT + OTP (e.g. `jsonwebtoken`, `nodemailer` for email OTP) | MIT | No third-party IdP; you own the logic. 2FA via email/SMS or TOTP lib (e.g. `otplib` – MIT). |
| **File storage** | Local disk or MinIO | MinIO: AGPL v3 | Store uploads on server filesystem (simplest, free) or run MinIO (S3-compatible). AGPL: if you modify MinIO you share changes; using it as-is is fine. |
| **Push notifications** | Firebase Cloud Messaging (FCM) | Free tier; Google ToS | Free; no licence fee. Alternative: self-hosted **UnifiedPush** or **ntfy** (MIT/GPL) if you want zero vendor dependency. |
| **Maps** | Leaflet + OpenStreetMap | Leaflet: BSD-2-Clause; OSM: ODbl | No API key for OSM tiles; free. Use GeoJSON from your BE for constituency boundaries. |
| **i18n** | Angular i18n or `ngx-translate` | MIT | Both free. |
| **Hosting (later)** | Self-host (VPS) or free tiers | N/A | Run Node + Postgres on a VPS (e.g. your university/server). Avoid relying on “free tier” of a proprietary SaaS long-term if you want zero licence/ToS risk. |

**Summary:**  
**Angular (FE) + Node (Express or NestJS) (BE) + PostgreSQL + custom JWT auth + Leaflet/OSM + file storage on server or MinIO** keeps everything free and avoids proprietary licences. Use FCM for push (free, ToS only) or switch to a self-hosted push server if you need to avoid any vendor.

**Current backend:** The backend is implemented as **Java Spring Boot** in a sibling folder **USM GOV API** (same parent as this Angular app). Swagger UI is available at `http://localhost:8080/swagger-ui.html` when the API is running.

---

## 1. Roles & Access

| Aspect | FE needs | BE needs |
|--------|----------|----------|
| **Roles** | • Role-based UI (show/hide sections by role: Voter, MP, Constituency Admin, Central Gov Admin, Developer)<br>• Route guards that check role from auth state<br>• Different layouts/navigation per role | • Store role per user in DB<br>• Auth tokens/JWT that include role (and constituency where relevant)<br>• API endpoints that enforce role (e.g. admin-only routes)<br>• Return only data allowed for that role (e.g. constituency-scoped) |
| **Constituency scoping** | • Send constituency context in API calls (from user profile or selection)<br>• Only request/render data for user’s constituency<br>• Map component that receives and displays only allowed area | • Enforce constituency in queries (e.g. filter by `constituencyId`)<br>• Ensure MPs/Admins only access their assigned constituency (or central for PMX)<br>• Return geobounds/GeoJSON for “allowed area” for map |

---

## 2. Login & Registration

| Aspect | FE needs | BE needs |
|--------|----------|----------|
| **Login page** | • Login form (e.g. IC/email + password)<br>• Call auth API, store token, redirect by role<br>• Optional “Remember me” (secure storage) | • Auth endpoint (e.g. `POST /auth/login`)<br>• Validate credentials, return JWT (with role, userId, constituencyId)<br>• Rate limiting, lockout after failed attempts |
| **Registration** | • Registration form with validation<br>• Age eligibility check (DOB → 18+) before submit<br>• Optional: IC format validation (client-side) | • `POST /auth/register`<br>• Validate age server-side (DOB ≥ 18)<br>• Store user + role (default: Voter)<br>• Duplicate IC/email checks |
| **IC scanning** | • Camera/gallery access (Capacitor or PWA API)<br>• Capture image → send to BE for OCR/extraction<br>• Display extracted IC number for user to confirm/edit | • Endpoint to receive IC image (e.g. `POST /auth/ic-scan`)<br>• OCR service (or 3rd party) to extract IC number<br>• Return extracted text; optionally validate format |
| **Two-factor authentication (2FA)** | • Step 1: IC/number input → call BE to send OTP<br>• Step 2: OTP input field → submit with token to verify<br>• Resend OTP button (with cooldown)<br>• Persist “trusted device” if BE supports it | • Send OTP (SMS/email/TOTP) after login or sensitive action<br>• Endpoint to verify OTP and complete login<br>• TOTP secret storage and verification if using authenticator app<br>• Session/device binding for “trust device” |

**After successful login (FE):**  
Use stored token for all API calls; optionally refresh token flow (FE sends refresh token, BE returns new access token).

---

## 3. Database, Audit & Backups

| Aspect | FE needs | BE needs |
|--------|----------|----------|
| **Database** | • No direct DB access<br>• All data via REST/GraphQL APIs | • DB design: users, roles, constituencies, announcements, complaints, projects, parliamentarians, votes, milestones, contractors, audit_log, etc.<br>• Indexes for constituency, date, status, user |
| **Audit trail** | • No direct write to audit<br>• Log sensitive actions (e.g. “complaint submitted”) if BE expects client-sent context (e.g. IP, userAgent); usually BE logs from server | • Log who did what and when (userId, action, resource, old/new value, IP, timestamp)<br>• Store in `audit_log` (or similar); never expose full audit to FE except via admin-only APIs |
| **Backups** | • None | • Scheduled DB backups, point-in-time recovery<br>• Backup of uploaded files (complaint images, etc.) |

---

## 4. Dashboard

| Aspect | FE needs | BE needs |
|--------|----------|----------|
| **Constituency-specific content** | • Single dashboard component that fetches “dashboard data” for current user’s constituency<br>• Show: map, MPs, announcements, projects summary, complaint status | • `GET /dashboard` (or `/dashboard?constituencyId=`) that returns aggregated data for one constituency<br>• Enforce: user can only request their constituency |
| **Map (only their area)** | • Map component (e.g. Leaflet/Mapbox) that receives boundary (GeoJSON/polygon) from BE<br>• Render only that area; no option to pan to other constituencies (or disable other layers) | • Endpoint to return constituency boundary (GeoJSON) by ID<br>• Optional: return pins for projects/complaints within that boundary only |
| **Their area parliaments** | • List/cards of parliamentarians for the constituency<br>• Link to parliamentarian detail page | • `GET /constituencies/:id/parliamentarians` or include in dashboard payload |
| **Recent announcements** | • List with date, title, summary; “Read more” to full view | • `GET /announcements?constituencyId=&limit=&offset=` (or part of dashboard)<br>• Pagination/sorting params |
| **Summary of local projects** | • Cards or list: project name, status, progress % | • Include in dashboard or `GET /projects?constituencyId=&summary=true` |
| **Status of submitted complaints** | • List of user’s complaints with status (e.g. Pending, In Progress, Resolved) | • `GET /complaints?userId=` (or from token) with status; or part of dashboard |

---

## 5. Your Complaint Page

| Aspect | FE needs | BE needs |
|--------|----------|----------|
| **Submit complaint with image** | • Form: description, category, optional location<br>• Image picker/camera (multiple images if allowed)<br>• Optional: auto geolocation tag (see Geolocation)<br>• Upload images + metadata in one request or multipart | • `POST /complaints` (multipart or base64): title, description, category, constituencyId, location (lat/lng), images<br>• Store complaint + file URLs; link to user<br>• Notify constituency admin (see Alerts) |
| **List / history of complaints** | • List user’s complaints with filters (status, date)<br>• Detail view for one complaint | • `GET /complaints` (own only for voter); `GET /complaints/:id`<br>• Role-based: admin sees all in their constituency |

---

## 6. Parliamentarian’s Info Page

| Aspect | FE needs | BE needs |
|--------|----------|----------|
| **Profile** | • Display photo, name, party, constituency, term | • `GET /parliamentarians/:id` with full profile |
| **History** | • Timeline or list of key events | • Include in parliamentarian payload or `GET /parliamentarians/:id/history` |
| **Vote history** | • Table/list: bill, vote (yes/no/absent), date | • `GET /parliamentarians/:id/votes` with pagination |
| **Projects proposed** | • List of projects they proposed | • `GET /parliamentarians/:id/projects-proposed` or link to projects with `proposedBy` |
| **Achievements** | • List/sections | • Include in profile or separate endpoint |
| **Contact** | • Display email, social links (open in app/browser) | • Stored in DB and returned in parliamentarian API |

---

## 7. Project Details Page

| Aspect | FE needs | BE needs |
|--------|----------|----------|
| **Timeline** | • Show milestones, construction start, estimated completion | • `GET /projects/:id` with milestones (name, date, status) and dates |
| **Budget & funding** | • Display allocated budget, funding source | • Include in project API (amount, currency, source) |
| **Contractor** | • Company name, contact (if public) | • Contractor entity linked to project; returned in project API |
| **Updates** | • List of status updates (date, text, media) | • `GET /projects/:id/updates` or nested in project; `POST` for admin to add updates |

---

## 8. My Account (Profile)

| Aspect | FE needs | BE needs |
|--------|----------|----------|
| **Settings** | • Theme/appearance toggle (e.g. light/dark/system)<br>• Persist in localStorage or user preferences API | • Optional: `GET/PATCH /users/me/preferences` (theme, language) |
| **Profile details** | • Form to view and edit name, email, phone, address (if allowed)<br>• Display IC (masked), DOB, constituency | • `GET /users/me`, `PATCH /users/me`<br>• Enforce validation and role rules |

---

## 9. Footer

| Aspect | FE needs | BE needs |
|--------|----------|----------|
| **Social links** | • Static or config-driven links (e.g. from env or small config API) | • Optional: `GET /config/footer` or env; no sensitive data |

---

## 10. Launch Format & Notifications

| Aspect | FE needs | BE needs |
|--------|----------|----------|
| **Mobile app first** | • Responsive layout; touch-friendly; PWA or Capacitor build for store<br>• Optional: deep links for notifications | • APIs support mobile (e.g. pagination, small payloads, compression) |
| **Push notifications** | • Request permission; send FCM/APNs token to BE<br>• Handle notification tap (navigate to announcement/complaint/project) | • Store device tokens per user<br>• Send push via FCM/APNs when events occur (see Alerts) |
| **Alerts – users** | • Receive push: new announcement, complaint status change, new project in area<br>• In-app badge or list of “notifications” (optional) | • Trigger push when: announcement created, complaint status updated, project created (for that constituency)<br>• Queue or immediate send via FCM/APNs |
| **Alerts – admin** | • Receive push: new complaint submitted; project deadline approaching | • Trigger when complaint created (constituency admin); scheduled job for “deadline in N days” (notify relevant admins) |

---

## 11. Localisation (Multilanguage)

| Aspect | FE needs | BE needs |
|--------|----------|----------|
| **Chinese, Malay, English** | • Angular i18n or ngx-translate<br>• Language switcher; persist choice (localStorage or user prefs)<br>• Send `Accept-Language` or `?lang=` in API calls | • Optional: translated content in DB (e.g. `announcements` with `title_en`, `title_ms`, `title_zh`) and return by `Accept-Language` or `lang`<br>• Or only FE translates static UI; BE returns keys or single language |

---

## 12. User Feedback & Ratings

| Aspect | FE needs | BE needs |
|--------|----------|----------|
| **In-app feedback** | • Form: rating (e.g. 1–5), comment, optional screenshot<br>• Submit to BE; thank-you message | • `POST /feedback` (userId from token, rating, comment, optional image)<br>• Store for analytics/support |

---

## 13. Geolocation

| Aspect | FE needs | BE needs |
|--------|----------|----------|
| **Auto location tagging** | • Request geolocation permission; get lat/lng (e.g. when taking complaint photo)<br>• Send coordinates with complaint (and optionally reverse-geocode for display) | • Store lat/lng with complaint/project; optional server-side reverse geocode for address<br>• Validate coordinates are within constituency if required |

---

## 14. Permissions (Device)

| Aspect | FE needs | BE needs |
|--------|----------|----------|
| **Camera, gallery, location, notifications** | • Use Capacitor or web APIs; request permissions with clear rationale<br>• Graceful fallback if user denies (e.g. upload from gallery only, or manual location) | • No direct device access; only receive data (images, coordinates) that FE sends |

---

## 15. Mobile friendly (mandatory)

**Make sure the app is mobile friendly.** All of the below apply.

| Aspect | FE needs | BE needs |
|--------|----------|----------|
| **Layout & viewport** | • Responsive layout; breakpoints for small/medium/large screens<br>• Single-column or stacked layout on narrow viewports; avoid horizontal scroll<br>• Use `viewport` meta and touch-friendly tap targets (min ~44px) | • N/A |
| **Touch & interaction** | • Large enough buttons and links for touch; adequate spacing<br>• Avoid hover-only behaviour; support tap/click<br>• Swipe or pull-to-refresh where it fits (e.g. lists) | • APIs support pagination and small payloads so mobile loads fast |
| **Performance** | • Lazy-load routes and heavy components; optimize images (responsive srcset, format)<br>• Minimise main-thread work; avoid layout thrash | • Compress responses (gzip/brotli); optional field selection or sparse fieldsets to reduce payload |
| **Mobile-specific features** | • PWA manifest and service worker, or Capacitor build for app stores<br>• Safe area insets for notches/home indicators<br>• Optional: bottom nav or drawer for primary navigation on small screens | • Device token registration and push payloads suitable for mobile (deep links, small data) |
| **Testing** | • Test on real devices and in Chrome DevTools device emulation; verify touch, keyboard, and zoom | • N/A |

---

## 16. Summary Checklist

### Frontend (FE) — Angular app

- **Mobile friendly:** Responsive layout, touch-friendly targets, no horizontal scroll on small screens; test on real devices.
- Auth UI: login, registration, 2FA (IC input, OTP), optional IC scan (camera + upload).
- Role-based routing and guards; constituency-scoped data requests.
- Dashboard: map (with BE-supplied boundary), MPs, announcements, project summary, complaint status.
- Complaint: submit form with image(s) and optional geolocation; list and detail of own complaints.
- Parliamentarian: profile, vote history, projects proposed, achievements, contact.
- Project: timeline, budget, contractor, updates.
- Profile: settings (theme), profile view/edit; language switcher.
- Footer: social links (static or config).
- Push: register device token; handle notification taps and deep links.
- i18n: EN, MS, ZH; send language to BE if needed.
- Feedback form; device permission handling (camera, location, notifications).

### Backend (BE)

- **Mobile friendly:** Pagination, small payloads, compression; push payloads with deep links for mobile.
- Auth: login, register (with age check), 2FA (OTP send/verify), optional IC-scan OCR endpoint.
- Users, roles, constituencies, parliamentarians, announcements, complaints, projects, milestones, contractors, updates, feedback, audit_log.
- Enforce role and constituency on all relevant APIs; return only allowed data.
- Dashboard and map APIs (constituency boundary + pins).
- File storage for complaint images and feedback; secure URLs.
- Push: store device tokens; trigger on announcement, complaint status, new project, new complaint (admin), deadline (admin).
- Optional: localized content; user preferences (theme, language).
- Backups and audit logging (server-side).

Use this as the single source of truth for what each side owns; adjust to your exact API design and tech stack (e.g. REST vs GraphQL, Auth0 vs custom JWT).
