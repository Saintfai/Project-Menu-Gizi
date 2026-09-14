import { motion } from 'framer-motion';

/**
 * PageTransition – wrapper untuk animasi masuk/keluar halaman.
 *
 * Hanya menggunakan opacity agar tidak terjadi layout-shift (geser posisi).
 * Animasi transform (y/scale) dihindari di level halaman karena
 * menyebabkan reflow pada flex-centering yang memicu efek "lompat kiri-kanan".
 *
 * @example
 * export default function MyPage() {
 *   return (
 *     <PageTransition>
 *       <div>konten halaman</div>
 *     </PageTransition>
 *   );
 * }
 */

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
