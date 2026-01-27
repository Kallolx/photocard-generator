'use client';

interface FeaturesSectionProps {
  t: any;
}

const features = [
  {
    icon: (
      <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
      </svg>
    ),
    key: 'urlGeneration'
  },
  {
    icon: (
      <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
      </svg>
    ),
    key: 'customDesign'
  },
  {
    icon: (
      <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
      </svg>
    ),
    key: 'templates'
  },
  {
    icon: (
      <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
      </svg>
    ),
    key: 'instantDownload'
  },
];

export default function FeaturesSection({ t }: FeaturesSectionProps) {
  return (
    <section id="features" className="py-24 bg-white px-4 border-b-2 border-[#d4c4b0]">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl font-lora font-bold text-[#2c2419] mb-4">
            {t.features.title}
          </h2>
          <p className="text-xl text-[#5d4e37] max-w-2xl mx-auto font-inter">
            {t.features.subtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <div 
              key={index} 
              className="group p-8 bg-[#f5f0e8] border-2 border-[#d4c4b0] hover:border-[#8b6834] transition-colors"
            >
              <div className="w-16 h-16 bg-[#8b6834] border-2 border-[#6b4e25] flex items-center justify-center mb-6 text-[#faf8f5]">
                {feature.icon}
              </div>
              <h3 className="text-xl font-lora font-semibold text-[#2c2419] mb-3">
                {t.features[feature.key].title}
              </h3>
              <p className="text-[#5d4e37] font-inter leading-relaxed">
                {t.features[feature.key].description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
