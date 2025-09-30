# AI Interview System - Design Guidelines

## Design Approach

**Selected Approach:** Design System + Professional SaaS Reference

**Rationale:** As a professional assessment platform handling critical interview data, the design prioritizes clarity, trust, and efficiency over visual flair. Drawing inspiration from modern productivity tools like Linear, Notion, and professional HR platforms while maintaining a clean, data-focused aesthetic.

**Key Design Principles:**
1. Professional credibility through clean, structured layouts
2. Clear information hierarchy for complex data (scores, transcripts, evaluations)
3. Focused interview experience minimizing cognitive load
4. Dashboard excellence for analytics and reporting
5. Trust-building through consistent, polished interfaces

---

## Core Design Elements

### A. Color Palette

**Light Mode:**
- Primary: 220 90% 56% (Professional blue - trust and reliability)
- Background: 0 0% 100% (Pure white)
- Surface: 220 14% 96% (Light gray for cards/panels)
- Text Primary: 220 9% 15% (Near black)
- Text Secondary: 220 9% 46% (Medium gray)
- Border: 220 13% 91% (Subtle borders)
- Success: 142 71% 45% (Evaluation scores, completion)
- Warning: 38 92% 50% (Moderate scores)
- Error: 0 84% 60% (Low scores, errors)

**Dark Mode:**
- Primary: 220 90% 56% (Consistent blue)
- Background: 222 47% 11% (Deep navy-gray)
- Surface: 217 33% 17% (Elevated panels)
- Text Primary: 210 40% 98% (Near white)
- Text Secondary: 215 20% 65% (Light gray)
- Border: 217 33% 23% (Subtle borders)

### B. Typography

**Font Families:**
- Primary: 'Inter' (Google Fonts) - UI elements, body text, dashboards
- Monospace: 'JetBrains Mono' - Code snippets, technical questions, transcripts

**Type Scale:**
- Hero/Display: text-5xl font-bold (Interview titles, dashboard headers)
- H1: text-3xl font-semibold (Page titles)
- H2: text-2xl font-semibold (Section headers)
- H3: text-xl font-medium (Card headers, subsections)
- Body Large: text-base (Interview questions, primary content)
- Body: text-sm (Form labels, descriptions)
- Caption: text-xs font-medium uppercase tracking-wider (Labels, metadata)

### C. Layout System

**Spacing Primitives:** Use Tailwind units of 2, 4, 6, 8, 12, 16
- Micro spacing: p-2, gap-2 (tight elements)
- Standard spacing: p-4, gap-4, mb-6 (common components)
- Section spacing: p-8, gap-8, py-12 (major sections)
- Large spacing: p-16, gap-16 (page-level separation)

**Grid System:**
- Dashboard: 12-column grid with responsive breakpoints
- Interview Interface: Single-column focus layout (max-w-3xl centered)
- Admin Panels: Two-column layouts (sidebar + content)

### D. Component Library

**Navigation:**
- Top navbar: Fixed, glass-morphism effect with blur backdrop
- Sidebar navigation for admin: Collapsible, icon + label
- Breadcrumbs for deep navigation hierarchies

**Cards & Panels:**
- Primary cards: Rounded-lg, border, shadow-sm, p-6
- Data cards: Clean borders, hover:shadow-md transition
- Interview question cards: Prominent, border-l-4 with category color accent

**Forms:**
- Input fields: Rounded-md, border-2, focus:ring-2 ring-primary
- Labels: text-sm font-medium mb-2
- Validation states: Colored borders and helper text
- Speech recording button: Large, circular, pulsing animation when active

**Buttons:**
- Primary: bg-primary, rounded-md, px-6 py-3, font-medium
- Secondary: border-2 variant with hover states
- Icon buttons: Rounded-full for actions (edit, delete, download)

**Data Display:**
- Tables: Striped rows, hover states, sticky headers for long lists
- Score meters: Circular progress indicators (0-10 scale) with color gradients
- Charts: Clean, minimal line/bar charts for analytics (use Chart.js or Recharts)
- Badges: Rounded-full pills for categories (Technical/HR/Aptitude)

**Interview Interface:**
- Question display: Large, centered card with category badge
- Audio waveform visualization during recording
- Transcript display: Real-time updating text area, monospace font
- Timer: Fixed position, subtle but visible
- Progress indicator: Step-based progression (Question 3 of 10)

**Reports:**
- PDF-style layout in web view (white background, structured sections)
- Score breakdowns: Grid layout with individual metric cards
- Evaluation text: Clearly separated strengths/weaknesses/recommendations sections
- Download button: Prominent, with PDF icon

**Dashboards:**
- Admin: Grid of metric cards (total interviews, avg score, completion rate)
- Candidate: Timeline view of past interviews with expandable details
- Charts: Performance over time, category breakdown
- Recent activity feed: List of latest interviews/evaluations

### E. Interactions & States

**Micro-interactions:**
- Button hover: Slight scale (scale-105) and brightness increase
- Card hover: Shadow elevation (shadow-md → shadow-lg)
- Focus states: 2px ring in primary color
- Loading states: Skeleton screens for data-heavy views
- Success animations: Subtle checkmark on submission completion

**Speech Recording:**
- Idle: Microphone icon, gray
- Recording: Pulsing red indicator, waveform animation
- Processing: Spinner with "Transcribing..." text
- Complete: Fade-in transcript with success checkmark

**Page Transitions:**
- Smooth fade-in for route changes (150ms)
- Slide-in animations for modals/sidebars (200ms)

---

## Role-Specific Design

**Candidate Interface:**
- Focus mode: Distraction-free interview taking
- Clean, encouraging design language
- Prominent "Start Interview" CTA
- Progress reassurance throughout

**Admin Interface:**
- Data-dense but organized
- Quick actions easily accessible
- Filtering and search prominence
- Export functionality always visible

---

## Images

**Hero Section (Landing/Login):**
- Professional illustration of AI-powered interview concept
- Placement: Split-screen layout (left: hero image, right: login/CTA)
- Style: Modern, abstract tech illustration with blue/purple gradients
- Alternative: Clean geometric patterns suggesting AI/data analysis

**Dashboard Illustrations:**
- Empty states: Friendly illustrations for "no interviews yet"
- Success states: Subtle celebratory graphics for completed interviews
- Error states: Supportive visuals for technical issues

**No large hero image required** - focus on functional clarity over visual storytelling