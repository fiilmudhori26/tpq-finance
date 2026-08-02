"use client";

import { useState } from "react";
import Sidebar from "./sidebar";
import Navbar from "./navbar";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex min-h-screen flex-col md:pl-64">
        <Navbar onMenuClick={() => setSidebarOpen(true)} />
        <main className="mx-auto w-full max-w-[1280px] flex-1 p-4 md:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
