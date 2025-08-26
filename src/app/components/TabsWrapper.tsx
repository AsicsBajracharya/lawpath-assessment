'use client';

import { useState, useEffect } from 'react';
import Tabs, { TabKey } from "./Tabs";
import { useLocalStorage } from "../lib/presistence";
import Verifier from "./Verifier";
import Source from "./Source";

export default function TabsWrapper() {
  const [tab, setTab] = useLocalStorage<TabKey>("active-tab", "verifier");
  const [isHydrated, setIsHydrated] = useState(false);

  // Wait for hydration to complete before rendering
  useEffect(() => {
    setIsHydrated(true);
  }, []);

  // Show loading state during hydration
  if (!isHydrated) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <div className="text-sm opacity-70">Loading...</div>
      </div>
    );
  }

  return (
    <>
      <Tabs active={tab} onChange={setTab} />
      {tab === 'verifier' ? <Verifier /> : <Source />}
    </>
  );
}