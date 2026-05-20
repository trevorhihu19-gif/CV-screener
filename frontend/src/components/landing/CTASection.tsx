import { Link } from "react-router-dom";

const CTASection = () => {
  return (
    <section className="py-24 px-6 bg-white dark:bg-gray-950 relative overflow-hidden">
      
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-150 h-75 bg-linear-to-b
       from-blue-50 dark:from-blue-950/30 to-transparent rounded-full blur-3xl opacity-60 
       pointer-events-none" />
      <div className="max-w-3xl mx-auto text-center relative">
        <div className="inline-flex items-center gap-2 bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 rounded-full px-4 py-2 text-sm font-semibold mb-8">
          Get Started Today
        </div>

        <h2 className="font-black text-4xl lg:text-5xl text-gray-900 dark:text-white tracking-tight mb-6 leading-tight">
          Ready to hire smarter?
        </h2>

        <p className="text-gray-500 dark:text-gray-400 text-lg leading-relaxed mb-10 max-w-xl mx-auto">
          Join recruiters already saving hours every week with RecruitBot.
          Start free — no credit card required.
        </p>

        <div className="flex items-center justify-center gap-4 flex-wrap">
          <Link
            to="/register"
            className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-8 py-4 
            text-base font-medium transition-all flex items-center gap-2 shadow-lg
             shadow-blue-200 dark:shadow-blue-950 hover:-translate-y-1"
          >
            Start Screening Free 
          </Link>
          <Link
            to="/login"
            className="bg-gray-100 dark:bg-gray-800 hover:bg-gray-200
             dark:hover:bg-gray-700 text-gray-900 dark:text-white rounded-xl px-8 py-4 
             text-base font-medium transition-all hover:-translate-y-1"
          >
            Sign In
          </Link>
        </div>

        <div className="flex items-center justify-center gap-6 mt-10 flex-wrap">
          {[
            " Free to start",
            " No credit card required",
            " Cancel anytime",
          ].map((badge) => (
            <span
              key={badge}
              className="text-sm text-gray-400 dark:text-gray-500 font-medium"
            >
              {badge}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CTASection;
