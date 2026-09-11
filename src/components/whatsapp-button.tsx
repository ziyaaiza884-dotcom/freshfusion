import { MessageCircle } from "lucide-react";
import { CONTACT_WHATSAPP_URL } from "@/lib/contact";

export function WhatsAppButton() {
  return (
    <a
      href={CONTACT_WHATSAPP_URL}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with Fresh Fusion on WhatsApp"
      className="fixed bottom-5 right-5 z-40 grid h-14 w-14 place-items-center rounded-full bg-[#25D366] text-white shadow-[0_8px_24px_-6px_rgba(0,0,0,0.5)] transition-transform hover:scale-105 active:scale-95"
    >
      <MessageCircle className="h-7 w-7" />
    </a>
  );
}
