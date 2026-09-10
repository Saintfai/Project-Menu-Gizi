import { motion } from 'framer-motion';

/**
 * PageTransition – wrapper untuk animasi masuk/keluar halaman.
 *
 * Gunakan ini sebagai pembungkus paling luar dari setiap komponen halaman.
 * Cukup bungkus seluruh return JSX halaman dengan <PageTransition>.
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
    y: 12,
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.28,
      ease: [0.25, 0.46, 0.45, 0.94], // easeOutQuad — terasa natural
    },
  },
  exit: {
    opacity: 0,
    y: -8,
    transition: {
      duration: 0.18,
      ease: [0.55, 0, 1, 0.45], // easeInQuad — keluar sedikit lebih cepat
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
    >
      {children}
    </motion.div>
  );
}
