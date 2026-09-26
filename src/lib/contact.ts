/** single source of truth for the storefront's phone / WhatsApp number */
export const CONTACT_PHONE_DISPLAY = "+91 87140 46986";
export const CONTACT_PHONE_TEL = "tel:+918714046986";
export const CONTACT_WHATSAPP_URL =
  "https://wa.me/918714046986?text=" +
  encodeURIComponent("Hi Fresh Fusion! I have a question about your pickles.");

/** a wa.me link to the *shop's own* number with a pre-filled message — used
 *  to hand off a checkout order to WhatsApp instead of an online payment */
export function shopOrderWhatsAppUrl(message: string): string {
  return `https://wa.me/918714046986?text=${encodeURIComponent(message)}`;
}

/**
 * A wa.me link to a *customer's* number with a pre-filled message — opens
 * WhatsApp with the text ready to send, but a person still taps send. There
 * is no WhatsApp Business API wired up here, so nothing sends on its own.
 * Assumes a 10-digit Indian mobile number (the shape checkout collects) and
 * prefixes the +91 country code.
 */
export function customerWhatsAppUrl(phone: string, message: string): string {
  const digits = phone.replace(/\D/g, "").slice(-10);
  return `https://wa.me/91${digits}?text=${encodeURIComponent(message)}`;
}
