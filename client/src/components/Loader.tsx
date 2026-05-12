import { motion } from "framer-motion";

interface LoaderProps {
  onComplete: () => void;
}

export function Loader({ onComplete }: LoaderProps) {
  return (
    <motion.div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background"
      initial={{ opacity: 1 }}
      animate={{ opacity: 0 }}
      transition={{ delay: 2.5, duration: 0.5 }}
      onAnimationComplete={onComplete}
    >
      <div className="relative w-48 h-48 sm:w-64 sm:h-64 flex items-center justify-center">
        {/* Outer Ring */}
        <motion.div
          className="absolute inset-0 border-2 border-primary/20 rounded-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
        />
        
        {/* Middle Ring */}
        <motion.div
          className="absolute inset-4 border border-accent/20 rounded-full"
          animate={{ rotate: -360 }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
        />
        
        {/* Loading Text */}
        <motion.div 
          className="flex flex-col items-center gap-4 z-10"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <motion.div
            className="text-2xl sm:text-4xl font-display font-bold tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-primary via-white to-primary"
            animate={{ backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            style={{ backgroundSize: "200% auto" }}
          >
            INFERA
          </motion.div>
          
          <div className="h-1 w-24 sm:w-32 bg-muted overflow-hidden rounded-full">
            <motion.div
              className="h-full bg-primary"
              initial={{ width: "0%" }}
              animate={{ width: "100%" }}
              transition={{ duration: 2, ease: "easeInOut" }}
            />
          </div>
          
          <motion.p 
            className="text-xs font-mono text-muted-foreground uppercase tracking-[0.2em]"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            Initializing System...
          </motion.p>
        </motion.div>
      </div>
    </motion.div>
  );
}
