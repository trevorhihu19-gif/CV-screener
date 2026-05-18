import { useState, useEffect, useRef } from "react";
import { Link, useParams } from "react-router-dom";
import { Navbar } from "../components/Navbar.tsx";
import { getJobById } from "../api/jobs.ts";
import type { Candidate, Job } from "../types/index.ts";
import {
  deleteCandidate,
  getCandidateByJob,
  updateCandidateStatus,
  uploadCV,
} from "../api/candidates.ts";

const statusColors: Record<string, string> = {
  shortlisted: "badge-shortlisted",
  reviewing: "badge-reviewing",
  rejected: "badge-rejected",
  pending: "badge-pending",
};

export const CandidatesPage = () => {
  const { jobId } = useParams<{ jobId: string }>();
  const [job, setJob] = useState<Job | null>(null);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [selected, setSelected] = useState<Candidate | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [showUpload, setShowUpload] = useState<boolean>(false);
  const [uploadError, setUploadError] = useState("");

  const [candidateName, setCandidateName] = useState<string>("");
  const [candidateEmail, setCandidateEmail] = useState<string>("");
  const [cvFile, setCvFile] = useState<File | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!jobId) return;
    fetchData();
  }, [jobId]);

  const fetchData = async () => {
    try {
      const [jobRes, candidatesRes] = await Promise.all([
        getJobById(jobId!),
        getCandidateByJob(jobId!),
      ]);

      if (jobRes.success && jobRes.data) setJob(jobRes.data);
      if (candidatesRes.success && candidatesRes.data) {
        setCandidates(candidatesRes.data);
        if (candidatesRes.data.length > 0) setSelected(candidatesRes.data[0]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpload = async () => {
    setUploadError("");
    if (!candidateName || !candidateEmail || !cvFile) {
      setUploadError("All fields are required");
      return;
    }

    const formData = new FormData();
    formData.append("name", candidateName);
    formData.append("email", candidateEmail);
    formData.append("cv", cvFile);

    setIsUploading(true);
    try {
      const res = await uploadCV(jobId!, formData);
      if (res.success && res.data) {
        setCandidates((prev) => [res.data!, ...prev]);
        setSelected(res.data);
        setCandidateName("");
        setCandidateEmail("");
        setCvFile(null);
        if (fileRef.current) fileRef.current.value = "";
        setShowUpload(false);
      }
    } catch (err) {
      setUploadError("Failed to upload CV");
      console.error(err);
    } finally {
      setIsUploading(false);
    }
  };

  const handleStatusChange = async (id: string, status: string) => {
    try {
      const res = await updateCandidateStatus(id, status);
      if (res.success && res.data) {
        setCandidates((prev) =>
          prev.map((c) => (c._id === id ? res.data! : c)),
        );
        if (selected?._id === id) setSelected(res.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this candidate?")) return;
    try {
      await deleteCandidate(id);
      setCandidates((prev) => prev.filter((c) => c._id !== id));
      if (selected?._id === id) setSelected(null);
    } catch (err) {
      console.error(err);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 75) return "text-green-600";
    if (score >= 50) return "text-amber-500";
    return "text-red-500";
  };

  const getBarColor = (score: number) => {
    if (score >= 75) return "bg-gradient-to-r from-blue-500 to-green-600";
    if (score >= 50) return "bg-gradient-to-r from-amber-400 to-orange-500";
    return "bg-gradient-t0-r from-red-400 to-red-600";
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Navbar />

      <main className="max-w-7xl mx-auto px-6 py-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-2 text-sm text-gray-400 mb-1">
              <Link
                to="/jobs"
                className="hover:text-blue-600 transition-colors"
              >
                Jobs
              </Link>
              <span>-</span>
              <span className="text-gray-600 dark:text-gray-300">
                {job?.title || "Loading..."}
              </span>
            </div>
            <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">
              Candidates
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">
              {candidates.length} CV{candidates.length !== 1 ? "s" : ""}{" "}
              screened
            </p>
          </div>
          <button
            onClick={() => setShowUpload((prev) => !prev)}
            className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-5 py-2.5 text-sm 
            font-medium transition-all flex items-center gap-2"
          >
            {showUpload ? " Cancel" : " Upload CV"}
          </button>
        </div>

        {showUpload && (
          <div
            className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100
           dark:border-gray-800 p-6 mb-8"
          >
            <h2 className="font-bold text-gray-900 dark:text-white mb-5">
              Upload & Screen CV
            </h2>

            {uploadError && (
              <div
                className="mb-4 p-3 bg-red-50 dark:bg-red-950 border border-red-200
               dark:border-red-800 rounded-xl text-red-600 dark:text-red-400 text-sm"
              >
                {uploadError}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Candidate's Name
                </label>
                <input
                  type="text"
                  value={candidateName}
                  onChange={(e) => setCandidateName(e.target.value)}
                  placeholder="Enter Name"
                  className="border border-gray-200 dark:border-gray-700 bg-white
                   dark:bg-gray-800 text-gray-900 dark:text-white rounded-xl px-4 py-3 text-sm 
                   outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100
                    dark:focus:ring-blue-900 transition-all"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Candidate's Email
                </label>
                <input
                  type="email"
                  value={candidateEmail}
                  onChange={(e) => setCandidateEmail(e.target.value)}
                  placeholder="enter Email"
                  className="border border-gray-200 dark:border-gray-700 bg-white
                   dark:bg-gray-800 text-gray-900 dark:text-white rounded-xl px-4 py-3 text-sm 
                   outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100
                    dark:focus:ring-blue-900 transition-all"
                />
              </div>

              <div className="flex flex-col gap-1.5 md:col-span-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  CV File (PDF only, max 5MB)
                </label>
                <input
                  type="file"
                  accept=".pdf"
                  ref={fileRef}
                  title="cv"
                  onChange={(e) => setCvFile(e.target.files?.[0] || null)}
                  className="border border-gray-200 dark:border-gray-700 bg-white 
                  dark:bg-gray-800 text-gray-900 dark:text-white rounded-xl px-4 py-3 text-sm 
                  outline-none transition-all file:mr-4 file:py-1 file:px-3 file:rounded-lg file:border-0 
                  file:text-sm file:font-medium file:bg-blue-50 file:text-blue-600 dark:file:bg-blue-950
                   dark:file:text-blue-400 hover:file:bg-blue-100"
                />
              </div>

              <div className="md:col-span-2">
                <button
                  onClick={handleUpload}
                  disabled={isUploading}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-60 
                  text-white rounded-xl py-3 text-sm font-medium transition-all flex items-center 
                  justify-center gap-2"
                >
                  {isUploading ? (
                    <>
                      <div
                        className="w-4 h-4 border-2 border-white border-t-transparent rounded-full 
                      animate-spin"
                      />
                      Screening CV...
                    </>
                  ) : (
                    "Upload & Screen"
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div
              className="lg:col-span-2 bg-white dark:bg-gray-900 rounded-2xl border
             border-gray-100 dark:border-gray-800 overflow-hidden"
            >
              <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800">
                <h2 className="font-bold text-gray-900 dark:text-white">
                  All Candidates
                </h2>
              </div>

              {candidates.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 gap-3">
                  <span className="text-4xl">📄</span>
                  <p className="text-gray-500 dark:text-gray-400 text-sm">
                    No CVs uploaded yet
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-gray-50 dark:divide-gray-800">
                  {candidates.map((candidate) => (
                    <div
                      key={candidate._id}
                      onClick={() => setSelected(candidate)}
                      className={`flex items-center justify-between px-6 py-4 cursor-pointer 
                        transition-colors ${
                          selected?._id === candidate._id
                            ? "bg-blue-50 dark:bg-blue-950/30"
                            : "hover:bg-gray-50 dark:hover:bg-gray-800/50"
                        }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="w-9 h-9 rounded-full bg-linear-to-br
                         from-blue-200 to-orange-500 flex items-center justify-center text-white 
                         text-xs font-bold shrink-0"
                        >
                          {candidate.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900 dark:text-white text-sm">
                            {candidate.name}
                          </p>
                          <p className="text-xs text-gray-400">
                            {candidate.email}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <span
                          className={`font-bold text-sm ${getScoreColor(candidate.matchScore)}`}
                        >
                          {candidate.matchScore}
                        </span>
                        <span className={statusColors[candidate.status]}>
                          {candidate.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div
              className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100
             dark:border-gray-800 p-6 flex flex-col gap-5 h-fit"
            >
              {!selected ? (
                <div className="flex flex-col items-center justify-center py-10 gap-2">
                  <span className="text-3xl">👈</span>
                  <p className="text-gray-400 text-sm text-center">
                    Select a candidate to view their details
                  </p>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-3">
                    <div
                      className="w-12 h-12 rounded-full bg-linear-to-br
                     from-blue-200 to-orange-500 flex items-center justify-center text-white
                      font-bold text-lg"
                    >
                      {selected.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-bold text-gray-900 dark:text-white">
                        {selected.name}
                      </p>
                      <p className="text-xs text-gray-400">{selected.email}</p>
                    </div>
                  </div>

                  <div
                    className="flex items-center justify-between bg-gray-50 dark:bg-gray-800 
                  rounded-xl p-4"
                  >
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Match Score
                    </span>
                    <span
                      className={`text-3xl font-black ${getScoreColor(selected.matchScore)}`}
                    >
                      {selected.matchScore}
                      <span className="text-sm text-gray-400 font-normal">
                        /100
                      </span>
                    </span>
                  </div>

                  <div className="flex flex-col gap-3">
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">
                      Skill Breakdown
                    </p>
                    {selected.skillBreakdown.map((skill) => (
                      <div key={skill.skill} className="flex flex-col gap-1.5">
                        <div className="flex justify-between text-xs font-medium">
                          <span className="text-gray-700 dark:text-gray-300">
                            {skill.skill}
                          </span>
                          <span className="text-gray-400">{skill.score}%</span>
                        </div>
                        <div className="h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${getBarColor(skill.score)}`}
                            style={{ width: `${skill.score}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="bg-blue-50 dark:bg-blue-950 rounded-xl p-4">
                    <p className="text-xs font-semibold text-blue-600 dark:text-blue-400 mb-2">
                      🤖 AI Summary
                    </p>
                    <p className="text-sm text-blue-800 dark:text-blue-300 leading-relaxed">
                      {selected.aiSummary}
                    </p>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-gray-400 uppercase tracking-widest">
                      Update Status
                    </label>
                    <select
                      value={selected.status}
                      aria-label="Update candidate status"
                      onChange={(e) =>
                        handleStatusChange(selected._id, e.target.value)
                      }
                      className="border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-xl px-4 py-2.5 text-sm outline-none focus:border-blue-500 transition-all"
                    >
                      <option value="pending">Pending</option>
                      <option value="reviewing">Reviewing</option>
                      <option value="shortlisted">Shortlisted</option>
                      <option value="rejected">Rejected</option>
                    </select>
                  </div>

                  <button
                    onClick={() => handleDelete(selected._id)}
                    className="w-full bg-red-50 dark:bg-red-950 hover:bg-red-100 dark:hover:bg-red-900 text-red-500 rounded-xl py-2.5 text-sm font-medium transition-all"
                  >
                    🗑️ Delete Candidate
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
