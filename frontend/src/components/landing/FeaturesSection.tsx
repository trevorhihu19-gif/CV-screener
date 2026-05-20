const features = [
  {
    step: "01",
    icon: "📋",
    color: "bg-blue-50 dark:bg-blue-950",
    iconColor: "text-blue-600",
    title: "Paste Job Description",
    desc: "Describe the role, required skills, and must-have experience. Our AI extracts the key criteria automatically — no template needed.",
  },
  {
    step: "02",
    icon: "📤",
    color: "bg-orange-50 dark:bg-orange-950",
    iconColor: "text-orange-600",
    title: "Upload CVs in Bulk",
    desc: "Drag and drop up to 50 PDF CVs at once. Our parser handles varied formats — scanned, designed, plain text — with high accuracy.",
  },
  {
    step: "03",
    icon: "✨",
    color: "bg-green-50 dark:bg-green-950",
    iconColor: "text-green-600",
    title: "Get AI-Ranked Results",
    desc: "Every CV gets a match score, skill breakdown, and plain-English summary. Download the shortlist or push straight to your ATS.",
  },
];

const FeaturesSection = () => {
  return (
    <section id="features" className="py-24 px-6 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <div
            className="inline-flex items-center gap-2 bg-blue-50 dark:bg-blue-950
                    text-blue-600 dark:text-blue-400 rounded-full px-4 py-2 text-sm font-semibold mb-4"
          >
            See how it works
          </div>
          <h2 className="font-black text-4xl text-gray-900 dark:text-white tracking-tight mb-4">
            Three steps to your
            <br />
            perfect shortlist
          </h2>
          <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto leading-relaxed">
            No complex setup. No manual scoring. Just upload and let the AI do
            the heavy lifting.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((f) => (
            <div
              key={f.step}
              className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100
                    dark:border-gray-700 p-8 relative overflow-hidden hover:shadow-lg transition-all
                    hover:translate-y-1"
            >
              <span
                className="absolute top-4 right-6 font-black text-6xl text-gray-50
                    dark:text-gray-700 select-none"
              >
                {f.step}
              </span>

              <div
                className={`w-12 h-12 rounded-xl ${f.color} flex items-center justify-center text-2xl mb-6`}
              >
                {f.icon}
              </div>

              <h3 className="font-bold text-gray-900 dark:text-white text-lg mb-3">
                {f.title}
              </h3>
              <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">
                {f.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;