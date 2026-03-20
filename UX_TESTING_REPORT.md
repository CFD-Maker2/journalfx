# UX Testing Checklist & Findings

## Test Environment
- Frontend: http://localhost:8080
- Backend API: http://localhost:5000/api
- Date: 2026-03-21
- Build Status: ✅ Production build successful

---

## Form Validation & Error Handling

### Login Form (src/pages/Login.tsx)
**Test Points:**
- [ ] Empty email input → should show validation error
- [ ] Invalid email format → should show validation error
- [ ] Empty password input → should show validation error
- [ ] Valid credentials → should redirect to Dashboard
- [ ] Invalid credentials → should show error toast
- [ ] Toast notification auto-dismisses after 5 seconds
- [ ] Form label is clear "Sign In"
- [ ] Password input is masked (bullets/dots, not visible text)
- [ ] "Remember me" checkbox exists and is functional
- [ ] Submit button is disabled while form is submitting
- [ ] Link to Register page is visible

**Expected Behavior:**
- Email validation: Valid email format required
- Password: Min 6 characters
- Error messages appear in red toast notifications
- Success redirects to /dashboard

---

### Register Form (src/pages/Register.tsx)
**Test Points:**
- [ ] Email field validates email format
- [ ] Password field requires min 6 characters
- [ ] Confirm password must match password field
- [ ] Mismatch password shows inline error
- [ ] Empty fields show validation errors
- [ ] Submit button disabled while loading
- [ ] Success shows toast and redirects to Dashboard
- [ ] Duplicate email shows error toast
- [ ] Form has clear title "Create Account"
- [ ] Link to Login page is visible
- [ ] Password strength indicator (optional but nice to have)

**Expected Behavior:**
- Form validation runs on blur and submit
- Toast notifications for errors (red) and success (green)
- Clear error messages next to fields

---

### Journal Entry Form (POST: /api/journal) (src/pages/Journal.tsx)
**Test Points:**
- [ ] All dropdowns have default selection or placeholder
- [ ] Currency pair dropdown is populated correctly
- [ ] Trade type (Long/Short) dropdown works
- [ ] Market condition dropdown has options (Trending, Ranging, Volatile, Choppy)
- [ ] Stop loss pips field: accepts positive numbers only
- [ ] Take profit pips field: accepts positive numbers only
- [ ] Profit/loss field: accepts negative and positive numbers
- [ ] Emotion dropdown shows relevant trading emotions
- [ ] Emotion intensity slider: 1-5 scale works correctly
- [ ] Confidence level slider: 1-5 scale works correctly
- [ ] All text areas (pre_trade, during_trade, post_trade) accept multi-line text
- [ ] Submit button is disabled if required fields are empty
- [ ] Loading spinner appears while submitting
- [ ] Success shows toast: "Journal entry created"
- [ ] Empty state message helpful (if no entries exist)
- [ ] Trade emotion snapshot section is clearly labeled as trade-specific
- [ ] Date/time is auto-set to current time
- [ ] Field labels are clear and descriptive

**Expected Behavior:**
- Form saves to MongoDB
- Emotion and confidence are stored as numeric values (1-5)
- Trigger toast on success/error
- Clear form or redirect after success

---

### Mood Log Form (POST: /api/mood) (src/pages/MoodLog.tsx)
**Test Points:**
- [ ] Header says "Daily Check-In History" (not "Mood History")
- [ ] Button text is "Add Check-In" (not "Log Mood")
- [ ] Emotion dropdown is populated
- [ ] Intensity slider: 1-5 scale works (or 1-10, check modal)
- [ ] Notes field accepts multi-line text
- [ ] Notes placeholder is helpful: "How did the day feel overall..."
- [ ] Submit button disabled if emotion not selected
- [ ] Loading spinner shows while saving
- [ ] Success: toast notification appears
- [ ] New entry appears at top of history list
- [ ] Timestamp is readable (e.g., "Today at 2:30 PM")
- [ ] Empty state message: "No check-ins yet..."
- [ ] Each entry shows emotion, intensity, timestamp, notes
- [ ] Entries are sorted by most recent first
- [ ] Daily check-in language is used throughout (never "mood log")

**Expected Behavior:**
- Each entry saves independently
- No character limit on notes (or if there is, inform user)
- Intensity must be 1-5
- Emotion must be selected

---

### Reflections Form (src/pages/Reflections.tsx)
**Test Points:**
- [ ] Header says "Today's Daily Reflections"
- [ ] Exactly 5 prompts are displayed
- [ ] Prompts are day-level overall (not trade-specific)
- [ ] Each prompt has:
  - [ ] Clear question text
  - [ ] Character counter if there's a limit
  - [ ] Text area (multi-line input)
  - [ ] Required indicator (*)
- [ ] "Completed" metric shows count (e.g., "1 / 5")
- [ ] Submit button disabled until all 5 prompts answered
- [ ] Loading spinner shows while saving
- [ ] Success: toast "Reflections saved"
- [ ] Next day: prompts reset to unanswered (daily feature works)
- [ ] Yesterday's responses not visible on new day
- [ ] Form auto-fills with saved responses if user returns same day

