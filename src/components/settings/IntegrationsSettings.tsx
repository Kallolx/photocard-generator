"use client";

import { Globe, Link2, MonitorDot, AlertCircle } from "lucide-react";

export default function IntegrationsSettings() {
  return (
    <div className="bg-white border border-[#d4c4b0]/40 p-6 md:p-8 shadow-sm">
      <h2 className="text-xl font-lora font-bold text-[#2c2419] mb-1">
        Integrations
      </h2>
      <p className="text-[#5d4e37] text-sm mb-6 font-inter">
        Connect Photocard to your website and social media accounts.
      </p>

      <div className="space-y-6">
        {/* Website Integration */}
        <div className="border-2 border-[#d4c4b0] p-6 relative overflow-hidden group hover:border-[#8b6834] transition-colors">
          <div className="absolute right-0 top-0 w-32 h-32 bg-[#8b6834]/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />

          <div className="flex items-start justify-between relative z-10">
            <div className="flex gap-4">
              <div className="w-10 h-10 bg-[#f5f0e8] text-[#8b6834] flex items-center justify-center border border-[#d4c4b0] flex-shrink-0">
                <MonitorDot className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-black text-[#2c2419] uppercase tracking-tight">
                  Website Integration
                </h3>
                <p className="text-[#5d4e37] text-sm font-medium mt-1 max-w-md">
                  Publish generated news and photocards directly to your custom
                  website.
                </p>

                <div className="mt-4 inline-flex items-center gap-2 px-3 py-1.5 bg-[#f5f0e8] border border-[#d4c4b0] text-[#5d4e37] text-xs font-black uppercase tracking-widest">
                  <AlertCircle className="w-3.5 h-3.5" />
                  Coming Soon
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Social Media Integration */}
        <div className="border-2 border-[#d4c4b0] p-6 relative overflow-hidden group hover:border-[#8b6834] transition-colors">
          <div className="absolute right-0 top-0 w-32 h-32 bg-[#8b6834]/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />

          <div className="flex items-start justify-between relative z-10">
            <div className="flex gap-4">
              <div className="w-10 h-10 bg-[#f5f0e8] text-[#8b6834] flex items-center justify-center border border-[#d4c4b0] flex-shrink-0">
                <Globe className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-black text-[#2c2419] uppercase tracking-tight">
                  Social Media
                </h3>
                <p className="text-[#5d4e37] text-sm font-medium mt-1 max-w-md">
                  Automatically share generated content to your social profiles.
                </p>

                <div className="mt-4 inline-flex items-center gap-2 px-3 py-1.5 bg-[#f5f0e8] border border-[#d4c4b0] text-[#5d4e37] text-xs font-black uppercase tracking-widest">
                  <AlertCircle className="w-3.5 h-3.5" />
                  Coming Soon
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
