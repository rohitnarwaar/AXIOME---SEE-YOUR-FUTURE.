import { Link } from "react-router-dom";
import { motion, useScroll, useTransform } from "framer-motion";

export default function Home() {
  const { scrollYProgress } = useScroll();

  // Transform scroll progress to RGB values
  // 0% scroll = red, 50% scroll = white, 100% scroll = black
  const backgroundColor = useTransform(
    scrollYProgress,
    [0, 0.5, 1],
    ['rgb(220, 38, 38)', 'rgb(255, 255, 255)', 'rgb(0, 0, 0)']
  );

  const textColor = useTransform(
    scrollYProgress,
    [0, 0.5, 1],
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
          <Link to="/input" className="hover:opacity-70 transition-opacity">Start</Link>
          <Link to="/dashboard" className="hover:opacity-70 transition-opacity">Dashboard</Link>
          <a href="#info" className="hover:opacity-70 transition-opacity">Contact</a>
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
          className="space-y-4 max-w-2xl"
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
      </div>
    </motion.div>
  );
}
