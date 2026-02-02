import { X, MessageCircle } from "lucide-react";
import { useEffect, useState } from "react";

interface WhatsAppModalProps {
  isOpen: boolean;
  onClose: () => void;
  planName: string;
  price: string;
}

export default function WhatsAppModal({
  isOpen,
  onClose,
  planName,
  price,
}: WhatsAppModalProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isOpen || !isMounted) return null;

  const handleWhatsAppClick = () => {
    const message = `Hi! I'm interested in the ${planName} plan (${price}). Can you help me upgrade?`;
    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/8801831624571?text=${encodedMessage}`, "_blank");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-sm bg-[#faf8f5] shadow-2xl p-6 border-2 border-[#d4c4b0] transform transition-all scale-100"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute right-3 top-3 text-[#5d4e37] hover:text-[#2c2419] transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mt-2">
          <div className="flex items-center justify-center mx-auto mb-4">
            <img src="/icons/crown.svg" alt="Premium" className="w-16 h-16" />
          </div>

          <h3 className="text-xl font-lora font-bold text-[#2c2419] mb-2">
            Upgrade to {planName}
          </h3>

          <p className="text-sm text-[#5d4e37] font-inter mb-6 leading-relaxed">
            Contact our support team via WhatsApp to set up your {planName} plan
            securely.
          </p>

          <button
            onClick={handleWhatsAppClick}
            className="w-full flex items-center justify-center gap-2 bg-[#8b6834] hover:bg-[#6b4e25] text-white py-3 px-6 font-semibold transition-colors font-inter"
          >
            <img
              src="/icons/whatsapp.svg"
              alt=""
              className="w-5 h-5"
            />
            Chat on WhatsApp
          </button>

          <p className="mt-4 text-[10px] uppercase tracking-wider text-[#5d4e37]/70 font-inter">
            Replies within minutes
          </p>
        </div>
      </div>
    </div>
  );
}
