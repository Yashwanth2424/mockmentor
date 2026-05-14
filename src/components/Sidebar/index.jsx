"use client";

import { useRouter, usePathname } from "next/navigation";
import "./sidebar.css";

export default function Sidebar({ open, setOpen }) {
      const router = useRouter();
      const pathname = usePathname();

      function nav(path) {
            router.push(path);
            setOpen(false);
      }

      async function handleLogout() {
            await fetch("/api/auth/logout", { method: "POST" });
            window.location.href = "/login";
      }

      return (
            <aside className={`sidebar ${open ? "open" : ""}`}>

                  <button className="close-btn" onClick={() => setOpen(false)}>
                        ✕
                  </button>

                  <h2 className="logo">MockMentor</h2>

                  <div className="menu">
                        <button
                              className={pathname === "/dashboard/book" ? "active" : ""}
                              onClick={() => nav("/dashboard/book")}
                        >
                              Book Interview
                        </button>

                        <button
                              className={pathname === "/dashboard/interviews" ? "active" : ""}
                              onClick={() => nav("/dashboard/interviews")}
                        >
                              My Interviews
                        </button>
                  </div>

                  <div className="sidebar-footer">
                        <button onClick={handleLogout}>Logout</button>
                  </div>
            </aside>
      );
}