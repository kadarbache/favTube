"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "motion/react";

import { cn } from "@/lib/utils";

type AnimationStyle =
  | "from-bottom"
  | "from-center"
  | "from-top"
  | "from-left"
  | "from-right"
  | "fade"
  | "top-in-bottom-out"
  | "left-in-right-out";

interface HeroVideoProps {
  animationStyle?: AnimationStyle;
  videoSrc: string;
  thumbnailSrc: string;
  thumbnailAlt?: string;
  className?: string;
  children?: React.ReactNode;
}

const animationVariants = {
  "from-bottom": {
    initial: { y: "100%", opacity: 0 },
    animate: { y: 0, opacity: 1 },
    exit: { y: "100%", opacity: 0 },
  },
  "from-center": {
    initial: { scale: 0.5, opacity: 0 },
    animate: { scale: 1, opacity: 1 },
    exit: { scale: 0.5, opacity: 0 },
  },
  "from-top": {
    initial: { y: "-100%", opacity: 0 },
    animate: { y: 0, opacity: 1 },
    exit: { y: "-100%", opacity: 0 },
  },
  "from-left": {
    initial: { x: "-100%", opacity: 0 },
    animate: { x: 0, opacity: 1 },
    exit: { x: "-100%", opacity: 0 },
  },
  "from-right": {
    initial: { x: "100%", opacity: 0 },
    animate: { x: 0, opacity: 1 },
    exit: { x: "100%", opacity: 0 },
  },
  fade: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
  },
  "top-in-bottom-out": {
    initial: { y: "-100%", opacity: 0 },
    animate: { y: 0, opacity: 1 },
    exit: { y: "100%", opacity: 0 },
  },
  "left-in-right-out": {
    initial: { x: "-100%", opacity: 0 },
    animate: { x: 0, opacity: 1 },
    exit: { x: "100%", opacity: 0 },
  },
};

export function HeroVideoDialog({
  animationStyle = "from-center",
  videoSrc,
  thumbnailSrc,
  thumbnailAlt = "Video thumbnail",
  className,
  children,
}: HeroVideoProps) {
  const [isVideoOpen, setIsVideoOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const selectedAnimation = animationVariants[animationStyle];
  const triggerRef = useRef<HTMLButtonElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  // The overlay portals into document.body, which doesn't exist while the
  // server renders this component.
  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!isVideoOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsVideoOpen(false);
    };
    document.addEventListener("keydown", onKeyDown);

    // A fixed overlay doesn't stop the page underneath from scrolling, which on
    // a touch screen means the thumbnail grid slides around behind the player.
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    closeRef.current?.focus();

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
      triggerRef.current?.focus();
    };
  }, [isVideoOpen]);

  return (
    <div className={cn("relative", className)}>
      <button
        ref={triggerRef}
        type="button"
        aria-label="Play video"
        className="group relative block w-full cursor-pointer overflow-hidden rounded-[var(--radius)] border-0 bg-transparent p-0"
        onClick={() => setIsVideoOpen(true)}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={thumbnailSrc}
          alt={thumbnailAlt}
          className="aspect-video w-full object-cover transition-all duration-200 ease-out group-hover:brightness-[0.8]"
          loading="lazy"
        />
        <div className="absolute inset-0 flex scale-[0.9] items-center justify-center transition-all duration-200 ease-out group-hover:scale-100">
          <span className="flex size-11 items-center justify-center rounded-[50%] bg-black/45 backdrop-blur-md transition-transform duration-200 ease-out group-hover:scale-110">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="ml-0.5 text-white"
            >
              <path d="M8 5v14l11-7z" />
            </svg>
          </span>
        </div>
        {children}
      </button>
      {/* Portalled to the body: an ancestor with its own z-index (the landing
          page's stacked sections) would otherwise trap the overlay beneath the
          sticky nav. */}
      {mounted &&
        createPortal(
          <AnimatePresence>
            {isVideoOpen && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsVideoOpen(false)}
                className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-3 backdrop-blur-md sm:p-4"
              >
                {/* The width cap keeps a 16:9 box inside 80dvh, so a phone held
                    sideways gets a player that fits rather than one that
                    overflows the viewport. */}
                <motion.div
                  {...selectedAnimation}
                  transition={{ type: "spring", damping: 30, stiffness: 300 }}
                  onClick={(e) => e.stopPropagation()}
                  role="dialog"
                  aria-modal="true"
                  aria-label="Video player"
                  className="relative aspect-video w-full max-w-[min(56rem,calc(80dvh*16/9))]"
                >
                  {/* Above the frame's own z-[1], and tucked inside it on small
                      screens where -top-12 would sit off the top edge. */}
                  <button
                    ref={closeRef}
                    type="button"
                    aria-label="Close video"
                    onClick={() => setIsVideoOpen(false)}
                    className="absolute right-2 top-2 z-10 rounded-[50%] bg-neutral-900/50 p-2 text-white ring-1 ring-white/20 backdrop-blur-md sm:-top-12 sm:right-0"
                  >
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                    >
                      <path d="M18 6 6 18M6 6l12 12" />
                    </svg>
                  </button>
                  <div className="relative isolate z-[1] size-full overflow-hidden rounded-2xl border-2 border-white">
                    <iframe
                      src={videoSrc}
                      title="Video player"
                      className="size-full"
                      allowFullScreen
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    />
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>,
          document.body,
        )}
    </div>
  );
}
