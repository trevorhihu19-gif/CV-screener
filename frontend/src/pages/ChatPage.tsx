import { useState, useRef, useEffect } from "react";
import { useUser } from "@clerk/clerk-react";
import { Navbar } from "../components/Navbar.tsx";
import { getJobs } from "../api/jobs.ts";
import type { Job } from "../types/index.ts";
import { clearMemory, sendMessage } from "../api/chat.ts";
import type { Message } from "../types/index.ts";

const suggestions = [
  "Who are my top candidates across all jobs?",
  "Show me all shortlisted candidates",
  "Which job has the most applicants?",
  "Find candidates with React experience",
  "Compare candidates for my latest job",
];

export const ChatPage = () => {
  const { user } = useUser();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "Welcome",
      role: "assistant",
      content: `Hi ${user?.fullName?.split(" ")[0]} I'm RecruitBot, your AI hiring assistant. 
            I can help you search candidates, compare CVs, shortlist applicants and answer questions about your recruitment pipeline.
             What would you like to know?`,
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [jobs, setJobs] = useState<Job[]>([])
  const [selectedJobId, setSelectedJobId] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    getJobs().then(res => setJobs(res.data || []));
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const res = await sendMessage(
        userMessage.content,
        selectedJobId || undefined,
      );
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: res.data?.response || res.data?.response || "Sorry i could not process that.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "Something went wrong. Please try again.",
        timestamp: new Date(),
      };
      console.error(err);
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSuggestion = (suggestion: string) => {
    setInput(suggestion);
    inputRef.current?.focus();
  };

  const handleClearMemory = async () => {
    setIsClearing(true);
    try {
      await clearMemory();
      setMessages([
        {
          id: "cleared",
          role: "assistant",
          content:
            "Memory cleared! I've forgotten our previous conversation. How can i help you?",
          timestamp: new Date(),
        },
      ]);
    } catch (err) {
      console.error(err);
    } finally {
      setIsClearing(false);
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("en-KE", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-6 flex flex-col gap-4">
        <div className="flex items-center justify-baseline">
          <div>
            <h1 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">
              RecruitBot
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
              Your AI hiring assistant - ask anything about your candidates
            </p>
          </div>
          <button
            onClick={handleClearMemory}
            disabled={isClearing}
            className="flex items-center gap-2 tex-sm text-gray-400 hover:text-red-500 dark:text-red-400
            transition-colors bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700
            rounded-xl px-4 py-2"
          >
            {isClearing ? (
              <div className="w-3.5 h-3.5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
            ) : (
              ""
            )}
            Clear Memory
          </button>
        </div>

        <div className="px-4 py-2 border-b border-gray-700 flex items-center gap-3">
          <span className="text-sm text-gray-400">Job context:</span>
          <select
            className="text-sm bg-gray-800 text-white rounded px-2 py-1 border border-gray-600"
            value={selectedJobId || ""}
            onChange={(e) => setSelectedJobId(e.target.value)}
            aria-label="Filter by job context"
          >
            <option value="Job">All jobs (no filter)</option>
            {jobs.map((job: Job) => (
              <option key={job.id} value={job.id}>
                {job.title}
              </option>
            ))}
          </select>
        </div>

        <div
          className="flex-1 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100
        dark:border-gray-800 flex flex-col overflow-hidden"
          style={{ minHeight: "500px" }}
        >
          <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold
                            shrink-0 ${
                              msg.role === "assistant"
                                ? "bg-blue-600 text-white"
                                : "bg-linear-to-br from-blue-200 to orange-500 text-white"
                            }`}
                >
                  {msg.role === "assistant" ? (
                    <img src="/icons8-chatbot-48.png" alt="chatbot" />
                  ) : (
                    user?.fullName?.charAt(0).toUpperCase()
                  )}
                </div>

                <div
                  className={`max-w-[75%] flex flex-col gap-1 ${
                    msg.role === "user" ? "items-end" : "items-start"
                  }`}
                >
                  <div
                    className={`rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                      msg.role === "user"
                        ? "bg-blue-600 text-white rounded-tr-sm"
                        : "bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white rounded-tl-sm border border-gray-100 dark:border-gray-700"
                    }`}
                  >
                    {msg.content}
                  </div>
                  <span className="text-xs text-gray-400 px-1">
                    {formatTime(msg.timestamp)}
                  </span>
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex gap-3">
                <div
                  className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-xs
                    shrink-0"
                >
                  <img src="/icons8-chatbot-48.png" alt="chatbot" />
                </div>
                <div
                  className="bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700
                    rounded-2xl rounded-tl-sm px-4 py-3"
                >
                  <div className="flex gap-1.5 items-center h-4">
                    {[0, 1, 2].map((i) => (
                      <div
                        key={1}
                        className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-bounce"
                        style={{ animationDelay: `${i * 0.2}s` }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}

            <div ref={bottomRef} />
          </div>

          {messages.length <= 1 && (
            <div className="px-6 pb-4 flex flex-wrap gap-2">
              {suggestions.map((s) => (
                <button
                  key={s}
                  onClick={() => handleSuggestion(s)}
                  className="text-xs bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400
                        border border-blue-100 dark:border-blue-900 rounded-xl px-3 py-1.5
                        hover:bg-blue-100 dark:hover:bg-blue-900 transition-colors text-left"
                >
                  {s}
                </button>
              ))}
            </div>
          )}

          <div className="border-t border-gray-100 dark:border-gray-800 p-4 flex gap-3">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about your candidates, jobs, or screening results..."
              disabled={isLoading}
              className="flex-1 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700
                text-gray-900 dark:text-white placeholder:text-gary-400 rounded-xl px-4 py-3 text-sm
                outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900
                transition-all disabled:opacity-60"
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed
                text-white rounded-xl px-5 py-3 text-sm font-medium transition-all flex items-center gap-2"
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>Send</>
              )}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};
