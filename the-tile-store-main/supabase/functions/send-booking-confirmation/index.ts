// ============================================================
// Edge Function: send-booking-confirmation
// Sends luxury booking confirmation email via Resend
// Deploy: supabase functions deploy send-booking-confirmation
// ============================================================
import { serve } from 'https://deno.land/std@0.208.0/http/server.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

interface BookingEmailBody {
  bookingId: string;
  name: string;
  email: string;
  phone: string;
  date: string;
  time: string;
  projectType?: string;
  location?: string;
  budgetRange?: string;
  notes?: string;
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const body: BookingEmailBody = await req.json();
    const { bookingId, name, email, phone, date, time, projectType, location, budgetRange, notes } = body;

    const formattedDate = new Date(date).toLocaleDateString('en-IN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    const emailHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Consultation Confirmed — The Tile Store</title>
</head>
<body style="font-family: 'Georgia', serif; background: #FCFBF8; margin: 0; padding: 0;">
  <div style="max-width: 600px; margin: 0 auto; background: #fff;">
    <!-- Header -->
    <div style="background: #1a1a1a; padding: 32px 40px; text-align: center;">
      <p style="color: #9b7e42; font-family: monospace; font-size: 10px; letter-spacing: 0.4em; text-transform: uppercase; margin: 0 0 8px;">
        SURFACES & INTERIORS ARCHIVE
      </p>
      <h1 style="color: #FCFBF8; font-size: 24px; letter-spacing: 0.3em; margin: 0; text-transform: uppercase;">
        The Tile Store
      </h1>
    </div>

    <!-- Gold Divider -->
    <div style="height: 3px; background: linear-gradient(to right, #9b7e42, #c9a84c, #9b7e42);"></div>

    <!-- Body -->
    <div style="padding: 40px;">
      <h2 style="color: #1a1a1a; font-size: 20px; font-weight: 400; letter-spacing: 0.1em; margin-top: 0; text-transform: uppercase;">
        Consultation Confirmed
      </h2>

      <p style="color: #555; font-size: 15px; line-height: 1.7;">
        Dear ${name},
      </p>
      <p style="color: #555; font-size: 15px; line-height: 1.7;">
        Your private consultation with our atelier team has been confirmed. Please find your appointment details below.
      </p>

      <!-- Booking Details -->
      <div style="background: #1a1a1a; color: #FCFBF8; padding: 24px 28px; margin: 24px 0; border-left: 3px solid #9b7e42;">
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="color: #9b7e42; font-size: 11px; text-transform: uppercase; letter-spacing: 0.2em; padding: 6px 0; width: 40%;">Date</td>
            <td style="color: #FCFBF8; font-size: 15px; padding: 6px 0;">${formattedDate}</td>
          </tr>
          <tr>
            <td style="color: #9b7e42; font-size: 11px; text-transform: uppercase; letter-spacing: 0.2em; padding: 6px 0;">Time</td>
            <td style="color: #FCFBF8; font-size: 15px; padding: 6px 0;">${time}</td>
          </tr>
          <tr>
            <td style="color: #9b7e42; font-size: 11px; text-transform: uppercase; letter-spacing: 0.2em; padding: 6px 0;">Contact</td>
            <td style="color: #FCFBF8; font-size: 15px; padding: 6px 0;">${phone}</td>
          </tr>
          ${projectType ? `
          <tr>
            <td style="color: #9b7e42; font-size: 11px; text-transform: uppercase; letter-spacing: 0.2em; padding: 6px 0;">Project</td>
            <td style="color: #FCFBF8; font-size: 15px; padding: 6px 0;">${projectType}</td>
          </tr>` : ''}
          ${location ? `
          <tr>
            <td style="color: #9b7e42; font-size: 11px; text-transform: uppercase; letter-spacing: 0.2em; padding: 6px 0;">Location</td>
            <td style="color: #FCFBF8; font-size: 15px; padding: 6px 0;">${location}</td>
          </tr>` : ''}
          ${budgetRange ? `
          <tr>
            <td style="color: #9b7e42; font-size: 11px; text-transform: uppercase; letter-spacing: 0.2em; padding: 6px 0;">Budget</td>
            <td style="color: #FCFBF8; font-size: 15px; padding: 6px 0;">${budgetRange}</td>
          </tr>` : ''}
        </table>
      </div>

      <p style="color: #888; font-size: 12px; font-family: monospace; letter-spacing: 0.1em; margin: 0 0 8px;">
        REFERENCE: ${bookingId.toUpperCase().slice(0, 8)}
      </p>

      ${notes ? `
      <div style="border: 1px solid #e8e0d0; padding: 16px 20px; margin: 16px 0;">
        <p style="margin: 0 0 4px; color: #888; font-size: 11px; text-transform: uppercase; letter-spacing: 0.1em;">Your Notes</p>
        <p style="margin: 0; color: #333; font-size: 14px; line-height: 1.6;">${notes}</p>
      </div>` : ''}

      <p style="color: #555; font-size: 14px; line-height: 1.7; margin-top: 24px;">
        Our design consultant will call you at the scheduled time. If you need to reschedule, please contact us at least 2 hours before your appointment.
      </p>

      <p style="color: #555; font-size: 14px; line-height: 1.7;">
        WhatsApp: <strong style="color: #1a1a1a;">+91 98765 43210</strong><br>
        Email: <strong style="color: #1a1a1a;">consult@thetilestore.com</strong>
      </p>
    </div>

    <!-- Footer -->
    <div style="background: #1a1a1a; padding: 24px 40px; text-align: center;">
      <p style="color: #9b7e42; font-size: 10px; letter-spacing: 0.3em; text-transform: uppercase; margin: 0 0 4px;">
        The Tile Store
      </p>
      <p style="color: #444; font-size: 10px; margin: 0; letter-spacing: 0.1em;">
        Kochi, Kerala, India · Premium Luxury Surfaces & Interiors
      </p>
    </div>
  </div>
</body>
</html>`;

    const resendApiKey = Deno.env.get('RESEND_API_KEY');
    const fromEmail = Deno.env.get('FROM_EMAIL') || 'noreply@thetilestore.com';
    const notifyEmail = Deno.env.get('NOTIFY_EMAIL') || 'consult@thetilestore.com';

    if (resendApiKey) {
      // Customer confirmation
      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${resendApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: `The Tile Store <${fromEmail}>`,
          to: [email],
          subject: `Consultation Confirmed — ${formattedDate} at ${time}`,
          html: emailHtml,
        }),
      });

      // Internal notification
      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${resendApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: `The Tile Store System <${fromEmail}>`,
          to: [notifyEmail],
          subject: `📅 New Booking — ${name} on ${formattedDate} at ${time}`,
          html: emailHtml,
        }),
      });
    } else {
      console.info('[send-booking-confirmation] No Resend key. Would email:', email);
    }

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (err) {
    console.error('[send-booking-confirmation]', err);
    return new Response(
      JSON.stringify({ error: 'Failed to send confirmation' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
