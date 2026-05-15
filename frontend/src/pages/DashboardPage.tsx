import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.tsx";
import { Navbar } from "../components/Navbar.tsx";
import { getJobs } from "../api/jobs.ts";
import type { Job } from "../types/index.ts";

export const DashboardPage = () => {
  const { user } = useAuth();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const res = await getJobs();
        if (res.success && res.data) setJobs(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchJobs();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Navbar />

      <main className="max--7xl mx-auto px-6 py-10">
        <div className="flex items-center justify-between mb-10">
          <div>
            <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">
              Welcome back, {user?.name.split(" ")[0]}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1 text-sm">
              Here's an overview of your screening activity
            </p>
          </div>
          <Link
            to="/jobs"
            className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-5 py-2.5
                        text-sm font-medium transition-all flex items-center gap-2"
          >
            + New Job
          </Link>
        </div>

        <div className="grid grid-cols sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
          {[
            {
              label: "Total Jobs",
              value: jobs.length,
              icon: "💼",
              color: "bg-blue-50 dark:bg-blue-950 text-blue-600",
            },
            {
              label: "Total CVs",
              value: "—",
              icon: "📄",
              color: "bg-purple-50 dark:bg-purple-950 text-purple-600",
            },
            {
              label: "Shortlisted",
              value: "—",
              icon: "✅",
              color: "bg-green-50 dark:bg-green-950 text-green-600",
            },
            {
              label: "Time Saved",
              value: "—",
              icon: "⏱",
              color: "bg-amber-50 dark:bg-amber-950 text-amber-600",
            },
          ].map((kpi) => (
            <div
              key={kpi.label}
              className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100
            dark:border-gray-800 p-6"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-gray-700 uppercase tracking-widest">
                  {kpi.label}
                </span>
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center text-lg ${kpi.color}`}
                >
                  {kpi.icon}
                </div>
              </div>
              <div className="text-3xl font-black text-gray-900 dark:text-white">
                {kpi.value}
              </div>
            </div>
          ))}
        </div>

        <div
          className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800
        overflow-hidden"
        >
          <div
            className="flex items-center justify-between px-6 py-4 border-b border-gray-100
            dark:border-gray-800"
          >
            <h2 className="font-bold text-gray-900 dark:text-white">
              Your Jobs
            </h2>
            <Link
              to="/jobs"
              className="text-sm text-blue-600 hover:underline font-medium"
            >
              View all
            </Link>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <div
                className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full
                    animate-spin"
              ></div>
            </div>
          ) : jobs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <span className="text-4xl"></span>
              <p className="text-gray-500 dark:text-gray-400 text-sm">
                No jobs yet 😞- create your first one
              </p>
              <Link
                to="/jobs"
                className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-4 py-2 text-sm
                        font-medium transition-all mt-1"
              >
                + Create Job
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-gray-50 dark:divide-gray-800">
              {jobs.map((job) => (
                <div
                  key={job._id}
                  className="flex items-center justify-between px-6 py-4 hover:bg-gray-50 *:
                            dark:hover:bg-gray-800/50 transition-colors"
                >
                  <div>
                    <p className="font-semi-bold text-gray-900 dark:text-white text-sm">
                      {job.title}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {job.requirements.slice(0, 3).join(" . ")}
                    </p>
                  </div>
                  <Link
                    to={`/jobs/${job._id}/candidates`}
                    className="text-sm text-blue-600 hover:underline font-medium"
                  >
                    View Candidates
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};
