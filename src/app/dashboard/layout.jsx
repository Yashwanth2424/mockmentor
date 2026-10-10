"use client";

import { useState } from "react";
import ThemeToggle from "@/components/ThemeToggle";
import Sidebar from "@/components/Sidebar";
import useSWR from "swr";
import { Menu } from "lucide-react";
import "./layout.css";

const fetcher = async (url) => {
      const res = await fetch(url);
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || "Request failed");
      return json.data;
};

export default function DashboardLayout({ children }) {
      const [open, setOpen] = useState(false);

      // Pre-warm SWR cache so child pages don't hit loading gaps
      useSWR("/api/me", fetcher, { revalidateOnFocus: false });
      useSWR("/api/mentor", fetcher, { revalidateOnFocus: false });

      return (
            <div className="layout">

                  <div className="sidebar-layer">
                        <Sidebar open={open} setOpen={setOpen} />
                  </div>

                  {open && (
                        <div
                              className="sidebar-overlay"
                              onClick={() => setOpen(false)}
                        />
                  )}

                  <div className="main">
                        <header className="topbar">
                              <div className="topbar-left">
                                    <button className="menu-btn" onClick={() => setOpen(true)} aria-label="Open menu">
                                          <Menu size={18} />
                                    </button>
                                    <span className="topbar-logo">MockMentor</span>
                              </div>

                              <div className="top-right">
                                    <ThemeToggle />
                              </div>
                        </header>

                        <div className="content">{children}</div>
                  </div>
            </div>
      );
}