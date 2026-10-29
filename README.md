# Planora AI — Intelligent Event Planning Studio

[![Next.js](https://img.shields.io/badge/Next.js-14.2-black?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?logo=tailwind-css)](https://tailwindcss.com/)
[![Gemini API](https://img.shields.io/badge/Google_Gemini-1.5_Flash-8E75B2?logo=google)](https://ai.google.dev/)
[![Tests](https://img.shields.io/badge/Vitest-16_Passing-brightgreen?logo=vitest)](https://vitest.dev/)
[![WCAG](https://img.shields.io/badge/Accessibility-WCAG_2.2_AA-success)](https://www.w3.org/WAI/standards-guidelines/wcag/)

**Planora AI** is a premium, fully functional GenAI-powered event planning studio built for weddings, birthdays, milestone celebrations, and community events. Built with **Next.js App Router, TypeScript, Tailwind CSS, and shadcn/ui design patterns**, it integrates the **Google Gemini API** through secure server-side Route Handlers with strict Zod validation.

---

## Art Direction & Design Aesthetics

Planora AI avoids generic AI templates and stark monochrome palettes in favor of a timeless, art-directed aesthetic:
- **Warm-Neutral Canvas**: Creamy ivory (`#FAF9F6`) and warm sand foundation.
- **Deep Forest Green** (`#103A28` / `#144832`): Authoritative, natural primary brand tone.
- **Muted Terracotta** (`#C86446`): Expressive accent for urgent milestones, active deadlines, and actions.
- **Champagne / Warm Gold** (`#D4A34B`): Highlights, badges, and celebration accents.
- **Custom Planora Vector Logo**: Stylized interlocking arches and compass sparkle in the sidebar and header.
- **WCAG 2.2 AA Compliance**: Semantic HTML5 tags, visible 2px keyboard focus indicators (`:focus-visible`), ARIA dialog and progressbar roles, and `@media (prefers-reduced-motion)` support.

---

## Core Capabilities

### 1. Dynamic Plan Synthesis via Gemini API
- Users configure their event parameters: title, category (wedding, birthday, community, corporate, gala), target date, venue city, guest count, target budget, currency, styling preferences, and priority allocation bias.
- Next.js server-side Route Handler (`/api/generate-plan`) calls **Gemini 1.5 Flash** with structured prompts, returning an executive brief, art-directed color palette, decor directives, budget breakdown, chronological timeline, and vendor recommendations.
- All AI responses are validated strictly using **Zod** (`GeminiPlanOutputSchema`).

### 2. Live Budget Calculations & Expense Tracking
- Pure, testable budget engine (`src/lib/budget-calc.ts`):
  - Calculates Total Allocated vs. Actual Spent to date.
  - Computes remaining unallocated funds and remaining cash balance.
  - Dynamically detects over-budget conditions with warning heuristics.
  - Produces category-by-category breakdown with progress gauges.
  - Add, edit, and delete budget line items with real-time recalculation.

### 3. Date-Based Timeline & Itinerary Manager
- Organizes milestones chronologically across 3 phases:
  - **Pre-Event Planning**
  - **Day of Event Schedule (Run of Show)**
  - **Post-Event Wrap Up**
- Live countdown indicator (`X days to go`).
- Milestone status cycling (**Pending &rarr; In Progress &rarr; Completed**) with celebratory confetti feedback.
- Add, edit, and remove milestones with lead assignee and specific instructions.

### 4. Curated Vendor Directory & Outreach Pipeline
- Tracks supplier categories, estimated quotes vs. contracted amounts, and contact details.
- Status progression pipeline: *Not Contacted &rarr; Inquired &rarr; Quote Received &rarr; Negotiating &rarr; Contract Signed &rarr; Declined*.
- AI justification rationale explains why each supplier archetype was chosen.

### 5. Interactive AI Plan Refiner
- Per-event AI Assistant console (`/api/assistant-chat`).
- Passes full live event financial context (budget remaining, guest count, location, history) to Gemini.
- Suggests budget reallocations, vendor contract advice, and custom schedules.

### 6. Zero Database / LocalStorage Persistence
- No Firebase, Firestore, or external database required.
- User events, budget line items, milestones, and chat history persist reliably in `localStorage`.
- **Honest Error Handling**: If `GEMINI_API_KEY` is not configured, Planora displays a helpful, informative configuration guide rather than faking live AI output.
- Includes a **Load Sample Celebration** feature on empty dashboards to immediately inspect the live interactive spreadsheet, timeline, and vendor features.

---

## Architecture & Code Structure

```
Planora AI/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── assistant-chat/route.ts  # Route Handler for AI refiner chat
│   │   │   ├── generate-plan/route.ts   # Route Handler for Gemini plan synthesis
│   │   │   └── health/route.ts          # API status & Gemini connection check
│   │   ├── events/
│   │   │   ├── [id]/
│   │   │   │   ├── assistant/page.tsx   # AI Plan Refiner tab
│   │   │   │   ├── budget/page.tsx      # Budget & Expenses tab
│   │   │   │   ├── timeline/page.tsx    # Timeline & Milestones tab
│   │   │   │   ├── vendors/page.tsx     # Vendor Checklist tab
│   │   │   │   └── page.tsx             # Event Overview tab
│   │   │   ├── new/page.tsx             # Create & Synthesize Event page
│   │   │   └── page.tsx                 # All Events Portfolio list
│   │   ├── globals.css                  # Theme variables, accessibility, reduced-motion
│   │   ├── layout.tsx                   # Root layout, Google Fonts (Plus Jakarta & Cormorant)
│   │   └── page.tsx                     # Studio Dashboard with metrics & recent plans
│   ├── components/
│   │   ├── events/
│   │   │   ├── ApiKeyModal.tsx          # Gemini API credentials & guide modal
│   │   │   ├── BudgetTracker.tsx        # Interactive expense management table & cards
│   │   │   ├── EventCard.tsx            # Celebration card with progress & swatches
│   │   │   ├── EventForm.tsx            # Event parameter form & AI trigger
│   │   │   ├── EventHeader.tsx          # Event navigation tabs, countdown, & badges
│   │   │   ├── PlanOverview.tsx         # AI summary, palette chips, decor directives
│   │   │   ├── PlanRefinerChat.tsx      # Live Gemini chat console
│   │   │   ├── TimelineManager.tsx      # Phase filters & milestone status toggles
│   │   │   └── VendorChecklist.tsx      # Vendor cards, quote comparisons, & modal
│   │   ├── layout/
│   │   │   ├── AppShell.tsx             # Responsive layout wrapper
│   │   │   ├── Logo.tsx                 # Custom art-directed SVG logo & icon
│   │   │   ├── Navbar.tsx               # Top navigation bar with status pill
│   │   │   └── Sidebar.tsx              # Sidebar navigation & engine status
│   │   └── ui/                          # Accessible component primitives
│   │       ├── Alert.tsx
│   │       ├── Badge.tsx
│   │       ├── Button.tsx
│   │       ├── Card.tsx
│   │       ├── Input.tsx
│   │       ├── Modal.tsx
│   │       ├── ProgressBar.tsx
│   │       └── Select.tsx
│   ├── lib/
│   │   ├── budget-calc.ts               # Budget math, over-budget warnings, formatting
│   │   ├── gemini.ts                    # Google Generative AI integration service
│   │   ├── schemas.ts                   # Zod validation schemas for all inputs & outputs
│   │   ├── storage.ts                   # LocalStorage persistence & sample data seeder
│   │   ├── timeline-utils.ts            # Phase ordering, countdowns, date formatting
│   │   ├── types.ts                     # TypeScript data interfaces
│   │   └── utils.ts                     # Class merging helper (cn)
│   └── test/
│       ├── budget-calc.test.ts          # Unit tests for budget math & warnings
│       ├── components.test.tsx          # Component accessibility tests (WCAG 2.2)
│       ├── schemas.test.ts              # Zod validation tests
│       ├── setup.ts                     # Vitest test setup and DOM mocks
│       └── storage.test.ts              # LocalStorage persistence unit tests
├── .env.example                         # Template environment variables
├── .env.local                           # Local environment config (server-only)
├── next.config.mjs                      # Next.js configuration
├── package.json                         # Dependencies & scripts
├── tailwind.config.ts                   # Custom color tokens & fonts
├── tsconfig.json                        # Strict TypeScript & path mappings
└── vitest.config.ts                     # Vitest test runner configuration
```

---

## Setup & Environment Configuration

### 1. Prerequisites
- Node.js `v18.17+` or `v20+` (tested on Node v24.16)
- npm or pnpm

### 2. Configure Gemini API Key
Obtain a free API key from [Google AI Studio](https://aistudio.google.com/app/apikey).

Create or update `.env.local` in the project root:
```bash
GEMINI_API_KEY=AIzaSyYourGeminiApiKeyHere
```
*Note: The key is accessed exclusively server-side in Next.js Route Handlers and is never exposed in browser bundles.*

Alternatively, users can click **Configure API Key** in the top navigation bar to supply a session key directly within the app.

---

## Running the Application

### Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### Production Build & Launch
```bash
npm run build
npm run start
```

---

## Running Tests

Planora AI includes a Vitest and React Testing Library test suite:
```bash
# Run all unit and component tests
npm run test

# Run tests in watch mode
npm run test:watch
```

**Test Coverage Highlights:**
- **Budget Engine**: Calculations of total allocated, actual expenditures, variances, category aggregations, and over-budget alerts.
- **Zod Schemas**: Strict validation of event inputs and structured Gemini output payloads.
- **Client Storage Layer**: Tests persistence, retrieval, functional updaters, and deletions.
- **Accessibility (WCAG 2.2 AA)**: Validates semantic button behaviors, ARIA progressbar states, alert roles, and focus traps/Escape key handling in modals.
