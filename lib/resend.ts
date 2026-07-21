// lib/resend.ts
// Resend email client singleton + typed email senders

import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM_EMAIL = process.env.RESEND_FROM_EMAIL ?? "noreply@yelpindia.com";
const FROM_NAME  = "YelpIndia";

// ── Welcome Email ─────────────────────────────────────────────────────────

export async function sendWelcomeEmail({
  to,
  name,
}: {
  to:   string;
  name: string;
}) {
  if (!process.env.RESEND_API_KEY) return; // silently skip in dev without key

  return resend.emails.send({
    from:    `${FROM_NAME} <${FROM_EMAIL}>`,
    to,
    subject: `Welcome to YelpIndia, ${name}! 🍛`,
    html: `
      <!DOCTYPE html>
      <html>
      <head><meta charset="utf-8" /></head>
      <body style="font-family:system-ui,sans-serif;max-width:600px;margin:0 auto;padding:32px 24px;background:#fff;color:#1d1d1f">
        <div style="text-align:center;margin-bottom:32px">
          <div style="display:inline-flex;align-items:center;gap:8px;background:#dc2626;padding:12px 20px;border-radius:12px">
            <span style="font-size:20px;font-weight:800;color:#fff">Yelp<span style="color:#fca5a5">India</span></span>
          </div>
        </div>
        <h1 style="font-size:24px;font-weight:800;margin:0 0 8px">Welcome, ${name}! 👋</h1>
        <p style="font-size:15px;color:#6b7280;line-height:1.6;margin:0 0 24px">
          You've joined India's fastest-growing restaurant discovery platform. 
          Start exploring top-rated restaurants, writing reviews, and saving your favourite spots.
        </p>
        <div style="background:#fef2f2;border-radius:12px;padding:20px;margin:0 0 24px">
          <h2 style="font-size:16px;font-weight:700;margin:0 0 12px;color:#1d1d1f">🚀 Get Started</h2>
          <ul style="margin:0;padding-left:20px;color:#4b5563;font-size:14px;line-height:2">
            <li>Browse restaurants across 100+ Indian cities</li>
            <li>Write your first review and earn a badge</li>
            <li>Save your favourite restaurants for quick access</li>
            <li>Discover the best biryani, dosas & fine dining near you</li>
          </ul>
        </div>
        <a href="${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/places"
           style="display:inline-block;background:#dc2626;color:#fff;text-decoration:none;padding:14px 28px;border-radius:10px;font-weight:700;font-size:15px">
          Explore Restaurants →
        </a>
        <hr style="margin:32px 0;border:none;border-top:1px solid #e5e7eb" />
        <p style="font-size:12px;color:#9ca3af;text-align:center">
          YelpIndia · India's Restaurant Discovery Platform<br />
          You received this because you signed up at yelpindia.com
        </p>
      </body>
      </html>
    `,
  });
}

// ── Review Notification Email ──────────────────────────────────────────────

export async function sendReviewNotification({
  to,
  authorName,
  placeName,
  rating,
  reviewPreview,
  placeSlug,
}: {
  to:            string;
  authorName:    string;
  placeName:     string;
  rating:        number;
  reviewPreview: string;
  placeSlug:     string;
}) {
  if (!process.env.RESEND_API_KEY) return;

  const stars = "⭐".repeat(rating);

  return resend.emails.send({
    from:    `${FROM_NAME} <${FROM_EMAIL}>`,
    to,
    subject: `New review for ${placeName} ${stars}`,
    html: `
      <!DOCTYPE html>
      <html>
      <body style="font-family:system-ui,sans-serif;max-width:600px;margin:0 auto;padding:32px 24px;background:#fff;color:#1d1d1f">
        <h1 style="font-size:20px;font-weight:800">New Review on YelpIndia</h1>
        <p style="color:#6b7280"><strong>${authorName}</strong> reviewed <strong>${placeName}</strong></p>
        <div style="background:#f9fafb;border-left:4px solid #dc2626;padding:16px;border-radius:0 8px 8px 0;margin:16px 0">
          <p style="margin:0 0 8px;font-size:18px">${stars}</p>
          <p style="margin:0;color:#374151;font-style:italic">"${reviewPreview}"</p>
        </div>
        <a href="${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/places/${placeSlug}"
           style="display:inline-block;background:#dc2626;color:#fff;text-decoration:none;padding:12px 24px;border-radius:8px;font-weight:700">
          View Full Review
        </a>
      </body>
      </html>
    `,
  });
}

export default resend;
