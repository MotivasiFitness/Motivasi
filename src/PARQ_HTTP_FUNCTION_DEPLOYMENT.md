# PAR-Q HTTP Function Deployment Guide

## Problem
The PAR-Q form submission is failing with "endpoint not returning JSON" because the request to `/_functions(-dev)/parq` is receiving HTML instead of JSON. This means the Wix HTTP function is not properly deployed.

## Solution
Deploy the PAR-Q endpoint as a real Wix HTTP Function in the Wix Editor.

---

## Step-by-Step Deployment Instructions

### Step 1: Open Wix Editor
1. Go to https://manage.wix.com
2. Select your site
3. Click "Edit Site" to open the Wix Editor

### Step 2: Enable Dev Mode
1. In the Wix Editor, click **"Dev Mode"** in the top menu
2. If prompted, enable Dev Mode for your site

### Step 3: Create HTTP Functions File
1. In the left sidebar, you should see a **"Backend"** section
2. If you don't see a `backend` folder, create it:
   - Right-click in the file tree
   - Select "New Folder"
   - Name it "backend"
3. Inside the `backend` folder, create a new file:
   - Right-click on the `backend` folder
   - Select "New File"
   - Name it **`http-functions.js`** (EXACTLY this name)
   - **CRITICAL**: The path MUST be `backend/http-functions.js` (not in any subfolder)

### Step 4: Copy the HTTP Functions Code
1. Open the file `/src/wix-verticals/backend/http-functions-consolidated.js` in this project
2. Copy the ENTIRE contents of that file
3. Paste it into the `backend/http-functions.js` file in the Wix Editor
4. Save the file (Ctrl+S or Cmd+S)

### Step 5: Publish Your Site
1. Click the **"Publish"** button in the top-right corner of the Wix Editor
2. Wait for the publish process to complete

---

## Verification Steps

After publishing, you MUST verify that the endpoints are working correctly.

### Test in Preview Mode (Dev Environment)

Open these URLs in your browser (replace `yoursite` with your actual site name):

1. **Health Check (GET)**:
   ```
   https://yoursite.wixsite.com/yoursite/_functions-dev/health
   ```
   
   **Expected Response** (JSON):
   ```json
   {
     "success": true,
     "statusCode": 200,
     "status": "healthy",
     "timestamp": "2026-01-18T...",
     "environment": "preview",
     "endpoints": {
       "health": "/_functions/health",
       "parq": "/_functions/parq",
       ...
     }
   }
   ```

2. **PAR-Q Endpoint (GET - should return 405)**:
   ```
   https://yoursite.wixsite.com/yoursite/_functions-dev/parq
   ```
   
   **Expected Response** (JSON):
   ```json
   {
     "success": false,
     "statusCode": 405,
     "error": "Method Not Allowed. Use POST to submit PAR-Q data.",
     "allowedMethods": ["POST", "OPTIONS"]
   }
   ```

### Test on Live Site (Production Environment)

Open these URLs in your browser (replace `yoursite.com` with your actual domain):

1. **Health Check (GET)**:
   ```
   https://yoursite.com/_functions/health
   ```
   
   **Expected Response** (JSON):
   ```json
   {
     "success": true,
     "statusCode": 200,
     "status": "healthy",
     "timestamp": "2026-01-18T...",
     "environment": "production",
     "endpoints": {
       "health": "/_functions/health",
       "parq": "/_functions/parq",
       ...
     }
   }
   ```

2. **PAR-Q Endpoint (GET - should return 405)**:
   ```
   https://yoursite.com/_functions/parq
   ```
   
   **Expected Response** (JSON):
   ```json
   {
     "success": false,
     "statusCode": 405,
     "error": "Method Not Allowed. Use POST to submit PAR-Q data.",
     "allowedMethods": ["POST", "OPTIONS"]
   }
   ```

### ⚠️ CRITICAL: What to Look For

**✅ SUCCESS**: You see JSON responses like the examples above

**❌ FAILURE**: You see:
- HTML page (the homepage or 404 page)
- "Cannot GET /_functions/parq" error
- Blank page
- Any non-JSON response

If you see any of the failure cases, the HTTP function is NOT properly deployed.

---

## Troubleshooting

### Issue: Endpoints Return HTML Instead of JSON

**Cause**: The HTTP function file is not in the correct location or not properly deployed.

