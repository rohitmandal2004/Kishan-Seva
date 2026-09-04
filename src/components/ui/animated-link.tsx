"use client";

import React from "react";
import { Link as RouterLink } from "react-router-dom";

import { cn } from "@/lib/utils";

/**
 * Animated Links adapted from Skiper UI for React Router.
 * Original: @skiper-ui/skiper40
 */

/** Link with underline slide-in from left on hover */
const AnimatedLink = ({
  children,
  to,
  href,
  className,
}: {
  children: React.ReactNode;
  to?: string;
  href?: string;
  className?: string;
}) => {
  const classes = cn(
    "group relative inline-flex items-center",
    "before:pointer-events-none before:absolute before:bottom-0 before:left-0 before:h-[0.08em] before:w-full before:bg-current before:content-['']",
    "before:origin-right before:scale-x-0 before:transition-transform before:duration-300 before:ease-[cubic-bezier(0.4,0,0.2,1)]",
    "hover:before:origin-left hover:before:scale-x-100",
    className,
  );

  if (to) {
    return <RouterLink to={to} className={classes}>{children}</RouterLink>;
  }
  return <a href={href} className={classes}>{children}</a>;
};

/** Link with external arrow icon that appears on hover */
const AnimatedExternalLink = ({
  children,
  href,
  className,
}: {
  children: React.ReactNode;
  href: string;
  className?: string;
}) => {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "group relative inline-flex items-center",
        "before:pointer-events-none before:absolute before:left-0 before:bottom-0 before:h-[0.08em] before:w-full before:bg-current before:content-['']",
        "before:origin-right before:scale-x-0 before:transition-transform before:duration-300 before:ease-[cubic-bezier(0.4,0,0.2,1)]",
        "hover:before:origin-left hover:before:scale-x-100",
        className,
      )}
    >
      {children}
      <svg
        className="ml-[0.3em] size-[0.55em] translate-y-1 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100"
        fill="none"
        viewBox="0 0 10 10"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <path
          d="M1.004 9.166 9.337.833m0 0v8.333m0-8.333H1.004"
          stroke="currentColor"
          strokeWidth="1.25"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </a>
  );
};

/** Link with full-width highlight reveal on hover (mix-blend-difference) */
const AnimatedHighlightLink = ({
  children,
  to,
  href,
  className,
}: {
  children: React.ReactNode;
  to?: string;
  href?: string;
  className?: string;
}) => {
  const classes = cn(
    "group relative inline-flex items-center",
    "before:pointer-events-none before:absolute before:left-0 before:w-full before:bg-white before:content-['']",
    "before:origin-left before:transition-all before:duration-300 before:ease-[cubic-bezier(0.4,0,0.2,1)]",
    "before:top-0 before:z-[1] px-2 before:h-full before:scale-x-0 before:mix-blend-difference hover:before:scale-x-100",
    className,
  );

  if (to) {
    return <RouterLink to={to} className={classes}>{children}</RouterLink>;
  }
  return <a href={href} className={classes}>{children}</a>;
};

export { AnimatedLink, AnimatedExternalLink, AnimatedHighlightLink };
