

## Role-Based Dashboard Pages

Currently, all users (volunteers, organizers, and admins) land on the same `/dashboard` page, which shows volunteer-centric content: personal points, rewards progress, activity charts, and check-in history. Organizers and admins already have separate pages (`/admin` and `/super-admin`), but the main dashboard doesn't reflect their role.

### What will change

The `/dashboard` route will render different content based on the user's role:

**Volunteers (citizens)** -- Keep the current dashboard exactly as-is. This is their primary view showing personal stats, rewards, activity history, and charts.

**Organizers** -- Instead of the volunteer dashboard, they see:
- A welcome header with their name and "Organizer" badge
- Quick stats: number of events they created, pending activities to review, total participants across their events
- A "Pending Activities" section showing submissions awaiting their review (with approve/reject buttons)
- A "My Events" section listing their events with quick links to create a new one or manage existing ones
- A quick-access button to the full Admin Panel for deeper management

**Admins** -- Instead of the volunteer dashboard, they see:
- A welcome header with "Super Admin" badge
- Platform-wide stats: total users, total events, total activities, total points distributed
- A "Pending Activities" section (all pending, not filtered by event ownership)
- Quick overview of recent events and recent user signups
- Quick-access button to the full Super Admin dashboard

### Technical approach

**File: `src/pages/Dashboard.tsx`**
- Import `useAuth` to get the `role`
- Based on `role`, render one of three sub-components:
  - `VolunteerDashboard` -- the existing dashboard content, extracted into its own component
  - `OrganizerDashboard` -- new component with organizer-specific stats and quick actions
  - `AdminDashboard` -- new component with platform-wide overview

**New files:**
- `src/components/dashboard/VolunteerDashboard.tsx` -- extracted from current Dashboard.tsx (no logic changes)
- `src/components/dashboard/OrganizerDashboard.tsx` -- organizer-specific dashboard view
- `src/components/dashboard/AdminDashboard.tsx` -- admin-specific dashboard view

**No database or routing changes needed.** The `/dashboard` route stays the same; the page just conditionally renders based on role. The existing `/admin` and `/super-admin` pages remain unchanged as the full management views.

### Summary of each dashboard

| Role | Stats shown | Key sections | Links to |
|------|-------------|-------------|----------|
| Citizen | Points, activities, rewards, pending count | Charts, rewards grid, activity history, check-ins | Submit Activity |
| Organizer | My events count, pending reviews, total participants | Pending activities (approve/reject), my events list | Admin Panel, Create Event |
| Admin | Total users, events, activities, points | Pending activities, recent events, recent users | Super Admin |

