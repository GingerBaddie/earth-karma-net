

## AI-Powered Image Verification for Activity Submissions

When a volunteer uploads a photo for an activity (e.g., Tree Plantation), the app will use built-in AI to analyze the image and verify it actually shows that type of activity before allowing submission.

### How It Will Work

1. Volunteer selects an activity type (e.g., "Tree Plantation") and uploads a photo
2. The app sends the image to a backend function that uses AI vision to analyze it
3. AI returns whether the image matches the activity type, along with a confidence score
4. If verified, the submit button enables; if not, a warning is shown asking the user to upload a relevant photo

### What Will Be Built

**1. Backend Function (`verify-activity-image`)**
- Receives the uploaded image (as base64) and the selected activity type
- Sends it to Google Gemini (via Lovable AI gateway) with a prompt like: *"Does this image show evidence of [tree plantation / cleanup / recycling / eco habit]? Respond with match (true/false), confidence (0-1), and a short reason."*
- Uses tool calling to get structured output (match, confidence, reason)
- Returns the verification result to the frontend

**2. Frontend Changes (`SubmitActivity.tsx`)**
- After a user selects an image, automatically trigger verification
- Show a loading state: "Verifying image..."
- On success (match = true): show a green checkmark with the AI's reason (e.g., "Image shows tree planting activity")
- On failure (match = false): show a warning with the reason (e.g., "This doesn't appear to be a cleanup activity") and allow re-upload
- Disable the Submit button until verification passes
- Allow submission even if verification fails (with a warning badge), since the admin will do final review

**3. Config Update (`supabase/config.toml`)**
- Register the new `verify-activity-image` edge function

---

### Technical Details

**Edge Function: `supabase/functions/verify-activity-image/index.ts`**
- Uses `LOVABLE_API_KEY` (auto-provisioned, no user setup needed)
- Calls `https://ai.gateway.lovable.dev/v1/chat/completions` with model `google/gemini-3-flash-preview`
- Sends the image as a base64 `image_url` content part alongside a verification prompt
- Uses tool calling to extract structured output: `{ match: boolean, confidence: number, reason: string }`
- Handles 429/402 rate limit errors gracefully

**Frontend Flow in `SubmitActivity.tsx`:**
- New state variables: `verifying`, `verificationResult`
- When image is selected, convert to base64 and call the edge function via `supabase.functions.invoke`
- Display verification status between the photo upload area and the location section
- Re-trigger verification if the user changes the activity type after uploading an image

