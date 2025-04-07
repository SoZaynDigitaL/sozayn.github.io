/**
 * Animation utility functions for SoZayn app
 */

// Delivery path animation delays
export const getDeliveryPathAnimationDelay = (index: number): string => {
  const delays = [0, -4, -2];
  return `${delays[index % delays.length]}s`;
};

// Delivery node animation delays
export const getDeliveryNodeAnimationDelay = (index: number): string => {
  const delays = [-1, -3, -6];
  return `${delays[index % delays.length]}s`;
};

// Float animation for dashboard card
export const getDashboardCardAnimation = (
  hover: boolean
): { transform: string; boxShadow: string } => {
  return {
    transform: hover
      ? "perspective(1200px) rotateY(-4deg) rotateX(2deg) translateY(-10px)"
      : "perspective(1200px) rotateY(-8deg) rotateX(3deg)",
    boxShadow: hover 
      ? "0 15px 50px rgba(0, 0, 0, 0.4)" 
      : "0 8px 32px rgba(0, 0, 0, 0.35)",
  };
};

// Staggered animation for features
export const getStaggeredAnimation = (index: number): { delay: string } => {
  return {
    delay: `${0.1 * index}s`,
  };
};

// Heartbeat animation for real-time data
export const pulseAnimation = {
  "0%": { transform: "scale(1)" },
  "50%": { transform: "scale(1.05)" },
  "100%": { transform: "scale(1)" },
};

// Fade in animation for elements
export const fadeInAnimation = {
  "0%": { opacity: 0, transform: "translateY(10px)" },
  "100%": { opacity: 1, transform: "translateY(0)" },
};

// Progress bar animation
export const progressAnimation = (percent: number): { from: { width: string }, to: { width: string } } => {
  return {
    from: { width: "0%" },
    to: { width: `${percent}%` },
  };
};

// Chart bar animation
export const chartBarAnimation = (height: number): { from: { height: string }, to: { height: string } } => {
  return {
    from: { height: "0px" },
    to: { height: `${height}px` },
  };
};
