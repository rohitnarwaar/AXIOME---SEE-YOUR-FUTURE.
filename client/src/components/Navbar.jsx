import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";

export default function Navbar() {
  const location = useLocation();

  const navLinks = [
    { name: "Home", path: "/" },
    { name: "Input", path: "/input" },
    { name: "Upload", path: "/upload" },
    { name: "Dashboard", path: "/dashboard" },
  ];

  return (
    <motion.nav
      initial={{ y: -100, x: "-50%", opacity: 0 }}
      animate={{ y: 0, x: "-50%", opacity: 1 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className="fixed top-4 left-1/2 z-50 w-[90%] max-w-2xl glass-panel text-white px-8 py-3 rounded-full shadow-2xl flex justify-between items-center backdrop-blur-xl bg-black/40"
    >
      <Link to="/" className="text-xl font-bold tracking-tight bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
        LifeLedger
      </Link>

      <div className="flex gap-6">
        {navLinks.map((link) => {
          const isActive = location.pathname === link.path;
          return (
            <Link
              key={link.path}
              to={link.path}
              className={`text-sm font-medium transition-colors ${isActive ? "text-primary bg-white/10 px-3 py-1 rounded-full" : "text-gray-400 hover:text-white px-3 py-1"
                } `}
            >
              {link.name}
            </Link>
          );
        })}
      </div>
    </motion.nav>
  );
}

