// @ts-nocheck
// ============================================================
// Booking Service â€” Consultation booking with DB persistence
// ============================================================
import { supabase, isSupabaseConfigured, handleSupabaseError } from '../lib/supabase';
import { bookingSchema, type BookingFormData } from '../lib/validation';

export interface BookingResult {
  success: boolean;
  bookingId?: string;
  error?: string;
}

export interface TimeSlot {
  time: string;
  available: boolean;
}

const DEFAULT_TIME_SLOTS: TimeSlot[] = [
  { time: '10:00 AM', available: true },
  { time: '11:00 AM', available: true },
  { time: '12:00 PM', available: true },
  { time: '02:00 PM', available: true },
  { time: '03:00 PM', available: true },
  { time: '04:00 PM', available: true },
  { time: '05:00 PM', available: true },
];

/**
 * Create a consultation booking.
 */
export async function createBooking(
  formData: BookingFormData,
  userId?: string | null
): Promise<BookingResult> {
  // Validate with Zod
  const validation = bookingSchema.safeParse(formData);
  if (!validation.success) {
    return {
      success: false,
      error: validation.error.issues[0]?.message || 'Invalid booking data',
    };
  }

  if (!isSupabaseConfigured) {
    const bookingId = `book-${Date.now()}`;
    const newBooking = {
      id: bookingId,
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      booking_date: formData.date,
      booking_time: formData.time,
      project_type: formData.projectType || null,
      location: formData.location || null,
      budget_range: formData.budgetRange || null,
      notes: formData.notes || null,
      status: 'pending',
      created_at: new Date().toISOString(),
    };
    try {
      const stored = localStorage.getItem('tts-local-bookings');
      const bookings = stored ? JSON.parse(stored) : [];
      localStorage.setItem('tts-local-bookings', JSON.stringify([...bookings, newBooking]));
      // Notify admin panel immediately
      window.dispatchEvent(new StorageEvent('storage', {
        key: 'tts-local-bookings',
        newValue: JSON.stringify([...bookings, newBooking]),
        storageArea: localStorage,
      }));
    } catch (e) {}
    console.info('[BookingService] Simulated booking saved:', formData);
    return { success: true, bookingId };
  }

  try {
    const { data, error } = await supabase
      .from('bookings')
      .insert({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        booking_date: formData.date,
        booking_time: formData.time,
        project_type: formData.projectType || null,
        location: formData.location || null,
        budget_range: formData.budgetRange || null,
        notes: formData.notes || null,
        user_id: userId || null,
        status: 'pending',
      })
      .select('id')
      .single();

    if (error || !data) {
      throw new Error(error?.message || 'Failed to create booking');
    }

    // Optionally trigger email confirmation via Edge Function
    try {
      await supabase.functions.invoke('send-booking-confirmation', {
        body: { bookingId: data.id, ...formData },
      });
    } catch {
      // Non-critical: email failure doesn't fail the booking
    }

    return { success: true, bookingId: data.id };
  } catch (err) {
    const apiError = handleSupabaseError(err);
    return { success: false, error: apiError.message };
  }
}

/**
 * Get available time slots for a given date.
 */
export async function getAvailableSlots(date: string): Promise<TimeSlot[]> {
  if (!isSupabaseConfigured) {
    return DEFAULT_TIME_SLOTS;
  }

  try {
    // Get already booked slots for this date
    const { data: booked } = await supabase
      .from('bookings')
      .select('booking_time')
      .eq('booking_date', date)
      .in('status', ['pending', 'confirmed']);

    const bookedTimes = new Set((booked || []).map(b => b.booking_time));

    return DEFAULT_TIME_SLOTS.map(slot => ({
      ...slot,
      available: !bookedTimes.has(slot.time),
    }));
  } catch {
    return DEFAULT_TIME_SLOTS;
  }
}

// ============================================================
// Partner Application Services
// ============================================================

export interface PartnerApplicationResult {
  success: boolean;
  applicationId?: string;
  error?: string;
}

/**
 * Submit an architect partner application.
 */
export async function submitArchitectApplication(data: {
  name: string;
  email: string;
  phone: string;
  firmName: string;
  city: string;
  portfolioUrl?: string;
  projectType?: string;
  annualVolumeSqft?: string;
  message?: string;
}): Promise<PartnerApplicationResult> {
  if (!isSupabaseConfigured) {
    console.info('[BookingService] Simulated architect application:', data);
    return { success: true, applicationId: `arch-${Date.now()}` };
  }

  try {
    const { data: result, error } = await supabase
      .from('architect_partners')
      .insert({
        name: data.name,
        email: data.email,
        phone: data.phone,
        firm_name: data.firmName,
        city: data.city,
        portfolio_url: data.portfolioUrl || null,
        project_type: data.projectType || null,
        annual_volume_sqft: data.annualVolumeSqft || null,
        message: data.message || null,
      })
      .select('id')
      .single();

    if (error || !result) throw new Error(error?.message);
    return { success: true, applicationId: result.id };
  } catch (err) {
    const apiError = handleSupabaseError(err);
    return { success: false, error: apiError.message };
  }
}

/**
 * Submit a dealer partner application.
 */
export async function submitDealerApplication(data: {
  name: string;
  email: string;
  phone: string;
  companyName: string;
  city: string;
  currentBrands?: string;
  showroomSize?: string;
  message?: string;
}): Promise<PartnerApplicationResult> {
  if (!isSupabaseConfigured) {
    console.info('[BookingService] Simulated dealer application:', data);
    return { success: true, applicationId: `dealer-${Date.now()}` };
  }

  try {
    const { data: result, error } = await supabase
      .from('dealer_partners')
      .insert({
        name: data.name,
        email: data.email,
        phone: data.phone,
        company_name: data.companyName,
        city: data.city,
        current_brands: data.currentBrands || null,
        showroom_size: data.showroomSize || null,
        message: data.message || null,
      })
      .select('id')
      .single();

    if (error || !result) throw new Error(error?.message);
    return { success: true, applicationId: result.id };
  } catch (err) {
    const apiError = handleSupabaseError(err);
    return { success: false, error: apiError.message };
  }
}

/**
 * Submit a bulk inquiry.
 */
export async function submitBulkInquiry(data: {
  name: string;
  email: string;
  phone: string;
  company?: string;
  projectName?: string;
  volumeSqft?: number;
  timeline?: string;
  productIds?: string[];
  message?: string;
}): Promise<PartnerApplicationResult> {
  if (!isSupabaseConfigured) {
    console.info('[BookingService] Simulated bulk inquiry:', data);
    return { success: true, applicationId: `bulk-${Date.now()}` };
  }

  try {
    const { data: result, error } = await supabase
      .from('bulk_inquiries')
      .insert({
        name: data.name,
        email: data.email,
        phone: data.phone,
        company: data.company || null,
        project_name: data.projectName || null,
        volume_sqft: data.volumeSqft || null,
        timeline: data.timeline || null,
        product_ids: data.productIds || [],
        message: data.message || null,
      })
      .select('id')
      .single();

    if (error || !result) throw new Error(error?.message);
    return { success: true, applicationId: result.id };
  } catch (err) {
    const apiError = handleSupabaseError(err);
    return { success: false, error: apiError.message };
  }
}
