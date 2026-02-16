

# EcoTrack — Community Environmental Impact Platform

## Overview
A green-themed, nature-inspired platform where citizens participate in environmental activities, earn points, unlock rewards, and compete on leaderboards. Organizers/admins verify activities and manage events.

**Tech:** React + Tailwind (frontend) · Supabase via Lovable Cloud (auth, database, storage, edge functions)

---

## 1. Landing Page
- Hero section with nature imagery, tagline, and CTA buttons (Sign Up / Log In)
- Live counters: trees planted, waste collected, active users
- Feature highlights: how it works (participate → verify → earn → impact)
- Green/earthy color palette with leaf accents throughout

## 2. Authentication
- Supabase Auth with email/password sign-up and login
- Role selection during registration (Citizen or Organizer)
- Roles stored in a separate `user_roles` table (security best practice)
- User profiles table with name and avatar

## 3. Database Schema (Supabase/PostgreSQL)
- **profiles** — name, avatar_url, points, linked to auth.users
- **user_roles** — user_id, role enum (citizen, organizer)
- **activities** — user_id, type (tree_plantation, cleanup, recycling, eco_habit), image_url, latitude, longitude, status (pending/approved/rejected), points_awarded, created_at
- **events** — title, description, location, date, created_by, with event_participants join table
- **rewards** — name, description, points_required, icon
- **user_rewards** — tracks which rewards each user has unlocked
- RLS policies on all tables for proper access control

## 4. Citizen Dashboard
- Points summary card with progress toward next reward
- Earned badges/rewards display
- Recent activity feed with status indicators (pending/approved/rejected)
- Charts: monthly activity breakdown, environmental impact over time (using Recharts)

## 5. Submit Activity Page
- Activity type dropdown (tree plantation, cleanup drive, recycling, eco-friendly habit)
- Image upload (stored in Supabase Storage bucket)
- Auto geo-location capture via browser Geolocation API with map preview
- Submit button with confirmation toast

## 6. Events Page
- List of upcoming events with cards (title, date, location, description)
- "Join Event" button with participant count
- QR code check-in simulation (generate/display QR code for each event)

## 7. Leaderboard Page
- Top contributors ranked by points
- Filter tabs: daily / weekly / monthly / all-time
- User avatar, name, points, and rank badge
- Highlight current user's position

## 8. Admin / Organizer Panel
- **Pending Activities**: review submissions with image, location, user info — approve/reject buttons
- On approval: automatically award points based on activity type (tree: 50pts, cleanup: 30pts, recycling: 20pts, eco habit: 5pts) and unlock rewards if thresholds crossed
- **Event Management**: create, edit, and delete events
- **Analytics Dashboard**: total activities, participation trends, top categories, active users chart

## 9. Point & Reward System
- Automatic point allocation on admin approval via database trigger or edge function
- Point values: Tree plantation (50), Cleanup drive (30), Recycling (20), Eco-friendly habit (5)
- Rewards unlock automatically when point thresholds are crossed
- Visual reward badges displayed on user profile and dashboard

## 10. Image Storage & Geo-location
- Supabase Storage bucket for activity images with proper RLS
- Browser Geolocation API captures lat/lng on activity submission
- Coordinates stored with each activity for verification

