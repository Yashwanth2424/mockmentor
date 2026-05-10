"use client";

import { useState } from "react";
import ThemeToggle from "@/components/ThemeToggle";
import Sidebar from "@/components/Sidebar";
import "./layout.css";

export default function DashboardLayout({ children }) {
      const [open, setOpen] = useState(false);

      return (
            <div className="layout">

                  {/* SIDEBAR */}
                  <div className="sidebar-layer">
                        <Sidebar open={open} setOpen={setOpen} />
                  </div>

                  {/* OVERLAY (must be AFTER sidebar) */}
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