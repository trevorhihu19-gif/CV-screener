import { motion } from "framer-motion";


export default function SplashScreen() {
  return (
    <motion.div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white dark:bg-gray-950"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6 }}
    >
      <motion.img
        src="/icons8-chatbot-48.png"
        alt="RecruitBot"
        className="w-40 h-40 object-contain"
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{
          scale: [0.5, 1.1, 1],
          opacity: 1,
          rotate: [0, 5, -5, 0],
        }}
        transition={{
          duration: 1.5,
          ease: "easeOut",
        }}
      />
      <motion.h1
        className="mt-6 text-4xl font-bold text-blue-600"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        RecruitBot
      </motion.h1>

      <motion.p
        className="mt-2 text-gray-500 dark:text-gray-400"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
      >
        AI-Powered CV Screening
      </motion.p>
      <div className="mt-8 h-2 w-64 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-800">
        <motion.div
          className="h-full bg-blue-600"
          initial={{ width: "0%" }}
          animate={{ width: "100%" }}
          transition={{ duration: 2.5 }}
        />
      </div>
    </motion.div>
  );
}