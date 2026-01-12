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
 * Uses Formspree as the email backend
 */
export async function sendVideoUploadNotification(
  trainerEmail: string,
  trainerName: string,
  clientId: string,
  videoTitle: string,
  videoUrl: string
): Promise<boolean> {
  try {
    const response = await fetch('https://formspree.io/f/xyzpqrst', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        _subject: `New Video Submission: ${videoTitle}`,
        _replyto: trainerEmail,
        message: `
A client has submitted a new exercise video for review.

Video Title: ${videoTitle}
Client ID: ${clientId}
Video URL: ${videoUrl}

Please log in to your Trainer Hub to review the video and provide feedback.
        `,
        trainer_name: trainerName,
        video_title: videoTitle,
        client_id: clientId,
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
