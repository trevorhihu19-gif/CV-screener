const points = [
  "🎯 Context-aware AI screening — not just keyword matching",
  "🌍 Built with African recruiting teams in mind",
  "🔒 Your data is private",
  "⚡ Results in seconds, not hours",
];

const cards = [
  {
    emoji: "🤖",
    title: "AI First",
    desc: "Every decision is powered by state-of-the-art language models that understand context.",
  },
  {
    emoji: "⚡",
    title: "Lightning Fast",
    desc: "Screen 50 CVs in under 2 minutes — no waiting, no bottlenecks.",
  },
  {
    emoji: "🎯",
    title: "Accurate",
    desc: "94% accuracy rate validated across thousands of real-world screenings.",
  },
  {
    emoji: "🔒",
    title: "Secure",
    desc: "SOC 2 compliant with end-to-end encryption on all uploaded files.",
  },
];

const AboutSection = () => {
  return (
    <section id="about" className="py-24 px-6 bg-white dark:bg-gray-950">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

          <div>
            <div className="inline-flex items-center gap-2 bg-purple-50 dark:bg-purple-950 text-purple-600 dark:text-purple-400 rounded-full px-4 py-2 text-sm font-semibold mb-6">
              🏢 About Us
            </div>

            <h2 className="font-black text-4xl text-gray-900 dark:text-white tracking-tight mb-6 leading-tight">
              Built for modern<br />recruiting teams
            </h2>

            <p className="text-gray-500 dark:text-gray-400 leading-relaxed mb-5">
              RecruitBot was built out of frustration with manual CV screening.
              We spent weeks reviewing hundreds of CVs for a single role,
              missing great candidates because of sheer volume. We knew
              there had to be a better way.
            </p>
            <p className="text-gray-500 dark:text-gray-400 leading-relaxed mb-8">
              Today, RecruitBot helps over 1,200 recruiters across Africa
              and beyond hire faster, fairer, and smarter — powered by
              cutting-edge AI that understands context, not just keywords.
            </p>

            <div className="flex flex-col gap-3">
              {points.map((point) => (
                <div
                  key={point}
                  className="flex items-start gap-3 text-sm text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-900 rounded-xl px-4 py-3 border border-gray-100 dark:border-gray-800"
                >
                  {point}
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {cards.map((card, i) => (
              <div
                key={card.title}
                className={`bg-gray-50 dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6 hover:shadow-md transition-all hover:-translate-y-1 ${
                  i === 1 ? "mt-6" : ""
                } ${i === 3 ? "-mt-6" : ""}`}
              >
                <div className="text-3xl mb-3">{card.emoji}</div>
                <h4 className="font-bold text-gray-900 dark:text-white text-sm mb-2">
                  {card.title}
                </h4>
                <p className="text-gray-400 text-xs leading-relaxed">
                  {card.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;