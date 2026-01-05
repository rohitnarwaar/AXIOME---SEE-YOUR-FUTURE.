import { Link, useNavigate } from "react-router-dom";
import { motion, useScroll, useTransform } from "framer-motion";
import { useAuth } from "../contexts/AuthContext";

export default function Home() {
  const { scrollYProgress } = useScroll();
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Failed to log out:', error);
    }
  };

  // Transform scroll progress to RGB values
  // 0% scroll = red, 40% scroll = white, 70% scroll = black
  const backgroundColor = useTransform(
    scrollYProgress,
    [0, 0.31, 0.35],
    ['rgb(220, 38, 38)', 'rgb(255, 255, 255)', 'rgb(0, 0, 0)']
  );

  const textColor = useTransform(
    scrollYProgress,
    [0, 0.31, 0.35],
    ['rgb(255, 255, 255)', 'rgb(0, 0, 0)', 'rgb(255, 255, 255)']
  );

  return (
    <motion.div
      className="min-h-[200vh]"
      style={{ backgroundColor }}
    >

      {/* Navigation */}
      <motion.nav
        className="relative z-20 flex justify-between items-center py-6"
        style={{
          color: textColor,
          paddingLeft: '10%',
          paddingRight: '10%'
        }}
      >
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="text-sm tracking-widest"
          style={{ fontFamily: '"Source Code Pro", monospace' }}
        >
          ONE'S OWN
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="flex gap-8 text-sm tracking-wide"
          style={{ fontFamily: '"Source Code Pro", monospace' }}
        >
          {currentUser ? (
            <>
              <Link to="/dashboard" className="hover:opacity-70 transition-opacity">Dashboard</Link>
              <button onClick={handleLogout} className="hover:opacity-70 transition-opacity">Logout</button>
            </>
          ) : (
            <>
              <Link to="/login" className="hover:opacity-70 transition-opacity">Login</Link>
              <Link to="/register" className="hover:opacity-70 transition-opacity">Register</Link>
            </>
          )}

          <button
            onClick={(e) => {
              e.preventDefault();
              const contactSection = document.getElementById('contact');
              if (contactSection) {
                contactSection.scrollIntoView({ behavior: 'smooth' });
              }
            }}
            className="hover:opacity-70 transition-opacity"
          >
            Contact
          </button>
        </motion.div>
      </motion.nav>

      {/* Hero Section - Centered */}
      <div className="relative z-10 flex w-full min-h-screen px-6">
        <div className="flex flex-col justify-center w-full">
          <motion.h1
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.2, delay: 0.3 }}
            className="w-full text-[6rem] sm:text-[8rem] md:text-[10rem] lg:text-[12rem] xl:text-[14rem] font-bold tracking-tight leading-none text-center"
            style={{
              WebkitTextStroke: '2px',
              WebkitTextStrokeColor: textColor,
              WebkitTextFillColor: 'transparent',
              letterSpacing: '0.0em'
            }}
          >
            AXIOMÉ
          </motion.h1>
        </div>
      </div>

      {/* Bottom Left Content - Scrolls with page */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.8 }}
        className="absolute z-50"
        style={{ bottom: '64px', left: '15%', color: textColor }}
      >
        <p className="text-xs tracking-widest mb-1 font-light">COMPOSED OF:</p>
        <p className="text-sm leading-relaxed" style={{ fontFamily: '"Source Code Pro", monospace' }}>
          Models · Forecasts · Scenarios
        </p>
      </motion.div>

      {/* INFO Section - Appears on scroll */}
      <div className="" style={{ marginTop: '-15vh' }}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: false, amount: 0.3 }}
          className="space-y-2 max-w-2xl"
          style={{ marginLeft: '15%', color: textColor }}
        >
          <h3 className="text-xs tracking-widest font-light uppercase">INFO</h3>
          <p className="text-sm leading-relaxed" style={{ fontFamily: '"Source Code Pro", monospace' }}>
            AXIOMÉ is a personal system for modeling the present and reasoning about the future.
          </p>
          <p className="text-sm leading-relaxed" style={{ fontFamily: '"Source Code Pro", monospace' }}>
            It brings together fragmented financial signals into a coherent structure — allowing patterns, risks, and possibilities to surface over time. Rather than recording what has already happened, AXIOMÉ focuses on exploring what could happen, and why.<br />
            Designed as a thinking companion, the system helps individuals understand consequences before decisions are made, offering clarity without noise and foresight without prescription.
          </p>
        </motion.div>

        {/* Horizontal Line Separator */}
        <motion.div
          initial={{ opacity: 0, scaleX: 0 }}
          whileInView={{ opacity: 1, scaleX: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          viewport={{ once: false }}
          className="h-px mt-16 mb-16"
          style={{
            width: '70%',
            marginLeft: '15%',
            backgroundColor: textColor,
            opacity: 0.3,
            transformOrigin: 'left'
          }}
        />

        {/* Tour Dates Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: false, amount: 0.2 }}
          className="flex gap-16 items-center pb-20"
          style={{ marginLeft: '15%', marginRight: '15%', color: textColor }}
        >
          {/* Circular Image */}
          <div className="flex-shrink-0">
            <div
              className="w-80 h-80 rounded-full overflow-hidden bg-gray-200"
              style={{ border: `2px solid ${textColor}` }}
            >
              <img
                src="https://via.placeholder.com/400"
                alt="Tour"
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* Tour Dates List */}
          <div className="flex-1">
            <h3 className="text-sm tracking-widest mb-8 font-light text-left" style={{ fontFamily: '"Source Code Pro", monospace' }}>
              MODELS & SCENARIOS
            </h3>
            <div className="space-y-2" style={{ fontFamily: '"Source Code Pro", monospace' }}>
              {[
                { date: '01  /  I', city: 'Present State Model' },
                { date: '02  /  II', city: 'Income & Expense Structure' },
                { date: '03  /  III', city: 'Cash Flow Patterns' },
                { date: '04  /  IV', city: 'Savings Forecast' },
                { date: '05  /  V', city: 'Spending Behaviour Signals' },
                { date: '06  /  VI', city: 'Risk Indicators' },
                { date: '07  /  VII', city: 'Short-Term Outlook' },
                { date: '08  /  VIII', city: 'Long-Term Projections' },
                { date: '09  /  IX', city: 'Loan Payoff Path' },
                { date: '10  /  X', city: 'Retirement Projection' },
                { date: '11  /  XI', city: 'Net Worth Trajectory' },
                { date: '12  /  XII', city: 'What-If Scenarios' },
                { date: '13  /  XIII', city: 'Decision Notes' }
              ].map((show, index) => (
                <div key={index} className="flex justify-between items-center text-xs py-1">
                  <span className="w-20">{show.date}</span>
                  <span className="flex-1 text-left">{show.city}</span>
                  <a href="#" className="hover:opacity-70 transition-opacity">View →</a>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Horizontal Line Separator */}
        <motion.div
          initial={{ opacity: 0, scaleX: 0 }}
          whileInView={{ opacity: 1, scaleX: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          viewport={{ once: false }}
          className="h-px mt-16 mb-16"
          style={{
            width: '70%',
            marginLeft: '15%',
            backgroundColor: textColor,
            opacity: 0.3,
            transformOrigin: 'left'
          }}
        />

        {/* BIOS Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: false, amount: 0.2 }}
          className="pb-20"
          style={{ marginLeft: '15%', marginRight: '15%', color: textColor }}
        >
          <h3 className="text-2xl tracking-widest mb-8 font-light uppercase" style={{ fontFamily: '"Source Code Pro", monospace' }}>
            BIOS
          </h3>

          <div className="space-y-8 text-base" style={{ fontFamily: '"Source Code Pro", monospace' }}>
            {/* Team Member 1 */}
            <div>
              <p className="mb-2">AXIOMÉ (The System)</p>
              <p className="opacity-80">Helps people clearly see where their money stands today and what it could look like in the future.</p>
            </div>

            {/* Team Member 2 */}
            <div>
              <p className="mb-2">Present State</p>
              <p className="opacity-80">Brings income, expenses, savings, and debts together so nothing important is hidden.</p>
            </div>

            {/* Team Member 3 */}
            <div>
              <p className="mb-2">Future Outlook</p>
              <p className="opacity-80">Shows how current habits may shape finances over time, without requiring complex planning.</p>
            </div>

            {/* Team Member 4 */}
            <div>
              <p className="mb-2">Scenarios</p>
              <p className="opacity-80">Allows people to explore different choices and see possible outcomes before committing.</p>
            </div>
          </div>
        </motion.div>

        {/* MUSIC VIDEOS Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: false, amount: 0.2 }}
          className="pb-20"
          style={{ marginLeft: '15%', marginRight: '15%', color: textColor }}
        >
          <h3 className="text-2xl tracking-widest mb-12 font-light uppercase" style={{ fontFamily: '"Source Code Pro", monospace' }}>
            EXPLORATIONS:
          </h3>

          {/* Video Grid */}
          <div className="grid grid-cols-4 gap-8">
            {[
              { title: 'Present Snapshot', image: 'https://via.placeholder.com/300x200' },
              { title: 'Savings Over Time', image: 'https://via.placeholder.com/300x200' },
              { title: 'Debt & Payoff Paths', image: 'https://via.placeholder.com/300x200' },
              { title: 'Future Scenerios', image: 'https://via.placeholder.com/300x200' }
            ].map((video, index) => (
              <a
                key={index}
                href="#"
                className="group"
              >
                <div className="mb-3 overflow-hidden bg-gray-200">
                  <img
                    src={video.image}
                    alt={video.title}
                    className="w-full aspect-[3/2] object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
                <p className="text-xs text-center" style={{ fontFamily: '"Source Code Pro", monospace' }}>
                  {video.title}
                </p>
                <p className="text-xs text-center opacity-70 mt-1" style={{ fontFamily: '"Source Code Pro", monospace' }}>
                  →
                </p>
              </a>
            ))}
          </div>
        </motion.div>

        {/* Horizontal Line Separator */}
        <motion.div
          initial={{ opacity: 0, scaleX: 0 }}
          whileInView={{ opacity: 1, scaleX: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          viewport={{ once: false }}
          className="h-px mt-16 mb-16"
          style={{
            width: '70%',
            marginLeft: '15%',
            backgroundColor: textColor,
            opacity: 0.3,
            transformOrigin: 'left'
          }}
        />

        {/* Cassette Tape Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: false, amount: 0.2 }}
          className="pb-20"
          style={{ marginLeft: '15%', marginRight: '15%', color: textColor }}
        >
          <h3 className="text-xs tracking-widest mb-12 font-light uppercase text-center" style={{ fontFamily: '"Source Code Pro", monospace' }}>
            THE INKWELL ECHOES: DISCOVER THE EP.
          </h3>

          {/* Cassette Image */}
          <div className="flex justify-center">
            <div className="w-full max-w-2xl">
              <img
                src="https://via.placeholder.com/800x500"
                alt="Cassette Tape"
                className="w-full h-auto"
              />
            </div>
          </div>
        </motion.div>

        {/* Horizontal Line Separator */}
        <motion.div
          initial={{ opacity: 0, scaleX: 0 }}
          whileInView={{ opacity: 1, scaleX: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          viewport={{ once: false }}
          className="h-px mt-16 mb-16"
          style={{
            width: '70%',
            marginLeft: '15%',
            backgroundColor: textColor,
            opacity: 0.3,
            transformOrigin: 'left'
          }}
        />

        {/* Footer Section */}
        <motion.footer
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: false }}
          id="contact"
          className="pb-12"
          style={{ marginLeft: '15%', marginRight: '15%', color: textColor }}
        >
          <div className="flex justify-between items-start" style={{ fontFamily: '"Source Code Pro", monospace' }}>
            {/* Logo */}
            <div className="flex-shrink-0">
              <div className="text-2xl font-bold tracking-tight">
                AXIOMÉ
              </div>
            </div>

            {/* Contact Information */}
            <div className="flex gap-24 text-xs">
              <div>
                <p className="mb-1">Management:</p>
                <p>hello@axiome.com</p>
              </div>
              <div>
                <p className="mb-1">Booking US:</p>
                <p>hello@axiome.com</p>
              </div>
              <div>
                <p className="mb-1">Booking EU:</p>
                <p>hello@axiome.com</p>
              </div>
              <div>
                <p className="mb-1">Rights:</p>
                <p>All rights reserved</p>
              </div>
            </div>
          </div>
        </motion.footer>
      </div>
    </motion.div>
  );
}
