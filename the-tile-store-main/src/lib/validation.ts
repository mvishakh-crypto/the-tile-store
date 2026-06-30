// ============================================================
// Validation — Zod schemas for all form inputs
// ============================================================
import { z } from 'zod';

// Phone number validation (Indian format)
const phoneSchema = z
  .string()
  .min(10, 'Phone number must be at least 10 digits')
  .max(15, 'Phone number is too long')
  .regex(/^[\d\s\+\-\(\)]+$/, 'Invalid phone number format');

// ============================================================
// INQUIRY FORM
// ============================================================
export const inquirySchema = z.object({
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name is too long')
    .trim(),
  email: z
    .string()
    .email('Please enter a valid email address')
    .max(255, 'Email is too long')
    .trim()
    .toLowerCase(),
  phone: phoneSchema,
  company: z
    .string()
    .max(150, 'Company name is too long')
    .optional()
    .or(z.literal('')),
  projectType: z
    .enum([
      'Residential Villa',
      'Apartment',
      'Commercial Office',
      'Hotel / Hospitality',
      'Retail Space',
      'Healthcare',
      'Educational',
      'Other',
    ])
    .optional(),
  message: z
    .string()
    .max(1000, 'Message is too long')
    .optional()
    .or(z.literal('')),
});

export type InquiryFormData = z.infer<typeof inquirySchema>;

// ============================================================
// BOOKING FORM
// ============================================================
export const bookingSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100).trim(),
  email: z.string().email('Invalid email address').max(255).trim().toLowerCase(),
  phone: phoneSchema,
  date: z.string().min(1, 'Please select a date'),
  time: z.string().min(1, 'Please select a time slot'),
  projectType: z
    .enum([
      'Home Interior',
      'Commercial Project',
      'Architect / Designer',
      'Builder / Developer',
      'Sample Request',
      'Other',
    ])
    .optional(),
  location: z.string().max(200).optional().or(z.literal('')),
  budgetRange: z
    .enum([
      'Under ₹50/sqft',
      '₹50–₹150/sqft',
      '₹150–₹300/sqft',
      '₹300–₹500/sqft',
      '₹500+/sqft',
      'Not sure yet',
    ])
    .optional(),
  notes: z.string().max(500).optional().or(z.literal('')),
});

export type BookingFormData = z.infer<typeof bookingSchema>;

// ============================================================
// PARTNER APPLICATIONS
// ============================================================
export const architectApplicationSchema = z.object({
  name: z.string().min(2, 'Name required').max(100).trim(),
  email: z.string().email('Invalid email').max(255).trim().toLowerCase(),
  phone: phoneSchema,
  firmName: z.string().min(2, 'Firm name required').max(150).trim(),
  city: z.string().min(2, 'City required').max(100).trim(),
  portfolioUrl: z
    .string()
    .url('Please enter a valid URL')
    .optional()
    .or(z.literal('')),
  projectType: z
    .enum(['Residential', 'Commercial', 'Hospitality', 'Mixed-Use'])
    .optional(),
  annualVolumeSqft: z.string().max(50).optional().or(z.literal('')),
  message: z.string().max(500).optional().or(z.literal('')),
});

export type ArchitectApplicationData = z.infer<typeof architectApplicationSchema>;

export const dealerApplicationSchema = z.object({
  name: z.string().min(2, 'Name required').max(100).trim(),
  email: z.string().email('Invalid email').max(255).trim().toLowerCase(),
  phone: phoneSchema,
  companyName: z.string().min(2, 'Company name required').max(150).trim(),
  city: z.string().min(2, 'City required').max(100).trim(),
  currentBrands: z.string().max(300).optional().or(z.literal('')),
  showroomSize: z.string().max(50).optional().or(z.literal('')),
  message: z.string().max(500).optional().or(z.literal('')),
});

export type DealerApplicationData = z.infer<typeof dealerApplicationSchema>;

// ============================================================
// SEARCH SCHEMA
// ============================================================
export const searchSchema = z.object({
  query: z
    .string()
    .max(200, 'Search query is too long')
    .trim(),
  category: z.string().optional(),
  brand: z.string().optional(),
  color: z.string().optional(),
  style: z.string().optional(),
  finish: z.string().optional(),
  priceCategory: z.enum(['Signature', 'Premium', 'Reserve']).optional(),
});

