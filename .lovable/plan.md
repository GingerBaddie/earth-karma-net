

# Badge & Achievement System + Organizer Application Flow

This plan covers two major features: (1) a comprehensive badge and achievement system with milestone, streak, and community impact badges, and (2) a secure organizer signup/application workflow with admin review.

---

## Feature 1: Badge & Achievement System

### Database Changes

**New tables:**

- `badges` - Defines all available badges
  - `id` (uuid, PK)
  - `name` (text) - e.g. "Tree Planter Pro"
  - `description` (text)
  - `icon` (text) - emoji or icon identifier
  - `category` (enum: `milestone`, `streak`, `community_impact`)
  - `criteria_type` (text) - e.g. "tree_plantation_count", "cleanup_count", "streak_days", "waste_kg"
  - `criteria_value` (integer) - threshold to unlock (e.g. 100 trees, 7-day streak)
  - `created_at` (timestamptz)

- `user_badges` - Tracks which badges each user has earned
  - `id` (uuid, PK)
  - `user_id` (uuid, NOT NULL)
  - `badge_id` (uuid, FK to badges)
  - `unlocked_at` (timestamptz)
  - UNIQUE(user_id, badge_id)

- `user_streaks` - Tracks daily activity streaks per user
  - `id` (uuid, PK)
  - `user_id` (uuid, NOT NULL, UNIQUE)
  - `current_streak` (integer, default 0)
  - `longest_streak` (integer, default 0)
  - `last_activity_date` (date)

**New enum:** `badge_category` = `milestone`, `streak`, `community_impact`

**New database function:** `check_and_award_badges(p_user_id uuid)` - Called after activity approval and event check-in to evaluate all badge criteria and award any newly earned badges. Also updates streak tracking.

**RLS Policies:**
- `badges`: SELECT for all authenticated users
- `user_badges`: SELECT own + INSERT by system (via security definer function)
- `user_streaks`: SELECT own, UPDATE own

**Seed data** (inserted via migration):

Milestone Badges:
- "Tree Planter Pro" - 100 approved tree_plantation activities
- "Cleanup Champion" - 50 approved cleanup activities
- "Recycling Master" - 30 approved recycling activities
- "Eco Habit Guru" - 200 approved eco_habit activities
- "First Steps" - 1 approved activity of any type
- "Getting Started" - 10 approved activities total

Streak Badges:
- "7-Day Eco Warrior" - 7 consecutive days
- "30-Day Consistency" - 30 consecutive days
- "90-Day Legend" - 90 consecutive days

Community Impact Badges:
- "Plastic Eliminator" - 100 kg waste collected
- "Waste Warrior" - 500 kg waste collected
- "Ton Crusher" - 1000 kg waste collected

### Frontend Changes

**New component: `src/components/badges/BadgeCard.tsx`**
- Displays a single badge with icon, name, progress bar, and locked/unlocked state
- Shows a celebratory confetti/sparkle animation on first view of newly unlocked badges

**New component: `src/components/badges/BadgeUnlockAnimation.tsx`**
- Full-screen celebration overlay with confetti particles, scaling badge icon, and congratulatory text
- Triggered when a new badge is detected (comparing previous vs current user_badges)
- Auto-dismisses after 3 seconds or on click

**New component: `src/components/badges/BadgeShowcase.tsx`**
- Grid display of all badges grouped by category (Milestone, Streak, Community Impact)
- Shows progress toward locked badges
- Used in the Volunteer Dashboard

**Update: `src/components/dashboard/VolunteerDashboard.tsx`**
- Add a "Badges & Achievements" section between the rewards and recent activities sections
- Fetch user_badges, badges, and user_streaks data
- Show current streak prominently ("You're on a X-day streak!")
- Display BadgeShowcase component
- Track newly unlocked badges to trigger unlock animation

**Update: `src/pages/Leaderboard.tsx`**
- Show top 3 badges next to each user's name on the leaderboard
- Fetch user_badges for displayed users

**Update: Database functions** (`approve_activity`, `checkin_event`)
- Add call to `check_and_award_badges()` at the end of each function
- Update streak tracking in `check_and_award_badges()`

---

## Feature 2: Organizer Application Flow

### Database Changes

**New enum:** `application_status` = `pending`, `approved`, `rejected`

**New enum:** `organizer_type` = `ngo`, `college_school`, `company_csr`, `community_group`

