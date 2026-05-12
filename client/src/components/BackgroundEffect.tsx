import { motion } from "framer-motion";

export function BackgroundEffect() {
  return (
    <div className="fixed inset-0 z-[-1] overflow-hidden pointer-events-none">
      {/* Grid Overlay */}
      <div className="absolute inset-0 bg-grid-pattern opacity-20" />
      
      {/* Radial Gradient overlay to fade edges */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,hsl(var(--background))_100%)]" />

      {/* Floating Orbs */}
      <motion.div 
        className="absolute top-1/4 left-1/4 w-[250px] h-[250px] sm:w-[500px] sm:h-[500px] bg-primary/10 rounded-full blur-[60px] sm:blur-[100px]"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.5, 0.3],
          x: [0, 50, 0],
          y: [0, -30, 0],
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
      
      <motion.div 
        className="absolute bottom-1/4 right-1/4 w-[200px] h-[200px] sm:w-[400px] sm:h-[400px] bg-accent/5 rounded-full blur-[50px] sm:blur-[80px]"
        animate={{
          scale: [1.2, 1, 1.2],
          opacity: [0.2, 0.4, 0.2],
          x: [0, -40, 0],
          y: [0, 40, 0],
        }}
        transition={{
          duration: 18,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
      
      {/* Tech Lines */}
      <div className="absolute inset-0 opacity-10">
        <svg width="100%" height="100%">
          <pattern id="tech-lines" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
            <path d="M100 0 L0 100" stroke="currentColor" strokeWidth="0.5" fill="none" />
          </pattern>
          <rect width="100%" height="100%" fill="url(#tech-lines)" />
        </svg>
      </div>
    </div>
  );
}
