import { useEffect } from "react";

const HIDE_DELAY_MS = 800;

export default function ScrollbarAutoHide() {
  useEffect(() => {
    let hideTimer = null;

    const onScroll = () => {
      document.documentElement.classList.add("is-scrolling");
      clearTimeout(hideTimer);
      hideTimer = setTimeout(() => {
        document.documentElement.classList.remove("is-scrolling");
      }, HIDE_DELAY_MS);
    };

    window.addEventListener("scroll", onScroll, { passive: true, capture: true });
    return () => {
      window.removeEventListener("scroll", onScroll, { capture: true });
      clearTimeout(hideTimer);
    };
  }, []);

  return null;
}
