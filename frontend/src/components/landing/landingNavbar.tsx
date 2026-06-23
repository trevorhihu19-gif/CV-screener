import { Link } from "react-router-dom";
import { useTheme } from "../../context/ThemeContext.tsx";

const LandingNavbar = () => {
  const { isDark, toggleTheme } = useTheme();
 
  return (
    <nav
      className="sticky top-0 z-50 bg-white/85 dark:bg-gray-950/85 backdrop-blur-md border-b
        border-gray-100 dark:border-gray-800"
    >
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center gap-8">
        <div className="mr-auto flex items-center gap-1">
          <span className="font-black text-xl tracking-tight text-gray-900 dark:text-white">
            Recruit Bot
          </span>
          <img src="/icons8-chatbot-48.png" alt="chatbot" className="w-5 h-5 object-contain"/>
        </div>

        <a
          href="#home"
          className="text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-gray-900
                 dark:hover:text-white transition-colors hidden md:block"
        >
          Home
        </a>
        
        <Link
          to="/dashboard"
          className="text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-gray-900
                    dark:hover:text-white transition-colors"
        >
          Dashboard
        </Link>
        <a
          href="#features"
          className="text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-gray-900
                 dark:hover:text-white transition-colors hidden md:block"
        >
          Features
        </a>
        <a
          href="#about"
          className="text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-gray-900
                 dark:hover:text-white transition-colors hidden md:block"
        >
          About
        </a>
        <a
          href="#pricing"
          className="text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-gray-900
                 dark:hover:text-white transition-colors hidden md:block"
        >
          Pricing
        </a>

        <button
          onClick={toggleTheme}
          className="w-9 h-9 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center
            text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all"
          title="Toggle theme"
        >
          {isDark ? "☀️" : "🌙"}
        </button>

        <Link
          to="/login"
          className="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-gray-900
            dark:hover:text-white transition-colors hidden md:block"
        >
          Sign In
        </Link>
        <Link
          to="/register"
          className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-4 py-2 text-sm font-medium
            transition-all"
        >
          Get started
        </Link>
      </div>
    </nav>
  );
};

export default LandingNavbar;
