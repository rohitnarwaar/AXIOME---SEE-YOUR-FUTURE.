import { Link, useNavigate } from "react-router-dom";
import { motion, useScroll, useTransform } from "framer-motion";
import { useAuth } from "../contexts/AuthContext";
import CassetteImage from '../assets/CASST.png';
import CircleImage from '../assets/CIRCLE.png';
import { useState, useEffect, useRef } from 'react';

export default function Home() {
  const { scrollYProgress } = useScroll();
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  const [activeStep, setActiveStep] = useState(0);
  const stepRefs = useRef([]);

  useEffect(() => {
    const observers = [];

    stepRefs.current.forEach((ref, index) => {
      if (!ref) return;

      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setActiveStep(index);
          }
        },
        {
          rootMargin: "-40% 0px -40% 0px", // Trigger when item is near center
          threshold: 0
        }
      );

      observer.observe(ref);
      observers.push(observer);
    });

    return () => observers.forEach(obs => obs.disconnect());
  }, []);

  // Visual Progression States
  // Early (0-3): Distant, blurred, darker
  // Middle (4-8): Clear, balanced, presence
  // Late (9-12): Bright, ethereal, resolved
  const getVisualState = (index) => {
    if (index <= 3) {
      // Early: I-IV
      return {
        scale: 0.8 + (index * 0.05), // 0.8 -> 0.95
        blur: 8 - (index * 2),       // 8px -> 2px
        brightness: 0.7 + (index * 0.05), // 0.7 -> 0.85
        rotate: index * 2
      };
    } else if (index <= 8) {
      // Middle: V-IX
      const progress = index - 4;
      return {
        scale: 1,
        blur: 0,
        brightness: 1,
        rotate: 10 + (progress * 5)
      };
    } else {
      // Late: X-XIII
      const progress = index - 9;
      return {
        scale: 1 + (progress * 0.05), // 1 -> 1.15
        blur: progress * 1,           // 0 -> 3px (dreamy blur)
        brightness: 1 + (progress * 0.1), // 1 -> 1.3
        rotate: 35 + (progress * 10)
      };
    }
  };

  const visualState = getVisualState(activeStep);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Failed to log out:', error);
    }
  };

  // Transform scroll progress to RGB values
  // 0-0.1: Red -> White
  // 0.1-0.65: White Background + Black Text (Maximized contrast zone for Models)
  // 0.65-0.7: Transition to Black (BIOS Section starts here)
  const backgroundColor = useTransform(
    scrollYProgress,
    [0, 0.1, 0.65, 0.7],
    ['rgb(220, 38, 38)', 'rgb(255, 255, 255)', 'rgb(255, 255, 255)', 'rgb(0, 0, 0)']
  );

  const textColor = useTransform(
    scrollYProgress,
    [0, 0.1, 0.65, 0.7],
    ['rgb(255, 255, 255)', 'rgb(0, 0, 0)', 'rgb(0, 0, 0)', 'rgb(255, 255, 255)']
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
            AXIOMÉ(ax-i-oh-may)is a personal system for modeling the present and reasoning about the future.
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

        {/* Models & Scenarios Section */}
        <motion.div className="flex gap-16 items-start pb-40 relative" style={{ marginLeft: '15%', marginRight: '15%', color: textColor }}>

          {/* Sticky Visual Lens */}
          <motion.div
            className="sticky top-0 w-1/2 h-screen flex flex-col items-center justify-center"
            style={{ color: textColor }}
          >
            <h3 className="text-sm tracking-widest mb-12 font-light text-center z-10" style={{ fontFamily: '"Source Code Pro", monospace' }}>
              MODELS & SCENARIOS
            </h3>
            <div className="relative w-[400px] h-[400px] rounded-full overflow-hidden border border-white/10">
              <motion.img
                src={CircleImage}
                alt="Trajectory Lens"
                className="w-full h-full object-cover"
                animate={{
                  scale: visualState.scale,
                  filter: `blur(${visualState.blur}px) brightness(${visualState.brightness})`,
                  rotate: visualState.rotate
                }}
                transition={{ duration: 1.5, ease: "easeInOut" }} // Slow, non-reactive
              />

              {/* Optional overlay for extra atmosphere */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
            </div>
          </motion.div>

          {/* Scrollable Content List */}
          <motion.div
            className="w-1/2 pt-[10vh] pb-[10vh] pl-12"
            style={{ color: textColor }}
          >

            <div className="space-y-24" style={{ fontFamily: '"Source Code Pro", monospace' }}>
              {[
                { date: '01  /  I', city: 'Present State Model', desc: 'Baseline financial reality.' },
                { date: '02  /  II', city: 'Income & Expense Structure', desc: 'Categorized inflows & outflows.' },
                { date: '03  /  III', city: 'Cash Flow Patterns', desc: 'Timing & liquidity analysis.' },
                { date: '04  /  IV', city: 'Savings Forecast', desc: 'Projected accumulation curves.' },
                { date: '05  /  V', city: 'Spending Behaviour Signals', desc: 'Habitual anomalies detected.' },
                { date: '06  /  VI', city: 'Risk Indicators', desc: 'Volatility & exposure stress-tests.' },
                { date: '07  /  VII', city: 'Short-Term Outlook', desc: '3-12 month liquidity horizon.' },
                { date: '08  /  VIII', city: 'Long-Term Projections', desc: 'Multi-decade compound trajectories.' },
                { date: '09  /  IX', city: 'Loan Payoff Path', desc: 'Debt extinction timeline.' },
                { date: '10  /  X', city: 'Retirement Projection', desc: 'Post-work sustainability model.' },
                { date: '11  /  XI', city: 'Net Worth Trajectory', desc: 'Total asset evolution.' },
                { date: '12  /  XII', city: 'What-If Scenarios', desc: 'Alternative reality simulation.' },
                { date: '13  /  XIII', city: 'Decision Notes', desc: 'Synthesized actionable intelligence.' }
              ].map((show, index) => (
                <div
                  key={index}
                  ref={el => stepRefs.current[index] = el}
                  className={`transition-opacity duration-1000 ${index === activeStep ? 'opacity-100' : 'opacity-30'}`}
                >
                  <div className="flex flex-col gap-2">
                    <span className="text-xs tracking-widest opacity-50">{show.date}</span>
                    <span className="text-xl font-light">{show.city}</span>
                    <p className="text-sm opacity-60 max-w-xs leading-relaxed">{show.desc}</p>
                    <a href="#" className="text-xs hover:opacity-70 transition-opacity mt-2 block">View Analysis →</a>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
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
              { title: 'Present Snapshot', image: 'https://placehold.co/300x200/222222/666666/png?text=Snapshot' },
              { title: 'Savings Over Time', image: 'https://placehold.co/300x200/222222/666666/png?text=Savings' },
              { title: 'Debt & Payoff Paths', image: 'https://placehold.co/300x200/222222/666666/png?text=Debt' },
              { title: 'Future Scenerios', image: 'https://placehold.co/300x200/222222/666666/png?text=Future' }
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
          className="pb-2"
          style={{ marginLeft: '15%', marginRight: '15%', color: textColor }}
        >
          <h3 className="text-xl tracking-widest mb-2 font-light uppercase text-center" style={{ fontFamily: '"Source Code Pro", monospace' }}>
            SEE YOUR FUTURE — BEFORE YOU LIVE IT.
          </h3>

          {/* Cassette Image */}
          <div className="flex justify-center">
            <div className="w-full max-w-5xl">
              <img
                src={CassetteImage}
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
    </motion.div >
  );
}