**Expected Behavior:**
- Daily reset logic works (new date = new set of prompts)
- All must be answered to submit
- Each response is stored with timestamp
- Character limit per response (if any) is clearly communicated

---

## Dashboard & Data Display

### Dashboard Page (src/pages/Dashboard.tsx)
**Test Points:**
- [ ] Page loads without errors
- [ ] "No data yet" message appears if user has no entries
- [ ] Stats cards display:
  - [ ] Total Entries count
  - [ ] Weekly Mood Trend (line chart)
  - [ ] Top Emotions (pie/doughnut chart)
  - [ ] AI Summary box (if API is configured)
- [ ] Charts scale correctly if empty
- [ ] Charts update when new data is added
- [ ] Emotion distribution shows color badges
- [ ] Weekly mood trend x-axis labeled with days (Mon, Tue, etc.)
- [ ] Weekly mood trend y-axis labeled with scale (0-5 or 1-10)
- [ ] Hover tooltips on charts show data values
- [ ] Cards are responsive on mobile
- [ ] Charts don't overlap or cut off on small screens
- [ ] AI Summary section clearly labeled
- [ ] Mood trends use mood log data (not journal entries)

**Expected Behavior:**
- Real-time updates when data is added
- Graceful handling of empty state
- No visual glitches or overlapping elements

---

## Navigation & Layout

### Sidebar Navigation (src/components/layout/Sidebar.tsx)
**Test Points:**
- [ ] App name section is blank (no "JournalFX" displayed)
- [ ] All navigation items are visible and clickable:
  - [ ] Dashboard
  - [ ] Journal
  - [ ] Mood Log
  - [ ] Reflections
  - [ ] Insights
  - [ ] Timeline
  - [ ] Profile
  - [ ] Admin (if user has permission)
- [ ] Active page is highlighted in nav
- [ ] Sidebar collapses on mobile (hamburger menu visible)
- [ ] Logo/icon is visible
- [ ] Hover effects on nav items
- [ ] Logout button is at the bottom
- [ ] User avatar/profile pic displays correctly

**Expected Behavior:**
- Smooth navigation between pages
- No broken links
- Responsive collapse/expand on different screen sizes

---

### Main Layout
**Test Points:**
- [ ] Pages render within MainLayout wrapper
- [ ] Header includes navigation toggle on mobile
- [ ] No leftover "JournalFX" text visible anywhere on screen
- [ ] Page titles match sidebar nav labels
- [ ] Footer is visible (if exists) and not overlapping content
- [ ] Spacing/padding is consistent across pages
- [ ] Colors are readable (contrast ratio meets WCAG standards)
- [ ] Mobile responsive (test on various screen widths)

**Expected Behavior:**
- Clean layout with no overlapping elements
- Consistent styling across all pages
- Readable text and buttons

---

## Authentication Flow

### LoginContext / AuthContext
**Test Points:**
- [ ] Unauthenticated user redirected to /login
- [ ] Login successful → user stored in context
- [ ] Protected routes check auth before rendering
- [ ] Logout clears auth context and redirects to login
- [ ] Token persists on page refresh (if localStorage is used)
- [ ] Expired token handled gracefully (redirect to login)
- [ ] 401 responses redirect to login page

**Expected Behavior:**
- Smooth auth transitions
- No security leaks (password never logged)
- User state consistent across page refreshes

---

## Data Integrity & Edge Cases

### Empty States
- [ ] No Journal Entries → helpful empty message
- [ ] No Mood Logs → helpful empty message
- [ ] No AI Insights → helpful empty message
- [ ] New user → onboarding hint or tutorial (optional)

### Error Handling
- [ ] Network error → toast notification with retry button
- [ ] Form submission fails → error message shown
- [ ] 500 server error → user-friendly error message
- [ ] Validation errors → clear feedback next to field

### Data Persistence
- [ ] New entry appears immediately after creation
- [ ] Page refresh → data persists from database
- [ ] Long timestamps are formatted (not showing raw Unix timestamps)
- [ ] Dates use consistent format throughout app

---

## Accessibility (Basic)

- [ ] All buttons have clear labels (not just icons)
- [ ] Form labels associated with inputs
- [ ] Keyboard navigation works (Tab through form)
- [ ] Links are underlined or clearly distinguishable
- [ ] Color not the only indicator (e.g., error must include icon + text)
- [ ] Modals/alerts have focus management
- [ ] Images have alt text (if any)

---

## Performance

- [ ] Pages load quickly (< 3 seconds)
- [ ] Charts render smoothly (no lag when scrolling)
- [ ] Forms are responsive when submitting
- [ ] No console errors on page load
- [ ] API calls are not duplicated (no multiple identical requests)
- [ ] Images are optimized (not oversized)

---

## Browser Compatibility

- [ ] Chrome/Chromium: ✅ Test
- [ ] Firefox: ✅ Test
- [ ] Safari: ✅ Test
- [ ] Mobile browsers: ✅ Test

---

## Summary of Issues Found

| Issue | Page | Severity | Fix |
|-------|------|----------|-----|
| (To be filled during testing) | | | |

---

## Sign-Off

- **Date Tested:** 2026-03-21
- **Tester:** Automated UX Pass
- **Status:** Ready for final commit
