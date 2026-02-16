

## Organizer Pending Submissions with Image Preview + AI Confidence Gate

### 1. Restore Pending Submissions on Organizer Dashboard (with image preview)

**File: `src/components/dashboard/OrganizerDashboard.tsx`**

- Add a "Pending Reviews" stat card, changing the stats grid from 2 columns to 3
- Fetch all pending activities in the `useEffect` (same pattern as `AdminDashboard.tsx`)
- Look up submitter names from the `profiles` table
- Add `handleApprove` (using existing `approve_activity` RPC) and `handleReject` functions
- Render a "Pending Activities" card section with each submission showing:
  - Activity type label and submitter name/date
  - Clickable image thumbnail (using the `image_url` field from the activity)
  - A Dialog that opens the full-size image when the thumbnail is clicked
  - Approve and Reject buttons
- New imports: `CheckCircle2`, `XCircle`, `ClipboardCheck`, `Dialog`/`DialogContent`/`DialogTrigger`, `toast` from sonner

### 2. Add Image Preview to Admin Dashboard

**File: `src/components/dashboard/AdminDashboard.tsx`**

- Add the same clickable thumbnail + Dialog full-size preview to each pending activity card
- Import `Dialog`, `DialogContent`, `DialogTrigger`, and `DialogTitle` components

### 3. Block Submission When AI Confidence is Below 50%

**File: `src/pages/SubmitActivity.tsx`**

- Add a computed flag: `const verificationBlocked = verificationResult && verificationResult.confidence > 0 && verificationResult.confidence < 0.5;`
- Add `verificationBlocked` to the Submit button's `disabled` condition
- Update the mismatch alert text (when `!match` or low confidence) to tell the user they must upload a different photo
- Remove the "You can still submit" messaging when confidence is below 50%

### Summary

| Change | File | What happens |
|--------|------|-------------|
| Pending submissions + image preview | `OrganizerDashboard.tsx` | Organizers see pending activities with photo thumbnails, can click to enlarge, and approve/reject |
| Image preview on admin | `AdminDashboard.tsx` | Same thumbnail + dialog preview added to existing pending activities section |
| AI confidence gate | `SubmitActivity.tsx` | Submit button disabled when AI confidence is above 0 but below 50%; user must re-upload |

No database or edge function changes needed. Three files modified total.

