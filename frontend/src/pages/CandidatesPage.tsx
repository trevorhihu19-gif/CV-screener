import { useEffect, useState, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { Navbar } from "../components/Navbar.tsx";
import {
  getCandidateByJob,
  uploadCV,
  updateCandidateStatus,
  deleteCandidate,
  bulkUploadCVs,
} from "../api/candidates.ts";
import { getJobById } from "../api/jobs.ts";
import { sendMessage } from "../api/chat.ts";
import type { Candidate, Job, BulkUploadResult } from "../types/index.ts";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
}

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
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [isBulkUploading, setIsBulkUploading] = useState(false);
  const [uploadMode, setUploadMode] = useState<"single" | "bulk">("single");
  const [showUpload, setShowUpload] = useState(false);
  const [uploadError, setUploadError] = useState("");

  const [candidateName, setCandidateName] = useState("");
  const [candidateEmail, setCandidateEmail] = useState("");
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [bulkFiles, setBulkFiles] = useState<File[]>([]);
  const [bulkResults, setBulkResults] = useState<BulkUploadResult[]>([]);
  const fileRef = useRef<HTMLInputElement>(null);

  const [showChat, setShowChat] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!jobId) return;

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

    fetchData();
  }, [jobId]);

  useEffect(() => {
    if (!job) return;
    setChatMessages((prevMessages) => {
      if (prevMessages.length > 0) return prevMessages;

      return [
        {
          id: "welcome",
          role: "assistant",
          content: `Hi! I'm RecruitBot\nI can see you're reviewing candidates for **${job.title}**. 
          I have full access to all ${candidates.length} candidate${candidates.length !== 1 ? "s" : ""}
           screened for this role.\nAsk me anything — who to shortlist, compare candidates, or get a hiring summary!`,
        },
      ];
    });
  }, [job, candidates.length, setChatMessages]);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages, isChatLoading]);

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
        setSelected(res.data!);
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

  const handleBulkUpload = async () => {
    if (bulkFiles.length === 0) return;
    setIsBulkUploading(true);
    setBulkResults([]);
    try {
      const res = await bulkUploadCVs(jobId!, bulkFiles);
      console.log("Bulk upload response:", res);

      if (res.success && res.data) {
        const candidates = res.data.candidates || [];
        console.log("Candidates:", candidates);
        setBulkResults(candidates);
        const newCandidates = candidates.map((r:BulkUploadResult) => ({
          id: r.id,
          job_id: jobId!,
          name: r.name,
          email: r.email,
          cv_path: "",
          match_score: r.match_score,
          skill_breakdown: [],
          ai_summary: r.ai_summary,
          status: r.status,
          created_at: new Date().toISOString(),
        })) as Candidate[];
        
        setCandidates((prev) => [...newCandidates, ...prev]);
        setBulkFiles([]);
        if (fileRef.current) fileRef.current.value = "";
      }
    } catch {
      setUploadError("Bulk upload failed.Please try again");
    } finally {
      setIsBulkUploading(false);
    }
  };

  const handleStatusChange = async (id: string, status: string) => {
    try {
      const res = await updateCandidateStatus(id, status);
      if (res.success && res.data) {
        setCandidates((prev) => prev.map((c) => (c.id === id ? res.data! : c)));
        if (selected?.id === id) setSelected(res.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this candidate?")) return;
    try {
      await deleteCandidate(id);
      setCandidates((prev) => prev.filter((c) => c.id !== id));
      if (selected?.id === id) setSelected(null);
    } catch (err) {
      console.error(err);
    }
  };

  const handleChatSend = async () => {
    if (!chatInput.trim() || isChatLoading) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content: chatInput.trim(),
    };

    setChatMessages((prev) => [...prev, userMsg]);
    setChatInput("");
    setIsChatLoading(true);

    try {
      const res = await sendMessage(userMsg.content, jobId);
      setChatMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: res.data?.response || "Sorry, I could not process that.",
        },
      ]);
    } catch {
      setChatMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: "Something went wrong. Please try again.",
        },
      ]);
    } finally {
      setIsChatLoading(false);
    }
  };

  const scrollToChat = () => {
    const chatSection = document.getElementById("recruitbot-chat-section");
    if (chatSection) {
      chatSection.scrollIntoView({ behavior: "smooth" });
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 75) return "text-green-600";
    if (score >= 50) return "text-amber-500";
    return "text-red-500";
  };

  const getBarColor = (score: number) => {
    if (score >= 75) return "bg-gradient-to-r from-blue-500 to-green-500";
    if (score >= 50) return "bg-gradient-to-r from-amber-400 to-orange-500";
    return "bg-gradient-to-r from-red-400 to-red-600";
  };

  const suggestions = [
    "Who should I shortlist?",
    "Give me a hiring summary",
    "Who has the highest score?",
    "Reject candidates below 50",
  ];

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
              <span>→</span>
              <span className="text-gray-600 dark:text-gray-300">
                {job?.title || "Loading..."}
              </span>
            </div>
            <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">
              Candidates
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">
              {candidates.length} CV
              {candidates.length !== 1 ? "s" : ""} screened
            </p>
          </div>
          <button
            onClick={() => setShowUpload((prev) => !prev)}
            className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-5 py-2.5 text-sm 
            font-medium transition-all flex items-center gap-2"
          >
            {showUpload ? "Cancel" : "Upload CV"}
          </button>
        </div>

        {showUpload && (
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6 mb-8">
            <h2 className="font-bold text-gray-900 dark:text-white mb-4">
              Upload & Screen CVs
            </h2>

            <div className="flex gap-2 mb-5">
              <button
                onClick={() => setUploadMode("single")}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  uploadMode === "single"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400"
                }`}
              >
                Single CV
              </button>
              <button
                onClick={() => setUploadMode("bulk")}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  uploadMode === "bulk"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400"
                }`}
              >
                Bulk Upload
              </button>
            </div>

            {uploadError && (
              <div className="mb-4 p-3 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-xl text-red-600 dark:text-red-400 text-sm">
                {uploadError}
              </div>
            )}

            {uploadMode === "single" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Candidate Name
                  </label>
                  <input
                    type="text"
                    value={candidateName}
                    onChange={(e) => setCandidateName(e.target.value)}
                    placeholder="Enter candidate's Name"
                    className="border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder:text-gray-400 rounded-xl px-4 py-3 text-sm outline-none focus:border-blue-500 transition-all"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Candidate Email
                  </label>
                  <input
                    type="email"
                    value={candidateEmail}
                    onChange={(e) => setCandidateEmail(e.target.value)}
                    placeholder="Enter candidate's Email"
                    className="border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder:text-gray-400 rounded-xl px-4 py-3 text-sm outline-none focus:border-blue-500 transition-all"
                  />
                </div>
                <div className="flex flex-col gap-1.5 md:col-span-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    CV File (PDF or DOCX)
                  </label>
                  <input
                    type="file"
                    accept=".pdf,.docx"
                    ref={fileRef}
                    onChange={(e) => setCvFile(e.target.files?.[0] || null)}
                    aria-label="file"
                    className="border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-xl px-4 py-3 text-sm outline-none transition-all file:mr-4 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-600 dark:file:bg-blue-950 dark:file:text-blue-400"
                  />
                </div>
                <div className="md:col-span-2">
                  <button
                    onClick={handleUpload}
                    disabled={isUploading}
                    className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white rounded-xl py-3 text-sm font-medium transition-all flex items-center justify-center gap-2"
                  >
                    {isUploading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Screening CV...
                      </>
                    ) : (
                      "Upload & Screen"
                    )}
                  </button>
                </div>
              </div>
            )}

            {uploadMode === "bulk" && (
              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    CV Files (PDF or DOCX — select multiple)
                    <span className="text-gray-400 font-normal ml-1">
                      max 20 files
                    </span>
                  </label>
                  <input
                    type="file"
                    accept=".pdf,.docx"
                    multiple
                    ref={fileRef}
                    onChange={(e) =>
                      setBulkFiles(Array.from(e.target.files || []))
                    }
                    aria-label="file"
                    className="border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-xl px-4 py-3 text-sm outline-none transition-all file:mr-4 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-600 dark:file:bg-blue-950 dark:file:text-blue-400"
                  />
                </div>

                {bulkFiles.length > 0 && (
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-3">
                    <p className="text-xs font-semibold text-gray-500 mb-2">
                      {bulkFiles.length} file{bulkFiles.length > 1 ? "s" : ""}{" "}
                      selected:
                    </p>
                    <div className="flex flex-col gap-1 max-h-32 overflow-y-auto">
                      {bulkFiles.map((file, i) => (
                        <div
                          key={i}
                          className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400"
                        >
                          <span>📄</span>
                          <span>{file.name}</span>
                          <span className="text-gray-400">
                            ({(file.size / 1024).toFixed(0)}KB)
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <button
                  onClick={handleBulkUpload}
                  disabled={isBulkUploading || bulkFiles.length === 0}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white rounded-xl py-3 text-sm font-medium transition-all flex items-center justify-center gap-2"
                >
                  {isBulkUploading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Screening {bulkFiles.length} CVs...(this may take a minute)
                    </>
                  ) : (
                    `Screen ${bulkFiles.length || 0} CV${bulkFiles.length !== 1 ? "s" : ""}`
                  )}
                </button>

                {bulkResults.length > 0 && (
                  <div className="bg-green-50 dark:bg-green-950 rounded-xl p-4">
                    <p className="text-sm font-bold text-green-700 dark:text-green-400 mb-3">
                      Screened {bulkResults.length} candidates
                    </p>
                    <div className="flex flex-col gap-2">
                      {bulkResults.map((r) => (
                        <div
                          key={r.id}
                          className="bg-white dark:bg-gray-900 rounded-xl px-4 py-3 flex items-center 
                          justify-between"
                        >
                          <div>
                            <p className="text-sm font-semibold text-gray-900 dark:text-white">
                              {r.name}
                            </p>
                            <p className="text-xs text-gray-400">{r.email}</p>
                            <p className="text-xs text-gray-500 mt-1 line-clamp-1">
                              {r.ai_summary}
                            </p>
                          </div>
                          <div className="text-right shrink-0 ml-4">
                            <p
                              className={`text-lg font-black ${
                                r.match_score >= 75
                                  ? "text-green-600"
                                  : r.match_score >= 50
                                    ? "text-amber-500"
                                    : "text-red-500"
                              }`}
                            >
                              {r.match_score}
                            </p>
                            <span
                              className={
                                statusColors[r.status] || "badge-pending"
                              }
                            >
                              {r.status}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div
                className="lg:col-span-2 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100
               dark:border-gray-800 overflow-hidden"
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
                        key={candidate.id}
                        onClick={() => setSelected(candidate)}
                        className={`flex items-center justify-between px-6 py-4 cursor-pointer transition-colors ${
                          selected?.id === candidate.id
                            ? "bg-blue-50 dark:bg-blue-950/30"
                            : "hover:bg-gray-50 dark:hover:bg-gray-800/50"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className="w-9 h-9 rounded-full bg-linear-to-br from-blue-200 to-orange-500
                           flex items-center justify-center text-white text-xs font-bold shrink-0"
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
                            className={`font-bold text-sm ${getScoreColor(candidate.match_score)}`}
                          >
                            {candidate.match_score}
                          </span>
                          <span className={statusColors[candidate.status]}>
                            {candidate.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex justify-center my-8">
                  <button
                    onClick={scrollToChat}
                    className="w-10 h-10 rounded-full border-2 border-gray-200 dark:border-gray-700
                              flex items-center justify-center text-gray-400 hover:border-blue-500
                              hover:text-blue-500 transition-all duration-300 cursor-pointer animate-bounce"
                    aria-label="Scroll to RecruitBot Chat"
                  >
                    ↓
                  </button>
                </div>
              </div>

              <div
                className="bg-white dark:bg-gray-900 rounded-2xl border
               border-gray-100 dark:border-gray-800 p-6 flex flex-col gap-5 h-fit"
              >
                {!selected ? (
                  <div className="flex flex-col items-center justify-center py-10 gap-2">
                    <span className="text-3xl">
                      <img src="/icons8-arrow-left-94.png" alt="arrow-left" />
                    </span>
                    <p className="text-gray-400 text-sm text-center">
                      Select a candidate to view details
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center gap-3">
                      <div
                        className="w-12 h-12 rounded-full bg-linear-to-br
                       from-blue-200 to-orange-500 flex items-center justify-center text-white font-bold 
                       text-lg"
                      >
                        {selected.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-bold text-gray-900 dark:text-white">
                          {selected.name}
                        </p>
                        <p className="text-xs text-gray-400">
                          {selected.email}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
                      <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        Match Score
                      </span>
                      <span
                        className={`text-3xl font-black ${getScoreColor(selected.match_score)}`}
                      >
                        {selected.match_score}
                        <span className="text-sm text-gray-400 font-normal">
                          /100
                        </span>
                      </span>
                    </div>

                    <div className="flex flex-col gap-3">
                      <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">
                        Skill Breakdown
                      </p>
                      {selected.skill_breakdown.map((skill) => (
                        <div
                          key={skill.skill}
                          className="flex flex-col gap-1.5"
                        >
                          <div className="flex justify-between text-xs font-medium">
                            <span className="text-gray-700 dark:text-gray-300">
                              {skill.skill}
                            </span>
                            <span className="text-gray-400">
                              {skill.score}%
                            </span>
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
                        <img src="/icons8-chatbot-48.png" alt="chatbot" />
                        AI Summary
                      </p>
                      <p className="text-sm text-blue-800 dark:text-blue-300 leading-relaxed">
                        {selected.ai_summary}
                      </p>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-semibold text-gray-400 uppercase tracking-widest">
                        Update Status
                      </label>
                      <select
                        value={selected.status}
                        onChange={(e) =>
                          handleStatusChange(selected.id, e.target.value)
                        }
                        aria-label="Update candidate status"
                        className="border border-gray-200 dark:border-gray-700 bg-white
                         dark:bg-gray-800 text-gray-900 dark:text-white rounded-xl px-4 py-2.5 text-sm 
                         outline-none focus:border-blue-500 transition-all"
                      >
                        <option value="pending">Pending</option>
                        <option value="reviewing">Reviewing</option>
                        <option value="shortlisted">Shortlisted</option>
                        <option value="rejected">Rejected</option>
                      </select>
                    </div>

                    <button
                      onClick={() => handleDelete(selected.id)}
                      className="w-full bg-red-50 dark:bg-red-950 hover:bg-red-100
                       dark:hover:bg-red-900 text-red-500 rounded-xl py-2.5 text-sm font-medium transition-all"
                    >
                      Delete Candidate
                    </button>
                  </>
                )}
              </div>
            </div>

            <div
              id="recruitbot-chat-section"
              className="mt-6 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100
             dark:border-gray-800 overflow-hidden"
            >
              <button
                onClick={() => setShowChat((prev) => !prev)}
                className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50
                 dark:hover:bg-gray-800 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-8 h-8 rounded-full overflow-hidden
                  items-center justify-center text-white text-sm font-bold"
                  >
                    <img
                      src="/icons8-chatbot-48.png"
                      alt="chatbot"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="text-left">
                    <p className="font-bold text-gray-900 dark:text-white text-sm">
                      RecruitBot
                    </p>
                    <p className="text-xs text-gray-400">
                      AI hiring assistant — knows all candidates for this job
                    </p>
                  </div>
                </div>
                <span className="text-gray-400 text-xs font-medium">
                  {showChat ? "▼ Hide" : "▲ Open Chat"}
                </span>
              </button>

              {showChat && (
                <div className="border-t border-gray-100 dark:border-gray-800">
                  <div className="h-80 overflow-y-auto p-4 flex flex-col gap-3">
                    {chatMessages.map((msg) => (
                      <div
                        key={msg.id}
                        className={`flex gap-4 items-start ${
                          msg.role === "user" ? "justify-end" : "justify-start"
                        }`}
                      >
                        {msg.role !== "user" && (
                          <div className="w-8 h-8 rounded-full overflow-hidden shrink-0 mt-1 bg-blue-500/20">
                            <img
                              src="/icons8-chatbot-48.png"
                              alt="chatbot"
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}
                        <div
                          className={`max-w-[75%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
                            msg.role === "user"
                              ? "bg-blue-600 text-white rounded-br-sm"
                              : "bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-bl-sm"
                          }`}
                        >
                          {msg.content}
                        </div>
                      </div>
                    ))}

                    {isChatLoading && (
                      <div className="flex justify-start">
                        <div className="bg-gray-100 dark:bg-gray-800 rounded-2xl rounded-bl-sm px-4 py-3">
                          <div className="flex gap-1 items-center h-4">
                            <div
                              className="w-2 h-2 bg-blue-500-400 rounded-full animate-bounce"
                              style={{ animationDelay: "0ms" }}
                            />
                            <div
                              className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"
                              style={{ animationDelay: "150ms" }}
                            />
                            <div
                              className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"
                              style={{ animationDelay: "300ms" }}
                            />
                          </div>
                        </div>
                      </div>
                    )}
                    <div ref={chatBottomRef} />
                  </div>

                  <div className="px-4 pb-2 flex flex-wrap gap-2">
                    {suggestions.map((suggestion) => (
                      <button
                        key={suggestion}
                        onClick={() => setChatInput(suggestion)}
                        className="text-xs bg-blue-50 dark:bg-blue-950 text-blue-600
                         dark:text-blue-400 rounded-lg px-3 py-1.5 hover:bg-blue-100
                          dark:hover:bg-blue-900 transition-colors"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>

                  <div className="px-4 pb-4 flex gap-2">
                    <input
                      type="text"
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      onKeyDown={(e) =>
                        e.key === "Enter" && !e.shiftKey && handleChatSend()
                      }
                      placeholder="Ask about candidates, scores, recommendations..."
                      className="flex-1 border border-gray-200 dark:border-gray-700 
                      bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white 
                      placeholder:text-gray-400 rounded-xl px-4 py-2.5 text-sm outline-none
                       focus:border-blue-500 transition-all"
                    />
                    <button
                      onClick={handleChatSend}
                      disabled={isChatLoading || !chatInput.trim()}
                      className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50
                       text-white rounded-xl px-4 py-2.5 text-sm font-medium transition-all"
                    >
                      Send
                    </button>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  );
};
