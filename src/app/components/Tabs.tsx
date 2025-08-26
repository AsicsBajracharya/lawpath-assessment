"use client";

import clsx from "clsx";

export type TabKey = "verifier" | "source";

export default function Tabs({
  active,
  onChange,
}: {
  active: TabKey;
  onChange: (t: TabKey) => void;
}) {
  const base = "px-4 py-2 rounded-xl text-sm font-medium";
  return (
    <div className="flex gap-2 bg-gray-100 p-1 rounded-2xl w-fit">
      <button
        className={clsx(
          base,
          active === "verifier" ? "bg-white shadow" : "opacity-70"
        )}
        onClick={() => onChange("verifier")}
      >
        Verifier
      </button>
      <button
        className={clsx(
          base,
          active === "source" ? "bg-white shadow" : "opacity-70"
        )}
        onClick={() => onChange("source")}
      >
        Source
      </button>
    </div>
  );
}
