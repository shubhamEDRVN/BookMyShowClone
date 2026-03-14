import React from "react";
import { useScrollPosition } from "../../hooks/useCustomHooks";
import "./ScrollToTop.css";

const ScrollToTop = () => {
  const scrollY = useScrollPosition();
  const visible = scrollY > 400;

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (!visible) return null;

  return (
    <button
      className="scroll-to-top animate-fade-in"
      onClick={scrollToTop}
      aria-label="Scroll to top"
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <polyline points="18 15 12 9 6 15" />
      </svg>
    </button>
  );
};

export default ScrollToTop;
