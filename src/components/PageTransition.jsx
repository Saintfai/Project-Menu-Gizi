/**
 * NAMA FILE: PageTransition.jsx
 * FUNGSI UTAMA: Komponen pembungkus animasi transisi antar halaman.
 * 
 * DETAIL:
 * - Menggunakan library animasi (Framer Motion) untuk memberikan efek pergantian halaman yang mulus.
 * - Meningkatkan estetika dan pengalaman pengguna (UX) secara keseluruhan.
 */
import { motion } from 'framer-motion';



const pageVariants = {
  initial: {
    opacity: 0,
  },
  animate: {
    opacity: 1,
    transition: {
      duration: 0.25,
      ease: 'easeOut',
    },
  },
  exit: {
    opacity: 0,
    transition: {
      duration: 0.15,
      ease: 'easeIn',
    },
  },
};

export default function PageTransition({ children, className = '' }) {
  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className={className}
      style={{ willChange: 'opacity' }}
    >
      {children}
    </motion.div>
  );
}
