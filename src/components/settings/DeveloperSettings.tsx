"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import {
  Copy,
  Eye,
  EyeOff,
  Key,
  RefreshCw,
  Terminal,
  Check,
  Book,
} from "lucide-react";
import { developerAPI } from "@/lib/api";

export default function DeveloperSettings() {
  const { user } = useAuth();
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [showKey, setShowKey] = useState(false);
  const [copied, setCopied] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [activeDocTab, setActiveDocTab] = useState<"basics" | "styling">(
    "basics",
  );
  const [usageStats, setUsageStats] = useState({ usage: 0, limit: 20 });

  const isPremium = user?.plan === "Premium";

  useEffect(() => {
    if (isPremium) {
      fetchApiKey();
    } else {
      setLoading(false);
    }
  }, [isPremium]);

  const fetchApiKey = async () => {
    try {
      setLoading(true);
      const data = await developerAPI.getApiKey();
      if (data.success && data.apiKey) {
        setApiKey(data.apiKey);
        setUsageStats({
          usage: data.usage || 0,
          limit: data.limit || 20,
        });
      }
    } catch (error) {
      console.error("Failed to fetch API key:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateKey = async () => {
    try {
      setGenerating(true);
      const data = await developerAPI.generateApiKey();
      if (data.success) {
        setApiKey(data.apiKey);
        // Reset usage on new key (optional, but logical if we consider key rotation as fresh start, though usually limits are per user.
        // Our backend doesn't reset usage on key gen, so let's refetch or keep old usage. Best to keep old usage locally until a fresh fetch.)
        // But the response form generateApiKey only sends success and apiKey.
        // So we might want to refetch stats or just leave as is.
      }
    } catch (error) {
      console.error("Failed to generate API key:", error);
    } finally {
      setGenerating(false);
    }
  };

  const copyToClipboard = () => {
    if (apiKey) {
      navigator.clipboard.writeText(apiKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Helper to calculate percentage
  const usagePercentage = Math.min(
    (usageStats.usage / usageStats.limit) * 100,
    100,
  );

  if (!isPremium) {
    return (
      <div className="bg-white border-2 border-[#d4c4b0] p-8 text-center shadow-sm">
        <div className="w-16 h-16 bg-[#f5f0e8] text-[#8b6834] flex items-center justify-center mx-auto mb-4 border border-[#d4c4b0]">
          <Key className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-lora font-bold text-[#2c2419] mb-3">
          Developer API Access
        </h2>
        <p className="text-[#5d4e37] max-w-md mx-auto mb-8 font-inter">
          Generate photocards programmatically using our REST API. Access to the
          Developer API is exclusively available on the Premium plan.
        </p>
        <button
          disabled
          className="px-6 py-3 bg-[#e8dcc8] text-[#5d4e37] font-bold border border-[#d4c4b0] cursor-not-allowed uppercase tracking-wider font-inter hover:bg-[#dccaae] transition-colors"
        >
          Upgrade to Unlock
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-bold font-lora text-[#2c2419] mb-4">
          Developer API
        </h2>
        <p className="text-[#5d4e37] font-inter">
          Manage your API key to integrate Photocard generation into your own
          applications.
        </p>
      </div>

      {/* API Key Section */}
      <div className="bg-white border-2 border-[#d4c4b0] p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-[#2c2419] font-inter">
            Your API Key
          </h3>
          {apiKey && (
            <button
              onClick={handleGenerateKey}
              disabled={generating}
              className="text-sm text-[#8b6834] hover:text-[#74552b] font-medium flex items-center gap-2 transition-colors"
            >
              <RefreshCw
                className={`w-4 h-4 ${generating ? "animate-spin" : ""}`}
              />
              roll key
            </button>
          )}
        </div>

        {loading ? (
          <div className="h-12 bg-gray-100 animate-pulse border border-gray-200"></div>
        ) : !apiKey ? (
          <div className="text-center py-8">
            <p className="text-[#5d4e37] mb-4">
              You haven't generated an API key yet.
            </p>
            <button
              onClick={handleGenerateKey}
              disabled={generating}
              className="px-6 py-2 bg-[#8b6834] hover:bg-[#74552b] text-white font-bold transition-colors border border-transparent shadow-sm"
            >
              {generating ? "Generating..." : "Generate API Key"}
            </button>
          </div>
        ) : (
          <div className="relative">
            <div className="flex items-center gap-2 bg-[#faf8f5] border border-[#d4c4b0] p-3 font-mono text-sm text-[#2c2419]">
              <Key className="w-4 h-4 text-[#8b6834] flex-shrink-0" />
              <span className="flex-1 truncate">
                {showKey
                  ? apiKey
                  : "pk_live_• • • • • • • • • • • • • • • • • • • • • • • •"}
              </span>
              <button
                onClick={() => setShowKey(!showKey)}
                className="p-1.5 hover:bg-[#e8dcc8] text-[#5d4e37] transition-colors border border-transparent hover:border-[#d4c4b0]"
                title={showKey ? "Hide key" : "Show key"}
              >
                {showKey ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
              <button
                onClick={copyToClipboard}
                className="p-1.5 hover:bg-[#e8dcc8] text-[#5d4e37] transition-colors border border-transparent hover:border-[#d4c4b0]"
                title="Copy to clipboard"
              >
                {copied ? (
                  <Check className="w-4 h-4 text-green-600" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </button>
            </div>
            <p className="text-xs text-[#5d4e37]/70 mt-2 font-inter">
              Keep this key secret. It allows full access to generate cards on
              your behalf.
            </p>
          </div>
        )}
      </div>

      {apiKey && (
        <>
          {/* Usage Stats (New) */}
          <div className="bg-white border-2 border-[#d4c4b0] p-6 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-bold text-[#2c2419] font-inter">
                Daily Usage
              </h3>
              <span className="text-sm font-mono text-[#8b6834] font-bold">
                {usageStats.usage} / {usageStats.limit}
              </span>
            </div>
            <div className="w-full bg-[#f5f0e8] h-3 border border-[#d4c4b0]/50 rounded-sm overflow-hidden">
              <div
                className={`h-full transition-all duration-500 ${usagePercentage >= 90 ? "bg-red-500" : "bg-[#8b6834]"}`}
                style={{ width: `${usagePercentage}%` }}
              ></div>
            </div>
            <p className="text-xs text-[#5d4e37]/70 mt-2 font-inter">
              Resets daily at midnight UTC.
            </p>
          </div>

          {/* Documentation Section */}
          <div className="bg-white border-2 border-[#d4c4b0] shadow-sm overflow-hidden">
            <div className="bg-[#f5f0e8] border-b border-[#d4c4b0] px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Book className="w-5 h-5 text-[#8b6834]" />
                <h3 className="font-bold text-[#2c2419] font-lora text-lg">
                  API Documentation
                </h3>
              </div>
              <div className="flex gap-2 text-sm">
                <button
                  onClick={() => setActiveDocTab("basics")}
                  className={`px-3 py-1 bg-transparent hover:text-[#8b6834] transition-colors ${activeDocTab === "basics" ? "text-[#8b6834] font-bold border-b-2 border-[#8b6834]" : "text-[#5d4e37]"}`}
                >
                  Basics
                </button>
                <button
                  onClick={() => setActiveDocTab("styling")}
                  className={`px-3 py-1 bg-transparent hover:text-[#8b6834] transition-colors ${activeDocTab === "styling" ? "text-[#8b6834] font-bold border-b-2 border-[#8b6834]" : "text-[#5d4e37]"}`}
                >
                  Styling & Options
                </button>
              </div>
            </div>

            <div className="p-6">
              {activeDocTab === "basics" ? (
                <div className="space-y-4 text-sm text-[#5d4e37] font-inter">
                  <p>
                    Send a <code>POST</code> request to{" "}
                    <code>/api/external/v1/generate</code> with your API key in
                    the code <code>x-api-key</code> header.
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-t border-[#d4c4b0]/30 pt-4">
                    <div>
                      <h4 className="font-bold text-[#2c2419] mb-1">Method</h4>
                      <span className="inline-block bg-blue-100 text-blue-800 px-2 py-0.5 text-xs font-bold border border-blue-200">
                        POST
                      </span>
                    </div>
                    <div>
                      <h4 className="font-bold text-[#2c2419] mb-1">
                        Content-Type
                      </h4>
                      <code className="bg-gray-100 px-1 py-0.5 border border-gray-200">
                        application/json
                      </code>
                    </div>
                    <div>
                      <h4 className="font-bold text-[#2c2419] mb-1">
                        Response
                      </h4>
                      <span className="text-xs">Image (PNG)</span>
                    </div>
                  </div>

                  <div className="mt-4">
                    <h4 className="font-bold text-[#2c2419] mb-2">
                      Required Parameters
                    </h4>
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-[#d4c4b0]/30 text-xs uppercase text-[#8b6834]">
                          <th className="py-2">Field</th>
                          <th className="py-2">Type</th>
                          <th className="py-2">Description</th>
                        </tr>
                      </thead>
                      <tbody className="text-xs">
                        <tr className="border-b border-[#d4c4b0]/10">
                          <td className="py-2 font-mono">url</td>
                          <td className="py-2 text-gray-500">string</td>
                          <td className="py-2">
                            The source URL to generate the card for.
                          </td>
                        </tr>
                        <tr className="border-b border-[#d4c4b0]/10">
                          <td className="py-2 font-mono">theme</td>
                          <td className="py-2 text-gray-500">string</td>
                          <td className="py-2">
                            Card layout style ('classic' or 'modern').
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <div className="space-y-4 text-sm text-[#5d4e37] font-inter">
                  <p>
                    Customize the card's appearance by passing an{" "}
                    <code>options</code> object in your JSON body.
                  </p>
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-[#d4c4b0]/30 text-xs uppercase text-[#8b6834]">
                        <th className="py-2 w-1/4">Option Key</th>
                        <th className="py-2 w-1/4">Values / Example</th>
                        <th className="py-2">Description</th>
                      </tr>
                    </thead>
                    <tbody className="text-xs">
                      <tr className="border-b border-[#d4c4b0]/10">
                        <td className="py-2 font-mono font-bold">bgType</td>
                        <td className="py-2 font-mono">'solid' | 'gradient'</td>
                        <td className="py-2">Background fill type.</td>
                      </tr>
                      <tr className="border-b border-[#d4c4b0]/10">
                        <td className="py-2 font-mono font-bold">bgFrom</td>
                        <td className="py-2 font-mono">#1e3a8a</td>
                        <td className="py-2">
                          Starting color (or solid color).
                        </td>
                      </tr>
                      <tr className="border-b border-[#d4c4b0]/10">
                        <td className="py-2 font-mono font-bold">bgTo</td>
                        <td className="py-2 font-mono">#0f172a</td>
                        <td className="py-2">Ending color (if gradient).</td>
                      </tr>
                      <tr className="border-b border-[#d4c4b0]/10">
                        <td className="py-2 font-mono font-bold">pattern</td>
                        <td className="py-2 font-mono">
                          'circuit', 'dots', 'none'
                        </td>
                        <td className="py-2">Background pattern style.</td>
                      </tr>
                      <tr className="border-b border-[#d4c4b0]/10">
                        <td className="py-2 font-mono font-bold">
                          patternColor
                        </td>
                        <td className="py-2 font-mono">#ffffff</td>
                        <td className="py-2">Color of the pattern overlay.</td>
                      </tr>
                      <tr className="border-b border-[#d4c4b0]/10">
                        <td className="py-2 font-mono font-bold">
                          frameThickness
                        </td>
                        <td className="py-2 font-mono">0 - 20</td>
                        <td className="py-2">
                          Width of the card frame border.
                        </td>
                      </tr>
                      <tr className="border-b border-[#d4c4b0]/10">
                        <td className="py-2 font-mono font-bold">title</td>
                        <td className="py-2 font-mono">"My Article Title"</td>
                        <td className="py-2">
                          Override the auto-detected title.
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          {/* Usage Example */}
          <div className="bg-[#1e1e1e] text-gray-300 p-0 overflow-hidden border border-[#2c2419] shadow-sm">
            <div className="flex items-center gap-2 px-4 py-3 bg-[#252526] border-b border-[#3e3e42]">
              <Terminal className="w-4 h-4 text-[#8b6834]" />
              <span className="text-sm font-bold font-mono text-gray-300">
                Detailed Example Request
              </span>
            </div>
            <div className="p-6 overflow-x-auto">
              <pre className="font-mono text-xs md:text-sm whitespace-pre-wrap leading-relaxed">
                {`curl -X POST ${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/external/v1/generate \\
  -H "x-api-key: ${apiKey}" \\
  -H "Content-Type: application/json" \\
  -d '{
    "url": "https://example.com",
    "theme": "modern",
    "options": {
      "title": "My Custom Article Card",
      "siteName": "mysite.com",
      "bgType": "gradient",
      "bgFrom": "#1e3a8a",
      "bgTo": "#0f172a",
      "pattern": "circuit",
      "patternColor": "#ffffff",
      "patternOpacity": "0.1",
      "frameColor": "#ffffff",
      "frameThickness": "4"
    }
  }' > card.png`}
              </pre>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
