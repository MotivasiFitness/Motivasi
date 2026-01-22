# Email Setup Guide - Formspree Integration

## Problem Identified

All email notifications are failing because the code uses a **placeholder Formspree form ID** (`xyzpqrst`) instead of a real form ID. This affects:

1. **Contact Form Submissions** (BlogPage.tsx) - emails to hello@motivasi.co.uk
2. **PAR-Q Form Submissions** (http-functions-consolidated.js) - emails to hello@motivasi.co.uk
3. **Video Upload Notifications** - emails to trainers
4. **Progress Check-in Notifications** - emails to trainers
5. **Trainer Reply Notifications** - emails to clients
6. **Client Message Notifications** - emails to trainers
7. **Newsletter Subscription Notifications** - emails to hello@motivasi.co.uk

## Solution: Set Up Formspree

### Step 1: Create a Formspree Account
1. Go to https://formspree.io
2. Sign up with your email (hello@motivasi.co.uk)
3. Verify your email

### Step 2: Create a Form
1. In Formspree dashboard, click "Create Form"
2. Give it a name like "Motivasi Notifications"
3. Set the email to: `hello@motivasi.co.uk`
4. You'll get a form ID that looks like: `f/abc123def456`
5. Copy just the ID part: `abc123def456`

### Step 3: Update All Email Functions

Replace all instances of `xyzpqrst` with your actual Formspree ID in these files:

**Files to update:**
- `/src/lib/email-service.ts` (6 functions)
- `/src/wix-verticals/backend/http-functions-consolidated.js` (PAR-Q endpoint)

### Step 4: Test the Setup

1. Submit the contact form on the Blog page
2. Check hello@motivasi.co.uk inbox
3. You should receive an email with the form submission details

## Important Notes

- **Formspree Free Plan**: Allows up to 50 submissions per month
- **Formspree Pro Plan**: Unlimited submissions (recommended for production)
- **Email Format**: Formspree uses `_to`, `_subject`, and `_replyto` fields
- **Custom Fields**: Additional fields like `full_name`, `email`, etc. are optional but helpful for organization

## Current Implementation

All email functions use this pattern:
```javascript
await fetch('https://formspree.io/f/YOUR_FORM_ID', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    _subject: 'Email Subject',
    _replyto: 'sender@email.com',
    _to: 'hello@motivasi.co.uk',
    message: 'Email body content',
    // Custom fields for organization
    full_name: 'Name',
    email: 'email@example.com'
  })
});
```

## Files Affected

1. **Frontend Contact Form** (`/src/components/pages/BlogPage.tsx`)
   - Function: `sendContactFormNotification()`
   - Location: `/src/lib/email-service.ts` line 191

2. **PAR-Q Submissions** (`/src/wix-verticals/backend/http-functions-consolidated.js`)
   - Endpoint: `post_parq()`
   - Location: line 142

3. **Trainer Notifications** (`/src/lib/email-service.ts`)
   - `sendVideoUploadNotification()` - line 35
   - `sendProgressCheckInNotification()` - line 79
   - `sendTrainerReplyNotification()` - line 118
   - `sendClientMessageNotification()` - line 158
   - `sendNewsletterSubscriptionNotification()` - line 270
   - `sendParQSubmissionNotification()` - line 321

## Next Steps

1. Create your Formspree account and form
2. Get your form ID
3. Provide the form ID so I can update all the files
4. Test the contact form submission
5. Verify emails are received at hello@motivasi.co.uk
