"use client";
import { useEffect, useRef, useState, type ReactNode } from "react";

export default function Reveal({ children, delay = 0 }: { children: ReactNode; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setVisible(true); obs.disconnect(); }
    }, { threshold: 0.12 });
    obs.observe(node);
    return () => obs.disconnect();
  }, []);
  return <div ref={ref} className={`reveal ${visible ? "in" : ""}`} style={{ transitionDelay: `${delay}ms` }}>{children}</div>;
}
