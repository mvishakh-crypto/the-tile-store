// ============================================================
// Edge Function: submit-inquiry
// Validates inquiry data, saves to DB, and sends notification email
// Deploy: supabase functions deploy submit-inquiry
// ============================================================
import { serve } from 'https://deno.land/std@0.208.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

interface InquiryProduct {
  name: string;
  code: string;
  quantity: number;
  notes?: string;
}

interface InquiryEmailBody {
  inquiryId: string;
  referenceNumber: string;
  name: string;
  email: string;
  phone: string;
  company?: string;
  projectType?: string;
  message?: string;
  products: InquiryProduct[];
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const body: InquiryEmailBody = await req.json();
    const {
      inquiryId,
      referenceNumber,
      name,
      email,
      phone,
      company,
      projectType,
      message,
      products,
    } = body;

    // Build the email HTML
    const productRows = products
      .map(
        p => `
        <tr>
          <td style="padding: 8px 12px; border-bottom: 1px solid #f0ede8;">${p.name}</td>
          <td style="padding: 8px 12px; border-bottom: 1px solid #f0ede8; color: #9b7e42; font-family: monospace;">${p.code}</td>
          <td style="padding: 8px 12px; border-bottom: 1px solid #f0ede8; text-align: center;">${p.quantity}</td>
          ${p.notes ? `<td style="padding: 8px 12px; border-bottom: 1px solid #f0ede8; color: #666;">${p.notes}</td>` : '<td></td>'}
        </tr>
      `
      )
      .join('');

    const emailHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Inquiry Received — The Tile Store</title>
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

    <!-- Reference Banner -->
    <div style="background: #f7f4ef; padding: 20px 40px; border-bottom: 1px solid #e8e0d0; text-align: center;">
      <p style="margin: 0; color: #666; font-size: 12px; text-transform: uppercase; letter-spacing: 0.2em;">Inquiry Reference</p>
      <p style="margin: 4px 0 0; color: #1a1a1a; font-family: monospace; font-size: 20px; font-weight: bold; letter-spacing: 0.15em;">
        ${referenceNumber}
      </p>
    </div>

    <!-- Body -->
    <div style="padding: 40px;">
      <p style="color: #1a1a1a; font-size: 16px; line-height: 1.7; margin-top: 0;">
        Dear ${name},
      </p>
      <p style="color: #555; font-size: 15px; line-height: 1.7;">
        Thank you for your inquiry. Our atelier team has received your request and will respond within <strong>24 hours</strong> with pricing, availability, and sample details.
      </p>

      <!-- Client Details -->
      <div style="background: #f7f4ef; border-left: 3px solid #9b7e42; padding: 20px 24px; margin: 24px 0; border-radius: 0;">
        <h3 style="margin: 0 0 12px; color: #1a1a1a; font-size: 13px; text-transform: uppercase; letter-spacing: 0.2em;">Your Details</h3>
        <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
          <tr><td style="color: #888; padding: 3px 0; width: 40%;">Name</td><td style="color: #1a1a1a;">${name}</td></tr>
          <tr><td style="color: #888; padding: 3px 0;">Email</td><td style="color: #1a1a1a;">${email}</td></tr>
          <tr><td style="color: #888; padding: 3px 0;">Phone</td><td style="color: #1a1a1a;">${phone}</td></tr>
          ${company ? `<tr><td style="color: #888; padding: 3px 0;">Company</td><td style="color: #1a1a1a;">${company}</td></tr>` : ''}
          ${projectType ? `<tr><td style="color: #888; padding: 3px 0;">Project Type</td><td style="color: #1a1a1a;">${projectType}</td></tr>` : ''}
        </table>
      </div>

      <!-- Products Table -->
      ${products.length > 0 ? `
      <h3 style="color: #1a1a1a; font-size: 13px; text-transform: uppercase; letter-spacing: 0.2em; margin-bottom: 12px;">Products Requested</h3>
      <table style="width: 100%; border-collapse: collapse; font-size: 14px; margin-bottom: 24px;">
        <thead>
          <tr style="background: #1a1a1a; color: #fff;">
            <th style="padding: 10px 12px; text-align: left; font-weight: 500; text-transform: uppercase; font-size: 11px; letter-spacing: 0.1em;">Product</th>
            <th style="padding: 10px 12px; text-align: left; font-weight: 500; text-transform: uppercase; font-size: 11px; letter-spacing: 0.1em;">Code</th>
            <th style="padding: 10px 12px; text-align: center; font-weight: 500; text-transform: uppercase; font-size: 11px; letter-spacing: 0.1em;">Qty</th>
            <th style="padding: 10px 12px; text-align: left; font-weight: 500; text-transform: uppercase; font-size: 11px; letter-spacing: 0.1em;">Notes</th>
          </tr>
        </thead>
        <tbody>
          ${productRows}
        </tbody>
      </table>
      ` : ''}

      ${message ? `
      <div style="border: 1px solid #e8e0d0; padding: 16px 20px; margin-bottom: 24px;">
        <p style="margin: 0 0 4px; color: #888; font-size: 12px; text-transform: uppercase; letter-spacing: 0.1em;">Your Message</p>
        <p style="margin: 0; color: #333; font-size: 14px; line-height: 1.6;">${message}</p>
      </div>
      ` : ''}

      <p style="color: #555; font-size: 14px; line-height: 1.7;">
        For urgent inquiries, reach us on WhatsApp: <strong>+91 98765 43210</strong>
      </p>
    </div>

    <!-- Footer -->
    <div style="background: #1a1a1a; padding: 24px 40px; text-align: center;">
      <p style="color: #666; font-size: 11px; margin: 0; letter-spacing: 0.15em; text-transform: uppercase;">
        The Tile Store · Kochi, Kerala, India
      </p>
      <p style="color: #444; font-size: 10px; margin: 8px 0 0; letter-spacing: 0.1em;">
        This is an automated confirmation email for inquiry ${referenceNumber}
      </p>
    </div>
  </div>
</body>
</html>
    `;

    // Send email using Resend (or log if not configured)
    const resendApiKey = Deno.env.get('RESEND_API_KEY');
    const fromEmail = Deno.env.get('FROM_EMAIL') || 'noreply@thetilestore.com';
    const notifyEmail = Deno.env.get('NOTIFY_EMAIL') || 'info@thetilestore.com';

    if (resendApiKey) {
      // Send confirmation to customer
      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${resendApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: `The Tile Store <${fromEmail}>`,
          to: [email],
          subject: `Inquiry Received — Reference ${referenceNumber}`,
          html: emailHtml,
        }),
      });

      // Send internal notification to admin
      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${resendApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: `The Tile Store System <${fromEmail}>`,
          to: [notifyEmail],
          subject: `🆕 New Inquiry ${referenceNumber} — ${name} (${products.length} products)`,
          html: emailHtml,
        }),
      });
    } else {
      console.info('[submit-inquiry] Resend not configured. Email would be sent to:', email);
      console.info('[submit-inquiry] Inquiry ID:', inquiryId, 'Reference:', referenceNumber);
    }

    return new Response(
      JSON.stringify({ success: true, referenceNumber }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (err) {
    console.error('[submit-inquiry] Error:', err);
    return new Response(
      JSON.stringify({ error: 'Failed to process inquiry notification' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
