const stats = [
  {
    value: "94%",
    label: "Screening Accuracy",
    icon: "🎯",
  },
  {
    value: "1,200+",
    label: "Recruiters Using RecruitBot",
    icon: "👥",
  },
  {
    value: "14h",
    label: "Average Time Saved Per Hire",
    icon: "⏱",
  },
  {
    value: "50+",
    label: "CVs Processed Per Batch",
    icon: "📄",
  },
];

const StatsSection = () => {
  return (
    <section className="py-20 px-6 bg-blue-600 dark:bg-blue-700 relative overflow-hidden">

      <div className="absolute top-0 left-0 w-64 h-64 bg-white/5 rounded-full -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-white/5 rounded-full translate-x-1/3 translate-y-1/3 pointer-events-none" />

      <div className="max-w-7xl mx-auto relative">

        <div className="text-center mb-12">
          <p className="text-blue-100 text-sm font-semibold uppercase tracking-widest">
            Trusted 
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="text-center flex flex-col items-center gap-3"
            >
              
              <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center text-2xl">
                {stat.icon}
              </div>
              <p className="font-black text-4xl lg:text-5xl text-white tracking-tight">
                {stat.value}
              </p>
              <p className="text-blue-100 text-sm font-medium max-w-32 leading-snug">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default StatsSection;