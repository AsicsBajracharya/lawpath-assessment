import LogsPanel from "./components/LogsPanel";
import TabsWrapper from "./components/TabsWrapper";

export default function Home() {
  // const [tab, setTab] = useLocalStorage<TabKey>('active-tab', 'verifier');
  return (
    <div className="font-sans flex flex-col items-center justify-items-center min-h-screen p-8 pb-20 gap-12 sm:p-20">
        <TabsWrapper />
        <LogsPanel />
    </div>
  );
}
