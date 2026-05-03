import Link from "next/link";
import Navbar from "@/components/Navbar";
import { ArrowRight, Sparkles } from "lucide-react";

type CardStudioPageProps = {
  eyebrow: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  accentFrom: string;
  accentTo: string;
  highlights: string[];
  steps: string[];
  sampleLabel: string;
  sampleTitle: string;
  sampleBody: string;
};

export default function CardStudioPage({
  eyebrow,
  title,
  description,
  icon,
  accentFrom,
  accentTo,
  highlights,
  steps,
  sampleLabel,
  sampleTitle,
  sampleBody,
}: CardStudioPageProps) {
  return (
    <div className="min-h-screen bg-[#faf8f5] text-[#2c2419]">
      <Navbar />

      <main className="relative overflow-hidden">
        <div className={`absolute inset-x-0 top-0 h-[440px] bg-gradient-to-br ${accentFrom} ${accentTo} opacity-20`} />
        <div className="absolute -top-20 right-0 h-72 w-72 rounded-full bg-[#8b6834]/10 blur-3xl" />
        <div className="absolute top-48 left-[-4rem] h-64 w-64 rounded-full bg-[#2c2419]/5 blur-3xl" />

        <div className="relative mx-auto flex w-full max-w-7xl flex-col gap-10 px-4 py-10 md:px-6 lg:px-8 lg:py-12">
          <section className="grid gap-8 lg:grid-cols-[1.1fr,0.9fr] lg:items-center">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 border border-[#d4c4b0] bg-white/80 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.3em] text-[#8b6834] backdrop-blur">
                <Sparkles className="h-3.5 w-3.5" />
                {eyebrow}
              </div>

              <div className="space-y-4">
                <div className="inline-flex h-14 w-14 items-center justify-center border border-[#d4c4b0] bg-white shadow-sm">
                  <span className="text-[#8b6834]">{icon}</span>
                </div>
                <h1 className="max-w-2xl text-4xl font-black tracking-tight text-[#2c2419] md:text-5xl lg:text-6xl">
                  {title}
                </h1>
                <p className="max-w-2xl text-base leading-7 text-[#5d4e37] md:text-lg">
                  {description}
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <Link
                  href="/dashboard"
                  className="inline-flex items-center gap-2 border-2 border-[#8b6834] bg-[#8b6834] px-5 py-3 text-xs font-black uppercase tracking-[0.25em] text-white transition-colors hover:border-[#2c2419] hover:bg-[#2c2419]"
                >
                  Back to dashboard
                </Link>
                <Link
                  href="/url"
                  className="inline-flex items-center gap-2 border-2 border-[#d4c4b0] bg-white px-5 py-3 text-xs font-black uppercase tracking-[0.25em] text-[#2c2419] transition-colors hover:border-[#8b6834] hover:text-[#8b6834]"
                >
                  Explore cards
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>

              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {highlights.map((item) => (
                  <div key={item} className="border border-[#d4c4b0] bg-white/90 px-4 py-3 text-sm font-semibold text-[#5d4e37] shadow-sm">
                    {item}
                  </div>
                ))}
              </div>
            </div>

            <div className="border-2 border-[#d4c4b0] bg-white p-5 shadow-[0_24px_70px_rgba(44,36,25,0.08)]">
              <div className="flex items-center justify-between border-b border-[#d4c4b0]/60 pb-4">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.28em] text-[#8b6834]">
                    Studio snapshot
                  </p>
                  <h2 className="mt-1 text-xl font-black text-[#2c2419]">
                    {sampleLabel}
                  </h2>
                </div>
                <div className="flex h-11 w-11 items-center justify-center border border-[#d4c4b0] bg-[#faf8f5] text-[#8b6834]">
                  <Sparkles className="h-5 w-5" />
                </div>
              </div>

              <div className="mt-5 space-y-4">
                <div className="space-y-2">
                  <div className="h-3 w-20 bg-[#e8dcc8]" />
                  <div className="h-12 w-full bg-[#f5f0e8]" />
                  <div className="h-12 w-5/6 bg-[#f5f0e8]" />
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  {steps.map((step, index) => (
                    <div key={step} className="border border-[#d4c4b0]/70 bg-[#faf8f5] p-4">
                      <p className="text-[10px] font-black uppercase tracking-[0.28em] text-[#8b6834]">
                        Step {index + 1}
                      </p>
                      <p className="mt-2 text-sm font-semibold text-[#2c2419]">{step}</p>
                    </div>
                  ))}
                </div>

                <div className="border border-[#2c2419] bg-[#2c2419] p-5 text-white">
                  <p className="text-[10px] font-black uppercase tracking-[0.28em] text-[#d4c4b0]">
                    Preview
                  </p>
                  <h3 className="mt-3 text-2xl font-black tracking-tight">
                    {sampleTitle}
                  </h3>
                  <p className="mt-3 text-sm leading-6 text-[#e8dcc8]">{sampleBody}</p>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}