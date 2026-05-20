import { Link } from "react-router-dom";

 const HeroSection = () => {
  return (
    <section
      id="home"
      className="relative overflow-hidden bg-white dark:bg-gray-950 py-24 px-6"
    >
      <div
        className="absolute top-0 right-0 w-150 h-150 bg-linear-to-bl
       from-blue-100 via-purple-50 to-transparent dark:from-blue-950/40
        dark:via-purple-950/20 dark:to-transparent rounded-full blur-3xl opacity-60 
        pointer-events-none"
      />
      <div
        className="absolute bottom-0 left-0 w-100 h-100 
      bg-linear-to-tr from-blue-50 to-transparent dark:from-blue-950/20 
      dark:to-transparent rounded-full blur-3xl opacity-40 pointer-events-none"
      />

      <div className="max-w-7xl mx-auto relative">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="flex flex-col gap-8">
            <div
              className="inline-flex items-center gap-2 bg-amber-50 dark:bg-amber-950
                text-amber-700 dark:text-amber-400 rounded-full px-4 py-2 text-sm font-semibold w-fit"
            >
              ⚡ 94% Screening Accuracy
            </div>

            <h1
              className="font-black text-5xl lg:text-6xl text-gray-900 dark:text-white tracking-tight
                leading-tight"
            >
              Hire Smarter
              <br />
              with{" "}
              <span className="bg-linear-to-r from blue-600 to-orange-600 bg-clip-text text-transparent">
                AI-powered
              </span>
              <br />
              CV Screening
            </h1>

            <p className="text-gray-500 dark:text-gray-400 text-lg leading-relaxed max-w-md">
              Upload a job description, drop in CVs — our AI ranks and
              shortlists candidates instantly so your team focuses only on the
              best fits.
            </p>

            <div className="flex items-center gap-3">
               
              <p className="text-sm text-gray-500 dark:text-gray-400">
                <strong className="text-gray-900 dark:text-white">
                  Already screening smarter
                </strong>{" "}
               
              </p>
            </div>

            <div className="flex items-center gap-4 flex-wrap">
              <Link
                to="/register"
                className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-6 py-3 text-sm
                    font-medium transition-all flex items-center gap-2 shadow-lg shadow-blue-200
                    dark:shadow-blue-950"
              >
                Start Screening for Free
              </Link>
              <a
                href="#features"
                className="bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700
                text-gray-900 dark:text-white rounded-xl px-6 py-3 text-sm font-medium transition-all"
              >
                See How it works
              </a>
            </div>
          </div>

          <div className="relative h-115 hidden lg:block">
            <div
              className="absolute top-8 left-4 bg-white dark:bg-gray-900 rounded-2xl shadow-xl border
            border-gray-100 dark:border-gray-800 p-5 w-64 animate-float"
            >
              <div className="flex items-center gap-3 mb-4">
                <div
                  className="w-10 h-10 rounded-full bg-linear-to-br from-blue-200 to-orange-500
                    flex items-center justify-center text-white font-bold text-sm shrink-0 "
                >
                  TH
                </div>
                <div>
                  <p className="font-bold text-sm text-gray-900 dark:text-white">
                    Trevor Hihu
                  </p>
                  <p className="text-xs text-gray-400">FullStack Developer</p>
                </div>
              </div>
              <div className="flex flex-col gap-2.5">
                {[
                  {
                    label: "Technical Match",
                    pct: 88,
                    color: "from-blue-500 to-green-500",
                  },
                  {
                    label: "Experience Fit",
                    pct: 73,
                    color: "from-green-400 to-cyan-500",
                  },
                  {
                    label: "Culture Score",
                    pct: 62,
                    color: "from-amber-400 to-orange-500",
                  },
                ].map((bar) => (
                  <div key={bar.label}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-gray-500 dark:text-gray-400">
                        {bar.label}
                      </span>
                      <span className="font-medium text-gray-700 dark:text-gray-300">
                        {bar.pct}%
                      </span>
                    </div>
                    <div className="h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full bg-linear-to-r ${bar.color}`}
                        style={{ width: `${bar.pct}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div
              className="absolute bottom-20 right-4 bg-white dark:bg-gray-900 rounded-2xl shadow-xl
            border border-gray-100 dark:border-gray-800 p-5 w-44 animate-float-delay"
            >
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">
                Match Score
              </p>
              <p className="font-black text-4xl text-gray-900 dark:text-white">
                87
                <span className="text-base text-gray-400 font-normal">
                  /100
                </span>
              </p>
              <p className="text-xs text-green-500 font-semibold mt-1">
                ↑ Top 5% of applicants
              </p>
            </div>

            <div
              className="absolute top-6 right-6 bg-white dark:bg-gray-900 rounded-2xl shadow-xl
            border border-gray-100 dark:border-gray-800 p-4 flex items-center gap-3 animate-float-slow"
            >
              <div
                className="w-9 h-9 rounded-xl bg-green-50 dark:bg-green-950 flex items-center
                justify-center text-lg shrink-0"
              >
                ✅
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">
                  Shortlisted
                </p>
                <p className="text-xs text-gray-400">Trevor Hihu</p>
              </div>
            </div>

            <div
              className="absolute bottom-8 left-8 bg-white dark:bg-gray-900 rounded-2xl 
            shadow-xl border border-gray-100 dark:border-gray-800 p-4 flex items-center gap-3 
            animate-float-delay"
            >
              <div
                className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950 flex items-center 
                justify-center text-lg shrink-0"
              >
                🤖
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">
                  AI Analysing...
                </p>
                <div className="flex gap-1 mt-1">
                  {[0, 1, 2].map((i) => (
                    <div
                      key={i}
                      className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-bounce"
                      style={{ animationDelay: `${i * 0.2}s` }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-center mt-16">
        <a
          href="#features"
          className="w-10 h-10 rounded-full border-2 border-gray-200 dark:border-gray-700
             flex items-center justify-center text-gray-400 hover:border-blue-500
              hover:text-blue-500 transition-all animate-bounce"
        >
          ↓
        </a>
      </div>
    </section>
  );
};

export default HeroSection;