

## Restrict Activity Moderation to Super Admin Only

Currently, the Organizer dashboard shows **all** pending activities platform-wide with approve/reject controls. This is a privilege that should belong exclusively to the Super Admin. Organizers should focus on managing their own events, not moderating activity submissions from across the platform.

### What will change

**Organizer Dashboard (`OrganizerDashboard.tsx`)**
- Remove the entire "Pending Activities" section (the card with approve/reject buttons)
- Remove the "Pending Reviews" stat card from the top stats row
- Adjust the stats grid from 3 columns to 2 columns (keeping "My Events" and "Total Participants")
- Remove the `handleApprove`, `handleReject` functions and related imports (`CheckCircle2`, `XCircle`, `ClipboardCheck`)
- Remove the pending activities data fetching logic from the `useEffect`

**Admin Dashboard (`AdminDashboard.tsx`)** -- No changes needed. It already has the global pending activities view, which is correct for the Super Admin role.

**RLS Policies** -- No database changes needed. The existing RLS policies already allow both roles to read activities; this change simply removes the UI for organizers. The backend policies can remain as-is since they don't cause a security issue (organizers just won't have the UI to act on them from the dashboard).

### Summary

| Dashboard | Before | After |
|-----------|--------|-------|
| Organizer | Events + Pending Activities + Participants | Events + Participants only |
| Admin | Full platform stats + Pending Activities | No change |

Only one file needs to be modified: `src/components/dashboard/OrganizerDashboard.tsx`.

