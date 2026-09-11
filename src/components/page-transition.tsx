"use client";

import { AnimatePresence, motion } from "framer-motion";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { easeOutExpo } from "@/components/ui/motion";

export function PageTransition({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.main
        key={pathname}
        className="flex-1"
        initial={{ opacity: 0, y: 14, scale: 0.99 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -10, scale: 0.99 }}
        transition={{ duration: 0.38, ease: easeOutExpo }}
      >
        {children}
      </motion.main>
    </AnimatePresence>
  );
}
