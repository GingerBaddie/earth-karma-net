

## Fix: Organizer Event Isolation + New Admin Role

### Problem
Currently, any organizer can see, delete, and show QR codes for events created by other organizers. There is also no separate "administrator" role that can manage all users and events globally.

### Solution Overview

Two main changes:

1. **Organizer event isolation** -- On the Admin Panel, organizers will only see events they created. Delete and QR Code buttons will only appear for their own events.

2. **New Administrator role** -- A new `admin` role will be added to the system. A specific admin account (`admin@ecotrack.com`) will be seeded. The admin gets a dedicated Super Admin page with full visibility into all users (volunteers + organizers), all events, all activities, and detailed analytics.

---

### What Changes

**Database (migration):**
- Add `'admin'` to the `app_role` enum so the role system supports three roles: `citizen`, `organizer`, `admin`
- Update RLS policies on key tables so admins can read all data (profiles, activities, events, user_roles)
- Seed the admin account: create user via edge function, assign `admin` role

**Backend (edge function):**
- Create a `seed-admin` edge function that registers `admin@ecotrack.com` with password `Admin123!` and assigns the `admin` role. This runs once to bootstrap the admin account.

**Frontend changes:**

| File | Change |
|------|--------|
| `Admin.tsx` | Filter the events list to only show events where `created_by === user.id` (organizers only see their own). Admin role sees everything. |
| `EventDetail.tsx` | Only show QR code and organizer controls if the current user created the event OR is an admin. |
| `AuthContext.tsx` | Handle `admin` role alongside `organizer`. |
| `ProtectedRoute.tsx` | Support `requireRole` accepting `"organizer"` or `"admin"`, and allow admin to access organizer routes too. |
| `Navbar.tsx` | Show "Super Admin" link for admin role users. |
| `App.tsx` | Add route `/super-admin` for the new admin dashboard. |
| New: `SuperAdmin.tsx` | Full admin dashboard with tabs: Users (all profiles + roles), Events (all events with management), Activities (all submissions), and Analytics (global stats). |

---

### Detailed Technical Plan

**1. Database Migration**

```sql
-- Add admin to app_role enum
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'admin';

-- Allow admins to read all profiles
CREATE POLICY "Admins can view all profiles"
  ON public.profiles FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

-- Allow admins to read all user_roles
CREATE POLICY "Admins can view all roles"
  ON public.user_roles FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

-- Allow admins to view all activities
CREATE POLICY "Admins can view all activities"
  ON public.activities FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

-- Allow admins to update activities
CREATE POLICY "Admins can update activities"
  ON public.activities FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin'));

-- Allow admins to manage all events (CRUD)
CREATE POLICY "Admins can manage all events"
  ON public.events FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));
```

**2. Seed Admin Edge Function (`seed-admin`)**

- Creates the admin user via Supabase Admin API (`supabase.auth.admin.createUser`)
- Inserts a row in `user_roles` with role `admin`
- Creates the corresponding profile
- Idempotent -- safe to call multiple times

**3. Admin.tsx Changes**

- When fetching events, filter by `created_by === user.id` for organizers
- If the user role is `admin`, show all events (no filter)
- This fixes the core bug

**4. EventDetail.tsx Changes**

- Change `isOrganizer` check to: show organizer controls only if `event.created_by === user.id` OR role is `admin`
- This prevents organizers from seeing QR codes for events they didn't create

**5. New SuperAdmin.tsx Page**

Four tabs:
- **Users**: Table of all users showing name, email (from profile), city, role, points, join date. Search/filter capability.
- **Events**: All events with participant counts, created-by info, delete option
- **Activities**: All activity submissions with status, type, user info
- **Analytics**: Global stats -- total users, total events, total activities by type, points distributed

**6. Navigation and Routing**

- `ProtectedRoute` updated to accept `requireRole: "organizer" | "admin"` and admin can access organizer pages too
- New `/super-admin` route protected with `requireRole="admin"`
- Navbar shows "Super Admin" for admin users, "Admin Panel" for organizers

