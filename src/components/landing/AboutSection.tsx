'use client';

interface AboutSectionProps {
  t: any;
}

export default function AboutSection({ t }: AboutSectionProps) {
  return (
    <section id="about" className="py-24 bg-white px-4 border-b-2 border-[#d4c4b0]">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl font-lora font-bold text-[#2c2419] mb-4">
            {t.about.title}
          </h2>
          <p className="text-xl text-[#5d4e37] max-w-2xl mx-auto font-inter">
            {t.about.subtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
          {t.about.reasons.map((reason: any, i: number) => (
            <div 
              key={i} 
              className="group p-8 bg-[#f5f0e8] border-2 border-[#d4c4b0] hover:border-[#8b6834] transition-colors"
            >
              <div className="w-14 h-14 bg-[#8b6834] border-2 border-[#6b4e25] flex items-center justify-center mb-6">
                <span className="text-2xl font-lora font-bold text-[#faf8f5]">{i + 1}</span>
              </div>
              <h3 className="text-2xl font-lora font-semibold text-[#2c2419] mb-4">
                {reason.title}
              </h3>
              <p className="text-[#5d4e37] font-inter leading-relaxed">
                {reason.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
