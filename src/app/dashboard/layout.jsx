"use client";

import { useState } from "react";
import ThemeToggle from "@/components/ThemeToggle";
import Sidebar from "@/components/Sidebar";
import useSWR from "swr";
import "./layout.css";

const fetcher = (url) => fetch(url).then(res => res.json());

export default function DashboardLayout({ children }) {
      const [open, setOpen] = useState(false);

      // Pre-warm SWR cache so child pages don't hit loading gaps
      useSWR("/api/me", fetcher, { revalidateOnFocus: false });
      useSWR("/api/mentor", fetcher, { revalidateOnFocus: false });

      return (
            <div className="layout">

                  {/* SIDEBAR */}
                  <div className="sidebar-layer">
                        <Sidebar open={open} setOpen={setOpen} />
                  </div>

                  {/* OVERLAY */}
                  {open && (
                        <div
                              className="sidebar-overlay"
                              onClick={() => setOpen(false)}
                        />
                  )}

                  {/* MAIN */}
                  <div className="main">
                        <header className="topbar">
                              <button className="menu-btn" onClick={() => setOpen(true)}>
                                    ☰
                              </button>

                              <div className="top-right">
                                    <ThemeToggle />
                              </div>
                        </header>

                        <div className="content">{children}</div>
                  </div>
            </div>
      );
}