**Solutions**:
1. Verify the file is at `backend/http-functions.js` (not in a subfolder)
2. Make sure the file name is EXACTLY `http-functions.js` (not `http-functions.ts` or any other name)
3. Re-publish your site
4. Clear your browser cache and try again
5. Wait 2-3 minutes after publishing for changes to propagate

### Issue: "Cannot GET /_functions/parq" Error

**Cause**: The function exports are not correct.

**Solutions**:
1. Verify you copied the ENTIRE contents of `http-functions-consolidated.js`
2. Check that the exports are present:
   - `export async function get_health(request)`
   - `export async function post_parq(request)`
   - `export async function get_parq(request)`
   - `export async function options_parq(request)`
3. Save and re-publish

### Issue: CORS Errors in Browser Console

**Cause**: OPTIONS preflight handler is missing.

**Solutions**:
1. Verify the `options_parq` function is exported
2. Check that CORS headers are set correctly
3. Re-publish your site

### Issue: "Collection not found" Error

**Cause**: The ParqSubmissions collection doesn't exist or has incorrect permissions.

**Solutions**:
1. Go to Wix Editor → Database (CMS)
2. Verify the `ParqSubmissions` collection exists
3. Check collection permissions:
   - Read: Anyone
   - Create: Anyone (or Site Member)
   - Update: Admin
   - Delete: Admin
4. Verify these fields exist:
   - `firstName` (Text)
   - `lastName` (Text)
   - `email` (Email)
   - `clientName` (Text)
   - `dateOfBirth` (Date)
   - `hasHeartCondition` (Boolean)
   - `currentlyTakingMedication` (Boolean)

---

## Testing the PAR-Q Form Submission

Once the endpoints are verified and returning JSON:

1. Go to your site's PAR-Q page: `/parq`
2. Fill out the form with test data
3. Submit the form
4. Check for success message
5. Verify the submission in Wix CMS:
   - Go to Wix Editor → Database (CMS)
   - Open the `ParqSubmissions` collection
   - You should see the new submission

---

## What the HTTP Function Does

The `post_parq` function:

1. **Receives** the form data via POST request
2. **Validates** required fields (firstName, lastName, email)
3. **Validates** email format
4. **Prepares** the data for the ParqSubmissions collection
5. **Inserts** the data using `wixData.insert('ParqSubmissions', submissionData)`
6. **Returns** JSON response with success status and submission ID
7. **Triggers** Wix Automations (if configured) for email notifications

---

## Next Steps After Deployment

1. ✅ Verify endpoints return JSON (not HTML)
2. ✅ Test PAR-Q form submission
3. ✅ Check CMS for new submissions
4. ✅ Set up Wix Automations for email notifications (optional)
5. ✅ Monitor Wix Logs for any errors

---

## Important Notes

- **File Location**: The file MUST be at `backend/http-functions.js` in the Wix Editor
- **File Name**: The file MUST be named `http-functions.js` (not `.ts` or any other extension)
- **Exports**: All functions MUST be exported with the exact naming convention: `get_functionName`, `post_functionName`, `options_functionName`
- **JSON Responses**: All responses MUST return JSON with `Content-Type: application/json`
- **CORS**: All endpoints MUST include CORS headers for cross-origin requests
- **Environment**: The frontend automatically routes to `/_functions-dev/` in preview and `/_functions/` in production

---

## Support

If you continue to have issues after following this guide:

1. Check the Wix Logs in the Wix Editor (Dev Mode → Logs)
2. Check the browser console for errors
3. Verify the exact URL being called by the frontend
4. Test the endpoints directly in the browser
5. Ensure you've published the site after making changes

---

## Summary Checklist

- [ ] Dev Mode enabled in Wix Editor
- [ ] File created at `backend/http-functions.js`
- [ ] Entire contents of `http-functions-consolidated.js` copied
- [ ] File saved in Wix Editor
- [ ] Site published
- [ ] `/_functions-dev/health` returns JSON (preview)
- [ ] `/_functions-dev/parq` returns JSON 405 error (preview)
- [ ] `/_functions/health` returns JSON (live)
- [ ] `/_functions/parq` returns JSON 405 error (live)
- [ ] PAR-Q form submission works
- [ ] Submission appears in CMS

Once ALL checkboxes are complete, the PAR-Q endpoint is fully deployed and functional.
