/**
 * Email Service for Trainer Portal Notifications
 * Handles sending emails to trainers when clients upload videos
 */

interface EmailPayload {
  to: string;
  subject: string;
  templateId: string;
  variables: Record<string, string>;
}

/**
 * Send email notification to trainer when client uploads video
 * PHASE 3 COMPLIANCE: Minimal email - no health metrics, measurements, or photos
 * Email is notification only; portal contains all details
 */
export async function sendVideoUploadNotification(
  trainerEmail: string,
  trainerName: string,
  clientId: string,
  videoTitle: string,
  videoUrl: string,
  exerciseCategory?: string
): Promise<boolean> {
  try {
    const submittedDate = new Date().toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    const response = await fetch('https://formspree.io/f/xyzpqrst', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        _subject: 'New video submitted for review',
        _replyto: trainerEmail,
        message: `Hi ${trainerName},

A client has submitted a new exercise video for your review.

Exercise: ${videoTitle}
Category: ${exerciseCategory || 'General'}
Submitted: ${submittedDate}

Please log in to your Trainer Portal to review the video and provide feedback.

---
This is a notification email. All details are available in your Trainer Portal.
        `,
        trainer_name: trainerName,
        video_title: videoTitle,
        exercise_category: exerciseCategory || 'General',
      })
    });

    return response.ok;
  } catch (error) {
    console.error('Error sending video upload notification:', error);
    return false;
  }
}

/**
 * Send email notification to trainer when client submits progress check-in
 */
export async function sendProgressCheckInNotification(
  trainerEmail: string,
  trainerName: string,
  clientId: string,
  checkInDate: string
): Promise<boolean> {
  try {
    const response = await fetch('https://formspree.io/f/xyzpqrst', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        _subject: `Progress Check-In Submitted`,
        _replyto: trainerEmail,
        message: `
A client has submitted a new progress check-in.

Client ID: ${clientId}
Check-In Date: ${checkInDate}

Please log in to your Trainer Hub to review the progress update.
        `,
        trainer_name: trainerName,
        client_id: clientId,
        checkin_date: checkInDate,
      })
    });

    return response.ok;
  } catch (error) {
    console.error('Error sending progress check-in notification:', error);
    return false;
  }
}

/**
 * Send email notification to client when trainer replies to message
 */
export async function sendTrainerReplyNotification(
  clientEmail: string,
  clientName: string,
  trainerName: string,
  messagePreview: string
): Promise<boolean> {
  try {
    const response = await fetch('https://formspree.io/f/xyzpqrst', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        _subject: `New Message from ${trainerName}`,
        _replyto: clientEmail,
        message: `
Hi ${clientName},

${trainerName} has sent you a new message:

"${messagePreview}"

Please log in to your Client Portal to read the full message and reply.
        `,
        client_name: clientName,
        trainer_name: trainerName,
        message_preview: messagePreview,
      })
    });

    return response.ok;
  } catch (error) {
    console.error('Error sending trainer reply notification:', error);
    return false;
  }
}

/**
 * Send email notification to trainer when client sends message
 */
export async function sendClientMessageNotification(
  trainerEmail: string,
  trainerName: string,
  clientId: string,
  messagePreview: string
): Promise<boolean> {
  try {
    const response = await fetch('https://formspree.io/f/xyzpqrst', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        _subject: `New Message from Client`,
        _replyto: trainerEmail,
        message: `
Hi ${trainerName},

A client has sent you a new message:

"${messagePreview}"

Please log in to your Trainer Hub to read the full message and reply.
        `,
        trainer_name: trainerName,
        client_id: clientId,
        message_preview: messagePreview,
      })
    });

    return response.ok;
  } catch (error) {
    console.error('Error sending client message notification:', error);
    return false;
  }
}

/**
 * Send email notification when contact form is submitted
 */
export async function sendContactFormNotification(
  fullName: string,
  email: string,
  message: string,
  healthDataConsent: boolean,
  marketingConsent: boolean,
  source: string
): Promise<boolean> {
  try {
    const submittedDate = new Date().toLocaleString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    const response = await fetch('https://formspree.io/f/xyzpqrst', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        _subject: `New Contact Form Submission - ${source}`,
        _replyto: email,
        _to: 'hello@motivasi.co.uk',
        message: `
New Contact Form Submission

Name: ${fullName}
Email: ${email}
Source: ${source}
Submitted: ${submittedDate}

Message:
${message}

Consent Information:
- Health Data Consent: ${healthDataConsent ? 'Yes' : 'No'}
- Marketing Consent: ${marketingConsent ? 'Yes' : 'No'}

---
This form submission has been saved to the CMS database.
        `,
        full_name: fullName,
        email: email,
        user_message: message,
        health_data_consent: healthDataConsent,
        marketing_consent: marketingConsent,
        source: source,
        submitted_date: submittedDate,
      })
    });

    return response.ok;
  } catch (error) {
    console.error('Error sending contact form notification:', error);
    return false;
  }
}

/**
 * Send email notification when someone subscribes to newsletter
 * Sends notification to hello@motivasi.co.uk about new subscriber
 */
export async function sendNewsletterSubscriptionNotification(
  subscriberEmail: string
): Promise<boolean> {
  try {
    const submittedDate = new Date().toLocaleString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    // IMPORTANT: Replace 'xyzpqrst' with your actual Formspree form ID
    // Get your form ID from https://formspree.io/forms after creating an account
    const response = await fetch('https://formspree.io/f/xyzpqrst', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        _subject: '🎉 New Newsletter Subscription - Motivasi',
        _replyto: subscriberEmail,
        _to: 'hello@motivasi.co.uk',
        message: `
🎉 NEW NEWSLETTER SUBSCRIPTION

A new client has signed up to your newsletter!

📧 Email: ${subscriberEmail}
📅 Subscribed: ${submittedDate}

---
This subscriber will now receive your weekly tips and updates.
You can add them to your email marketing platform.
        `,
        subscriber_email: subscriberEmail,
        submitted_date: submittedDate,
      })
    });

    return response.ok;
  } catch (error) {
    console.error('Error sending newsletter subscription notification:', error);
    return false;
  }
}

/**
 * Send email notification when PAR-Q form is submitted
 */
export async function sendParQSubmissionNotification(
  firstName: string,
  lastName: string,
  email: string,
  formData: string
): Promise<boolean> {
  try {
    const submittedDate = new Date().toLocaleString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    const response = await fetch('https://formspree.io/f/xyzpqrst', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        _subject: `New PAR-Q Submission - ${firstName} ${lastName}`,
        _replyto: email,
        _to: 'hello@motivasi.co.uk',
        message: `
New PAR-Q & Health Questionnaire Submission

Name: ${firstName} ${lastName}
Email: ${email}
Submitted: ${submittedDate}

${formData}

---
This PAR-Q submission has been saved to the CMS database.
        `,
        first_name: firstName,
        last_name: lastName,
        email: email,
        form_data: formData,
        submitted_date: submittedDate,
      })
    });

    return response.ok;
  } catch (error) {
    console.error('Error sending PAR-Q submission notification:', error);
    return false;
  }
}
