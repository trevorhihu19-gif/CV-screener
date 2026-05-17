import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Navbar } from "../components/Navbar.tsx";
import { getJobs, createJob, deleteJob } from "../api/jobs.ts";
import type { Job } from "../types/index.ts";

export const JobsPage = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [showForm, setShowForm] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState("");

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [requirementsInput, setRequirementsInput] = useState("");

  useEffect(() => {
    fetchJobs();
  }, []);

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

  const handleCreateJob = async () => {
    setError("");
    if (!title || !description) {
      setError("Title and description are required");
      return;
    }

    const requirements = requirementsInput
      .split(",")
      .map((r) => r.trim())
      .filter((r) => r.length > 0);

    setIsSubmitting(true);
    try {
      const res = await createJob(title, description, requirements);
      if (res.success && res.data) {
        setJobs((prev) => [res.data!, ...prev]);
        setTitle("");
        setDescription("");
        setRequirementsInput("");
        setShowForm(false);
      } else {
        setError(res.message || "Failed to create job");
      }
    } catch (err) {
      console.error(err);
      setError("Failed to create job");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteJob = async (id: string) => {
    if (!confirm("Are you sure you want to delete this job?")) return;
    try {
      await deleteJob(id);
      setJobs((prev) => prev.filter((j) => j._id !== id));
    } catch (err) {
      console.error(err);
      setError("Failed to delete job");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Navbar />

      <main className="max-w-7xl mx-auto px-6 py-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">
              Jobs
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">
              Manage your job listings and screen candidates
            </p>
          </div>

          <button
            onClick={() => setShowForm((prev) => !prev)}
            className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-5 py-2.5
                        text-sm font-medium transition-all flex items-center gap-2"
          >
            {showForm ? "X cancel" : " New Job"}
          </button>
        </div>

        {showForm && (
          <div
            className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100  dark:border-gray-800
                    p-6 mb-8"
          >
            <h2 className="font-bold text-gray-900 dark:text-white mb-5">
              Create New Job
            </h2>

            {error && (
              <div
                className="mb-4 p-3 bg-red-50 dark:bg-red-600 border border-red-200 
                            dark:border-red-800 rounded-xl text-red-600 dark:text-red-400 text-sm"
              >
                {error}
              </div>
            )}

            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Job Title
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Title"
                  className="border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800
                                text-gray-900 dark:text-white rounded-xl px-4 py-3 text-sm
                                    outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 
                                    dark:focus:ring-blue-900 transition-all"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Job Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe the role, responsibilities and what you're looking for..."
                  rows={4}
                  className="border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800
                   text-gray-900 dark:text-white rounded-xl px-4 py-3 text-sm outline-none focus:border-blue-500 
                   focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900 transition-all resize-none"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Requirements
                  <span className="text-gray-400 font-normal ml-1">
                    (comma separated)
                  </span>
                </label>
                <input
                  type="text"
                  value={requirementsInput}
                  onChange={(e) => setRequirementsInput(e.target.value)}
                  placeholder="Enter skills"
                  className="border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800
                         text-gray-900 dark:text-white rounded-xl px-4 py-3 text-sm outline-none
                          focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900 transition-all"
                />
              </div>

              <button
                onClick={handleCreateJob}
                disabled={isSubmitting}
                className="bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white rounded-xl py-3
                text-sm font-medium transition-all flex items-center justify-center gap-2 mt-1"
              >
                {isSubmitting ? (
                  <>
                    <div
                      className="w-4 h-4 border-2 border-white border-t-transparent rounded-full
                        animate-spin"
                    />
                    Creating...
                  </>
                ) : (
                  "Create Job"
                )}
              </button>
            </div>
          </div>
        )}

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : jobs.length === 0 ? (
          <div
            className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800
            flex flex-col items-center justify-center py-20 gap-3"
          >
            <span className="text-5xl">💼</span>
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              No jobs yet - create your first one
            </p>
          </div>
        ) : (
          <div className="grid grid-cols md:grid-cols-2 lg:grid-cols-3 gap-5">
            {jobs.map((job) => (
              <div
                key={job._id}
                className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100
                    dark:border-gray-800 p-6 flex flex-col gap-4 hover:shadow-md transition-all"
              >
                <div>
                  <h3 className="font-bold text-gray-900 dark:text-white text-base">
                    {job.title}
                  </h3>
                  <p className="text-gary-400 text-xs mt-1">
                    {new Date(job.createdAt).toLocaleDateString("en-KE", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </p>
                </div>

                <p className="text-gray-500 dark:text-gray-400 text-sm line-clamp-2">
                  {job.description}
                </p>

                <div className="flex flex-wrap gap-2">
                  {job.requirements.slice(0, 4).map((req) => (
                    <span
                      key={req}
                      className="bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400
                                        text-xs font-medium rounded-lg px-2.5 py-1"
                    >
                      {req}
                    </span>
                  ))}
                  {job.requirements.length > 4 && (
                    <span className="text-xs text-gray-400 py-1">
                      +{job.requirements.length - 4} more
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-3 mt-auto pt-2 border-t border-gray-50 dark:border-gray-800">
                  <Link
                    to={`/jobs/${job._id}/candidates`}
                    className="flex-1 text-center bg-blue-600 hover:bg-blue-700 text-white
                                    rounded-xl py-2 text-sm font-medium transition-all"
                  >
                    View Candidates
                  </Link>

                  <button
                    onClick={() => handleDeleteJob(job._id)}
                    className="w-8 h-9 rounded-xl bg-red-50 dark:bg-red-950 text-red-500
                                    hover:bg-red-200 dark:hover:bg-red-900 flex items-center justify-center
                                    transition-all text-sm"
                    title="Delete job"
                  >
                    🗑
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};