export type SearchFormData = z.infer<typeof searchSchema>;

// ============================================================
// CONTACT / NEWSLETTER
// ============================================================
export const contactSchema = z.object({
  name: z.string().min(2).max(100).trim(),
  email: z.string().email().max(255).trim().toLowerCase(),
  subject: z.string().min(3).max(200).trim(),
  message: z.string().min(10, 'Please write a more detailed message').max(2000).trim(),
});

export type ContactFormData = z.infer<typeof contactSchema>;

export const newsletterSchema = z.object({
  email: z.string().email('Please enter a valid email address').max(255).trim().toLowerCase(),
});

export type NewsletterFormData = z.infer<typeof newsletterSchema>;

// ============================================================
// RATE LIMITING
// ============================================================
interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();

/**
 * Check if a rate limit has been exceeded.
 * @param key Unique identifier for the rate limit (e.g., 'inquiry-submit', 'search')
 * @param maxRequests Maximum requests allowed
 * @param windowMs Time window in milliseconds
 */
export function checkRateLimit(
  key: string,
  maxRequests: number,
  windowMs: number
): { allowed: boolean; remaining: number; resetIn: number } {
  const now = Date.now();
  const entry = rateLimitStore.get(key);

  if (!entry || now > entry.resetAt) {
    // New window
    rateLimitStore.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: maxRequests - 1, resetIn: windowMs };
  }

  if (entry.count >= maxRequests) {
    return {
      allowed: false,
      remaining: 0,
      resetIn: entry.resetAt - now,
    };
  }

  entry.count += 1;
  return {
    allowed: true,
    remaining: maxRequests - entry.count,
    resetIn: entry.resetAt - now,
  };
}

/**
 * Rate limit presets for common operations.
 */
export const RATE_LIMITS = {
  INQUIRY_SUBMIT: { key: 'inquiry-submit', max: 3, windowMs: 60_000 },    // 3 per minute
  BOOKING_SUBMIT: { key: 'booking-submit', max: 2, windowMs: 60_000 },    // 2 per minute
  SEARCH: { key: 'search', max: 30, windowMs: 60_000 },                   // 30 per minute
  AI_IMAGE_SEARCH: { key: 'ai-image-search', max: 5, windowMs: 60_000 },  // 5 per minute
  PARTNER_APPLY: { key: 'partner-apply', max: 1, windowMs: 300_000 },     // 1 per 5 minutes
} as const;

// ============================================================
// IMAGE UPLOAD VALIDATION
// ============================================================
export const imageUploadSchema = z.object({
  name: z.string().min(1, 'Filename required').max(255),
  type: z.enum(['image/jpeg', 'image/png', 'image/webp', 'image/avif']).refine(
    (v) => ['image/jpeg', 'image/png', 'image/webp', 'image/avif'].includes(v),
    { message: 'Only JPEG, PNG, WebP, or AVIF images are allowed' }
  ),
  size: z
    .number()
    .max(10 * 1024 * 1024, 'Image must be under 10MB'),
});


export type ImageUploadData = z.infer<typeof imageUploadSchema>;

/**
 * Validate an image File before uploading.
 */
export function validateImageFile(file: File): { valid: boolean; error?: string } {
  const result = imageUploadSchema.safeParse({
    name: file.name,
    type: file.type,
    size: file.size,
  });

  if (!result.success) {
    return { valid: false, error: result.error.issues[0]?.message };
  }
  return { valid: true };
}

// ============================================================
// INPUT SANITIZATION
// ============================================================

/**
 * Strip HTML tags and trim whitespace. Use for user-facing text inputs.
 */
export function sanitizeText(input: string): string {
  return input
    .replace(/<[^>]*>/g, '')          // Remove HTML tags
    .replace(/[<>'"]/g, '')            // Remove dangerous chars
    .trim()
    .substring(0, 2000);              // Hard length cap
}

/**
 * Sanitize and validate a search query.
 */
export function sanitizeSearchQuery(query: string): string {
  return query
    .replace(/[<>'"\\;]/g, '')        // Remove injection chars
    .trim()
    .substring(0, 200);               // Max search length
}

