"use client";

import { useState, useEffect } from "react";
import { MessageCircle, X, Send, User } from "lucide-react";

export default function FloatingSupport() {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleSendMessage = () => {
    if (!message.trim()) return;
    
    const encodedMessage = encodeURIComponent(message);
    const phoneNumber = "8801831624571";
    window.open(`https://wa.me/${phoneNumber}?text=${encodedMessage}`, "_blank");
    setMessage("");
  };

  if (!isMounted) return null;

  return (
    <div className="fixed bottom-6 right-6 z-[100] font-dm-sans">
      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`${
          isOpen ? "bg-[#2c2419] rotate-90" : "bg-[#8b6834] hover:bg-[#6b4e25]"
        } text-white p-4 rounded-full shadow-lg transition-all duration-300 flex items-center justify-center`}
        aria-label="Support"
      >
        {isOpen ? (
          <X className="w-6 h-6" />
        ) : (
          <img src="/icons/whatsapp.svg" alt="Dev" className="w-7 h-7" />
        )}
      </button>

      {/* Chat Panel */}
      <div
        className={`absolute bottom-20 right-0 w-[320px] bg-[#faf8f5] border-2 border-[#d4c4b0] shadow-2xl rounded-lg overflow-hidden transition-all duration-300 origin-bottom-right ${
          isOpen
            ? "opacity-100 scale-100 translate-y-0"
            : "opacity-0 scale-95 translate-y-4 pointer-events-none"
        }`}
      >
        {/* Header - Developer Info */}
        <div className="bg-[#8b6834] p-4 text-[#faf8f5]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#faf8f5] rounded-full flex items-center justify-center overflow-hidden border-2 border-[#d4c4b0]">
              {/* Fallback to icon if no image available */}
              <img src="/images/dev.webp" alt="Dev" className="w-full h-full object-cover" />
            </div>
            <div>
              <p className="text-xs text-[#faf8f5]/80 uppercase tracking-wide">
                Developed by
              </p>
              <a href="https://kallol.me" target="_blank" rel="noopener noreferrer">
                <h3 className="font-lora font-bold text-lg leading-none hover:underline">
                  Kamrul Hasan
                </h3>
              </a>
            </div>
          </div>
        </div>

        {/* Body - Chat Interface */}
        <div className="p-4 space-y-4 bg-[#faf8f5]">
          <div className="bg-white p-3 rounded border border-[#d4c4b0] text-sm text-[#5d4e37]">
            <p>
              👋 Hi there! Need help customizing your card or have a feature
              request? Chat with us directly!
            </p>
          </div>

          <div className="relative">
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type your message..."
              className="w-full h-24 p-3 bg-white border border-[#d4c4b0] rounded text-[#2c2419] placeholder-[#5d4e37]/60 focus:outline-none focus:border-[#8b6834] text-sm resize-none font-inter"
            />
            <button
              onClick={handleSendMessage}
              disabled={!message.trim()}
              className="absolute bottom-4 right-3 p-2 bg-[#8b6834] text-white rounded-full hover:bg-[#6b4e25] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              title="Send via WhatsApp"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
          
          <div className="text-center">
             <p className="text-[10px] text-[#5d4e37]/60">
               Powered by WhatsApp Support
             </p>
          </div>
        </div>
      </div>
    </div>
  );
}