**New table: `organizer_applications`**
- `id` (uuid, PK)
- `user_id` (uuid, NOT NULL, UNIQUE) - the citizen applying
- `organization_name` (text, NOT NULL)
- `organizer_type` (organizer_type enum, NOT NULL)
- `official_email` (text, NOT NULL)
- `contact_number` (text, NOT NULL)
- `purpose` (text, NOT NULL)
- `proof_url` (text) - uploaded document/image URL
- `proof_type` (text) - "id_card", "ngo_doc", "college_letter", "website_url"
- `website_url` (text) - optional LinkedIn/website
- `status` (application_status, default 'pending')
- `admin_remarks` (text) - remarks left by super admin
- `reviewed_by` (uuid)
- `reviewed_at` (timestamptz)
- `created_at` (timestamptz, default now())

**New storage bucket:** `organizer-proofs` (private, not public)

**RLS Policies:**
- Users can INSERT their own application (user_id = auth.uid())
- Users can SELECT their own application
- Admins can SELECT all, UPDATE all (for review)

**New database function:** `approve_organizer_application(p_application_id uuid, p_remarks text)`
- Security definer, admin-only
- Updates application status to 'approved'
- Updates user_roles to change role from 'citizen' to 'organizer'
- Sets reviewed_by and reviewed_at

**New database function:** `reject_organizer_application(p_application_id uuid, p_remarks text)`
- Security definer, admin-only
- Updates application status to 'rejected'
- Sets admin_remarks, reviewed_by, reviewed_at

### Frontend Changes

**New page: `src/pages/ApplyOrganizer.tsx`**
- Multi-section form with:
  - Organization/Group Name (text input)
  - Organizer Type (radio/select: NGO, College/School, Company CSR, Community Group)
  - Official Email ID (email input)
  - Contact Number (tel input)
  - Short description of purpose (textarea)
  - Proof Upload (file upload - ID card, NGO doc, college letter)
  - Website/LinkedIn URL (optional text input)
- Input validation with zod
- Shows current application status if one already exists (pending/approved/rejected with remarks)
- Only accessible to users with 'citizen' role

**New route in `src/App.tsx`:**
- `/apply-organizer` - protected, citizen only

**Update: `src/components/dashboard/VolunteerDashboard.tsx`**
- Add an "Apply as Organizer" card/button that links to `/apply-organizer`
- If application exists, show its status (pending/approved/rejected)

**Update: `src/pages/SuperAdmin.tsx`**
- Add new tab: "Applications"
- Table showing all organizer applications with:
  - Applicant name, organization, type, status
  - Click to expand: view full details, uploaded proof (with image preview), purpose
  - Approve/Reject buttons with remarks textarea
- After approval, role is upgraded and user gains event creation access

**Update: `src/components/Navbar.tsx`**
- No changes needed (organizer links already conditionally shown based on role)

**Update: `src/pages/Register.tsx`**
- Remove the "Organizer" role selection button from registration
- All new users register as citizens by default
- The organizer path is now exclusively through the application process

---

## Technical Details

### Badge Award Logic (PostgreSQL function)

```text
check_and_award_badges(p_user_id):
  1. Count approved activities by type for user
  2. Get total waste_kg from approved cleanup activities
  3. Get current streak from user_streaks
  4. Update streak: if last_activity_date = yesterday, increment; if today, no change; else reset to 1
  5. Compare counts against all badge criteria
  6. Insert any newly qualifying badges into user_badges
```

### Unlock Animation Flow

```text
1. Dashboard loads -> fetches user_badges
2. Stores badge IDs in localStorage key "seen_badges"
3. Compares fetched badges vs seen_badges
4. Any new badges trigger BadgeUnlockAnimation overlay
5. After animation, updates localStorage
```

### File Structure (new files)

```text
src/components/badges/BadgeCard.tsx
src/components/badges/BadgeShowcase.tsx
src/components/badges/BadgeUnlockAnimation.tsx
src/pages/ApplyOrganizer.tsx
```

### Migration Order

1. Create enums (badge_category, application_status, organizer_type)
2. Create tables (badges, user_badges, user_streaks, organizer_applications)
3. Create storage bucket (organizer-proofs)
4. Set up RLS policies
5. Seed badge data
6. Create/update database functions (check_and_award_badges, approve/reject organizer application, update approve_activity and checkin_event)

