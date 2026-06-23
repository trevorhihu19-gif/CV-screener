import { Link, useNavigate } from "react-router-dom";
import { useUser, useClerk } from "@clerk/clerk-react";
import { useTheme } from "../context/ThemeContext.tsx";

export const Navbar = () => {
  const { user } = useUser();
  const { signOut } = useClerk();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleLogout = () => {
   signOut(() => navigate("/home"))
  };

  return (
    <nav
      className="sticky top-0 z-50 bg-white/85 dark:bg-gray-900/85 backdrop-blur-md border-b border-gray-100
        dark:border-gray-800"
    >
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center gap-8">
        <Link to="/dashboard" className="flex items-center gap-1 mr-auto">
          <span className="font-black text-xl tracking-tight text-gray-900 dark:text-white">
            RecruitBot
          </span>
          <img src="/icons8-chatbot-48.png" alt="chatbot" className="w-5 h-5 object-contain"/>
        </Link>

        <Link
          to="/"
          className="text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-gray-900
                    dark:hover:text-white transition-colors"
        >
          Home
        </Link>

        <Link
          to="/dashboard"
          className="text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-gray-900
                    dark:hover:text-white transition-colors"
        >
          Dashboard
        </Link>

        <Link
          to="/jobs"
          className="text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-gray-900
                    dark:hover:text-white transition-colors"
        >
          Jobs
        </Link>

        <Link
          to="/chat"
          className="text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
        >
          ChatBot
        </Link>

        <button
          onClick={toggleTheme}
          className="w-9 h-9 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center
                    dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all"
          title="ToggleTheme"
        >
          {isDark ? "☀️" : "🌙"}
        </button>

        <div className="flex items-center gap-3">
          <div
            className="w-8 h-8 rounded-full bg-linear-to-br from-blue-200 to-orange-500
                    flex items-center justify-center text-white text-xs font-bold"
          >
            {user?.firstName?.charAt(0).toUpperCase()}
          </div>
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {user?.firstName}
          </span>

          <button
            onClick={handleLogout}
            className="text-sm text-gray-400 dark:text-gray-500 hover:text-red-500
                        dark:hover:text-red-400 transition-colors"
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
};
