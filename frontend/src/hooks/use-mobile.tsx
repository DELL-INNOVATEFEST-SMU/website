import * as React from "react";

const BREAKPOINTS = {
  xs: 480, // Small phones
  sm: 640, // Large phones
  md: 768, // Tablets
  lg: 1024, // Small laptops
  xl: 1280, // Desktops
  "2xl": 1536, // Large desktops
} as const;

type Breakpoint = keyof typeof BREAKPOINTS;

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(
    undefined
  );

  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${BREAKPOINTS.md - 1}px)`);
    const onChange = () => {
      setIsMobile(window.innerWidth < BREAKPOINTS.md);
    };
    mql.addEventListener("change", onChange);
    setIsMobile(window.innerWidth < BREAKPOINTS.md);
    return () => mql.removeEventListener("change", onChange);
  }, []);

  return !!isMobile;
}

/**
 * Enhanced responsive hook that provides detailed breakpoint information
 * and device type detection for better responsive design
 */
export function useResponsive() {
  const [breakpoint, setBreakpoint] = React.useState<Breakpoint>("md");

  React.useEffect(() => {
    const updateBreakpoint = () => {
      const width = window.innerWidth;
      if (width < BREAKPOINTS.xs) setBreakpoint("xs");
      else if (width < BREAKPOINTS.sm) setBreakpoint("sm");
      else if (width < BREAKPOINTS.md) setBreakpoint("md");
      else if (width < BREAKPOINTS.lg) setBreakpoint("lg");
      else if (width < BREAKPOINTS.xl) setBreakpoint("xl");
      else setBreakpoint("2xl");
    };

    updateBreakpoint();
    window.addEventListener("resize", updateBreakpoint);
    return () => window.removeEventListener("resize", updateBreakpoint);
  }, []);

  return {
    breakpoint,
    isMobile: ["xs", "sm"].includes(breakpoint),
    isTablet: breakpoint === "md",
    isDesktop: ["lg", "xl", "2xl"].includes(breakpoint),
    isSmallMobile: breakpoint === "xs",
    isLargeMobile: breakpoint === "sm",
    isLargeDesktop: ["xl", "2xl"].includes(breakpoint),
    width: typeof window !== "undefined" ? window.innerWidth : 0,
  };
}
