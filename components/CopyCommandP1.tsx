"use client";
import { useState } from "react";

export default function CopyCommandP1({ command }: { command: string }) {
  const [copied, setCopied] = useState(false);
  async function copy() {
    try {
      await navigator.clipboard.writeText(command);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch { setCopied(false); }
  }
  return (
    <div className="group flex items-center justify-between gap-4 border-l-2 border-coral bg-white/60 px-4 py-3 font-mono text-[13px]">
      <code className="text-ink"><span className="text-coral">$</span> {command}</code>
      <button onClick={copy} className="shrink-0 coord text-ink/40 transition group-hover:text-coral" aria-label="Copier">{copied ? "✓ copié" : "copier"}</button>
    </div>
  );
}
