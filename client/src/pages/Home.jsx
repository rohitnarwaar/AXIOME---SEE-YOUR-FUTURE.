import { Link } from "react-router-dom";
import { motion } from "framer-motion";

export default function Home() {
  return (
    <div className="relative min-h-screen bg-background text-white overflow-hidden flex flex-col justify-center items-center text-center pt-32">

      {/* Background Gradients - Animated */}
      <motion.div
        animate={{ scale: [1, 1.2, 1], rotate: [0, 90, 0] }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-primary/20 blur-[120px] rounded-full pointer-events-none"
      ></motion.div>
      <motion.div
        animate={{ scale: [1, 1.5, 1], rotate: [0, -45, 0] }}
        transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
        className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-secondary/10 blur-[100px] rounded-full pointer-events-none"
      ></motion.div>

      {/* Content */}
      <div className="relative z-10 p-6 max-w-4xl">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-6xl md:text-8xl font-bold tracking-tighter mb-6 bg-gradient-to-br from-white via-gray-200 to-gray-500 bg-clip-text text-transparent"
        >
          Master Your <br />
          <span className="text-primary italic">Financial Future</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-xl text-gray-400 mb-10 max-w-2xl mx-auto leading-relaxed"
        >
          AI-powered forecasting for your savings, loans, and retirement.
          Stop guessing, start <span className="text-white font-medium">projecting</span>.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <Link to="/input">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-4 rounded-full bg-white text-black font-bold text-lg shadow-xl shadow-white/10"
            >
              Start Forecasting
            </motion.button>
          </Link>
          <Link to="/dashboard">
            <motion.button
              whileHover={{ scale: 1.05, backgroundColor: "rgba(255,255,255,0.1)" }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-4 rounded-full glass-panel text-white font-medium border border-white/10"
            >
              View Demo Dashboard
            </motion.button>
          </Link>
        </motion.div>

        {/* Stats / Social Proof */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.8 }}
          className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8 text-gray-500"
        >
          <div>
            <p className="text-3xl font-bold text-white">AI</p>
            <p className="text-sm">Powered Analysis</p>
          </div>
          <div>
            <p className="text-3xl font-bold text-white">100%</p>
            <p className="text-sm">Private & Secure</p>
          </div>
          <div>
            <p className="text-3xl font-bold text-white">10Yr</p>
            <p className="text-sm">Growth Forecasts</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
