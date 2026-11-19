import React, { useState } from "react";
import { Check, Copy } from "lucide-react";

export default function SqlViewer({ sql }) {
  const [copied, setCopied] = useState(false);
  if (!sql || typeof sql !== "string") return null;

  // Guard: Only render if it looks like a valid read-only SQL query
  const trimmed = sql.trim().toUpperCase();
  if (!trimmed.startsWith("SELECT") && !trimmed.startsWith("WITH")) {
    return null;
  }

  const copy = async () => {
    await navigator.clipboard.writeText(sql);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="rounded-lg border border-[#E2E8F0] dark:border-[#1F2630] overflow-hidden">
      <div className="flex items-center justify-between px-3 py-1.5 bg-[#F8FAFC] dark:bg-[#10171F] text-[#0F172A] dark:text-[#F2F4F7] text-xs">
        <span className="font-medium">Generated SQL</span>
        <button onClick={copy} className="inline-flex items-center gap-1 hover:underline cursor-pointer">
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-[#10B981] dark:text-[#3CCB7F]" />
              <span>Copied</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>
      <pre className="p-3 text-xs overflow-x-auto bg-[#0B0F14] text-[#F2F4F7]">
        <code>{sql}</code>
      </pre>
    </div>
  );
}
